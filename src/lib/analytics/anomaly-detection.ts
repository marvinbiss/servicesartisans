/**
 * Anomaly Detection Service
 * Statistical analysis for detecting unusual patterns in metrics
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface Anomaly {
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

interface MetricDataPoint {
  timestamp: Date
  value: number
}

interface AnomalyConfig {
  // Standard deviations for severity thresholds
  lowThreshold: number
  mediumThreshold: number
  highThreshold: number
  criticalThreshold: number
  // Minimum data points required for detection
  minDataPoints: number
  // Lookback period in days
  lookbackDays: number
}

const defaultConfig: AnomalyConfig = {
  lowThreshold: 1.5,
  mediumThreshold: 2.0,
  highThreshold: 2.5,
  criticalThreshold: 3.0,
  minDataPoints: 7,
  lookbackDays: 30,
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(variance)

  return { mean, std }
}

/**
 * Calculate z-score for a value
 */
function calculateZScore(value: number, mean: number, std: number): number {
  if (std === 0) return 0
  return (value - mean) / std
}

/**
 * Determine severity based on z-score
 */
function getSeverity(zScore: number, config: AnomalyConfig): Anomaly['severity'] {
  const absZ = Math.abs(zScore)

  if (absZ >= config.criticalThreshold) return 'critical'
  if (absZ >= config.highThreshold) return 'high'
  if (absZ >= config.mediumThreshold) return 'medium'
  if (absZ >= config.lowThreshold) return 'low'

  return 'low'
}

/**
 * Detect anomaly type
 */
function getAnomalyType(
  currentValue: number,
  previousValues: number[]
): Anomaly['type'] {
  const { mean } = calculateStats(previousValues)

  if (currentValue > mean * 1.5) return 'spike'
  if (currentValue < mean * 0.5) return 'drop'
  return 'unusual_pattern'
}

/**
 * Generate description and suggested action
 */
function generateInsight(
  metric: string,
  type: Anomaly['type'],
  deviation: number
): { description: string; suggestedAction?: string } {
  const direction = deviation > 0 ? 'augmenté' : 'diminué'
  const absDeviation = Math.abs(deviation).toFixed(1)

  const descriptions: Record<string, Record<Anomaly['type'], { desc: string; action: string }>> = {
    bookings: {
      spike: {
        desc: `Vos réservations ont ${direction} de ${absDeviation}% par rapport à la normale. C'est une hausse inhabituelle.`,
        action: 'Vérifiez que vous pouvez gérer cette augmentation de demande.',
      },
      drop: {
        desc: `Vos réservations ont ${direction} de ${absDeviation}% par rapport à la normale. C'est une baisse significative.`,
        action: 'Mettez à jour vos disponibilités et votre tarification.',
      },
      unusual_pattern: {
        desc: `Le pattern de vos réservations est inhabituel avec une variation de ${absDeviation}%.`,
        action: 'Analysez les facteurs qui pourraient expliquer ce changement.',
      },
    },
    revenue: {
      spike: {
        desc: `Vos revenus ont ${direction} de ${absDeviation}% par rapport à la normale.`,
        action: 'Identifiez les sources de cette augmentation pour la reproduire.',
      },
      drop: {
        desc: `Vos revenus ont ${direction} de ${absDeviation}% par rapport à la normale.`,
        action: 'Revoyez vos devis récents et votre stratégie tarifaire.',
      },
      unusual_pattern: {
        desc: `Vos revenus présentent une variation inhabituelle de ${absDeviation}%.`,
        action: 'Analysez les tendances sur les dernières semaines.',
      },
    },
    views: {
      spike: {
        desc: `Les vues de votre profil ont ${direction} de ${absDeviation}%.`,
        action: 'Profitez de cette visibilité pour optimiser votre profil.',
      },
      drop: {
        desc: `Les vues de votre profil ont ${direction} de ${absDeviation}%.`,
        action: 'Mettez à jour votre profil avec de nouvelles photos.',
      },
      unusual_pattern: {
        desc: `Les vues de votre profil présentent un pattern inhabituel.`,
        action: 'Vérifiez votre positionnement dans les résultats de recherche.',
      },
    },
    response_rate: {
      spike: {
        desc: `Votre taux de réponse a ${direction} de ${absDeviation}%.`,
        action: 'Continuez à répondre rapidement aux demandes.',
      },
      drop: {
        desc: `Votre taux de réponse a ${direction} de ${absDeviation}%.`,
        action: 'Répondez à tous les messages dans les 2 heures.',
      },
      unusual_pattern: {
        desc: `Votre taux de réponse présente une variation inhabituelle.`,
        action: 'Vérifiez vos notifications et paramètres de messagerie.',
      },
    },
  }

  const metricInsights = descriptions[metric] || descriptions.bookings
  const insight = metricInsights[type]

  return {
    description: insight.desc,
    suggestedAction: insight.action,
  }
}

/**
 * Detect anomalies in a metric series
 */
export function detectAnomalies(
  metric: string,
  dataPoints: MetricDataPoint[],
  config: AnomalyConfig = defaultConfig
): Anomaly[] {
  if (dataPoints.length < config.minDataPoints) {
    return []
  }

  const anomalies: Anomaly[] = []

  // Sort by timestamp
  const sortedPoints = [...dataPoints].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )

  // Calculate rolling statistics
  for (let i = config.minDataPoints; i < sortedPoints.length; i++) {
    const currentPoint = sortedPoints[i]
    const historicalValues = sortedPoints.slice(0, i).map((p) => p.value)

    const { mean, std } = calculateStats(historicalValues)
    const zScore = calculateZScore(currentPoint.value, mean, std)

    // Check if anomaly threshold is exceeded
    if (Math.abs(zScore) >= config.lowThreshold) {
      const severity = getSeverity(zScore, config)
      const type = getAnomalyType(currentPoint.value, historicalValues)
      const deviation = mean !== 0 ? ((currentPoint.value - mean) / mean) * 100 : 0
      const { description, suggestedAction } = generateInsight(metric, type, deviation)

      anomalies.push({
        id: `anomaly-${metric}-${currentPoint.timestamp.getTime()}`,
        metric,
        type,
        severity,
        currentValue: Math.round(currentPoint.value * 100) / 100,
        expectedValue: Math.round(mean * 100) / 100,
        deviation: Math.round(deviation * 10) / 10,
        detectedAt: currentPoint.timestamp.toISOString(),
        description,
        suggestedAction,
      })
    }
  }

  // Return only recent anomalies (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return anomalies.filter((a) => new Date(a.detectedAt) >= oneDayAgo)
}

/**
 * Detect anomalies for a provider across all metrics
 */
export async function detectProviderAnomalies(
  providerId: string,
  config: AnomalyConfig = defaultConfig
): Promise<Anomaly[]> {
  try {
    const supabase = await createClient()
    const lookbackDate = new Date(Date.now() - config.lookbackDays * 24 * 60 * 60 * 1000)

    // Fetch historical data for different metrics
    const [bookingsResult, revenueResult, viewsResult] = await Promise.all([
      // Daily bookings
      supabase
        .from('bookings')
        .select('created_at')
        .eq('artisan_id', providerId)
        .gte('created_at', lookbackDate.toISOString()),

      // Daily revenue
      supabase
        .from('bookings')
        .select('deposit_amount, created_at')
        .eq('artisan_id', providerId)
        .in('status', ['completed', 'confirmed'])
        .gte('created_at', lookbackDate.toISOString()),

      // Daily views
      supabase
        .from('analytics_events')
        .select('created_at')
        .eq('provider_id', providerId)
        .eq('event_type', 'profile_view')
        .gte('created_at', lookbackDate.toISOString()),
    ])

    // Aggregate by day
    const aggregateByDay = (
      items: { created_at: string; deposit_amount?: number }[]
    ): MetricDataPoint[] => {
      const byDay = new Map<string, number>()

      items.forEach((item) => {
        const day = item.created_at.split('T')[0]
        const value = item.deposit_amount !== undefined ? item.deposit_amount / 100 : 1
        byDay.set(day, (byDay.get(day) || 0) + value)
      })

      return Array.from(byDay.entries()).map(([day, value]) => ({
        timestamp: new Date(day),
        value,
      }))
    }

    const allAnomalies: Anomaly[] = []

    // Detect anomalies in bookings
    if (bookingsResult.data) {
      const bookingPoints = aggregateByDay(bookingsResult.data)
      const bookingAnomalies = detectAnomalies('bookings', bookingPoints, config)
      allAnomalies.push(...bookingAnomalies)
    }

    // Detect anomalies in revenue
    if (revenueResult.data) {
      const revenuePoints = aggregateByDay(revenueResult.data)
      const revenueAnomalies = detectAnomalies('revenue', revenuePoints, config)
      allAnomalies.push(...revenueAnomalies)
    }

    // Detect anomalies in views
    if (viewsResult.data) {
      const viewPoints = aggregateByDay(viewsResult.data)
      const viewAnomalies = detectAnomalies('views', viewPoints, config)
      allAnomalies.push(...viewAnomalies)
    }

    // Sort by severity and recency
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    allAnomalies.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })

    // Store detected anomalies
    for (const anomaly of allAnomalies.slice(0, 5)) {
      await supabase.from('analytics_insights').upsert({
        provider_id: providerId,
        insight_type: 'anomaly',
        title: `Anomalie: ${anomaly.metric}`,
        description: anomaly.description,
        data: {
          type: anomaly.type,
          currentValue: anomaly.currentValue,
          expectedValue: anomaly.expectedValue,
          deviation: anomaly.deviation,
        },
        priority: anomaly.severity,
        action_label: anomaly.suggestedAction,
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    return allAnomalies
  } catch (error) {
    logger.error('Error detecting provider anomalies', error)
    return []
  }
}

export default {
  detectAnomalies,
  detectProviderAnomalies,
}
