'use client'

/**
 * FilterPanel — sidebar desktop + bottom-sheet mobile.
 *
 * Filtres exposés (tous booleans + 1 numérique) :
 * - `rge`           → seulement artisans avec qualif RGE active
 * - `verified`      → providers.is_verified
 * - `claimed`       → fiches revendiquées (user_id non null)
 * - `emergency`     → providers.emergency_available
 * - `free_quote`    → providers.free_quote
 * - `rating_min`    → rating_average >= valeur (3 / 4 / 4.5)
 *
 * Stratégie :
 * - Filtrage côté client sur les providers déjà fetchés (50 par défaut).
 *   Suffisant pour un MVP — au-delà on rebrancherait un fetch paginé.
 * - URL sync via `useSearchParams` + `router.replace(scroll:false)` pour
 *   préserver la position de scroll + le back/forward navigation.
 * - Mobile : bouton « Filtres » qui ouvre un bottom-sheet plein écran avec
 *   pied collant « Appliquer (N résultats) ».
 *
 * Le compteur de résultats live est passé par le parent — le panel n'a pas
 * à connaître l'algo de filtrage, juste les valeurs.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Filter, RotateCcw, X } from 'lucide-react'

export type ProviderFilters = {
  rge: boolean
  verified: boolean
  claimed: boolean
  emergency: boolean
  freeQuote: boolean
  ratingMin: 0 | 3 | 4 | 4.5
}

export const EMPTY_FILTERS: ProviderFilters = {
  rge: false,
  verified: false,
  claimed: false,
  emergency: false,
  freeQuote: false,
  ratingMin: 0,
}

export function filtersToSearchParams(
  filters: ProviderFilters,
  initial?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(initial)
  // Toggles : on/off via présence
  if (filters.rge) params.set('rge', '1')
  else params.delete('rge')
  if (filters.verified) params.set('verified', '1')
  else params.delete('verified')
  if (filters.claimed) params.set('claimed', '1')
  else params.delete('claimed')
  if (filters.emergency) params.set('emergency', '1')
  else params.delete('emergency')
  if (filters.freeQuote) params.set('fq', '1')
  else params.delete('fq')
  // Min rating : valeur explicite ou retrait
  if (filters.ratingMin > 0) params.set('rmin', String(filters.ratingMin))
  else params.delete('rmin')
  return params
}

export function parseFilters(searchParams: URLSearchParams): ProviderFilters {
  const ratingMinRaw = Number(searchParams.get('rmin') ?? '0')
  const allowed: ProviderFilters['ratingMin'][] = [0, 3, 4, 4.5]
  const ratingMin = allowed.includes(ratingMinRaw as ProviderFilters['ratingMin'])
    ? (ratingMinRaw as ProviderFilters['ratingMin'])
    : 0
  return {
    rge: searchParams.get('rge') === '1',
    verified: searchParams.get('verified') === '1',
    claimed: searchParams.get('claimed') === '1',
    emergency: searchParams.get('emergency') === '1',
    freeQuote: searchParams.get('fq') === '1',
    ratingMin,
  }
}

export function countActiveFilters(filters: ProviderFilters): number {
  let n = 0
  if (filters.rge) n++
  if (filters.verified) n++
  if (filters.claimed) n++
  if (filters.emergency) n++
  if (filters.freeQuote) n++
  if (filters.ratingMin > 0) n++
  return n
}

interface FilterPanelProps {
  /** Le compteur live `liveCount` (résultats filtrés) côté parent. */
  resultCount: number
  /** Mode rendu : 'sidebar' inline desktop / 'inline' compact (sticky bar). */
  variant?: 'sidebar' | 'inline'
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start justify-between gap-3 py-2.5 cursor-pointer group/toggle"
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-charcoal-800 group-hover/toggle:text-charcoal-900">
          {label}
        </span>
        {hint && <span className="text-xs text-charcoal-500 mt-0.5">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border transition-colors ${
          checked ? 'bg-primary-500 border-primary-600' : 'bg-sand-200 border-sand-300'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform mt-[1.5px] ${
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
        />
      </span>
    </label>
  )
}

function RatingPicker({
  value,
  onChange,
}: {
  value: ProviderFilters['ratingMin']
  onChange: (v: ProviderFilters['ratingMin']) => void
}) {
  const choices: { label: string; v: ProviderFilters['ratingMin'] }[] = [
    { label: 'Toutes', v: 0 },
    { label: '≥ 3.0', v: 3 },
    { label: '≥ 4.0', v: 4 },
    { label: '≥ 4.5', v: 4.5 },
  ]
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {choices.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => onChange(c.v)}
          aria-pressed={value === c.v}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            value === c.v
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-charcoal-700 border-sand-300 hover:bg-sand-50'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

export function FilterPanel({ resultCount, variant = 'sidebar' }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ProviderFilters>(() => parseFilters(searchParams))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Esc closes drawer + body scroll-lock + focus return when closing.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    const trigger = triggerRef.current
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      trigger?.focus()
    }
  }, [drawerOpen])

  // Garde le state local synchro si l'URL change (back/forward navigation,
  // ou un autre widget edit les params). Compare par sérialisation pour ne
  // pas écraser un setState juste fait par l'utilisateur.
  useEffect(() => {
    const fromUrl = parseFilters(searchParams)
    setFilters((prev) => (JSON.stringify(prev) === JSON.stringify(fromUrl) ? prev : fromUrl))
  }, [searchParams])

  const writeToUrl = useCallback(
    (next: ProviderFilters) => {
      const params = filtersToSearchParams(next, searchParams)
      const qs = params.toString()
      const url = qs ? `?${qs}` : window.location.pathname
      router.replace(url, { scroll: false })
    },
    [router, searchParams]
  )

  const update = useCallback(
    <K extends keyof ProviderFilters>(key: K, value: ProviderFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value }
        writeToUrl(next)
        return next
      })
    },
    [writeToUrl]
  )

  const reset = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    writeToUrl(EMPTY_FILTERS)
  }, [writeToUrl])

  const activeCount = countActiveFilters(filters)

  const body = (
    <>
      <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between border-b border-sand-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal-500" aria-hidden="true" />
          <h2 className="font-heading text-sm font-bold text-charcoal-900">Filtres</h2>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-2xs font-bold">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>
      <div className="px-4 sm:px-5 py-3 divide-y divide-sand-100">
        <div className="py-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-charcoal-400 mb-1">
            Certification
          </p>
          <ToggleRow
            id="f-rge"
            label="Certifié RGE"
            hint="Éligible MaPrimeRénov’, CEE, TVA 5,5%"
            checked={filters.rge}
            onChange={(v) => update('rge', v)}
          />
          <ToggleRow
            id="f-verified"
            label="Vérifié plateforme"
            hint="Identité + assurance contrôlées"
            checked={filters.verified}
            onChange={(v) => update('verified', v)}
          />
          <ToggleRow
            id="f-claimed"
            label="Fiche revendiquée"
            hint="Artisan actif sur ServicesArtisans"
            checked={filters.claimed}
            onChange={(v) => update('claimed', v)}
          />
        </div>
        <div className="py-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-charcoal-400 mb-1">
            Disponibilité
          </p>
          <ToggleRow
            id="f-emergency"
            label="Urgences acceptées"
            checked={filters.emergency}
            onChange={(v) => update('emergency', v)}
          />
          <ToggleRow
            id="f-fq"
            label="Devis gratuit"
            checked={filters.freeQuote}
            onChange={(v) => update('freeQuote', v)}
          />
        </div>
        <div className="py-3">
          <p className="text-xs font-semibold tracking-wide uppercase text-charcoal-400 mb-1">
            Note minimum
          </p>
          <RatingPicker value={filters.ratingMin} onChange={(v) => update('ratingMin', v)} />
        </div>
      </div>
    </>
  )

  // Sidebar desktop variant
  if (variant === 'sidebar') {
    return (
      <>
        {/* Sidebar — desktop only */}
        <aside
          aria-label="Filtres recherche"
          className="hidden md:block bg-white border border-sand-300 rounded-2xl overflow-hidden sticky top-[140px] self-start"
        >
          {body}
        </aside>

        {/* Mobile trigger button (sticky bottom) */}
        <div className="md:hidden sticky bottom-16 z-40 flex justify-center pointer-events-none">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="pointer-events-auto inline-flex items-center gap-2 px-5 py-3 rounded-full bg-charcoal-900 text-white text-sm font-semibold shadow-lg hover:bg-charcoal-800 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-2xs font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile bottom-sheet */}
        {drawerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres recherche"
            className="md:hidden fixed inset-0 z-modal"
          >
            <div
              className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
                <h2 className="font-heading font-bold text-charcoal-900">Filtres</h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer les filtres"
                  className="p-1 text-charcoal-500 hover:text-charcoal-900 rounded-lg hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">{body}</div>
              <div className="border-t border-sand-200 px-4 py-3 flex items-center justify-between gap-3 bg-sand-50">
                <button
                  type="button"
                  onClick={reset}
                  disabled={activeCount === 0}
                  className="text-sm font-medium text-charcoal-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-cta transition-colors"
                >
                  Voir {resultCount} résultat{resultCount > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Inline minimal variant — used when sidebar is not desired (eg compact pages)
  return (
    <details className="group/filters bg-white border border-sand-300 rounded-xl">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
        <span className="inline-flex items-center gap-2 font-semibold text-sm text-charcoal-800">
          <Filter className="w-4 h-4 text-charcoal-500" />
          Filtres
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-2xs font-bold">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-charcoal-500 transition-transform group-open/filters:rotate-180" />
      </summary>
      {body}
    </details>
  )
}

export default FilterPanel
