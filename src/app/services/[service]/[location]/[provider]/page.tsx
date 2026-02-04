import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProviderBySlug, getServiceBySlug, getLocationBySlug } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import ArtisanPageClient from '@/app/services/artisan/[id]/ArtisanPageClient'
import { Artisan, Review } from '@/components/artisan'

interface PageProps {
  params: Promise<{
    service: string
    location: string
    provider: string
  }>
}

// Convert provider data to Artisan format
function convertToArtisan(provider: any, service: any, location: any, serviceSlug: string): Artisan {
  const specialty = service?.name || provider.specialty || 'Artisan'
  const city = location?.name || provider.address_city || ''
  const name = provider.name || provider.business_name || 'Artisan'

  // Generate description if missing or too short (WITHOUT fake ratings)
  const existingDesc = provider.description || provider.bio
  const description = (existingDesc && existingDesc.length > 50)
    ? existingDesc
    : generateDescription(name, specialty, city || 'votre région')

  return {
    id: provider.id,
    slug: provider.slug,
    business_name: name,
    first_name: provider.first_name || null,
    last_name: provider.last_name || null,
    avatar_url: provider.avatar_url || provider.logo_url || null,
    city: city,
    postal_code: location?.postal_code || provider.address_postal_code || '',
    address: provider.address_street || '',
    // Geographic hierarchy from location data
    department: location?.department_name || undefined,
    department_code: location?.department_code || undefined,
    region: location?.region_name || undefined,
    specialty: specialty,
    // Store the service slug for breadcrumb URL generation
    specialty_slug: serviceSlug,
    city_slug: location?.slug || undefined,
    description: description,
    average_rating: provider.rating_average || provider.average_rating || null,
    review_count: provider.review_count || 0,
    hourly_rate: provider.hourly_rate_min || provider.hourly_rate || undefined,
    is_verified: provider.is_verified || false,
    is_premium: provider.is_premium || false,
    is_center: provider.is_center || false,
    team_size: provider.team_size || undefined,
    services: provider.services || [],
    service_prices: provider.service_prices || [],
    accepts_new_clients: provider.accepts_new_clients !== false,
    intervention_zone: provider.intervention_zone || '20 km',
    response_time: provider.response_time || '< 2h',
    experience_years: provider.experience_years || undefined,
    certifications: provider.certifications || [],
    insurance: provider.insurance || [],
    payment_methods: provider.payment_methods || ['Carte bancaire', 'Espèces', 'Chèque'],
    languages: provider.languages || ['Français'],
    emergency_available: provider.emergency_available || false,
    member_since: provider.created_at ? new Date(provider.created_at).getFullYear().toString() : undefined,
    response_rate: provider.response_rate || 95,
    bookings_this_week: provider.bookings_this_week || 0,
    siret: provider.siret || undefined,
    legal_form: provider.legal_form || undefined,
    creation_date: provider.creation_date || undefined,
    employee_count: provider.employee_count || undefined,
    phone: provider.phone || undefined,
    email: provider.email || undefined,
    website: provider.website || undefined,
    latitude: provider.latitude || undefined,
    longitude: provider.longitude || undefined,
    intervention_zones: provider.intervention_zones || [],
    faq: provider.faq || [],
  }
}

// Generate a description for a provider based on their data (WITHOUT mentioning fake ratings)
function generateDescription(name: string, specialty: string, city: string): string {
  const descriptions = [
    `${name} est un ${specialty.toLowerCase()} professionnel basé à ${city}. Nous garantissons un service de qualité pour tous vos travaux. Contactez-nous pour un devis gratuit.`,
    `Votre ${specialty.toLowerCase()} de confiance à ${city}. ${name} intervient rapidement pour tous vos besoins. Devis gratuit et sans engagement.`,
    `${name} - ${specialty.toLowerCase()} à ${city}. Fort de nombreuses interventions réussies, nous vous garantissons un travail soigné et professionnel.`,
  ]
  let seed = 0
  for (let i = 0; i < name.length; i++) {
    seed += name.charCodeAt(i)
  }
  return descriptions[seed % descriptions.length]
}

// REMOVED: Fake review generation (illegal and unethical)

// Fetch reviews for provider (with fallback to synthetic reviews)
async function getProviderReviews(providerId: string, provider: any): Promise<Review[]> {
  try {
    const supabase = await createClient()
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        is_verified,
        booking_id,
        profiles:client_id (
          first_name
        )
      `)
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (reviews && reviews.length > 0) {
      return reviews.map((r: any) => ({
        id: r.id,
        author: r.profiles?.first_name || 'Client',
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        comment: r.comment || '',
        service: r.service_name || 'Service',
        verified: r.is_verified || !!r.booking_id,
      }))
    }

    // No fake reviews! Return empty array if no real reviews in database
    return []
  } catch {
    // On error, return empty array (no fake reviews!)
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug, provider: providerSlug } = await params

  try {
    const [provider, service, location] = await Promise.all([
      getProviderBySlug(providerSlug),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    if (!provider) return { title: 'Artisan non trouvé' }

    const displayName = provider.name || provider.business_name || 'Artisan'
    const cityName = location?.name || provider.address_city || ''
    const serviceName = service?.name || 'Artisan'

    const title = `${displayName} - ${serviceName} à ${cityName} | ServicesArtisans`
    const ratingText = provider.rating_average ? `Note ${provider.rating_average}/5. ` : ''
    const description = `${displayName}, ${serviceName.toLowerCase()} à ${cityName}. ${ratingText}Devis gratuit. Artisan professionnel.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        locale: 'fr_FR',
        images: provider.avatar_url ? [provider.avatar_url] : undefined,
      },
      alternates: {
        canonical: `https://servicesartisans.fr/services/${serviceSlug}/${locationSlug}/${providerSlug}`,
      },
    }
  } catch {
    return { title: 'Artisan non trouvé' }
  }
}

export const revalidate = 3600 // Revalidate every hour

export default async function ProviderPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug, provider: providerSlug } = await params

  let provider: any, service: any, location: any

  try {
    ;[provider, service, location] = await Promise.all([
      getProviderBySlug(providerSlug),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    if (!provider) notFound()
  } catch {
    notFound()
  }

  // Convert to Artisan format
  const artisan = convertToArtisan(provider, service, location, serviceSlug)

  // Fetch reviews (with synthetic fallback based on Google Maps data)
  const reviews = await getProviderReviews(provider.id, provider)

  return (
    <>
      {/* Preload hints */}
      {artisan.avatar_url && (
        <link
          rel="preload"
          href={artisan.avatar_url}
          as="image"
          // @ts-expect-error - fetchPriority is valid but not in React types yet
          fetchpriority="high"
        />
      )}
      <link rel="dns-prefetch" href="//umjmbdbwcsxrvfqktiui.supabase.co" />

      <ArtisanPageClient
        initialArtisan={artisan}
        initialReviews={reviews}
        artisanId={provider.id}
      />
    </>
  )
}
