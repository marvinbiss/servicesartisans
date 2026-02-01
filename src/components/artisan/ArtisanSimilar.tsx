'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, ChevronLeft, ChevronRight, Users, Zap, BadgeCheck } from 'lucide-react'
import { Artisan } from './types'

interface SimilarArtisan {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  city: string
  hourly_rate?: number
  is_verified?: boolean
  is_premium?: boolean
  avatar_url?: string
}

interface ArtisanSimilarProps {
  artisan: Artisan
  similarArtisans?: SimilarArtisan[]
}

// Demo similar artisans
const DEMO_SIMILAR: SimilarArtisan[] = [
  { id: 'demo-7', name: 'Yohan LEROY', specialty: 'Plombier', rating: 4.4, reviews: 92, city: 'Pantin', hourly_rate: 52, is_verified: true },
  { id: 'demo-4', name: 'Serrurier Express 93', specialty: 'Serrurier', rating: 4.3, reviews: 67, city: 'Le Pre-Saint-Gervais', hourly_rate: 60, is_premium: true },
  { id: 'demo-8', name: 'Pierre ROUX', specialty: 'Electricien', rating: 4.6, reviews: 134, city: 'Pantin', hourly_rate: 55, is_verified: true },
  { id: 'demo-9', name: 'Chauffage Plus', specialty: 'Chauffagiste', rating: 4.7, reviews: 89, city: 'Bobigny', hourly_rate: 58, is_verified: true, is_premium: true },
  { id: 'demo-10', name: 'Marie BERNARD', specialty: 'Plombier', rating: 4.5, reviews: 76, city: 'Les Lilas', hourly_rate: 50, is_verified: true },
]

export function ArtisanSimilar({ artisan, similarArtisans }: ArtisanSimilarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const similar = similarArtisans && similarArtisans.length > 0
    ? similarArtisans
    : DEMO_SIMILAR

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
          <Users className="w-5 h-5 text-blue-600" />
          Artisans similaires
        </h2>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {similar.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{ scrollSnapAlign: 'start' }}
          >
            <Link href={`/services/artisan/${item.id}`}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
                className="w-72 bg-white rounded-xl border border-gray-100 p-4 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      item.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.specialty}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.is_premium && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                  {item.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <BadgeCheck className="w-3 h-3" />
                      Verifie
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-gray-900">{item.rating}</span>
                    <span className="text-gray-500 text-sm">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.city}
                  </div>
                </div>

                {/* Price */}
                {item.hourly_rate && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">A partir de</span>
                    <span className="font-bold text-blue-600">{item.hourly_rate}€/h</span>
                  </div>
                )}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
