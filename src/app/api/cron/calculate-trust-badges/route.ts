/**
 * Cron Job: Calculate Trust Badges
 * Runs daily to recalculate trust badges for all providers
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

// Calculate trust badge based on criteria
function calculateTrustBadge(
  reviewCount: number,
  ratingAverage: number,
  responseRate: number,
  yearsOnPlatform: number
): string {
  // Platinum: 100+ reviews, 4.8+ rating, 98%+ response, 5+ years
  if (reviewCount >= 100 && ratingAverage >= 4.8 && responseRate >= 98 && yearsOnPlatform >= 5) {
    return 'platinum'
  }
  // Gold: 50+ reviews, 4.5+ rating, 95%+ response, 3+ years
  if (reviewCount >= 50 && ratingAverage >= 4.5 && responseRate >= 95 && yearsOnPlatform >= 3) {
    return 'gold'
  }
  // Silver: 25+ reviews, 4.0+ rating, 90%+ response, 1+ year
  if (reviewCount >= 25 && ratingAverage >= 4.0 && responseRate >= 90 && yearsOnPlatform >= 1) {
    return 'silver'
  }
  // Bronze: 10+ reviews, 3.5+ rating
  if (reviewCount >= 10 && ratingAverage >= 3.5) {
    return 'bronze'
  }
  return 'none'
}

// Calculate trust score (0-100)
function calculateTrustScore(
  reviewCount: number,
  ratingAverage: number,
  responseRate: number
): number {
  const ratingScore = (ratingAverage / 5) * 40 // Max 40 points
  const responseScore = (responseRate / 100) * 30 // Max 30 points
  const reviewScore = Math.min(reviewCount / 100, 1) * 30 // Max 30 points

  return Math.round(ratingScore + responseScore + reviewScore)
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all providers with their review stats
    const { data: providers, error: providersError } = await supabaseAdmin
      .from('providers')
      .select('id, created_at, review_count, rating_average, response_rate')

    if (providersError) throw providersError

    let updated = 0
    let errors = 0

    for (const provider of providers || []) {
      try {
        // Calculate years on platform
        const createdAt = new Date(provider.created_at)
        const yearsOnPlatform = Math.floor(
          (Date.now() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        )

        // Calculate badge and score
        const trustBadge = calculateTrustBadge(
          provider.review_count || 0,
          provider.rating_average || 0,
          provider.response_rate || 0,
          yearsOnPlatform
        )

        const trustScore = calculateTrustScore(
          provider.review_count || 0,
          provider.rating_average || 0,
          provider.response_rate || 0
        )

        // Update provider
        const { error: updateError } = await supabaseAdmin
          .from('providers')
          .update({
            trust_badge: trustBadge,
            trust_score: trustScore,
            years_on_platform: yearsOnPlatform
          })
          .eq('id', provider.id)

        if (updateError) {
          errors++
          console.error(`Error updating provider ${provider.id}:`, updateError)
        } else {
          updated++
        }

        // Create/update trust badge record
        if (trustBadge !== 'none') {
          await supabaseAdmin
            .from('trust_badges')
            .upsert({
              artisan_id: provider.id,
              badge_type: trustBadge,
              badge_name: getBadgeName(trustBadge),
              criteria_met: {
                review_count: provider.review_count,
                rating_average: provider.rating_average,
                response_rate: provider.response_rate,
                years_on_platform: yearsOnPlatform
              },
              awarded_at: new Date().toISOString(),
              is_active: true
            }, {
              onConflict: 'artisan_id,badge_type'
            })
        }
      } catch (err) {
        errors++
        console.error(`Error processing provider ${provider.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Trust badges calculated`,
      stats: {
        total: providers?.length || 0,
        updated,
        errors
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

function getBadgeName(badge: string): string {
  const names: Record<string, string> = {
    platinum: 'Artisan Platine',
    gold: 'Artisan Or',
    silver: 'Artisan Argent',
    bronze: 'Artisan Bronze'
  }
  return names[badge] || badge
}
