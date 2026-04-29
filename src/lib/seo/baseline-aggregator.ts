/**
 * Agrégateur de metrics SEO — calcule un instantané comparable de l'état
 * de `seo_page_scores`. Utilisé par :
 *   - `/api/cron/seo-baseline-snapshot` pour figer un snapshot horodaté
 *     dans `seo_baseline_snapshots` (Gate P0 du plan v2).
 *   - `/admin/(dashboard)/seo/foundations-impact` pour la comparaison live.
 *
 * Conception fail-soft : aucune query ne bloque l'agrégat. Les types qui
 * échouent à scanner remontent `count: 0` plutôt que de faire échouer le
 * snapshot complet (un snapshot incomplet vaut mieux que pas de snapshot).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type PageTypeBreakdown = {
  count: number
  indexed: number
  orphans: number
  avg_link_score: number
}

export type SeoAggregate = {
  total_pages: number
  indexed_count: number
  orphan_critical: number
  orphan_weak: number
  avg_link_score: number
  median_link_score: number
  by_page_type: Record<string, PageTypeBreakdown>
}

const PAGE_TYPES = ['services', 'tarifs', 'devis', 'avis', 'urgence', 'blog', 'hub', 'rge'] as const

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100
    : Math.round(sorted[mid] * 100) / 100
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / values.length) * 100) / 100
}

export async function computeSeoAggregate(supabase: SupabaseClient): Promise<SeoAggregate> {
  // Global counts via head:true (no row transfer).
  const [totalRes, indexedRes, orphanCriticalRes, orphanWeakRes, scoresRes] = await Promise.all([
    supabase.from('seo_page_scores').select('id', { count: 'exact', head: true }),
    supabase
      .from('seo_page_scores')
      .select('id', { count: 'exact', head: true })
      .eq('is_indexed', true),
    supabase
      .from('seo_page_scores')
      .select('id', { count: 'exact', head: true })
      .eq('is_orphan', true)
      .eq('internal_links_in', 0),
    supabase
      .from('seo_page_scores')
      .select('id', { count: 'exact', head: true })
      .eq('is_orphan', true)
      .gt('internal_links_in', 0),
    supabase.from('seo_page_scores').select('link_score').not('link_score', 'is', null).limit(5000),
  ])

  const scores = (scoresRes.data ?? []).map((r) => Number(r.link_score))

  const by_page_type: Record<string, PageTypeBreakdown> = {}
  await Promise.all(
    PAGE_TYPES.map(async (type) => {
      const [countRes, indexedTypeRes, orphansTypeRes, scoresTypeRes] = await Promise.all([
        supabase
          .from('seo_page_scores')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', type),
        supabase
          .from('seo_page_scores')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', type)
          .eq('is_indexed', true),
        supabase
          .from('seo_page_scores')
          .select('id', { count: 'exact', head: true })
          .eq('page_type', type)
          .eq('is_orphan', true),
        supabase
          .from('seo_page_scores')
          .select('link_score')
          .eq('page_type', type)
          .not('link_score', 'is', null)
          .limit(5000),
      ])
      const typeScores = (scoresTypeRes.data ?? []).map((r) => Number(r.link_score))
      const count = countRes.count ?? 0
      if (count > 0) {
        by_page_type[type] = {
          count,
          indexed: indexedTypeRes.count ?? 0,
          orphans: orphansTypeRes.count ?? 0,
          avg_link_score: average(typeScores),
        }
      }
    })
  )

  return {
    total_pages: totalRes.count ?? 0,
    indexed_count: indexedRes.count ?? 0,
    orphan_critical: orphanCriticalRes.count ?? 0,
    orphan_weak: orphanWeakRes.count ?? 0,
    avg_link_score: average(scores),
    median_link_score: median(scores),
    by_page_type,
  }
}

export type SnapshotDelta = {
  total_pages: number
  indexed_count: number
  orphan_critical: number
  orphan_weak: number
  avg_link_score: number
  median_link_score: number
  by_page_type: Record<
    string,
    { count: number; indexed: number; orphans: number; avg_link_score: number }
  >
}

export function diffAggregates(before: SeoAggregate, after: SeoAggregate): SnapshotDelta {
  const types = Array.from(
    new Set([...Object.keys(before.by_page_type), ...Object.keys(after.by_page_type)])
  )
  const by_page_type: SnapshotDelta['by_page_type'] = {}
  for (const t of types) {
    const b = before.by_page_type[t] ?? { count: 0, indexed: 0, orphans: 0, avg_link_score: 0 }
    const a = after.by_page_type[t] ?? { count: 0, indexed: 0, orphans: 0, avg_link_score: 0 }
    by_page_type[t] = {
      count: a.count - b.count,
      indexed: a.indexed - b.indexed,
      orphans: a.orphans - b.orphans,
      avg_link_score: Math.round((a.avg_link_score - b.avg_link_score) * 100) / 100,
    }
  }
  return {
    total_pages: after.total_pages - before.total_pages,
    indexed_count: after.indexed_count - before.indexed_count,
    orphan_critical: after.orphan_critical - before.orphan_critical,
    orphan_weak: after.orphan_weak - before.orphan_weak,
    avg_link_score: Math.round((after.avg_link_score - before.avg_link_score) * 100) / 100,
    median_link_score: Math.round((after.median_link_score - before.median_link_score) * 100) / 100,
    by_page_type,
  }
}
