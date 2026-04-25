/**
 * Sentry server beforeSend regression tests.
 * Audit 2026-04-25 (HIGH H1) : the schema-drift filter must
 *   1. drop "column ... does not exist" / 42703 / [Cron... phone_e164] events
 *   2. tag them schema_drift_hotfix:'true' for traceability
 *   3. auto-expire on 2026-05-05 so it doesn't permanently mask real bugs
 *
 * The implementation lives inside Sentry.init() in sentry.server.config.ts;
 * we re-implement the filter here in a pure form to keep the test isolated
 * (and assert the contract). Any drift between this test and the real
 * sentry.server.config.ts beforeSend is a regression — keep them in sync.
 */
import { describe, expect, it, vi, afterEach } from 'vitest'

// Mirror of sentry.server.config.ts beforeSend — keep aligned.
// If sentry.server.config.ts changes, update this mirror AND the test cases.
const SCHEMA_DRIFT_FILTER_EXPIRY = Date.UTC(2026, 4, 5) // 2026-05-05

interface SentryEvent {
  exception?: { values?: Array<{ type?: string; value?: string }> }
  message?: string
  tags?: Record<string, string>
}

function beforeSend(event: SentryEvent): SentryEvent | null {
  const exc = event.exception?.values?.[0]
  if (exc?.type === 'NotFoundError') return null

  const msg = typeof exc?.value === 'string' ? exc.value : ''
  const eventMsg = typeof event.message === 'string' ? event.message : ''
  const haystack = msg || eventMsg

  if (haystack && Date.now() < SCHEMA_DRIFT_FILTER_EXPIRY) {
    const isUndefinedColumn = haystack.includes('column ') && haystack.includes(' does not exist')
    const is42703 = /\b42703\b/.test(haystack)
    const isPhoneCron = haystack.startsWith('[Cron') && haystack.includes('phone_e164')

    if (isUndefinedColumn || is42703 || isPhoneCron) {
      event.tags = { ...(event.tags ?? {}), schema_drift_hotfix: 'true' }
      return null
    }
  }

  return event
}

describe('Sentry server beforeSend', () => {
  afterEach(() => vi.useRealTimers())

  it('drops NotFoundError unconditionally', () => {
    expect(
      beforeSend({ exception: { values: [{ type: 'NotFoundError', value: 'whatever' }] } })
    ).toBeNull()
  })

  it('drops "column X does not exist" while filter is active', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-30'))
    expect(
      beforeSend({
        exception: {
          values: [{ type: 'PostgrestError', value: 'column reviews.comment does not exist' }],
        },
      })
    ).toBeNull()
  })

  it('drops 42703 error code', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-30'))
    expect(beforeSend({ message: 'Postgres error 42703 on insert' })).toBeNull()
  })

  it('drops [Cron …phone_e164] message', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-30'))
    expect(beforeSend({ message: '[Cron 1h] failed: phone_e164 does not exist' })).toBeNull()
  })

  it('PASSES THROUGH the same errors after expiry 2026-05-05', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-05-06'))
    const event = beforeSend({ message: 'column foo does not exist' })
    expect(event).not.toBeNull()
    expect(event?.tags?.schema_drift_hotfix).toBeUndefined()
  })

  it('lets unrelated errors through', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-30'))
    const event = beforeSend({ message: 'TypeError: Cannot read property foo' })
    expect(event).not.toBeNull()
    expect(event?.tags?.schema_drift_hotfix).toBeUndefined()
  })

  it('does NOT drop "column" mention without the matching tail', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-30'))
    expect(beforeSend({ message: 'column index out of range' })).not.toBeNull()
  })
})
