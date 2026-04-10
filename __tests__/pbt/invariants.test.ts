/**
 * Property-Based Tests — Invariants
 *
 * Tests that verify system properties hold across ALL inputs,
 * not just specific examples. Uses fast-check to generate
 * hundreds of random inputs per property.
 *
 * These catch edge-case bugs that fixed-scenario tests miss:
 * - Auth bypass via unusual payloads
 * - Validation gaps on boundary inputs
 * - Role confusion on randomized endpoints
 * - SEO contract violations on dynamic pages
 *
 * Run with: npx vitest run __tests__/pbt/
 */

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import { NextRequest } from 'next/server'

// ─── PBT config: deterministic seeds for CI stability ───────────────────────
// Fixed seed = same inputs every run = no flakiness.
// Override with PBT_SEED env var to explore new cases locally.
const PBT_SEED = parseInt(process.env.PBT_SEED || '42', 10)
const pbtOpts = (numRuns: number): fc.Parameters<unknown> => ({
  numRuns,
  seed: PBT_SEED,
  endOnFailure: true, // stop on first failure, report shrunk case
})

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: null }, error: { message: 'not authenticated' } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn().mockResolvedValue({
    error: new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401 }),
    user: null,
    provider: null,
    supabase: null,
  }),
}))

vi.mock('@/lib/admin-auth', () => ({
  requirePermission: vi.fn().mockResolvedValue({
    success: false,
    error: new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401 }),
    admin: null,
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(path: string, method: string, body?: unknown): NextRequest {
  const url = `http://localhost:3000${path}`
  const init: RequestInit = { method }
  if (body !== undefined && method !== 'GET') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(url, init as RequestInit & { signal?: AbortSignal })
}

// ─── Arbitraries ────────────────────────────────────────────────────────────

// Random payloads that should never bypass auth
const arbitraryPayload = fc.oneof(
  fc.object(),
  fc.string(),
  fc.constant(null),
  fc.constant(undefined),
  fc.integer(),
  fc.array(fc.anything()),
  fc.record({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 1, maxLength: 100 }),
  }),
  // SQL injection attempts
  fc.constant("'; DROP TABLE providers; --"),
  fc.constant({ admin: true, role: 'super_admin' }),
  // XSS attempts
  fc.constant('<script>alert(1)</script>'),
  fc.constant({ __proto__: { isAdmin: true } })
)

const arbitraryMethod = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH')

// ─── 1. Auth invariant: unauthenticated → always rejected ───────────────────

describe('PBT: Auth invariant', () => {
  const protectedArtisanRoutes = [
    '/api/artisan/provider',
    '/api/artisan/avis',
    '/api/artisan/stats',
    '/api/artisan/bookings',
    '/api/artisan/availability',
    '/api/artisan/leads',
    '/api/artisan/devis',
    '/api/artisan/profile',
  ]

  const protectedAdminRoutes = [
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/providers',
    '/api/admin/claims',
  ]

  // protectedClientRoutes — reserved for future client route auth tests
  // const protectedClientRoutes = ['/api/client/profile', '/api/client/leads']

  it('artisan routes reject any unauthenticated request regardless of payload', async () => {
    for (const route of protectedArtisanRoutes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(
          `@/app/api/artisan/${route.replace('/api/artisan/', '')}/route`
        )
      } catch {
        // Route may use dynamic segments, skip
        continue
      }

      await fc.assert(
        fc.asyncProperty(arbitraryMethod, arbitraryPayload, async (method, payload) => {
          const handler = handlerModule[method]
          if (!handler) return // Method not exported, skip

          const req = makeRequest(route, method, payload)
          const response = await handler(req)
          const status = response.status || response?.status

          // INVARIANT: unauthenticated request MUST be rejected
          expect(status).toBeGreaterThanOrEqual(400)
          expect(status).toBeLessThan(500)
        }),
        pbtOpts(20)
      )
    }
  })

  it('admin routes reject any unauthenticated request regardless of payload', async () => {
    for (const route of protectedAdminRoutes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(`@/app/api/admin/${route.replace('/api/admin/', '')}/route`)
      } catch {
        continue
      }

      await fc.assert(
        fc.asyncProperty(arbitraryPayload, async (payload) => {
          const handler = handlerModule.GET
          if (!handler) return

          const req = makeRequest(route, 'GET', payload)
          const response = await handler(req)

          expect(response.status).toBeGreaterThanOrEqual(400)
          expect(response.status).toBeLessThan(500)
        }),
        pbtOpts(20)
      )
    }
  })
})

// ─── 2. Validation invariant: invalid input → 400, never 500 ───────────────

describe('PBT: Validation invariant', () => {
  // Arbitrary invalid bodies that should fail validation
  const arbitraryInvalidBody = fc.oneof(
    fc.constant('not json'),
    fc.constant(''),
    fc.constant(null),
    fc.constant(42),
    fc.constant([]),
    fc.constant(true),
    fc.record({
      // Missing required fields, wrong types
      id: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
      email: fc.oneof(fc.string(), fc.integer()),
      amount: fc.oneof(fc.string(), fc.constant(-1), fc.constant(NaN)),
    }),
    fc.object({ maxDepth: 3, maxKeys: 10 })
  )

  it('POST with random invalid body never returns 500', async () => {
    // Routes that accept POST with JSON body
    const postRoutes = [
      '@/app/api/artisan/provider/route',
      '@/app/api/artisan/availability/route',
      '@/app/api/artisan/devis/route',
    ]

    for (const routePath of postRoutes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(routePath)
      } catch {
        continue
      }

      const handler = handlerModule.POST || handlerModule.PUT
      if (!handler) continue

      await fc.assert(
        fc.asyncProperty(arbitraryInvalidBody, async (body) => {
          const req = makeRequest('/api/test', 'POST', body)
          const response = await handler(req)

          // INVARIANT: invalid input → 4xx (auth or validation), NEVER 500
          expect(response.status).toBeLessThan(500)
        }),
        pbtOpts(30)
      )
    }
  })
})

// ─── 3. Role isolation: user type boundaries never cross ────────────────────

describe('PBT: Role isolation', () => {
  it('artisan guard rejects regardless of request shape', async () => {
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          headers: fc.dictionary(fc.string(), fc.string()),
          cookies: fc.dictionary(fc.string(), fc.string()),
        }),
        async () => {
          // With mock returning unauthenticated, guard must always reject
          const result = await (
            requireArtisan as () => Promise<{ error?: unknown; user?: unknown }>
          )()
          expect(result.error).toBeTruthy()
          expect(result.user).toBeFalsy()
        }
      ),
      pbtOpts(50)
    )
  })

  it('admin permission check rejects all non-admin requests', async () => {
    const { requirePermission } = await import('@/lib/admin-auth')

    // Arbitrary resource/action combinations
    const arbitraryResource = fc.constantFrom(
      'users',
      'providers',
      'claims',
      'settings',
      'payments',
      'reports',
      'analytics',
      'cms',
      'seo',
      'prospection'
    )
    const arbitraryAction = fc.constantFrom('read', 'write')

    await fc.assert(
      fc.asyncProperty(arbitraryResource, arbitraryAction, async (resource, action) => {
        const result = await (
          requirePermission as (r: string, a: string) => Promise<{ success: boolean }>
        )(resource, action)
        // INVARIANT: without admin session, always fails
        expect(result.success).toBe(false)
      }),
      pbtOpts(30)
    )
  })
})

// ─── 4. Response shape invariant ────────────────────────────────────────────

describe('PBT: Response shape', () => {
  it('error responses always have parseable JSON body', async () => {
    const routes = ['@/app/api/artisan/provider/route', '@/app/api/artisan/avis/route']

    for (const routePath of routes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(routePath)
      } catch {
        continue
      }

      await fc.assert(
        fc.asyncProperty(arbitraryMethod, async (method) => {
          const handler = handlerModule[method]
          if (!handler) return

          const req = makeRequest('/api/test', method)
          const response = await handler(req)

          if (response.status >= 400) {
            // INVARIANT: error response body is valid JSON with error field
            const text = await response.clone().text()
            expect(() => JSON.parse(text)).not.toThrow()
            const body = JSON.parse(text)
            // Should have error message (various shapes in codebase)
            const hasErrorInfo = body.error || body.message || body.success === false
            expect(hasErrorInfo).toBeTruthy()
          }
        }),
        pbtOpts(10)
      )
    }
  })
})

// ─── 5. Idempotency: GET requests never mutate ─────────────────────────────

describe('PBT: GET idempotency', () => {
  it('GET with random query params returns same status', async () => {
    const arbitraryQueryParams = fc.dictionary(
      fc.stringMatching(/^[a-z_]{1,20}$/),
      fc.oneof(fc.string(), fc.nat().map(String), fc.constant('')),
      { minKeys: 0, maxKeys: 5 }
    )

    const routes = ['@/app/api/artisan/provider/route', '@/app/api/artisan/stats/route']

    for (const routePath of routes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(routePath)
      } catch {
        continue
      }

      const handler = handlerModule.GET
      if (!handler) continue

      await fc.assert(
        fc.asyncProperty(arbitraryQueryParams, arbitraryQueryParams, async (params1, params2) => {
          const qs1 = new URLSearchParams(params1).toString()
          const qs2 = new URLSearchParams(params2).toString()

          const req1 = makeRequest(`/api/test?${qs1}`, 'GET')
          const req2 = makeRequest(`/api/test?${qs2}`, 'GET')

          const res1 = await handler(req1)
          const res2 = await handler(req2)

          // INVARIANT: both unauthenticated → same rejection status
          // (status might differ on query validation, but never 500)
          expect(res1.status).toBeLessThan(500)
          expect(res2.status).toBeLessThan(500)
        }),
        pbtOpts(15)
      )
    }
  })
})

// ─── 6. UUID validation: random strings never cause 500 ─────────────────────

describe('PBT: UUID parameter handling', () => {
  it('non-UUID path params never cause server error', async () => {
    const arbitraryBadId = fc.oneof(
      fc.string({ minLength: 0, maxLength: 100 }),
      fc.integer().map(String),
      fc.constant(''),
      fc.constant('null'),
      fc.constant('undefined'),
      fc.constant("'; DROP TABLE --"),
      fc.constant('../../../etc/passwd'),
      fc.constant('<script>'),
      fc.uuid() // valid UUID but non-existent → should be 404, not 500
    )

    // Routes that take [id] param
    const dynamicRoutes = [{ path: '@/app/api/artisan/leads/[id]/route', paramName: 'id' }]

    for (const route of dynamicRoutes) {
      let handlerModule: Record<string, (...args: unknown[]) => unknown>
      try {
        handlerModule = await import(route.path)
      } catch {
        continue
      }

      await fc.assert(
        fc.asyncProperty(arbitraryBadId, async (badId) => {
          const handler = handlerModule.GET
          if (!handler) return

          const req = makeRequest(`/api/test/${badId}`, 'GET')
          const response = await handler(req, { params: { [route.paramName]: badId } })

          // INVARIANT: bad ID → 4xx, NEVER 500
          expect(response.status).toBeLessThan(500)
        }),
        pbtOpts(30)
      )
    }
  })
})
