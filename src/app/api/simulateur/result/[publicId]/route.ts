/**
 * GET /api/simulateur/result/[publicId]
 *
 * Retourne la version PUBLIQUE d'une estimation (sans données personnelles).
 * Pas d'email, pas de téléphone, pas de RFR exact (juste une tranche).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PUBLIC_ID_RE = /^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/i

function normalizePublicId(raw: string): string {
  return raw.replace(/^est-/i, 'EST-')
}

function tranche10k(rfr: number): string {
  const low = Math.floor(rfr / 10_000) * 10_000
  return `${low.toLocaleString('fr-FR')} € – ${(low + 10_000).toLocaleString('fr-FR')} €`
}

export async function GET(_req: NextRequest, context: { params: Promise<{ publicId: string }> }) {
  const { publicId: rawPublicId } = await context.params

  if (!PUBLIC_ID_RE.test(rawPublicId)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
  }

  const publicId = normalizePublicId(rawPublicId)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('simulateur_estimations')
    .select(
      'public_id, barometre_version, type_logement, residence_principale, anciennete, surface_m2, code_postal, zone_climatique, idf, foyer_taille, rfr, categorie_anah, parcours, gestes, coup_de_pouce, equipement_actuel, sauts_dpe, mpr_total, cee_fourchette_bas, cee_fourchette_haut, coup_pouce_estimation, ecretement_pct, reste_a_charge_bas, reste_a_charge_haut, bareme_ids, created_at'
    )
    .eq('public_id', publicId)
    .maybeSingle()

  if (error) {
    logger.error('simulateur/result fetch failed', {
      component: 'api/simulateur/result',
      error: error.message,
      publicId,
    })
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
  }

  return NextResponse.json({
    publicId: data.public_id,
    barometreVersion: data.barometre_version,
    situation: {
      typeLogement: data.type_logement,
      residencePrincipale: data.residence_principale,
      anciennete: data.anciennete,
      surface: data.surface_m2,
      codePostal: data.code_postal,
      zone: data.zone_climatique,
      idf: data.idf,
      foyer: data.foyer_taille,
      rfrTranche: tranche10k(data.rfr as number),
      categorieAnah: data.categorie_anah,
    },
    projet: {
      parcours: data.parcours,
      gestes: data.gestes,
      coupDePouce: data.coup_de_pouce,
      equipementActuel: data.equipement_actuel,
      sautsDpe: data.sauts_dpe,
    },
    resultats: {
      mprTotal: Number(data.mpr_total),
      ceeFourchetteBas: Number(data.cee_fourchette_bas),
      ceeFourchetteHaut: Number(data.cee_fourchette_haut),
      coupPouceEstimation: Number(data.coup_pouce_estimation),
      ecretementPct: Number(data.ecretement_pct),
      resteAChargeBas: Number(data.reste_a_charge_bas),
      resteAChargeHaut: Number(data.reste_a_charge_haut),
    },
    baremeIds: data.bareme_ids,
    createdAt: data.created_at,
  })
}
