import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, Shield, Users, Star, Sparkles, Building2, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, GeographicNavigation, PopularCitiesLinks } from '@/components/InternalLinks'
import { departements } from '@/lib/data/france'

export const metadata: Metadata = {
  title: 'Artisans par département - Tous les départements de France | ServicesArtisans',
  description: 'Trouvez un artisan qualifié dans votre département. 96 départements métropolitains + DOM-TOM couverts. Plombiers, électriciens, serruriers et plus.',
  alternates: {
    canonical: 'https://servicesartisans.fr/departements',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

// Grouper les départements par région
const departementsByRegion = departements.reduce((acc, dept) => {
  if (!acc[dept.region]) {
    acc[dept.region] = []
  }
  acc[dept.region].push(dept)
  return acc
}, {} as Record<string, typeof departements>)

// Ordre des régions
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

export default function DepartementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">{departements.length} départements couverts</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Artisans par{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              département
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Trouvez un artisan qualifié dans votre département.
            Tous les départements français sont couverts.
          </p>

          {/* Premium Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-2">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un département (nom ou numéro)..."
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25">
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">4 000+ artisans</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">4.8/5 satisfaction</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">100% vérifiés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Départements' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Départements par région */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {regionOrder.map((regionName) => {
            const depts = departementsByRegion[regionName]
            if (!depts || depts.length === 0) return null

            return (
              <div key={regionName} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{regionName}</h2>
                    <p className="text-sm text-gray-500">{depts.length} département{depts.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {depts.map((dept) => (
                    <Link
                      key={dept.code}
                      href={`/departements/${dept.slug}`}
                      className="group relative bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                          <span className="text-sm font-bold text-blue-600">{dept.code}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                            {dept.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{dept.population} hab.</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Maillage interne: Services et Villes */}
          <div className="mt-16 pt-12 border-t border-gray-200 grid md:grid-cols-2 gap-12">
            <PopularServicesLinks showTitle={true} limit={8} />
            <PopularCitiesLinks showTitle={true} limit={10} />
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
            <span className="text-sm font-medium text-amber-300">Devis gratuit et sans engagement</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trouvez un artisan dans votre département
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Recevez jusqu&apos;à 5 devis de professionnels vérifiés en quelques minutes.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Demander un devis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
