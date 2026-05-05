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
import { villes, departements } from '@/lib/data/france'
import { CEE_OPERATION_CODES as CEE_OPERATION_CODES_FOR_SITEMAP } from '@/lib/cee/operation-codes'

// ─── Types ──────────────────────────────────────────────────────────────

/** Map of slug → ISO date string (YYYY-MM-DD) */
export type LastmodMap = Map<string, string>

/** Set of `${serviceSlug}::${villeSlug}` combos that have ≥1 qualified provider */
export type QualifiedCombos = Set<string>

/** Set of `${normalizedDeptName}::${serviceSlug}` combos with ≥ DEPT_FALLBACK_INDEX_THRESHOLD providers (3) */
export type DeptFallbackCombos = Set<string>

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
    // Chunk to avoid PostgREST URL > 8KB (nginx upstream rejette en 400
    // "Request Header Or Cookie Too Large") + undici header overflow 16KB.
    // 100 UUIDs × 37 chars ≈ 3.7 KB → safe.
    const providerIds = Array.from(new Set(reviews.map((r) => r.provider_id)))
    const CHUNK_SIZE = 100
    const chunks: string[][] = []
    for (let i = 0; i < providerIds.length; i += CHUNK_SIZE) {
      chunks.push(providerIds.slice(i, i + CHUNK_SIZE))
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await supabase
          .from('providers')
          .select('id, specialty')
          .in('id', chunk)
        if (error) return []
        return (data || []) as Array<{ id: string; specialty: string | null }>
      })
    )
    const providers = chunkResults.flat()
    if (providers.length === 0) return map

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

// ─── Query: Dept×service combos with ≥3 providers (sitemap↔noindex parity) ─

/**
 * Returns a Set<`${normalizedDeptName}::${serviceSlug}`> of combos where the
 * department-level fallback yields ≥ DEPT_FALLBACK_INDEX_THRESHOLD (=3) active
 * providers — same threshold as `hasDeptProviderFallback` (page render).
 *
 * Used by sitemap.ts to avoid emitting `/services/[s]/[v]` URLs that the page
 * would noindex (providerCount=0 + dept fallback <3). Drift fix Sprint A #6 PhB.
 *
 * Fail-open: returns `null` on DB error. Callers MUST treat `null` as
 * "include everything" — identical to the page's fail-open behavior
 * (providerCount default = 1).
 */
export async function getDeptServiceFallbackCombos(): Promise<DeptFallbackCombos | null> {
  const supabase = safeAdminClient()
  if (!supabase) return null

  // Reverse lookup: DB specialty → service slug used in URLs.
  const specialtyToService = new Map<string, string>()
  for (const [serviceSlug, specialties] of Object.entries(SERVICE_TO_SPECIALTIES)) {
    for (const sp of specialties) {
      if (!specialtyToService.has(sp)) {
        specialtyToService.set(sp, serviceSlug)
      }
    }
  }

  try {
    const counts = new Map<string, number>()
    const pageSize = 1000
    let from = 0
    const maxRows = 200_000

    while (from < maxRows) {
      const { data, error } = await supabase
        .from('providers')
        .select('specialty, address_department')
        .eq('is_active', true)
        .eq('noindex', false)
        .not('specialty', 'is', null)
        .not('address_department', 'is', null)
        .range(from, from + pageSize - 1)

      if (error) return null
      if (!data || data.length === 0) break

      for (const row of data) {
        const specialty = row.specialty as string | null
        const dept = row.address_department as string | null
        if (!specialty || !dept) continue

        const svcSlug = specialtyToService.get(specialty.toLowerCase().trim())
        if (!svcSlug) continue

        const deptKey = normalizeKey(dept)
        const key = `${deptKey}::${svcSlug}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }

      if (data.length < pageSize) break
      from += pageSize
    }

    // Apply threshold (must match DEPT_FALLBACK_INDEX_THRESHOLD in dept-fallback.ts).
    const result: DeptFallbackCombos = new Set()
    for (const [key, count] of Array.from(counts.entries())) {
      if (count >= 3) result.add(key)
    }
    return result
  } catch {
    return null
  }
}

// ─── Query: Qualified RGE service×ville and service×dept combos ────────

/**
 * Returns two sets for RGE sitemap pruning:
 *   - `rgeServiceCity`: `${serviceSlug}::${villeSlug}` combos with ≥1 active RGE provider
 *   - `rgeServiceDept`: `${serviceSlug}::${deptSlug}` combos with ≥1 active RGE provider
 *
 * "Qualified" = specialty maps to an RGE-allowed service AND provider is
 * active AND `rge_valid_until >= today` (same filter as
 * `getRgeProvidersByServiceAndCity`).
 *
 * Fail-open: returns `{ rgeServiceCity: null, rgeServiceDept: null }` on any
 * error. Callers MUST treat `null` as "include everything" to avoid accidental
 * mass pruning on DB blips. Aligns with the `qualifiedCombos` contract used by
 * devis/urgence/tarifs sitemaps.
 */
export interface RgeQualifiedCombos {
  rgeServiceCity: Set<string> | null
  rgeServiceDept: Set<string> | null
  /** Map<"service::villeSlug", YYYY-MM-DD> — latest provider updated_at per combo. null if DB blip. */
  rgeLastmodServiceCity: Map<string, string> | null
  /** Map<"service::normalizedDeptName", YYYY-MM-DD> — latest provider updated_at per combo. null if DB blip. */
  rgeLastmodServiceDept: Map<string, string> | null
}

export async function getQualifiedRgeCombos(): Promise<RgeQualifiedCombos> {
  const supabase = safeAdminClient()
  if (!supabase) {
    return {
      rgeServiceCity: null,
      rgeServiceDept: null,
      rgeLastmodServiceCity: null,
      rgeLastmodServiceDept: null,
    }
  }

  // Lazy-load (cycle prevention identical to before).
  let RGE_ALLOWED_SERVICES: readonly string[] = []
  let getRgeServicesFromQualifications: (
    q: unknown,
    s: string | null | undefined,
    a: readonly string[]
  ) => string[] = () => []
  try {
    const rgeMod = await import('@/lib/rge/service-city-listings')
    RGE_ALLOWED_SERVICES = rgeMod.RGE_ALLOWED_SERVICES
    const matcherMod = await import('@/lib/rge/qualification-matcher')
    getRgeServicesFromQualifications =
      matcherMod.getRgeServicesFromQualifications as typeof getRgeServicesFromQualifications
  } catch {
    return {
      rgeServiceCity: null,
      rgeServiceDept: null,
      rgeLastmodServiceCity: null,
      rgeLastmodServiceDept: null,
    }
  }

  // Lookup ville: nom normalisé → slug.
  const cityToSlug = new Map<string, string>()
  for (const v of villes) {
    cityToSlug.set(normalizeKey(v.name), v.slug)
  }

  // Lookup département : on indexe par TOUTES les valeurs plausibles que la
  // colonne DB `address_department` peut contenir (code numérique '69',
  // code DOM '971', nom 'Rhône'/'Guadeloupe' avec accent, nom normalisé
  // 'rhone'). WHY : avant le refactor, on indexait par `normalizeKey(dept)`
  // depuis la DB ET on consommait avec `normalizeName(dept.name)` côté
  // sitemap — résultat 1 seul match sur 1 414 attendus parce que la DB
  // stocke souvent le code ('69') alors que la lookup demandait 'rhone'.
  const deptValueToSlug = new Map<string, string>()
  for (const d of departements) {
    deptValueToSlug.set(d.code, d.slug)
    deptValueToSlug.set(normalizeKey(d.name), d.slug)
    deptValueToSlug.set(d.slug, d.slug)
  }

  try {
    const rgeServiceCity: Set<string> = new Set()
    const rgeServiceDept: Set<string> = new Set()
    const rgeLastmodServiceCity = new Map<string, string>()
    const rgeLastmodServiceDept = new Map<string, string>()
    const today = new Date().toISOString().slice(0, 10)
    const pageSize = 1000
    let from = 0
    const maxRows = 600_000

    while (from < maxRows) {
      const { data, error } = await supabase
        .from('providers')
        .select('specialty, address_city, address_department, rge_qualifications, updated_at')
        .eq('is_active', true)
        .eq('noindex', false)
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', today)
        .range(from, from + pageSize - 1)

      if (error) {
        return {
          rgeServiceCity: null,
          rgeServiceDept: null,
          rgeLastmodServiceCity: null,
          rgeLastmodServiceDept: null,
        }
      }
      if (!data || data.length === 0) break

      for (const row of data) {
        const specialty = row.specialty as string | null
        const city = row.address_city as string | null
        const dept = row.address_department as string | null
        const qualifs = row.rge_qualifications as unknown
        const updatedAt = toDateStr(row.updated_at as string | null | undefined)

        // Source unifiée des services RGE éligibles : qualifs[] (catégorie) +
        // specialty NAF directe. Fix racine du bug "shards à 1-143 URLs" :
        // un artisan `specialty='chauffagiste'` avec qualif QualiPAC est
        // désormais émis dans /rge/pompe-a-chaleur/[v] (catégorie 'pac' →
        // mapping CATEGORY_TO_RGE_SERVICES).
        const services = getRgeServicesFromQualifications(qualifs, specialty, RGE_ALLOWED_SERVICES)
        if (services.length === 0) continue

        // City combo — strip arrondissement suffix (Paris/Lyon/Marseille).
        if (city) {
          const cityKey = normalizeKey(city)
            .replace(/\s+\d+\s*(er|e|eme|ieme)?\s*(arr|arrondissement)?\.?\s*$/, '')
            .trim()
          const villeSlug = cityToSlug.get(cityKey)
          if (villeSlug) {
            for (const svcSlug of services) {
              const key = `${svcSlug}::${villeSlug}`
              rgeServiceCity.add(key)
              if (updatedAt) {
                const prev = rgeLastmodServiceCity.get(key)
                if (!prev || updatedAt > prev) rgeLastmodServiceCity.set(key, updatedAt)
              }
            }
          }
        }

        // Dept combo — résolution multi-format (code + nom normalisé) → slug.
        if (dept) {
          const deptKeyRaw = dept.trim()
          const deptSlug =
            deptValueToSlug.get(deptKeyRaw) ?? deptValueToSlug.get(normalizeKey(deptKeyRaw))
          if (deptSlug) {
            for (const svcSlug of services) {
              // Indexé par dept.slug (consommateur sitemap utilise dept.slug
              // via `normalizeName(dept.name)` → on garde ce format pour
              // backward compat avec le call site existant).
              const key = `${svcSlug}::${deptSlug}`
              rgeServiceDept.add(key)
              if (updatedAt) {
                const prev = rgeLastmodServiceDept.get(key)
                if (!prev || updatedAt > prev) rgeLastmodServiceDept.set(key, updatedAt)
              }
            }
          }
        }
      }

      if (data.length < pageSize) break
      from += pageSize
    }

    return { rgeServiceCity, rgeServiceDept, rgeLastmodServiceCity, rgeLastmodServiceDept }
  } catch {
    return {
      rgeServiceCity: null,
      rgeServiceDept: null,
      rgeLastmodServiceCity: null,
      rgeLastmodServiceDept: null,
    }
  }
}

// ─── Query: Qualified CEE operation×ville combos ───────────────────────

/**
 * Returns a Set<`${operationCode}::${villeSlug}`> of CEE combos with ≥1
 * active RGE provider whose specialty is eligible for that operation.
 *
 * Eligibility rule matches `getCeeProvidersByOperationAndCity`:
 *   - provider.specialty ∈ resolveSpecialtiesForOperation(operation.services_slugs)
 *   - provider.is_active
 *   - provider.rge_valid_until >= today (⇒ rge_qualifications NOT NULL)
 *
 * Fail-open: returns `null` on any error or missing dep. Callers treat `null`
 * as "include everything".
 */
export interface CeeQualifiedCombos {
  /** Set<"operationCode::villeSlug"> of CEE combos with ≥1 eligible provider. */
  combos: Set<string>
  /** Map<"operationCode::villeSlug", YYYY-MM-DD> — latest provider updated_at per combo. */
  lastmod: Map<string, string>
}

export async function getQualifiedCeeCombos(
  operationCodes: readonly string[]
): Promise<CeeQualifiedCombos | null> {
  const supabase = safeAdminClient()
  if (!supabase || operationCodes.length === 0) return null

  let SERVICE_TO_SPECIALTIES: Record<string, string[]> = {}
  let getCeeOperationByCode: (code: string) => Promise<{ services_slugs: string[] } | null>
  try {
    const supaMod = await import('@/lib/supabase')
    SERVICE_TO_SPECIALTIES = supaMod.SERVICE_TO_SPECIALTIES
    const catMod = await import('@/lib/cee/catalogue')
    getCeeOperationByCode = catMod.getCeeOperationByCode as typeof getCeeOperationByCode
  } catch {
    return null
  }

  // Resolve each operation's candidate specialties once (same logic as
  // lib/cee/listings.ts::resolveSpecialtiesForOperation).
  const opToSpecialties = new Map<string, Set<string>>()
  for (const code of operationCodes) {
    try {
      const op = await getCeeOperationByCode(code)
      if (!op) continue
      const set = new Set<string>()
      for (const slug of op.services_slugs || []) {
        const mapped = SERVICE_TO_SPECIALTIES[slug]
        if (mapped && mapped.length > 0) {
          for (const s of mapped) set.add(normalizeKey(s))
        } else {
          set.add(normalizeKey(slug))
        }
      }
      if (set.size > 0) opToSpecialties.set(code, set)
    } catch {
      // Skip this op on error; fail-open at the op level rather than nuking all.
      continue
    }
  }

  if (opToSpecialties.size === 0) return null

  // Reverse map: specialty → [op codes] for O(1) lookup during the scan.
  const specialtyToOps = new Map<string, string[]>()
  for (const [code, specSet] of Array.from(opToSpecialties.entries())) {
    for (const spec of Array.from(specSet)) {
      const existing = specialtyToOps.get(spec)
      if (existing) {
        if (!existing.includes(code)) existing.push(code)
      } else {
        specialtyToOps.set(spec, [code])
      }
    }
  }

  const cityToSlug = new Map<string, string>()
  for (const v of villes) {
    cityToSlug.set(normalizeKey(v.name), v.slug)
  }

  try {
    const combos: Set<string> = new Set()
    const lastmod = new Map<string, string>()
    const today = new Date().toISOString().slice(0, 10)
    const pageSize = 1000
    let from = 0
    const maxRows = 600_000

    while (from < maxRows) {
      const { data, error } = await supabase
        .from('providers')
        .select('specialty, address_city, updated_at')
        .eq('is_active', true)
        .eq('noindex', false)
        .not('specialty', 'is', null)
        .not('address_city', 'is', null)
        .gte('rge_valid_until', today)
        .range(from, from + pageSize - 1)

      if (error) return null
      if (!data || data.length === 0) break

      for (const row of data) {
        const specialty = row.specialty as string | null
        const city = row.address_city as string | null
        const updatedAt = toDateStr(row.updated_at as string | null | undefined)
        if (!specialty || !city) continue

        const ops = specialtyToOps.get(normalizeKey(specialty))
        if (!ops || ops.length === 0) continue

        const cityKey = normalizeKey(city)
          .replace(/\s+\d+\s*(er|e|eme|ieme)?\s*(arr|arrondissement)?\.?\s*$/, '')
          .trim()
        const villeSlug = cityToSlug.get(cityKey)
        if (!villeSlug) continue

        for (const op of ops) {
          const key = `${op}::${villeSlug}`
          combos.add(key)
          if (updatedAt) {
            const prev = lastmod.get(key)
            if (!prev || updatedAt > prev) lastmod.set(key, updatedAt)
          }
        }
      }

      if (data.length < pageSize) break
      from += pageSize
    }

    return { combos, lastmod }
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
  /** Set<"serviceSlug::villeSlug"> of RGE combos with ≥1 active RGE provider. null = include all (DB blip). */
  rgeQualifiedServiceCity: Set<string> | null
  /** Set<"serviceSlug::normalizedDeptName"> of RGE combos by department. null = include all. */
  rgeQualifiedServiceDept: Set<string> | null
  /** Map<"serviceSlug::villeSlug", YYYY-MM-DD> — latest RGE provider updated_at per combo. null on DB blip. */
  rgeLastmodServiceCity: Map<string, string> | null
  /** Map<"serviceSlug::normalizedDeptName", YYYY-MM-DD> — latest RGE provider updated_at per combo. null on DB blip. */
  rgeLastmodServiceDept: Map<string, string> | null
  /** Set<"operationCode::villeSlug"> of CEE combos with ≥1 eligible provider. null = include all. */
  ceeQualifiedOperationCity: Set<string> | null
  /** Map<"operationCode::villeSlug", YYYY-MM-DD> — latest eligible provider updated_at per combo. null on DB blip. */
  ceeLastmodOperationCity: Map<string, string> | null
  /** Set<"normalizedDeptName::serviceSlug"> with ≥3 active providers (matches `hasDeptProviderFallback` threshold). null = include all. */
  deptServiceFallbackCombos: DeptFallbackCombos | null
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
    rgeCombos,
    ceeQualifiedOperationCity,
    deptServiceFallbackCombos,
  ] = await Promise.all([
    getLastmodByCity(),
    getLastmodByDepartment(),
    getLastmodByRegion(),
    getLastmodByService(),
    getLastmodByDeptService(),
    getLastmodByRegionService(),
    getLastReviewByService(),
    getQualifiedServiceCityCombos(),
    getQualifiedRgeCombos(),
    getQualifiedCeeCombos(CEE_OPERATION_CODES_FOR_SITEMAP),
    getDeptServiceFallbackCombos(),
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
    rgeQualifiedServiceCity: rgeCombos.rgeServiceCity,
    rgeQualifiedServiceDept: rgeCombos.rgeServiceDept,
    rgeLastmodServiceCity: rgeCombos.rgeLastmodServiceCity,
    rgeLastmodServiceDept: rgeCombos.rgeLastmodServiceDept,
    ceeQualifiedOperationCity: ceeQualifiedOperationCity ? ceeQualifiedOperationCity.combos : null,
    ceeLastmodOperationCity: ceeQualifiedOperationCity ? ceeQualifiedOperationCity.lastmod : null,
    deptServiceFallbackCombos,
  }
}
