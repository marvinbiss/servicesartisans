/**
 * Predictions Service
 * Predictive analytics using simple statistical models
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface Prediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  periodDays: number
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

interface TimeSeriesPoint {
  date: Date
  value: number
}

/**
 * Simple linear regression
 */
function linearRegression(points: TimeSeriesPoint[]): {
  slope: number
  intercept: number
  r2: number
} {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }

  // Convert dates to numeric values (days from first point)
  const firstDate = points[0].date.getTime()
  const x = points.map((p) => (p.date.getTime() - firstDate) / (24 * 60 * 60 * 1000))
  const y = points.map((p) => p.value)

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const yMean = sumY / n
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept
    return sum + Math.pow(yi - predicted, 2)
  }, 0)
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) }
}

/**
 * Calculate seasonality index (7-day cycle for weekly patterns)
 */
function calculateSeasonality(points: TimeSeriesPoint[]): number[] {
  const byDayOfWeek: number[][] = [[], [], [], [], [], [], []]

  points.forEach((point) => {
    const dayOfWeek = point.date.getDay()
    byDayOfWeek[dayOfWeek].push(point.value)
  })

  const overallMean = points.reduce((sum, p) => sum + p.value, 0) / points.length

  return byDayOfWeek.map((values) => {
    if (values.length === 0) return 1
    const dayMean = values.reduce((a, b) => a + b, 0) / values.length
    return overallMean === 0 ? 1 : dayMean / overallMean
  })
}

/**
 * Predict future value
 */
function predictValue(
  points: TimeSeriesPoint[],
  daysAhead: number,
  useSeasonality: boolean = true
): { value: number; confidence: number } {
  if (points.length < 7) {
    // Not enough data, return last value
    return {
      value: points[points.length - 1]?.value || 0,
      confidence: 0.2,
    }
  }

  const { slope, intercept, r2 } = linearRegression(points)
  const lastDate = points[points.length - 1].date.getTime()
  const firstDate = points[0].date.getTime()
  const futureDays =
    (lastDate - firstDate) / (24 * 60 * 60 * 1000) + daysAhead

  let predicted = slope * futureDays + intercept

  // Apply seasonality adjustment
  if (useSeasonality && points.length >= 14) {
    const futureDate = new Date(lastDate + daysAhead * 24 * 60 * 60 * 1000)
    const seasonality = calculateSeasonality(points)
    const dayOfWeek = futureDate.getDay()
    predicted *= seasonality[dayOfWeek]
  }

  // Calculate confidence based on R2 and data recency
  const dataRecency = Math.min(1, points.length / 30)
  const confidence = r2 * 0.7 + dataRecency * 0.3

  return {
    value: Math.max(0, predicted),
    confidence: Math.round(confidence * 100) / 100,
  }
}

/**
 * Identify prediction factors
 */
function identifyFactors(
  points: TimeSeriesPoint[]
): PredictionFactor[] {
  const factors: PredictionFactor[] = []

  // Trend factor
  const { slope } = linearRegression(points)
  if (Math.abs(slope) > 0.1) {
    factors.push({
      name: 'Tendance historique',
      impact: slope > 0 ? 'positive' : 'negative',
      weight: Math.min(1, Math.abs(slope) / 5),
      description:
        slope > 0
          ? 'La tendance récente est à la hausse'
          : 'La tendance récente est à la baisse',
    })
  }

  // Volatility factor
  const values = points.map((p) => p.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0

  if (cv > 0.3) {
    factors.push({
      name: 'Volatilité',
      impact: 'negative',
      weight: Math.min(1, cv),
      description: 'Les données sont assez volatiles, réduisant la précision',
    })
  }

  // Seasonality factor
  if (points.length >= 14) {
    const seasonality = calculateSeasonality(points)
    const maxSeason = Math.max(...seasonality)
    const minSeason = Math.min(...seasonality)
    const seasonRange = maxSeason - minSeason

    if (seasonRange > 0.3) {
      factors.push({
        name: 'Saisonnalité hebdomadaire',
        impact: 'neutral',
        weight: Math.min(1, seasonRange),
        description: 'Il y a des variations significatives selon le jour de la semaine',
      })
    }
  }

  // Growth momentum
  if (points.length >= 7) {
    const recentPoints = points.slice(-7)
    const olderPoints = points.slice(-14, -7)

    if (olderPoints.length >= 7) {
      const recentAvg = recentPoints.reduce((s, p) => s + p.value, 0) / 7
      const olderAvg = olderPoints.reduce((s, p) => s + p.value, 0) / 7

      if (olderAvg > 0) {
        const momentum = (recentAvg - olderAvg) / olderAvg

        if (Math.abs(momentum) > 0.1) {
          factors.push({
            name: 'Momentum récent',
            impact: momentum > 0 ? 'positive' : 'negative',
            weight: Math.min(1, Math.abs(momentum)),
            description:
              momentum > 0
                ? 'Accélération récente de la croissance'
                : 'Ralentissement récent observé',
          })
        }
      }
    }
  }

  return factors
}

/**
 * Generate predictions for a provider
 */
export async function generatePredictions(
  providerId: string,
  periodDays: number = 30
): Promise<Prediction[]> {
  try {
    const supabase = await createClient()
    const lookbackDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    // Fetch historical data
    const [bookingsResult, revenueResult, viewsResult] = await Promise.all([
      supabase
        .from('bookings')
        .select('created_at')
        .eq('artisan_id', providerId)
        .gte('created_at', lookbackDate.toISOString()),

      supabase
        .from('bookings')
        .select('deposit_amount, created_at')
        .eq('artisan_id', providerId)
        .in('status', ['completed', 'confirmed'])
        .gte('created_at', lookbackDate.toISOString()),

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
    ): TimeSeriesPoint[] => {
      const byDay = new Map<string, number>()

      items.forEach((item) => {
        const day = item.created_at.split('T')[0]
        const value = item.deposit_amount !== undefined ? item.deposit_amount / 100 : 1
        byDay.set(day, (byDay.get(day) || 0) + value)
      })

      return Array.from(byDay.entries())
        .map(([day, value]) => ({
          date: new Date(day),
          value,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    }

    const predictions: Prediction[] = []

    // Bookings prediction
    if (bookingsResult.data && bookingsResult.data.length > 0) {
      const bookingPoints = aggregateByDay(bookingsResult.data)
      const currentValue = bookingPoints.slice(-7).reduce((s, p) => s + p.value, 0) / 7
      const { value: predictedValue, confidence } = predictValue(bookingPoints, periodDays)
      const factors = identifyFactors(bookingPoints)

      predictions.push({
        metric: 'Réservations',
        currentValue: Math.round(currentValue * 10) / 10,
        predictedValue: Math.round(predictedValue * 10) / 10,
        confidence,
        trend: predictedValue > currentValue * 1.05 ? 'up' : predictedValue < currentValue * 0.95 ? 'down' : 'stable',
        periodDays,
        factors,
      })
    }

    // Revenue prediction
    if (revenueResult.data && revenueResult.data.length > 0) {
      const revenuePoints = aggregateByDay(revenueResult.data)
      const currentValue = revenuePoints.slice(-7).reduce((s, p) => s + p.value, 0) / 7
      const { value: predictedValue, confidence } = predictValue(revenuePoints, periodDays)
      const factors = identifyFactors(revenuePoints)

      predictions.push({
        metric: 'Revenus journaliers',
        currentValue: Math.round(currentValue),
        predictedValue: Math.round(predictedValue),
        confidence,
        trend: predictedValue > currentValue * 1.05 ? 'up' : predictedValue < currentValue * 0.95 ? 'down' : 'stable',
        periodDays,
        factors,
      })
    }

    // Views prediction
    if (viewsResult.data && viewsResult.data.length > 0) {
      const viewPoints = aggregateByDay(viewsResult.data)
      const currentValue = viewPoints.slice(-7).reduce((s, p) => s + p.value, 0) / 7
      const { value: predictedValue, confidence } = predictValue(viewPoints, periodDays)
      const factors = identifyFactors(viewPoints)

      predictions.push({
        metric: 'Vues profil',
        currentValue: Math.round(currentValue),
        predictedValue: Math.round(predictedValue),
        confidence,
        trend: predictedValue > currentValue * 1.05 ? 'up' : predictedValue < currentValue * 0.95 ? 'down' : 'stable',
        periodDays,
        factors,
      })
    }

    return predictions
  } catch (error) {
    logger.error('Error generating predictions', error)
    return []
  }
}

/**
 * Predict monthly revenue
 */
export async function predictMonthlyRevenue(
  providerId: string
): Promise<{
  currentMonth: number
  predictedNextMonth: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}> {
  try {
    const supabase = await createClient()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data } = await supabase
      .from('bookings')
      .select('deposit_amount, created_at')
      .eq('artisan_id', providerId)
      .in('status', ['completed', 'confirmed'])
      .gte('created_at', sixMonthsAgo.toISOString())

    if (!data || data.length === 0) {
      return {
        currentMonth: 0,
        predictedNextMonth: 0,
        confidence: 0,
        trend: 'stable',
      }
    }

    // Aggregate by month
    const byMonth = new Map<string, number>()
    data.forEach((item) => {
      const month = item.created_at.substring(0, 7) // YYYY-MM
      byMonth.set(month, (byMonth.get(month) || 0) + (item.deposit_amount || 0) / 100)
    })

    const monthlyPoints: TimeSeriesPoint[] = Array.from(byMonth.entries())
      .map(([month, value]) => ({
        date: new Date(month + '-01'),
        value,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const currentMonth = monthlyPoints[monthlyPoints.length - 1]?.value || 0
    const { value: predictedNextMonth, confidence } = predictValue(monthlyPoints, 30)

    return {
      currentMonth: Math.round(currentMonth),
      predictedNextMonth: Math.round(predictedNextMonth),
      confidence,
      trend:
        predictedNextMonth > currentMonth * 1.05
          ? 'up'
          : predictedNextMonth < currentMonth * 0.95
          ? 'down'
          : 'stable',
    }
  } catch (error) {
    logger.error('Error predicting monthly revenue', error)
    return {
      currentMonth: 0,
      predictedNextMonth: 0,
      confidence: 0,
      trend: 'stable',
    }
  }
}

export default {
  generatePredictions,
  predictMonthlyRevenue,
}
