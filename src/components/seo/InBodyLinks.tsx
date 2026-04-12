import Link from 'next/link'
import { services, getVilleBySlug, getNearbyCities, getCityScore } from '@/lib/data/france'
import { relatedServices } from '@/lib/constants/navigation'
import { isMoneyPage, TOP_CITIES } from '@/lib/seo/top-pages'

interface InBodyLinksProps {
  serviceSlug: string
  villeSlug: string
  villeName: string
  serviceName: string
}

/**
 * Deterministic hash for consistent phrase variant selection.
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface ContextualLink {
  href: string
  anchor: string
  prefix: string
  suffix: string
}

/**
 * Generates 3-5 contextual links embedded in natural French prose.
 * Placed INSIDE the main content area (not aside) for maximum PageRank weight
 * per the Reasonable Surfer model.
 */
function generateContextualLinks(
  serviceSlug: string,
  villeSlug: string,
  villeName: string,
  serviceName: string
): ContextualLink[] {
  const links: ContextualLink[] = []
  const seed = hashCode(`${serviceSlug}::${villeSlug}`)

  // 1. Money page link — nearby top city
  const topCitySlugs = TOP_CITIES.map((c) => c.slug).filter((s) => s !== villeSlug)
  if (topCitySlugs.length > 0) {
    const citySlug = topCitySlugs[seed % topCitySlugs.length]
    const cityData = getVilleBySlug(citySlug)
    if (cityData) {
      const prefixes = [
        'Nos clients recherchent également un',
        'Vous pouvez aussi trouver un',
        'Nous intervenons aussi pour les recherches de',
        'Consultez aussi les profils de',
      ]
      links.push({
        href: `/services/${serviceSlug}/${citySlug}`,
        anchor: `${serviceName.toLowerCase()} à ${cityData.name}`,
        prefix: prefixes[seed % prefixes.length],
        suffix: '.',
      })
    }
  }

  // 2. Related service in same city
  const related = relatedServices[serviceSlug] || []
  if (related.length > 0) {
    const relSlug = related[(seed + 1) % related.length]
    const relService = services.find((s) => s.slug === relSlug)
    if (relService) {
      const prefixes = [
        `Pour des travaux complémentaires, consultez nos`,
        `Besoin d'un autre corps de métier ? Découvrez nos`,
        `Les travaux de ${serviceName.toLowerCase()} sont souvent associés aux prestations de`,
      ]
      links.push({
        href: `/services/${relSlug}/${villeSlug}`,
        anchor: `${relService.name.toLowerCase()} à ${villeName}`,
        prefix: prefixes[(seed + 1) % prefixes.length],
        suffix: '.',
      })
    }
  }

  // 3. Tarifs link (different intent, same service×city)
  links.push({
    href: `/tarifs/${serviceSlug}/${villeSlug}`,
    anchor: `tarifs ${serviceName.toLowerCase()} à ${villeName}`,
    prefix: 'Consultez nos',
    suffix: ' pour estimer votre budget.',
  })

  // 4. Nearby city link (if not a money page, boost one)
  const nearby = getNearbyCities(villeSlug, 5, getCityScore)
  const moneyNearby = nearby.find((v) => isMoneyPage(serviceSlug, v.slug))
  if (moneyNearby) {
    links.push({
      href: `/services/${serviceSlug}/${moneyNearby.slug}`,
      anchor: `${serviceName.toLowerCase()} à ${moneyNearby.name}`,
      prefix: 'Les habitants des communes voisines font aussi appel à un',
      suffix: '.',
    })
  }

  return links.slice(0, 4)
}

/**
 * Server component that renders contextual internal links as natural prose paragraphs.
 * Should be placed INSIDE the main content section (not aside/footer) for Reasonable Surfer weight.
 */
export default function InBodyLinks({
  serviceSlug,
  villeSlug,
  villeName,
  serviceName,
}: InBodyLinksProps) {
  const links = generateContextualLinks(serviceSlug, villeSlug, villeName, serviceName)
  if (links.length === 0) return null

  return (
    <div className="mt-6 space-y-2 text-sm text-stone-600 leading-relaxed">
      {links.map((link, i) => (
        <p key={i}>
          {link.prefix}{' '}
          <Link
            href={link.href}
            className="text-primary-600 hover:text-primary-800 underline decoration-primary-200 hover:decoration-primary-400 transition-colors"
            prefetch={false}
          >
            {link.anchor}
          </Link>
          {link.suffix}
        </p>
      ))}
    </div>
  )
}
