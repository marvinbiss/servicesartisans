import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { getNewLeadAlertEmail } from '@/lib/email/templates/new-lead-alert'
import { sendSMS } from '@/lib/sms/twilio'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.servicesartisans.fr'

// UUID v4 format validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/notifications/send-lead-alert
 * Send immediate email + SMS alerts to matched artisans when a new devis is submitted.
 * Called internally after devis insertion.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: internal-only endpoint — require CRON_SECRET
    const authHeader = request.headers.get('authorization') || ''
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Rate limiting: 3 requests per minute per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`send-lead-alert:${ip}`, { window: 60_000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      )
    }

    const { provider_ids, service, city, description, urgency, client_name } = await request.json()

    // Input validation
    if (!Array.isArray(provider_ids) || provider_ids.length === 0) {
      return NextResponse.json({ error: 'provider_ids required' }, { status: 400 })
    }

    // Validate provider_ids are valid UUIDs and limit array size
    if (provider_ids.length > 50) {
      return NextResponse.json({ error: 'provider_ids limit exceeded (max 50)' }, { status: 400 })
    }
    if (!provider_ids.every((id: unknown) => typeof id === 'string' && UUID_REGEX.test(id))) {
      return NextResponse.json({ error: 'provider_ids must be valid UUIDs' }, { status: 400 })
    }

    if (service && typeof service !== 'string') {
      return NextResponse.json({ error: 'service must be a string' }, { status: 400 })
    }
    if (city && typeof city !== 'string') {
      return NextResponse.json({ error: 'city must be a string' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const dashboardUrl = `${SITE_URL}/espace-artisan/demandes-recues`

    // Fetch provider details
    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, name, email, phone')
      .in('id', provider_ids)

    if (error || !providers) {
      logger.error('[lead-alert] Provider fetch error', error)
      return NextResponse.json({ error: 'provider fetch failed' }, { status: 500 })
    }

    const results = []

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
        const smsMessage = `Nouvelle demande ${service || 'devis'} à ${city || ''}. Répondez vite sur ServicesArtisans.fr`
        const smsResult = await sendSMS(provider.phone, smsMessage)
        results.push({ provider_id: provider.id, channel: 'sms', ...smsResult })
      }

      // Insert in-app notification (graceful fail if table doesn't exist)
      try {
        await supabase.from('notifications').insert({
          provider_id: provider.id,
          type: 'new_lead',
          title: `Nouvelle demande de ${service || 'devis'}`,
          body: `${client_name || 'Un client'} cherche un ${service || 'artisan'} à ${city || 'proximité'}`,
          link: '/espace-artisan/demandes-recues',
        })
      } catch {
        // notifications table may not exist yet
      }
    }

    logger.info(`[lead-alert] Sent to ${providers.length} providers: ${results.filter(r => r.success).length} success`)
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    logger.error('[lead-alert] Error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
