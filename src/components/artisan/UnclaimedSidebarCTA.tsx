'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, CheckCircle, ShieldCheck, Users, ArrowRight, Phone } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { ClaimButton } from '@/components/artisan/ClaimButton'
import { RemovalRequestButton } from '@/components/artisan/RemovalRequestButton'

interface UnclaimedSidebarCTAProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
  weeklyDevisCount?: number
  providerId: string
  providerName: string
  hasSiret: boolean
}

export function UnclaimedSidebarCTA({
  specialty,
  specialtySlug,
  city,
  citySlug,
  weeklyDevisCount = 0,
  providerId,
  providerName,
  hasSiret,
}: UnclaimedSidebarCTAProps) {
  const [shouldPulse, setShouldPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldPulse(true)
      setTimeout(() => setShouldPulse(false), 600)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleDevisClick = () => {
    trackEvent('artisan_devis_click', {
      source: 'unclaimed_sidebar',
      specialty,
      city,
    })

    const devisSection = document.getElementById('devis')
    if (devisSection) {
      devisSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      <div className="p-6">
        {/* Social proof */}
        {weeklyDevisCount > 0 && (
          <div className="flex items-center gap-2 text-charcoal-700 mb-4 pb-4 border-b border-sand-200">
            <Users className="w-4 h-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {weeklyDevisCount} demande{weeklyDevisCount > 1 ? 's' : ''} cette semaine à {city}
            </span>
          </div>
        )}

        {/* CTA principal */}
        <div className="space-y-3 mb-5" role="group" aria-label="Être rappelé gratuitement">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={shouldPulse ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 10px 25px rgba(232, 107, 75, 0.3)',
                '0 10px 35px rgba(232, 107, 75, 0.5)',
                '0 10px 25px rgba(232, 107, 75, 0.3)',
              ],
            } : {}}
            transition={shouldPulse ? { duration: 0.6, ease: 'easeInOut' } : {}}
            onClick={handleDevisClick}
            className="w-full py-4 px-5 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            aria-label="Être rappelé gratuitement"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Être rappelé gratuitement
          </motion.button>

          {/* Click-to-call */}
          <a
            href={PHONE_TEL}
            onClick={() => trackEvent('phone_click', { source: 'unclaimed_sidebar', specialty, city })}
            className="w-full py-3 px-4 rounded-xl border-2 border-accent-200 bg-accent-50 text-accent-700 font-medium flex items-center justify-center gap-2 hover:border-accent-300 hover:bg-accent-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            aria-label="Appeler ServicesArtisans"
          >
            <Phone className="w-5 h-5 text-accent-500" aria-hidden="true" />
            Appeler · {PHONE_NUMBER}
          </a>
          <p className="text-xs text-charcoal-400 text-center">
            Un conseiller vous répond · Gratuit
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-accent-500" aria-hidden="true" />
              Artisans vérifiés
            </span>
            <span className="text-charcoal-300" aria-hidden="true">·</span>
            <span>Gratuit</span>
            <span className="text-charcoal-300" aria-hidden="true">·</span>
            <span>Sans engagement</span>
          </div>
        </div>

        {/* Lien listing */}
        <div className="mb-5 pb-5 border-b border-sand-200">
          <a
            href={`/services/${specialtySlug}/${citySlug}`}
            onClick={() => {
              trackEvent('artisan_listing_click', {
                source: 'unclaimed_sidebar',
                specialty,
                city,
              })
            }}
            className="group flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-700 transition-colors duration-200"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Voir tous les {specialty}s à {city}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        {/* Section artisan - Claim */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
            Vous êtes cet artisan ?
          </h4>
          <ClaimButton
            providerId={providerId}
            providerName={providerName}
            hasSiret={hasSiret}
          />
          <RemovalRequestButton
            providerId={providerId}
            providerName={providerName}
            hasSiret={hasSiret}
          />
        </div>
      </div>
    </motion.div>
  )
}
