'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { slugify } from '@/lib/utils'
import { SocialProofBanner } from '@/components/SocialProofBanner'
import { trackEvent } from '@/lib/analytics/tracking'
import { getClientPortrait } from '@/lib/data/images-faces'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})
const DevisBottomSheet = dynamic(() => import('@/components/conversion/DevisBottomSheet'), {
  ssr: false,
})

interface GeoPageCTAProps {
  /** Required for hero/mid variants, optional for sticky-only */
  title?: string
  subtitle?: string
  ville?: string
  service?: string
  variant?: 'hero' | 'mid' | 'sticky-only'
}

export default function GeoPageCTA({
  title,
  subtitle,
  ville,
  service,
  variant = 'hero',
}: GeoPageCTAProps) {
  const [isDevisOpen, setIsDevisOpen] = useState(false)

  // Build desktop devis link with pre-filled service + ville.
  // 2026-05-07 — fix : pointe vers `/devis?service&ville` (formulaire pré-rempli)
  // au lieu de `/services/[s]/[v]` (page artisans listing). Le user clique
  // « devis », il atterrit sur le formulaire — pas une autre page.
  const villeSlug = ville ? slugify(ville) : ''
  const devisHref = (() => {
    if (service && villeSlug) {
      return `/devis?service=${encodeURIComponent(service)}&ville=${encodeURIComponent(villeSlug)}`
    }
    if (service) return `/devis/${service}`
    return '/devis'
  })()

  const handleClick = () => {
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all text-lg whitespace-nowrap"
              >
                {service && ville
                  ? `Besoin d'un ${service} à ${ville} ?`
                  : 'Obtenir mon devis gratuit'}
              </button>
              <a
                href={PHONE_TEL}
                onClick={() => {
                  trackEvent('phone_click', { source: 'geo_page_cta' })
                }}
                className="inline-flex items-center justify-center gap-2 border-2 border-accent-200 bg-white text-accent-700 font-semibold px-6 py-4 rounded-xl hover:bg-accent-50 hover:border-accent-300 transition-all text-lg whitespace-nowrap"
                aria-label="Appeler ServicesArtisans"
              >
                <Phone className="w-5 h-5" />
                {PHONE_NUMBER}
              </a>
            </div>
          </div>
          {(ville || service) && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2 flex-shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={getClientPortrait(i).src}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <SocialProofBanner
                ville={ville}
                metier={service}
                variant="compact"
                animated={false}
              />
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
