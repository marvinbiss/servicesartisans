/**
 * Tests — GET /api/v1/embed/rge-snippet (pillar 10 RGE-OS embed loader).
 *
 * The route mirrors `public/embed/rge-v1.js` byte-for-byte. We assert the
 * sync invariant + headers + minimal shape of the body so future tweaks
 * to one file MUST be mirrored in the other (the byte-eq test catches it
 * before commit).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { GET } from '@/app/api/v1/embed/rge-snippet/route'

const PUBLIC_SNIPPET_PATH = join(process.cwd(), 'public', 'embed', 'rge-v1.js')
const publicSnippet = readFileSync(PUBLIC_SNIPPET_PATH, 'utf8')

describe('GET /api/v1/embed/rge-snippet', () => {
  it('returns 200 with Content-Type application/javascript', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/application\/javascript/)
  })

  it('serves cache-friendly + CORS-open headers (embeds are cross-origin)', async () => {
    const res = await GET()
    const cache = res.headers.get('Cache-Control') ?? ''
    expect(cache).toMatch(/public/)
    expect(cache).toMatch(/max-age=\d+/)
    expect(cache).toMatch(/stale-while-revalidate=\d+/)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
    expect(res.headers.get('X-RGE-OS-Pillar')).toBe('10')
  })

  it('body wires window.SARGEConfig and the documented options', async () => {
    const res = await GET()
    const body = await res.text()
    expect(body).toMatch(/window\.SARGEConfig/)
    expect(body).toMatch(/cfg\.container/)
    expect(body).toMatch(/cfg\.metier/)
    expect(body).toMatch(/cfg\.theme/)
    expect(body).toMatch(/cfg\.ville/)
  })

  it('body injects a sandboxed iframe (allow-forms + allow-top-navigation)', async () => {
    const res = await GET()
    const body = await res.text()
    expect(body).toMatch(/createElement\(\s*['"]iframe['"]\s*\)/)
    expect(body).toMatch(/sandbox/)
    expect(body).toMatch(/allow-forms/)
    expect(body).toMatch(/allow-top-navigation/)
    expect(body).toMatch(/loading.*lazy/)
  })

  it('body is byte-equal to public/embed/rge-v1.js (sync invariant)', async () => {
    const res = await GET()
    const body = await res.text()
    expect(body).toBe(publicSnippet)
    expect(body.length).toBe(publicSnippet.length)
  })

  it('static public snippet defaults to canonical origin when none provided', () => {
    expect(publicSnippet).toMatch(/cfg\.origin\s*\|\|\s*['"]https:\/\/servicesartisans\.fr['"]/)
  })
})
