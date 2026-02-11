import { Metadata } from 'next'
import Link from 'next/link'
import {
  Wrench, Zap, Key, Flame, PaintBucket, Home, Hammer, HardHat,
  Droplets, Wind, Thermometer, TreeDeciduous, Car, Sofa, Sparkles,
  ShieldCheck, ArrowRight, TrendingUp, Award, MapPin
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularCitiesLinks, GeographicNavigation } from '@/components/InternalLinks'
import { services as staticServicesList } from '@/lib/data/france'

// Set of valid service slugs that have dedicated pages
const validServiceSlugs = new Set(staticServicesList.map(s => s.slug))

// ISR: Revalidate every hour
export const revalidate = REVALIDATE.services

export const metadata: Metadata = {
  title: 'Tous les services artisans — 350 000+ professionnels vérifiés',
  description: 'Annuaire de 350 000+ artisans vérifiés par SIREN : plombier, électricien, serrurier, chauffagiste, peintre, couvreur, menuisier, maçon et 50+ métiers. Devis gratuits dans 101 départements.',
  alternates: {
    canonical: 'https://servicesartisans.fr/services',
  },
  openGraph: {
    title: 'Tous les services artisans — 350 000+ professionnels vérifiés',
    description: '50+ métiers du bâtiment, 350 000+ artisans vérifiés par SIREN dans 101 départements. Trouvez un professionnel qualifié près de chez vous.',
    url: 'https://servicesartisans.fr/services',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

const allServices = [
  {
    category: 'Plomberie & Chauffage',
    icon: Droplets,
    color: 'blue',
    services: [
      { name: 'Plombier', slug: 'plombier', icon: Wrench, description: 'Réparation fuites, installation sanitaire, débouchage' },
      { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, description: 'Chaudière, pompe à chaleur, plancher chauffant' },
      { name: 'Climaticien', slug: 'climaticien', icon: Wind, description: 'Installation et entretien climatisation' },
      { name: 'Frigoriste', slug: 'frigoriste', icon: Thermometer, description: 'Systèmes frigorifiques professionnels' },
    ]
  },
  {
    category: 'Électricité & Domotique',
    icon: Zap,
    color: 'amber',
    services: [
      { name: 'Électricien', slug: 'electricien', icon: Zap, description: 'Installation, mise aux normes, dépannage' },
      { name: 'Domoticien', slug: 'domoticien', icon: Home, description: 'Maison connectée, automatisation' },
    ]
  },
  {
    category: 'Sécurité',
    icon: ShieldCheck,
    color: 'green',
    services: [
      { name: 'Serrurier', slug: 'serrurier', icon: Key, description: 'Ouverture de porte, changement serrure, blindage' },
      { name: 'Alarme & Vidéosurveillance', slug: 'alarme-videosurveillance', icon: ShieldCheck, description: 'Installation systèmes de sécurité' },
    ]
  },
  {
    category: 'Gros œuvre & Maçonnerie',
    icon: HardHat,
    color: 'orange',
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation, extension' },
      { name: 'Couvreur', slug: 'couvreur', icon: Home, description: 'Toiture, zinguerie, étanchéité' },
      { name: 'Façadier', slug: 'facadier', icon: PaintBucket, description: 'Ravalement, isolation extérieure' },
      { name: 'Terrassier', slug: 'terrassier', icon: Hammer, description: 'Terrassement, VRD, assainissement' },
    ]
  },
  {
    category: 'Menuiserie & Agencement',
    icon: Hammer,
    color: 'violet',
    services: [
      { name: 'Menuisier', slug: 'menuisier', icon: Hammer, description: 'Fenêtres, portes, escaliers, placards' },
      { name: 'Charpentier', slug: 'charpentier', icon: Home, description: 'Charpente bois, ossature' },
      { name: 'Cuisiniste', slug: 'cuisiniste', icon: Sofa, description: 'Conception et pose de cuisines' },
    ]
  },
  {
    category: 'Finitions',
    icon: PaintBucket,
    color: 'pink',
    services: [
      { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, description: 'Peinture intérieure et extérieure' },
      { name: 'Plaquiste', slug: 'plaquiste', icon: Hammer, description: 'Cloisons, plafonds, isolation' },
      { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, description: 'Pose carrelage, faïence, mosaïque' },
      { name: 'Solier', slug: 'solier', icon: Home, description: 'Parquet, moquette, sols souples' },
    ]
  },
  {
    category: 'Extérieur & Jardin',
    icon: TreeDeciduous,
    color: 'emerald',
    services: [
      { name: 'Jardinier', slug: 'jardinier', icon: TreeDeciduous, description: 'Création et entretien jardins' },
      { name: 'Pisciniste', slug: 'pisciniste', icon: Droplets, description: 'Construction et entretien piscines' },
      { name: 'Clôturiste', slug: 'cloturiste', icon: ShieldCheck, description: 'Clôtures, portails, grillages' },
    ]
  },
  {
    category: 'Autres services',
    icon: Sparkles,
    color: 'slate',
    services: [
      { name: 'Vitrier', slug: 'vitrier', icon: Sparkles, description: 'Remplacement vitres, miroirs, double vitrage' },
      { name: 'Déménageur', slug: 'demenageur', icon: Car, description: 'Déménagement, transport de meubles' },
      { name: 'Nettoyage', slug: 'nettoyage', icon: Sparkles, description: 'Nettoyage professionnel, remise en état' },
    ]
  },
]

const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', hover: 'group-hover:bg-amber-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'group-hover:bg-green-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'group-hover:bg-orange-100' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', hover: 'group-hover:bg-violet-100' },
  pink: { bg: 'bg-pink-50', icon: 'text-pink-600', hover: 'group-hover:bg-pink-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', hover: 'group-hover:bg-emerald-100' },
  slate: { bg: 'bg-slate-50', icon: 'text-slate-600', hover: 'group-hover:bg-slate-100' },
}

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

      {/* Premium Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">50+ métiers du bâtiment</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Tous nos{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              services
            </span>{' '}
            artisans
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Trouvez le professionnel idéal pour tous vos travaux.
            Artisans vérifiés, devis gratuits.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-2xl font-bold text-white">2h</div>
                <div className="text-xs text-slate-400">Temps de réponse</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Services' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allServices.map((category) => {
            const CategoryIcon = category.icon
            const colors = colorClasses[category.color]

            return (
              <div key={category.category} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <CategoryIcon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-gray-900 tracking-tight">
                      {category.category}
                    </h2>
                    <p className="text-sm text-gray-500">{category.services.length} services disponibles</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {category.services.map((service) => {
                    const Icon = service.icon
                    const hasPage = validServiceSlugs.has(service.slug)

                    if (hasPage) {
                      return (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative">
                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 ${colors.hover} transition-colors`}>
                              <Icon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                          <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={service.slug}
                        className="relative bg-white rounded-2xl border border-gray-100 p-6 opacity-75"
                      >
                        <div className="absolute top-3 right-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          Bientôt
                        </div>
                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Maillage interne: Villes populaires */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
              <MapPin className="w-6 h-6 text-blue-600" />
              Trouvez un artisan par ville
            </h2>
            <PopularCitiesLinks showTitle={false} limit={10} />
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Devis gratuit en quelques clics</span>
          </div>

          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Vous ne trouvez pas votre métier ?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Contactez-nous et nous vous aiderons à trouver le bon artisan pour votre projet.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
