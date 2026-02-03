/**
 * Escrow Service
 * Secure payment protection for large transactions
 * Holds funds until work is completed and approved
 */

import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'

export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'work_started'
  | 'work_completed'
  | 'inspection_period'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'cancelled'

export interface EscrowTransaction {
  id: string
  booking_id: string
  client_id: string
  artisan_id: string
  amount: number
  platform_fee: number
  currency: string
  status: EscrowStatus
  stripe_payment_intent_id?: string
  stripe_transfer_id?: string
  milestone_id?: string
  description: string
  funded_at?: string
  work_started_at?: string
  work_completed_at?: string
  released_at?: string
  refunded_at?: string
  inspection_deadline?: string
  release_conditions?: string[]
  created_at: string
  updated_at: string
}

export interface EscrowMilestone {
  id: string
  escrow_id: string
  title: string
  description: string
  amount: number
  sequence: number
  status: 'pending' | 'funded' | 'completed' | 'released' | 'refunded'
  due_date?: string
  completed_at?: string
  approved_at?: string
  created_at: string
}

export interface EscrowRelease {
  escrow_id: string
  amount: number
  reason: string
  released_by: string
  released_at: string
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export class EscrowService {
  private supabase = getSupabaseAdmin()

  // Platform fee percentage
  private readonly PLATFORM_FEE_PERCENT = 5
  // Minimum amount for escrow
  private readonly MIN_ESCROW_AMOUNT = 500
  // Default inspection period in days
  private readonly DEFAULT_INSPECTION_DAYS = 3

  /**
   * Create escrow for a booking
   */
  async createEscrow(data: {
    booking_id: string
    client_id: string
    artisan_id: string
    amount: number
    description: string
    milestones?: Array<{
      title: string
      description: string
      amount: number
      due_date?: string
    }>
  }): Promise<EscrowTransaction> {
    // Validate minimum amount
    if (data.amount < this.MIN_ESCROW_AMOUNT) {
      throw new Error(`Minimum escrow amount is ${this.MIN_ESCROW_AMOUNT}€`)
    }

    // Calculate platform fee
    const platformFee = Math.round(data.amount * (this.PLATFORM_FEE_PERCENT / 100) * 100) / 100

    // Create escrow record
    const escrow: Partial<EscrowTransaction> = {
      booking_id: data.booking_id,
      client_id: data.client_id,
      artisan_id: data.artisan_id,
      amount: data.amount,
      platform_fee: platformFee,
      currency: 'EUR',
      status: 'pending',
      description: data.description,
    }

    const { data: createdEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .insert(escrow)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create escrow:', error)
      throw new Error('Failed to create escrow')
    }

    // Create milestones if provided
    if (data.milestones && data.milestones.length > 0) {
      const milestoneRecords = data.milestones.map((m, index) => ({
        escrow_id: createdEscrow.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        sequence: index + 1,
        status: 'pending',
        due_date: m.due_date,
      }))

      await this.supabase
        .from('escrow_milestones')
        .insert(milestoneRecords)
    }

    // Log event
    await this.logEscrowEvent(createdEscrow.id, 'escrow_created', data.client_id)

    return createdEscrow
  }

  /**
   * Fund escrow with payment
   */
  async fundEscrow(
    escrowId: string,
    paymentMethodId: string,
    clientId: string
  ): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .eq('client_id', clientId)
      .single()

    if (!escrow) {
      throw new Error('Escrow not found')
    }

    if (escrow.status !== 'pending') {
      throw new Error('Escrow is not in pending status')
    }

    // Get or create Stripe customer
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', clientId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: { user_id: clientId },
      })
      customerId = customer.id

      await this.supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', clientId)
    }

    // Create payment intent with hold
    const totalAmount = Math.round((escrow.amount + escrow.platform_fee) * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      customer: customerId,
      payment_method: paymentMethodId,
      capture_method: 'manual', // Don't capture immediately - escrow holds funds
      confirm: true,
      metadata: {
        escrow_id: escrowId,
        booking_id: escrow.booking_id,
        type: 'escrow',
      },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/escrow/${escrowId}/confirm`,
    })

    if (paymentIntent.status !== 'requires_capture') {
      throw new Error('Payment authorization failed')
    }

    // Capture the payment to hold funds
    await stripe.paymentIntents.capture(paymentIntent.id)

    // Calculate inspection deadline
    const inspectionDeadline = new Date(
      Date.now() + this.DEFAULT_INSPECTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()

    // Update escrow status
    const { data: fundedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: 'funded',
        stripe_payment_intent_id: paymentIntent.id,
        funded_at: new Date().toISOString(),
        inspection_deadline: inspectionDeadline,
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update escrow')
    }

    await this.logEscrowEvent(escrowId, 'escrow_funded', clientId, { amount: escrow.amount })

    // Notify artisan
    await this.notifyParty(escrow.artisan_id, 'escrow_funded', fundedEscrow)

    return fundedEscrow
  }

  /**
   * Mark work as started
   */
  async markWorkStarted(escrowId: string, artisanId: string): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .eq('artisan_id', artisanId)
      .single()

    if (!escrow || escrow.status !== 'funded') {
      throw new Error('Escrow not found or not funded')
    }

    const { data: updatedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: 'work_started',
        work_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update escrow')
    }

    await this.logEscrowEvent(escrowId, 'work_started', artisanId)
    await this.notifyParty(escrow.client_id, 'work_started', updatedEscrow)

    return updatedEscrow
  }

  /**
   * Mark work as completed
   */
  async markWorkCompleted(
    escrowId: string,
    artisanId: string,
    completionNotes?: string
  ): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .eq('artisan_id', artisanId)
      .single()

    if (!escrow || escrow.status !== 'work_started') {
      throw new Error('Escrow not found or work not started')
    }

    // Set inspection deadline
    const inspectionDeadline = new Date(
      Date.now() + this.DEFAULT_INSPECTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: updatedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: 'inspection_period',
        work_completed_at: new Date().toISOString(),
        inspection_deadline: inspectionDeadline,
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update escrow')
    }

    await this.logEscrowEvent(escrowId, 'work_completed', artisanId, { notes: completionNotes })
    await this.notifyParty(escrow.client_id, 'work_completed', updatedEscrow)

    // Schedule automatic release after inspection period
    await this.scheduleAutoRelease(escrowId, inspectionDeadline)

    return updatedEscrow
  }

  /**
   * Client approves and releases funds
   */
  async releaseFunds(escrowId: string, clientId: string): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .eq('client_id', clientId)
      .single()

    if (!escrow) {
      throw new Error('Escrow not found')
    }

    if (!['inspection_period', 'work_completed'].includes(escrow.status)) {
      throw new Error('Escrow is not ready for release')
    }

    // Get artisan's Stripe Connect account
    const { data: artisanProfile } = await this.supabase
      .from('profiles')
      .select('stripe_connect_id')
      .eq('id', escrow.artisan_id)
      .single()

    if (!artisanProfile?.stripe_connect_id) {
      throw new Error('Artisan payment account not configured')
    }

    // Calculate artisan payout (total - platform fee)
    const payoutAmount = Math.round((escrow.amount - escrow.platform_fee) * 100)

    // Create transfer to artisan
    const transfer = await stripe.transfers.create({
      amount: payoutAmount,
      currency: 'eur',
      destination: artisanProfile.stripe_connect_id,
      transfer_group: escrow.id,
      metadata: {
        escrow_id: escrow.id,
        booking_id: escrow.booking_id,
      },
    })

    // Update escrow
    const { data: releasedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: 'released',
        stripe_transfer_id: transfer.id,
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update escrow')
    }

    // Log release
    await this.supabase
      .from('escrow_releases')
      .insert({
        escrow_id: escrowId,
        amount: escrow.amount - escrow.platform_fee,
        reason: 'Client approved release',
        released_by: clientId,
      })

    await this.logEscrowEvent(escrowId, 'funds_released', clientId, {
      amount: escrow.amount - escrow.platform_fee,
    })

    await this.notifyParty(escrow.artisan_id, 'funds_released', releasedEscrow)

    return releasedEscrow
  }

  /**
   * Request refund / dispute escrow
   */
  async disputeEscrow(
    escrowId: string,
    clientId: string,
    reason: string
  ): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .eq('client_id', clientId)
      .single()

    if (!escrow) {
      throw new Error('Escrow not found')
    }

    if (!['funded', 'work_started', 'work_completed', 'inspection_period'].includes(escrow.status)) {
      throw new Error('Escrow cannot be disputed in current status')
    }

    const { data: disputedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: 'disputed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to dispute escrow')
    }

    await this.logEscrowEvent(escrowId, 'escrow_disputed', clientId, { reason })

    // Create dispute in dispute resolution system
    // This would integrate with disputeResolutionService

    await this.notifyParty(escrow.artisan_id, 'escrow_disputed', disputedEscrow)

    return disputedEscrow
  }

  /**
   * Process refund (admin or after dispute resolution)
   */
  async refundEscrow(
    escrowId: string,
    refundAmount: number,
    reason: string,
    processedBy: string
  ): Promise<EscrowTransaction> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .single()

    if (!escrow || !escrow.stripe_payment_intent_id) {
      throw new Error('Escrow not found or not funded')
    }

    if (!['disputed', 'funded', 'work_started'].includes(escrow.status)) {
      throw new Error('Escrow cannot be refunded in current status')
    }

    // Validate refund amount
    if (refundAmount > escrow.amount) {
      throw new Error('Refund amount exceeds escrow amount')
    }

    // Process Stripe refund
    const refundAmountCents = Math.round(refundAmount * 100)

    await stripe.refunds.create({
      payment_intent: escrow.stripe_payment_intent_id,
      amount: refundAmountCents,
      reason: 'requested_by_customer',
      metadata: {
        escrow_id: escrowId,
        refund_reason: reason,
      },
    })

    // Update escrow
    const newStatus = refundAmount >= escrow.amount ? 'refunded' : 'released'

    const { data: refundedEscrow, error } = await this.supabase
      .from('escrow_transactions')
      .update({
        status: newStatus,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update escrow')
    }

    await this.logEscrowEvent(escrowId, 'escrow_refunded', processedBy, {
      amount: refundAmount,
      reason,
    })

    await this.notifyParty(escrow.client_id, 'escrow_refunded', refundedEscrow)
    await this.notifyParty(escrow.artisan_id, 'escrow_refunded', refundedEscrow)

    return refundedEscrow
  }

  /**
   * Get escrow details
   */
  async getEscrow(escrowId: string, userId: string): Promise<{
    escrow: EscrowTransaction
    milestones: EscrowMilestone[]
    releases: EscrowRelease[]
  } | null> {
    const { data: escrow } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .single()

    if (!escrow) {
      return null
    }

    // Check authorization
    if (escrow.client_id !== userId && escrow.artisan_id !== userId) {
      return null
    }

    const [milestonesResult, releasesResult] = await Promise.all([
      this.supabase
        .from('escrow_milestones')
        .select('*')
        .eq('escrow_id', escrowId)
        .order('sequence'),
      this.supabase
        .from('escrow_releases')
        .select('*')
        .eq('escrow_id', escrowId)
        .order('released_at'),
    ])

    return {
      escrow,
      milestones: milestonesResult.data || [],
      releases: releasesResult.data || [],
    }
  }

  /**
   * Get user's escrows
   */
  async getUserEscrows(
    userId: string,
    role: 'client' | 'artisan'
  ): Promise<EscrowTransaction[]> {
    const { data } = await this.supabase
      .from('escrow_transactions')
      .select('*')
      .eq(role === 'client' ? 'client_id' : 'artisan_id', userId)
      .order('created_at', { ascending: false })

    return data || []
  }

  // Milestone management

  /**
   * Complete a milestone
   */
  async completeMilestone(
    milestoneId: string,
    artisanId: string
  ): Promise<EscrowMilestone> {
    const { data: milestone } = await this.supabase
      .from('escrow_milestones')
      .select('*, escrow:escrow_transactions(*)')
      .eq('id', milestoneId)
      .single()

    if (!milestone || milestone.escrow.artisan_id !== artisanId) {
      throw new Error('Milestone not found or unauthorized')
    }

    const { data: updatedMilestone, error } = await this.supabase
      .from('escrow_milestones')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to complete milestone')
    }

    await this.notifyParty(milestone.escrow.client_id, 'milestone_completed', milestone)

    return updatedMilestone
  }

  /**
   * Approve and release milestone payment
   */
  async approveMilestone(
    milestoneId: string,
    clientId: string
  ): Promise<EscrowMilestone> {
    const { data: milestone } = await this.supabase
      .from('escrow_milestones')
      .select('*, escrow:escrow_transactions(*)')
      .eq('id', milestoneId)
      .single()

    if (!milestone || milestone.escrow.client_id !== clientId) {
      throw new Error('Milestone not found or unauthorized')
    }

    if (milestone.status !== 'completed') {
      throw new Error('Milestone must be completed before approval')
    }

    // Release milestone payment to artisan
    const { data: artisanProfile } = await this.supabase
      .from('profiles')
      .select('stripe_connect_id')
      .eq('id', milestone.escrow.artisan_id)
      .single()

    if (artisanProfile?.stripe_connect_id) {
      const payoutAmount = Math.round(milestone.amount * 0.95 * 100) // 5% platform fee

      await stripe.transfers.create({
        amount: payoutAmount,
        currency: 'eur',
        destination: artisanProfile.stripe_connect_id,
        transfer_group: milestone.escrow_id,
        metadata: {
          escrow_id: milestone.escrow_id,
          milestone_id: milestoneId,
        },
      })
    }

    const { data: approvedMilestone, error } = await this.supabase
      .from('escrow_milestones')
      .update({
        status: 'released',
        approved_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to approve milestone')
    }

    await this.notifyParty(milestone.escrow.artisan_id, 'milestone_approved', milestone)

    return approvedMilestone
  }

  // Private helpers

  private async logEscrowEvent(
    escrowId: string,
    event: string,
    actorId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.supabase
      .from('escrow_events')
      .insert({
        escrow_id: escrowId,
        event,
        actor_id: actorId,
        details,
      })
  }

  private async notifyParty(
    userId: string,
    eventType: string,
    data: unknown
  ): Promise<void> {
    logger.info(`Notify ${userId}: ${eventType}`, data as Record<string, unknown>)
  }

  private async scheduleAutoRelease(escrowId: string, deadline: string): Promise<void> {
    // In production, use a job scheduler
    logger.info(`Scheduled auto-release for escrow ${escrowId} at ${deadline}`)
  }
}

export const escrowService = new EscrowService()
