/**
 * Tests — `/developpeurs/schema-explorer` page.
 *
 * Server component rendered via `renderToStaticMarkup` (no jsdom). Mirrors
 * `__tests__/app/developpeurs/api-explorer/page.test.tsx`.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import SchemaExplorerPage, { metadata } from '@/app/(public)/developpeurs/schema-explorer/page'
import { flattenSchemas } from '@/app/(public)/developpeurs/schema-explorer/_flatten-schemas'
import { OPENAPI_SPEC } from '@/app/api/v1/openapi/_spec'

function render(): string {
  const element = SchemaExplorerPage()
  return renderToStaticMarkup(element)
}

describe('/developpeurs/schema-explorer page', () => {
  it('renders the H1 "Schema Explorer"', () => {
    const html = render()
    expect(html).toMatch(/<h1[^>]*>Schema Explorer<\/h1>/)
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

  it('renders at least one SchemaBlock per components.schemas entry', () => {
    const html = render()
    const expectedSchemas = flattenSchemas(
      OPENAPI_SPEC as unknown as Record<string, unknown>
    ).length
    expect(expectedSchemas).toBeGreaterThanOrEqual(5)
    const articleMatches = html.match(/<article id="schema-/g) ?? []
    expect(articleMatches.length).toBe(expectedSchemas)
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
