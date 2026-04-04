'use client'

import { Mail, FileText, ShieldCheck, Star, Users } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'

interface ArtisanContactCardProps {
  artisan: LegacyArtisan
  isClaimed?: boolean
}

export function ArtisanContactCard({ artisan, isClaimed = false }: ArtisanContactCardProps) {
  const hasEmail = isClaimed && !!artisan.email

  return (
    <div className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden">
      {/* Terracotta accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-600" />

      <div className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 font-heading mb-4">Contacter cet artisan</h3>

        {/* Availability + rating row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {artisan.accepts_new_clients === true && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
              </span>
              <span className="text-xs font-semibold text-accent-700">Disponible</span>
            </div>
          )}
          {artisan.average_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-charcoal-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
              <span className="font-semibold text-charcoal-900">{artisan.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* 1. Devis gratuit - CTA MASSIF primary */}
          <button
            type="button"
            onClick={() => {
              trackEvent('artisan_devis_click' as any, { artisanId: artisan.id, artisanName: artisan.business_name || '', artisan_slug: artisan.slug, source: 'contact_card' })
              const devisSection = document.getElementById('devis')
              if (devisSection) {
                devisSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-full py-4 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 group"
          >
            <FileText className="w-5 h-5 transition-transform group-hover:scale-110" aria-hidden="true" />
            Devis gratuit en 2 min
          </button>

          {/* Trust reassurance */}
          <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-accent-500" aria-hidden="true" />
              2 conseillers dispo
            </span>
            <span className="text-charcoal-300" aria-hidden="true">·</span>
            <span>Gratuit</span>
            <span className="text-charcoal-300" aria-hidden="true">·</span>
            <span>Sans engagement</span>
          </div>

          {/* 2. Email — only for claimed artisans (RGPD: no PII without consent) */}
          {hasEmail && (
            <a
              href={`mailto:${artisan.email}`}
              onClick={() => {
                trackEvent('artisan_email_click' as any, { artisanId: artisan.id, artisanName: artisan.business_name || '', artisan_slug: artisan.slug, source: 'contact_card' })
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium flex items-center justify-center gap-2.5 hover:border-charcoal-300 hover:bg-sand-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2 group"
              aria-label={`Envoyer un email à ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-charcoal-400 transition-colors group-hover:text-charcoal-600" aria-hidden="true" />
              Envoyer un email
            </a>
          )}

          {/* Unclaimed artisan: generic CTA instead of PII */}
          {!isClaimed && (
            <p className="text-sm text-charcoal-500 text-center">
              Contactez cet artisan via notre formulaire de devis ci-dessus.
            </p>
          )}

        </div>

        {/* Trust footer */}
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-sand-200">
          <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-charcoal-500">
            Service gratuit - Données protégées (RGPD) - Sans engagement
          </span>
        </div>
      </div>
    </div>
  )
}
