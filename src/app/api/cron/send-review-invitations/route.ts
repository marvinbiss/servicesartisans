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
 * Backoff transient (audit B/C #6 2026-05-04) :
 *   Resend 429 (rate limit) ou 5xx (downstream) → erreur TRANSIENT, on
 *   préserve les `attempts` (sinon 1 burst Resend brûle nos 3 tentatives en
 *   5 min) et on repousse `scheduled_at` à now()+1h..3h selon attempts.
 *   Erreur permanente (4xx ≠ 429, validation, bounce hard) → attempts++ comme
 *   avant. Détection par regex sur error.message (Resend SDK n'expose pas
 *   le HTTP status code via le wrapper sendEmail).
 *
 * Triggered by Vercel Cron (see vercel.json): recommended every 15 min.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'
import { createInvitationToken } from '@/lib/reviews/invitation-token'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const BATCH_SIZE = 100
const MAX_ATTEMPTS = 3

// SLA-99.9 : cap dur par run (alias explicite de BATCH_SIZE) + wall-clock guard
// 50s (1 email Resend = ~500ms-1.5s) + lease anti-double-run.
const MAX_INVITATIONS_PER_RUN = BATCH_SIZE
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_send_review_invitations'
const LEASE_TTL_SECONDS = 15 * 60

const TRANSIENT_PATTERNS = [
  /429/,
  /rate.?limit/i,
  /\b5\d{2}\b/,
  /timeout/i,
  /econnreset/i,
  /etimedout/i,
  /service unavailable/i,
  /bad gateway/i,
  /gateway timeout/i,
]

function isTransientError(error: string | undefined): boolean {
  if (!error) return false
  return TRANSIENT_PATTERNS.some((re) => re.test(error))
}

function transientBackoffISO(attempts: number): string {
  // Backoff linéaire 1h × (attempts+1) → 1h, 2h, 3h. Évite de bombarder Resend
  // pendant un incident sans bloquer trop longtemps en cas de fix rapide.
  const delayMs = (attempts + 1) * 60 * 60 * 1000
  return new Date(Date.now() + delayMs).toISOString()
}

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
  unsubscribeUrl: string
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
            <div style="background:linear-gradient(135deg,#E0723F 0%,#A23A1F 100%); padding:30px; border-radius:12px 12px 0 0; text-align:center;">
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
                <a href="${input.reviewUrl}" style="display:inline-block; background:#E0723F; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">
                  Laisser un avis en 30 secondes
                </a>
              </div>
              <p style="color:#999; font-size:13px; text-align:center;">Ce lien est personnel et valide 30 jours.</p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;">
              <p style="color:#999; font-size:12px; text-align:center; line-height:1.6;">
                ServicesArtisans — Artisans vérifiés et leads exclusifs<br>
                <a href="${input.unsubscribeUrl}" style="color:#999; text-decoration:underline;">Se désinscrire des invitations à laisser un avis</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `${greeting},\n\nIl y a quelques jours, vous avez demande un devis pour ${input.serviceName}${artisanBit}. Comment cela s'est-il passe ?\n\nLaisser un avis : ${input.reviewUrl}\n\nCela ne prend que 30 secondes.\n\n---\nServicesArtisans\nSe desinscrire : ${input.unsubscribeUrl}`,
  }
}

export const GET = withCronCheckIn('cron-send-review-invitations', async (request: Request) => {
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

  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const leaseResult = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = leaseResult.data as boolean | null
    leaseErr = leaseResult.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('[send-review-invitations] lease error', { error: leaseErr.message })
    return NextResponse.json({ success: false, error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[send-review-invitations] skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
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
      .limit(MAX_INVITATIONS_PER_RUN)

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
      scheduled_at?: string
      attempts?: number
      last_error?: string
      token_hash?: string
    }> = []

    for (const invitation of pending) {
      // SLA-99.9 : wall-clock guard (1 email Resend = ~500ms-1.5s).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      // Regenerate token each attempt so the plaintext can be transmitted.
      // Previous token_hash is overwritten on retry (the old email link stops working,
      // which is the desired behaviour for retry semantics).
      const { plaintext, hash } = createInvitationToken()
      const reviewUrl = `${SITE_URL}/invitation-avis/${plaintext}`
      // Mailto unsubscribe : RFC 2369 minimal viable. Le subject inclut l'ID
      // pour que Marvin puisse retrouver et marquer manuellement l'invitation
      // (ou setup une auto-traitement plus tard).
      // TODO V2 : endpoint `/api/reviews/unsubscribe/[token]` + colonne
      // `review_invitations.unsubscribed_at` (migration 486) pour permettre le
      // List-Unsubscribe-Post one-click (RFC 8058) qui requiert HTTPS.
      const unsubscribeMailto = `mailto:contact@servicesartisans.fr?subject=Desinscription%20avis%20-%20${invitation.id}&body=Merci%20de%20me%20desinscrire%20des%20invitations%20a%20laisser%20un%20avis.`

      const template = buildReviewEmail({
        clientName: invitation.client_name ?? '',
        serviceName: invitation.service_name ?? 'votre prestation',
        reviewUrl,
        artisanName: invitation.provider_id
          ? (artisanNames.get(invitation.provider_id) ?? null)
          : null,
        unsubscribeUrl: unsubscribeMailto,
      })

      // List-Unsubscribe (RFC 2369) requis par Gmail/Outlook 2024 sender guidelines
      // pour les bulk senders >5K/jour (cf. https://support.google.com/mail/answer/81126).
      // Mailto-only ici ; List-Unsubscribe-Post (RFC 8058) nécessite endpoint HTTPS
      // dédié + colonne `unsubscribed_at` (TODO migration).
      // ReplyTo redirige les réponses humaines vers contact@ (existant) plutôt que
      // FROM_EMAIL (potentiellement noreply@) → conformité best practices et trust.
      const result = await sendEmail({
        to: invitation.client_email,
        ...template,
        replyTo: 'contact@servicesartisans.fr',
        headers: {
          'List-Unsubscribe': `<${unsubscribeMailto}>`,
        },
      })

      if (result.success) {
        sent++
        updates.push({
          id: invitation.id,
          sent_at: new Date().toISOString(),
          attempts: invitation.attempts + 1,
          token_hash: hash,
        })
      } else if (isTransientError(result.error)) {
        // Transient error (429/5xx/timeout) : on préserve les attempts et on
        // reschedule. Le burst Resend ne brûle plus nos 3 tentatives en 5 min.
        failed++
        updates.push({
          id: invitation.id,
          scheduled_at: transientBackoffISO(invitation.attempts),
          last_error: `transient: ${result.error ?? 'unknown'}`,
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
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
