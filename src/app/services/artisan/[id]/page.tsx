import { Metadata } from 'next'
import ArtisanPageClient from './ArtisanPageClient'
import { Artisan, Review } from '@/components/artisan'

// Preload critical resources component for better performance
function PreloadHints({ artisan }: { artisan: Artisan | null }) {
  if (!artisan) return null

  return (
    <>
      {/* Preload hero image if available */}
      {artisan.avatar_url && (
        <link
          rel="preload"
          href={artisan.avatar_url}
          as="image"
          // @ts-expect-error - fetchPriority is valid but not in React types yet
          fetchpriority="high"
        />
      )}
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//umjmbdbwcsxrvfqktiui.supabase.co" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://umjmbdbwcsxrvfqktiui.supabase.co" crossOrigin="anonymous" />
      {/* Preload OpenStreetMap for map component */}
      <link rel="dns-prefetch" href="//www.openstreetmap.org" />
    </>
  )
}

// Demo data for fallback
const DEMO_ARTISANS: Record<string, Artisan> = {
  'demo-1': {
    id: 'demo-1',
    business_name: 'Plomberie Martin & Fils',
    first_name: null,
    last_name: null,
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '1 Rue Delteral',
    specialty: 'Plombier - Chauffagiste',
    description: 'Entreprise familiale de plomberie depuis 1985. Nous intervenons pour tous vos travaux de plomberie, chauffage et depannage urgent. Notre equipe de 3 professionnels qualifies est a votre service 7j/7 pour les urgences. Devis gratuit et intervention rapide garantie.',
    average_rating: 4.6,
    review_count: 234,
    hourly_rate: 55,
    is_verified: true,
    is_premium: true,
    is_center: true,
    team_size: 3,
    services: ['Depannage plomberie', 'Installation sanitaire', 'Chauffage', 'Debouchage', 'Recherche de fuite', 'Chauffe-eau'],
    service_prices: [
      { name: 'Deplacement + diagnostic', description: 'Evaluation sur place du probleme', price: '49€', duration: '30 min' },
      { name: 'Debouchage evier/lavabo', description: 'Debouchage mecanique ou haute pression', price: '80-120€', duration: '1h' },
      { name: 'Debouchage WC', description: 'Intervention debouchage toilettes', price: '90-150€', duration: '1h' },
      { name: 'Reparation fuite', description: 'Reparation fuite robinet, tuyau, joint', price: '80-200€', duration: '1-2h' },
      { name: 'Remplacement chauffe-eau', description: 'Depose ancien + pose nouveau (hors materiel)', price: '250-400€', duration: '3h' },
      { name: 'Installation WC', description: 'Pose WC complet avec raccordements', price: '150-300€', duration: '2h' },
    ],
    accepts_new_clients: true,
    intervention_zone: '20 km',
    response_time: '< 1h',
    experience_years: 38,
    certifications: ['RGE QualiPAC', 'Qualibat', 'Artisan certifie'],
    insurance: ['Garantie decennale AXA', 'RC Professionnelle', 'Garantie biennale'],
    payment_methods: ['Carte bancaire', 'Especes', 'Cheque', 'Virement', 'Cheque energie'],
    languages: ['Francais', 'Anglais'],
    emergency_available: true,
    member_since: '2019',
    response_rate: 98,
    bookings_this_week: 12,
    siret: '12345678901234',
    legal_form: 'SARL',
    creation_date: '1985-03-15',
    employee_count: 3,
    phone: '01 23 45 67 89',
    latitude: 48.8827,
    longitude: 2.4024,
    intervention_zones: ['Le Pre-Saint-Gervais (93310)', 'Pantin (93500)', 'Les Lilas (93260)', 'Romainville (93230)', 'Bobigny (93000)'],
    faq: [
      { question: 'Intervenez-vous le week-end ?', answer: 'Oui, nous intervenons 7j/7 pour les urgences. Les interventions le week-end peuvent faire l\'objet d\'une majoration de 30%.' },
      { question: 'Le devis est-il gratuit ?', answer: 'Oui, le devis est toujours gratuit et sans engagement. Pour les interventions a distance de plus de 20km, des frais de deplacement peuvent s\'appliquer.' },
      { question: 'Quels sont vos delais d\'intervention ?', answer: 'Pour les urgences, nous intervenons sous 1h en moyenne. Pour les travaux planifies, comptez 48-72h selon notre planning.' },
      { question: 'Acceptez-vous les cheques energie ?', answer: 'Oui, nous sommes agrees RGE et acceptons les cheques energie pour les travaux de chauffage eligibles.' },
    ],
  },
  'demo-2': {
    id: 'demo-2',
    business_name: null,
    first_name: 'Jerome',
    last_name: 'DUPONT',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '9 Avenue Faidherbe',
    specialty: 'Electricien',
    description: 'Electricien agree avec plus de 15 ans d\'experience. Specialise dans la mise aux normes electriques, l\'installation de tableaux et le depannage.',
    average_rating: 4.8,
    review_count: 156,
    hourly_rate: 50,
    is_verified: true,
    is_premium: false,
    is_center: false,
    services: ['Mise aux normes', 'Installation tableau electrique', 'Depannage', 'Prises et interrupteurs'],
    service_prices: [
      { name: 'Diagnostic electrique', description: 'Verification installation complete', price: '90€', duration: '1h' },
      { name: 'Remplacement prise/interrupteur', description: 'Fourniture et pose', price: '45-70€', duration: '30 min' },
    ],
    accepts_new_clients: true,
    intervention_zone: '15 km',
    response_time: '< 2h',
    experience_years: 15,
    certifications: ['Consuel', 'Habilitation electrique BR'],
    insurance: ['Garantie decennale', 'RC Professionnelle'],
    payment_methods: ['Carte bancaire', 'Especes', 'Cheque'],
    languages: ['Francais'],
    emergency_available: false,
    member_since: '2020',
    response_rate: 95,
    bookings_this_week: 8,
    latitude: 48.8854,
    longitude: 2.3996,
    intervention_zones: ['Le Pre-Saint-Gervais (93310)', 'Paris 19e', 'Paris 20e'],
    faq: [],
  },
}

const DEMO_REVIEWS: Review[] = [
  { id: '1', author: 'Marie L.', rating: 5, date: '15 janvier 2026', comment: 'Intervention rapide et efficace. Le probleme de fuite a ete resolu en moins d\'une heure. Tres professionnel, je recommande vivement !', service: 'Depannage plomberie', verified: true },
  { id: '2', author: 'Pierre D.', rating: 5, date: '12 janvier 2026', comment: 'Excellent travail pour l\'installation de mon nouveau chauffe-eau. Propre, ponctuel et de bons conseils. Prix correct.', service: 'Chauffe-eau', hasPhoto: true, verified: true },
  { id: '3', author: 'Sophie M.', rating: 4, date: '8 janvier 2026', comment: 'Bonne prestation pour le debouchage de mes canalisations. Un peu de retard mais travail bien fait.', service: 'Debouchage', verified: true },
  { id: '4', author: 'Jean-Paul R.', rating: 5, date: '3 janvier 2026', comment: 'Tres satisfait de l\'installation complete de ma salle de bain. Equipe competente et a l\'ecoute.', service: 'Installation sanitaire', hasPhoto: true, verified: true },
  { id: '5', author: 'Isabelle C.', rating: 4, date: '28 decembre 2025', comment: 'Intervention pour une recherche de fuite. Probleme trouve et repare rapidement.', service: 'Recherche de fuite', verified: false },
]

// Helper function to get display name
function getDisplayName(artisan: Artisan): string {
  if (artisan.is_center && artisan.business_name) {
    return artisan.business_name
  }
  if (artisan.business_name) {
    return artisan.business_name
  }
  return `${artisan.first_name || ''} ${artisan.last_name || ''}`.trim() || 'Artisan'
}

// Fetch artisan data (server-side)
async function getArtisan(id: string): Promise<{ artisan: Artisan | null; reviews: Review[] }> {
  // Try demo data first for demo IDs
  if (id.startsWith('demo-')) {
    const demoArtisan = DEMO_ARTISANS[id]
    if (demoArtisan) {
      return { artisan: demoArtisan, reviews: DEMO_REVIEWS }
    }
  }

  // Try API for real artisans
  try {
    // Use localhost in development, production URL otherwise
    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')
    const response = await fetch(`${baseUrl}/api/artisans/${id}`, {
      cache: 'no-store',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.artisan) {
        return { artisan: data.artisan, reviews: data.reviews || [] }
      }
    }
  } catch (error) {
    console.error('Error fetching artisan:', error)
  }

  return { artisan: null, reviews: [] }
}

// Helper function to truncate text to a specific length at word boundary
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
}

// Generate dynamic metadata with optimized lengths for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const { artisan, reviews } = await getArtisan(params.id)

  if (!artisan) {
    return {
      title: 'Artisan non trouve | ServicesArtisans',
      description: 'Cet artisan n\'existe pas ou n\'est plus disponible sur ServicesArtisans.',
    }
  }

  const displayName = getDisplayName(artisan)

  // Optimized title: 50-60 characters for better SEO
  // Format: "Name - Specialty City" (keeps most important info)
  const baseTitle = `${displayName} - ${artisan.specialty} ${artisan.city}`
  const title = truncateText(baseTitle, 60)

  // Optimized description: 150-160 characters for better SERP display
  // Include key info: rating, review count, verified status, and CTA
  const ratingText = artisan.review_count > 0
    ? `Note ${artisan.average_rating}/5 (${artisan.review_count} avis).`
    : ''
  const verifiedText = artisan.is_verified ? 'Artisan verifie.' : ''
  const priceText = artisan.hourly_rate ? `Des ${artisan.hourly_rate}€/h.` : ''

  const descParts = [
    `${displayName}, ${artisan.specialty} a ${artisan.city}.`,
    ratingText,
    verifiedText,
    priceText,
    'Devis gratuit.'
  ].filter(Boolean).join(' ')

  const description = truncateText(descParts, 160)

  // Structured data for reviews (for rich snippets in search results)
  const reviewStructuredData = reviews.length > 0 ? reviews.slice(0, 10).map(review => ({
    '@type': 'Review',
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.rating,
      'bestRating': 5,
      'worstRating': 1
    },
    'author': {
      '@type': 'Person',
      'name': review.author
    },
    'datePublished': review.date,
    'reviewBody': review.comment,
    ...(review.verified && { 'isVerified': true })
  })) : []

  return {
    title,
    description,
    keywords: [
      artisan.specialty,
      `${artisan.specialty} ${artisan.city}`,
      artisan.city,
      artisan.postal_code,
      'artisan',
      'devis gratuit',
      ...artisan.services.slice(0, 5),
    ],
    openGraph: {
      title: truncateText(`${displayName} - ${artisan.specialty} a ${artisan.city}`, 70),
      description: truncateText(
        `Note ${artisan.average_rating}/5 sur ${artisan.review_count} avis. ${artisan.description || `${artisan.specialty} professionnel a ${artisan.city}`}`,
        200
      ),
      type: 'website',
      locale: 'fr_FR',
      url: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
      siteName: 'ServicesArtisans',
      images: artisan.avatar_url ? [
        {
          url: artisan.avatar_url,
          width: 400,
          height: 400,
          alt: `${displayName} - ${artisan.specialty}`,
        },
      ] : [
        {
          url: 'https://servicesartisans.fr/og-artisan.jpg',
          width: 1200,
          height: 630,
          alt: `${displayName} - ${artisan.specialty} a ${artisan.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: truncateText(`${displayName} - ${artisan.specialty}`, 70),
      description: truncateText(`Note ${artisan.average_rating}/5 - ${artisan.review_count} avis verifies`, 200),
    },
    alternates: {
      canonical: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    other: {
      // Additional meta tags for enhanced SEO
      'geo.region': 'FR',
      'geo.placename': artisan.city,
      ...(artisan.latitude && artisan.longitude && {
        'geo.position': `${artisan.latitude};${artisan.longitude}`,
        'ICBM': `${artisan.latitude}, ${artisan.longitude}`,
      }),
      // Structured review data as JSON (for crawlers that read meta tags)
      ...(reviewStructuredData.length > 0 && {
        'review-count': String(artisan.review_count),
        'average-rating': String(artisan.average_rating),
      }),
    },
  }
}

// ISR configuration
export const revalidate = 3600 // Revalidate every hour

// Main page component (server component)
export default async function ArtisanPage({
  params,
}: {
  params: { id: string }
}) {
  const { artisan, reviews } = await getArtisan(params.id)

  return (
    <>
      {/* Preload critical resources for faster page load */}
      <PreloadHints artisan={artisan} />
      <ArtisanPageClient
        initialArtisan={artisan}
        initialReviews={reviews}
        artisanId={params.id}
      />
    </>
  )
}
