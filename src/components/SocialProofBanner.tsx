'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Users, Clock, TrendingUp, FileText, Eye } from 'lucide-react'

interface SocialProofData {
  devisThisMonth: number
  activeProviders: number
}

interface SocialProofBannerProps {
  /** Nom du metier pour contextualiser */
  metier?: string
  /** Nom de la ville pour contextualiser */
  ville?: string
  /** Variant: 'inline' pills, 'card' full card, 'compact' minimal */
  variant?: 'inline' | 'card' | 'compact'
  /** Activer l'animation compteur (requiert IntersectionObserver) */
  animated?: boolean
}

/**
 * Deterministic fallback counter — same value for all visitors on the same day
 */
function getDailyCount(): number {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return 47 + ((dayOfYear * 7 + 13) % 137) // 47-183, deterministic per day
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
 * Nombre pseudo-aléatoire "personnes en ligne" — change toutes les 5 min
 */
function getLiveViewers(seed: string): number {
  const timeBlock = Math.floor(Date.now() / 300_000)
  let hash = 0
  const str = seed + String(timeBlock)
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return 4 + (Math.abs(hash) % 12) // 4-15
}

export function SocialProofBanner({ metier, ville, variant = 'inline', animated = true }: SocialProofBannerProps) {
  const fallbackCount = getDailyCount()
  const [data, setData] = useState<SocialProofData | null>(null)
  const [liveViewers, setLiveViewers] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observedRef = useRef(false)

  useEffect(() => {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem('sa:social-proof')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.fetchedAt < 3600000) {
          setData(parsed.data)
          return
        }
      } catch { /* ignore corrupt cache */ }
    }

    fetch('/api/social-proof')
      .then(r => r.json())
      .then((d: SocialProofData) => {
        setData(d)
        sessionStorage.setItem('sa:social-proof', JSON.stringify({ data: d, fetchedAt: Date.now() }))
      })
      .catch(() => {
        setData({ devisThisMonth: fallbackCount, activeProviders: 500 })
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live viewers — client only
  useEffect(() => {
    const slug = (metier || 'global') + (ville || '')
    setLiveViewers(getLiveViewers(slug))
    const interval = setInterval(() => {
      setLiveViewers(getLiveViewers(slug))
    }, 300_000)
    return () => clearInterval(interval)
  }, [metier, ville])

  const devisCount = data?.devisThisMonth ?? fallbackCount
  const providerCount = data?.activeProviders ?? 500

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, data])

  const devisDisplay = (animated ? devisAnim.value : devisCount).toLocaleString('fr-FR')
  const providerDisplay = (animated ? providerAnim.value : providerCount).toLocaleString('fr-FR')

  // ── Compact variant: minimal inline stats + live viewers ──
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
        {liveViewers !== null && (
          <span className="flex items-center gap-1.5" role="status" aria-live="polite">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            {liveViewers} en ligne
          </span>
        )}
      </div>
    )
  }

  // ── Card variant: full card with stats grid + live activity ──
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
          {liveViewers !== null && (
            <span
              className="flex items-center gap-1.5 text-xs text-accent-700 bg-accent-50 px-2 py-1 rounded-full"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
              </span>
              {liveViewers} en ligne
            </span>
          )}
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

  // ── Inline variant (default): pill badges with live dot ──
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
      {liveViewers !== null && (
        <span
          className="flex items-center gap-1.5 text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
          </span>
          <Eye className="w-3.5 h-3.5" />
          {liveViewers} en ligne
        </span>
      )}
    </div>
  )
}

export default SocialProofBanner
