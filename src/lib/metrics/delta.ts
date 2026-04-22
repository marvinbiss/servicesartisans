/**
 * Shared delta helpers — used by both admin metrics and artisan dashboard blocks.
 *
 * Une seule implémentation pour toutes les comparaisons "before/after" :
 *   - `pctDelta`        : variation relative en % (admin metrics vs baseline J0,
 *                         artisan stats vs période précédente)
 *   - `pointDelta`      : variation absolue en points (pour taux déjà en %)
 *   - `splitHalfDelta`  : seconde moitié vs première moitié d'une série
 *                         (sparklines PerformanceTrendBlock)
 *   - `formatPctDelta`  : rendu FR "+5.3%" ou "—" si null
 *
 * Contract :
 *   - Retourne `null` quand le calcul n'a pas de sens (baseline=0, null, NaN)
 *   - Arrondi : 1 décimale pour % et points
 *   - Jamais d'exception levée
 */

export function pctDelta(
  current: number | null | undefined,
  baseline: number | null | undefined
): number | null {
  if (current == null || baseline == null) return null
  if (!Number.isFinite(current) || !Number.isFinite(baseline)) return null
  if (baseline === 0) return current === 0 ? 0 : null
  return Math.round(((current - baseline) / baseline) * 1000) / 10
}

export function pointDelta(
  current: number | null | undefined,
  baseline: number | null | undefined
): number | null {
  if (current == null || baseline == null) return null
  if (!Number.isFinite(current) || !Number.isFinite(baseline)) return null
  return Math.round((current - baseline) * 10) / 10
}

export function splitHalfDelta(series: number[]): number | null {
  if (series.length < 2) return null
  const mid = Math.floor(series.length / 2)
  const first = series.slice(0, mid).reduce((s, v) => s + v, 0)
  const second = series.slice(mid).reduce((s, v) => s + v, 0)
  if (first === 0 && second === 0) return null
  if (first === 0) return 100
  return Math.round(((second - first) / first) * 100)
}

export function formatPctDelta(delta: number | null): string {
  if (delta == null) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}%`
}

export function formatPointDelta(delta: number | null, unit = 'pt'): string {
  if (delta == null) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta} ${unit}`
}
