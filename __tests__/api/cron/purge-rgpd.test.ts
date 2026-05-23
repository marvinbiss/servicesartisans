/**
 * Tests — /api/cron/purge-rgpd (Vague G2)
 *
 * Couvre les chemins critiques RGPD article 5.1.e :
 *   - Auth timing-safe (CRON_SECRET)
 *   - parseRetention bornes minimum + fallback sur invalide
 *   - audit_logs phase succès / failure → captureError + partial_failure
 *   - inactive_users phase succès / failure complet
 *   - isUserNotFoundError idempotence (status 404, code, message)
 *   - 100% fail rate detection → systemic Sentry alert
 *   - HTTP 500 si une phase a planté
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

vi.mock('@/lib/logger', () => ({
  logger: mockLoggerFns,
}))

const mockCaptureError = vi.fn()
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
}))

// `mockRpc` reste le spy que les tests configurent (.mockResolvedValueOnce)
// et sur lequel les assertions portent (purge_audit_logs / find_inactive_users).
// Le wrapper `rpc` ci-dessous intercepte les appels de lease anti-double-run
// (acquire_cron_lease / release_cron_lease) SANS consommer la file séquentielle
// de mockRpc, et rend chaque retour chaînable avec .abortSignal() (la route
// appelle .abortSignal(AbortSignal.timeout(...)) sur les RPC métier).
const mockRpc = vi.fn()
const mockDeleteUser = vi.fn()

// Convertit une valeur/Promise de résultat en builder PostgREST-like :
// chaînable via .abortSignal() ET directement awaitable.
function makeRpcBuilder(resultLike: unknown) {
  const builder: {
    abortSignal: (s: AbortSignal) => typeof builder
    then: (onF?: (v: unknown) => unknown, onR?: (e: unknown) => unknown) => Promise<unknown>
  } = {
    abortSignal: () => builder,
    then: (onF, onR) => Promise.resolve(resultLike).then(onF, onR),
  }
  return builder
}

const rpcWrapper = vi.fn((fn: string, args?: unknown) => {
  if (fn === 'acquire_cron_lease') return makeRpcBuilder({ data: true, error: null })
  if (fn === 'release_cron_lease') return makeRpcBuilder({ data: null, error: null })
  // RPC métier : on délègue au spy séquentiel (préserve mockResolvedValueOnce
  // + les assertions toHaveBeenCalledWith), puis on wrappe pour .abortSignal().
  return makeRpcBuilder(mockRpc(fn, args))
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    rpc: rpcWrapper,
    auth: { admin: { deleteUser: mockDeleteUser } },
  })),
}))

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/purge-rgpd', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/purge-rgpd/route')
  return mod.GET(req)
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  delete process.env.AUDIT_LOGS_RETENTION_DAYS
  delete process.env.INACTIVE_USERS_RETENTION_DAYS

  mockRpc.mockReset()
  mockDeleteUser.mockReset()
  mockCaptureError.mockReset()
  Object.values(mockLoggerFns).forEach((fn) => fn.mockReset())
})

afterEach(() => {
  vi.resetModules()
  delete process.env.CRON_SECRET
  delete process.env.AUDIT_LOGS_RETENTION_DAYS
  delete process.env.INACTIVE_USERS_RETENTION_DAYS
})

describe('GET /api/cron/purge-rgpd', () => {
  // ── Auth ────────────────────────────────────────────────────────────────
  describe('auth', () => {
    it('returns 401 when authorization header is missing', async () => {
      const res = await callRoute(buildRequest())
      expect(res.status).toBe(401)
      expect(mockRpc).not.toHaveBeenCalled()
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })

    it('returns 401 with wrong secret', async () => {
      const res = await callRoute(buildRequest('wrong-secret'))
      expect(res.status).toBe(401)
      expect(mockRpc).not.toHaveBeenCalled()
    })

    it('passes auth with correct CRON_SECRET', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null }) // purge_audit_logs
        .mockResolvedValueOnce({ data: [], error: null }) // find_inactive_users
      const res = await callRoute(buildRequest('test-cron-secret'))
      expect(res.status).toBe(200)
    })
  })

  // ── parseRetention ──────────────────────────────────────────────────────
  describe('parseRetention', () => {
    it('uses default 365 for audit_logs when env not set', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 5, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockRpc).toHaveBeenCalledWith('purge_audit_logs', { retention_days: 365 })
    })

    it('uses default 1095 for inactive_users when env not set', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockRpc).toHaveBeenCalledWith('find_inactive_users', { retention_days: 1095 })
    })

    it('respects custom retention via env when valid', async () => {
      process.env.AUDIT_LOGS_RETENTION_DAYS = '90'
      process.env.INACTIVE_USERS_RETENTION_DAYS = '730'
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockRpc).toHaveBeenCalledWith('purge_audit_logs', { retention_days: 90 })
      expect(mockRpc).toHaveBeenCalledWith('find_inactive_users', { retention_days: 730 })
    })

    it('falls back when env value is below minimum', async () => {
      process.env.AUDIT_LOGS_RETENTION_DAYS = '10' // < 30
      process.env.INACTIVE_USERS_RETENTION_DAYS = '100' // < 365
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockRpc).toHaveBeenCalledWith('purge_audit_logs', { retention_days: 365 })
      expect(mockRpc).toHaveBeenCalledWith('find_inactive_users', { retention_days: 1095 })
      expect(mockLoggerFns.warn).toHaveBeenCalled()
    })

    it('falls back when env value is not a number', async () => {
      process.env.AUDIT_LOGS_RETENTION_DAYS = 'abc'
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await callRoute(buildRequest('test-cron-secret'))
      expect(mockRpc).toHaveBeenCalledWith('purge_audit_logs', { retention_days: 365 })
    })
  })

  // ── audit_logs phase ────────────────────────────────────────────────────
  describe('audit_logs phase', () => {
    it('reports deleted count from RPC', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 42, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.audit_logs.deleted).toBe(42)
      expect(body.audit_logs.phase_failed).toBe(false)
    })

    it('marks phase_failed and calls Sentry on RPC error', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: null, error: { message: 'RPC down' } })
        .mockResolvedValueOnce({ data: [], error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.audit_logs.phase_failed).toBe(true)
      expect(body.partial_failure).toBe(true)
      expect(body.success).toBe(false)
      expect(res.status).toBe(500)
      expect(mockCaptureError).toHaveBeenCalled()
      const tags = mockCaptureError.mock.calls[0][1].tags
      expect(tags.step).toBe('audit_logs')
      expect(tags.business_impact).toBe('rgpd_compliance')
    })

    it('coerces non-number RPC return to 0', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: null, error: null }) // null data, no error
        .mockResolvedValueOnce({ data: [], error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.audit_logs.deleted).toBe(0)
      expect(body.audit_logs.phase_failed).toBe(false)
    })
  })

  // ── inactive_users phase ────────────────────────────────────────────────
  describe('inactive_users phase', () => {
    it('deletes all candidates returned by RPC', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }],
        error: null,
      })
      mockDeleteUser.mockResolvedValue({ error: null })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.deleted).toBe(3)
      expect(body.inactive_users.failed).toBe(0)
      expect(body.inactive_users.already_gone).toBe(0)
      expect(mockDeleteUser).toHaveBeenCalledTimes(3)
    })

    it('counts user_not_found as already_gone (idempotent)', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }],
        error: null,
      })
      // Première erreur via .status === 404, seconde via .code, troisième via message
      mockDeleteUser
        .mockResolvedValueOnce({ error: { status: 404, message: 'gone' } })
        .mockResolvedValueOnce({ error: { code: 'user_not_found', message: 'gone' } })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.deleted).toBe(0)
      expect(body.inactive_users.already_gone).toBe(2)
      expect(body.inactive_users.failed).toBe(0)
    })

    it('detects user_not_found via message regex fallback', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }],
        error: null,
      })
      mockDeleteUser.mockResolvedValueOnce({
        error: { status: 500, code: 'server_error', message: 'User not found in cache' },
      })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.already_gone).toBe(1)
      expect(body.inactive_users.failed).toBe(0)
    })

    it('continues loop on individual delete failure (not user_not_found)', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }],
        error: null,
      })
      mockDeleteUser
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'rate limit', status: 429 } })
        .mockResolvedValueOnce({ error: null })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.deleted).toBe(2)
      expect(body.inactive_users.failed).toBe(1)
      expect(body.inactive_users.errors).toHaveLength(1)
      expect(body.inactive_users.errors[0].id).toBe('u2')
    })

    it('marks systemic failure when 100% fail rate (G1-B6 / F-sexies)', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }],
        error: null,
      })
      // Tous échouent en non-idempotent (RLS bug typique)
      mockDeleteUser.mockResolvedValue({ error: { message: 'permission denied', status: 403 } })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.failed).toBe(2)
      expect(body.inactive_users.deleted).toBe(0)
      expect(body.inactive_users.phase_failed).toBe(true)
      expect(body.partial_failure).toBe(true)
      expect(res.status).toBe(500)
      // Sentry called twice : 1 fois par le catch outer? non — pas de throw.
      // Donc 1 fois pour systemic_failure.
      expect(mockCaptureError).toHaveBeenCalled()
      const systemicCall = mockCaptureError.mock.calls.find(
        (call) => call[1]?.tags?.step === 'inactive_users_systemic'
      )
      expect(systemicCall).toBeDefined()
    })

    it('does NOT mark systemic failure when all users were already_gone', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }],
        error: null,
      })
      mockDeleteUser.mockResolvedValue({ error: { status: 404, message: 'gone' } })

      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.already_gone).toBe(2)
      expect(body.inactive_users.failed).toBe(0)
      expect(body.inactive_users.phase_failed).toBe(false)
      expect(body.partial_failure).toBe(false)
      expect(res.status).toBe(200)
    })

    it('handles empty candidate list gracefully', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.deleted).toBe(0)
      expect(body.inactive_users.phase_failed).toBe(false)
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })

    it('marks phase_failed when find_inactive_users RPC errors', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'rpc fail' } })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.phase_failed).toBe(true)
      expect(body.partial_failure).toBe(true)
      expect(res.status).toBe(500)
      expect(mockCaptureError).toHaveBeenCalled()
    })
  })

  // ── Response shape ──────────────────────────────────────────────────────
  describe('response shape', () => {
    it('includes duration_ms', async () => {
      mockRpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(typeof body.duration_ms).toBe('number')
      expect(body.duration_ms).toBeGreaterThanOrEqual(0)
    })

    it('does not include errors array when no failures', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: [{ user_id: 'u1' }],
        error: null,
      })
      mockDeleteUser.mockResolvedValueOnce({ error: null })
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.errors).toBeUndefined()
    })

    it('caps errors array at 10 entries', async () => {
      mockRpc.mockResolvedValueOnce({ data: 0, error: null }).mockResolvedValueOnce({
        data: Array.from({ length: 15 }, (_, i) => ({ user_id: `u${i}` })),
        error: null,
      })
      // 1 succès pour éviter le systemic failure path et garder 14 errors
      mockDeleteUser.mockResolvedValueOnce({ error: null })
      // Les 14 autres en échec non-idempotent
      for (let i = 0; i < 14; i++) {
        mockDeleteUser.mockResolvedValueOnce({
          error: { message: `fail ${i}`, status: 500 },
        })
      }
      const res = await callRoute(buildRequest('test-cron-secret'))
      const body = await res.json()
      expect(body.inactive_users.failed).toBe(14)
      expect(body.inactive_users.deleted).toBe(1)
      expect(body.inactive_users.errors).toHaveLength(10)
    })
  })
})
