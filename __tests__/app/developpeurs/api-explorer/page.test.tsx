/**
 * Tests — /developpeurs/api-explorer page.
 *
 * Server component rendered via `renderToStaticMarkup` (no jsdom). Same
 * harness shape as `__tests__/app/developpeurs/api-catalog/page.test.tsx`.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import ApiExplorerPage, { metadata } from '@/app/(public)/developpeurs/api-explorer/page'
import { getSpec } from '@/app/(public)/developpeurs/api-explorer/_spec-source'
import { flattenSpec } from '@/app/(public)/developpeurs/api-explorer/_renderer'

function render(): string {
  const element = ApiExplorerPage()
  return renderToStaticMarkup(element)
}

describe('/developpeurs/api-explorer page', () => {
  it('renders the H1 "API Explorer"', () => {
    const html = render()
    expect(html).toMatch(/<h1[^>]*>API Explorer<\/h1>/)
  })

  it('renders the breadcrumb nav with Accueil + Développeurs + current page', () => {
    const html = render()
    expect(html).toMatch(/aria-label="Fil d&#x27;Ariane"|aria-label="Fil d'Ariane"/)
    expect(html).toMatch(/href="\/"[^>]*>Accueil/)
    expect(html).toMatch(/href="\/developpeurs"[^>]*>D[ée]veloppeurs/)
    expect(html).toMatch(/aria-current="page">API Explorer/)
  })

  it('renders at least one OperationBlock per operation in the Ralph 27 spec', () => {
    const html = render()
    const expectedOps = flattenSpec(getSpec()).length
    expect(expectedOps).toBeGreaterThanOrEqual(13)
    // Each OperationBlock is an <article> with id starting "op-".
    const articleMatches = html.match(/<article id="op-/g) ?? []
    expect(articleMatches.length).toBe(expectedOps)
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

  it('uses DESIGN.md tokens (accent-/charcoal-/yellow-/red-) and never emerald-/slate-/gray-', () => {
    const html = render()
    expect(html).not.toMatch(/(^|[^a-zA-Z])emerald-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])slate-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])gray-/)
    expect(html).toMatch(/accent-/)
    expect(html).toMatch(/charcoal-/)
  })
})
