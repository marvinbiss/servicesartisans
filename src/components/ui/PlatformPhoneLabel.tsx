'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

/**
 * Label contextuel pour indiquer que le numéro affiché est celui de la plateforme,
 * pas celui de l'artisan. Affiche un tooltip au clic/survol.
 *
 * Variantes :
 * - "inline" : petit texte discret à côté du numéro (défaut)
 * - "badge"  : badge plus visible avec icône info
 * - "subtle" : juste l'icône info avec tooltip
 */
export function PlatformPhoneLabel({
  variant = 'inline',
  className = '',
}: {
  variant?: 'inline' | 'badge' | 'subtle'
  className?: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  const tooltipText =
    "Ce numéro est celui de ServicesArtisans, pas celui de l'artisan. Nous vous mettons en relation avec le bon professionnel."

  if (variant === 'subtle') {
    return (
      <span
        className={`relative inline-flex items-center ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Info className="w-3.5 h-3.5 text-charcoal-400 cursor-help" />
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-xs text-white bg-charcoal-800 rounded-lg shadow-lg z-50 text-center leading-relaxed">
            {tooltipText}
          </span>
        )}
      </span>
    )
  }

  if (variant === 'badge') {
    return (
      <span
        className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Info className="w-3 h-3" />
        N° plateforme
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-xs text-white bg-charcoal-800 rounded-lg shadow-lg z-50 text-center leading-relaxed font-normal">
            {tooltipText}
          </span>
        )}
      </span>
    )
  }

  // variant === 'inline'
  return (
    <span
      className={`relative inline-flex items-center gap-1 text-xs text-charcoal-500 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <Info className="w-3 h-3 cursor-help" />
      <span>N° ServicesArtisans</span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-xs text-white bg-charcoal-800 rounded-lg shadow-lg z-50 text-center leading-relaxed">
          {tooltipText}
        </span>
      )}
    </span>
  )
}
