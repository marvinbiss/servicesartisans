/**
 * Tests — `@/lib/ask-sessions` store helpers (Ralph 34).
 *
 * Covers :
 *   - generatePublicKey shape + entropy
 *   - timingSafeKeyEqual : same / different length / different content
 *   - createSession passes the random key + IP/UA through to insertSession
 *   - authenticateSession state machine : 404 / 410 / 403 / ok
 *   - appendTurn caps message_count at MAX_MESSAGES
 *   - appendTurn writes user + assistant in order with nullable fields
 */

import { describe, it, expect, vi } from 'vitest'

import {
  appendTurn,
  authenticateSession,
  createSession,
  generatePublicKey,
  MAX_MESSAGES,
  timingSafeKeyEqual,
  type Session,
  type SessionStoreDeps,
} from '@/lib/ask-sessions'

function makeSession(overrides: Partial<Session> = {}): Session {
  const now = new Date()
  return {
    id: '11111111-2222-3333-4444-555555555555',
    public_key: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    created_at: now.toISOString(),
    last_activity_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
    message_count: 0,
    ...overrides,
  }
}

function makeDeps(overrides: Partial<SessionStoreDeps> = {}): SessionStoreDeps {
  return {
    insertSession: vi.fn(async (opts) =>
      makeSession({ public_key: opts.public_key, id: 'inserted' })
    ),
    findSession: vi.fn(async () => null),
    insertMessage: vi.fn(async () => ({ id: 1 })),
    listMessages: vi.fn(async () => []),
    softDelete: vi.fn(async () => {}),
    ...overrides,
  }
}

describe('generatePublicKey', () => {
  it('produces a base64url string ≥ 32 chars', () => {
    const k = generatePublicKey()
    expect(typeof k).toBe('string')
    expect(k.length).toBeGreaterThanOrEqual(32)
    // base64url alphabet : A-Z a-z 0-9 - _
    expect(/^[A-Za-z0-9_-]+$/.test(k)).toBe(true)
  })

  it('returns a distinct value on each call', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(generatePublicKey())
    expect(seen.size).toBe(50)
  })
})

describe('timingSafeKeyEqual', () => {
  it('matches identical strings', () => {
    const k = generatePublicKey()
    expect(timingSafeKeyEqual(k, k)).toBe(true)
  })

  it('rejects strings of different length without throwing', () => {
    expect(timingSafeKeyEqual('abc', 'abcd')).toBe(false)
  })

  it('rejects strings of same length but different content', () => {
    expect(timingSafeKeyEqual('abcdefg', 'abcdefh')).toBe(false)
  })

  it('rejects non-string inputs without throwing', () => {
    expect(timingSafeKeyEqual(undefined as unknown as string, 'x')).toBe(false)
    expect(timingSafeKeyEqual('x', null as unknown as string)).toBe(false)
  })
})

describe('createSession', () => {
  it('passes a fresh public key + IP + UA through to insertSession', async () => {
    const deps = makeDeps()
    const session = await createSession(deps, { ip: '203.0.113.10', userAgent: 'curl/8.0' })
    expect(deps.insertSession).toHaveBeenCalledTimes(1)
    const call = (deps.insertSession as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.public_key.length).toBeGreaterThanOrEqual(32)
    expect(call.ip).toBe('203.0.113.10')
    expect(call.user_agent).toBe('curl/8.0')
    expect(session.public_key).toBe(call.public_key)
  })

  it('defaults ip / user_agent to null when missing', async () => {
    const deps = makeDeps()
    await createSession(deps, {})
    const call = (deps.insertSession as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.ip).toBeNull()
    expect(call.user_agent).toBeNull()
  })
})

describe('authenticateSession', () => {
  it('returns 404 when session_not_found', async () => {
    const deps = makeDeps({ findSession: vi.fn(async () => null) })
    const res = await authenticateSession(deps, 'unknown', 'key')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(404)
      expect(res.reason).toBe('session_not_found')
    }
  })

  it('returns 410 when session is expired', async () => {
    const expired = makeSession({ expires_at: new Date(Date.now() - 1000).toISOString() })
    const deps = makeDeps({ findSession: vi.fn(async () => expired) })
    const res = await authenticateSession(deps, expired.id, expired.public_key)
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(410)
      expect(res.reason).toBe('session_expired')
    }
  })

  it('returns 403 when the public_key does not match', async () => {
    const sess = makeSession({ public_key: 'right-key-padded-to-be-long-enough-32+' })
    const deps = makeDeps({ findSession: vi.fn(async () => sess) })
    const res = await authenticateSession(deps, sess.id, 'wrong-key-padded-to-be-long-enough-32+')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(403)
      expect(res.reason).toBe('invalid_public_key')
    }
  })

  it('returns ok=true with the session on a match', async () => {
    const sess = makeSession()
    const deps = makeDeps({ findSession: vi.fn(async () => sess) })
    const res = await authenticateSession(deps, sess.id, sess.public_key)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.session.id).toBe(sess.id)
  })
})

describe('appendTurn', () => {
  it('throws once message_count >= MAX_MESSAGES', async () => {
    const sess = makeSession({ message_count: MAX_MESSAGES })
    const deps = makeDeps()
    await expect(appendTurn(deps, sess, 'q', { content: 'a' })).rejects.toThrow(
      'session_message_cap_exceeded'
    )
    expect(deps.insertMessage).not.toHaveBeenCalled()
  })

  it('writes user then assistant messages with nullable assistant fields', async () => {
    const sess = makeSession({ message_count: 0 })
    const insertMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({ id: 11 })
    const deps = makeDeps({ insertMessage })
    const out = await appendTurn(deps, sess, 'Quel bareme PAC ?', {
      content: 'Voir france-renov.gouv.fr',
      classification: 'ymyl_aides',
      citations: [{ url: 'https://france-renov.gouv.fr', title: 'France Rénov' }],
    })
    expect(out).toEqual({ userId: 10, assistantId: 11 })
    expect(insertMessage).toHaveBeenCalledTimes(2)
    expect(insertMessage.mock.calls[0][0].role).toBe('user')
    expect(insertMessage.mock.calls[0][0].content).toBe('Quel bareme PAC ?')
    expect(insertMessage.mock.calls[1][0].role).toBe('assistant')
    expect(insertMessage.mock.calls[1][0].classification).toBe('ymyl_aides')
    expect(insertMessage.mock.calls[1][0].citations).toHaveLength(1)
  })

  it('coerces missing assistant fields to null', async () => {
    const sess = makeSession({ message_count: 4 })
    const insertMessage = vi.fn().mockResolvedValue({ id: 42 })
    const deps = makeDeps({ insertMessage })
    await appendTurn(deps, sess, 'hi', { content: 'hello' })
    const assistantCall = insertMessage.mock.calls[1][0]
    expect(assistantCall.classification).toBeNull()
    expect(assistantCall.citations).toBeNull()
    expect(assistantCall.trace).toBeNull()
  })
})
