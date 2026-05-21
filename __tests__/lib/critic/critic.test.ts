/**
 * Tests — src/lib/critic/critic.ts
 *
 * Mocks the `@/lib/llm` barrel so we control whether the registry is
 * "initialized" and what the Claude provider returns. We exercise every
 * decision branch:
 *   - pre-LLM block (hallucination, math, no source)
 *   - registry absent (fail-closed)
 *   - LLM throws (fail-closed)
 *   - LLM returns non-JSON (fail-closed)
 *   - LLM returns malformed JSON (fail-closed)
 *   - LLM returns valid approve / revise / block
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CriticInput } from '@/lib/critic/types'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const { completeMock, getRegistryMock } = vi.hoisted(() => ({
  completeMock: vi.fn(),
  getRegistryMock: vi.fn(),
}))

vi.mock('@/lib/llm', () => ({
  getRegistry: () => getRegistryMock(),
}))

import { critique } from '@/lib/critic/critic'

function baseInput(overrides: Partial<CriticInput> = {}): CriticInput {
  return {
    primaryOutput:
      'Vous pouvez recevoir 5000€ via MaPrimeRénov selon ANAH https://anah.gouv.fr/foo.',
    userQuery: 'Combien pour une PAC air/eau ?',
    ymylContext: 'aide_amount',
    sourceConversation: [],
    citedSources: [
      {
        url: 'https://anah.gouv.fr/foo',
        title: 'Barème MPR PAC 2026',
        retrievedAt: '2026-05-21',
      },
    ],
    traceId: 'trace-test',
    agentName: 'simulateur-aides',
    ...overrides,
  }
}

beforeEach(() => {
  completeMock.mockReset()
  getRegistryMock.mockReset()
  getRegistryMock.mockReturnValue({
    claude: {
      name: 'claude',
      defaultModel: 'claude-opus-4-7',
      complete: completeMock,
      stream: vi.fn(),
    },
    mistral: {
      name: 'mistral',
      defaultModel: 'mistral-large-latest',
      complete: vi.fn(),
      stream: vi.fn(),
    },
    gemini: { name: 'gemini', defaultModel: 'gemini-2.5-pro', complete: vi.fn(), stream: vi.fn() },
  })
})

describe('critique — pre-LLM short-circuit', () => {
  it('blocks immediately on hallucination pattern without calling the LLM', async () => {
    const verdict = await critique(
      baseInput({ primaryOutput: '100% de prise en charge avec MPR.' })
    )
    expect(verdict.decision).toBe('block')
    expect(completeMock).not.toHaveBeenCalled()
    if (verdict.decision === 'block') {
      expect(verdict.userSafeMessage).toContain('France Rénov')
    }
  })

  it('blocks immediately on math error without calling the LLM', async () => {
    const verdict = await critique(
      baseInput({ primaryOutput: 'Total: 1000€ + 2000€ = 5000€ pour ta PAC.' })
    )
    expect(verdict.decision).toBe('block')
    expect(completeMock).not.toHaveBeenCalled()
  })

  it('blocks when there is no source AND no reference at all', async () => {
    const verdict = await critique(
      baseInput({ primaryOutput: 'Tu vas toucher 5000 balles, fonce.' })
    )
    expect(verdict.decision).toBe('block')
    expect(completeMock).not.toHaveBeenCalled()
  })
})

describe('critique — registry absent fail-closed', () => {
  it('returns block when getRegistry() throws (registry not initialized)', async () => {
    getRegistryMock.mockImplementation(() => {
      throw new Error('LLM registry not initialized — call initRegistry() at boot')
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
    if (verdict.decision === 'block') {
      expect(verdict.userSafeMessage).toContain('Contactez')
      expect(verdict.confidence).toBe(0)
    }
    expect(completeMock).not.toHaveBeenCalled()
  })
})

describe('critique — LLM error fail-closed', () => {
  it('returns block when claude.complete() throws', async () => {
    completeMock.mockRejectedValue(new Error('timeout after 15s'))
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
    if (verdict.decision === 'block') {
      expect(verdict.userSafeMessage).toContain('indisponible')
    }
  })
})

describe('critique — LLM output parsing', () => {
  it('returns block when LLM returns non-JSON garbage', async () => {
    completeMock.mockResolvedValue({
      content: 'sure thing, no JSON here just vibes',
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
  })

  it('returns block when JSON is malformed (truncated)', async () => {
    completeMock.mockResolvedValue({
      content: '{ "score": 0.9, "decision": "approve", "reasons": [',
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
  })

  it('returns block when JSON shape is invalid (missing score)', async () => {
    completeMock.mockResolvedValue({
      content: '{ "decision": "approve", "reasons": [] }',
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
  })

  it('returns approve when LLM returns valid high-confidence approve', async () => {
    completeMock.mockResolvedValue({
      content: JSON.stringify({
        score: 0.95,
        decision: 'approve',
        reasons: [
          {
            dimension: 'factuality',
            severity: 'info',
            message: 'Montant 5000€ cohérent avec barème ANAH 2026.',
          },
        ],
      }),
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('approve')
    expect(verdict.confidence).toBeGreaterThanOrEqual(0.85)
    expect(verdict.reasons).toHaveLength(1)
  })

  it('returns block when LLM explicitly blocks, preserves userSafeMessage', async () => {
    completeMock.mockResolvedValue({
      content: JSON.stringify({
        score: 0.1,
        decision: 'block',
        reasons: [
          {
            dimension: 'factuality',
            severity: 'block',
            message: 'Montant fantaisiste pour PAC.',
          },
        ],
        userSafeMessage: 'Réessayez en précisant votre revenu fiscal de référence.',
      }),
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('block')
    if (verdict.decision === 'block') {
      expect(verdict.userSafeMessage).toContain('revenu fiscal')
    }
  })

  it('returns revise when LLM revises with suggestedFix', async () => {
    completeMock.mockResolvedValue({
      content: JSON.stringify({
        score: 0.7,
        decision: 'revise',
        reasons: [
          {
            dimension: 'source_present',
            severity: 'warn',
            message: 'Manque URL France Rénov.',
          },
        ],
        suggestedFix: 'Ajouter https://france-renov.gouv.fr/aides/maprimerenov',
      }),
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('revise')
    if (verdict.decision === 'revise') {
      expect(verdict.suggestedFix).toContain('france-renov')
    }
  })

  it('strips markdown code fences from LLM output', async () => {
    completeMock.mockResolvedValue({
      content: '```json\n{ "score": 0.95, "decision": "approve", "reasons": [] }\n```',
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('approve')
  })

  it('coerces invalid reason entries out (sanitize), keeps valid ones', async () => {
    completeMock.mockResolvedValue({
      content: JSON.stringify({
        score: 0.9,
        decision: 'approve',
        reasons: [
          { dimension: 'NOT_A_DIM', severity: 'info', message: 'bogus' },
          { dimension: 'factuality', severity: 'WAT', message: 'bogus severity' },
          { dimension: 'factuality', severity: 'info', message: '' },
          { dimension: 'factuality', severity: 'info', message: 'OK montant.' },
        ],
      }),
      toolCalls: [],
      modelUsed: 'claude-opus-4-7',
      providerUsed: 'claude',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        cost: 0,
      },
      latencyMs: 50,
      stopReason: 'end_turn',
    })
    const verdict = await critique(baseInput())
    expect(verdict.decision).toBe('approve')
    expect(verdict.reasons).toHaveLength(1)
    expect(verdict.reasons[0].message).toBe('OK montant.')
  })
})
