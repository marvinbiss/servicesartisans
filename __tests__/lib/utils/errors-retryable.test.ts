import { describe, it, expect } from 'vitest'
import { isRetryableError } from '@/lib/utils/errors'
import { AppError, ErrorCode } from '@/lib/utils/errors'

describe('isRetryableError', () => {
  it('classifies the production supabase socket-drop error as retryable', () => {
    // Exact shape surfaced by supabase-js when the Supabase pooler closes an
    // idle keep-alive connection (prod log 2026-06-12, getCeeProviders...).
    const supabaseError = {
      message: 'TypeError: fetch failed',
      details:
        'TypeError: fetch failed\n\nCaused by: SocketError: other side closed (UND_ERR_SOCKET)',
      hint: '',
      code: '',
    }
    expect(isRetryableError(supabaseError)).toBe(true)
  })

  it('matches transient socket / DNS markers on native Errors and nested causes', () => {
    expect(isRetryableError(new Error('TypeError: fetch failed'))).toBe(true)
    expect(isRetryableError(new Error('read ECONNRESET'))).toBe(true)
    expect(isRetryableError(new Error('getaddrinfo EAI_AGAIN db.supabase.co'))).toBe(true)
    expect(isRetryableError(new Error('socket hang up'))).toBe(true)

    const wrapped = new Error('fetch failed')
    ;(wrapped as { cause?: unknown }).cause = new Error('other side closed')
    expect(isRetryableError(wrapped)).toBe(true)
  })

  it('honours AppError.retryable and does not over-match', () => {
    expect(
      isRetryableError(new AppError({ code: ErrorCode.API_TIMEOUT, message: 'x', retryable: true }))
    ).toBe(true)
    expect(
      isRetryableError(
        new AppError({ code: ErrorCode.VALIDATION_ERROR, message: 'bad', retryable: false })
      )
    ).toBe(false)
    expect(isRetryableError(new Error('row not found'))).toBe(false)
    expect(isRetryableError(null)).toBe(false)
    expect(isRetryableError({ message: 42 })).toBe(false)
  })
})
