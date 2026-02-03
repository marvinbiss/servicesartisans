'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Award,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InsightType =
  | 'performance_trend'
  | 'anomaly'
  | 'opportunity'
  | 'benchmark_comparison'
  | 'recommendation'
  | 'warning'

interface Insight {
  id: string
  type: InsightType
  title: string
  description: string
  data?: {
    trend?: 'up' | 'down'
    percentage?: number
    metric?: string
    value?: number
    previousValue?: number
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionUrl?: string
  actionLabel?: string
  isRead?: boolean
  createdAt: string
}

interface InsightCardProps {
  insight: Insight
  onDismiss?: (id: string) => void
  onAction?: (id: string) => void
  onRead?: (id: string) => void
  className?: string
}

const TYPE_CONFIG: Record<
  InsightType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  performance_trend: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  anomaly: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  opportunity: {
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  benchmark_comparison: {
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  recommendation: {
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
}

const PRIORITY_BORDER: Record<string, string> = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-500',
}

export function InsightCard({
  insight,
  onDismiss,
  onAction,
  onRead,
  className,
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = TYPE_CONFIG[insight.type]
  const Icon = config.icon

  const handleClick = () => {
    if (!insight.isRead && onRead) {
      onRead(insight.id)
    }
    setIsExpanded(!isExpanded)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-gray-800 rounded-lg border border-l-4 shadow-sm transition-all',
        PRIORITY_BORDER[insight.priority],
        !insight.isRead && 'ring-2 ring-blue-100 dark:ring-blue-900',
        className
      )}
    >
      {/* Main content */}
      <button
        onClick={handleClick}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'p-2 rounded-lg flex-shrink-0',
              config.bgColor
            )}
          >
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {insight.title}
              </h4>
              {!insight.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>

            <p
              className={cn(
                'text-sm text-gray-600 dark:text-gray-400',
                !isExpanded && 'line-clamp-2'
              )}
            >
              {insight.description}
            </p>

            {/* Data visualization */}
            {insight.data && (
              <div className="mt-2 flex items-center gap-3">
                {insight.data.trend && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      insight.data.trend === 'up'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {insight.data.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {insight.data.percentage && (
                      <span>{insight.data.percentage}%</span>
                    )}
                  </div>
                )}
                {insight.data.metric && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {insight.data.metric}
                  </span>
                )}
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-gray-400 mt-2">
              {formatDate(insight.createdAt)}
            </p>
          </div>

          {/* Expand indicator */}
          <ChevronRight
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </button>

      {/* Expanded actions */}
      {isExpanded && (insight.actionUrl || onDismiss) && (
        <div className="px-4 pb-4 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          {insight.actionUrl && (
            <a
              href={insight.actionUrl}
              onClick={() => onAction?.(insight.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {insight.actionLabel || 'Voir plus'}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(insight.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Ignorer
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default InsightCard
