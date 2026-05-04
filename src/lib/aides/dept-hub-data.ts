/**
 * Sprint AI Wave H 2026-05-03 — Helper data pour les hubs `/aides/[dept]`.
 *
 * Aggrège pour un département donné :
 *   - métadonnées dept (nom, code, région, climat zone RT2012)
 *   - aides nationales pertinentes (le catalogue complet, ordonné)
 *   - aides régionales applicables (via mapping région → CEE_REGIONAL_SPECIFICS Wave D)
 *
 * Pure module : aucun I/O DB, importable côté SSR + tests.
 */

import { aidesCatalog, type Aide } from '@/lib/aides/aides-catalog'
import {
  CLIMATE_ZONE_IMPACT,
  CLIMATE_ZONE_LABELS,
  deptToClimateZone,
} from '@/lib/aides/climate-zones'
import { AIDES_INDEXED_DEPTS, AIDES_INDEXED_SLUGS } from '@/lib/seo/aides-dept-whitelist'
import { getDepartementBySlug } from '@/lib/data/france'
import { getCeeRegionalSpecifics } from '@/lib/cee/regional-specifics'
import { getRegionSlugByName } from '@/lib/data/france'

export interface AidesDeptHubData {
  dept: {
    slug: string
    name: string
    code: string
    region: string
    regionSlug: string | null
    chefLieu: string
  }
  climate: {
    zone: 'H1' | 'H2' | 'H3'
    label: string
    impact: string
  }
  /** Toutes les aides nationales (12), ordonnées par volume estimé desc. */
  nationalAides: ReadonlyArray<Aide>
  /** Sous-ensemble des aides indexées au niveau dept (cf. whitelist). */
  deptIndexedAides: ReadonlyArray<Aide>
  /** Aides régionales depuis CEE_REGIONAL_SPECIFICS, vide si region non couverte. */
  regionalAids: ReadonlyArray<{
    name: string
    montant: string
    detail: string
    sourceUrl: string
  }>
}

/**
 * Test si un slug correspond à un dept hub aides indexable.
 * Utilisé par `/aides/[slug]/page.tsx` pour discriminer aide vs dept.
 */
export function isAidesDeptHubSlug(slug: string): boolean {
  return AIDES_INDEXED_DEPTS.has(slug)
}

/** Liste tous les slugs de depts hubs aides (pour generateStaticParams). */
export function getAllAidesDeptHubSlugs(): string[] {
  // Array.from car ReadonlySet n'est pas iterable sans `--downlevelIteration`
  // (cible TypeScript du projet).
  return Array.from(AIDES_INDEXED_DEPTS)
}

export function getAidesDeptHubData(deptSlug: string): AidesDeptHubData | null {
  if (!isAidesDeptHubSlug(deptSlug)) return null
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return null

  const zone = deptToClimateZone(dept.code)
  const regionSlug = getRegionSlugByName(dept.region) ?? null

  // Aides nationales : tout le catalogue, trié par volume search descendant
  // (les plus rentables en haut). Cumulables transversalement → ordre stable
  // utile aux signaux PageRank descendants.
  const nationalAides = [...aidesCatalog].sort((a, b) => b.estimatedVolume - a.estimatedVolume)

  // Sous-ensemble des aides à fort intent dept (indexées sitemap).
  const deptIndexedAides = nationalAides.filter((a) => AIDES_INDEXED_SLUGS.has(a.slug))

  // Aides régionales : si la région du dept matche un slug CEE_REGIONAL_SLUGS Wave D.
  const regionalAids = regionSlug
    ? (getCeeRegionalSpecifics(regionSlug)?.regionalAids ?? []).map((a) => ({
        name: a.name,
        montant: a.montant,
        detail: a.detail,
        sourceUrl: a.sourceUrl,
      }))
    : []

  return {
    dept: {
      slug: deptSlug,
      name: dept.name,
      code: dept.code,
      region: dept.region,
      regionSlug,
      chefLieu: dept.chefLieu,
    },
    climate: {
      zone,
      label: CLIMATE_ZONE_LABELS[zone],
      impact: CLIMATE_ZONE_IMPACT[zone],
    },
    nationalAides,
    deptIndexedAides,
    regionalAids,
  }
}
