import Link from 'next/link'
import { MapPin, Users, Building, Star, Phone, ArrowRight, Shield, Clock, Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous, Square, Wind, Blocks, ChefHat, Layers, Sparkles } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularCitiesLinks } from '@/components/InternalLinks'
import { popularRegions } from '@/lib/constants/navigation'
import { villes, getVilleBySlug, services } from '@/lib/data/france'
import { Metadata } from 'next'

// Map des icônes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous, Square, Wind, Blocks, ChefHat, Layers, Sparkles
}

// Générer les pages statiques pour toutes les villes
export function generateStaticParams() {
  return villes.map((ville) => ({
    ville: ville.slug,
  }))
}

// Métadonnées dynamiques SEO
export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const ville = getVilleBySlug(params.ville)

  if (!ville) {
    return {
      title: 'Ville non trouvée | ServicesArtisans',
    }
  }

  return {
    title: `Artisans à ${ville.name} - Plombier, Électricien, Serrurier | ServicesArtisans`,
    description: `Trouvez les meilleurs artisans à ${ville.name} (${ville.departementCode}). Plombiers, électriciens, serruriers et plus. Devis gratuit, artisans vérifiés.`,
    openGraph: {
      title: `Artisans à ${ville.name} | ServicesArtisans`,
      description: ville.description,
    },
  }
}

const artisansExemple = [
  { name: 'Martin Plomberie', note: 4.9, avis: 127, metier: 'Plombier' },
  { name: 'Élec Express', note: 4.8, avis: 89, metier: 'Électricien' },
  { name: 'Serrures & Clés', note: 4.7, avis: 56, metier: 'Serrurier' },
]

export default function VillePage({ params }: { params: { ville: string } }) {
  const ville = getVilleBySlug(params.ville)

  if (!ville) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ville non trouvée</h1>
          <Link href="/villes" className="text-blue-600 hover:underline">
            Voir toutes les villes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Villes', href: '/villes' },
              { label: ville.name },
            ]}
          />
        </div>
      </div>

      {/* Hero - Premium Branding */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Artisans à {ville.name}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {ville.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{ville.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <span>{ville.departement}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{ville.population} habitants</span>
            </div>
          </div>

          {/* Premium badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Avis clients authentiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Devis sous 24h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver un artisan à {ville.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon] || Wrench
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}/${params.ville}`}
                  className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-gray-100"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">à {ville.name}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Top artisans */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Artisans les mieux notés à {ville.name}
            </h2>
            <Link href={`/services/plombier/${params.ville}`} className="text-blue-600 hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {artisansExemple.map((artisan, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {artisan.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{artisan.name}</h3>
                    <p className="text-sm text-gray-500">{artisan.metier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(artisan.note) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">{artisan.note}</span>
                  <span className="text-gray-500">({artisan.avis} avis)</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contacter
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quartiers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quartiers desservis à {ville.name}
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap gap-2">
              {ville.quartiers.map((quartier) => (
                <span
                  key={quartier}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                >
                  {quartier}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d&apos;un artisan à {ville.name} ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Décrivez votre projet et recevez jusqu&apos;à 5 devis gratuits d&apos;artisans qualifiés près de chez vous.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Voir aussi - Related Content */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Explorer la région {ville.region}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Découvrez tous les artisans disponibles dans votre région.
              </p>
              {popularRegions.find(r => r.name === ville.region) ? (
                <Link
                  href={`/regions/${popularRegions.find(r => r.name === ville.region)?.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Artisans en {ville.region}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/regions"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Toutes les régions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <PopularCitiesLinks showTitle={true} limit={6} />
            </div>
          </div>
        </section>
      </div>

      {/* Internal Links Footer */}
    </div>
  )
}
