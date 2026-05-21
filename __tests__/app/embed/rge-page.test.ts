/**
 * Tests — /embed/rge page (RGE search widget, pillar 10 RGE-OS).
 *
 * Server component rendered as React tree. We assert the resulting markup
 * via React's server renderer + cheerio-free string matching to keep the
 * test stack flat (no jsdom needed).
 */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import EmbedRgePage, { metadata } from '@/app/embed/rge/page'

function render(searchParams: Record<string, string | undefined> = {}): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = EmbedRgePage({ searchParams } as any) as any
  return renderToStaticMarkup(element)
}

describe('/embed/rge page', () => {
  it('renders a form posting to /rge with target="_top" by default', () => {
    const html = render()
    expect(html).toMatch(/<form[^>]+action="https:\/\/servicesartisans\.fr\/rge"/)
    expect(html).toMatch(/target="_top"/)
    expect(html).toMatch(/method="get"/)
  })

  it('renders a hidden metier input and a required ville input', () => {
    const html = render({ metier: 'pompe-a-chaleur' })
    expect(html).toMatch(/<input[^>]+type="hidden"[^>]+name="metier"[^>]+value="pompe-a-chaleur"/)
    expect(html).toMatch(/<input[^>]+name="ville"[^>]+required/)
    expect(html).toMatch(/maxLength="50"|maxlength="50"/i)
  })

  it('falls back to metier="all" when value is not whitelisted', () => {
    const html = render({ metier: 'not-a-trade' })
    expect(html).toMatch(/name="metier"[^>]+value="all"/)
  })

  it('falls back to theme="light" when value is not whitelisted', () => {
    const dark = render({ theme: 'dark' })
    expect(dark).toMatch(/bg-charcoal-900/)
    const bogus = render({ theme: 'rainbow' })
    expect(bogus).toMatch(/bg-white/)
    expect(bogus).not.toMatch(/bg-charcoal-900/)
  })

  it('truncates ville to 50 chars and neutralises non-allowed chars', () => {
    const long = 'a'.repeat(80)
    const html = render({ ville: long })
    const match = html.match(/name="ville"[^>]+value="([^"]*)"/)
    expect(match).not.toBeNull()
    expect(match![1].length).toBeLessThanOrEqual(50)

    // Injection-style payloads must be stripped.
    const injected = render({ ville: 'Lyon<script>x</script>' })
    expect(injected).not.toMatch(/<script>x<\/script>/)
    // After sanitation, residual quotes/angle-brackets are gone before
    // React even escapes; the rendered value must NOT contain `<` or `>`.
    const villeMatch = injected.match(/name="ville"[^>]+value="([^"]*)"/)
    expect(villeMatch).not.toBeNull()
    expect(villeMatch![1]).not.toMatch(/[<>]/)
  })

  it('declares noindex/nofollow metadata (page is technical, not a SEO target)', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false })
  })

  it('shows Powered by ServicesArtisans + ADEME attribution (CC-BY 4.0)', () => {
    const html = render()
    expect(html).toMatch(/Powered by/i)
    expect(html).toMatch(/ServicesArtisans/)
    expect(html).toMatch(/Registre RGE ADEME/)
    expect(html).toMatch(/CC-BY 4\.0/)
  })

  it('keeps the submit button reachable via keyboard (focus ring class)', () => {
    const html = render()
    expect(html).toMatch(/<button[^>]+type="submit"/)
    expect(html).toMatch(/focus:ring/)
  })
})
