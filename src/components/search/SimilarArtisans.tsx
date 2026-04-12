'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import { cn, getArtisanUrl } from '@/lib/utils'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'

interface SimilarArtisan {
  id: string
  name: string
  slug: string
  stable_id?: string
  specialty: string
  city: string
  ratingAverage: number
  reviewCount: number
  avatarUrl?: string
  similarityScore: number
  factors: {
    service: number
    location: number
    price: number
  }
}

interface SimilarArtisansProps {
  artisanId: string
  serviceSlug: string
  locationSlug: string
  limit?: number
  className?: string
}

export function SimilarArtisans({
  artisanId,
  serviceSlug,
  locationSlug,
  limit = 4,
  className,
}: SimilarArtisansProps) {
  const [artisans, setArtisans] = useState<SimilarArtisan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSimilar() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/artisans/${artisanId}/similar?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          setArtisans(data.artisans || [])
        }
      } catch (error) {
        console.error('Error fetching similar artisans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilar()
  }, [artisanId, limit])

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-xl p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (artisans.length === 0) {
    return null
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-sand-300', className)}>
      <div className="p-4 border-b border-sand-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-charcoal-900">Artisans similaires</h3>
        </div>
        <p className="text-sm text-charcoal-500 mt-1">Basé sur le service et la localisation</p>
      </div>

      <div className="divide-y divide-sand-300">
        {artisans.map((artisan) => {
          const providerUrl = getArtisanUrl({
            stable_id: artisan.stable_id,
            slug: artisan.slug,
            specialty: artisan.specialty,
            city: artisan.city,
          })

          return (
            <Link
              key={artisan.id}
              href={providerUrl}
              className="flex items-center gap-4 p-4 hover:bg-sand-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-sand-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {artisan.avatarUrl ? (
                  <Image
                    src={artisan.avatarUrl}
                    alt={`${artisan.name} - ${artisan.specialty} à ${artisan.city}`}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="w-full h-full object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                  />
                ) : (
                  <span className="text-lg font-medium text-charcoal-500">
                    {artisan.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-charcoal-900 truncate">{artisan.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-500">
                  <span>{artisan.specialty}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {artisan.city}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-charcoal-900">
                  {artisan.ratingAverage.toFixed(1)}
                </span>
                <span className="text-charcoal-400">({artisan.reviewCount})</span>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-charcoal-400" />
            </Link>
          )
        })}
      </div>

      {/* View more link */}
      <div className="p-4 border-t border-sand-300">
        <Link
          href={`/services/${serviceSlug}/${locationSlug}`}
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          Voir tous les artisans
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default SimilarArtisans
