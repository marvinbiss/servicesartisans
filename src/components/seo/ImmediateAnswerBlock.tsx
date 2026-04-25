import { Euro, Clock, Users, Star, TrendingUp } from 'lucide-react'
import type { TradeContent } from '@/lib/data/trade-content'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImmediateAnswerBlockProps {
  /** Nom du service (ex: "Plombier") */
  serviceName: string
  /** Nom de la ville (ex: "Lyon") */
  villeName: string
  /** Données tarifaires du métier (peut être undefined si pas de données) */
  trade: TradeContent | null | undefined
  /** Prix min ajusté région */
  minPrice?: number
  /** Prix max ajusté région */
  maxPrice?: number
  /** Nombre d'artisans disponibles dans la zone (depuis la DB) */
  providerCount: number
  /** Note moyenne des artisans (depuis la DB, entre 0 et 5) */
  averageRating?: number | null
  /** Nombre total d'avis */
  totalReviews?: number | null
  /** Variante d'affichage */
  variant?: 'services' | 'tarifs'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatItem({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider leading-tight">
          {label}
        </div>
        <div className="font-heading text-lg font-bold text-charcoal-900 leading-tight mt-0.5">
          {value}
        </div>
        {sublabel && <div className="text-xs text-charcoal-400 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component (Server Component — accepts data as props)
// ---------------------------------------------------------------------------

export default function ImmediateAnswerBlock({
  serviceName,
  villeName,
  trade,
  minPrice,
  maxPrice,
  providerCount,
  averageRating,
  totalReviews,
  variant = 'services',
}: ImmediateAnswerBlockProps) {
  // Determine effective prices
  const effectiveMin = minPrice ?? trade?.priceRange.min
  const effectiveMax = maxPrice ?? trade?.priceRange.max
  const unit = trade?.priceRange.unit ?? '€/h'
  const hasPricing = effectiveMin != null && effectiveMax != null && effectiveMin > 0
  const hasRating = averageRating != null && averageRating > 0
  const hasProviders = providerCount > 0
  const hasResponseTime = !!trade?.averageResponseTime

  // Nothing meaningful to show → render nothing
  if (!hasPricing && !hasProviders && !hasRating) {
    return null
  }

  const svcLower = serviceName.toLowerCase()

  // Build visible stat items
  const stats: {
    key: string
    icon: React.ReactNode
    label: string
    value: string
    sublabel?: string
  }[] = []

  if (hasPricing) {
    const midPrice = Math.round(((effectiveMin ?? 0) + (effectiveMax ?? 0)) / 2)
    stats.push({
      key: 'price',
      icon: <Euro className="w-4 h-4 text-primary-500" />,
      label: 'Prix moyen',
      value: `${midPrice} ${unit}`,
      sublabel: `Fourchette : ${effectiveMin}–${effectiveMax} ${unit}`,
    })
  }

  if (hasResponseTime && trade?.averageResponseTime) {
    // Extract short delay from averageResponseTime (first part before semicolon)
    const shortDelay = trade.averageResponseTime.split(';')[0].trim()
    stats.push({
      key: 'delay',
      icon: <Clock className="w-4 h-4 text-secondary-600" />,
      label: variant === 'tarifs' ? 'Délai intervention' : 'Délai moyen',
      value: shortDelay,
    })
  }

  if (hasProviders) {
    stats.push({
      key: 'providers',
      icon: <Users className="w-4 h-4 text-secondary-600" />,
      label: 'Artisans disponibles',
      value: `${providerCount}`,
      sublabel: 'Vérifiés SIREN',
    })
  }

  if (hasRating && averageRating != null) {
    stats.push({
      key: 'rating',
      icon: <Star className="w-4 h-4 text-amber-500" />,
      label: 'Note moyenne',
      value: `${averageRating.toFixed(1)}/5`,
      sublabel: totalReviews ? `${totalReviews} avis` : undefined,
    })
  }

  return (
    <section
      aria-label={`Résumé ${svcLower} à ${villeName}`}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-2xl border border-sand-300 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 bg-sand-50 border-b border-sand-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-charcoal-700">
            {variant === 'tarifs'
              ? `Tarifs ${svcLower} à ${villeName} — en bref`
              : `${serviceName} à ${villeName} — en bref`}
          </span>
        </div>

        {/* Stats grid */}
        <div className="px-5 py-5">
          <div
            className={`grid gap-5 ${
              stats.length === 4
                ? 'grid-cols-2 lg:grid-cols-4'
                : stats.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : stats.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1'
            }`}
          >
            {stats.map((s) => (
              <StatItem
                key={s.key}
                icon={s.icon}
                label={s.label}
                value={s.value}
                sublabel={s.sublabel}
              />
            ))}
          </div>

          {/* Fallback: no providers */}
          {!hasProviders && (
            <p className="text-sm text-charcoal-400 mt-4 italic">
              Aucun artisan référencé pour le moment à {villeName}.
            </p>
          )}
        </div>

        {/* Source attribution for LLM citation */}
        <div className="px-5 pb-3 pt-1 border-t border-sand-100">
          <p className="text-xs text-charcoal-400" data-speakable="true">
            Source : <strong>ServicesArtisans</strong> — Données vérifiées SIREN/SIRET, mise à jour
            quotidienne.
            {hasProviders &&
              ` ${providerCount} ${svcLower}${providerCount > 1 ? 's' : ''} référencé${providerCount > 1 ? 's' : ''} à ${villeName}.`}
          </p>
        </div>
      </div>
    </section>
  )
}
