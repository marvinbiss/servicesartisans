import { describe, it, expect } from 'vitest'
import { chooseModel } from '@/lib/llm/routing'
import type { LLMRequest } from '@/lib/llm/types'

function makeReq(partial: Partial<LLMRequest>): LLMRequest {
  return {
    messages: [],
    classification: 'generic',
    ...partial,
  }
}

describe('chooseModel', () => {
  it('routes image requests to Gemini regardless of classification', () => {
    const choice = chooseModel(makeReq({ classification: 'ymyl_aides', hasImage: true }))
    expect(choice.provider).toBe('gemini')
    expect(choice.model).toBe('gemini-2.5-pro')
  })

  it('routes PDF requests to Gemini', () => {
    const choice = chooseModel(makeReq({ classification: 'rag_public', hasPDF: true }))
    expect(choice.provider).toBe('gemini')
    expect(choice.model).toBe('gemini-2.5-pro')
  })

  it('routes pii_user to Mistral Large for sovereignty', () => {
    const choice = chooseModel(makeReq({ classification: 'pii_user' }))
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-large-latest')
  })

  it('routes contract_legal to Mistral Large', () => {
    const choice = chooseModel(makeReq({ classification: 'contract_legal' }))
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-large-latest')
  })

  it('routes ymyl_aides to Mistral Large', () => {
    const choice = chooseModel(makeReq({ classification: 'ymyl_aides' }))
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-large-latest')
  })

  it('routes long_context classification to Claude Opus 4.7', () => {
    const choice = chooseModel(makeReq({ classification: 'long_context' }))
    expect(choice.provider).toBe('claude')
    expect(choice.model).toBe('claude-opus-4-7')
  })

  it('infers long context from estimatedInputTokens > 100K and routes to Opus', () => {
    const choice = chooseModel(
      makeReq({ classification: 'generic', estimatedInputTokens: 150_000 })
    )
    expect(choice.provider).toBe('claude')
    expect(choice.model).toBe('claude-opus-4-7')
  })

  it('routes critic_ymyl to Claude Opus 4.7', () => {
    const choice = chooseModel(makeReq({ classification: 'critic_ymyl' }))
    expect(choice.provider).toBe('claude')
    expect(choice.model).toBe('claude-opus-4-7')
  })

  it('routes bulk_seo to Mistral Medium', () => {
    const choice = chooseModel(makeReq({ classification: 'bulk_seo' }))
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-medium-latest')
  })

  it('routes rag_public to Claude Sonnet 4.6', () => {
    const choice = chooseModel(makeReq({ classification: 'rag_public' }))
    expect(choice.provider).toBe('claude')
    expect(choice.model).toBe('claude-sonnet-4-6')
  })

  it('falls back to Mistral Large for generic classification', () => {
    const choice = chooseModel(makeReq({ classification: 'generic' }))
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-large-latest')
  })

  it('multimodal hard override wins over pii_user sovereignty', () => {
    const choice = chooseModel(makeReq({ classification: 'pii_user', hasImage: true }))
    expect(choice.provider).toBe('gemini')
    expect(choice.model).toBe('gemini-2.5-pro')
  })

  it('returns non-empty reasoning string on every path', () => {
    const cases: Array<Partial<LLMRequest>> = [
      { hasImage: true },
      { hasPDF: true },
      { classification: 'pii_user' },
      { classification: 'contract_legal' },
      { classification: 'ymyl_aides' },
      { classification: 'long_context' },
      { classification: 'critic_ymyl' },
      { classification: 'bulk_seo' },
      { classification: 'rag_public' },
      { classification: 'generic' },
      { classification: 'generic', estimatedInputTokens: 200_000 },
    ]
    for (const partial of cases) {
      const choice = chooseModel(makeReq(partial))
      expect(choice.reasoning.length).toBeGreaterThan(0)
    }
  })

  it('does NOT promote to Opus when estimatedInputTokens equals threshold', () => {
    const choice = chooseModel(
      makeReq({ classification: 'generic', estimatedInputTokens: 100_000 })
    )
    expect(choice.provider).toBe('mistral')
    expect(choice.model).toBe('mistral-large-latest')
  })
})
