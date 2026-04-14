/**
 * RGE city listings — data access for `/artisans-rge/[ville]`.
 *
 * Lists ALL active RGE-certified providers in a city (all specialties combined).
 * Source: providers.rge_qualifications (JSONB) + rge_valid_until (DATE), populated
 * by the ADEME sync pipeline (migrations 380-381). Dataset: liste-des-entreprises-rge-2
 * — data.gouv.fr — Licence Etalab 2.0.
 *
 * Columns referenced (all verified in migration 380_rge_ademe_integration.sql):
 * - providers.rge_qualifications (JSONB array, nullable)
 * - providers.rge_valid_until    (DATE, nullable)
 * - providers.rge_organismes     (TEXT[], nullable)
 * - providers.rge_source_url     (TEXT, nullable)
 *
 * Index used: idx_providers_city_rge_valid ON (address_city, rge_valid_until)
 * WHERE rge_valid_until IS NOT NULL.
 */

import { supabase, IS_BUILD } from '@/lib/supabase'
import { getVilleBySlug } from '@/lib/data/france'
import { getCityValues, resolveProviderCities } from '@/lib/insee-resolver'
import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import type { Provider } from '@/types'

// Same shape as PROVIDER_LIST_SELECT in src/lib/supabase.ts. Duplicated here to avoid
// touching supabase.ts (another agent may also be editing rge-related files).
const RGE_LIST_SELECT = [
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface RgeCityListingOptions {
  limit?: number
  offset?: number
}

/**
 * Fetch all active RGE providers in a city (all specialties combined).
 * Active = rge_qualifications IS NOT NULL AND rge_valid_until >= CURRENT_DATE.
 */
export async function getRgeProvidersByCity(
  citySlug: string,
  { limit = 50, offset = 0 }: RgeCityListingOptions = {}
): Promise<Provider[]> {
  if (IS_BUILD) return []

  const ville = getVilleBySlug(citySlug)
  if (!ville) return []

  const cacheKey = `rge:city-providers:${citySlug}:${limit}:${offset}`

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const cityValues = getCityValues(ville.name, ville.departementCode)
        const today = todayIso()

        const { data, error } = await supabase
          .from('providers')
          .select(RGE_LIST_SELECT)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)
          .order('is_verified', { ascending: false })
          .order('rge_valid_until', { ascending: false, nullsFirst: false })
          .order('name')
          .range(offset, offset + limit - 1)

        if (error) throw error

        // resolveProviderCities normalises INSEE code → commune name.
        return resolveProviderCities((data || []) as unknown as Provider[])
      } catch (err) {
        logger.error(`[getRgeProvidersByCity] FAILED for ${citySlug}`, {
          error: err instanceof Error ? err.message : err,
        })
        return []
      }
    },
    CACHE_TTL.artisans, // 1h
    { skipNull: true }
  )
}

/**
 * Count of active RGE providers in a city.
 * Fail open: returns 1 during build so pages are indexed by default.
 * ISR will correct with the real count on first revalidation.
 */
export async function getRgeProviderCountByCity(citySlug: string): Promise<number> {
  if (IS_BUILD) return 1

  return getCachedData(
    `rge:city-count:${citySlug}`,
    async () => {
      try {
        const ville = getVilleBySlug(citySlug)
        if (!ville) return 0

        const cityValues = getCityValues(ville.name, ville.departementCode)
        const today = todayIso()

        const { count, error } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .in('address_city', cityValues)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (error) throw error
        return count ?? 0
      } catch (err) {
        logger.error(`[getRgeProviderCountByCity] FAILED for ${citySlug}`, {
          error: err instanceof Error ? err.message : err,
        })
        return 0
      }
    },
    CACHE_TTL.artisans
  )
}
