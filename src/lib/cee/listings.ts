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
 * Filtre code RGE par opération (audit 2026-05-03 P0 #6) :
 *  - SQL : `rge_valid_until >= today` (post-1).
 *  - Post-filter JS : intersection des codes `rge_qualifications[*].code` du
 *    provider avec `operation.rge_qualifications_requises`. Si l'opération
 *    n'a PAS de codes requis listés (cas legacy / opérations généralistes),
 *    on accepte tout artisan RGE (comportement fail-open compatible avec
 *    l'historique). Si l'opération exige des codes mais que le provider n'a
 *    aucun match, on l'exclut — c'est la promesse SEO/trust : sur
 *    `/cee/[op]/[ville]` on ne liste que des artisans capables d'obtenir
 *    cette prime spécifique.
 *  - Le code RGE précis (Qualibat-7131, QualiPAC, etc.) reste affiché sur la
 *    card RGE pour transparence visiteur.
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

// Note résilience socket : les drops de socket Supabase (UND_ERR_SOCKET) sont
// gérés en amont par le `resilientFetch` global du client (@/lib/supabase) qui
// retry les transports GET/HEAD transitoires. Pas de retry par-requête ici —
// le catch fail-open ci-dessous prend le relais si le retry global échoue.

const CACHE_TTL_6H = 6 * 60 * 60

/**
 * Select léger aligné sur `PROVIDER_LIST_SELECT` interne de `lib/supabase.ts`.
 * Dupliqué ici (PROVIDER_LIST_SELECT n'est pas exporté) pour garder le shape
 * cohérent avec les autres listings publics.
 */
const PROVIDER_LIST_SELECT = [
  'id',
  'stable_id',
  'name',
  'slug',
  'specialty',
  'address_street',
  'address_postal_code',
  'address_city',
  'address_region',
  'is_verified',
  'is_active',
  'noindex',
  'rating_average',
  'review_count',
  'phone',
  'siret',
  'latitude',
  'longitude',
  'user_id',
  'created_at',
  'updated_at',
  'rge_qualifications',
  'rge_valid_until',
  'rge_organismes',
  'rge_source_url',
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
  opts: { limit?: number } = {}
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
        // Note: `rge_valid_until IS NOT NULL` ⇔ `rge_qualifications IS NOT NULL`
        // (cf. migration 380 — colonnes dénormalisées paire). On laisse tomber
        // le filtre redondant pour permettre au planner d'utiliser
        // `idx_providers_rge_active` (partial index très sélectif).
        // On rapatrie 4× la limite pour que le post-filter JS sur les codes RGE
        // requis n'épuise pas la page de résultats (10-25% des artisans RGE
        // d'une ville auront le code spécifique requis pour une opération
        // donnée).
        const { data, error } = await supabase
          .from('providers_public')
          .select(PROVIDER_LIST_SELECT)
          .in('specialty', specialties)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .gte('rge_valid_until', today)
          .order('rge_valid_until', { ascending: false })
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .order('name')
          .limit(limit * 4)

        if (error) throw error

        const requiredCodes = (operation.rge_qualifications_requises ?? []).map((c) =>
          c.toLowerCase()
        )
        type RgeQualif = { code?: string | null }
        const matchesRequired = (p: { rge_qualifications?: unknown }): boolean => {
          if (requiredCodes.length === 0) return true
          const quals = (p.rge_qualifications as RgeQualif[] | null) ?? []
          return quals.some((q) => {
            const code = q?.code?.toLowerCase?.()
            return code != null && requiredCodes.includes(code)
          })
        }

        const providers = resolveProviderCities(
          (data || []) as unknown as Array<{
            address_city?: string | null
            address_region?: string | null
          }>
        ) as unknown as Provider[]

        return providers.filter(matchesRequired).slice(0, limit)
      } catch (err) {
        logger.error(
          `[getCeeProvidersByOperationAndCity] FAILED for ${operationCode}/${villeSlug}`,
          { error: err instanceof Error ? err.message : err }
        )
        return []
      }
    },
    CACHE_TTL_6H
    // Cache aussi les `[]` (skipNull retiré) — évite la tempête de retries
    // sur 6h quand le fail-open se déclenche (timeouts, DB indispo).
  )
}

/**
 * Count léger (head query) pour décider du noindex sans rapatrier les lignes.
 * Fail-open 0.
 */
export async function getCeeProviderCountByOperationAndCity(
  operationCode: string,
  villeSlug: string
): Promise<number> {
  if (IS_BUILD) return 1 // fail-open: keep pages indexed during build

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
        // Filtre rge_qualifications redondant retiré (cf. note ci-dessus).
        const { count, error } = await supabase
          .from('providers_public')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .gte('rge_valid_until', today)

        if (error) throw error
        return count ?? 0
      } catch (err) {
        logger.error(
          `[getCeeProviderCountByOperationAndCity] FAILED for ${operationCode}/${villeSlug}`,
          { error: err instanceof Error ? err.message : err }
        )
        return 0
      }
    },
    CACHE_TTL_6H
  )
}

/**
 * CEE count strict (opération × ville) — variante pour la stratégie 410.
 *
 * Contrairement à `getCeeProviderCountByOperationAndCity` qui fail-open
 * silencieux (retourne 0 sur erreur DB), cette variante renvoie un
 * discriminant explicite : `ok=true` si le count a pu être établi, `ok=false`
 * si une erreur transitoire s'est produite.
 *
 * Usage côté page : si `ok=false` → ne pas notFound(), fallback indexable.
 *
 * Pendant le build (IS_BUILD), retourne `{ ok: true, count: 1 }` (fail-open
 * aligné avec la politique générale).
 */
export async function getCeeCountByOperationAndCityStrict(
  operationCode: string,
  villeSlug: string
): Promise<{ ok: true; count: number } | { ok: false }> {
  if (IS_BUILD) return { ok: true, count: 1 }

  const ville = getVilleBySlug(villeSlug)
  if (!ville) return { ok: true, count: 0 }

  const operation = await getCeeOperationByCode(operationCode).catch(() => null)
  if (!operation) return { ok: true, count: 0 }

  const specialties = resolveSpecialtiesForOperation(operation.services_slugs)
  if (specialties.length === 0) return { ok: true, count: 0 }

  const cityValues = getCityValues(ville.name, ville.departementCode)
  const today = new Date().toISOString().slice(0, 10)

  try {
    const { count, error } = await supabase
      .from('providers_public')
      .select('id', { count: 'exact', head: true })
      .in('specialty', specialties)
      .in('address_city', cityValues)
      .eq('is_active', true)
      .gte('rge_valid_until', today)

    if (error) throw error
    return { ok: true, count: count ?? 0 }
  } catch (err) {
    logger.warn(
      `[getCeeCountByOperationAndCityStrict] transient error for ${operationCode}/${villeSlug}`,
      { error: err instanceof Error ? err.message : err }
    )
    return { ok: false }
  }
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
export async function getCeeTopCitiesByOperation(operationCode: string): Promise<CeeTopCity[]> {
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

        // Filtre rge_qualifications redondant retiré + .order pour aiguiller
        // le planner vers `idx_providers_rge_active` (partial index sélectif).
        const { data, error } = await supabase
          .from('providers_public')
          .select('address_city')
          .in('specialty', specialties)
          .eq('is_active', true)
          .gte('rge_valid_until', today)
          .order('rge_valid_until', { ascending: false })
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
            topInseeCodes.map((t) => t.code)
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
    CACHE_TTL_6H
    // Cache aussi les `[]` (skipNull retiré) — évite la tempête de retries
    // sur 6h quand le fail-open se déclenche (timeouts, DB indispo).
  )
}
