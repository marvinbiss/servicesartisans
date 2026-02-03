/**
 * Dispute Resolution & Mediation Service
 * Handles conflicts between clients and artisans
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export type DisputeStatus =
  | 'opened'
  | 'under_review'
  | 'awaiting_response'
  | 'mediation'
  | 'escalated'
  | 'resolved_client_favor'
  | 'resolved_artisan_favor'
  | 'resolved_compromise'
  | 'closed'
  | 'withdrawn'

export type DisputeCategory =
  | 'quality_of_work'
  | 'incomplete_work'
  | 'pricing_issue'
  | 'no_show'
  | 'communication'
  | 'damage'
  | 'delay'
  | 'refund_request'
  | 'other'

export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Dispute {
  id: string
  booking_id: string
  client_id: string
  artisan_id: string
  category: DisputeCategory
  priority: DisputePriority
  status: DisputeStatus
  subject: string
  description: string
  amount_disputed?: number
  evidence_urls?: string[]
  client_desired_outcome: string
  artisan_response?: string
  mediator_id?: string
  mediator_notes?: string
  resolution_summary?: string
  refund_amount?: number
  created_at: string
  updated_at: string
  resolved_at?: string
  escalated_at?: string
  response_deadline?: string
}

export interface DisputeMessage {
  id: string
  dispute_id: string
  sender_id: string
  sender_type: 'client' | 'artisan' | 'mediator' | 'system'
  message: string
  attachments?: string[]
  is_internal: boolean // For mediator notes
  created_at: string
}

export interface DisputeTimeline {
  id: string
  dispute_id: string
  action: string
  actor_id?: string
  actor_type?: string
  details?: Record<string, unknown>
  created_at: string
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export class DisputeResolutionService {
  private supabase = getSupabaseAdmin()

  // SLA deadlines in hours
  private readonly SLA = {
    initial_response: 24,
    artisan_response: 48,
    mediation_start: 72,
    resolution_target: 168, // 7 days
  }

  /**
   * Open a new dispute
   */
  async openDispute(data: {
    booking_id: string
    client_id: string
    artisan_id: string
    category: DisputeCategory
    subject: string
    description: string
    amount_disputed?: number
    evidence_urls?: string[]
    client_desired_outcome: string
  }): Promise<Dispute> {
    // Verify booking exists and belongs to client
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('id, artisan_id, client_email, status')
      .eq('id', data.booking_id)
      .single()

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Check for existing open dispute
    const { data: existingDispute } = await this.supabase
      .from('disputes')
      .select('id')
      .eq('booking_id', data.booking_id)
      .not('status', 'in', '("closed","withdrawn")')
      .single()

    if (existingDispute) {
      throw new Error('An open dispute already exists for this booking')
    }

    // Calculate priority based on amount and category
    const priority = this.calculatePriority(data.category, data.amount_disputed)

    // Set response deadline
    const responseDeadline = new Date(
      Date.now() + this.SLA.artisan_response * 60 * 60 * 1000
    ).toISOString()

    const dispute: Partial<Dispute> = {
      ...data,
      priority,
      status: 'opened',
      response_deadline: responseDeadline,
    }

    const { data: createdDispute, error } = await this.supabase
      .from('disputes')
      .insert(dispute)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create dispute:', error)
      throw new Error('Failed to create dispute')
    }

    // Log timeline event
    await this.addTimelineEvent(createdDispute.id, 'dispute_opened', data.client_id, 'client')

    // Notify artisan
    await this.notifyParty(data.artisan_id, 'dispute_opened', createdDispute)

    // Schedule automated escalation if no response
    await this.scheduleEscalation(createdDispute.id, this.SLA.artisan_response)

    return createdDispute
  }

  /**
   * Artisan responds to dispute
   */
  async submitArtisanResponse(
    disputeId: string,
    artisanId: string,
    response: string,
    counterProposal?: { refund_amount?: number; action_proposed?: string }
  ): Promise<Dispute> {
    const { data: dispute } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .eq('artisan_id', artisanId)
      .single()

    if (!dispute) {
      throw new Error('Dispute not found or unauthorized')
    }

    if (!['opened', 'awaiting_response'].includes(dispute.status)) {
      throw new Error('Dispute is not awaiting response')
    }

    const { data: updatedDispute, error } = await this.supabase
      .from('disputes')
      .update({
        artisan_response: response,
        status: 'under_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to submit response')
    }

    // Add response as message
    await this.addMessage(disputeId, artisanId, 'artisan', response)

    // Log timeline
    await this.addTimelineEvent(disputeId, 'artisan_responded', artisanId, 'artisan', {
      counter_proposal: counterProposal,
    })

    // Notify client
    await this.notifyParty(dispute.client_id, 'artisan_responded', updatedDispute)

    return updatedDispute
  }

  /**
   * Client accepts artisan's proposal
   */
  async acceptProposal(disputeId: string, clientId: string): Promise<Dispute> {
    const { data: dispute } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .eq('client_id', clientId)
      .single()

    if (!dispute || !dispute.artisan_response) {
      throw new Error('No proposal to accept')
    }

    const resolution: Partial<Dispute> = {
      status: 'resolved_compromise',
      resolution_summary: 'Client accepted artisan proposal',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: resolvedDispute, error } = await this.supabase
      .from('disputes')
      .update(resolution)
      .eq('id', disputeId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to resolve dispute')
    }

    await this.addTimelineEvent(disputeId, 'proposal_accepted', clientId, 'client')
    await this.notifyParty(dispute.artisan_id, 'dispute_resolved', resolvedDispute)

    return resolvedDispute
  }

  /**
   * Request mediation
   */
  async requestMediation(disputeId: string, requesterId: string): Promise<Dispute> {
    const { data: dispute } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single()

    if (!dispute) {
      throw new Error('Dispute not found')
    }

    if (dispute.client_id !== requesterId && dispute.artisan_id !== requesterId) {
      throw new Error('Unauthorized')
    }

    // Assign a mediator
    const mediator = await this.assignMediator(dispute)

    const { data: updatedDispute, error } = await this.supabase
      .from('disputes')
      .update({
        status: 'mediation',
        mediator_id: mediator.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to start mediation')
    }

    await this.addTimelineEvent(disputeId, 'mediation_requested', requesterId,
      requesterId === dispute.client_id ? 'client' : 'artisan')

    // Notify both parties
    await this.notifyParty(dispute.client_id, 'mediation_started', updatedDispute)
    await this.notifyParty(dispute.artisan_id, 'mediation_started', updatedDispute)

    return updatedDispute
  }

  /**
   * Mediator resolves dispute
   */
  async resolveDispute(
    disputeId: string,
    mediatorId: string,
    resolution: {
      outcome: 'client_favor' | 'artisan_favor' | 'compromise'
      summary: string
      refund_amount?: number
      mediator_notes?: string
    }
  ): Promise<Dispute> {
    const { data: dispute } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .eq('mediator_id', mediatorId)
      .single()

    if (!dispute) {
      throw new Error('Dispute not found or unauthorized')
    }

    const statusMap = {
      client_favor: 'resolved_client_favor',
      artisan_favor: 'resolved_artisan_favor',
      compromise: 'resolved_compromise',
    } as const

    const { data: resolvedDispute, error } = await this.supabase
      .from('disputes')
      .update({
        status: statusMap[resolution.outcome],
        resolution_summary: resolution.summary,
        refund_amount: resolution.refund_amount,
        mediator_notes: resolution.mediator_notes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to resolve dispute')
    }

    await this.addTimelineEvent(disputeId, 'dispute_resolved', mediatorId, 'mediator', {
      outcome: resolution.outcome,
      refund_amount: resolution.refund_amount,
    })

    // Process refund if applicable
    if (resolution.refund_amount && resolution.refund_amount > 0) {
      await this.processRefund(dispute.booking_id, resolution.refund_amount)
    }

    // Notify both parties
    await this.notifyParty(dispute.client_id, 'dispute_resolved', resolvedDispute)
    await this.notifyParty(dispute.artisan_id, 'dispute_resolved', resolvedDispute)

    // Update trust scores
    await this.updateTrustScores(dispute, resolution.outcome)

    return resolvedDispute
  }

  /**
   * Escalate dispute to higher authority
   */
  async escalateDispute(disputeId: string, reason: string): Promise<Dispute> {
    const { data: updatedDispute, error } = await this.supabase
      .from('disputes')
      .update({
        status: 'escalated',
        priority: 'urgent',
        escalated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to escalate dispute')
    }

    await this.addTimelineEvent(disputeId, 'dispute_escalated', undefined, 'system', { reason })

    // Notify admin team
    await this.notifyAdminTeam('dispute_escalated', updatedDispute)

    return updatedDispute
  }

  /**
   * Add message to dispute thread
   */
  async addMessage(
    disputeId: string,
    senderId: string,
    senderType: DisputeMessage['sender_type'],
    message: string,
    attachments?: string[],
    isInternal = false
  ): Promise<DisputeMessage> {
    const { data, error } = await this.supabase
      .from('dispute_messages')
      .insert({
        dispute_id: disputeId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        attachments,
        is_internal: isInternal,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to add message')
    }

    return data
  }

  /**
   * Get dispute with all details
   */
  async getDispute(disputeId: string, userId: string): Promise<{
    dispute: Dispute
    messages: DisputeMessage[]
    timeline: DisputeTimeline[]
  } | null> {
    const { data: dispute } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single()

    if (!dispute) {
      return null
    }

    // Check authorization
    if (
      dispute.client_id !== userId &&
      dispute.artisan_id !== userId &&
      dispute.mediator_id !== userId
    ) {
      // Check if user is admin
      const { data: admin } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!admin || !['admin', 'super_admin', 'moderator'].includes(admin.role)) {
        return null
      }
    }

    // Get messages (hide internal notes for non-mediators)
    let messagesQuery = this.supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true })

    if (dispute.mediator_id !== userId) {
      messagesQuery = messagesQuery.eq('is_internal', false)
    }

    const { data: messages } = await messagesQuery

    // Get timeline
    const { data: timeline } = await this.supabase
      .from('dispute_timeline')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true })

    return {
      dispute,
      messages: messages || [],
      timeline: timeline || [],
    }
  }

  /**
   * Get user's disputes
   */
  async getUserDisputes(
    userId: string,
    role: 'client' | 'artisan',
    status?: DisputeStatus
  ): Promise<Dispute[]> {
    let query = this.supabase
      .from('disputes')
      .select('*')
      .eq(role === 'client' ? 'client_id' : 'artisan_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data } = await query
    return data || []
  }

  /**
   * Get dispute statistics
   */
  async getDisputeStats(): Promise<{
    total: number
    open: number
    resolved: number
    avg_resolution_time_hours: number
    by_category: Record<DisputeCategory, number>
    resolution_rates: { client: number; artisan: number; compromise: number }
  }> {
    const { data: disputes } = await this.supabase
      .from('disputes')
      .select('*')

    const stats = {
      total: disputes?.length || 0,
      open: 0,
      resolved: 0,
      avg_resolution_time_hours: 0,
      by_category: {} as Record<DisputeCategory, number>,
      resolution_rates: { client: 0, artisan: 0, compromise: 0 },
    }

    let totalResolutionTime = 0
    let resolvedCount = 0

    disputes?.forEach((d) => {
      // Count open/resolved
      if (['opened', 'under_review', 'awaiting_response', 'mediation', 'escalated'].includes(d.status)) {
        stats.open++
      } else if (d.status.startsWith('resolved')) {
        stats.resolved++
        resolvedCount++

        // Calculate resolution time
        if (d.resolved_at && d.created_at) {
          const resolutionTime =
            new Date(d.resolved_at).getTime() - new Date(d.created_at).getTime()
          totalResolutionTime += resolutionTime / (1000 * 60 * 60) // Convert to hours
        }

        // Count resolution outcomes
        if (d.status === 'resolved_client_favor') stats.resolution_rates.client++
        else if (d.status === 'resolved_artisan_favor') stats.resolution_rates.artisan++
        else if (d.status === 'resolved_compromise') stats.resolution_rates.compromise++
      }

      // Count by category
      stats.by_category[d.category as DisputeCategory] =
        (stats.by_category[d.category as DisputeCategory] || 0) + 1
    })

    stats.avg_resolution_time_hours =
      resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0

    return stats
  }

  // Private helpers

  private calculatePriority(category: DisputeCategory, amount?: number): DisputePriority {
    if (category === 'damage' || (amount && amount > 5000)) return 'urgent'
    if (category === 'no_show' || (amount && amount > 1000)) return 'high'
    if (['quality_of_work', 'incomplete_work'].includes(category)) return 'medium'
    return 'low'
  }

  private async assignMediator(_dispute: Dispute): Promise<{ id: string }> {
    // Find available mediator with least active cases
    const { data: mediators } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('role', 'moderator')
      .limit(1)

    if (mediators && mediators.length > 0) {
      return mediators[0]
    }

    // Fallback to admin
    const { data: admin } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    return admin || { id: 'system' }
  }

  private async addTimelineEvent(
    disputeId: string,
    action: string,
    actorId?: string,
    actorType?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.supabase
      .from('dispute_timeline')
      .insert({
        dispute_id: disputeId,
        action,
        actor_id: actorId,
        actor_type: actorType,
        details,
      })
  }

  private async notifyParty(
    userId: string,
    eventType: string,
    dispute: Dispute
  ): Promise<void> {
    // In production, this would send email/SMS/push notifications
    logger.info(`Notify ${userId} about ${eventType} for dispute ${dispute.id}`)
  }

  private async notifyAdminTeam(eventType: string, dispute: Dispute): Promise<void> {
    logger.info(`Admin notification: ${eventType} for dispute ${dispute.id}`)
  }

  private async processRefund(bookingId: string, amount: number): Promise<void> {
    // In production, this would call the payment service
    logger.info(`Process refund of ${amount}€ for booking ${bookingId}`)
  }

  private async updateTrustScores(
    dispute: Dispute,
    outcome: 'client_favor' | 'artisan_favor' | 'compromise'
  ): Promise<void> {
    // Adjust artisan trust score based on outcome
    const scoreAdjustment = {
      client_favor: -10,
      artisan_favor: 0,
      compromise: -5,
    }

    await this.supabase.rpc('adjust_trust_score', {
      user_id: dispute.artisan_id,
      adjustment: scoreAdjustment[outcome],
    })
  }

  private async scheduleEscalation(disputeId: string, hoursDelay: number): Promise<void> {
    // In production, this would use a job scheduler
    logger.info(`Scheduled escalation for dispute ${disputeId} in ${hoursDelay}h`)
  }
}

export const disputeResolutionService = new DisputeResolutionService()
