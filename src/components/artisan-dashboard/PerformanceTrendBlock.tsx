'use client'

import useSWR from 'swr'
import { Eye, Phone, PhoneCall, FileText, TrendingUp, TrendingDown } from 'lucide-react'

type DayPoint = { day: string; count: number }

type TrendsPayload = {
  days: number
  series: {
    profileViews: DayPoint[]
    phoneReveals: DayPoint[]
    phoneClicks: DayPoint[]
    demandesRecues: DayPoint[]
  }
  totals: {
    profileViews: number
    phoneReveals: number
    phoneClicks: number
    demandesRecues: number
  }
}

const fetcher = (url: string): Promise<TrendsPayload> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Erreur ${r.status}`)
    return r.json()
  })

function splitHalves(series: DayPoint[]): { first: number; second: number } {
  if (series.length === 0) return { first: 0, second: 0 }
  const mid = Math.floor(series.length / 2)
  const first = series.slice(0, mid).reduce((s, p) => s + p.count, 0)
  const second = series.slice(mid).reduce((s, p) => s + p.count, 0)
  return { first, second }
}

function computeDeltaPct(series: DayPoint[]): number | null {
  const { first, second } = splitHalves(series)
  if (first === 0 && second === 0) return null
  if (first === 0) return 100
  return Math.round(((second - first) / first) * 100)
}

function Sparkline({
  points,
  colorClass,
  ariaLabel,
}: {
  points: DayPoint[]
  colorClass: string
  ariaLabel: string
}) {
  if (points.length === 0) {
    return (
      <svg viewBox="0 0 100 24" className="w-full h-8" role="img" aria-label={ariaLabel}>
        <line x1="0" y1="22" x2="100" y2="22" stroke="currentColor" className="text-sand-200" />
      </svg>
    )
  }

  const max = Math.max(1, ...points.map((p) => p.count))
  const stepX = points.length > 1 ? 100 / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = i * stepX
    const y = 22 - (p.count / max) * 20
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const path = `M ${coords.join(' L ')}`
  const areaPath = `${path} L ${(points.length - 1) * stepX},24 L 0,24 Z`
  const lastPoint = coords[coords.length - 1]?.split(',') ?? ['0', '22']

  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={`w-full h-8 ${colorClass}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d={areaPath} fill="currentColor" opacity="0.12" />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="1.6" fill="currentColor" />
    </svg>
  )
}

function TrendRow({
  label,
  total,
  series,
  icon,
  colorClass,
  deltaLabel,
}: {
  label: string
  total: number
  series: DayPoint[]
  icon: React.ReactNode
  colorClass: string
  deltaLabel: string
}) {
  const delta = computeDeltaPct(series)

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex items-center gap-2 w-40 shrink-0">
        <span className={`shrink-0 ${colorClass}`}>{icon}</span>
        <span className="text-sm text-charcoal-700">{label}</span>
      </div>

      <div className="flex items-baseline gap-2 w-24 shrink-0">
        <span className="text-xl font-bold text-charcoal-900 tabular-nums">{total}</span>
        {delta != null && delta !== 0 && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              delta > 0 ? 'text-green-600' : 'text-red-600'
            }`}
            aria-label={`Évolution ${delta > 0 ? 'positive' : 'négative'} de ${Math.abs(delta)} pourcent ${deltaLabel}`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" aria-hidden />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden />
            )}
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Sparkline
          points={series}
          colorClass={colorClass}
          ariaLabel={`Série ${label} — ${series.length} points`}
        />
      </div>
    </div>
  )
}

export default function PerformanceTrendBlock() {
  const { data, error, isLoading } = useSWR<TrendsPayload>('/api/artisan/trends?days=30', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300_000,
    dedupingInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl border border-sand-300 p-6"
        aria-busy="true"
        aria-label="Chargement des tendances"
      >
        <div className="w-56 h-5 rounded bg-sand-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-sand-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) return null

  const { series, totals } = data
  const hasAnyData =
    totals.profileViews + totals.phoneReveals + totals.phoneClicks + totals.demandesRecues > 0

  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-charcoal-900">Tendance sur 30 jours</h2>
        <span className="text-xs text-charcoal-500">Comparaison 15j récents vs 15j précédents</span>
      </div>

      {!hasAnyData ? (
        <p className="text-sm text-charcoal-500 py-4">
          Aucune activité enregistrée sur les 30 derniers jours. Les courbes apparaîtront dès que
          des visiteurs consultent votre profil ou que vous recevez des demandes.
        </p>
      ) : (
        <div className="divide-y divide-sand-100">
          <TrendRow
            label="Vues du profil"
            total={totals.profileViews}
            series={series.profileViews}
            icon={<Eye className="w-4 h-4" aria-hidden />}
            colorClass="text-blue-600"
            deltaLabel="sur la seconde moitié de la période"
          />
          <TrendRow
            label="Numéros affichés"
            total={totals.phoneReveals}
            series={series.phoneReveals}
            icon={<Phone className="w-4 h-4" aria-hidden />}
            colorClass="text-green-600"
            deltaLabel="sur la seconde moitié de la période"
          />
          <TrendRow
            label="Appels reçus"
            total={totals.phoneClicks}
            series={series.phoneClicks}
            icon={<PhoneCall className="w-4 h-4" aria-hidden />}
            colorClass="text-indigo-600"
            deltaLabel="sur la seconde moitié de la période"
          />
          <TrendRow
            label="Demandes reçues"
            total={totals.demandesRecues}
            series={series.demandesRecues}
            icon={<FileText className="w-4 h-4" aria-hidden />}
            colorClass="text-amber-600"
            deltaLabel="sur la seconde moitié de la période"
          />
        </div>
      )}
    </div>
  )
}
