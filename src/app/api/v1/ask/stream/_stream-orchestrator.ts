/**
 * Stream orchestrator — wraps the AnswerEngine (Ralph 13) and emits SSE
 * events for each pipeline stage. Returns an async iterable that the
 * route handler pipes into the Response body.
 *
 * Stages emitted :
 *   1. `start`        → as soon as orchestrator starts (status: starting).
 *                       A second `start` is emitted once the AnswerEngine
 *                       result arrives, carrying classification + provider
 *                       derived from `trace`.
 *   2. `groundtruth`  → if `trace.groundTruthInjected` is true. Body is
 *                       `{ detail: trace.groundTruthDetail }` — the
 *                       calculator's deterministic figure injected before
 *                       the LLM call (anti-hallucination on YMYL aides).
 *   3. `chunk` (× N)  → phrase-granular emission of the LLM `content`.
 *                       v0.2 will swap this for true token streaming once
 *                       the Mistral/Claude provider wrappers expose SSE.
 *   4. `critic`       → if `criticVerdict` present (YMYL second-pass).
 *   5. `done` or `error`
 *
 * Heartbeat : the orchestrator only emits the bulk of events AFTER the
 * underlying `answer()` resolves (since the upstream provider buffers the
 * full response in v0.1). To keep proxies from killing the long-poll
 * connection in the meantime, we yield `: hb` SSE comments every 10s
 * while the answer() Promise pends. They are no-ops for EventSource
 * clients but reset proxy idle timers.
 *
 * AbortSignal : the caller's `req.signal` is plumbed through. On abort
 * we emit a final `error` event with `code: 'client_disconnect'` and
 * terminate the iterator. The underlying answer() call cannot itself
 * be cancelled in v0.1 (LLM provider holds the socket); the dangling
 * promise will resolve later and its result is dropped on the floor.
 * That's a known cost-leak we'll address when provider SDKs expose
 * native AbortController support (v0.2).
 */

import { answer, type AnswerRequest, type AnswerResult } from '@/lib/answer-engine'

import { encodeSseComment, encodeSseEvent } from './_stream-encoder'

const CHUNK_PHRASE_SPLIT_RE = /([\s\S]+?[.!?])(\s+|$)/g
const HEARTBEAT_INTERVAL_MS = 10_000

export type StreamInput = {
  query: string
  classification?: AnswerRequest['classification']
  aidesContext?: AnswerRequest['aidesContext']
  citedSources?: AnswerRequest['citedSources']
  traceId?: string
  agentName?: string
}

type RetryableErrorCode =
  | 'critic_block'
  | 'llm_unavailable'
  | 'invalid_request'
  | 'rate_limit'
  | 'timeout'
  | 'no_result'
  | 'internal'
  | 'client_disconnect'
  | 'orchestrator_error'

function isRetryable(code: RetryableErrorCode): boolean {
  return code === 'timeout' || code === 'llm_unavailable' || code === 'rate_limit'
}

function generateTraceId(): string {
  // 16 hex chars from 8 random bytes — opaque correlation ID, not a secret.
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}

export async function* streamAnswer(
  input: StreamInput,
  signal?: AbortSignal
): AsyncIterable<string> {
  const traceId = input.traceId ?? generateTraceId()
  const startMs = Date.now()

  yield encodeSseComment('stream open')
  yield encodeSseEvent({
    event: 'start',
    data: { traceId, status: 'starting' },
    id: '0',
  })

  if (signal?.aborted) {
    yield encodeSseEvent({
      event: 'error',
      data: {
        code: 'client_disconnect',
        message: 'Client aborted before answer was requested',
        retryable: false,
      },
    })
    return
  }

  // Kick off the AnswerEngine call. Build the request defensively :
  // only pass fields the caller actually provided to avoid widening
  // optional-undefined into typed `undefined` (exactOptionalPropertyTypes
  // is not enabled but keeps the wire payload tight).
  const req: AnswerRequest = { query: input.query, traceId }
  if (input.classification !== undefined) req.classification = input.classification
  if (input.aidesContext !== undefined) req.aidesContext = input.aidesContext
  if (input.citedSources !== undefined) req.citedSources = input.citedSources
  if (input.agentName !== undefined) req.agentName = input.agentName

  const answerPromise = answer(req)

  // Pump heartbeat comments while answer() pends. Each loop iteration
  // races the in-flight answer() promise against a heartbeat timer.
  // When the timer wins we yield a heartbeat comment and loop again.
  // When the answer wins (or rejects) we capture the outcome in
  // `outcome` and break out. We track via a typed sentinel rather than
  // a mutable closure so TypeScript's narrowing stays sound.
  type Outcome = { kind: 'ok'; result: AnswerResult } | { kind: 'thrown'; err: unknown }
  const HB_SENTINEL = Symbol('heartbeat')

  const trackedPromise: Promise<Outcome> = answerPromise.then(
    (result) => ({ kind: 'ok', result }) as Outcome,
    (err) => ({ kind: 'thrown', err }) as Outcome
  )

  let outcome: Outcome | null = null
  while (outcome === null) {
    if (signal?.aborted) {
      yield encodeSseEvent({
        event: 'error',
        data: {
          code: 'client_disconnect',
          message: 'Client aborted mid-stream',
          retryable: false,
        },
      })
      return
    }
    let hbTimer: ReturnType<typeof setTimeout> | undefined
    const hbPromise = new Promise<typeof HB_SENTINEL>((resolve) => {
      hbTimer = setTimeout(() => resolve(HB_SENTINEL), HEARTBEAT_INTERVAL_MS)
    })
    const winner = await Promise.race([trackedPromise, hbPromise])
    if (hbTimer !== undefined) clearTimeout(hbTimer)
    if (winner === HB_SENTINEL) {
      yield encodeSseComment('hb')
      continue
    }
    outcome = winner
    break
  }

  if (outcome.kind === 'thrown') {
    const code: RetryableErrorCode = 'internal'
    yield encodeSseEvent({
      event: 'error',
      data: {
        code,
        message: outcome.err instanceof Error ? outcome.err.message : 'Unknown error',
        retryable: isRetryable(code),
      },
    })
    return
  }

  const settledResult: AnswerResult = outcome.result

  if (!settledResult.ok) {
    const code = settledResult.reason as RetryableErrorCode
    yield encodeSseEvent({
      event: 'error',
      data: {
        code,
        message: settledResult.userSafeMessage,
        retryable: isRetryable(code),
      },
    })
    return
  }

  // Refined start event — now with classification + provider from trace.
  const trace = settledResult.trace
  yield encodeSseEvent({
    event: 'start',
    data: {
      traceId: trace.traceId,
      classification: trace.classification,
      provider: trace.providerUsed,
      model: trace.modelUsed,
      status: 'answering',
    },
    id: '1',
  })

  if (trace.groundTruthInjected) {
    yield encodeSseEvent({
      event: 'groundtruth',
      data: {
        injected: true,
        detail: trace.groundTruthDetail ?? null,
      },
      id: '2',
    })
  }

  // Phrase-granular emission of the answer text. We split on sentence
  // terminators (. ! ?) followed by whitespace or end-of-string. Any
  // trailing partial sentence (no terminator) is emitted as a final chunk.
  let cumulative = 0
  let chunkId = 3
  const text = settledResult.content
  let lastIdx = 0
  // Use exec-loop instead of matchAll so we can read .index safely.
  CHUNK_PHRASE_SPLIT_RE.lastIndex = 0
  let m: RegExpExecArray | null = CHUNK_PHRASE_SPLIT_RE.exec(text)
  while (m !== null) {
    const phrase = m[1] ?? ''
    if (phrase.length > 0) {
      cumulative += phrase.length
      yield encodeSseEvent({
        event: 'chunk',
        data: { delta: phrase, cumulative },
        id: String(chunkId++),
      })
      lastIdx = (m.index ?? 0) + phrase.length
    }
    m = CHUNK_PHRASE_SPLIT_RE.exec(text)
  }
  if (lastIdx < text.length) {
    const tail = text.slice(lastIdx)
    if (tail.trim().length > 0) {
      cumulative += tail.length
      yield encodeSseEvent({
        event: 'chunk',
        data: { delta: tail, cumulative },
        id: String(chunkId++),
      })
    }
  }

  if (settledResult.criticVerdict) {
    yield encodeSseEvent({
      event: 'critic',
      data: {
        decision: settledResult.criticVerdict.decision,
        confidence: settledResult.criticVerdict.confidence,
        reasons: settledResult.criticVerdict.reasons,
      },
      id: String(chunkId++),
    })
  }

  yield encodeSseEvent({
    event: 'done',
    data: {
      ok: true,
      latency_ms: Date.now() - startMs,
      citations: settledResult.citations,
      trace: {
        traceId: trace.traceId,
        classification: trace.classification,
        provider: trace.providerUsed,
        model: trace.modelUsed,
        criticInvoked: trace.criticInvoked,
        groundTruthInjected: trace.groundTruthInjected,
        latencyMs: trace.latencyMs,
      },
    },
    id: String(chunkId++),
  })
}
