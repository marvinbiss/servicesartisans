import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockCaptureException = vi.fn()
const mockSetTags = vi.fn()
const mockSetExtras = vi.fn()
const mockSetLevel = vi.fn()
const mockWithScope = vi.fn((cb: (scope: unknown) => void) => {
  cb({ setTags: mockSetTags, setExtras: mockSetExtras, setLevel: mockSetLevel })
})

vi.mock('@sentry/nextjs', () => ({
  withScope: (cb: (scope: unknown) => void) => mockWithScope(cb),
  captureException: (err: unknown) => mockCaptureException(err),
}))

import { captureError } from '@/lib/monitoring/sentry'

describe('captureError — normalizeToError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('preserves native Error instances as-is', () => {
    const err = new Error('boom')
    captureError(err)
    expect(mockCaptureException).toHaveBeenCalledTimes(1)
    const arg = mockCaptureException.mock.calls[0][0] as Error
    expect(arg).toBe(err)
    expect(arg.message).toBe('boom')
  })

  it('normalizes a PostgrestError-shaped object into a real Error with metadata', () => {
    const supabaseErr = {
      message: 'duplicate key value violates unique constraint',
      code: '23505',
      details: 'Key (email)=(x@y.fr) already exists.',
      hint: null,
    }
    captureError(supabaseErr)
    expect(mockCaptureException).toHaveBeenCalledTimes(1)
    const arg = mockCaptureException.mock.calls[0][0] as Error & { code?: string }
    expect(arg).toBeInstanceOf(Error)
    expect(arg.message).toBe('duplicate key value violates unique constraint')
    expect(arg.code).toBe('23505')
    // Raw object surfaced as extras, not '[object Object]' message.
    expect(mockSetExtras).toHaveBeenCalledWith(expect.objectContaining({ raw_error: supabaseErr }))
  })

  it('falls back to JSON.stringify for generic objects without .message', () => {
    const weird = { foo: 'bar', nested: { count: 3 } }
    captureError(weird)
    const arg = mockCaptureException.mock.calls[0][0] as Error
    expect(arg).toBeInstanceOf(Error)
    expect(arg.message).toBe(JSON.stringify(weird))
    // Critically: NOT '[object Object]'.
    expect(arg.message).not.toBe('[object Object]')
  })

  it('handles unserializable cyclic objects without crashing', () => {
    const cyclic: Record<string, unknown> = { x: 1 }
    cyclic.self = cyclic
    captureError(cyclic)
    const arg = mockCaptureException.mock.calls[0][0] as Error
    expect(arg).toBeInstanceOf(Error)
    expect(arg.message).toBe('[unserializable error object]')
  })

  it('falls back to String() for primitives', () => {
    captureError('plain string error')
    expect((mockCaptureException.mock.calls[0][0] as Error).message).toBe('plain string error')

    captureError(42)
    expect((mockCaptureException.mock.calls[1][0] as Error).message).toBe('42')

    captureError(null)
    expect((mockCaptureException.mock.calls[2][0] as Error).message).toBe('null')
  })

  it('forwards tags and level options to scope', () => {
    captureError(new Error('boom'), {
      tags: { route: 'cron-test' },
      level: 'error',
    })
    expect(mockSetTags).toHaveBeenCalledWith({ route: 'cron-test' })
    expect(mockSetLevel).toHaveBeenCalledWith('error')
  })

  it('preserves stack from object errors when present', () => {
    const errWithStack = {
      message: 'failed',
      stack: 'Error: failed\n  at handler.ts:42',
    }
    captureError(errWithStack)
    const arg = mockCaptureException.mock.calls[0][0] as Error
    expect(arg.stack).toBe('Error: failed\n  at handler.ts:42')
  })
})
