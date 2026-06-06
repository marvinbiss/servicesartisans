import Link from 'next/link'
import useSWR from 'swr'
import { Star, MessageCircle, Mail, ArrowRight, Sparkles, Clock } from 'lucide-react'

type RatingDistribution = Record<'1' | '2' | '3' | '4' | '5', number>

type ReputationPayload = {
  reviews: {
    total: number
    published: number
    avgRating: number
    distribution: RatingDistribution
    pendingResponse: number
    latestPublishedAt: string | null
  }
  invitations: {
    sent7d: number
    sent30d: number
    pending30d: number
    completed30d: number
    completionRate30d: number | null
    nextScheduledAt: string | null
  }
}

const fetcher = (url: string): Promise<ReputationPayload> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Erreur ${r.status}`)
    return r.json()
  })

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const absDays = Math.abs(Math.round(diffMs / 86400000))

  if (absDays === 0) return "aujourd'hui"
  if (absDays === 1) return diffMs < 0 ? 'hier' : 'demain'
  if (diffMs < 0) return `il y a ${absDays} jours`
  return `dans ${absDays} jours`
}

function StarBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-charcoal-500 tabular-nums text-right">{rating}★</span>
      <div className="flex-1 h-2 rounded-full bg-sand-100 overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <span className="w-8 text-charcoal-500 tabular-nums">{count}</span>
    </div>
  )
}

export default function ReputationBlock() {
  const { data, error, isLoading } = useSWR<ReputationPayload>('/api/artisan/reputation', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60_000,
    dedupingInterval: 10_000,
  })

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl border border-sand-300 p-6"
        aria-busy="true"
        aria-label="Chargement de la réputation"
      >
        <div className="w-40 h-5 rounded bg-sand-200 animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 w-16 rounded bg-sand-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-sand-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) return null

  const { reviews, invitations } = data

  // Empty state : aucun avis encore mais flywheel activé
  const isEmpty = reviews.total === 0 && invitations.sent30d === 0

  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" aria-hidden />
          Votre réputation
        </h2>
        <Link
          href="/espace-artisan/profil?tab=avis"
          className="text-primary-500 hover:underline text-sm focus-visible:ring-2 focus-visible:ring-primary-400 rounded flex items-center gap-1"
        >
          Gérer mes avis <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      {isEmpty ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex gap-3">
          <Sparkles className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-primary-900">Votre flywheel avis démarre bientôt</p>
            <p className="text-primary-800/80 mt-1">
              Dès que des clients vous sont attribués, nous leur envoyons automatiquement une
              invitation à laisser un avis 7 jours après le devis. Aucun effort de votre côté.
            </p>
            {invitations.nextScheduledAt && (
              <p className="text-primary-700 mt-2 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                Prochaine invitation prévue {formatRelative(invitations.nextScheduledAt)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-charcoal-900 tabular-nums">
                  {reviews.avgRating.toFixed(1)}
                </span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden />
              </div>
              <p className="text-xs text-charcoal-500 mt-1">
                Note moyenne · {reviews.published} avis
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-900 tabular-nums">
                {invitations.sent7d}
              </div>
              <p className="text-xs text-charcoal-500 mt-1">Invitations envoyées (7j)</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-900 tabular-nums">
                {invitations.completionRate30d != null ? `${invitations.completionRate30d}%` : '—'}
              </div>
              <p className="text-xs text-charcoal-500 mt-1">
                Taux de réponse (30j · {invitations.completed30d}/{invitations.sent30d})
              </p>
            </div>
          </div>

          {/* Rating distribution */}
          {reviews.published > 0 && (
            <div className="space-y-1.5 mb-5" aria-label="Distribution des notes">
              {[5, 4, 3, 2, 1].map((rating) => (
                <StarBar
                  key={rating}
                  rating={rating}
                  count={reviews.distribution[String(rating) as keyof RatingDistribution]}
                  total={reviews.published}
                />
              ))}
            </div>
          )}

          {/* Action cards */}
          <div className="flex flex-col gap-2">
            {reviews.pendingResponse > 0 && (
              <Link
                href="/espace-artisan/profil?tab=avis"
                className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden />
                  <span className="text-sm font-medium text-amber-900">
                    {reviews.pendingResponse} avis en attente de votre réponse
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" aria-hidden />
              </Link>
            )}

            {invitations.pending30d > 0 && (
              <div className="flex items-center gap-2.5 p-3 bg-sand-50 rounded-lg text-sm">
                <Mail className="w-4 h-4 text-charcoal-500 shrink-0" aria-hidden />
                <span className="text-charcoal-700">
                  {invitations.pending30d} invitation{invitations.pending30d > 1 ? 's' : ''} client
                  en attente de réponse
                </span>
              </div>
            )}

            {invitations.nextScheduledAt && (
              <div className="flex items-center gap-2.5 p-3 bg-sand-50 rounded-lg text-xs text-charcoal-600">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>
                  Prochaine invitation programmée {formatRelative(invitations.nextScheduledAt)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
