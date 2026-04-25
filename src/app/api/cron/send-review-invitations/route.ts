/**
 * Cron: send pending review invitations.
 *
 * Reads review_invitations where scheduled_at <= now() AND sent_at IS NULL
 * AND expires_at > now(), sends an email with the plaintext token URL,
 * marks sent_at. Failures bump `attempts` + `last_error` for retry visibility.
 *
 * The plaintext token isn't stored: we regenerate it per invitation if we
 * retry (which would invalidate prior links). For safety, an invitation
 * failing to send is retried max 3 times with a regenerated token, after
 * which it's marked expired.
 *
 * Triggered by Vercel Cron (see vercel.json): recommended every 15 min.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'
import { createInvitationToken } from '@/lib/reviews/invitation-token'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const BATCH_SIZE = 100
const MAX_ATTEMPTS = 3

export const dynamic = 'force-dynamic'

type InvitationRow = {
  id: string
  devis_request_id: string
  provider_id: string | null
  client_email: string
  client_name: string | null
  service_name: string | null
  scheduled_at: string
  attempts: number
}

function buildReviewEmail(input: {
  clientName: string
  serviceName: string
  reviewUrl: string
  artisanName: string | null
}) {
  const greeting = input.clientName ? `Bonjour ${input.clientName}` : 'Bonjour'
  const artisanBit = input.artisanName ? ` avec ${input.artisanName}` : ''

  return {
    subject: `Votre avis sur ${input.serviceName} — ${input.artisanName ?? 'ServicesArtisans'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, sans-serif; margin:0; padding:0; background:#f5f5f5;">
          <div style="max-width:600px; margin:0 auto; padding:20px;">
            <div style="background:linear-gradient(135deg,#E86B4B 0%,#C24B2A 100%); padding:30px; border-radius:12px 12px 0 0; text-align:center;">
              <h1 style="color:white; margin:0; font-size:24px;">Votre avis compte</h1>
            </div>
            <div style="background:white; padding:30px; border-radius:0 0 12px 12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <p style="color:#333; font-size:16px;">${greeting},</p>
              <p style="color:#666; font-size:15px; line-height:1.6;">
                Il y a quelques jours, vous avez demandé un devis pour <strong>${input.serviceName}</strong>${artisanBit}.
                Comment cela s'est-il passé ?
              </p>
              <p style="color:#666; font-size:15px; line-height:1.6;">
                Votre retour aide d'autres particuliers à choisir le bon artisan, et nos pros à progresser.
              </p>
              <div style="text-align:center; margin:30px 0;">
                <a href="${input.reviewUrl}" style="display:inline-block; background:#E86B4B; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">
                  Laisser un avis en 30 secondes
                </a>
              </div>
              <p style="color:#999; font-size:13px; text-align:center;">Ce lien est personnel et valide 30 jours.</p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;">
              <p style="color:#999; font-size:12px; text-align:center;">
                ServicesArtisans — Artisans verifies et leads exclusifs
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `${greeting},\n\nIl y a quelques jours, vous avez demande un devis pour ${input.serviceName}${artisanBit}. Comment cela s'est-il passe ?\n\nLaisser un avis : ${input.reviewUrl}\n\nCela ne prend que 30 secondes.\n\nServicesArtisans`,
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const nowIso = new Date().toISOString()

  const { data: invitations, error } = await supabase
    .from('review_invitations')
    .select(
      'id, devis_request_id, provider_id, client_email, client_name, service_name, scheduled_at, attempts'
    )
    .is('sent_at', null)
    .is('completed_at', null)
    .lte('scheduled_at', nowIso)
    .gt('expires_at', nowIso)
    .lt('attempts', MAX_ATTEMPTS)
    .order('scheduled_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    logger.error('[send-review-invitations] fetch error', error)
    return NextResponse.json({ success: false, error: 'fetch_failed' }, { status: 500 })
  }

  const pending = (invitations ?? []) as InvitationRow[]
  if (pending.length === 0) {
    return NextResponse.json({ success: true, sent: 0, failed: 0 })
  }

  const providerIds = Array.from(
    new Set(pending.map((i) => i.provider_id).filter((id): id is string => !!id))
  )

  const artisanNames = new Map<string, string>()
  if (providerIds.length > 0) {
    const { data: providers } = await supabase
      .from('providers')
      .select('id, name')
      .in('id', providerIds)
    for (const provider of providers ?? []) {
      if (provider.name) artisanNames.set(provider.id, provider.name)
    }
  }

  let sent = 0
  let failed = 0
  const updates: Array<{
    id: string
    sent_at?: string
    attempts: number
    last_error?: string
    token_hash?: string
  }> = []

  for (const invitation of pending) {
    // Regenerate token each attempt so the plaintext can be transmitted.
    // Previous token_hash is overwritten on retry (the old email link stops working,
    // which is the desired behaviour for retry semantics).
    const { plaintext, hash } = createInvitationToken()
    const reviewUrl = `${SITE_URL}/invitation-avis/${plaintext}`

    const template = buildReviewEmail({
      clientName: invitation.client_name ?? '',
      serviceName: invitation.service_name ?? 'votre prestation',
      reviewUrl,
      artisanName: invitation.provider_id
        ? (artisanNames.get(invitation.provider_id) ?? null)
        : null,
    })

    const result = await sendEmail({
      to: invitation.client_email,
      ...template,
    })

    if (result.success) {
      sent++
      updates.push({
        id: invitation.id,
        sent_at: new Date().toISOString(),
        attempts: invitation.attempts + 1,
        token_hash: hash,
      })
    } else {
      failed++
      updates.push({
        id: invitation.id,
        attempts: invitation.attempts + 1,
        last_error: result.error ?? 'unknown',
        token_hash: hash,
      })
    }
  }

  await Promise.all(
    updates.map(({ id, ...patch }) =>
      supabase
        .from('review_invitations')
        .update(patch)
        .eq('id', id)
        .then(({ error: updateError }) => {
          if (updateError) {
            logger.error('[send-review-invitations] update error', { id, error: updateError })
          }
        })
    )
  )

  return NextResponse.json({ success: true, sent, failed, processed: pending.length })
}
