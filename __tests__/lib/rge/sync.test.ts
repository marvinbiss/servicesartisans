/**
 * Tests unitaires — src/lib/rge/sync.ts
 * -------------------------------------
 * Focus : fonctions pures (aggregateBySiret) + couverture légère de
 * fetchAllAdemeRows (pagination cursor, retry 429) via stub de fetch.
 *
 * matchAndUpdate / clearStaleRge / backfillCommunes nécessitent un mock
 * Supabase complet — reportés dans une passe dédiée (cf. describe.skip plus bas).
 *
 * Convention : aucune modification de sync.ts (un autre agent refactore en
 * parallèle le log pattern). On n'utilise QUE les exports publics.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { aggregateBySiret, fetchAllAdemeRows, type AdemeRgeRow } from '@/lib/rge/sync'

// ---------------------------------------------------------------------------
// Mock logger
// ---------------------------------------------------------------------------

const mockLog: Pick<Console, 'log' | 'warn' | 'error'> = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Date future garantie (10 ans). */
const FUTURE = '2099-12-31'
/** Date passée garantie. */
const PAST = '2000-01-01'

function row(partial: Partial<AdemeRgeRow>): AdemeRgeRow {
  return {
    siret: partial.siret ?? '12345678901234',
    code_qualification: partial.code_qualification ?? 'QB-1234',
    nom_qualification: partial.nom_qualification ?? 'Qualification générique',
    organisme: partial.organisme ?? 'Qualibat',
    domaine: partial.domaine,
    meta_domaine: partial.meta_domaine,
    lien_date_debut: partial.lien_date_debut ?? '2024-01-01',
    lien_date_fin: partial.lien_date_fin ?? FUTURE,
    url_qualification: partial.url_qualification,
    ...partial,
  }
}

// ---------------------------------------------------------------------------
// aggregateBySiret
// ---------------------------------------------------------------------------

describe('aggregateBySiret — cas vides et triviaux', () => {
  it('retourne une map vide pour rows = []', () => {
    const { aggregated, expired, skipped } = aggregateBySiret([], mockLog)
    expect(aggregated.size).toBe(0)
    expect(expired).toBe(0)
    expect(skipped).toBe(0)
  })

  it('agrège 1 row valide en 1 SIRET', () => {
    const { aggregated, expired, skipped } = aggregateBySiret(
      [row({ siret: '12345678901234' })],
      mockLog
    )
    expect(aggregated.size).toBe(1)
    expect(expired).toBe(0)
    expect(skipped).toBe(0)
    const agg = aggregated.get('12345678901234')
    if (!agg) throw new Error('expected agg')
    expect(agg.qualifications).toHaveLength(1)
    expect(agg.organismes).toEqual(['Qualibat'])
    expect(agg.source_url).toBe('https://france-renov.gouv.fr/annuaire-rge?siret=12345678901234')
    expect(agg.valid_until).toBe(FUTURE)
  })
})

describe('aggregateBySiret — fusion et dédup', () => {
  it('2 rows même SIRET, qualifs différentes → 1 SIRET / 2 qualifs', () => {
    const { aggregated } = aggregateBySiret(
      [
        row({ siret: '11111111111111', code_qualification: 'QB-1', organisme: 'Qualibat' }),
        row({ siret: '11111111111111', code_qualification: 'QB-2', organisme: 'Qualit\u2019ENR' }),
      ],
      mockLog
    )
    expect(aggregated.size).toBe(1)
    const agg = aggregated.get('11111111111111')
    if (!agg) throw new Error('expected agg')
    expect(agg.qualifications).toHaveLength(2)
    expect(agg.organismes).toEqual(['Qualibat', 'Qualit\u2019ENR'])
  })

  it('2 rows même SIRET même (code, organisme) → déduplication', () => {
    const { aggregated } = aggregateBySiret(
      [
        row({ siret: '22222222222222', code_qualification: 'QB-1', organisme: 'Qualibat' }),
        row({ siret: '22222222222222', code_qualification: 'QB-1', organisme: 'Qualibat' }),
      ],
      mockLog
    )
    const agg = aggregated.get('22222222222222')
    if (!agg) throw new Error('expected agg')
    expect(agg.qualifications).toHaveLength(1)
    expect(agg.organismes).toHaveLength(1)
  })

  it('organismes[] est dédupliqué quand plusieurs qualifs partagent un organisme', () => {
    const { aggregated } = aggregateBySiret(
      [
        row({ siret: '33333333333333', code_qualification: 'A', organisme: 'Qualibat' }),
        row({ siret: '33333333333333', code_qualification: 'B', organisme: 'Qualibat' }),
        row({ siret: '33333333333333', code_qualification: 'C', organisme: 'Qualit\u2019ENR' }),
      ],
      mockLog
    )
    const agg = aggregated.get('33333333333333')
    if (!agg) throw new Error('expected agg')
    expect(agg.qualifications).toHaveLength(3)
    expect(agg.organismes).toEqual(['Qualibat', 'Qualit\u2019ENR'])
  })

  it('valid_until = MAX(date_fin) sur toutes les qualifs valides du SIRET', () => {
    const { aggregated } = aggregateBySiret(
      [
        row({ siret: '44444444444444', code_qualification: 'A', lien_date_fin: '2030-05-15' }),
        row({ siret: '44444444444444', code_qualification: 'B', lien_date_fin: '2040-12-01' }),
        row({ siret: '44444444444444', code_qualification: 'C', lien_date_fin: '2035-01-01' }),
      ],
      mockLog
    )
    const agg = aggregated.get('44444444444444')
    if (!agg) throw new Error('expected agg')
    expect(agg.valid_until).toBe('2040-12-01')
  })
})

describe('aggregateBySiret — SIRET invalides', () => {
  it('skip SIRET trop court (13 chiffres)', () => {
    const { aggregated, skipped } = aggregateBySiret([row({ siret: '1234567890123' })], mockLog)
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })

  it('normalise un SIRET avec espaces (14 chiffres valides)', () => {
    const { aggregated, skipped } = aggregateBySiret([row({ siret: '123 456 789 01234' })], mockLog)
    expect(skipped).toBe(0)
    expect(aggregated.has('12345678901234')).toBe(true)
  })

  it('skip SIRET null/undefined', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: undefined }), row({ siret: '' })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(2)
  })
})

describe('aggregateBySiret — filtrage dates', () => {
  it('incrémente expired quand lien_date_fin < today', () => {
    const { aggregated, expired } = aggregateBySiret(
      [row({ siret: '55555555555555', lien_date_fin: PAST })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(expired).toBe(1)
  })

  it('skip quand lien_date_fin est invalide', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: '66666666666666', lien_date_fin: 'not-a-date' })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })

  it('skip quand lien_date_debut est invalide', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: '77777777777777', lien_date_debut: 'nope', lien_date_fin: FUTURE })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })
})

describe('aggregateBySiret — champs obligatoires', () => {
  it('skip quand code_qualification est manquant', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: '88888888888888', code_qualification: undefined })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })

  it('skip quand nom_qualification est manquant', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: '88888888888888', nom_qualification: undefined })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })

  it('skip quand organisme est manquant', () => {
    const { aggregated, skipped } = aggregateBySiret(
      [row({ siret: '88888888888888', organisme: undefined })],
      mockLog
    )
    expect(aggregated.size).toBe(0)
    expect(skipped).toBe(1)
  })
})

describe('aggregateBySiret — caps CHECK constraints', () => {
  it('cap à 10 qualifications pour un même SIRET (15 fournies)', () => {
    const rows: AdemeRgeRow[] = Array.from({ length: 15 }, (_, i) =>
      row({
        siret: '99999999999999',
        code_qualification: `Q-${i}`,
        organisme: `Org-${i % 3}`, // varie pour ne pas capper avant
      })
    )
    const { aggregated } = aggregateBySiret(rows, mockLog)
    const agg = aggregated.get('99999999999999')
    if (!agg) throw new Error('expected agg')
    expect(agg.qualifications).toHaveLength(10)
  })

  it('cap à 5 organismes pour un même SIRET (7 fournis)', () => {
    const rows: AdemeRgeRow[] = Array.from({ length: 7 }, (_, i) =>
      row({
        siret: '10101010101010',
        code_qualification: `Q-${i}`,
        organisme: `Org-${i}`,
      })
    )
    const { aggregated } = aggregateBySiret(rows, mockLog)
    const agg = aggregated.get('10101010101010')
    if (!agg) throw new Error('expected agg')
    expect(agg.organismes).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// fetchAllAdemeRows (avec fetch stub)
// ---------------------------------------------------------------------------

describe('fetchAllAdemeRows — pagination curseur', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('enchaîne 2 pages via body.next et concatène les résultats', async () => {
    const page1 = {
      results: [
        { siret: '11111111111111', code_qualification: 'A' },
        { siret: '22222222222222', code_qualification: 'B' },
      ],
      next: 'https://data.ademe.fr/foo?after=cursor-2',
      total: 3,
    }
    const page2 = {
      results: [{ siret: '33333333333333', code_qualification: 'C' }],
      total: 3,
      // pas de next → fin
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        json: async () => page1,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        json: async () => page2,
      })

    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchAllAdemeRows(Infinity, mockLog)
    expect(rows).toHaveLength(3)
    expect(rows.map((r) => r.siret)).toEqual(['11111111111111', '22222222222222', '33333333333333'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    // Deuxième call doit contenir after=cursor-2
    const secondUrl = fetchMock.mock.calls[1][0] as string
    expect(secondUrl).toContain('after=cursor-2')
  }, 10_000)

  it('retry sur 429 avec Retry-After, puis succès', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: { get: (h: string) => (h.toLowerCase() === 'retry-after' ? '0' : null) },
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        json: async () => ({ results: [{ siret: '12345678901234' }], total: 1 }),
      })

    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchAllAdemeRows(Infinity, mockLog)
    expect(rows).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(mockLog.warn).toHaveBeenCalled()
  }, 10_000)
})

// ---------------------------------------------------------------------------
// TODO : couverture des fonctions à I/O Supabase
// ---------------------------------------------------------------------------

/*
 * matchAndUpdate / clearStaleRge / backfillCommunes nécessitent un mock
 * SupabaseClient complet (from/select/in/rpc/update + chain) plus invasif
 * que le scope de ce fichier. À écrire dans une passe dédiée :
 *   - matchAndUpdate : payload RPC, retry 57014, atomicité
 *   - clearStaleRge : refus en isPartialSync, filtrage stale
 *   - backfillCommunes : retour RPC, erreur
 */
describe.skip('matchAndUpdate / clearStaleRge / backfillCommunes', () => {
  it.skip('TODO — mock Supabase complet requis', () => {})
})
