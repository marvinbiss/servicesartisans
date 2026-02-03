/**
 * Benchmarking Service
 * Compare provider metrics against competitors
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface BenchmarkMetric {
  name: string
  yourValue: number
  avgValue: number
  topValue: number
  unit?: string
  higherIsBetter?: boolean
}

export interface BenchmarkResult {
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

export async function calculateBenchmarks(providerId: string): Promise<BenchmarkResult | null> {
  try {
    const supabase = await createClient()

    // Get provider info
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(`
        id,
        specialty,
        address_city,
        address_region,
        rating_average,
        review_count,
        response_rate,
        avg_response_time_hours,
        hourly_rate_min,
        trust_score
      `)
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      throw new Error('Provider not found')
    }

    const { specialty, address_city: city, address_region: region } = provider

    // Get competitors in same city and category
    const { data: cityCompetitors } = await supabase
      .from('providers')
      .select('id, rating_average, review_count, response_rate, avg_response_time_hours, hourly_rate_min, trust_score')
      .eq('specialty', specialty)
      .eq('address_city', city)
      .eq('is_active', true)

    // Get competitors in same region
    const { data: regionCompetitors } = region
      ? await supabase
          .from('providers')
          .select('id, rating_average, review_count, response_rate, avg_response_time_hours, hourly_rate_min, trust_score')
          .eq('specialty', specialty)
          .eq('address_region', region)
          .eq('is_active', true)
      : { data: [] }

    // Get national competitors
    const { data: nationalCompetitors } = await supabase
      .from('providers')
      .select('id, rating_average, review_count, response_rate, avg_response_time_hours, hourly_rate_min, trust_score')
      .eq('specialty', specialty)
      .eq('is_active', true)
      .limit(1000)

    const cityData = cityCompetitors || []
    const regionData = regionCompetitors || []
    const nationalData = nationalCompetitors || []

    // Calculate metrics
    const metrics: BenchmarkMetric[] = []

    // Rating
    metrics.push(calculateMetric(
      'Note moyenne',
      provider.rating_average || 0,
      cityData.map(c => c.rating_average || 0),
      '',
      true
    ))

    // Review count
    metrics.push(calculateMetric(
      'Nombre d\'avis',
      provider.review_count || 0,
      cityData.map(c => c.review_count || 0),
      '',
      true
    ))

    // Response rate
    metrics.push(calculateMetric(
      'Taux de réponse',
      provider.response_rate || 0,
      cityData.map(c => c.response_rate || 0),
      '%',
      true
    ))

    // Response time
    metrics.push(calculateMetric(
      'Temps de réponse',
      provider.avg_response_time_hours || 24,
      cityData.map(c => c.avg_response_time_hours || 24),
      'h',
      false
    ))

    // Price (if available)
    if (provider.hourly_rate_min) {
      const competitorPrices = cityData
        .map(c => c.hourly_rate_min)
        .filter((p): p is number => p !== null)

      if (competitorPrices.length > 0) {
        metrics.push(calculateMetric(
          'Tarif horaire',
          provider.hourly_rate_min,
          competitorPrices,
          'EUR',
          false // Lower price is generally more competitive
        ))
      }
    }

    // Trust score
    metrics.push(calculateMetric(
      'Score de confiance',
      provider.trust_score || 0,
      cityData.map(c => c.trust_score || 0),
      '',
      true
    ))

    // Calculate rankings
    const cityRank = calculateRank(provider.trust_score || 0, cityData.map(c => c.trust_score || 0))
    const regionRank = region
      ? calculateRank(provider.trust_score || 0, regionData.map(c => c.trust_score || 0))
      : undefined
    const nationalRank = calculateRank(
      provider.trust_score || 0,
      nationalData.map(c => c.trust_score || 0)
    )

    // Calculate overall percentile
    const percentile = Math.round(
      metrics.reduce((acc, m) => {
        const pct = calculatePercentile(m.yourValue, m.avgValue, m.topValue, m.higherIsBetter ?? true)
        return acc + pct
      }, 0) / metrics.length
    )

    const result: BenchmarkResult = {
      providerId,
      serviceCategory: specialty || 'Artisan',
      city: city || 'France',
      region,
      metrics,
      rank: {
        city: cityRank,
        totalInCity: cityData.length,
        region: regionRank,
        totalInRegion: regionData.length,
        national: nationalRank,
        totalNational: nationalData.length,
      },
      percentile,
      calculatedAt: new Date().toISOString(),
    }

    // Store in database
    await supabase.from('provider_benchmarks').upsert({
      provider_id: providerId,
      service_category: specialty,
      city,
      region,
      metrics: metrics,
      percentiles: {
        city: cityRank,
        region: regionRank,
        national: nationalRank,
      },
      rank_in_city: cityRank,
      rank_in_region: regionRank,
      rank_national: nationalRank,
      total_competitors: cityData.length,
      calculated_at: new Date().toISOString(),
    })

    return result
  } catch (error) {
    logger.error('Error calculating benchmarks', error)
    return null
  }
}

function calculateMetric(
  name: string,
  yourValue: number,
  competitorValues: number[],
  unit: string,
  higherIsBetter: boolean
): BenchmarkMetric {
  const validValues = competitorValues.filter(v => v !== null && v !== undefined && !isNaN(v))

  if (validValues.length === 0) {
    return {
      name,
      yourValue,
      avgValue: yourValue,
      topValue: yourValue,
      unit,
      higherIsBetter,
    }
  }

  const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length
  const sortedValues = [...validValues].sort((a, b) => higherIsBetter ? b - a : a - b)
  const top10Index = Math.max(0, Math.floor(sortedValues.length * 0.1) - 1)
  const topValue = sortedValues[top10Index] || sortedValues[0]

  return {
    name,
    yourValue: parseFloat(yourValue.toFixed(2)),
    avgValue: parseFloat(avgValue.toFixed(2)),
    topValue: parseFloat(topValue.toFixed(2)),
    unit,
    higherIsBetter,
  }
}

function calculateRank(yourValue: number, allValues: number[]): number {
  const sortedValues = [...allValues].sort((a, b) => b - a)
  const rank = sortedValues.findIndex(v => v <= yourValue) + 1
  return rank || allValues.length
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

export async function getBenchmarkHistory(
  providerId: string,
  periods: number = 12
): Promise<BenchmarkResult[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('provider_benchmarks')
      .select('*')
      .eq('provider_id', providerId)
      .order('calculated_at', { ascending: false })
      .limit(periods)

    if (error) throw error

    return (data || []).map(row => ({
      providerId: row.provider_id,
      serviceCategory: row.service_category,
      city: row.city,
      region: row.region,
      metrics: row.metrics as BenchmarkMetric[],
      rank: {
        city: row.rank_in_city,
        totalInCity: row.total_competitors,
        region: row.rank_in_region,
        national: row.rank_national,
      },
      percentile: 0, // Would need to recalculate
      calculatedAt: row.calculated_at,
    }))
  } catch (error) {
    logger.error('Error fetching benchmark history', error)
    return []
  }
}

export default {
  calculateBenchmarks,
  getBenchmarkHistory,
}
