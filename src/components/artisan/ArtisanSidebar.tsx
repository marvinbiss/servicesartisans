'use client'

import { Mail, FileText, ShieldCheck, Phone, Users } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getDevisUrl(artisan: LegacyArtisan): string {
  const specialtySlug = artisan.specialty ? slugify(artisan.specialty) : 'artisan'
  const citySlug = artisan.city ? slugify(artisan.city) : ''
  return `/services/${specialtySlug}/${citySlug}`
}

interface ArtisanSidebarProps {
  artisan: LegacyArtisan
}

export function ArtisanSidebar({ artisan }: ArtisanSidebarProps) {
  const handleEmail = () => {
    if (artisan.email) {
      trackEvent('artisan_email_click', {
        artisanId: artisan.id,
        artisanName: artisan.business_name || '',
        source: 'sidebar',
      })
      window.location.href = `mailto:${artisan.email}`
    }
  }

  return (
    <div
      className="animate-fade-in-right bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Terracotta gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      <div className="p-6">
        {/* Status - Disponible */}
        {artisan.accepts_new_clients === true && (
          <div className="flex items-center gap-2 text-accent-700 mb-4 pb-4 border-b border-sand-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
            </span>
            <span className="text-sm font-semibold">Disponible - Accepte de nouveaux clients</span>
          </div>
        )}

        {/* CTA principal - MASSIF */}
        <div className="space-y-3 mb-5" role="group" aria-label="Actions de contact">
          <button
            onClick={() => {
              trackEvent('artisan_devis_click', {
                artisanId: artisan.id,
                artisanName: artisan.business_name || '',
                source: 'sidebar_devis',
              })
              window.location.href = getDevisUrl(artisan)
            }}
            className="w-full py-4 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Devis gratuit en 2 min"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Devis gratuit en 2 min
          </button>

          {/* Trust reassurance under CTA */}
          <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-accent-500" aria-hidden="true" />2 conseillers dispo
            </span>
            <span className="text-charcoal-300" aria-hidden="true">
              ·
            </span>
            <span>Gratuit</span>
            <span className="text-charcoal-300" aria-hidden="true">
              ·
            </span>
            <span>Sans engagement</span>
          </div>

          {artisan.email && (
            <button
              onClick={handleEmail}
              className="w-full py-3 px-4 rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium flex items-center justify-center gap-2 hover:border-charcoal-300 hover:bg-sand-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-2"
              aria-label={`Envoyer un email à ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-charcoal-400" aria-hidden="true" />
              Envoyer un email
            </button>
          )}

          {/* Platform phone — always available */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', {
                artisanId: artisan.id,
                source: 'sidebar_platform_phone',
              })
            }}
            className="w-full py-3 px-4 rounded-xl border-2 border-accent-200 bg-accent-50 text-accent-700 font-medium flex flex-col items-center gap-1 hover:border-accent-300 hover:bg-accent-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            aria-label="Appeler un conseiller ServicesArtisans"
          >
            <span className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-accent-500" />
              Conseiller dispo · {PHONE_NUMBER}
            </span>
            <span className="text-xs text-charcoal-400 font-normal">
              Aide gratuite pour votre projet
            </span>
          </a>
        </div>

        {/* Trust badges */}
        <div className="space-y-2.5 mb-5 pb-5 border-b border-sand-200">
          <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
            Vérifications
          </h4>
          {artisan.is_verified && (
            <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
              <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" />
              <span>Identité vérifiée (SIREN)</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <Users className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span>Devis 100% gratuit, sans engagement</span>
          </div>
        </div>

        {/* Urgency nudge */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-amber-800 font-medium">
            <span className="font-bold">Conseil :</span> les artisans disponibles reçoivent beaucoup
            de demandes. Envoyez votre devis maintenant pour obtenir une réponse rapide.
          </p>
        </div>

        {/* SIRET */}
        {artisan.siret && (
          <div className="pt-2">
            <div className="text-xs text-charcoal-400 font-mono">SIRET : {artisan.siret}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile CTA bar -- Single dominant CTA, ALWAYS visible
export function ArtisanMobileCTA({ artisan }: ArtisanSidebarProps) {
  return (
    <div
      className="animate-fade-in-up fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 p-4 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="group"
      aria-label="Actions rapides"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Primary row: Phone + Devis CTA */}
        <div className="flex gap-2 w-full">
          {/* Tap-to-call platform */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', {
                artisanId: artisan.id,
                source: 'mobile_cta_platform_phone',
              })
            }}
            className="flex flex-col items-center justify-center w-14 h-12 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation flex-shrink-0"
            aria-label="Appeler un conseiller ServicesArtisans"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[9px] leading-tight mt-0.5">Conseiller</span>
          </a>

          {/* Primary: Devis CTA - MASSIF */}
          <button
            onClick={() => {
              trackEvent('artisan_devis_click', {
                artisanId: artisan.id,
                artisanName: artisan.business_name || '',
                source: 'mobile_cta',
              })
              window.location.href = getDevisUrl(artisan)
            }}
            className="flex-1 py-4 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary-600/25 transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Devis gratuit en 2 min"
          >
            <FileText className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            Devis gratuit en 2 min
          </button>
        </div>

        {/* Trust line under CTA */}
        <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-accent-500" aria-hidden="true" />2 conseillers dispo
          </span>
          <span className="text-charcoal-300" aria-hidden="true">
            ·
          </span>
          <span>Gratuit</span>
          <span className="text-charcoal-300" aria-hidden="true">
            ·
          </span>
          <span>Sans engagement</span>
        </div>
      </div>
    </div>
  )
}
