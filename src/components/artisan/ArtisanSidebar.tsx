'use client'

import { useEffect, useState } from 'react'
import { FileText, ShieldCheck, Phone } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { buildDevisHref } from '@/lib/utils'
import { useCompare } from '@/components/compare/CompareProvider'

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
  return buildDevisHref(specialtySlug, artisan.city)
}

interface ArtisanSidebarProps {
  artisan: LegacyArtisan
}

export function ArtisanSidebar({ artisan }: ArtisanSidebarProps) {
  return (
    <div
      className="animate-fade-in-right bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="h-1.5 bg-primary-500" />

      <div className="p-6">
        {/* Status - Disponible */}
        {artisan.accepts_new_clients === true && (
          <div className="flex items-center gap-2 text-accent-700 mb-4 pb-4 border-b border-sand-200">
            <span className="inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
            <span className="text-sm font-semibold">Disponible - Accepte de nouveaux clients</span>
          </div>
        )}

        {/* CTA principal — ancre vers le formulaire #devis (toujours présent
            sur les fiches claimed, seul contexte où la sidebar est rendue) */}
        <div className="space-y-3 mb-5" role="group" aria-label="Actions de contact">
          <button
            onClick={() => {
              trackEvent('artisan_devis_click', {
                artisanId: artisan.id,
                artisanName: artisan.business_name || '',
                source: 'sidebar_devis',
              })
              const devisSection = document.getElementById('devis')
              if (devisSection) {
                devisSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
              } else {
                window.location.href = getDevisUrl(artisan)
              }
            }}
            className="w-full py-4 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta hover:shadow-cta-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Demander un devis"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Demander un devis
          </button>

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

        {/* Vérifications — résumé sidebar, détail complet dans ArtisanBusinessCard */}
        {artisan.is_verified && (
          <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
            <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" />
            <span>Identité vérifiée (SIREN)</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile CTA bar — slides in once the user scrolls past the hero, mutes
// while the compare drawer owns the bottom-0 real estate.
export function ArtisanMobileCTA({ artisan }: ArtisanSidebarProps) {
  const [visible, setVisible] = useState(false)
  const { compareList } = useCompare()
  const muted = compareList.length > 0

  useEffect(() => {
    const threshold = 480
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const active = visible && !muted
  return (
    <div
      className={`fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 p-4 lg:hidden z-40 shadow-sticky-bar transition-transform duration-200 motion-reduce:transition-none ${
        active ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
      role="group"
      aria-label="Actions rapides"
      aria-hidden={!active}
    >
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
          <span className="text-2xs leading-tight mt-0.5">Conseiller</span>
        </a>

        {/* Primary: Devis CTA — ancre vers le formulaire #devis */}
        <button
          onClick={() => {
            trackEvent('artisan_devis_click', {
              artisanId: artisan.id,
              artisanName: artisan.business_name || '',
              source: 'mobile_cta',
            })
            const devisSection = document.getElementById('devis')
            if (devisSection) {
              devisSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
              window.location.href = getDevisUrl(artisan)
            }
          }}
          className="flex-1 py-4 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary-500/25 transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Demander un devis"
        >
          <FileText className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Demander un devis
        </button>
      </div>
    </div>
  )
}
