/**
 * Admin Dashboard — Foundations Impact (Plan ULTRA DOMINATION SEO v2)
 * ----------------------------------------------------------------------------
 * Compare deux snapshots `seo_baseline_snapshots` pour valider le Gate P0
 * J+30 (+50% clics requis avant lancement P1). Snapshot par défaut :
 * "before" = snapshot le plus ancien dans la fenêtre 90j, "after" = plus
 * récent. Override via query string `?before=<label>&after=<label>`.
 *
 * Auth : `requirePermission('settings', 'read')` (alignement RGE health).
 * Lecture only — l'écriture passe par /api/cron/seo-baseline-snapshot.
 */

import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  diffAggregates,
  type SeoAggregate,
  type PageTypeBreakdown,
} from '@/lib/seo/baseline-aggregator'
import { ArrowDown, ArrowRight, ArrowUp, Calendar, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SnapshotRow = {
  id: string
  label: string
  snapshot_date: string
  total_pages: number
  indexed_count: number
  orphan_critical: number
  orphan_weak: number
  avg_link_score: number | null
  median_link_score: number | null
  by_page_type: Record<string, PageTypeBreakdown>
  notes: string | null
}

function rowToAggregate(row: SnapshotRow): SeoAggregate {
  return {
    total_pages: row.total_pages,
    indexed_count: row.indexed_count,
    orphan_critical: row.orphan_critical,
    orphan_weak: row.orphan_weak,
    avg_link_score: row.avg_link_score ?? 0,
    median_link_score: row.median_link_score ?? 0,
    by_page_type: row.by_page_type ?? {},
  }
}

function fmtNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

function fmtSigned(n: number): string {
  if (n === 0) return '0'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toLocaleString('fr-FR')}`
}

function DeltaCell({
  value,
  invert = false,
}: {
  value: number
  /** If true, negative values are "good" (e.g. fewer orphans). */
  invert?: boolean
}) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500">
        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        {fmtSigned(value)}
      </span>
    )
  }
  const isImprovement = invert ? value < 0 : value > 0
  const cls = isImprovement ? 'text-emerald-700' : 'text-red-700'
  const Icon = value > 0 ? ArrowUp : ArrowDown
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${cls}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {fmtSigned(value)}
    </span>
  )
}

type PageProps = {
  searchParams?: Promise<{ before?: string; after?: string }>
}

export default async function FoundationsImpactPage({ searchParams }: PageProps) {
  const auth = await requirePermission('settings', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }

  const params = (await searchParams) ?? {}
  const supabase = createAdminClient()

  // Liste les 30 derniers snapshots pour le sélecteur
  const { data: snapshots, error: listError } = await supabase
    .from('seo_baseline_snapshots')
    .select(
      'id, label, snapshot_date, total_pages, indexed_count, orphan_critical, orphan_weak, avg_link_score, median_link_score, by_page_type, notes'
    )
    .order('snapshot_date', { ascending: false })
    .limit(30)

  const list = (snapshots ?? []) as SnapshotRow[]

  // Choix par défaut : after = plus récent, before = plus ancien dans la liste
  const beforeLabel = params.before ?? list[list.length - 1]?.label
  const afterLabel = params.after ?? list[0]?.label

  const before = list.find((r) => r.label === beforeLabel) ?? null
  const after = list.find((r) => r.label === afterLabel) ?? null

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO — Foundations Impact</h1>
        <p className="text-sm text-gray-600 mt-1">
          Compare deux snapshots de <code>seo_page_scores</code> pour mesurer l&apos;impact des
          sprints P0 du plan ULTRA DOMINATION SEO v2. Gate P0 : <strong>+50%</strong> clics attendus
          à J+30.
        </p>
      </header>

      {listError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Erreur lecture <code>seo_baseline_snapshots</code> : {listError.message}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-900">
          <p className="font-semibold mb-2">Aucun snapshot enregistré.</p>
          <p className="text-sm mb-3">
            Pour créer le baseline initial, exécutez (depuis un environnement avec accès au cron
            secret) :
          </p>
          <pre className="rounded bg-white border border-yellow-200 p-3 text-xs overflow-auto">
            {`curl -X POST https://servicesartisans.fr/api/cron/seo-baseline-snapshot \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"baseline-2026-04-29","notes":"Post-bugs-fix v2 + dept fallback"}'`}
          </pre>
        </div>
      ) : (
        <>
          <SnapshotPicker snapshots={list} beforeLabel={beforeLabel} afterLabel={afterLabel} />

          {before && after ? (
            <ComparisonView before={before} after={after} />
          ) : (
            <p className="mt-6 text-sm text-gray-600">
              Sélectionnez deux snapshots distincts pour voir le delta.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function SnapshotPicker({
  snapshots,
  beforeLabel,
  afterLabel,
}: {
  snapshots: SnapshotRow[]
  beforeLabel: string | undefined
  afterLabel: string | undefined
}) {
  return (
    <form className="grid sm:grid-cols-2 gap-4 mb-8" method="get">
      <label className="block">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">
          Avant
        </span>
        <select
          name="before"
          defaultValue={beforeLabel}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          {snapshots.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label} — {new Date(s.snapshot_date).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">
          Après
        </span>
        <select
          name="after"
          defaultValue={afterLabel}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          {snapshots.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label} — {new Date(s.snapshot_date).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
        >
          Comparer
        </button>
      </div>
    </form>
  )
}

function ComparisonView({ before, after }: { before: SnapshotRow; after: SnapshotRow }) {
  const delta = diffAggregates(rowToAggregate(before), rowToAggregate(after))
  const types = Array.from(
    new Set([...Object.keys(before.by_page_type ?? {}), ...Object.keys(after.by_page_type ?? {})])
  ).sort()

  return (
    <section className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <SnapshotCard row={before} kind="Avant" />
        <SnapshotCard row={after} kind="Après" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <header className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">Delta global</h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
          <DeltaTile label="Total pages" value={delta.total_pages} />
          <DeltaTile label="Pages indexées" value={delta.indexed_count} />
          <DeltaTile label="Orphans critiques" value={delta.orphan_critical} invert />
          <DeltaTile label="Orphans faibles" value={delta.orphan_weak} invert />
          <DeltaTile label="Score moyen" value={delta.avg_link_score} />
          <DeltaTile label="Score médian" value={delta.median_link_score} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <header className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 text-sm">Delta par template</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Template</th>
                <th className="text-right px-4 py-2 font-semibold">Δ count</th>
                <th className="text-right px-4 py-2 font-semibold">Δ indexées</th>
                <th className="text-right px-4 py-2 font-semibold">Δ orphans</th>
                <th className="text-right px-4 py-2 font-semibold">Δ score moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.map((t) => {
                const d = delta.by_page_type[t] ?? {
                  count: 0,
                  indexed: 0,
                  orphans: 0,
                  avg_link_score: 0,
                }
                return (
                  <tr key={t} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{t}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <DeltaCell value={d.count} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <DeltaCell value={d.indexed} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <DeltaCell value={d.orphans} invert />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      <DeltaCell value={d.avg_link_score} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function SnapshotCard({ row, kind }: { row: SnapshotRow; kind: 'Avant' | 'Après' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <header className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kind}</span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" aria-hidden />
          {new Date(row.snapshot_date).toLocaleString('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </header>
      <p className="font-mono text-sm text-gray-900 flex items-center gap-1.5 mb-3">
        <Tag className="w-3.5 h-3.5 text-gray-400" aria-hidden />
        {row.label}
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-gray-500">Total pages</dt>
        <dd className="text-right font-semibold tabular-nums">{fmtNumber(row.total_pages)}</dd>
        <dt className="text-gray-500">Indexées</dt>
        <dd className="text-right font-semibold tabular-nums">{fmtNumber(row.indexed_count)}</dd>
        <dt className="text-gray-500">Orphans crit.</dt>
        <dd className="text-right font-semibold tabular-nums">{fmtNumber(row.orphan_critical)}</dd>
        <dt className="text-gray-500">Orphans faibles</dt>
        <dd className="text-right font-semibold tabular-nums">{fmtNumber(row.orphan_weak)}</dd>
        <dt className="text-gray-500">Score moyen</dt>
        <dd className="text-right font-semibold tabular-nums">
          {row.avg_link_score?.toFixed(2) ?? '0.00'}
        </dd>
      </dl>
      {row.notes && <p className="mt-3 text-xs text-gray-600 italic">{row.notes}</p>}
    </div>
  )
}

function DeltaTile({
  label,
  value,
  invert = false,
}: {
  label: string
  value: number
  invert?: boolean
}) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-bold tabular-nums">
        <DeltaCell value={value} invert={invert} />
      </p>
    </div>
  )
}
