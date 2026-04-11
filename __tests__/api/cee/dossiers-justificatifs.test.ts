/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Tests — POST /api/cee/dossiers/[id]/justificatifs
 *
 * Couvre :
 *   - 401 si session absente
 *   - 404 si dossier inexistant
 *   - 403 si dossier appartient à un autre artisan
 *   - 400 si le fichier est manquant
 *   - 201 si upload réussi (mock uploadJustificatif)
 *   - 400 si uploadJustificatif renvoie { ok:false }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks — en premier, avant tout import du module testé
// ============================================================================

const mockJsonFn = vi.fn((body: unknown, init?: { status?: number }) => ({
  body,
  status: init?.status ?? 200,
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Supabase client mock — chaînable, capture explicite du nom de table, des
// `.select(...)` et `.eq(...)`. Supporte le fix B3 qui passe à une query
// unique `cee_dossiers + providers!inner(user_id)`.
type MockDossierJoinRow = {
  id: string
  provider_id: string
  status: string
  operation_code: string
  providers: { user_id: string | null }
} | null

// Ce qui sera retourné par le `.maybeSingle()` de la query cee_dossiers.
let mockDossierJoinRow: MockDossierJoinRow = null
let mockDossierJoinError: { message: string } | null = null

// Historique : chaque call `.from(table)` est capturé en ordre.
const fromCalls: string[] = []
// Historique : par call, on capture la chaîne (select, eq, maybeSingle).
type CallTrace = {
  table: string
  select: string | null
  eqs: Array<{ col: string; val: unknown }>
}
const callTraces: CallTrace[] = []

function makeDossierBuilder(table: string) {
  const trace: CallTrace = { table, select: null, eqs: [] }
  callTraces.push(trace)
  const builder: Record<string, unknown> = {
    select(cols: string) {
      trace.select = cols
      return builder
    },
    eq(col: string, val: unknown) {
      trace.eqs.push({ col, val })
      return builder
    },
    maybeSingle: async () => ({
      data: mockDossierJoinRow,
      error: mockDossierJoinError,
    }),
  }
  return builder
}

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn((table: string) => {
    fromCalls.push(table)
    return makeDossierBuilder(table)
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

// uploadJustificatif + constantes
const mockUploadJustificatif = vi.fn()
vi.mock('@/lib/cee/justificatifs', async () => {
  return {
    uploadJustificatif: (...args: unknown[]) => mockUploadJustificatif(...args),
    ALLOWED_MIME_TYPES: new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/pdf',
    ]),
    MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024,
  }
})

// ============================================================================
// Helpers
// ============================================================================

const DOSSIER_ID = '550e8400-e29b-41d4-a716-446655440000'
const PROVIDER_ID = '660e8400-e29b-41d4-a716-446655440000'
const USER_ID = '770e8400-e29b-41d4-a716-446655440000'
const OTHER_USER_ID = '880e8400-e29b-41d4-a716-446655440000'

type MockResult = { body: Record<string, unknown>; status: number }

/**
 * Crée un pseudo-Request avec une méthode `formData()` qui résout directement
 * une FormData construite manuellement. On n'utilise PAS `new Request({ body: fd })`
 * car jsdom parse lentement / pas du tout les File multipart dans ce mode.
 */
function makeFormDataRequest(fields: Record<string, string | File>): Request {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v)
  }
  const fakeReq = {
    formData: async () => fd,
    method: 'POST',
    url: `http://localhost/api/cee/dossiers/${DOSSIER_ID}/justificatifs`,
    headers: new Headers(),
  }
  return fakeReq as unknown as Request
}

/**
 * jsdom ne polyfill pas `File.prototype.arrayBuffer()` — on le patch à la
 * volée pour passer les validations du handler (`new Uint8Array(await f.arrayBuffer())`).
 * Le `instanceof File` reste vrai (on part du constructeur natif).
 */
function makeJpeg(size: number = 1024): File {
  const bytes = new Uint8Array(size)
  bytes[0] = 0xff
  bytes[1] = 0xd8
  bytes[2] = 0xff
  const file = new File([bytes], 'photo.jpg', { type: 'image/jpeg' })
  if (typeof (file as unknown as { arrayBuffer?: unknown }).arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer.slice(0),
      writable: true,
      configurable: true,
    })
  }
  return file
}

function makeContext() {
  return { params: Promise.resolve({ id: DOSSIER_ID }) }
}

// (makeDossier supprimé — le fix B3 utilise un join unique, plus de
// getCeeDossierById séparé.)

// ============================================================================
// Setup
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
  mockDossierJoinRow = null
  mockDossierJoinError = null
  fromCalls.length = 0
  callTraces.length = 0
})

// Helper : construit la réponse du join cee_dossiers + providers!inner
function makeJoinRow(userId: string | null): MockDossierJoinRow {
  return {
    id: DOSSIER_ID,
    provider_id: PROVIDER_ID,
    status: 'engagement_signe',
    operation_code: 'BAR-TH-104',
    providers: { user_id: userId },
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('POST /api/cee/dossiers/[id]/justificatifs — auth', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ file: makeJpeg(), code: 'photos_apres_travaux', label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ ok: false, error: 'unauthorized' })
    expect(mockUploadJustificatif).not.toHaveBeenCalled()
  })

  it('returns 404 when the dossier does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: USER_ID } },
      error: null,
    })
    // Le join `providers!inner` avec filtre user_id ne matche pas → null.
    mockDossierJoinRow = null

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ file: makeJpeg(), code: 'photos_apres_travaux', label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ ok: false, error: 'not_found' })
    expect(mockUploadJustificatif).not.toHaveBeenCalled()
  })

  it('returns 404 when the dossier belongs to a different artisan (masque existence)', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: USER_ID } },
      error: null,
    })
    // Query filtrée sur `providers.user_id = USER_ID` : si le vrai owner
    // est OTHER_USER_ID, le join inner ne matche pas → null → 404.
    mockDossierJoinRow = null

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ file: makeJpeg(), code: 'photos_apres_travaux', label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ ok: false, error: 'not_found' })
    expect(mockUploadJustificatif).not.toHaveBeenCalled()
    // Vérifie que le filtre providers.user_id = user authentifié est bien appliqué.
    const dossiersCall = callTraces.find((c) => c.table === 'cee_dossiers')
    expect(dossiersCall).toBeDefined()
    expect(dossiersCall!.eqs.some((e) => e.col === 'providers.user_id' && e.val === USER_ID)).toBe(
      true
    )
  })
})

// Imports silencieux côté TS (variables référencées dans tests existants) — gardés.
void OTHER_USER_ID

describe('POST /api/cee/dossiers/[id]/justificatifs — body validation', () => {
  beforeEach(() => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    mockDossierJoinRow = makeJoinRow(USER_ID)
  })

  it('returns 400 when file field is missing', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ code: 'photos_apres_travaux', label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ ok: false, error: 'invalid_file' })
    expect(mockUploadJustificatif).not.toHaveBeenCalled()
  })

  it('returns 400 when code field is missing', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ file: makeJpeg(), label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ ok: false, error: 'invalid_input' })
  })

  it('returns 415 when file has a rejected MIME type', async () => {
    const badFile = new File([new Uint8Array([0x00])], 'virus.exe', {
      type: 'application/x-msdownload',
    })

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({ file: badFile, code: 'photos_apres_travaux', label: 'Photos' }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(415)
    expect(res.body).toMatchObject({ ok: false, error: 'mime_type_rejected' })
  })
})

describe('POST /api/cee/dossiers/[id]/justificatifs — upload delegation', () => {
  beforeEach(() => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    mockDossierJoinRow = makeJoinRow(USER_ID)
  })

  it('returns 201 with entry when uploadJustificatif succeeds', async () => {
    mockUploadJustificatif.mockResolvedValueOnce({
      ok: true,
      entry: {
        code: 'photos_apres_travaux',
        label: 'Photos',
        storage_path: 'cee-justificatifs://x/y',
        uploaded_at: '2026-04-11T00:00:00Z',
        verified_at: null,
        uploaded_by: USER_ID,
        source: 'artisan',
        content_hash: 'abcdef',
        size_bytes: 1024,
        mime_type: 'image/jpeg',
        exif_geotag_verified: true,
        exif_metadata: null,
      },
    })

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({
        file: makeJpeg(),
        code: 'photos_apres_travaux',
        label: 'Photos',
      }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ ok: true })
    expect(mockUploadJustificatif).toHaveBeenCalledTimes(1)

    // Vérifie que l'uploader est bien le user authentifié + source artisan
    const callArgs = mockUploadJustificatif.mock.calls[0][1] as {
      source: string
      uploadedBy: string
      dossierId: string
    }
    expect(callArgs.source).toBe('artisan')
    expect(callArgs.uploadedBy).toBe(USER_ID)
    expect(callArgs.dossierId).toBe(DOSSIER_ID)

    // --- Fix B3 : vérifie qu'UNE SEULE query est faite sur cee_dossiers -----
    // (plus de 2e round-trip séparé sur `providers`).
    const dossiersCalls = fromCalls.filter((t) => t === 'cee_dossiers')
    const providersCalls = fromCalls.filter((t) => t === 'providers')
    expect(dossiersCalls.length).toBe(1)
    expect(providersCalls.length).toBe(0)

    // La query cee_dossiers utilise bien un select qui inclut le join
    // providers!inner(user_id) pour l'ownership check atomique.
    const dossiersTrace = callTraces.find((c) => c.table === 'cee_dossiers')
    expect(dossiersTrace).toBeDefined()
    expect(dossiersTrace!.select).toMatch(/providers!inner\(user_id\)/)
    // Et les eqs incluent bien id=DOSSIER_ID + providers.user_id=USER_ID.
    expect(dossiersTrace!.eqs.some((e) => e.col === 'id' && e.val === DOSSIER_ID)).toBe(true)
    expect(dossiersTrace!.eqs.some((e) => e.col === 'providers.user_id' && e.val === USER_ID)).toBe(
      true
    )
  })

  it('returns 201 pour un file de exactement 25 MB (borne incluse)', async () => {
    mockUploadJustificatif.mockResolvedValueOnce({
      ok: true,
      entry: {
        code: 'photos_apres_travaux',
        label: 'Photos',
        storage_path: 'cee-justificatifs://x/y',
        uploaded_at: '2026-04-11T00:00:00Z',
        verified_at: null,
        uploaded_by: USER_ID,
        source: 'artisan',
        content_hash: 'abc',
        size_bytes: 25 * 1024 * 1024,
        mime_type: 'image/jpeg',
        exif_geotag_verified: true,
        exif_metadata: null,
      },
    })

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({
        file: makeJpeg(25 * 1024 * 1024),
        code: 'photos_apres_travaux',
        label: 'Photos',
      }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(201)
    expect(mockUploadJustificatif).toHaveBeenCalledTimes(1)
  })

  it('returns 413 pour un file de 25 MB + 1 byte (borne exclue)', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({
        file: makeJpeg(25 * 1024 * 1024 + 1),
        code: 'photos_apres_travaux',
        label: 'Photos',
      }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(413)
    expect(res.body).toMatchObject({ ok: false, error: 'file_too_large' })
    expect(mockUploadJustificatif).not.toHaveBeenCalled()
  })

  it('returns 400 when uploadJustificatif fails (e.g. EXIF missing)', async () => {
    mockUploadJustificatif.mockResolvedValueOnce({
      ok: false,
      error: 'exif_geotag_missing',
    })

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({
        file: makeJpeg(),
        code: 'photos_horodatees_geolocalisees_avant_apres',
        label: 'Photos horodatées',
      }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      ok: false,
      error: 'exif_geotag_missing',
    })
  })

  it('returns 500 when uploadJustificatif throws', async () => {
    mockUploadJustificatif.mockRejectedValueOnce(new Error('boom'))

    const { POST } = await import('@/app/api/cee/dossiers/[id]/justificatifs/route')
    const res = (await POST(
      makeFormDataRequest({
        file: makeJpeg(),
        code: 'photos_apres_travaux',
        label: 'Photos',
      }),
      makeContext() as never
    )) as unknown as MockResult

    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({ ok: false, error: 'server_error' })
  })
})
