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
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createCallbackRequest,
  isCallbackPipedriveConfigured,
  type CallbackPayload,
} from '@/lib/simulateur/callback-pipedrive'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Téléphone FR strict (aligné Step5Contact : +33 ou 0 + [1-9] + 8 chiffres, espaces tolérés)
const TEL_FR_RE = /^(?:\+33|0)[1-9](?:\d{8})$/

const callbackSchema = z.object({
  publicId: z.string().min(8).max(64),
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

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return (fwd.split(',')[0] ?? '').trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  let ipKey: string
  try {
    ipKey = hashIp(ip)
  } catch {
    ipKey = ip
  }

  const rlHour = rateLimit(`simulateur:callback:h:${ipKey}`, 3, 60 * 60_000)
  if (!rlHour.success) {
    return NextResponse.json(
      { error: 'Trop de demandes de rappel. Réessayez plus tard.' },
      { status: 429, headers: getRateLimitHeaders(rlHour) }
    )
  }
  const rlDay = rateLimit(`simulateur:callback:d:${ipKey}`, 8, 24 * 60 * 60_000)
  if (!rlDay.success) {
    return NextResponse.json(
      { error: 'Quota journalier atteint.' },
      { status: 429, headers: getRateLimitHeaders(rlDay) }
    )
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

  const { publicId, telephone, preferredSlot, remarquesClient } = parsed.data

  const supabase = createAdminClient()
  const { data: estimation, error: fetchErr } = await supabase
    .from('simulateur_estimations')
    .select('id, prenom, nom, email, telephone')
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

  const payload: CallbackPayload = {
    publicId,
    prenom: (estimation.prenom as string | null) ?? null,
    nom: (estimation.nom as string | null) ?? null,
    email,
    telephone,
    preferredSlot: preferredSlot ?? null,
    remarquesClient: remarquesClient ?? null,
  }

  // Pipedrive non configuré → on accepte quand même (env dev/staging)
  if (!isCallbackPipedriveConfigured()) {
    logger.warn('simulateur/callback Pipedrive not configured — 202 accepted', {
      component: 'api/simulateur/callback',
      publicId,
    })
    return NextResponse.json({ accepted: true }, { status: 202 })
  }

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
        // Discriminator : le cron retry dispatche sur payload.kind
        payload: { kind: 'callback', ...payload } as unknown as Record<string, unknown>,
        error: message.slice(0, 2000),
        retry_count: 0,
        next_retry_at: new Date().toISOString(),
      })
    } catch (dlqErr) {
      // Dernier recours — on log mais on accepte quand même côté UX (l'user
      // a donné son tel, il peut rappeler). L'incident est visible via logs.
      logger.error('simulateur/callback DLQ insert failed', {
        component: 'api/simulateur/callback',
        publicId,
        error: dlqErr instanceof Error ? dlqErr.message : String(dlqErr),
      })
    }
  }

  return NextResponse.json(
    { accepted: true },
    { status: 202, headers: getRateLimitHeaders(rlHour) }
  )
}
