/**
 * Tests for Analytics Services
 */

import { describe, it, expect } from 'vitest'

// Anomaly detection logic (mirrored from service)
function detectAnomaly(
  value: number,
  mean: number,
  stdDev: number,
  thresholds: { low: number; medium: number; high: number; critical: number }
): { isAnomaly: boolean; severity: string | null; zScore: number } {
  if (stdDev === 0) {
    return { isAnomaly: false, severity: null, zScore: 0 }
  }

  const zScore = Math.abs((value - mean) / stdDev)

  if (zScore >= thresholds.critical) {
    return { isAnomaly: true, severity: 'critical', zScore }
  }
  if (zScore >= thresholds.high) {
    return { isAnomaly: true, severity: 'high', zScore }
  }
  if (zScore >= thresholds.medium) {
    return { isAnomaly: true, severity: 'medium', zScore }
  }
  if (zScore >= thresholds.low) {
    return { isAnomaly: true, severity: 'low', zScore }
  }

  return { isAnomaly: false, severity: null, zScore }
}

// Linear regression for predictions
function linearRegression(points: { x: number; y: number }[]): {
  slope: number
  intercept: number
  r2: number
} {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }

  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared
  const yMean = sumY / n
  const ssRes = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) }
}

describe('Analytics Services', () => {
  describe('Anomaly Detection', () => {
    const defaultThresholds = { low: 1.5, medium: 2.0, high: 2.5, critical: 3.0 }

    it('should not detect anomaly for normal values', () => {
      const result = detectAnomaly(100, 100, 10, defaultThresholds)
      expect(result.isAnomaly).toBe(false)
      expect(result.severity).toBeNull()
    })

    it('should detect low severity anomaly', () => {
      // z-score = |100 - 85| / 10 = 1.5
      const result = detectAnomaly(100, 85, 10, defaultThresholds)
      expect(result.isAnomaly).toBe(true)
      expect(result.severity).toBe('low')
    })

    it('should detect medium severity anomaly', () => {
      // z-score = |100 - 80| / 10 = 2.0
      const result = detectAnomaly(100, 80, 10, defaultThresholds)
      expect(result.isAnomaly).toBe(true)
      expect(result.severity).toBe('medium')
    })

    it('should detect high severity anomaly', () => {
      // z-score = |100 - 75| / 10 = 2.5
      const result = detectAnomaly(100, 75, 10, defaultThresholds)
      expect(result.isAnomaly).toBe(true)
      expect(result.severity).toBe('high')
    })

    it('should detect critical severity anomaly', () => {
      // z-score = |100 - 70| / 10 = 3.0
      const result = detectAnomaly(100, 70, 10, defaultThresholds)
      expect(result.isAnomaly).toBe(true)
      expect(result.severity).toBe('critical')
    })

    it('should handle zero standard deviation', () => {
      const result = detectAnomaly(100, 100, 0, defaultThresholds)
      expect(result.isAnomaly).toBe(false)
      expect(result.zScore).toBe(0)
    })
  })

  describe('Linear Regression', () => {
    it('should calculate perfect positive correlation', () => {
      const points = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 5 }
      ]
      const result = linearRegression(points)
      expect(result.slope).toBeCloseTo(1)
      expect(result.intercept).toBeCloseTo(0)
      expect(result.r2).toBeCloseTo(1)
    })

    it('should calculate perfect negative correlation', () => {
      const points = [
        { x: 1, y: 5 },
        { x: 2, y: 4 },
        { x: 3, y: 3 },
        { x: 4, y: 2 },
        { x: 5, y: 1 }
      ]
      const result = linearRegression(points)
      expect(result.slope).toBeCloseTo(-1)
      expect(result.intercept).toBeCloseTo(6)
      expect(result.r2).toBeCloseTo(1)
    })

    it('should handle constant values', () => {
      const points = [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 }
      ]
      const result = linearRegression(points)
      expect(result.slope).toBeCloseTo(0)
      expect(result.intercept).toBeCloseTo(5)
    })

    it('should return zeros for insufficient data', () => {
      const result = linearRegression([{ x: 1, y: 1 }])
      expect(result.slope).toBe(0)
      expect(result.intercept).toBe(0)
      expect(result.r2).toBe(0)
    })
  })
})
