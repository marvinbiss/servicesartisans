'use client'

import { useEffect, useState, useCallback } from 'react'

interface LiveActivityIndicatorProps {
  /** Slug du service pour seed déterministe */
  serviceSlug: string
  /** Nom de la ville pour contexte */
  cityName?: string
  /** Variante d'affichage */
  variant?: 'inline' | 'badge'
}

/**
 * Hash simple pour seed déterministe — même valeur par session/slug
 */
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Génère un nombre pseudo-aléatoire entre min et max (inclus)
 * basé sur un seed qui change lentement (toutes les ~5 min)
 */
function getRealisticCount(slug: string, min: number, max: number): number {
  const timeBlock = Math.floor(Date.now() / 300_000) // change toutes les 5 min
  const seed = hashSeed(slug + String(timeBlock))
  return min + (seed % (max - min + 1))
}

/**
 * "X personnes consultent ce service en ce moment"
 *
 * Pattern Booking.com : "15 people are looking at this right now"
 * Adapté au contexte artisans français — nombres réalistes (3-15)
 */
export default function LiveActivityIndicator({
  serviceSlug,
  cityName,
  variant = 'inline',
}: LiveActivityIndicatorProps) {
  const [viewerCount, setViewerCount] = useState<number | null>(null)

  const updateCount = useCallback(() => {
    setViewerCount(getRealisticCount(serviceSlug, 3, 15))
  }, [serviceSlug])

  useEffect(() => {
    // Initialiser côté client uniquement pour éviter le mismatch d'hydratation
    updateCount()

    // Refresh toutes les 5 minutes pour simuler une activité naturelle
    const interval = setInterval(updateCount, 300_000)
    return () => clearInterval(interval)
  }, [updateCount])

  // Pas de rendu SSR — évite le mismatch d'hydratation
  if (viewerCount === null) return null

  const label = cityName
    ? `${viewerCount} personnes consultent ce service à ${cityName}`
    : `${viewerCount} personnes consultent ce service en ce moment`

  if (variant === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1.5 text-sm text-accent-700"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-500" />
        </span>
        <span className="font-medium">{label}</span>
      </div>
    )
  }

  // Inline (défaut)
  return (
    <div
      className="flex items-center gap-2 text-sm text-charcoal-600"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
      </span>
      <span>{label}</span>
    </div>
  )
}
