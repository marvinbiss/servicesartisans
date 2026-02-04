import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Types pour les requêtes
export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  return data
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
}

export async function getServiceBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      // Fallback vers les données statiques
      const staticService = staticServices[slug]
      if (staticService) return staticService
      throw error || new Error('Service not found')
    }
    return data
  } catch (error) {
    // Fallback vers les données statiques
    const staticService = staticServices[slug]
    if (staticService) return staticService
    throw error
  }
}

export async function getLocationBySlug(slug: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function getProviderBySlug(slug: string) {
  // First, try to find by exact slug match
  const { data: bySlug } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services(
        service:services(*)
      ),
      provider_locations(
        location:locations(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (bySlug) return bySlug

  // If not found by slug, try by ID (in case it's a UUID)
  if (isValidUUID(slug)) {
    const { data: byId } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services(
          service:services(*)
        ),
        provider_locations(
          location:locations(*)
        )
      `)
      .eq('id', slug)
      .single()

    if (byId) return byId
  }

  // If still not found, try a fuzzy search on the name (for generated slugs)
  // Convert slug back to potential name pattern: "martin-plomberie-paris" -> "martin plomberie paris"
  const namePattern = slug.replace(/-/g, ' ')
  const { data: byName } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services(
        service:services(*)
      ),
      provider_locations(
        location:locations(*)
      )
    `)
    .ilike('name', `%${namePattern}%`)
    .limit(1)
    .single()

  if (byName) return byName

  return null
}

export async function getProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string
) {
  // Get service and location info
  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug),
    getLocationBySlug(locationSlug),
  ])

  if (!service || !location) return []

  // If the service ID is not a valid UUID (static fallback), return empty array
  if (!isValidUUID(service.id)) {
    return []
  }

  // Query providers by service AND city - no limit
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services!inner(service_id)
    `)
    .eq('provider_services.service_id', service.id)
    .ilike('address_city', location.name)
    .eq('is_active', true)
    .order('is_premium', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

// Get all providers for a location (regardless of service) - no limit by default
export async function getProvidersByLocation(locationSlug: string) {
  const location = await getLocationBySlug(locationSlug)
  if (!location) return []

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .ilike('address_city', location.name)
    .eq('is_active', true)
    .order('is_premium', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

// Get all providers (for map and search) - no limit
export async function getAllProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .order('is_premium', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

export async function getProvidersByService(serviceSlug: string, limit?: number) {
  const service = await getServiceBySlug(serviceSlug)
  if (!service) return []

  // If the service ID is not a valid UUID (static fallback), return empty array
  if (!isValidUUID(service.id)) {
    return []
  }

  let query = supabase
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
    .order('is_premium', { ascending: false })

  // Apply limit only if specified
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getLocationsByService(serviceSlug: string) {
  const service = await getServiceBySlug(serviceSlug)
  if (!service) return []

  // If the service ID is not a valid UUID (static fallback), return empty array
  if (!isValidUUID(service.id)) {
    return []
  }

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
    .limit(500000)

  if (error) throw error
  return data
}
