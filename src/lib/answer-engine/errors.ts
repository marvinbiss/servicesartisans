/**
 * AnswerEngine error hierarchy.
 *
 * Only one user-throwable class : `InvalidRequestError`. Everything else
 * (LLM unavailable, Critic block, etc.) is surfaced via the structured
 * `AnswerResult` discriminated union — never via an exception — so the
 * caller cannot accidentally bypass the fail-closed posture by catching
 * too broadly.
 */

export class AnswerEngineError extends Error {
  readonly code: string
  readonly cause?: unknown

  constructor(message: string, code: string, cause?: unknown) {
    super(message)
    this.name = 'AnswerEngineError'
    this.code = code
    this.cause = cause
  }
}

export class InvalidRequestError extends AnswerEngineError {
  constructor(message: string) {
    super(message, 'invalid_request')
    this.name = 'InvalidRequestError'
  }
}
