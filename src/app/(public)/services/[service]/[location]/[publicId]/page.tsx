import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProviderByStableId, getProviderBySlug, getServiceBySlug, getLocationBySlug } from '@/lib/supabase'
import { getArtisanUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import ArtisanPageClient from '@/components/artisan/ArtisanPageClient'
import ArtisanInternalLinks from '@/components/artisan/ArtisanInternalLinks'
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
    : generateDescription(name, specialty, city || 'votre région', provider)

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
    average_rating: provider.rating_average || provider.average_rating || null,
    review_count: provider.review_count || 0,
    is_verified: provider.is_verified || false,
    is_center: provider.is_center || false,
    team_size: provider.team_size || undefined,
    services: provider.services || [],
    service_prices: (provider.service_prices && provider.service_prices.length > 0) ? provider.service_prices : generateServicePrices(serviceSlug),
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
    faq: (provider.faq && provider.faq.length > 0) ? provider.faq : generateFAQ(name, specialty, city, provider),
    // Legacy fields — undefined at runtime (columns dropped), kept for sub-component compat
    // Will be removed when each sub-component migrates to v2 Artisan type
  }
}

// Generate a rich, unique description based on all available provider data
function generateDescription(name: string, specialty: string, city: string, provider?: any): string {
  const spe = specialty.toLowerCase()
  const parts: string[] = []

  // Opening sentence with specialty and location
  parts.push(`${name} est votre ${spe} de confiance à ${city}.`)

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
    parts.push(`Entreprise immatriculée et vérifiée (SIRET ${provider.siret.substring(0, 9)}...).`)
  }

  // Rating
  const rating = provider?.rating_average || provider?.average_rating
  if (rating && rating >= 4) {
    parts.push(`Noté ${Number(rating).toFixed(1)}/5 par ses clients.`)
  }

  // CTA
  parts.push(`Contactez ${name} pour obtenir un devis gratuit et personnalisé, sans engagement.`)

  return parts.join(' ')
}

// Generate typical service prices based on specialty
const SERVICE_PRICES_BY_SPECIALTY: Record<string, Array<{ name: string; description: string; price: string; duration?: string }>> = {
  plombier: [
    { name: 'Dépannage plomberie', description: 'Intervention urgente : fuite, débouchage, réparation', price: 'À partir de 80€', duration: '1-2h' },
    { name: 'Installation sanitaire', description: 'Pose de lavabo, douche, WC, baignoire', price: 'À partir de 150€', duration: '2-4h' },
    { name: 'Recherche de fuite', description: 'Détection et réparation de fuite d\'eau', price: 'À partir de 120€', duration: '1-3h' },
    { name: 'Remplacement chauffe-eau', description: 'Dépose et installation d\'un nouveau chauffe-eau', price: 'À partir de 350€', duration: '3-4h' },
  ],
  electricien: [
    { name: 'Dépannage électrique', description: 'Panne, court-circuit, disjoncteur, prise défaillante', price: 'À partir de 80€', duration: '1-2h' },
    { name: 'Installation électrique', description: 'Pose de prises, interrupteurs, éclairage', price: 'À partir de 100€', duration: '2-4h' },
    { name: 'Mise aux normes', description: 'Mise en conformité du tableau électrique', price: 'À partir de 500€', duration: '1-2 jours' },
    { name: 'Pose de luminaires', description: 'Installation de spots, suspensions, appliques', price: 'À partir de 60€', duration: '1-2h' },
  ],
  serrurier: [
    { name: 'Ouverture de porte', description: 'Porte claquée ou fermée à clé, sans dégât', price: 'À partir de 90€', duration: '30min-1h' },
    { name: 'Changement de serrure', description: 'Remplacement de cylindre ou serrure complète', price: 'À partir de 120€', duration: '1-2h' },
    { name: 'Installation de blindage', description: 'Porte blindée ou blindage de porte existante', price: 'À partir de 800€', duration: '2-4h' },
    { name: 'Double de clé', description: 'Reproduction de clé standard ou sécurisée', price: 'À partir de 15€', duration: '15min' },
  ],
  chauffagiste: [
    { name: 'Entretien chaudière', description: 'Révision annuelle obligatoire, nettoyage, contrôle', price: 'À partir de 90€', duration: '1-2h' },
    { name: 'Dépannage chauffage', description: 'Panne de chaudière, radiateur, thermostat', price: 'À partir de 100€', duration: '1-3h' },
    { name: 'Installation chaudière', description: 'Pose et mise en service de chaudière gaz ou fioul', price: 'À partir de 2 500€', duration: '1-2 jours' },
    { name: 'Installation climatisation', description: 'Pose de climatiseur réversible mono ou multi-split', price: 'À partir de 1 200€', duration: '1 jour' },
  ],
  'peintre-en-batiment': [
    { name: 'Peinture intérieure', description: 'Murs et plafonds, préparation et deux couches', price: 'À partir de 25€/m²', duration: '1-3 jours' },
    { name: 'Peinture extérieure', description: 'Ravalement de façade, volets, portails', price: 'À partir de 35€/m²', duration: '2-5 jours' },
    { name: 'Pose de papier peint', description: 'Préparation des murs et pose soignée', price: 'À partir de 30€/m²', duration: '1-2 jours' },
    { name: 'Enduit et lissage', description: 'Ratissage, enduit de lissage, préparation', price: 'À partir de 20€/m²', duration: '1-2 jours' },
  ],
  menuisier: [
    { name: 'Pose de cuisine', description: 'Montage et installation de meubles de cuisine', price: 'À partir de 500€', duration: '1-3 jours' },
    { name: 'Fabrication sur mesure', description: 'Étagères, placards, bibliothèques, dressing', price: 'À partir de 300€', duration: '2-5 jours' },
    { name: 'Pose de parquet', description: 'Parquet massif, contrecollé ou stratifié', price: 'À partir de 30€/m²', duration: '1-3 jours' },
    { name: 'Réparation menuiserie', description: 'Porte, fenêtre, volet, escalier', price: 'À partir de 80€', duration: '1-4h' },
  ],
  carreleur: [
    { name: 'Pose de carrelage sol', description: 'Carrelage intérieur, préparation et pose', price: 'À partir de 35€/m²', duration: '1-3 jours' },
    { name: 'Faïence murale', description: 'Carrelage mural salle de bain, cuisine', price: 'À partir de 40€/m²', duration: '1-2 jours' },
    { name: 'Mosaïque', description: 'Pose de mosaïque décorative', price: 'À partir de 50€/m²', duration: '1-3 jours' },
    { name: 'Rénovation carrelage', description: 'Dépose ancien carrelage et repose', price: 'À partir de 45€/m²', duration: '2-4 jours' },
  ],
  couvreur: [
    { name: 'Réparation toiture', description: 'Tuiles cassées, fuite, faîtage', price: 'À partir de 200€', duration: '1-2 jours' },
    { name: 'Réfection complète', description: 'Remplacement intégral de la couverture', price: 'À partir de 80€/m²', duration: '3-10 jours' },
    { name: 'Nettoyage toiture', description: 'Démoussage, traitement hydrofuge', price: 'À partir de 15€/m²', duration: '1-2 jours' },
    { name: 'Pose de gouttières', description: 'Gouttières aluminium, zinc ou PVC', price: 'À partir de 30€/ml', duration: '1-2 jours' },
  ],
  macon: [
    { name: 'Maçonnerie générale', description: 'Construction, extension, rénovation', price: 'Sur devis', duration: 'Variable' },
    { name: 'Dalle béton', description: 'Coulage de dalle, chape, terrasse', price: 'À partir de 50€/m²', duration: '2-5 jours' },
    { name: 'Ouverture de mur', description: 'Création d\'ouverture, pose d\'IPN', price: 'À partir de 800€', duration: '1-3 jours' },
    { name: 'Ravalement de façade', description: 'Enduit, crépi, réparation de fissures', price: 'À partir de 40€/m²', duration: '3-10 jours' },
  ],
  jardinier: [
    { name: 'Entretien de jardin', description: 'Tonte, taille de haies, désherbage', price: 'À partir de 35€/h', duration: '2-4h' },
    { name: 'Élagage', description: 'Taille et élagage d\'arbres', price: 'À partir de 150€', duration: '2-6h' },
    { name: 'Création de jardin', description: 'Aménagement paysager, plantation', price: 'Sur devis', duration: 'Variable' },
    { name: 'Pose de clôture', description: 'Clôture bois, grillage, panneaux', price: 'À partir de 40€/ml', duration: '1-3 jours' },
  ],
}

function generateServicePrices(specialtySlug: string): Array<{ name: string; description: string; price: string; duration?: string }> {
  return SERVICE_PRICES_BY_SPECIALTY[specialtySlug] || []
}

// Generate automatic FAQ based on specialty and city
function generateFAQ(name: string, specialty: string, city: string, provider?: any): Array<{ question: string; answer: string }> {
  const spe = specialty.toLowerCase()
  const faq: Array<{ question: string; answer: string }> = []

  faq.push({
    question: `Comment contacter ${name} ?`,
    answer: `Vous pouvez contacter ${name} directement via notre plateforme en demandant un devis gratuit. Votre demande sera transmise rapidement et vous recevrez une réponse dans les meilleurs délais.`,
  })

  faq.push({
    question: `Quels sont les services proposés par ce ${spe} à ${city} ?`,
    answer: `${name} propose des services de ${spe} à ${city} et ses environs. Consultez la section "Services et tarifs" sur cette page pour découvrir l'ensemble des prestations disponibles.`,
  })

  faq.push({
    question: `Comment obtenir un devis gratuit ?`,
    answer: `Pour obtenir un devis gratuit et sans engagement, cliquez sur le bouton "Demander un devis" sur cette page. Décrivez votre projet et ${name} vous répondra avec une estimation personnalisée.`,
  })

  if (provider?.is_verified || provider?.siret) {
    faq.push({
      question: `${name} est-il un artisan vérifié ?`,
      answer: `Oui, ${name} est un professionnel vérifié sur ServicesArtisans. Son numéro SIRET a été contrôlé et son activité est bien enregistrée auprès des autorités compétentes.`,
    })
  }

  faq.push({
    question: `Quelle est la zone d'intervention de ${name} ?`,
    answer: `${name} intervient principalement à ${city} et dans les communes environnantes. Pour savoir si votre localité est couverte, n'hésitez pas à demander un devis en précisant votre adresse.`,
  })

  return faq
}

// Fetch similar artisans (same specialty, same department)
async function getSimilarArtisans(providerId: string, specialty: string, postalCode?: string) {
  try {
    const supabase = await createClient()
    const deptCode = postalCode && postalCode.length >= 2 ? postalCode.substring(0, 2) : null

    let query = supabase
      .from('providers')
      .select('id, stable_id, slug, name, business_name, specialty, rating_average, review_count, address_city, hourly_rate, is_verified, is_premium, avatar_url')
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
      name: p.name || p.business_name || 'Artisan',
      specialty: p.specialty || specialty,
      rating: p.rating_average || 0,
      reviews: p.review_count || 0,
      city: p.address_city || '',
      hourly_rate: p.hourly_rate || undefined,
      is_verified: p.is_verified || false,
      is_premium: p.is_premium || false,
      avatar_url: p.avatar_url || undefined,
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

    const title = `${displayName} - ${serviceName} à ${cityName}`
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

  // Fetch reviews and similar artisans in parallel
  const [reviews, similarArtisans] = await Promise.all([
    getProviderReviews(provider.id, service?.name || artisan.specialty),
    getSimilarArtisans(provider.id, artisan.specialty, artisan.postal_code),
  ])

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
        similarArtisans={similarArtisans}
      />

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

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/notre-processus-de-verification" className="text-blue-600 hover:text-blue-800">
              Comment nous vérifions les artisans
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
