'use client'

import { useMemo } from 'react'
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { useAdminFetch } from '@/hooks/admin/useAdminFetch'
import { pctDelta, formatPctDelta } from '@/lib/metrics/delta'

type Snapshot = {
  id: number
  captured_at: string
  clicks_7d: number | null
  impressions_7d: number | null
  ctr_pct: number | null
  urls_indexed: number | null
  position_avg: number | null
  dr_ahrefs: number | null
  rd_ahrefs: number | null
  backlinks_total: number | null
  organic_keywords: number | null
  devis_requests_7d: number
  devis_requests_total: number
  estimation_leads_7d: number
  cee_leads_7d: number
  conversion_rate: number | null
  providers_total: number
  providers_rge_active: number
  providers_claimed: number
  claims_pending: number
  claims_approved_7d: number
  reviews_total: number
  reviews_published: number
  reviews_7d: number
  invitations_sent_7d: number
  providers_with_description: number
  notes: string | null
}

type MetricsPayload = {
  success: boolean
  latest: Snapshot | null
  baseline: Snapshot | null
  baselineDate: string
  series: Snapshot[]
  days: number
}

function deltaColor(
  current: number | null | undefined,
  baseline: number | null | undefined
): string {
  if (current == null || baseline == null) return 'text-charcoal-500'
  if (current > baseline) return 'text-green-600'
  if (current < baseline) return 'text-red-600'
  return 'text-charcoal-500'
}

function deltaIcon(current: number | null | undefined, baseline: number | null | undefined) {
  if (current == null || baseline == null) return <Minus className="w-4 h-4" />
  if (current > baseline) return <TrendingUp className="w-4 h-4" />
  if (current < baseline) return <TrendingDown className="w-4 h-4" />
  return <Minus className="w-4 h-4" />
}

function fmt(n: number | null | undefined, decimals = 0): string {
  if (n == null) return '—'
  if (typeof n === 'number' && Number.isFinite(n)) {
    return decimals === 0
      ? Math.round(n).toLocaleString('fr-FR')
      : n.toLocaleString('fr-FR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
  }
  return String(n)
}

function MetricCard({
  label,
  current,
  baseline,
  unit = '',
  decimals = 0,
  target,
}: {
  label: string
  current: number | null | undefined
  baseline: number | null | undefined
  unit?: string
  decimals?: number
  target?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5">
      <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-charcoal-900 mb-1">
        {fmt(current, decimals)}
        {current != null && unit && (
          <span className="text-base font-normal text-charcoal-500 ml-1">{unit}</span>
        )}
      </div>
      <div
        className={`flex items-center gap-1.5 text-sm font-medium ${deltaColor(current ?? null, baseline ?? null)}`}
      >
        {deltaIcon(current ?? null, baseline ?? null)}
        <span>{formatPctDelta(pctDelta(current, baseline))}</span>
        <span className="text-charcoal-400 text-xs">vs J0</span>
      </div>
      {target && <div className="text-xs text-charcoal-500 mt-2">🎯 {target}</div>}
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Chargement des métriques CEO"
    >
      <div>
        <div className="h-7 w-64 bg-sand-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-80 bg-sand-100 rounded animate-pulse" />
      </div>
      {Array.from({ length: 6 }).map((_, section) => (
        <section key={section}>
          <div className="h-3 w-24 bg-sand-200 rounded animate-pulse mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-sand-200 p-5 space-y-2">
                <div className="h-3 w-20 bg-sand-100 rounded animate-pulse" />
                <div className="h-7 w-24 bg-sand-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-sand-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function MetricsPage() {
  const { data, error, isLoading, mutate } = useAdminFetch<MetricsPayload>(
    '/api/admin/metrics?days=30'
  )

  const sortedSeries = useMemo(() => {
    if (!data?.series) return []
    return [...data.series].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1))
  }, [data])

  if (isLoading) {
    return <MetricsSkeleton />
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1">
          <p className="font-medium text-red-900">Erreur de chargement</p>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="text-sm font-medium text-red-700 hover:text-red-900 underline focus-visible:ring-2 focus-visible:ring-red-500 rounded"
        >
          Réessayer
        </button>
      </div>
    )
  }

  const latest = data?.latest ?? null
  const baseline = data?.baseline ?? null

  if (!latest) {
    return (
      <div className="bg-white rounded-xl border border-sand-200 p-8 text-center">
        <Activity className="w-8 h-8 text-charcoal-400 mx-auto mb-3" aria-hidden />
        <p className="text-charcoal-700 font-medium">Aucun snapshot disponible.</p>
        <p className="text-sm text-charcoal-500 mt-2">
          Lance{' '}
          <code className="px-1.5 py-0.5 bg-sand-100 rounded">
            SELECT snapshot_metrics_daily();
          </code>{' '}
          manuellement ou attends 08:00 UTC pour le cron.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6" role="main" aria-label="Métriques CEO">
      <header>
        <h1 className="text-2xl font-bold text-charcoal-900 mb-1">Métriques CEO — S1 baseline</h1>
        <p className="text-sm text-charcoal-500">
          Snapshot du {latest.captured_at} · Baseline J0 = {data?.baselineDate}
          {!baseline && ' · (J0 non capturé — exécute snapshot_metrics_daily() le 2026-04-22)'}
        </p>
      </header>

      {/* SEO block */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">SEO</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Clics 7j"
            current={latest.clicks_7d}
            baseline={baseline?.clicks_7d}
            target="≥ 500/j S4"
          />
          <MetricCard
            label="Impressions 7j"
            current={latest.impressions_7d}
            baseline={baseline?.impressions_7d}
          />
          <MetricCard
            label="CTR"
            current={latest.ctr_pct}
            baseline={baseline?.ctr_pct}
            unit="%"
            decimals={2}
          />
          <MetricCard
            label="Position moy."
            current={latest.position_avg}
            baseline={baseline?.position_avg}
            decimals={1}
          />
        </div>
      </section>

      {/* Funnel block */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          Funnel — S2 cible
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Devis 7j"
            current={latest.devis_requests_7d}
            baseline={baseline?.devis_requests_7d}
          />
          <MetricCard
            label="Conversion"
            current={latest.conversion_rate}
            baseline={baseline?.conversion_rate}
            unit="%"
            decimals={3}
            target="0,7 % → ≥ 1,2 %"
          />
          <MetricCard
            label="Estim. simu 7j"
            current={latest.estimation_leads_7d}
            baseline={baseline?.estimation_leads_7d}
          />
          <MetricCard
            label="CEE leads 7j"
            current={latest.cee_leads_7d}
            baseline={baseline?.cee_leads_7d}
          />
        </div>
      </section>

      {/* Supply-side block */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          Supply-side — S3 cible
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Claims total"
            current={latest.providers_claimed}
            baseline={baseline?.providers_claimed}
            target="19 → ≥ 50 à J+21"
          />
          <MetricCard
            label="Claims approuvés 7j"
            current={latest.claims_approved_7d}
            baseline={baseline?.claims_approved_7d}
          />
          <MetricCard
            label="Claims pending"
            current={latest.claims_pending}
            baseline={baseline?.claims_pending}
          />
          <MetricCard
            label="Providers RGE actifs"
            current={latest.providers_rge_active}
            baseline={baseline?.providers_rge_active}
          />
        </div>
      </section>

      {/* UGC / flywheel block */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          UGC flywheel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Reviews total"
            current={latest.reviews_total}
            baseline={baseline?.reviews_total}
          />
          <MetricCard
            label="Reviews publiés"
            current={latest.reviews_published}
            baseline={baseline?.reviews_published}
          />
          <MetricCard
            label="Reviews 7j"
            current={latest.reviews_7d}
            baseline={baseline?.reviews_7d}
            target="≥ 20 à J+30"
          />
          <MetricCard
            label="Invitations 7j"
            current={latest.invitations_sent_7d}
            baseline={baseline?.invitations_sent_7d}
          />
        </div>
      </section>

      {/* Backlinks block */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          Backlinks — S4 cible
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="DR Ahrefs"
            current={latest.dr_ahrefs}
            baseline={baseline?.dr_ahrefs}
            decimals={1}
          />
          <MetricCard
            label="RD (ref. domains)"
            current={latest.rd_ahrefs}
            baseline={baseline?.rd_ahrefs}
            target="+ 3 à J+30"
          />
          <MetricCard
            label="Backlinks"
            current={latest.backlinks_total}
            baseline={baseline?.backlinks_total}
          />
          <MetricCard
            label="KW organiques"
            current={latest.organic_keywords}
            baseline={baseline?.organic_keywords}
          />
        </div>
      </section>

      {/* Content quality */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          Qualité contenu
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="URLs indexées"
            current={latest.urls_indexed}
            baseline={baseline?.urls_indexed}
          />
          <MetricCard
            label="Providers avec description"
            current={latest.providers_with_description}
            baseline={baseline?.providers_with_description}
          />
          <MetricCard
            label="Providers total"
            current={latest.providers_total}
            baseline={baseline?.providers_total}
          />
        </div>
      </section>

      {/* Série 30j */}
      <section>
        <h2 className="text-xs font-bold text-charcoal-700 uppercase tracking-widest mb-3">
          Série {data?.days ?? 30} jours ({sortedSeries.length} snapshots)
        </h2>
        <div className="bg-white rounded-xl border border-sand-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-sand-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-charcoal-700">Date</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">Clics 7j</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">Devis 7j</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">Conv.</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">Claims</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">Avis 7j</th>
                <th className="text-right px-4 py-2 font-semibold text-charcoal-700">DR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {sortedSeries.map((s) => (
                <tr
                  key={s.id}
                  className={s.captured_at === data?.baselineDate ? 'bg-primary-50' : ''}
                >
                  <td className="px-4 py-2 font-mono text-xs text-charcoal-600">
                    {s.captured_at}
                    {s.captured_at === data?.baselineDate && (
                      <span className="ml-2 text-[10px] font-bold text-primary-700 uppercase">
                        J0
                      </span>
                    )}
                  </td>
                  <td className="text-right px-4 py-2 tabular-nums">{fmt(s.clicks_7d)}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{fmt(s.devis_requests_7d)}</td>
                  <td className="text-right px-4 py-2 tabular-nums">
                    {s.conversion_rate != null ? `${s.conversion_rate.toFixed(2)} %` : '—'}
                  </td>
                  <td className="text-right px-4 py-2 tabular-nums">{fmt(s.providers_claimed)}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{fmt(s.reviews_7d)}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{fmt(s.dr_ahrefs, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
