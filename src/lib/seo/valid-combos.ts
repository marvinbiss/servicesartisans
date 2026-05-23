/**
 * Valid combos service × ville (RGE-aware) — single source of truth.
 *
 * Pourquoi : depuis le pivot full RGE 2026-05-05, beaucoup de combos
 * service × ville n'ont aucun artisan RGE certifié. Les hubs SEO listaient
 * des combos depuis `villes.slice(0, X)` sans filtre → ~85K liens cassés
 * en circulation, soft-404 sur ~30-40K combos sitemap-émis.
 *
 * Architecture : single source of truth via mat-view `mv_provider_counts`
 * (mig 312 + 516). Cron `refresh_artisan_stats()` la rafraîchit. Ce helper
 * lit la MV avec cache `getCachedData` 1h. Le sitemap, le middleware Edge,
 * les hubs UI consomment le même set → drift impossible.
 *
 * Cas d'usage typique :
 *   const validCitySlugs = await getValidCitySlugsForService('plombier')
 *   // → ['paris', 'lyon', 'marseille', ...] (uniquement les villes avec
 *   //   au moins 1 plombier RGE certifié actif)
 *
 *   if (await isComboValid('plombier', 'marseille')) { ... }
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { villes } from '@/lib/data/france'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { cityValueToName, getCityValues } from '@/lib/insee-resolver'
import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { withTimeout } from '@/lib/api/timeout'

/**
 * Ville name (DB `address_city`) → ville slug (URL). Mémoïsé module-scope.
 * `address_city` peut avoir des variations de casse — on normalise via lower().
 */
let _nameToSlugCache: Map<string, string> | null = null
function getCityNameToSlugMap(): Map<string, string> {
  if (_nameToSlugCache) return _nameToSlugCache
  const map = new Map<string, string>()
  for (const v of villes) {
    map.set(v.name.toLowerCase(), v.slug)
  }
  _nameToSlugCache = map
  return map
}

/**
 * `mv_provider_counts.city` holds an INSEE code for ~91% of rows (e.g. "69123",
 * arrondissement "75110") and a plain name for the rest. Resolve either form to
 * a known ville slug, or undefined if it maps to no first-class ville.
 * Without the INSEE step, name-only mapping dropped ~91% of rows → empty hubs.
 */
function resolveCityRowToSlug(
  rowCity: string | null | undefined,
  nameToSlug: Map<string, string>
): string | undefined {
  const name = cityValueToName(rowCity)
  if (!name) return undefined
  return nameToSlug.get(name.toLowerCase().trim())
}

/**
 * Retourne les slugs de villes ayant ≥ 1 artisan RGE pour ce service.
 * Trié par count décroissant (les plus peuplées d'abord).
 */
export async function getValidCitySlugsForService(
  serviceSlug: string,
  options: { limit?: number; minCount?: number } = {}
): Promise<string[]> {
  const { limit = 100, minCount = 1 } = options
  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return []

  const cacheKey = `valid-combos:svc:${serviceSlug}:${limit}:${minCount}`

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const supabase = createAdminClient()
        const { data, error } = await withTimeout(
          supabase
            .from('mv_provider_counts')
            .select('city, rge_provider_count')
            .in('specialty', specialties)
            .gte('rge_provider_count', minCount)
            .order('rge_provider_count', { ascending: false })
            .limit(limit * 3), // surchunk pour absorber les doublons name→slug
          5_000,
          `valid_combos:${serviceSlug}`
        )

        if (error) {
          logger.error('valid-combos: mv_provider_counts query error', {
            error: String(error.message),
            service: serviceSlug,
          })
          captureError(error, { tags: { source: 'valid-combos.byService' } })
          return []
        }

        const nameToSlug = getCityNameToSlugMap()
        const seen = new Set<string>()
        const slugs: string[] = []

        for (const row of data ?? []) {
          const slug = resolveCityRowToSlug(row.city, nameToSlug)
          if (!slug || seen.has(slug)) continue
          seen.add(slug)
          slugs.push(slug)
          if (slugs.length >= limit) break
        }

        return slugs
      } catch (err) {
        logger.error('valid-combos: timeout or fetch failed', {
          error: String(err),
          service: serviceSlug,
        })
        captureError(err, { tags: { source: 'valid-combos.byService' } })
        return []
      }
    },
    CACHE_TTL.artisans // 3600s (1h)
  )
}

export interface CityWithCount {
  slug: string
  cityName: string
  count: number
}

/**
 * Like getValidCitySlugsForService but also returns the RGE provider count
 * per city. Used by the service pillar page to render count badges on the
 * "Top villes" block — strong social proof + freshness signal vs a flat
 * keyword list.
 *
 * Same MV-backed source, same 1h cache, so calling both helpers in the same
 * page does not double-fetch.
 */
export async function getValidCityCountsForService(
  serviceSlug: string,
  options: { limit?: number; minCount?: number } = {}
): Promise<CityWithCount[]> {
  const { limit = 12, minCount = 1 } = options
  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return []

  const cacheKey = `valid-combos:svc-counts:${serviceSlug}:${limit}:${minCount}`

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const supabase = createAdminClient()
        const { data, error } = await withTimeout(
          supabase
            .from('mv_provider_counts')
            .select('city, rge_provider_count')
            .in('specialty', specialties)
            .gte('rge_provider_count', minCount)
            .order('rge_provider_count', { ascending: false })
            // surchunk : une grande ville est éclatée en N codes INSEE
            // d'arrondissement (Paris ×20, Marseille ×16, Lyon ×9) qu'on
            // ré-agrège ensuite par slug — il faut fetch assez large.
            .limit(Math.max(limit * 6, 60)),
          5_000,
          `valid_combo_counts:${serviceSlug}`
        )

        if (error) {
          logger.error('valid-combos: counts query error', {
            error: String(error.message),
            service: serviceSlug,
          })
          captureError(error, { tags: { source: 'valid-combos.countsByService' } })
          return []
        }

        const nameToSlug = getCityNameToSlugMap()
        const bySlug = new Map<string, CityWithCount>()

        for (const row of data ?? []) {
          const name = cityValueToName(row.city)
          if (!name) continue
          const slug = nameToSlug.get(name.toLowerCase().trim())
          if (!slug) continue
          const count = row.rge_provider_count ?? 0
          const existing = bySlug.get(slug)
          if (existing) existing.count += count
          else bySlug.set(slug, { slug, cityName: name, count })
        }

        return Array.from(bySlug.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
      } catch (err) {
        logger.error('valid-combos: counts timeout', {
          error: String(err),
          service: serviceSlug,
        })
        captureError(err, { tags: { source: 'valid-combos.countsByService' } })
        return []
      }
    },
    CACHE_TTL.artisans
  )
}

/**
 * Vérifie qu'un combo précis (service × ville) a au moins 1 artisan RGE.
 * Mocking-friendly : retourne true si la query échoue (fail-open) — on
 * préfère afficher un combo qui sera notFound() côté page que masquer un
 * combo valide à cause d'un timeout DB transient.
 */
export async function isComboValid(serviceSlug: string, citySlug: string): Promise<boolean> {
  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return false
  const ville = villes.find((v) => v.slug === citySlug)
  if (!ville) return false

  const cacheKey = `valid-combos:check:${serviceSlug}:${citySlug}`

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const supabase = createAdminClient()
        const { data, error } = await withTimeout(
          supabase
            .from('mv_provider_counts')
            .select('rge_provider_count')
            // `city` = code INSEE pour ~91% des lignes : matcher le nom seul
            // ratait la quasi-totalité des combos. getCityValues couvre nom +
            // codes INSEE (dont arrondissements).
            .in('specialty', specialties)
            .in('city', getCityValues(ville.name, ville.departementCode))
            .gte('rge_provider_count', 1)
            .limit(1),
          3_000,
          `valid_combo_check:${serviceSlug}:${citySlug}`
        )
        if (error) return true // fail-open
        return (data?.length ?? 0) > 0
      } catch {
        return true // fail-open
      }
    },
    CACHE_TTL.artisans
  )
}

/**
 * Liste TOUS les combos valides (tous services × toutes villes) — utilisé
 * uniquement par le sitemap et le build script qui dump le JSON edge.
 * Pas de cache : retourne ~5K-15K rows, à n'appeler qu'au build/sitemap.
 */
export async function getAllValidCombos(
  options: { minCount?: number } = {}
): Promise<Array<{ specialty: string; cityName: string; rgeCount: number }>> {
  const { minCount = 1 } = options
  try {
    const supabase = createAdminClient()
    const { data, error } = await withTimeout(
      supabase
        .from('mv_provider_counts')
        .select('specialty, city, rge_provider_count')
        .gte('rge_provider_count', minCount)
        .order('rge_provider_count', { ascending: false })
        .limit(50_000),
      30_000,
      'valid_combos_all'
    )
    if (error) {
      logger.error('valid-combos: getAllValidCombos error', { error: String(error.message) })
      captureError(error, { tags: { source: 'valid-combos.all' } })
      return []
    }
    return (data ?? []).map((r) => ({
      specialty: r.specialty,
      cityName: r.city,
      rgeCount: r.rge_provider_count,
    }))
  } catch (err) {
    logger.error('valid-combos: getAllValidCombos timeout', { error: String(err) })
    captureError(err, { tags: { source: 'valid-combos.all' } })
    return []
  }
}
