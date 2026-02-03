/**
 * Trust Badge Service
 * Calculates and awards trust badges to artisans
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type BadgeType =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'top_rated'
  | 'quick_responder'
  | 'verified_expert'
  | 'eco_friendly'

export interface Badge {
  type: BadgeType
  name: string
  description: string
  awardedAt: string
  expiresAt?: string
  criteriaMet: Record<string, number | boolean>
}

export interface TrustMetrics {
  reviewCount: number
  ratingAverage: number
  responseRate: number // 0-100
  avgResponseTimeHours: number
  yearsOnPlatform: number
  completedBookings: number
  cancelRate: number
  isVerified: boolean
  hasInsurance: boolean
  hasDecennale: boolean
  isEcoFriendly: boolean
}

export interface BadgeRequirements {
  bronze: {
    minReviews: 10
    minRating: 3.5
    verified: true
  }
  silver: {
    minReviews: 25
    minRating: 4.0
    minResponseRate: 90
    minYears: 1
  }
  gold: {
    minReviews: 50
    minRating: 4.5
    minResponseRate: 95
    minYears: 3
  }
  platinum: {
    minReviews: 100
    minRating: 4.8
    minResponseRate: 98
    minYears: 5
  }
  top_rated: {
    minReviews: 20
    minRating: 4.9
    percentileRequired: 95
  }
  quick_responder: {
    maxResponseTimeHours: 1
    minResponseRate: 95
  }
  verified_expert: {
    hasInsurance: true
    hasDecennale: true
    verified: true
    minYears: 2
  }
  eco_friendly: {
    isEcoFriendly: true
    minReviews: 5
  }
}

const BADGE_CONFIG: Record<BadgeType, {
  name: string
  description: string
  priority: number
}> = {
  platinum: {
    name: 'Platine',
    description: 'Excellence reconnue: 100+ avis, 4.8+ note, 98%+ réponse, 5+ ans',
    priority: 1,
  },
  gold: {
    name: 'Or',
    description: 'Artisan d\'exception: 50+ avis, 4.5+ note, 95%+ réponse, 3+ ans',
    priority: 2,
  },
  silver: {
    name: 'Argent',
    description: 'Artisan confirmé: 25+ avis, 4.0+ note, 90%+ réponse, 1+ an',
    priority: 3,
  },
  bronze: {
    name: 'Bronze',
    description: 'Artisan vérifié: 10+ avis, 3.5+ note',
    priority: 4,
  },
  top_rated: {
    name: 'Top Noté',
    description: 'Parmi les 5% les mieux notés de sa catégorie',
    priority: 5,
  },
  quick_responder: {
    name: 'Réponse Rapide',
    description: 'Répond en moins d\'1 heure en moyenne',
    priority: 6,
  },
  verified_expert: {
    name: 'Expert Vérifié',
    description: 'Qualifications et assurances vérifiées',
    priority: 7,
  },
  eco_friendly: {
    name: 'Éco-Responsable',
    description: 'Pratiques et matériaux respectueux de l\'environnement',
    priority: 8,
  },
}

function calculateTierBadge(metrics: TrustMetrics): BadgeType | null {
  // Check from highest to lowest
  if (
    metrics.reviewCount >= 100 &&
    metrics.ratingAverage >= 4.8 &&
    metrics.responseRate >= 98 &&
    metrics.yearsOnPlatform >= 5
  ) {
    return 'platinum'
  }

  if (
    metrics.reviewCount >= 50 &&
    metrics.ratingAverage >= 4.5 &&
    metrics.responseRate >= 95 &&
    metrics.yearsOnPlatform >= 3
  ) {
    return 'gold'
  }

  if (
    metrics.reviewCount >= 25 &&
    metrics.ratingAverage >= 4.0 &&
    metrics.responseRate >= 90 &&
    metrics.yearsOnPlatform >= 1
  ) {
    return 'silver'
  }

  if (
    metrics.reviewCount >= 10 &&
    metrics.ratingAverage >= 3.5 &&
    metrics.isVerified
  ) {
    return 'bronze'
  }

  return null
}

function checkQuickResponder(metrics: TrustMetrics): boolean {
  return metrics.avgResponseTimeHours <= 1 && metrics.responseRate >= 95
}

function checkVerifiedExpert(metrics: TrustMetrics): boolean {
  return (
    metrics.hasInsurance &&
    metrics.hasDecennale &&
    metrics.isVerified &&
    metrics.yearsOnPlatform >= 2
  )
}

function checkEcoFriendly(metrics: TrustMetrics): boolean {
  return metrics.isEcoFriendly && metrics.reviewCount >= 5
}

export function calculateBadges(metrics: TrustMetrics): Badge[] {
  const badges: Badge[] = []
  const now = new Date().toISOString()

  // Calculate tier badge
  const tierBadge = calculateTierBadge(metrics)
  if (tierBadge) {
    badges.push({
      type: tierBadge,
      name: BADGE_CONFIG[tierBadge].name,
      description: BADGE_CONFIG[tierBadge].description,
      awardedAt: now,
      criteriaMet: {
        reviewCount: metrics.reviewCount,
        ratingAverage: metrics.ratingAverage,
        responseRate: metrics.responseRate,
        yearsOnPlatform: metrics.yearsOnPlatform,
      },
    })
  }

  // Check special badges
  if (checkQuickResponder(metrics)) {
    badges.push({
      type: 'quick_responder',
      name: BADGE_CONFIG.quick_responder.name,
      description: BADGE_CONFIG.quick_responder.description,
      awardedAt: now,
      criteriaMet: {
        avgResponseTimeHours: metrics.avgResponseTimeHours,
        responseRate: metrics.responseRate,
      },
    })
  }

  if (checkVerifiedExpert(metrics)) {
    badges.push({
      type: 'verified_expert',
      name: BADGE_CONFIG.verified_expert.name,
      description: BADGE_CONFIG.verified_expert.description,
      awardedAt: now,
      criteriaMet: {
        hasInsurance: metrics.hasInsurance,
        hasDecennale: metrics.hasDecennale,
        isVerified: metrics.isVerified,
        yearsOnPlatform: metrics.yearsOnPlatform,
      },
    })
  }

  if (checkEcoFriendly(metrics)) {
    badges.push({
      type: 'eco_friendly',
      name: BADGE_CONFIG.eco_friendly.name,
      description: BADGE_CONFIG.eco_friendly.description,
      awardedAt: now,
      criteriaMet: {
        isEcoFriendly: metrics.isEcoFriendly,
        reviewCount: metrics.reviewCount,
      },
    })
  }

  return badges
}

export function getPrimaryBadge(badges: Badge[]): BadgeType | 'none' {
  if (badges.length === 0) return 'none'

  // Return highest priority tier badge
  const tierBadges: BadgeType[] = ['platinum', 'gold', 'silver', 'bronze']
  for (const tier of tierBadges) {
    if (badges.some(b => b.type === tier)) {
      return tier
    }
  }

  // Return first special badge
  return badges[0].type
}

export function calculateTrustScore(metrics: TrustMetrics): number {
  // Weighted scoring (0-100)
  const weights = {
    rating: 30,
    reviews: 20,
    responseRate: 15,
    responseTime: 10,
    experience: 10,
    verification: 10,
    bookingSuccess: 5,
  }

  let score = 0

  // Rating score (0-30)
  score += Math.min(weights.rating, (metrics.ratingAverage / 5) * weights.rating)

  // Reviews score (0-20) - logarithmic scale
  const reviewScore = Math.min(1, Math.log10(metrics.reviewCount + 1) / 2)
  score += reviewScore * weights.reviews

  // Response rate (0-15)
  score += (metrics.responseRate / 100) * weights.responseRate

  // Response time (0-10) - inverse relationship
  const timeScore = Math.max(0, 1 - metrics.avgResponseTimeHours / 24)
  score += timeScore * weights.responseTime

  // Experience (0-10) - capped at 5 years
  const expScore = Math.min(1, metrics.yearsOnPlatform / 5)
  score += expScore * weights.experience

  // Verification (0-10)
  if (metrics.isVerified) score += weights.verification * 0.4
  if (metrics.hasInsurance) score += weights.verification * 0.3
  if (metrics.hasDecennale) score += weights.verification * 0.3

  // Booking success (0-5)
  const successRate = Math.max(0, 100 - metrics.cancelRate) / 100
  score += successRate * weights.bookingSuccess

  return Math.round(Math.min(100, score))
}

// Database operations
export async function updateProviderBadges(providerId: string): Promise<{
  badges: Badge[]
  trustScore: number
  primaryBadge: BadgeType | 'none'
}> {
  try {
    const supabase = await createClient()

    // Fetch provider metrics
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(`
        id,
        rating_average,
        review_count,
        response_rate,
        avg_response_time_hours,
        is_verified,
        created_at
      `)
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      throw new Error('Provider not found')
    }

    // Calculate years on platform
    const createdAt = new Date(provider.created_at)
    const yearsOnPlatform = (Date.now() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

    // Build metrics object
    const metrics: TrustMetrics = {
      reviewCount: provider.review_count || 0,
      ratingAverage: provider.rating_average || 0,
      responseRate: provider.response_rate || 0,
      avgResponseTimeHours: provider.avg_response_time_hours || 24,
      yearsOnPlatform: Math.floor(yearsOnPlatform),
      completedBookings: 0, // Would need to fetch from bookings
      cancelRate: 0, // Would need to calculate
      isVerified: provider.is_verified || false,
      hasInsurance: false, // Would need KYC data
      hasDecennale: false, // Would need KYC data
      isEcoFriendly: false, // Would need provider flag
    }

    // Calculate badges and score
    const badges = calculateBadges(metrics)
    const trustScore = calculateTrustScore(metrics)
    const primaryBadge = getPrimaryBadge(badges)

    // Update provider
    await supabase
      .from('providers')
      .update({
        trust_badge: primaryBadge,
        trust_score: trustScore,
      })
      .eq('id', providerId)

    // Update trust_badges table
    for (const badge of badges) {
      await supabase
        .from('trust_badges')
        .upsert({
          artisan_id: providerId,
          badge_type: badge.type,
          badge_name: badge.name,
          criteria_met: badge.criteriaMet,
          awarded_at: badge.awardedAt,
          is_active: true,
        }, {
          onConflict: 'artisan_id,badge_type',
        })
    }

    return { badges, trustScore, primaryBadge }
  } catch (error) {
    logger.error('Error updating provider badges', error)
    return {
      badges: [],
      trustScore: 0,
      primaryBadge: 'none',
    }
  }
}

// Check if artisan qualifies for top_rated badge (requires percentile calculation)
export async function checkTopRatedQualification(
  providerId: string,
  serviceCategory: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get all providers in same category with enough reviews
    const { data: providers } = await supabase
      .from('providers')
      .select('id, rating_average, review_count')
      .eq('specialty', serviceCategory)
      .gte('review_count', 20)
      .order('rating_average', { ascending: false })

    if (!providers || providers.length < 20) {
      return false // Not enough providers to calculate percentile
    }

    // Find provider's position
    const position = providers.findIndex(p => p.id === providerId)
    if (position === -1) return false

    // Check if in top 5%
    const percentile = ((providers.length - position) / providers.length) * 100
    return percentile >= 95
  } catch (error) {
    logger.error('Error checking top rated qualification', error)
    return false
  }
}

export default {
  calculateBadges,
  calculateTrustScore,
  getPrimaryBadge,
  updateProviderBadges,
  checkTopRatedQualification,
  BADGE_CONFIG,
}
