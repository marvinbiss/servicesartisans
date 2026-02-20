'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Artisan, Review } from './types'

interface ArtisanReviewsProps {
  artisan: Artisan
  reviews: Review[] // kept for API compatibility — individual reviews are not displayed
}

export function ArtisanReviews({ artisan }: ArtisanReviewsProps) {
  const rating = artisan.average_rating
  const count = artisan.review_count

  // Nothing to show if no aggregate rating
  if (!rating || rating === 0) return null

  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
          Réputation
        </h2>
        {/* Source attribution badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-500"
          title="Note observée sur Google"
        >
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-bold leading-none"
            style={{ fontSize: '9px' }}
            aria-hidden="true"
          >
            G
          </span>
          Observé sur Google
        </span>
      </div>

      {/* Aggregate rating block */}
      <div className="flex items-center gap-5">
        <div className="text-center flex-shrink-0">
          <div
            className="text-5xl font-bold text-gray-900 leading-none"
            aria-label={`Note de ${rating.toFixed(1)} sur 5`}
          >
            {rating.toFixed(1)}
          </div>
          {/* Stars */}
          <div className="flex items-center justify-center gap-0.5 mt-2" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= fullStars
              const half = !filled && star === fullStars + 1 && hasHalf
              return (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    filled
                      ? 'text-amber-500 fill-amber-500'
                      : half
                      ? 'text-amber-400 fill-amber-200'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              )
            })}
          </div>
          {count > 0 && (
            <div className="text-sm text-gray-500 mt-1.5">
              {count.toLocaleString('fr-FR')} avis
            </div>
          )}
        </div>

        {/* Contextual note */}
        <div className="flex-1 pl-5 border-l border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            Note consolidée basée sur les avis clients collectés en ligne.
          </p>
          {count > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              Source : Google Business Profile
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
