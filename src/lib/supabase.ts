import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
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
      const staticService = staticServices[slug]
      if (staticService) return staticService
      throw error || new Error('Service not found')
    }
    return data
  } catch (error) {
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

// Lookup by stable_id ONLY — no fallback.
export async function getProviderByStableId(stableId: string) {
  const { data } = await supabase
    .from('providers')
    .select(PROVIDER_SELECT)
    .eq('stable_id', stableId)
    .eq('is_active', true)
    .single()

  return data || null
}

// Legacy — still used by non-slice code paths. Will be removed in a future PR.
export async function getProviderBySlug(slug: string) {
  const { data } = await supabase
    .from('providers')
    .select(PROVIDER_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data || null
}

export async function getProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string
) {
  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug),
    getLocationBySlug(locationSlug),
  ])

  if (!service || !location) return []
  if (!isValidUUID(service.id)) return []

  // Neutral ordering: verified first, then alphabetical (no premium bias)
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

  if (error) throw error
  return data || []
}

export async function getProvidersByLocation(locationSlug: string) {
  const location = await getLocationBySlug(locationSlug)
  if (!location) return []

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .ilike('address_city', location.name)
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

export async function getAllProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .order('name')

  if (error) throw error
  return data || []
}

export async function getProvidersByService(serviceSlug: string, limit?: number) {
  const service = await getServiceBySlug(serviceSlug)
  if (!service) return []
  if (!isValidUUID(service.id)) return []

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
    .order('is_verified', { ascending: false })

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
    .limit(500000)

  if (error) throw error
  return data
}
