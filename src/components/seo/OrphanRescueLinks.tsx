import Link from 'next/link'
import { services, villes, type Ville } from '@/lib/data/france'
import { relatedServices } from '@/lib/constants/navigation'
import { tradeContent } from '@/lib/data/trade-content'

interface OrphanRescueLinksProps {
  currentPath: string       // e.g., '/services/plombier'
  serviceSlug?: string
  villeSlug?: string
}

/**
 * Parse population string like "12 000" into number.
 */
function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

/**
 * Get small cities (population < 10000) in the same department.
 * These are often under-linked because they don't appear in popular lists.
 */
function getSmallCitiesInDepartment(departementCode: string, excludeSlug?: string): Ville[] {
  return villes
    .filter(v =>
      v.departementCode === departementCode &&
      parsePopulation(v.population) < 10000 &&
      v.slug !== excludeSlug
    )
    .slice(0, 10)
}

/**
 * Get rare services not in the popular services list.
 */
function getRareServices(excludeSlug?: string): { slug: string; name: string }[] {
  const popularSlugs = new Set([
    'plombier', 'electricien', 'serrurier', 'chauffagiste',
    'peintre-en-batiment', 'menuisier', 'macon', 'jardinier',
  ])

  return services
    .filter(s => !popularSlugs.has(s.slug) && s.slug !== excludeSlug)
    .slice(0, 15)
}

/**
 * Extract service slug from path like /services/plombier or /services/plombier/lyon
 */
function extractServiceFromPath(path: string): string | undefined {
  const match = path.match(/^\/(services|tarifs|devis|urgence|avis)\/([^/]+)/)
  if (match) {
    const slug = match[2]
    if (services.some(s => s.slug === slug)) return slug
  }
  return undefined
}

/**
 * Extract ville slug from path like /villes/lyon or /services/plombier/lyon
 */
function extractVilleFromPath(path: string): string | undefined {
  // Direct city page: /villes/{slug}
  const villeMatch = path.match(/^\/villes\/([^/]+)/)
  if (villeMatch) return villeMatch[1]

  // Service×city: /services/{service}/{ville}
  const svcCityMatch = path.match(/^\/(services|tarifs|devis|urgence|avis)\/[^/]+\/([^/]+)/)
  if (svcCityMatch) return svcCityMatch[2]

  return undefined
}

interface RescueLink {
  href: string
  label: string
}

/**
 * Generate rescue links for a service hub page (/services/{service}).
 * Links to small cities that might not appear elsewhere.
 */
function getServiceHubRescueLinks(serviceSlug: string): RescueLink[] {
  const links: RescueLink[] = []
  const service = services.find(s => s.slug === serviceSlug)
  if (!service) return links

  // Find small cities across different departments
  const departmentCodes = Array.from(new Set(villes.map(v => v.departementCode)))
  const smallCities: Ville[] = []

  for (const code of departmentCodes) {
    const deptSmall = getSmallCitiesInDepartment(code)
    if (deptSmall.length > 0) {
      smallCities.push(deptSmall[0])
    }
    if (smallCities.length >= 8) break
  }

  for (const city of smallCities.slice(0, 6)) {
    links.push({
      href: `/services/${serviceSlug}/${city.slug}`,
      label: `${service.name} a ${city.name}`,
    })
  }

  // Also add related services that are rare
  const related = relatedServices[serviceSlug]
  if (related) {
    const rareRelated = related.filter(slug =>
      !['plombier', 'electricien', 'serrurier', 'chauffagiste'].includes(slug)
    )
    for (const relSlug of rareRelated.slice(0, 2)) {
      const relService = services.find(s => s.slug === relSlug)
      if (relService) {
        links.push({
          href: `/services/${relSlug}`,
          label: relService.name,
        })
      }
    }
  }

  return links.slice(0, 8)
}

/**
 * Generate rescue links for a city page (/villes/{ville}).
 * Links to rare services in that city.
 */
function getCityRescueLinks(villeSlug: string): RescueLink[] {
  const links: RescueLink[] = []
  const ville = villes.find(v => v.slug === villeSlug)
  if (!ville) return links

  const rareServices = getRareServices()
  for (const svc of rareServices.slice(0, 6)) {
    // Only link if the service exists in tradeContent (has real content)
    if (tradeContent[svc.slug]) {
      links.push({
        href: `/services/${svc.slug}/${villeSlug}`,
        label: `${svc.name} a ${ville.name}`,
      })
    }
  }

  return links.slice(0, 8)
}

/**
 * Generate rescue links for a service×city page (/services/{service}/{ville}).
 * Links to other small cities in the same department + rare related services.
 */
function getServiceCityRescueLinks(serviceSlug: string, villeSlug: string): RescueLink[] {
  const links: RescueLink[] = []
  const service = services.find(s => s.slug === serviceSlug)
  const ville = villes.find(v => v.slug === villeSlug)
  if (!service || !ville) return links

  // Small cities in same department
  const smallNeighbors = getSmallCitiesInDepartment(ville.departementCode, villeSlug)
  for (const neighbor of smallNeighbors.slice(0, 4)) {
    links.push({
      href: `/services/${serviceSlug}/${neighbor.slug}`,
      label: `${service.name} a ${neighbor.name}`,
    })
  }

  // Rare related services in same city
  const related = relatedServices[serviceSlug]
  if (related) {
    for (const relSlug of related.slice(0, 3)) {
      const relService = services.find(s => s.slug === relSlug)
      if (relService) {
        links.push({
          href: `/services/${relSlug}/${villeSlug}`,
          label: `${relService.name} a ${ville.name}`,
        })
      }
    }
  }

  return links.slice(0, 8)
}

/**
 * Server component that dynamically adds internal links to potentially
 * orphaned pages. Place at the bottom of any page template.
 *
 * Lightweight: no DB calls, uses static data from france.ts.
 */
export default function OrphanRescueLinks({
  currentPath,
  serviceSlug,
  villeSlug,
}: OrphanRescueLinksProps) {
  // Extract slugs from currentPath as fallback
  const resolvedService = serviceSlug ?? extractServiceFromPath(currentPath)
  const resolvedVille = villeSlug ?? extractVilleFromPath(currentPath)

  let rescueLinks: RescueLink[] = []

  if (resolvedService && resolvedVille) {
    // Service × city page
    rescueLinks = getServiceCityRescueLinks(resolvedService, resolvedVille)
  } else if (resolvedService) {
    // Service hub page
    rescueLinks = getServiceHubRescueLinks(resolvedService)
  } else if (resolvedVille) {
    // City page
    rescueLinks = getCityRescueLinks(resolvedVille)
  }

  if (rescueLinks.length === 0) return null

  return (
    <nav
      aria-label="Voir aussi"
      className="border-t border-sand-200 mt-8 pt-6"
    >
      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
        Voir aussi
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {rescueLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              prefetch={false}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
