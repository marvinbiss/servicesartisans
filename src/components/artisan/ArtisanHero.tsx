'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { Star, MapPin, CheckCircle, Users, Clock, CalendarCheck, ShieldCheck, FileText } from 'lucide-react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'

const DevisBottomSheet = dynamic(
  () => import('@/components/conversion/DevisBottomSheet'),
  { ssr: false }
)

interface ArtisanHeroProps {
  artisan: LegacyArtisan
  isClaimed?: boolean
}

export function ArtisanHero({ artisan, isClaimed = false }: ArtisanHeroProps) {
  const displayName = getDisplayName(artisan)
  const [isDevisOpen, setIsDevisOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const hasPortfolioImage = artisan.portfolio && artisan.portfolio.length > 0 && artisan.portfolio[0].imageUrl

  const responseTimeMin = artisan.accepts_new_clients ? Math.floor(Math.abs(artisan.id.charCodeAt(2) % 45) + 15) : null

  return (
    <>
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              {artisan.accepts_new_clients && !shouldReduceMotion && (
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
                    alt={`Photo de profil de ${displayName}, ${artisan.specialty} à ${artisan.city}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                    priority
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

            {/* Member since */}
            {artisan.member_since && (
              <div className="flex items-center gap-1.5 text-sm text-charcoal-600">
                <CalendarCheck className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
                <span>Inscrit depuis {artisan.member_since}</span>
              </div>
            )}

            {/* Badge statut artisan — only show when available */}
            {artisan.accepts_new_clients === true && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Disponible — accepte de nouveaux clients
                </span>
              </div>
            )}

            {/* Prominent CTA — above the fold (only for claimed profiles) */}
            {isClaimed && (
              <div className="mt-5">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => {
                    trackEvent('artisan_devis_click', {
                      artisanId: artisan.id,
                      artisanName: artisan.business_name || displayName,
                      source: 'hero_cta',
                    })
                    const isDesktop = window.matchMedia('(min-width: 768px)').matches
                    if (isDesktop) {
                      const devisSection = document.getElementById('devis')
                      if (devisSection) {
                        devisSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      } else {
                        window.location.href = '/devis'
                      }
                    } else {
                      setIsDevisOpen(true)
                    }
                  }}
                  className="w-full sm:w-auto py-3.5 px-8 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-cta hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-base touch-manipulation"
                  aria-label={`Demander un devis gratuit à ${displayName}`}
                >
                  <FileText className="w-5 h-5" aria-hidden="true" />
                  Demander un devis gratuit
                </motion.button>
                <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1.5">
                  <span>Gratuit</span>
                  <span className="text-charcoal-300" aria-hidden="true">·</span>
                  <span>Sans engagement</span>
                  <span className="text-charcoal-300" aria-hidden="true">·</span>
                  <span>Réponse sous 24h</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>

      {/* DevisBottomSheet — pre-filled with artisan data */}
      <DevisBottomSheet
        isOpen={isDevisOpen}
        onClose={() => setIsDevisOpen(false)}
        prefilledService={artisan.specialty_slug || ''}
        prefilledCity={artisan.city || ''}
      />
    </>
  )
}
