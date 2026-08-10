import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { getAbandonEmail1 } from '@/lib/email/templates/abandon-email-1'
import { getAbandonEmail2 } from '@/lib/email/templates/abandon-email-2'
import { getAbandonEmail3 } from '@/lib/email/templates/abandon-email-3'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

// SLA-99.9 : wall-clock guard (1 email Resend = ~500ms-1.5s) + lease anti-double-run.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_abandon_emails'
const LEASE_TTL_SECONDS = 15 * 60

/**
 * GET/POST /api/cron/abandon-emails
 * Cron job to send recovery email sequences (30min, 24h, 72h).
 * Protected by CRON_SECRET.
 *
 * Note 2026-05-05 : Vercel Cron envoie GET (audit V1 P0 #4 « abandon-emails
 * DEAD »). On expose le même handler en GET et POST pour compat.
 */
const handleAbandonEmails = withCronCheckIn('cron-abandon-emails', async (request: NextRequest) => {
  // Verify cron secret
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const startedAt = Date.now()
  const sent = { email1: 0, email2: 0, email3: 0 }

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  try {
    // Email 1: 30 min after abandon, not yet sent
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    const { data: batch1 } = await supabase
      .from('devis_abandons')
      .select('id, email, service_slug, city_slug')
      .is('completed_at', null)
      .is('email_1_sent_at', null)
      .eq('unsubscribed', false)
      .lte('created_at', thirtyMinAgo)
      .limit(50)

    for (const row of batch1 || []) {
      // SLA-99.9 : wall-clock guard.
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail1({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({
        to: row.email,
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (result.success) {
        await supabase
          .from('devis_abandons')
          .update({ email_1_sent_at: now.toISOString() })
          .eq('id', row.id)
        sent.email1++
      }
    }

    // Email 2: 24h after abandon, email 1 sent, email 2 not yet
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const { data: batch2 } = await supabase
      .from('devis_abandons')
      .select('id, email, service_slug, city_slug')
      .is('completed_at', null)
      .not('email_1_sent_at', 'is', null)
      .is('email_2_sent_at', null)
      .eq('unsubscribed', false)
      .lte('created_at', twentyFourHoursAgo)
      .limit(50)

    for (const row of batch2 || []) {
      // SLA-99.9 : wall-clock guard.
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail2({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({
        to: row.email,
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (result.success) {
        await supabase
          .from('devis_abandons')
          .update({ email_2_sent_at: now.toISOString() })
          .eq('id', row.id)
        sent.email2++
      }
    }

    // Email 3: 72h after abandon, email 2 sent, email 3 not yet
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()
    const { data: batch3 } = await supabase
      .from('devis_abandons')
      .select('id, email, service_slug, city_slug')
      .is('completed_at', null)
      .not('email_2_sent_at', 'is', null)
      .is('email_3_sent_at', null)
      .eq('unsubscribed', false)
      .lte('created_at', seventyTwoHoursAgo)
      .limit(50)

    for (const row of batch3 || []) {
      // SLA-99.9 : wall-clock guard.
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail3({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({
        to: row.email,
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (result.success) {
        await supabase
          .from('devis_abandons')
          .update({ email_3_sent_at: now.toISOString() })
          .eq('id', row.id)
        sent.email3++
      }
    }

    console.warn(
      `[abandon-emails] Sent: ${sent.email1} email1, ${sent.email2} email2, ${sent.email3} email3`
    )
    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('[abandon-emails] Cron error:', err)
    return NextResponse.json({ error: 'cron failed' }, { status: 500 })
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})

export const POST = handleAbandonEmails
export const GET = handleAbandonEmails
