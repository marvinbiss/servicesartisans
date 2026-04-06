import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getServicesForArticle } from '@/lib/seo/topical-clusters'
import { tradeContent } from '@/lib/data/trade-content'

// ---------------------------------------------------------------------------
// Config — Top cities and anchor text variants
// ---------------------------------------------------------------------------

const TOP_CITIES = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'bordeaux', name: 'Bordeaux' },
]

/**
 * Generate varied anchor text for service x city links.
 * Alternates between patterns to avoid repetitive anchor text
 * which looks spammy to Google.
 */
function getAnchorText(serviceName: string, cityName: string, index: number): string {
  const patterns = [
    `Trouver un ${serviceName.toLowerCase()} à ${cityName}`,
    `${serviceName} à ${cityName}`,
    `${serviceName}s à ${cityName}`,
    `Devis ${serviceName.toLowerCase()} ${cityName}`,
    `${serviceName.toLowerCase()} près de ${cityName}`,
  ]
  return patterns[index % patterns.length]
}

// Fallback: top services to display when no service match is found
const FALLBACK_SERVICES = [
  'plombier',
  'electricien',
  'serrurier',
  'chauffagiste',
  'peintre-en-batiment',
]

const FALLBACK_CITIES = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlogServiceCityLinksProps {
  articleSlug: string
}

/**
 * Affiche des liens vers les pages service x ville en bas des articles de blog.
 *
 * Stratégie :
 * - Détecte le(s) service(s) associé(s) à l'article via SERVICE_ARTICLE_MAP
 * - Génère des liens /services/{service}/{ville} pour les 5 plus grandes villes
 * - Anchor text varié pour éviter la sur-optimisation
 * - Fallback générique si aucun service n'est détecté
 *
 * Objectif SEO : link equity bidirectionnel blog <-> pages service x ville (maillage interne)
 */
export default function BlogServiceCityLinks({ articleSlug }: BlogServiceCityLinksProps) {
  const serviceSlugs = getServicesForArticle(articleSlug)

  // ── Mode spécifique : services détectés via SERVICE_ARTICLE_MAP ──
  if (serviceSlugs.length > 0) {
    // Limit to first 2 services max to avoid link dilution
    const displayedServices = serviceSlugs.slice(0, 2)

    return (
      <section className="py-10 border-t border-sand-200 bg-sand-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-1">
            Trouver un artisan près de chez vous
          </h3>
          <p className="text-sm text-charcoal-500 mb-6">
            Comparez les artisans vérifiés dans votre ville et obtenez des devis gratuits.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {displayedServices.map((serviceSlug) => {
              const trade = tradeContent[serviceSlug]
              if (!trade) return null
              const serviceName = trade.name

              return (
                <div
                  key={serviceSlug}
                  className="bg-white rounded-2xl border border-sand-200 shadow-soft p-5"
                >
                  <h4 className="font-heading font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {serviceName} par ville
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {TOP_CITIES.map((city, idx) => (
                      <Link
                        key={city.slug}
                        href={`/services/${serviceSlug}/${city.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                        prefetch={false}
                      >
                        {getAnchorText(serviceName, city.name, idx)}
                      </Link>
                    ))}
                  </div>
                  {/* Hub link for full coverage */}
                  <Link
                    href={`/services/${serviceSlug}`}
                    className="inline-flex items-center gap-1 mt-3 text-primary-400 hover:text-primary-600 text-sm font-medium group"
                    prefetch={false}
                  >
                    Voir toutes les villes
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── Mode générique : aucun service détecté ──
  return (
    <section className="py-10 border-t border-sand-200 bg-sand-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-1">
          Services populaires
        </h3>
        <p className="text-sm text-charcoal-500 mb-6">
          Trouvez un artisan vérifié près de chez vous.
        </p>

        <div className="flex flex-wrap gap-2">
          {FALLBACK_SERVICES.map((serviceSlug) => {
            const trade = tradeContent[serviceSlug]
            if (!trade) return null
            return FALLBACK_CITIES.map((city) => (
              <Link
                key={`${serviceSlug}-${city.slug}`}
                href={`/services/${serviceSlug}/${city.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm font-medium border border-sand-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                prefetch={false}
              >
                {trade.name} à {city.name}
              </Link>
            ))
          })}
        </div>
      </div>
    </section>
  )
}
