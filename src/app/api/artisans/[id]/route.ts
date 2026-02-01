/**
 * API pour récupérer un artisan par ID
 * Cherche dans providers (données scrapées) et profiles (utilisateurs inscrits)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Type pour les données artisan enrichies
interface ArtisanDetails {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string
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
  service_prices: Array<{
    name: string
    description: string
    price: string
    duration?: string
  }>
  accepts_new_clients: boolean
  intervention_zone: string | null
  response_time: string | null
  experience_years: number | null
  certifications: string[]
  insurance: string[]
  payment_methods: string[]
  languages: string[]
  emergency_available: boolean
  member_since: string | null
  response_rate: number | null
  bookings_this_week: number | null
  portfolio: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    category: string
  }>
  faq: Array<{
    question: string
    answer: string
  }>
  // Données Pappers enrichies
  siret: string | null
  siren: string | null
  legal_form: string | null
  creation_date: string | null
  employee_count: number | null
  annual_revenue: number | null
  phone: string | null
  email: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
}

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  service: string
  hasPhoto: boolean
  photoUrl: string | null
  verified: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const artisanId = params.id

    // Variable pour stocker l'artisan trouvé
    let artisan: ArtisanDetails | null = null
    let reviews: Review[] = []
    let source: 'provider' | 'profile' | 'demo' = 'demo'

    // 1. Chercher d'abord dans la table providers (données scrapées/Pappers)
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services (
          *,
          service:services (*)
        ),
        provider_locations (
          *,
          location:locations (*)
        )
      `)
      .eq('id', artisanId)
      .eq('is_active', true)
      .single()

    if (provider && !providerError) {
      source = 'provider'

      // Récupérer les avis pour ce provider
      const { data: providerReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', artisanId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculer la note moyenne
      let averageRating = 0
      let reviewCount = 0
      if (providerReviews && providerReviews.length > 0) {
        reviewCount = providerReviews.length
        averageRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      }

      // Extraire les services
      const services = provider.provider_services?.map((ps: { service?: { name: string } }) =>
        ps.service?.name
      ).filter(Boolean) || []

      // Transformer en format ArtisanDetails
      artisan = {
        id: provider.id,
        business_name: provider.name,
        first_name: null,
        last_name: null,
        avatar_url: null,
        city: provider.address_city || '',
        postal_code: provider.address_postal_code || '',
        address: provider.address_street,
        specialty: services[0] || 'Artisan',
        description: provider.meta_description || `${provider.name} - Artisan qualifié à ${provider.address_city}`,
        average_rating: Math.round(averageRating * 10) / 10 || 4.5,
        review_count: reviewCount,
        hourly_rate: null,
        is_verified: provider.is_verified,
        is_premium: provider.is_premium,
        is_center: (provider.employee_count || 0) > 1,
        team_size: provider.employee_count,
        services,
        service_prices: provider.provider_services?.map((ps: {
          service?: { name: string }
          price_min?: number
          price_max?: number
          price_unit?: string
        }) => ({
          name: ps.service?.name || 'Service',
          description: '',
          price: ps.price_min && ps.price_max
            ? `${ps.price_min}-${ps.price_max}€`
            : ps.price_min
              ? `A partir de ${ps.price_min}€`
              : 'Sur devis',
          duration: undefined
        })) || [],
        accepts_new_clients: true,
        intervention_zone: provider.provider_locations?.[0]?.radius_km
          ? `${provider.provider_locations[0].radius_km} km`
          : '20 km',
        response_time: '< 2h',
        experience_years: provider.creation_date
          ? new Date().getFullYear() - new Date(provider.creation_date).getFullYear()
          : null,
        certifications: [],
        insurance: ['Garantie décennale', 'RC Professionnelle'],
        payment_methods: ['Carte bancaire', 'Espèces', 'Chèque', 'Virement'],
        languages: ['Français'],
        emergency_available: false,
        member_since: provider.created_at
          ? new Date(provider.created_at).getFullYear().toString()
          : null,
        response_rate: 95,
        bookings_this_week: null,
        portfolio: [],
        faq: [],
        // Données Pappers
        siret: provider.siret,
        siren: provider.siren,
        legal_form: provider.legal_form,
        creation_date: provider.creation_date,
        employee_count: provider.employee_count,
        annual_revenue: provider.annual_revenue,
        phone: provider.phone,
        email: provider.email,
        website: provider.website,
        latitude: provider.latitude,
        longitude: provider.longitude,
      }

      // Transformer les avis
      reviews = (providerReviews || []).map(r => ({
        id: r.id,
        author: r.author_name || 'Client',
        rating: r.rating,
        date: new Date(r.review_date || r.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        comment: r.comment || '',
        service: services[0] || 'Prestation',
        hasPhoto: false,
        photoUrl: null,
        verified: r.is_verified,
      }))
    }

    // 2. Si pas trouvé dans providers, chercher dans profiles (utilisateurs inscrits)
    if (!artisan) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', artisanId)
        .eq('user_type', 'artisan')
        .single()

      if (profile && !profileError) {
        source = 'profile'

        // Récupérer les avis pour ce profil
        const { data: profileReviews } = await supabase
          .from('reviews')
          .select(`
            *,
            client:profiles!reviews_client_id_fkey (full_name)
          `)
          .eq('artisan_id', artisanId)
          .order('created_at', { ascending: false })
          .limit(10)

        // Calculer la note moyenne
        let averageRating = 0
        let reviewCount = 0
        if (profileReviews && profileReviews.length > 0) {
          reviewCount = profileReviews.length
          averageRating = profileReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        }

        // Parser le nom complet
        const nameParts = profile.full_name?.split(' ') || []
        const firstName = nameParts[0] || null
        const lastName = nameParts.slice(1).join(' ') || null

        artisan = {
          id: profile.id,
          business_name: profile.company_name,
          first_name: firstName,
          last_name: lastName,
          avatar_url: profile.avatar_url,
          city: profile.city || '',
          postal_code: profile.postal_code || '',
          address: profile.address,
          specialty: profile.services?.[0] || 'Artisan',
          description: profile.description,
          average_rating: Math.round(averageRating * 10) / 10 || 4.5,
          review_count: reviewCount,
          hourly_rate: null,
          is_verified: profile.is_verified,
          is_premium: profile.subscription_plan === 'premium',
          is_center: !!profile.company_name,
          team_size: null,
          services: profile.services || [],
          service_prices: [],
          accepts_new_clients: true,
          intervention_zone: '20 km',
          response_time: '< 2h',
          experience_years: null,
          certifications: [],
          insurance: ['Garantie décennale'],
          payment_methods: ['Carte bancaire', 'Espèces', 'Chèque'],
          languages: ['Français'],
          emergency_available: false,
          member_since: profile.created_at
            ? new Date(profile.created_at).getFullYear().toString()
            : null,
          response_rate: null,
          bookings_this_week: null,
          portfolio: [],
          faq: [],
          // Données Pappers
          siret: profile.siret,
          siren: null,
          legal_form: null,
          creation_date: null,
          employee_count: null,
          annual_revenue: null,
          phone: profile.phone,
          email: profile.email,
          website: null,
          latitude: null,
          longitude: null,
        }

        // Transformer les avis
        reviews = (profileReviews || []).map(r => ({
          id: r.id,
          author: r.client?.full_name
            ? `${r.client.full_name.split(' ')[0]} ${r.client.full_name.split(' ')[1]?.[0] || ''}.`
            : 'Client',
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          comment: r.comment || '',
          service: profile.services?.[0] || 'Prestation',
          hasPhoto: false,
          photoUrl: null,
          verified: r.is_verified,
        }))
      }
    }

    // 3. Si toujours pas trouvé, retourner 404
    if (!artisan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Artisan non trouvé'
          }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      artisan,
      reviews,
      source,
    })

  } catch (error) {
    console.error('Error fetching artisan:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Erreur serveur'
        }
      },
      { status: 500 }
    )
  }
}
