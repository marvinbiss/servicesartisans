/**
 * AnswerEngine sessions store — dependency-injected CRUD layer (Ralph 34).
 *
 * Why dependency-injection : the route handlers wire Supabase queries
 * through small `SessionStoreDeps` closures. Tests pass in-memory fakes so
 * we don't need to mock the Supabase client wholesale on every spec.
 *
 * Security model :
 *   - `session_id`   : UUID, address (not secret)
 *   - `public_key`   : 32-byte base64url (~43 chars). Pure-random, no link
 *                       to user identity, no email/SIRET capture. The
 *                       comparison goes through `timingSafeKeyEqual` to
 *                       defeat early-exit string-compare timing attacks.
 *   - TTL 30 days    : enforced server-side. Expired sessions reject with
 *                       HTTP 410.
 *   - Soft-delete    : DELETE marks `deleted_at`. Restore would require
 *                       admin DB access. Hard cron purge is out of scope
 *                       for Ralph 34 (planned v0.2 alongside summarization).
 *   - Cap 50 msg     : `appendTurn` throws once message_count >= cap so the
 *                       caller maps to 422 instead of letting an attacker
 *                       grow a session indefinitely.
 *
 * Memory refs :
 *   - feedback_legal_data_quality (zero PII leak budget)
 *   - servicesartisans-upstash-rate-limit-fix-2026-04-22 (rate-limit
 *     applied upstream at the route layer)
 */

import crypto from 'node:crypto'

export type SessionCitation = {
  url: string
  title: string
  retrievedAt?: string
}

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  classification?: string | null
  citations?: ReadonlyArray<SessionCitation> | null
  trace?: Record<string, unknown> | null
  created_at: string
}

export type Session = {
  id: string
  public_key: string
  created_at: string
  last_activity_at: string
  expires_at: string
  message_count: number
}

export type CreateSessionOpts = { ip?: string; userAgent?: string }

export type SessionStoreDeps = {
  insertSession: (opts: {
    public_key: string
    ip: string | null
    user_agent: string | null
  }) => Promise<Session>
  findSession: (id: string) => Promise<Session | null>
  insertMessage: (args: {
    session_id: string
    role: 'user' | 'assistant'
    content: string
    classification?: string | null
    citations?: ReadonlyArray<SessionCitation> | null
    trace?: Record<string, unknown> | null
  }) => Promise<{ id: number }>
  listMessages: (session_id: string, limit?: number) => Promise<Message[]>
  softDelete: (session_id: string) => Promise<void>
}

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const MAX_MESSAGES = 50
export const PUBLIC_KEY_BYTES = 24
export const DEFAULT_HISTORY_LIMIT = 100

export function generatePublicKey(): string {
  return crypto.randomBytes(PUBLIC_KEY_BYTES).toString('base64url')
}

export function timingSafeKeyEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

export async function createSession(
  deps: SessionStoreDeps,
  opts: CreateSessionOpts
): Promise<Session> {
  const publicKey = generatePublicKey()
  return deps.insertSession({
    public_key: publicKey,
    ip: opts.ip ?? null,
    user_agent: opts.userAgent ?? null,
  })
}

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; status: 404 | 403 | 410; reason: string }

export async function authenticateSession(
  deps: SessionStoreDeps,
  id: string,
  publicKey: string
): Promise<AuthResult> {
  if (!id || typeof id !== 'string') {
    return { ok: false, status: 404, reason: 'session_not_found' }
  }
  const session = await deps.findSession(id)
  if (!session) return { ok: false, status: 404, reason: 'session_not_found' }
  if (Date.parse(session.expires_at) < Date.now()) {
    return { ok: false, status: 410, reason: 'session_expired' }
  }
  if (!timingSafeKeyEqual(session.public_key, publicKey)) {
    return { ok: false, status: 403, reason: 'invalid_public_key' }
  }
  return { ok: true, session }
}

export type AssistantTurn = {
  content: string
  classification?: string | null
  citations?: ReadonlyArray<SessionCitation> | null
  trace?: Record<string, unknown> | null
}

export async function appendTurn(
  deps: SessionStoreDeps,
  session: Session,
  userContent: string,
  assistant: AssistantTurn
): Promise<{ userId: number; assistantId: number }> {
  if (session.message_count >= MAX_MESSAGES) {
    throw new Error('session_message_cap_exceeded')
  }
  const userMsg = await deps.insertMessage({
    session_id: session.id,
    role: 'user',
    content: userContent,
  })
  const assistantMsg = await deps.insertMessage({
    session_id: session.id,
    role: 'assistant',
    content: assistant.content,
    classification: assistant.classification ?? null,
    citations: assistant.citations ?? null,
    trace: assistant.trace ?? null,
  })
  return { userId: userMsg.id, assistantId: assistantMsg.id }
}
