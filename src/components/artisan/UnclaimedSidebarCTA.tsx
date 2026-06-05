'use client'

import { CheckCircle, Phone, Wrench, ArrowRight } from 'lucide-react'
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
  onDevisClick: () => void
}

export function UnclaimedSidebarCTA({
  specialty,
  city,
  providerId,
  providerName,
  hasSiret,
  onDevisClick,
}: UnclaimedSidebarCTAProps) {
  return (
    <div
      className="animate-fade-in-right bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      <div className="p-6">
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-primary-500" aria-hidden="true" />
          </div>
          <span className="font-heading font-bold text-charcoal-900">ServicesArtisans</span>
        </div>

        {/* Title */}
        <p className="text-charcoal-700 font-medium mb-1">
          Besoin d&apos;un {specialty.toLowerCase()} à {city} ?
        </p>
        <p className="text-sm text-charcoal-500 mb-5">Devis gratuit et sans engagement.</p>

        {/* CTA principal */}
        <button
          onClick={() => {
            trackEvent('unclaimed_sidebar_devis_click', { specialty, city })
            trackEvent('artisan_devis_click', { source: 'unclaimed_sidebar', specialty, city })
            onDevisClick()
          }}
          className="w-full py-3.5 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 mb-4"
          aria-label="Demander un devis gratuit"
        >
          Devis gratuit
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Click-to-call */}
        <a
          href={PHONE_TEL}
          onClick={() => {
            trackEvent('unclaimed_sidebar_phone_click', { specialty, city })
            trackEvent('phone_click', { source: 'unclaimed_sidebar', specialty, city })
          }}
          className="w-full py-3 px-4 rounded-xl border-2 border-sand-200 bg-sand-50 text-charcoal-700 font-medium flex items-center justify-center gap-2 hover:border-sand-300 hover:bg-sand-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 mb-1"
          aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
        >
          <Phone className="w-4 h-4 text-primary-500" aria-hidden="true" />
          {PHONE_NUMBER}
        </a>
        <p className="text-xs text-charcoal-400 text-center mb-5">Appel gratuit</p>

        {/* Trust badges */}
        <div className="space-y-2 mb-5 pb-5 border-b border-sand-200">
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
            Artisans RGE certifiés
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
            Sans engagement
          </div>
        </div>

        {/* Section artisan - Claim */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
            Vous êtes ce professionnel ?
          </h4>
          <ClaimButton providerId={providerId} providerName={providerName} hasSiret={hasSiret} />
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
