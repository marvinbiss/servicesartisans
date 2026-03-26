'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { SocialProofBanner } from '@/components/SocialProofBanner'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), { ssr: false })
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), { ssr: false })
const DevisBottomSheet = dynamic(() => import('@/components/conversion/DevisBottomSheet'), { ssr: false })

interface GeoPageCTAProps {
  /** Required for hero/mid variants, optional for sticky-only */
  title?: string
  subtitle?: string
  ville?: string
  service?: string
  variant?: 'hero' | 'mid' | 'sticky-only'
}

export default function GeoPageCTA({ title, subtitle, ville, service, variant = 'hero' }: GeoPageCTAProps) {
  const [isDevisOpen, setIsDevisOpen] = useState(false)

  const handleClick = () => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) {
      const devisSection = document.getElementById('devis')
      if (devisSection) {
        devisSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = '/devis'
      }
    } else {
      setIsDevisOpen(true)
    }
  }

  return (
    <>
      {variant !== 'sticky-only' && (
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-6 md:p-8 my-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-lg md:text-xl text-charcoal-900">{title}</p>
              {subtitle && <p className="text-charcoal-600 text-sm mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={handleClick}
              className="inline-flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all text-lg whitespace-nowrap"
            >
              {service && ville ? `Besoin d'un ${service} à ${ville} ?` : 'Obtenir mon devis gratuit'}
            </button>
          </div>
          {(ville || service) && (
            <div className="mt-4">
              <SocialProofBanner ville={ville} metier={service} variant="compact" animated={false} />
            </div>
          )}
        </div>
      )}

      <StickyMobileCTA serviceSlug={service} cityName={ville} />
      <ExitIntentPopup />
      <DevisBottomSheet
        isOpen={isDevisOpen}
        onClose={() => setIsDevisOpen(false)}
        prefilledCity={ville}
        prefilledService={service}
      />
    </>
  )
}
