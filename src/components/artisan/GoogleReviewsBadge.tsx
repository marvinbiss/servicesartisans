/**
 * GoogleReviewsBadge — affichage social proof externe (avis Google Places)
 * pour la fiche artisan individuelle.
 *
 * Principes :
 *   - Affiché UNIQUEMENT si google_rating ≥ 1 + google_user_ratings_total ≥ 3
 *     + business_status='OPERATIONAL' (mêmes guards que le fallback
 *     aggregateRating Schema.org dans ArtisanSchema).
 *   - Lien explicite vers Google Maps via place_id (pas de leak du nom dans
 *     l'URL, Google résout depuis le place_id seul).
 *   - rel="noopener noreferrer" (sécurité onglet) + nofollow (pas de flux
 *     PageRank vers Google Maps qui n'en a pas besoin).
 *   - Pas de hot-link iframe Google Reviews (terms of service Places API).
 *   - data-eeat="external-reviews" pour signal éditorial E-E-A-T.
 */

import { Star } from 'lucide-react'

type GoogleReviewsBadgeProps = {
  placeId?: string | null
  rating?: number | null
  userRatingsTotal?: number | null
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | null
  className?: string
}

const MIN_REVIEWS_FOR_DISPLAY = 3

export function GoogleReviewsBadge({
  placeId,
  rating,
  userRatingsTotal,
  businessStatus,
  className = '',
}: GoogleReviewsBadgeProps) {
  // Guards parallèles à ArtisanSchema fallback aggregateRating.
  if (!placeId || businessStatus !== 'OPERATIONAL') return null
  const r = Number(rating ?? 0)
  const total = Number(userRatingsTotal ?? 0)
  if (!Number.isFinite(r) || r < 1 || r > 5) return null
  if (!Number.isFinite(total) || total < MIN_REVIEWS_FOR_DISPLAY) return null

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      data-eeat="external-reviews"
      data-source="google-places"
      className={`inline-flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm hover:border-amber-400 hover:bg-amber-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none ${className}`}
      aria-label={`${r.toFixed(1)} étoiles sur 5 sur Google, ${total} avis. Voir sur Google Maps.`}
    >
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-bold text-charcoal-900">{r.toFixed(1)}</span>
      <span className="text-charcoal-500">({total} avis Google)</span>
      <svg
        className="w-3 h-3 text-charcoal-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  )
}
