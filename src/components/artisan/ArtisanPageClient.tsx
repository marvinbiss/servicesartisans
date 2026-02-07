'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Share2, Heart } from 'lucide-react'
import {
  Review,
  getDisplayName,
  ArtisanHero,
  ArtisanStats,
  ArtisanAbout,
  ArtisanServices,
  ArtisanSidebar,
  ArtisanMobileCTA,
  ArtisanSchema,
  ArtisanBreadcrumb,
  ArtisanPageSkeleton,
  ArtisanPhotoGridSkeleton,
} from '@/components/artisan'
import type { LegacyArtisan } from '@/types/legacy'

// Loading skeleton for lazy-loaded sections
function SectionSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${height} animate-pulse`}>
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

// Dynamic imports for heavy components - reduces initial bundle
// These components load lazily to reduce initial page bundle size

// Photo grid with lightbox (heavy - includes next/image + lightbox)
const ArtisanPhotoGrid = dynamic(
  () => import('@/components/artisan/ArtisanPhotoGrid').then(mod => ({ default: mod.ArtisanPhotoGrid })),
  { loading: () => <ArtisanPhotoGridSkeleton />, ssr: false }
)

// Reviews section with animations
const ArtisanReviews = dynamic(
  () => import('@/components/artisan/ArtisanReviews').then(mod => ({ default: mod.ArtisanReviews })),
  { loading: () => <SectionSkeleton height="h-96" />, ssr: false }
)

// Map component with iframe
const ArtisanMap = dynamic(
  () => import('@/components/artisan/ArtisanMap').then(mod => ({ default: mod.ArtisanMap })),
  { loading: () => <SectionSkeleton height="h-80" />, ssr: false }
)

// Similar artisans carousel
const ArtisanSimilar = dynamic(
  () => import('@/components/artisan/ArtisanSimilar').then(mod => ({ default: mod.ArtisanSimilar })),
  { loading: () => <SectionSkeleton height="h-72" />, ssr: false }
)

// FAQ accordion
const ArtisanFAQ = dynamic(
  () => import('@/components/artisan/ArtisanFAQ').then(mod => ({ default: mod.ArtisanFAQ })),
  { loading: () => <SectionSkeleton height="h-64" />, ssr: false }
)

interface ArtisanPageClientProps {
  initialArtisan: LegacyArtisan | null
  initialReviews: Review[]
  artisanId: string
}

export default function ArtisanPageClient({
  initialArtisan,
  initialReviews,
  artisanId: _artisanId,
}: ArtisanPageClientProps) {
  const [artisan, _setArtisan] = useState<LegacyArtisan | null>(initialArtisan)
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

  const displayName = getDisplayName(artisan)

  return (
    <>
      {/* Schema.org JSON-LD */}
      <ArtisanSchema artisan={artisan} reviews={reviews} />

      {/* Skip links for keyboard navigation */}
      <nav aria-label="Liens rapides" className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller au contenu principal
        </a>
        <a
          href="#contact-sidebar"
          className="absolute top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller aux informations de contact
        </a>
      </nav>

      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
                aria-label="Retour a la recherche"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Retour</span>
              </Link>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Partager cette page"
                >
                  <Share2 className="w-5 h-5 text-gray-600" aria-hidden="true" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isFavorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={isFavorite}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-6" aria-label={`Profil de ${displayName}`}>
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Fil d'Ariane">
            <ArtisanBreadcrumb artisan={artisan} />
          </nav>

          {/* Photo Grid - Airbnb style (full width) */}
          <section className="mb-6" aria-label="Galerie photos">
            <ArtisanPhotoGrid artisan={artisan} />
          </section>

          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-6">
              <section aria-label="Informations principales">
                <ArtisanHero artisan={artisan} />
              </section>
              <section aria-label="Statistiques">
                <ArtisanStats artisan={artisan} />
              </section>
              <section aria-label="A propos">
                <ArtisanAbout artisan={artisan} />
              </section>
              <section id="services" aria-label="Services et tarifs">
                <ArtisanServices artisan={artisan} />
              </section>
              <section id="reviews" aria-label="Avis clients">
                <ArtisanReviews artisan={artisan} reviews={reviews} />
              </section>
              <section aria-label="Questions frequentes">
                <ArtisanFAQ artisan={artisan} />
              </section>
              <section aria-label="Localisation">
                <ArtisanMap artisan={artisan} />
              </section>
              <section aria-label="Artisans similaires">
                <ArtisanSimilar artisan={artisan} />
              </section>
            </div>

            {/* Right column - Sticky sidebar */}
            <aside id="contact-sidebar" className="hidden lg:block" aria-label="Informations de contact">
              <ArtisanSidebar artisan={artisan} />
            </aside>
          </div>
        </main>

        {/* Mobile CTA */}
        <ArtisanMobileCTA artisan={artisan} />
      </div>
    </>
  )
}
