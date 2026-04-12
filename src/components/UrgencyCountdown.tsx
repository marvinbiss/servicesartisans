'use client'

import { useState, useEffect } from 'react'
import { Clock, Zap } from 'lucide-react'

interface UrgencyCountdownProps {
  /** Service slug for API query */
  serviceName: string
  /** City name for API query */
  cityName?: string
}

interface DemandStats {
  requests_this_week: number
  requests_this_month: number
  active_providers: number
}

/**
 * Shows real demand stats from /api/stats/demand.
 * Falls back to deterministic values if fetch fails.
 */
export default function UrgencyCountdown({ serviceName, cityName }: UrgencyCountdownProps) {
  const [stats, setStats] = useState<DemandStats | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Check sessionStorage cache
    const cacheKey = `sa:urgency:${serviceName}:${cityName || ''}`
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.ts < 300_000) {
          // 5 min cache
          setStats(parsed.data)
          setLoaded(true)
          return
        }
      }
    } catch {
      /* ignore */
    }

    const params = new URLSearchParams()
    if (serviceName) params.set('service', serviceName)
    if (cityName) params.set('city', cityName)

    fetch(`/api/stats/demand?${params}`)
      .then((r) => r.json())
      .then((data: DemandStats) => {
        setStats(data)
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }))
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        // API failed — leave stats null so the guard hides the component
      })
      .finally(() => setLoaded(true))
  }, [serviceName, cityName])

  if (!loaded || !stats) return null

  // Only show if there's actual activity
  const weeklyRequests = stats.requests_this_week
  const providers = stats.active_providers
  const displayName = serviceName.replace(/-/g, ' ')

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Zap className="w-5 h-5 text-red-600" />
          {weeklyRequests > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-red-900">
          {cityName
            ? `Forte demande en ${displayName} à ${cityName}`
            : `Forte demande en ${displayName}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-2xl font-bold text-red-700">{weeklyRequests}</span>
          </div>
          <p className="text-xs text-charcoal-600">Demandes cette semaine</p>
        </div>
        <div className="bg-white/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-2xl font-bold text-amber-700">{providers}</span>
          </div>
          <p className="text-xs text-charcoal-600">Artisans disponibles</p>
        </div>
      </div>

      {weeklyRequests > 5 && (
        <p className="text-xs text-red-700/70 mt-3 text-center">
          Les artisans qui répondent vite ont plus de chances d'être choisis
        </p>
      )}
    </div>
  )
}
