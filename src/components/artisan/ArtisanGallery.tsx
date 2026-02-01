'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from 'lucide-react'
import { Artisan, PortfolioItem } from './types'

interface ArtisanGalleryProps {
  artisan: Artisan
}

// Demo photos for testing
const DEMO_PHOTOS: PortfolioItem[] = [
  { id: '1', title: 'Installation salle de bain', description: 'Renovation complete', imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop', category: 'Renovation' },
  { id: '2', title: 'Reparation chauffe-eau', description: 'Remplacement complet', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop', category: 'Depannage' },
  { id: '3', title: 'Installation robinetterie', description: 'Pose robinet design', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop', category: 'Installation' },
  { id: '4', title: 'Debouchage canalisation', description: 'Intervention rapide', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', category: 'Depannage' },
  { id: '5', title: 'Renovation cuisine', description: 'Plomberie complete', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', category: 'Renovation' },
]

export function ArtisanGallery({ artisan }: ArtisanGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const photos = artisan.portfolio && artisan.portfolio.length > 0
    ? artisan.portfolio
    : DEMO_PHOTOS

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }, [closeLightbox, goToPrevious, goToNext])

  if (photos.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          Realisations ({photos.length} photos)
        </h2>

        {/* Airbnb-style photo grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 rounded-xl overflow-hidden">
          {/* Main hero image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={photos[0].imageUrl}
              alt={photos[0].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>

          {/* Secondary images */}
          {photos.slice(1, 5).map((photo, index) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => openLightbox(index + 1)}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Show more overlay on last visible image */}
              {index === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{photos.length - 5} photos
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        {photos.length > 5 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openLightbox(0)}
            className="mt-4 w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Voir toutes les photos
          </motion.button>
        )}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>

            {/* Previous button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </motion.button>

            {/* Next button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </motion.button>

            {/* Main image */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[currentIndex].imageUrl}
                alt={photos[currentIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />

              {/* Caption */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <h3 className="text-white font-semibold text-lg">
                  {photos[currentIndex].title}
                </h3>
                {photos[currentIndex].description && (
                  <p className="text-white/70 text-sm mt-1">
                    {photos[currentIndex].description}
                  </p>
                )}
                {photos[currentIndex].category && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                    {photos[currentIndex].category}
                  </span>
                )}
              </motion.div>
            </motion.div>

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
              {photos.map((photo, index) => (
                <motion.button
                  key={photo.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
