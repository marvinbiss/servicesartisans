import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArtisanPageClient from './ArtisanPageClient'
import { Artisan, Review } from '@/components/artisan'

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

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const { artisan } = await getArtisan(params.id)

  if (!artisan) {
    return {
      title: 'Artisan non trouve | ServicesArtisans',
      description: 'Cet artisan n\'existe pas ou n\'est plus disponible sur ServicesArtisans.',
    }
  }

  const displayName = getDisplayName(artisan)
  const title = `${displayName} - ${artisan.specialty} a ${artisan.city} | ServicesArtisans`
  const description = `${displayName}, ${artisan.specialty} a ${artisan.city}. ⭐ ${artisan.average_rating}/5 (${artisan.review_count} avis). ${artisan.is_verified ? 'SIRET verifie.' : ''} ${artisan.hourly_rate ? `Tarifs a partir de ${artisan.hourly_rate}€/h.` : ''} Reservez en ligne.`

  return {
    title,
    description,
    keywords: [
      artisan.specialty,
      artisan.city,
      'artisan',
      ...artisan.services.slice(0, 5),
      artisan.postal_code,
    ],
    openGraph: {
      title: `${displayName} - ${artisan.specialty} a ${artisan.city}`,
      description: `⭐ ${artisan.average_rating}/5 - ${artisan.review_count} avis verifies. ${artisan.description?.substring(0, 150) || ''}`,
      type: 'website',
      locale: 'fr_FR',
      url: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
      siteName: 'ServicesArtisans',
      images: artisan.avatar_url ? [
        {
          url: artisan.avatar_url,
          width: 400,
          height: 400,
          alt: displayName,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} - ${artisan.specialty}`,
      description: `⭐ ${artisan.average_rating}/5 - ${artisan.review_count} avis`,
    },
    alternates: {
      canonical: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
    },
    robots: {
      index: true,
      follow: true,
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
    <ArtisanPageClient
      initialArtisan={artisan}
      initialReviews={reviews}
      artisanId={params.id}
    />
  )
}
