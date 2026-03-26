'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { FileText, Phone } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import DevisBottomSheet from './DevisBottomSheet'
import ScrollNudge from './ScrollNudge'

interface StickyMobileCTAProps {
  /** The service slug for the devis link */
  serviceSlug?: string
  /** The city name for pre-fill */
  cityName?: string
  /** The city slug for the devis link */
  citySlug?: string
  /** Custom CTA text */
  ctaText?: string
  /** Show provider count for social proof */
  providerCount?: number
  /** Artisan phone number — shows tap-to-call button */
  artisanPhone?: string
  /** Artisan name — for call button aria-label */
  artisanName?: string
}

export default function StickyMobileCTA({
  serviceSlug,
  cityName,
  citySlug,
  ctaText = 'Demander un devis gratuit',
  providerCount,
  artisanPhone,
  artisanName,
}: StickyMobileCTAProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Hide on /devis pages, connected areas, and when estimation widget is open
  const shouldHide =
    pathname.startsWith('/devis') ||
    pathname.startsWith('/espace-client') ||
    pathname.startsWith('/espace-artisan') ||
    pathname.startsWith('/admin')

  // Show after scrolling past hero (~300px)
  useEffect(() => {
    if (shouldHide) return

    const handleScroll = () => {
      const show = window.scrollY > 300
      setVisible(show)
      if (show && !hasAnimated) setHasAnimated(true)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [shouldHide, hasAnimated])

  const openSheet = useCallback(() => {
    trackEvent('form_started', {
      service: serviceSlug || '',
      source: 'sticky_cta',
    })
    setSheetOpen(true)
    // Tell MobileBottomNav we have a modal open
    document.body.setAttribute('data-estimation-open', '')
  }, [serviceSlug])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    document.body.removeAttribute('data-estimation-open')
  }, [])

  if (shouldHide) return null

  // Format phone for tel: link
  const telHref = artisanPhone
    ? `tel:${artisanPhone.replace(/[\s.\-()]/g, '')}`
    : null

  return (
    <>
      {/* ── Sticky CTA Bar ── */}
      <div
        className={`
          fixed left-0 right-0 z-[45] md:hidden
          transition-all duration-300 ease-out
          ${visible && hasAnimated
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}
        style={{
          bottom: '56px', // Above MobileBottomNav (h-14 = 56px)
        }}
      >
        <div
          className="mx-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-sand-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="px-3 pt-2.5 pb-2">
            {/* Social proof line */}
            {providerCount && providerCount > 0 && (
              <p className="text-[11px] text-charcoal-500 text-center mb-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-1 animate-pulse" />
                {providerCount} artisan{providerCount > 1 ? 's' : ''} disponible{providerCount > 1 ? 's' : ''} près de chez vous
              </p>
            )}

            {/* Buttons row */}
            <div className="flex gap-2">
              {/* Tap-to-call (Uber pattern) */}
              {telHref && (
                <a
                  href={telHref}
                  className="flex items-center justify-center w-12 h-12 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation flex-shrink-0"
                  aria-label={`Appeler ${artisanName || 'l\'artisan'}`}
                  onClick={() => {
                    trackEvent('phone_click', {
                      service: serviceSlug || '',
                      source: 'sticky_cta',
                    })
                  }}
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}

              {/* Main CTA — opens bottom sheet on mobile */}
              <button
                onClick={openSheet}
                className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white font-semibold text-sm rounded-xl shadow-cta active:scale-[0.98] transition-all touch-manipulation"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {ctaText}
              </button>
            </div>

            {/* Trust line */}
            <p className="text-[10px] text-charcoal-400 text-center mt-1.5 flex items-center justify-center gap-1">
              <span className="text-accent-500">&#10003;</span> Gratuit
              <span className="text-sand-400">&#183;</span> Sans engagement
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Sheet Form ── */}
      <DevisBottomSheet
        isOpen={sheetOpen}
        onClose={closeSheet}
        prefilledService={serviceSlug}
        prefilledCity={cityName || citySlug}
      />

      {/* ── Scroll Nudge (50% scroll) ── */}
      <ScrollNudge onAction={openSheet} />
    </>
  )
}
