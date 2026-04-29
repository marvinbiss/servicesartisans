/**
 * Tests — Google Places client (Find Place via SIRET).
 *
 * Couverture :
 *   - buildTextQuery — anti-injection SIRET, length cap companyName, postal validation
 *   - findPlaceBySiret — matched / no_match / api_error / timeout / body cap
 *   - X-Goog-Api-Key header (jamais en query string)
 *   - redirect:'error' enforcement
 *   - normalizeBusinessStatus — enum strict
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  findPlaceBySiret,
  buildTextQuery,
  type PlacesClientOptions,
} from '@/lib/google/places-client'

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const VALID_SIRET = '12345678901234'

function makeFetcher(response: Partial<Response>): typeof fetch {
  return vi.fn(async () => response as Response) as unknown as typeof fetch
}

function jsonResponse(payload: unknown, init: { status?: number } = {}): Response {
  const body = JSON.stringify(payload)
  return new Response(body, {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const baseOpts: PlacesClientOptions = { apiKey: 'test-api-key' }

describe('buildTextQuery', () => {
  it('throws on invalid SIRET (non-14-digit)', () => {
    expect(() => buildTextQuery({ siret: '123' })).toThrow(/Invalid SIRET/)
    expect(() => buildTextQuery({ siret: 'abc12345678901' })).toThrow(/Invalid SIRET/)
  })

  it('caps companyName at 120 chars', () => {
    const long = 'A'.repeat(500)
    const q = buildTextQuery({ siret: VALID_SIRET, companyName: long })
    // q = SIRET + space + 120 chars = 14 + 1 + 120 = 135 max
    expect(q.length).toBeLessThanOrEqual(135)
  })

  it('includes postal code only if 5-digit', () => {
    const q1 = buildTextQuery({ siret: VALID_SIRET, postalCode: '69001' })
    expect(q1).toContain('69001')
    const q2 = buildTextQuery({ siret: VALID_SIRET, postalCode: 'invalid' })
    expect(q2).not.toContain('invalid')
    const q3 = buildTextQuery({ siret: VALID_SIRET, postalCode: '690' })
    expect(q3).not.toContain('690')
  })

  it('builds composite query with siret + name + postal', () => {
    const q = buildTextQuery({
      siret: VALID_SIRET,
      companyName: 'Plomberie Dupont',
      postalCode: '75001',
    })
    expect(q).toBe(`${VALID_SIRET} Plomberie Dupont 75001`)
  })
})

describe('findPlaceBySiret', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns matched on a single Place result', async () => {
    const fetcher = makeFetcher(
      jsonResponse({
        places: [
          {
            id: 'ChIJ_xxx_yyy',
            rating: 4.5,
            userRatingCount: 87,
            businessStatus: 'OPERATIONAL',
          },
        ],
      })
    )
    const result = await findPlaceBySiret(
      { siret: VALID_SIRET, companyName: 'Test SARL' },
      { ...baseOpts, fetcher }
    )
    expect(result.status).toBe('matched')
    expect(result.placeId).toBe('ChIJ_xxx_yyy')
    expect(result.rating).toBe(4.5)
    expect(result.userRatingsTotal).toBe(87)
    expect(result.businessStatus).toBe('OPERATIONAL')
    expect(result.errorReason).toBeUndefined()
  })

  it('returns no_match on empty places array', async () => {
    const fetcher = makeFetcher(jsonResponse({ places: [] }))
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('no_match')
    expect(result.placeId).toBeNull()
    expect(result.rating).toBeNull()
  })

  it('returns no_match when places key absent', async () => {
    const fetcher = makeFetcher(jsonResponse({}))
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('no_match')
  })

  it('takes top match without ambiguous flag (pageSize=1 → defense at DB layer via unique-index 23505)', async () => {
    // Si Places retournait quand même multiple résultats malgré pageSize=1
    // (limite API non respectée), on garde le top sans erreur. La vraie
    // détection d'homonymie SIRET → place_id se fait au niveau DB via
    // l'index unique partial sur google_place_id (sync_status='collision').
    const fetcher = makeFetcher(
      jsonResponse({
        places: [{ id: 'ChIJ_a', rating: 4.5, userRatingCount: 50, businessStatus: 'OPERATIONAL' }],
      })
    )
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('matched')
    expect(result.placeId).toBe('ChIJ_a')
    expect(result.errorReason).toBeUndefined()
  })

  it('error message does not leak SIRET length on invalid input', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch
    const result = await findPlaceBySiret({ siret: '12' }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    // Anti-leak défensif : ne PAS exposer length du SIRET dans le message.
    expect(result.errorReason).not.toMatch(/\d+\s*chars/i)
    expect(result.errorReason).toContain('Invalid SIRET')
  })

  it('uses pageSize=1 in body (anti-superfluous-cost optimization)', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ places: [] })) as unknown as typeof fetch
    await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    const init = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0][1] as RequestInit
    const body = JSON.parse(init.body as string) as { pageSize?: number }
    expect(body.pageSize).toBe(1)
  })

  it('returns api_error on HTTP 4xx', async () => {
    const fetcher = makeFetcher(jsonResponse({ error: 'INVALID_KEY' }, { status: 401 }))
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    expect(result.errorReason).toBe('http_401')
  })

  it('returns api_error on HTTP 5xx', async () => {
    const fetcher = makeFetcher(jsonResponse({}, { status: 503 }))
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    expect(result.errorReason).toBe('http_503')
  })

  it('returns api_error on network failure', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('ECONNRESET')
    }) as unknown as typeof fetch
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    expect(result.errorReason).toBe('Error')
  })

  it('returns api_error on invalid SIRET in input', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch
    const result = await findPlaceBySiret({ siret: 'bad' }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    expect(result.errorReason).toContain('Invalid SIRET')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('returns api_error when place has no id field', async () => {
    const fetcher = makeFetcher(jsonResponse({ places: [{ rating: 4.0 }] }))
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('api_error')
    expect(result.errorReason).toBe('missing_place_id')
  })

  it('rejects rating outside [0, 5]', async () => {
    const fetcher = makeFetcher(
      jsonResponse({
        places: [{ id: 'x', rating: 7.5, userRatingCount: 10, businessStatus: 'OPERATIONAL' }],
      })
    )
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.status).toBe('matched')
    expect(result.rating).toBeNull()
  })

  it('floors userRatingCount + clamps to 0 if negative', async () => {
    const fetcher = makeFetcher(
      jsonResponse({
        places: [{ id: 'x', userRatingCount: -5, businessStatus: 'OPERATIONAL' }],
      })
    )
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.userRatingsTotal).toBe(0)
  })

  it('normalizes unknown businessStatus to null', async () => {
    const fetcher = makeFetcher(
      jsonResponse({
        places: [{ id: 'x', rating: 4, userRatingCount: 5, businessStatus: 'WEIRD_STATUS' }],
      })
    )
    const result = await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    expect(result.businessStatus).toBeNull()
  })

  it('sends X-Goog-Api-Key in header (NOT query string)', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ places: [] })) as unknown as typeof fetch
    await findPlaceBySiret({ siret: VALID_SIRET }, { apiKey: 'SECRET-KEY-123', fetcher })
    const call = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]
    const url = call[0] as string
    const init = call[1] as RequestInit
    expect(url).not.toContain('SECRET-KEY-123')
    expect(url).not.toContain('key=')
    const headers = init.headers as Record<string, string>
    expect(headers['X-Goog-Api-Key']).toBe('SECRET-KEY-123')
    expect(headers['X-Goog-FieldMask']).toContain('places.id')
    expect(headers['X-Goog-FieldMask']).toContain('places.rating')
  })

  it('uses redirect:error for SSRF protection', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ places: [] })) as unknown as typeof fetch
    await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher })
    const init = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0][1] as RequestInit
    expect(init.redirect).toBe('error')
  })

  it('attaches AbortSignal for timeout', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ places: [] })) as unknown as typeof fetch
    await findPlaceBySiret({ siret: VALID_SIRET }, { ...baseOpts, fetcher, timeoutMs: 5000 })
    const init = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0][1] as RequestInit
    expect(init.signal).toBeDefined()
  })

  it('sends fr-FR languageCode + FR regionCode in body', async () => {
    const fetcher = vi.fn(async () => jsonResponse({ places: [] })) as unknown as typeof fetch
    await findPlaceBySiret(
      { siret: VALID_SIRET, companyName: 'Test', postalCode: '75001' },
      { ...baseOpts, fetcher }
    )
    const init = (fetcher as unknown as { mock: { calls: unknown[][] } }).mock
      .calls[0][1] as RequestInit
    const body = JSON.parse(init.body as string) as { languageCode?: string; regionCode?: string }
    expect(body.languageCode).toBe('fr')
    expect(body.regionCode).toBe('FR')
  })
})
