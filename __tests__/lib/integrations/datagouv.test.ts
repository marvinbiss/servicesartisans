import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DataGouvApiError,
  ensureDataset,
  getDataGouvConfig,
  getDatasetBySlug,
  syncRemoteResource,
  type DataGouvConfig,
  type DataGouvDatasetManifest,
} from '@/lib/integrations/datagouv'

const ORIGINAL_FETCH = global.fetch
const ORIGINAL_ENV = { ...process.env }

function mockFetch(mock: typeof fetch) {
  global.fetch = mock as typeof fetch
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const TEST_CFG: DataGouvConfig = {
  apiKey: 'test-key-1234567890',
  baseUrl: 'https://www.data.gouv.fr/api/1',
}

const TEST_MANIFEST: DataGouvDatasetManifest = {
  slug: 'annuaire-artisans-rge-france',
  title: 'Annuaire des artisans RGE',
  description: 'Test description',
  tags: ['rge', 'ademe'],
  license: 'lov2',
  frequency: 'monthly',
  temporalCoverageStart: '2026-01-01',
}

describe('data.gouv.fr integration — Action #4 Sprint D Ahrefs', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH
    process.env = ORIGINAL_ENV
  })

  describe('getDataGouvConfig', () => {
    it('returns null when DATAGOUV_API_KEY absent (mode no-op safe)', () => {
      delete process.env.DATAGOUV_API_KEY
      expect(getDataGouvConfig()).toBeNull()
    })

    it('returns null when API key too short (sanity check)', () => {
      process.env.DATAGOUV_API_KEY = 'short'
      expect(getDataGouvConfig()).toBeNull()
    })

    it('returns config when API key set, with default baseUrl', () => {
      process.env.DATAGOUV_API_KEY = 'valid-key-1234567890'
      const cfg = getDataGouvConfig()
      expect(cfg).not.toBeNull()
      expect(cfg?.apiKey).toBe('valid-key-1234567890')
      expect(cfg?.baseUrl).toBe('https://www.data.gouv.fr/api/1')
    })

    it('honors DATAGOUV_API_BASE_URL override (test/staging)', () => {
      process.env.DATAGOUV_API_KEY = 'valid-key-1234567890'
      process.env.DATAGOUV_API_BASE_URL = 'https://demo.data.gouv.fr/api/1'
      const cfg = getDataGouvConfig()
      expect(cfg?.baseUrl).toBe('https://demo.data.gouv.fr/api/1')
    })

    it('passes through DATAGOUV_ORGANIZATION_ID', () => {
      process.env.DATAGOUV_API_KEY = 'valid-key-1234567890'
      process.env.DATAGOUV_ORGANIZATION_ID = 'org-uuid-123'
      const cfg = getDataGouvConfig()
      expect(cfg?.organizationId).toBe('org-uuid-123')
    })
  })

  describe('getDatasetBySlug', () => {
    it('returns dataset when 200', async () => {
      mockFetch(
        vi.fn().mockResolvedValue(
          jsonResponse({
            id: 'd-id',
            slug: 'annuaire-artisans-rge-france',
            uri: 'https://api.example/d',
            page: 'https://example/d',
          })
        )
      )
      const result = await getDatasetBySlug(TEST_CFG, 'annuaire-artisans-rge-france')
      expect(result).not.toBeNull()
      expect(result?.id).toBe('d-id')
    })

    it('returns null on 404 (not found)', async () => {
      mockFetch(vi.fn().mockResolvedValue(new Response('Not found', { status: 404 })))
      const result = await getDatasetBySlug(TEST_CFG, 'inexistent')
      expect(result).toBeNull()
    })

    it('throws DataGouvApiError on 500', async () => {
      mockFetch(vi.fn().mockResolvedValue(new Response('Internal', { status: 500 })))
      await expect(getDatasetBySlug(TEST_CFG, 'any')).rejects.toThrow(DataGouvApiError)
    })

    it('sends X-API-KEY header', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse({ id: 'd', slug: 'x', uri: 'u', page: 'p' }))
      mockFetch(fetchMock)
      await getDatasetBySlug(TEST_CFG, 'x')
      const callArg = fetchMock.mock.calls[0][1] as { headers: Record<string, string> }
      expect(callArg.headers['X-API-KEY']).toBe('test-key-1234567890')
    })
  })

  describe('ensureDataset (idempotent upsert)', () => {
    it('returns existing dataset without POST when slug already exists', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({ id: 'existing-id', slug: TEST_MANIFEST.slug, uri: 'u', page: 'p' })
        )
      mockFetch(fetchMock)
      const result = await ensureDataset(TEST_CFG, TEST_MANIFEST)
      expect(result.id).toBe('existing-id')
      expect(fetchMock).toHaveBeenCalledTimes(1) // GET only, no POST
    })

    it('creates new dataset via POST when slug not found', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response('not found', { status: 404 }))
        .mockResolvedValueOnce(
          jsonResponse({ id: 'new-id', slug: TEST_MANIFEST.slug, uri: 'u', page: 'p' })
        )
      mockFetch(fetchMock)
      const result = await ensureDataset(TEST_CFG, TEST_MANIFEST)
      expect(result.id).toBe('new-id')
      expect(fetchMock).toHaveBeenCalledTimes(2)
      // 2nd call must be POST with manifest body
      const postCall = fetchMock.mock.calls[1]
      const body = JSON.parse((postCall[1] as { body: string }).body) as Record<string, unknown>
      expect(body.slug).toBe(TEST_MANIFEST.slug)
      expect(body.license).toBe('lov2')
    })

    it('attaches organization id when provided in config', async () => {
      const cfgWithOrg: DataGouvConfig = { ...TEST_CFG, organizationId: 'org-42' }
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response('not found', { status: 404 }))
        .mockResolvedValueOnce(
          jsonResponse({ id: 'new-id', slug: TEST_MANIFEST.slug, uri: 'u', page: 'p' })
        )
      mockFetch(fetchMock)
      await ensureDataset(cfgWithOrg, TEST_MANIFEST)
      const body = JSON.parse((fetchMock.mock.calls[1][1] as { body: string }).body) as {
        organization?: { id: string }
      }
      expect(body.organization?.id).toBe('org-42')
    })
  })

  describe('syncRemoteResource (idempotent on URL)', () => {
    it('returns existing resource when URL matches (no POST)', async () => {
      const existing = {
        id: 'r-id',
        title: 'CSV existant',
        url: 'https://servicesartisans.fr/datasets/rge/rge-latest.csv',
        format: 'csv',
      }
      const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ data: [existing] }))
      mockFetch(fetchMock)
      const result = await syncRemoteResource(TEST_CFG, 'd-id', {
        title: 'CSV',
        url: existing.url,
        format: 'csv',
      })
      expect(result.id).toBe('r-id')
      expect(fetchMock).toHaveBeenCalledTimes(1) // GET only
    })

    it('POST new resource when URL not present', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ data: [] }))
        .mockResolvedValueOnce(
          jsonResponse({ id: 'new-r', title: 'CSV', url: 'https://x/csv', format: 'csv' })
        )
      mockFetch(fetchMock)
      const result = await syncRemoteResource(TEST_CFG, 'd-id', {
        title: 'CSV',
        url: 'https://x/csv',
        format: 'csv',
      })
      expect(result.id).toBe('new-r')
      const postBody = JSON.parse((fetchMock.mock.calls[1][1] as { body: string }).body) as {
        filetype: string
        format: string
      }
      expect(postBody.filetype).toBe('remote')
      expect(postBody.format).toBe('csv')
    })

    it('handles array shape (some endpoints return raw array vs {data: []})', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse([{ id: 'r-id', title: 'X', url: 'https://x/csv', format: 'csv' }])
        )
      mockFetch(fetchMock)
      const result = await syncRemoteResource(TEST_CFG, 'd-id', {
        title: 'X',
        url: 'https://x/csv',
        format: 'csv',
      })
      expect(result.id).toBe('r-id')
    })
  })
})
