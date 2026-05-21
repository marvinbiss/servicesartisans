/**
 * Public surface — AnswerEngine sessions (Ralph 34).
 *
 * Callers (route handlers, tests) import from `@/lib/ask-sessions` and
 * NEVER reach into `./store` directly. Keeps the dependency-injection
 * surface and the env-coupled Supabase wiring isolated.
 */

export {
  generatePublicKey,
  timingSafeKeyEqual,
  createSession,
  authenticateSession,
  appendTurn,
  SESSION_TTL_MS,
  MAX_MESSAGES,
  PUBLIC_KEY_BYTES,
  DEFAULT_HISTORY_LIMIT,
} from './store'
export type {
  Message,
  Session,
  SessionCitation,
  CreateSessionOpts,
  SessionStoreDeps,
  AuthResult,
  AssistantTurn,
} from './store'
