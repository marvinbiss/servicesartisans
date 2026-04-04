'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowRight, Wrench } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

interface UnclaimedStickyBarProps {
  specialty: string
  city: string
  onDevisClick: () => void
}

const HIDDEN_PATHS = ['/admin', '/espace-artisan', '/espace-client', '/devis']

export function UnclaimedStickyBar({ specialty, city, onDevisClick }: UnclaimedStickyBarProps) {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  // Hide on admin/dashboard/devis pages
  const isHiddenPage = HIDDEN_PATHS.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    if (isHiddenPage) return

    const handleScroll = () => {
      setVisible(window.scrollY >= 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHiddenPage])

  if (isHiddenPage) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[51] bg-white border-t border-sand-200 shadow-lg"
        >
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center gap-3 text-charcoal-700">
              <Wrench className="w-5 h-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-sm">
                ServicesArtisans vous trouve un {specialty.toLowerCase()} a {city}
              </span>
              <span className="text-sand-300" aria-hidden="true">|</span>
              <span className="text-sm text-charcoal-500">
                Jusqu&apos;a 3 devis gratuits sous 24h
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={PHONE_TEL}
                onClick={() => trackEvent('phone_click', { source: 'unclaimed_sticky_bar_desktop', specialty, city })}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium text-sm hover:border-sand-400 hover:bg-sand-50 transition-all duration-200"
                aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {PHONE_NUMBER}
              </a>
              <button
                onClick={() => {
                  trackEvent('unclaimed_devis_click', { source: 'unclaimed_sticky_bar_desktop', specialty, city })
                  onDevisClick()
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-sm shadow-cta transition-all duration-200"
              >
                Devis gratuit
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden px-4 py-3">
            <p className="text-xs text-charcoal-600 text-center mb-2.5 font-medium">
              ServicesArtisans · {specialty} a {city}
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href={PHONE_TEL}
                onClick={() => trackEvent('phone_click', { source: 'unclaimed_sticky_bar_mobile', specialty, city })}
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border-2 border-sand-300 text-charcoal-700 font-semibold text-sm hover:border-sand-400 hover:bg-sand-50 transition-all duration-200"
                aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Appeler
              </a>
              <button
                onClick={() => {
                  trackEvent('unclaimed_devis_click', { source: 'unclaimed_sticky_bar_mobile', specialty, city })
                  onDevisClick()
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-sm shadow-cta transition-all duration-200"
              >
                Devis gratuit
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
