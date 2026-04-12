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
 *   - reviews: created_at, provider_id (→ providers.id)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { villes } from '@/lib/data/france'

// ─── Types ──────────────────────────────────────────────────────────────

/** Map of slug → ISO date string (YYYY-MM-DD) */
export type LastmodMap = Map<string, string>

/** Set of `${serviceSlug}::${villeSlug}` combos that have ≥1 qualified provider */
export type QualifiedCombos = Set<string>

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
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
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
    // reviews.provider_id → providers.id directly.

    // Step 1: Get recent reviews with provider_id
    const { data: reviews, error: revErr } = await supabase
      .from('reviews')
      .select('provider_id, created_at')
      .eq('status', 'published')
      .not('provider_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(2000)

    if (revErr || !reviews || reviews.length === 0) return map

    // Step 2: Get provider specialties for these provider ids
    const providerIds = Array.from(new Set(reviews.map((r) => r.provider_id)))
    const { data: providers, error: provErr } = await supabase
      .from('providers')
      .select('id, specialty')
      .in('id', providerIds)

    if (provErr || !providers) return map

    const specialtyById = new Map<string, string>()
    for (const p of providers) {
      if (p.id && p.specialty) {
        specialtyById.set(p.id, normalizeKey(p.specialty))
      }
    }

    for (const r of reviews) {
      const svc = specialtyById.get(r.provider_id)
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

// ─── Query: Qualified service×ville combos for sitemap pruning ──────────

/**
 * Returns a Set<`${serviceSlug}::${villeSlug}`> of combos that have at least
 * one active, indexable provider in the DB. Used by sitemap.ts to prune
 * thin pSEO pages (devis/urgence/tarifs/avis × ville) that have no matching
 * artisan — these pages trigger HCU signals when crawled at scale with zero
 * unique content.
 *
 * Fail-open: returns `null` if the query fails. Callers must treat `null`
 * as "include everything" to avoid accidental mass pruning on DB blips.
 */
export async function getQualifiedServiceCityCombos(): Promise<QualifiedCombos | null> {
  const supabase = safeAdminClient()
  if (!supabase) return null

  // Reverse lookup: DB specialty string → service slug used in URLs.
  const specialtyToService = new Map<string, string>()
  for (const [serviceSlug, specialties] of Object.entries(SERVICE_TO_SPECIALTIES)) {
    for (const sp of specialties) {
      // First writer wins — prefer direct match (e.g. 'plombier'→'plombier')
      // over aliases (e.g. 'peintre'→'peintre-en-batiment').
      if (!specialtyToService.has(sp)) {
        specialtyToService.set(sp, serviceSlug)
      }
    }
  }

  // City name → ville slug. Normalized for diacritic-free matching.
  const cityToSlug = new Map<string, string>()
  for (const v of villes) {
    cityToSlug.set(normalizeKey(v.name), v.slug)
  }

  try {
    const combos: QualifiedCombos = new Set()
    const pageSize = 1000
    let from = 0
    // Hard cap to avoid runaway build time. 38k active providers today,
    // headroom to 200k before this becomes an issue.
    const maxRows = 200_000

    while (from < maxRows) {
      const { data, error } = await supabase
        .from('providers')
        .select('specialty, address_city')
        .eq('is_active', true)
        .eq('noindex', false)
        .not('specialty', 'is', null)
        .not('address_city', 'is', null)
        .range(from, from + pageSize - 1)

      if (error) {
        // Fail-open on any query error.
        return null
      }
      if (!data || data.length === 0) break

      for (const row of data) {
        const specialty = row.specialty as string | null
        const city = row.address_city as string | null
        if (!specialty || !city) continue

        const svcSlug = specialtyToService.get(specialty.toLowerCase().trim())
        // Strip arrondissement suffix so "Paris 18e arrondissement",
        // "Lyon 1er", "Marseille 15e" all map back to paris/lyon/marseille.
        const cityKey = normalizeKey(city)
          .replace(/\s+\d+\s*(er|e|eme|ieme)?\s*(arr|arrondissement)?\.?\s*$/, '')
          .trim()
        const villeSlug = cityToSlug.get(cityKey)
        if (!svcSlug || !villeSlug) continue

        combos.add(`${svcSlug}::${villeSlug}`)
      }

      if (data.length < pageSize) break
      from += pageSize
    }

    return combos
  } catch {
    return null
  }
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
  /** Map<"deptName::serviceSlug", YYYY-MM-DD> — resolved from byDeptService via SERVICE_TO_SPECIALTIES */
  byDeptServiceSlug: LastmodMap
  qualifiedCombos: QualifiedCombos | null
}

// ─── Derivation: dept×serviceSlug from dept×specialty ──────────────────

/**
 * Build a Map<"deptName::serviceSlug", YYYY-MM-DD> from the raw
 * byDeptService Map<"deptName::specialty", YYYY-MM-DD>.
 *
 * Uses SERVICE_TO_SPECIALTIES to resolve service slugs to their underlying
 * specialties. When a service maps to multiple specialties, the most recent
 * date wins.
 *
 * This avoids an additional DB query — it's a pure post-processing step.
 */
function deriveDeptServiceSlugMap(byDeptService: LastmodMap): LastmodMap {
  const result: LastmodMap = new Map()

  // Build reverse lookup: specialty → service slugs
  // Note: a specialty can map to multiple service slugs (e.g., 'peintre' → 'peintre', 'peintre-en-batiment')
  const specialtyToSlugs = new Map<string, string[]>()
  for (const [serviceSlug, specialties] of Object.entries(SERVICE_TO_SPECIALTIES)) {
    for (const sp of specialties) {
      const normSp = normalizeKey(sp)
      const existing = specialtyToSlugs.get(normSp)
      if (existing) {
        existing.push(serviceSlug)
      } else {
        specialtyToSlugs.set(normSp, [serviceSlug])
      }
    }
  }

  // Iterate over all byDeptService entries and map to service slugs
  for (const [key, date] of Array.from(byDeptService.entries())) {
    const separatorIdx = key.indexOf('::')
    if (separatorIdx === -1) continue
    const dept = key.substring(0, separatorIdx)
    const specialty = key.substring(separatorIdx + 2)

    const slugs = specialtyToSlugs.get(specialty)
    if (!slugs) continue

    for (const slug of slugs) {
      const newKey = `${dept}::${slug}`
      const existing = result.get(newKey)
      // Keep the most recent date
      if (!existing || date > existing) {
        result.set(newKey, date)
      }
    }
  }

  return result
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
    qualifiedCombos,
  ] = await Promise.all([
    getLastmodByCity(),
    getLastmodByDepartment(),
    getLastmodByRegion(),
    getLastmodByService(),
    getLastmodByDeptService(),
    getLastmodByRegionService(),
    getLastReviewByService(),
    getQualifiedServiceCityCombos(),
  ])

  // Derive dept×serviceSlug map from the raw dept×specialty data (no extra DB call)
  const byDeptServiceSlug = deriveDeptServiceSlugMap(byDeptService)

  return {
    byCity,
    byDepartment,
    byRegion,
    byService,
    byDeptService,
    byRegionService,
    reviewByService,
    byDeptServiceSlug,
    qualifiedCombos,
  }
}
