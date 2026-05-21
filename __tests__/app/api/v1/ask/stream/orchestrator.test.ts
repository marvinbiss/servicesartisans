/**
 * Tests — stream orchestrator stage ordering and error mapping.
 *
 * Strategy : mock `@/lib/answer-engine.answer` and assert that the
 * generator yields SSE frames in the contractual order, with the right
 * `event:` headers. We never parse the SSE wire here — that's
 * `encoder.test.ts`'s job. We grep the frame strings for `event: <name>`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  answer: vi.fn(),
}))

vi.mock('@/lib/answer-engine', () => ({
  answer: mocks.answer,
}))

import { streamAnswer, type StreamInput } from '@/app/api/v1/ask/stream/_stream-orchestrator'

async function collect(input: StreamInput, signal?: AbortSignal): Promise<string[]> {
  const out: string[] = []
  for await (const frame of streamAnswer(input, signal)) {
    out.push(frame)
  }
  return out
}

function eventsFrom(frames: string[]): string[] {
  const evts: string[] = []
  for (const f of frames) {
    const m = f.match(/(?:^|\n)event: (\S+)/)
    if (m) evts.push(m[1])
  }
  return evts
}

const HAPPY_TRACE = {
  traceId: 't-1',
  classification: 'generic',
  providerUsed: 'mistral',
  modelUsed: 'mistral-large-latest',
  groundTruthInjected: false,
  criticInvoked: false,
  latencyMs: 42,
  llmUsage: { inputTokens: 10, outputTokens: 20, cost: 0.0001 },
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('streamAnswer — happy path', () => {
  it('emits start (×2) + chunk + done on simple ok result', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'Bonjour. Comment ca va ?',
      citations: [],
      trace: HAPPY_TRACE,
    })

    const frames = await collect({ query: 'salut' })
    const events = eventsFrom(frames)
    expect(events[0]).toBe('start')
    expect(events).toContain('chunk')
    expect(events[events.length - 1]).toBe('done')
  })

  it('emits chunk events split by sentence terminator', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'Phrase un. Phrase deux! Phrase trois?',
      citations: [],
      trace: HAPPY_TRACE,
    })

    const frames = await collect({ query: 'q' })
    const chunkFrames = frames.filter((f) => f.includes('event: chunk'))
    expect(chunkFrames.length).toBe(3)
    expect(chunkFrames[0]).toContain('"delta":"Phrase un."')
    expect(chunkFrames[1]).toContain('"delta":"Phrase deux!"')
    expect(chunkFrames[2]).toContain('"delta":"Phrase trois?"')
  })

  it('emits trailing partial sentence as a final chunk', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'Une phrase complete. Et un fragment',
      citations: [],
      trace: HAPPY_TRACE,
    })
    const frames = await collect({ query: 'q' })
    const chunkFrames = frames.filter((f) => f.includes('event: chunk'))
    expect(chunkFrames.length).toBe(2)
    // Trailing tail includes the leading whitespace consumed between the
    // last sentence terminator and the fragment — keeps the cumulative
    // char count honest.
    expect(chunkFrames[1]).toContain('Et un fragment')
  })

  it('emits groundtruth event when trace.groundTruthInjected', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'OK.',
      citations: [],
      trace: {
        ...HAPPY_TRACE,
        groundTruthInjected: true,
        groundTruthDetail: 'MPR pac_air_eau: 5000EUR (source anah-2026)',
      },
    })
    const frames = await collect({ query: 'q' })
    const events = eventsFrom(frames)
    expect(events).toContain('groundtruth')
    const gtFrame = frames.find((f) => f.includes('event: groundtruth'))
    expect(gtFrame).toBeDefined()
    expect(gtFrame).toContain('"detail":"MPR pac_air_eau: 5000EUR (source anah-2026)"')
  })

  it('emits critic event when criticVerdict present', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'Reponse YMYL.',
      citations: [],
      criticVerdict: {
        decision: 'approve',
        confidence: 0.92,
        reasons: [{ dimension: 'factuality', severity: 'info', message: 'OK' }],
      },
      trace: { ...HAPPY_TRACE, classification: 'ymyl_aides', criticInvoked: true },
    })
    const frames = await collect({ query: 'q ymyl' })
    const events = eventsFrom(frames)
    expect(events).toContain('critic')
    const criticFrame = frames.find((f) => f.includes('event: critic'))
    expect(criticFrame).toContain('"decision":"approve"')
    expect(criticFrame).toContain('"confidence":0.92')
  })

  it('includes citations in the done event payload', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'avec source.',
      citations: [
        { url: 'https://france-renov.gouv.fr', title: 'France Renov', retrievedAt: '2026-05-21' },
      ],
      trace: HAPPY_TRACE,
    })
    const frames = await collect({ query: 'q' })
    const doneFrame = frames.find((f) => f.includes('event: done'))
    expect(doneFrame).toContain('"citations":[')
    expect(doneFrame).toContain('"url":"https://france-renov.gouv.fr"')
  })
})

describe('streamAnswer — error paths', () => {
  it('emits error event on AnswerResult ok=false', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'critic_block',
      userSafeMessage: 'Reponse non publiable',
      trace: { traceId: 't-err' },
    })
    const frames = await collect({ query: 'q' })
    const events = eventsFrom(frames)
    // The starting `start` (status:starting) is always emitted first.
    expect(events[0]).toBe('start')
    expect(events).toContain('error')
    expect(events).not.toContain('done')
    const errFrame = frames.find((f) => f.includes('event: error'))
    expect(errFrame).toContain('"code":"critic_block"')
    expect(errFrame).toContain('"retryable":false')
  })

  it('marks reason=timeout as retryable in error event', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'timeout',
      userSafeMessage: 'Delai depasse',
      trace: { traceId: 't-to' },
    })
    const frames = await collect({ query: 'q' })
    const errFrame = frames.find((f) => f.includes('event: error'))
    expect(errFrame).toContain('"code":"timeout"')
    expect(errFrame).toContain('"retryable":true')
  })

  it('marks reason=llm_unavailable as retryable', async () => {
    mocks.answer.mockResolvedValue({
      ok: false,
      reason: 'llm_unavailable',
      userSafeMessage: 'Indisponible',
      trace: { traceId: 't-un' },
    })
    const frames = await collect({ query: 'q' })
    const errFrame = frames.find((f) => f.includes('event: error'))
    expect(errFrame).toContain('"retryable":true')
  })

  it('emits internal error frame when answer() throws', async () => {
    mocks.answer.mockRejectedValue(new Error('boom'))
    const frames = await collect({ query: 'q' })
    const events = eventsFrom(frames)
    expect(events).toContain('error')
    const errFrame = frames.find((f) => f.includes('event: error'))
    expect(errFrame).toContain('"code":"internal"')
    expect(errFrame).toContain('"message":"boom"')
  })

  it('respects abort signal pre-stream', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'never reached',
      citations: [],
      trace: HAPPY_TRACE,
    })
    const ctrl = new AbortController()
    ctrl.abort()
    const frames = await collect({ query: 'q' }, ctrl.signal)
    const events = eventsFrom(frames)
    expect(events).toContain('error')
    const errFrame = frames.find((f) => f.includes('event: error'))
    expect(errFrame).toContain('"code":"client_disconnect"')
    // Even though we aborted, the upstream answer() may still resolve in the
    // background — what matters is that we did NOT emit chunk/done frames.
    expect(events).not.toContain('chunk')
    expect(events).not.toContain('done')
  })

  it('uses caller-provided traceId in the initial start event', async () => {
    mocks.answer.mockResolvedValue({
      ok: true,
      content: 'ok.',
      citations: [],
      trace: { ...HAPPY_TRACE, traceId: 'caller-trace-xyz' },
    })
    const frames = await collect({ query: 'q', traceId: 'caller-trace-xyz' })
    const firstStart = frames.find((f) => f.includes('event: start'))
    expect(firstStart).toContain('caller-trace-xyz')
  })
})
