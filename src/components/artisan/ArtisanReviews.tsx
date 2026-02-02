'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, ChevronDown } from 'lucide-react'
import { Artisan, Review } from './types'

interface ArtisanReviewsProps {
  artisan: Artisan
  reviews: Review[]
}

export function ArtisanReviews({ artisan, reviews }: ArtisanReviewsProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => Math.floor(r.rating) === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        Avis clients ({artisan.review_count})
      </h2>

      {/* Rating overview */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
        {/* Big rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900">{artisan.average_rating.toFixed(1)}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(artisan.average_rating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">{artisan.review_count} avis</div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-6">{rating}</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-500 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        <AnimatePresence>
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verifie
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{review.comment}</p>

              {review.service && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                    Service: {review.service}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more button */}
      {reviews.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="mt-6 w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? 'Voir moins' : `Voir tous les ${reviews.length} avis`}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </motion.button>
      )}
    </motion.div>
  )
}
