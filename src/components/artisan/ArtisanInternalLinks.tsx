import Link from 'next/link'
import { MapPin, Wrench, Compass, Leaf } from 'lucide-react'
import {
  services as staticServicesList,
  villes,
  getDepartementByCode,
  getRegionSlugByName,
} from '@/lib/data/france'
import { slugify } from '@/lib/utils'
import { getServiceWeight } from '@/lib/constants/navigation'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'

interface ArtisanInternalLinksProps {
  serviceSlug: string
  locationSlug: string
  serviceName: string
  cityName: string
  regionName?: string
  departmentName?: string
  departmentCode?: string
}

export default function ArtisanInternalLinks({
  serviceSlug,
  locationSlug,
  serviceName,
  cityName,
  regionName,
  departmentName,
  departmentCode,
}: ArtisanInternalLinksProps) {
  // Find current city data to get region/department for nearby filtering
  const currentVille = villes.find((v) => v.slug === locationSlug)
  const region = regionName || currentVille?.region
  const deptCode = departmentCode || currentVille?.departementCode

  // Column 1: Same service in nearby cities (same region, prioritize same department)
  const sameDeptCities = villes
    .filter((v) => v.slug !== locationSlug && v.departementCode === deptCode)
    .slice(0, 4)
  const sameRegionCities = villes
    .filter((v) => v.slug !== locationSlug && v.region === region && v.departementCode !== deptCode)
    .slice(0, 8 - sameDeptCities.length)
  const nearbyCities = [...sameDeptCities, ...sameRegionCities].slice(0, 8)

  // Column 2: Other services in same city — sorted by weight (gravity hubs first)
  const otherServices = staticServicesList
    .filter((s) => s.slug !== serviceSlug)
    .sort((a, b) => getServiceWeight(b.slug) - getServiceWeight(a.slug))
    .slice(0, 8)

  // Column 3: Geographic navigation
  const dept = deptCode ? getDepartementByCode(deptCode) : undefined
  const regionSlug = region ? getRegionSlugByName(region) : undefined

  // RGE / aides cross-links — pivot rénovation énergétique 2026-05-03 :
  // chaque fiche artisan dont le métier est RGE-éligible irrigue ses hubs RGE
  // + opérations CEE éligibles + page MaPrimeRénov'. Maillage critique
  // pillar #2 (audit `gsc-diagnostic-2026-04-30`).
  const isRgeEligibleService = (RGE_ALLOWED_SERVICES as readonly string[]).includes(serviceSlug)
  const ceeOps = isRgeEligibleService ? getCeeOpsForRgeService(serviceSlug).slice(0, 4) : []

  return (
    <section className="py-12 bg-sand-100 border-t border-sand-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-8">Voir aussi</h2>

        <div
          className={`grid md:grid-cols-2 gap-8 ${isRgeEligibleService ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
        >
          {/* Column 1: Same service, nearby cities */}
          <div>
            <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clay-400" />
              {serviceName} dans d'autres villes
            </h3>
            {nearbyCities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/services/${serviceSlug}/${city.slug}`}
                    className="inline-flex items-center px-3 py-1.5 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-full text-sm transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal-500">Aucune ville proche disponible</p>
            )}
            <Link
              href={`/services/${serviceSlug}`}
              className="inline-block mt-3 text-clay-400 hover:text-clay-600 text-sm font-medium"
            >
              Toutes les villes →
            </Link>
          </div>

          {/* Column 2: Other services in this city */}
          <div>
            <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-clay-400" />
              Autres artisans à {cityName}
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${locationSlug}`}
                  className="inline-flex items-center px-3 py-1.5 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-full text-sm transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/villes/${locationSlug}`}
              className="inline-block mt-3 text-clay-400 hover:text-clay-600 text-sm font-medium"
            >
              Tous les artisans à {cityName} →
            </Link>
          </div>

          {/* Column 3: Geographic navigation + cross-links */}
          <div>
            <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-clay-400" />
              Explorer par zone
            </h3>
            <div className="space-y-2">
              {region && (
                <Link
                  href={`/regions/${regionSlug || slugify(region)}`}
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  Artisans en {region}
                </Link>
              )}
              {dept && (
                <Link
                  href={`/departements/${dept.slug}`}
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  Artisans dans {departmentName || dept.name} ({dept.code})
                </Link>
              )}
              {dept && (
                <Link
                  href={`/departements/${dept.slug}/${serviceSlug}`}
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  {serviceName} dans le {dept.code}
                </Link>
              )}
              <Link
                href={`/villes/${locationSlug}`}
                className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
              >
                Tous les artisans à {cityName}
              </Link>
              <Link
                href={`/services/${serviceSlug}`}
                className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
              >
                {serviceName} en France
              </Link>
              <Link
                href={`/tarifs/${serviceSlug}`}
                className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
              >
                Tarifs {serviceName} en France
              </Link>
              {['plombier', 'electricien', 'chauffagiste', 'couvreur', 'ramoneur'].includes(
                serviceSlug
              ) && (
                <Link
                  href={`/urgence/${serviceSlug}`}
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  Urgence {serviceName}
                </Link>
              )}
            </div>
          </div>

          {/* Column 4: RGE / aides — uniquement pour services RGE-éligibles */}
          {isRgeEligibleService && (
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-accent-600" />
                Rénovation énergétique
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/rge/${serviceSlug}`}
                  className="block px-3 py-2 bg-accent-50 hover:bg-accent-100 text-accent-800 hover:text-accent-900 rounded-lg text-sm transition-colors font-medium"
                >
                  Artisans RGE {serviceName.toLowerCase()}
                </Link>
                {dept && (
                  <Link
                    href={`/rge/${serviceSlug}/departement/${dept.slug}`}
                    className="block px-3 py-2 bg-accent-50/60 hover:bg-accent-100 text-accent-800 hover:text-accent-900 rounded-lg text-sm transition-colors"
                  >
                    {serviceName} RGE dans le {dept.code}
                  </Link>
                )}
                <Link
                  href="/aides/maprimerenov"
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  MaPrimeRénov&apos; 2026
                </Link>
                <Link
                  href="/aides"
                  className="block px-3 py-2 bg-sand-200 hover:bg-clay-50 text-sand-700 hover:text-clay-600 rounded-lg text-sm transition-colors"
                >
                  Toutes les aides à la rénovation
                </Link>
                {ceeOps.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-accent-200/40">
                    <p className="text-xs uppercase tracking-wider text-charcoal-400 mb-1.5">
                      Primes CEE éligibles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ceeOps.map((op) => (
                        <Link
                          key={op.code}
                          href={`/cee/${op.code.toLowerCase()}/guide`}
                          className="inline-flex items-center px-2.5 py-1 bg-white border border-accent-200 hover:border-accent-400 text-accent-800 hover:bg-accent-50 rounded-md text-xs transition-colors"
                        >
                          {op.code}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
