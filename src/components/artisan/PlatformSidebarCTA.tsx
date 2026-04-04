'use client'

import { motion } from 'framer-motion'
import { Phone, CheckCircle, Clock, Shield } from 'lucide-react'
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
  return (
    <div className="space-y-4">
      {/* Card conseillers */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

        <div className="p-6">
          {/* Branding */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-primary-500" aria-hidden="true" />
            </div>
            <div>
              <span className="font-heading font-bold text-charcoal-900 block leading-tight">ServicesArtisans</span>
              <span className="text-xs text-charcoal-500">Annuaire des artisans en France</span>
            </div>
          </div>

          {/* Value prop */}
          <p className="text-charcoal-700 font-medium mb-1">
            Besoin d&apos;un artisan ?
          </p>
          <p className="text-sm text-charcoal-500 mb-5">
            Nos conseillers vous rappellent gratuitement pour vous orienter.
          </p>

          {/* CTA téléphone */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', { source: 'platform_sidebar' })
            }}
            className="w-full py-3.5 px-5 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 mb-4"
            aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            {PHONE_NUMBER}
          </a>

          {/* Horaires */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-charcoal-500 mb-5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Lun–Ven · 9h–18h
          </div>

          {/* Trust badges */}
          <div className="space-y-2.5 pt-4 border-t border-sand-200">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
              100% gratuit
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
              Sans engagement
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
              Conseillers disponibles
            </div>
          </div>
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
