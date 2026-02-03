/**
 * Cron Job: Generate Insights
 * Runs daily to generate AI-powered insights for all providers
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) return false
  return authHeader === `Bearer ${cronSecret}`
}

interface Insight {
  provider_id: string
  insight_type: string
  title: string
  description: string
  data: Record<string, unknown>
  priority: string
  action_url?: string
  action_label?: string
  valid_until: string
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active providers
    const { data: providers, error: providersError } = await supabaseAdmin
      .from('providers')
      .select('id, name, rating_average, review_count, response_rate, trust_score')
      .eq('is_active', true)

    if (providersError) throw providersError

    let insightsGenerated = 0
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    for (const provider of providers || []) {
      const insights: Insight[] = []

      // Get provider stats for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

      // Fetch bookings data
      const [currentBookings, previousBookings, recentViews] = await Promise.all([
        supabaseAdmin
          .from('bookings')
          .select('id, created_at, status')
          .eq('artisan_id', provider.id)
          .gte('created_at', thirtyDaysAgo),
        supabaseAdmin
          .from('bookings')
          .select('id')
          .eq('artisan_id', provider.id)
          .gte('created_at', sixtyDaysAgo)
          .lt('created_at', thirtyDaysAgo),
        supabaseAdmin
          .from('analytics_events')
          .select('id')
          .eq('provider_id', provider.id)
          .eq('event_type', 'profile_view')
          .gte('created_at', thirtyDaysAgo)
      ])

      const currentBookingsCount = currentBookings.data?.length || 0
      const previousBookingsCount = previousBookings.data?.length || 0
      const viewsCount = recentViews.data?.length || 0

      // Insight 1: Booking trend
      if (previousBookingsCount > 0) {
        const change = ((currentBookingsCount - previousBookingsCount) / previousBookingsCount) * 100

        if (Math.abs(change) >= 20) {
          const isPositive = change > 0
          insights.push({
            provider_id: provider.id,
            insight_type: isPositive ? 'performance_trend' : 'warning',
            title: isPositive ? 'Réservations en hausse !' : 'Baisse des réservations',
            description: isPositive
              ? `Vos réservations ont augmenté de ${Math.abs(change).toFixed(0)}% ce mois-ci. Excellent travail !`
              : `Vos réservations ont diminué de ${Math.abs(change).toFixed(0)}%. Pensez à mettre à jour votre profil.`,
            data: {
              trend: isPositive ? 'up' : 'down',
              percentage: Math.abs(change),
              current: currentBookingsCount,
              previous: previousBookingsCount
            },
            priority: Math.abs(change) > 50 ? 'high' : 'medium',
            action_url: '/espace-artisan/calendrier',
            action_label: 'Voir le calendrier',
            valid_until: validUntil
          })
        }
      }

      // Insight 2: Low response rate
      if ((provider.response_rate || 0) < 80) {
        insights.push({
          provider_id: provider.id,
          insight_type: 'recommendation',
          title: 'Améliorez votre taux de réponse',
          description: `Votre taux de réponse est de ${(provider.response_rate || 0).toFixed(0)}%. Les artisans avec +90% reçoivent 3x plus de demandes.`,
          data: {
            current_rate: provider.response_rate || 0,
            target_rate: 90
          },
          priority: (provider.response_rate || 0) < 50 ? 'critical' : 'high',
          action_url: '/espace-artisan/messages',
          action_label: 'Voir les messages',
          valid_until: validUntil
        })
      }

      // Insight 3: Few reviews
      if ((provider.review_count || 0) < 10) {
        insights.push({
          provider_id: provider.id,
          insight_type: 'opportunity',
          title: 'Collectez plus d\'avis',
          description: `Vous avez ${provider.review_count || 0} avis. Les artisans avec 10+ avis reçoivent 50% plus de demandes.`,
          data: {
            current_count: provider.review_count || 0,
            target_count: 10
          },
          priority: 'medium',
          action_url: '/espace-artisan/avis',
          action_label: 'Demander des avis',
          valid_until: validUntil
        })
      }

      // Insight 4: Good performance
      if ((provider.rating_average || 0) >= 4.5 && (provider.review_count || 0) >= 20) {
        insights.push({
          provider_id: provider.id,
          insight_type: 'performance_trend',
          title: 'Excellente réputation !',
          description: `Avec ${(provider.rating_average || 0).toFixed(1)}/5 sur ${provider.review_count} avis, vous êtes parmi les meilleurs artisans.`,
          data: {
            rating: provider.rating_average,
            review_count: provider.review_count
          },
          priority: 'low',
          valid_until: validUntil
        })
      }

      // Insight 5: Low visibility
      if (viewsCount < 10 && currentBookingsCount < 3) {
        insights.push({
          provider_id: provider.id,
          insight_type: 'opportunity',
          title: 'Boostez votre visibilité',
          description: 'Votre profil a peu de vues. Ajoutez des photos récentes et complétez votre description.',
          data: {
            views: viewsCount,
            bookings: currentBookingsCount
          },
          priority: 'high',
          action_url: '/espace-artisan/profil',
          action_label: 'Modifier le profil',
          valid_until: validUntil
        })
      }

      // Delete old insights for this provider
      await supabaseAdmin
        .from('analytics_insights')
        .delete()
        .eq('provider_id', provider.id)
        .lt('valid_until', new Date().toISOString())

      // Insert new insights
      if (insights.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('analytics_insights')
          .insert(insights)

        if (!insertError) {
          insightsGenerated += insights.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Insights generated',
      stats: {
        providers: providers?.length || 0,
        insights_generated: insightsGenerated
      }
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
