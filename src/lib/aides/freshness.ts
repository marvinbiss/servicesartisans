/**
 * Logique pure de monitoring de fraîcheur du catalog `aides-catalog`.
 *
 * Extraite hors de `src/app/api/cron/check-aides-freshness/route.ts` :
 * Next.js 14 interdit tout export ≠ `GET/POST/...` dans un fichier route.ts
 * (build error TS : "is not a valid Route export field").
 *
 * Voir le handler GET pour le contrat HTTP, l'auth Bearer CRON_SECRET et
 * la sémantique du payload (anti-fuite YMYL).
 *
 * Logique des seuils (chantier #1 monitoring YMYL anti-régression) :
 *   - âge < 60 jours : OK, aucune alerte
 *   - 60 ≤ âge < 75 jours : WARNING — relancer la veille france-renov
 *   - 75 ≤ âge < 90 jours : CRITICAL — refresh OBLIGATOIRE
 *   - âge ≥ 90 jours : CI fail au prochain run vitest (test `lastReviewed freshness`)
 */

export const WARNING_THRESHOLD_DAYS = 60
export const CRITICAL_THRESHOLD_DAYS = 75
export const CI_FAIL_THRESHOLD_DAYS = 90 // miroir du test Vitest

type Severity = 'warning' | 'critical'

export type AideAlert = {
  slug: string
  severity: Severity
  ageDays: number
  lastReviewed: string
}

export type FreshnessReport = {
  status: 'ok' | 'warning' | 'critical'
  totalAides: number
  ageDays: Record<string, number>
  alerts: AideAlert[]
}

export function computeFreshnessReport(
  catalog: { slug: string; lastReviewed: string }[],
  now: Date
): FreshnessReport {
  const ageDays: Record<string, number> = {}
  const alerts: AideAlert[] = []

  for (const aide of catalog) {
    const reviewedAt = Date.parse(aide.lastReviewed + 'T00:00:00Z')
    if (!Number.isFinite(reviewedAt)) {
      // Date malformée → traiter comme critical (refresh requis)
      ageDays[aide.slug] = Number.POSITIVE_INFINITY
      alerts.push({
        slug: aide.slug,
        severity: 'critical',
        ageDays: Number.POSITIVE_INFINITY,
        lastReviewed: aide.lastReviewed,
      })
      continue
    }
    const days = Math.floor((now.getTime() - reviewedAt) / (24 * 60 * 60 * 1000))
    ageDays[aide.slug] = days

    if (days >= CRITICAL_THRESHOLD_DAYS) {
      alerts.push({
        slug: aide.slug,
        severity: 'critical',
        ageDays: days,
        lastReviewed: aide.lastReviewed,
      })
    } else if (days >= WARNING_THRESHOLD_DAYS) {
      alerts.push({
        slug: aide.slug,
        severity: 'warning',
        ageDays: days,
        lastReviewed: aide.lastReviewed,
      })
    }
  }

  const hasCritical = alerts.some((a) => a.severity === 'critical')
  const hasWarning = alerts.some((a) => a.severity === 'warning')
  const status: 'ok' | 'warning' | 'critical' = hasCritical
    ? 'critical'
    : hasWarning
      ? 'warning'
      : 'ok'

  return {
    status,
    totalAides: catalog.length,
    ageDays,
    alerts,
  }
}
