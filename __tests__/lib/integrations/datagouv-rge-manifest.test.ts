import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  publishRgeDataset,
  RGE_DATASET_MANIFEST,
  RGE_DATASET_SLUG,
  RGE_REMOTE_RESOURCES,
} from '@/lib/integrations/datagouv-rge-manifest'
import { type DataGouvConfig } from '@/lib/integrations/datagouv'

const ORIGINAL_FETCH = global.fetch

function mockFetch(mock: typeof fetch) {
  global.fetch = mock as typeof fetch
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const CFG: DataGouvConfig = {
  apiKey: 'test-key-1234567890',
  baseUrl: 'https://www.data.gouv.fr/api/1',
}

afterEach(() => {
  global.fetch = ORIGINAL_FETCH
})

describe('RGE dataset manifest (spec)', () => {
  it('targets stable rge-latest.* URLs, never dated snapshots (idempotent re-fetch)', () => {
    for (const r of RGE_REMOTE_RESOURCES) {
      expect(r.url).toMatch(/\/datasets\/rge\/rge-latest\.(csv|json)$/)
    }
  })

  it('publishes under the site-consistent Etalab 2.0 (lov2) licence by default', () => {
    // Guards against silently shipping terms that diverge from what /open-data
    // promises reusers. Flip only when the site pages are aligned too.
    expect(RGE_DATASET_MANIFEST.license).toBe('lov2')
  })

  it('exposes exactly the two published formats (CSV + NDJSON)', () => {
    expect(RGE_REMOTE_RESOURCES.map((r) => r.format).sort()).toEqual(['csv', 'json'])
  })
})

describe('publishRgeDataset (orchestration)', () => {
  it('creates the dataset then syncs every remote resource (full cold path)', async () => {
    const fetchMock = vi
      .fn()
      // ensureDataset → getDatasetBySlug: 404 (not found)
      .mockResolvedValueOnce(new Response('not found', { status: 404 }))
      // ensureDataset → POST /datasets/
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'ds-1',
          slug: RGE_DATASET_SLUG,
          uri: 'u',
          page: 'https://data.gouv/ds-1',
        })
      )
      // resource #1: list (empty) → POST
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'r-1', title: 'csv', url: 'x', format: 'csv' }))
      // resource #2: list (empty) → POST
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'r-2', title: 'ndjson', url: 'x', format: 'json' }))
    mockFetch(fetchMock)

    const result = await publishRgeDataset(CFG)

    expect(result.datasetId).toBe('ds-1')
    expect(result.page).toBe('https://data.gouv/ds-1')
    expect(result.resources).toHaveLength(RGE_REMOTE_RESOURCES.length)
    expect(result.resources.map((r) => r.id)).toEqual(['r-1', 'r-2'])
  })

  it('is idempotent: existing dataset + existing resources → no POST', async () => {
    const existingResources = RGE_REMOTE_RESOURCES.map((r, i) => ({
      id: `r-${i}`,
      title: r.title,
      url: r.url,
      format: r.format,
    }))
    const fetchMock = vi
      .fn()
      // ensureDataset → getDatasetBySlug: 200 (exists) → no POST
      .mockResolvedValueOnce(
        jsonResponse({ id: 'ds-1', slug: RGE_DATASET_SLUG, uri: 'u', page: 'p' })
      )
      // each resource: list already contains matching URL → no POST. Fresh
      // Response per call (a Response body can only be read once).
      .mockImplementation(() => Promise.resolve(jsonResponse({ data: existingResources })))
    mockFetch(fetchMock)

    const result = await publishRgeDataset(CFG)

    expect(result.resources).toHaveLength(RGE_REMOTE_RESOURCES.length)
    // 1 (GET slug) + N (GET resources list), zero POST
    const posts = fetchMock.mock.calls.filter(
      (c) => (c[1] as { method?: string } | undefined)?.method === 'POST'
    )
    expect(posts).toHaveLength(0)
  })
})
