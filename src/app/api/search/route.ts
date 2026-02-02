/**
 * Advanced Search API - ServicesArtisans
 * Full-text search with filters and facets
 * Uses Supabase for real data, falls back to demo data if empty
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const searchQuerySchema = z.object({
  q: z.string().max(200).optional().default(''),
  service: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  minRating: z.coerce.number().min(0).max(5).optional().nullable(),
  availability: z.enum(['today', 'tomorrow', 'week', 'all']).optional().nullable(),
  sortBy: z.enum(['relevance', 'rating', 'distance', 'price']).optional().default('relevance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

// Artisan type for search results
interface SearchArtisan {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string | null
  postal_code: string
  address: string | null
  specialty: string
  description: string | null
  average_rating: number
  review_count: number
  hourly_rate: number | null
  is_verified: boolean
  is_premium: boolean
  is_center: boolean
  team_size: number | null
  services: string[]
  availability_status: 'available_today' | 'available_this_week' | 'unavailable'
  response_time: string | null
  distance: number | null
  accepts_new_clients: boolean
  intervention_zone: string
}

// Demo data for testing - Artisans du batiment (fallback)
const DEMO_ARTISANS: SearchArtisan[] = [
  {
    id: 'demo-1',
    business_name: 'Plomberie Martin & Fils',
    first_name: null,
    last_name: null,
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '1 Rue Delteral',
    specialty: 'Plombier - Chauffagiste',
    description: 'Entreprise familiale de plomberie depuis 1985. Depannage, installation, renovation.',
    average_rating: 4.6,
    review_count: 234,
    hourly_rate: 55,
    is_verified: true,
    is_premium: true,
    is_center: true,
    team_size: 3,
    services: ['Plomberie', 'Chauffage', 'Depannage urgent'],
    availability_status: 'available_today',
    response_time: '< 1h',
    distance: null,
    accepts_new_clients: true,
    intervention_zone: '20 km',
  },
  {
    id: 'demo-2',
    business_name: null,
    first_name: 'Jerome',
    last_name: 'DUPONT',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '9 Avenue Faidherbe',
    specialty: 'Electricien',
    description: 'Electricien agree. Mise aux normes, depannage, installation tableau electrique.',
    average_rating: 4.8,
    review_count: 156,
    hourly_rate: 50,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Electricite generale', 'Mise aux normes', 'Depannage'],
    availability_status: 'available_this_week',
    response_time: '< 2h',
    distance: null,
    accepts_new_clients: true,
    intervention_zone: '15 km',
  },
  {
    id: 'demo-3',
    business_name: null,
    first_name: 'Michel',
    last_name: 'BERNARD',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '12 Avenue Edouard Vaillant',
    specialty: 'Menuisier',
    description: 'Menuisier ebeniste. Fabrication sur mesure, pose de cuisines et placards.',
    average_rating: 4.5,
    review_count: 89,
    hourly_rate: 45,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Menuiserie', 'Cuisines', 'Placards sur mesure'],
    availability_status: 'available_today',
    response_time: '< 4h',
    distance: null,
    accepts_new_clients: true,
    intervention_zone: '25 km',
  },
  {
    id: 'demo-4',
    business_name: 'Serrurier Express 93',
    first_name: null,
    last_name: null,
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '33 Avenue Jean Jaures',
    specialty: 'Serrurier',
    description: 'Serrurier agree assurance. Ouverture de porte, changement de serrure, blindage.',
    average_rating: 4.3,
    review_count: 67,
    hourly_rate: 60,
    is_verified: true,
    is_premium: false,
    is_center: true,
    team_size: 4,
    services: ['Ouverture porte', 'Serrurerie', 'Blindage'],
    availability_status: 'available_today',
    response_time: '< 30min',
    distance: null,
    accepts_new_clients: true,
    intervention_zone: '30 km',
  },
  {
    id: 'demo-5',
    business_name: null,
    first_name: 'Pascal',
    last_name: 'MOREAU',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '1 Place Anatole France',
    specialty: 'Peintre en batiment',
    description: 'Peintre decorateur. Peinture interieure/exterieure, ravalement, papier peint.',
    average_rating: 4.7,
    review_count: 203,
    hourly_rate: 40,
    is_verified: true,
    is_premium: true,
    is_center: false,
    team_size: null,
    services: ['Peinture interieure', 'Peinture exterieure', 'Decoration'],
    availability_status: 'available_this_week',
    response_time: '< 1h',
    distance: null,
    accepts_new_clients: true,
    intervention_zone: '20 km',
  },
  {
    id: 'demo-6',
    business_name: null,
    first_name: 'Claire',
    last_name: 'PETIT',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '9 Avenue Faidherbe',
    specialty: 'Carreleur',
    description: 'Carreleuse professionnelle. Pose de carrelage, faience, mosaique.',
    average_rating: 4.9,
    review_count: 178,
    hourly_rate: 48,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Carrelage', 'Faience', 'Mosaique'],
    availability_status: 'unavailable',
    response_time: null,
    distance: null,
    accepts_new_clients: false,
    intervention_zone: '15 km',
  },
  {
    id: 'demo-7',
    business_name: null,
    first_name: 'Yohan',
    last_name: 'LEROY',
    avatar_url: null,
    city: 'Pantin',
    postal_code: '93500',
    address: '4 Rue des Grilles',
    specialty: 'Plombier',
    description: 'Plombier qualifie. Reparation fuite, installation sanitaire, debouchage.',
    average_rating: 4.4,
    review_count: 92,
    hourly_rate: 52,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Plomberie', 'Sanitaire', 'Debouchage'],
    availability_status: 'available_this_week',
    response_time: '< 2h',
    distance: 652,
    accepts_new_clients: true,
    intervention_zone: '18 km',
  },
  {
    id: 'demo-8',
    business_name: null,
    first_name: 'Pierre',
    last_name: 'ROUX',
    avatar_url: null,
    city: 'Pantin',
    postal_code: '93500',
    address: '4 Rue des Grilles',
    specialty: 'Electricien',
    description: 'Electricien certifie RGE. Installation, renovation, domotique.',
    average_rating: 4.6,
    review_count: 134,
    hourly_rate: 55,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Electricite', 'Domotique', 'Renovation electrique'],
    availability_status: 'available_today',
    response_time: '< 1h',
    distance: 652,
    accepts_new_clients: true,
    intervention_zone: '20 km',
  },
  {
    id: 'demo-9',
    business_name: null,
    first_name: 'Marie',
    last_name: 'FOURNIER',
    avatar_url: null,
    city: 'Pantin',
    postal_code: '93500',
    address: '4 Rue des Grilles',
    specialty: 'Architecte d\'interieur',
    description: 'Architecte d\'interieur CFAI. Conception, amenagement, decoration.',
    average_rating: 4.8,
    review_count: 267,
    hourly_rate: 75,
    is_verified: true,
    is_premium: true,
    is_center: false,
    team_size: null,
    services: ['Architecture interieure', 'Amenagement', 'Decoration'],
    availability_status: 'unavailable',
    response_time: null,
    distance: 652,
    accepts_new_clients: false,
    intervention_zone: '30 km',
  },
  {
    id: 'demo-10',
    business_name: null,
    first_name: 'Laurent',
    last_name: 'GARCIA',
    avatar_url: null,
    city: 'Paris',
    postal_code: '75019',
    address: '39 Rue des Lilas',
    specialty: 'Couvreur - Zingueur',
    description: 'Couvreur zingueur. Reparation toiture, gouttiere, etancheite.',
    average_rating: 4.5,
    review_count: 145,
    hourly_rate: 58,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Couverture', 'Zinguerie', 'Etancheite'],
    availability_status: 'unavailable',
    response_time: null,
    distance: 771,
    accepts_new_clients: false,
    intervention_zone: '25 km',
  },
  {
    id: 'demo-11',
    business_name: 'BTP Renovation Lilas',
    first_name: null,
    last_name: null,
    avatar_url: null,
    city: 'Les Lilas',
    postal_code: '93260',
    address: '42 Rue de Paris',
    specialty: 'Entreprise generale de batiment',
    description: 'Entreprise tous corps d\'etat. Renovation complete appartement et maison.',
    average_rating: 4.2,
    review_count: 312,
    hourly_rate: null,
    is_verified: true,
    is_premium: true,
    is_center: true,
    team_size: 8,
    services: ['Renovation complete', 'Gros oeuvre', 'Second oeuvre'],
    availability_status: 'available_this_week',
    response_time: '< 1h',
    distance: 789,
    accepts_new_clients: true,
    intervention_zone: '40 km',
  },
  {
    id: 'demo-12',
    business_name: null,
    first_name: 'Thomas',
    last_name: 'LAMBERT',
    avatar_url: null,
    city: 'Les Lilas',
    postal_code: '93260',
    address: '46 Rue de Paris',
    specialty: 'Maçon',
    description: 'Macon qualifie. Construction, renovation, extension, cloture.',
    average_rating: 4.7,
    review_count: 189,
    hourly_rate: 50,
    is_verified: true,
    is_premium: false,
    is_center: false,
    team_size: null,
    services: ['Maconnerie', 'Extension', 'Renovation'],
    availability_status: 'unavailable',
    response_time: null,
    distance: 820,
    accepts_new_clients: false,
    intervention_zone: '20 km',
  },
]

// Generate availability for demo artisans
function generateDemoAvailability(artisanId: string) {
  const days = []
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const monthNames = ['janv.', 'fevr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.']
  const today = new Date()

  // Use artisan ID to create consistent "random" availability
  const seed = artisanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayOfWeek = date.getDay()
    const slots: Array<{ time: string; available: boolean }> = []

    // No slots on Sunday
    if (dayOfWeek !== 0) {
      const allTimes = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

      // Use seed + day to determine which slots are available
      const dayHash = (seed + i) % 10

      let selectedTimes: string[] = []
      if (dayHash < 3) {
        selectedTimes = allTimes.filter((_, idx) => (idx + seed) % 5 === 0).slice(0, 2)
      } else if (dayHash < 7) {
        selectedTimes = allTimes.filter((_, idx) => (idx + seed + i) % 3 === 0).slice(0, 4)
      } else {
        selectedTimes = allTimes.filter((_, idx) => (idx + seed) % 2 === 0).slice(0, 5)
      }

      selectedTimes.sort().forEach(time => {
        slots.push({ time, available: true })
      })
    }

    days.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[dayOfWeek],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
      slots,
    })
  }

  return days
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse and validate search parameters
    const queryParams = {
      q: searchParams.get('q') || '',
      service: searchParams.get('service'),
      location: searchParams.get('location'),
      minRating: searchParams.get('minRating'),
      availability: searchParams.get('availability'),
      sortBy: searchParams.get('sortBy') || 'relevance',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }
    const result = searchQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { q: query, service, location, minRating, availability, sortBy, page, limit } = result.data
    const offset = (page - 1) * limit

    // Try to fetch from Supabase first
    let useRealData = false
    let dbArtisans: SearchArtisan[] = []

    try {
      // Query artisans from profiles table
      let dbQuery = supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'artisan')

      // Filter by search query
      if (query) {
        dbQuery = dbQuery.or(
          `company_name.ilike.%${query}%,full_name.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      // Filter by location
      if (location) {
        dbQuery = dbQuery.or(
          `city.ilike.%${location}%,postal_code.ilike.%${location}%`
        )
      }

      const { data: profiles, error } = await dbQuery

      if (!error && profiles && profiles.length > 0) {
        useRealData = true
        // Transform profiles to artisan format
        dbArtisans = profiles.map(p => ({
          id: p.id,
          business_name: p.company_name,
          first_name: p.full_name?.split(' ')[0] || null,
          last_name: p.full_name?.split(' ').slice(1).join(' ') || null,
          avatar_url: p.avatar_url,
          city: p.city,
          postal_code: p.postal_code || '',
          address: p.address,
          specialty: (p.services && p.services[0]) || 'Artisan',
          description: p.description,
          average_rating: 4.5, // Default, would need reviews table aggregation
          review_count: 0,
          hourly_rate: null,
          is_verified: p.is_verified,
          is_premium: p.subscription_plan === 'premium',
          is_center: !!p.company_name,
          team_size: null,
          services: p.services || [],
          availability_status: 'available_this_week' as const,
          response_time: '< 2h',
          distance: null,
          accepts_new_clients: true,
          intervention_zone: '20 km',
        }))
      }
    } catch (dbError) {
      logger.warn('Database query failed, using demo data:', { error: String(dbError) })
    }

    // Use demo data as fallback
    let filteredData = useRealData ? dbArtisans : [...DEMO_ARTISANS]

    // Apply additional filters if using demo data (already applied in DB query)
    if (!useRealData) {
      // Filter by query
      if (query) {
        const q = query.toLowerCase()
        filteredData = filteredData.filter(a =>
          a.specialty?.toLowerCase().includes(q) ||
          a.business_name?.toLowerCase().includes(q) ||
          a.first_name?.toLowerCase().includes(q) ||
          a.last_name?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
        )
      }

      // Filter by location
      if (location) {
        const loc = location.toLowerCase()
        filteredData = filteredData.filter(a =>
          a.city?.toLowerCase().includes(loc) ||
          a.postal_code?.includes(loc)
        )
      }
    }

    // Filter by rating (applies to both)
    if (minRating) {
      filteredData = filteredData.filter(a => a.average_rating >= minRating)
    }

    // Filter by availability
    if (availability === 'today') {
      filteredData = filteredData.filter(a => a.availability_status === 'available_today')
    } else if (availability === 'week' || availability === 'tomorrow') {
      filteredData = filteredData.filter(a =>
        a.availability_status === 'available_today' ||
        a.availability_status === 'available_this_week'
      )
    }

    // Sort
    if (sortBy === 'rating') {
      filteredData.sort((a, b) => b.average_rating - a.average_rating)
    }

    const totalCount = filteredData.length
    let artisans = filteredData.slice(offset, offset + limit)

    // Add availability to artisans
    artisans = artisans.map(a => ({
      ...a,
      availability: a.accepts_new_clients
        ? generateDemoAvailability(a.id)
        : generateDemoAvailability(a.id).map(d => ({ ...d, slots: [] }))
    }))

    // Build facets from data
    const cityCount = new Map<string, number>()
    filteredData.forEach(a => {
      if (a.city) {
        cityCount.set(a.city, (cityCount.get(a.city) || 0) + 1)
      }
    })
    const cities = Array.from(cityCount.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const facets = {
      cities,
      ratings: { '5': 2, '4': 8, '3': 2, '2': 0, '1': 0 },
    }

    return NextResponse.json({
      results: artisans,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      facets,
      query: {
        q: query,
        service,
        location,
        minRating,
        availability,
        sortBy,
      },
      source: useRealData ? 'database' : 'demo',
    })
  } catch (error) {
    logger.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
