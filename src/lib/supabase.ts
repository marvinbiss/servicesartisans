import { createClient } from '@supabase/supabase-js'
import { getVilleBySlug as getVilleBySlugImport } from '@/lib/data/france'
import { resolveProviderCity, resolveProviderCities, getCityValues } from '@/lib/insee-resolver'
import { logger } from '@/lib/logger'
import { getCachedData, CACHE_TTL } from '@/lib/cache'

// React.cache() request-scope dedup — best-effort. Sous Next.js RSC il agrège
// les appels duplicate au sein du même render (generateMetadata + page render).
// Hors contexte RSC (vitest, scripts node), `cache` n'est pas exporté → on
// retombe sur un identity wrapper. Le getCachedData process-cache reste actif.
type CacheFn = <Fn extends (...args: never[]) => unknown>(fn: Fn) => Fn
let requestCache: CacheFn = (fn) => fn
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reactPkg = require('react') as { cache?: CacheFn }
  if (typeof reactPkg.cache === 'function') {
    requestCache = reactPkg.cache
  }
} catch {
  // react indisponible côté script — identity wrapper suffit
}

/**
 * Should we skip DB queries?
 * Only skip if explicitly requested AND Supabase env vars are missing.
 * On Vercel production, env vars are available → build pre-renders with real data.
 * Exported so other modules can reuse the same logic.
 */
export const IS_BUILD =
  process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

// Audit 2026-05-01 : le wrapper `next: { revalidate: 3600 }` activait le
// `patched-fetch` Next.js 14.2 qui logge `[TypeError: fetch failed]` au
// niveau "error" même quand le call site a un .catch propre. Sur cold
// lambdas + Cloudflare 502 backoff transient, ça polluait Vercel logs
// (5+ events/h sur /services/[s]/[v]) sans valeur cache (`x-vercel-cache: MISS`
// constant). On bascule sur le fetch natif : ISR + revalidate=3600 reste
// piloté par le `export const revalidate` des pages ; Supabase utilise
// son propre keep-alive pool.
export const supabase =
  IS_BUILD || !process.env.NEXT_PUBLIC_SUPABASE_URL
    ? (null as unknown as ReturnType<typeof createClient>)
    : createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      )

/**
 * Row shape returned by provider listing queries (PROVIDER_LIST_SELECT).
 * Matches the columns selected in the lightweight listing query.
 */
interface ProviderListRow {
  id: string
  stable_id: string | null
  name: string
  slug: string
  specialty: string | null
  address_street: string | null
  address_postal_code: string | null
  address_city: string | null
  address_region: string | null
  is_verified: boolean | null
  is_active: boolean | null
  noindex: boolean | null
  rating_average: number | null
  review_count: number | null
  phone: string | null
  siret: string | null
  latitude: number | null
  longitude: number | null
  user_id: string | null
  created_at: string | null
  updated_at: string | null
  // RGE ADEME (migration 380) — exposés en listing pour afficher le badge sur les cards
  rge_qualifications: Array<{
    code: string
    nom: string
    organisme: string
    domaine: string | null
    meta_domaine: string | null
    date_debut: string
    date_fin: string
    url: string | null
  }> | null
  rge_valid_until: string | null
  rge_organismes: string[] | null
  rge_source_url: string | null
  // Google Places (mig 483) — exposés en listing pour fallback
  // AggregateRating sur les hubs page-level. Distincts de rating_average/
  // review_count first-party. Helper `buildAggregateRatingFromProviders`
  // applique les garde-fous (count ≥ 3, OPERATIONAL, place_id présent).
  google_rating: number | null
  google_user_ratings_total: number | null
  google_business_status: string | null
  google_place_id: string | null
  // Pricing (mig 306) — listing pour ProviderCard pricing badge.
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  // Disponibilité / urgence (mig 306) — alimente badges ProviderCard.
  emergency_available: boolean | null
  available_24h: boolean | null
  accepts_new_clients: boolean | null
  free_quote: boolean | null
}

/**
 * Race a promise against a timeout. If the promise doesn't resolve within
 * the given ms, rejects with a TimeoutError. Prevents Supabase queries from
 * hanging indefinitely during static generation (the "upstream request timeout"
 * scenario where the HTTP connection hangs without ever throwing).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[withTimeout] ${label} timed out after ${ms}ms`)),
      ms
    )
    promise.then(
      (val) => {
        clearTimeout(timer)
        resolve(val)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

/** Per-query timeout (seconds). Keep well below staticPageGenerationTimeout. */
const QUERY_TIMEOUT_MS = 8_000

/**
 * Retry a function with exponential backoff.
 * Designed for Supabase free tier where statement_timeout (5-8s) causes
 * error code 57014 during heavy static generation (2,498 pages).
 * Each attempt is also guarded by withTimeout to prevent hanging queries.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 2,
  baseDelayMs = 800
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), QUERY_TIMEOUT_MS, label)
    } catch (err: unknown) {
      lastError = err
      const isRetryable =
        err instanceof Error &&
        (err.message?.includes('statement timeout') ||
          err.message?.includes('57014') ||
          err.message?.includes('canceling statement') ||
          err.message?.includes('timed out') ||
          err.message?.includes('upstream request timeout') ||
          err.message?.includes('ECONNRESET') ||
          err.message?.includes('fetch failed'))
      if (!isRetryable || attempt === maxRetries) {
        throw err
      }
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 300
      logger.warn(
        `[retryWithBackoff] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms...`
      )
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastError
}

// Lightweight select for listing pages — all required Provider fields + display fields
// Covers: ProviderCard, ProviderList, GeographicMap, ServiceQuartierPage
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
  // RGE ADEME (migration 380) — exposés pour badge dans ProviderCard
  'rge_qualifications',
  'rge_valid_until',
  'rge_organismes',
  'rge_source_url',
  // Google Places (migration 483) — fallback page-level AggregateRating sur
  // les hubs quand review_count first-party = 0 (audit SEO 10-agents 04-28
  // #5 : +18-25% CTR sur 50K URLs RGE/services). Garde-fous appliqués dans
  // `buildAggregateRatingFromProviders` : count ≥ 3, OPERATIONAL, place_id.
  'google_rating',
  'google_user_ratings_total',
  'google_business_status',
  'google_place_id',
  // Pricing transparency (mig 306 — vivantes en DB).
  // Affichées sur ProviderCard pour lever frein #1 prospects (gap UX 6→9).
  // Surcoût ~16 octets/row × 50 rows page = ~800B (négligeable).
  'hourly_rate_min',
  'hourly_rate_max',
  // Disponibilité / urgence (mig 306 — booleans, ~4 octets/row).
  // Alimentent les badges trust ProviderCard ("Urgences", "Devis gratuit",
  // "Accepte de nouveaux clients"). Signaux authentiques renseignés par
  // l'artisan, pas des compteurs simulés.
  'emergency_available',
  'available_24h',
  'accepts_new_clients',
  'free_quote',
].join(',')

export async function getServices() {
  if (IS_BUILD) return Object.values(staticServices) // Use static data during build
  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, slug, description, icon, category, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  }, 'getServices')
}

// Services statiques en fallback — généré depuis france.ts (couvre les 46 métiers)
import { services as allStaticServices } from '@/lib/data/france'

const staticServices: Record<
  string,
  {
    id: string
    name: string
    slug: string
    description: string
    category: string
    is_active: boolean
  }
> = Object.fromEntries(
  allStaticServices.map((s) => [
    s.slug,
    {
      id: s.slug,
      name: s.name,
      slug: s.slug,
      description: `${s.name} professionnel : devis gratuit, artisans qualifiés.`,
      category: 'Services',
      is_active: true,
    },
  ])
)

export async function getServiceBySlug(slug: string) {
  // During build, use static data only — no DB hit
  if (IS_BUILD) {
    const staticService = staticServices[slug]
    if (staticService) return staticService
    throw new Error(`Service not found: ${slug}`)
  }

  return getCachedData(
    `service:${slug}`,
    async () => {
      try {
        const data = await withTimeout(
          (async () => {
            // .maybeSingle() évite PGRST116 ("Cannot coerce..." — Sentry
            // 7G/7F/7J/7K/7N/7P : ~4700 events/24h en mai 2026) quand le slug
            // existe côté code (`france-light.services` ou nouveaux pSEO RGE
            // type `geometre`, `chauffagiste-rge`) mais pas encore dans la
            // table DB. Le fallback `staticServices` prend le relais.
            const { data, error } = await supabase
              .from('services')
              .select('id, name, slug, description, icon, category, is_active')
              .eq('slug', slug)
              .maybeSingle()

            if (error || !data) {
              const staticService = staticServices[slug]
              if (staticService) return staticService
              if (error) throw error
              return null
            }
            return data
          })(),
          QUERY_TIMEOUT_MS,
          `getServiceBySlug(${slug})`
        )
        return data
      } catch (error) {
        const staticService = staticServices[slug]
        if (staticService) return staticService
        throw error
      }
    },
    CACHE_TTL.services, // 86400s — services ne changent pas
    { skipNull: true }
  )
}

export async function getLocationBySlug(slug: string) {
  if (IS_BUILD) {
    // Use static france.ts fallback during build
    const ville = getVilleBySlugImport(slug)
    if (ville)
      return {
        id: '',
        name: ville.name,
        slug: ville.slug,
        postal_code: ville.codePostal,
        department_code: ville.departementCode,
        department_name: ville.departement,
        region_name: ville.region,
      }
    return null
  }

  return getCachedData(
    `location:${slug}`,
    async () => {
      try {
        const data = await retryWithBackoff(async () => {
          // .maybeSingle() : retourne null sur 0 row au lieu de throw PGRST116.
          // Le slug peut exister dans france.ts static (35 999 communes) sans
          // exister dans `communes` DB → silencieux + fallback static plus bas.
          const { data, error } = await supabase
            .from('communes')
            .select(
              'code_insee, name, slug, code_postal, population, departement_code, departement_name, region_name, latitude, longitude'
            )
            .eq('slug', slug)
            .limit(1)
            .maybeSingle()

          if (error) throw error
          if (!data) throw new Error('Location not found')
          return {
            id: data.code_insee,
            name: data.name,
            slug: data.slug,
            postal_code: data.code_postal,
            population: data.population,
            department_code: data.departement_code,
            department_name: data.departement_name,
            region_name: data.region_name,
            latitude: data.latitude,
            longitude: data.longitude,
          }
        }, `getLocationBySlug(${slug})`)
        return data
      } catch {
        // Fallback to france.ts static data when DB table is empty/missing
        const ville = getVilleBySlugImport(slug)
        if (ville)
          return {
            id: '',
            name: ville.name,
            slug: ville.slug,
            postal_code: ville.codePostal,
            department_code: ville.departementCode,
            department_name: ville.departement,
            region_name: ville.region,
          }
        return null
      }
    },
    CACHE_TTL.locations // 604800s (7j) — communes ne changent jamais
  )
}

// Provider detail SELECT — listing columns + extra fields for artisan detail page.
// All cols verifiees prod via service_role direct (2026-05-10 post-regression
// 591665911 : business_name/first_name/last_name/is_center fabriquees -> 400
// "does not exist", retirees). Mig 306 cols vivantes prod confirmed.
const PROVIDER_DETAIL_SELECT = [
  PROVIDER_LIST_SELECT,
  'address_department',
  'creation_date',
  'employee_count',
  'legal_form',
  'legal_form_code',
  'description',
  'website',
  'email',
  // Mig 306 — vivantes en DB (verifiees prod 2026-05-10).
  'bio',
  'team_size',
  'services_offered',
  'service_prices',
  'faq',
  'opening_hours',
  'intervention_radius_km',
  'phone_secondary',
  'accepts_new_clients',
  'free_quote',
  'available_24h',
  // Mig 306 (Ralph iter 2 — 2026-05-21) : completer le SELECT pour les 5
  // colonnes restantes (avatar_url + arrays certifications/insurance/
  // payment_methods/languages). Vivantes en DB depuis mig 306 mais jamais
  // lues cote code → resolvaient `undefined` sur ProviderRecord. Surcoût
  // negligeable (~150 octets/row, single-row fetch). Debloque :
  //   - E-E-A-T (certifications/insurance pour fiche artisan)
  //   - Schema.org LocalBusiness (languages, payment_methods, image=avatar)
  //   - Agents IA futurs (Quote-Builder, Aides-Calculator)
  //   - AI Act tracabilite (data presente, pas silencieusement NULL)
  // Voir memory `servicesartisans-mig306-status-2026-04-28`.
  'certifications',
  'insurance',
  'payment_methods',
  'languages',
  'avatar_url',
].join(',')

/**
 * Query a single provider by field.
 * Uses PROVIDER_LIST_SELECT (same as listing pages — proven to work).
 */
async function queryProviderDetail(field: 'stable_id' | 'id' | 'slug', value: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Row = Record<string, any>

  // .maybeSingle() : la fiche peut être absente (pSEO publicId pointe sur
  // un stable_id orphelin, ou provider supprimé). Retourner null silencieux
  // → page Next.js déclenche notFound() proprement, pas PGRST116 dans Sentry.
  //
  // Note : on ne filtre PAS sur `noindex` ici. La page rend correctement avec
  // `robots:{index:false}` côté generateMetadata (cf. shouldNoindex). Filtrer
  // côté SELECT renverrait notFound() (404 pour Google) au lieu d'un noindex
  // proprement crawlable+oubliable, ce qui contredit la stratégie noindex
  // RGE-only 2026-04-19. Le 404/noindex split est piloté par la stratégie
  // sitemap (sitemap n'inclut que noindex=false) + filtre de listing dédié.
  const { data } = await supabase
    .from('providers_public')
    .select(PROVIDER_DETAIL_SELECT)
    .eq(field, value)
    .eq('is_active', true)
    .maybeSingle()

  return data ? resolveProviderCity(data as Row) : null
}

// Lookup by stable_id ONLY — no fallback.
export async function getProviderByStableId(stableId: string) {
  if (IS_BUILD) return null // Skip during build — ISR will populate on first visit
  try {
    return await withTimeout(
      queryProviderDetail('stable_id', stableId),
      QUERY_TIMEOUT_MS,
      `getProviderByStableId(${stableId})`
    )
  } catch {
    return null
  }
}

// Lookup by primary UUID id — fallback for providers with no stable_id/slug.
export async function getProviderById(id: string) {
  if (IS_BUILD) return null // Skip during build — ISR will populate on first visit
  try {
    return await withTimeout(
      queryProviderDetail('id', id),
      QUERY_TIMEOUT_MS,
      `getProviderById(${id})`
    )
  } catch {
    return null
  }
}

// Legacy — still used by non-slice code paths. Will be removed in a future PR.
export async function getProviderBySlug(slug: string) {
  if (IS_BUILD) return null // Skip during build — ISR will populate on first visit
  try {
    return await withTimeout(
      queryProviderDetail('slug', slug),
      QUERY_TIMEOUT_MS,
      `getProviderBySlug(${slug})`
    )
  } catch {
    return null
  }
}

// Reverse mapping: service slug → provider specialties (for fallback queries)
// All 30 services (post pivot RGE 2026-05-01) must be mapped here — unmapped
// services can never show providers on quartier pages, causing them to be
// permanently noindexed.
export const SERVICE_TO_SPECIALTIES: Record<string, string[]> = {
  // === Métiers du bâtiment — correspondance directe NAF ===
  plombier: ['plombier'], // NAF 43.22A
  electricien: ['electricien'], // NAF 43.21A
  chauffagiste: ['chauffagiste'], // NAF 43.22B
  menuisier: ['menuisier'], // NAF 43.32A
  couvreur: ['couvreur'], // NAF 43.91B
  macon: ['macon'], // NAF 43.99C
  'peintre-en-batiment': ['peintre', 'peintre-en-batiment'], // NAF 43.34Z
  peintre: ['peintre', 'peintre-en-batiment'], // alias → peintre-en-batiment
  charpentier: ['charpentier'], // NAF 43.91A
  climaticien: ['climaticien'], // NAF 43.22B

  // === Bâtiment / Gros œuvre ===
  zingueur: ['zingueur'], // NAF 43.91B (sous-spécialité couverture)
  etancheiste: ['etancheiste'], // NAF 43.99A
  facadier: ['facadier'], // NAF 43.34Z + 43.99C
  platrier: ['platrier'], // NAF 43.31Z

  // === Finitions / Aménagement ===
  'salle-de-bain': ['salle-de-bain'], // NAF 43.22A + 43.33Z

  // === Énergie / Chauffage ===
  'pompe-a-chaleur': ['pompe-a-chaleur'], // NAF 43.22B
  'panneaux-solaires': ['panneaux-solaires'], // NAF 43.21A + 43.22B
  'isolation-thermique': ['isolation-thermique', 'isolation'], // NAF 43.29A
  'renovation-energetique': ['renovation-energetique'], // NAF 43.29A + 43.22B
  // borne-recharge : NAF 43.21A. Élargi à `electricien` car beaucoup
  // d'installateurs IRVE Qualifelec ont specialty='electricien' en DB —
  // le filtre `.not('rge_qualifications', 'is', null)` côté listing RGE
  // garantit qu'on ne ramène que les certifiés.
  'borne-recharge': ['borne-recharge', 'electricien'],
  ramoneur: ['ramoneur'], // NAF 81.29B

  // === Élargissement RGE 2026-05-02 (slugs RGE-only, pas de hub /services) ===
  // Aucun provider ne porte ces specialty values en DB ; on liste les NAF
  // proches qui hébergent les artisans RGE concernés. Le filtre
  // `.not('rge_qualifications', 'is', null)` du listing RGE filtre les non-RGE.
  // Sprint 2 Phase E 2026-05-04 — `audit-energetique` étendu à `geometre`
  // (NAF 71.12B Activités d'ingénierie) après diagnostic DB :
  // - Avant : 124 RGE actifs nationaux, 0 à Lille (page rendue not-found 200)
  // - 1003 RGE catégorie décret 17 (rénovation globale + accompagnateur)
  // - Distribution : geometre 881 (88%), diagnostiqueur 104, autres 18
  // Le filtre additionnel `rge_categories_decret @> [17]` (cf. RGE_DECRET_FILTER
  // dans service-city-listings.ts) garantit que seuls les géomètres RGE
  // catégorie 17 (vrais BET audit énergétique OPQIBI 1905/1911) remontent —
  // pas les géomètres-experts pure délimitation foncière.
  'chauffe-eau-thermodynamique': ['plombier', 'chauffagiste', 'pompe-a-chaleur'],
  'audit-energetique': ['renovation-energetique', 'diagnostiqueur', 'geometre'],
  ventilation: ['climaticien', 'chauffagiste', 'electricien'],
  fenetres: ['menuisier'],

  // === Diagnostics ===
  diagnostiqueur: ['diagnostiqueur'], // NAF 71.20B

  // Pivot pure-play BTP énergétique 2026-05-02 :
  // jardinier, nettoyage, paysagiste, alarme-securite, demenageur retirés
  // (services à la personne / hors BTP / cannibalisation).
  // Pivot full RGE 2026-05-03 :
  // serrurier, carreleur, vitrier, cuisiniste retirés (commodity, hors RGE).
}

// ---------------------------------------------------------------------------
// Review stats by department (materialized view)
// ---------------------------------------------------------------------------

/**
 * `departmentCode` = CODE INSEE 2-3 chars ('75', '69', '2A'), aligné DB
 * (`providers.address_department` stocke le code, pas le nom — bug fixé
 * 2026-05-05 après audit /rge/pompe-a-chaleur/paris).
 */
export const getReviewStatsByDept = requestCache(
  async (
    serviceSlug: string,
    departmentCode: string
  ): Promise<{
    review_count: number
    avg_rating: number
    latest_review_at: string | null
  } | null> => {
    // React cache() dedupe l'appel duplicate au sein d'un même request render
    // (generateMetadata + page render appellent les 2 helpers — sans `cache()`
    // on touche le process-wide Map JS deux fois, avec on touche zéro fois la
    // 2e). Le getCachedData process-cache reste actif pour les requests
    // suivants (cross-request).
    if (IS_BUILD) return null

    const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
    if (!specialties || specialties.length === 0) return null

    const cacheKey = `review-stats-dept:${serviceSlug}:${departmentCode}`

    return getCachedData(
      cacheKey,
      async () => {
        try {
          return await retryWithBackoff(async () => {
            const { data, error } = await supabase
              .from('review_stats_by_dept')
              .select('review_count, avg_rating, latest_review_at')
              .eq('address_department', departmentCode)
              .in('specialty_slug', specialties)

            if (error) throw error
            if (!data || data.length === 0) return null

            // Aggregate across specialties (a service can map to multiple)
            const totalCount = data.reduce((sum, r) => sum + (r.review_count ?? 0), 0)
            if (totalCount === 0) return null

            const weightedSum = data.reduce(
              (sum, r) => sum + (r.avg_rating ?? 0) * (r.review_count ?? 0),
              0
            )
            const avgRating = Math.round((weightedSum / totalCount) * 10) / 10

            // Latest review across all matching specialties
            const latestReviewAt = data.reduce<string | null>((latest, r) => {
              if (!r.latest_review_at) return latest
              if (!latest) return r.latest_review_at
              return r.latest_review_at > latest ? r.latest_review_at : latest
            }, null)

            return {
              review_count: totalCount,
              avg_rating: avgRating,
              latest_review_at: latestReviewAt,
            }
          }, `getReviewStatsByDept(${serviceSlug}, ${departmentCode})`)
        } catch (err) {
          logger.error(`[getReviewStatsByDept] FAILED for ${serviceSlug}/${departmentCode}:`, {
            error: err instanceof Error ? err.message : err,
          })
          return null
        }
      },
      CACHE_TTL.artisans,
      { skipNull: true }
    )
  }
)

// ---------------------------------------------------------------------------
// Top reviews by department (direct query on reviews + providers)
// ---------------------------------------------------------------------------

interface DeptReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author_name: string | null
  provider_name: string
  provider_city: string | null
}

/**
 * `departmentCode` = CODE INSEE 2-3 chars (DB column stocke le code).
 */
export const getTopReviewsByDept = requestCache(
  async (serviceSlug: string, departmentCode: string, limit?: number): Promise<DeptReview[]> => {
    // React cache() dedupe au sein du request render (cf. getReviewStatsByDept).
    if (IS_BUILD) return []

    const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
    if (!specialties || specialties.length === 0) return []

    const effectiveLimit = Math.min(Math.max(limit ?? 3, 1), 10)
    const cacheKey = `top-reviews-dept:${serviceSlug}:${departmentCode}:${effectiveLimit}`

    return getCachedData(
      cacheKey,
      async () => {
        try {
          return await retryWithBackoff(async () => {
            // Server-side JOIN via RPC (migration 503). Avant : 2 queries client
            // dont un .in('provider_id', [≤500 UUIDs]) qui générait une query
            // string ~18 KB → undici HeadersOverflowError (UND_ERR_HEADERS_OVERFLOW).
            const { data, error } = await supabase.rpc('get_top_reviews_by_dept', {
              p_specialties: specialties,
              p_department_code: departmentCode,
              p_limit: effectiveLimit,
            })

            if (error) throw error
            if (!data || data.length === 0) return []

            return (
              data as Array<{
                id: string
                rating: number
                comment: string | null
                created_at: string
                author_name: string | null
                provider_name: string | null
                provider_city: string | null
              }>
            ).map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              author_name: r.author_name,
              provider_name: r.provider_name ?? 'Artisan',
              provider_city: r.provider_city ?? null,
            }))
          }, `getTopReviewsByDept(${serviceSlug}, ${departmentCode})`)
        } catch (err) {
          logger.error(`[getTopReviewsByDept] FAILED for ${serviceSlug}/${departmentCode}:`, {
            error: err instanceof Error ? err.message : err,
          })
          return []
        }
      },
      CACHE_TTL.artisans
    )
  }
)

export async function getProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string,
  {
    limit = 50,
    offset = 0,
    postalCode,
    rgeOnly = true, // 2026-05-05 pivot full RGE — public listings = RGE certifiés only
  }: { limit?: number; offset?: number; postalCode?: string; rgeOnly?: boolean } = {}
) {
  if (IS_BUILD) return [] // Skip during build — ISR will populate on first visit

  const cacheKey = `providers:svc-loc:${serviceSlug}:${locationSlug}:${limit}:${offset}:${postalCode || ''}${rgeOnly ? ':rge' : ''}`
  const todayIso = new Date().toISOString().slice(0, 10)

  return getCachedData(
    cacheKey,
    async () => {
      // Use STATIC data for service/location — no DB needed. This keeps total function
      // time well under Vercel's 10s serverless timeout (avoids nested retry cascades).
      const ville = getVilleBySlugImport(locationSlug)
      if (!ville) return []

      const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
      if (!specialties || specialties.length === 0) return []

      // STRICT RULE: arrondissement pages (Paris/Lyon/Marseille) show ONLY providers
      // whose address_postal_code matches the exact arrondissement.
      if (postalCode) {
        return await retryWithBackoff(async () => {
          let query = supabase
            .from('providers_public')
            .select(PROVIDER_LIST_SELECT)
            .in('specialty', specialties)
            .eq('address_postal_code', postalCode)
            .eq('is_active', true)
          if (rgeOnly) {
            query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
          }
          const { data, error } = await query
            .order('rge_valid_until', { ascending: false, nullsFirst: false })
            .order('phone', { ascending: false, nullsFirst: false })
            .order('is_verified', { ascending: false })
            .order('name')
            .range(offset, offset + limit - 1)
          if (error) throw error
          return resolveProviderCities((data || []) as unknown as ProviderListRow[])
        }, `getProvidersByServiceAndLocation:postal(${serviceSlug}, ${postalCode})`)
      }

      const cityValues = getCityValues(ville.name, ville.departementCode)

      try {
        return await retryWithBackoff(async () => {
          // Primary: direct specialty + city (fast — uses index + .in())
          let primary = supabase
            .from('providers_public')
            .select(PROVIDER_LIST_SELECT)
            .in('specialty', specialties)
            .in('address_city', cityValues)
            .eq('is_active', true)
          if (rgeOnly) {
            primary = primary.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
          }
          const { data: direct, error: directError } = await primary
            // RGE certified ranked first (Option C), then phone, verified, name.
            .order('rge_valid_until', { ascending: false, nullsFirst: false })
            .order('phone', { ascending: false, nullsFirst: false })
            .order('is_verified', { ascending: false })
            .order('name')
            .range(offset, offset + limit - 1)

          if (directError) {
            logger.warn(
              `[getProvidersByServiceAndLocation] primary query error for ${serviceSlug}/${locationSlug}:`,
              { error: directError.message }
            )
          }

          if (!directError && direct && direct.length > 0)
            return resolveProviderCities(direct as unknown as ProviderListRow[])

          return []
        }, `getProvidersByServiceAndLocation(${serviceSlug}, ${locationSlug})`)
      } catch (err) {
        // Re-throw so ISR keeps stale cached page instead of caching empty results.
        // Page component catches this and renders gracefully on first cold visit.
        logger.error(
          `[getProvidersByServiceAndLocation] FAILED for ${serviceSlug}/${locationSlug}:`,
          { error: err instanceof Error ? err.message : err }
        )
        throw err
      }
    },
    CACHE_TTL.artisans, // 3600s (1h)
    { skipNull: true }
  )
}

/**
 * Fallback: fetch providers by service + département (not city).
 * Used when a service×city page has 0 local providers — we show artisans
 * from the same département instead of an empty page.
 */
/**
 * `departmentCode` = CODE INSEE 2-3 chars (DB column stocke le code).
 * Default `rgeOnly: true` depuis pivot 2026-05-05 (SA = annuaire RGE).
 */
export async function getProvidersByServiceAndDepartment(
  serviceSlug: string,
  departmentCode: string,
  options?: { limit?: number; rgeOnly?: boolean }
) {
  if (IS_BUILD) return []

  const limit = options?.limit ?? 6
  const rgeOnly = options?.rgeOnly ?? true
  // encodeURIComponent prevents segment ambiguity from special chars (accents,
  // hyphens, theoretical colons) in cache keys — see security audit MED finding.
  const cacheKey = `providers:svc-dept:${serviceSlug}:${encodeURIComponent(departmentCode)}:${limit}${rgeOnly ? ':rge' : ''}`
  const todayIso = new Date().toISOString().slice(0, 10)

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
        if (!specialties || specialties.length === 0) return []

        return await retryWithBackoff(async () => {
          let query = supabase
            .from('providers_public')
            .select(PROVIDER_LIST_SELECT)
            .in('specialty', specialties)
            .eq('address_department', departmentCode)
            .eq('is_active', true)

          if (rgeOnly) {
            query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
          }

          const { data, error } = await query
            .order('rge_valid_until', { ascending: false, nullsFirst: false })
            .order('rating_average', { ascending: false, nullsFirst: false })
            .order('review_count', { ascending: false })
            .limit(limit)

          if (error) throw error
          return resolveProviderCities((data || []) as unknown as ProviderListRow[])
        }, `getProvidersByServiceAndDepartment(${serviceSlug}, ${departmentCode})`)
      } catch (err) {
        logger.error(
          `[getProvidersByServiceAndDepartment] FAILED for ${serviceSlug}/${departmentCode}:`,
          { error: err instanceof Error ? err.message : err }
        )
        return []
      }
    },
    CACHE_TTL.artisans,
    { skipNull: true }
  )
}

/**
 * Lightweight check: does this service+location combo have any providers?
 * Uses head:true + count:exact to avoid fetching rows — much faster than
 * getProvidersByServiceAndLocation during static generation.
 * 2026-05-05 pivot full RGE — default `rgeOnly: true` (page publique noindex
 * si 0 RGE certifiés). Admin/debug peut bypass via `{ rgeOnly: false }`.
 */
export async function hasProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string,
  options: { rgeOnly?: boolean } = {}
): Promise<boolean> {
  // Fail open: assume providers exist during build so pages are indexed by default.
  // ISR will correct to noindex if truly 0 providers on first revalidation.
  if (IS_BUILD) return true

  const rgeOnly = options.rgeOnly ?? true

  return getCachedData(
    `has-providers:svc-loc:${serviceSlug}:${locationSlug}${rgeOnly ? ':rge' : ''}`,
    async () => {
      try {
        return await retryWithBackoff(
          async () => {
            const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
            if (!specialties || specialties.length === 0) return false

            const ville = getVilleBySlugImport(locationSlug)
            const cityName = ville?.name
            if (!cityName) return false

            const cityValues = getCityValues(cityName, ville?.departementCode)
            let query = supabase
              .from('providers_public')
              .select('id', { count: 'exact', head: true })
              .in('specialty', specialties)
              .in('address_city', cityValues)
              .eq('is_active', true)
            if (rgeOnly) {
              const todayIso = new Date().toISOString().slice(0, 10)
              query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
            }
            const { count, error } = await query

            if (error) throw error
            return (count ?? 0) > 0
          },
          `hasProvidersByServiceAndLocation(${serviceSlug}, ${locationSlug}${rgeOnly ? ', rge' : ''})`
        )
      } catch {
        // On any failure, conservatively return false (noindex)
        return false
      }
    },
    CACHE_TTL.artisans
  )
}

/**
 * Return the count of providers for a service+location combo.
 * Uses head:true + count:exact to avoid fetching rows — lightweight.
 * Fail open: returns 1 during build so pages are indexed by default.
 * ISR will correct with the real count on first revalidation.
 */
export async function getProviderCountByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string,
  { rgeOnly = true }: { rgeOnly?: boolean } = {} // 2026-05-05 pivot full RGE
): Promise<number> {
  // Fail open: default to 1 during build so pages are indexed (not noindexed).
  // ISR will correct with the real DB count on first revalidation.
  if (IS_BUILD) return 1

  return getCachedData(
    `provider-count:svc-loc:${serviceSlug}:${locationSlug}${rgeOnly ? ':rge' : ''}`,
    async () => {
      try {
        return await retryWithBackoff(
          async () => {
            const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
            if (!specialties || specialties.length === 0) return 0

            const ville = getVilleBySlugImport(locationSlug)
            const cityName = ville?.name
            if (!cityName) return 0

            const cityValues = getCityValues(cityName, ville?.departementCode)
            let query = supabase
              .from('providers_public')
              .select('id', { count: 'exact', head: true })
              .in('specialty', specialties)
              .in('address_city', cityValues)
              .eq('is_active', true)
            if (rgeOnly) {
              const todayIso = new Date().toISOString().slice(0, 10)
              query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
            }
            const { count, error } = await query

            if (error) throw error
            return count ?? 0
          },
          `getProviderCountByServiceAndLocation(${serviceSlug}, ${locationSlug}${rgeOnly ? ', rge' : ''})`
        )
      } catch {
        return 0
      }
    },
    CACHE_TTL.artisans // 3600s (1h)
  )
}

/**
 * Variante stricte de `getProviderCountByServiceAndLocation` : renvoie un
 * discriminant `ok` pour distinguer un count=0 légitime d'une erreur DB
 * transitoire. Utilisée par la stratégie SEO 410 (fail-open sur erreur).
 *
 * Build time : `{ ok: true, count: 1 }` (fail-open comme la version safe).
 */
export async function getProviderCountByServiceAndLocationStrict(
  serviceSlug: string,
  locationSlug: string,
  { rgeOnly = true }: { rgeOnly?: boolean } = {} // 2026-05-05 pivot full RGE
): Promise<{ ok: true; count: number } | { ok: false }> {
  if (IS_BUILD) return { ok: true, count: 1 }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return { ok: true, count: 0 }

  const ville = getVilleBySlugImport(locationSlug)
  const cityName = ville?.name
  if (!cityName) return { ok: true, count: 0 }

  const cityValues = getCityValues(cityName, ville?.departementCode)

  try {
    let query = supabase
      .from('providers_public')
      .select('id', { count: 'exact', head: true })
      .in('specialty', specialties)
      .in('address_city', cityValues)
      .eq('is_active', true)
    if (rgeOnly) {
      const todayIso = new Date().toISOString().slice(0, 10)
      query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
    }
    const { count, error } = await query
    if (error) throw error
    return { ok: true, count: count ?? 0 }
  } catch (err) {
    logger.warn(
      `[getProviderCountByServiceAndLocationStrict] transient error for ${serviceSlug}/${locationSlug}${rgeOnly ? ':rge' : ''}`,
      { error: err instanceof Error ? err.message : err }
    )
    return { ok: false }
  }
}

/**
 * Return the count of RGE-certified providers for a service+location combo.
 * Counts providers where `rge_qualifications` is not null AND `rge_valid_until`
 * is still valid (>= today). Uses head:true + count:exact for lightweight query.
 * Fail-open: returns 0 during build or on error.
 */
export async function getRgeProviderCountByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string
): Promise<number> {
  if (IS_BUILD) return 0

  const cached = await getCachedData<number | null>(
    `rge-provider-count:svc-loc:${serviceSlug}:${locationSlug}`,
    async () => {
      try {
        return await retryWithBackoff(async () => {
          const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
          if (!specialties || specialties.length === 0) return 0

          const ville = getVilleBySlugImport(locationSlug)
          const cityName = ville?.name
          if (!cityName) return 0

          const cityValues = getCityValues(cityName, ville?.departementCode)
          const today = new Date().toISOString().slice(0, 10)
          const { count, error } = await supabase
            .from('providers_public')
            .select('id', { count: 'exact', head: true })
            .in('specialty', specialties)
            .in('address_city', cityValues)
            .eq('is_active', true)
            .not('rge_qualifications', 'is', null)
            .gte('rge_valid_until', today)

          if (error) throw error
          return count ?? 0
        }, `getRgeProviderCountByServiceAndLocation(${serviceSlug}, ${locationSlug})`)
      } catch {
        return null
      }
    },
    CACHE_TTL.artisans, // 3600s (1h)
    { skipNull: true }
  )
  return cached ?? 0
}

/**
 * Liste de tous les providers d'une ville (toutes spécialités).
 * 2026-05-05 pivot full RGE — default `rgeOnly: true`. Admin/debug peut
 * passer `{ rgeOnly: false }` pour bypass.
 */
export async function getProvidersByLocation(
  locationSlug: string,
  options: { rgeOnly?: boolean } = {}
) {
  if (IS_BUILD) return [] // Skip during build

  // Use STATIC data for location — no DB needed
  const ville = getVilleBySlugImport(locationSlug)
  if (!ville) return []

  const rgeOnly = options.rgeOnly ?? true
  const cityValues = getCityValues(ville.name, ville.departementCode)
  const todayIso = new Date().toISOString().slice(0, 10)

  return getCachedData(
    `providers:location:${locationSlug}${rgeOnly ? ':rge' : ''}`,
    async () => {
      try {
        return await retryWithBackoff(
          async () => {
            let query = supabase
              .from('providers_public')
              .select(PROVIDER_LIST_SELECT)
              .in('address_city', cityValues)
              .eq('is_active', true)
            if (rgeOnly) {
              query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
            }
            const { data, error } = await query
              .order('rge_valid_until', { ascending: false, nullsFirst: false })
              .order('phone', { ascending: false, nullsFirst: false })
              .order('is_verified', { ascending: false })
              .order('name')
              .limit(500)

            if (error) throw error
            return resolveProviderCities((data || []) as unknown as ProviderListRow[])
          },
          `getProvidersByLocation(${locationSlug}${rgeOnly ? ', rge' : ''})`
        )
      } catch (err) {
        logger.error(`[getProvidersByLocation] FAILED for ${locationSlug}:`, {
          error: err instanceof Error ? err.message : err,
        })
        throw err
      }
    },
    CACHE_TTL.artisans,
    { skipNull: true }
  )
}

export async function getAllProviders() {
  if (IS_BUILD) return [] // Skip during build

  return getCachedData(
    'providers:all',
    async () => {
      return retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('providers_public')
          .select(PROVIDER_LIST_SELECT)
          .eq('is_active', true)
          .order('rge_valid_until', { ascending: false, nullsFirst: false })
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .order('name')
          .limit(1000)

        if (error) throw error
        return resolveProviderCities((data || []) as unknown as ProviderListRow[])
      }, 'getAllProviders')
    },
    CACHE_TTL.artisans, // 3600s (1h)
    { skipNull: true }
  )
}

/**
 * Liste des providers pour un service. Default RGE-only depuis pivot
 * 2026-05-05 (SA = annuaire 100% RGE certifiés). Les pages publiques
 * ne doivent référencer QUE des artisans RGE — admin peut passer
 * `{ rgeOnly: false }` pour bypass.
 */
export async function getProvidersByService(
  serviceSlug: string,
  limit?: number,
  options: { rgeOnly?: boolean } = {}
) {
  if (IS_BUILD) return [] // Skip during build

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return []

  const rgeOnly = options.rgeOnly ?? true
  const effectiveLimit = limit || 50
  const todayIso = new Date().toISOString().slice(0, 10)
  try {
    return await retryWithBackoff(
      async () => {
        let query = supabase
          .from('providers_public')
          .select(PROVIDER_LIST_SELECT)
          .in('specialty', specialties)
          .eq('is_active', true)
        if (rgeOnly) {
          query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
        }
        const { data, error } = await query
          .order('rge_valid_until', { ascending: false, nullsFirst: false })
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .limit(effectiveLimit)

        if (error) throw error
        return resolveProviderCities((data || []) as unknown as ProviderListRow[])
      },
      `getProvidersByService(${serviceSlug}${rgeOnly ? ', rge' : ''})`
    )
  } catch {
    return []
  }
}

/**
 * Comptage providers pour un service. Default RGE-only depuis pivot
 * 2026-05-05.
 */
export async function getProviderCountByService(
  serviceSlug: string,
  options: { rgeOnly?: boolean } = {}
): Promise<number> {
  if (IS_BUILD) return 0
  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return 0
  const rgeOnly = options.rgeOnly ?? true
  const todayIso = new Date().toISOString().slice(0, 10)
  try {
    return await withTimeout(
      (async () => {
        let query = supabase
          .from('providers_public')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .eq('is_active', true)
        if (rgeOnly) {
          query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
        }
        const { count, error } = await query
        if (error) throw error
        return count ?? 0
      })(),
      QUERY_TIMEOUT_MS,
      `getProviderCountByService(${serviceSlug}${rgeOnly ? ', rge' : ''})`
    )
  } catch {
    return 0
  }
}

/**
 * Count recent devis requests (last 30 days) for a service×department pair.
 * Uses postal_code prefix to match the department (French postal codes start with dept code).
 * Fail-open: returns 0 on any error.
 */
export async function getDevisCountByDept(
  serviceSlug: string,
  departmentCode: string
): Promise<number> {
  if (IS_BUILD) return 0

  const cacheKey = `devis-count:${serviceSlug}:${departmentCode}`

  const cached = await getCachedData<number | null>(
    cacheKey,
    async () => {
      try {
        return await retryWithBackoff(async () => {
          const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
          if (!specialties || specialties.length === 0) return 0

          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const postalPrefix = `${departmentCode}%`

          // N round-trips parallèles (specialties.length ≤ 3) : -2× latence
          // vs for-loop séquentiel. Un seul fail = throw → retryWithBackoff.
          const counts = await Promise.all(
            specialties.map(async (specialty) => {
              const { count, error } = await supabase
                .from('devis_requests')
                .select('*', { count: 'exact', head: true })
                .ilike('service_name', specialty)
                .like('postal_code', postalPrefix)
                .gte('created_at', thirtyDaysAgo.toISOString())
              if (error) throw error
              return count ?? 0
            })
          )
          return counts.reduce((a, b) => a + b, 0)
        }, `getDevisCountByDept(${serviceSlug}, ${departmentCode})`)
      } catch {
        return null
      }
    },
    CACHE_TTL.stats,
    { skipNull: true }
  )
  return cached ?? 0
}

/**
 * 2026-05-05 pivot full RGE — default `rgeOnly: true`. Liste les villes où il
 * y a au moins un artisan RGE actif pour ce service.
 */
export async function getLocationsByService(
  serviceSlug: string,
  options: { rgeOnly?: boolean } = {}
) {
  if (IS_BUILD) return [] // Skip during build

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return []

  const rgeOnly = options.rgeOnly ?? true
  const todayIso = new Date().toISOString().slice(0, 10)

  return retryWithBackoff(async () => {
    // Step 1: get distinct cities from active providers with this specialty
    let citiesQuery = supabase
      .from('providers_public')
      .select('address_city')
      .in('specialty', specialties)
      .eq('is_active', true)
      .not('address_city', 'is', null)
    if (rgeOnly) {
      citiesQuery = citiesQuery
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', todayIso)
    }
    const { data: providerCities, error: citiesError } = await citiesQuery.limit(500)

    if (citiesError) throw citiesError
    if (!providerCities || providerCities.length === 0) return []

    const uniqueCityNames = Array.from(
      new Set(providerCities.map((p) => p.address_city).filter(Boolean))
    ) as string[]

    // Step 2: look up commune data (slug, dept, region) for those cities
    const { data: communes, error: communesError } = await supabase
      .from('communes')
      .select('code_insee, name, slug, departement_code, region_name')
      .in('name', uniqueCityNames.slice(0, 200))
      .order('population', { ascending: false })
      .limit(100)

    if (communesError) throw communesError

    return (communes || []).map((c) => ({
      id: c.code_insee,
      name: c.name,
      slug: c.slug,
      department_code: c.departement_code,
      region_name: c.region_name,
    }))
  }, `getLocationsByService(${serviceSlug})`)
}
