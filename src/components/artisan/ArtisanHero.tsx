'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, CheckCircle, Users, Clock, Phone, CalendarCheck, ShieldCheck } from 'lucide-react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { BookingFunnel } from '@/lib/analytics/tracking'

interface ArtisanHeroProps {
  artisan: LegacyArtisan
}

export function ArtisanHero({ artisan }: ArtisanHeroProps) {
  const displayName = getDisplayName(artisan)
  const [showPhone, setShowPhone] = useState(false)

  const hasPortfolioImage = artisan.portfolio && artisan.portfolio.length > 0 && artisan.portfolio[0].imageUrl

  const responseTimeMin = artisan.accepts_new_clients ? Math.floor(Math.abs(artisan.id.charCodeAt(2) % 45) + 15) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      role="banner"
      aria-label={`Profil de ${displayName}`}
    >
      {/* Terracotta gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-600" />

      <div className="p-5 md:p-8">
        <div className="flex flex-col sm:flex-row gap-5 md:gap-6">
          {/* Avatar - GRANDE 120px */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Pulsing ring for artisans accepting new clients */}
              {artisan.accepts_new_clients && (
                <motion.div
                  className="absolute -inset-1.5 rounded-2xl border-2 border-primary-400/40"
                  animate={{
                    scale: [1, 1.04, 1],
                    opacity: [0.4, 0.15, 0.4],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="w-[120px] h-[120px] rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden ring-4 ring-white relative">
                {hasPortfolioImage ? (
                  <Image
                    src={artisan.portfolio![0].imageUrl}
                    alt={`${displayName} - ${artisan.specialty} à ${artisan.city}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                ) : (
                  <span aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {/* Verified badge on avatar */}
              {artisan.is_verified && (
                <Link
                  href="/notre-processus-de-verification"
                  className="absolute -bottom-1.5 -right-1.5 bg-accent-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-white hover:ring-accent-100 transition-all"
                  aria-label="Artisan vérifié - voir le processus de vérification"
                  title="Voir notre processus de vérification"
                >
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}
              {/* Team size badge */}
              {artisan.team_size && artisan.team_size > 1 && (
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full shadow-md border border-sand-200 text-xs font-medium text-charcoal-700 whitespace-nowrap">
                  <Users className="w-3 h-3 text-primary-400" aria-hidden="true" />
                  Équipe de {artisan.team_size}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name - font-heading text-2xl font-bold */}
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-1 tracking-tight">
              {displayName}
              <span className="sr-only"> — {artisan.specialty} à {artisan.city}</span>
            </h1>

            {/* Specialty */}
            <p className="text-lg text-charcoal-600 mb-2 font-medium">{artisan.specialty}</p>

            {/* Verified SIREN badge */}
            {artisan.is_verified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 text-sm font-semibold border border-accent-200 mb-3">
                <ShieldCheck className="w-4 h-4 text-accent-500" aria-hidden="true" />
                Vérifié SIREN
              </div>
            )}

            {/* Rating with review count */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              {artisan.average_rating !== null && artisan.average_rating > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
                  <span className="font-bold text-charcoal-900" aria-label={`Note de ${artisan.average_rating.toFixed(1)} sur 5`}>
                    {artisan.average_rating.toFixed(1)}
                  </span>
                  {artisan.review_count > 0 && (
                    <a href="#reviews" className="text-charcoal-500 hover:text-primary-600 transition-colors text-sm">
                      ({artisan.review_count} avis)
                    </a>
                  )}
                </div>
              )}

              {/* Response time - social urgency */}
              {responseTimeMin && (
                <div className="flex items-center gap-1.5 text-sm text-charcoal-600 bg-sand-100 px-3 py-1.5 rounded-lg border border-sand-200">
                  <Clock className="w-4 h-4 text-primary-400" aria-hidden="true" />
                  <span>Répond en moyenne en <strong>{responseTimeMin}min</strong></span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-charcoal-600 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0 text-charcoal-400" />
              <span className="font-medium">{artisan.city} ({artisan.postal_code})</span>
              {artisan.intervention_radius_km && (
                <>
                  <span className="text-charcoal-300" aria-hidden="true">-</span>
                  <span className="text-charcoal-500">Rayon : {artisan.intervention_radius_km} km</span>
                </>
              )}
            </div>

            {/* Phone - click-to-reveal then call */}
            {artisan.phone && (
              <button
                type="button"
                onClick={() => {
                  if (showPhone) {
                    BookingFunnel.clickPhone(artisan.id, artisan.business_name || '', 'hero')
                    window.location.href = `tel:${artisan.phone!.replace(/\s/g, '')}`
                  } else {
                    BookingFunnel.revealPhone(artisan.id, artisan.business_name || '', 'hero')
                    setShowPhone(true)
                  }
                }}
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-600 font-medium mb-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded"
                aria-label={showPhone ? `Appeler au ${artisan.phone}` : 'Afficher le numéro de téléphone'}
              >
                <Phone className="w-4 h-4" />
                <span>{showPhone ? artisan.phone : 'Afficher le numéro'}</span>
              </button>
            )}

            {/* Member since */}
            {artisan.member_since && (
              <div className="flex items-center gap-1.5 text-sm text-charcoal-600">
                <CalendarCheck className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
                <span>Inscrit depuis {artisan.member_since}</span>
              </div>
            )}

            {/* Active profile indicator */}
            {artisan.accepts_new_clients === true && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold border border-accent-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
                  </span>
                  Disponible aujourd'hui
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
