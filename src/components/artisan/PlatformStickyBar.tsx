'use client'

import { motion } from 'framer-motion'
import { Phone, Shield } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

export function PlatformStickyBar() {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 px-4 py-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="complementary"
      aria-label="Contacter ServicesArtisans"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary-500" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-charcoal-900 leading-tight truncate">
              ServicesArtisans
            </p>
            <p className="text-xs text-charcoal-500 leading-tight hidden sm:block">
              Un conseiller vous répond gratuitement
            </p>
            <p className="text-xs text-charcoal-500 leading-tight sm:hidden">
              Conseiller gratuit
            </p>
          </div>
        </div>

        {/* Right: CTA phone */}
        <a
          href={PHONE_TEL}
          onClick={() => {
            trackEvent('phone_click', { source: 'platform_sticky_bar' })
          }}
          className="flex items-center gap-2 py-2.5 px-5 bg-primary-400 hover:bg-primary-600 text-white font-bold text-sm rounded-xl shadow-cta transition-all duration-200 active:scale-[0.97] touch-manipulation flex-shrink-0"
          aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{PHONE_NUMBER}</span>
          <span className="sm:hidden">Appeler</span>
        </a>
      </div>
    </motion.div>
  )
}
