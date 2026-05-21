/**
 * Tests — GET / HEAD /api/v1/health (`src/app/api/v1/health/route.ts`)
 *
 * Couvre :
 *  - GET returns 200
 *  - Body has status:'ok' + version + timestamp + build metadata
 *  - HEAD returns 200 with no body
 *  - Cache-Control no-store + X-License CC-BY-4.0 + CORS *
 */
import { describe, it, expect } from 'vitest'

import { GET, HEAD } from '@/app/api/v1/health/route'

describe('GET /api/v1/health (shallow)', () => {
  it('returns 200', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('body has status:ok + version + timestamp + build metadata', async () => {
    const res = await GET()
    const body = (await res.json()) as {
      status: string
      version: string
      timestamp: string
      build: { sha: string; ref: string }
      docs: string
    }
    expect(body.status).toBe('ok')
    expect(body.version).toBe('1.0.0')
    expect(typeof body.timestamp).toBe('string')
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date')
    expect(body.build).toBeDefined()
    expect(typeof body.build.sha).toBe('string')
    expect(typeof body.build.ref).toBe('string')
    expect(body.docs).toMatch(/servicesartisans\.fr/)
  })

  it('returns Cache-Control: no-store + X-License: CC-BY-4.0 + CORS *', async () => {
    const res = await GET()
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})

describe('HEAD /api/v1/health (shallow)', () => {
  it('returns 200 with no body', async () => {
    const res = await HEAD()
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe('')
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})
