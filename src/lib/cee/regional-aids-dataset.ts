/**
 * Sprint AI Wave G 2026-05-03 — Sérialisation open-data du dataset
 * "Aides CEE régionales 2026" pour publication data.gouv.fr (CC-BY 4.0).
 *
 * Source de vérité : `getAllCeeRegionalSpecifics()` (Sprint AI Wave D).
 * Endpoint canonique : `/datasets/cee-regional-aids`.
 *
 * Pourquoi un module séparé : Next.js App Router refuse les exports
 * non-handler dans `route.ts` (DEPLOY BLOCKED). Mêmes contraintes que
 * `@/lib/seo/csv` et `@/lib/open-data/cors`. Module pur, edge-safe,
 * testable sans contrainte route handler.
 */

import { getAllCeeRegionalSpecifics } from '@/lib/cee/regional-specifics'

export const CEE_REGIONAL_DATASET_PATH = '/datasets/cee-regional-aids'
export const CEE_REGIONAL_DATASET_LICENSE = 'https://creativecommons.org/licenses/by/4.0/'

export interface CeeRegionalAidRow {
  region_slug: string
  region_name: string
  climate_zone: string
  pct_maisons_individuelles: number
  pct_construction_pre_1975: number
  aid_name: string
  aid_montant: string
  aid_detail: string
  aid_source_url: string
  last_reviewed_at: string
}

/**
 * Vue plate one-row-per-aid pour CSV / tableurs.
 * Une région sans `regionalAids` produit zéro ligne (pas de placeholder vide).
 */
export function getCeeRegionalAidsFlat(): CeeRegionalAidRow[] {
  const rows: CeeRegionalAidRow[] = []
  for (const reg of getAllCeeRegionalSpecifics()) {
    for (const aid of reg.regionalAids) {
      rows.push({
        region_slug: reg.slug,
        region_name: reg.name,
        climate_zone: reg.climateZone,
        pct_maisons_individuelles: reg.housingMix.pctMaisonsIndividuelles,
        pct_construction_pre_1975: reg.housingMix.pctConstructionPre1975,
        aid_name: aid.name,
        aid_montant: aid.montant,
        aid_detail: aid.detail,
        aid_source_url: aid.sourceUrl,
        last_reviewed_at: reg.lastReviewedAt,
      })
    }
  }
  return rows
}

/**
 * Vue hiérarchique JSON pour consommateurs API (1 entry par région avec
 * tableau d'aides). Plus naturelle pour ingestion programmatique.
 */
export interface CeeRegionalDatasetEntry {
  region_slug: string
  region_name: string
  climate_zone: string
  housing_mix: {
    pct_maisons_individuelles: number
    pct_construction_pre_1975: number
  }
  regional_aids: ReadonlyArray<{
    name: string
    montant: string
    detail: string
    source_url: string
  }>
  last_reviewed_at: string
}

export function getCeeRegionalDatasetEntries(): CeeRegionalDatasetEntry[] {
  return getAllCeeRegionalSpecifics().map((reg) => ({
    region_slug: reg.slug,
    region_name: reg.name,
    climate_zone: reg.climateZone,
    housing_mix: {
      pct_maisons_individuelles: reg.housingMix.pctMaisonsIndividuelles,
      pct_construction_pre_1975: reg.housingMix.pctConstructionPre1975,
    },
    regional_aids: reg.regionalAids.map((aid) => ({
      name: aid.name,
      montant: aid.montant,
      detail: aid.detail,
      source_url: aid.sourceUrl,
    })),
    last_reviewed_at: reg.lastReviewedAt,
  }))
}

/** Date max(lastReviewedAt) pour métadonnée Schema.org dateModified. */
export function getCeeRegionalDatasetLastReviewedAt(): string {
  const dates = getAllCeeRegionalSpecifics().map((r) => r.lastReviewedAt)
  return dates.sort().slice(-1)[0] ?? new Date().toISOString().slice(0, 10)
}
