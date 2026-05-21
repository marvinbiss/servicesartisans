/**
 * Tests — SSE encoder primitives.
 *
 * Covers wire-format invariants : double-newline terminator, JSON
 * serialisation, optional id line ordering, comment newline-stripping.
 */
import { describe, it, expect } from 'vitest'

import { encodeSseEvent, encodeSseComment } from '@/app/api/v1/ask/stream/_stream-encoder'

describe('encodeSseEvent', () => {
  it('emits event + data with double-newline terminator', () => {
    const out = encodeSseEvent({ event: 'start', data: { traceId: 'abc' } })
    expect(out).toBe(`event: start\ndata: ${JSON.stringify({ traceId: 'abc' })}\n\n`)
  })

  it('emits id line BEFORE event when id provided', () => {
    const out = encodeSseEvent({ event: 'chunk', data: { delta: 'hi' }, id: '7' })
    const lines = out.split('\n')
    expect(lines[0]).toBe('id: 7')
    expect(lines[1]).toBe('event: chunk')
    expect(lines[2]).toBe(`data: ${JSON.stringify({ delta: 'hi' })}`)
  })

  it('JSON-stringifies arbitrary nested data', () => {
    const out = encodeSseEvent({
      event: 'done',
      data: { ok: true, citations: [{ url: 'https://x', n: 1 }] },
    })
    expect(out).toContain('"citations":[{"url":"https://x","n":1}]')
  })

  it('always ends with exactly two trailing newlines', () => {
    const out = encodeSseEvent({ event: 'x', data: {} })
    expect(out.endsWith('\n\n')).toBe(true)
    expect(out.endsWith('\n\n\n')).toBe(false)
  })

  it('data: line never contains raw newlines (JSON.stringify guarantee)', () => {
    const out = encodeSseEvent({
      event: 'chunk',
      data: { delta: 'line1\nline2\nline3' },
    })
    // The `\n` literal inside the string is escaped as `\\n` by stringify,
    // so the encoded frame splits cleanly into 3 lines (event, data, blank).
    const dataLines = out.split('\n').filter((l) => l.startsWith('data: '))
    expect(dataLines).toHaveLength(1)
    expect(dataLines[0]).toContain('line1\\nline2\\nline3')
  })

  it('accepts string id (not just numeric)', () => {
    const out = encodeSseEvent({ event: 'x', data: {}, id: 'uuid-abc' })
    expect(out.startsWith('id: uuid-abc\n')).toBe(true)
  })
})

describe('encodeSseComment', () => {
  it('formats with leading colon-space and trailing double newline', () => {
    expect(encodeSseComment('hb')).toBe(': hb\n\n')
  })

  it('strips embedded newlines to keep the frame on a single line', () => {
    const out = encodeSseComment('multi\nline\rcomment')
    expect(out).toBe(': multi line comment\n\n')
    // No raw \n or \r inside the comment payload
    expect(out.indexOf('\n', 2)).toBe(out.length - 2)
  })
})
