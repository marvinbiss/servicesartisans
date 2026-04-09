/**
 * CEE listings — providers qualifiés par opération CEE × ville.
 *
 * Filtrage :
 *  - Opération ≠ null & active
 *  - Provider spécialisé dans l'un des `services_slugs` de l'opération
 *    (via SERVICE_TO_SPECIALTIES comme le pipeline RGE)
 *  - Provider avec qualification RGE active (`rge_qualifications` non null
 *    ET `rge_valid_until >= today`) — condition non-négociable pour CEE
 *  - Provider localisé dans la ville (INSEE / nom via `getCityValues`)
 *  - Provider `is_active = TRUE`
 *
 * On NE filtre PAS côté SQL sur le croisement `rge_qualifications[*].code ∈
 * rge_qualifications_requises` : l'attribut est un JSONB dans providers et
 * supabase-js ne permet pas de match précis sans RPC dédiée. En pratique :
 *  - Tous les artisans renvoyés sont déjà RGE actifs.
 *  - Le code RGE précis (Qualibat-7131, QualiPAC, etc.) est affiché sur la
 *    card RGE, le visiteur voit immédiatement si le match est parfait.
 *
 * Cache 6h, fail-open strict (IS_BUILD ou erreur → liste vide / 0).
 */

import { supabase, IS_BUILD, SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getVilleBySlug } from '@/lib/data/france'
import { getCityValues, resolveProviderCities } from '@/lib/insee-resolver'
import { getCachedData } from '@/lib/cache'
import { logger } from '@/lib/logger'
import type { Provider } from '@/types'
import { getCeeOperationByCode } from '@/lib/cee/catalogue'

const CACHE_TTL_6H = 6 * 60 * 60

/**
 * Select léger aligné sur `PROVIDER_LIST_SELECT` interne de `lib/supabase.ts`.
 * Dupliqué ici (PROVIDER_LIST_SELECT n'est pas exporté) pour garder le shape
 * cohérent avec les autres listings publics.
 */
const PROVIDER_LIST_SELECT = [
  'id', 'stable_id', 'name', 'slug', 'specialty',
  'address_street', 'address_postal_code', 'address_city', 'address_region',
  'is_verified', 'is_active', 'noindex',
  'rating_average', 'review_count',
  'phone', 'siret',
  'latitude', 'longitude',
  'user_id',
  'created_at', 'updated_at',
  'rge_qualifications', 'rge_valid_until', 'rge_organismes', 'rge_source_url',
].join(',')

/**
 * Résout les specialties DB candidates pour une opération CEE :
 * pour chaque `services_slugs` de l'opération, on récupère le mapping
 * SERVICE_TO_SPECIALTIES et on déduplique.
 */
function resolveSpecialtiesForOperation(servicesSlugs: string[]): string[] {
  const set = new Set<string>()
  for (const slug of servicesSlugs) {
    const mapped = SERVICE_TO_SPECIALTIES[slug]
    if (mapped && mapped.length > 0) {
      for (const s of mapped) set.add(s)
    } else {
      // Fallback identity — certains slugs SA matchent directement le nom
      // de la specialty DB (cas des 46 métiers déjà canoniques).
      set.add(slug)
    }
  }
  return Array.from(set)
}

/**
 * Retourne les artisans RGE actifs d'une ville qualifiés pour une opération CEE.
 * Fail-open [].
 */
export async function getCeeProvidersByOperationAndCity(
  operationCode: string,
  villeSlug: string,
  opts: { limit?: number } = {},
): Promise<Provider[]> {
  if (IS_BUILD) return []
  const limit = opts.limit ?? 50

  const ville = getVilleBySlug(villeSlug)
  if (!ville) return []

  const operation = await getCeeOperationByCode(operationCode)
  if (!operation) return []

  const specialties = resolveSpecialtiesForOperation(operation.services_slugs)
  if (specialties.length === 0) return []

  const cityValues = getCityValues(ville.name, ville.departementCode)
  const today = new Date().toISOString().slice(0, 10)

  const cacheKey = `cee:listing:${operationCode}:${villeSlug}:${limit}:v1`

  return getCachedData<Provider[]>(
    cacheKey,
    async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select(PROVIDER_LIST_SELECT)
          .in('specialty', specialties)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .order('name')
          .limit(limit)

        if (error) throw error

        const providers = resolveProviderCities(
          (data || []) as unknown as Array<{
            address_city?: string | null
            address_region?: string | null
          }>,
        ) as unknown as Provider[]

        return providers
      } catch (err) {
        logger.error(
          `[getCeeProvidersByOperationAndCity] FAILED for ${operationCode}/${villeSlug}`,
          { error: err instanceof Error ? err.message : err },
        )
        return []
      }
    },
    CACHE_TTL_6H,
    { skipNull: true },
  )
}

/**
 * Count léger (head query) pour décider du noindex sans rapatrier les lignes.
 * Fail-open 0.
 */
export async function getCeeProviderCountByOperationAndCity(
  operationCode: string,
  villeSlug: string,
): Promise<number> {
  if (IS_BUILD) return 0

  const ville = getVilleBySlug(villeSlug)
  if (!ville) return 0

  const operation = await getCeeOperationByCode(operationCode)
  if (!operation) return 0

  const specialties = resolveSpecialtiesForOperation(operation.services_slugs)
  if (specialties.length === 0) return 0

  const cityValues = getCityValues(ville.name, ville.departementCode)
  const today = new Date().toISOString().slice(0, 10)

  const cacheKey = `cee:count:${operationCode}:${villeSlug}:v1`

  return getCachedData<number>(
    cacheKey,
    async () => {
      try {
        const { count, error } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (error) throw error
        return count ?? 0
      } catch (err) {
        logger.error(
          `[getCeeProviderCountByOperationAndCity] FAILED for ${operationCode}/${villeSlug}`,
          { error: err instanceof Error ? err.message : err },
        )
        return 0
      }
    },
    CACHE_TTL_6H,
  )
}

export interface CeeTopCity {
  slug: string
  name: string
  count: number
}

/**
 * Top villes pour une opération donnée — agrégation JS sur sample 500, même
 * pattern que `getRgeServiceStats`. Cache 6h, fail-open [].
 */
export async function getCeeTopCitiesByOperation(
  operationCode: string,
): Promise<CeeTopCity[]> {
  if (IS_BUILD) return []

  const operation = await getCeeOperationByCode(operationCode)
  if (!operation) return []

  const specialties = resolveSpecialtiesForOperation(operation.services_slugs)
  if (specialties.length === 0) return []

  return getCachedData<CeeTopCity[]>(
    `cee:top-cities:${operationCode}:v1`,
    async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)

        const { data, error } = await supabase
          .from('providers')
          .select('address_city')
          .in('specialty', specialties)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)
          .limit(500)

        if (error) throw error

        const counts = new Map<string, number>()
        for (const row of data || []) {
          const inseeCode = (row as { address_city?: string | null }).address_city
          if (!inseeCode || !/^\d{5}$/.test(inseeCode)) continue
          counts.set(inseeCode, (counts.get(inseeCode) || 0) + 1)
        }

        const topInseeCodes = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([code, cnt]) => ({ code, cnt }))

        if (topInseeCodes.length === 0) return []

        const { data: communeRows, error: communeErr } = await supabase
          .from('communes')
          .select('code_insee,slug,name')
          .in(
            'code_insee',
            topInseeCodes.map((t) => t.code),
          )
          .eq('is_active', true)

        if (communeErr) throw communeErr

        const inseeToCommune = new Map<string, { slug: string; name: string }>()
        for (const row of communeRows || []) {
          const code = (row as { code_insee?: string | null }).code_insee
          const slug = (row as { slug?: string | null }).slug
          const name = (row as { name?: string | null }).name
          if (code && slug && name) {
            inseeToCommune.set(code, { slug, name })
          }
        }

        const topCities: CeeTopCity[] = topInseeCodes
          .map(({ code, cnt }) => {
            const commune = inseeToCommune.get(code)
            if (!commune) return null
            return { slug: commune.slug, name: commune.name, count: cnt }
          })
          .filter((c): c is CeeTopCity => c !== null)
          .slice(0, 10)

        return topCities
      } catch (err) {
        logger.error(`[getCeeTopCitiesByOperation] FAILED for ${operationCode}`, {
          error: err instanceof Error ? err.message : err,
        })
        return []
      }
    },
    CACHE_TTL_6H,
    { skipNull: true },
  )
}
