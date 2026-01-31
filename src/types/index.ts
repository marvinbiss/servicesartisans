export interface Service {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  icon?: string
  meta_title?: string
  meta_description?: string
  is_active: boolean
  created_at: string
}

export interface Location {
  id: string
  name: string
  slug: string
  postal_code?: string
  insee_code?: string
  department_code?: string
  department_name?: string
  region_code?: string
  region_name?: string
  latitude?: number
  longitude?: number
  population?: number
  is_active: boolean
  created_at: string
}

export interface Provider {
  id: string
  name: string
  slug: string
  siren?: string
  siret?: string
  email?: string
  phone?: string
  website?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_department?: string
  address_region?: string
  latitude?: number
  longitude?: number
  legal_form?: string
  creation_date?: string
  employee_count?: number
  annual_revenue?: number
  is_verified: boolean
  is_active: boolean
  is_premium: boolean
  verification_date?: string
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  scraped_at?: string
  source?: string
  source_id?: string
  // Relations
  provider_services?: ProviderService[]
  provider_locations?: ProviderLocation[]
}

export interface ProviderService {
  id: string
  provider_id: string
  service_id: string
  experience_years?: number
  is_primary: boolean
  price_min?: number
  price_max?: number
  price_unit?: string
  created_at: string
  // Relations
  service?: Service
}

export interface ProviderLocation {
  id: string
  provider_id: string
  location_id: string
  radius_km?: number
  is_primary: boolean
  travel_fee?: number
  created_at: string
  // Relations
  location?: Location
}

export interface Review {
  id: string
  provider_id: string
  author_name?: string
  rating: number
  comment?: string
  source?: string
  source_id?: string
  review_date?: string
  is_verified: boolean
  is_visible: boolean
  created_at: string
}

// Props pour les composants
export interface ProviderCardProps {
  provider: Provider
  serviceSlug: string
  locationSlug: string
}

export interface MapProps {
  providers: Provider[]
  center: [number, number]
  zoom?: number
  onMarkerClick?: (provider: Provider) => void
}

export interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  verified?: boolean
  premium?: boolean
  minRating?: number
  sortBy?: 'name' | 'rating' | 'distance'
}
