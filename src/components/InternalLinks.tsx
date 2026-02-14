'use client'

import Link from 'next/link'
import {
  MapPin, Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat,
  ArrowRight, Star, Users, Building2, TreeDeciduous
} from 'lucide-react'
import {
  popularServices as popularServicesData,
  popularCities,
  popularRegions
} from '@/lib/constants/navigation'

// Re-export for backward compatibility
export { popularCities, popularRegions }

// Add icons to services for client components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat, TreeDeciduous
}

export const popularServices = popularServicesData.map(s => ({
  ...s,
  icon: iconMap[s.icon] || Wrench
}))

// Composant: Services populaires
export function PopularServicesLinks({
  limit = 8,
  showTitle = true,
  className = ''
}: {
  limit?: number
  showTitle?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {showTitle && (
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Services populaires
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {popularServices.slice(0, limit).map((service) => {
          const Icon = service.icon
          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {service.name}
            </Link>
          )
        })}
      </div>
      <Link
        href="/services"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
      >
        Tous les services <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// Composant: Villes populaires
export function PopularCitiesLinks({
  limit = 10,
  showTitle = true,
  className = ''
}: {
  limit?: number
  showTitle?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {showTitle && (
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          Villes populaires
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {popularCities.slice(0, limit).map((city) => (
          <Link
            key={city.slug}
            href={`/villes/${city.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
          >
            {city.name}
          </Link>
        ))}
      </div>
      <Link
        href="/villes"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
      >
        Toutes les villes <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// Composant: Navigation géographique
export function GeographicNavigation({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <Link
        href="/regions"
        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 group-hover:text-blue-600">Par région</div>
          <div className="text-sm text-gray-500">13 régions</div>
        </div>
      </Link>
      <Link
        href="/departements"
        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
      >
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 group-hover:text-green-600">Par département</div>
          <div className="text-sm text-gray-500">101 départements</div>
        </div>
      </Link>
      <Link
        href="/villes"
        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
      >
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
          <Users className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 group-hover:text-amber-600">Par ville</div>
          <div className="text-sm text-gray-500">500+ villes</div>
        </div>
      </Link>
    </div>
  )
}

// Composant: Liens croisés service×ville populaires (homepage SEO)
export function PopularServiceCityLinks({
  limit = 12,
  showTitle = true,
  className = ''
}: {
  limit?: number
  showTitle?: boolean
  className?: string
}) {
  const topCombos = popularServices.slice(0, 4).flatMap(service =>
    popularCities.slice(0, 3).map(city => ({
      label: `${service.name} ${city.name}`,
      href: `/services/${service.slug}/${city.slug}`,
    }))
  )

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-500" />
          Recherches populaires
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {topCombos.slice(0, limit).map((combo) => (
          <Link
            key={combo.href}
            href={combo.href}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
          >
            {combo.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Composant: Matrice service-ville (liens croisés)
export function ServiceCityMatrix({
  service,
  cities = popularCities.slice(0, 6),
  className = ''
}: {
  service: string
  cities?: typeof popularCities
  className?: string
}) {
  const serviceData = popularServices.find(s => s.slug === service)
  if (!serviceData) return null

  return (
    <div className={className}>
      <h3 className="font-semibold text-gray-900 mb-3">
        {serviceData.name} par ville
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/services/${service}/${city.slug}`}
            className="px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors"
          >
            {serviceData.name} {city.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Composant: Liens rapides pour dashboards
export function QuickSiteLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-3">Naviguer sur le site</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Link href="/" className="text-gray-600 hover:text-blue-600 py-1">
          Accueil
        </Link>
        <Link href="/services" className="text-gray-600 hover:text-blue-600 py-1">
          Tous les services
        </Link>
        <Link href="/villes" className="text-gray-600 hover:text-blue-600 py-1">
          Toutes les villes
        </Link>
        <Link href="/regions" className="text-gray-600 hover:text-blue-600 py-1">
          Par région
        </Link>
        <Link href="/recherche" className="text-gray-600 hover:text-blue-600 py-1">
          Rechercher
        </Link>
        <Link href="/devis" className="text-gray-600 hover:text-blue-600 py-1">
          Demander un devis
        </Link>
        <Link href="/comment-ca-marche" className="text-gray-600 hover:text-blue-600 py-1">
          Comment ça marche
        </Link>
        <Link href="/contact" className="text-gray-600 hover:text-blue-600 py-1">
          Contact
        </Link>
      </div>
    </div>
  )
}

// Composant: Footer de maillage interne pour les pages
export function InternalLinksFooter({ className = '' }: { className?: string }) {
  return (
    <section className={`bg-gray-50 py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <PopularServicesLinks />
          <PopularCitiesLinks />
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-500" />
              Par région
            </h3>
            <div className="space-y-1">
              {popularRegions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/regions/${region.slug}`}
                  className="block text-gray-600 hover:text-blue-600 text-sm py-1 transition-colors"
                >
                  {region.name}
                </Link>
              ))}
            </div>
            <Link
              href="/regions"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
            >
              Toutes les régions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
