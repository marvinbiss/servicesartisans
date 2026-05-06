import Link from 'next/link'
import { Star, ShieldCheck, MapPin, ChevronRight, Award, ArrowRight } from 'lucide-react'
import { buildDevisHref, getAvatarColor } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FallbackProvider {
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
  rge_valid_until?: string | null
}

interface FallbackProvidersProps {
  providers: FallbackProvider[]
  departmentName: string
  serviceName: string
  serviceSlug: string
  villeName: string
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
      stars.push(<Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />)
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
      stars.push(<Star key={i} className="w-4 h-4 text-sand-300" />)
    }
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FallbackProviders({
  providers,
  departmentName,
  serviceName,
  serviceSlug,
  villeName,
}: FallbackProvidersProps) {
  const svcLower = serviceName.toLowerCase()

  // No providers even at département level → soft CTA
  if (!providers || providers.length === 0) {
    return (
      <section className="py-12 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl border border-sand-300 p-8 shadow-soft">
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-3">
              Pas encore d&apos;artisan {svcLower} r{'é'}f{'é'}renc{'é'} dans votre ville
            </h2>
            <p className="text-charcoal-600 text-sm mb-6">
              Aucun {svcLower} n&apos;est encore r{'é'}f{'é'}renc{'é'} {'à'} {villeName} ni dans le{' '}
              {departmentName}. Vous pouvez tout de m{'ê'}me demander un devis gratuit.
            </p>
            <Link
              href={buildDevisHref(serviceSlug, villeName)}
              className="inline-flex items-center gap-2 bg-primary-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-cta hover:bg-primary-500 hover:shadow-cta-hover active:scale-[0.98] transition-all duration-200"
            >
              Demander un devis gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const now = new Date().toISOString().slice(0, 10)
  const gridCols =
    providers.length <= 2 ? 'grid-cols-1 max-w-xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="py-8 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900">
              Artisans {svcLower} dans le {departmentName}
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              {providers.length} {svcLower}
              {providers.length > 1 ? 's' : ''} disponible{providers.length > 1 ? 's' : ''} dans
              votre d{'é'}partement
            </p>
          </div>
        </div>

        <div className={`grid ${gridCols} gap-4`}>
          {providers.map((provider) => {
            const hasRating =
              typeof provider.rating_average === 'number' && provider.rating_average > 0
            const hasReviews =
              typeof provider.review_count === 'number' && provider.review_count > 0
            const isRge = provider.rge_valid_until && provider.rge_valid_until > now

            return (
              <div
                key={provider.id}
                className="group relative bg-white rounded-xl border border-sand-300 p-5 shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-200"
              >
                {/* Header: avatar + name + badges */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(provider.name)} flex items-center justify-center text-white text-base font-bold shadow-soft flex-shrink-0`}
                  >
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-base font-bold text-charcoal-900 truncate">
                        {provider.name}
                      </span>
                      {provider.is_verified && (
                        <span
                          className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex-shrink-0"
                          aria-label="Artisan vérifié"
                          title="Artisan vérifié SIREN"
                        >
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
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

                {/* RGE badge */}
                {isRge && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700">Certifi{'é'} RGE</span>
                  </div>
                )}

                {/* Rating or "Nouveau" badge */}
                <div className="mb-3">
                  {hasRating && hasReviews ? (
                    <div className="flex items-center gap-2">
                      <StarRating rating={provider.rating_average ?? 0} />
                      <span className="text-sm font-semibold text-charcoal-800">
                        {(provider.rating_average ?? 0).toFixed(1)}
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
                    <ShieldCheck
                      className="w-3.5 h-3.5 flex-shrink-0 text-accent-500"
                      aria-hidden="true"
                    />
                    SIREN {provider.siret.slice(0, 9)}
                  </p>
                )}

                {/* Department badge */}
                <div className="flex items-center gap-1.5 mb-3 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-medium">
                    Intervient dans tout le {departmentName}
                  </span>
                </div>

                {/* Generic CTA — NOT linked to specific artisan (rule: no CTA on unclaimed) */}
                <Link
                  href={buildDevisHref(serviceSlug, villeName)}
                  className="relative z-20 block w-full py-2.5 text-center bg-primary-400 text-white rounded-lg font-bold text-sm shadow-cta hover:bg-primary-500 hover:shadow-cta-hover active:scale-[0.98] transition-all duration-200"
                >
                  <span className="inline-flex items-center gap-1.5">
                    Demander un devis gratuit
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
