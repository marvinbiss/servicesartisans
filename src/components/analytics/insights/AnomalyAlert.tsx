'use client'

import { useState } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, X, ChevronRight, Bell, BellOff } from 'lucide-react'

interface Anomaly {
  id: string
  metric: string
  type: 'spike' | 'drop' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  currentValue: number
  expectedValue: number
  deviation: number
  detectedAt: string
  description: string
  suggestedAction?: string
}

interface AnomalyAlertProps {
  anomalies: Anomaly[]
  onDismiss?: (id: string) => void
  onMuteMetric?: (metric: string) => void
  onViewDetails?: (anomaly: Anomaly) => void
}

export function AnomalyAlert({
  anomalies,
  onDismiss,
  onMuteMetric,
  onViewDetails,
}: AnomalyAlertProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState<Set<string>>(new Set())

  const visibleAnomalies = anomalies.filter(
    (a) => !dismissed.has(a.id) && !muted.has(a.metric)
  )

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...Array.from(prev), id]))
    onDismiss?.(id)
  }

  const handleMute = (metric: string) => {
    setMuted((prev) => new Set([...Array.from(prev), metric]))
    onMuteMetric?.(metric)
  }

  const getSeverityStyles = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          badge: 'bg-red-100 text-red-700',
        }
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          badge: 'bg-orange-100 text-orange-700',
        }
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-500',
          badge: 'bg-amber-100 text-amber-700',
        }
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-700',
        }
    }
  }

  const getTypeIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-5 h-5" />
      case 'drop':
        return <TrendingDown className="w-5 h-5" />
      case 'unusual_pattern':
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const formatDeviation = (deviation: number) => {
    const sign = deviation >= 0 ? '+' : ''
    return `${sign}${deviation.toFixed(1)}%`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return date.toLocaleDateString('fr-FR')
  }

  if (visibleAnomalies.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">
            Alertes anomalies ({visibleAnomalies.length})
          </h3>
        </div>
        {muted.size > 0 && (
          <button
            onClick={() => setMuted(new Set())}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Bell className="w-3 h-3" />
            Réactiver tout ({muted.size})
          </button>
        )}
      </div>

      {/* Anomaly cards */}
      <div className="space-y-2">
        {visibleAnomalies.map((anomaly) => {
          const styles = getSeverityStyles(anomaly.severity)

          return (
            <div
              key={anomaly.id}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`mt-0.5 ${styles.icon}`}>
                  {getTypeIcon(anomaly.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {anomaly.metric}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {anomaly.severity === 'critical' && 'Critique'}
                      {anomaly.severity === 'high' && 'Élevé'}
                      {anomaly.severity === 'medium' && 'Moyen'}
                      {anomaly.severity === 'low' && 'Faible'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(anomaly.detectedAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {anomaly.description}
                  </p>

                  {/* Values */}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Actuel:</span>{' '}
                      <span className="font-medium">{anomaly.currentValue}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Attendu:</span>{' '}
                      <span className="font-medium">{anomaly.expectedValue}</span>
                    </div>
                    <div
                      className={`font-bold ${
                        anomaly.deviation >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatDeviation(anomaly.deviation)}
                    </div>
                  </div>

                  {/* Suggested action */}
                  {anomaly.suggestedAction && (
                    <div className="mt-3 p-2 bg-white/50 rounded text-sm">
                      <span className="text-gray-500">Action suggérée:</span>{' '}
                      <span className="text-gray-700">{anomaly.suggestedAction}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewDetails?.(anomaly)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
                    title="Voir détails"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMute(anomaly.metric)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
                    title="Masquer cette métrique"
                  >
                    <BellOff className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDismiss(anomaly.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded"
                    title="Ignorer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary by severity */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = visibleAnomalies.filter((a) => a.severity === severity).length
          if (count === 0) return null
          const styles = getSeverityStyles(severity as Anomaly['severity'])
          return (
            <div key={severity} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${styles.badge.split(' ')[0]}`} />
              <span>
                {count} {severity}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AnomalyAlert
