import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, ArrowRight, Users, Shield, Sparkles, TrendingUp, Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat, TreeDeciduous } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'
import Breadcrumb from '@/components/Breadcrumb'
import { GeographicNavigation } from '@/components/InternalLinks'
import { popularServices as popularServicesData } from '@/lib/constants/navigation'
import { villes } from '@/lib/data/france'

// Map icon names to actual components for server-side rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat, TreeDeciduous
}

const popularServices = popularServicesData.map(s => ({
  ...s,
  icon: iconMap[s.icon] || Wrench
}))

// ISR: Revalidate every 24 hours
export const revalidate = REVALIDATE.locations

export const metadata: Metadata = {
  title: 'Artisans par ville - Trouvez un artisan près de chez vous | ServicesArtisans',
  description: 'Trouvez un artisan qualifié dans votre ville. Plus de 100 villes principales couvertes en France. Paris, Lyon, Marseille, Toulouse, Bordeaux et toutes les villes de France.',
  alternates: {
    canonical: 'https://servicesartisans.fr/villes',
  },
  openGraph: {
    title: 'Artisans par ville en France',
    description: 'Plus de 100 villes principales couvertes. Trouvez un artisan qualifié près de chez vous.',
    url: 'https://servicesartisans.fr/villes',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

// Grouper les villes par région
const villesByRegion = villes.reduce((acc, ville) => {
  if (!acc[ville.region]) {
    acc[ville.region] = []
  }
  acc[ville.region].push(ville)
  return acc
}, {} as Record<string, typeof villes>)

// Ordre des régions (les plus peuplées d'abord)
const regionOrder = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Provence-Alpes-Côte d\'Azur',
  'Occitanie',
  'Nouvelle-Aquitaine',
  'Hauts-de-France',
  'Grand Est',
  'Pays de la Loire',
  'Bretagne',
  'Normandie',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
  'Corse',
]

export default function VillesPage() {
  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Villes', url: '/villes' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <JsonLd data={breadcrumbSchema} />

      {/* Premium Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white/90">{villes.length}+ villes principales couvertes</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Artisans par{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              ville
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Trouvez un artisan qualifié et vérifié près de chez vous.
            Service disponible partout en France.
          </p>

          {/* Premium Search */}
          <div className="max-w-2xl mx-auto">
            <div role="search" aria-label="Rechercher une ville">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" aria-hidden="true" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-2">
                  <label htmlFor="city-search" className="sr-only">Rechercher une ville</label>
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-slate-400 ml-4" aria-hidden="true" />
                    <input
                      id="city-search"
                      type="search"
                      placeholder="Rechercher une ville..."
                      className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      Rechercher
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12" role="list" aria-label="Statistiques clés">
            <div className="flex items-center gap-2" role="listitem">
              <Users className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span className="text-slate-300">Artisans qualifiés</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <TrendingUp className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span className="text-slate-300">Réponse en 2h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Villes' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Villes par région */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {regionOrder.map((regionName) => {
            const regionVilles = villesByRegion[regionName]
            if (!regionVilles || regionVilles.length === 0) return null

            return (
              <div key={regionName} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {regionName}
                      </h2>
                      <p className="text-sm text-gray-500">{regionVilles.length} villes principales</p>
                    </div>
                  </div>
                  <Link
                    href={`/regions/${regionName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '-').replace(/-+/g, '-')}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    Voir la région <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {regionVilles.map((ville) => (
                    <Link
                      key={ville.slug}
                      href={`/villes/${ville.slug}`}
                      className="group relative bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {ville.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {ville.population} hab.
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {ville.departement} ({ville.departementCode})
                        </div>
                      </div>
                      <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Services populaires - Maillage interne */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trouvez un artisan par métier</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularServices.map((service) => {
                const Icon = service.icon
                return (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-blue-600">{service.name}</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <Link href="/services" className="text-blue-600 hover:text-blue-700 font-medium">
                Voir tous les services →
              </Link>
            </div>
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
            <span className="text-sm font-medium text-amber-300">Toutes les communes de France</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Votre ville n&apos;est pas listée ?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Nous couvrons toute la France. Recherchez votre commune pour trouver un artisan.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
