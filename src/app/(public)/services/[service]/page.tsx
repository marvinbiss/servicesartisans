import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ArrowRight, Users, Star, Shield } from 'lucide-react'
import { getServiceBySlug, getLocationsByService, getProvidersByService } from '@/lib/supabase'
import JsonLd from '@/components/JsonLd'
import { getServiceSchema, getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'
import { SITE_URL } from '@/lib/seo/config'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularCitiesLinks } from '@/components/InternalLinks'
import { popularServices } from '@/lib/constants/navigation'

// ISR: Revalidate every 30 minutes
export const revalidate = REVALIDATE.serviceDetail

interface PageProps {
  params: Promise<{ service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params
  
  try {
    const service = await getServiceBySlug(serviceSlug)
    if (!service) return { title: 'Service non trouvé' }

    const title = `${service.name} - Trouvez un ${service.name.toLowerCase()} près de chez vous`
    const description = `Comparez les meilleurs ${service.name.toLowerCase()}s de France. Consultez les avis, obtenez des devis gratuits. Plus de 500 villes couvertes.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
      alternates: {
        canonical: `${SITE_URL}/services/${serviceSlug}`,
      },
    }
  } catch {
    return { title: 'Service non trouvé' }
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params

  let service
  let topCities
  let recentProviders

  try {
    service = await getServiceBySlug(serviceSlug)

    // Récupérer les villes populaires et les artisans récents
    ;[topCities, recentProviders] = await Promise.all([
      getLocationsByService(serviceSlug),
      getProvidersByService(serviceSlug, 12),
    ])
  } catch (error) {
    console.error('Service page DB error:', error)
    throw error
  }

  if (!service) {
    notFound()
  }

  // Grouper les villes par région
  const citiesByRegion = topCities?.reduce((acc: Record<string, typeof topCities>, city: any) => {
    const region = city.region_name || 'Autres'
    if (!acc[region]) acc[region] = []
    acc[region].push(city)
    return acc
  }, {} as Record<string, typeof topCities>) || {}

  // JSON-LD structured data
  const serviceSchema = getServiceSchema({
    name: service.name,
    description: service.description || `Services de ${service.name.toLowerCase()} en France`,
    category: service.category || service.name,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <JsonLd data={[serviceSchema, breadcrumbSchema]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Services', href: '/services' },
              { label: service.name },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {service.name} en France
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {service.description ||
              `Trouvez les meilleurs ${service.name.toLowerCase()}s près de chez vous. Comparez les avis, les tarifs et obtenez des devis gratuits.`}
          </p>

          {/* Stats - Style Doctolib */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900 font-semibold">
                {recentProviders?.length || 0}+ artisans
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900 font-semibold">
                {topCities?.length || 0}+ villes
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-gray-900 font-semibold">
                Artisans vérifiés
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-900 font-semibold">
                Qualité vérifiée
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search by city */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver un {service.name.toLowerCase()} par ville
          </h2>

          {/* Popular cities grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {topCities?.slice(0, 12).map((city: any) => (
              <Link
                key={city.id}
                href={`/services/${serviceSlug}/${city.slug}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                    {city.name}
                  </span>
                </div>
                {city.department_code && (
                  <span className="text-xs text-gray-500 mt-1 block">
                    ({city.department_code})
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Cities by region */}
          {Object.keys(citiesByRegion).length > 0 && (
            <div className="space-y-8">
              {Object.entries(citiesByRegion)
                .slice(0, 6)
                .map(([region, cities]) => (
                  <div key={region}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {service.name} en {region}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(cities as any[]).slice(0, 10).map((city: any) => (
                        <Link
                          key={city.id}
                          href={`/services/${serviceSlug}/${city.slug}`}
                          className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {city.name}
                        </Link>
                      ))}
                      {(cities as any[]).length > 10 && (
                        <span className="text-sm text-gray-500 px-3 py-1.5">
                          +{(cities as any[]).length - 10} villes
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent providers */}
      {recentProviders && recentProviders.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {service.name}s récemment ajoutés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProviders.slice(0, 6).map((provider: any) => {
                const location = provider.provider_locations?.[0]?.location
                return (
                  <Link
                    key={provider.id}
                    href={`/services/${serviceSlug}/${location?.slug || 'france'}/${provider.stable_id || provider.slug}`}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {provider.name}
                    </h3>
                    {provider.address_city && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {provider.address_postal_code} {provider.address_city}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comment trouver un bon {service.name.toLowerCase()} ?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p>
                Trouver un {service.name.toLowerCase()} de confiance peut sembler compliqué.
                ServicesArtisans vous simplifie la tâche en répertoriant les meilleurs
                professionnels de votre région.
              </p>
              <h3>Les critères pour choisir votre {service.name.toLowerCase()}</h3>
              <ul>
                <li>
                  <strong>Les avis clients</strong> : Consultez les retours d&apos;expérience
                  des autres clients pour vous faire une idée de la qualité du travail.
                </li>
                <li>
                  <strong>Les certifications</strong> : Vérifiez que l&apos;artisan dispose
                  des qualifications nécessaires pour réaliser vos travaux.
                </li>
                <li>
                  <strong>La proximité</strong> : Un artisan proche de chez vous pourra
                  intervenir plus rapidement et les frais de déplacement seront réduits.
                </li>
                <li>
                  <strong>Le devis détaillé</strong> : Demandez toujours un devis écrit
                  avant de vous engager.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Vous êtes {service.name.toLowerCase()} ?
          </h2>
          <p className="text-blue-100 mb-6">
            Inscrivez-vous gratuitement et recevez des demandes de devis
          </p>
          <Link
            href="/inscription-artisan"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Créer mon profil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Voir aussi - Autres services */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Autres services artisanaux</h3>
              <div className="flex flex-wrap gap-2">
                {popularServices
                  .filter(s => s.slug !== serviceSlug)
                  .slice(0, 6)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                    >
                      {s.name}
                    </Link>
                  ))}
              </div>
            </div>
            <div>
              <PopularCitiesLinks showTitle={true} limit={8} />
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Footer */}
    </div>
  )
}
