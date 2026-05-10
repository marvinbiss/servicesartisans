'use client'

import { FileText, ShieldCheck, Clock, Users } from 'lucide-react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'
import { ADVISORS_LABEL_SHORT } from '@/lib/seo/config'

interface ArtisanQuickQuoteProps {
  artisan: LegacyArtisan
}

export function ArtisanQuickQuote({ artisan }: ArtisanQuickQuoteProps) {
  const displayName = getDisplayName(artisan)

  const handleClick = () => {
    trackEvent('artisan_devis_click', {
      artisanId: artisan.id,
      artisanName: artisan.business_name || displayName,
      source: 'quick_quote_block',
    })
    const devisSection = document.getElementById('devis')
    if (devisSection) {
      devisSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <div
        className="animate-fade-in-up bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-xl border border-primary-200/60 shadow-soft overflow-hidden"
        style={{ animationDelay: '0.15s' }}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary-400 to-accent-500" />

        <div className="p-5 md:p-6">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold text-charcoal-900 font-heading">
              Devis gratuit en 2 min
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Gratuit, sans engagement — réponse rapide
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClick}
            className="w-full py-3.5 px-6 bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2.5 touch-manipulation hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Devis gratuit en 2 min"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Devis gratuit en 2 min
          </button>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent-700">
              <Users className="w-4 h-4 text-accent-500" aria-hidden="true" />
              {ADVISORS_LABEL_SHORT}
            </div>
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
          </div>
        </div>
      </div>
    </>
  )
}
