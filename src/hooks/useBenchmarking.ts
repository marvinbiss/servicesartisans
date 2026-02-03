'use client'

import { useState, useEffect, useCallback } from 'react'

interface BenchmarkMetric {
  name: string
  yourValue: number
  avgValue: number
  topValue: number
  unit?: string
  higherIsBetter?: boolean
}

interface BenchmarkResult {
  providerId: string
  serviceCategory: string
  city: string
  region?: string
  metrics: BenchmarkMetric[]
  rank: {
    city: number
    totalInCity: number
    region?: number
    totalInRegion?: number
    national?: number
    totalNational?: number
  }
  percentile: number
  calculatedAt: string
}

interface UseBenchmarkingOptions {
  providerId: string
  autoFetch?: boolean
}

export function useBenchmarking({
  providerId,
  autoFetch = true,
}: UseBenchmarkingOptions) {
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null)
  const [history, setHistory] = useState<BenchmarkResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBenchmark = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/artisan/benchmark?providerId=${providerId}`)

      if (!response.ok) throw new Error('Failed to fetch benchmark')

      const data = await response.json()
      setBenchmark(data.benchmark)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch benchmark'))
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  const fetchHistory = useCallback(async (periods: number = 12) => {
    try {
      const response = await fetch(
        `/api/artisan/benchmark/history?providerId=${providerId}&periods=${periods}`
      )

      if (!response.ok) throw new Error('Failed to fetch benchmark history')

      const data = await response.json()
      setHistory(data.history || [])
    } catch (err) {
      console.error('Failed to fetch benchmark history', err)
    }
  }, [providerId])

  const recalculate = useCallback(async () => {
    try {
      setIsCalculating(true)
      const response = await fetch(`/api/artisan/benchmark/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      })

      if (!response.ok) throw new Error('Failed to recalculate benchmark')

      const data = await response.json()
      setBenchmark(data.benchmark)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to recalculate benchmark'))
    } finally {
      setIsCalculating(false)
    }
  }, [providerId])

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchBenchmark()
      fetchHistory()
    }
  }, [autoFetch, fetchBenchmark, fetchHistory])

  // Calculate comparison helpers
  const getMetricComparison = useCallback(
    (metricName: string) => {
      if (!benchmark) return null

      const metric = benchmark.metrics.find((m) => m.name === metricName)
      if (!metric) return null

      const diff = metric.yourValue - metric.avgValue
      const percentage = metric.avgValue !== 0 ? (diff / metric.avgValue) * 100 : 0
      const isBetter = metric.higherIsBetter !== false ? diff > 0 : diff < 0

      return {
        metric,
        diff,
        percentage: Math.abs(percentage),
        isBetter,
        isNeutral: Math.abs(percentage) < 5,
      }
    },
    [benchmark]
  )

  const getOverallScore = useCallback(() => {
    if (!benchmark || benchmark.metrics.length === 0) return 0

    return benchmark.metrics.reduce((acc, metric) => {
      const percentile = calculatePercentile(
        metric.yourValue,
        metric.avgValue,
        metric.topValue,
        metric.higherIsBetter ?? true
      )
      return acc + percentile
    }, 0) / benchmark.metrics.length
  }, [benchmark])

  const getStrengths = useCallback(() => {
    if (!benchmark) return []

    return benchmark.metrics
      .filter((metric) => {
        const comparison = getMetricComparison(metric.name)
        return comparison && comparison.isBetter && comparison.percentage > 10
      })
      .sort((a, b) => {
        const compA = getMetricComparison(a.name)
        const compB = getMetricComparison(b.name)
        return (compB?.percentage || 0) - (compA?.percentage || 0)
      })
  }, [benchmark, getMetricComparison])

  const getWeaknesses = useCallback(() => {
    if (!benchmark) return []

    return benchmark.metrics
      .filter((metric) => {
        const comparison = getMetricComparison(metric.name)
        return comparison && !comparison.isBetter && comparison.percentage > 10
      })
      .sort((a, b) => {
        const compA = getMetricComparison(a.name)
        const compB = getMetricComparison(b.name)
        return (compB?.percentage || 0) - (compA?.percentage || 0)
      })
  }, [benchmark, getMetricComparison])

  return {
    benchmark,
    history,
    isLoading,
    isCalculating,
    error,
    refresh: fetchBenchmark,
    refreshHistory: fetchHistory,
    recalculate,
    getMetricComparison,
    getOverallScore,
    getStrengths,
    getWeaknesses,
  }
}

function calculatePercentile(
  yourValue: number,
  avgValue: number,
  topValue: number,
  higherIsBetter: boolean
): number {
  if (topValue === avgValue) return 50

  let percentile: number
  if (higherIsBetter) {
    if (yourValue >= topValue) return 95
    if (yourValue <= avgValue) {
      percentile = 50 * (yourValue / avgValue)
    } else {
      percentile = 50 + 45 * ((yourValue - avgValue) / (topValue - avgValue))
    }
  } else {
    if (yourValue <= topValue) return 95
    if (yourValue >= avgValue) {
      percentile = 50 * (avgValue / yourValue)
    } else {
      percentile = 50 + 45 * ((avgValue - yourValue) / (avgValue - topValue))
    }
  }

  return Math.min(100, Math.max(0, percentile))
}

export default useBenchmarking
