'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react'
import { Artisan, getDisplayName } from './types'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'

interface ArtisanPhotoGridProps {
  artisan: Artisan
}

// Use shared BLUR_PLACEHOLDER from images.ts
const BLUR_DATA_URL = BLUR_PLACEHOLDER

export function ArtisanPhotoGrid({ artisan }: ArtisanPhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const displayName = getDisplayName(artisan)

  // Only show real portfolio photos — no fake stock images.
  // L'entrée id='avatar' est la photo de profil synthétisée depuis
  // providers.avatar_url (lue par <ArtisanHero>) — hors galerie réalisations.
  const photos = (artisan.portfolio || []).filter((p) => p.id !== 'avatar')

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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    },
    [closeLightbox, goToPrevious, goToNext]
  )

  if (photos.length === 0) return null

  // Take first 5 photos for grid display
  const gridPhotos = photos.slice(0, 5)
  const remainingCount = photos.length - 5

  // Cellule réutilisable : la grille s'adapte au nombre de photos pour éviter
  // les cases vides (1 photo remplissait une demi-grille Airbnb → moitié vide).
  const renderCell = (
    photo: (typeof gridPhotos)[number],
    index: number,
    opts: { className?: string; overlay?: React.ReactNode } = {}
  ) => (
    <div
      key={photo.id}
      className={`relative overflow-hidden ${opts.className ?? ''}`}
      role="button"
      tabIndex={0}
      onClick={() => openLightbox(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openLightbox(index)
        }
      }}
    >
      <Image
        src={photo.imageUrl}
        alt={
          index === 0
            ? `${displayName} - ${artisan.specialty} à ${artisan.city}`
            : `Réalisation de ${displayName}${photo.title ? ` - ${photo.title}` : ''}`
        }
        fill
        decoding="async"
        className="object-cover transition-transform duration-300 hover:scale-105"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes="(max-width: 768px) 50vw, 33vw"
        {...(index === 0 ? { priority: true } : { loading: 'lazy' as const })}
      />
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
      {opts.overlay}
    </div>
  )

  // Classes statiques (Tailwind ne purge pas les littéraux).
  const equalCols: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <>
      <div className="animate-fade-in-up relative rounded-2xl overflow-hidden cursor-pointer group">
        {photos.length === 1 ? (
          // 1 photo : image unique, largeur colonne, hauteur contenue.
          renderCell(gridPhotos[0], 0, { className: 'h-64 md:h-80' })
        ) : photos.length >= 5 ? (
          // ≥5 : mosaïque Airbnb (héros + 4).
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-56 md:h-72 lg:h-80">
            {renderCell(gridPhotos[0], 0, { className: 'col-span-2 row-span-2' })}
            {renderCell(gridPhotos[1], 1)}
            {renderCell(gridPhotos[2], 2)}
            {renderCell(gridPhotos[3], 3)}
            {renderCell(gridPhotos[4], 4, {
              overlay:
                remainingCount > 0 ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{remainingCount}</span>
                  </div>
                ) : null,
            })}
          </div>
        ) : (
          // 2 à 4 : colonnes égales sur une rangée, aucune case vide.
          <div className={`grid ${equalCols[gridPhotos.length]} gap-2 h-56 md:h-72 lg:h-80`}>
            {gridPhotos.map((photo, i) => renderCell(photo, i))}
          </div>
        )}

        {/* Bouton plein écran — masqué quand une seule photo (ouverte au clic). */}
        {photos.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg font-medium text-sm text-charcoal-900 shadow-lg flex items-center gap-2 hover:bg-sand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 active:scale-[0.98]"
            aria-label={`Voir les ${photos.length} photos en plein ecran`}
          >
            <Grid3X3 className="w-4 h-4" aria-hidden="true" />
            Voir les {photos.length} photos
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-lightbox bg-black flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie photo - Image ${currentIndex + 1} sur ${photos.length}`}
        >
          {/* Close button */}
          <button
            className="animate-fade-in-up absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={closeLightbox}
            aria-label="Fermer la galerie"
          >
            <X className="w-6 h-6 text-white" aria-hidden="true" />
          </button>

          {/* Counter */}
          <div
            className="absolute top-4 left-4 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full"
            aria-live="polite"
          >
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Navigation buttons */}
          <button
            className="animate-fade-in-right absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            aria-label="Photo precedente"
          >
            <ChevronLeft className="w-8 h-8 text-white" aria-hidden="true" />
          </button>

          <button
            className="animate-fade-in-right absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-8 h-8 text-white" aria-hidden="true" />
          </button>

          {/* Main image */}
          <div
            key={currentIndex}
            className="animate-fade-in-scale relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[currentIndex].imageUrl}
              alt={`Réalisation de ${displayName}${photos[currentIndex].title ? ` - ${photos[currentIndex].title}` : ''}`}
              fill
              loading="eager"
              decoding="async"
              className="object-contain"
              sizes="100vw"
            />

            {/* Caption */}
            <div className="animate-fade-in-up absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-semibold text-lg">{photos[currentIndex].title}</h3>
              {photos[currentIndex].description && (
                <p className="text-white/70 text-sm mt-1">{photos[currentIndex].description}</p>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all hover:scale-110 active:scale-95 ${
                  index === currentIndex
                    ? 'ring-2 ring-white opacity-100'
                    : 'opacity-50 hover:opacity-75'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
              >
                <Image
                  src={photo.imageUrl}
                  alt={`Réalisation de ${displayName}${photo.title ? ` - ${photo.title}` : ''}`}
                  fill
                  loading="lazy"
                  decoding="async"
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
