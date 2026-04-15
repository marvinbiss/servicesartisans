/**
 * POST /api/simulateur/callback
 *
 * Post-simulation "Rappel gratuit par un conseiller". Crée/attache une Activity
 * Pipedrive sur la Person+Deal existants (match email). Signal chaud priorisé
 * par l'équipe commerciale.
 *
 * Sécurité / RGPD :
 *   - Consent RGPD obligatoire. Consent démarchage optionnel (le user demande
 *     lui-même le rappel → consentement implicite sur cet échange).
 *   - Rate-limit agressif : 3/heure, 8/jour par IP.
 *   - Téléphone stocké uniquement chez Pipedrive (via upsertPerson) + DLQ si
 *     sync échoue (retry cron 6h).
 *
 * Design :
 *   - Await inline le call Pipedrive (~1-2s) : garantit qu'on reçoit success
 *     ou qu'on pousse en DLQ avant de répondre au client (Vercel serverless
 *     ne garantit pas l'exécution post-response).
 *   - DLQ partagée avec /submit via discriminator payload.kind === 'callback'.
 *     Le cron retry dispatche selon kind.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimitDb, getRateLimitDbHeaders } from '@/lib/rate-limit-db'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'
import { verifyToken } from '@/lib/simulateur/rgpd/signed-token'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createCallbackRequest,
  isCallbackPipedriveConfigured,
  type CallbackPayload,
} from '@/lib/simulateur/callback-pipedrive'
import { sendCallbackClientConfirmation, sendCallbackAdminAlert } from '@/lib/simulateur/emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Téléphone FR strict (aligné Step5Contact : +33 ou 0 + [1-9] + 8 chiffres, espaces tolérés)
const TEL_FR_RE = /^(?:\+33|0)[1-9](?:\d{8})$/

type CallbackDlqPayload = {
  kind: 'callback'
  preferredSlot: string | null
  remarquesClient: string | null
}

const callbackSchema = z.object({
  publicId: z.string().min(8).max(64),
  callbackToken: z.string().min(10).max(256),
  telephone: z
    .string()
    .trim()
    .min(10)
    .max(32)
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => TEL_FR_RE.test(v), { message: 'Téléphone FR invalide' }),
  preferredSlot: z.string().max(80).nullish(),
  remarquesClient: z.string().max(500).nullish(),
  consentRgpd: z.literal(true),
  consentDemarchage: z.boolean().optional().default(false),
})

/**
 * Extract client IP from proxy headers. Returns null when no plausible IP is
 * present — we refuse such requests rather than bucketing them together under
 * a shared 'unknown' key (round 3 audit: shared bucket = 3/h for all anonymous
 * traffic → one probe burns the limit for every legitimate user).
 */
function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first && first !== 'unknown') return first
  }
  const real = req.headers.get('x-real-ip')?.trim()
  if (real && real !== 'unknown') return real
  return null
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!ip) {
    // Vercel edge always sets x-forwarded-for. Absence indicates a direct
    // socket hit or a misconfigured proxy — not a legitimate client.
    return NextResponse.json({ error: 'Origine non identifiable' }, { status: 400 })
  }
  let ipKey: string
  try {
    ipKey = hashIp(ip)
  } catch {
    ipKey = ip
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = callbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: z.treeifyError(parsed.error) },
      { status: 422 }
    )
  }

  const { publicId, callbackToken, telephone, preferredSlot, remarquesClient } = parsed.data

  // verifyToken AVANT rateLimitDb : HMAC check est cheap (ns), DB round-trip
  // coûte ~20ms. Les requêtes non-signées (bots) n'atteignent plus la table
  // rate_limits — économise du quota DB + brûle moins le limit par IP.
  if (!verifyToken(publicId, callbackToken)) {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 403 })
  }

  const rlHour = await rateLimitDb(`simulateur:callback:h:${ipKey}`, 3, 60 * 60_000)
  if (!rlHour.success) {
    return NextResponse.json(
      { error: 'Trop de demandes de rappel. Réessayez plus tard.' },
      { status: 429, headers: getRateLimitDbHeaders(rlHour) }
    )
  }
  const rlDay = await rateLimitDb(`simulateur:callback:d:${ipKey}`, 8, 24 * 60 * 60_000)
  if (!rlDay.success) {
    return NextResponse.json(
      { error: 'Quota journalier atteint.' },
      { status: 429, headers: getRateLimitDbHeaders(rlDay) }
    )
  }

  const supabase = createAdminClient()
  const { data: estimation, error: fetchErr } = await supabase
    .from('simulateur_estimations')
    .select('id, prenom, nom, email, callback_used_at')
    .eq('public_id', publicId)
    .maybeSingle()

  if (fetchErr) {
    logger.error('simulateur/callback fetch estimation failed', {
      component: 'api/simulateur/callback',
      publicId,
      error: fetchErr.message,
    })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  if (!estimation) {
    return NextResponse.json({ error: 'Estimation introuvable ou expirée' }, { status: 404 })
  }

  const email = typeof estimation.email === 'string' ? estimation.email : null
  if (!email) {
    return NextResponse.json(
      { error: 'Email non disponible sur cette estimation' },
      { status: 409 }
    )
  }

  if (estimation.callback_used_at) {
    // Token single-use defence: the estimation already triggered a callback
    // successfully. Reject replays (leaked token, multi-tab double-submit).
    return NextResponse.json(
      { error: 'Demande de rappel déjà enregistrée pour cette estimation' },
      { status: 409 }
    )
  }

  // Atomic claim: set callback_used_at only if still NULL. Guards against two
  // concurrent requests both passing the read above. If this UPDATE matches 0
  // rows, another caller won the race → 409. Done BEFORE Pipedrive so a single
  // lead never produces duplicate Person/Deal writes.
  const { data: claimed, error: claimErr } = await supabase
    .from('simulateur_estimations')
    .update({ callback_used_at: new Date().toISOString() })
    .eq('id', estimation.id as string)
    .is('callback_used_at', null)
    .select('id')
    .maybeSingle()

  if (claimErr) {
    logger.error('simulateur/callback claim update failed', {
      component: 'api/simulateur/callback',
      publicId,
      error: claimErr.message,
    })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  if (!claimed) {
    return NextResponse.json(
      { error: 'Demande de rappel déjà enregistrée pour cette estimation' },
      { status: 409 }
    )
  }

  const payload: CallbackPayload = {
    publicId,
    prenom: (estimation.prenom as string | null) ?? null,
    nom: (estimation.nom as string | null) ?? null,
    email,
    telephone,
    preferredSlot: preferredSlot ?? null,
    remarquesClient: remarquesClient ?? null,
  }

  // Pipedrive non configuré → skip uniquement le sync CRM, les emails partent
  // quand même (env dev/staging : équipe commerciale peut traiter par email).
  if (!isCallbackPipedriveConfigured()) {
    logger.warn('simulateur/callback Pipedrive not configured — email-only mode', {
      component: 'api/simulateur/callback',
      publicId,
    })
  } else {
    // Await inline : on veut soit success Pipedrive, soit DLQ bien écrit, avant
    // de répondre. Fire-and-forget n'est pas fiable en Vercel serverless.
    try {
      const result = await createCallbackRequest(payload)
      logger.info('simulateur/callback pipedrive attached', {
        component: 'api/simulateur/callback',
        publicId,
        dealId: result.dealId,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('simulateur/callback pipedrive failed — inserting DLQ', {
        component: 'api/simulateur/callback',
        publicId,
        error: message,
      })
      try {
        await supabase.from('simulateur_pipedrive_failures').insert({
          estimation_id: estimation.id as string,
          payload: {
            kind: 'callback',
            preferredSlot: preferredSlot ?? null,
            remarquesClient: remarquesClient ?? null,
          } satisfies CallbackDlqPayload as unknown as Record<string, unknown>,
          error: message.slice(0, 2000),
          retry_count: 0,
          next_retry_at: new Date().toISOString(),
        })
      } catch (dlqErr) {
        logger.error('simulateur/callback DLQ insert failed', {
          component: 'api/simulateur/callback',
          publicId,
          error: dlqErr instanceof Error ? dlqErr.message : String(dlqErr),
        })
      }
    }
  }

  // Fire-and-forget emails — signal chaud à l'équipe commerciale + accusé client.
  // Ne bloquent jamais la 202 : le tel est déjà persisté via Pipedrive/DLQ.
  void sendCallbackClientConfirmation({
    to: email,
    prenom: payload.prenom,
    telephone,
    preferredSlot: preferredSlot ?? null,
    publicId,
  }).catch((err) => {
    logger.error('simulateur/callback client email failed', {
      component: 'api/simulateur/callback',
      publicId,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  void sendCallbackAdminAlert({
    publicId,
    prenom: payload.prenom,
    nom: payload.nom,
    email,
    telephone,
    preferredSlot: preferredSlot ?? null,
    remarquesClient: remarquesClient ?? null,
  }).catch((err) => {
    logger.error('simulateur/callback admin email failed', {
      component: 'api/simulateur/callback',
      publicId,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  return NextResponse.json(
    { accepted: true },
    { status: 202, headers: getRateLimitDbHeaders(rlHour) }
  )
}
