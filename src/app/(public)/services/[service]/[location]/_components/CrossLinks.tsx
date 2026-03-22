import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { getDepartementByCode, getRegionSlugByName } from '@/lib/data/france'
import type { LocationContent } from '@/lib/seo/location-content'
import type { CommuneData } from '@/lib/data/commune-data'
import type { Service, Location as LocationType } from '@/types'
import { GSC_BOOST_PAGES } from '@/lib/seo/gsc-priority-cities'
import { getProblemsByService } from '@/lib/data/problems'
import { relatedServices } from '@/lib/constants/navigation'
import { tradeContent } from '@/lib/data/trade-content'

interface NearbyCity {
  slug: string
  name: string
}

interface OtherService {
  slug: string
  name: string
  icon: string
}

interface Props {
  service: Service
  location: LocationType
  serviceSlug: string
  locationSlug: string
  otherServices: OtherService[]
  nearbyCities: NearbyCity[]
  deptCities: NearbyCity[]
  locationContent: LocationContent | null
  communeData: CommuneData | null
}

export default function CrossLinks({
  service,
  location,
  serviceSlug,
  locationSlug,
  otherServices,
  nearbyCities,
  deptCities: _deptCities,
  locationContent,
  communeData,
}: Props) {
  return (
    <>
      {/* Voir aussi */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 border-l-4 border-primary-400 pl-4">Voir aussi</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Autres services dans cette ville */}
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
              <h3 className="font-heading font-semibold text-charcoal-900 mb-4">
                Autres artisans à {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherServices.slice(0, 4).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${locationSlug}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/villes/${locationSlug}`}
                className="inline-flex items-center gap-1 mt-4 text-primary-400 hover:text-primary-600 text-sm font-medium group"
              >
                Tous les artisans à {location.name}
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Ce service dans les villes proches */}
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
              <h3 className="font-heading font-semibold text-charcoal-900 mb-4">
                {service.name} près de {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.slice(0, 3).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/services/${serviceSlug}/${city.slug}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-500 rounded-full text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/services/${serviceSlug}`}
                className="inline-flex items-center gap-1 mt-4 text-primary-400 hover:text-primary-600 text-sm font-medium group"
              >
                Voir toutes les villes
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Navigation régionale */}
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
              <h3 className="font-heading font-semibold text-charcoal-900 mb-4">Explorer par zone</h3>
              <div className="space-y-2">
                {location.region_name && (
                  <Link
                    href={`/regions/${getRegionSlugByName(location.region_name) || slugify(location.region_name)}`}
                    className="flex items-center gap-2 px-4 py-3 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-500 rounded-xl text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Artisans en {location.region_name}
                  </Link>
                )}
                {location.department_name && location.department_code && (
                  <Link
                    href={`/departements/${getDepartementByCode(location.department_code)?.slug || slugify(location.department_name)}`}
                    className="flex items-center gap-2 px-4 py-3 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-500 rounded-xl text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Artisans dans {location.department_name} ({location.department_code})
                  </Link>
                )}
              </div>
            </div>

            {/* Intent variants — removed: duplicated by CrossIntentLinks component below */}

            {/* Related problems */}
            {(() => {
              const problems = getProblemsByService(serviceSlug).slice(0, 4)
              if (problems.length === 0) return null
              return (
                <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-4">
                    Problèmes courants
                  </h3>
                  <div className="space-y-2">
                    {problems.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/problemes/${p.slug}/${locationSlug}`}
                        className="flex items-center gap-2 px-4 py-3 bg-sand-50 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-xl text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all"
                      >
                        {p.name} à {location.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Cross-service callouts — removed: duplicated by card 1 above */}

            {/* Villes du département — removed: duplicated by DeepPageLinks module 3 */}

            {/* Services complémentaires dans cette ville */}
            {(() => {
              const complementarySlugs = relatedServices[serviceSlug] || []
              const complementaryServices = complementarySlugs
                .filter((slug) => slug !== serviceSlug && tradeContent[slug])
                .slice(0, 2)

              if (complementaryServices.length === 0) return null

              return (
                <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6 md:col-span-2 lg:col-span-3">
                  <h3 className="font-semibold text-charcoal-900 mb-2">
                    Services complémentaires à {location.name}
                  </h3>
                  <p className="text-sm text-charcoal-500 mb-4">
                    Besoin d'un autre artisan à {location.name} ? Ces services sont souvent demandés avec {service.name.toLowerCase()}.
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {complementaryServices.map((slug) => {
                      const t = tradeContent[slug]
                      if (!t) return null
                      return (
                        <div key={slug} className="bg-sand-50 rounded-xl border border-sand-200 p-4 space-y-2">
                          <div className="font-medium text-charcoal-900 text-sm">{t.name}</div>
                          <div className="flex flex-wrap gap-1.5">
                            <Link
                              href={`/services/${slug}/${locationSlug}`}
                              className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-primary-50 text-charcoal-600 hover:text-primary-600 rounded-lg text-xs font-medium border border-sand-200 hover:border-primary-200 transition-all"
                            >
                              Artisans
                            </Link>
                            <Link
                              href={`/devis/${slug}/${locationSlug}`}
                              className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-primary-50 text-charcoal-600 hover:text-primary-600 rounded-lg text-xs font-medium border border-sand-200 hover:border-primary-200 transition-all"
                            >
                              Devis
                            </Link>
                            <Link
                              href={`/tarifs/${slug}/${locationSlug}`}
                              className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-accent-50 text-charcoal-600 hover:text-accent-700 rounded-lg text-xs font-medium border border-sand-200 hover:border-accent-200 transition-all"
                            >
                              Tarifs
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* GSC boost links — pages with promising positions */}
            {(() => {
              const currentPath = `/services/${serviceSlug}/${locationSlug}`
              const boostLinks = GSC_BOOST_PAGES
                .filter(path => path !== currentPath)
                .slice(0, 1)

              if (boostLinks.length === 0) return null

              return (
                <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6 md:col-span-2 lg:col-span-3">
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-4">À découvrir aussi</h3>
                  <div className="flex flex-wrap gap-2">
                    {boostLinks.map((path) => {
                      const parts = path.split('/')
                      const svc = parts[2]?.replace(/-/g, ' ') ?? ''
                      const city = parts[3]?.replace(/-/g, ' ') ?? ''
                      return (
                        <Link
                          key={path}
                          href={path}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          {svc} à {city}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Trust & Safety — removed: duplicated by global footer */}

      {/* E-E-A-T editorial note */}
      <section className="py-6 bg-sand-50 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-charcoal-400 leading-relaxed max-w-3xl">
            Les {service.name.toLowerCase()}s référencés à {location.name} sont des entreprises immatriculées, vérifiées via l'API SIRENE de l'INSEE.
            Les tarifs affichés sont indicatifs et basés sur les moyennes du marché en {location.region_name || 'France'} pour un {service.name.toLowerCase()} à {location.name} ({location.department_code}).
            ServicesArtisans est un annuaire indépendant — nous ne réalisons pas de travaux et ne percevons aucune commission.
          </p>
          {locationContent?.dataDriven?.dataSources && locationContent.dataDriven.dataSources.length > 0 && (
            <p className="text-xs text-charcoal-400 mt-2 max-w-3xl">
              <strong className="text-charcoal-500">Sources des données locales :</strong>{' '}
              {locationContent.dataDriven.dataSources.join(' · ')}.
              Données mises à jour périodiquement. Dernière actualisation{' '}
              {communeData?.enriched_at
                ? new Date(communeData.enriched_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                : 'récente'}.
            </p>
          )}
        </div>
      </section>

      {/* Popular services footer — removed: duplicated by global footer */}
    </>
  )
}
