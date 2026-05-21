/**
 * Routing policy — pure function, no I/O, no side effects.
 *
 * Defaults are picked for SOVEREIGNTY first (Mistral La Plateforme, hosted in
 * Paris, RGPD-natif) so that an unclassified prompt never accidentally exfiltrates
 * French PII to US infra. Override paths only trip when a measurable need exists
 * (multimodal, long context, YMYL critic, etc.). Mistral Medium 3 is reserved
 * for bulk SEO where cost dominates quality differences for tightly-prompted FR
 * generation. Anthropic Sonnet 4.6 is the tool-use SOTA pick for RAG over
 * public corpora.
 */

import type { LLMProviderName, LLMRequest } from './types'

export type ModelChoice = {
  provider: LLMProviderName
  model: string
  reasoning: string
}

const LONG_CONTEXT_TOKEN_THRESHOLD = 100_000

export function chooseModel(req: LLMRequest): ModelChoice {
  if (req.hasImage || req.hasPDF) {
    return {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      reasoning: 'multimodal input requires Gemini 2.5 Pro',
    }
  }

  if (
    req.classification === 'pii_user' ||
    req.classification === 'contract_legal' ||
    req.classification === 'ymyl_aides'
  ) {
    return {
      provider: 'mistral',
      model: 'mistral-large-latest',
      reasoning: 'EU sovereignty required (PII / YMYL / legal contract)',
    }
  }

  if (
    req.classification === 'long_context' ||
    (req.estimatedInputTokens ?? 0) > LONG_CONTEXT_TOKEN_THRESHOLD
  ) {
    return {
      provider: 'claude',
      model: 'claude-opus-4-7',
      reasoning: 'context exceeds 100K tokens, Opus 4.7 1M-ctx needed',
    }
  }

  if (req.classification === 'critic_ymyl') {
    return {
      provider: 'claude',
      model: 'claude-opus-4-7',
      reasoning: 'YMYL critic blocking — Opus 4.7 for max factual rigor',
    }
  }

  if (req.classification === 'bulk_seo') {
    return {
      provider: 'mistral',
      model: 'mistral-medium-latest',
      reasoning: 'bulk FR generation cost-optimized via Mistral Medium 3',
    }
  }

  if (req.classification === 'rag_public') {
    return {
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      reasoning: 'public corpus RAG — Sonnet 4.6 tool-use SOTA',
    }
  }

  return {
    provider: 'mistral',
    model: 'mistral-large-latest',
    reasoning: 'generic default — Mistral Large sovereign by default',
  }
}
