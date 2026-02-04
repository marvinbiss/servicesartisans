/**
 * API pour récupérer un artisan par ID
 * Cherche dans providers (données scrapées) et profiles (utilisateurs inscrits)
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDepartmentName, getRegionName, getDeptCodeFromPostal } from '@/lib/geography'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Schema for artisan ID (UUID or slug)
const artisanIdSchema = z.string().min(1).max(255).regex(
  /^[a-zA-Z0-9-]+$/,
  'ID artisan invalide'
)

// Type pour les données artisan enrichies
interface ArtisanDetails {
  id: string
  slug?: string  // URL slug for SEO-friendly URLs
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string
  city_slug?: string  // URL slug for city
  postal_code: string
  address: string | null
  department?: string
  department_code?: string
  region?: string
  specialty: string
  specialty_slug?: string  // URL slug for specialty/service
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

// REMOVED: Fake review generation templates (illegal and unethical)

// Generate a description for a provider based on their data (WITHOUT fake ratings)
function generateDescription(name: string, specialty: string, city: string): string {
  const descriptions = [
    `${name} est un ${specialty.toLowerCase()} professionnel basé à ${city}. Nous garantissons un service de qualité pour tous vos travaux. Contactez-nous pour un devis gratuit.`,
    `Votre ${specialty.toLowerCase()} de confiance à ${city}. ${name} intervient rapidement pour tous vos besoins. Devis gratuit et sans engagement.`,
    `${name} - ${specialty.toLowerCase()} à ${city}. Fort de nombreuses interventions réussies, nous vous garantissons un travail soigné et professionnel.`,
  ]

  // Use provider name to pick a consistent description
  let seed = 0
  for (let i = 0; i < name.length; i++) {
    seed += name.charCodeAt(i)
  }
  return descriptions[seed % descriptions.length]
}

// REMOVED: generateSyntheticReviews function (illegal fake review generation)

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

    console.log(`[API] Fetching artisan: ${artisanId} at ${new Date().toISOString()}`)

    let artisan: ArtisanDetails | null = null
    let reviews: Review[] = []
    let source: 'provider' | 'profile' = 'provider'

    // 1. Chercher d'abord dans la table providers (données scrapées/Pappers)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artisanId)

    // First, try a simple query to find the provider
    let simpleQuery = supabase
      .from('providers')
      .select('*')

    if (isUUID) {
      simpleQuery = simpleQuery.eq('id', artisanId)
    } else {
      simpleQuery = simpleQuery.eq('slug', artisanId)
    }

    const { data: simpleProvider, error: simpleError } = await simpleQuery.single()

    // If not found or inactive, return early
    if (!simpleProvider || simpleError) {
      console.log(`[API] Provider not found: ${artisanId}`, simpleError)
    }

    // Now get full data with relations (if tables exist)
    let provider = simpleProvider
    let providerError = simpleError

    if (simpleProvider) {
      // Try to get related data, but don't fail if relations don't exist
      try {
        const { data: fullProvider } = await supabase
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
            ),
            portfolio_items (*)
          `)
          .eq('id', simpleProvider.id)
          .single()

        if (fullProvider) {
          provider = fullProvider
        }
      } catch {
        // Use simple provider if relations fail
        console.log(`[API] Using simple provider data for: ${artisanId}`)
      }
    }

    if (provider && !providerError) {
      source = 'provider'

      // Récupérer TOUS les avis réels pour ce provider (pas de filtre is_visible)
      const { data: providerReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', provider.id)
        // REMOVED: .eq('is_visible', true) to show ALL real reviews
        .order('created_at', { ascending: false })
        .limit(100) // Increased limit to show more reviews

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

      // Récupérer le portfolio réel (filtrer les données de démo avec images Unsplash)
      const portfolio = (provider.portfolio_items || [])
        .filter((item: { image_url?: string }) => {
          // Exclure les images de démo (Unsplash, placeholder, etc.)
          const imageUrl = item.image_url || ''
          return !imageUrl.includes('unsplash.com') &&
                 !imageUrl.includes('placeholder') &&
                 !imageUrl.includes('picsum.photos') &&
                 imageUrl.length > 0
        })
        .map((item: {
          id: string
          title?: string
          description?: string
          image_url?: string
          category?: string
        }) => ({
          id: item.id,
          title: item.title || 'Réalisation',
          description: item.description || '',
          imageUrl: item.image_url || '',
          category: item.category || 'Travaux',
        }))

      // Récupérer la FAQ réelle (filtrer les FAQ de démo/template)
      const { data: faqData } = await supabase
        .from('provider_faq')
        .select('*')
        .eq('provider_id', provider.id)
        .order('sort_order', { ascending: true })

      // Questions de démo courantes à filtrer
      const demoFaqPatterns = [
        'délai d\'intervention',
        'devis sont-ils gratuits',
        'modes de paiement',
        'zone d\'intervention',
        'intervenons généralement',
        '24 à 48h',
      ]

      const faq = (faqData || [])
        .filter((item: { question: string; answer: string }) => {
          const lowerQuestion = item.question.toLowerCase()
          const lowerAnswer = item.answer.toLowerCase()
          // Exclure les FAQ qui correspondent aux patterns de démo
          return !demoFaqPatterns.some(pattern =>
            lowerQuestion.includes(pattern.toLowerCase()) ||
            lowerAnswer.includes(pattern.toLowerCase())
          )
        })
        .map((item: {
          question: string
          answer: string
        }) => ({
          question: item.question,
          answer: item.answer,
        }))

      const postalCode = provider.address_postal_code || ''
      const deptCode = getDeptCodeFromPostal(postalCode)
      const departmentName = getDepartmentName(deptCode) || getDepartmentName(provider.address_department)
      const regionName = getRegionName(deptCode) || getRegionName(provider.address_region)

      const finalRating = provider.rating_average || (averageRating > 0 ? averageRating : 0)
      const finalReviewCount = provider.review_count || reviewCount
      const finalSpecialty = provider.specialty || services[0] || 'Artisan'

      // Generate description if not available
      const existingDescription = provider.description || provider.meta_description
      const finalDescription = (existingDescription && existingDescription.length > 50)
        ? existingDescription
        : generateDescription(
            provider.name || 'Cet artisan',
            finalSpecialty,
            provider.address_city || 'votre région'
          )

      artisan = {
        id: provider.id,
        slug: provider.slug || undefined,
        business_name: provider.name,
        first_name: null,
        last_name: null,
        avatar_url: provider.avatar_url || null,
        city: provider.address_city || '',
        city_slug: provider.address_city ? slugify(provider.address_city) : undefined,
        postal_code: postalCode,
        address: provider.address_street,
        department: departmentName || undefined,
        department_code: deptCode || undefined,
        region: regionName || undefined,
        specialty: finalSpecialty,
        specialty_slug: finalSpecialty ? slugify(finalSpecialty) : undefined,
        description: finalDescription,
        average_rating: Math.round(Number(finalRating) * 10) / 10,
        review_count: finalReviewCount,
        hourly_rate: provider.hourly_rate_min || null,
        is_verified: provider.is_verified,
        is_premium: provider.is_premium,
        is_center: (provider.employee_count || 0) > 1,
        team_size: provider.employee_count,
        services: services.length > 0 ? services : [finalSpecialty],
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
        intervention_zone: provider.intervention_zone || (provider.provider_locations?.[0]?.radius_km
          ? `${provider.provider_locations[0].radius_km} km`
          : null),
        intervention_zones: interventionZones,
        response_time: provider.response_time || null,
        experience_years: provider.creation_date
          ? new Date().getFullYear() - new Date(provider.creation_date).getFullYear()
          : null,
        certifications: provider.certifications || [],
        insurance: provider.insurance || [],
        payment_methods: provider.payment_methods || [],
        languages: provider.languages || ['Français'],
        emergency_available: provider.emergency_available || false,
        member_since: provider.created_at
          ? new Date(provider.created_at).getFullYear().toString()
          : null,
        response_rate: provider.response_rate || null,
        bookings_this_week: null,
        portfolio,
        faq,
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

      // Transformer les avis réels ou générer des avis synthétiques
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
          service: r.service_name || services[0] || 'Prestation',
          hasPhoto: !!r.photo_url,
          photoUrl: r.photo_url || null,
          verified: r.is_verified,
        }))
      }
      // NO fake reviews! Return empty array if no real reviews in database
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
          .limit(20)

        // Récupérer le portfolio (filtrer les données de démo)
        const { data: portfolioData } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('user_id', artisanId)
          .order('created_at', { ascending: false })

        const portfolio = (portfolioData || [])
          .filter((item: { image_url?: string }) => {
            // Exclure les images de démo (Unsplash, placeholder, etc.)
            const imageUrl = item.image_url || ''
            return !imageUrl.includes('unsplash.com') &&
                   !imageUrl.includes('placeholder') &&
                   !imageUrl.includes('picsum.photos') &&
                   imageUrl.length > 0
          })
          .map((item: {
            id: string
            title?: string
            description?: string
            image_url?: string
            category?: string
          }) => ({
            id: item.id,
            title: item.title || 'Réalisation',
            description: item.description || '',
            imageUrl: item.image_url || '',
            category: item.category || 'Travaux',
          }))

        // Récupérer la FAQ
        const { data: faqData } = await supabase
          .from('artisan_faq')
          .select('*')
          .eq('user_id', artisanId)
          .order('sort_order', { ascending: true })

        const faq = (faqData || []).map((item: {
          question: string
          answer: string
        }) => ({
          question: item.question,
          answer: item.answer,
        }))

        // Calculer la note moyenne
        let averageRating = 0
        let reviewCount = 0
        if (profileReviews && profileReviews.length > 0) {
          reviewCount = profileReviews.length
          averageRating = profileReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        }

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
          average_rating: Math.round(averageRating * 10) / 10,
          review_count: reviewCount,
          hourly_rate: profile.hourly_rate || null,
          is_verified: profile.is_verified,
          is_premium: profile.subscription_plan === 'premium',
          is_center: !!profile.company_name,
          team_size: profile.team_size || null,
          services: profile.services || [],
          service_prices: [],
          accepts_new_clients: profile.accepts_new_clients !== false,
          intervention_zone: profile.intervention_zone || null,
          intervention_zones: profile.intervention_zones || [],
          response_time: profile.response_time || null,
          experience_years: profile.experience_years || null,
          certifications: profile.certifications || [],
          insurance: profile.insurance || [],
          payment_methods: profile.payment_methods || [],
          languages: profile.languages || ['Français'],
          emergency_available: profile.emergency_available || false,
          member_since: profile.created_at
            ? new Date(profile.created_at).getFullYear().toString()
            : null,
          response_rate: profile.response_rate || null,
          bookings_this_week: null,
          portfolio,
          faq,
          siret: profile.siret,
          siren: null,
          legal_form: profile.legal_form || null,
          creation_date: profile.creation_date || null,
          employee_count: profile.employee_count || null,
          annual_revenue: null,
          phone: profile.phone,
          email: profile.email,
          website: profile.website || null,
          latitude: profile.latitude || null,
          longitude: profile.longitude || null,
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
          service: r.service_name || profile.services?.[0] || 'Prestation',
          hasPhoto: !!r.photo_url,
          photoUrl: r.photo_url || null,
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
