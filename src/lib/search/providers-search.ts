/**
 * Recherche d'artisans par nom (RPC search_providers_by_name, migration 477).
 *
 * Used by :
 *   - GET /api/search/providers (autocomplete UI)
 *   - /recherche/artisans?q=... page (server-side render)
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type ProviderSearchResult = {
  id: string
  name: string
  slug: string
  stable_id: string | null
  specialty: string | null
  address_city: string | null
  address_region: string | null
  is_verified: boolean
  claimed_at: string | null
  rge_qualifications: unknown // jsonb array, parsed côté consumer via Array.isArray
  rating_average: number | null
  review_count: number | null
  rank: number
}

const MAX_LIMIT = 50
const MIN_QUERY_LENGTH = 2

export type SearchProvidersOptions = {
  query: string
  limit?: number
  offset?: number
}

export async function searchProvidersByName({
  query,
  limit = 20,
  offset = 0,
}: SearchProvidersOptions): Promise<{
  results: ProviderSearchResult[]
  truncatedQuery: string
}> {
  const truncatedQuery = (query ?? '').trim().slice(0, 100)
  if (truncatedQuery.length < MIN_QUERY_LENGTH) {
    return { results: [], truncatedQuery }
  }

  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT)
  const safeOffset = Math.max(offset, 0)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('search_providers_by_name', {
      p_query: truncatedQuery,
      p_limit: safeLimit,
      p_offset: safeOffset,
    })

    if (error) {
      logger.error('[providers-search] RPC error', {
        error: error.message,
        code: error.code,
        query: truncatedQuery,
      })
      return { results: [], truncatedQuery }
    }

    return {
      results: (data ?? []) as ProviderSearchResult[],
      truncatedQuery,
    }
  } catch (err) {
    logger.error('[providers-search] unexpected error', {
      error: err instanceof Error ? err.message : String(err),
      query: truncatedQuery,
    })
    return { results: [], truncatedQuery }
  }
}
