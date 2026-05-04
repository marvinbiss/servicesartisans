/**
 * Helpers listings CEE×région — Sprint AI Wave D Ahrefs 2026-05-03.
 *
 * Compose les top villes d'une région pour une opération CEE donnée :
 * croise `getCeeTopCitiesByOperation` (data DB providers RGE actifs, top 10
 * nationwide) avec la cartographie `regions[].departments[].cities[]` de
 * france.ts pour filtrer région-only.
 *
 * Server-side only, fail-open [].
 */

import { regions } from '@/lib/data/france'
import { getCeeTopCitiesByOperation, type CeeTopCity } from '@/lib/cee/listings'

export interface CeeRegionalCityListItem {
  name: string
  slug: string
  count: number
}

/**
 * Top villes (région-filtered) pour une opération CEE.
 * Filtre les top nationwide via la liste blanche des villes de la région.
 *
 * Tradeoff : on perd les villes régionales hors-top-10 nationwide. Acceptable
 * car les pages /cee/[op]/[region] sont des hubs régionaux — l'objectif est
 * surtout de signaler la profondeur de catalogue, pas l'exhaustivité.
 */
export async function getCeeRegionalTopCities(
  operationCode: string,
  regionSlug: string,
  limit = 12
): Promise<CeeRegionalCityListItem[]> {
  const region = regions.find((r) => r.slug === regionSlug)
  if (!region) return []

  // Set des slugs villes de la région (O(1) lookup).
  const regionalSlugs = new Set<string>()
  for (const dept of region.departments) {
    for (const city of dept.cities) {
      regionalSlugs.add(city.slug)
    }
  }
  if (regionalSlugs.size === 0) return []

  const topNationwide: CeeTopCity[] = await getCeeTopCitiesByOperation(operationCode).catch(
    () => []
  )
  if (topNationwide.length === 0) return []

  return topNationwide
    .filter((c) => regionalSlugs.has(c.slug))
    .slice(0, limit)
    .map((c) => ({ name: c.name, slug: c.slug, count: c.count }))
}

/**
 * Total artisans CEE-éligibles dans la région pour une op donnée — somme
 * des counts des top villes régionales. Utilisé pour décider noindex
 * (si total === 0 → soft 404 risk → noindex page).
 */
export async function getCeeRegionalProviderTotal(
  operationCode: string,
  regionSlug: string
): Promise<number> {
  const cities = await getCeeRegionalTopCities(operationCode, regionSlug, 100)
  return cities.reduce((sum, c) => sum + c.count, 0)
}
