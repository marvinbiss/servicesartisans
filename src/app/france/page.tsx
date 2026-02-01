import Link from 'next/link'
import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Trouvez un artisan en France | ServicesArtisans',
  description: 'Trouvez les meilleurs artisans près de chez vous. Plombiers, électriciens, serruriers et plus dans toute la France.',
}

const services = [
  { slug: 'plombier', name: 'Plombier', icon: '🔧', count: 12500 },
  { slug: 'electricien', name: 'Électricien', icon: '⚡', count: 9800 },
  { slug: 'serrurier', name: 'Serrurier', icon: '🔑', count: 5400 },
  { slug: 'chauffagiste', name: 'Chauffagiste', icon: '🔥', count: 4200 },
  { slug: 'peintre', name: 'Peintre', icon: '🎨', count: 8700 },
  { slug: 'menuisier', name: 'Menuisier', icon: '🪚', count: 3900 },
  { slug: 'couvreur', name: 'Couvreur', icon: '🏠', count: 2800 },
  { slug: 'maçon', name: 'Maçon', icon: '🧱', count: 3500 },
]

const regions = [
  { slug: 'ile-de-france', name: 'Île-de-France', count: 15000 },
  { slug: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', count: 8500 },
  { slug: 'provence-alpes-cote-d-azur', name: 'Provence-Alpes-Côte d\'Azur', count: 6200 },
  { slug: 'occitanie', name: 'Occitanie', count: 5800 },
  { slug: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', count: 5400 },
  { slug: 'pays-de-la-loire', name: 'Pays de la Loire', count: 3900 },
  { slug: 'bretagne', name: 'Bretagne', count: 3600 },
  { slug: 'hauts-de-france', name: 'Hauts-de-France', count: 4100 },
  { slug: 'grand-est', name: 'Grand Est', count: 3800 },
  { slug: 'normandie', name: 'Normandie', count: 2900 },
]

export default function FrancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'France' },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Trouvez un artisan en France
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Plus de 50 000 artisans qualifiés dans toute la France.
            Comparez les avis et demandez des devis gratuits.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver par métier
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="text-3xl mb-3 block">{service.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {service.name}s
                </h3>
                <p className="text-sm text-gray-500">
                  {service.count.toLocaleString('fr-FR')} artisans
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Regions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver par région
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {region.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {region.count.toLocaleString('fr-FR')} artisans
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes artisan ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'artisans et recevez des demandes de devis qualifiées.
          </p>
          <Link
            href="/inscription-artisan"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Créer mon profil gratuit
          </Link>
        </section>
      </div>
    </div>
  )
}
