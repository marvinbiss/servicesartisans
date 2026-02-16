'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, ChevronDown, Filter, ThumbsUp, Image as ImageIcon } from 'lucide-react'
import { Artisan, Review } from './types'

interface ArtisanReviewsProps {
  artisan: Artisan
  reviews: Review[]
}

const REVIEWS_PER_PAGE = 5

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1' | 'verified' | 'photo'

export function ArtisanReviews({ artisan: _artisan, reviews }: ArtisanReviewsProps) {
  const [displayCount, setDisplayCount] = useState(REVIEWS_PER_PAGE)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  // If no reviews at all, show a clean CTA instead of empty bars
  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-secondary-500 fill-secondary-500" />
          Avis clients
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-secondary-400" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Pas encore d'avis</p>
          <p className="text-gray-500 text-sm">Soyez le premier à donner votre avis sur cet artisan.</p>
        </div>
      </motion.div>
    )
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => Math.floor(r.rating) === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  // Filter and sort reviews
  let filteredResult = [...reviews]
  switch (filter) {
    case '5': case '4': case '3': case '2': case '1':
      filteredResult = filteredResult.filter(r => Math.floor(r.rating) === parseInt(filter))
      break
    case 'verified':
      filteredResult = filteredResult.filter(r => r.verified)
      break
    case 'photo':
      filteredResult = filteredResult.filter(r => r.hasPhoto)
      break
  }
  if (sortBy === 'rating') {
    filteredResult.sort((a, b) => b.rating - a.rating)
  }

  const filteredReviews = filteredResult
  const displayedReviews = filteredReviews.slice(0, displayCount)
  const hasMore = displayCount < filteredReviews.length

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + REVIEWS_PER_PAGE)
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setDisplayCount(REVIEWS_PER_PAGE)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-secondary-500 fill-secondary-500" />
        Avis clients ({reviews.length})
      </h2>

      {/* Rating overview */}
      <div className="flex flex-col md:flex-row gap-8 mb-6 pb-6 border-b border-gray-100">
        {/* Big rating */}
        <div className="text-center md:text-left flex-shrink-0">
          <div className="text-5xl font-bold text-gray-900">
            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                    ? 'text-secondary-500 fill-secondary-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">{reviews.length} avis</div>
        </div>

        {/* Distribution bars - clickable filters */}
        <div className="flex-1 space-y-2" role="group" aria-label="Filtrer par nombre d'étoiles">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() => handleFilterChange(rating.toString() as FilterType)}
              aria-pressed={filter === rating.toString()}
              aria-label={`Filtrer les avis ${rating} étoiles (${count} avis)`}
              className={`w-full flex items-center gap-3 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-1 ${
                filter === rating.toString() ? 'bg-secondary-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm text-gray-600 w-6" aria-hidden="true">{rating}</span>
              <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" aria-hidden="true" />
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    filter === rating.toString() ? 'bg-secondary-600' : 'bg-secondary-500'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right" aria-hidden="true">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Filtres des avis">
        <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <button
          onClick={() => handleFilterChange('all')}
          aria-pressed={filter === 'all'}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => handleFilterChange('verified')}
          aria-pressed={filter === 'verified'}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
            filter === 'verified'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Vérifiés
        </button>
        <button
          onClick={() => handleFilterChange('photo')}
          aria-pressed={filter === 'photo'}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
            filter === 'photo'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Avec photo
        </button>

        <div className="flex-1" />

        {/* Sort */}
        <label htmlFor="reviews-sort" className="sr-only">Trier les avis</label>
        <select
          id="reviews-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="recent">Plus récents</option>
          <option value="rating">Meilleures notes</option>
        </select>
      </div>

      {/* No results for current filter */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun avis ne correspond à ce filtre</p>
          <button
            onClick={() => handleFilterChange('all')}
            className="mt-2 text-primary-600 hover:underline text-sm"
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Vérifié
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
                          ? 'text-secondary-500 fill-secondary-500'
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
                    loading="lazy"
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
          {displayedReviews.length} sur {filteredReviews.length} avis affichés
          {filter !== 'all' && ` (filtre: ${filter === 'verified' ? 'référencés' : filter === 'photo' ? 'avec photo' : filter + ' étoiles'})`}
        </p>
      )}
    </motion.div>
  )
}
