import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock config before importing
vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
}))

// Save original env
const originalEnv = { ...process.env }

describe('submitToIndexNow', () => {
  let submitToIndexNow: typeof import('@/lib/seo/indexnow').submitToIndexNow

  beforeEach(async () => {
    vi.resetModules()
    process.env.INDEXNOW_API_KEY = 'test-api-key-123'
    const mod = await import('@/lib/seo/indexnow')
    submitToIndexNow = mod.submitToIndexNow
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('returns failure when no API key is set', async () => {
    vi.resetModules()
    delete process.env.INDEXNOW_API_KEY
    const mod = await import('@/lib/seo/indexnow')
    const result = await mod.submitToIndexNow(['/page1'])
    expect(result.success).toBe(false)
    expect(result.submitted).toBe(0)
    expect(result.error).toBeDefined()
  })

  it('returns failure for empty URL list', async () => {
    const result = await submitToIndexNow([])
    expect(result.success).toBe(false)
    expect(result.submitted).toBe(0)
  })

  it('submits URLs with correct payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    const result = await submitToIndexNow(['/page1', '/page2'])

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const call = mockFetch.mock.calls[0]
    expect(call[0]).toBe('https://api.indexnow.org/IndexNow')

    const body = JSON.parse(call[1].body)
    expect(body.host).toBe('servicesartisans.fr')
    expect(body.key).toBe('test-api-key-123')
    expect(body.urlList).toHaveLength(2)
    expect(body.urlList[0]).toBe('https://servicesartisans.fr/page1')
    expect(body.urlList[1]).toBe('https://servicesartisans.fr/page2')

    expect(result.success).toBe(true)
    expect(result.submitted).toBe(2)
  })

  it('handles absolute URLs without prepending SITE_URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    await submitToIndexNow(['https://servicesartisans.fr/already-absolute'])

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.urlList[0]).toBe('https://servicesartisans.fr/already-absolute')
  })

  it('accepts 202 status as success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 202 })
    vi.stubGlobal('fetch', mockFetch)

    const result = await submitToIndexNow(['/page1'])
    expect(result.success).toBe(true)
    expect(result.submitted).toBe(1)
  })

  it('handles network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const result = await submitToIndexNow(['/page1'])
    expect(result.success).toBe(false)
    expect(result.submitted).toBe(0)
  })

  it('handles server error responses (non-ok, non-202)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', mockFetch)

    const result = await submitToIndexNow(['/page1'])
    expect(result.success).toBe(false)
    expect(result.submitted).toBe(0)
  })

  it('batches URLs correctly when exceeding 10K limit', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    // Create 15K URLs
    const urls = Array.from({ length: 15_000 }, (_, i) => `/page-${i}`)
    const result = await submitToIndexNow(urls)

    // Should be split into 2 batches: 10K + 5K
    expect(mockFetch).toHaveBeenCalledTimes(2)

    const batch1 = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(batch1.urlList).toHaveLength(10_000)

    const batch2 = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(batch2.urlList).toHaveLength(5_000)

    expect(result.submitted).toBe(15_000)
    expect(result.success).toBe(true)
  })

  it('continues with next batch if one fails', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('First batch failed'))
      .mockResolvedValueOnce({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    const urls = Array.from({ length: 15_000 }, (_, i) => `/page-${i}`)
    const result = await submitToIndexNow(urls)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    // First batch failed, second succeeded
    expect(result.submitted).toBe(5_000)
    expect(result.success).toBe(true)
  })

  it('uses correct Content-Type header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    await submitToIndexNow(['/page1'])

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['Content-Type']).toBe('application/json; charset=utf-8')
  })

  it('includes keyLocation in payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    await submitToIndexNow(['/page1'])

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.keyLocation).toBe('https://servicesartisans.fr/test-api-key-123.txt')
  })
})

describe('getProviderAffectedUrls', () => {
  let getProviderAffectedUrls: typeof import('@/lib/seo/indexnow').getProviderAffectedUrls

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/lib/seo/indexnow')
    getProviderAffectedUrls = mod.getProviderAffectedUrls
  })

  it('generates correct URL patterns for a provider', () => {
    const urls = getProviderAffectedUrls('plomberie', 'paris')
    expect(urls).toContain('/services/plomberie/paris')
    expect(urls).toContain('/avis/plomberie/paris')
    expect(urls).toContain('/tarifs/plomberie/paris')
    expect(urls).toContain('/urgence/plomberie/paris')
    expect(urls).toContain('/devis/plomberie/paris')
    expect(urls).toContain('/rge/plomberie/paris')
    expect(urls).toContain('/villes/paris')
  })

  it('includes provider page when publicId is provided', () => {
    const urls = getProviderAffectedUrls('plomberie', 'paris', 'abc-123')
    expect(urls).toContain('/services/plomberie/paris/abc-123')
    // 7 pSEO templates + 1 provider detail page
    expect(urls).toHaveLength(8)
  })

  it('excludes provider page when no publicId', () => {
    const urls = getProviderAffectedUrls('plomberie', 'paris')
    // 7 pSEO templates : services, avis, tarifs, urgence, devis, rge, villes
    expect(urls).toHaveLength(7)
  })

  it('handles different service/city slug combinations', () => {
    const urls = getProviderAffectedUrls('electricite', 'marseille')
    expect(urls).toContain('/services/electricite/marseille')
    expect(urls).toContain('/villes/marseille')
  })
})
