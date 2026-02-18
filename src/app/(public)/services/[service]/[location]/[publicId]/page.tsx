import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProviderByStableId, getProviderBySlug, getServiceBySlug, getLocationBySlug, getProviderCountByServiceAndLocation } from '@/lib/supabase'
import { getArtisanUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import ArtisanPageClient from '@/components/artisan/ArtisanPageClient'
import ArtisanInternalLinks from '@/components/artisan/ArtisanInternalLinks'
import { Review } from '@/components/artisan'
import type { LegacyArtisan } from '@/types/legacy'
import { getServiceImage } from '@/lib/data/images'
import { SITE_URL } from '@/lib/seo/config'
import { hashCode } from '@/lib/seo/location-content'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import JsonLd from '@/components/JsonLd'
import { getQuartierBySlug, services as staticServicesList, villes } from '@/lib/data/france'
import ServiceQuartierPage from './ServiceQuartierPage'

export const revalidate = 300

// Pre-render top service×city×quartier combos for ISR warming
const TOP_CITIES_QUARTIER = 30
export function generateStaticParams() {
  const topCities = villes.slice(0, TOP_CITIES_QUARTIER)
  // Only pre-render first 8 services × 30 cities × quartiers to keep build manageable
  const topServices = staticServicesList.slice(0, 8)
  return topServices.flatMap(s =>
    topCities.flatMap(v => {
      const quartiers = v.quartiers || []
      return quartiers.map(q => ({
        service: s.slug,
        location: v.slug,
        publicId: q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }))
    })
  )
}
export const dynamicParams = true

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
    : generateDescription(name, specialty, city || 'votre région', provider, serviceSlug)

  return {
    id: provider.id,
    stable_id: provider.stable_id || undefined,
    slug: provider.slug,
    business_name: name,
    first_name: provider.first_name || null,
    last_name: provider.last_name || null,
    avatar_url: provider.avatar_url || provider.logo_url || null,
    city: city,
    postal_code: String(location?.postal_code || provider.address_postal_code || '').replace(/\.0$/, ''),
    address: provider.address_street || '',
    department: location?.department_name || undefined,
    department_code: location?.department_code || undefined,
    region: location?.region_name || undefined,
    specialty: specialty,
    specialty_slug: serviceSlug,
    city_slug: location?.slug || undefined,
    description: description,
    bio: provider.bio || undefined,
    average_rating: provider.rating_average || provider.average_rating || null,
    review_count: provider.review_count || 0,
    is_verified: provider.is_verified || false,
    is_center: provider.is_center || false,
    team_size: provider.team_size || undefined,
    services: provider.services_offered || [],
    service_prices: (provider.service_prices && provider.service_prices.length > 0) ? provider.service_prices : [],
    prices_are_estimated: false,
    accepts_new_clients: provider.accepts_new_clients === true ? true : undefined,
    free_quote: provider.free_quote === true ? true : undefined,
    experience_years: provider.experience_years || undefined,
    certifications: provider.certifications || [],
    insurance: provider.insurance || [],
    payment_methods: provider.payment_methods || [],
    languages: provider.languages || [],
    emergency_available: provider.emergency_available || false,
    available_24h: provider.available_24h || false,
    hourly_rate_min: provider.hourly_rate_min != null ? Number(provider.hourly_rate_min) : undefined,
    hourly_rate_max: provider.hourly_rate_max != null ? Number(provider.hourly_rate_max) : undefined,
    phone_secondary: provider.phone_secondary || undefined,
    opening_hours: provider.opening_hours && Object.keys(provider.opening_hours).length > 0 ? provider.opening_hours : undefined,
    intervention_radius_km: provider.intervention_radius_km || undefined,
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
    faq: (provider.faq && provider.faq.length > 0) ? provider.faq : undefined,
    updated_at: provider.updated_at || undefined,
    // Legacy fields — undefined at runtime (columns dropped), kept for sub-component compat
    // Will be removed when each sub-component migrates to v2 Artisan type
  }
}

// Generate a rich, unique description based on all available provider data
function generateDescription(name: string, specialty: string, city: string, provider?: any, serviceSlug?: string): string {
  const spe = specialty.toLowerCase()
  const parts: string[] = []

  // Hash-varied intro templates to reduce duplicate content across similar profiles
  const introKey = `desc-${provider?.stable_id || provider?.slug || provider?.id || name}-${serviceSlug || spe}`
  const introHash = hashCode(introKey)
  const introTemplates = [
    `${name} est un professionnel spécialisé en ${spe} à ${city}.`,
    `Basé à ${city}, ${name} intervient en ${spe} pour les particuliers et professionnels.`,
    `${name} propose ses services de ${spe} à ${city} et ses environs.`,
    `Professionnel en ${spe}, ${name} exerce à ${city} auprès d'une clientèle locale.`,
    `À ${city}, ${name} met son expertise en ${spe} au service de vos projets.`,
  ]
  parts.push(introTemplates[introHash % introTemplates.length])

  // Company history and experience
  if (provider?.creation_date) {
    const year = new Date(provider.creation_date).getFullYear()
    const age = new Date().getFullYear() - year
    if (age > 1) {
      parts.push(`Fondée en ${year}, l'entreprise bénéficie de plus de ${age} ans de présence dans la région.`)
    }
  } else if (provider?.experience_years && provider.experience_years > 0) {
    parts.push(`Fort de ${provider.experience_years} ans d'expérience, ce professionnel maîtrise tous les aspects du métier.`)
  }

  // Team and structure
  if (provider?.employee_count && provider.employee_count > 1) {
    parts.push(`L'équipe, composée de ${provider.employee_count} personnes, assure des interventions rapides et soignées.`)
  }

  // Certifications
  if (provider?.certifications && provider.certifications.length > 0) {
    if (provider.certifications.length === 1) {
      parts.push(`Certifié ${provider.certifications[0]}.`)
    } else {
      parts.push(`Titulaire de ${provider.certifications.length} certifications professionnelles dont ${provider.certifications[0]}.`)
    }
  }

  // Insurance
  if (provider?.insurance && provider.insurance.length > 0) {
    parts.push(`Assuré pour la garantie décennale et la responsabilité civile professionnelle.`)
  }

  // Verification
  if (provider?.siret) {
    parts.push(`Entreprise immatriculée et référencée (SIRET ${provider.siret.substring(0, 9)}...).`)
  }

  // Rating
  const rating = provider?.rating_average || provider?.average_rating
  if (rating && rating >= 4) {
    parts.push(`Noté ${Number(rating).toFixed(1)}/5 par ses clients.`)
  }

  // CTA
  parts.push(`Contactez ${name} pour obtenir un devis gratuit et personnalisé, sans engagement.`)

  // Freshness / E-E-A-T: signal that content is data-derived
  parts.push('Informations basées sur les données professionnelles déclarées.')

  return parts.join(' ')
}

// Fetch similar artisans (same specialty, same department)
async function getSimilarArtisans(providerId: string, specialty: string, postalCode?: string) {
  try {
    const supabase = await createClient()
    const deptCode = postalCode && postalCode.length >= 2 ? postalCode.substring(0, 2) : null

    let query = supabase
      .from('providers')
      .select('id, stable_id, slug, name, specialty, rating_average, review_count, address_city, is_verified')
      .eq('is_active', true)
      .neq('id', providerId)
      .order('rating_average', { ascending: false, nullsFirst: false })
      .limit(8)

    // Try to match specialty
    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`)
    }

    // Prefer same department
    if (deptCode) {
      query = query.like('address_postal_code', `${deptCode}%`)
    }

    const { data } = await query

    return (data || []).map((p: any) => ({
      id: p.id,
      stable_id: p.stable_id || undefined,
      slug: p.slug || undefined,
      name: p.name || 'Artisan',
      specialty: p.specialty || specialty,
      rating: p.rating_average || 0,
      reviews: p.review_count || 0,
      city: p.address_city || '',
      is_verified: p.is_verified || false,
    }))
  } catch {
    return []
  }
}

// Fetch reviews for provider (only real reviews from database)
async function getProviderReviews(providerId: string, serviceName?: string): Promise<Review[]> {
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
      .or('status.eq.published,status.is.null')
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
        dateISO: r.created_at ? r.created_at.split('T')[0] : undefined,
        service: serviceName || '',
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

function truncateTitle(title: string, maxLen = 55): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  // ─── QUARTIER DETECTION ──────────────────────────────────
  const quartierMatch = getQuartierBySlug(locationSlug, publicId)
  if (quartierMatch) {
    const { ville, quartierName } = quartierMatch
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    if (!staticSvc) return { title: 'Non trouvé' }

    const svcLower = staticSvc.name.toLowerCase()
    let providerCount = 0
    try { providerCount = await getProviderCountByServiceAndLocation(serviceSlug, locationSlug) } catch { /* best-effort */ }
    const hasProviders = providerCount > 0

    const tHash = Math.abs(hashCode(`sq-title-${serviceSlug}-${locationSlug}-${publicId}`))
    const titleTemplates = hasProviders
      ? [
          `${staticSvc.name} à ${quartierName}, ${ville.name} — ${providerCount} pros`,
          `${providerCount} ${svcLower}s à ${quartierName} (${ville.name})`,
          `${staticSvc.name} ${quartierName} ${ville.name} : devis gratuit`,
          `Trouver un ${svcLower} à ${quartierName}, ${ville.name}`,
        ]
      : [
          `${staticSvc.name} à ${quartierName}, ${ville.name} — Devis gratuit`,
          `${svcLower} à ${quartierName} (${ville.name}) : artisans vérifiés`,
          `Trouver un ${svcLower} à ${quartierName}, ${ville.name}`,
        ]
    const title = truncateTitle(titleTemplates[tHash % titleTemplates.length])

    const dHash = Math.abs(hashCode(`sq-desc-${serviceSlug}-${locationSlug}-${publicId}`))
    const descTemplates = hasProviders
      ? [
          `${providerCount} ${svcLower}s référencés à ${quartierName}, ${ville.name} (${ville.departementCode}). Devis gratuit en ${ville.region}.`,
          `Comparez les ${svcLower}s à ${quartierName} (${ville.name}). ${providerCount} artisans vérifiés SIREN. Devis gratuit.`,
        ]
      : [
          `Trouvez un ${svcLower} qualifié à ${quartierName}, ${ville.name} (${ville.departementCode}). Artisans vérifiés, devis gratuit.`,
          `${svcLower} à ${quartierName} (${ville.name}) : annuaire d'artisans référencés en ${ville.region}. Devis gratuit.`,
        ]
    const description = descTemplates[dHash % descTemplates.length]

    return {
      title,
      description,
      // All service×quartier pages indexed — rich content exists even with few providers
      openGraph: { title, description, type: 'website', locale: 'fr_FR', url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`, images: [{ url: getServiceImage(serviceSlug).src, width: 1200, height: 630, alt: title }] },
      twitter: { card: 'summary_large_image', title, description, images: [getServiceImage(serviceSlug).src] },
      alternates: { canonical: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}` },
    }
  }

  // ─── PROVIDER DETAIL (existing logic) ────────────────────
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

    const title = truncateTitle(`${displayName} - ${serviceName} à ${cityName}`)

    const descParts: string[] = []
    descParts.push(`${displayName}, ${serviceName.toLowerCase()} à ${cityName}`)
    if (provider.experience_years) descParts.push(`${provider.experience_years} ans d'expérience`)
    if (provider.review_count && provider.review_count > 0) {
      descParts.push(`${provider.review_count} avis${provider.rating_average ? ` (${Number(provider.rating_average).toFixed(1)}/5)` : ''}`)
    }
    if (provider.certifications?.length) descParts.push(`${provider.certifications.length} certification${provider.certifications.length > 1 ? 's' : ''}`)
    if (provider.siret) descParts.push('SIRET vérifié')
    descParts.push('Devis gratuit')
    const rawDesc = descParts.join(' \u00b7 ') + '.'
    const description = rawDesc.length > 155 ? rawDesc.slice(0, 154).replace(/\s+\S*$/, '') + '\u2026' : rawDesc

    // Only noindex explicitly flagged providers (inactive/dead businesses)
    const shouldNoindex = provider.noindex === true

    const serviceImage = getServiceImage(serviceSlug)
    const ogAlt = `${displayName} - ${serviceName} à ${cityName}`
    // Use avatar if available, otherwise fall back to service-specific image (not generic OG)
    const ogImage = provider.avatar_url || serviceImage.src

    return {
      title,
      description,
      robots: shouldNoindex ? { index: false, follow: true } : undefined,
      openGraph: {
        title,
        description,
        type: 'profile',
        locale: 'fr_FR',
        url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`,
        images: provider.avatar_url
          ? [{ url: provider.avatar_url, alt: ogAlt }]
          : [{ url: serviceImage.src, width: 1200, height: 630, alt: ogAlt }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`,
      },
    }
  } catch {
    return { title: 'Artisan non trouvé', robots: { index: false, follow: true } }
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  // ─── QUARTIER DETECTION ──────────────────────────────────
  const quartierMatch = getQuartierBySlug(locationSlug, publicId)
  if (quartierMatch) {
    return <ServiceQuartierPage serviceSlug={serviceSlug} locationSlug={locationSlug} quartierSlug={publicId} />
  }

  // ─── PROVIDER DETAIL (existing logic) ────────────────────
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
    slug: provider.slug,
    specialty: provider.specialty,
    city: provider.address_city,
  })
  const currentPath = `/services/${serviceSlug}/${locationSlug}/${publicId}`
  // Only redirect if canonical URL has a valid ID segment (avoid redirect to hub page)
  const canonicalId = canonicalUrl.split('/').pop()
  if (canonicalId && currentPath !== canonicalUrl) {
    redirect(canonicalUrl)
  }

  // Convert to Artisan format
  const artisan = convertToArtisan(provider, service, location, serviceSlug)

  // Fetch reviews and similar artisans in parallel (graceful degradation)
  let reviews: Review[] = []
  let similarArtisans: Awaited<ReturnType<typeof getSimilarArtisans>> = []
  try {
    ;[reviews, similarArtisans] = await Promise.all([
      getProviderReviews(provider.id, service?.name || artisan.specialty),
      getSimilarArtisans(provider.id, artisan.specialty, artisan.postal_code),
    ])
  } catch {
    // Graceful degradation — page renders without reviews/similar artisans
  }

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

      {/* Server-rendered BreadcrumbList JSON-LD for immediate crawlability */}
      <JsonLd data={getBreadcrumbSchema([
        { name: 'Accueil', url: '/' },
        { name: 'Services', url: '/services' },
        { name: service?.name || artisan.specialty, url: `/services/${serviceSlug}` },
        { name: artisan.city, url: `/services/${serviceSlug}/${locationSlug}` },
        { name: artisan.business_name || 'Artisan', url: `/services/${serviceSlug}/${locationSlug}/${publicId}` },
      ])} />

      <ArtisanPageClient
        initialArtisan={artisan}
        initialReviews={reviews}
        artisanId={provider.id}
        similarArtisans={similarArtisans}
        isClaimed={!!provider.user_id}
        hasSiret={!!provider.siret}
      />

      {/* Lien retour vers le listing service+location (maillage bidirectionnel) */}
      <section className="py-6 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/services/${serviceSlug}/${locationSlug}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voir tous les {(service?.name || artisan.specialty).toLowerCase()}s à {artisan.city}
          </Link>
        </div>
      </section>

      {/* Internal Links — Maillage interne (SEO) */}
      <ArtisanInternalLinks
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        serviceName={service?.name || artisan.specialty}
        cityName={artisan.city}
        regionName={location?.region_name}
        departmentName={location?.department_name}
        departmentCode={location?.department_code}
      />

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Informations sur ce profil</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Les informations de ce profil sont fournies par l&apos;artisan et vérifiées via l&apos;API SIRENE (INSEE). Les tarifs affichés, lorsqu&apos;ils sont renseignés, sont indicatifs et propres à cet artisan. Les avis sont collectés auprès de clients ayant fait appel à ses services. ServicesArtisans est un annuaire indépendant — nous facilitons la mise en relation mais ne garantissons pas les prestations.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/notre-processus-de-verification" className="text-blue-600 hover:text-blue-800">
              Comment nous référençons les artisans
            </Link>
            <Link href="/politique-avis" className="text-blue-600 hover:text-blue-800">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-blue-600 hover:text-blue-800">
              Service de médiation
            </Link>
          </nav>
        </div>
      </section>
    </>
  )
}
