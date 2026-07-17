/**
 * Notifications Service — Business logic for in-app notifications
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo/config'
import { sendEmail } from '@/lib/email/resend'
import { getNewLeadAlertEmail } from '@/lib/email/templates/new-lead-alert'
import { sendSMS } from '@/lib/sms/twilio'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ListNotificationsParams {
  userId: string
  limit: number
  unreadOnly: boolean
}

export interface NotificationsResult {
  notifications: Record<string, unknown>[]
  unreadCount: number
}

export interface SendLeadAlertInput {
  provider_ids: string[]
  service?: string
  city?: string
  description?: string
  urgency?: string
  client_name?: string
  /**
   * Si true, n'alerte que les fiches revendiquées (user_id non NULL).
   * Obligatoire sur le chemin de dispatch automatique : un email/SMS
   * automatisé vers un artisan non inscrit = prospection L.34-5 sans
   * opt-out. Les actions admin délibérées (lead manuel, reassign)
   * peuvent alerter tout le monde.
   */
  claimedOnly?: boolean
}

export interface AlertResult {
  provider_id: string
  channel: string
  success?: boolean
  [key: string]: unknown
}

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listNotifications(
  supabase: SupabaseClient,
  params: ListNotificationsParams
): Promise<ServiceResult<NotificationsResult>> {
  const { userId, limit, unreadOnly } = params

  let query = supabase
    .from('notifications')
    .select('id, type, title, message, link, read, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data: notifications, error } = await query

  if (error) {
    logger.error('Notifications fetch error:', error)
    return { success: false, error: 'Erreur serveur', status: 500 }
  }

  // Count unread
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return {
    success: true,
    data: {
      notifications: notifications || [],
      unreadCount: count || 0,
    },
  }
}

export async function markAsRead(
  supabase: SupabaseClient,
  notificationId: string,
  userId: string
): Promise<ServiceResult<{ success: true }>> {
  // RLS ensures user can only update their own notifications
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) {
    logger.error('Mark read error:', error)
    return { success: false, error: 'Erreur serveur', status: 500 }
  }

  return { success: true, data: { success: true } }
}

export async function markAllAsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResult<{ success: true }>> {
  // RLS ensures user can only update their own notifications
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    logger.error('Mark all read error:', error)
    return { success: false, error: 'Erreur serveur', status: 500 }
  }

  return { success: true, data: { success: true } }
}

export async function sendLeadAlert(
  input: SendLeadAlertInput
): Promise<ServiceResult<{ results: AlertResult[] }>> {
  const { provider_ids, service, city, description, urgency, client_name, claimedOnly } = input

  // Input validation
  if (!Array.isArray(provider_ids) || provider_ids.length === 0) {
    return { success: false, error: 'provider_ids required', status: 400 }
  }

  if (provider_ids.length > 50) {
    return { success: false, error: 'provider_ids limit exceeded (max 50)', status: 400 }
  }

  if (!provider_ids.every((id) => typeof id === 'string' && UUID_REGEX.test(id))) {
    return { success: false, error: 'provider_ids must be valid UUIDs', status: 400 }
  }

  if (service && typeof service !== 'string') {
    return { success: false, error: 'service must be a string', status: 400 }
  }

  if (city && typeof city !== 'string') {
    return { success: false, error: 'city must be a string', status: 400 }
  }

  const supabase = createAdminClient()
  const dashboardUrl = `${SITE_URL}/espace-artisan/demandes`

  // Fetch provider details
  let query = supabase
    .from('providers')
    .select('id, name, email, phone, user_id')
    .in('id', provider_ids)
  if (claimedOnly) {
    query = query.not('user_id', 'is', null)
  }
  const { data: providers, error } = await query

  if (error || !providers) {
    logger.error('[lead-alert] Provider fetch error', error)
    return { success: false, error: 'provider fetch failed', status: 500 }
  }

  const results: AlertResult[] = []

  for (const provider of providers) {
    // Send email
    if (provider.email) {
      const { subject, html } = getNewLeadAlertEmail({
        artisanName: provider.name || 'Artisan',
        service: service || 'travaux',
        city: city || 'votre ville',
        clientName: client_name,
        description,
        urgency,
        dashboardUrl,
      })
      const emailResult = await sendEmail({ to: provider.email, subject, html })
      results.push({ provider_id: provider.id, channel: 'email', ...emailResult })
    }

    // Send SMS
    if (provider.phone) {
      const smsMessage = city
        ? `Nouvelle demande ${service || 'devis'} à ${city}. Répondez vite sur ServicesArtisans.fr`
        : `Nouvelle demande ${service || 'devis'}. Répondez vite sur ServicesArtisans.fr`
      const smsResult = await sendSMS(provider.phone, smsMessage)
      results.push({ provider_id: provider.id, channel: 'sms', ...smsResult })
    }

    // Insert in-app notification (skip if provider not claimed — no user_id)
    if (provider.user_id) {
      try {
        await supabase.from('notifications').insert({
          user_id: provider.user_id,
          type: 'new_lead',
          title: `Nouvelle demande de ${service || 'devis'}`,
          message: `${client_name || 'Un client'} cherche un ${service || 'artisan'} à ${city || 'proximité'}`,
          link: '/espace-artisan/demandes',
        })
      } catch {
        // notifications insert best-effort; FK/RLS errors non-fatal here
      }
    }
  }

  logger.info(
    `[lead-alert] Sent to ${providers.length} providers: ${results.filter((r) => r.success).length} success`
  )
  return { success: true, data: { results } }
}
