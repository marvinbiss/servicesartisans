/**
 * Tests P7 — RGPD : signed-token + logique du cron anonymize + endpoint delete
 *
 * Scope :
 *  - signToken/verifyToken roundtrip
 *  - verifyToken rejette tokens expirés, invalides, cross-publicId
 *  - verifyToken utilise timingSafeEqual (longueurs différentes → false sans exception)
 *  - cron règles 1/2/3 : sélection correcte des rows (mock Supabase)
 *  - delete endpoint : rejette si email != stored
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { signToken, verifyToken } from '@/lib/simulateur/rgpd/signed-token'

const ORIGINAL_SECRET = process.env.RGPD_EXPORT_SECRET

describe('signed-token', () => {
  beforeEach(() => {
    process.env.RGPD_EXPORT_SECRET = 'test-secret-rgpd-export-2026-long-enough'
  })

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) delete process.env.RGPD_EXPORT_SECRET
    else process.env.RGPD_EXPORT_SECRET = ORIGINAL_SECRET
    vi.useRealTimers()
  })

  it('signe et vérifie un token (roundtrip)', () => {
    const publicId = 'EST-2026-04-14-abc123'
    const token = signToken(publicId, 3600)
    expect(token).toMatch(/^\d+\.[0-9a-f]{64}$/)
    expect(verifyToken(publicId, token)).toBe(true)
  })

  it('rejette un token expiré', () => {
    const publicId = 'EST-2026-04-14-abc123'
    const token = signToken(publicId, 1)
    // Avance le temps de 2s
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 2_000)
    expect(verifyToken(publicId, token)).toBe(false)
  })

  it('rejette un token signé pour un autre publicId', () => {
    const token = signToken('EST-2026-04-14-aaaaaa', 3600)
    expect(verifyToken('EST-2026-04-14-bbbbbb', token)).toBe(false)
  })

  it('rejette un token aux signatures altérées (constant-time safe)', () => {
    const publicId = 'EST-2026-04-14-abc123'
    const token = signToken(publicId, 3600)
    const [exp, sig] = token.split('.')
    // Flip un caractère
    const flipped = sig[0] === '0' ? '1' + sig.slice(1) : '0' + sig.slice(1)
    expect(verifyToken(publicId, `${exp}.${flipped}`)).toBe(false)
  })

  it('rejette un token aux longueurs invalides sans throw (timingSafeEqual safe)', () => {
    const publicId = 'EST-2026-04-14-abc123'
    // Signature trop courte
    expect(verifyToken(publicId, '9999999999.deadbeef')).toBe(false)
    // Pas de dot
    expect(verifyToken(publicId, 'sansdot')).toBe(false)
    // Token vide
    expect(verifyToken(publicId, '')).toBe(false)
    // Expire non numérique
    expect(verifyToken(publicId, 'abc.def')).toBe(false)
  })

  it('rejette si publicId ou token manquants', () => {
    expect(verifyToken('', 'x.y')).toBe(false)
    // @ts-expect-error defensive
    expect(verifyToken(null, 'x.y')).toBe(false)
  })

  it('signToken throw si publicId vide ou ttl négatif', () => {
    expect(() => signToken('', 3600)).toThrow()
    expect(() => signToken('EST-2026-04-14-abc123', 0)).toThrow()
    expect(() => signToken('EST-2026-04-14-abc123', -1)).toThrow()
  })

  it('deux tokens signés à des instants différents sont distincts', () => {
    const publicId = 'EST-2026-04-14-abc123'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'))
    const t1 = signToken(publicId, 3600)
    vi.setSystemTime(new Date('2026-04-14T10:00:05Z'))
    const t2 = signToken(publicId, 3600)
    expect(t1).not.toBe(t2)
    expect(verifyToken(publicId, t1)).toBe(true)
    expect(verifyToken(publicId, t2)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Cron rgpd-anonymize — logique de sélection (mock Supabase)
// ---------------------------------------------------------------------------

type MockRow = { id: string; created_at: string }

function makeSupabaseStub(selectRows: MockRow[]) {
  // Chaque `from()` crée un nouveau chain. Un chain a 2 modes :
  //   - SELECT path : .select().lt().is().not().limit() → { data, error }
  //   - UPDATE path : .update().in() → awaitable → { error: null }
  // Pour éviter l'état global, on crée un chain par appel `from()`.
  // Stratégie simple : le 1er `from()` de chaque règle sert le SELECT avec rows,
  // les suivants (UPDATE ou SELECT de boucle) retournent vide / ok.
  // Chaque règle fait : SELECT(rows) → UPDATE. selectRows.length < BATCH_SIZE
  // → le cron break dès la 1re itération. Chaque règle appelle limit() une
  // seule fois, donc on peut toujours retourner `selectRows`.

  type Chain = {
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    lt: ReturnType<typeof vi.fn>
    is: ReturnType<typeof vi.fn>
    not: ReturnType<typeof vi.fn>
    in: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
  }

  function buildChain(): Chain {
    let isUpdate = false
    const chain: Chain = {
      select: vi.fn().mockReturnThis(),
      update: vi.fn(() => {
        isUpdate = true
        return chain
      }),
      lt: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      in: vi.fn(() => {
        if (isUpdate) return Promise.resolve({ error: null })
        return Promise.resolve({ data: [], error: null })
      }),
      limit: vi.fn(() => Promise.resolve({ data: selectRows, error: null })),
    }
    return chain
  }

  const client = {
    from: vi.fn(() => buildChain()),
    rpc: vi.fn((fn: string) => {
      const result =
        fn === 'acquire_cron_lease' ? { data: true, error: null } : { data: null, error: null }
      const builder: {
        abortSignal: (s: AbortSignal) => typeof builder
        then: Promise<typeof result>['then']
      } = {
        abortSignal: () => builder,
        then: (onF, onR) => Promise.resolve(result).then(onF, onR),
      }
      return builder
    }),
  }

  return { client }
}

describe('cron rgpd-anonymize — logique règles', () => {
  const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET
  const ORIGINAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ORIGINAL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key'
    vi.resetModules()
  })

  afterEach(() => {
    if (ORIGINAL_CRON_SECRET === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = ORIGINAL_CRON_SECRET
    if (ORIGINAL_URL === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_URL
    if (ORIGINAL_KEY === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = ORIGINAL_KEY
    vi.restoreAllMocks()
  })

  it('rejette les requêtes sans CRON_SECRET valide', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => ({ from: () => ({}) }),
    }))
    const mod = await import('@/app/api/cron/rgpd-anonymize/route')
    const res = await mod.GET(
      new Request('https://x/api/cron/rgpd-anonymize', {
        headers: { authorization: 'Bearer wrong' },
      })
    )
    expect(res.status).toBe(401)
  })

  it('applique les 3 règles et retourne les compteurs', async () => {
    const stub = makeSupabaseStub([
      { id: 'row-1', created_at: '2020-01-01T00:00:00Z' },
      { id: 'row-2', created_at: '2020-01-01T00:00:00Z' },
    ])
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => stub.client,
    }))

    const mod = await import('@/app/api/cron/rgpd-anonymize/route')
    const res = await mod.GET(
      new Request('https://x/api/cron/rgpd-anonymize', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok: boolean
      rule1_rfr_nulled: number
      rule2_coords_anonymized: number
      rule3_ip_hash_nulled: number
    }
    expect(body.ok).toBe(true)
    // Chaque règle consomme un batch de 2 rows fake
    expect(body.rule1_rfr_nulled).toBe(2)
    expect(body.rule2_coords_anonymized).toBe(2)
    expect(body.rule3_ip_hash_nulled).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// DELETE endpoint — email mismatch
// ---------------------------------------------------------------------------

describe('POST /api/rgpd/delete/[publicId]', () => {
  const ORIGINAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ORIGINAL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key'
    vi.resetModules()
  })

  afterEach(() => {
    if (ORIGINAL_URL === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_URL
    if (ORIGINAL_KEY === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = ORIGINAL_KEY
    vi.restoreAllMocks()
  })

  function buildSupabaseMock(row: Record<string, unknown> | null, updateError: unknown = null) {
    type Resolve = (value: { error: unknown }) => void
    type Chain = {
      select: ReturnType<typeof vi.fn>
      eq: ReturnType<typeof vi.fn>
      maybeSingle: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
      then: (resolve: Resolve) => void
    }
    const chain: Chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve({ data: row, error: null })),
      update: vi.fn(() => chain),
      // Permet `await supabase.from(...).update(...).eq(...)` → { error }
      then: (resolve: Resolve) => resolve({ error: updateError }),
    }
    return { from: vi.fn(() => chain) }
  }

  it('rejette body invalide (400)', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => buildSupabaseMock({ id: 'x', email: 'a@b.c', deleted_at: null }),
    }))
    const mod = await import('@/app/api/rgpd/delete/[publicId]/route')
    const req = new Request('https://x/api/rgpd/delete/EST-2026-04-14-abc123', {
      method: 'POST',
      body: JSON.stringify({ email: 'nope' }),
      headers: { 'content-type': 'application/json' },
    })
    // Next.js NextRequest-like wrapper accepts plain Request in tests
    const res = await mod.POST(req as unknown as Parameters<typeof mod.POST>[0], {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect(res.status).toBe(400)
  })

  it('rejette publicId malformé (400)', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => buildSupabaseMock(null),
    }))
    const mod = await import('@/app/api/rgpd/delete/[publicId]/route')
    const req = new Request('https://x/api/rgpd/delete/notvalid', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.c', confirmation: 'SUPPRIMER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await mod.POST(req as unknown as Parameters<typeof mod.POST>[0], {
      params: Promise.resolve({ publicId: 'notvalid' }),
    })
    expect(res.status).toBe(400)
  })

  it('rejette quand email ne matche pas (403)', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () =>
        buildSupabaseMock({ id: 'row-1', email: 'stored@example.com', deleted_at: null }),
    }))
    const mod = await import('@/app/api/rgpd/delete/[publicId]/route')
    const req = new Request('https://x/api/rgpd/delete/EST-2026-04-14-abc123', {
      method: 'POST',
      body: JSON.stringify({ email: 'other@example.com', confirmation: 'SUPPRIMER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await mod.POST(req as unknown as Parameters<typeof mod.POST>[0], {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect(res.status).toBe(403)
  })

  it('retourne 404 si estimation introuvable', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => buildSupabaseMock(null),
    }))
    const mod = await import('@/app/api/rgpd/delete/[publicId]/route')
    const req = new Request('https://x/api/rgpd/delete/EST-2026-04-14-abc123', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', confirmation: 'SUPPRIMER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await mod.POST(req as unknown as Parameters<typeof mod.POST>[0], {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect(res.status).toBe(404)
  })

  it('retourne alreadyDeleted si deleted_at déjà set', async () => {
    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () =>
        buildSupabaseMock({
          id: 'row-1',
          email: 'user@example.com',
          deleted_at: '2026-01-01T00:00:00Z',
        }),
    }))
    const mod = await import('@/app/api/rgpd/delete/[publicId]/route')
    const req = new Request('https://x/api/rgpd/delete/EST-2026-04-14-abc123', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', confirmation: 'SUPPRIMER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await mod.POST(req as unknown as Parameters<typeof mod.POST>[0], {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.alreadyDeleted).toBe(true)
  })
})
