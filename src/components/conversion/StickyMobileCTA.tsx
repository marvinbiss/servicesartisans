'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { FileText, Phone } from 'lucide-react'
import { PHONE_TEL } from '@/lib/seo/config'
import { trackEvent } from '@/lib/analytics/tracking'
import { getClientPortrait } from '@/lib/data/images-faces'
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
  ctaText = 'Demandez votre devis maintenant',
  providerCount,
  artisanPhone,
  artisanName,
}: StickyMobileCTAProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formInView, setFormInView] = useState(false)

  // Hide on /devis pages, connected areas, and when estimation widget is open
  const shouldHide =
    pathname.startsWith('/devis') ||
    pathname.startsWith('/espace-client') ||
    pathname.startsWith('/espace-artisan') ||
    pathname.startsWith('/admin')

  // Hide when a devis form/section is visible in the viewport
  useEffect(() => {
    if (shouldHide) return

    const selectors = ['[data-devis-form]', '#devis', '#devis-section', 'form[data-devis]']

    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting)
        setFormInView(anyVisible)
      },
      { threshold: 0.1 }
    )

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => observer.observe(el))
      })
    }, 500)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [shouldHide])

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

  // Track phone_reveal once when CTA becomes visible with an artisan phone
  const phoneRevealTracked = useRef(false)
  useEffect(() => {
    if (visible && artisanPhone && !phoneRevealTracked.current) {
      phoneRevealTracked.current = true
      trackEvent('phone_reveal', {
        artisanName: artisanName || '',
        source: 'sticky_cta',
        value: 5,
        currency: 'EUR',
      })
    }
  }, [visible, artisanPhone, artisanName])

  if (shouldHide) return null

  // Format phone for tel: link
  const telHref = artisanPhone ? `tel:${artisanPhone.replace(/[\s.\-()]/g, '')}` : PHONE_TEL

  // Build desktop devis link with pre-filled params
  const devisHref =
    serviceSlug && citySlug
      ? `/services/${serviceSlug}/${citySlug}`
      : serviceSlug
        ? `/devis/${serviceSlug}`
        : '/devis'

  return (
    <>
      {/* ── Sticky CTA Bar (mobile only) ── */}
      <div
        className={`
          fixed left-0 right-0 z-sticky-cta md:hidden
          transition-all duration-300 ease-out
          ${
            visible && hasAnimated && !formInView
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}
        style={{
          bottom: '56px', // Above MobileBottomNav (h-14 = 56px)
        }}
      >
        <div
          className="mx-0 bg-white shadow-sticky-bar border-t border-sand-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="px-3 pt-2.5 pb-2">
            {/* Social proof line with avatar stack */}
            {providerCount && providerCount > 0 && (
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={getClientPortrait(i).src}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full border border-white object-cover"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-charcoal-500">
                  <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-1 animate-pulse" />
                  {providerCount} artisan{providerCount > 1 ? 's' : ''} disponible
                  {providerCount > 1 ? 's' : ''} près de chez vous
                </p>
              </div>
            )}

            {/* Buttons row */}
            <div className="flex gap-2">
              {/* Tap-to-call (Uber pattern) */}
              {telHref && (
                <a
                  href={telHref}
                  className="flex items-center justify-center w-12 h-12 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation flex-shrink-0"
                  aria-label={
                    artisanPhone
                      ? `Appeler ${artisanName || "l'artisan"}`
                      : 'Appeler ServicesArtisans'
                  }
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

      {/* ── Sticky Desktop CTA (desktop only) ── */}
      <div
        className={`
          fixed bottom-6 right-6 z-sticky-cta hidden md:block
          transition-all duration-300 ease-out
          ${
            visible && hasAnimated && !formInView
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0 pointer-events-none'
          }
        `}
      >
        <a
          href={devisHref}
          onClick={() => {
            trackEvent('form_started', {
              service: serviceSlug || '',
              source: 'sticky_desktop_cta',
            })
          }}
          className="group flex items-center gap-3 bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white font-semibold px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all"
        >
          <FileText className="w-5 h-5 flex-shrink-0" />
          <span className="text-base">{ctaText}</span>
        </a>
        <p className="text-xs text-charcoal-400 text-center mt-2 flex items-center justify-center gap-1">
          <span className="text-accent-500">&#10003;</span> Gratuit
          <span className="text-sand-400">&#183;</span> Sans engagement
        </p>
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
