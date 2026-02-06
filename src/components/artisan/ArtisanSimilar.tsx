'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, ChevronLeft, ChevronRight, Users, BadgeCheck } from 'lucide-react'
import { Artisan } from './types'
import { getArtisanUrl } from '@/lib/utils'

interface SimilarArtisan {
  id: string
  slug?: string
  name: string
  specialty: string
  rating: number
  reviews: number
  city: string
  is_verified?: boolean
  avatar_url?: string
}

interface ArtisanSimilarProps {
  artisan: Artisan
  similarArtisans?: SimilarArtisan[]
}

export function ArtisanSimilar({ artisan: _artisan, similarArtisans }: ArtisanSimilarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Only show if we have real similar artisans
  if (!similarArtisans || similarArtisans.length === 0) {
    return null
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
          Artisans similaires
        </h2>

        {/* Navigation buttons */}
        <div className="flex gap-2" role="group" aria-label="Navigation du carrousel">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Voir les artisans precedents"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Voir les artisans suivants"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
        role="list"
        aria-label="Liste des artisans similaires"
      >
        {similar.map((item, index) => (
          <motion.div
            key={item.id}
            role="listitem"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{ scrollSnapAlign: 'start' }}
          >
            <Link
              href={getArtisanUrl({ id: item.id, slug: item.slug, specialty: item.specialty, city: item.city, business_name: item.name })}
              aria-label={`Voir le profil de ${item.name}, ${item.specialty} a ${item.city}, note ${item.rating} sur 5`}
            >
              <motion.article
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
                className="w-72 bg-white rounded-xl border border-gray-100 p-4 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                        aria-hidden="true"
                      />
                    ) : (
                      <span aria-hidden="true">{item.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.specialty}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                      Verifie
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" aria-label={`Note: ${item.rating} sur 5, ${item.reviews} avis`}>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    <span className="font-semibold text-gray-900">{item.rating}</span>
                    <span className="text-gray-500 text-sm">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{item.city}</span>
                  </div>
                </div>

              </motion.article>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
