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

// Supabase Client Type (for function parameters)
import type { SupabaseClient } from '@supabase/supabase-js'
export type SupabaseClientType = SupabaseClient

// Booking types
export interface BookingSlot {
  id: string
  start_time: string
  end_time: string
  is_available: boolean
  provider_id?: string
}

export interface Booking {
  id: string
  provider_id: string
  client_id?: string
  client_email: string
  client_name: string
  client_phone?: string
  service: string
  booking_date: string
  slot_id?: string
  slot?: BookingSlot
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  amount?: number
  created_at: string
  updated_at?: string
  provider?: Provider
  client?: {
    id: string
    email: string
    full_name: string
    phone?: string
  }
}

// Video call participant
export interface VideoParticipant {
  session_id: string
  user_id?: string
  user_name?: string
  video: boolean
  audio: boolean
  joined_at?: string
}

// Daily.co event types
export interface DailyParticipantEvent {
  participant: {
    session_id: string
    user_id?: string
    user_name?: string
    local: boolean
    video: boolean
    audio: boolean
  }
}

export interface DailyErrorEvent {
  errorMsg: string
  error?: Error
}

// City data for service pages
export interface CityData {
  city: string
  name?: string
  postal_code?: string
  provider_count?: number
  latitude?: number
  longitude?: number
}

// Analytics gtag type
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
