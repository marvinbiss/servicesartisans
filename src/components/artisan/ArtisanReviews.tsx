'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, ChevronDown, Filter, ThumbsUp, Image as ImageIcon } from 'lucide-react'
import { Artisan, Review } from './types'

interface ArtisanReviewsProps {
  artisan: Artisan
  reviews: Review[]
}

const REVIEWS_PER_PAGE = 5

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1' | 'verified' | 'photo'

export function ArtisanReviews({ artisan, reviews }: ArtisanReviewsProps) {
  const [displayCount, setDisplayCount] = useState(REVIEWS_PER_PAGE)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map(rating => {
      const count = reviews.filter(r => Math.floor(r.rating) === rating).length
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
      return { rating, count, percentage }
    })
  }, [reviews])

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews]

    // Apply filter
    switch (filter) {
      case '5':
      case '4':
      case '3':
      case '2':
      case '1':
        result = result.filter(r => Math.floor(r.rating) === parseInt(filter))
        break
      case 'verified':
        result = result.filter(r => r.verified)
        break
      case 'photo':
        result = result.filter(r => r.hasPhoto)
        break
    }

    // Apply sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }
    // 'recent' is default order from API

    return result
  }, [reviews, filter, sortBy])

  const displayedReviews = filteredReviews.slice(0, displayCount)
  const hasMore = displayCount < filteredReviews.length

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + REVIEWS_PER_PAGE)
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setDisplayCount(REVIEWS_PER_PAGE) // Reset pagination
  }

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
      <div className="flex flex-col md:flex-row gap-8 mb-6 pb-6 border-b border-gray-100">
        {/* Big rating */}
        <div className="text-center md:text-left flex-shrink-0">
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

        {/* Distribution bars - clickable filters */}
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() => handleFilterChange(rating.toString() as FilterType)}
              className={`w-full flex items-center gap-3 p-1 rounded-lg transition-colors ${
                filter === rating.toString() ? 'bg-amber-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm text-gray-600 w-6">{rating}</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    filter === rating.toString() ? 'bg-amber-600' : 'bg-amber-500'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => handleFilterChange('verified')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            filter === 'verified'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Verifies
        </button>
        <button
          onClick={() => handleFilterChange('photo')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            filter === 'photo'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Avec photo
        </button>

        <div className="flex-1" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="recent">Plus recents</option>
          <option value="rating">Meilleures notes</option>
        </select>
      </div>

      {/* No results */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun avis ne correspond a ce filtre</p>
          <button
            onClick={() => handleFilterChange('all')}
            className="mt-2 text-blue-600 hover:underline text-sm"
          >
            Voir tous les avis
          </button>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
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
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{review.comment}</p>

              {/* Review photo */}
              {review.hasPhoto && review.photoUrl && (
                <div className="mt-3">
                  <img
                    src={review.photoUrl}
                    alt="Photo du client"
                    className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 flex-wrap">
                {review.service && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                    {review.service}
                  </span>
                )}
                <button className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Utile
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more button */}
      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLoadMore}
          className="mt-6 w-full py-3.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          Voir plus d'avis ({filteredReviews.length - displayCount} restants)
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      )}

      {/* Shown count */}
      {filteredReviews.length > 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          {displayedReviews.length} sur {filteredReviews.length} avis affiches
          {filter !== 'all' && ` (filtre: ${filter === 'verified' ? 'verifies' : filter === 'photo' ? 'avec photo' : filter + ' etoiles'})`}
        </p>
      )}
    </motion.div>
  )
}
