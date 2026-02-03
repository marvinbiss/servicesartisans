'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, CheckCircle, Shield, Zap, Users, Clock, Award } from 'lucide-react'
import { Artisan, getDisplayName } from './types'
import {
  VerificationLevelBadge,
  VerifiedBadge,
} from '@/components/reviews/VerifiedBadge'

interface ArtisanHeroProps {
  artisan: Artisan
}

// Blur placeholder for avatar
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k='

// Determine verification level based on artisan data
function getVerificationLevel(artisan: Artisan): 'none' | 'basic' | 'standard' | 'premium' | 'enterprise' {
  if (artisan.is_premium && artisan.is_verified && artisan.insurance && artisan.insurance.length > 0) {
    return 'premium'
  }
  if (artisan.is_verified && artisan.insurance && artisan.insurance.length > 0) {
    return 'standard'
  }
  if (artisan.is_verified) {
    return 'basic'
  }
  return 'none'
}

export function ArtisanHero({ artisan }: ArtisanHeroProps) {
  const displayName = getDisplayName(artisan)
  const verificationLevel = getVerificationLevel(artisan)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      role="banner"
      aria-label={`Profil de ${displayName}`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg overflow-hidden">
              {artisan.avatar_url ? (
                <Image
                  src={artisan.avatar_url}
                  alt={`Photo de ${displayName}`}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(max-width: 768px) 96px, 128px"
                />
              ) : (
                <span aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {artisan.is_verified && (
              <div
                className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg"
                aria-label="Artisan verifie"
                role="img"
              >
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Top Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3" role="list" aria-label="Badges et certifications">
            {artisan.is_premium && (
              <span role="listitem" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold shadow-sm">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                Premium
              </span>
            )}
            <VerificationLevelBadge level={verificationLevel} size="sm" />
            {artisan.emergency_available && (
              <span role="listitem" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                Urgences 24/7
              </span>
            )}
            {(artisan.response_rate || 0) >= 90 && (
              <span role="listitem" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
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

          {/* Verification Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {artisan.is_verified && (
              <VerifiedBadge type="identity" size="sm" />
            )}
            {artisan.insurance && artisan.insurance.length > 0 && (
              <VerifiedBadge type="insurance" size="sm" />
            )}
            {artisan.certifications && artisan.certifications.length > 0 && (
              <VerifiedBadge type="certification" size="sm" />
            )}
          </div>

          {/* Rating & Stats Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2" role="group" aria-label="Note moyenne">
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
                <span className="font-bold text-gray-900" aria-label={`Note de ${artisan.average_rating.toFixed(1)} sur 5`}>
                  {artisan.average_rating.toFixed(1)}
                </span>
              </div>
              {artisan.review_count > 0 && (
                <span className="text-gray-600" aria-label={`${artisan.review_count} avis clients`}>
                  ({artisan.review_count} avis)
                </span>
              )}
            </div>

            {artisan.experience_years && artisan.experience_years > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{artisan.experience_years} ans d'exp.</span>
              </div>
            )}

            {artisan.team_size && artisan.team_size > 1 && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Equipe de {artisan.team_size}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
