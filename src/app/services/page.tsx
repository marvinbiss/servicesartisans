import { Metadata } from 'next'
import Link from 'next/link'
import {
  Wrench, Zap, Key, Flame, PaintBucket, Home, Hammer, HardHat,
  Droplets, Wind, Thermometer, TreeDeciduous, Car, Sofa, Sparkles,
  ShieldCheck, ArrowRight, Star, Users
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'

// ISR: Revalidate every hour
export const revalidate = REVALIDATE.services

export const metadata: Metadata = {
  title: 'Tous les services artisans - ServicesArtisans',
  description: 'Découvrez tous nos services : plombier, électricien, serrurier, chauffagiste, peintre, couvreur, menuisier, maçon et bien plus. Trouvez un artisan qualifié près de chez vous.',
  openGraph: {
    title: 'Tous les services artisans - ServicesArtisans',
    description: 'Plus de 50 métiers du bâtiment pour tous vos travaux. Trouvez un artisan qualifié près de chez vous.',
  },
}

const allServices = [
  {
    category: 'Plomberie & Chauffage',
    services: [
      { name: 'Plombier', slug: 'plombier', icon: Wrench, description: 'Réparation fuites, installation sanitaire, débouchage' },
      { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, description: 'Chaudière, pompe à chaleur, plancher chauffant' },
      { name: 'Climaticien', slug: 'climaticien', icon: Wind, description: 'Installation et entretien climatisation' },
      { name: 'Frigoriste', slug: 'frigoriste', icon: Thermometer, description: 'Systèmes frigorifiques professionnels' },
    ]
  },
  {
    category: 'Électricité & Domotique',
    services: [
      { name: 'Électricien', slug: 'electricien', icon: Zap, description: 'Installation, mise aux normes, dépannage' },
      { name: 'Domoticien', slug: 'domoticien', icon: Home, description: 'Maison connectée, automatisation' },
    ]
  },
  {
    category: 'Sécurité',
    services: [
      { name: 'Serrurier', slug: 'serrurier', icon: Key, description: 'Ouverture de porte, changement serrure, blindage' },
      { name: 'Alarme & Vidéosurveillance', slug: 'alarme-videosurveillance', icon: ShieldCheck, description: 'Installation systèmes de sécurité' },
    ]
  },
  {
    category: 'Gros œuvre & Maçonnerie',
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation, extension' },
      { name: 'Couvreur', slug: 'couvreur', icon: Home, description: 'Toiture, zinguerie, étanchéité' },
      { name: 'Façadier', slug: 'facadier', icon: PaintBucket, description: 'Ravalement, isolation extérieure' },
      { name: 'Terrassier', slug: 'terrassier', icon: Hammer, description: 'Terrassement, VRD, assainissement' },
    ]
  },
  {
    category: 'Menuiserie & Agencement',
    services: [
      { name: 'Menuisier', slug: 'menuisier', icon: Hammer, description: 'Fenêtres, portes, escaliers, placards' },
      { name: 'Charpentier', slug: 'charpentier', icon: Home, description: 'Charpente bois, ossature' },
      { name: 'Cuisiniste', slug: 'cuisiniste', icon: Sofa, description: 'Conception et pose de cuisines' },
    ]
  },
  {
    category: 'Finitions',
    services: [
      { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, description: 'Peinture intérieure et extérieure' },
      { name: 'Plaquiste', slug: 'plaquiste', icon: Hammer, description: 'Cloisons, plafonds, isolation' },
      { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, description: 'Pose carrelage, faïence, mosaïque' },
      { name: 'Solier', slug: 'solier', icon: Home, description: 'Parquet, moquette, sols souples' },
    ]
  },
  {
    category: 'Extérieur & Jardin',
    services: [
      { name: 'Paysagiste', slug: 'paysagiste', icon: TreeDeciduous, description: 'Création et entretien jardins' },
      { name: 'Pisciniste', slug: 'pisciniste', icon: Droplets, description: 'Construction et entretien piscines' },
      { name: 'Clôturiste', slug: 'cloturiste', icon: ShieldCheck, description: 'Clôtures, portails, grillages' },
    ]
  },
  {
    category: 'Autres services',
    services: [
      { name: 'Vitrier', slug: 'vitrier', icon: Sparkles, description: 'Remplacement vitres, miroirs, double vitrage' },
      { name: 'Déménageur', slug: 'demenageur', icon: Car, description: 'Déménagement, transport de meubles' },
      { name: 'Nettoyage', slug: 'nettoyage', icon: Sparkles, description: 'Nettoyage professionnel, remise en état' },
    ]
  },
]

export default function ServicesPage() {
  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
  ])

  const organizationSchema = getOrganizationSchema()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <JsonLd data={[breadcrumbSchema, organizationSchema]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tous nos services artisans
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Plus de 50 métiers du bâtiment pour tous vos travaux.
            Trouvez un artisan qualifié près de chez vous.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allServices.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.services.map((service) => {
                  const Icon = service.icon
                  return (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous ne trouvez pas votre métier ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous et nous vous aiderons à trouver le bon artisan
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
