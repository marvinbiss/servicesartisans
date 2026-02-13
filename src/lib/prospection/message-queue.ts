/**
 * Message Queue Service - Prospection
 * Traitement par batch des envois massifs avec rate limiting
 * Utilise la base de données comme queue (prospection_messages status='queued')
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { sendWhatsApp } from './channels/whatsapp'
import { sendProspectionSMS } from './channels/sms'
import { sendProspectionEmailBatch } from './channels/email'
import { renderTemplate } from './template-renderer'
import type {
  ProspectionChannel,
  ProspectionMessage,
  ProspectionContact,
  ProspectionCampaign,
  ProspectionTemplate,
} from '@/types/prospection'

// Rate limits par canal (messages par seconde)
const CHANNEL_RATE_LIMITS: Record<ProspectionChannel, { perSecond: number; perMinute: number }> = {
  whatsapp: { perSecond: 80, perMinute: 1000 },
  sms: { perSecond: 10, perMinute: 400 },
  email: { perSecond: 100, perMinute: 5000 },
}

export interface BatchResult {
  processed: number
  sent: number
  failed: number
  errors: Array<{ messageId: string; error: string }>
}

export interface QueueStats {
  queued: number
  sending: number
  sent: number
  delivered: number
  failed: number
  total: number
}

/**
 * Enfiler les messages pour une campagne
 * Crée les entrées prospection_messages pour chaque contact de la liste
 */
export async function enqueueCampaignMessages(
  campaignId: string
): Promise<{ enqueued: number; skipped: number }> {
  const supabase = createAdminClient()

  // Charger la campagne avec template et liste
  const { data: campaign, error: campError } = await supabase
    .from('prospection_campaigns')
    .select('*, template:prospection_templates(*), list:prospection_lists(*)')
    .eq('id', campaignId)
    .single()

  if (campError || !campaign) {
    throw new Error(`Campaign not found: ${campError?.message}`)
  }

  if (!campaign.list_id) {
    throw new Error('Campaign has no contact list')
  }

  if (!campaign.template_id) {
    throw new Error('Campaign has no template')
  }

  // Récupérer les contacts de la liste
  const { data: members, error: memberError } = await supabase
    .from('prospection_list_members')
    .select('contact_id')
    .eq('list_id', campaign.list_id)

  if (memberError) {
    throw new Error(`Failed to load list members: ${memberError.message}`)
  }

  // Charger les contacts
  const contactIds = members.map(m => m.contact_id)
  const { data: contacts, error: contactError } = await supabase
    .from('prospection_contacts')
    .select('*')
    .in('id', contactIds)
    .eq('is_active', true)
    .neq('consent_status', 'opted_out')

  if (contactError) {
    throw new Error(`Failed to load contacts: ${contactError.message}`)
  }

  // Filtrer les contacts qui ont le canal nécessaire
  const validContacts = (contacts || []).filter(c => {
    if (campaign.channel === 'email') return !!c.email
    return !!c.phone_e164
  })

  // Déterminer le variant A/B
  const template = campaign.template as ProspectionTemplate
  const messages = validContacts.map((contact: ProspectionContact, index: number) => {
    const isVariantB = campaign.ab_test_enabled && index % 100 < campaign.ab_split_percent
    const renderedBody = renderTemplate(template.body, contact, campaign as ProspectionCampaign)
    const renderedSubject = template.subject
      ? renderTemplate(template.subject, contact, campaign as ProspectionCampaign)
      : null

    return {
      campaign_id: campaignId,
      contact_id: contact.id,
      channel: campaign.channel,
      rendered_body: renderedBody,
      rendered_subject: renderedSubject,
      ab_variant: isVariantB ? 'B' : 'A',
      status: 'queued' as const,
      queued_at: new Date().toISOString(),
    }
  })

  // Insérer par batch de 500
  let enqueued = 0
  const batchSize = 500
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const { error: insertError } = await supabase
      .from('prospection_messages')
      .insert(batch)

    if (insertError) {
      logger.error('Failed to enqueue batch', { error: insertError.message, offset: i })
    } else {
      enqueued += batch.length
    }
  }

  // Mettre à jour les stats de la campagne
  await supabase
    .from('prospection_campaigns')
    .update({
      total_recipients: enqueued,
      status: 'sending',
      started_at: new Date().toISOString(),
    })
    .eq('id', campaignId)

  return { enqueued, skipped: contactIds.length - enqueued }
}

/**
 * Traiter un batch de messages en queue
 */
export async function processBatch(
  campaignId: string,
  batchSize: number = 100
): Promise<BatchResult> {
  const supabase = createAdminClient()
  const result: BatchResult = { processed: 0, sent: 0, failed: 0, errors: [] }

  // Récupérer la campagne pour le canal
  const { data: campaign } = await supabase
    .from('prospection_campaigns')
    .select('channel, status')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.status === 'paused' || campaign.status === 'cancelled') {
    return result
  }

  // Récupérer les messages en queue
  const { data: messages, error } = await supabase
    .from('prospection_messages')
    .select('*, contact:prospection_contacts(*)')
    .eq('campaign_id', campaignId)
    .eq('status', 'queued')
    .order('queued_at', { ascending: true })
    .limit(batchSize)

  if (error || !messages?.length) {
    return result
  }

  // Marquer comme "sending"
  const messageIds = messages.map((m: ProspectionMessage) => m.id)
  await supabase
    .from('prospection_messages')
    .update({ status: 'sending' })
    .in('id', messageIds)

  // Rate limiting
  const rateLimit = CHANNEL_RATE_LIMITS[campaign.channel as ProspectionChannel]
  const delayMs = Math.ceil(1000 / rateLimit.perSecond)

  // Envoyer par canal
  if (campaign.channel === 'email') {
    // Batch email
    const emailMessages = messages.filter((m: ProspectionMessage & { contact: ProspectionContact }) => m.contact?.email)
    const emailParams = emailMessages.map((m: ProspectionMessage & { contact: ProspectionContact }) => ({
      to: m.contact.email!,
      subject: m.rendered_subject || 'ServicesArtisans',
      html: m.rendered_body || '',
      tags: [{ name: 'campaign_id', value: campaignId }],
    }))

    const batchResult = await sendProspectionEmailBatch(emailParams)

    for (let i = 0; i < emailMessages.length; i++) {
      const msg = emailMessages[i] as ProspectionMessage
      const emailResult = batchResult.results[i]
      result.processed++

      if (emailResult?.success) {
        result.sent++
        await updateMessageStatus(supabase, msg.id, 'sent', emailResult.id)
      } else {
        result.failed++
        const errMsg = emailResult?.error || 'Unknown error'
        result.errors.push({ messageId: msg.id, error: errMsg })
        await updateMessageFailed(supabase, msg.id, errMsg)
      }
    }
  } else {
    // SMS et WhatsApp : envoi séquentiel avec rate limiting
    for (const msg of messages as (ProspectionMessage & { contact: ProspectionContact })[]) {
      result.processed++
      const contact = msg.contact

      if (!contact?.phone_e164) {
        result.failed++
        await updateMessageFailed(supabase, msg.id, 'No phone number')
        continue
      }

      try {
        let sendResult: { success: boolean; sid?: string; error?: string }

        if (campaign.channel === 'whatsapp') {
          sendResult = await sendWhatsApp({
            to: contact.phone_e164,
            body: msg.rendered_body || '',
          })
        } else {
          sendResult = await sendProspectionSMS({
            to: contact.phone_e164,
            body: msg.rendered_body || '',
          })
        }

        if (sendResult.success) {
          result.sent++
          await updateMessageStatus(supabase, msg.id, 'sent', sendResult.sid)
        } else {
          result.failed++
          const errMsg = sendResult.error || 'Send failed'
          result.errors.push({ messageId: msg.id, error: errMsg })
          await updateMessageFailed(supabase, msg.id, errMsg)
        }
      } catch (err) {
        result.failed++
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        result.errors.push({ messageId: msg.id, error: errMsg })
        await updateMessageFailed(supabase, msg.id, errMsg)
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  // Mettre à jour les stats de la campagne
  await updateCampaignStats(supabase, campaignId)

  // Vérifier si la campagne est terminée
  await checkCampaignCompletion(supabase, campaignId)

  return result
}

/**
 * Mettre en pause une campagne
 */
export async function pauseCampaign(campaignId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('prospection_campaigns')
    .update({ status: 'paused', paused_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('status', 'sending')
}

/**
 * Reprendre une campagne
 */
export async function resumeCampaign(campaignId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('prospection_campaigns')
    .update({ status: 'sending', paused_at: null })
    .eq('id', campaignId)
    .eq('status', 'paused')
}

/**
 * Réessayer les messages échoués
 */
export async function retryFailed(campaignId: string): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('prospection_messages')
    .update({
      status: 'queued',
      error_code: null,
      error_message: null,
      retry_count: 0,
    })
    .eq('campaign_id', campaignId)
    .eq('status', 'failed')
    .select('id')

  if (error) {
    logger.error('Failed to retry messages', { error: error.message })
    return 0
  }

  return data?.length || 0
}

/**
 * Obtenir les stats de la queue pour une campagne
 */
export async function getQueueStats(campaignId: string): Promise<QueueStats> {
  const supabase = createAdminClient()

  const statuses = ['queued', 'sending', 'sent', 'delivered', 'failed'] as const
  const stats: QueueStats = { queued: 0, sending: 0, sent: 0, delivered: 0, failed: 0, total: 0 }

  for (const status of statuses) {
    const { count } = await supabase
      .from('prospection_messages')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', status)

    stats[status] = count || 0
    stats.total += count || 0
  }

  return stats
}

// --- Helpers privés ---

async function updateMessageStatus(
  supabase: ReturnType<typeof createAdminClient>,
  messageId: string,
  status: string,
  externalId?: string
): Promise<void> {
  await supabase
    .from('prospection_messages')
    .update({
      status,
      external_id: externalId || null,
      sent_at: new Date().toISOString(),
    })
    .eq('id', messageId)
}

async function updateMessageFailed(
  supabase: ReturnType<typeof createAdminClient>,
  messageId: string,
  errorMessage: string
): Promise<void> {
  // Incrémenter retry_count via un select + update
  const { data: msg } = await supabase
    .from('prospection_messages')
    .select('retry_count, max_retries')
    .eq('id', messageId)
    .single()

  const retryCount = (msg?.retry_count || 0) + 1
  const maxRetries = msg?.max_retries || 3
  const shouldRetry = retryCount < maxRetries

  await supabase
    .from('prospection_messages')
    .update({
      status: shouldRetry ? 'queued' : 'failed',
      error_message: errorMessage,
      retry_count: retryCount,
      failed_at: shouldRetry ? null : new Date().toISOString(),
      // Backoff exponentiel: 30s, 2min, 8min
      next_retry_at: shouldRetry
        ? new Date(Date.now() + Math.pow(4, retryCount) * 30000).toISOString()
        : null,
    })
    .eq('id', messageId)
}

async function updateCampaignStats(
  supabase: ReturnType<typeof createAdminClient>,
  campaignId: string
): Promise<void> {
  const stats = await getQueueStats(campaignId)

  await supabase
    .from('prospection_campaigns')
    .update({
      sent_count: stats.sent + stats.delivered,
      delivered_count: stats.delivered,
      failed_count: stats.failed,
    })
    .eq('id', campaignId)
}

async function checkCampaignCompletion(
  supabase: ReturnType<typeof createAdminClient>,
  campaignId: string
): Promise<void> {
  const { count: remaining } = await supabase
    .from('prospection_messages')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .in('status', ['queued', 'sending'])

  if (remaining === 0) {
    await supabase
      .from('prospection_campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('status', 'sending')
  }
}
