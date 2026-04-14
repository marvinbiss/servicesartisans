'use client'

/**
 * CeeSavingsComparator — Comparateur visuel "Coût avec/sans prime CEE"
 * affiché dans la confirmation post-devis quand le service est CEE-éligible.
 *
 * - Client Component (fetch POST /api/cee/estimate au mount)
 * - Fail-open : si l'API échoue ou non éligible → return null
 * - Fourchettes de coûts typiques par métier (pas de promesse)
 * - Light only, français avec accents
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Leaf, Info, AlertTriangle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import type { EstimateItem, EstimateResponse } from '@/lib/cee/estimate-types'

/* ─── Fourchettes de coûts typiques par métier ────────────────────── */

interface CostRange {
  label: string
  range: [number, number]
}

const SERVICE_COST_RANGES: Record<string, CostRange> = {
  chauffagiste: { label: 'Installation PAC', range: [8_000, 15_000] },
  couvreur: { label: 'Rénovation toiture', range: [5_000, 12_000] },
  electricien: { label: 'Mise aux normes', range: [2_000, 5_000] },
  plombier: { label: 'Rénovation sanitaire', range: [3_000, 8_000] },
  menuisier: { label: 'Remplacement fenêtres', range: [4_000, 10_000] },
  facades: { label: 'Ravalement + ITE', range: [8_000, 20_000] },
  'isolation-thermique': { label: 'Isolation complète', range: [5_000, 15_000] },
  climatisation: { label: 'Installation climatisation', range: [3_000, 8_000] },
  charpentier: { label: 'Réfection charpente', range: [6_000, 15_000] },
  peintre: { label: 'Peinture + isolation', range: [3_000, 8_000] },
}

const FALLBACK_COST: CostRange = {
  label: 'Travaux de rénovation',
  range: [3_000, 10_000],
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatEuros(value: number): string {
  const rounded = Math.max(0, Math.round(value))
  return `${rounded.toLocaleString('fr-FR').replace(/\s/g, '\u202f')}\u00a0\u20ac`
}

/**
 * Agrège les primes de tous les items :
 * - prime min = min des euros_classique_min (fourchette basse, ménages classiques)
 * - prime max = max des euros_precarite_max (fourchette haute, ménages précaires)
 */
function aggregatePrimes(items: EstimateItem[]): { primeMin: number; primeMax: number } | null {
  let primeMin = Infinity
  let primeMax = 0
  let hasAny = false

  for (const item of items) {
    if (!item.prime_estimate) continue
    hasAny = true
    if (item.prime_estimate.euros_classique_min < primeMin) {
      primeMin = item.prime_estimate.euros_classique_min
    }
    if (item.prime_estimate.euros_precarite_max > primeMax) {
      primeMax = item.prime_estimate.euros_precarite_max
    }
  }

  if (!hasAny || primeMax <= 0) return null
  return { primeMin: Math.max(0, primeMin), primeMax }
}

/* ─── Props ───────────────────────────────────────────────────────── */

export interface CeeSavingsComparatorProps {
  /** Slug du service (ex: "chauffagiste") */
  serviceSlug: string
  /** Code postal 5 chiffres */
  postalCode: string
}

/* ─── Component ───────────────────────────────────────────────────── */

export default function CeeSavingsComparator({
  serviceSlug,
  postalCode,
}: CeeSavingsComparatorProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<EstimateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const trackedRef = useRef(false)

  const fetchEstimate = useCallback(() => {
    const slug = serviceSlug?.trim() ?? ''
    const cp = postalCode?.trim() ?? ''
    if (!slug || !/^\d{5}$/.test(cp)) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    fetch('/api/cee/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceSlug: slug, postalCode: cp }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('fetch_failed')
        return res.json() as Promise<unknown>
      })
      .then((body) => {
        if (controller.signal.aborted) return
        if (
          !body ||
          typeof body !== 'object' ||
          typeof (body as { eligible?: unknown }).eligible !== 'boolean'
        ) {
          setData(null)
          setLoading(false)
          return
        }
        setData(body as EstimateResponse)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return
        if (err.name === 'AbortError') return
        setData(null)
        setError('Une erreur est survenue lors du chargement des données.')
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [serviceSlug, postalCode])

  useEffect(() => {
    const cleanup = fetchEstimate()
    return cleanup
  }, [fetchEstimate])

  /* ── Track cee_comparator_shown (une seule fois par montage) ── */
  useEffect(() => {
    if (data?.eligible && !trackedRef.current) {
      trackedRef.current = true
      trackEvent('cee_comparator_shown', { serviceSlug, postalCode })
    }
  }, [data, serviceSlug, postalCode])

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div
        data-testid="cee-savings-comparator-loading"
        aria-busy="true"
        className="rounded-xl border border-sand-200 bg-white p-4 shadow-soft"
      >
        <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-sand-100" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-sand-200" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-sand-200" />
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-emerald-100" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-emerald-100" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Erreur réseau → message discret avec retry ── */
  if (error) {
    return (
      <div
        data-testid="cee-savings-comparator-error"
        className="rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => fetchEstimate()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  /* ── Fail-open: non éligible → invisible ── */
  if (!data || !data.eligible) return null

  const primes = aggregatePrimes(data.items)
  if (!primes) return null

  const { primeMin, primeMax } = primes
  const costInfo = SERVICE_COST_RANGES[serviceSlug] ?? FALLBACK_COST
  const [costMin, costMax] = costInfo.range

  /* Calcul des fourchettes après prime :
   * - Borne basse après prime = costMin - primeMax (le meilleur cas)
   * - Borne haute après prime = costMax - primeMin (le cas le moins avantageux)
   * On clamp à 0 minimum. */
  const afterMin = Math.max(0, costMin - primeMax)
  const afterMax = Math.max(0, costMax - primeMin)

  return (
    <div
      data-testid="cee-savings-comparator"
      aria-label="Comparaison du coût des travaux avec et sans prime CEE"
      className="rounded-xl border border-sand-200 bg-white p-4 shadow-soft"
    >
      {/* Titre */}
      <div className="mb-3 flex items-center gap-2">
        <Leaf className="h-5 w-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
        <h4 className="font-heading text-sm font-semibold text-charcoal-900">
          Estimation du coût avec et sans prime CEE
        </h4>
        <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          Prime CEE
        </span>
      </div>

      {/* Comparateur side-by-side */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-live="polite">
        {/* ── Colonne SANS prime ── */}
        <div className="rounded-xl border border-sand-200 bg-sand-50 p-4 transition-all">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
            Sans prime CEE
          </p>
          <p className="mt-1 text-sm text-charcoal-600">{costInfo.label}</p>
          <p
            className="mt-2 text-xl font-bold text-charcoal-700 transition-all"
            aria-label={`entre ${Math.round(costMin).toLocaleString('fr-FR')} et ${Math.round(costMax).toLocaleString('fr-FR')} euros`}
          >
            {formatEuros(costMin)} à {formatEuros(costMax)}
          </p>
        </div>

        {/* ── Colonne AVEC prime ── */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-all">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Après prime CEE
          </p>
          <p className="mt-1 text-sm text-emerald-800">{costInfo.label} - prime déduite</p>
          <p
            className="mt-2 text-xl font-bold text-emerald-800 transition-all"
            aria-label={`entre ${Math.round(afterMin).toLocaleString('fr-FR')} et ${Math.round(afterMax).toLocaleString('fr-FR')} euros`}
          >
            {formatEuros(afterMin)} à {formatEuros(afterMax)}
          </p>
          <p
            className="mt-2 text-2xl font-bold text-emerald-600 transition-all"
            aria-label={`Économie : jusqu'à ${Math.round(primeMax).toLocaleString('fr-FR')} euros`}
          >
            Économie : jusqu&apos;à {formatEuros(primeMax)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-charcoal-500">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>
          Coûts moyens constatés. Le montant exact dépend de votre projet et du devis de
          l&apos;artisan. La prime CEE varie selon vos revenus et votre zone climatique.
        </span>
      </p>
    </div>
  )
}
