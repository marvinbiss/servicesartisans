'use client'

import { useEffect, useState } from 'react'
import { Shield, Star, Lock, CheckCircle } from 'lucide-react'

interface TrustBarProps {
  /** Position : haut ou bas de la page */
  position?: 'top' | 'bottom'
  /** Afficher uniquement après un scroll minimum (en px) */
  showAfterScroll?: number
  /** Données custom (sinon valeurs par défaut) */
  artisanCount?: number
  rating?: number
}

/**
 * Bannière de confiance flottante — style Booking.com trust bar.
 *
 * Affiche les signaux de confiance clés en permanence
 * sur les pages de conversion :
 * "14 500 artisans vérifiés · 4.8/5 · Données protégées"
 */
export default function TrustBar({
  position = 'bottom',
  showAfterScroll = 200,
  artisanCount = 14500,
  rating = 4.8,
}: TrustBarProps) {
  const [visible, setVisible] = useState(showAfterScroll === 0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (showAfterScroll === 0 || dismissed) return

    const handleScroll = () => {
      setVisible(window.scrollY > showAfterScroll)
    }

    // Check initial position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfterScroll, dismissed])

  if (dismissed || !visible) return null

  const positionClasses = position === 'top'
    ? 'top-0 border-b'
    : 'bottom-0 border-t'

  return (
    <div
      className={`fixed left-0 right-0 z-40 ${positionClasses} border-sand-200 bg-white/95 backdrop-blur-sm shadow-sm transition-transform duration-300`}
      role="banner"
      aria-label="Garanties ServicesArtisans"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 text-charcoal-700">
            <Shield className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">
              {artisanCount.toLocaleString('fr-FR')} artisans vérifiés
            </span>
            <span className="sm:hidden font-medium">
              {artisanCount.toLocaleString('fr-FR')} vérifiés
            </span>
          </span>

          <span className="flex items-center gap-1.5 text-charcoal-700" aria-hidden="true">
            <span className="text-sand-300">|</span>
          </span>

          <span className="flex items-center gap-1.5 text-charcoal-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium">{rating}/5</span>
            <span className="hidden sm:inline text-charcoal-500">satisfaction</span>
          </span>

          <span className="flex items-center gap-1.5 text-charcoal-700" aria-hidden="true">
            <span className="text-sand-300">|</span>
          </span>

          <span className="flex items-center gap-1.5 text-charcoal-700">
            <Lock className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Données protégées</span>
            <span className="sm:hidden font-medium">Protégé</span>
          </span>

          <span className="hidden md:flex items-center gap-1.5 text-charcoal-700">
            <span className="text-sand-300">|</span>
          </span>

          <span className="hidden md:flex items-center gap-1.5 text-charcoal-700">
            <CheckCircle className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
            <span className="font-medium">Devis gratuits</span>
          </span>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-3 shrink-0 rounded p-1 text-charcoal-400 transition-colors hover:bg-sand-100 hover:text-charcoal-600"
          aria-label="Fermer la bannière de confiance"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
