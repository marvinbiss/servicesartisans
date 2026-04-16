/**
 * RGE / CEE Health Metrics Helper
 * ----------------------------------------------------------------------------
 * Calcule les indicateurs de santé du pipeline RGE et du catalogue CEE.
 *
 * Utilisé par :
 *  - Le cron `/api/cron/rge-health` (exécution quotidienne)
 *  - Le dashboard admin `/admin/monitoring/rge` (snapshot temps réel)
 *
 * Règles :
 *  - Toutes les requêtes utilisent `count: 'exact', head: true` pour rester
 *    légères (pas de full scan, pas de hydration des rows).
 *  - Les seuils critiques sont encodés ici (source unique). Les violations
 *    produisent un tableau d'alertes typées, consommé par cron + dashboard.
 *  - Sur erreur critique, remonte vers Sentry (si configuré) + logger.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface RgeHealthMetrics {
  /** Providers actifs avec qualification RGE valide (rge_valid_until >= today) */
  rge_total_active: number
  /** Providers avec rge_valid_until < today (qualifs expirées) */
  rge_total_expired: number
  /** Âge en jours du dernier sync RGE (max updated_at sur providers RGE) */
  rge_last_sync_age_days: number | null
  /** Communes avec au moins 1 artisan RGE (nb_artisans_rge > 0) */
  rge_communes_with_artisans: number
  /** Ratio actifs RGE / providers actifs total (0..1) */
  rge_coverage_ratio: number
  /** Nombre d'opérations CEE actives (baseline seed) */
  cee_operations_active: number
  /** Total providers actifs (dénominateur coverage) */
  providers_active_total: number
}

export type AlertSeverity = 'warning' | 'critical'

export interface RgeHealthAlert {
  code: 'rge_sync_stale' | 'rge_coverage_drop' | 'rge_backfill_broken' | 'cee_seed_incomplete'
  severity: AlertSeverity
  message: string
  value: number | null
  threshold: number
}

export interface RgeHealthReport {
  metrics: RgeHealthMetrics
  alerts: RgeHealthAlert[]
  status: 'ok' | 'degraded' | 'critical'
  timestamp: string
}

// ----------------------------------------------------------------------------
// Seuils d'alerte (source unique)
// ----------------------------------------------------------------------------

export const RGE_HEALTH_THRESHOLDS = {
  /** Sync RGE attendu hebdomadaire — alerte critique si > 14 jours */
  rgeSyncMaxAgeDays: 14,
  /** Baseline ~88k providers actifs RGE — alerte critique si < 50k */
  rgeTotalActiveMin: 50_000,
  /** Baseline ~14k communes couvertes — alerte critique si < 10k */
  rgeCommunesMin: 10_000,
  /** Seed CEE ~20 opérations — alerte critique si < 15 */
  ceeOperationsMin: 15,
} as const

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnySupabaseClient = SupabaseClient<any, any, any>

async function safeCount(
  client: AnySupabaseClient,
  table: string,
  build: (q: any) => any
): Promise<number> {
  try {
    const query = build(client.from(table).select('*', { count: 'exact', head: true }))
    const { count, error } = await query
    if (error) {
      logger.error(`[rge-health] count failed on ${table}`, error)
      return 0
    }
    return count ?? 0
  } catch (err) {
    logger.error(`[rge-health] count threw on ${table}`, err)
    return 0
  }
}

// ----------------------------------------------------------------------------
// Metric collection
// ----------------------------------------------------------------------------

export async function getRgeHealthMetrics(client: AnySupabaseClient): Promise<RgeHealthReport> {
  const now = new Date()
  const today = now.toISOString().slice(0, 10) // YYYY-MM-DD

  // 1. Counts parallèles (head:true, pas de rows retournées)
  const [
    rgeTotalActive,
    rgeTotalExpired,
    rgeCommunesWithArtisans,
    ceeOperationsActive,
    providersActiveTotal,
  ] = await Promise.all([
    safeCount(client, 'providers', (q) => q.eq('is_active', true).gte('rge_valid_until', today)),
    safeCount(client, 'providers', (q) => q.lt('rge_valid_until', today)),
    safeCount(client, 'communes', (q) => q.gt('nb_artisans_rge', 0)),
    safeCount(client, 'cee_operations', (q) => q.eq('is_active', true)),
    safeCount(client, 'providers', (q) => q.eq('is_active', true)),
  ])

  // 2. Âge du dernier sync RGE — 1 row max
  let rgeLastSyncAgeDays: number | null = null
  try {
    const { data, error } = await client
      .from('providers')
      .select('updated_at')
      .not('rge_qualifications', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('[rge-health] last sync query failed', error)
    } else if (data?.updated_at) {
      const last = new Date(data.updated_at as string).getTime()
      rgeLastSyncAgeDays = Math.floor((now.getTime() - last) / (1000 * 60 * 60 * 24))
    }
  } catch (err) {
    logger.error('[rge-health] last sync query threw', err)
  }

  const rgeCoverageRatio = providersActiveTotal > 0 ? rgeTotalActive / providersActiveTotal : 0

  const metrics: RgeHealthMetrics = {
    rge_total_active: rgeTotalActive,
    rge_total_expired: rgeTotalExpired,
    rge_last_sync_age_days: rgeLastSyncAgeDays,
    rge_communes_with_artisans: rgeCommunesWithArtisans,
    rge_coverage_ratio: Math.round(rgeCoverageRatio * 10_000) / 10_000,
    cee_operations_active: ceeOperationsActive,
    providers_active_total: providersActiveTotal,
  }

  // 3. Évaluation des alertes
  const alerts: RgeHealthAlert[] = []

  if (rgeLastSyncAgeDays !== null && rgeLastSyncAgeDays > RGE_HEALTH_THRESHOLDS.rgeSyncMaxAgeDays) {
    alerts.push({
      code: 'rge_sync_stale',
      severity: 'critical',
      message: `Sync RGE en retard : ${rgeLastSyncAgeDays} jours (> ${RGE_HEALTH_THRESHOLDS.rgeSyncMaxAgeDays})`,
      value: rgeLastSyncAgeDays,
      threshold: RGE_HEALTH_THRESHOLDS.rgeSyncMaxAgeDays,
    })
  }

  if (rgeTotalActive < RGE_HEALTH_THRESHOLDS.rgeTotalActiveMin) {
    alerts.push({
      code: 'rge_coverage_drop',
      severity: 'critical',
      message: `Drop couverture RGE : ${rgeTotalActive} actifs (< ${RGE_HEALTH_THRESHOLDS.rgeTotalActiveMin})`,
      value: rgeTotalActive,
      threshold: RGE_HEALTH_THRESHOLDS.rgeTotalActiveMin,
    })
  }

  if (rgeCommunesWithArtisans < RGE_HEALTH_THRESHOLDS.rgeCommunesMin) {
    alerts.push({
      code: 'rge_backfill_broken',
      severity: 'critical',
      message: `Backfill communes cassé : ${rgeCommunesWithArtisans} couvertes (< ${RGE_HEALTH_THRESHOLDS.rgeCommunesMin})`,
      value: rgeCommunesWithArtisans,
      threshold: RGE_HEALTH_THRESHOLDS.rgeCommunesMin,
    })
  }

  if (ceeOperationsActive < RGE_HEALTH_THRESHOLDS.ceeOperationsMin) {
    alerts.push({
      code: 'cee_seed_incomplete',
      severity: 'critical',
      message: `Seed CEE incomplet : ${ceeOperationsActive} opérations actives (< ${RGE_HEALTH_THRESHOLDS.ceeOperationsMin})`,
      value: ceeOperationsActive,
      threshold: RGE_HEALTH_THRESHOLDS.ceeOperationsMin,
    })
  }

  // 4. Status global
  const hasCritical = alerts.some((a) => a.severity === 'critical')
  const hasWarning = alerts.some((a) => a.severity === 'warning')
  const status: RgeHealthReport['status'] = hasCritical
    ? 'critical'
    : hasWarning
      ? 'degraded'
      : 'ok'

  // 5. Remontée Sentry pour chaque alerte critique
  for (const alert of alerts) {
    if (alert.severity === 'critical') {
      try {
        Sentry.captureMessage(`[rge-health] ${alert.message}`, {
          level: 'error',
          extra: {
            subsystem: 'rge-sync',
            severity: alert.severity,
            code: alert.code,
            value: alert.value,
            threshold: alert.threshold,
          },
        })
      } catch (err) {
        // Sentry doit jamais casser le monitoring
        logger.error('[rge-health] sentry capture failed', err)
      }
      logger.error(`[rge-health] ${alert.message}`, undefined, {
        code: alert.code,
        severity: alert.severity,
      })
    }
  }

  return {
    metrics,
    alerts,
    status,
    timestamp: now.toISOString(),
  }
}
