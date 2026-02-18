import { createClient } from '@supabase/supabase-js'
import { getVilleBySlug as getVilleBySlugImport } from '@/lib/data/france'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Detect if we're inside `next build` (static generation phase).
 * During build, skip heavy DB queries to avoid overwhelming Supabase free tier.
 * Pages use ISR (revalidate) so they'll get fresh data on first visit.
 */
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build'

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
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
      ms,
    )
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
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
  baseDelayMs = 800,
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
      console.warn(
        `[retryWithBackoff] ${label} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms...`,
      )
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastError
}

const PROVIDER_SELECT = `
  *,
  provider_services(
    service:services(*)
  ),
  provider_locations(
    location:locations(*)
  )
`

export async function getServices() {
  if (IS_BUILD) return Object.values(staticServices) // Use static data during build
  return withTimeout(
    (async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    })(),
    QUERY_TIMEOUT_MS,
    'getServices',
  )
}

// Services statiques en fallback — généré depuis france.ts (couvre les 46 métiers)
import { services as allStaticServices } from '@/lib/data/france'

const staticServices: Record<string, { id: string; name: string; slug: string; description: string; category: string; is_active: boolean }> =
  Object.fromEntries(
    allStaticServices.map(s => [
      s.slug,
      { id: s.slug, name: s.name, slug: s.slug, description: `${s.name} professionnel : devis gratuit, artisans qualifiés.`, category: 'Services', is_active: true },
    ])
  )

export async function getServiceBySlug(slug: string) {
  // During build, use static data only — no DB hit
  if (IS_BUILD) {
    const staticService = staticServices[slug]
    if (staticService) return staticService
    throw new Error(`Service not found: ${slug}`)
  }

  try {
    const data = await withTimeout(
      (async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error || !data) {
          const staticService = staticServices[slug]
          if (staticService) return staticService
          throw error || new Error('Service not found')
        }
        return data
      })(),
      QUERY_TIMEOUT_MS,
      `getServiceBySlug(${slug})`,
    )
    return data
  } catch (error) {
    const staticService = staticServices[slug]
    if (staticService) return staticService
    throw error
  }
}

export async function getLocationBySlug(slug: string) {
  if (IS_BUILD) {
    // Use static france.ts fallback during build
    const ville = getVilleBySlugImport(slug)
    if (ville) return { id: '', name: ville.name, slug: ville.slug, postal_code: ville.codePostal }
    return null
  }

  try {
    const data = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error || !data) throw error || new Error('Location not found')
        return data
      },
      `getLocationBySlug(${slug})`,
    )
    return data
  } catch {
    // Fallback to france.ts static data when DB table is empty/missing
    const ville = getVilleBySlugImport(slug)
    if (ville) return { id: '', name: ville.name, slug: ville.slug, postal_code: ville.codePostal }
    return null
  }
}

// Lookup by stable_id ONLY — no fallback.
export async function getProviderByStableId(stableId: string) {
  return withTimeout(
    (async () => {
      const { data } = await supabase
        .from('providers')
        .select(PROVIDER_SELECT)
        .eq('stable_id', stableId)
        .eq('is_active', true)
        .single()

      return data || null
    })(),
    QUERY_TIMEOUT_MS,
    `getProviderByStableId(${stableId})`,
  )
}

// Legacy — still used by non-slice code paths. Will be removed in a future PR.
export async function getProviderBySlug(slug: string) {
  return withTimeout(
    (async () => {
      const { data } = await supabase
        .from('providers')
        .select(PROVIDER_SELECT)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      return data || null
    })(),
    QUERY_TIMEOUT_MS,
    `getProviderBySlug(${slug})`,
  )
}

// Reverse mapping: service slug → provider specialties (for fallback queries)
// All 46 services must be mapped here — unmapped services can never show providers
// on quartier pages, causing them to be permanently noindexed.
const SERVICE_TO_SPECIALTIES: Record<string, string[]> = {
  // --- Core trades (direct match) ---
  'plombier': ['plombier'],
  'electricien': ['electricien'],
  'chauffagiste': ['chauffagiste'],
  'menuisier': ['menuisier', 'menuisier-metallique'],
  'carreleur': ['carreleur'],
  'couvreur': ['couvreur', 'charpentier'],
  'macon': ['macon'],
  'peintre-en-batiment': ['peintre', 'platrier', 'finition'],
  'climaticien': ['isolation', 'chauffagiste'],
  'serrurier': ['serrurier', 'menuisier-metallique'],
  'jardinier': ['jardinier', 'paysagiste'],
  'vitrier': ['vitrier', 'miroitier', 'menuisier'],
  'cuisiniste': ['cuisiniste', 'installateur-de-cuisine', 'menuisier'],
  'solier': ['solier', 'poseur-de-parquet', 'moquettiste', 'carreleur'],
  'nettoyage': ['nettoyage', 'nettoyage-professionnel'],

  // --- Bâtiment / Gros œuvre (linked to macon, couvreur, charpentier) ---
  'terrassier': ['terrassier', 'terrassement', 'macon'],
  'charpentier': ['charpentier', 'couvreur'],
  'zingueur': ['zingueur', 'couvreur-zingueur', 'couvreur'],
  'etancheiste': ['etancheiste', 'etancheite', 'couvreur', 'macon'],
  'facadier': ['facadier', 'facade', 'ravalement', 'peintre', 'macon'],
  'platrier': ['platrier', 'plaquiste', 'platrerie', 'finition'],
  'metallier': ['metallier', 'metallerie', 'menuisier-metallique'],
  'ferronnier': ['ferronnier', 'ferronnerie', 'menuisier-metallique'],

  // --- Finitions / Aménagement (linked to menuisier, peintre, plombier) ---
  'poseur-de-parquet': ['poseur-de-parquet', 'parqueteur', 'solier', 'menuisier'],
  'miroitier': ['miroitier', 'vitrier', 'menuisier'],
  'storiste': ['storiste', 'store', 'volet', 'menuisier'],
  'salle-de-bain': ['salle-de-bain', 'installateur-de-salle-de-bain', 'plombier', 'carreleur'],
  'architecte-interieur': ['architecte-interieur', 'architecte-d-interieur', 'decoration', 'peintre'],
  'decorateur': ['decorateur', 'decoration', 'peintre-decorateur', 'peintre'],

  // --- Énergie / Chauffage (linked to electricien, chauffagiste, couvreur) ---
  'domoticien': ['domoticien', 'domotique', 'electricien'],
  'pompe-a-chaleur': ['pompe-a-chaleur', 'pac', 'chauffagiste'],
  'panneaux-solaires': ['panneaux-solaires', 'photovoltaique', 'solaire', 'electricien', 'couvreur'],
  'isolation-thermique': ['isolation', 'isolation-thermique', 'ite', 'iti', 'macon'],
  'renovation-energetique': ['renovation-energetique', 'rge', 'isolation', 'chauffagiste', 'macon'],
  'borne-recharge': ['borne-recharge', 'borne-electrique', 'electricien'],
  'ramoneur': ['ramoneur', 'ramonage', 'chauffagiste'],

  // --- Extérieur (linked to macon, peintre) ---
  'paysagiste': ['paysagiste', 'jardinier', 'amenagement-exterieur', 'macon'],
  'pisciniste': ['pisciniste', 'piscine', 'macon', 'plombier'],

  // --- Sécurité / Technique (linked to electricien) ---
  'alarme-securite': ['alarme', 'securite', 'videosurveillance', 'alarme-securite', 'electricien'],
  'antenniste': ['antenniste', 'antenne', 'electricien'],
  'ascensoriste': ['ascensoriste', 'ascenseur', 'electricien'],

  // --- Diagnostics / Conseil (linked to macon, electricien) ---
  'diagnostiqueur': ['diagnostiqueur', 'diagnostic', 'dpe', 'electricien'],
  'geometre': ['geometre', 'geometre-expert', 'macon'],

  // --- Services spécialisés ---
  'desinsectisation': ['desinsectisation', 'desinsectiseur', 'nuisibles', 'nettoyage'],
  'deratisation': ['deratisation', 'deratiseur', 'nuisibles', 'nettoyage'],
  'demenageur': ['demenageur', 'demenagement'],
}

export async function getProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string
) {
  if (IS_BUILD) return [] // Skip during build — ISR will populate on first visit
  // Use retry with backoff to handle statement_timeout during static generation
  return retryWithBackoff(
    async () => {
      const [service, location] = await Promise.all([
        getServiceBySlug(serviceSlug),
        getLocationBySlug(locationSlug),
      ])

      if (!service || !location) return []

      // Primary query: via provider_services join (works when join table is populated)
      if (isValidUUID(service.id)) {
        const { data, error } = await supabase
          .from('providers')
          .select(`
            *,
            provider_services!inner(service_id)
          `)
          .eq('provider_services.service_id', service.id)
          .ilike('address_city', location.name)
          .eq('is_active', true)
          .order('is_verified', { ascending: false })
          .order('name')
          .limit(50)

        if (!error && data && data.length > 0) return data
      }

      // Fallback: direct query by specialty + city (uses indexed columns)
      const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
      if (!specialties || specialties.length === 0) return []

      const { data: fallback, error: fbError } = await supabase
        .from('providers')
        .select('*')
        .in('specialty', specialties)
        .ilike('address_city', `%${location.name}%`)
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('name')
        .limit(50)

      if (fbError) throw fbError
      return fallback || []
    },
    `getProvidersByServiceAndLocation(${serviceSlug}, ${locationSlug})`,
  )
}

/**
 * Lightweight check: does this service+location combo have any providers?
 * Uses head:true + count:exact to avoid fetching rows — much faster than
 * getProvidersByServiceAndLocation during static generation.
 */
export async function hasProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string,
): Promise<boolean> {
  if (IS_BUILD) return false // Conservative: noindex during build, ISR will update
  try {
    return await retryWithBackoff(
      async () => {
        const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
        if (!specialties || specialties.length === 0) return false

        const ville = getVilleBySlugImport(locationSlug)
        const cityName = ville?.name
        if (!cityName) return false

        const { count, error } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .ilike('address_city', cityName)
          .eq('is_active', true)

        if (error) throw error
        return (count ?? 0) > 0
      },
      `hasProvidersByServiceAndLocation(${serviceSlug}, ${locationSlug})`,
    )
  } catch {
    // On any failure, conservatively return false (noindex)
    return false
  }
}

/**
 * Return the count of providers for a service+location combo.
 * Uses head:true + count:exact to avoid fetching rows — lightweight.
 * Returns 0 during build or on failure.
 */
export async function getProviderCountByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string,
): Promise<number> {
  if (IS_BUILD) return 0
  try {
    return await retryWithBackoff(
      async () => {
        const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
        if (!specialties || specialties.length === 0) return 0

        const ville = getVilleBySlugImport(locationSlug)
        const cityName = ville?.name
        if (!cityName) return 0

        const { count, error } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .ilike('address_city', cityName)
          .eq('is_active', true)

        if (error) throw error
        return count ?? 0
      },
      `getProviderCountByServiceAndLocation(${serviceSlug}, ${locationSlug})`,
    )
  } catch {
    return 0
  }
}

export async function getProvidersByLocation(locationSlug: string) {
  if (IS_BUILD) return [] // Skip during build
  return retryWithBackoff(
    async () => {
      const location = await getLocationBySlug(locationSlug)
      if (!location) return []

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .ilike('address_city', location.name)
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('name')
        .limit(100)

      if (error) throw error
      return data || []
    },
    `getProvidersByLocation(${locationSlug})`,
  )
}

export async function getAllProviders() {
  if (IS_BUILD) return [] // Skip during build
  return withTimeout(
    (async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('name')

      if (error) throw error
      return data || []
    })(),
    QUERY_TIMEOUT_MS,
    'getAllProviders',
  )
}

export async function getProvidersByService(serviceSlug: string, limit?: number) {
  if (IS_BUILD) return [] // Skip during build
  return retryWithBackoff(
    async () => {
      const service = await getServiceBySlug(serviceSlug)
      if (!service) return []
      if (!isValidUUID(service.id)) return []

      const effectiveLimit = limit || 50

      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_services!inner(service_id),
          provider_locations(
            location:locations(name, slug)
          )
        `)
        .eq('provider_services.service_id', service.id)
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .limit(effectiveLimit)

      if (error) throw error
      return data
    },
    `getProvidersByService(${serviceSlug})`,
  )
}

export async function getLocationsByService(serviceSlug: string) {
  if (IS_BUILD) return [] // Skip during build
  return retryWithBackoff(
    async () => {
      const service = await getServiceBySlug(serviceSlug)
      if (!service) return []
      if (!isValidUUID(service.id)) return []

      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          provider_locations!inner(
            provider:providers!inner(
              provider_services!inner(service_id)
            )
          )
        `)
        .eq('provider_locations.provider.provider_services.service_id', service.id)
        .eq('is_active', true)
        .order('population', { ascending: false })
        .limit(100)

      if (error) throw error
      return data
    },
    `getLocationsByService(${serviceSlug})`,
  )
}
