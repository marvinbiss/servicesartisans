/**
 * Tests unitaires pour requireArtisan() — guard auth des routes /api/artisan/**.
 *
 * Couvre la matrice de contrôle d'accès (parité avec le middleware) :
 *   - non authentifié           → 401
 *   - role !== 'artisan'        → 403
 *   - 2FA activé + pas de cookie → 403 (code two_factor_required) [BYPASS pré-challenge]
 *   - 2FA activé + cookie KO     → 403 (fail-closed sur erreur de lecture)
 *   - 2FA activé + cookie OK     → pass
 *   - 2FA désactivé             → pas de check cookie
 *   - pas de provider lié        → 403
 *   - happy path                → user + provider
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-123' }

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const cookieGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: cookieGet, set: vi.fn() })),
}))

const readVerifiedCookie = vi.fn()
vi.mock('@/lib/auth/two-factor-cookies', () => ({
  VERIFIED_COOKIE_NAME: 'sa_2fa_verified',
  readVerifiedCookie: (...args: unknown[]) => readVerifiedCookie(...args),
}))

import { createClient } from '@/lib/supabase/server'

type Profile = { role: string; two_factor_enabled?: boolean } | null
type ProviderRow = { id: string } | null

function buildSupabase(opts: {
  user?: { id: string } | null
  profile?: Profile
  provider?: ProviderRow
}) {
  const { user = mockUser, profile = { role: 'artisan' }, provider = { id: 'prov-1' } } = opts
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }
      }
      // providers
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: provider, error: null }),
      }
    }),
  }
}

describe('requireArtisan()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    cookieGet.mockReturnValue(undefined)
    readVerifiedCookie.mockResolvedValue(null)
  })

  it('renvoie 401 si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ user: null }) as never)
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(401)
    expect(res.user).toBeNull()
  })

  it("renvoie 403 si le role n'est pas artisan", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ profile: { role: 'client' } }) as never
    )
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(403)
  })

  it('renvoie 403 si profil absent', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ profile: null }) as never)
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(403)
  })

  it('BYPASS pré-challenge : 2FA activé sans cookie verified → 403 two_factor_required', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ profile: { role: 'artisan', two_factor_enabled: true } }) as never
    )
    readVerifiedCookie.mockResolvedValue(null)
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(403)
    const body = await res.error?.json()
    expect(body.code).toBe('two_factor_required')
  })

  it('fail-closed : 2FA activé + lecture cookie throw → 403', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ profile: { role: 'artisan', two_factor_enabled: true } }) as never
    )
    readVerifiedCookie.mockRejectedValue(new Error('cookie secret missing'))
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(403)
  })

  it('2FA activé + cookie verified valide → pass', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ profile: { role: 'artisan', two_factor_enabled: true } }) as never
    )
    cookieGet.mockReturnValue({ value: 'signed.token' })
    readVerifiedCookie.mockResolvedValue({ userId: 'user-123', exp: Date.now() + 1_000_000 })
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error).toBeNull()
    expect(res.user?.id).toBe('user-123')
    expect(res.provider?.id).toBe('prov-1')
  })

  it('2FA désactivé : aucun check cookie, pass direct', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ profile: { role: 'artisan', two_factor_enabled: false } }) as never
    )
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error).toBeNull()
    expect(readVerifiedCookie).not.toHaveBeenCalled()
  })

  it('renvoie 403 si aucun provider actif lié', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ provider: null }) as never)
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error?.status).toBe(403)
    const body = await res.error?.json()
    expect(body.error).toContain('incomplet')
  })

  it('happy path : artisan sans 2FA + provider → user + provider', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({}) as never)
    const { requireArtisan } = await import('@/lib/auth/artisan-guard')
    const res = await requireArtisan()
    expect(res.error).toBeNull()
    expect(res.user?.id).toBe('user-123')
    expect(res.provider?.id).toBe('prov-1')
  })
})

describe('assertArtisanTwoFactor() — helper pour routes en auth manuelle (provider PUT)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    cookieGet.mockReturnValue(undefined)
    readVerifiedCookie.mockResolvedValue(null)
  })

  it('2FA désactivée → null (accès autorisé), sans lecture cookie', async () => {
    const { assertArtisanTwoFactor } = await import('@/lib/auth/artisan-guard')
    expect(await assertArtisanTwoFactor(false, 'user-123')).toBeNull()
    expect(await assertArtisanTwoFactor(null, 'user-123')).toBeNull()
    expect(await assertArtisanTwoFactor(undefined, 'user-123')).toBeNull()
    expect(readVerifiedCookie).not.toHaveBeenCalled()
  })

  it('2FA activée sans cookie valide → 403 two_factor_required', async () => {
    readVerifiedCookie.mockResolvedValue(null)
    const { assertArtisanTwoFactor } = await import('@/lib/auth/artisan-guard')
    const res = await assertArtisanTwoFactor(true, 'user-123')
    expect(res?.status).toBe(403)
    const body = await res?.json()
    expect(body.code).toBe('two_factor_required')
  })

  it('2FA activée + cookie valide → null', async () => {
    cookieGet.mockReturnValue({ value: 'signed.token' })
    readVerifiedCookie.mockResolvedValue({ userId: 'user-123', exp: Date.now() + 1_000_000 })
    const { assertArtisanTwoFactor } = await import('@/lib/auth/artisan-guard')
    expect(await assertArtisanTwoFactor(true, 'user-123')).toBeNull()
  })

  it('fail-closed : lecture cookie throw → 403', async () => {
    readVerifiedCookie.mockRejectedValue(new Error('secret missing'))
    const { assertArtisanTwoFactor } = await import('@/lib/auth/artisan-guard')
    const res = await assertArtisanTwoFactor(true, 'user-123')
    expect(res?.status).toBe(403)
  })
})
