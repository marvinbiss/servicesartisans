/**
 * Lighthouse monitor — Bouclier 4 plan ULTRA DOMINATION SEO v2.
 *
 * Hits PageSpeed Insights API publique (gratuit, optionnel API key pour
 * passer la quota anonyme), parse Core Web Vitals + score performance,
 * persiste dans `lighthouse_scores`. Pas de Chrome local — tout serveur
 * Google.
 *
 * Conception fail-safe : aucun PSI call ne bloque le cron. Une URL en
 * erreur revient `null` et le snapshot n'est pas inséré (vs algo-monitor
 * qui force un fallback `calm` — ici une absence est plus utile pour
 * detecter le pattern "URL devenue 404").
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/** Seuils sévérité — alignés sur thresholds Web Vitals officiels Google. */
export const LIGHTHOUSE_PERF_CRITICAL = 50
export const LIGHTHOUSE_PERF_WARN = 70
export const LIGHTHOUSE_LCP_CRITICAL_MS = 4000
export const LIGHTHOUSE_CLS_CRITICAL = 0.25

/** Cap raw_audit (octets) — aligné sur CHECK constraint migration 481. */
const RAW_AUDIT_MAX_BYTES = 96 * 1024
/** Cap body PSI (octets) — anti-OOM si réponse anormalement large. */
const PSI_BODY_MAX_BYTES = 4 * 1024 * 1024

export type LighthouseStrategy = 'mobile' | 'desktop'
export type LighthouseSeverity = 'ok' | 'warn' | 'critical'

export type LighthouseScore = {
  url: string
  strategy: LighthouseStrategy
  performanceScore: number | null
  lcpMs: number | null
  cls: number | null
  inpMs: number | null
  fcpMs: number | null
  tbtMs: number | null
  severity: LighthouseSeverity
  rawAudit: Record<string, unknown>
}

/**
 * Classe la sévérité d'un audit Lighthouse.
 * critical = perf<50 OR LCP>4s OR CLS>0.25 (CWV "fail").
 * warn = perf<70 (CWV "needs improvement").
 * ok = sinon.
 */
export function classifyLighthouse(input: {
  performanceScore: number | null
  lcpMs: number | null
  cls: number | null
}): LighthouseSeverity {
  const { performanceScore, lcpMs, cls } = input
  if (performanceScore !== null && performanceScore < LIGHTHOUSE_PERF_CRITICAL) return 'critical'
  if (lcpMs !== null && lcpMs > LIGHTHOUSE_LCP_CRITICAL_MS) return 'critical'
  if (cls !== null && cls > LIGHTHOUSE_CLS_CRITICAL) return 'critical'
  if (performanceScore !== null && performanceScore < LIGHTHOUSE_PERF_WARN) return 'warn'
  return 'ok'
}

/**
 * Extrait les Core Web Vitals d'une réponse PSI v5.
 * PSI structure : `lighthouseResult.audits[metric].numericValue` + `categories.performance.score`.
 * Renvoie null sur champ manquant — ne crash pas sur shape partiel.
 */
export function extractMetricsFromPsi(psiResponse: unknown): {
  performanceScore: number | null
  lcpMs: number | null
  cls: number | null
  inpMs: number | null
  fcpMs: number | null
  tbtMs: number | null
} {
  if (!psiResponse || typeof psiResponse !== 'object') {
    return {
      performanceScore: null,
      lcpMs: null,
      cls: null,
      inpMs: null,
      fcpMs: null,
      tbtMs: null,
    }
  }
  const root = psiResponse as Record<string, unknown>
  const lh = root.lighthouseResult as Record<string, unknown> | undefined
  const categories = (lh?.categories as Record<string, unknown> | undefined) ?? {}
  const perfCat = categories.performance as { score?: number } | undefined
  const audits = (lh?.audits as Record<string, { numericValue?: number }> | undefined) ?? {}

  const performanceScore =
    perfCat?.score !== undefined && Number.isFinite(perfCat.score)
      ? Math.round(perfCat.score * 100)
      : null

  const numericOrNull = (key: string): number | null => {
    const v = audits[key]?.numericValue
    return v !== undefined && Number.isFinite(v) ? Math.round(v) : null
  }
  const numericRawOrNull = (key: string): number | null => {
    const v = audits[key]?.numericValue
    return v !== undefined && Number.isFinite(v) ? v : null
  }

  // INP est la métrique CWV depuis mai 2024 (clé `interaction-to-next-paint`).
  // Avant la GA, PSI exposait `experimental-interaction-to-next-paint`.
  // Surtout PAS de fallback sur `interactive` qui mesure TTI (Time To Interactive),
  // une métrique différente — stocker TTI dans inpMs fausserait les alertes.
  return {
    performanceScore,
    lcpMs: numericOrNull('largest-contentful-paint'),
    cls: numericRawOrNull('cumulative-layout-shift'),
    inpMs:
      numericOrNull('interaction-to-next-paint') ??
      numericOrNull('experimental-interaction-to-next-paint'),
    fcpMs: numericOrNull('first-contentful-paint'),
    tbtMs: numericOrNull('total-blocking-time'),
  }
}

export type PsiFetcher = (url: string, strategy: LighthouseStrategy) => Promise<unknown | null>

/**
 * Fetcher PSI par défaut — hit l'API publique Google.
 * `apiKey` optionnel : sans clé = quota anonyme limitée, avec clé = 25K/jour.
 *
 * Hardening : la clé API passe par le header `X-Goog-Api-Key`, pas par
 * la query string — évite que la clé apparaisse dans les logs Sentry /
 * Vercel via les breadcrumbs HTTP du tracing.
 */
export function makePsiFetcher(apiKey?: string): PsiFetcher {
  return async (url, strategy) => {
    const params = new URLSearchParams({
      url,
      strategy,
      category: 'performance',
    })
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (apiKey) headers['X-Goog-Api-Key'] = apiKey
    const res = await fetch(endpoint, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(45000),
      headers,
    })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    if (buf.byteLength > PSI_BODY_MAX_BYTES) {
      logger.warn('[lighthouse-monitor] PSI body cap exceeded', {
        kind: 'lighthouse_body_cap',
        url,
        strategy,
        bytes: buf.byteLength,
      })
      return null
    }
    try {
      return JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
    } catch {
      return null
    }
  }
}

/**
 * Audite une liste d'URLs en mobile + desktop (séquentiel pour respecter
 * la quota PSI — 1 RPS recommandé). Le caller peut paralléliser si besoin.
 *
 * `deadlineMs` : optionnel, timestamp Unix ms — si dépassé, on s'arrête
 * gracieusement (Vercel maxDuration 300s impose une marge de 50s pour
 * persist + heartbeat).
 */
export async function auditUrls(
  urls: string[],
  fetcher: PsiFetcher,
  strategies: LighthouseStrategy[] = ['mobile', 'desktop'],
  deadlineMs?: number
): Promise<LighthouseScore[]> {
  const results: LighthouseScore[] = []
  for (const url of urls) {
    if (deadlineMs !== undefined && Date.now() > deadlineMs) break
    for (const strategy of strategies) {
      if (deadlineMs !== undefined && Date.now() > deadlineMs) break
      try {
        const psi = await fetcher(url, strategy)
        if (!psi) continue
        const metrics = extractMetricsFromPsi(psi)
        const severity = classifyLighthouse(metrics)
        results.push({
          url,
          strategy,
          ...metrics,
          severity,
          rawAudit: truncateRawAudit(psi as Record<string, unknown>),
        })
      } catch {
        // Skip cette URL/strategy — pas d'insertion.
      }
    }
  }
  return results
}

/**
 * UPSERT batch sur (snapshot_date, url, strategy).
 */
export async function persistLighthouseScores(
  supabase: SupabaseClient,
  scores: LighthouseScore[]
): Promise<{ ok: boolean; upserted: number }> {
  if (scores.length === 0) return { ok: true, upserted: 0 }
  const today = new Date().toISOString().slice(0, 10)
  // Clamp CLS sur le range NUMERIC(5,3) DB ([0, 99.999]) — PSI peut renvoyer
  // des valeurs >1 sur pages avec layout shifts catastrophiques. Sans clamp,
  // l'UPSERT silently fail sur constraint violation.
  const clampCls = (v: number | null): number | null =>
    v === null ? null : Math.min(Math.max(v, 0), 99.999)

  const rows = scores.map((s) => ({
    snapshot_date: today,
    url: s.url,
    strategy: s.strategy,
    performance_score: s.performanceScore,
    lcp_ms: s.lcpMs,
    cls: clampCls(s.cls),
    inp_ms: s.inpMs,
    fcp_ms: s.fcpMs,
    tbt_ms: s.tbtMs,
    severity: s.severity,
    raw_audit: s.rawAudit,
  }))
  const { error } = await supabase
    .from('lighthouse_scores')
    .upsert(rows, { onConflict: 'snapshot_date,url,strategy' })
  if (error) return { ok: false, upserted: 0 }
  return { ok: true, upserted: rows.length }
}

function truncateRawAudit(payload: Record<string, unknown>): Record<string, unknown> {
  // Ne garde que la section diagnostic clé pour rester sous le cap DB.
  // Le full payload PSI fait souvent 500KB-2MB → on extrait l'essentiel.
  try {
    const lh = (payload.lighthouseResult as Record<string, unknown>) ?? {}
    const slim: Record<string, unknown> = {
      lighthouseVersion: lh.lighthouseVersion,
      fetchTime: lh.fetchTime,
      requestedUrl: lh.requestedUrl,
      finalUrl: lh.finalUrl,
      scoreSummary: (lh.categories as Record<string, unknown> | undefined)?.performance,
    }
    const serialized = JSON.stringify(slim)
    if (serialized.length <= RAW_AUDIT_MAX_BYTES) return slim
    return { _truncated: true, _original_bytes: serialized.length }
  } catch {
    return { _truncated: true, _serialize_error: true }
  }
}
