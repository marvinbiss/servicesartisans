'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

export function PlatformStickyBar() {
  const [dismissed, setDismissed] = useState(false)
  const [urgencyText, setUrgencyText] = useState('')

  // Rotating urgency microcopy — changes every 4s
  useEffect(() => {
    const texts = [
      'Réponse en moins de 2 min',
      'Appel 100% gratuit',
      '2 conseillers disponibles',
      'On vous trouve un pro maintenant',
    ]
    let i = 0
    setUrgencyText(texts[0])
    const interval = setInterval(() => {
      i = (i + 1) % texts.length
      setUrgencyText(texts[i])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (dismissed) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40"
      role="complementary"
      aria-label="Contacter un conseiller"
    >
      {/* Gradient shadow above */}
      <div className="h-6 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />

      <div className="bg-white border-t border-sand-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        {/* Urgency ticker */}
        <div className="bg-accent-500 text-white text-center py-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={urgencyText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold"
            >
              {urgencyText}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-charcoal-900 leading-tight">
                Besoin d&apos;un artisan ?
              </p>
              <p className="text-xs text-charcoal-500 leading-tight">
                <span className="hidden sm:inline">
                  Un conseiller vous trouve un pro disponible · Gratuit
                </span>
                <span className="sm:hidden">On vous rappelle · Gratuit</span>
              </p>
            </div>

            {/* CTA */}
            <motion.a
              href={PHONE_TEL}
              onClick={() => {
                trackEvent('phone_click', { source: 'platform_sticky_bar' })
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 py-3 px-6 bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-accent-500/30 transition-all duration-200 touch-manipulation flex-shrink-0"
              aria-label={`Appeler au ${PHONE_NUMBER}`}
            >
              <Phone className="w-4.5 h-4.5" aria-hidden="true" />
              <span className="hidden sm:inline">Appeler</span>
              <span className="sm:hidden">Appeler</span>
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
