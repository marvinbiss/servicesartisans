// Types pour les composants artisan

export interface ServicePrice {
  name: string
  description: string
  price: string
  duration?: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
}

export interface Artisan {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string
  postal_code: string
  address?: string
  department?: string      // Nom complet du département
  department_code?: string // Code département (ex: "93")
  region?: string          // Nom complet de la région
  specialty: string
  description?: string
  average_rating: number
  review_count: number
  hourly_rate?: number
  is_verified: boolean
  is_premium: boolean
  is_center?: boolean
  team_size?: number
  services: string[]
  service_prices: ServicePrice[]
  accepts_new_clients?: boolean
  intervention_zone?: string
  intervention_zones?: string[]
  response_time?: string
  experience_years?: number
  certifications?: string[]
  insurance?: string[]
  payment_methods?: string[]
  languages?: string[]
  emergency_available?: boolean
  member_since?: string
  response_rate?: number
  bookings_this_week?: number
  portfolio?: PortfolioItem[]
  faq?: Array<{ question: string; answer: string }>
  siret?: string
  siren?: string
  legal_form?: string
  creation_date?: string
  employee_count?: number
  annual_revenue?: number
  phone?: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  service: string
  hasPhoto?: boolean
  photoUrl?: string
  verified?: boolean
}

export function getDisplayName(artisan: Artisan): string {
  if (artisan.is_center && artisan.business_name) {
    return artisan.business_name
  }
  if (artisan.business_name) {
    return artisan.business_name
  }
  return `${artisan.first_name || ''} ${artisan.last_name || ''}`.trim() || 'Artisan'
}
