import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ArrowRight, Users, Star, Shield, ChevronDown, BadgeCheck, Euro, Clock, Wrench } from 'lucide-react'
import { getServiceBySlug, getLocationsByService, getProvidersByService } from '@/lib/supabase'
import JsonLd from '@/components/JsonLd'
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'
import { SITE_URL } from '@/lib/seo/config'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularCitiesLinks } from '@/components/InternalLinks'
import { popularServices } from '@/lib/constants/navigation'
import { services as staticServicesList, villes } from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'

// ISR: Revalidate every 30 minutes
export const revalidate = REVALIDATE.serviceDetail
export const dynamicParams = false

// Pre-render all 15 service pages at build time
export function generateStaticParams() {
  return staticServicesList.map(s => ({ service: s.slug }))
}

interface PageProps {
  params: Promise<{ service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params

  let serviceName = ''

  try {
    const service = await getServiceBySlug(serviceSlug)
    if (service) serviceName = service.name
  } catch {
    // DB down — fallback to static data
  }

  if (!serviceName) {
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    serviceName = staticSvc.name
  }

  const title = `${serviceName} en France — Annuaire & Devis Gratuit 2026`
  const description = `Trouvez un ${serviceName.toLowerCase()} parmi 350 000+ artisans référencés. Guide des prix, conseils, FAQ et devis gratuit. 101 départements couverts.`

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
}

/** Convert static villes to Location-like shape for fallback display */
function getStaticCities() {
  return villes.slice(0, 20).map(v => ({
    id: v.slug,
    name: v.name,
    slug: v.slug,
    department_code: v.departementCode,
    region_name: v.region,
  }))
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params

  let service: { name: string; slug: string; description?: string; category?: string } | null = null
  let topCities: any[] = []
  let recentProviders: any[] = []

  try {
    service = await getServiceBySlug(serviceSlug)
  } catch (error) {
    console.error('Service page DB error (service):', error)
  }

  // Fetch cities and providers independently — failure in one should not block the other
  const [citiesResult, providersResult] = await Promise.allSettled([
    getLocationsByService(serviceSlug),
    getProvidersByService(serviceSlug, 12),
  ])
  if (citiesResult.status === 'fulfilled') {
    topCities = citiesResult.value || []
  } else {
    console.error('Service page DB error (locations):', citiesResult.reason)
  }
  if (providersResult.status === 'fulfilled') {
    recentProviders = providersResult.value || []
  } else {
    console.error('Service page DB error (providers):', providersResult.reason)
  }

  // Fallback to static data if DB failed
  if (!service) {
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    service = { name: staticSvc.name, slug: staticSvc.slug }
  }

  // Fallback cities if DB returned nothing
  if (!topCities || topCities.length === 0) {
    topCities = getStaticCities()
  }

  // Grouper les villes par région
  const citiesByRegion = topCities?.reduce((acc: Record<string, typeof topCities>, city: any) => {
    const region = city.region_name || 'Autres'
    if (!acc[region]) acc[region] = []
    acc[region].push(city)
    return acc
  }, {} as Record<string, typeof topCities>) || {}

  // Trade-specific rich content (prices, FAQ, tips, certifications)
  const trade = getTradeContent(serviceSlug)

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

  const faqSchema = trade
    ? getFAQSchema(trade.faq.map(f => ({ question: f.q, answer: f.a })))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <JsonLd data={faqSchema ? [serviceSchema, breadcrumbSchema, faqSchema] : [serviceSchema, breadcrumbSchema]} />

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
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
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
                Artisans référencés
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-900 font-semibold">
                Qualité vérifiée
              </span>
            </div>
            {trade && (
              <>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
                  <Euro className="w-5 h-5 text-amber-600" />
                  <span className="text-gray-900 font-semibold">
                    {trade.priceRange.min}–{trade.priceRange.max} {trade.priceRange.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900 font-semibold">
                    {trade.averageResponseTime.split(',')[0]}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search by city */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 tracking-tight">
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
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 tracking-tight">
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

      {/* Price Guide — unique per trade */}
      {trade && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Euro className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tarifs {service.name.toLowerCase()} — Guide des prix 2026
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Tarif horaire moyen : <strong className="text-gray-900">{trade.priceRange.min}–{trade.priceRange.max} {trade.priceRange.unit}</strong>.
                Voici les prix constatés pour les prestations les plus demandées :
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {trade.commonTasks.map((task, i) => {
                  const [label, price] = task.split(' : ')
                  return (
                    <div key={i} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 text-sm">{label}</span>
                      {price && (
                        <span className="text-sm font-semibold text-amber-700 whitespace-nowrap">{price}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Prix indicatifs constatés en France métropolitaine. Les tarifs varient selon la région, la complexité des travaux et le professionnel.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tips + Certifications */}
      {trade && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Conseils pratiques */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Conseils pour choisir votre {service.name.toLowerCase()}
                  </h2>
                </div>
                <div className="space-y-4">
                  {trade.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                      <BadgeCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications + Urgence */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BadgeCheck className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Certifications à vérifier</h3>
                  </div>
                  <ul className="space-y-2">
                    {trade.certifications.map((cert, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-1">✓</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>

                {trade.emergencyInfo && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">Urgence {service.name.toLowerCase()}</h3>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">{trade.emergencyInfo}</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Délai d&apos;intervention</h3>
                  </div>
                  <p className="text-sm text-gray-700">{trade.averageResponseTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ — rich content for SEO */}
      {trade && trade.faq.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Questions fréquentes — {service.name}
              </h2>
            </div>
            <div className="space-y-4">
              {trade.faq.map((item, i) => (
                <details key={i} className="group bg-white rounded-xl shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="font-semibold text-gray-900 pr-4">{item.q}</h3>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Generic SEO Content — fallback when no trade content */}
      {!trade && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4 tracking-tight">
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
      )}

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
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 tracking-tight">Voir aussi</h2>
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
