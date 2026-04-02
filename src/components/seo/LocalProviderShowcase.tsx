import Link from 'next/link'
import { Star, ShieldCheck, MapPin, ChevronRight } from 'lucide-react'
import { getArtisanUrl, getAvatarColor } from '@/lib/utils'
import { SITE_URL } from '@/lib/seo/config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShowcaseProvider {
  id: string
  stable_id?: string | null
  name: string
  slug?: string | null
  specialty?: string | null
  address_city?: string | null
  is_verified?: boolean | null
  rating_average?: number | null
  review_count?: number | null
  siret?: string | null
}

interface LocalProviderShowcaseProps {
  providers: ShowcaseProvider[]
  serviceName: string
  cityName: string
  /** Max providers to display (default 3) */
  max?: number
  /** When true, only emit JSON-LD scripts — no visible cards.
   *  Useful when the visual listing is handled by another component
   *  (e.g. ServiceLocationPageClient) to avoid duplicate cards. */
  jsonLdOnly?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/** Sort: verified first, then by rating desc, then by review_count desc */
function sortProviders(providers: ShowcaseProvider[]): ShowcaseProvider[] {
  return [...providers].sort((a, b) => {
    // Verified first
    const aVerified = a.is_verified ? 1 : 0
    const bVerified = b.is_verified ? 1 : 0
    if (bVerified !== aVerified) return bVerified - aVerified
    // Higher rating first
    const aRating = a.rating_average ?? 0
    const bRating = b.rating_average ?? 0
    if (bRating !== aRating) return bRating - aRating
    // More reviews first
    const aReviews = a.review_count ?? 0
    const bReviews = b.review_count ?? 0
    return bReviews - aReviews
  })
}

function buildLocalBusinessJsonLd(provider: ShowcaseProvider, cityName: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.address_city || cityName,
      addressCountry: 'FR',
    },
    url: `${SITE_URL}${getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}`,
  }
  if (provider.rating_average && provider.rating_average > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: provider.rating_average,
      reviewCount: provider.review_count || 1,
      bestRating: 5,
    }
  }
  return schema
}

// ---------------------------------------------------------------------------
// Stars sub-component
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.25
  const stars: React.ReactNode[] = []

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <span key={i} className="relative inline-flex w-4 h-4">
          <Star className="absolute w-4 h-4 text-sand-300" />
          <span className="absolute overflow-hidden" style={{ width: '50%' }}>
            <Star className="w-4 h-4 text-secondary-400 fill-secondary-400" />
          </span>
        </span>
      )
    } else {
      stars.push(
        <Star key={i} className="w-4 h-4 text-sand-300" />
      )
    }
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LocalProviderShowcase({
  providers,
  serviceName,
  cityName,
  max = 3,
  jsonLdOnly = false,
}: LocalProviderShowcaseProps) {
  if (!providers || providers.length === 0) return null

  const sorted = sortProviders(providers).slice(0, max)

  // When jsonLdOnly is true, only emit the structured data scripts
  if (jsonLdOnly) {
    return (
      <>
        {sorted.map((p) => (
          <script
            key={`jsonld-${p.id}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonStringify(buildLocalBusinessJsonLd(p, cityName)) }}
          />
        ))}
      </>
    )
  }

  // Grid: 1 col if 1-2 providers, 2 cols md / 3 cols lg if 3+
  const gridCols = sorted.length <= 2
    ? 'grid-cols-1 max-w-xl'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <>
      {/* JSON-LD LocalBusiness for each provider */}
      {sorted.map((p) => (
        <script
          key={`jsonld-${p.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(buildLocalBusinessJsonLd(p, cityName)) }}
        />
      ))}

      <section className="py-8 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal-900">
                Artisans disponibles
              </h2>
              <p className="text-sm text-charcoal-500 mt-1">
                {sorted.length} {serviceName.toLowerCase()}{sorted.length > 1 ? 's' : ''} {cityName ? `à ${cityName}` : ''}
              </p>
            </div>
          </div>

          <div className={`grid ${gridCols} gap-4`}>
            {sorted.map((provider) => {
              const providerUrl = getArtisanUrl({
                stable_id: provider.stable_id,
                slug: provider.slug,
                specialty: provider.specialty,
                city: provider.address_city,
              })
              const hasRating = typeof provider.rating_average === 'number' && provider.rating_average > 0
              const hasReviews = typeof provider.review_count === 'number' && provider.review_count > 0

              return (
                <div
                  key={provider.id}
                  className="group relative bg-white rounded-xl border border-sand-300 p-5 shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-200"
                >
                  {/* Mobile: full-card tappable overlay */}
                  <Link
                    href={providerUrl}
                    className="absolute inset-0 z-10 md:hidden"
                    aria-label={`Voir le profil de ${provider.name}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
                    <ChevronRight className="w-5 h-5 text-charcoal-300" />
                  </div>

                  {/* Header: avatar + name + badges */}
                  <div className="flex items-start gap-3 mb-3">
                    <Link href={providerUrl} className="flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(provider.name)} flex items-center justify-center text-white text-base font-bold shadow-soft`}>
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={providerUrl}
                          className="font-heading text-base font-bold text-charcoal-900 hover:text-primary-500 transition-colors truncate"
                        >
                          {provider.name}
                        </Link>
                        {provider.is_verified && (
                          <span
                            className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex-shrink-0"
                            aria-label="Artisan vérifié"
                            title="Artisan vérifié SIREN"
                          >
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* City */}
                      {provider.address_city && (
                        <div className="flex items-center gap-1 text-xs text-charcoal-500 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{provider.address_city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating or "Nouveau" badge */}
                  <div className="mb-3">
                    {hasRating && hasReviews ? (
                      <div className="flex items-center gap-2">
                        <StarRating rating={provider.rating_average!} />
                        <span className="text-sm font-semibold text-charcoal-800">
                          {provider.rating_average!.toFixed(1)}
                        </span>
                        <span className="text-xs text-charcoal-500">
                          ({provider.review_count} avis)
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-sand-100 text-charcoal-500 text-xs font-semibold">
                        Nouveau
                      </span>
                    )}
                  </div>

                  {/* SIREN trust signal */}
                  {provider.siret && (
                    <p className="flex items-center gap-1 text-xs text-charcoal-400 mb-3">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" aria-hidden="true" />
                      SIREN {provider.siret.slice(0, 9)}
                    </p>
                  )}

                  {/* CTA */}
                  <Link
                    href={providerUrl}
                    className="relative z-20 block w-full py-2.5 text-center bg-primary-400 text-white rounded-lg font-bold text-sm shadow-cta hover:bg-primary-500 hover:shadow-cta-hover active:scale-[0.98] transition-all duration-200"
                  >
                    Voir le profil
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
