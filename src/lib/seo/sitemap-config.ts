/**
 * Sitemap constants — single source of truth.
 *
 * Shared by:
 *   - src/app/sitemap.ts              (static sitemaps generation)
 *   - src/app/api/sitemap-index/route.ts (sitemap index XML)
 *   - src/app/api/sitemap-providers/route.ts (dynamic provider sitemaps)
 *
 * Google recommends ≤30K URLs per sitemap file for optimal processing (2-day turnaround).
 * See: SEO Programmatique Playbook 2025-2026, §3 (Eleni Tarantou case study, 14M pages).
 */

/** Batch size for intent pages (devis, urgence, tarifs, avis, problemes × city).
 *  Gardé <30K pour headroom vs la limite Google de 50K (Tarantou §3). */
export const STATIC_BATCH = 8_000

/** Batch size for large sitemaps (service×city, dept×service, tarifs-task×city).
 *  Abaissé à 20K : certaines combinaisons (service × full-city list) approchaient 50K
 *  et se faisaient rejeter silencieusement par Google (GSC: "URL count exceeds limit"). */
export const LARGE_BATCH = 20_000

/** Batch size for provider sitemaps (DB-dependent, served via API route).
 *  Conservé à 20K aussi pour cohérence crawl cadence. */
export const PROVIDER_BATCH_SIZE = 20_000

/** Cap on provider sitemaps — 200 × 25K = 5M URLs max (covers 900K+ providers) */
export const MAX_PROVIDER_SITEMAPS = 200

/**
 * City counts for sitemap generation — tiered strategy.
 *
 * Tier 1 pages (service×ville, devis, tarifs, urgence) = contenu le plus riche
 * (25-50 data points uniques/page) → full scale, toutes les villes.
 *
 * Tier 2 pages (tarifs-tâche, avis, problèmes) = plus template-like
 * → top 500 villes seulement, pour éviter de diluer le ratio d'indexation
 * pendant que Google évalue la qualité du site (HCU site-level signal).
 *
 * Quand le ratio d'indexation Tier 1 dépassera 30-40%, scaler Tier 2 au full.
 *
 * Total: ~742K URLs.
 */
export const SITEMAP_CITY_COUNT = 2_267
export const SITEMAP_CITY_COUNT_TIER2 = 500

/**
 * Compte exact de villes émises pour les sitemaps `service-cities-*` :
 * top `SITEMAP_CITY_COUNT` (par population) + extras GSC priority qui ne
 * sont PAS dans le top.
 *
 * Audit 2026-04-25 (agent #3 SEO B1) : avant cette constante, `sitemap.ts`
 * et `sitemap-index/route.ts` calculaient `serviceCitiesBatchCount` sur
 * `services.length * SITEMAP_CITY_COUNT` alors que le handler émettait
 * `services.length * mergedCities.length` URLs → ~3 700 URLs prioritaires
 * GSC sortaient du dernier batch slice et n'étaient jamais émises.
 *
 * Source unique pour toute la chaîne sitemap → keep in sync with the
 * `mergedCities` calculation in `src/app/sitemap.ts:858-869`.
 */
import { villes as _villes } from '@/lib/data/france'
import { GSC_PRIORITY_CITIES as _GSC_PRIORITY_CITIES } from '@/lib/seo/gsc-priority-cities'

const _phase1Slugs = new Set(_villes.slice(0, SITEMAP_CITY_COUNT).map((v) => v.slug))
const _gscExtrasCount = _GSC_PRIORITY_CITIES.filter(
  (slug) => !_phase1Slugs.has(slug) && _villes.some((v) => v.slug === slug)
).length

export const SITEMAP_SERVICE_CITIES_COUNT = SITEMAP_CITY_COUNT + _gscExtrasCount
