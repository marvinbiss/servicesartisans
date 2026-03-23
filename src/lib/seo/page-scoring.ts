/**
 * Page Scoring System for Internal Linking
 *
 * Computes a data-driven score for every service×city combination to determine
 * which pages should receive more internal links. Higher scores = more link equity.
 *
 * Score formula:
 *   score = (providerCount × 3) + (reviewCount × 2) + (population × 1) + (nb_entreprises_artisanales × 2)
 *
 * All values are normalised (0–100) before applying weights so no single factor
 * dominates.
 *
 * Data is fetched in batch from the `communes` table and cached 24h via
 * unstable_cache. Individual per-link scoring MUST NOT happen at render time —
 * always use the batch functions.
 */

import { unstable_cache } from 'next/cache'
import { villes } from '@/lib/data/france'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageScore {
  service: string
  ville: string
  score: number
}

export interface PageScoreDetails {
  service: string
  ville: string
  score: number
  providerCount: number
  reviewCount: number
  population: number
  nbEntreprisesArtisanales: number
}

/** Lightweight row shape for the batch query — only the columns we need. */
interface CommuneScoreRow {
  slug: string
  population: number
  nb_entreprises_artisanales: number | null
  provider_count: number
}


// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IS_BUILD =
  process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

/** Weights for the scoring formula */
const WEIGHT_PROVIDERS = 3
const WEIGHT_REVIEWS = 2
const WEIGHT_POPULATION = 1
const WEIGHT_ENTREPRISES = 2

/** Cache revalidation: 24 hours */
const REVALIDATE_SECONDS = 86_400

// ---------------------------------------------------------------------------
// Service slugs (deduplicated, excluding alias "peintre")
// ---------------------------------------------------------------------------

function getServiceSlugs(): string[] {
  return Object.keys(SERVICE_TO_SPECIALTIES).filter((s) => s !== 'peintre')
}

// ---------------------------------------------------------------------------
// Population parser — handles formats like "2 104 000" or "310 000"
// ---------------------------------------------------------------------------

function parsePopulation(pop: string): number {
  const cleaned = pop.replace(/\s/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isNaN(n) ? 0 : n
}

// ---------------------------------------------------------------------------
// Normalisation helper — maps [0, max] → [0, 100]
// ---------------------------------------------------------------------------

function normalise(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min((value / max) * 100, 100)
}

// ---------------------------------------------------------------------------
// Static fallback — population-only scoring from france.ts
// ---------------------------------------------------------------------------

function buildStaticCommuneMap(): Map<string, { population: number }> {
  const map = new Map<string, { population: number }>()
  for (const v of villes) {
    map.set(v.slug, { population: parsePopulation(v.population) })
  }
  return map
}

// ---------------------------------------------------------------------------
// DB data fetchers (lazy-imported to avoid crashes when env vars are missing)
// ---------------------------------------------------------------------------

async function fetchCommuneScoreData(): Promise<Map<string, CommuneScoreRow>> {
  const map = new Map<string, CommuneScoreRow>()
  if (IS_BUILD) return map

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Paginate: Supabase default limit is 1000
    const PAGE_SIZE = 1000
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('communes')
        .select('slug, population, nb_entreprises_artisanales, provider_count')
        .eq('is_active', true)
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) {
        logger.warn('[page-scoring] communes fetch error', { action: 'fetchCommuneScoreData' })
        break
      }

      if (!data || data.length === 0) {
        hasMore = false
        break
      }

      for (const row of data as CommuneScoreRow[]) {
        map.set(row.slug, row)
      }

      if (data.length < PAGE_SIZE) {
        hasMore = false
      } else {
        offset += PAGE_SIZE
      }
    }
  } catch {
    logger.warn('[page-scoring] Failed to fetch commune data — using static fallback', {
      action: 'fetchCommuneScoreData',
    })
  }

  return map
}

/**
 * Fetch aggregated review counts per city from the reviews table.
 * Returns a map of city slug → total published review count.
 */
async function fetchReviewCountsByCity(): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (IS_BUILD) return map

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // We join reviews → providers to get the city, then count per city.
    // Use a lightweight approach: fetch provider_id + count from reviews,
    // then map provider cities.
    const { data, error } = await supabase
      .from('reviews')
      .select('provider_id')
      .eq('status', 'published')
      .limit(50000)

    if (error || !data) return map

    // Count reviews per provider_id
    const providerReviewCounts = new Map<string, number>()
    for (const row of data) {
      const pid = row.provider_id as string
      providerReviewCounts.set(pid, (providerReviewCounts.get(pid) ?? 0) + 1)
    }

    if (providerReviewCounts.size === 0) return map

    // Fetch provider cities for all providers that have reviews
    const providerIds = Array.from(providerReviewCounts.keys())

    // Batch fetch in chunks of 500 (Supabase IN limit)
    const CHUNK = 500
    for (let i = 0; i < providerIds.length; i += CHUNK) {
      const chunk = providerIds.slice(i, i + CHUNK)
      const { data: providers } = await supabase
        .from('providers')
        .select('id, address_city')
        .in('id', chunk)
        .eq('is_active', true)

      if (!providers) continue

      for (const p of providers) {
        const city = p.address_city as string | null
        if (!city) continue
        const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const count = providerReviewCounts.get(p.id as string) ?? 0
        map.set(citySlug, (map.get(citySlug) ?? 0) + count)
      }
    }
  } catch {
    logger.warn('[page-scoring] Failed to fetch review counts', { action: 'fetchReviewCountsByCity' })
  }

  return map
}

// ---------------------------------------------------------------------------
// Core scoring engine
// ---------------------------------------------------------------------------

interface ScoringData {
  communes: Map<string, CommuneScoreRow>
  staticCities: Map<string, { population: number }>
  reviewsByCity: Map<string, number>
  maxProviderCount: number
  maxReviewCount: number
  maxPopulation: number
  maxEntreprises: number
}

async function loadScoringData(): Promise<ScoringData> {
  const [communes, reviewsByCity] = await Promise.all([
    fetchCommuneScoreData(),
    fetchReviewCountsByCity(),
  ])

  const staticCities = buildStaticCommuneMap()

  // Find maxima for normalisation
  let maxProviderCount = 1
  let maxReviewCount = 1
  let maxPopulation = 1
  let maxEntreprises = 1

  Array.from(communes.values()).forEach((row) => {
    if (row.provider_count > maxProviderCount) maxProviderCount = row.provider_count
    if ((row.nb_entreprises_artisanales ?? 0) > maxEntreprises)
      maxEntreprises = row.nb_entreprises_artisanales ?? 0
    if (row.population > maxPopulation) maxPopulation = row.population
  })

  // Also consider static population data as fallback max
  Array.from(staticCities.values()).forEach((city) => {
    if (city.population > maxPopulation) maxPopulation = city.population
  })

  Array.from(reviewsByCity.values()).forEach((count) => {
    if (count > maxReviewCount) maxReviewCount = count
  })

  return {
    communes,
    staticCities,
    reviewsByCity,
    maxProviderCount,
    maxReviewCount,
    maxPopulation,
    maxEntreprises,
  }
}

function computeScore(
  villeSlug: string,
  data: ScoringData,
): number {
  const communeRow = data.communes.get(villeSlug)
  const staticCity = data.staticCities.get(villeSlug)

  // Provider count from commune data
  const providerCount = communeRow?.provider_count ?? 0

  // Review count from aggregated reviews
  const reviewCount = data.reviewsByCity.get(villeSlug) ?? 0

  // Population: prefer DB, fallback to static
  const population = communeRow?.population ?? staticCity?.population ?? 0

  // Entreprises artisanales from commune data
  const nbEntreprises = communeRow?.nb_entreprises_artisanales ?? 0

  // Normalise each factor to 0–100 then apply weights
  const score =
    normalise(providerCount, data.maxProviderCount) * WEIGHT_PROVIDERS +
    normalise(reviewCount, data.maxReviewCount) * WEIGHT_REVIEWS +
    normalise(population, data.maxPopulation) * WEIGHT_POPULATION +
    normalise(nbEntreprises, data.maxEntreprises) * WEIGHT_ENTREPRISES

  return Math.round(score * 100) / 100
}

// ---------------------------------------------------------------------------
// Cached batch loader — single entry point for all scoring reads
// ---------------------------------------------------------------------------

const _getScoresBatch = async (): Promise<Map<string, number>> => {
  const data = await loadScoringData()
  const serviceSlugs = getServiceSlugs()
  const scores = new Map<string, number>()

  for (const serviceSlug of serviceSlugs) {
    for (const ville of villes) {
      const score = computeScore(ville.slug, data)
      if (score > 0) {
        scores.set(`${serviceSlug}:${ville.slug}`, score)
      }
    }
  }

  logger.info(`[page-scoring] Computed ${scores.size} scores for ${serviceSlugs.length} services × ${villes.length} cities`)

  return scores
}

/**
 * Batch compute ALL service×city scores. Cached 24h via unstable_cache.
 * This is the primary data source — never compute per-link at render time.
 */
export const getScoresBatch = unstable_cache(_getScoresBatch, ['page-scores-batch'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['page-scores'],
})

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the score for a specific service×city combination.
 * Reads from the cached batch — O(1) lookup.
 */
export async function getPageScore(serviceSlug: string, villeSlug: string): Promise<number> {
  const scores = await getScoresBatch()
  return scores.get(`${serviceSlug}:${villeSlug}`) ?? 0
}

/**
 * Return the top N pages globally, sorted by descending score.
 */
export async function getTopPages(limit: number): Promise<PageScore[]> {
  const scores = await getScoresBatch()

  const entries: PageScore[] = []
  scores.forEach((score, key) => {
    const [service, ville] = key.split(':')
    entries.push({ service, ville, score })
  })

  entries.sort((a, b) => b.score - a.score)
  return entries.slice(0, limit)
}

/**
 * Return the top N cities for a given service, sorted by descending score.
 */
export async function getTopPagesForService(
  serviceSlug: string,
  limit: number,
): Promise<PageScore[]> {
  const scores = await getScoresBatch()
  const prefix = `${serviceSlug}:`

  const entries: PageScore[] = []
  scores.forEach((score, key) => {
    if (key.startsWith(prefix)) {
      const ville = key.slice(prefix.length)
      entries.push({ service: serviceSlug, ville, score })
    }
  })

  entries.sort((a, b) => b.score - a.score)
  return entries.slice(0, limit)
}

/**
 * Return the top N services for a given city, sorted by descending score.
 */
export async function getTopPagesForCity(
  villeSlug: string,
  limit: number,
): Promise<PageScore[]> {
  const scores = await getScoresBatch()
  const suffix = `:${villeSlug}`

  const entries: PageScore[] = []
  scores.forEach((score, key) => {
    if (key.endsWith(suffix)) {
      const service = key.slice(0, key.length - suffix.length)
      entries.push({ service, ville: villeSlug, score })
    }
  })

  entries.sort((a, b) => b.score - a.score)
  return entries.slice(0, limit)
}

/**
 * Batch compute all scores and return as a Map<"service:ville", score>.
 * Designed for cron jobs — bypasses unstable_cache to force fresh computation.
 */
export async function precomputeScores(): Promise<Map<string, number>> {
  return _getScoresBatch()
}
