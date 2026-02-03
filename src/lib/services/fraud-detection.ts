/**
 * Fraud Detection Service
 * ML-based fraud detection for reviews, payments, and user behavior
 */

import { createClient } from '@supabase/supabase-js'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type FraudType = 'fake_review' | 'payment_fraud' | 'account_abuse' | 'spam' | 'identity_fraud' | 'collusion'

export interface FraudSignal {
  type: string
  score: number
  details: string
}

export interface FraudAssessment {
  risk_level: RiskLevel
  risk_score: number // 0-100
  signals: FraudSignal[]
  recommended_action: 'allow' | 'review' | 'block' | 'flag'
  requires_manual_review: boolean
  timestamp: string
}

export interface ReviewFraudCheck {
  review_id?: string
  user_id: string
  artisan_id: string
  rating: number
  comment: string
  booking_id?: string
  ip_address?: string
  user_agent?: string
}

export interface PaymentFraudCheck {
  user_id: string
  amount: number
  payment_method: string
  ip_address?: string
  device_fingerprint?: string
  shipping_address?: string
  billing_address?: string
}

export interface UserBehaviorCheck {
  user_id: string
  action_type: string
  ip_address?: string
  user_agent?: string
  session_id?: string
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export class FraudDetectionService {
  private supabase = getSupabaseAdmin()

  // Fraud detection thresholds
  private readonly THRESHOLDS = {
    review: {
      minCommentLength: 10,
      maxReviewsPerDay: 5,
      maxReviewsPerArtisan: 3,
      suspiciousPatterns: [
        /(.)\1{5,}/, // Repeated characters
        /https?:\/\//i, // URLs
        /\b(scam|fake|fraud)\b/i, // Fraud keywords
        /[A-Z]{10,}/, // All caps words
      ],
    },
    payment: {
      maxDailyAmount: 50000,
      maxTransactionsPerDay: 10,
      highRiskCountries: ['NG', 'GH', 'KE'], // Example
    },
    behavior: {
      maxLoginAttempts: 5,
      maxProfileChangesPerDay: 10,
      suspiciousIpPatterns: [
        /^10\./, // Private IPs (for demo)
      ],
    },
  }

  /**
   * Check review for fraud
   */
  async checkReviewFraud(data: ReviewFraudCheck): Promise<FraudAssessment> {
    const signals: FraudSignal[] = []
    let riskScore = 0

    // 1. Check if user has booking with artisan (verified review)
    if (data.booking_id) {
      const { data: booking } = await this.supabase
        .from('bookings')
        .select('id, status')
        .eq('id', data.booking_id)
        .eq('artisan_id', data.artisan_id)
        .single()

      if (!booking) {
        signals.push({
          type: 'no_booking',
          score: 30,
          details: 'Review without matching booking',
        })
        riskScore += 30
      } else if (booking.status !== 'completed') {
        signals.push({
          type: 'incomplete_booking',
          score: 20,
          details: 'Review for non-completed booking',
        })
        riskScore += 20
      }
    } else {
      signals.push({
        type: 'unverified_review',
        score: 15,
        details: 'No booking ID provided',
      })
      riskScore += 15
    }

    // 2. Check review velocity (too many reviews in short time)
    const { count: recentReviews } = await this.supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', data.user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentReviews && recentReviews >= this.THRESHOLDS.review.maxReviewsPerDay) {
      signals.push({
        type: 'high_velocity',
        score: 25,
        details: `${recentReviews} reviews in last 24h`,
      })
      riskScore += 25
    }

    // 3. Check for multiple reviews on same artisan
    const { count: sameArtisanReviews } = await this.supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', data.user_id)
      .eq('artisan_id', data.artisan_id)

    if (sameArtisanReviews && sameArtisanReviews >= this.THRESHOLDS.review.maxReviewsPerArtisan) {
      signals.push({
        type: 'duplicate_reviews',
        score: 40,
        details: `Multiple reviews for same artisan`,
      })
      riskScore += 40
    }

    // 4. Analyze comment content
    const contentSignals = this.analyzeReviewContent(data.comment, data.rating)
    signals.push(...contentSignals)
    riskScore += contentSignals.reduce((sum, s) => sum + s.score, 0)

    // 5. Check for review bombing (many negative reviews from same IP)
    if (data.ip_address && data.rating <= 2) {
      const { count: sameIpNegativeReviews } = await this.supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', data.ip_address)
        .lte('rating', 2)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (sameIpNegativeReviews && sameIpNegativeReviews >= 3) {
        signals.push({
          type: 'review_bombing',
          score: 35,
          details: 'Multiple negative reviews from same IP',
        })
        riskScore += 35
      }
    }

    // 6. Check for collusion (self-reviews or employee reviews)
    const collusionScore = await this.checkForCollusion(data.user_id, data.artisan_id)
    if (collusionScore > 0) {
      signals.push({
        type: 'potential_collusion',
        score: collusionScore,
        details: 'Possible connection between reviewer and artisan',
      })
      riskScore += collusionScore
    }

    // Calculate final risk
    riskScore = Math.min(riskScore, 100)
    const assessment = this.calculateAssessment(riskScore, signals)

    // Log fraud check
    await this.logFraudCheck('review', data.user_id, assessment)

    return assessment
  }

  /**
   * Check payment for fraud
   */
  async checkPaymentFraud(data: PaymentFraudCheck): Promise<FraudAssessment> {
    const signals: FraudSignal[] = []
    let riskScore = 0

    // 1. Check transaction velocity
    const { count: recentTransactions } = await this.supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentTransactions && recentTransactions >= this.THRESHOLDS.payment.maxTransactionsPerDay) {
      signals.push({
        type: 'high_transaction_velocity',
        score: 30,
        details: `${recentTransactions} transactions in 24h`,
      })
      riskScore += 30
    }

    // 2. Check daily amount
    const { data: dailyTotal } = await this.supabase
      .from('payments')
      .select('amount')
      .eq('user_id', data.user_id)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const totalAmount = (dailyTotal || []).reduce((sum, p) => sum + p.amount, 0)
    if (totalAmount + data.amount > this.THRESHOLDS.payment.maxDailyAmount) {
      signals.push({
        type: 'high_daily_amount',
        score: 25,
        details: `Daily total exceeds ${this.THRESHOLDS.payment.maxDailyAmount}€`,
      })
      riskScore += 25
    }

    // 3. Check for mismatched addresses
    if (data.shipping_address && data.billing_address) {
      if (!this.addressesMatch(data.shipping_address, data.billing_address)) {
        signals.push({
          type: 'address_mismatch',
          score: 15,
          details: 'Shipping and billing addresses differ',
        })
        riskScore += 15
      }
    }

    // 4. Check device fingerprint history
    if (data.device_fingerprint) {
      const { count: deviceUsers } = await this.supabase
        .from('user_devices')
        .select('*', { count: 'exact', head: true })
        .eq('device_fingerprint', data.device_fingerprint)
        .neq('user_id', data.user_id)

      if (deviceUsers && deviceUsers > 0) {
        signals.push({
          type: 'shared_device',
          score: 20,
          details: 'Device used by multiple accounts',
        })
        riskScore += 20
      }
    }

    // 5. Check for first-time large transaction
    const { count: previousTransactions } = await this.supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.user_id)
      .eq('status', 'completed')

    if ((!previousTransactions || previousTransactions === 0) && data.amount > 1000) {
      signals.push({
        type: 'first_large_transaction',
        score: 20,
        details: 'Large first transaction',
      })
      riskScore += 20
    }

    riskScore = Math.min(riskScore, 100)
    const assessment = this.calculateAssessment(riskScore, signals)

    await this.logFraudCheck('payment', data.user_id, assessment)

    return assessment
  }

  /**
   * Check user behavior for anomalies
   */
  async checkUserBehavior(data: UserBehaviorCheck): Promise<FraudAssessment> {
    const signals: FraudSignal[] = []
    let riskScore = 0

    // 1. Check login attempts
    if (data.action_type === 'login') {
      const { count: failedLogins } = await this.supabase
        .from('auth_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user_id)
        .eq('action', 'login_failed')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

      if (failedLogins && failedLogins >= this.THRESHOLDS.behavior.maxLoginAttempts) {
        signals.push({
          type: 'brute_force_attempt',
          score: 40,
          details: `${failedLogins} failed logins in 1h`,
        })
        riskScore += 40
      }
    }

    // 2. Check for rapid profile changes
    if (data.action_type === 'profile_update') {
      const { count: profileChanges } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user_id)
        .eq('action', 'profile.update')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (profileChanges && profileChanges >= this.THRESHOLDS.behavior.maxProfileChangesPerDay) {
        signals.push({
          type: 'suspicious_profile_changes',
          score: 25,
          details: 'Excessive profile changes',
        })
        riskScore += 25
      }
    }

    // 3. Check for IP reputation
    if (data.ip_address) {
      const ipReputation = await this.checkIpReputation(data.ip_address)
      if (ipReputation.isHighRisk) {
        signals.push({
          type: 'high_risk_ip',
          score: 30,
          details: ipReputation.reason || 'IP flagged as high risk',
        })
        riskScore += 30
      }
    }

    // 4. Check session anomalies
    if (data.session_id && data.ip_address) {
      const { data: sessionData } = await this.supabase
        .from('sessions')
        .select('ip_address, user_agent')
        .eq('id', data.session_id)
        .single()

      if (sessionData && sessionData.ip_address !== data.ip_address) {
        signals.push({
          type: 'session_hijack_attempt',
          score: 50,
          details: 'IP address changed during session',
        })
        riskScore += 50
      }
    }

    riskScore = Math.min(riskScore, 100)
    const assessment = this.calculateAssessment(riskScore, signals)

    await this.logFraudCheck('behavior', data.user_id, assessment)

    return assessment
  }

  /**
   * Analyze review content for suspicious patterns
   */
  private analyzeReviewContent(comment: string, rating: number): FraudSignal[] {
    const signals: FraudSignal[] = []

    // Check comment length
    if (comment.length < this.THRESHOLDS.review.minCommentLength) {
      signals.push({
        type: 'short_comment',
        score: 10,
        details: 'Comment too short',
      })
    }

    // Check for suspicious patterns
    for (const pattern of this.THRESHOLDS.review.suspiciousPatterns) {
      if (pattern.test(comment)) {
        signals.push({
          type: 'suspicious_content',
          score: 15,
          details: `Suspicious pattern detected: ${pattern.source}`,
        })
      }
    }

    // Check for extreme rating without substance
    if ((rating === 1 || rating === 5) && comment.length < 50) {
      signals.push({
        type: 'extreme_rating_no_detail',
        score: 15,
        details: 'Extreme rating with minimal explanation',
      })
    }

    // Check for generic/template content
    const genericPhrases = [
      'great service', 'excellent work', 'highly recommend',
      'worst ever', 'terrible', 'never again',
    ]
    const lowerComment = comment.toLowerCase()
    const genericCount = genericPhrases.filter((p) => lowerComment.includes(p)).length

    if (genericCount >= 3) {
      signals.push({
        type: 'generic_content',
        score: 15,
        details: 'Content appears to be templated',
      })
    }

    return signals
  }

  /**
   * Check for collusion between reviewer and artisan
   */
  private async checkForCollusion(userId: string, artisanId: string): Promise<number> {
    let collusionScore = 0

    // Check if same IP has been used by artisan
    const { data: userSessions } = await this.supabase
      .from('sessions')
      .select('ip_address')
      .eq('user_id', userId)
      .limit(10)

    if (userSessions && userSessions.length > 0) {
      const userIps = userSessions.map((s) => s.ip_address)

      const { count: matchingArtisanSessions } = await this.supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', artisanId)
        .in('ip_address', userIps)

      if (matchingArtisanSessions && matchingArtisanSessions > 0) {
        collusionScore += 40
      }
    }

    // Check if they share phone numbers or emails
    const { data: userProfile } = await this.supabase
      .from('profiles')
      .select('phone, email')
      .eq('id', userId)
      .single()

    const { data: artisanProfile } = await this.supabase
      .from('profiles')
      .select('phone, email')
      .eq('id', artisanId)
      .single()

    if (userProfile && artisanProfile) {
      if (userProfile.phone && userProfile.phone === artisanProfile.phone) {
        collusionScore += 50
      }
      // Check email domain match (excluding common providers)
      const userDomain = userProfile.email?.split('@')[1]
      const artisanDomain = artisanProfile.email?.split('@')[1]
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']

      if (userDomain && artisanDomain && userDomain === artisanDomain && !commonDomains.includes(userDomain)) {
        collusionScore += 30
      }
    }

    return Math.min(collusionScore, 60)
  }

  /**
   * Check IP reputation
   */
  private async checkIpReputation(ip: string): Promise<{ isHighRisk: boolean; reason?: string }> {
    // Check local blacklist
    const { data: blacklisted } = await this.supabase
      .from('ip_blacklist')
      .select('reason')
      .eq('ip_address', ip)
      .single()

    if (blacklisted) {
      return { isHighRisk: true, reason: blacklisted.reason }
    }

    // Check for VPN/Proxy (would use external service in production)
    // For now, check common VPN IP patterns
    const vpnPatterns = [
      /^104\./, // Common VPN range
      /^185\./, // Common VPN range
    ]

    for (const pattern of vpnPatterns) {
      if (pattern.test(ip)) {
        return { isHighRisk: true, reason: 'Potential VPN/Proxy detected' }
      }
    }

    return { isHighRisk: false }
  }

  /**
   * Check if addresses match (simplified)
   */
  private addressesMatch(addr1: string, addr2: string): boolean {
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]/g, '')
    return normalize(addr1) === normalize(addr2)
  }

  /**
   * Calculate final fraud assessment
   */
  private calculateAssessment(riskScore: number, signals: FraudSignal[]): FraudAssessment {
    let riskLevel: RiskLevel = 'low'
    let recommendedAction: FraudAssessment['recommended_action'] = 'allow'
    let requiresManualReview = false

    if (riskScore >= 70) {
      riskLevel = 'critical'
      recommendedAction = 'block'
      requiresManualReview = true
    } else if (riskScore >= 50) {
      riskLevel = 'high'
      recommendedAction = 'flag'
      requiresManualReview = true
    } else if (riskScore >= 30) {
      riskLevel = 'medium'
      recommendedAction = 'review'
    }

    return {
      risk_level: riskLevel,
      risk_score: riskScore,
      signals,
      recommended_action: recommendedAction,
      requires_manual_review: requiresManualReview,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Log fraud check for analytics
   */
  private async logFraudCheck(
    checkType: string,
    userId: string,
    assessment: FraudAssessment
  ): Promise<void> {
    await this.supabase
      .from('fraud_checks')
      .insert({
        user_id: userId,
        check_type: checkType,
        risk_level: assessment.risk_level,
        risk_score: assessment.risk_score,
        signals: assessment.signals,
        recommended_action: assessment.recommended_action,
        created_at: new Date().toISOString(),
      })
  }

  /**
   * Get fraud statistics
   */
  async getFraudStats(period: 'day' | 'week' | 'month' = 'week'): Promise<{
    total_checks: number
    by_risk_level: Record<RiskLevel, number>
    by_type: Record<string, number>
    blocked_count: number
  }> {
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }

    const since = new Date(Date.now() - periodMs[period]).toISOString()

    const { data: checks } = await this.supabase
      .from('fraud_checks')
      .select('*')
      .gte('created_at', since)

    const stats = {
      total_checks: checks?.length || 0,
      by_risk_level: { low: 0, medium: 0, high: 0, critical: 0 } as Record<RiskLevel, number>,
      by_type: {} as Record<string, number>,
      blocked_count: 0,
    }

    checks?.forEach((check) => {
      stats.by_risk_level[check.risk_level as RiskLevel]++
      stats.by_type[check.check_type] = (stats.by_type[check.check_type] || 0) + 1
      if (check.recommended_action === 'block') {
        stats.blocked_count++
      }
    })

    return stats
  }
}

export const fraudDetectionService = new FraudDetectionService()
