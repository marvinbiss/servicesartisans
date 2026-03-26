'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { FileText, ShieldCheck, Clock, Star } from 'lucide-react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'

const DevisBottomSheet = dynamic(
  () => import('@/components/conversion/DevisBottomSheet'),
  { ssr: false }
)

interface ArtisanQuickQuoteProps {
  artisan: LegacyArtisan
}

export function ArtisanQuickQuote({ artisan }: ArtisanQuickQuoteProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const displayName = getDisplayName(artisan)

  const handleOpenSheet = () => {
    trackEvent('artisan_devis_click', {
      artisanId: artisan.id,
      artisanName: artisan.business_name || displayName,
      source: 'quick_quote_block',
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
      setIsSheetOpen(true)
    }
  }

  return (
    <>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-xl border border-primary-200/60 shadow-soft overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary-400 to-accent-500" />

        <div className="p-5 md:p-6">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold text-charcoal-900 font-heading">
              Demander un devis à {displayName}
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Gratuit, sans engagement — réponse sous 24-48h
            </p>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            onClick={handleOpenSheet}
            className="w-full py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-cta transition-colors flex items-center justify-center gap-2.5 touch-manipulation"
            aria-label={`Demander un devis gratuit à ${displayName}`}
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Obtenir mon devis gratuit
          </motion.button>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
            {artisan.is_verified && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent-700">
                <ShieldCheck className="w-4 h-4 text-accent-500" aria-hidden="true" />
                Artisan vérifié SIREN
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
              <Clock className="w-4 h-4 text-primary-400" aria-hidden="true" />
              Réponse rapide
            </div>
            {artisan.average_rating > 0 && artisan.review_count > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                {artisan.average_rating.toFixed(1)}/5 ({artisan.review_count} avis)
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* DevisBottomSheet — pre-filled with artisan data */}
      <DevisBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        prefilledService={artisan.specialty_slug || ''}
        prefilledCity={artisan.city || ''}
      />
    </>
  )
}
