import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { getAbandonEmail1 } from '@/lib/email/templates/abandon-email-1'
import { getAbandonEmail2 } from '@/lib/email/templates/abandon-email-2'
import { getAbandonEmail3 } from '@/lib/email/templates/abandon-email-3'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.servicesartisans.fr'

/**
 * POST /api/cron/abandon-emails
 * Cron job to send recovery email sequences (30min, 24h, 72h).
 * Protected by CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let sent = { email1: 0, email2: 0, email3: 0 }

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
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail1({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({ to: row.email, subject, html })
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
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail2({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({ to: row.email, subject, html })
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
      const unsubscribeUrl = `${SITE_URL}/api/devis/unsubscribe?id=${row.id}`
      const { subject, html } = getAbandonEmail3({
        service: row.service_slug || 'travaux',
        city: row.city_slug || 'votre ville',
        unsubscribeUrl,
      })
      const result = await sendEmail({ to: row.email, subject, html })
      if (result.success) {
        await supabase
          .from('devis_abandons')
          .update({ email_3_sent_at: now.toISOString() })
          .eq('id', row.id)
        sent.email3++
      }
    }

    console.log(`[abandon-emails] Sent: ${sent.email1} email1, ${sent.email2} email2, ${sent.email3} email3`)
    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('[abandon-emails] Cron error:', err)
    return NextResponse.json({ error: 'cron failed' }, { status: 500 })
  }
}
