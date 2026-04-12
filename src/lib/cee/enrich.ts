/**
 * CEE qualification — enriched matcher (brique 2 du tunnel mandataire).
 *
 * Extend `qualifyDevisForCee()` avec, pour chaque code FOS applicable :
 *   1. Les détails complets de la fiche (nom, domaine, RGE, formule)
 *   2. La zone climatique RT2012 dérivée du code postal (H1/H2/H3)
 *   3. Une estimation grossière de la prime (kWhc min/max + € min/max en
 *      classique et précarité) calculée à partir de `forfaits_table` JSONB
 *   4. La liste des justificatifs requis (socle + spécifiques) pour affichage
 *      en amont dans le tunnel devis
 *   5. Les délégataires recommandés, triés par vague de priorité
 *
 * ⚠️ Prime estimée = **fourchette indicative**, pas un montant opposable. Le
 * forfait exact dépend de N (appartements), R (ratio puissance), usage précis
 * (chauffage seul vs chauffage+ECS), et de la performance réelle de l'équipement
 * (Etas, COP). Ce module fait une borne min/max sur les valeurs de la table et
 * applique le prix de marché CEE classique (~9 €/MWhc) et précarité (~16 €/MWhc).
 *
 * Usage :
 *   const enriched = await enrichCeeQualification(supabase, {
 *     serviceSlug: 'chauffagiste',
 *     postalCode: '75001',
 *   })
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { qualifyDevisForCee } from './qualify'
import { getDelegatairesForOperations, type CeeDelegataire } from './delegataires'
import { postalCodeToClimateZone, type ClimateZone } from './climate-zones'
import { getLatestCeePrices } from './market-prices'
import { logger } from '@/lib/logger'

/**
 * Prix de marché CEE constatés début 2026 (source : registre EMMY, médiane
 * des cessions février 2026). Utilisés comme proxy pour convertir un volume
 * kWhc en euros estimés. Non opposables : le prix réel dépend du contrat
 * signé avec le délégataire et peut varier de ±20% selon la vague P6.
 */
export const CEE_PRICE_CLASSIQUE_EUR_PER_MWHC = 9
export const CEE_PRICE_PRECARITE_EUR_PER_MWHC = 16

/**
 * Justificatif unitaire — miroir du schéma JSONB `justificatifs_requis` de
 * la migration 400. Volontairement lâche : les champs conditionnels
 * (`condition`, `exif_geotag`, `signature_eidas`) sont optionnels côté type.
 */
export interface CeeJustificatif {
  code: string
  label: string
  source: string
  obligatoire: boolean
  duree_conservation_annees?: number
  condition?: string
  exif_geotag?: boolean
  signature_eidas?: boolean
}

/** Fourchette estimée (kWhc cumac + € classique/précarité). */
export interface CeePrimeEstimate {
  kwhc_min: number
  kwhc_max: number
  euros_classique_min: number
  euros_classique_max: number
  euros_precarite_min: number
  euros_precarite_max: number
  zone: ClimateZone | null
  assumptions: string
}

/** Ligne enrichie renvoyée pour chaque code FOS applicable. */
export interface EnrichedCeeItem {
  code: string
  nom: string
  domaine: string
  sous_domaine: string | null
  rge_qualifications_requises: string[]
  non_cumulable_avec: string[]
  public_cible: string
  forfait_base_kwhc: number | null
  forfaits_table: unknown | null
  justificatifs_requis: CeeJustificatif[]
  prime_estimate: CeePrimeEstimate | null
  delegataires: CeeDelegataire[]
}

export interface EnrichedCeeQualification {
  eligible: boolean
  codes: string[]
  zone_climatique: ClimateZone | null
  items: EnrichedCeeItem[]
}

export interface EnrichCeeInput {
  serviceSlug: string
  postalCode?: string | null
}

/**
 * Colonnes sélectionnées sur `cee_operations` — inclut les 2 colonnes JSONB
 * ajoutées par les migrations 399 (forfaits_table) et 400 (justificatifs_requis).
 */
const OPERATION_ENRICH_COLS =
  'code, nom, domaine, sous_domaine, rge_qualifications_requises, non_cumulable_avec, public_cible, forfait_base_kwhc, forfaits_table, justificatifs_requis'

/**
 * Parcours récursif d'une `forfaits_table` JSONB pour extraire toutes les
 * valeurs numériques correspondant à un forfait (clés `montant`, `chauffage`,
 * `chauffage_ecs`). Filtre par zone climatique si fourni.
 *
 * Le schéma JSONB varie d'une fiche à l'autre (parfois `rows` top-level,
 * parfois imbriqué sous `tables[].rows`). On reste défensif et on traverse
 * sans présumer de la structure.
 */
interface ForfaitExtraction {
  values: number[]
  /**
   * `true` si la fiche contient au moins une ligne avec une clé `zone` réelle
   * ET que le filtre par zone a effectivement discriminé des lignes (soit en
   * conservant, soit en rejetant). Sert à éviter d'afficher `zone: H1` sur une
   * fiche scalaire ou non-zonée où le filtre n'a jamais été appliqué.
   */
  zoneFilterApplied: boolean
}

function extractForfaitValues(forfaitsTable: unknown, zone: ClimateZone | null): ForfaitExtraction {
  if (!forfaitsTable || typeof forfaitsTable !== 'object') {
    return { values: [], zoneFilterApplied: false }
  }

  const values: number[] = []
  let zoneSeen = false
  const FORFAIT_KEYS = new Set(['montant', 'chauffage', 'chauffage_ecs', 'ecs'])

  const visit = (node: unknown, currentZone: string | null) => {
    if (node === null || node === undefined) return
    if (Array.isArray(node)) {
      for (const child of node) visit(child, currentZone)
      return
    }
    if (typeof node !== 'object') return

    const obj = node as Record<string, unknown>
    const hasOwnZone = typeof obj.zone === 'string'
    const rowZone = hasOwnZone ? (obj.zone as string) : currentZone
    if (hasOwnZone) zoneSeen = true

    if (zone && rowZone && rowZone !== zone) {
      for (const [k, v] of Object.entries(obj)) {
        if (!FORFAIT_KEYS.has(k)) visit(v, rowZone)
      }
      return
    }

    for (const [k, v] of Object.entries(obj)) {
      if (FORFAIT_KEYS.has(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) {
        values.push(v)
      } else {
        visit(v, rowZone)
      }
    }
  }

  visit(forfaitsTable, null)
  return { values, zoneFilterApplied: zone !== null && zoneSeen }
}

/**
 * Construit une fourchette d'estimation de prime à partir des valeurs
 * numériques extraites. Retourne null si aucune valeur exploitable.
 */
function buildPrimeEstimate(
  forfaitsTable: unknown,
  forfaitBaseKwhc: number | null,
  zone: ClimateZone | null,
  priceClassique: number = CEE_PRICE_CLASSIQUE_EUR_PER_MWHC,
  pricePrecarite: number = CEE_PRICE_PRECARITE_EUR_PER_MWHC
): CeePrimeEstimate | null {
  const extraction = extractForfaitValues(forfaitsTable, zone)
  const fromTable = extraction.values

  let kwhcMin: number
  let kwhcMax: number
  let assumptions: string
  // Zone effectivement représentée dans le résultat. Si le filtre n'a jamais
  // été appliqué (fiche scalaire ou fiche sans clé `zone`), on force `null`
  // pour ne pas induire l'UI en erreur.
  let effectiveZone: ClimateZone | null = zone

  if (fromTable.length > 0) {
    kwhcMin = Math.min(...fromTable)
    kwhcMax = Math.max(...fromTable)
    if (zone && extraction.zoneFilterApplied) {
      assumptions = `Bornes sur les forfaits unitaires zone ${zone}. Résultat à multiplier par N (appartements/unités) et R (ratio puissance).`
    } else {
      effectiveZone = null
      assumptions = `Bornes sur l'ensemble des forfaits unitaires (toutes zones). Résultat à multiplier par N et R.`
    }
  } else if (forfaitBaseKwhc && forfaitBaseKwhc > 0) {
    kwhcMin = forfaitBaseKwhc
    kwhcMax = forfaitBaseKwhc
    effectiveZone = null
    assumptions = 'Forfait scalaire unique — à multiplier par la surface/unité selon la fiche.'
  } else {
    return null
  }

  const toEuros = (kwhc: number, pricePerMwhc: number) => Math.round((kwhc / 1000) * pricePerMwhc)

  return {
    kwhc_min: kwhcMin,
    kwhc_max: kwhcMax,
    euros_classique_min: toEuros(kwhcMin, priceClassique),
    euros_classique_max: toEuros(kwhcMax, priceClassique),
    euros_precarite_min: toEuros(kwhcMin, pricePrecarite),
    euros_precarite_max: toEuros(kwhcMax, pricePrecarite),
    zone: effectiveZone,
    assumptions,
  }
}

/**
 * Normalise le JSONB `justificatifs_requis` → tableau de `CeeJustificatif`.
 * Accepte le schéma migration 400 (`{items: [...]}`) ou un tableau direct.
 */
function normalizeJustificatifs(raw: unknown): CeeJustificatif[] {
  if (!raw) return []
  const items = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : []

  const out: CeeJustificatif[] = []
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.code !== 'string' || typeof e.label !== 'string') continue
    out.push({
      code: e.code,
      label: e.label,
      source: typeof e.source === 'string' ? e.source : '',
      obligatoire: e.obligatoire !== false,
      duree_conservation_annees:
        typeof e.duree_conservation_annees === 'number' ? e.duree_conservation_annees : undefined,
      condition: typeof e.condition === 'string' ? e.condition : undefined,
      exif_geotag: typeof e.exif_geotag === 'boolean' ? e.exif_geotag : undefined,
      signature_eidas: typeof e.signature_eidas === 'boolean' ? e.signature_eidas : undefined,
    })
  }
  return out
}

/**
 * Point d'entrée — enrichit la qualification CEE d'un devis.
 *
 * Fail-open strict : toute erreur DB renvoie un résultat `eligible:false`,
 * items vides. Aucune exception ne remonte au caller (la qualification ne
 * doit jamais bloquer la soumission d'un devis).
 */
export async function enrichCeeQualification(
  supabase: SupabaseClient,
  input: EnrichCeeInput
): Promise<EnrichedCeeQualification> {
  const zone = postalCodeToClimateZone(input.postalCode)

  const qualification = await qualifyDevisForCee(supabase, input.serviceSlug)
  if (!qualification.eligible || qualification.codes.length === 0) {
    return { eligible: false, codes: [], zone_climatique: zone, items: [] }
  }

  const { data, error } = await supabase
    .from('cee_operations')
    .select(OPERATION_ENRICH_COLS)
    .eq('is_active', true)
    .in('code', qualification.codes)

  if (error || !data) {
    logger.warn('enrichCeeQualification: operations fetch failed — fail-open', {
      action: 'cee-enrich',
      error: error?.message,
      codes: qualification.codes,
    })
    return {
      eligible: qualification.eligible,
      codes: qualification.codes,
      zone_climatique: zone,
      items: [],
    }
  }

  // Récupération batch des délégataires + cours de marché en parallèle.
  const [delegatairesMap, ceePrices] = await Promise.all([
    getDelegatairesForOperations(supabase, qualification.codes),
    getLatestCeePrices(supabase),
  ])

  const items: EnrichedCeeItem[] = (data as Array<Record<string, unknown>>).map((row) => {
    const code = row.code as string
    const forfaitBase = typeof row.forfait_base_kwhc === 'number' ? row.forfait_base_kwhc : null
    return {
      code,
      nom: (row.nom as string) ?? code,
      domaine: (row.domaine as string) ?? '',
      sous_domaine: (row.sous_domaine as string | null) ?? null,
      rge_qualifications_requises: (row.rge_qualifications_requises as string[] | null) ?? [],
      non_cumulable_avec: (row.non_cumulable_avec as string[] | null) ?? [],
      public_cible: (row.public_cible as string) ?? '',
      forfait_base_kwhc: forfaitBase,
      forfaits_table: row.forfaits_table ?? null,
      justificatifs_requis: normalizeJustificatifs(row.justificatifs_requis),
      prime_estimate: buildPrimeEstimate(
        row.forfaits_table,
        forfaitBase,
        zone,
        ceePrices.classique,
        ceePrices.precarite
      ),
      delegataires: delegatairesMap.get(code) ?? [],
    }
  })

  // Tri : items avec estimation d'abord (UX : fiches actionnables en tête),
  // puis alphabétique par code pour stabilité.
  items.sort((a, b) => {
    const aHas = a.prime_estimate ? 0 : 1
    const bHas = b.prime_estimate ? 0 : 1
    if (aHas !== bHas) return aHas - bHas
    return a.code.localeCompare(b.code)
  })

  return {
    eligible: true,
    codes: qualification.codes,
    zone_climatique: zone,
    items,
  }
}
