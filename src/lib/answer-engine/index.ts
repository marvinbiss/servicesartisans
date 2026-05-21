/**
 * Public surface — AnswerEngine.
 *
 * Single entry point philosophy: callers import `{ answer }` and treat
 * `AnswerResult` as the authoritative contract. They never reach into
 * `@/lib/llm`, `@/lib/critic` or `@/lib/aides` directly when answering a
 * user-facing query — that would re-open the door to drift between the
 * 4 layers this orchestrator was built to bind together.
 */

export { answer } from './engine'
export { DEFAULT_ENGINE_CONFIG } from './types'
export type {
  AnswerRequest,
  AnswerResult,
  AnswerEngineConfig,
  AnswerFailureReason,
  Citation,
  Trace,
} from './types'
export { AnswerEngineError, InvalidRequestError } from './errors'
