import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProviderByStableId, getProviderBySlug, getServiceBySlug, getLocationBySlug } from '@/lib/supabase'
import { getArtisanUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import ArtisanPageClient from '@/components/artisan/ArtisanPageClient'
import { Review } from '@/components/artisan'
import type { LegacyArtisan } from '@/types/legacy'

export const revalidate = 300

interface PageProps {
  params: Promise<{
    service: string
    location: string
    publicId: string
  }>
}

// Convert provider data to LegacyArtisan format (sub-components still read legacy fields)
function convertToArtisan(provider: any, service: any, location: any, serviceSlug: string): LegacyArtisan {
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
    stable_id: provider.stable_id || undefined,
    slug: provider.slug,
    business_name: name,
    first_name: provider.first_name || null,
    last_name: provider.last_name || null,
    avatar_url: provider.avatar_url || provider.logo_url || null,
    city: city,
    postal_code: location?.postal_code || provider.address_postal_code || '',
    address: provider.address_street || '',
    department: location?.department_name || undefined,
    department_code: location?.department_code || undefined,
    region: location?.region_name || undefined,
    specialty: specialty,
    specialty_slug: serviceSlug,
    city_slug: location?.slug || undefined,
    description: description,
    average_rating: provider.rating_average || provider.average_rating || null,
    review_count: provider.review_count || 0,
    is_verified: provider.is_verified || false,
    is_center: provider.is_center || false,
    team_size: provider.team_size || undefined,
    services: provider.services || [],
    service_prices: provider.service_prices || [],
    accepts_new_clients: provider.accepts_new_clients !== false,
    experience_years: provider.experience_years || undefined,
    certifications: provider.certifications || [],
    insurance: provider.insurance || [],
    payment_methods: provider.payment_methods || ['Carte bancaire', 'Espèces', 'Chèque'],
    languages: provider.languages || ['Français'],
    emergency_available: provider.emergency_available || false,
    member_since: provider.created_at ? new Date(provider.created_at).getFullYear().toString() : undefined,
    siret: provider.siret || undefined,
    legal_form: provider.legal_form || undefined,
    creation_date: provider.creation_date || undefined,
    employee_count: provider.employee_count || undefined,
    phone: provider.phone || undefined,
    email: provider.email || undefined,
    website: provider.website || undefined,
    latitude: provider.latitude || undefined,
    longitude: provider.longitude || undefined,
    faq: provider.faq || [],
    // Legacy fields — undefined at runtime (columns dropped), kept for sub-component compat
    // Will be removed when each sub-component migrates to v2 Artisan type
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

// Fetch reviews for provider (only real reviews from database)
async function getProviderReviews(providerId: string): Promise<Review[]> {
  try {
    const supabase = await createClient()
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        content,
        created_at,
        author_verified,
        author_name,
        has_media
      `)
      .eq('provider_id', providerId)
      // REMOVED: .eq('status', 'published') to show ALL real reviews
      .order('created_at', { ascending: false })
      .limit(100) // Increased limit to show more reviews

    if (reviews && reviews.length > 0) {
      return reviews.map((r: any) => ({
        id: r.id,
        author: r.author_name || 'Client',
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        comment: r.content || '',
        service: 'Plomberie',
        verified: r.author_verified || false,
        hasPhoto: r.has_media || false,
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
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  try {
    const [providerByStableId, service, location] = await Promise.all([
      getProviderByStableId(publicId),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    // Fallback: try slug lookup if stable_id didn't match
    const provider = providerByStableId || await getProviderBySlug(publicId)

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
      // Wave-based indexing: noindex until explicitly activated
      robots: provider.noindex ? { index: false, follow: false } : undefined,
      openGraph: {
        title,
        description,
        type: 'profile',
        locale: 'fr_FR',
        images: provider.avatar_url ? [provider.avatar_url] : undefined,
      },
      alternates: {
        canonical: `https://servicesartisans.fr/services/${serviceSlug}/${locationSlug}/${publicId}`,
      },
    }
  } catch {
    return { title: 'Artisan non trouvé', robots: { index: false, follow: false } }
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  let provider: any, service: any, location: any

  try {
    // Try stable_id first, then slug as fallback
    const [providerByStableId, svc, loc] = await Promise.all([
      getProviderByStableId(publicId),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])
    provider = providerByStableId
    service = svc
    location = loc

    // Fallback: try slug lookup if stable_id didn't match
    if (!provider) {
      provider = await getProviderBySlug(publicId)
    }
  } catch (error) {
    console.error('Provider page DB error:', error)
    // Don't throw — show 404 instead of crashing the error boundary
  }

  if (!provider) {
    notFound()
  }

  // Canonical redirect: if the URL segments don't match the canonical slugs, redirect
  const canonicalUrl = getArtisanUrl({
    stable_id: provider.stable_id,
    specialty: provider.specialty,
    city: provider.address_city,
  })
  const currentPath = `/services/${serviceSlug}/${locationSlug}/${publicId}`
  if (currentPath !== canonicalUrl) {
    redirect(canonicalUrl)
  }

  // Convert to Artisan format
  const artisan = convertToArtisan(provider, service, location, serviceSlug)

  // Fetch reviews (only real reviews from database)
  const reviews = await getProviderReviews(provider.id)

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

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Confiance &amp; Securite
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/notre-processus-de-verification" className="text-blue-600 hover:text-blue-800">
              Comment nous verifions les artisans
            </Link>
            <Link href="/politique-avis" className="text-blue-600 hover:text-blue-800">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-blue-600 hover:text-blue-800">
              Service de mediation
            </Link>
          </nav>
        </div>
      </section>
    </>
  )
}
