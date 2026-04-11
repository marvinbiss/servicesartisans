/**
 * Tests unitaires — src/lib/cee/justificatifs.ts (brique 4 mandataire CEE).
 *
 * Couvre :
 *   - uploadJustificatif : happy path (sans géotag requis)
 *   - uploadJustificatif : photo avant travaux avec géotag valide
 *   - uploadJustificatif : photo avant travaux sans géotag → rejet
 *   - uploadJustificatif : coordonnées GPS invalides → rejet
 *   - uploadJustificatif : EXIF corrompu → rejet
 *   - uploadJustificatif : duplicate (même hash) → retourne l'entry existante
 *   - verifyExifGeotag : fichier non-image → not_an_image
 *   - getJustificatifsRequisForOperation : parse correct
 *   - getJustificatifsGap : calcule missing + complete
 *
 * Le parse EXIF est mocké via `vi.mock('exifr')` pour ne dépendre d'aucun
 * fixture binaire réel (pas de lib exifr installée en dev runtime test).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  uploadJustificatif,
  verifyExifGeotag,
  getJustificatifsRequisForOperation,
  getJustificatifsGap,
  isGeotagRequiredForCode,
  GEOTAG_REQUIRED_CODES,
  ALLOWED_MIME_TYPES,
  type JustificatifEntry,
} from '@/lib/cee/justificatifs'

// ---------------------------------------------------------------------------
// Mock exifr (lazy import dans src/lib/cee/justificatifs.ts)
// ---------------------------------------------------------------------------

const mockExifParse = vi.fn()
vi.mock('exifr', () => ({
  parse: (...args: unknown[]) => mockExifParse(...args),
  default: { parse: (...args: unknown[]) => mockExifParse(...args) },
}))

// ---------------------------------------------------------------------------
// Helpers : bytes factices avec magic headers
// ---------------------------------------------------------------------------

/** JPEG minimal (3 magic bytes + padding). */
function fakeJpegBytes(size = 128): Uint8Array {
  const buf = new Uint8Array(size)
  buf[0] = 0xff
  buf[1] = 0xd8
  buf[2] = 0xff
  // padding pseudo-aléatoire déterministe
  for (let i = 3; i < size; i++) buf[i] = (i * 7) & 0xff
  return buf
}

/** Buffer PDF factice (signature %PDF-). Non-image → pas d'EXIF demandé. */
function fakePdfBytes(size = 128): Uint8Array {
  const buf = new Uint8Array(size)
  buf[0] = 0x25 // %
  buf[1] = 0x50 // P
  buf[2] = 0x44 // D
  buf[3] = 0x46 // F
  buf[4] = 0x2d // -
  for (let i = 5; i < size; i++) buf[i] = (i * 3) & 0xff
  return buf
}

// ---------------------------------------------------------------------------
// Mock Supabase chainable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string; code?: string } | null
}

interface StorageCall {
  bucket: string
  path: string
  contentType?: string
}

interface RpcCall {
  fn: string
  args: Record<string, unknown>
}

interface MockState {
  /** Réponses par table et par "opération" consommées dans l'ordre. */
  tableResponses: Map<string, MockResponse[]>
  /** Upload storage : réponse fixe + enregistrement des appels. */
  storageUpload: MockResponse
  storageCalls: StorageCall[]
  /** Dernier payload d'insert ou update enregistré. */
  lastInsert?: Record<string, unknown>
  lastUpdate?: Record<string, unknown>
  /** Réponses `supabase.rpc(fn, ...)` consommées dans l'ordre, par nom. */
  rpcResponses: Map<string, MockResponse[]>
  /** Enregistrement des appels RPC (fn + args). */
  rpcCalls: RpcCall[]
}

function createMockClient(state: MockState): SupabaseClient {
  function nextResponse(table: string): MockResponse {
    const queue = state.tableResponses.get(table) ?? []
    const resp = queue.shift() ?? { data: null, error: null }
    state.tableResponses.set(table, queue)
    return resp
  }

  function buildChain(table: string) {
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'eq', 'in', 'order', 'range', 'limit', 'contains']
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    chain.insert = vi.fn((payload: Record<string, unknown>) => {
      state.lastInsert = payload
      return chain
    })
    chain.update = vi.fn((payload: Record<string, unknown>) => {
      state.lastUpdate = payload
      return chain
    })
    const resolve = () => Promise.resolve(nextResponse(table))
    chain.single = vi.fn(resolve)
    chain.maybeSingle = vi.fn(resolve)
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => resolve().then(onFulfilled, onRejected)
    return chain
  }

  const client = {
    from: vi.fn((table: string) => buildChain(table)),
    rpc: vi.fn((fn: string, args: Record<string, unknown>) => {
      state.rpcCalls.push({ fn, args })
      const queue = state.rpcResponses.get(fn) ?? []
      const resp = queue.shift() ?? { data: null, error: null }
      state.rpcResponses.set(fn, queue)
      return Promise.resolve(resp)
    }),
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn((path: string, _bytes: unknown, opts?: { contentType?: string }) => {
          state.storageCalls.push({
            bucket,
            path,
            contentType: opts?.contentType,
          })
          return Promise.resolve(state.storageUpload)
        }),
      })),
    },
  }
  return client as unknown as SupabaseClient
}

function freshState(): MockState {
  return {
    tableResponses: new Map(),
    storageUpload: { data: { path: 'ok' }, error: null },
    storageCalls: [],
    rpcResponses: new Map(),
    rpcCalls: [],
  }
}

function queue(state: MockState, table: string, responses: MockResponse[]) {
  state.tableResponses.set(table, responses)
}

function queueRpc(state: MockState, fn: string, responses: MockResponse[]) {
  state.rpcResponses.set(fn, responses)
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DOSSIER_ID = '00000000-0000-0000-0000-000000000001'
const USER_ID = '00000000-0000-0000-0000-00000000000a'

// ---------------------------------------------------------------------------
// Constantes de surface publique
// ---------------------------------------------------------------------------

describe('constantes de conformité', () => {
  it('GEOTAG_REQUIRED_CODES contient les 2 codes post-migration 407 + alias legacy', () => {
    // Codes en production depuis migration 407 (collecte en deux étapes)
    expect(GEOTAG_REQUIRED_CODES.has('photos_avant_travaux')).toBe(true)
    expect(GEOTAG_REQUIRED_CODES.has('photos_apres_travaux')).toBe(true)
    // Alias legacy (dossiers antérieurs à migration 407)
    expect(GEOTAG_REQUIRED_CODES.has('photos_horodatees_geolocalisees_avant_apres')).toBe(true)
    // Cardinalité exacte : exactement ces 3 codes, pas d'ajout silencieux
    expect(GEOTAG_REQUIRED_CODES.size).toBe(3)
  })

  it('ALLOWED_MIME_TYPES couvre les formats attendus', () => {
    expect(ALLOWED_MIME_TYPES.has('image/jpeg')).toBe(true)
    expect(ALLOWED_MIME_TYPES.has('application/pdf')).toBe(true)
    expect(ALLOWED_MIME_TYPES.has('text/plain')).toBe(false)
  })

  it('verifyExifGeotag est appliqué aux 2 nouveaux codes (avant + apres)', async () => {
    // Les deux codes post-407 doivent déclencher le check EXIF de la même
    // manière : sans géotag → rejet exif_geotag_missing, pas d'upload storage.
    for (const code of ['photos_avant_travaux', 'photos_apres_travaux'] as const) {
      mockExifParse.mockReset()
      mockExifParse.mockResolvedValueOnce(null)
      const state = freshState()
      queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
      const client = createMockClient(state)

      const result = await uploadJustificatif(client, {
        dossierId: DOSSIER_ID,
        code,
        label: code === 'photos_avant_travaux' ? 'Photos avant travaux' : 'Photos après travaux',
        source: 'artisan',
        uploadedBy: USER_ID,
        file: {
          filename: `${code}.jpg`,
          mimeType: 'image/jpeg',
          size: 128,
          bytes: fakeJpegBytes(),
        },
      })
      expect(result.ok, `code=${code}`).toBe(false)
      expect(result.error, `code=${code}`).toBe('exif_geotag_missing')
      expect(state.storageCalls.length, `code=${code}`).toBe(0)
      expect(mockExifParse).toHaveBeenCalled()
    }
  })
})

// ---------------------------------------------------------------------------
// verifyExifGeotag
// ---------------------------------------------------------------------------

describe('verifyExifGeotag', () => {
  beforeEach(() => {
    mockExifParse.mockReset()
  })

  it('retourne not_an_image pour un PDF', async () => {
    const result = await verifyExifGeotag(fakePdfBytes())
    expect(result.hasGeotag).toBe(false)
    expect(result.reason).toBe('not_an_image')
    expect(mockExifParse).not.toHaveBeenCalled()
  })

  it('retourne no_gps si exifr renvoie null', async () => {
    mockExifParse.mockResolvedValueOnce(null)
    const result = await verifyExifGeotag(fakeJpegBytes())
    expect(result.hasGeotag).toBe(false)
    expect(result.reason).toBe('no_gps')
  })

  it('retourne no_gps si lat/lng absents', async () => {
    mockExifParse.mockResolvedValueOnce({ Make: 'Apple', Model: 'iPhone 15' })
    const result = await verifyExifGeotag(fakeJpegBytes())
    expect(result.hasGeotag).toBe(false)
    expect(result.reason).toBe('no_gps')
  })

  it('retourne invalid_coords si lat hors bornes', async () => {
    mockExifParse.mockResolvedValueOnce({
      latitude: 123, // > 90
      longitude: 2.3522,
      DateTimeOriginal: new Date('2026-04-10T10:00:00Z'),
    })
    const result = await verifyExifGeotag(fakeJpegBytes())
    expect(result.hasGeotag).toBe(false)
    expect(result.reason).toBe('invalid_coords')
  })

  it('retourne corrupt_exif si exifr throw', async () => {
    mockExifParse.mockRejectedValueOnce(new Error('boom'))
    const result = await verifyExifGeotag(fakeJpegBytes())
    expect(result.hasGeotag).toBe(false)
    expect(result.reason).toBe('corrupt_exif')
  })

  it('happy path : extrait lat/lng/takenAt/device', async () => {
    mockExifParse.mockResolvedValueOnce({
      latitude: 48.8566,
      longitude: 2.3522,
      DateTimeOriginal: new Date('2026-04-10T10:00:00Z'),
      Make: 'Apple',
      Model: 'iPhone 15',
    })
    const result = await verifyExifGeotag(fakeJpegBytes())
    expect(result.hasGeotag).toBe(true)
    expect(result.lat).toBeCloseTo(48.8566)
    expect(result.lng).toBeCloseTo(2.3522)
    expect(result.takenAt).toBe('2026-04-10T10:00:00.000Z')
    expect(result.deviceMake).toBe('Apple')
    expect(result.deviceModel).toBe('iPhone 15')
  })
})

// ---------------------------------------------------------------------------
// uploadJustificatif — happy path sans géotag requis
// ---------------------------------------------------------------------------

describe('uploadJustificatif', () => {
  beforeEach(() => {
    mockExifParse.mockReset()
  })

  it('path traversal defense-in-depth : filename ../../etc/passwd → storage_path sans ".."', async () => {
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      { data: [{ code: 'facture_detaillee' }], error: null },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: '../../etc/passwd',
        mimeType: 'application/pdf',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })

    expect(result.ok).toBe(true)
    // Le storage_path ne doit contenir AUCUNE séquence `..` (defense-in-depth).
    expect(result.entry?.storage_path).toBeDefined()
    expect(result.entry?.storage_path).not.toMatch(/\.\./)
    // Double vérif côté bucket path également
    expect(state.storageCalls[0].path).not.toMatch(/\.\./)
  })

  it('happy path : pièce PDF sans géotag requis', async () => {
    const state = freshState()
    // 1. findExistingEntryByHash : pas de doublon
    // 2. RPC append_cee_justificatif : succès, retourne le tableau mis à jour
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      { data: [{ code: 'facture_detaillee' }], error: null },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture détaillée',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'facture.pdf',
        mimeType: 'application/pdf',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })

    expect(result.ok).toBe(true)
    expect(result.entry).toBeDefined()
    expect(result.entry?.code).toBe('facture_detaillee')
    expect(result.entry?.exif_geotag_verified).toBeNull()
    expect(result.entry?.content_hash).toMatch(/^[a-f0-9]{64}$/)
    expect(result.entry?.storage_path).toContain('cee-justificatifs://')
    expect(state.storageCalls).toHaveLength(1)
    expect(state.storageCalls[0].bucket).toBe('cee-justificatifs')
    expect(mockExifParse).not.toHaveBeenCalled()
    // La RPC atomique a été appelée une fois
    expect(state.rpcCalls).toHaveLength(1)
    expect(state.rpcCalls[0].fn).toBe('append_cee_justificatif')
    expect(state.rpcCalls[0].args.p_dossier_id).toBe(DOSSIER_ID)
    expect(state.rpcCalls[0].args.p_actor_type).toBe('artisan')
  })

  it('photo avant travaux avec géotag valide → ok', async () => {
    mockExifParse.mockResolvedValueOnce({
      latitude: 48.85,
      longitude: 2.35,
      DateTimeOriginal: new Date('2026-04-09T09:00:00Z'),
    })
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      { data: [{ code: 'photos_avant_travaux' }], error: null },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'photos_avant_travaux',
      label: 'Photos avant travaux',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'avant.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(true)
    expect(result.entry?.exif_geotag_verified).toBe(true)
    expect(result.entry?.exif_metadata?.lat).toBeCloseTo(48.85)
    expect(result.entry?.exif_metadata?.lng).toBeCloseTo(2.35)
  })

  it('photo avant travaux sans géotag → rejet exif_geotag_missing', async () => {
    mockExifParse.mockResolvedValueOnce(null)
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'photos_avant_travaux',
      label: 'Photos avant travaux',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'avant.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('exif_geotag_missing')
    expect(state.storageCalls).toHaveLength(0)
  })

  it('GPS invalide (lat > 90) → rejet exif_geotag_missing', async () => {
    mockExifParse.mockResolvedValueOnce({
      latitude: 123,
      longitude: 2.35,
    })
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'photos_avant_travaux',
      label: 'Photos avant travaux',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'avant.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('exif_geotag_missing')
  })

  it('EXIF corrompu → rejet exif_geotag_missing', async () => {
    mockExifParse.mockRejectedValueOnce(new Error('corrupt'))
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'photos_apres_travaux',
      label: 'Photos après travaux',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'apres.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('exif_geotag_missing')
  })

  it('MIME type refusé → rejet mime_type_rejected', async () => {
    const state = freshState()
    const client = createMockClient(state)
    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'bad.exe',
        mimeType: 'application/x-msdownload',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('mime_type_rejected')
  })

  it('RPC append_cee_justificatif retourne error → ok=false, dossier_update_failed', async () => {
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      { data: null, error: { message: 'dossier introuvable', code: 'P0002' } },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'facture.pdf',
        mimeType: 'application/pdf',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('dossier_update_failed')
    expect(state.rpcCalls).toHaveLength(1)
  })

  it('RPC dédup (content_hash déjà présent côté DB) → ok, pas de doublon', async () => {
    // Scénario race : findExistingEntryByHash n'a rien vu (read entre 2
    // uploads simultanés), mais la RPC Postgres détecte le doublon en
    // transaction et retourne le tableau inchangé.
    const hash = (await import('crypto')).createHash('sha256').update(fakePdfBytes()).digest('hex')
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      {
        data: [{ code: 'facture_detaillee', content_hash: hash }],
        error: null,
      },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'facture.pdf',
        mimeType: 'application/pdf',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })

    expect(result.ok).toBe(true)
    expect(result.entry?.content_hash).toBe(hash)
    // Un seul appel RPC, pas de retry
    expect(state.rpcCalls).toHaveLength(1)
  })

  it('lookup dynamique : code custom avec exif_geotag:true dans cee_operations → géotag requis', async () => {
    // Fix bug A5 : un code custom seedé par migration doit être reconnu
    // via la lookup dynamique, pas uniquement via le Set hardcodé.
    mockExifParse.mockResolvedValueOnce(null)
    const state = freshState()
    queue(state, 'cee_dossiers', [
      {
        data: { justificatifs: [], operation_code: 'BAR-TH-CUSTOM' },
        error: null,
      },
    ])
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'custom_photo', label: 'Photo custom', obligatoire: true, exif_geotag: true },
          ],
        },
        error: null,
      },
    ])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'custom_photo',
      label: 'Photo custom',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'custom.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('exif_geotag_missing')
    // Le check EXIF a bien été déclenché (sinon ça serait passé en no-geotag)
    expect(mockExifParse).toHaveBeenCalled()
    // Pas d'upload storage puisque rejeté en amont
    expect(state.storageCalls).toHaveLength(0)
  })

  it('lookup dynamique : code avec exif_geotag:false → pas de check EXIF même si photo', async () => {
    // L'opération déclare explicitement que ce code ne nécessite pas de géotag.
    const state = freshState()
    queue(state, 'cee_dossiers', [
      {
        data: { justificatifs: [], operation_code: 'BAR-TH-NO-GEO' },
        error: null,
      },
    ])
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'photo_libre', label: 'Photo libre', obligatoire: true, exif_geotag: false },
          ],
        },
        error: null,
      },
    ])
    queueRpc(state, 'append_cee_justificatif', [{ data: [{ code: 'photo_libre' }], error: null }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'photo_libre',
      label: 'Photo libre',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'libre.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(true)
    expect(result.entry?.exif_geotag_verified).toBeNull()
    expect(mockExifParse).not.toHaveBeenCalled()
  })

  it('lookup DB échoue → fail-CLOSED strict (geotag considéré requis)', async () => {
    // Fix bug A5 : loi 2025-594, mieux rejeter un upload que laisser passer
    // sans géotag sur une fiche potentiellement réglementée.
    mockExifParse.mockResolvedValueOnce(null)
    const state = freshState()
    queue(state, 'cee_dossiers', [
      {
        data: { justificatifs: [], operation_code: 'BAR-TH-179' },
        error: null,
      },
    ])
    queue(state, 'cee_operations', [{ data: null, error: { message: 'DB timeout' } }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'some_photo_code',
      label: 'Photo',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 128,
        bytes: fakeJpegBytes(),
      },
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('exif_geotag_missing')
    expect(mockExifParse).toHaveBeenCalled()
  })

  it('RPC append_cee_justificatif reçoit content_hash dans p_entry (assertion explicite)', async () => {
    // Fix faux positif : on vérifie explicitement que le content_hash calculé
    // côté TS est bien propagé dans les args RPC, sinon la dédup server-side
    // ne peut pas fonctionner.
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [] }, error: null }])
    queueRpc(state, 'append_cee_justificatif', [
      { data: [{ code: 'facture_detaillee' }], error: null },
    ])
    const client = createMockClient(state)

    const bytes = fakePdfBytes()
    const expectedHash = (await import('crypto')).createHash('sha256').update(bytes).digest('hex')

    await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'facture.pdf',
        mimeType: 'application/pdf',
        size: 128,
        bytes,
      },
    })

    expect(state.rpcCalls).toHaveLength(1)
    const args = state.rpcCalls[0].args
    expect(args.p_dossier_id).toBe(DOSSIER_ID)
    expect(args.p_actor_type).toBe('artisan')
    // Le content_hash est imbriqué dans p_entry — assertion explicite
    const pEntry = args.p_entry as Record<string, unknown>
    expect(pEntry).toBeDefined()
    expect(pEntry.content_hash).toBe(expectedHash)
    expect(pEntry.code).toBe('facture_detaillee')
  })

  it("duplicate par hash → retourne l'entry existante sans re-upload", async () => {
    const existing: JustificatifEntry = {
      code: 'facture_detaillee',
      label: 'Facture',
      storage_path: 'cee-justificatifs://dossier/facture/abc12345_facture.pdf',
      uploaded_at: '2026-04-01T00:00:00.000Z',
      uploaded_by: USER_ID,
      source: 'artisan',
      // sha256 du fakePdfBytes() — on précalcule au runtime du test
      content_hash: '',
      size_bytes: 128,
      mime_type: 'application/pdf',
      verified_at: null,
      exif_geotag_verified: null,
      exif_metadata: null,
    }
    // Calcule le hash réel pour l'injecter dans l'entrée existante
    const { createHash } = await import('crypto')
    existing.content_hash = createHash('sha256').update(fakePdfBytes()).digest('hex')

    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: { justificatifs: [existing] }, error: null }])
    const client = createMockClient(state)

    const result = await uploadJustificatif(client, {
      dossierId: DOSSIER_ID,
      code: 'facture_detaillee',
      label: 'Facture',
      source: 'artisan',
      uploadedBy: USER_ID,
      file: {
        filename: 'facture.pdf',
        mimeType: 'application/pdf',
        size: 128,
        bytes: fakePdfBytes(),
      },
    })

    expect(result.ok).toBe(true)
    expect(result.entry?.content_hash).toBe(existing.content_hash)
    // Pas d'upload storage (duplicate détecté avant)
    expect(state.storageCalls).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// getJustificatifsRequisForOperation
// ---------------------------------------------------------------------------

describe('getJustificatifsRequisForOperation', () => {
  it('parse la liste JSONB migration 400', async () => {
    const state = freshState()
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'attestation_honneur', label: 'AH', obligatoire: true },
            { code: 'facture_detaillee', label: 'Facture', obligatoire: true },
            {
              code: 'avis_imposition_n_minus_2',
              label: 'Avis',
              obligatoire: false,
            },
            { code: null, label: 'invalid', obligatoire: true }, // ignoré
          ],
        },
        error: null,
      },
    ])
    const client = createMockClient(state)

    const result = await getJustificatifsRequisForOperation(client, 'BAR-EN-101')
    expect(result).toHaveLength(3)
    expect(result[0].code).toBe('attestation_honneur')
    expect(result[0].obligatoire).toBe(true)
    expect(result[2].obligatoire).toBe(false)
  })

  it('retourne [] si opération introuvable', async () => {
    const state = freshState()
    queue(state, 'cee_operations', [{ data: null, error: null }])
    const client = createMockClient(state)
    const result = await getJustificatifsRequisForOperation(client, 'UNKNOWN-CODE')
    expect(result).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getJustificatifsGap
// ---------------------------------------------------------------------------

describe('getJustificatifsGap', () => {
  it('calcule missing + complete=false quand il manque des pièces', async () => {
    const state = freshState()
    queue(state, 'cee_dossiers', [
      {
        data: {
          operation_code: 'BAR-EN-101',
          justificatifs: [{ code: 'attestation_honneur' }, { code: 'facture_detaillee' }],
        },
        error: null,
      },
    ])
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'attestation_honneur', label: 'AH', obligatoire: true },
            { code: 'facture_detaillee', label: 'Facture', obligatoire: true },
            {
              code: 'photos_horodatees_geolocalisees_avant_apres',
              label: 'Photos',
              obligatoire: true,
            },
            {
              code: 'avis_imposition_n_minus_2',
              label: 'Avis',
              obligatoire: false,
            },
          ],
        },
        error: null,
      },
    ])
    const client = createMockClient(state)

    const gap = await getJustificatifsGap(client, DOSSIER_ID)
    expect(gap.uploaded).toContain('attestation_honneur')
    expect(gap.uploaded).toContain('facture_detaillee')
    expect(gap.requis).toContain('photos_horodatees_geolocalisees_avant_apres')
    expect(gap.requis).not.toContain('avis_imposition_n_minus_2') // non obligatoire
    expect(gap.missing).toEqual(['photos_horodatees_geolocalisees_avant_apres'])
    expect(gap.complete).toBe(false)
  })

  it('complete=true quand toutes les pièces obligatoires sont uploadées', async () => {
    const state = freshState()
    queue(state, 'cee_dossiers', [
      {
        data: {
          operation_code: 'BAR-EN-101',
          justificatifs: [{ code: 'attestation_honneur' }, { code: 'facture_detaillee' }],
        },
        error: null,
      },
    ])
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'attestation_honneur', label: 'AH', obligatoire: true },
            { code: 'facture_detaillee', label: 'Facture', obligatoire: true },
          ],
        },
        error: null,
      },
    ])
    const client = createMockClient(state)

    const gap = await getJustificatifsGap(client, DOSSIER_ID)
    expect(gap.missing).toEqual([])
    expect(gap.complete).toBe(true)
  })

  it('fail-open : dossier introuvable → struct vide', async () => {
    const state = freshState()
    queue(state, 'cee_dossiers', [{ data: null, error: null }])
    const client = createMockClient(state)

    const gap = await getJustificatifsGap(client, DOSSIER_ID)
    expect(gap.complete).toBe(false)
    expect(gap.uploaded).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// isGeotagRequiredForCode — normalisation casse (Bug #6)
// ---------------------------------------------------------------------------

describe('isGeotagRequiredForCode — lookup case-insensitive (Bug #6)', () => {
  it('fallback cache : code en UPPERCASE reconnu comme géotag-required', async () => {
    const state = freshState()
    const client = createMockClient(state)
    // operationCode null → chemin fallback cache hardcodé
    const required = await isGeotagRequiredForCode(client, null, 'PHOTOS_AVANT_TRAVAUX')
    expect(required).toBe(true)
  })

  it('fallback cache : code mixed-case reconnu comme géotag-required', async () => {
    const state = freshState()
    const client = createMockClient(state)
    const required = await isGeotagRequiredForCode(client, null, 'Photos_Apres_Travaux')
    expect(required).toBe(true)
  })

  it('lookup DB : code avec casse différente dans la fiche matche via normalisation', async () => {
    const state = freshState()
    queue(state, 'cee_operations', [
      {
        data: {
          justificatifs_requis: [
            { code: 'PHOTOS_AVANT_TRAVAUX', label: 'Photos', exif_geotag: true },
          ],
        },
        error: null,
      },
    ])
    const client = createMockClient(state)
    const required = await isGeotagRequiredForCode(client, 'BAR-EN-101', 'photos_avant_travaux')
    expect(required).toBe(true)
  })

  it('code inconnu (pas dans cache, pas dans fiche) → false', async () => {
    const state = freshState()
    queue(state, 'cee_operations', [{ data: { justificatifs_requis: [] }, error: null }])
    const client = createMockClient(state)
    const required = await isGeotagRequiredForCode(client, 'BAR-EN-101', 'facture_detaillee')
    expect(required).toBe(false)
  })
})
