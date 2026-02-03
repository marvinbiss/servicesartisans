/**
 * Insights Engine Service
 * AI-powered insight generation for artisan dashboards
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type InsightType =
  | 'performance_trend'
  | 'anomaly'
  | 'opportunity'
  | 'benchmark_comparison'
  | 'recommendation'
  | 'warning'

export interface Insight {
  id: string
  providerId: string
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
  validUntil?: string
}

interface ProviderMetrics {
  bookingsThisWeek: number
  bookingsLastWeek: number
  revenueThisMonth: number
  revenueLastMonth: number
  profileViews: number
  profileViewsChange: number
  responseRate: number
  avgResponseTime: number
  rating: number
  reviewCount: number
  quoteRequests: number
  quoteConversionRate: number
}

// Insight generators
const insightGenerators: Array<(metrics: ProviderMetrics, providerId: string) => Insight | null> = [
  // Booking trend insight
  (metrics, providerId) => {
    if (metrics.bookingsLastWeek === 0) return null

    const change = ((metrics.bookingsThisWeek - metrics.bookingsLastWeek) / metrics.bookingsLastWeek) * 100

    if (Math.abs(change) < 10) return null

    const isPositive = change > 0
    return {
      id: `insight-booking-trend-${Date.now()}`,
      providerId,
      type: 'performance_trend',
      title: isPositive ? 'Réservations en hausse' : 'Réservations en baisse',
      description: isPositive
        ? `Vos réservations ont augmenté de ${Math.abs(change).toFixed(0)}% cette semaine. Continuez ainsi !`
        : `Vos réservations ont diminué de ${Math.abs(change).toFixed(0)}% cette semaine. Pensez à mettre à jour vos disponibilités.`,
      data: {
        trend: isPositive ? 'up' : 'down',
        percentage: Math.abs(change),
        metric: 'Réservations',
        value: metrics.bookingsThisWeek,
        previousValue: metrics.bookingsLastWeek,
      },
      priority: Math.abs(change) > 30 ? 'high' : 'medium',
      actionUrl: '/espace-artisan/calendrier',
      actionLabel: 'Voir le calendrier',
    }
  },

  // Response rate warning
  (metrics, providerId) => {
    if (metrics.responseRate >= 90) return null

    return {
      id: `insight-response-rate-${Date.now()}`,
      providerId,
      type: 'warning',
      title: 'Taux de réponse à améliorer',
      description: `Votre taux de réponse est de ${metrics.responseRate.toFixed(0)}%. Les artisans avec un taux supérieur à 90% reçoivent 3x plus de demandes.`,
      data: {
        percentage: metrics.responseRate,
        metric: 'Taux de réponse',
      },
      priority: metrics.responseRate < 70 ? 'critical' : 'high',
      actionUrl: '/espace-artisan/messages',
      actionLabel: 'Voir les messages',
    }
  },

  // Slow response time
  (metrics, providerId) => {
    if (metrics.avgResponseTime <= 2) return null

    return {
      id: `insight-response-time-${Date.now()}`,
      providerId,
      type: 'recommendation',
      title: 'Répondez plus rapidement',
      description: `Votre temps de réponse moyen est de ${metrics.avgResponseTime.toFixed(1)}h. Les clients préfèrent les artisans qui répondent en moins de 2h.`,
      data: {
        value: metrics.avgResponseTime,
        metric: 'Temps de réponse (heures)',
      },
      priority: metrics.avgResponseTime > 24 ? 'high' : 'medium',
      actionUrl: '/espace-artisan/messages',
      actionLabel: 'Répondre maintenant',
    }
  },

  // Profile views opportunity
  (metrics, providerId) => {
    if (metrics.profileViewsChange >= -10) return null

    return {
      id: `insight-visibility-${Date.now()}`,
      providerId,
      type: 'opportunity',
      title: 'Boostez votre visibilité',
      description: `Vos vues de profil ont diminué de ${Math.abs(metrics.profileViewsChange).toFixed(0)}%. Mettez à jour votre profil avec de nouvelles photos pour attirer plus de clients.`,
      data: {
        trend: 'down',
        percentage: Math.abs(metrics.profileViewsChange),
        metric: 'Vues du profil',
      },
      priority: 'medium',
      actionUrl: '/espace-artisan/profil',
      actionLabel: 'Modifier le profil',
    }
  },

  // Quote conversion opportunity
  (metrics, providerId) => {
    if (metrics.quoteRequests < 5 || metrics.quoteConversionRate >= 30) return null

    return {
      id: `insight-conversion-${Date.now()}`,
      providerId,
      type: 'opportunity',
      title: 'Améliorez vos conversions',
      description: `Seulement ${metrics.quoteConversionRate.toFixed(0)}% de vos devis sont acceptés. Répondez plus rapidement et proposez des prix compétitifs.`,
      data: {
        percentage: metrics.quoteConversionRate,
        metric: 'Taux de conversion devis',
      },
      priority: 'medium',
      actionUrl: '/espace-artisan/devis',
      actionLabel: 'Voir les devis',
    }
  },

  // Low review count
  (metrics, providerId) => {
    if (metrics.reviewCount >= 10) return null

    return {
      id: `insight-reviews-${Date.now()}`,
      providerId,
      type: 'recommendation',
      title: 'Collectez plus d\'avis',
      description: `Vous n'avez que ${metrics.reviewCount} avis. Les artisans avec plus de 10 avis reçoivent 50% plus de demandes.`,
      data: {
        value: metrics.reviewCount,
        metric: 'Nombre d\'avis',
      },
      priority: metrics.reviewCount < 5 ? 'high' : 'medium',
      actionUrl: '/espace-artisan/avis',
      actionLabel: 'Demander des avis',
    }
  },

  // Revenue anomaly
  (metrics, providerId) => {
    if (metrics.revenueLastMonth === 0) return null

    const change = ((metrics.revenueThisMonth - metrics.revenueLastMonth) / metrics.revenueLastMonth) * 100

    if (Math.abs(change) < 30) return null

    const isPositive = change > 0
    return {
      id: `insight-revenue-${Date.now()}`,
      providerId,
      type: isPositive ? 'performance_trend' : 'anomaly',
      title: isPositive ? 'Excellente performance !' : 'Revenus en baisse',
      description: isPositive
        ? `Vos revenus ont augmenté de ${Math.abs(change).toFixed(0)}% ce mois-ci. Bravo !`
        : `Vos revenus ont diminué de ${Math.abs(change).toFixed(0)}% ce mois-ci. Analysez vos devis refusés.`,
      data: {
        trend: isPositive ? 'up' : 'down',
        percentage: Math.abs(change),
        metric: 'Revenus',
        value: metrics.revenueThisMonth,
        previousValue: metrics.revenueLastMonth,
      },
      priority: isPositive ? 'low' : 'high',
      actionUrl: '/espace-artisan/statistiques',
      actionLabel: 'Voir les stats',
    }
  },
]

export async function generateInsights(providerId: string): Promise<Insight[]> {
  try {
    const supabase = await createClient()

    // Fetch provider metrics
    const [bookingsResult, revenueResult, viewsResult, , quotesResult, reviewsResult] =
      await Promise.all([
        // Bookings
        supabase
          .from('bookings')
          .select('created_at, status')
          .eq('artisan_id', providerId)
          .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),

        // Revenue (from bookings)
        supabase
          .from('bookings')
          .select('deposit_amount, created_at')
          .eq('artisan_id', providerId)
          .in('status', ['completed', 'confirmed'])
          .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()),

        // Profile views
        supabase
          .from('analytics_events')
          .select('created_at')
          .eq('provider_id', providerId)
          .eq('event_type', 'profile_view')
          .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),

        // Messages
        supabase
          .from('messages')
          .select('created_at, sender_id')
          .eq('sender_type', 'artisan'),

        // Quotes
        supabase
          .from('quotes')
          .select('status, created_at')
          .eq('provider_id', providerId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Reviews
        supabase
          .from('reviews')
          .select('rating')
          .eq('provider_id', providerId),
      ])

    // Calculate metrics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const bookings = bookingsResult.data || []
    const bookingsThisWeek = bookings.filter(
      (b) => new Date(b.created_at) >= oneWeekAgo
    ).length
    const bookingsLastWeek = bookings.filter(
      (b) => new Date(b.created_at) >= twoWeeksAgo && new Date(b.created_at) < oneWeekAgo
    ).length

    const revenue = revenueResult.data || []
    const revenueThisMonth = revenue
      .filter((r) => new Date(r.created_at) >= oneMonthAgo)
      .reduce((sum, r) => sum + (r.deposit_amount || 0) / 100, 0)
    const revenueLastMonth = revenue
      .filter(
        (r) => new Date(r.created_at) >= twoMonthsAgo && new Date(r.created_at) < oneMonthAgo
      )
      .reduce((sum, r) => sum + (r.deposit_amount || 0) / 100, 0)

    const views = viewsResult.data || []
    const viewsThisWeek = views.filter((v) => new Date(v.created_at) >= oneWeekAgo).length
    const viewsLastWeek = views.filter(
      (v) => new Date(v.created_at) >= twoWeeksAgo && new Date(v.created_at) < oneWeekAgo
    ).length
    const profileViewsChange =
      viewsLastWeek > 0 ? ((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100 : 0

    const quotes = quotesResult.data || []
    const acceptedQuotes = quotes.filter((q) => q.status === 'accepted').length
    const quoteConversionRate = quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0

    const reviews = reviewsResult.data || []
    const rating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

    const metrics: ProviderMetrics = {
      bookingsThisWeek,
      bookingsLastWeek,
      revenueThisMonth,
      revenueLastMonth,
      profileViews: viewsThisWeek,
      profileViewsChange,
      responseRate: 85, // Would need to calculate from messages
      avgResponseTime: 4, // Would need to calculate
      rating,
      reviewCount: reviews.length,
      quoteRequests: quotes.length,
      quoteConversionRate,
    }

    // Generate insights
    const insights: Insight[] = []

    for (const generator of insightGenerators) {
      const insight = generator(metrics, providerId)
      if (insight) {
        insights.push(insight)
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    // Store insights in database
    for (const insight of insights.slice(0, 5)) {
      await supabase.from('analytics_insights').upsert({
        provider_id: providerId,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        data: insight.data,
        priority: insight.priority,
        action_url: insight.actionUrl,
        action_label: insight.actionLabel,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    return insights.slice(0, 5)
  } catch (error) {
    logger.error('Error generating insights', error)
    return []
  }
}

export async function markInsightAsRead(insightId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('analytics_insights')
      .update({ is_read: true })
      .eq('id', insightId)
  } catch (error) {
    logger.error('Error marking insight as read', error)
  }
}

export async function dismissInsight(insightId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('analytics_insights')
      .update({ is_dismissed: true })
      .eq('id', insightId)
  } catch (error) {
    logger.error('Error dismissing insight', error)
  }
}

export default {
  generateInsights,
  markInsightAsRead,
  dismissInsight,
}
