'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, CheckCircle, Zap, Users, Clock, Phone, CalendarCheck } from 'lucide-react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import {
  VerificationLevelBadge,
  VerifiedBadge,
} from '@/components/reviews/VerifiedBadge'

interface ArtisanHeroProps {
  artisan: LegacyArtisan
}

// Blur placeholder for avatar
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k='

// Determine verification level based on artisan data
function getVerificationLevel(artisan: LegacyArtisan): 'none' | 'basic' | 'standard' | 'premium' | 'enterprise' {
  if (artisan.is_verified && artisan.insurance && artisan.insurance.length > 0 && artisan.certifications && artisan.certifications.length > 0) {
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden"
      role="banner"
      aria-label={`Profil de ${displayName}`}
    >
      {/* Premium gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-700" />

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg shadow-primary-500/20 overflow-hidden ring-4 ring-white">
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
                  className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-green-400 to-green-600 text-white p-1.5 rounded-full shadow-lg ring-2 ring-white"
                  aria-label="Artisan v&eacute;rifi&eacute;"
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
              <VerificationLevelBadge level={verificationLevel} size="sm" />
              {artisan.emergency_available && (
                <span role="listitem" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  Urgences 24/7
                </span>
              )}
            </div>

            {/* Name & Specialty */}
            <h1 className="text-2xl md:text-3xl text-gray-900 font-heading mb-1.5">
              {displayName}
              <span className="sr-only"> &mdash; {artisan.specialty} &agrave; {artisan.city}</span>
            </h1>
            <p className="text-lg text-slate-600 mb-3 font-medium">{artisan.specialty}</p>

            {/* Location */}
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="font-medium">{artisan.city} ({artisan.postal_code})</span>
              {artisan.intervention_radius_km && (
                <>
                  <span className="text-slate-300" aria-hidden="true">&bull;</span>
                  <span className="text-slate-400">Rayon : {artisan.intervention_radius_km} km</span>
                </>
              )}
            </div>

            {/* Phone - Display directly if available */}
            {artisan.phone && (
              <a
                href={`tel:${artisan.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors group/phone"
                aria-label={`Appeler au ${artisan.phone}`}
              >
                <Phone className="w-4 h-4 transition-transform group-hover/phone:scale-110" />
                <span>{artisan.phone}</span>
              </a>
            )}

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
                {artisan.average_rating !== null && artisan.average_rating > 0 && (
                  <div className="flex items-center gap-1.5 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-100">
                    <Star className="w-5 h-5 text-secondary-500 fill-secondary-500" aria-hidden="true" />
                    <span className="font-bold text-gray-900" aria-label={`Note de ${artisan.average_rating.toFixed(1)} sur 5`}>
                      {artisan.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {artisan.review_count > 0 && (
                  <a href="#reviews" className="text-slate-600 hover:text-primary-700 transition-colors duration-200" aria-label={`${artisan.review_count} avis clients`}>
                    ({artisan.review_count} avis)
                  </a>
                )}
              </div>

              {artisan.experience_years && artisan.experience_years > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>{artisan.experience_years} ans d&apos;exp&eacute;rience</span>
                </div>
              )}

              {artisan.team_size && artisan.team_size > 1 && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>&Eacute;quipe de {artisan.team_size}</span>
                </div>
              )}

              {artisan.member_since && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CalendarCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Inscrit depuis {artisan.member_since}</span>
                </div>
              )}

              {artisan.updated_at && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>Mis &agrave; jour {new Date(artisan.updated_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Freshness / activity indicator */}
            {(artisan.review_count > 0 || artisan.member_since || artisan.accepts_new_clients) && (
              <div className="flex items-center gap-3 flex-wrap mt-3">
                {artisan.review_count > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" aria-hidden="true" />
                    {artisan.review_count} avis client{artisan.review_count > 1 ? 's' : ''} re&ccedil;u{artisan.review_count > 1 ? 's' : ''}
                  </span>
                )}
                {artisan.accepts_new_clients === true && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
                    </span>
                    Profil actif
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
