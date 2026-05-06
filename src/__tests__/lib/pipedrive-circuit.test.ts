import { describe, it, expect } from 'vitest'
import { isInfrastructureError } from '@/lib/integrations/pipedrive-circuit'

describe('pipedrive-circuit — isInfrastructureError', () => {
  it('returns true for fetch failure', () => {
    expect(isInfrastructureError(new Error('fetch failed'))).toBe(true)
  })

  it('returns true for AbortError / timeout', () => {
    expect(isInfrastructureError(new Error('TimeoutError'))).toBe(true)
    expect(isInfrastructureError(new Error('AbortError: signal aborted'))).toBe(true)
  })

  it('returns true for ECONNRESET, ETIMEDOUT, getaddrinfo', () => {
    expect(isInfrastructureError(new Error('connect ECONNRESET 1.2.3.4'))).toBe(true)
    expect(isInfrastructureError(new Error('ETIMEDOUT'))).toBe(true)
    expect(isInfrastructureError(new Error('getaddrinfo ENOTFOUND ...'))).toBe(true)
  })

  it('returns true for Pipedrive 5xx', () => {
    expect(isInfrastructureError(new Error('Pipedrive /persons failed: 502 Bad Gateway'))).toBe(
      true
    )
    expect(
      isInfrastructureError(new Error('Pipedrive /deals failed: 503 Service Unavailable'))
    ).toBe(true)
  })

  it('returns true for Pipedrive 429 / 408', () => {
    expect(isInfrastructureError(new Error('Pipedrive /persons failed: 429 Too Many'))).toBe(true)
    expect(isInfrastructureError(new Error('Pipedrive /deals failed: 408 Timeout'))).toBe(true)
  })

  it('returns false for Pipedrive 4xx business errors', () => {
    expect(isInfrastructureError(new Error('Pipedrive /persons failed: 400 Bad Request'))).toBe(
      false
    )
    expect(isInfrastructureError(new Error('Pipedrive /deals failed: 404 Not Found'))).toBe(false)
    expect(isInfrastructureError(new Error('Pipedrive /deals failed: 403 Forbidden'))).toBe(false)
  })

  it('returns false for null/undefined/empty', () => {
    expect(isInfrastructureError(null)).toBe(false)
    expect(isInfrastructureError(undefined)).toBe(false)
    expect(isInfrastructureError('')).toBe(false)
  })

  it('returns false for unrelated business errors', () => {
    expect(isInfrastructureError(new Error('Email already exists'))).toBe(false)
    expect(isInfrastructureError(new Error('Invalid phone format'))).toBe(false)
  })

  it('handles non-Error thrown values defensively', () => {
    expect(isInfrastructureError({ code: 'something' })).toBe(false)
    // String "fetch failed" should also be detected (defensive over String(err))
    expect(isInfrastructureError('fetch failed')).toBe(true)
  })
})
