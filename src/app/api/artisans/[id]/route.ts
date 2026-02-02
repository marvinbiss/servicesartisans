/**
 * API pour récupérer un artisan par ID
 * Cherche dans providers (données scrapées) et profiles (utilisateurs inscrits)
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDepartmentName, getRegionName, getDeptCodeFromPostal } from '@/lib/geography'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Ensure no caching

// Schema for artisan ID (UUID or slug)
const artisanIdSchema = z.string().min(1).max(255).regex(
  /^[a-zA-Z0-9-]+$/,
  'ID artisan invalide'
)

// Photos de démonstration par catégorie de métier
const DEMO_PHOTOS: Record<string, string[]> = {
  default: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  ],
  plombier: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  ],
  electricien: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1545259741-2a38e5a78cb6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  ],
  peintre: [
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  ],
  maçon: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  ],
}

// Générer un portfolio de démonstration
function generateDemoPortfolio(specialty: string) {
  const normalizedSpecialty = specialty.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  let photos = DEMO_PHOTOS.default
  if (normalizedSpecialty.includes('plomb')) photos = DEMO_PHOTOS.plombier
  else if (normalizedSpecialty.includes('electri')) photos = DEMO_PHOTOS.electricien
  else if (normalizedSpecialty.includes('peint')) photos = DEMO_PHOTOS.peintre
  else if (normalizedSpecialty.includes('macon')) photos = DEMO_PHOTOS.maçon

  const titles = [
    `Intervention ${specialty}`,
    'Rénovation complète',
    'Travaux de finition',
    'Installation neuve',
    'Dépannage urgent',
  ]

  return photos.map((url, i) => ({
    id: `demo-${i + 1}`,
    title: titles[i] || `Réalisation ${i + 1}`,
    description: `Travaux réalisés par notre équipe`,
    imageUrl: url,
    category: specialty,
  }))
}

// Générer une FAQ de démonstration
function generateDemoFAQ(_specialty: string, city: string) {
  return [
    {
      question: `Quels sont vos délais d'intervention à ${city} ?`,
      answer: `Nous intervenons généralement sous 24 à 48h pour les travaux planifiés. Pour les urgences, nous faisons notre maximum pour intervenir dans la journée selon nos disponibilités.`,
    },
    {
      question: 'Le devis est-il gratuit ?',
      answer: 'Oui, nous établissons des devis gratuits et sans engagement. Pour les interventions nécessitant un déplacement, des frais peuvent s\'appliquer si le devis n\'est pas accepté.',
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les paiements par carte bancaire, chèque, espèces et virement bancaire. Un acompte peut être demandé pour les travaux importants.',
    },
    {
      question: `Intervenez-vous en dehors de ${city} ?`,
      answer: `Oui, nous intervenons dans un rayon de 20 à 30 km autour de ${city}. Des frais de déplacement peuvent s'appliquer selon la distance.`,
    },
  ]
}

// Générer des avis de démonstration
function generateDemoReviews(specialty: string, city: string): Review[] {
  const firstNames = ['Marie', 'Pierre', 'Sophie', 'Jean', 'Isabelle', 'François', 'Catherine', 'Michel']
  const comments = [
    `Excellent travail, très professionnel. Je recommande vivement ce ${specialty.toLowerCase()} !`,
    `Intervention rapide et efficace. Très satisfait du résultat.`,
    `Artisan ponctuel et soigneux. Le chantier a été laissé propre.`,
    `Bon rapport qualité/prix. Je referai appel à ses services.`,
    `Travail de qualité, conseils avisés. Merci !`,
  ]

  const now = new Date()
  return comments.slice(0, 5).map((comment, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (i * 15 + Math.floor(Math.random() * 10)))

    return {
      id: `demo-review-${i + 1}`,
      author: `${firstNames[i % firstNames.length]} de ${city}`,
      rating: 5 - Math.floor(i / 3), // 5, 5, 5, 4, 4
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      comment,
      service: specialty,
      hasPhoto: i === 0,
      photoUrl: i === 0 ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop' : null,
      verified: true,
    }
  })
}

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
  department?: string
  department_code?: string
  region?: string
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
  intervention_zones: string[]
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate artisan ID parameter
    const idValidation = artisanIdSchema.safeParse(params.id)
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID artisan invalide',
            details: idValidation.error.flatten()
          }
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const artisanId = idValidation.data

    console.log(`[Public API v2] Fetching artisan: ${artisanId} at ${new Date().toISOString()}`)

    // Variable pour stocker l'artisan trouvé
    let artisan: ArtisanDetails | null = null
    let reviews: Review[] = []
    let source: 'provider' | 'profile' | 'demo' = 'demo'

    // 1. Chercher d'abord dans la table providers (données scrapées/Pappers)
    // Support lookup by UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artisanId)

    let providerQuery = supabase
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
      .neq('is_active', false)

    // Lookup by ID or slug
    if (isUUID) {
      providerQuery = providerQuery.eq('id', artisanId)
    } else {
      providerQuery = providerQuery.eq('slug', artisanId)
    }

    const { data: provider, error: providerError } = await providerQuery.single()

    console.log(`[Public API] Provider found: ${!!provider}, Error: ${providerError?.message || 'none'}`)
    console.log(`[Public API] DEBUG - Raw provider phone: "${provider?.phone}", Raw services count: ${provider?.provider_services?.length}`)

    if (provider && !providerError) {
      console.log(`[Public API] Provider data:`, {
        name: provider.name,
        city: provider.address_city,
        description: provider.meta_description?.substring(0, 50),
        phone: provider.phone,
        is_active: provider.is_active,
        services_raw: provider.provider_services?.map((ps: { service?: { name: string } }) => ps.service?.name),
      })
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

      // Extraire les zones d'intervention
      const interventionZones = provider.provider_locations?.map((pl: {
        location?: { name: string; postal_code?: string }
      }) => {
        if (pl.location?.name) {
          return pl.location.postal_code
            ? `${pl.location.name} (${pl.location.postal_code})`
            : pl.location.name
        }
        return null
      }).filter(Boolean) || []

      // Transformer en format ArtisanDetails
      // Resolve geography from postal code
      const postalCode = provider.address_postal_code || ''
      const deptCode = getDeptCodeFromPostal(postalCode)
      const departmentName = getDepartmentName(deptCode) || getDepartmentName(provider.address_department)
      const regionName = getRegionName(deptCode) || getRegionName(provider.address_region)

      artisan = {
        id: provider.id,
        business_name: provider.name,
        first_name: null,
        last_name: null,
        avatar_url: null,
        city: provider.address_city || '',
        postal_code: postalCode,
        address: provider.address_street,
        department: departmentName || undefined,
        department_code: deptCode || undefined,
        region: regionName || undefined,
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
        intervention_zones: interventionZones,
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
        portfolio: generateDemoPortfolio(services[0] || 'Artisan'),
        faq: generateDemoFAQ(services[0] || 'artisan', provider.address_city || 'votre ville'),
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

      // Transformer les avis (ou utiliser des avis de démonstration)
      if (providerReviews && providerReviews.length > 0) {
        reviews = providerReviews.map(r => ({
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
      } else {
        // Générer des avis de démonstration
        reviews = generateDemoReviews(services[0] || 'Artisan', provider.address_city || 'France')
      }
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
          intervention_zones: [],
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

    const response = NextResponse.json({
      success: true,
      artisan,
      reviews,
      source,
    })

    // Disable caching to always get fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')

    return response

  } catch (error) {
    logger.error('Error fetching artisan', error)
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
