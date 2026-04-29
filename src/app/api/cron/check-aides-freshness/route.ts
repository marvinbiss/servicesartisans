/**
 * Cron quotidien : Aides catalog freshness monitoring
 * ----------------------------------------------------------------------------
 * Surveille `lastReviewed` de chaque entrée du catalog `src/lib/aides/aides-catalog.ts`
 * et déclenche une alerte structurée 30 jours AVANT le seuil dur 90j (qui fait
 * échouer la CI via le test Vitest `lastReviewed freshness`).
 *
 * Logique des seuils (chantier #1 monitoring YMYL anti-régression) :
 *   - âge ≤ 60 jours : OK, aucune alerte
 *   - 60 < âge ≤ 75 jours : WARNING (logger.warn) — relancer la veille france-renov
 *   - 75 < âge < 90 jours : CRITICAL (logger.error + Sentry) — refresh OBLIGATOIRE
 *   - âge ≥ 90 jours : CI fail au prochain run vitest (déjà couvert par le test)
 *
 * Auth : Bearer CRON_SECRET (pattern partagé avec rge-health, sitemap-health, etc.)
 * Schedule recommandé : `0 7 * * *` (quotidien, 07h UTC, avant le déploiement quotidien)
 *
 * Réponse JSON par défaut (minimale, anti-fuite état interne YMYL) :
 *   {
 *     ok: boolean,                  // true ssi status === 'ok'
 *     status: 'ok' | 'warning' | 'critical',
 *     totalAides: 12,
 *     timestamp: string,
 *   }
 *
 * Le détail (`ageDays` + `alerts` avec `lastReviewed` exact) est volontairement
 * EXCLU du payload JSON pour ne pas exposer publiquement l'état de veille
 * éditoriale d'aides YMYL si `CRON_SECRET` venait à fuiter (audit sécu
 * 2026-04-29 HIGH#1). Les détails sont toujours envoyés à Sentry/logger côté
 * serveur via `logger.error/warn/info`. Pour debug ad hoc, passer le header
 * `X-Debug-Detail: 1` sur une requête bearer-authentifiée → renvoie
 * `{ ageDays, alerts }` en plus.
 */

import { NextResponse } from 'next/server'

import { aidesCatalog } from '@/lib/aides/aides-catalog'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const WARNING_THRESHOLD_DAYS = 60
const CRITICAL_THRESHOLD_DAYS = 75
const CI_FAIL_THRESHOLD_DAYS = 90 // miroir du test Vitest

type Severity = 'warning' | 'critical'

type AideAlert = {
  slug: string
  severity: Severity
  ageDays: number
  lastReviewed: string
}

export function computeFreshnessReport(
  catalog: { slug: string; lastReviewed: string }[],
  now: Date
): {
  status: 'ok' | 'warning' | 'critical'
  totalAides: number
  ageDays: Record<string, number>
  alerts: AideAlert[]
} {
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

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const now = new Date()
    const report = computeFreshnessReport(aidesCatalog, now)
    const timestamp = now.toISOString()

    if (report.status === 'critical') {
      logger.error(
        '[check-aides-freshness] CRITICAL — aides à refresh < 15j avant CI fail',
        undefined,
        {
          kind: 'aides_freshness_critical',
          alerts: report.alerts,
          ciFailThresholdDays: CI_FAIL_THRESHOLD_DAYS,
        }
      )
    } else if (report.status === 'warning') {
      logger.warn('[check-aides-freshness] WARNING — aides à refresh < 30j', {
        kind: 'aides_freshness_warning',
        alerts: report.alerts,
      })
    } else {
      logger.info('[check-aides-freshness] OK', {
        totalAides: report.totalAides,
      })
    }

    const debugDetail = request.headers.get('x-debug-detail') === '1'
    return NextResponse.json({
      ok: report.status === 'ok',
      status: report.status,
      totalAides: report.totalAides,
      timestamp,
      ...(debugDetail ? { ageDays: report.ageDays, alerts: report.alerts } : {}),
    })
  } catch (error) {
    logger.error('[check-aides-freshness] cron failed', error)
    return NextResponse.json(
      { ok: false, error: 'check-aides-freshness cron failure' },
      { status: 500 }
    )
  }
}
