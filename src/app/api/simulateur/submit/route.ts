/**
 * POST /api/simulateur/submit
 *
 * Valide + enrichit + calcule + persiste l'estimation complète.
 * Retourne { publicId } — le front redirige vers /resultat/[publicId].
 *
 * RGPD :
 *  - consentRgpd obligatoire (également CHECK en DB)
 *  - IP hashée SHA-256 salé (jamais stockée en clair)
 *  - Consent démarchage séparé
 *
 * Traçabilité :
 *  - bareme_version référence la version active
 *  - bareme_ids persistés pour reconstruction < 30s
 *  - formule_debug persisté (snapshot du pipeline)
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { submitInputSchema } from '@/lib/simulateur/api-schemas'
import { runSimulation } from '@/lib/simulateur/engine/pipeline'
import { classifierCategorieAnah } from '@/lib/simulateur/engine/classifier'
import { zoneFromCodePostal } from '@/lib/simulateur/zones'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'
import { generatePublicId } from '@/lib/simulateur/utils/public-id'
import { BAREMES_2026_01, CURRENT_BAREMES_VERSION } from '@/lib/simulateur/baremes'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Situation } from '@/lib/simulateur/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_DOC = 'docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md'

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

  // Rate-limit agressif sur submit : 5/heure, 20/jour (doc archi §12)
  const rlHour = rateLimit(`simulateur:submit:h:${ipKey}`, 5, 60 * 60_000)
  if (!rlHour.success) {
    return NextResponse.json(
      { error: 'Trop de soumissions. Réessayez plus tard.' },
      { status: 429, headers: getRateLimitHeaders(rlHour) }
    )
  }
  const rlDay = rateLimit(`simulateur:submit:d:${ipKey}`, 20, 24 * 60 * 60_000)
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

  const parsed = submitInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: z.treeifyError(parsed.error) },
      { status: 422 }
    )
  }

  const { situation: situationInput, projet, budget, coordonnees } = parsed.data

  // Double-check RGPD (schéma impose déjà literal true, mais défense en profondeur)
  if (coordonnees.consentRgpd !== true) {
    return NextResponse.json({ error: 'Le consentement RGPD est obligatoire' }, { status: 422 })
  }

  const zoneRes = zoneFromCodePostal(situationInput.codePostal)
  const categorie = classifierCategorieAnah(situationInput.rfr, situationInput.foyer, zoneRes.idf)

  const situation: Situation = {
    ...situationInput,
    zone: zoneRes.zone,
    idf: zoneRes.idf,
    categorie,
  }

  let result
  try {
    result = runSimulation({ situation, projet, budget })
  } catch (err) {
    logger.error('simulateur/submit runSimulation failed', {
      component: 'api/simulateur/submit',
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Erreur lors du calcul' }, { status: 500 })
  }

  const publicId = generatePublicId()
  const supabase = createAdminClient()

  // Upsert baremes_versions si manquant (idempotent)
  try {
    const { error: upsertErr } = await supabase.from('baremes_versions').upsert(
      {
        id: CURRENT_BAREMES_VERSION,
        effective_from: BAREMES_2026_01.effectiveFrom,
        source_doc: SOURCE_DOC,
        data: BAREMES_2026_01 as unknown as Record<string, unknown>,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    if (upsertErr) {
      logger.warn('baremes_versions upsert warning', {
        component: 'api/simulateur/submit',
        error: upsertErr.message,
      })
    }
  } catch (err) {
    logger.warn('baremes_versions upsert threw', {
      component: 'api/simulateur/submit',
      error: err instanceof Error ? err.message : String(err),
    })
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null
  let ipHash: string | null
  try {
    ipHash = hashIp(ip)
  } catch {
    ipHash = null
  }

  const insertPayload = {
    public_id: publicId,
    barometre_version: CURRENT_BAREMES_VERSION,

    // Situation
    type_logement: situation.typeLogement,
    residence_principale: situation.residencePrincipale,
    anciennete: situation.anciennete,
    surface_m2: situation.surface,
    code_postal: situation.codePostal,
    zone_climatique: situation.zone,
    idf: situation.idf,
    foyer_taille: situation.foyer,
    rfr: situation.rfr,
    categorie_anah: situation.categorie,

    // Projet
    parcours: projet.parcours,
    gestes: result.gestesRetenus.map((g) => ({ id: g })) as unknown as Record<string, unknown>[],
    coup_de_pouce: projet.coupDePouce,
    equipement_actuel: projet.equipementActuel,
    sauts_dpe: projet.sautsDpe ?? null,

    // Résultats
    mpr_total: result.mprTotal,
    cee_fourchette_bas: result.ceeFourchetteBas,
    cee_fourchette_haut: result.ceeFourchetteHaut,
    coup_pouce_estimation: Math.round((result.cdpEstimationBas + result.cdpEstimationHaut) / 2),
    ecretement_pct: result.ecretementPct,
    reste_a_charge_bas: result.resteAChargeBas,
    reste_a_charge_haut: result.resteAChargeHaut,

    // Traçabilité
    bareme_ids: result.baremeIds as unknown as Record<string, unknown>[],
    formule_debug: result.formuleDebug as unknown as Record<string, unknown>[],

    // Consentements
    consent_rgpd: coordonnees.consentRgpd,
    consent_demarchage: coordonnees.consentDemarchage ?? false,

    // Audit
    ip_hash: ipHash,
    user_agent: userAgent,
  }

  const { error: insertErr } = await supabase.from('simulateur_estimations').insert(insertPayload)

  if (insertErr) {
    logger.error('simulateur_estimations insert failed', {
      component: 'api/simulateur/submit',
      error: insertErr.message,
      publicId,
    })
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  logger.info('simulateur estimation created', {
    component: 'api/simulateur/submit',
    publicId,
    categorie,
    parcours: projet.parcours,
  })

  // TODO P4 : enqueue Pipedrive job avec coordonnees + publicId (fire-and-forget + DLQ)

  return NextResponse.json({ publicId }, { status: 201, headers: getRateLimitHeaders(rlHour) })
}
