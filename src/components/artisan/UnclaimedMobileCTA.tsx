'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, CheckCircle, Phone, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

const URGENCY_TRADES = ['plombier', 'serrurier', 'electricien', 'chauffagiste', 'vitrier', 'depanneur']
const DISMISS_KEY = 'unclaimed-cta-dismissed'

interface UnclaimedMobileCTAProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
  weeklyDevisCount?: number
  isUrgencyTrade?: boolean
}

export function UnclaimedMobileCTA({
  specialty,
  specialtySlug,
  city,
  citySlug,
  weeklyDevisCount = 0,
  isUrgencyTrade = false,
}: UnclaimedMobileCTAProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isUrgent = isUrgencyTrade || URGENCY_TRADES.includes(specialtySlug)

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === 'true') {
      setDismissed(true)
    }
  }, [])

  // Show after scrolling past 45% of the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return
      const scrollPercent = (window.scrollY / scrollHeight) * 100
      setVisible(scrollPercent >= 45)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial position in case the page is already scrolled
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, 'true')
    }
  }, [])

  const handleClick = useCallback(() => {
    trackEvent('unclaimed_devis_click', {
      source: 'mobile_cta',
      specialty,
      specialtySlug,
      city,
      citySlug,
    })

    const devisSection = document.getElementById('devis')
    if (devisSection) {
      devisSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [specialty, specialtySlug, city, citySlug])

  const handlePhoneClick = useCallback(() => {
    trackEvent('phone_click', {
      source: 'unclaimed_mobile_cta',
      specialty,
      city,
    })
  }, [specialty, city])

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 p-4 md:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 min-w-[44px] min-h-[44px] rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition-colors flex items-center justify-center"
            aria-label="Fermer le bandeau"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Social proof */}
          {weeklyDevisCount > 0 && (
            <p className="text-[11px] text-charcoal-500 text-center mb-2 pr-8">
              <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-1 animate-pulse align-middle" />
              {weeklyDevisCount} demande{weeklyDevisCount > 1 ? 's' : ''} cette semaine à proximité
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <>
                {/* Urgent: 50/50 split — phone PRIMARY + devis SECONDARY */}
                <a
                  href={PHONE_TEL}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold text-base rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation"
                  aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
                  onClick={handlePhoneClick}
                >
                  <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  Appeler
                </a>
                <button
                  onClick={handleClick}
                  className="flex-1 h-12 px-4 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base active:scale-[0.96] transition-all touch-manipulation flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  Être rappelé
                </button>
              </>
            ) : (
              <>
                {/* Non-urgent: small square phone button + large devis button */}
                <a
                  href={PHONE_TEL}
                  className="w-12 h-12 flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation flex-shrink-0"
                  aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
                  onClick={handlePhoneClick}
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </a>
                <button
                  onClick={handleClick}
                  className="flex-1 h-12 px-6 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  Être rappelé gratuitement
                </button>
              </>
            )}
          </div>

          {/* Trust line */}
          <p className="text-[11px] text-charcoal-500 text-center mt-2 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-accent-500 flex-shrink-0" aria-hidden="true" />
            Gratuit - Sans engagement - Réponse rapide
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UnclaimedMobileCTA
