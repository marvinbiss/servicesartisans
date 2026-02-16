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

// Services statiques en fallback
const staticServices: Record<string, { id: string; name: string; slug: string; description: string; category: string; is_active: boolean }> = {
  'plombier': { id: 'plombier', name: 'Plombier', slug: 'plombier', description: 'Installation et réparation de plomberie, débouchage, chauffe-eau.', category: 'Urgences', is_active: true },
  'electricien': { id: 'electricien', name: 'Électricien', slug: 'electricien', description: 'Installation électrique, dépannage, mise aux normes.', category: 'Urgences', is_active: true },
  'serrurier': { id: 'serrurier', name: 'Serrurier', slug: 'serrurier', description: 'Ouverture de porte, changement de serrure, blindage.', category: 'Urgences', is_active: true },
  'chauffagiste': { id: 'chauffagiste', name: 'Chauffagiste', slug: 'chauffagiste', description: 'Installation et entretien de chaudières, pompes à chaleur.', category: 'Chauffage', is_active: true },
  'peintre-en-batiment': { id: 'peintre-en-batiment', name: 'Peintre en bâtiment', slug: 'peintre-en-batiment', description: 'Peinture intérieure et extérieure, ravalement de façade.', category: 'Finitions', is_active: true },
  'menuisier': { id: 'menuisier', name: 'Menuisier', slug: 'menuisier', description: 'Fabrication et pose de menuiseries, escaliers, placards.', category: 'Bâtiment', is_active: true },
  'carreleur': { id: 'carreleur', name: 'Carreleur', slug: 'carreleur', description: 'Pose de carrelage, faïence, mosaïque.', category: 'Finitions', is_active: true },
  'couvreur': { id: 'couvreur', name: 'Couvreur', slug: 'couvreur', description: 'Réparation et rénovation de toiture, zinguerie.', category: 'Bâtiment', is_active: true },
  'macon': { id: 'macon', name: 'Maçon', slug: 'macon', description: 'Construction, rénovation, extension de maison.', category: 'Bâtiment', is_active: true },
  'jardinier': { id: 'jardinier', name: 'Jardinier', slug: 'jardinier', description: 'Entretien de jardin, taille, élagage.', category: 'Extérieur', is_active: true },
  'paysagiste': { id: 'paysagiste', name: 'Paysagiste', slug: 'paysagiste', description: 'Aménagement paysager, création de jardins.', category: 'Extérieur', is_active: true },
  'vitrier': { id: 'vitrier', name: 'Vitrier', slug: 'vitrier', description: 'Remplacement de vitres, double vitrage, miroirs.', category: 'Bâtiment', is_active: true },
  'climaticien': { id: 'climaticien', name: 'Climaticien', slug: 'climaticien', description: 'Installation et entretien de climatisation, réversible.', category: 'Chauffage', is_active: true },
  'cuisiniste': { id: 'cuisiniste', name: 'Cuisiniste', slug: 'cuisiniste', description: 'Conception, fabrication et installation de cuisines sur mesure.', category: 'Aménagement', is_active: true },
  'solier': { id: 'solier', name: 'Solier', slug: 'solier', description: 'Pose de revêtements de sols : parquet, moquette, lino, carrelage souple.', category: 'Finitions', is_active: true },
  'nettoyage': { id: 'nettoyage', name: 'Nettoyage', slug: 'nettoyage', description: 'Nettoyage professionnel, ménage, entretien de locaux.', category: 'Services', is_active: true },
  // ── Nouveaux métiers (31) ──
  'terrassier': { id: 'terrassier', name: 'Terrassier', slug: 'terrassier', description: 'Travaux de terrassement, fouilles, VRD, assainissement.', category: 'Bâtiment', is_active: true },
  'charpentier': { id: 'charpentier', name: 'Charpentier', slug: 'charpentier', description: 'Conception et pose de charpentes bois et métalliques.', category: 'Bâtiment', is_active: true },
  'zingueur': { id: 'zingueur', name: 'Zingueur', slug: 'zingueur', description: 'Travaux de zinguerie, gouttières, chéneaux, descentes.', category: 'Bâtiment', is_active: true },
  'etancheiste': { id: 'etancheiste', name: 'Étanchéiste', slug: 'etancheiste', description: 'Étanchéité de toitures-terrasses, balcons, fondations.', category: 'Bâtiment', is_active: true },
  'facadier': { id: 'facadier', name: 'Façadier', slug: 'facadier', description: 'Ravalement de façade, enduits, isolation par l\'extérieur.', category: 'Bâtiment', is_active: true },
  'platrier': { id: 'platrier', name: 'Plâtrier', slug: 'platrier', description: 'Plâtrerie, cloisons, faux-plafonds, staff et stuc.', category: 'Finitions', is_active: true },
  'metallier': { id: 'metallier', name: 'Métallier', slug: 'metallier', description: 'Fabrication et pose d\'ouvrages métalliques : escaliers, garde-corps, verrières.', category: 'Bâtiment', is_active: true },
  'ferronnier': { id: 'ferronnier', name: 'Ferronnier', slug: 'ferronnier', description: 'Ferronnerie d\'art, portails, grilles, rampes en fer forgé.', category: 'Bâtiment', is_active: true },
  'poseur-de-parquet': { id: 'poseur-de-parquet', name: 'Poseur de parquet', slug: 'poseur-de-parquet', description: 'Pose, ponçage et vitrification de parquets.', category: 'Finitions', is_active: true },
  'miroitier': { id: 'miroitier', name: 'Miroitier', slug: 'miroitier', description: 'Pose de miroirs, vitrines, crédences en verre, parois de douche.', category: 'Finitions', is_active: true },
  'storiste': { id: 'storiste', name: 'Storiste', slug: 'storiste', description: 'Installation de stores intérieurs et extérieurs, volets roulants.', category: 'Aménagement', is_active: true },
  'salle-de-bain': { id: 'salle-de-bain', name: 'Salle de bain', slug: 'salle-de-bain', description: 'Conception et rénovation complète de salles de bain.', category: 'Aménagement', is_active: true },
  'architecte-interieur': { id: 'architecte-interieur', name: 'Architecte d\'intérieur', slug: 'architecte-interieur', description: 'Aménagement et décoration d\'intérieur, space planning.', category: 'Aménagement', is_active: true },
  'decorateur': { id: 'decorateur', name: 'Décorateur', slug: 'decorateur', description: 'Décoration intérieure, home staging, conseil couleurs et matériaux.', category: 'Aménagement', is_active: true },
  'domoticien': { id: 'domoticien', name: 'Domoticien', slug: 'domoticien', description: 'Installation domotique, maison connectée, automatismes.', category: 'Aménagement', is_active: true },
  'pompe-a-chaleur': { id: 'pompe-a-chaleur', name: 'Pompe à chaleur', slug: 'pompe-a-chaleur', description: 'Installation et entretien de pompes à chaleur air/eau et air/air.', category: 'Énergie', is_active: true },
  'panneaux-solaires': { id: 'panneaux-solaires', name: 'Panneaux solaires', slug: 'panneaux-solaires', description: 'Installation de panneaux photovoltaïques et solaires thermiques.', category: 'Énergie', is_active: true },
  'isolation-thermique': { id: 'isolation-thermique', name: 'Isolation thermique', slug: 'isolation-thermique', description: 'Isolation des combles, murs, planchers — ITE et ITI.', category: 'Énergie', is_active: true },
  'renovation-energetique': { id: 'renovation-energetique', name: 'Rénovation énergétique', slug: 'renovation-energetique', description: 'Audit énergétique, rénovation globale, aides MaPrimeRénov\'.', category: 'Énergie', is_active: true },
  'borne-recharge': { id: 'borne-recharge', name: 'Borne de recharge', slug: 'borne-recharge', description: 'Installation de bornes de recharge pour véhicules électriques — IRVE.', category: 'Énergie', is_active: true },
  'ramoneur': { id: 'ramoneur', name: 'Ramoneur', slug: 'ramoneur', description: 'Ramonage de cheminées, poêles, chaudières — certificat obligatoire.', category: 'Chauffage', is_active: true },
  'alarme-securite': { id: 'alarme-securite', name: 'Alarme et sécurité', slug: 'alarme-securite', description: 'Installation d\'alarmes, vidéosurveillance, contrôle d\'accès.', category: 'Sécurité', is_active: true },
  'antenniste': { id: 'antenniste', name: 'Antenniste', slug: 'antenniste', description: 'Installation d\'antennes TV, TNT, satellite, fibre optique.', category: 'Technique', is_active: true },
  'ascensoriste': { id: 'ascensoriste', name: 'Ascensoriste', slug: 'ascensoriste', description: 'Installation, maintenance et modernisation d\'ascenseurs.', category: 'Technique', is_active: true },
  'diagnostiqueur': { id: 'diagnostiqueur', name: 'Diagnostiqueur', slug: 'diagnostiqueur', description: 'Diagnostics immobiliers : DPE, amiante, plomb, électricité, gaz.', category: 'Diagnostics', is_active: true },
  'geometre': { id: 'geometre', name: 'Géomètre', slug: 'geometre', description: 'Bornage, division parcellaire, topographie, plans de masse.', category: 'Diagnostics', is_active: true },
  'desinsectisation': { id: 'desinsectisation', name: 'Désinsectisation', slug: 'desinsectisation', description: 'Traitement contre les insectes nuisibles : cafards, punaises, guêpes.', category: 'Services', is_active: true },
  'deratisation': { id: 'deratisation', name: 'Dératisation', slug: 'deratisation', description: 'Élimination de rongeurs : rats, souris, fouines.', category: 'Services', is_active: true },
  'demenageur': { id: 'demenageur', name: 'Déménageur', slug: 'demenageur', description: 'Déménagement, transport de meubles, garde-meubles.', category: 'Services', is_active: true },
  'pisciniste': { id: 'pisciniste', name: 'Pisciniste', slug: 'pisciniste', description: 'Construction, rénovation et entretien de piscines.', category: 'Extérieur', is_active: true },
}

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
  if (IS_BUILD) return null // Use static france.ts fallback during build
  return retryWithBackoff(
    async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    },
    `getLocationBySlug(${slug})`,
  )
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
const SERVICE_TO_SPECIALTIES: Record<string, string[]> = {
  // ── Existants (15) ──
  'plombier': ['plombier'],
  'electricien': ['electricien'],
  'serrurier': ['serrurier'],
  'chauffagiste': ['chauffagiste'],
  'peintre-en-batiment': ['peintre', 'platrier', 'finition', 'peintre-en-batiment'],
  'menuisier': ['menuisier', 'menuisier-metallique'],
  'carreleur': ['carreleur'],
  'couvreur': ['couvreur', 'charpentier'],
  'macon': ['macon'],
  'jardinier': ['jardinier'],
  'vitrier': ['vitrier'],
  'climaticien': ['climaticien', 'isolation'],
  'cuisiniste': ['cuisiniste'],
  'solier': ['solier', 'solier-moquettiste'],
  'nettoyage': ['nettoyage'],
  // ── Bâtiment / Gros œuvre ──
  'terrassier': ['terrassier'],
  'charpentier': ['charpentier'],
  'zingueur': ['zingueur'],
  'etancheiste': ['etancheiste', 'etancheur'],
  'facadier': ['facadier', 'facade'],
  'platrier': ['platrier', 'plaquiste'],
  'metallier': ['metallier', 'metallier-serrurier'],
  'ferronnier': ['ferronnier', 'ferronnerie'],
  // ── Finitions / Aménagement ──
  'poseur-de-parquet': ['poseur-de-parquet', 'parqueteur'],
  'miroitier': ['miroitier'],
  'storiste': ['storiste'],
  'salle-de-bain': ['salle-de-bain'],
  'architecte-interieur': ['architecte-interieur'],
  'decorateur': ['decorateur'],
  'domoticien': ['domoticien', 'domotique'],
  // ── Énergie ──
  'pompe-a-chaleur': ['pompe-a-chaleur', 'pac'],
  'panneaux-solaires': ['panneaux-solaires', 'photovoltaique'],
  'isolation-thermique': ['isolation-thermique', 'isolation', 'isolateur'],
  'renovation-energetique': ['renovation-energetique'],
  'borne-recharge': ['borne-recharge', 'irve'],
  'ramoneur': ['ramoneur', 'ramonage'],
  // ── Extérieur ──
  'paysagiste': ['paysagiste'],
  'pisciniste': ['pisciniste'],
  // ── Sécurité / Technique ──
  'alarme-securite': ['alarme-securite', 'alarme', 'securite'],
  'antenniste': ['antenniste'],
  'ascensoriste': ['ascensoriste'],
  // ── Diagnostics ──
  'diagnostiqueur': ['diagnostiqueur', 'diagnostiqueur-immobilier'],
  'geometre': ['geometre', 'geometre-expert'],
  // ── Services ──
  'desinsectisation': ['desinsectisation', 'desinsectiseur'],
  'deratisation': ['deratisation', 'deratiseur'],
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

// ============================================================================
// COMMUNES — 35K+ communes françaises (table `communes`)
// ============================================================================

export interface Commune {
  code_insee: string            // PK — natural key, no UUID fragmentation
  name: string
  slug: string
  code_postal: string | null
  departement_code: string
  departement_name: string | null
  region_name: string | null
  // Géographie
  latitude: number | null
  longitude: number | null
  altitude_moyenne: number | null
  superficie_km2: number | null
  // Démographie
  population: number
  densite_population: number | null
  // Socio-économique (pour contenu SEO unique par commune)
  revenu_median: number | null
  prix_m2_moyen: number | null
  nb_logements: number | null
  part_maisons_pct: number | null
  // Enrichissement local
  climat_zone: string | null
  nb_entreprises_artisanales: number | null
  gentile: string | null
  description: string | null
  // État
  is_active: boolean
  nearest_city_with_providers: string | null
  provider_count: number
  created_at: string
  updated_at: string
}

/**
 * Fetch a commune by its slug from the `communes` table.
 * Falls back to france.ts static data during build or when DB is unavailable.
 */
export async function getCommuneBySlug(slug: string): Promise<Commune | null> {
  if (IS_BUILD) return null // Use static france.ts fallback during build
  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await supabase
          .from('communes')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (error || !data) return null
        return data as Commune
      })(),
      QUERY_TIMEOUT_MS,
      `getCommuneBySlug(${slug})`,
    )
  } catch {
    return null
  }
}

/**
 * Fetch top communes sorted by population (for generateStaticParams).
 */
export async function getTopCommunes(limit: number = 30): Promise<Commune[]> {
  if (IS_BUILD) return []
  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await supabase
          .from('communes')
          .select('*')
          .eq('is_active', true)
          .order('population', { ascending: false })
          .limit(limit)

        if (error || !data) return []
        return data as Commune[]
      })(),
      QUERY_TIMEOUT_MS,
      `getTopCommunes(${limit})`,
    )
  } catch {
    return []
  }
}

/**
 * Provider stats from materialized view mv_provider_counts.
 * Returns all aggregated data (count, verified, avg_rating) for a specialty+city.
 * Uses covering index idx_mv_provider_counts_cover — no heap fetch.
 */
export interface ProviderStats {
  provider_count: number
  verified_count: number
  avg_rating: number | null
}

const EMPTY_STATS: ProviderStats = { provider_count: 0, verified_count: 0, avg_rating: null }

export async function getProviderStatsFromMV(
  specialty: string,
  city: string,
): Promise<ProviderStats> {
  if (IS_BUILD) return EMPTY_STATS
  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await supabase
          .from('mv_provider_counts')
          .select('provider_count, verified_count, avg_rating')
          .eq('specialty', specialty)
          .eq('city', city)
          .single()

        if (error || !data) return EMPTY_STATS
        return {
          provider_count: data.provider_count ?? 0,
          verified_count: data.verified_count ?? 0,
          avg_rating: data.avg_rating ?? null,
        }
      })(),
      QUERY_TIMEOUT_MS,
      `getProviderStatsFromMV(${specialty}, ${city})`,
    )
  } catch {
    return EMPTY_STATS
  }
}

/**
 * Shorthand: just the count (backward compat).
 */
export async function getProviderCountFromMV(
  specialty: string,
  city: string,
): Promise<number> {
  const stats = await getProviderStatsFromMV(specialty, city)
  return stats.provider_count
}

/**
 * Get communes by département code, sorted by population.
 */
export async function getCommunesByDepartement(deptCode: string): Promise<Commune[]> {
  if (IS_BUILD) return []
  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await supabase
          .from('communes')
          .select('*')
          .eq('departement_code', deptCode)
          .eq('is_active', true)
          .order('population', { ascending: false })

        if (error || !data) return []
        return data as Commune[]
      })(),
      QUERY_TIMEOUT_MS,
      `getCommunesByDepartement(${deptCode})`,
    )
  } catch {
    return []
  }
}
