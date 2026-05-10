'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Phone, FileText, Users } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER, ADVISORS_LABEL, ADVISORS_COUNT } from '@/lib/seo/config'

interface UnclaimedStickyBarProps {
  specialty: string
  city: string
  onDevisClick: () => void
  /**
   * Tel artisan ADEME — affiché si RGE actif (registre RGE Etalab 2.0).
   * Si absent ou RGE non actif, on garde le tel plateforme (PHONE_TEL).
   */
  artisanPhone?: string | null
  artisanName?: string
  isRgeActive?: boolean
  artisanId?: string
}

const HIDDEN_PATHS = ['/admin', '/espace-artisan', '/espace-client', '/devis']

function formatFrenchPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  const local = digits.startsWith('+33')
    ? '0' + digits.slice(3)
    : digits.startsWith('33') && digits.length === 11
      ? '0' + digits.slice(2)
      : digits
  if (local.length !== 10) return raw
  return local.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
}

export function UnclaimedStickyBar({
  specialty,
  city,
  onDevisClick,
  artisanPhone,
  artisanName,
  isRgeActive = false,
  artisanId,
}: UnclaimedStickyBarProps) {
  const cleanArtisanPhone = artisanPhone?.replace(/[^\d+]/g, '') ?? ''
  const useArtisanPhone = isRgeActive && cleanArtisanPhone.length >= 10
  const phoneHref = useArtisanPhone ? `tel:${cleanArtisanPhone}` : PHONE_TEL
  const phoneDisplay = useArtisanPhone ? formatFrenchPhone(cleanArtisanPhone) : PHONE_NUMBER
  const phoneLabel = useArtisanPhone ? 'Artisan' : 'Conseiller'
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

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

  const specialtyLower = specialty.toLowerCase()

  return (
    <div
      className={`fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sand-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="group"
      aria-label="Actions rapides"
    >
      {/* Tablet layout (md–lg) */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-3 text-charcoal-700">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-accent-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-accent-700">
              {useArtisanPhone ? `${artisanName || 'Artisan'} RGE` : ADVISORS_LABEL}
            </span>
          </span>
          <span className="text-sand-300" aria-hidden="true">
            |
          </span>
          <span className="text-sm text-charcoal-600">
            {specialty} à {city} · Gratuit · Sans engagement
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            onClick={() => {
              trackEvent('phone_click', {
                source: 'unclaimed_sticky_bar_desktop',
                specialty,
                city,
                target: useArtisanPhone ? 'artisan' : 'platform',
                artisanId: artisanId ?? null,
              })
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium text-sm hover:border-sand-400 hover:bg-sand-50 transition-all duration-200"
            aria-label={
              useArtisanPhone
                ? `Appeler ${artisanName || 'l’artisan'} au ${phoneDisplay}`
                : `Appeler ServicesArtisans au ${phoneDisplay}`
            }
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {phoneLabel} · {phoneDisplay}
          </a>
          <button
            onClick={() => {
              trackEvent('unclaimed_devis_click', {
                source: 'unclaimed_sticky_bar_desktop',
                specialty,
                city,
              })
              onDevisClick()
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/25 transition-all duration-200"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Devis {specialtyLower} gratuit
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center gap-2.5">
          <a
            href={phoneHref}
            onClick={() => {
              trackEvent('phone_click', {
                source: 'unclaimed_sticky_bar_mobile',
                specialty,
                city,
                target: useArtisanPhone ? 'artisan' : 'platform',
                artisanId: artisanId ?? null,
              })
            }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl border-2 border-sand-300 text-charcoal-700 hover:border-sand-400 hover:bg-sand-50 transition-all duration-200 touch-manipulation flex-shrink-0"
            aria-label={
              useArtisanPhone
                ? `Appeler ${artisanName || 'l’artisan'} au ${phoneDisplay}`
                : `Appeler un conseiller au ${phoneDisplay}`
            }
          >
            <Phone className="w-5 h-5" />
            <span className="text-[9px] leading-tight mt-0.5">{phoneLabel}</span>
          </a>
          <button
            onClick={() => {
              trackEvent('unclaimed_devis_click', {
                source: 'unclaimed_sticky_bar_mobile',
                specialty,
                city,
              })
              onDevisClick()
            }}
            className="flex-1 py-3.5 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 transition-all duration-200 touch-manipulation"
            aria-label={`Devis ${specialtyLower} gratuit à ${city}`}
          >
            <FileText className="w-4.5 h-4.5 flex-shrink-0" aria-hidden="true" />
            Devis {specialtyLower} gratuit
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-charcoal-500">
          {useArtisanPhone ? (
            <span>Source&nbsp;: Registre RGE ADEME</span>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-accent-500" aria-hidden="true" />
                {ADVISORS_COUNT} {ADVISORS_COUNT === 1 ? 'conseiller' : 'conseillers'} à votre
                écoute
              </span>
              <span className="text-charcoal-300" aria-hidden="true">
                ·
              </span>
              <span>Gratuit</span>
              <span className="text-charcoal-300" aria-hidden="true">
                ·
              </span>
              <span>Sans engagement</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
