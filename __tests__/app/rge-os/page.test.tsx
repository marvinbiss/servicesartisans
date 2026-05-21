import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import RgeOsPage, { metadata } from '@/app/(public)/rge-os/page'

describe('/rge-os landing', () => {
  it('renders title with brand positioning', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('Première API publique')
    expect(html).toContain('RGE-OS')
  })

  it('renders all 14 pillars', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) {
      expect(html).toContain(`Pilier ${id.toString().padStart(2, '0')}`)
    }
  })

  it('renders 6 use cases', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('Mairies et collectivités')
    expect(html).toContain('CRM bâtiment et SaaS B2B')
    expect(html).toContain('Comparateurs énergétiques')
    expect(html).toContain('Plateformes mandataire CEE')
    expect(html).toContain('Chercheurs et data scientists')
    expect(html).toContain('Agents IA et assistants conversationnels')
  })

  it('renders 6 FAQ entries', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('Quelle est la source des données')
    expect(html).toContain("L'API est-elle gratuite")
    expect(html).toContain('Comment citer les données')
    expect(html).toContain('Quelle fraîcheur des données')
    expect(html).toContain('Quels formats sont supportés')
    expect(html).toContain('Le code est-il open source')
  })

  it('emits Schema.org Dataset JSON-LD with CC-BY 4.0 license', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('"@type":"Dataset"')
    expect(html).toContain('creativecommons.org/licenses/by/4.0')
  })

  it('emits Schema.org FAQPage with 6 Question entities', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('"@type":"FAQPage"')
    const matches = html.match(/"@type":"Question"/g) ?? []
    expect(matches.length).toBe(6)
  })

  it('emits Schema.org SoftwareApplication with free offer', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('"@type":"SoftwareApplication"')
    expect(html).toContain('"price":"0"')
    expect(html).toContain('"priceCurrency":"EUR"')
  })

  it('emits Schema.org BreadcrumbList', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('"@type":"BreadcrumbList"')
  })

  it('is indexable (no robots noindex)', () => {
    expect(metadata.robots).toBeUndefined()
    expect(metadata.title).toBe('RGE-OS — Première API publique ouverte du registre RGE ADEME')
  })

  it('cites ADEME data.gouv source attribution', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('ADEME')
    expect(html).toContain('data.gouv.fr')
    expect(html).toContain('Etalab 2.0')
  })

  it('links to all 5 developer surface pages', () => {
    const html = renderToStaticMarkup(<RgeOsPage />)
    expect(html).toContain('/developpeurs/api-catalog')
    expect(html).toContain('/developpeurs/api-explorer')
    expect(html).toContain('/developpeurs/schema-explorer')
    expect(html).toContain('/developpeurs/asyncapi-explorer')
    expect(html).toContain('/developpeurs/try')
  })
})
