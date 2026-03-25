import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { getNewLeadAlertEmail } from '@/lib/email/templates/new-lead-alert'
import { sendSMS } from '@/lib/sms/twilio'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.servicesartisans.fr'

/**
 * POST /api/notifications/send-lead-alert
 * Send immediate email + SMS alerts to matched artisans when a new devis is submitted.
 * Called internally after devis insertion.
 */
export async function POST(request: NextRequest) {
  try {
    const { provider_ids, service, city, description, urgency, client_name } = await request.json()

    if (!Array.isArray(provider_ids) || provider_ids.length === 0) {
      return NextResponse.json({ error: 'provider_ids required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const dashboardUrl = `${SITE_URL}/espace-artisan/demandes-recues`

    // Fetch provider details
    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, name, email, phone')
      .in('id', provider_ids)

    if (error || !providers) {
      console.error('[lead-alert] Provider fetch error:', error)
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

    console.log(`[lead-alert] Sent to ${providers.length} providers:`, results.filter(r => r.success).length, 'success')
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error('[lead-alert] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
