import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
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
  
  if (error) throw error
  return data
}

export async function getProvidersByServiceAndLocation(
  serviceSlug: string,
  locationSlug: string
) {
  // D'abord récupérer les IDs
  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug),
    getLocationBySlug(locationSlug)
  ])

  if (!service || !location) return []

  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services!inner(service_id),
      provider_locations!inner(location_id)
    `)
    .eq('provider_services.service_id', service.id)
    .eq('provider_locations.location_id', location.id)
    .eq('is_active', true)
    .order('is_premium', { ascending: false })
    .order('name')
  
  if (error) throw error
  return data
}

export async function getProvidersByService(serviceSlug: string, limit = 100) {
  const service = await getServiceBySlug(serviceSlug)
  if (!service) return []

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
    .order('is_premium', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getLocationsByService(serviceSlug: string) {
  const service = await getServiceBySlug(serviceSlug)
  if (!service) return []

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
}
