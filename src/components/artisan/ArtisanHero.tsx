'use client'

import { motion } from 'framer-motion'
import { Star, MapPin, CheckCircle, Shield, Zap, Users, Clock, BadgeCheck } from 'lucide-react'
import { Artisan, getDisplayName } from './types'

interface ArtisanHeroProps {
  artisan: Artisan
}

export function ArtisanHero({ artisan }: ArtisanHeroProps) {
  const displayName = getDisplayName(artisan)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg">
              {artisan.avatar_url ? (
                <img
                  src={artisan.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            {artisan.is_verified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {artisan.is_premium && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold shadow-sm">
                <Zap className="w-3.5 h-3.5" />
                Premium
              </span>
            )}
            {artisan.is_verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" />
                SIRET Verifie
              </span>
            )}
            {artisan.emergency_available && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                Urgences 24/7
              </span>
            )}
            {(artisan.response_rate || 0) >= 90 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Top Pro
              </span>
            )}
          </div>

          {/* Name & Specialty */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {displayName}
          </h1>
          <p className="text-lg text-gray-600 mb-3">{artisan.specialty}</p>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{artisan.city} ({artisan.postal_code})</span>
            {artisan.intervention_zone && (
              <span className="text-gray-400">• Zone: {artisan.intervention_zone}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-gray-900">{artisan.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-600">({artisan.review_count} avis)</span>
            </div>

            {artisan.experience_years && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{artisan.experience_years} ans d'exp.</span>
              </div>
            )}

            {artisan.team_size && artisan.team_size > 1 && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Equipe de {artisan.team_size}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
