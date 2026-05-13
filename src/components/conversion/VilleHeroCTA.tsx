'use client'

import { useState, useCallback } from 'react'
import { SocialProofBanner } from '@/components/SocialProofBanner'
import { trackEvent } from '@/lib/analytics/tracking'
import DevisBottomSheet from '@/components/conversion/DevisBottomSheet'

interface VilleHeroCTAProps {
  villeName: string
  /** Optionnel : nom du quartier pour contextualiser */
  quartierName?: string
  /** Variante de placement : 'hero' (above-the-fold) ou 'mid' (mid-page card) */
  variant?: 'hero' | 'mid'
}

/**
 * VilleHeroCTA — Client wrapper for the CTA above the fold on ville/quartier pages.
 *
 * Contains the interactive button + DevisBottomSheet + SocialProofBanner.
 * Keeps the parent page as a Server Component.
 */
export default function VilleHeroCTA({
  villeName,
  quartierName,
  variant = 'hero',
}: VilleHeroCTAProps) {
  const [isDevisOpen, setIsDevisOpen] = useState(false)

  // Build desktop devis link with pre-filled ville
  const devisHref = villeName ? `/devis?ville=${encodeURIComponent(villeName)}` : '/devis'

  const openDevis = useCallback(() => {
    trackEvent('form_started', {
      source: variant === 'hero' ? 'ville_hero_cta' : 'ville_mid_cta',
      city: villeName,
      quartier: quartierName || '',
    })
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) {
      const devisSection = document.getElementById('devis')
      if (devisSection) {
        devisSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = devisHref
      }
    } else {
      setIsDevisOpen(true)
    }
  }, [villeName, quartierName, variant, devisHref])

  const closeDevis = useCallback(() => {
    setIsDevisOpen(false)
  }, [])

  const locationLabel = quartierName ? `${quartierName}, ${villeName}` : villeName

  if (variant === 'mid') {
    return (
      <>
        <SocialProofBanner ville={villeName} variant="card" />
        <DevisBottomSheet isOpen={isDevisOpen} onClose={closeDevis} prefilledCity={villeName} />
      </>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-heading font-bold text-lg md:text-xl text-charcoal-900">
              Besoin d&apos;un artisan à {locationLabel} ?
            </p>
            <p className="text-charcoal-600 text-sm mt-1">
              Devis gratuit d&apos;artisans RGE certifiés près de chez vous
            </p>
          </div>
          <button
            onClick={openDevis}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all text-lg whitespace-nowrap"
          >
            Obtenir mon devis gratuit
          </button>
        </div>
        <SocialProofBanner ville={villeName} variant="compact" animated={false} />
      </div>

      <DevisBottomSheet isOpen={isDevisOpen} onClose={closeDevis} prefilledCity={villeName} />
    </>
  )
}
