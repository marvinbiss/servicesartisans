'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  X,
  Star,
  MapPin,
  Shield,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  MapPinned,
  Leaf,
  Wallet,
  Zap,
  Sparkles,
} from 'lucide-react'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'
import { clsx } from 'clsx'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { trackEvent } from '@/lib/analytics/tracking'
import { useCompare } from '@/components/compare/CompareProvider'
import type { CompareProvider } from '@/components/compare/CompareProvider'

interface CompareViewProps {
  onClose: () => void
}

function ProviderAvatar({ provider, index }: { provider: CompareProvider; index: number }) {
  const colors = ['bg-primary-400', 'bg-accent-500', 'bg-amber-500']
  return (
    <div
      className={clsx(
        'w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md',
        colors[index % colors.length]
      )}
    >
      {provider.name.charAt(0).toUpperCase()}
    </div>
  )
}

function BooleanCell({ value }: { value: boolean | undefined }) {
  if (value) {
    return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
  }
  return <XCircle className="w-5 h-5 text-sand-500 mx-auto" />
}

function RatingCell({ provider }: { provider: CompareProvider }) {
  if (!provider.rating_average) {
    return <span className="text-charcoal-400 text-sm">Pas encore noté</span>
  }
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
      <span className="font-bold text-charcoal-900">
        {Number(provider.rating_average).toFixed(1)}
      </span>
      {provider.review_count != null && provider.review_count > 0 && (
        <span className="text-charcoal-500 text-xs">({provider.review_count} avis)</span>
      )}
    </div>
  )
}

interface CompareRowProps {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
  providers: CompareProvider[]
  isDiff?: boolean
  highlight?: boolean
}

function CompareRow({ label, icon, children, isDiff, highlight }: CompareRowProps) {
  const showDiff = !!isDiff && !!highlight
  return (
    <div
      className={clsx(
        'grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] items-start border-b border-sand-200 last:border-b-0',
        showDiff && 'bg-amber-50/40'
      )}
    >
      <div
        className={clsx(
          'flex items-center gap-2 py-3 px-4 self-stretch font-medium text-sm',
          showDiff
            ? 'bg-amber-50 text-amber-900 border-l-4 border-amber-400'
            : 'bg-sand-50 text-charcoal-600'
        )}
      >
        {icon}
        <span>{label}</span>
        {showDiff && (
          <span
            className="ml-auto text-2xs uppercase tracking-wide font-bold text-amber-700"
            aria-label="critère différent"
          >
            Diff
          </span>
        )}
      </div>
      <div className="py-3 px-4">{children}</div>
    </div>
  )
}

/**
 * Build a stable diff signature for every comparable row. A row is `isDiff`
 * when at least two artisans expose distinct values for that criterion.
 * Strings are lower-cased to avoid casing flips registering as differences;
 * nullish values normalise to the literal `null` so missing-vs-missing
 * never counts as a diff.
 */
function computeRowDiffs(providers: CompareProvider[]): Record<string, boolean> {
  if (providers.length < 2) {
    return {}
  }
  const norm = (v: string | number | boolean | null | undefined): string => {
    if (v === null || v === undefined) return 'null'
    if (typeof v === 'string') return v.trim().toLowerCase()
    return String(v)
  }
  const differs = (values: Array<string | number | boolean | null | undefined>): boolean =>
    new Set(values.map(norm)).size > 1

  return {
    rating: differs(
      providers.map((p) => (typeof p.rating_average === 'number' ? p.rating_average : null))
    ),
    ville: differs(providers.map((p) => p.address_city ?? null)),
    verified: differs(providers.map((p) => !!p.is_verified)),
    rge: differs(providers.map((p) => hasActiveRgeQualification(p.rge_qualifications))),
    tarif: differs(providers.map((p) => `${p.hourly_rate_min ?? 'n'}-${p.hourly_rate_max ?? 'n'}`)),
    urgences: differs(providers.map((p) => !!(p.emergency_available || p.available_24h))),
    devis: differs(providers.map((p) => !!p.free_quote)),
    siret: differs(providers.map((p) => p.siret ?? null)),
    postal: differs(providers.map((p) => p.address_postal_code ?? null)),
  }
}

function ProviderGrid({
  providers,
  children,
}: {
  providers: CompareProvider[]
  children: (provider: CompareProvider, index: number) => React.ReactNode
}) {
  return (
    <div
      className={clsx(
        'grid gap-4',
        providers.length === 2 && 'grid-cols-2',
        providers.length === 3 && 'grid-cols-3'
      )}
    >
      {providers.map((p, i) => (
        <div key={p.id} className="text-center text-sm">
          {children(p, i)}
        </div>
      ))}
    </div>
  )
}

export function CompareView({ onClose }: CompareViewProps) {
  const { compareList, removeFromCompare } = useCompare()
  const [highlightDiff, setHighlightDiff] = useState(true)
  const rowDiffs = useMemo(() => computeRowDiffs(compareList), [compareList])
  const diffCount = useMemo(() => Object.values(rowDiffs).filter(Boolean).length, [rowDiffs])

  // Lock body scroll & handle Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 md:pt-16 overflow-y-auto">
        <div
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-6 border-b border-sand-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 id="compare-title" className="text-xl font-bold text-charcoal-900 font-heading">
                Comparer les artisans
              </h2>
              {compareList.length >= 2 && diffCount > 0 && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-full"
                  aria-live="polite"
                >
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  {diffCount} critère{diffCount > 1 ? 's' : ''} diffèrent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {compareList.length >= 2 && diffCount > 0 && (
                <label className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highlightDiff}
                    onChange={(e) => setHighlightDiff(e.target.checked)}
                    className="w-4 h-4 rounded border-sand-300 text-amber-500 focus:ring-amber-400"
                  />
                  Différences
                </label>
              )}
              <button
                onClick={onClose}
                className="p-2 -m-2 text-charcoal-400 hover:text-charcoal-600 transition-colors rounded-lg hover:bg-sand-100"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Provider headers */}
          <div className="p-6 border-b border-sand-200">
            <ProviderGrid providers={compareList}>
              {(provider, index) => (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <ProviderAvatar provider={provider} index={index} />
                    <button
                      onClick={() => removeFromCompare(provider.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      aria-label={`Retirer ${provider.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 text-base">{provider.name}</h3>
                    {provider.specialty && (
                      <p className="text-charcoal-500 text-xs mt-0.5">{provider.specialty}</p>
                    )}
                  </div>
                </div>
              )}
            </ProviderGrid>
          </div>

          {/* Comparison table */}
          <div className="divide-y divide-sand-200">
            {/* Rating */}
            <CompareRow
              label="Note"
              icon={<Star className="w-4 h-4 text-amber-500" />}
              providers={compareList}
              isDiff={rowDiffs.rating}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => <RatingCell provider={provider} />}
              </ProviderGrid>
            </CompareRow>

            {/* Location */}
            <CompareRow
              label="Ville"
              icon={<MapPin className="w-4 h-4 text-charcoal-400" />}
              providers={compareList}
              isDiff={rowDiffs.ville}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => (
                  <span className="text-charcoal-700">
                    {provider.address_city || '-'}
                    {provider.address_region && (
                      <span className="text-charcoal-400 text-xs block">
                        {provider.address_region}
                      </span>
                    )}
                  </span>
                )}
              </ProviderGrid>
            </CompareRow>

            {/* Verified */}
            <CompareRow
              label="Vérifié"
              icon={<Shield className="w-4 h-4 text-green-500" />}
              providers={compareList}
              isDiff={rowDiffs.verified}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => <BooleanCell value={provider.is_verified} />}
              </ProviderGrid>
            </CompareRow>

            {/* RGE actif — déclencheur d'aides (MaPrimeRénov', CEE, TVA 5,5%) */}
            <CompareRow
              label="Certifié RGE"
              icon={<Leaf className="w-4 h-4 text-accent-500" />}
              providers={compareList}
              isDiff={rowDiffs.rge}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => (
                  <BooleanCell value={hasActiveRgeQualification(provider.rge_qualifications)} />
                )}
              </ProviderGrid>
            </CompareRow>

            {/* Tarif horaire (mig 306) */}
            <CompareRow
              label="Tarif horaire"
              icon={<Wallet className="w-4 h-4 text-amber-500" />}
              providers={compareList}
              isDiff={rowDiffs.tarif}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => {
                  const min = provider.hourly_rate_min
                  const max = provider.hourly_rate_max
                  if (min == null && max == null) {
                    return <span className="text-charcoal-400 text-xs">Sur devis</span>
                  }
                  if (min != null && max != null && min !== max) {
                    return (
                      <span className="text-charcoal-700 font-medium">
                        {min}–{max}
                        {' '}€/h
                      </span>
                    )
                  }
                  return (
                    <span className="text-charcoal-700 font-medium">
                      {min ?? max}
                      {' '}€/h
                    </span>
                  )
                }}
              </ProviderGrid>
            </CompareRow>

            {/* Urgences */}
            <CompareRow
              label="Urgences 24/7"
              icon={<Zap className="w-4 h-4 text-orange-500" />}
              providers={compareList}
              isDiff={rowDiffs.urgences}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => (
                  <BooleanCell value={provider.emergency_available || provider.available_24h} />
                )}
              </ProviderGrid>
            </CompareRow>

            {/* Devis gratuit */}
            <CompareRow
              label="Devis gratuit"
              icon={<FileText className="w-4 h-4 text-charcoal-400" />}
              providers={compareList}
              isDiff={rowDiffs.devis}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => <BooleanCell value={provider.free_quote} />}
              </ProviderGrid>
            </CompareRow>

            {/* Phone */}
            <CompareRow
              label="Téléphone"
              icon={<Phone className="w-4 h-4 text-charcoal-400" />}
              providers={compareList}
            >
              <ProviderGrid providers={compareList}>
                {() => (
                  <span className="text-charcoal-700">
                    <a
                      href={PHONE_TEL}
                      onClick={() => {
                        trackEvent('phone_click', { source: 'compare_view' })
                      }}
                      className="text-primary-500 hover:text-primary-600"
                    >
                      {PHONE_NUMBER}
                    </a>
                  </span>
                )}
              </ProviderGrid>
            </CompareRow>

            {/* SIRET */}
            <CompareRow
              label="SIRET"
              icon={<FileText className="w-4 h-4 text-charcoal-400" />}
              providers={compareList}
              isDiff={rowDiffs.siret}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => (
                  <span className="text-charcoal-700 text-xs font-mono">
                    {provider.siret || '-'}
                  </span>
                )}
              </ProviderGrid>
            </CompareRow>

            {/* Postal code */}
            <CompareRow
              label="Code postal"
              icon={<MapPinned className="w-4 h-4 text-charcoal-400" />}
              providers={compareList}
              isDiff={rowDiffs.postal}
              highlight={highlightDiff}
            >
              <ProviderGrid providers={compareList}>
                {(provider) => (
                  <span className="text-charcoal-700">{provider.address_postal_code || '-'}</span>
                )}
              </ProviderGrid>
            </CompareRow>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-sand-200 bg-sand-50 rounded-b-2xl">
            <p className="text-xs text-charcoal-500 text-center">
              Les informations affichées sont fournies par les artisans et vérifiées lorsque
              disponibles. Contactez directement chaque artisan pour un devis personnalisé.
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default CompareView
