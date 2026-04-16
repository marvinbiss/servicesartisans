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

import { createHash, randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimitDb, getRateLimitDbHeaders } from '@/lib/rate-limit-db'
import { submitInputSchema } from '@/lib/simulateur/api-schemas'
import { runSimulation } from '@/lib/simulateur/engine/pipeline'
import { classifierCategorieAnah } from '@/lib/simulateur/engine/classifier'
import { zoneFromCodePostal } from '@/lib/simulateur/zones'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'
import { generatePublicId } from '@/lib/simulateur/utils/public-id'
import { BAREMES_2026_01, CURRENT_BAREMES_VERSION } from '@/lib/simulateur/baremes'
import { buildConsentTextCanonical, CONSENT_VERSION_CURRENT } from '@/lib/simulateur/consent-texts'
import { computeInputsHash } from '@/lib/simulateur/hash'
import { createAdminClient } from '@/lib/supabase/admin'
import { runPipedriveHook } from '@/lib/simulateur/submit-hooks'
import { sendSubmitClientConfirmation, sendSubmitAdminNotification } from '@/lib/simulateur/emails'
import type { Situation } from '@/lib/simulateur/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_DOC = 'docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md'

// Texte RGPD versionné affiché à l'utilisateur au Step 4. Toute modification
// doit être accompagnée d'un nouveau tag de version (v1, v2, ...) — le SHA-256
// est stocké en DB comme preuve opposable du consentement (CNIL).
// Texte de consentement réellement affiché au Step 5 — source unique dans
// src/lib/simulateur/consent-texts.ts pour que UI et hash DB soient alignés.
// Preuve opposable CNIL : version + SHA-256 stockés en DB.
const CONSENT_TEXT_CANONICAL = buildConsentTextCanonical(CONSENT_VERSION_CURRENT)
const CONSENT_TEXT_SHA256 = `${CONSENT_VERSION_CURRENT}:${createHash('sha256')
  .update(CONSENT_TEXT_CANONICAL, 'utf8')
  .digest('hex')}`

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return (fwd.split(',')[0] ?? '').trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  // request_id propagé Vercel logs ↔ DB ↔ Pipedrive ↔ admin (plan 20/20)
  const requestId = req.headers.get('x-request-id') ?? randomUUID()
  const ip = clientIp(req)
  let ipKey: string
  try {
    ipKey = hashIp(ip)
  } catch {
    ipKey = ip
  }

  // Rate-limit agressif sur submit : 5/heure, 20/jour (doc archi §12).
  // DB-backed via rate_limit_check RPC (migration 441) pour survivre aux cold-starts Vercel.
  const rlHour = await rateLimitDb(`simulateur:submit:h:${ipKey}`, 5, 60 * 60_000)
  if (!rlHour.success) {
    return NextResponse.json(
      { error: 'Trop de soumissions. Réessayez plus tard.' },
      { status: 429, headers: getRateLimitDbHeaders(rlHour) }
    )
  }
  const rlDay = await rateLimitDb(`simulateur:submit:d:${ipKey}`, 20, 24 * 60 * 60_000)
  if (!rlDay.success) {
    return NextResponse.json(
      { error: 'Quota journalier atteint.' },
      { status: 429, headers: getRateLimitDbHeaders(rlDay) }
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
    copropriete: situationInput.copropriete ?? false,
    investisseurLocatif: situationInput.investisseurLocatif ?? false,
  }

  // Hash sur l'input brut user (avant enrichissement zone/categorie) pour
  // idempotence pure : mêmes champs saisis → même hash, indépendant du classifier.
  const inputsHash = computeInputsHash(situationInput, projet, budget)

  let result
  try {
    result = runSimulation({ situation, projet, budget })
  } catch (err) {
    logger.error('simulateur/submit runSimulation failed', {
      component: 'api/simulateur/submit',
      requestId,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'Erreur lors du calcul' },
      { status: 500, headers: { 'x-request-id': requestId } }
    )
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
    rfr_exact: situation.rfr,
    rfr_tranche: `${Math.floor(situation.rfr / 10000) * 10000}-${Math.floor(situation.rfr / 10000) * 10000 + 9999}`,
    categorie_anah: situation.categorie,

    // Projet
    parcours: projet.parcours,
    gestes: result.gestesRetenus.map((g) => ({ id: g })) as unknown as Record<string, unknown>[],
    coup_de_pouce: projet.coupDePouce,
    equipement_actuel: projet.equipementActuel,
    sauts_dpe: projet.sautsDpe ?? null,

    // Résultats
    mpr_total: result.mprTotal,
    mpr_budget_plafonne: result.mprBudgetPlafonne ?? null,
    mpr_plafond_ht: result.mprPlafondHt ?? null,
    cee_fourchette_bas: result.ceeFourchetteBas,
    cee_fourchette_haut: result.ceeFourchetteHaut,
    cee_ampleur: result.ceeAmpleur,
    coup_pouce_estimation: Math.round((result.cdpEstimationBas + result.cdpEstimationHaut) / 2),
    mar_prise_en_charge: result.marPriseEnCharge,
    ecretement_pct: result.ecretementPct,
    reste_a_charge_bas: result.resteAChargeBas,
    reste_a_charge_haut: result.resteAChargeHaut,
    total_aides_bas: result.totalAidesBas,
    total_aides_haut: result.totalAidesHaut,

    // Prêts (informatifs)
    eco_ptz_eligible: result.ecoPtz.eligible,
    eco_ptz_montant_max: result.ecoPtz.montantMax,
    eco_ptz_duree_max_ans: result.ecoPtz.dureeMaxAns,
    par_eligible: result.par.eligible,
    par_montant_max: result.par.montantMax,

    // Complémentaires
    complementaires: result.complementaires as unknown as Record<string, unknown>,
    copropriete: situation.copropriete ?? false,

    // Traçabilité
    bareme_ids: (result.baremeIds ?? []) as unknown as Record<string, unknown>[],
    // formule_debug est NOT NULL depuis migration 444. Fallback array vide si
    // le pipeline retourne jamais undefined (défense en profondeur).
    formule_debug: (result.formuleDebug ?? []) as unknown as Record<string, unknown>[],

    // Coordonnées (nullables — anonymisées à 3 ans par cron RGPD, migration 440)
    prenom: coordonnees.prenom || null,
    nom: coordonnees.nom || null,
    email: coordonnees.email || null,
    telephone: coordonnees.telephone || null,

    // Consentements
    consent_rgpd: coordonnees.consentRgpd,
    consent_rgpd_at: coordonnees.consentRgpd ? new Date().toISOString() : null,
    consent_demarchage: coordonnees.consentDemarchage ?? false,

    // Budget (migration 440 : sert au recompute admin P5)
    budget_ht: budget.budgetHt,

    // Traçabilité (plan 20/20 — migration 444)
    request_id: requestId,
    inputs_hash: inputsHash,
    consent_text_sha256: CONSENT_TEXT_SHA256,

    // Audit
    ip_hash: ipHash,
    user_agent: userAgent,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('simulateur_estimations')
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertErr || !inserted) {
    logger.error('simulateur_estimations insert failed', {
      component: 'api/simulateur/submit',
      error: insertErr?.message,
      publicId,
    })
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  logger.info('simulateur estimation created', {
    component: 'api/simulateur/submit',
    requestId,
    publicId,
    inputsHash,
    categorie,
    parcours: projet.parcours,
  })

  // Fire-and-forget emails — ne bloquent jamais la réponse HTTP. Resend a son
  // propre retry interne (3 tentatives). Si le provider est down, on log et on
  // continue : le lead existe en DB + Pipedrive, l'équipe peut rappeler.
  if (coordonnees.email) {
    void sendSubmitClientConfirmation({
      to: coordonnees.email,
      prenom: coordonnees.prenom ?? null,
      publicId,
      mprTotal: result.mprTotal,
      ceeFourchetteBas: result.ceeFourchetteBas,
      ceeFourchetteHaut: result.ceeFourchetteHaut,
      coupPouceEstimation: Math.round((result.cdpEstimationBas + result.cdpEstimationHaut) / 2),
      resteAChargeBas: result.resteAChargeBas,
      resteAChargeHaut: result.resteAChargeHaut,
    }).catch((err) => {
      logger.error('simulateur/submit client email failed', {
        component: 'api/simulateur/submit',
        publicId,
        error: err instanceof Error ? err.message : String(err),
      })
    })
  }

  void sendSubmitAdminNotification({
    publicId,
    prenom: coordonnees.prenom ?? null,
    nom: coordonnees.nom ?? null,
    email: coordonnees.email ?? null,
    telephone: coordonnees.telephone ?? null,
    codePostal: situation.codePostal,
    parcours: projet.parcours,
    categorieAnah: situation.categorie,
    mprTotal: result.mprTotal,
    ceeFourchetteHaut: result.ceeFourchetteHaut,
    coupPouceEstimation: Math.round((result.cdpEstimationBas + result.cdpEstimationHaut) / 2),
    consentDemarchage: coordonnees.consentDemarchage ?? false,
  }).catch((err) => {
    logger.error('simulateur/submit admin email failed', {
      component: 'api/simulateur/submit',
      publicId,
      error: err instanceof Error ? err.message : String(err),
    })
  })

  // Fire-and-forget Pipedrive hook — ne bloque jamais la réponse HTTP.
  // En cas d'échec, la DLQ simulateur_pipedrive_failures est remplie (retry cron).
  void runPipedriveHook({
    estimationId: inserted.id as string,
    input: {
      publicId,
      requestId,
      prenom: coordonnees.prenom,
      nom: coordonnees.nom,
      email: coordonnees.email,
      telephone: coordonnees.telephone,
      estimation: {
        publicId,
        categorieAnah: situation.categorie,
        zoneClimatique: situation.zone,
        parcours: projet.parcours,
        gestes: result.gestesRetenus.map((g) => ({ id: g, label: g })) as never,
        baremeIds: result.baremeIds,
        mprTotal: result.mprTotal,
        ceeFourchetteBas: result.ceeFourchetteBas,
        ceeFourchetteHaut: result.ceeFourchetteHaut,
        coupPouceEstimation: Math.round((result.cdpEstimationBas + result.cdpEstimationHaut) / 2),
        resteAChargeBas: result.resteAChargeBas,
        resteAChargeHaut: result.resteAChargeHaut,
        barometreVersion: CURRENT_BAREMES_VERSION,
        codePostal: situation.codePostal,
        surface: situation.surface,
        rfr: situation.rfr,
      } as never,
    },
  })

  return NextResponse.json(
    { publicId, requestId },
    {
      status: 201,
      headers: { ...getRateLimitDbHeaders(rlHour), 'x-request-id': requestId },
    }
  )
}
