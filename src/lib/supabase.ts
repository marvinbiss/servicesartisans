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

export async function getServiceBySlug(slug: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
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
