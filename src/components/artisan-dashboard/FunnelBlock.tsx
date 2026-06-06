import Link from 'next/link'
import useSWR from 'swr'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  Send,
  Timer,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

type FunnelPayload = {
  days: number
  counts: {
    assigned: number
    viewed: number
    quoted: number
    declined: number
    pending: number
  }
  rates: {
    responseRate: number | null
    quoteRate: number | null
    declineRate: number | null
  }
  responseMedianMinutes: number | null
  previousPeriod: {
    assigned: number
    responseRate: number | null
  }
}

const fetcher = (url: string): Promise<FunnelPayload> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Erreur ${r.status}`)
    return r.json()
  })

function formatMinutes(minutes: number | null): string {
  if (minutes == null) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest === 0 ? `${hours} h` : `${hours} h ${rest}`
  const days = Math.floor(hours / 24)
  const restH = hours % 24
  return restH === 0 ? `${days} j` : `${days} j ${restH} h`
}

function formatPct(value: number | null): string {
  if (value == null) return '—'
  return `${value}%`
}

function computeDelta(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null
  return Math.round((current - previous) * 10) / 10
}

export default function FunnelBlock() {
  const { data, error, isLoading } = useSWR<FunnelPayload>('/api/artisan/funnel?days=30', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 120_000,
    dedupingInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl border border-sand-300 p-6"
        aria-busy="true"
        aria-label="Chargement du funnel de conversion"
      >
        <div className="w-48 h-5 rounded bg-sand-200 animate-pulse mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-sand-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) return null

  const { counts, rates, responseMedianMinutes, previousPeriod } = data
  const responseDelta = computeDelta(rates.responseRate, previousPeriod.responseRate)

  // Empty state : aucun lead sur la période
  if (counts.assigned === 0) {
    return (
      <div className="bg-white rounded-xl border border-sand-300 p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-charcoal-400" aria-hidden />
          Conversion des demandes (30 jours)
        </h2>
        <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 text-sm text-charcoal-600">
          Aucune demande reçue sur les 30 derniers jours. Dès qu&apos;un client vous sera attribué,
          son parcours (vu → accepté → devis) s&apos;affichera ici.
        </div>
      </div>
    )
  }

  // Funnel steps — largeur proportionnelle à assigned
  const steps = [
    {
      key: 'assigned',
      label: 'Attribuées',
      value: counts.assigned,
      icon: <Send className="w-4 h-4" aria-hidden />,
      tone: 'bg-primary-500',
    },
    {
      key: 'viewed',
      label: 'Consultées',
      value: counts.viewed,
      icon: <Eye className="w-4 h-4" aria-hidden />,
      tone: 'bg-primary-400',
    },
    {
      key: 'quoted',
      label: 'Devis envoyé',
      value: counts.quoted,
      icon: <CheckCircle2 className="w-4 h-4" aria-hidden />,
      tone: 'bg-primary-300',
    },
  ]

  const lowResponse = rates.responseRate != null && rates.responseRate < 50

  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" aria-hidden />
          Conversion des demandes (30 jours)
        </h2>
        <Link
          href="/espace-artisan/demandes"
          className="text-primary-500 hover:underline text-sm focus-visible:ring-2 focus-visible:ring-primary-400 rounded flex items-center gap-1"
        >
          Voir les demandes <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      {/* Funnel bars */}
      <ol className="space-y-2 mb-5" aria-label="Étapes du funnel de conversion">
        {steps.map((step) => {
          const pct = counts.assigned > 0 ? Math.round((step.value / counts.assigned) * 100) : 0
          return (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span className="w-28 flex items-center gap-2 text-charcoal-600 shrink-0">
                {step.icon}
                {step.label}
              </span>
              <div className="flex-1 h-7 rounded-md bg-sand-100 overflow-hidden relative">
                <div
                  className={`h-full ${step.tone} transition-all`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                  aria-hidden
                />
                <span className="absolute inset-y-0 left-2 flex items-center text-xs font-medium text-charcoal-800">
                  {step.value}{' '}
                  {pct > 0 && <span className="ml-1.5 text-charcoal-500">· {pct}%</span>}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-charcoal-900 tabular-nums">
              {formatPct(rates.responseRate)}
            </span>
            {responseDelta != null && responseDelta !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  responseDelta > 0 ? 'text-green-600' : 'text-red-600'
                }`}
                aria-label={`Évolution ${responseDelta > 0 ? 'positive' : 'négative'} de ${Math.abs(responseDelta)} points`}
              >
                {responseDelta > 0 ? (
                  <TrendingUp className="w-3 h-3" aria-hidden />
                ) : (
                  <TrendingDown className="w-3 h-3" aria-hidden />
                )}
                {responseDelta > 0 ? '+' : ''}
                {responseDelta} pt
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">Taux de réponse · consulté / attribué</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-charcoal-900 tabular-nums">
            {formatPct(rates.quoteRate)}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">Taux de devis · quoted / consulté</p>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-charcoal-900 tabular-nums">
              {formatMinutes(responseMedianMinutes)}
            </span>
            <Timer className="w-4 h-4 text-charcoal-400" aria-hidden />
          </div>
          <p className="text-xs text-charcoal-500 mt-1">Délai médian de réponse</p>
        </div>
      </div>

      {/* Dispatch signal nudge — explique le weight_response_rate */}
      {lowResponse && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-amber-900">
            <p className="font-medium">Votre taux de réponse est inférieur à 50%.</p>
            <p className="text-amber-800/90 mt-0.5 text-xs">
              Nous priorisons l&apos;attribution des nouvelles demandes aux artisans qui consultent
              rapidement leurs leads. Consulter une demande sous 24h augmente directement le volume
              que vous recevez.
            </p>
          </div>
        </div>
      )}

      {!lowResponse && rates.responseRate != null && rates.responseRate >= 80 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-green-900">
            <p className="font-medium">Excellent taux de réponse.</p>
            <p className="text-green-800/90 mt-0.5 text-xs">
              Vous figurez parmi les artisans prioritaires dans notre attribution : plus vous
              consultez vite, plus vous recevez.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
