/**
 * Admin Dashboard — RGE / CEE Health
 * ----------------------------------------------------------------------------
 * Snapshot temps réel de la santé du pipeline RGE + catalogue CEE.
 * Réutilise `getRgeHealthMetrics()` (même code que le cron quotidien).
 *
 * Auth : `requirePermission('settings', 'read')` via admin-auth.
 * Pas de graph temporel — uniquement le snapshot actuel (scope.)
 */

import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRgeHealthMetrics, type RgeHealthReport } from '@/lib/monitoring/rge-health'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShieldCheck,
  FileWarning,
  Percent,
  Layers,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATUS_BADGE: Record<
  RgeHealthReport['status'],
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  ok: {
    label: 'Opérationnel',
    className: 'bg-green-50 text-green-700 border-green-200',
    Icon: CheckCircle2,
  },
  degraded: {
    label: 'Dégradé',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Icon: AlertTriangle,
  },
  critical: {
    label: 'Critique',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
}

function fmtNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

function fmtPct(r: number): string {
  return `${(r * 100).toFixed(1)}%`
}

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  tone?: 'neutral' | 'warning' | 'critical' | 'success'
}

function MetricCard({ title, value, subtitle, icon, tone = 'neutral' }: MetricCardProps) {
  const toneClasses = {
    neutral: 'border-gray-200 bg-white',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50',
  }[tone]

  const iconClasses = {
    neutral: 'text-gray-400',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
    success: 'text-green-600',
  }[tone]

  return (
    <div className={`rounded-xl border p-5 ${toneClasses}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={iconClasses}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export default async function RgeHealthAdminPage() {
  // Auth admin — settings:read couvre les pages monitoring
  const auth = await requirePermission('settings', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }

  const client = createAdminClient()
  const report = await getRgeHealthMetrics(client)
  const { metrics, alerts, status, timestamp } = report

  const badge = STATUS_BADGE[status]
  const BadgeIcon = badge.Icon

  // Ton des cards selon les seuils
  const activeTone: MetricCardProps['tone'] =
    metrics.rge_total_active < 50_000 ? 'critical' : 'success'
  const expiredRatio =
    metrics.providers_active_total > 0
      ? metrics.rge_total_expired / metrics.providers_active_total
      : 0
  const expiredTone: MetricCardProps['tone'] = expiredRatio > 0.05 ? 'warning' : 'neutral'
  const syncTone: MetricCardProps['tone'] =
    metrics.rge_last_sync_age_days === null
      ? 'warning'
      : metrics.rge_last_sync_age_days > 14
        ? 'critical'
        : metrics.rge_last_sync_age_days > 7
          ? 'warning'
          : 'success'
  const communesTone: MetricCardProps['tone'] =
    metrics.rge_communes_with_artisans < 10_000 ? 'critical' : 'success'
  const ceeTone: MetricCardProps['tone'] =
    metrics.cee_operations_active < 15 ? 'critical' : 'success'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Santé pipeline RGE & CEE</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Monitoring de la sync ADEME, couverture territoriale et seed CEE.
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${badge.className}`}>
            <BadgeIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{badge.label}</span>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.code}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{alert.message}</p>
                  <p className="text-xs mt-0.5 opacity-75">
                    Code : <code className="font-mono">{alert.code}</code> · Seuil :{' '}
                    {fmtNumber(alert.threshold)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="RGE actifs"
            value={fmtNumber(metrics.rge_total_active)}
            subtitle={`sur ${fmtNumber(metrics.providers_active_total)} providers actifs`}
            icon={<ShieldCheck className="w-5 h-5" />}
            tone={activeTone}
          />
          <MetricCard
            title="RGE expirés"
            value={fmtNumber(metrics.rge_total_expired)}
            subtitle={`${fmtPct(expiredRatio)} des actifs`}
            icon={<FileWarning className="w-5 h-5" />}
            tone={expiredTone}
          />
          <MetricCard
            title="Dernier sync"
            value={
              metrics.rge_last_sync_age_days === null ? '—' : `${metrics.rge_last_sync_age_days} j`
            }
            subtitle="seuil hebdomadaire : 14 jours"
            icon={<Clock className="w-5 h-5" />}
            tone={syncTone}
          />
          <MetricCard
            title="Communes couvertes"
            value={fmtNumber(metrics.rge_communes_with_artisans)}
            subtitle="avec au moins 1 artisan RGE"
            icon={<MapPin className="w-5 h-5" />}
            tone={communesTone}
          />
          <MetricCard
            title="Couverture RGE"
            value={fmtPct(metrics.rge_coverage_ratio)}
            subtitle="RGE actifs / providers actifs"
            icon={<Percent className="w-5 h-5" />}
            tone="neutral"
          />
          <MetricCard
            title="Opérations CEE actives"
            value={fmtNumber(metrics.cee_operations_active)}
            subtitle="baseline seed CEE"
            icon={<Layers className="w-5 h-5" />}
            tone={ceeTone}
          />
        </div>

        {/* Footer meta */}
        <div className="text-xs text-gray-400 flex items-center justify-between flex-wrap gap-2">
          <span>
            Snapshot généré le{' '}
            {new Date(timestamp).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span>
            Source : <code className="font-mono">getRgeHealthMetrics()</code> — même helper que le
            cron <code className="font-mono">/api/cron/rge-health</code>
          </span>
        </div>
      </div>
    </div>
  )
}
