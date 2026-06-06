'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle, Clock, Zap, Users, ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER, ADVISORS_LABEL } from '@/lib/seo/config'
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
      <div
        className="animate-fade-in-right bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
        style={{ animationDelay: '0.2s' }}
      >
        {/* Urgency header */}
        <div className="bg-accent-500 px-5 py-3 flex items-center gap-2">
          <span className="inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          <span className="text-white text-sm font-bold">{ADVISORS_LABEL}</span>
        </div>

        <div className="p-5">
          {/* Headline */}
          <h3 className="text-lg font-bold text-charcoal-900 font-heading leading-tight mb-1">
            Besoin d&apos;un artisan ?
          </h3>
          <p className="text-sm text-charcoal-600 mb-5">
            Un conseiller vous trouve un professionnel disponible et vous rappelle en moins de 2
            minutes.
          </p>

          {/* CTA téléphone — MASSIF */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', { source: 'platform_sidebar' })
            }}
            className={`w-full py-4 px-5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-accent-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 mb-2 ${shouldPulse ? 'animate-pulse' : ''}`}
            aria-label={`Appeler au ${PHONE_NUMBER}`}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            Parler à un conseiller
          </a>
          <p className="text-center text-xs text-charcoal-500 mb-1">{PHONE_NUMBER}</p>

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
                <span>
                  <strong>100% gratuit</strong> — sans engagement
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
                <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                </div>
                <span>
                  Artisans <strong>vérifiés SIREN</strong> dans 96 départements
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
                <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                </div>
                <span>
                  Rappel en <strong>moins de 2 min</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Urgency nudge */}
        <div className="px-5 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <p className="text-xs text-amber-800 font-medium text-center">
              Les artisans disponibles reçoivent beaucoup de demandes — contactez-nous maintenant
            </p>
          </div>
        </div>

        {/* Bottom CTA secondary — pour ceux qui ne veulent pas appeler */}
        <div className="border-t border-sand-200 bg-sand-50 px-5 py-3">
          <Link
            href="/devis"
            onClick={() => {
              trackEvent('artisan_devis_click', { source: 'platform_sidebar_secondary' })
            }}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
          >
            Ou demandez un devis en ligne
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Card claim */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5">
        <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
          Vous êtes ce professionnel ?
        </h4>
        <div className="space-y-3">
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
