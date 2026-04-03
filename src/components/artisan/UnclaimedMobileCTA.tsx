'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, CheckCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'

interface UnclaimedMobileCTAProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
  weeklyDevisCount?: number
}

export function UnclaimedMobileCTA({
  specialty,
  specialtySlug,
  city,
  citySlug,
  weeklyDevisCount = 0,
}: UnclaimedMobileCTAProps) {
  const [visible, setVisible] = useState(false)

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 p-4 md:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          {/* Social proof */}
          {weeklyDevisCount > 0 && (
            <p className="text-[11px] text-charcoal-500 text-center mb-2">
              <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-1 animate-pulse align-middle" />
              {weeklyDevisCount} devis demandé{weeklyDevisCount > 1 ? 's' : ''} cette semaine
            </p>
          )}

          {/* Main CTA button */}
          <button
            onClick={handleClick}
            className="w-full py-4 px-6 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            Devis gratuit {specialty} {city}
          </button>

          {/* Trust line */}
          <p className="text-[11px] text-charcoal-500 text-center mt-2 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-accent-500 flex-shrink-0" />
            Gratuit - Sans engagement - Réponse rapide
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UnclaimedMobileCTA
