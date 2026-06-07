'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  BadgeCheck,
  CheckCircle,
} from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { getArtisanUrl } from '@/lib/utils'

interface SimilarArtisan {
  id: string
  stable_id?: string
  slug?: string
  name: string
  specialty: string
  rating: number
  reviews: number
  city: string
  is_verified?: boolean
  /**
   * True si la fiche a `providers.noindex=true` (920K artisans non-RGE).
   * Utilisé pour émettre `rel="nofollow"` et concentrer le PageRank sur
   * les 46K fiches RGE visibles (noindex=false). Absent/false = pas de
   * nofollow (comportement par défaut).
   */
  noindex?: boolean
}

interface ArtisanSimilarProps {
  artisan: LegacyArtisan
  similarArtisans?: SimilarArtisan[]
  isClaimed?: boolean
}

// « chauffagiste » → « chauffagistes » ; les métiers du catalogue sont tous
// pluralisables par suffixe simple (pas de pluriel irrégulier dans les 21 slugs)
function pluralizeSpecialty(specialty?: string): string {
  const s = specialty?.toLowerCase() || 'artisans'
  return s.endsWith('s') || s.endsWith('x') ? s : `${s}s`
}

export function ArtisanSimilar({
  artisan: _artisan,
  similarArtisans,
  isClaimed = true,
}: ArtisanSimilarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fallback: show hub link when no similar artisans available
  if (!similarArtisans || similarArtisans.length === 0) {
    const hubUrl =
      _artisan.specialty_slug && _artisan.city_slug
        ? `/services/${_artisan.specialty_slug}/${_artisan.city_slug}`
        : null
    if (!hubUrl) return null
    return (
      <div className="bg-[#FFFCF8] rounded-2xl shadow-soft border border-sand-200/60 p-6">
        <h2 className="text-xl font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-clay-400" aria-hidden="true" />
          {!isClaimed
            ? `Artisans RGE certifiés disponibles à ${_artisan.city}`
            : 'Artisans similaires'}
        </h2>
        <p className="text-charcoal-600 mb-4">
          {!isClaimed
            ? `Ces artisans ont rejoint ServicesArtisans et acceptent les demandes de devis`
            : `Découvrez d'autres ${pluralizeSpecialty(_artisan.specialty)} à ${_artisan.city}`}
        </p>
        <Link href={hubUrl} className="text-clay-400 hover:text-clay-600 font-medium">
          Voir tous les {pluralizeSpecialty(_artisan.specialty)} à {_artisan.city} →
        </Link>
      </div>
    )
  }

  const similar = similarArtisans

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleCarouselKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        el.scrollBy({ left: 320, behavior: 'smooth' })
        break
      case 'ArrowLeft':
        e.preventDefault()
        el.scrollBy({ left: -320, behavior: 'smooth' })
        break
      case 'Home':
        e.preventDefault()
        el.scrollTo({ left: 0, behavior: 'smooth' })
        break
      case 'End':
        e.preventDefault()
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
        break
      default:
        break
    }
  }

  const hubUrl =
    _artisan.specialty_slug && _artisan.city_slug
      ? `/services/${_artisan.specialty_slug}/${_artisan.city_slug}`
      : null

  return (
    <div
      className="animate-fade-in-up bg-[#FFFCF8] rounded-2xl shadow-soft border border-sand-200/60 p-6"
      style={{ animationDelay: '0.6s' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-charcoal-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-clay-400" aria-hidden="true" />
          {!isClaimed
            ? `Artisans RGE certifiés disponibles à ${_artisan.city}`
            : 'Artisans similaires'}
        </h2>

        {/* Navigation buttons */}
        <div className="flex gap-2" role="group" aria-label="Navigation du carrousel">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-sand-100 hover:bg-sand-300 transition-all hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-clay-400"
            aria-label="Voir les artisans precedents"
          >
            <ChevronLeft className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-sand-100 hover:bg-sand-300 transition-all hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-clay-400"
            aria-label="Voir les artisans suivants"
          >
            <ChevronRight className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Subtitle for unclaimed */}
      {!isClaimed && (
        <p className="text-sm text-charcoal-500 mb-4">
          Ces artisans ont rejoint ServicesArtisans et acceptent les demandes de devis
        </p>
      )}
      {isClaimed && <div className="mb-4" />}

      {/* Horizontal scroll container — keyboard-navigable carousel */}
      <div
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={handleCarouselKeyDown}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-2 rounded-lg"
        style={{ scrollSnapType: 'x mandatory' }}
        role="region"
        aria-label="Liste des artisans similaires"
        aria-roledescription="carousel"
      >
        {similar.map((item, index) => (
          <div
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} sur ${similar.length}`}
            className="animate-fade-in-right"
            style={{ scrollSnapAlign: 'start', animationDelay: `${index * 0.05}s` }}
          >
            <Link
              href={getArtisanUrl({
                stable_id: item.stable_id,
                slug: item.slug,
                specialty: item.specialty,
                city: item.city,
              })}
              rel={item.noindex === true ? 'nofollow' : undefined}
              aria-label={`Voir le profil de ${item.name}, ${item.specialty} a ${item.city}, note ${item.rating} sur 5`}
            >
              <article className="w-72 bg-white rounded-xl border border-sand-200 p-4 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)]">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-clay-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    <span aria-hidden="true">{item.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal-900 truncate">{item.name}</h3>
                    <p className="text-sm text-charcoal-500">{item.specialty}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-clay-50 text-clay-700 text-xs font-medium">
                      <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                      Vérifié
                    </span>
                  )}
                  {!isClaimed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" aria-hidden="true" />
                      Disponible
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-1"
                    aria-label={`Note: ${item.rating} sur 5, ${item.reviews} avis`}
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900">{item.rating}</span>
                    <span className="text-charcoal-500 text-sm">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-charcoal-500 text-sm">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{item.city}</span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        ))}
      </div>

      {/* CTA bottom link for unclaimed */}
      {!isClaimed && hubUrl && (
        <div className="mt-4 pt-4 border-t border-sand-200/60 text-center">
          <Link
            href={hubUrl}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-700 transition-colors"
          >
            Voir tous les {pluralizeSpecialty(_artisan.specialty)} à {_artisan.city} →
          </Link>
        </div>
      )}
    </div>
  )
}
