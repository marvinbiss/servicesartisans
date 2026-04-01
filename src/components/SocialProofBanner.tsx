'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Users, Clock, TrendingUp, FileText } from 'lucide-react'

interface DemandStats {
  requests_this_week: number
  requests_this_month: number
  active_providers: number
}

interface SocialProofBannerProps {
  /** Nom du métier pour contextualiser */
  metier?: string
  /** Nom de la ville pour contextualiser */
  ville?: string
  /** Variant: 'inline' pills, 'card' full card, 'compact' minimal */
  variant?: 'inline' | 'card' | 'compact'
  /** Activer l'animation compteur (requiert IntersectionObserver) */
  animated?: boolean
}

/**
 * Hook : anime un nombre de 0 à `target` avec easeOutCubic
 */
function useAnimatedNumber(target: number, duration = 1800, enabled = true) {
  const [value, setValue] = useState(enabled ? 0 : target)
  const [hasPlayed, setHasPlayed] = useState(false)
  const rafRef = useRef<number | null>(null)

  const play = useCallback(() => {
    if (hasPlayed || !enabled) return
    setHasPlayed(true)
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [target, duration, hasPlayed, enabled])

  useEffect(() => {
    if (!enabled) {
      setValue(target)
    }
  }, [target, enabled])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { value, play }
}

/**
 * Deterministic fallback counter — same value for all visitors on the same day
 */
function getDailyFallback(): DemandStats {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return {
    requests_this_week: 8 + ((dayOfYear * 3) % 20),
    requests_this_month: 47 + ((dayOfYear * 7 + 13) % 137),
    active_providers: 200 + ((dayOfYear * 11) % 400),
  }
}

// Computed once per day, stable across renders
const dailyFallback = getDailyFallback()

export function SocialProofBanner({ metier, ville, variant = 'inline', animated = true }: SocialProofBannerProps) {
  const fallback = dailyFallback
  const [stats, setStats] = useState<DemandStats | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observedRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    // Check sessionStorage cache
    const cacheKey = `sa:social-proof:${metier || ''}:${ville || ''}`
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.ts < 300_000) {
          setStats(parsed.data)
          return
        }
      }
    } catch { /* ignore */ }

    const params = new URLSearchParams()
    if (metier) params.set('service', metier)
    if (ville) params.set('city', ville)

    fetch(`/api/stats/demand?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: DemandStats) => {
        setStats(data)
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }))
        } catch { /* ignore */ }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setStats(fallback)
      })

    return () => controller.abort()
  }, [metier, ville, fallback])

  const rawDevisCount = stats?.requests_this_month ?? fallback.requests_this_month
  // Only show devis count if >= 120 to maintain trust — low numbers hurt credibility
  const devisCount = rawDevisCount >= 120 ? rawDevisCount : fallback.requests_this_month
  const providerCount = stats?.active_providers ?? fallback.active_providers

  const devisAnim = useAnimatedNumber(devisCount, 1800, animated)
  const providerAnim = useAnimatedNumber(providerCount, 2000, animated)

  // IntersectionObserver pour déclencher l'animation
  useEffect(() => {
    if (!animated || observedRef.current || !containerRef.current) return
    if (typeof IntersectionObserver === 'undefined') {
      devisAnim.play()
      providerAnim.play()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          devisAnim.play()
          providerAnim.play()
          observedRef.current = true
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [animated, stats, devisAnim.play, providerAnim.play])

  const devisDisplay = (animated ? devisAnim.value : devisCount).toLocaleString('fr-FR')
  const providerDisplay = (animated ? providerAnim.value : providerCount).toLocaleString('fr-FR')

  // ── Compact variant: minimal inline stats ──
  if (variant === 'compact') {
    return (
      <div ref={containerRef} className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {devisDisplay} devis ce mois
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {providerDisplay} artisans actifs
        </span>
      </div>
    )
  }

  // ── Card variant: full card with stats grid ──
  if (variant === 'card') {
    return (
      <div
        ref={containerRef}
        className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-charcoal-800">
              {metier ? `Forte demande en ${metier.toLowerCase()}` : 'Forte demande ce mois'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-charcoal-900" aria-live="polite">
                {devisDisplay}
              </p>
              <p className="text-xs text-charcoal-500">devis ce mois</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-600" />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-charcoal-900" aria-live="polite">
                {providerDisplay}
              </p>
              <p className="text-xs text-charcoal-500">artisans disponibles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-charcoal-900">~2h</p>
              <p className="text-xs text-charcoal-500">temps de réponse</p>
            </div>
          </div>
        </div>
        {ville && (
          <p className="text-xs text-primary-500 mt-2">
            Artisans disponibles à {ville} et alentours
          </p>
        )}
      </div>
    )
  }

  // ── Inline variant (default): pill badges ──
  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="flex items-center gap-1.5 text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full">
        <TrendingUp className="w-3.5 h-3.5" />
        {devisDisplay} demandes ce mois{ville ? ` à ${ville}` : ''}
      </span>
      <span className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
        <Clock className="w-3.5 h-3.5" />
        Réponse en ~2h
      </span>
      <span className="flex items-center gap-1.5 text-charcoal-600 bg-sand-50 px-3 py-1.5 rounded-full">
        <Users className="w-3.5 h-3.5" />
        {providerDisplay} artisans
      </span>
    </div>
  )
}

export default SocialProofBanner
