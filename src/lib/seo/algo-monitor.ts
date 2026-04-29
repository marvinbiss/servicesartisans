/**
 * Algo monitor — Bouclier 1 plan ULTRA DOMINATION SEO v2.
 *
 * Surveille les "weather reports" SEO publics (Semrush Sensor FR) pour
 * détecter les fenêtres de volatilité Google. Couplé au baseline SEO
 * interne (`seo_baseline_snapshots`), ça permet de distinguer :
 *   - dip SA + industrie agitée → algo update, pas de rollback
 *   - dip SA + industrie calme → régression interne, investiguer
 *
 * Pourquoi 1 source seulement (Semrush) :
 *   Mozcast a été évalué et retiré : la page mozcast.com hydrate ses
 *   widgets en JS côté client, le HTML servi serveur ne contient plus
 *   les températures. Maintenir un fetcher null-only polluait la table
 *   avec des `calm` factices. À ré-instrumenter via une autre source
 *   (AlgooRoo, Cognitive SEO) si besoin.
 *
 * Conception fail-safe : aucune source externe ne bloque le cron. Les
 * fetchers KO sont stockés en `calm` avec rawPayload.error pour debug.
 *
 * Pas d'I/O DB ici hors `persistVolatilitySnapshots`. Les fetchers sont
 * passés en DI pour rester testables.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/** Seuils de classification de la volatilité (score 0-10 normalisé). */
export const VOLATILITY_CRITICAL = 7
export const VOLATILITY_WARN = 4

/** Cap défensif sur la taille de raw_payload avant insertion DB (octets). */
const RAW_PAYLOAD_MAX_BYTES = 32 * 1024

/** Cap défensif sur le body HTTP des fetchers (octets). */
const SEMRUSH_BODY_MAX_BYTES = 512 * 1024

/** Garde de profondeur pour la récursion sur JSON externe. */
const SCORE_EXTRACT_MAX_DEPTH = 20

export type VolatilitySeverity = 'calm' | 'warn' | 'critical'

export type VolatilitySnapshot = {
  source: string
  country: string
  score: number
  severity: VolatilitySeverity
  rawPayload: Record<string, unknown>
}

export type VolatilityFetcher = {
  source: string
  country: string
  fetch: () => Promise<{ score: number; rawPayload: Record<string, unknown> } | null>
}

/**
 * Classe le score en severity. Score est borné [0, 10] avant comparaison —
 * un fetcher buggé qui renvoie 999 ne doit pas trigger un critical fantôme.
 */
export function classifyVolatility(score: number): VolatilitySeverity {
  if (!Number.isFinite(score)) return 'calm'
  const clamped = Math.max(0, Math.min(10, score))
  if (clamped >= VOLATILITY_CRITICAL) return 'critical'
  if (clamped >= VOLATILITY_WARN) return 'warn'
  return 'calm'
}

/**
 * Normalise un score Mozcast (0-100) vers l'échelle [0, 10] partagée.
 * Conservé pour réutilisation future si on ajoute une source style Mozcast.
 */
export function normalizeMozcastScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0
  return Math.max(0, Math.min(10, raw / 10))
}

/**
 * Normalise un score Semrush Sensor (0-10 déjà). Garde la même échelle
 * mais clamp défensif.
 */
export function normalizeSemrushScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0
  return Math.max(0, Math.min(10, raw))
}

/**
 * Lance les fetchers en parallèle. Chaque fetcher gère son propre timeout
 * via AbortSignal interne. Les fetchers KO sont remplacés par un snapshot
 * "calm" avec rawPayload signalant l'erreur — on garde la trace pour debug,
 * mais on ne propage pas d'alerte.
 */
export async function collectVolatilitySnapshots(
  fetchers: VolatilityFetcher[]
): Promise<VolatilitySnapshot[]> {
  if (fetchers.length === 0) return []

  return Promise.all(
    fetchers.map(async (f) => {
      try {
        const result = await f.fetch()
        if (!result) {
          return {
            source: f.source,
            country: f.country,
            score: 0,
            severity: 'calm' as const,
            rawPayload: { error: 'fetcher returned null' },
          }
        }
        return {
          source: f.source,
          country: f.country,
          score: result.score,
          severity: classifyVolatility(result.score),
          rawPayload: truncateRawPayload(result.rawPayload),
        }
      } catch (err) {
        return {
          source: f.source,
          country: f.country,
          score: 0,
          severity: 'calm' as const,
          rawPayload: {
            error: err instanceof Error ? err.message : String(err),
          },
        }
      }
    })
  )
}

/**
 * UPSERT sur (snapshot_date, source, country) pour permettre un re-run
 * dans la journée sans dupliquer.
 *
 * Note : `upserted` reflète le nombre de lignes envoyées, pas le delta
 * INSERT vs UPDATE (Supabase upsert ne distingue pas).
 */
export async function persistVolatilitySnapshots(
  supabase: SupabaseClient,
  snapshots: VolatilitySnapshot[]
): Promise<{ ok: boolean; upserted: number }> {
  if (snapshots.length === 0) return { ok: true, upserted: 0 }
  const today = new Date().toISOString().slice(0, 10)
  const rows = snapshots.map((s) => ({
    snapshot_date: today,
    source: s.source,
    country: s.country,
    score: s.score,
    severity: s.severity,
    raw_payload: truncateRawPayload(s.rawPayload),
  }))
  const { error } = await supabase
    .from('algo_volatility_snapshots')
    .upsert(rows, { onConflict: 'snapshot_date,source,country' })
  if (error) return { ok: false, upserted: 0 }
  return { ok: true, upserted: rows.length }
}

/**
 * Fetcher Semrush Sensor — widget public JSON (échelle 0-10 native).
 * Endpoint non documenté officiellement, utilisé par leur dashboard public.
 * Sans clé API. Résilient au changement de shape : on cherche la 1ère
 * clé exacte `score`/`volatility`/`temp`/`temperature` dans le payload.
 *
 * Hardening :
 *   - `redirect: 'error'` bloque toute redirection (anti-SSRF si DNS hijack)
 *   - Body cap 512KB (anti-OOM si serveur compromis)
 *   - Garde profondeur 20 sur extractFirstNumericScore (anti-stack-overflow)
 */
export function makeSemrushFetcher(country = 'fr'): VolatilityFetcher {
  return {
    source: 'semrush_sensor',
    country,
    fetch: async () => {
      const url = `https://www.semrush.com/sensor/widget/data?country=${country}`
      const res = await fetch(url, {
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(7000),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      if (buf.byteLength > SEMRUSH_BODY_MAX_BYTES) return null
      let json: Record<string, unknown>
      try {
        json = JSON.parse(new TextDecoder().decode(buf)) as Record<string, unknown>
      } catch {
        return null
      }
      const score = extractFirstNumericScore(json)
      if (score === null) return null
      return { score: normalizeSemrushScore(score), rawPayload: json }
    },
  }
}

/**
 * Helper récursif : retourne le 1er nombre dans un objet JSON dont la clé
 * matche exactement `score`/`volatility`/`temp`/`temperature`. Permet de
 * survivre aux refactos mineurs du widget Semrush sans matcher des clés
 * proches comme `temp_redirect` ou `temperature_id`.
 *
 * Garde profondeur 20 contre les payloads malicieusement profonds.
 *
 * Exporté pour test direct (logique critique non triviale).
 */
export function extractFirstNumericScore(obj: unknown, depth = 0): number | null {
  if (depth > SCORE_EXTRACT_MAX_DEPTH) return null
  if (obj === null || typeof obj !== 'object') return null
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = extractFirstNumericScore(item, depth + 1)
      if (found !== null) return found
    }
    return null
  }
  const record = obj as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    if (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      /^(score|volatility|temp|temperature)$/i.test(key)
    ) {
      return value
    }
  }
  for (const value of Object.values(record)) {
    if (typeof value === 'object') {
      const found = extractFirstNumericScore(value, depth + 1)
      if (found !== null) return found
    }
  }
  return null
}

/**
 * Tronque un rawPayload qui dépasse RAW_PAYLOAD_MAX_BYTES en sérialisé.
 * Renvoie un payload de remplacement minimal { _truncated: true, _bytes: N }
 * pour ne pas faire row-bloat en JSONB.
 */
function truncateRawPayload(payload: Record<string, unknown>): Record<string, unknown> {
  try {
    const serialized = JSON.stringify(payload)
    if (serialized.length <= RAW_PAYLOAD_MAX_BYTES) return payload
    return { _truncated: true, _original_bytes: serialized.length }
  } catch {
    return { _truncated: true, _serialize_error: true }
  }
}
