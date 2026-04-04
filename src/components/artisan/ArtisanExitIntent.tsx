'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import type { LegacyArtisan } from '@/types/legacy'
import { getDisplayName } from '@/components/artisan/types'
import { trackEvent } from '@/lib/analytics/tracking'

const SESSION_KEY = 'sa:exit-intent-shown'
const AUTO_DISMISS_MS = 10_000
const MOBILE_IDLE_MS = 45_000

interface ArtisanExitIntentProps {
  artisan: LegacyArtisan
  onOpenEstimation: () => void
  isClaimed?: boolean
  specialty?: string
  city?: string
  specialtySlug?: string
  citySlug?: string
}

export function ArtisanExitIntent({
  artisan,
  onOpenEstimation,
  isClaimed = true,
  specialty,
  city,
}: ArtisanExitIntentProps) {
  const [visible, setVisible] = useState(false)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shouldSuppress = useCallback(() => {
    if (typeof window === 'undefined') return true
    if (sessionStorage.getItem(SESSION_KEY)) return true
    if (document.body.hasAttribute('data-estimation-open')) return true
    return false
  }, [])

  const show = useCallback(() => {
    if (shouldSuppress()) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(true)
  }, [shouldSuppress])

  const close = useCallback(() => {
    setVisible(false)
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }, [])

  const handleCTA = useCallback(() => {
    close()
    if (isClaimed) {
      onOpenEstimation()
    } else {
      trackEvent('unclaimed_exit_intent_click', { specialty, city })
      const devisSection = document.getElementById('devis')
      if (devisSection) {
        devisSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [close, isClaimed, onOpenEstimation, specialty, city])

  // Auto-dismiss after 10s
  useEffect(() => {
    if (!visible) return
    dismissTimer.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [visible])

  // Desktop: mouseleave at top of viewport
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (isMobile) return

    const handler = (e: MouseEvent) => {
      if (e.clientY < 10) show()
    }
    document.addEventListener('mouseleave', handler)
    return () => document.removeEventListener('mouseleave', handler)
  }, [show])

  // Mobile: 45s idle timer, reset on scroll/touch
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (!isMobile) return

    const resetTimer = () => {
      if (mobileTimer.current) clearTimeout(mobileTimer.current)
      mobileTimer.current = setTimeout(show, MOBILE_IDLE_MS)
    }

    resetTimer()
    window.addEventListener('scroll', resetTimer, { passive: true })
    window.addEventListener('touchstart', resetTimer, { passive: true })

    return () => {
      if (mobileTimer.current) clearTimeout(mobileTimer.current)
      window.removeEventListener('scroll', resetTimer)
      window.removeEventListener('touchstart', resetTimer)
    }
  }, [show])

  const displayName = getDisplayName(artisan)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100%-2rem)] max-w-sm"
          role="complementary"
          aria-label="Estimation gratuite"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200/60 p-5 relative">
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-sand-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {isClaimed ? (
              <>
                {/* Claimed: existing content */}
                <p className="text-sm font-medium text-slate-500 mb-1">Avant de partir...</p>
                <p className="text-base font-semibold text-gray-900 font-heading mb-2 pr-6">
                  {displayName}
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  Obtenez votre estimation gratuite en 30 secondes
                </p>
                <button
                  onClick={handleCTA}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-clay-400 to-clay-500 text-white text-sm font-semibold rounded-xl hover:from-clay-500 hover:to-clay-600 transition-all shadow-md shadow-glow-clay"
                >
                  Estimer mon projet
                </button>
                <a
                  href={PHONE_TEL}
                  className="mt-2 w-full py-2 px-4 border border-accent-200 bg-accent-50 text-accent-700 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 hover:bg-accent-100 transition-all"
                  aria-label="Appeler"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  {PHONE_NUMBER}
                </a>
              </>
            ) : (
              <>
                {/* Unclaimed: generic content métier+ville */}
                <p className="text-sm font-medium text-slate-500 mb-1">Vous partez ?</p>
                <p className="text-base font-semibold text-gray-900 font-heading mb-2 pr-6">
                  Un {specialty} à {city} peut vous rappeler gratuitement
                </p>
                <button
                  onClick={handleCTA}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-clay-400 to-clay-500 text-white text-sm font-semibold rounded-xl hover:from-clay-500 hover:to-clay-600 transition-all shadow-md shadow-glow-clay"
                >
                  Être rappelé gratuitement
                </button>
                <a
                  href={PHONE_TEL}
                  className="mt-2 w-full py-2 px-4 border border-accent-200 bg-accent-50 text-accent-700 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 hover:bg-accent-100 transition-all"
                  aria-label="Appeler"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  {PHONE_NUMBER}
                </a>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
