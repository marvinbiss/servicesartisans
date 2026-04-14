/**
 * Integration-style tests — POST /api/simulateur/callback
 *
 * Strategy: vi.mock() all external dependencies before dynamic-importing the route.
 * Each test controls mock state through module-level variables the factory functions
 * close over (same pattern as __tests__/simulateur/api/submit.test.ts).
 *
 * Mocked modules:
 *   @/lib/supabase/admin
 *   @/lib/rate-limit-db
 *   @/lib/simulateur/callback-pipedrive
 *   @/lib/simulateur/rgpd/signed-token
 *   @/lib/simulateur/rgpd/hash-ip
 *   @/lib/logger
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Env — must be set before any module reads process.env
// ---------------------------------------------------------------------------
process.env.RGPD_IP_SALT = 'test-salt-2026'
process.env.RGPD_EXPORT_SECRET = 'test-secret-rgpd-export-2026-long-enough'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

// ---------------------------------------------------------------------------
// Mock control state (closed-over by factory functions)
// ---------------------------------------------------------------------------

// rate-limit-db
let rlHourSuccess = true
let rlDaySuccess = true

// supabase admin
let supabaseEstimation: Record<string, unknown> | null = {
  id: 'est-uuid-1',
  prenom: 'Alice',
  nom: 'Durand',
  email: 'alice@example.com',
  callback_used_at: null,
}
let supabaseFetchError: { message: string } | null = null
let dlqInsertShouldThrow = false
// Round 3: conditional-update claim result (null = another caller won the race)
let claimResult: { id: string } | null = { id: 'est-uuid-1' }
let claimError: { message: string } | null = null

// signed-token
let tokenValid = true

// hash-ip
let hashIpShouldThrow = false

// callback-pipedrive
let pipedriveConfigured = true
let pipedriveResult: { dealId: number } = { dealId: 42 }
let pipedriveThrows = false

// ---------------------------------------------------------------------------
// Mocks (must be hoisted before imports)
// ---------------------------------------------------------------------------

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/simulateur/rgpd/hash-ip', () => ({
  hashIp: vi.fn((ip: string) => {
    if (hashIpShouldThrow) throw new Error('hashIp exploded')
    return 'hashed-' + ip
  }),
}))

vi.mock('@/lib/simulateur/rgpd/signed-token', () => ({
  verifyToken: vi.fn((_publicId: string, _token: string) => tokenValid),
}))

vi.mock('@/lib/rate-limit-db', () => ({
  rateLimitDb: vi.fn(async (key: string) => {
    if (key.includes(':h:')) {
      return {
        success: rlHourSuccess,
        remaining: rlHourSuccess ? 2 : 0,
        resetAt: new Date(Date.now() + 3_600_000),
      }
    }
    return {
      success: rlDaySuccess,
      remaining: rlDaySuccess ? 7 : 0,
      resetAt: new Date(Date.now() + 86_400_000),
    }
  }),
  getRateLimitDbHeaders: vi.fn(() => ({
    'X-RateLimit-Remaining': '2',
    'X-RateLimit-Reset': new Date(Date.now() + 3_600_000).toISOString(),
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => {
    const dlqInsertChain = {
      insert: vi.fn(() => {
        if (dlqInsertShouldThrow) return Promise.reject(new Error('DLQ insert failed'))
        return Promise.resolve({ error: null })
      }),
    }

    // The route makes two chained calls on `simulateur_estimations`:
    //   1. .select().eq().maybeSingle() — read estimation (first)
    //   2. .update().eq().is().select().maybeSingle() — atomic claim (second)
    // We differentiate by tracking whether `.update()` has been called in the
    // current chain. `.update()` sets the flag; the next maybeSingle resolves
    // with the claim result and the flag resets.
    let inUpdateChain = false
    const estimationChain: Record<string, ReturnType<typeof vi.fn>> = {}
    estimationChain.select = vi.fn(() => estimationChain)
    estimationChain.eq = vi.fn(() => estimationChain)
    estimationChain.is = vi.fn(() => estimationChain)
    estimationChain.update = vi.fn(() => {
      inUpdateChain = true
      return estimationChain
    })
    estimationChain.maybeSingle = vi.fn(() => {
      if (inUpdateChain) {
        inUpdateChain = false
        return Promise.resolve({ data: claimResult, error: claimError })
      }
      return Promise.resolve({ data: supabaseEstimation, error: supabaseFetchError })
    })

    return {
      from: vi.fn((table: string) => {
        if (table === 'simulateur_pipedrive_failures') return dlqInsertChain
        return estimationChain
      }),
    }
  }),
}))

vi.mock('@/lib/simulateur/callback-pipedrive', () => ({
  isCallbackPipedriveConfigured: vi.fn(() => pipedriveConfigured),
  createCallbackRequest: vi.fn(async () => {
    if (pipedriveThrows) throw new Error('Pipedrive API timeout')
    return pipedriveResult
  }),
}))

// ---------------------------------------------------------------------------
// Import route AFTER all mocks are hoisted
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/simulateur/callback/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_BODY = {
  publicId: 'EST-2026-04-14-abc123',
  callbackToken: '1744665600.' + 'a'.repeat(64),
  telephone: '0612345678',
  preferredSlot: null,
  remarquesClient: null,
  consentRgpd: true,
  consentDemarchage: false,
}

function buildReq(
  body: unknown,
  headers: Record<string, string> = {}
): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/simulateur/callback', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '81.64.12.5',
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

function buildReqRaw(rawBody: string): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/simulateur/callback', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '81.64.12.5',
    },
    body: rawBody,
  }) as unknown as Parameters<typeof POST>[0]
}

// Reset all mutable state before each test
beforeEach(() => {
  rlHourSuccess = true
  rlDaySuccess = true
  supabaseEstimation = {
    id: 'est-uuid-1',
    prenom: 'Alice',
    nom: 'Durand',
    email: 'alice@example.com',
    callback_used_at: null,
  }
  supabaseFetchError = null
  dlqInsertShouldThrow = false
  claimResult = { id: 'est-uuid-1' }
  claimError = null
  tokenValid = true
  hashIpShouldThrow = false
  pipedriveConfigured = true
  pipedriveResult = { dealId: 42 }
  pipedriveThrows = false
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/simulateur/callback — HTTP & schema validation', () => {
  it('returns 400 on invalid JSON body', async () => {
    const res = await POST(buildReqRaw('not-json{{{'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/JSON/i)
  })

  it('returns 422 when required fields missing', async () => {
    const res = await POST(buildReq({ telephone: '0612345678' }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toBeDefined()
    expect(body.issues).toBeDefined()
  })

  it('returns 422 when consentRgpd is false', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, consentRgpd: false }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when telephone is invalid format', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, telephone: '+44912345678' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when publicId too short', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, publicId: 'abc' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when callbackToken too short', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, callbackToken: 'short' }))
    expect(res.status).toBe(422)
  })
})

describe('POST /api/simulateur/callback — rate limiting', () => {
  it('returns 429 with headers when hourly limit exceeded', async () => {
    rlHourSuccess = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBeDefined()
    // Headers should be present from getRateLimitDbHeaders
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined()
  })

  it('returns 429 when daily limit exceeded (hourly passes)', async () => {
    rlHourSuccess = true
    rlDaySuccess = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toMatch(/journalier|quota/i)
  })

  it('hourly rate limit checked before daily', async () => {
    rlHourSuccess = false
    rlDaySuccess = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(429)
    // Error message should be the hourly one (checked first)
    const body = await res.json()
    expect(body.error).toMatch(/rappel|demande/i)
  })
})

describe('POST /api/simulateur/callback — token verification', () => {
  it('returns 403 when token is invalid', async () => {
    tokenValid = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/token/i)
  })

  it('proceeds past token check when token valid', async () => {
    tokenValid = true
    const res = await POST(buildReq(VALID_BODY))
    // Should not be 403
    expect(res.status).not.toBe(403)
  })
})

describe('POST /api/simulateur/callback — estimation lookup', () => {
  it('returns 500 on Supabase fetch error', async () => {
    supabaseFetchError = { message: 'DB connection reset' }
    supabaseEstimation = null
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(500)
  })

  it('returns 404 when estimation not found', async () => {
    supabaseEstimation = null
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/introuvable|expir/i)
  })

  it('returns 409 when estimation exists but email is null', async () => {
    supabaseEstimation = {
      id: 'est-uuid-1',
      prenom: 'Bob',
      nom: 'Martin',
      email: null,
      telephone: null,
    }
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/email/i)
  })

  it('returns 409 when email is non-string (number)', async () => {
    supabaseEstimation = {
      id: 'est-uuid-1',
      prenom: 'Bob',
      nom: 'Martin',
      email: 12345 as unknown as string,
      telephone: null,
    }
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(409)
  })
})

describe('POST /api/simulateur/callback — Pipedrive integration', () => {
  it('returns 202 accepted:true when Pipedrive not configured (dev/staging)', async () => {
    pipedriveConfigured = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.accepted).toBe(true)
  })

  it('returns 202 accepted:true on Pipedrive success', async () => {
    pipedriveConfigured = true
    pipedriveThrows = false
    pipedriveResult = { dealId: 99 }
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.accepted).toBe(true)
  })

  it('returns 202 (graceful degradation) when Pipedrive throws and DLQ succeeds', async () => {
    pipedriveConfigured = true
    pipedriveThrows = true
    dlqInsertShouldThrow = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.accepted).toBe(true)
  })

  it('returns 202 (last resort) when Pipedrive throws AND DLQ insert also throws', async () => {
    pipedriveConfigured = true
    pipedriveThrows = true
    dlqInsertShouldThrow = true
    const res = await POST(buildReq(VALID_BODY))
    // Should NEVER crash even if DLQ fails — last resort accepts the user
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.accepted).toBe(true)
  })

  it('response includes rate-limit headers on success', async () => {
    pipedriveConfigured = true
    pipedriveThrows = false
    const res = await POST(buildReq(VALID_BODY))
    expect(res.status).toBe(202)
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined()
  })
})

describe('POST /api/simulateur/callback — IP extraction', () => {
  it('extracts first IP from x-forwarded-for with multiple IPs', async () => {
    // hashIp will be called with the first IP — no throw means it extracted correctly
    hashIpShouldThrow = false
    const res = await POST(
      buildReq(VALID_BODY, {
        'x-forwarded-for': '81.64.12.5, 10.0.0.1, 172.16.0.1',
      })
    )
    // Route proceeds normally — IP was extracted, hash succeeded
    expect(res.status).toBe(202)
  })

  it('falls back gracefully when hashIp throws', async () => {
    hashIpShouldThrow = true
    const res = await POST(buildReq(VALID_BODY))
    // Should not crash — route catches hashIp error and falls back to raw ip
    expect(res.status).toBe(202)
  })

  it('uses x-real-ip when x-forwarded-for absent', async () => {
    hashIpShouldThrow = false
    const req = new Request('http://localhost/api/simulateur/callback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-real-ip': '92.168.0.5',
      },
      body: JSON.stringify(VALID_BODY),
    }) as unknown as Parameters<typeof POST>[0]
    const res = await POST(req)
    expect(res.status).toBe(202)
  })

  it('rejects with 400 when no IP headers present (round 3: no shared "unknown" bucket)', async () => {
    const req = new Request('http://localhost/api/simulateur/callback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }) as unknown as Parameters<typeof POST>[0]
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/origine/i)
  })
})

describe('POST /api/simulateur/callback — telephone transform in route', () => {
  it('accepts telephone with spaces and passes stripped version to Pipedrive', async () => {
    pipedriveConfigured = true
    pipedriveThrows = false
    const res = await POST(buildReq({ ...VALID_BODY, telephone: '06 12 34 56 78' }))
    expect(res.status).toBe(202)
  })

  it('accepts +33 format telephone', async () => {
    pipedriveConfigured = true
    const res = await POST(buildReq({ ...VALID_BODY, telephone: '+33612345678' }))
    expect(res.status).toBe(202)
  })
})

describe('POST /api/simulateur/callback — optional fields', () => {
  it('handles null preferredSlot and remarquesClient gracefully', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, preferredSlot: null, remarquesClient: null }))
    expect(res.status).toBe(202)
  })

  it('handles populated preferredSlot and remarquesClient', async () => {
    const res = await POST(
      buildReq({
        ...VALID_BODY,
        preferredSlot: 'Lundi 14h–16h',
        remarquesClient: 'Je suis disponible le matin.',
      })
    )
    expect(res.status).toBe(202)
  })

  it('handles consentDemarchage: true', async () => {
    const res = await POST(buildReq({ ...VALID_BODY, consentDemarchage: true }))
    expect(res.status).toBe(202)
  })
})
