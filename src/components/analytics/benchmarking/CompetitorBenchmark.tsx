'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BenchmarkMetric {
  name: string
  yourValue: number
  avgValue: number
  topValue: number
  unit?: string
  higherIsBetter?: boolean
}

interface CompetitorBenchmarkProps {
  providerId: string
  serviceCategory: string
  city: string
  metrics: BenchmarkMetric[]
  rank?: {
    city: number
    totalInCity: number
    region?: number
    totalInRegion?: number
  }
  className?: string
}

export function CompetitorBenchmark({
  serviceCategory,
  city,
  metrics,
  rank,
  className,
}: CompetitorBenchmarkProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  const getComparisonStatus = (metric: BenchmarkMetric) => {
    const diff = metric.yourValue - metric.avgValue
    const percentage = metric.avgValue !== 0 ? (diff / metric.avgValue) * 100 : 0
    const isBetter = metric.higherIsBetter !== false ? diff > 0 : diff < 0

    return {
      diff,
      percentage: Math.abs(percentage),
      isBetter,
      isNeutral: Math.abs(percentage) < 5,
    }
  }

  const getPercentile = (yourValue: number, avgValue: number, topValue: number) => {
    if (topValue === avgValue) return 50
    const range = topValue - avgValue
    const position = yourValue - avgValue
    return Math.min(100, Math.max(0, 50 + (position / range) * 50))
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Comparaison avec les concurrents
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {serviceCategory} à {city}
            </p>
          </div>

          {/* Rank badge */}
          {rank && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                <Award
                  className={cn(
                    'w-5 h-5',
                    rank.city <= 3 ? 'text-yellow-500' : 'text-gray-400'
                  )}
                />
                #{rank.city}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                sur {rank.totalInCity} dans la ville
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {metrics.map((metric) => {
          const status = getComparisonStatus(metric)
          const percentile = getPercentile(metric.yourValue, metric.avgValue, metric.topValue)
          const isExpanded = expandedMetric === metric.name

          return (
            <div key={metric.name}>
              <button
                onClick={() => setExpandedMetric(isExpanded ? null : metric.name)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {!status.isNeutral && (
                      <span
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                          status.isBetter
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                      >
                        {status.isBetter ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {status.percentage.toFixed(0)}%
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Average marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                    style={{ left: '50%' }}
                  />
                  {/* Your position */}
                  <div
                    className={cn(
                      'absolute top-0 bottom-0 w-3 h-3 -mt-0.5 rounded-full border-2 border-white dark:border-gray-800 shadow',
                      status.isBetter || status.isNeutral ? 'bg-blue-500' : 'bg-orange-500'
                    )}
                    style={{ left: `calc(${percentile}% - 6px)` }}
                  />
                </div>

                {/* Value labels */}
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-gray-400">Moyenne</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Vous: {metric.yourValue}
                    {metric.unit}
                  </span>
                  <span className="text-gray-400">Top</span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-700/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {metric.avgValue}
                        {metric.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Moyenne
                      </div>
                    </div>
                    <div className="border-x border-gray-200 dark:border-gray-600">
                      <div className="text-lg font-bold text-blue-600">
                        {metric.yourValue}
                        {metric.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Vous
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {metric.topValue}
                        {metric.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Top 10%
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {!status.isBetter && !status.isNeutral && (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        💡 Améliorer cette métrique pourrait augmenter votre
                        visibilité de {Math.round(status.percentage / 2)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall score */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Score global de compétitivité
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    metrics.reduce((acc, m) => {
                      const pct = getPercentile(m.yourValue, m.avgValue, m.topValue)
                      return acc + pct
                    }, 0) / metrics.length
                  )}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(
                metrics.reduce((acc, m) => {
                  const pct = getPercentile(m.yourValue, m.avgValue, m.topValue)
                  return acc + pct
                }, 0) / metrics.length
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompetitorBenchmark
