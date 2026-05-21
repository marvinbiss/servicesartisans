/**
 * Tests — `/developpeurs/asyncapi-explorer` page.
 *
 * Server component rendered via `renderToStaticMarkup` (no jsdom).
 * Mirrors `__tests__/app/developpeurs/schema-explorer/page.test.tsx`.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import AsyncApiExplorerPage, { metadata } from '@/app/(public)/developpeurs/asyncapi-explorer/page'
import { flattenAsyncApi } from '@/app/(public)/developpeurs/asyncapi-explorer/_flatten-asyncapi'
import { ASYNCAPI_SPEC } from '@/app/api/v1/asyncapi/_spec'

function render(): string {
  const element = AsyncApiExplorerPage()
  return renderToStaticMarkup(element)
}

describe('/developpeurs/asyncapi-explorer page', () => {
  it('renders the H1 "AsyncAPI Explorer"', () => {
    const html = render()
    expect(html).toMatch(/<h1[^>]*>AsyncAPI Explorer<\/h1>/)
  })

  it('declares noindex/nofollow metadata (technical page, not a SEO target)', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false })
  })

  it('emits a BreadcrumbList JSON-LD with three items', () => {
    const html = render()
    expect(html).toMatch(/<script type="application\/ld\+json"/)
    expect(html).toMatch(/"@type":"BreadcrumbList"/)
    expect(html).toMatch(/"numberOfItems":3/)
  })

  it('renders one ChannelBlock per AsyncAPI channel', () => {
    const html = render()
    const expectedChannels = flattenAsyncApi(ASYNCAPI_SPEC as unknown).channels.length
    expect(expectedChannels).toBeGreaterThanOrEqual(4)
    const articleMatches = html.match(/<article id="channel-/g) ?? []
    expect(articleMatches.length).toBe(expectedChannels)
  })

  it('uses DESIGN.md tokens (accent-/charcoal-) and never emerald-/slate-/gray-', () => {
    const html = render()
    expect(html).not.toMatch(/(^|[^a-zA-Z])emerald-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])slate-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])gray-/)
    expect(html).toMatch(/accent-/)
    expect(html).toMatch(/charcoal-/)
  })
})
