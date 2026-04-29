/**
 * Tests — /api/open-data/[dataset] (chantier #4 ULTRA DOMINATION SEO)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}
vi.mock('@/lib/logger', () => ({ logger: mockLoggerFns }))

const mockRpc = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}))

vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
}))

function buildRequest(): Request {
  return new Request('http://localhost/api/open-data/local-stats.csv')
}

async function callRoute(dataset: string) {
  const mod = await import('@/app/api/open-data/[dataset]/route')
  return mod.GET(buildRequest(), { params: Promise.resolve({ dataset }) })
}

const sampleRow = {
  city_slug: 'lyon',
  city_name: 'Lyon',
  department_code: '69',
  department_name: null,
  region_name: 'Auvergne-Rhône-Alpes',
  specialty: 'Plombier',
  provider_count: 42,
  rge_provider_count: 12,
  avg_rating: 4.45,
  review_count_total: 320,
  data_period_start: '2026-03-01',
  data_period_end: '2026-04-01',
  generated_at: '2026-04-29T12:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRpc.mockResolvedValue({ data: [sampleRow], error: null })
})

afterEach(() => {})

describe('GET /api/open-data/[dataset]', () => {
  it('returns 404 on unknown dataset', async () => {
    const res = await callRoute('not-a-dataset')
    expect(res.status).toBe(404)
  })

  it('serves CSV with UTF-8 BOM + Excel-friendly content-type', async () => {
    const res = await callRoute('local-stats.csv')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/csv/i)
    expect(res.headers.get('content-disposition')).toContain('servicesartisans-local-stats.csv')
    // arrayBuffer() pour vérifier la BOM brute (res.text() la strip per spec WHATWG).
    const buf = new Uint8Array(await res.arrayBuffer())
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)
    const body = new TextDecoder('utf-8').decode(buf.slice(3))
    expect(body).toContain('city_slug,city_name,department_code')
    expect(body).toContain('Lyon')
    expect(body).toContain('Plombier')
  })

  it('serves NDJSON streaming-friendly', async () => {
    const res = await callRoute('local-stats.json')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/x-ndjson/)
    const body = await res.text()
    const lines = body.trim().split('\n')
    expect(lines.length).toBeGreaterThan(0)
    const first = JSON.parse(lines[0]) as Record<string, unknown>
    expect(first.city_slug).toBe('lyon')
  })

  it('serves DCAT-AP manifest with both datasets', async () => {
    const res = await callRoute('manifest.json')
    expect(res.status).toBe(200)
    const manifest = (await res.json()) as Record<string, unknown>
    expect(manifest['@context']).toBe('https://www.w3.org/ns/dcat')
    expect(manifest['@type']).toBe('dcat:Catalog')
    expect(manifest.license).toContain('etalab')
    const datasets = manifest.dataset as Record<string, unknown>[]
    expect(datasets).toHaveLength(2)
    expect(datasets[0].identifier).toBe('servicesartisans-rge')
    expect(datasets[1].identifier).toBe('servicesartisans-local-stats')
  })

  it('returns 503 when RPC fails (defensive)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'connection lost' } })
    const res = await callRoute('local-stats.csv')
    expect(res.status).toBe(503)
    expect(mockLoggerFns.error).toHaveBeenCalled()
  })

  it('sends CORS headers + Cache-Control 24h s-maxage', async () => {
    const res = await callRoute('local-stats.csv')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400')
    expect(res.headers.get('x-robots-tag')).toContain('noindex')
  })

  it('CSV escapes special chars in field values', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          ...sampleRow,
          city_name: 'Saint-"Étienne", commune',
          specialty: 'Couverture\nzinguerie',
        },
      ],
      error: null,
    })
    const res = await callRoute('local-stats.csv')
    const body = await res.text()
    // Le nom contient `"` et `,` → doit être quoté + escapé `""`
    expect(body).toContain('"Saint-""Étienne"", commune"')
    // Le nom contient `\n` → doit être quoté
    expect(body).toContain('"Couverture\nzinguerie"')
  })

  it('CSV escapes \\r (RFC 4180 audit code-reviewer P1-1)', async () => {
    mockRpc.mockResolvedValue({
      data: [{ ...sampleRow, specialty: 'Couvreur\rZingueur' }],
      error: null,
    })
    const res = await callRoute('local-stats.csv')
    const body = await res.text()
    expect(body).toContain('"Couvreur\rZingueur"')
  })

  it('CSV neutralises Excel formula prefix (security MEDIUM 2026-04-29)', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { ...sampleRow, city_name: '=HYPERLINK(http://evil.com,attack)' },
        { ...sampleRow, city_name: '+SUM(1+1)' },
        { ...sampleRow, city_name: '-2+3' },
        { ...sampleRow, city_name: '@import' },
      ],
      error: null,
    })
    const res = await callRoute('local-stats.csv')
    const body = await res.text()
    // Préfixe ' devant la valeur, dans le quote (Excel ne traite plus comme formule)
    expect(body).toContain("'=HYPERLINK")
    expect(body).toContain("'+SUM(1+1)")
    expect(body).toContain("'-2+3")
    expect(body).toContain("'@import")
  })

  it('serves empty dataset gracefully (k-anonymat trop strict)', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const csvRes = await callRoute('local-stats.csv')
    expect(csvRes.status).toBe(200)
    const csvBuf = new Uint8Array(await csvRes.arrayBuffer())
    // BOM + header CRLF + final CRLF, pas de row
    const csvText = new TextDecoder('utf-8').decode(csvBuf.slice(3))
    expect(csvText.trim()).toBe(CSV_HEADER_LINE)

    const jsonRes = await callRoute('local-stats.json')
    expect(jsonRes.status).toBe(200)
    const jsonText = await jsonRes.text()
    expect(jsonText.trim()).toBe('')
  })

  it('manifest distributions include downloadURL (DCAT-AP P2-2)', async () => {
    const res = await callRoute('manifest.json')
    const manifest = (await res.json()) as {
      dataset: Array<{ distribution: Array<{ accessURL: string; downloadURL?: string }> }>
    }
    for (const ds of manifest.dataset) {
      for (const dist of ds.distribution) {
        expect(dist.downloadURL).toBeDefined()
        expect(dist.downloadURL).toBe(dist.accessURL)
      }
    }
  })

  it('manifest temporal uses ISO interval (NOT P1M which is duration)', async () => {
    const res = await callRoute('manifest.json')
    const manifest = (await res.json()) as { dataset: Array<{ temporal: string }> }
    for (const ds of manifest.dataset) {
      expect(ds.temporal).toMatch(/^\d{4}-\d{2}-\d{2}\/\.\.$/)
    }
  })

  it('manifest cache shorter than data routes (P2-3)', async () => {
    const res = await callRoute('manifest.json')
    const cache = res.headers.get('cache-control') ?? ''
    expect(cache).toContain('s-maxage=3600')
    expect(cache).not.toContain('s-maxage=86400')
  })
})

const CSV_HEADER_LINE =
  'city_slug,city_name,department_code,region_name,specialty,provider_count,rge_provider_count,avg_rating,review_count_total,data_period_start,data_period_end,generated_at'

describe('csvEscape — pure function', () => {
  it('returns empty string for null/undefined', async () => {
    const { csvEscape } = await import('@/app/api/open-data/[dataset]/route')
    expect(csvEscape(null)).toBe('')
    expect(csvEscape(undefined)).toBe('')
  })

  it('passes through plain strings/numbers unchanged', async () => {
    const { csvEscape } = await import('@/app/api/open-data/[dataset]/route')
    expect(csvEscape('Lyon')).toBe('Lyon')
    expect(csvEscape(42)).toBe('42')
    expect(csvEscape(4.5)).toBe('4.5')
  })

  it('quotes values with comma / double-quote / newline', async () => {
    const { csvEscape } = await import('@/app/api/open-data/[dataset]/route')
    expect(csvEscape('a, b')).toBe('"a, b"')
    expect(csvEscape('she said "hi"')).toBe('"she said ""hi"""')
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"')
    expect(csvEscape('cr\rhere')).toBe('"cr\rhere"')
  })

  it('prefixes Excel formula starts with apostrophe', async () => {
    const { csvEscape } = await import('@/app/api/open-data/[dataset]/route')
    expect(csvEscape('=A1+B1')).toBe("'=A1+B1")
    expect(csvEscape('+8888888888')).toBe("'+8888888888")
    expect(csvEscape('-1')).toBe("'-1")
    expect(csvEscape('@SUM')).toBe("'@SUM")
    expect(csvEscape('\tIndent')).toBe("'\tIndent")
    expect(csvEscape('\rcr')).toBe('"\'\rcr"') // \r aussi → quote car contient \r
  })

  it('combines formula prefix + quote when value has both', async () => {
    const { csvEscape } = await import('@/app/api/open-data/[dataset]/route')
    expect(csvEscape('=HYPERLINK("http://x", x)')).toBe('"\'=HYPERLINK(""http://x"", x)"')
  })

  it('manifest distribution URLs use SITE_URL config', async () => {
    const res = await callRoute('manifest.json')
    const manifest = (await res.json()) as {
      dataset: Array<{ distribution: Array<{ accessURL: string }> }>
    }
    for (const ds of manifest.dataset) {
      for (const dist of ds.distribution) {
        expect(dist.accessURL).toMatch(/^https:\/\/servicesartisans\.fr/)
      }
    }
  })
})
