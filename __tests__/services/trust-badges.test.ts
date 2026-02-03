/**
 * Tests for Trust Badge Calculation
 */

import { describe, it, expect } from 'vitest'

// Trust badge calculation logic (mirrored from cron job)
function calculateTrustBadge(
  reviewCount: number,
  ratingAverage: number,
  responseRate: number,
  yearsOnPlatform: number
): string {
  if (reviewCount >= 100 && ratingAverage >= 4.8 && responseRate >= 98 && yearsOnPlatform >= 5) {
    return 'platinum'
  }
  if (reviewCount >= 50 && ratingAverage >= 4.5 && responseRate >= 95 && yearsOnPlatform >= 3) {
    return 'gold'
  }
  if (reviewCount >= 25 && ratingAverage >= 4.0 && responseRate >= 90 && yearsOnPlatform >= 1) {
    return 'silver'
  }
  if (reviewCount >= 10 && ratingAverage >= 3.5) {
    return 'bronze'
  }
  return 'none'
}

function calculateTrustScore(
  reviewCount: number,
  ratingAverage: number,
  responseRate: number
): number {
  const ratingScore = (ratingAverage / 5) * 40
  const responseScore = (responseRate / 100) * 30
  const reviewScore = Math.min(reviewCount / 100, 1) * 30
  return Math.round(ratingScore + responseScore + reviewScore)
}

describe('Trust Badge Calculation', () => {
  describe('calculateTrustBadge', () => {
    it('should return platinum for top performers', () => {
      expect(calculateTrustBadge(100, 4.8, 98, 5)).toBe('platinum')
      expect(calculateTrustBadge(150, 4.9, 99, 7)).toBe('platinum')
    })

    it('should return gold for excellent performers', () => {
      expect(calculateTrustBadge(50, 4.5, 95, 3)).toBe('gold')
      expect(calculateTrustBadge(75, 4.6, 96, 4)).toBe('gold')
    })

    it('should return silver for good performers', () => {
      expect(calculateTrustBadge(25, 4.0, 90, 1)).toBe('silver')
      expect(calculateTrustBadge(40, 4.2, 92, 2)).toBe('silver')
    })

    it('should return bronze for qualified performers', () => {
      expect(calculateTrustBadge(10, 3.5, 50, 0)).toBe('bronze')
      expect(calculateTrustBadge(15, 3.8, 60, 0)).toBe('bronze')
    })

    it('should return none for new or low performers', () => {
      expect(calculateTrustBadge(5, 4.0, 80, 0)).toBe('none')
      expect(calculateTrustBadge(10, 3.0, 90, 1)).toBe('none')
      expect(calculateTrustBadge(0, 0, 0, 0)).toBe('none')
    })

    it('should prioritize higher badges', () => {
      // Even if all criteria for gold are met, platinum should be returned if platinum criteria are also met
      expect(calculateTrustBadge(100, 4.9, 99, 6)).toBe('platinum')
    })
  })

  describe('calculateTrustScore', () => {
    it('should return 100 for perfect scores', () => {
      expect(calculateTrustScore(100, 5, 100)).toBe(100)
    })

    it('should return 0 for zero values', () => {
      expect(calculateTrustScore(0, 0, 0)).toBe(0)
    })

    it('should calculate correct scores for average values', () => {
      // 50 reviews, 4.0 rating, 80% response
      // Rating: (4/5)*40 = 32
      // Response: (80/100)*30 = 24
      // Reviews: (50/100)*30 = 15
      // Total: 71
      expect(calculateTrustScore(50, 4.0, 80)).toBe(71)
    })

    it('should cap review score at 30 points', () => {
      // 200 reviews should give same review score as 100
      const score100 = calculateTrustScore(100, 4.0, 80)
      const score200 = calculateTrustScore(200, 4.0, 80)
      expect(score100).toBe(score200)
    })
  })
})
