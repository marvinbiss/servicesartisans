/**
 * Review Authenticity Scoring Service
 * Detects fake or suspicious reviews
 */

import { logger } from '@/lib/logger'

export interface AuthenticityResult {
  score: number // 0-100
  isVerifiedPurchase: boolean
  flags: {
    suspected_fake: boolean
    unusual_pattern: boolean
    ip_match: boolean
    review_velocity: boolean
    generic_content: boolean
    extreme_rating: boolean
  }
  riskFactors: string[]
  confidence: number
}

interface ReviewData {
  content: string
  rating: number
  authorId?: string
  bookingId?: string
  bookingCompletionDate?: string
  createdAt: string
  ipAddress?: string
}

interface ProviderReviewHistory {
  totalReviews: number
  recentReviews: { createdAt: string; authorId?: string; ipAddress?: string; rating: number }[]
  averageRating: number
}

// Generic phrases often found in fake reviews
const GENERIC_PHRASES = [
  'je recommande vivement',
  'excellent service',
  'travail impeccable',
  'très professionnel',
  'parfait du début à la fin',
  'rien à redire',
  'je le recommande à 100%',
  'n\'hésitez pas',
  'vous ne serez pas déçu',
  'foncez les yeux fermés',
]

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /(.)\1{4,}/i, // Repeated characters
  /[A-Z]{10,}/i, // Long uppercase sequences
  /\d{10,}/i, // Long number sequences
  /https?:\/\/[^\s]+/gi, // URLs in reviews
]

// Minimum viable review length
const MIN_REVIEW_LENGTH = 20
const MAX_REVIEW_LENGTH = 5000

function analyzeContentQuality(content: string): {
  score: number
  flags: string[]
} {
  const flags: string[] = []
  let score = 100

  // Check length
  if (content.length < MIN_REVIEW_LENGTH) {
    score -= 30
    flags.push('Avis très court')
  }

  if (content.length > MAX_REVIEW_LENGTH) {
    score -= 10
    flags.push('Avis anormalement long')
  }

  // Check for generic phrases
  const lowerContent = content.toLowerCase()
  let genericCount = 0
  GENERIC_PHRASES.forEach(phrase => {
    if (lowerContent.includes(phrase)) {
      genericCount++
    }
  })

  if (genericCount >= 3) {
    score -= 25
    flags.push('Contenu générique')
  } else if (genericCount >= 2) {
    score -= 15
  }

  // Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      score -= 15
      flags.push('Pattern suspect détecté')
    }
  })

  // Check for all caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.5) {
    score -= 10
    flags.push('Trop de majuscules')
  }

  // Check for excessive punctuation
  const punctuationCount = (content.match(/[!?]{2,}/g) || []).length
  if (punctuationCount > 3) {
    score -= 10
    flags.push('Ponctuation excessive')
  }

  // Check for lack of specific details
  const hasSpecifics = /\d+/.test(content) || // Contains numbers
    content.length > 100 || // Decent length
    lowerContent.includes('car') || // Explains reasoning
    lowerContent.includes('parce que') ||
    lowerContent.includes('notamment')

  if (!hasSpecifics) {
    score -= 15
    flags.push('Manque de détails spécifiques')
  }

  return { score: Math.max(0, score), flags }
}

function analyzeRating(rating: number, providerHistory?: ProviderReviewHistory): {
  score: number
  flags: string[]
} {
  const flags: string[] = []
  let score = 100

  // Extreme ratings are slightly suspicious
  if (rating === 5) {
    score -= 5 // Very minor penalty, 5-star reviews are common
  } else if (rating === 1) {
    score -= 10 // 1-star reviews are more likely to be revenge or fake
    flags.push('Note extrême')
  }

  // Check against provider average
  if (providerHistory && providerHistory.totalReviews >= 10) {
    const deviation = Math.abs(rating - providerHistory.averageRating)
    if (deviation >= 3) {
      score -= 15
      flags.push('Note très différente de la moyenne')
    }
  }

  return { score: Math.max(0, score), flags }
}

function analyzeVelocity(
  createdAt: string,
  providerHistory?: ProviderReviewHistory
): {
  score: number
  flags: string[]
} {
  const flags: string[] = []
  let score = 100

  if (!providerHistory || providerHistory.recentReviews.length < 2) {
    return { score, flags }
  }

  const reviewDate = new Date(createdAt)
  const last24h = new Date(reviewDate.getTime() - 24 * 60 * 60 * 1000)

  // Count reviews in last 24 hours
  const recentCount = providerHistory.recentReviews.filter(
    r => new Date(r.createdAt) >= last24h
  ).length

  if (recentCount >= 5) {
    score -= 30
    flags.push('Beaucoup d\'avis en peu de temps')
  } else if (recentCount >= 3) {
    score -= 15
    flags.push('Plusieurs avis récents')
  }

  return { score: Math.max(0, score), flags }
}

function analyzeUserPattern(
  authorId: string | undefined,
  ipAddress: string | undefined,
  providerHistory?: ProviderReviewHistory
): {
  score: number
  flags: string[]
} {
  const flags: string[] = []
  let score = 100

  if (!providerHistory || providerHistory.recentReviews.length < 2) {
    return { score, flags }
  }

  // Check for duplicate author
  if (authorId) {
    const sameAuthor = providerHistory.recentReviews.filter(
      r => r.authorId === authorId
    ).length

    if (sameAuthor > 1) {
      score -= 40
      flags.push('Même auteur a déjà laissé un avis')
    }
  }

  // Check for same IP (very suspicious)
  if (ipAddress) {
    const sameIP = providerHistory.recentReviews.filter(
      r => r.ipAddress === ipAddress
    ).length

    if (sameIP > 1) {
      score -= 50
      flags.push('Même adresse IP')
    }
  }

  return { score: Math.max(0, score), flags }
}

function analyzeVerification(
  bookingId?: string,
  bookingCompletionDate?: string
): {
  score: number
  isVerified: boolean
  flags: string[]
} {
  const flags: string[] = []
  let score = 50 // Start neutral without verification

  if (bookingId && bookingCompletionDate) {
    score = 95 // Very high score for verified purchase
    return { score, isVerified: true, flags: ['Achat vérifié'] }
  }

  if (bookingId) {
    score = 80
    return { score, isVerified: false, flags: ['Réservation associée'] }
  }

  flags.push('Pas de preuve d\'achat')
  return { score, isVerified: false, flags }
}

export async function calculateAuthenticity(
  review: ReviewData,
  providerHistory?: ProviderReviewHistory
): Promise<AuthenticityResult> {
  try {
    const contentAnalysis = analyzeContentQuality(review.content)
    const ratingAnalysis = analyzeRating(review.rating, providerHistory)
    const velocityAnalysis = analyzeVelocity(review.createdAt, providerHistory)
    const patternAnalysis = analyzeUserPattern(
      review.authorId,
      review.ipAddress,
      providerHistory
    )
    const verificationAnalysis = analyzeVerification(
      review.bookingId,
      review.bookingCompletionDate
    )

    // Collect all risk factors
    const riskFactors: string[] = [
      ...contentAnalysis.flags,
      ...ratingAnalysis.flags,
      ...velocityAnalysis.flags,
      ...patternAnalysis.flags,
      ...verificationAnalysis.flags.filter(f => f !== 'Achat vérifié' && f !== 'Réservation associée'),
    ]

    // Calculate weighted score
    const weights = {
      content: 0.25,
      rating: 0.1,
      velocity: 0.15,
      pattern: 0.2,
      verification: 0.3,
    }

    const weightedScore =
      contentAnalysis.score * weights.content +
      ratingAnalysis.score * weights.rating +
      velocityAnalysis.score * weights.velocity +
      patternAnalysis.score * weights.pattern +
      verificationAnalysis.score * weights.verification

    const finalScore = Math.round(Math.max(0, Math.min(100, weightedScore)))

    // Determine flags
    const flags = {
      suspected_fake: contentAnalysis.score < 50 || patternAnalysis.score < 50,
      unusual_pattern: velocityAnalysis.score < 70 || patternAnalysis.score < 70,
      ip_match: patternAnalysis.flags.includes('Même adresse IP'),
      review_velocity: velocityAnalysis.score < 70,
      generic_content: contentAnalysis.flags.includes('Contenu générique'),
      extreme_rating: ratingAnalysis.flags.includes('Note extrême'),
    }

    // Calculate confidence based on available data
    let confidence = 0.5
    if (providerHistory && providerHistory.totalReviews >= 10) confidence += 0.2
    if (review.bookingId) confidence += 0.2
    if (review.ipAddress) confidence += 0.1

    return {
      score: finalScore,
      isVerifiedPurchase: verificationAnalysis.isVerified,
      flags,
      riskFactors,
      confidence: Math.min(1, confidence),
    }
  } catch (error) {
    logger.error('Authenticity calculation error', error)
    return {
      score: 50,
      isVerifiedPurchase: false,
      flags: {
        suspected_fake: false,
        unusual_pattern: false,
        ip_match: false,
        review_velocity: false,
        generic_content: false,
        extreme_rating: false,
      },
      riskFactors: ['Erreur d\'analyse'],
      confidence: 0,
    }
  }
}

// Batch analysis
export async function calculateAuthenticityBatch(
  reviews: ReviewData[],
  providerHistory?: ProviderReviewHistory
): Promise<Map<string, AuthenticityResult>> {
  const results = new Map<string, AuthenticityResult>()

  for (const review of reviews) {
    const result = await calculateAuthenticity(review, providerHistory)
    results.set(review.content.substring(0, 50), result)
  }

  return results
}

export default {
  calculateAuthenticity,
  calculateAuthenticityBatch,
}
