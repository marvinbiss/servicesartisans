/**
 * Sitemap diff helper — Bouclier 5 plan ULTRA DOMINATION SEO v2.
 *
 * Compare l'inventaire courant (issus de `/api/cron/sitemap-health`) au
 * run précédent stocké dans `sitemap_health_runs`. Émet des alertes
 * structurées si la variation dépasse `DIFF_ALERT_PCT_THRESHOLD` par
 * sitemap. Pas d'I/O réseau ici : toutes les queries passent par le
 * SupabaseClient injecté.
 *
 * Conception fail-safe : aucune erreur DB ne bloque l'inventaire courant.
 * Diff alerts revient `[]` si on ne peut pas calculer (run précédent
 * absent, query KO, etc.).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/** Seuil au-delà duquel un diff de comptage URL est jugé anormal. */
export const DIFF_ALERT_PCT_THRESHOLD = 0.05

export type SitemapRun = {
  sitemap_url: string
  url_count: number
  status: number
  ok: boolean
}

export type SitemapDiffAlert = {
  sitemap_url: string
  before_count: number
  after_count: number
  delta_pct: number
  before_run_at: string
  severity: 'warn' | 'critical'
}

/** Severity escalade au-delà de 20% (probable régression catastrophique). */
const CRITICAL_PCT = 0.2

export function classifyDelta(
  beforeCount: number,
  afterCount: number
): SitemapDiffAlert['severity'] | null {
  if (beforeCount <= 0) return null // pas de baseline → pas d'alerte
  const pct = Math.abs(afterCount - beforeCount) / beforeCount
  if (pct >= CRITICAL_PCT) return 'critical'
  if (pct >= DIFF_ALERT_PCT_THRESHOLD) return 'warn'
  return null
}

/** Calcule la variation en pourcentage signé (negative = drop). */
export function computeDeltaPct(beforeCount: number, afterCount: number): number {
  if (beforeCount <= 0) return 0
  return Math.round(((afterCount - beforeCount) / beforeCount) * 10000) / 10000
}

/**
 * Lit le dernier run précédent de chaque sitemap_url et compare.
 * Renvoie une liste d'alertes (vide si rien d'anormal ou si pas de baseline).
 */
export async function computeSitemapDiff(
  supabase: SupabaseClient,
  currentRuns: SitemapRun[]
): Promise<SitemapDiffAlert[]> {
  if (currentRuns.length === 0) return []

  // Pour chaque sitemap_url, récupère le dernier run précédent.
  // On préfère N petites queries indexées (idx_sitemap_health_runs_url_run_at_desc)
  // à un GROUP BY massif côté DB pour cap CPU sur Supabase.
  const previousByUrl = new Map<string, { url_count: number; run_at: string } | null>()

  await Promise.all(
    currentRuns.map(async (run) => {
      try {
        const { data, error } = await supabase
          .from('sitemap_health_runs')
          .select('url_count, run_at')
          .eq('sitemap_url', run.sitemap_url)
          .order('run_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error) {
          previousByUrl.set(run.sitemap_url, null)
          return
        }
        previousByUrl.set(run.sitemap_url, data ?? null)
      } catch {
        previousByUrl.set(run.sitemap_url, null)
      }
    })
  )

  const alerts: SitemapDiffAlert[] = []
  for (const run of currentRuns) {
    const prev = previousByUrl.get(run.sitemap_url) ?? null
    if (!prev || prev.url_count <= 0) continue
    const severity = classifyDelta(prev.url_count, run.url_count)
    if (!severity) continue
    alerts.push({
      sitemap_url: run.sitemap_url,
      before_count: prev.url_count,
      after_count: run.url_count,
      delta_pct: computeDeltaPct(prev.url_count, run.url_count),
      before_run_at: prev.run_at,
      severity,
    })
  }
  return alerts
}

/**
 * Persiste l'inventaire courant. Insert batch — fail-safe (loggé puis ignoré).
 */
export async function persistSitemapRun(
  supabase: SupabaseClient,
  runs: SitemapRun[]
): Promise<{ ok: boolean; inserted: number }> {
  if (runs.length === 0) return { ok: true, inserted: 0 }
  const now = new Date().toISOString()
  const rows = runs.map((r) => ({
    run_at: now,
    sitemap_url: r.sitemap_url,
    url_count: r.url_count,
    status: r.status,
    ok: r.ok,
  }))
  const { error } = await supabase.from('sitemap_health_runs').insert(rows)
  if (error) return { ok: false, inserted: 0 }
  return { ok: true, inserted: rows.length }
}
