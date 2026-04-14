'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock, MapPin, Users } from 'lucide-react'

interface RecentActivityFeedProps {
  /** Slug du service pour seed */
  serviceSlug: string
  /** Nom du service affiché */
  serviceName: string
  /** Nom de la ville */
  cityName?: string
  /** Nombre d'artisans disponibles dans la zone (ou seed) */
  availableCount?: number
  /** Afficher le compteur "artisans disponibles" */
  showAvailability?: boolean
  /** Variante */
  variant?: 'compact' | 'card'
}

function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Génère un délai réaliste "il y a X minutes" (entre 4 et 180 minutes)
 * Change toutes les ~10 minutes pour une évolution naturelle
 */
function getLastRequestMinutes(slug: string): number {
  const timeBlock = Math.floor(Date.now() / 600_000) // change toutes les 10 min
  const seed = hashSeed(slug + '-last-req-' + String(timeBlock))
  // Distribution non-uniforme : plus souvent récent
  const raw = seed % 100
  if (raw < 40) return 4 + (seed % 26) // 4-29 min (40% des cas)
  if (raw < 70) return 30 + (seed % 31) // 30-60 min (30%)
  if (raw < 90) return 60 + (seed % 61) // 1-2h (20%)
  return 120 + (seed % 61) // 2-3h (10%)
}

function formatDelay(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

/**
 * Nombre d'artisans disponibles — pattern "Only 2 rooms left!" de Booking
 */
function getAvailableArtisans(slug: string, base?: number): number {
  if (base && base > 0) return base
  const today = new Date().toISOString().slice(0, 10)
  const seed = hashSeed(slug + '-avail-' + today)
  return 3 + (seed % 10) // 3-12 artisans, déterministe par jour
}

/**
 * Feed d'activité récente :
 * - "Dernière demande de devis il y a X min"
 * - "X artisans disponibles dans votre zone"
 *
 * Patterns Booking : "Last booked 3 hours ago" + "Only 2 rooms left!"
 */
export default function RecentActivityFeed({
  serviceSlug,
  serviceName,
  cityName,
  availableCount,
  showAvailability = true,
  variant = 'compact',
}: RecentActivityFeedProps) {
  const [lastMinutes, setLastMinutes] = useState<number | null>(null)
  const [artisanCount, setArtisanCount] = useState<number | null>(null)

  const update = useCallback(() => {
    setLastMinutes(getLastRequestMinutes(serviceSlug))
    if (showAvailability) {
      setArtisanCount(getAvailableArtisans(serviceSlug, availableCount))
    }
  }, [serviceSlug, showAvailability, availableCount])

  useEffect(() => {
    update()
    const interval = setInterval(update, 600_000) // refresh toutes les 10 min
    return () => clearInterval(interval)
  }, [update])

  if (lastMinutes === null) return null

  const delayText = formatDelay(lastMinutes)
  const zoneText = cityName ? `à ${cityName}` : 'dans votre zone'

  if (variant === 'card') {
    return (
      <div className="rounded-xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {/* Dernière demande */}
          <div className="flex items-start gap-3" role="status" aria-live="polite">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <Clock className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-800">
                Dernière demande de devis il y a {delayText}
              </p>
              <p className="text-xs text-charcoal-500">
                {serviceName} {zoneText}
              </p>
            </div>
          </div>

          {/* Artisans disponibles */}
          {showAvailability && artisanCount !== null && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                <Users className="h-4 w-4 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">
                  {artisanCount} artisan{artisanCount > 1 ? 's' : ''} disponible
                  {artisanCount > 1 ? 's' : ''} {zoneText}
                </p>
                {artisanCount <= 5 && (
                  <p className="text-xs font-medium text-primary-500">
                    Forte demande — demandez votre devis rapidement
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Compact (défaut)
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span
        className="flex items-center gap-1.5 text-charcoal-600"
        role="status"
        aria-live="polite"
      >
        <Clock className="h-3.5 w-3.5 text-primary-400" />
        Dernière demande il y a {delayText}
      </span>

      {showAvailability && artisanCount !== null && (
        <span className="flex items-center gap-1.5 text-charcoal-600">
          <MapPin className="h-3.5 w-3.5 text-accent-500" />
          {artisanCount} artisan{artisanCount > 1 ? 's' : ''} {zoneText}
        </span>
      )}
    </div>
  )
}
