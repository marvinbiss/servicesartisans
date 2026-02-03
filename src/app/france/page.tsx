import Link from 'next/link'
import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Trouvez un artisan en France | ServicesArtisans',
  description: 'Trouvez les meilleurs artisans près de chez vous. Plombiers, électriciens, serruriers et plus dans toute la France.',
}

export const revalidate = 3600 // Revalidate every hour

const SERVICE_ICONS: Record<string, string> = {
  'plombier': '🔧',
  'electricien': '⚡',
  'serrurier': '🔑',
  'chauffagiste': '🔥',
  'peintre': '🎨',
  'menuisier': '🪚',
  'couvreur': '🏠',
  'maçon': '🧱',
  'carreleur': '🔲',
  'jardinier': '🌱',
}

const REGION_SLUGS: Record<string, string> = {
  'Île-de-France': 'ile-de-france',
  'Auvergne-Rhône-Alpes': 'auvergne-rhone-alpes',
  'Provence-Alpes-Côte d\'Azur': 'provence-alpes-cote-d-azur',
  'Occitanie': 'occitanie',
  'Nouvelle-Aquitaine': 'nouvelle-aquitaine',
  'Pays de la Loire': 'pays-de-la-loire',
  'Bretagne': 'bretagne',
  'Hauts-de-France': 'hauts-de-france',
  'Grand Est': 'grand-est',
  'Normandie': 'normandie',
  'Bourgogne-Franche-Comté': 'bourgogne-franche-comte',
  'Centre-Val de Loire': 'centre-val-de-loire',
  'Corse': 'corse',
}

// Fetch real counts from database
async function getStats() {
  try {
    const supabase = createAdminClient()

    // Get total count
    const { count: totalCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get counts by service/specialty
    const { data: serviceData } = await supabase
      .from('providers')
      .select('specialty')
      .eq('is_active', true)

    // Count by specialty
    const serviceCounts: Record<string, number> = {}
    if (serviceData) {
      serviceData.forEach(provider => {
        const specialty = (provider.specialty || '').toLowerCase()
        for (const key of Object.keys(SERVICE_ICONS)) {
          if (specialty.includes(key.toLowerCase())) {
            serviceCounts[key] = (serviceCounts[key] || 0) + 1
          }
        }
      })
    }

    // Get counts by region
    const { data: regionData } = await supabase
      .from('providers')
      .select('address_region')
      .eq('is_active', true)

    const regionCounts: Record<string, number> = {}
    if (regionData) {
      regionData.forEach(provider => {
        const region = provider.address_region
        if (region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1
        }
      })
    }

    return {
      totalCount: totalCount || 0,
      serviceCounts,
      regionCounts,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalCount: 0,
      serviceCounts: {},
      regionCounts: {},
    }
  }
}

export default async function FrancePage() {
  const stats = await getStats()

  // Build services array with real counts
  const services = Object.entries(SERVICE_ICONS)
    .map(([slug, icon]) => ({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      icon,
      count: stats.serviceCounts[slug] || 0,
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Build regions array with real counts
  const regions = Object.entries(REGION_SLUGS)
    .map(([name, slug]) => ({
      slug,
      name,
      count: stats.regionCounts[name] || 0,
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

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
            {stats.totalCount > 0 ? (
              <>Plus de {stats.totalCount.toLocaleString('fr-FR')} artisans qualifiés dans toute la France.</>
            ) : (
              <>Des artisans qualifiés dans toute la France.</>
            )}
            {' '}Comparez les avis et demandez des devis gratuits.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        {services.length > 0 && (
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
        )}

        {/* Regions */}
        {regions.length > 0 && (
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
        )}

        {/* Browse all */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/services"
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Tous les services</h3>
              <p className="text-sm text-gray-500">Parcourir tous les métiers du bâtiment</p>
            </Link>
            <Link
              href="/regions"
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Toutes les régions</h3>
              <p className="text-sm text-gray-500">Explorer les artisans par région</p>
            </Link>
            <Link
              href="/villes"
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Toutes les villes</h3>
              <p className="text-sm text-gray-500">Trouver un artisan dans votre ville</p>
            </Link>
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
