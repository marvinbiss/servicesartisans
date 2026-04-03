/**
 * Lastmod queries for sitemap generation.
 *
 * Fetches real last-modified dates from the database instead of using BUILD_DATE.
 * All queries are batched and efficient (no N+1).
 *
 * Google December 2025 update PENALIZES false freshness signals.
 * Rule: if no reliable data, OMIT lastmod entirely (return undefined).
 *
 * Tables used:
 *   - providers: updated_at, address_city, address_department, address_region, specialty, is_active
 *   - reviews: created_at, artisan_id (→ profiles.id → providers.user_id)
 */

import { createAdminClient } from '@/lib/supabase/admin'

// ─── Types ──────────────────────────────────────────────────────────────

/** Map of slug → ISO date string (YYYY-MM-DD) */
export type LastmodMap = Map<string, string>

// ─── Helpers ────────────────────────────────────────────────────────────

function toDateStr(d: string | null | undefined): string | undefined {
  if (!d) return undefined
  try {
    return new Date(d).toISOString().split('T')[0]
  } catch {
    return undefined
  }
}

/**
 * Normalize a string for use as a Map key.
 * Must match the normalizeName() in src/app/sitemap.ts:
 * strip diacritics via NFD decomposition, then lowercase + trim.
 */
function normalizeKey(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Safely create admin client. Returns null if env vars are missing
 * (e.g., during local dev build without Supabase credentials).
 */
function safeAdminClient() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// ─── Query: Latest provider updated_at per city (address_city) ──────────

/**
 * Returns a Map<normalizedCityName, YYYY-MM-DD> with the most recent
 * provider updated_at for each city that has at least one active provider.
 *
 * Uses a single query with GROUP BY via Supabase RPC or a raw approach.
 * Since Supabase JS client doesn't support GROUP BY natively, we use
 * a pragmatic approach: fetch the single most recent provider per city
 * by ordering and limiting smartly.
 *
 * Actually, the most efficient approach for sitemap is:
 * Fetch ALL distinct (address_city, max(updated_at)) in one query via RPC.
 * But since we can't create RPC functions at build time, we'll fetch
 * the latest N providers ordered by updated_at DESC and build the map.
 */
export async function getLastmodByCity(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    // Fetch the 10,000 most recently updated providers.
    // This covers the vast majority of cities with recent activity.
    // Cities not in this set = no recent activity = no lastmod (honest).
    const { data, error } = await supabase
      .from('providers')
      .select('address_city, updated_at')
      .eq('is_active', true)
      .not('address_city', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000)

    if (error || !data) return map

    for (const row of data) {
      const city = row.address_city ? normalizeKey(row.address_city) : null
      if (!city) continue
      // First occurrence = most recent (ordered DESC)
      if (!map.has(city)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(city, d)
      }
    }
  } catch {
    // Fail silently — no lastmod is better than crashing the build
  }

  return map
}

// ─── Query: Latest provider updated_at per department ───────────────────

export async function getLastmodByDepartment(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('address_department, updated_at')
      .eq('is_active', true)
      .not('address_department', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (error || !data) return map

    for (const row of data) {
      const dept = row.address_department ? normalizeKey(row.address_department) : null
      if (!dept) continue
      if (!map.has(dept)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(dept, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Query: Latest provider updated_at per region ───────────────────────

export async function getLastmodByRegion(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('address_region, updated_at')
      .eq('is_active', true)
      .not('address_region', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(2000)

    if (error || !data) return map

    for (const row of data) {
      const region = row.address_region ? normalizeKey(row.address_region) : null
      if (!region) continue
      if (!map.has(region)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(region, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Query: Latest provider updated_at per specialty (service) ──────────

export async function getLastmodByService(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('specialty, updated_at')
      .eq('is_active', true)
      .not('specialty', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(2000)

    if (error || !data) return map

    for (const row of data) {
      const svc = row.specialty ? normalizeKey(row.specialty) : null
      if (!svc) continue
      if (!map.has(svc)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(svc, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Query: Latest provider per (department, specialty) ─────────────────

export async function getLastmodByDeptService(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    // Fetch recent providers with both department and specialty
    const { data, error } = await supabase
      .from('providers')
      .select('address_department, specialty, updated_at')
      .eq('is_active', true)
      .not('address_department', 'is', null)
      .not('specialty', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000)

    if (error || !data) return map

    for (const row of data) {
      const dept = row.address_department ? normalizeKey(row.address_department) : null
      const svc = row.specialty ? normalizeKey(row.specialty) : null
      if (!dept || !svc) continue
      const key = `${dept}::${svc}`
      if (!map.has(key)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(key, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Query: Latest provider per (region, specialty) ─────────────────────

export async function getLastmodByRegionService(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('address_region, specialty, updated_at')
      .eq('is_active', true)
      .not('address_region', 'is', null)
      .not('specialty', 'is', null)
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (error || !data) return map

    for (const row of data) {
      const region = row.address_region ? normalizeKey(row.address_region) : null
      const svc = row.specialty ? normalizeKey(row.specialty) : null
      if (!region || !svc) continue
      const key = `${region}::${svc}`
      if (!map.has(key)) {
        const d = toDateStr(row.updated_at)
        if (d) map.set(key, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Query: Latest review per service (nationally) ──────────────────────

export async function getLastReviewByService(): Promise<LastmodMap> {
  const map: LastmodMap = new Map()
  const supabase = safeAdminClient()
  if (!supabase) return map

  try {
    // Reviews are linked to artisan_id (profiles.id).
    // We need providers.specialty via providers.user_id = reviews.artisan_id.
    // Use a join: reviews + profiles → get provider specialty.
    // Actually reviews.artisan_id → profiles.id, and providers.user_id → profiles.id
    // So we need: reviews JOIN providers ON providers.user_id = reviews.artisan_id
    // Supabase JS doesn't support arbitrary joins, so we do two queries.

    // Step 1: Get recent reviews with artisan_id
    const { data: reviews, error: revErr } = await supabase
      .from('reviews')
      .select('artisan_id, created_at')
      .eq('status', 'published')
      .not('artisan_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(2000)

    if (revErr || !reviews || reviews.length === 0) return map

    // Step 2: Get provider specialties for these artisan_ids
    const artisanIds = Array.from(new Set(reviews.map(r => r.artisan_id)))
    const { data: providers, error: provErr } = await supabase
      .from('providers')
      .select('user_id, specialty')
      .in('user_id', artisanIds)

    if (provErr || !providers) return map

    const specialtyByUserId = new Map<string, string>()
    for (const p of providers) {
      if (p.user_id && p.specialty) {
        specialtyByUserId.set(p.user_id, normalizeKey(p.specialty))
      }
    }

    for (const r of reviews) {
      const svc = specialtyByUserId.get(r.artisan_id)
      if (!svc) continue
      if (!map.has(svc)) {
        const d = toDateStr(r.created_at)
        if (d) map.set(svc, d)
      }
    }
  } catch {
    // Fail silently
  }

  return map
}

// ─── Aggregated fetch: all lastmod data in parallel ─────────────────────

export interface SitemapLastmodData {
  byCity: LastmodMap
  byDepartment: LastmodMap
  byRegion: LastmodMap
  byService: LastmodMap
  byDeptService: LastmodMap
  byRegionService: LastmodMap
  reviewByService: LastmodMap
}

/**
 * Fetch all lastmod data in parallel. Call once at the start of sitemap generation.
 * If Supabase is unavailable, all maps will be empty (= no lastmod = honest).
 */
export async function fetchAllLastmodData(): Promise<SitemapLastmodData> {
  const [
    byCity,
    byDepartment,
    byRegion,
    byService,
    byDeptService,
    byRegionService,
    reviewByService,
  ] = await Promise.all([
    getLastmodByCity(),
    getLastmodByDepartment(),
    getLastmodByRegion(),
    getLastmodByService(),
    getLastmodByDeptService(),
    getLastmodByRegionService(),
    getLastReviewByService(),
  ])

  return { byCity, byDepartment, byRegion, byService, byDeptService, byRegionService, reviewByService }
}
