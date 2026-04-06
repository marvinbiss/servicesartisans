'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, CheckCircle, Clock, Zap, Users, ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { ClaimButton } from '@/components/artisan/ClaimButton'
import { RemovalRequestButton } from '@/components/artisan/RemovalRequestButton'

interface PlatformSidebarCTAProps {
  providerId: string
  providerName: string
  hasSiret: boolean
}

export function PlatformSidebarCTA({
  providerId,
  providerName,
  hasSiret,
}: PlatformSidebarCTAProps) {
  const [shouldPulse, setShouldPulse] = useState(false)

  // Pulse CTA every 6s for attention
  useEffect(() => {
    const interval = setInterval(() => {
      setShouldPulse(true)
      setTimeout(() => setShouldPulse(false), 800)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Card principale — conversion */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      >
        {/* Urgency header */}
        <div className="bg-accent-500 px-5 py-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-white text-sm font-bold">2 conseillers disponibles</span>
        </div>

        <div className="p-5">
          {/* Headline */}
          <h3 className="text-lg font-bold text-charcoal-900 font-heading leading-tight mb-1">
            Besoin d&apos;un artisan ?
          </h3>
          <p className="text-sm text-charcoal-600 mb-5">
            Un conseiller vous trouve un professionnel disponible et vous rappelle en moins de 2 minutes.
          </p>

          {/* CTA téléphone — MASSIF */}
          <motion.a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', { source: 'platform_sidebar' })
            }}
            animate={shouldPulse ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 10px 25px rgba(16, 185, 129, 0.3)',
                '0 10px 40px rgba(16, 185, 129, 0.5)',
                '0 10px 25px rgba(16, 185, 129, 0.3)',
              ],
            } : {}}
            transition={shouldPulse ? { duration: 0.8, ease: 'easeInOut' } : {}}
            className="w-full py-4 px-5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-accent-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 mb-2"
            aria-label={`Appeler au ${PHONE_NUMBER}`}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            Appeler · {PHONE_NUMBER}
          </motion.a>

          {/* Horaires */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-charcoal-500 mb-4">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Lun–Dim · 8h–20h · Appel gratuit
          </div>

          {/* Separator */}
          <div className="border-t border-sand-200 pt-4">
            {/* Social proof */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
                <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                </div>
                <span><strong>Gratuit</strong> et sans engagement</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
                <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                </div>
                <span>Artisans <strong>vérifiés SIRET</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
                <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                </div>
                <span>Rappel en <strong>moins de 2 min</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA secondary — pour ceux qui ne veulent pas appeler */}
        <div className="border-t border-sand-200 bg-sand-50 px-5 py-3">
          <a
            href="/devis"
            onClick={() => {
              trackEvent('artisan_devis_click', { source: 'platform_sidebar_secondary' })
            }}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
          >
            Ou demandez un devis en ligne
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </motion.div>

      {/* Card claim */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5">
        <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
          Vous êtes ce professionnel ?
        </h4>
        <div className="space-y-3">
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
    </div>
  )
}
