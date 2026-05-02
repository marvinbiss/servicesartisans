import Link from 'next/link'
import { services } from '@/lib/data/france'

interface SeasonalLinksProps {
  currentService?: string
  villeSlug?: string
  villeName?: string
}

/**
 * Seasonal service mapping — which services are most relevant each month.
 * Based on real French demand patterns (chauffage in winter, jardinage in spring, etc.)
 */
const SEASONAL_SERVICES: Record<number, string[]> = {
  // Pivot pure-play BTP énergétique 2026-05-02 :
  // jardinier + paysagiste retirés du calendrier saisonnier (hors thèse).
  0: ['chauffagiste', 'plombier', 'serrurier', 'vitrier', 'ramoneur'], // Janvier
  1: ['chauffagiste', 'plombier', 'electricien', 'peintre-en-batiment', 'vitrier'], // Février
  2: ['couvreur', 'macon', 'peintre-en-batiment', 'facadier', 'isolation-thermique'], // Mars
  3: ['couvreur', 'macon', 'peintre-en-batiment', 'facadier', 'pompe-a-chaleur'], // Avril
  4: ['climaticien', 'couvreur', 'macon', 'pompe-a-chaleur', 'panneaux-solaires'], // Mai
  5: ['climaticien', 'electricien', 'menuisier', 'panneaux-solaires', 'pompe-a-chaleur'], // Juin
  6: ['climaticien', 'serrurier', 'vitrier', 'panneaux-solaires', 'pompe-a-chaleur'], // Juillet
  7: ['climaticien', 'serrurier', 'plombier', 'panneaux-solaires', 'pompe-a-chaleur'], // Août
  8: ['couvreur', 'chauffagiste', 'peintre-en-batiment', 'macon', 'ramoneur'], // Septembre
  9: ['chauffagiste', 'ramoneur', 'couvreur', 'plombier', 'menuisier'], // Octobre
  10: ['chauffagiste', 'plombier', 'ramoneur', 'serrurier', 'vitrier'], // Novembre
  11: ['chauffagiste', 'plombier', 'serrurier', 'electricien', 'ramoneur'], // Décembre
}

/**
 * Server component — renders 3-5 seasonal service links.
 * Placed on hub pages (services, villes, departements) for time-relevant linking.
 */
export default function SeasonalLinks({
  currentService,
  villeSlug,
  villeName,
}: SeasonalLinksProps) {
  const month = new Date().getMonth()
  const seasonalSlugs = SEASONAL_SERVICES[month] || []

  // Filter out current service and resolve names
  const seasonalServices = seasonalSlugs
    .filter((slug) => slug !== currentService)
    .map((slug) => {
      const svc = services.find((s) => s.slug === slug)
      return svc ? { slug: svc.slug, name: svc.name } : null
    })
    .filter((x): x is { slug: string; name: string } => x !== null)
    .slice(0, 5)

  if (seasonalServices.length === 0) return null

  const monthNames = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ]

  return (
    <nav aria-label="Services de saison" className="border-t border-charcoal-100 mt-6 pt-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
        Services de saison — {monthNames[month]}
      </p>
      <div className="flex flex-wrap gap-2">
        {seasonalServices.map((svc) => (
          <Link
            key={svc.slug}
            href={villeSlug ? `/services/${svc.slug}/${villeSlug}` : `/services/${svc.slug}`}
            className="px-3 py-1.5 text-sm text-stone-600 bg-green-50 hover:bg-green-100 hover:text-green-800 rounded-full transition-colors"
            prefetch={false}
          >
            {svc.name}
            {villeName ? ` à ${villeName}` : ''}
          </Link>
        ))}
      </div>
    </nav>
  )
}
