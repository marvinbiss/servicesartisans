'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Share2, Heart } from 'lucide-react'
import {
  Artisan,
  Review,
  getDisplayName,
  ArtisanHero,
  ArtisanStats,
  ArtisanAbout,
  ArtisanServices,
  ArtisanReviews,
  ArtisanFAQ,
  ArtisanMap,
  ArtisanSidebar,
  ArtisanMobileCTA,
  ArtisanSchema,
  ArtisanBreadcrumb,
  ArtisanSimilar,
  ArtisanPhotoGrid,
  ArtisanPageSkeleton,
} from '@/components/artisan'

interface ArtisanPageClientProps {
  initialArtisan: Artisan | null
  initialReviews: Review[]
  artisanId: string
}

export default function ArtisanPageClient({
  initialArtisan,
  initialReviews,
  artisanId: _artisanId,
}: ArtisanPageClientProps) {
  const [artisan, _setArtisan] = useState<Artisan | null>(initialArtisan)
  const [reviews, _setReviews] = useState<Review[]>(initialReviews)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate hydration loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = async () => {
    if (navigator.share && artisan) {
      try {
        await navigator.share({
          title: getDisplayName(artisan),
          text: `${artisan.specialty} a ${artisan.city}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Loading state (skeleton)
  if (isLoading && !artisan) {
    return <ArtisanPageSkeleton />
  }

  // Not found state
  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artisan non trouve</h1>
          <p className="text-gray-600 mb-6">Cet artisan n'existe pas ou n'est plus disponible.</p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour a la recherche
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Schema.org JSON-LD */}
      <ArtisanSchema artisan={artisan} reviews={reviews} />

      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Retour</span>
              </Link>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2.5 rounded-full transition-colors ${
                    isFavorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <ArtisanBreadcrumb artisan={artisan} />
          </div>

          {/* Photo Grid - Airbnb style (full width) */}
          <div className="mb-6">
            <ArtisanPhotoGrid artisan={artisan} />
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-6">
              <ArtisanHero artisan={artisan} />
              <ArtisanStats artisan={artisan} />
              <ArtisanAbout artisan={artisan} />
              <ArtisanServices artisan={artisan} />
              <ArtisanReviews artisan={artisan} reviews={reviews} />
              <ArtisanFAQ artisan={artisan} />
              <ArtisanMap artisan={artisan} />
              <ArtisanSimilar artisan={artisan} />
            </div>

            {/* Right column - Sticky sidebar */}
            <div className="hidden lg:block">
              <ArtisanSidebar artisan={artisan} />
            </div>
          </div>
        </main>

        {/* Mobile CTA */}
        <ArtisanMobileCTA artisan={artisan} />
      </div>
    </>
  )
}
