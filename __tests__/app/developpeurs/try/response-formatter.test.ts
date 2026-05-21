/**
 * Tests — `_response-formatter.ts` (Ralph 40).
 *
 * Validates the body-classification heuristics (JSON / text / binary),
 * the JSON pretty-printer fallback when the body is not valid JSON, the
 * duration capture, and the `statusBadgeClass` token map (accent / yellow
 * / red / charcoal).
 */
import { describe, it, expect } from 'vitest'
import {
  captureResponse,
  statusBadgeClass,
} from '@/app/(public)/developpeurs/try/_response-formatter'

function jsonRes(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

describe('captureResponse', () => {
  it('classifies application/json and pretty-prints the body', async () => {
    const res = jsonRes({ a: 1, b: 'two' })
    const display = await captureResponse(res, Date.now() - 5)
    expect(display.bodyKind).toBe('json')
    expect(display.bodyPretty).toContain('"a"')
    expect(display.bodyPretty).toContain('"two"')
    expect(display.bodyPretty.split('\n').length).toBeGreaterThan(1)
    expect(display.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('falls back to raw text when JSON parse fails despite content-type', async () => {
    const res = new Response('not-json-but-claims-to-be', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const display = await captureResponse(res, Date.now())
    expect(display.bodyKind).toBe('json')
    expect(display.bodyPretty).toBe('not-json-but-claims-to-be')
  })

  it('classifies text/plain as text', async () => {
    const res = new Response('hello world', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    })
    const display = await captureResponse(res, Date.now())
    expect(display.bodyKind).toBe('text')
    expect(display.bodyPretty).toBe('hello world')
  })

  it('classifies application/octet-stream as binary placeholder', async () => {
    const res = new Response('xxxx', {
      status: 200,
      headers: { 'content-type': 'application/octet-stream' },
    })
    const display = await captureResponse(res, Date.now())
    expect(display.bodyKind).toBe('binary')
    expect(display.bodyPretty).toMatch(/\[binary content, \d+ bytes\]/)
  })

  it('captures status, statusText and headers map', async () => {
    const res = jsonRes({ ok: true }, 201, { 'x-trace': 'abc' })
    const display = await captureResponse(res, Date.now())
    expect(display.status).toBe(201)
    expect(display.headers['content-type']).toContain('application/json')
    expect(display.headers['x-trace']).toBe('abc')
  })
})

describe('statusBadgeClass', () => {
  it('maps 2xx → accent', () => {
    expect(statusBadgeClass(200)).toBe('bg-accent-100 text-accent-800')
    expect(statusBadgeClass(204)).toBe('bg-accent-100 text-accent-800')
  })

  it('maps 3xx and 4xx → yellow', () => {
    expect(statusBadgeClass(301)).toBe('bg-yellow-100 text-yellow-800')
    expect(statusBadgeClass(404)).toBe('bg-yellow-100 text-yellow-800')
  })

  it('maps 5xx → red', () => {
    expect(statusBadgeClass(500)).toBe('bg-red-100 text-red-800')
    expect(statusBadgeClass(503)).toBe('bg-red-100 text-red-800')
  })

  it('maps out-of-band statuses to charcoal fallback', () => {
    expect(statusBadgeClass(0)).toBe('bg-charcoal-100 text-charcoal-700')
    expect(statusBadgeClass(199)).toBe('bg-charcoal-100 text-charcoal-700')
  })
})
