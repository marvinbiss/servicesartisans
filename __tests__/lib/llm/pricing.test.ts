import { describe, it, expect } from 'vitest'
import { calculateCost, getPricing } from '@/lib/llm/pricing'

describe('pricing.getPricing', () => {
  it('returns the entry for a known model', () => {
    const p = getPricing('mistral-large-latest')
    expect(p).not.toBeNull()
    expect(p?.inputPerMillionUSD).toBe(4)
    expect(p?.outputPerMillionUSD).toBe(12)
  })

  it('returns Claude Opus 4.7 with the cached tier set', () => {
    const p = getPricing('claude-opus-4-7')
    expect(p).not.toBeNull()
    expect(p?.cachedInputPerMillionUSD).toBe(1.5)
  })

  it('returns Gemini 2.5 Pro with no cached tier (vendor does not split)', () => {
    const p = getPricing('gemini-2.5-pro')
    expect(p).not.toBeNull()
    expect(p?.cachedInputPerMillionUSD).toBeUndefined()
  })

  it('returns null for an unknown model id', () => {
    expect(getPricing('gpt-4o-2024-08-06')).toBeNull()
  })
})

describe('pricing.calculateCost', () => {
  it('computes input + output cost for Opus without cache hit', () => {
    const cost = calculateCost('claude-opus-4-7', 1000, 500, 0)
    // (1000/1e6)*15 + (500/1e6)*75 = 0.015 + 0.0375 = 0.0525
    expect(cost).toBeCloseTo(0.0525, 6)
  })

  it('applies cached tier to the cached portion only', () => {
    // 1000 input total of which 800 cached, 200 non-cached, 500 output
    // 800/1e6 * 1.5 + 200/1e6 * 15 + 500/1e6 * 75
    // = 0.0012 + 0.003 + 0.0375 = 0.0417
    const cost = calculateCost('claude-opus-4-7', 1000, 500, 800)
    expect(cost).toBeCloseTo(0.0417, 6)
  })

  it('treats cacheReadTokens as no-op for models without cached tier (Mistral)', () => {
    const cost = calculateCost('mistral-large-latest', 1000, 500, 800)
    // No cached pricing: 1000/1e6 * 4 + 500/1e6 * 12 = 0.004 + 0.006 = 0.01
    expect(cost).toBeCloseTo(0.01, 6)
  })

  it('handles cacheRead larger than input gracefully (clamps non-cached >= 0)', () => {
    // cacheRead 1200 but input only 1000 - non-cached portion clamps to 0
    const cost = calculateCost('claude-sonnet-4-6', 1000, 0, 1200)
    // 1200/1e6 * 0.3 + 0 + 0 = 0.00036
    expect(cost).toBeCloseTo(0.00036, 6)
  })

  it('returns 0 for an unknown model', () => {
    expect(calculateCost('mystery-model', 1000, 500, 0)).toBe(0)
  })

  it('returns 0 when both token counts are 0', () => {
    expect(calculateCost('claude-haiku-4-5-20251001', 0, 0, 0)).toBe(0)
  })

  it('computes Gemini 2.5 Pro cost correctly', () => {
    const cost = calculateCost('gemini-2.5-pro', 10_000, 2_000, 0)
    // 10000/1e6 * 1.25 + 2000/1e6 * 5 = 0.0125 + 0.01 = 0.0225
    expect(cost).toBeCloseTo(0.0225, 6)
  })
})
