/**
 * Dynamic lastModified computation for service×department pages.
 *
 * Queries multiple data sources in parallel and returns the most recent
 * modification date. Replaces STATIC_DATE for pSEO pages with real activity.
 *
 * Fail-open: returns null if no data or on any error.
 */

import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { IS_BUILD, SERVICE_TO_SPECIALTIES } from '@/lib/supabase'

/**
 * Safely create admin client. Returns null if env vars are missing.
 */
function safeAdminClient() {
  try {
    // Dynamic import to avoid circular dependency with supabase.ts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAdminClient } = require('@/lib/supabase/admin')
    return createAdminClient()
  } catch {
    return null
  }
}

/**
 * Compute the most recent modification date across multiple data sources
 * for a given service×department pair.
 *
 * Sources queried in parallel:
 * 1. Latest review created_at (from review_stats_by_dept materialized view)
 * 2. Latest provider updated_at for this service×department
 * 3. Latest devis_request created_at for this service×department
 *
 * Returns the MAX of all dates as ISO string, or null if no data.
 */
export async function getDynamicLastModified(
  serviceSlug: string,
  departmentCode: string
): Promise<string | null> {
  if (IS_BUILD) return null

  const cacheKey = `dynamic-lastmod:${serviceSlug}:${departmentCode}`

  return getCachedData(
    cacheKey,
    async () => {
      const supabase = safeAdminClient()
      if (!supabase) return null

      const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
      if (!specialties || specialties.length === 0) return null

      const dates: (string | null)[] = await Promise.all([
        // 1. Latest review from materialized view
        getLatestReviewDate(supabase, specialties, departmentCode),
        // 2. Latest provider updated_at
        getLatestProviderDate(supabase, specialties, departmentCode),
        // 3. Latest devis_request created_at
        getLatestDevisDate(supabase, specialties, departmentCode),
      ])

      // Find the most recent non-null date
      let maxDate: Date | null = null
      for (const d of dates) {
        if (!d) continue
        const parsed = new Date(d)
        if (Number.isNaN(parsed.getTime())) continue
        if (!maxDate || parsed > maxDate) {
          maxDate = parsed
        }
      }

      return maxDate ? maxDate.toISOString() : null
    },
    CACHE_TTL.stats,
    { skipNull: true }
  )
}

/**
 * Latest review date from the review_stats_by_dept materialized view.
 */
async function getLatestReviewDate(
  supabase: ReturnType<typeof safeAdminClient>,
  specialties: string[],
  departmentCode: string
): Promise<string | null> {
  try {
    // The materialized view groups by providers.address_department and specialty_slug.
    // Filter by both to get reviews for this specific service×department.
    const { data, error } = await supabase
      .from('review_stats_by_dept')
      .select('latest_review_at')
      .in('specialty_slug', specialties)
      .eq('address_department', departmentCode)
      .not('latest_review_at', 'is', null)
      .order('latest_review_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data.latest_review_at as string | null
  } catch {
    return null
  }
}

/**
 * Latest provider updated_at for this service×department.
 */
async function getLatestProviderDate(
  supabase: ReturnType<typeof safeAdminClient>,
  specialties: string[],
  departmentCode: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('updated_at')
      .in('specialty', specialties)
      .eq('address_department', departmentCode)
      .eq('is_active', true)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data.updated_at as string | null
  } catch {
    return null
  }
}

/**
 * Compute the most recent modification date nationally for a given service.
 *
 * Point lookup used by national-level pSEO pages (e.g. /tarifs/[service],
 * /services/[service]) that don't have a department dimension.
 *
 * Sources queried in parallel:
 * 1. MAX(providers.updated_at) for this specialty (active only)
 * 2. MAX(reviews.created_at) from review_stats_by_service materialized view, fallback to direct
 *
 * Fail-open : returns null if no data or on any error.
 */
export async function getDynamicLastModifiedByService(serviceSlug: string): Promise<string | null> {
  if (IS_BUILD) return null

  const cacheKey = `dynamic-lastmod-service:${serviceSlug}`

  return getCachedData(
    cacheKey,
    async () => {
      const supabase = safeAdminClient()
      if (!supabase) return null

      const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
      if (!specialties || specialties.length === 0) return null

      const [providerDate, reviewDate] = await Promise.all([
        getLatestProviderDateNational(supabase, specialties),
        getLatestReviewDateNational(supabase, specialties),
      ])

      let maxDate: Date | null = null
      for (const d of [providerDate, reviewDate]) {
        if (!d) continue
        const parsed = new Date(d)
        if (Number.isNaN(parsed.getTime())) continue
        if (!maxDate || parsed > maxDate) maxDate = parsed
      }
      return maxDate ? maxDate.toISOString() : null
    },
    CACHE_TTL.stats,
    { skipNull: true }
  )
}

async function getLatestProviderDateNational(
  supabase: ReturnType<typeof safeAdminClient>,
  specialties: string[]
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('updated_at')
      .in('specialty', specialties)
      .eq('is_active', true)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data.updated_at as string | null
  } catch {
    return null
  }
}

async function getLatestReviewDateNational(
  supabase: ReturnType<typeof safeAdminClient>,
  specialties: string[]
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('review_stats_by_dept')
      .select('latest_review_at')
      .in('specialty_slug', specialties)
      .not('latest_review_at', 'is', null)
      .order('latest_review_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data.latest_review_at as string | null
  } catch {
    return null
  }
}

/**
 * Latest devis_request created_at for this service×department.
 * Uses postal_code prefix to match the department.
 */
async function getLatestDevisDate(
  supabase: ReturnType<typeof safeAdminClient>,
  specialties: string[],
  departmentCode: string
): Promise<string | null> {
  try {
    const postalPrefix = `${departmentCode}%`

    // Audit V1 P1-2 : N+1 séquentiel + .single() PGRST116 spam → 1 query .or()
    // sur tous les specialties + maybeSingle pour 0 row legitime.
    const orFilter = specialties.map((s) => `service_name.ilike.${s}`).join(',')
    const { data, error } = await supabase
      .from('devis_requests')
      .select('created_at')
      .or(orFilter)
      .like('postal_code', postalPrefix)
      .not('created_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return (data.created_at as string | null) ?? null
  } catch {
    return null
  }
}
