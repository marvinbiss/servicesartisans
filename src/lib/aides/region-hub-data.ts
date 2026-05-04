/**
 * Sprint AI Wave L 2026-05-03 — Helper data pour le hub `/aides/par-region`.
 *
 * Aggrège pour chacune des 13 régions métropolitaines couvertes par
 * `CEE_REGIONAL_SPECIFICS` (Wave D) :
 *   - métadonnées région (slug, nom, climat zone RT2012)
 *   - count + liste des aides régionales cumulables CEE/MPR
 *   - top départements indexés `/aides/[dept]` appartenant à la région
 *     (intersection avec `AIDES_INDEXED_DEPTS` Wave H — max 4 pour éviter
 *     les liens UX-noisy sur les régions massives type Île-de-France)
 *
 * Pure module : aucun I/O DB, importable côté SSR + tests.
 */

import { regions } from '@/lib/data/france'
import { getAllCeeRegionalSpecifics, type RegionalCeeSpecifics } from '@/lib/cee/regional-specifics'
import { AIDES_INDEXED_DEPTS } from '@/lib/seo/aides-dept-whitelist'
import { CEE_OPERATION_CODES, type CeeOperationCode } from '@/lib/cee/operation-codes'

const TOP_DEPT_LIMIT_PER_REGION = 4

/**
 * Op CEE mise en avant sur les cards régionales — PAC air/eau (BAR-TH-171,
 * référence post-2022) : c'est l'opération la plus volumineuse en search
 * "prime CEE [région]". Typé sur `CeeOperationCode` pour qu'un retrait
 * accidentel de la seed casse le build et pas silencieusement les 13 liens.
 */
export const REGION_HUB_FEATURED_OP_CODE: CeeOperationCode = 'bar-th-171'

// Garde-fou tooling : assertion ne devrait jamais déclencher car le type
// `CeeOperationCode` est dérivé de `CEE_OPERATION_CODES`. Mais en cas de drift
// entre code et seed DB (cf. mig 483, mig 486), on alerte côté tests.
export function isRegionHubFeaturedOpInSeed(): boolean {
  return (CEE_OPERATION_CODES as readonly string[]).includes(REGION_HUB_FEATURED_OP_CODE)
}

export interface AidesRegionHubEntry {
  slug: string
  name: string
  climateZone: RegionalCeeSpecifics['climateZone']
  climateLabel: string
  regionalAids: RegionalCeeSpecifics['regionalAids']
  housingMix: RegionalCeeSpecifics['housingMix']
  lastReviewedAt: string
  /**
   * Top départements indexés `/aides/[dept]` qui appartiennent à la région.
   * Intersection AIDES_INDEXED_DEPTS ∩ regions.departments, max 4.
   * Ordre stable : ordre déclaratif `france.ts` (ne dépend pas de la pop INSEE).
   */
  topIndexedDepts: ReadonlyArray<{ slug: string; name: string; code: string }>
}

/**
 * Retourne la liste complète des entrées hub par région (13 régions
 * métropolitaines, outre-mer exclu — cohérence avec CEE_REGIONAL_SLUGS).
 * Ordre = ordre déclaratif `getAllCeeRegionalSpecifics`.
 */
export function getAidesRegionHubEntries(): AidesRegionHubEntry[] {
  return getAllCeeRegionalSpecifics().map((reg) => {
    const regionMeta = regions.find((r) => r.slug === reg.slug)
    const allDepts = regionMeta?.departments ?? []
    const indexed = allDepts
      .filter((d) => AIDES_INDEXED_DEPTS.has(d.slug))
      .slice(0, TOP_DEPT_LIMIT_PER_REGION)
      .map((d) => ({ slug: d.slug, name: d.name, code: d.code }))
    return {
      slug: reg.slug,
      name: reg.name,
      climateZone: reg.climateZone,
      climateLabel: reg.climateLabel,
      regionalAids: reg.regionalAids,
      housingMix: reg.housingMix,
      lastReviewedAt: reg.lastReviewedAt,
      topIndexedDepts: indexed,
    }
  })
}

/** Date max(lastReviewedAt) sur l'ensemble des régions, pour Schema dateModified. */
export function getAidesRegionHubLastReviewedAt(): string {
  const dates = getAidesRegionHubEntries().map((e) => e.lastReviewedAt)
  return dates.sort().slice(-1)[0] ?? new Date().toISOString().slice(0, 10)
}

/** Total des aides régionales recensées (utile pour EnBrefBox / metadata). */
export function getAidesRegionHubTotalRegionalAids(): number {
  return getAidesRegionHubEntries().reduce((acc, e) => acc + e.regionalAids.length, 0)
}
