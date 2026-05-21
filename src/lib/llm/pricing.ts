/**
 * Per-model pricing table (USD per 1M tokens).
 *
 * Source: vendor public pricing pages snapshot 2026-05. Refreshed when a
 * vendor announces a change — not derived from API responses, so the cost
 * accounting stays deterministic in tests and audits.
 *
 * `cachedInputPerMillionUSD` is set only where the vendor exposes a
 * separate cached-tier price (Anthropic prompt caching reports
 * `cache_read_input_tokens` in usage; Mistral and Gemini do not split
 * cached input pricing today).
 */

export type ModelPricing = {
  modelId: string
  inputPerMillionUSD: number
  outputPerMillionUSD: number
  cachedInputPerMillionUSD?: number
}

const PRICING: ReadonlyArray<ModelPricing> = [
  { modelId: 'mistral-large-latest', inputPerMillionUSD: 4, outputPerMillionUSD: 12 },
  { modelId: 'mistral-medium-latest', inputPerMillionUSD: 0.4, outputPerMillionUSD: 2 },
  { modelId: 'mistral-small-latest', inputPerMillionUSD: 0.2, outputPerMillionUSD: 0.6 },
  {
    modelId: 'claude-opus-4-7',
    inputPerMillionUSD: 15,
    outputPerMillionUSD: 75,
    cachedInputPerMillionUSD: 1.5,
  },
  {
    modelId: 'claude-sonnet-4-6',
    inputPerMillionUSD: 3,
    outputPerMillionUSD: 15,
    cachedInputPerMillionUSD: 0.3,
  },
  {
    modelId: 'claude-haiku-4-5-20251001',
    inputPerMillionUSD: 0.25,
    outputPerMillionUSD: 1.25,
    cachedInputPerMillionUSD: 0.025,
  },
  { modelId: 'gemini-2.5-pro', inputPerMillionUSD: 1.25, outputPerMillionUSD: 5 },
  { modelId: 'gemini-2.5-flash', inputPerMillionUSD: 0.1, outputPerMillionUSD: 0.4 },
]

export function getPricing(modelId: string): ModelPricing | null {
  return PRICING.find((p) => p.modelId === modelId) ?? null
}

/**
 * Compute USD cost for a single call.
 *
 * Anthropic prompt caching: `inputTokens` reports the GROSS count
 * (cached + non-cached), and `cacheReadTokens` is a subset. We split the
 * total into "cached portion charged at the cached tier" and "non-cached
 * portion charged at the standard tier" so the math matches the vendor
 * invoice. When the model has no cached tier (Mistral/Gemini today), we
 * treat cacheReadTokens as zero-effect.
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0
): number {
  const pricing = getPricing(modelId)
  if (!pricing) return 0
  const effectiveCached = pricing.cachedInputPerMillionUSD ? cacheReadTokens : 0
  const cachedCost = pricing.cachedInputPerMillionUSD
    ? (effectiveCached / 1_000_000) * pricing.cachedInputPerMillionUSD
    : 0
  const nonCachedInputTokens = Math.max(0, inputTokens - effectiveCached)
  const nonCachedInputCost = (nonCachedInputTokens / 1_000_000) * pricing.inputPerMillionUSD
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillionUSD
  return Number((cachedCost + nonCachedInputCost + outputCost).toFixed(6))
}
