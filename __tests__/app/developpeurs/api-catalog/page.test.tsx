/**
 * Tests — /developpeurs/api-catalog page (Ralph 33 RGE-OS discovery hub).
 *
 * Server component rendered via `renderToStaticMarkup` to keep the test
 * stack flat (no jsdom needed). Same pattern as `__tests__/app/embed/rge-page.test.ts`.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import ApiCatalogPage, { metadata } from '@/app/(public)/developpeurs/api-catalog/page'
import { API_CATALOG } from '@/app/(public)/developpeurs/api-catalog/_catalog'

function render(): string {
  const element = ApiCatalogPage()
  return renderToStaticMarkup(element)
}

describe('/developpeurs/api-catalog page', () => {
  it('renders the catalog title "Catalogue API RGE-OS"', () => {
    const html = render()
    expect(html).toMatch(/Catalogue API RGE-OS/)
  })

  it('renders the breadcrumb nav with Accueil and Développeurs links', () => {
    const html = render()
    expect(html).toMatch(/aria-label="Fil d&#x27;Ariane"|aria-label="Fil d'Ariane"/)
    expect(html).toMatch(/href="\/"[^>]*>Accueil/)
    expect(html).toMatch(/href="\/developpeurs"[^>]*>D[ée]veloppeurs/)
    expect(html).toMatch(/aria-current="page">Catalogue API/)
  })

  it('renders at least 20 catalog entries (titles)', () => {
    const html = render()
    // Count <h3> entries (one per catalog item).
    const h3Matches = html.match(/<h3[^>]*>/g) ?? []
    expect(h3Matches.length).toBeGreaterThanOrEqual(20)
    expect(h3Matches.length).toBe(API_CATALOG.length)
  })

  it('declares noindex/nofollow metadata (technical page, not a SEO target)', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false })
  })

  it('uses DESIGN.md tokens (accent-/charcoal-/yellow-) and never emerald-', () => {
    const html = render()
    expect(html).not.toMatch(/(^|[^a-zA-Z])emerald-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])slate-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])gray-/)
    expect(html).toMatch(/accent-/)
    expect(html).toMatch(/charcoal-/)
    // Beta endpoints use yellow- per spec.
    expect(html).toMatch(/yellow-/)
  })

  it('emits a BreadcrumbList JSON-LD script with three items', () => {
    const html = render()
    expect(html).toMatch(/<script type="application\/ld\+json"/)
    expect(html).toMatch(/"@type":"BreadcrumbList"/)
    expect(html).toMatch(/"numberOfItems":3/)
  })
})
