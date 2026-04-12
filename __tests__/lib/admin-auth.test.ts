/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { DEFAULT_PERMISSIONS } from '@/types/admin'
import type { AdminRole, AdminPermissions } from '@/types/admin'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock logger — must be before module import
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// Mock next/headers
const mockHeadersGet = vi.fn<(name: string) => string | null>().mockReturnValue(null)
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: (...args: [string]) => mockHeadersGet(...args) }),
  cookies: vi.fn(),
}))

// Mock supabase/server — createClient returns an object with auth.getUser()
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  }),
}))

// Mock supabase/admin — createAdminClient returns a chainable query builder
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSingle = vi.fn()
const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'audit_logs') {
        return { insert: mockInsert }
      }
      // profiles
      return { select: mockSelect }
    }),
  })),
}))

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are set up
// ---------------------------------------------------------------------------
import {
  verifyAdmin,
  hasPermission,
  requirePermission,
  logAdminAction,
  validateOrigin,
  type AdminUser,
} from '@/lib/admin-auth'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAdmin(role: AdminRole, overrides?: Partial<AdminUser>): AdminUser {
  return {
    id: 'user-123',
    email: 'admin@test.com',
    role,
    permissions: DEFAULT_PERMISSIONS[role],
    ...overrides,
  }
}

function setupAuthUser(user: { id: string; email?: string } | null, error: unknown = null) {
  mockGetUser.mockResolvedValue({
    data: { user },
    error,
  })
}

function setupProfile(
  profile: Record<string, unknown> | null,
  error: { message: string; code?: string } | null = null
) {
  mockSingle.mockResolvedValue({ data: profile, error })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no CSRF headers (safe for most tests)
  mockHeadersGet.mockReturnValue(null)
  // Reset env
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.NEXTAUTH_URL
})

// ========================== hasPermission ==================================

describe('hasPermission', () => {
  it('returns true when admin has the requested permission', () => {
    const admin = makeAdmin('super_admin')
    expect(hasPermission(admin, 'content', 'read')).toBe(true)
    expect(hasPermission(admin, 'content', 'write')).toBe(true)
    expect(hasPermission(admin, 'settings', 'write')).toBe(true)
  })

  it('returns false when admin lacks the requested permission', () => {
    const admin = makeAdmin('viewer')
    expect(hasPermission(admin, 'content', 'write')).toBe(false)
    expect(hasPermission(admin, 'settings', 'read')).toBe(false)
    expect(hasPermission(admin, 'audit', 'read')).toBe(false)
  })

  it('returns false for a non-existent resource', () => {
    const admin = makeAdmin('super_admin')
    // @ts-expect-error — testing invalid resource
    expect(hasPermission(admin, 'nonexistent', 'read')).toBe(false)
  })

  it('returns false for a non-existent action on a valid resource', () => {
    const admin = makeAdmin('super_admin')
    expect(hasPermission(admin, 'content', 'nuke')).toBe(false)
  })
})

// ======================== Role hierarchy ==================================

describe('role hierarchy — permission matrix', () => {
  const roles: AdminRole[] = ['super_admin', 'admin', 'moderator', 'viewer']

  it('super_admin has all permissions set to true', () => {
    const perms = DEFAULT_PERMISSIONS['super_admin']
    for (const resource of Object.keys(perms) as (keyof AdminPermissions)[]) {
      for (const [, val] of Object.entries(perms[resource])) {
        expect(val).toBe(true)
      }
    }
  })

  it('viewer can only read (no write/delete anywhere except some read=false)', () => {
    const perms = DEFAULT_PERMISSIONS['viewer']
    // Check that all write-like actions are false
    expect(perms.users.write).toBe(false)
    expect(perms.users.delete).toBe(false)
    expect(perms.providers.write).toBe(false)
    expect(perms.providers.verify).toBe(false)
    expect(perms.reviews.write).toBe(false)
    expect(perms.content.write).toBe(false)
    expect(perms.content.publish).toBe(false)
    expect(perms.settings.write).toBe(false)
    expect(perms.settings.read).toBe(false) // viewer cannot even read settings
  })

  it('moderator cannot access settings or audit', () => {
    const perms = DEFAULT_PERMISSIONS['moderator']
    expect(perms.settings.read).toBe(false)
    expect(perms.settings.write).toBe(false)
    expect(perms.audit.read).toBe(false)
  })

  it('admin cannot delete users or providers', () => {
    const perms = DEFAULT_PERMISSIONS['admin']
    expect(perms.users.delete).toBe(false)
    expect(perms.providers.delete).toBe(false)
  })

  it('each role has permissions for every resource', () => {
    for (const role of roles) {
      const perms = DEFAULT_PERMISSIONS[role]
      expect(perms.users).toBeDefined()
      expect(perms.providers).toBeDefined()
      expect(perms.reviews).toBeDefined()
      expect(perms.payments).toBeDefined()
      expect(perms.services).toBeDefined()
      expect(perms.settings).toBeDefined()
      expect(perms.audit).toBeDefined()
      expect(perms.content).toBeDefined()
      expect(perms.prospection).toBeDefined()
    }
  })

  it('content read/write: super_admin and admin can write, moderator can write, viewer cannot', () => {
    expect(DEFAULT_PERMISSIONS.super_admin.content.write).toBe(true)
    expect(DEFAULT_PERMISSIONS.admin.content.write).toBe(true)
    expect(DEFAULT_PERMISSIONS.moderator.content.write).toBe(true)
    expect(DEFAULT_PERMISSIONS.viewer.content.write).toBe(false)
  })

  it('audit read: only super_admin and admin can read audit logs', () => {
    expect(DEFAULT_PERMISSIONS.super_admin.audit.read).toBe(true)
    expect(DEFAULT_PERMISSIONS.admin.audit.read).toBe(true)
    expect(DEFAULT_PERMISSIONS.moderator.audit.read).toBe(false)
    expect(DEFAULT_PERMISSIONS.viewer.audit.read).toBe(false)
  })

  it('settings write: only super_admin can write settings', () => {
    expect(DEFAULT_PERMISSIONS.super_admin.settings.write).toBe(true)
    expect(DEFAULT_PERMISSIONS.admin.settings.write).toBe(false)
    expect(DEFAULT_PERMISSIONS.moderator.settings.write).toBe(false)
    expect(DEFAULT_PERMISSIONS.viewer.settings.write).toBe(false)
  })
})

// ========================== verifyAdmin ===================================

describe('verifyAdmin', () => {
  it('returns 401 when no session (getUser returns null)', async () => {
    setupAuthUser(null)

    const result = await verifyAdmin()
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(NextResponse)

    const body = await result.error!.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
    expect(result.error!.status).toBe(401)
  })

  it('returns 401 when getUser returns an error', async () => {
    setupAuthUser(null, { message: 'session expired' })

    const result = await verifyAdmin()
    expect(result.success).toBe(false)
    expect(result.error!.status).toBe(401)
  })

  it('returns 403 when user exists but is not admin', async () => {
    setupAuthUser({ id: 'user-1', email: 'regular@test.com' })
    setupProfile({ is_admin: false, role: null })

    const result = await verifyAdmin()
    expect(result.success).toBe(false)

    const body = await result.error!.json()
    expect(body.error.code).toBe('FORBIDDEN')
    expect(result.error!.status).toBe(403)
  })

  it('returns success for user with is_admin=true and role', async () => {
    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    setupProfile({ is_admin: true, role: 'admin' })

    const result = await verifyAdmin()
    expect(result.success).toBe(true)
    expect(result.admin).toBeDefined()
    expect(result.admin!.role).toBe('admin')
    expect(result.admin!.email).toBe('admin@test.com')
  })

  it('grants super_admin role when is_admin=true but no role column', async () => {
    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    setupProfile({ is_admin: true, role: null })

    const result = await verifyAdmin()
    expect(result.success).toBe(true)
    expect(result.admin!.role).toBe('super_admin')
  })

  it('returns 503 when profile query fails entirely', async () => {
    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    // First combined query fails (not column error), so profileError is set
    setupProfile(null, { message: 'connection refused' })

    const result = await verifyAdmin()
    expect(result.success).toBe(false)

    const body = await result.error!.json()
    expect(body.error.code).toBe('PROFILE_ACCESS_ERROR')
    expect(result.error!.status).toBe(503)
  })

  it('falls back to is_admin-only query when role column does not exist', async () => {
    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    // First call: column error
    // Second call: fallback succeeds
    mockSingle
      .mockResolvedValueOnce({ data: null, error: { message: 'column "role" does not exist' } })
      .mockResolvedValueOnce({ data: { is_admin: true }, error: null })

    const result = await verifyAdmin()
    expect(result.success).toBe(true)
    expect(result.admin!.role).toBe('super_admin')
  })

  it('returns success with permissions matching the role', async () => {
    setupAuthUser({ id: 'user-1', email: 'mod@test.com' })
    setupProfile({ is_admin: true, role: 'moderator' })

    const result = await verifyAdmin()
    expect(result.success).toBe(true)
    expect(result.admin!.permissions).toEqual(DEFAULT_PERMISSIONS['moderator'])
  })

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('network crash'))

    const result = await verifyAdmin()
    expect(result.success).toBe(false)
    expect(result.error!.status).toBe(500)

    const body = await result.error!.json()
    expect(body.error.code).toBe('AUTH_ERROR')
  })

  it('handles user with email but missing profile gracefully (profile=null, no error)', async () => {
    setupAuthUser({ id: 'user-1', email: 'ghost@test.com' })
    // profile query returns null data but no error — combinedError is truthy as single() on no rows
    setupProfile(null, { message: 'No rows found', code: 'PGRST116' })

    const result = await verifyAdmin()
    expect(result.success).toBe(false)
    // Profile error → 503
    expect(result.error!.status).toBe(503)
  })
})

// ====================== requirePermission =================================

describe('requirePermission', () => {
  it('returns success for admin with correct permission', async () => {
    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    setupProfile({ is_admin: true, role: 'super_admin' })

    const result = await requirePermission('content', 'write')
    expect(result.success).toBe(true)
    expect(result.admin).toBeDefined()
    expect(result.admin!.role).toBe('super_admin')
  })

  it('returns 403 for admin without the needed permission', async () => {
    setupAuthUser({ id: 'user-1', email: 'viewer@test.com' })
    setupProfile({ is_admin: true, role: 'viewer' })

    const result = await requirePermission('content', 'write')
    expect(result.success).toBe(false)

    const body = await result.error!.json()
    expect(body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    expect(result.error!.status).toBe(403)
  })

  it('returns 401 when no session', async () => {
    setupAuthUser(null)

    const result = await requirePermission('content', 'read')
    expect(result.success).toBe(false)
    expect(result.error!.status).toBe(401)
  })

  it('returns 403 for non-admin user', async () => {
    setupAuthUser({ id: 'user-1', email: 'regular@test.com' })
    setupProfile({ is_admin: false, role: null })

    const result = await requirePermission('users', 'read')
    expect(result.success).toBe(false)
    expect(result.error!.status).toBe(403)
  })

  it('blocks cross-site CSRF requests via sec-fetch-site header', async () => {
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'sec-fetch-site') return 'cross-site'
      return null
    })

    const result = await requirePermission('content', 'read')
    expect(result.success).toBe(false)

    const body = await result.error!.json()
    expect(body.error.code).toBe('CSRF_REJECTED')
    expect(result.error!.status).toBe(403)
  })

  it('blocks requests with mismatched origin', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'https://evil.com'
      return null
    })

    const result = await requirePermission('content', 'read')
    expect(result.success).toBe(false)

    const body = await result.error!.json()
    expect(body.error.code).toBe('CSRF_REJECTED')
  })

  it('allows requests with matching origin', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'https://servicesartisans.fr'
      return null
    })

    setupAuthUser({ id: 'user-1', email: 'admin@test.com' })
    setupProfile({ is_admin: true, role: 'admin' })

    const result = await requirePermission('content', 'read')
    expect(result.success).toBe(true)
  })

  it('moderator can read content but not publish', async () => {
    setupAuthUser({ id: 'user-1', email: 'mod@test.com' })
    setupProfile({ is_admin: true, role: 'moderator' })

    const readResult = await requirePermission('content', 'read')
    expect(readResult.success).toBe(true)

    const publishResult = await requirePermission('content', 'publish')
    expect(publishResult.success).toBe(false)
  })

  it('viewer can read users but not write', async () => {
    setupAuthUser({ id: 'user-1', email: 'viewer@test.com' })
    setupProfile({ is_admin: true, role: 'viewer' })

    const readResult = await requirePermission('users', 'read')
    expect(readResult.success).toBe(true)

    const writeResult = await requirePermission('users', 'write')
    expect(writeResult.success).toBe(false)
  })
})

// ======================= logAdminAction ====================================

describe('logAdminAction', () => {
  it('inserts an audit log record', async () => {
    await logAdminAction('admin-1', 'update', 'provider', 'prov-42', { name: 'new name' })

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'admin-1',
      action: 'update',
      resource_type: 'provider',
      resource_id: 'prov-42',
      new_value: { name: 'new name' },
    })
  })

  it('uses empty object when no details provided', async () => {
    await logAdminAction('admin-1', 'delete', 'review', 'rev-5')

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'admin-1',
      action: 'delete',
      resource_type: 'review',
      resource_id: 'rev-5',
      new_value: {},
    })
  })

  it('does not throw when DB insert fails', async () => {
    mockInsert.mockRejectedValueOnce(new Error('DB down'))

    // Should not throw
    await expect(logAdminAction('admin-1', 'create', 'user', 'u-1')).resolves.toBeUndefined()
  })

  it('logs error when DB insert fails', async () => {
    const { logger } = await import('@/lib/logger')
    mockInsert.mockRejectedValueOnce(new Error('DB down'))

    await logAdminAction('admin-1', 'create', 'user', 'u-1')

    expect(logger.error).toHaveBeenCalledWith('Audit log error', expect.any(Error))
  })
})

// ======================= validateOrigin ====================================

describe('validateOrigin', () => {
  function makeRequest(headers: Record<string, string> = {}): import('next/server').NextRequest {
    const req = new Request('https://servicesartisans.fr/api/test', { headers })
    return req as unknown as import('next/server').NextRequest
  }

  it('returns true when no origin header present', () => {
    expect(validateOrigin(makeRequest())).toBe(true)
  })

  it('returns false when sec-fetch-site is cross-site', () => {
    expect(validateOrigin(makeRequest({ 'sec-fetch-site': 'cross-site' }))).toBe(false)
  })

  it('returns true when no allowed URLs configured (dev mode)', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXTAUTH_URL
    expect(validateOrigin(makeRequest({ origin: 'https://localhost:3000' }))).toBe(true)
  })

  it('returns true when origin matches NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    expect(validateOrigin(makeRequest({ origin: 'https://servicesartisans.fr' }))).toBe(true)
  })

  it('returns false when origin does not match', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    expect(validateOrigin(makeRequest({ origin: 'https://evil.com' }))).toBe(false)
  })

  it('returns false for malformed origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    expect(validateOrigin(makeRequest({ origin: 'not-a-url' }))).toBe(false)
  })

  it('checks referer header as fallback', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr'
    expect(validateOrigin(makeRequest({ referer: 'https://servicesartisans.fr/admin' }))).toBe(true)
  })
})
