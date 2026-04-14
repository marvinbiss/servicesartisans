import Link from 'next/link'
import { Star, MessageSquare, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewsDeptBlockProps {
  serviceSlug: string
  serviceName: string
  departmentName: string
  stats: { review_count: number; avg_rating: number } | null
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    created_at: string
    author_name: string | null
    provider_name: string
    provider_city: string | null
  }>
}

// ---------------------------------------------------------------------------
// Stars sub-component (same pattern as FallbackProviders)
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
// Helpers
// ---------------------------------------------------------------------------

/** Extract first name from full name, or fallback */
function displayAuthor(authorName: string | null): string {
  if (!authorName || authorName.trim().length === 0) return 'Client vérifié'
  const firstName = authorName.trim().split(/\s+/)[0]
  return firstName.charAt(0).toUpperCase() + firstName.slice(1)
}

/** Truncate text to maxLen chars with ellipsis */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/** Relative date in French */
function relativeDate(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `il y a ${months} mois`
  }
  const years = Math.floor(diffDays / 365)
  return `il y a ${years} an${years > 1 ? 's' : ''}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReviewsDeptBlock({
  serviceSlug,
  serviceName,
  departmentName,
  stats,
  reviews,
}: ReviewsDeptBlockProps) {
  // Hide entirely if no stats or zero reviews
  if (!stats || stats.review_count === 0) return null

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900">
            Avis clients {serviceName} dans le {departmentName}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={stats.avg_rating} />
            <span className="text-lg font-semibold text-charcoal-800">
              {stats.avg_rating.toFixed(1)}
            </span>
            <span className="text-sm text-charcoal-500">
              ({stats.review_count} avis v{'é'}rifi{'é'}
              {stats.review_count > 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Review cards */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-sand-50 rounded-xl border border-sand-200 p-5 shadow-soft"
              >
                {/* Stars + date */}
                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-charcoal-400">
                    {relativeDate(review.created_at)}
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-charcoal-700 mb-3 leading-relaxed">
                    {truncate(review.comment, 200)}
                  </p>
                )}

                {/* Author + provider */}
                <div className="flex items-center gap-2 text-xs text-charcoal-500">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-charcoal-400" />
                  <span className="font-medium text-charcoal-600">
                    {displayAuthor(review.author_name)}
                  </span>
                  <span className="text-charcoal-300">&middot;</span>
                  <span>
                    {review.provider_name}
                    {review.provider_city ? `, ${review.provider_city}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to all reviews */}
        <div className="text-center">
          <Link
            href={`/avis/${serviceSlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 hover:text-primary-500 transition-colors"
          >
            Voir tous les avis
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
