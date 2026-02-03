'use client'

import { useState, useEffect, useCallback } from 'react'

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
  isRead: boolean
  isDismissed: boolean
  createdAt: string
}

interface UseInsightsOptions {
  providerId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useInsights({
  providerId,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}: UseInsightsOptions) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch(`/api/artisan/insights?providerId=${providerId}`)
      if (!response.ok) throw new Error('Failed to fetch insights')

      const data = await response.json()
      const activeInsights = (data.insights || []).filter((i: Insight) => !i.isDismissed)

      setInsights(activeInsights)
      setUnreadCount(activeInsights.filter((i: Insight) => !i.isRead).length)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch insights'))
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  // Initial fetch and polling
  useEffect(() => {
    fetchInsights()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchInsights, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchInsights, autoRefresh, refreshInterval])

  const markAsRead = useCallback(async (insightId: string) => {
    try {
      await fetch(`/api/artisan/insights/${insightId}/read`, { method: 'POST' })

      setInsights((prev) =>
        prev.map((insight) =>
          insight.id === insightId ? { ...insight, isRead: true } : insight
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark insight as read', err)
    }
  }, [])

  const dismiss = useCallback(async (insightId: string) => {
    try {
      await fetch(`/api/artisan/insights/${insightId}/dismiss`, { method: 'POST' })

      setInsights((prev) => prev.filter((insight) => insight.id !== insightId))
    } catch (err) {
      console.error('Failed to dismiss insight', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`/api/artisan/insights/mark-all-read?providerId=${providerId}`, {
        method: 'POST',
      })

      setInsights((prev) => prev.map((insight) => ({ ...insight, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }, [providerId])

  // Group insights by priority
  const groupedInsights = {
    critical: insights.filter((i) => i.priority === 'critical'),
    high: insights.filter((i) => i.priority === 'high'),
    medium: insights.filter((i) => i.priority === 'medium'),
    low: insights.filter((i) => i.priority === 'low'),
  }

  // Group insights by type
  const insightsByType = {
    trends: insights.filter((i) => i.type === 'performance_trend'),
    anomalies: insights.filter((i) => i.type === 'anomaly'),
    opportunities: insights.filter((i) => i.type === 'opportunity'),
    recommendations: insights.filter((i) => i.type === 'recommendation'),
    warnings: insights.filter((i) => i.type === 'warning'),
    benchmarks: insights.filter((i) => i.type === 'benchmark_comparison'),
  }

  return {
    insights,
    groupedInsights,
    insightsByType,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    dismiss,
    markAllAsRead,
    refresh: fetchInsights,
  }
}

export default useInsights
