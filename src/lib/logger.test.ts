/**
 * PII masking regression tests for logger.ts
 * Audit 2026-04-25 (security MEDIUM): emails / phones / tokens previously
 * landed verbatim in Vercel logs and Sentry breadcrumbs. Mask at format time.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from './logger'

describe('logger PII masking', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  function lastErrorOutput(): string {
    const calls = consoleErrorSpy.mock.calls
    if (calls.length === 0) return ''
    return String(calls[calls.length - 1][0] ?? '')
  }

  function lastWarnOutput(): string {
    const calls = consoleWarnSpy.mock.calls
    if (calls.length === 0) return ''
    return String(calls[calls.length - 1][0] ?? '')
  }

  it('masks email addresses', () => {
    logger.error('signup failure', new Error('boom'), { email: 'marvin.bissohong@yeoskin.com' })
    const out = lastErrorOutput()
    expect(out).not.toContain('marvin.bissohong@yeoskin.com')
    expect(out).toContain('ma***@yeoskin.com')
  })

  it('masks phone numbers', () => {
    logger.error('SMS fail', new Error('boom'), { phone: '+33612345678' })
    const out = lastErrorOutput()
    expect(out).not.toContain('+33612345678')
    expect(out).toMatch(/\+3\*\*\*78/)
  })

  it('masks phone_e164 and telephone variants', () => {
    logger.warn('reminder retry', { phone_e164: '+33611111111', telephone_e164: '+33622222222' })
    const out = lastWarnOutput()
    expect(out).not.toContain('+33611111111')
    expect(out).not.toContain('+33622222222')
  })

  it('masks tokens, secrets, api keys', () => {
    logger.error('webhook', new Error('boom'), {
      token: 'abc123def456',
      api_key: 'sk_live_xxxxxxxx',
      authorization: 'Bearer eyJhbGc...',
    })
    const out = lastErrorOutput()
    expect(out).not.toContain('abc123def456')
    expect(out).not.toContain('sk_live_xxxxxxxx')
    expect(out).not.toContain('eyJhbGc')
  })

  it('preserves non-PII context', () => {
    logger.error('booking', new Error('boom'), {
      bookingId: 'b-12345',
      action: 'confirm',
      step: 3,
    })
    const out = lastErrorOutput()
    expect(out).toContain('"bookingId":"b-12345"')
    expect(out).toContain('"action":"confirm"')
    expect(out).toContain('"step":3')
  })

  it('masks PII nested in sub-objects', () => {
    logger.error('nested', new Error('boom'), {
      bookingId: 'b-1',
      client: { full_name: 'Marvin', email: 'marvin@yeoskin.com', phone: '+33612345678' },
    })
    const out = lastErrorOutput()
    expect(out).not.toContain('marvin@yeoskin.com')
    expect(out).not.toContain('+33612345678')
    expect(out).toContain('"full_name":"Marvin"') // not in masklist
    expect(out).toContain('"bookingId":"b-1"')
  })

  it('handles short strings gracefully', () => {
    logger.error('short', new Error('boom'), { token: 'ab', email: 'a@b.c' })
    const out = lastErrorOutput()
    expect(out).not.toContain('"token":"ab"')
    expect(out).not.toContain('"email":"a@b.c"')
  })

  it('handles null and undefined values', () => {
    logger.warn('null phone', { phone: null, email: undefined, bookingId: 'b-1' })
    const out = lastWarnOutput()
    expect(out).toContain('"bookingId":"b-1"')
    // Null/undefined produce '[REDACTED]' via maskValue branch
    expect(out).toContain('"phone":"[REDACTED]"')
  })
})
