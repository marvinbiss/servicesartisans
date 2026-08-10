/**
 * Fetches commune demographic & enrichment data from Supabase.
 * Used by service+location pages for data-driven unique SEO content.
 *
 * Data is cached in-memory for 24 hours (communes data changes infrequently).
 * Gracefully returns null when the table is empty or DB is unavailable.
 */

import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommuneData {
  // Identity
  code_insee: string
  name: string
  slug: string
  code_postal: string | null
  departement_code: string
  departement_name: string | null
  region_name: string | null

  // Geography
  latitude: number | null
  longitude: number | null
  altitude_moyenne: number | null
  superficie_km2: number | null

  // Demographics
  population: number
  densite_population: number | null

  // Socio-economic (INSEE + DVF)
  revenu_median: number | null
  prix_m2_moyen: number | null
  nb_logements: number | null
  part_maisons_pct: number | null

  // Local enrichment
  climat_zone: string | null
  nb_entreprises_artisanales: number | null
  gentile: string | null
  description: string | null

  // Platform data
  provider_count: number

  // SIRENE enrichment
  nb_artisans_btp: number | null

  // RGE enrichment
  nb_artisans_rge: number | null

  // DPE enrichment
  pct_passoires_dpe: number | null
  nb_dpe_total: number | null

  // Climate enrichment
  jours_gel_annuels: number | null
  precipitation_annuelle: number | null
  mois_travaux_ext_debut: number | null
  mois_travaux_ext_fin: number | null
  temperature_moyenne_hiver: number | null
  temperature_moyenne_ete: number | null

  // DVF enrichment
  nb_transactions_annuelles: number | null
  prix_m2_maison: number | null
  prix_m2_appartement: number | null

  // MaPrimeRénov
  nb_maprimerenov_annuel: number | null

  // Géorisques
  risque_inondation?: boolean
  risque_argile?: string | null // 'fort' | 'moyen' | 'faible'
  zone_sismique?: number | null // 1-5
  risque_radon?: number | null // 1-3
  nb_catnat?: number
  risques_principaux?: string[]

  enriched_at: string | null
}

// ---------------------------------------------------------------------------
// Select columns — explicit to avoid SELECT * and catch schema drift
// ---------------------------------------------------------------------------

const COMMUNE_COLUMNS = [
  'code_insee',
  'name',
  'slug',
  'code_postal',
  'departement_code',
  'departement_name',
  'region_name',
  'latitude',
  'longitude',
  'altitude_moyenne',
  'superficie_km2',
  'population',
  'densite_population',
  'revenu_median',
  'prix_m2_moyen',
  'nb_logements',
  'part_maisons_pct',
  'climat_zone',
  'nb_entreprises_artisanales',
  'gentile',
  'description',
  'provider_count',
  'nb_artisans_btp',
  'nb_artisans_rge',
  'pct_passoires_dpe',
  'nb_dpe_total',
  'jours_gel_annuels',
  'precipitation_annuelle',
  'mois_travaux_ext_debut',
  'mois_travaux_ext_fin',
  'temperature_moyenne_hiver',
  'temperature_moyenne_ete',
  'nb_transactions_annuelles',
  'prix_m2_maison',
  'prix_m2_appartement',
  'nb_maprimerenov_annuel',
  'risque_inondation',
  'risque_argile',
  'zone_sismique',
  'risque_radon',
  'nb_catnat',
  'risques_principaux',
  'enriched_at',
].join(',')

// ---------------------------------------------------------------------------
// Build-time guard partagé — null DB tant que NEXT_BUILD_SKIP_DB=1 sans URL.
// ---------------------------------------------------------------------------

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

// ---------------------------------------------------------------------------
// Fetch all active commune slugs (sitemap V3 #1 — stratégie 140K)
// ---------------------------------------------------------------------------

/**
 * Retourne tous les slugs de communes actives (cap configurable, défaut 36 000).
 * Utilisé par le sitemap pour émettre `/communes/[slug]`. Graceful fallback
 * sur tableau vide si la table est absente ou la DB indisponible.
 *
 * Note RLS : la table est lue via `createAdminClient()` (bypass RLS) côté
 * server-only car le sitemap tourne au build/ISR avec le service-role.
 *
 * Pagination : Supabase PostgREST cap par défaut max-rows=1000. On batch
 * jusqu'à 36 000 (~36 rounds) pour récupérer tous les slugs.
 *
 * Vague γ nettoyage 2026-05-02 : filtre `qualifiedOnly` (true par défaut)
 * exclut les hameaux INSEE sans signal :
 *   - population < 500 ET
 *   - provider_count = 0 OU NULL
 * → ces communes deviennent noindex (sitemap les omet, page bascule via
 * `isCommuneQualified`). Estimation : -16K URLs sur 36K (-45%).
 *
 * Pour récupérer la liste complète sans filtre (debug/audit/migration) :
 * `getAllCommuneSlugs(36_000, false)`.
 */
export async function getAllCommuneSlugs(
  maxSlugs: number = 36_000,
  qualifiedOnly: boolean = true
): Promise<string[]> {
  if (IS_BUILD) return []
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const PAGE = 1_000
    const slugs: string[] = []
    let from = 0
    while (slugs.length < maxSlugs) {
      const to = Math.min(from + PAGE - 1, maxSlugs - 1)
      let query = supabase
        .from('communes')
        .select('slug')
        .eq('is_active', true)
        .order('population', { ascending: false })
        .range(from, to)
      if (qualifiedOnly) {
        // Garde les communes "utiles" : ≥500 hab OU ≥1 artisan en commune.
        // PostgREST OR syntax : `.or('cond1,cond2')`.
        query = query.or('population.gte.500,provider_count.gte.1')
      }
      const { data, error } = await query
      if (error || !data || data.length === 0) break
      for (const row of data as { slug: string }[]) slugs.push(row.slug)
      if (data.length < PAGE) break
      from += PAGE
    }
    return slugs
  } catch {
    return []
  }
}

/**
 * Vague γ — invariant page : si la commune est exclue par le filter qualifié,
 * on doit aussi noindex la page côté metadata pour éviter qu'elle reste
 * indexée via découvertes externes (internal links, GSC inspection).
 *
 * Pure synchronous helper basé sur les champs déjà chargés par
 * `getCommuneBySlug`. Si `commune` est null (DB unavailable), retourne true
 * (fail-open : on garde indexable plutôt que de noindexer faussement).
 */
export function isCommuneQualified(commune: CommuneData | null): boolean {
  if (!commune) return true // fail-open
  const pop = commune.population ?? 0
  const providers = commune.provider_count ?? 0
  return pop >= 500 || providers >= 1
}

// ---------------------------------------------------------------------------
// Hybride 25K — RGE local OU rayon 20 km (Migration 527, 2026-05-22)
// ---------------------------------------------------------------------------

export type CommuneSitemapHybridRow = {
  commune_slug: string
  code_insee: string
  has_local_rge: boolean
  nearest_rge_distance_km: number | null
  last_modified: string | null
}

/**
 * Retourne tous les slugs de communes éligibles au sitemap selon la stratégie
 * hybride 25K (mig 527) :
 *   - Vague 1 : communes avec ≥1 RGE local (nb_artisans_rge >= 1).
 *   - Vague 2 : communes sans RGE local mais ≥1 RGE valide dans rayon `radiusKm`.
 *
 * Skip strict des communes >20 km de tout RGE valide (vrai soft 404).
 *
 * Graceful fallback : si la RPC échoue (DB blip, mig non appliquée), on
 * retombe sur `getAllCommuneSlugs(qualifiedOnly=true)` pour ne pas casser le
 * sitemap en prod (le set existant reste un sous-ensemble plus large).
 */
export async function getCommunesSitemapHybrid(
  radiusKm: number = 20,
  maxCommunes: number = 30_000
): Promise<CommuneSitemapHybridRow[]> {
  if (IS_BUILD) {
    // Explicit warn : si NEXT_BUILD_SKIP_DB=1 sans NEXT_PUBLIC_SUPABASE_URL,
    // sitemap perd ~8K URLs hybrides. Visibilité Sentry pour diff post-build.
    logger.warn('[commune-data] getCommunesSitemapHybrid skipped (IS_BUILD=true)')
    return []
  }
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_communes_sitemap_hybrid', {
      p_radius_km: radiusKm,
      p_max_communes: maxCommunes,
    })
    if (error || !data) {
      logger.warn(
        `[commune-data] get_communes_sitemap_hybrid RPC failed: ${error?.message ?? 'no data'} — fallback to getAllCommuneSlugs`
      )
      return []
    }
    return data as CommuneSitemapHybridRow[]
  } catch {
    return []
  }
}

/**
 * Variante "slug-only" pour les shards sitemap qui n'ont besoin que des URLs.
 * Avec fallback gracieux vers `getAllCommuneSlugs(qualifiedOnly=true)` si la
 * RPC hybride retourne vide (DB blip ou mig 527 non appliquée).
 */
export async function getAllCommuneSlugsHybrid(maxSlugs: number = 30_000): Promise<string[]> {
  const rows = await getCommunesSitemapHybrid(20, maxSlugs)
  if (rows.length > 0) return rows.map((r) => r.commune_slug)
  // Fallback : pre-mig 527 → garde le comportement vague γ
  return getAllCommuneSlugs(maxSlugs, true)
}

export type NearestRgeProviderRow = {
  id: string
  name: string
  slug: string
  stable_id: string | null
  specialty: string | null
  address_city: string | null
  address_postal_code: string | null
  home_commune_slug: string | null
  distance_km: number
}

/**
 * Retourne les N RGE valides les plus proches d'une commune (rayon `radiusKm`).
 * Pour le mode "fallback" de la page commune (no local RGE).
 *
 * Returns [] si la commune n'a pas de geo, ou si la RPC échoue (DB blip,
 * mig 527 non appliquée).
 */
export async function getNearestRgeProvidersForCommune(
  communeSlug: string,
  opts: { radiusKm?: number; limit?: number } = {}
): Promise<NearestRgeProviderRow[]> {
  if (IS_BUILD) return []
  const { radiusKm = 20, limit = 5 } = opts
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_nearest_rge_providers_for_commune', {
      p_commune_slug: communeSlug,
      p_radius_km: radiusKm,
      p_limit: limit,
    })
    if (error || !data) return []
    return data as NearestRgeProviderRow[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Fetch commune data by slug (cached 24h)
// ---------------------------------------------------------------------------

/**
 * Result of a strict commune lookup that separates a genuine "not found" from
 * a DB error. WHY: `.single()` returns PGRST116 for 0 rows, but a timeout /
 * connection error also arrives via `error` (or a thrown exception). The old
 * `if (error || !data) return null` collapsed both into `null`, so the page's
 * `if (!commune) notFound()` fired on transient DB errors → soft-404 HTTP 200
 * (Next.js 14.2 #69103) served to Googlebot across ~35K commune URLs during the
 * mid-June DB timeout = mass demotion (same class as the /services soft-404 fix).
 *
 *   { ok: true,  commune: X }    → found
 *   { ok: true,  commune: null } → genuine 0-row (notFound legitimate)
 *   { ok: false, commune: null } → DB error/timeout — callers MUST NOT notFound()
 *                                  (render degraded / let it 500 — never soft-404)
 */
export type CommuneLookup = { ok: boolean; commune: CommuneData | null }

export async function getCommuneBySlugStrict(slug: string): Promise<CommuneLookup> {
  if (IS_BUILD) return { ok: true, commune: null } // build: skip DB, ISR populates on first visit
  try {
    const commune = await getCachedData<CommuneData | null>(
      `commune:${slug}`,
      async () => {
        // Lazy import to avoid crashes when env vars are missing (build time)
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        const { data, error } = await supabase
          .from('communes')
          .select(COMMUNE_COLUMNS)
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (error) {
          // PGRST116 = `.single()` matched 0 rows = genuine not-found (cache the null).
          if (error.code === 'PGRST116') return null
          // Any other error (timeout 57014, connection, 5xx) = DB error → throw so
          // getCachedData does NOT cache it and the outer catch flags ok:false.
          throw new Error(`commune_db_error:${error.code ?? 'unknown'}`)
        }
        return (data as unknown as CommuneData) ?? null
      },
      CACHE_TTL.locations, // 24 hours
      { skipNull: true }
    )
    return { ok: true, commune }
  } catch {
    // DB unavailable / timeout / network — NOT a genuine 404.
    return { ok: false, commune: null }
  }
}

/**
 * Backward-compatible lookup — collapses to `commune | null` (DB error → null,
 * identical to the historical behaviour). Kept for callers that don't gate a
 * `notFound()` on the result. Render templates that DO `notFound()` must use
 * {@link getCommuneBySlugStrict} instead to avoid soft-404 on DB errors.
 */
export async function getCommuneBySlug(slug: string): Promise<CommuneData | null> {
  return (await getCommuneBySlugStrict(slug)).commune
}

// ---------------------------------------------------------------------------
// Scoring: compute popularity score from commune data
// ---------------------------------------------------------------------------

/**
 * Compute a popularity score from already-fetched CommuneData.
 * Synchronous — no DB calls. Weights: provider_count x3, artisan count x2, population/1000.
 */
export function getCommuneScoreFromData(commune: CommuneData): number {
  const providerCount = commune.provider_count || 0
  const artisanCount = commune.nb_entreprises_artisanales || 0
  const pop = commune.population || 0
  return providerCount * 3 + artisanCount * 2 + pop / 1000
}

/**
 * Async scoring: fetch commune data then compute score.
 * Returns 0 if commune not found or DB unavailable.
 */
export async function getCommuneScore(slug: string): Promise<number> {
  const commune = await getCommuneBySlug(slug)
  if (!commune) return 0
  return getCommuneScoreFromData(commune)
}

// ---------------------------------------------------------------------------
// Helper: check if commune has enrichment data (beyond basic demographics)
// ---------------------------------------------------------------------------

export function hasEnrichmentData(commune: CommuneData): boolean {
  return !!(
    commune.nb_artisans_btp ||
    commune.nb_artisans_rge ||
    commune.pct_passoires_dpe ||
    commune.jours_gel_annuels ||
    commune.nb_transactions_annuelles ||
    commune.nb_maprimerenov_annuel
  )
}

/** Check if commune has Géorisques risk data */
export function hasGeorisquesData(commune: CommuneData): boolean {
  return !!(
    commune.risque_inondation ||
    commune.risque_argile ||
    commune.zone_sismique ||
    commune.risque_radon ||
    commune.nb_catnat
  )
}

/** Check if commune has at least basic demographic data */
export function hasDemographicData(commune: CommuneData): boolean {
  return !!(
    commune.revenu_median ||
    commune.prix_m2_moyen ||
    commune.nb_logements ||
    commune.part_maisons_pct
  )
}

// ---------------------------------------------------------------------------
// Helper: format number with French thousands separator
// ---------------------------------------------------------------------------

export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

export function formatEuro(n: number): string {
  return n.toLocaleString('fr-FR') + ' €'
}

const MONTH_NAMES = [
  '',
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

export function monthName(m: number): string {
  return MONTH_NAMES[m] || ''
}

// ---------------------------------------------------------------------------
// Get nearby commune slugs by GPS distance (bounding box + Haversine)
// Returns slugs sorted by distance, excluding the origin city.
// Returns null if DB is unavailable (build time) — caller should fallback.
// ---------------------------------------------------------------------------

export async function getNearbyVilleSlugs(
  originSlug: string,
  limit: number = 8
): Promise<{ slug: string; distanceKm: number }[] | null> {
  if (IS_BUILD) return null

  try {
    const origin = await getCommuneBySlug(originSlug)
    if (!origin?.latitude || !origin?.longitude) return null
    const originWithCoords = origin as CommuneData & { latitude: number; longitude: number }

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Progressive fallback: widen radius + lower pop threshold until >= limit results
    const tiers = [
      { radiusKm: 30, minPop: 2000 },
      { radiusKm: 50, minPop: 1000 },
      { radiusKm: 80, minPop: 500 },
    ]

    for (const { radiusKm, minPop } of tiers) {
      const results = await queryNearby(
        supabase,
        originWithCoords,
        originSlug,
        radiusKm,
        minPop,
        limit
      )
      if (results && results.length >= limit) return results
    }

    // Final fallback: no population filter, 80km
    const lastTry = await queryNearby(supabase, originWithCoords, originSlug, 80, 0, limit)
    if (lastTry && lastTry.length > 0) return lastTry

    return null
  } catch {
    return null
  }
}

/** Internal: query nearby communes within bounding box + Haversine filter */
async function queryNearby(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  origin: CommuneData & { latitude: number; longitude: number },
  originSlug: string,
  radiusKm: number,
  minPop: number,
  limit: number
): Promise<{ slug: string; distanceKm: number }[] | null> {
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((origin.latitude * Math.PI) / 180))

  let query = supabase
    .from('communes')
    .select('slug,latitude,longitude,population')
    .eq('is_active', true)
    .gte('latitude', origin.latitude - latDelta)
    .lte('latitude', origin.latitude + latDelta)
    .gte('longitude', origin.longitude - lngDelta)
    .lte('longitude', origin.longitude + lngDelta)
    .neq('slug', originSlug)
    .not('latitude', 'is', null)
    .limit(300)

  if (minPop > 0) {
    query = query.gte('population', minPop)
  }

  const { data, error } = await query.order('population', { ascending: false })

  if (error || !data) return null

  const R = 6371
  return (data as { slug: string; latitude: number; longitude: number; population: number }[])
    .map((c) => {
      const dLat = ((c.latitude - origin.latitude) * Math.PI) / 180
      const dLng = ((c.longitude - origin.longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((origin.latitude * Math.PI) / 180) *
          Math.cos((c.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2
      const distanceKm = R * 2 * Math.asin(Math.sqrt(a))
      return { slug: c.slug, distanceKm }
    })
    .filter((c) => c.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
