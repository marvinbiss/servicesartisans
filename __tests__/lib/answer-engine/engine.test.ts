/**
 * Tests — src/lib/answer-engine/engine.ts
 *
 * Mocks both `@/lib/llm` and `@/lib/critic` because the engine is a thin
 * orchestrator over those layers — we want to verify the wiring (when do
 * we call the Critic, what reason do we report on each failure mode,
 * what's in the Trace) without exercising real HTTP.
 *
 * We import the engine via `@/lib/answer-engine/engine` so the module's
 * own imports resolve against the mocked barrels.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const { completeMock, chooseModelMock, critiqueMock, isYMYLMock, getRegistryMock } = vi.hoisted(
  () => ({
    completeMock: vi.fn(),
    chooseModelMock: vi.fn(),
    critiqueMock: vi.fn(),
    isYMYLMock: vi.fn(),
    getRegistryMock: vi.fn(),
  })
)

vi.mock('@/lib/llm', () => ({
  chooseModel: (...args: unknown[]) => chooseModelMock(...args),
  getRegistry: () => getRegistryMock(),
}))

vi.mock('@/lib/llm/errors', async () => {
  // Re-export the real error classes — engine uses `instanceof` on them.
  const actual = await vi.importActual<typeof import('@/lib/llm/errors')>('@/lib/llm/errors')
  return actual
})

vi.mock('@/lib/critic', () => ({
  critique: (...args: unknown[]) => critiqueMock(...args),
  isYMYL: (...args: unknown[]) => isYMYLMock(...args),
}))

import { answer } from '@/lib/answer-engine/engine'
import { InvalidRequestError } from '@/lib/answer-engine/errors'
import { LLMRateLimitError, LLMTimeoutError } from '@/lib/llm/errors'

function okLLMResponse(content = 'Réponse OK avec https://anah.gouv.fr/foo.') {
  return {
    content,
    toolCalls: [],
    modelUsed: 'mistral-large-latest',
    providerUsed: 'mistral' as const,
    usage: {
      inputTokens: 42,
      outputTokens: 18,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      cost: 0.0012,
    },
    latencyMs: 120,
    stopReason: 'end_turn' as const,
  }
}

function approveVerdict() {
  return {
    decision: 'approve' as const,
    confidence: 0.95,
    reasons: [],
  }
}

beforeEach(() => {
  completeMock.mockReset()
  chooseModelMock.mockReset()
  critiqueMock.mockReset()
  isYMYLMock.mockReset()
  getRegistryMock.mockReset()

  chooseModelMock.mockReturnValue({
    provider: 'mistral',
    model: 'mistral-large-latest',
    reasoning: 'default test mock',
  })
  getRegistryMock.mockReturnValue({
    mistral: {
      name: 'mistral',
      defaultModel: 'mistral-large-latest',
      complete: completeMock,
      stream: vi.fn(),
    },
    claude: {
      name: 'claude',
      defaultModel: 'claude-opus-4-7',
      complete: vi.fn(),
      stream: vi.fn(),
    },
    gemini: {
      name: 'gemini',
      defaultModel: 'gemini-2.5-pro',
      complete: vi.fn(),
      stream: vi.fn(),
    },
  })
  isYMYLMock.mockReturnValue({ isYMYL: false })
})

describe('answer — input validation', () => {
  it('throws InvalidRequestError when query is empty', async () => {
    await expect(answer({ query: '' })).rejects.toBeInstanceOf(InvalidRequestError)
  })

  it('throws InvalidRequestError when query is whitespace only', async () => {
    await expect(answer({ query: '   ' })).rejects.toBeInstanceOf(InvalidRequestError)
  })
})

describe('answer — LLM error mapping', () => {
  it('returns ok:false reason "llm_unavailable" when LLM throws generic Error', async () => {
    completeMock.mockRejectedValue(new Error('network blew up'))
    const result = await answer({ query: 'Combien pour PAC ?' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('llm_unavailable')
      expect(result.userSafeMessage).toMatch(/indispon|France Rénov/i)
    }
  })

  it('returns ok:false reason "timeout" on LLMTimeoutError', async () => {
    completeMock.mockRejectedValue(new LLMTimeoutError('mistral', 15_000))
    const result = await answer({ query: 'Combien pour PAC ?' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('timeout')
  })

  it('returns ok:false reason "rate_limit" on LLMRateLimitError', async () => {
    completeMock.mockRejectedValue(new LLMRateLimitError('mistral', 30_000))
    const result = await answer({ query: 'Combien pour PAC ?' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('rate_limit')
  })
})

describe('answer — YMYL Critic interaction', () => {
  it('invokes Critic when isYMYL.isYMYL=true and returns approve verdict in result', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: true, context: 'aide_amount' })
    critiqueMock.mockResolvedValue(approveVerdict())

    const result = await answer({
      query: 'Combien MPR pour PAC ?',
      classification: 'ymyl_aides',
    })
    expect(critiqueMock).toHaveBeenCalledTimes(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.criticVerdict?.decision).toBe('approve')
      expect(result.trace.criticInvoked).toBe(true)
    }
  })

  it('does NOT invoke Critic when isYMYL.isYMYL=false', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: false })

    const result = await answer({ query: 'Quel artisan à Lyon ?' })
    expect(critiqueMock).not.toHaveBeenCalled()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.trace.criticInvoked).toBe(false)
  })

  it('returns ok:false reason "critic_block" + propagates userSafeMessage on block', async () => {
    completeMock.mockResolvedValue(okLLMResponse('Tu vas toucher 99999EUR direct.'))
    isYMYLMock.mockReturnValue({ isYMYL: true, context: 'aide_amount' })
    critiqueMock.mockResolvedValue({
      decision: 'block',
      confidence: 0.05,
      reasons: [
        {
          dimension: 'hallucination_risk',
          severity: 'block',
          message: 'Montant fantaisiste.',
        },
      ],
      userSafeMessage: "Information non vérifiable. Contactez France Rénov'.",
    })

    const result = await answer({
      query: 'Combien je touche ?',
      classification: 'ymyl_aides',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('critic_block')
      expect(result.userSafeMessage).toContain('France Rénov')
      expect(result.criticVerdict?.decision).toBe('block')
    }
  })

  it('fail-closes (critic_block) when Critic itself throws', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: true, context: 'aide_amount' })
    critiqueMock.mockRejectedValue(new Error('critic structural failure'))

    const result = await answer({
      query: 'Combien MPR ?',
      classification: 'ymyl_aides',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('critic_block')
      expect(result.userSafeMessage).toMatch(/indispon|conseiller/i)
    }
  })
})

describe('answer — reviseStrategy variants', () => {
  it('block_to_user strategy blocks when Critic returns revise', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: true, context: 'aide_amount' })
    critiqueMock.mockResolvedValue({
      decision: 'revise',
      confidence: 0.7,
      reasons: [],
      suggestedFix: 'Cite la source',
    })

    const result = await answer(
      { query: 'Combien ?', classification: 'ymyl_aides' },
      {
        injectGroundTruth: true,
        invokeCritic: true,
        llmTimeoutMs: 30_000,
        reviseStrategy: 'block_to_user',
      }
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('critic_block')
      expect(result.criticVerdict?.decision).toBe('revise')
    }
  })

  it('pass_through_with_warning strategy returns ok:true with revise verdict attached', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: true, context: 'aide_amount' })
    critiqueMock.mockResolvedValue({
      decision: 'revise',
      confidence: 0.7,
      reasons: [],
      suggestedFix: 'Cite la source',
    })

    const result = await answer({
      query: 'Combien ?',
      classification: 'ymyl_aides',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.criticVerdict?.decision).toBe('revise')
      expect(result.content).toContain('Réponse OK')
    }
  })
})

describe('answer — ground-truth injection wiring', () => {
  it('feeds the ground-truth segment into the LLM system prompt', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: false })

    await answer({
      query: 'Combien MPR PAC air/eau ?',
      classification: 'ymyl_aides',
      aidesContext: {
        geste: 'pac_air_eau',
        rfr: 15_000,
        nbPersonnes: 2,
        zone: 'hors_idf',
      },
    })

    expect(completeMock).toHaveBeenCalledTimes(1)
    const call = completeMock.mock.calls[0][0] as {
      messages: ReadonlyArray<{ role: string; content: string }>
    }
    const systemMsg = call.messages.find((m) => m.role === 'system')
    expect(systemMsg).toBeDefined()
    expect(systemMsg!.content).toContain('GROUND TRUTH')
    expect(systemMsg!.content).toContain('5000EUR')
  })

  it('skips injection when injectGroundTruth=false even with aidesContext', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: false })

    const result = await answer(
      {
        query: 'Combien MPR ?',
        aidesContext: {
          geste: 'pac_air_eau',
          rfr: 15_000,
          nbPersonnes: 2,
          zone: 'hors_idf',
        },
      },
      {
        injectGroundTruth: false,
        invokeCritic: true,
        llmTimeoutMs: 30_000,
        reviseStrategy: 'pass_through_with_warning',
      }
    )

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.trace.groundTruthInjected).toBe(false)
    const call = completeMock.mock.calls[0][0] as {
      messages: ReadonlyArray<{ role: string; content: string }>
    }
    const systemMsg = call.messages.find((m) => m.role === 'system')
    expect(systemMsg!.content).not.toContain('GROUND TRUTH')
  })
})

describe('answer — trace and citations', () => {
  it('returns full trace with cost + tokens + latency on success', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: false })

    const result = await answer({ query: 'q', traceId: 'test-trace-123' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.trace.traceId).toBe('test-trace-123')
      expect(result.trace.providerUsed).toBe('mistral')
      expect(result.trace.modelUsed).toBe('mistral-large-latest')
      expect(result.trace.llmUsage?.cost).toBeGreaterThan(0)
      expect(result.trace.llmUsage?.inputTokens).toBe(42)
      expect(result.trace.llmUsage?.outputTokens).toBe(18)
      expect(result.trace.latencyMs).toBeGreaterThanOrEqual(0)
    }
  })

  it('extracts citations from LLM output', async () => {
    completeMock.mockResolvedValue(
      okLLMResponse('Source officielle: https://anah.gouv.fr/maprimerenov pour le barème 2026.')
    )
    isYMYLMock.mockReturnValue({ isYMYL: false })

    const result = await answer({
      query: 'PAC ?',
      citedSources: [
        {
          url: 'https://anah.gouv.fr/maprimerenov',
          title: 'ANAH MPR 2026',
          retrievedAt: '2026-04-15',
        },
      ],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.citations).toHaveLength(1)
      expect(result.citations[0].title).toBe('ANAH MPR 2026')
      expect(result.citations[0].retrievedAt).toBe('2026-04-15')
    }
  })

  it('auto-generates a traceId when not provided', async () => {
    completeMock.mockResolvedValue(okLLMResponse())
    isYMYLMock.mockReturnValue({ isYMYL: false })

    const result = await answer({ query: 'q' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.trace.traceId).toMatch(/^[0-9a-f]{16}$/)
    }
  })
})
