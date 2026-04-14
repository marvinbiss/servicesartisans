/**
 * POST /api/simulateur/callback
 *
 * Post-simulation "Rappel gratuit par un conseiller". Crée/attache une Activity
 * Pipedrive sur la Person+Deal existants (match email). Signal chaud priorisé
 * par l'équipe commerciale.
 *
 * Sécurité / RGPD :
 *   - Consent RGPD + démarchage obligatoires.
 *   - Rate-limit agressif : 3/heure, 8/jour par IP.
 *   - Téléphone stocké uniquement chez Pipedrive (via upsertPerson).
 *
 * Design :
 *   - Fire-and-forget Pipedrive comme /submit — l'UX renvoie 202 après
 *     validation, l'échec côté Pipedrive est loggé mais ne bloque pas.
 *   - Pas de nouvelle colonne DB : la note/activity Pipedrive est source de
 *     vérité. Duplication possible mais acceptable (sales team déduplique).
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
} from '@/lib/simulateur/callback-pipedrive'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const callbackSchema = z.object({
  publicId: z.string().min(8).max(64),
  telephone: z
    .string()
    .trim()
    .min(6)
    .max(32)
    .regex(/^[+0-9 .\-()]+$/, 'Numéro invalide'),
  preferredSlot: z.string().max(80).nullish(),
  remarquesClient: z.string().max(500).nullish(),
  consentRgpd: z.literal(true),
  consentDemarchage: z.literal(true),
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

  if (!isCallbackPipedriveConfigured()) {
    logger.warn('simulateur/callback Pipedrive not configured — 202 accepted', {
      component: 'api/simulateur/callback',
      publicId,
    })
    return NextResponse.json({ accepted: true }, { status: 202 })
  }

  void createCallbackRequest({
    publicId,
    prenom: (estimation.prenom as string | null) ?? null,
    nom: (estimation.nom as string | null) ?? null,
    email,
    telephone,
    preferredSlot: preferredSlot ?? null,
    remarquesClient: remarquesClient ?? null,
  }).then(
    ({ dealId }) => {
      logger.info('simulateur/callback pipedrive attached', {
        component: 'api/simulateur/callback',
        publicId,
        dealId,
      })
    },
    (err: unknown) => {
      logger.error('simulateur/callback pipedrive failed', {
        component: 'api/simulateur/callback',
        publicId,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  )

  return NextResponse.json(
    { accepted: true },
    { status: 202, headers: getRateLimitHeaders(rlHour) }
  )
}
