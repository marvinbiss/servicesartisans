import { afterEach, describe, expect, it } from 'vitest'

import { validateEmail, validateWebhookUrl } from '@/lib/webhooks'

const env = process.env as Record<string, string | undefined>
const ORIGINAL_ENV = env.NODE_ENV

afterEach(() => {
  env.NODE_ENV = ORIGINAL_ENV
})

describe('webhooks/validation — validateWebhookUrl', () => {
  it('accepts a valid https URL', () => {
    const r = validateWebhookUrl('https://example.com/hooks/sa')
    expect(r.ok).toBe(true)
  })

  it('rejects non-string input', () => {
    const r = validateWebhookUrl(42)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/string/i)
  })

  it('rejects unparseable URLs', () => {
    const r = validateWebhookUrl('not a url')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/valid URL/i)
  })

  it('rejects http:// in production for non-loopback hosts', () => {
    env.NODE_ENV = 'production'
    const r = validateWebhookUrl('http://example.com/hook')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/http/i)
  })

  it('accepts http://localhost regardless of env', () => {
    env.NODE_ENV = 'production'
    const r = validateWebhookUrl('http://localhost:3000/hook')
    expect(r.ok).toBe(true)
  })

  it('rejects RFC1918 private IPs in production (SSRF guard)', () => {
    env.NODE_ENV = 'production'
    const ranges = [
      'https://10.0.0.1/hook',
      'https://192.168.1.50/hook',
      'https://172.16.0.1/hook',
      'https://169.254.169.254/latest/meta-data', // AWS metadata
    ]
    for (const u of ranges) {
      const r = validateWebhookUrl(u)
      expect(r.ok, `expected reject for ${u}`).toBe(false)
    }
  })

  it('allows private IPs in development (CI/local testing)', () => {
    env.NODE_ENV = 'development'
    const r = validateWebhookUrl('https://10.0.0.1/hook')
    expect(r.ok).toBe(true)
  })

  it('rejects URLs over 500 chars', () => {
    const longPath = '/' + 'x'.repeat(600)
    const r = validateWebhookUrl(`https://example.com${longPath}`)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/500/)
  })

  it('rejects non-http(s) schemes (javascript:/file:/ftp:)', () => {
    expect(validateWebhookUrl('javascript:alert(1)').ok).toBe(false)
    expect(validateWebhookUrl('file:///etc/passwd').ok).toBe(false)
    expect(validateWebhookUrl('ftp://example.com').ok).toBe(false)
  })
})

describe('webhooks/validation — validateEmail', () => {
  it('accepts a well-formed email', () => {
    const r = validateEmail('marvin@example.com')
    expect(r.ok).toBe(true)
  })

  it('allows undefined / empty / null', () => {
    expect(validateEmail(undefined).ok).toBe(true)
    expect(validateEmail(null).ok).toBe(true)
    expect(validateEmail('').ok).toBe(true)
  })

  it('rejects malformed strings', () => {
    expect(validateEmail('no-at-sign').ok).toBe(false)
    expect(validateEmail('a@b').ok).toBe(false)
    expect(validateEmail('a@ b.com').ok).toBe(false)
  })

  it('rejects emails over 254 chars', () => {
    const r = validateEmail('a'.repeat(250) + '@b.com')
    expect(r.ok).toBe(false)
  })

  it('rejects non-string non-nullish input', () => {
    const r = validateEmail(42)
    expect(r.ok).toBe(false)
  })
})
