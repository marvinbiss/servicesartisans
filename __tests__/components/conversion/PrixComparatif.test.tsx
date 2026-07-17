// @vitest-environment jsdom
/**
 * Tests pour PrixComparatif — table comparative marques/configs intent achat.
 *
 * Contrat :
 *  - Rendu sémantique : <table> + <caption> + <thead> + <tbody> + scope=row/col
 *  - Colonnes optionnelles (cop/warranty/rating/notes) affichées seulement si ≥1 row la fournit
 *  - rating affiche un visuel étoiles + label aria
 *  - withSchema=true émet exactement 1 <script type="application/ld+json"> ItemList contenant
 *    rows.length entries (@type Product + Brand + AggregateOffer)
 *  - Sortie XSS-safe : passe par safeJsonStringify (échappe `<`, `>`, `&`)
 *  - rows vide → composant ne rend rien (null guard)
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import PrixComparatif, { type PrixComparatifRow } from '@/components/conversion/PrixComparatif'

const sampleRows: PrixComparatifRow[] = [
  {
    brand: 'Atlantic Calypso',
    model: '200 / 270 L',
    priceRange: '2 700 - 4 200 €',
    cop: '3,4',
    warranty: '5 ans cuve',
    rating: 4.4,
    highlight: true,
    notes: 'Leader FR, SAV dense',
  },
  {
    brand: 'Thermor Aéromax 5',
    model: '200 / 250 / 270 L',
    priceRange: '2 500 - 4 000 €',
    cop: '3,3',
    warranty: '5 ans cuve',
    rating: 4.3,
    notes: 'Bon rapport qualité-prix',
  },
  {
    brand: 'De Dietrich Kaliko',
    model: '200 / 270 / 300 L',
    priceRange: '2 800 - 4 200 €',
    cop: '3,3',
    warranty: '5 ans cuve',
    rating: 4.2,
    notes: 'Intégration chaudière',
  },
]

function getLdJson(container: HTMLElement): unknown | null {
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script || !script.textContent) return null
  return JSON.parse(script.textContent)
}

describe('PrixComparatif', () => {
  it('rend un <table> sémantique avec caption + thead + tbody', () => {
    const { container } = render(
      <PrixComparatif
        title="Comparatif ballon thermodynamique 2026"
        caption="Prix posés artisan RGE"
        rows={sampleRows}
      />
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(container.querySelector('table > caption')).not.toBeNull()
    expect(container.querySelector('table > thead')).not.toBeNull()
    expect(container.querySelector('table > tbody')).not.toBeNull()

    // 1 row par marque dans tbody
    const bodyRows = container.querySelectorAll('table > tbody > tr')
    expect(bodyRows.length).toBe(sampleRows.length)

    // scope=col sur les <th> du thead
    const headCells = container.querySelectorAll('table > thead > tr > th')
    headCells.forEach((th) => expect(th.getAttribute('scope')).toBe('col'))

    // scope=row sur le <th> de la 1ère cellule de chaque tbody row
    const rowHeaders = container.querySelectorAll('table > tbody > tr > th')
    rowHeaders.forEach((th) => expect(th.getAttribute('scope')).toBe('row'))
  })

  it('affiche le titre dans le caption et les marques', () => {
    const { container, getByText } = render(
      <PrixComparatif title="Mon titre comparatif" rows={sampleRows} />
    )
    expect(getByText('Mon titre comparatif')).toBeTruthy()
    expect(getByText('Atlantic Calypso')).toBeTruthy()
    expect(getByText('Thermor Aéromax 5')).toBeTruthy()
    expect(container.textContent).toContain('2 700 - 4 200 €')
  })

  it('affiche le rating avec label aria et 5 étoiles', () => {
    const { container } = render(<PrixComparatif title="t" rows={[sampleRows[0]]} />)
    const ratingEl = container.querySelector('[aria-label*="4.4"]')
    expect(ratingEl).not.toBeNull()
    // 5 étoiles dans l'élément rating
    const stars = ratingEl?.querySelectorAll('svg')
    expect(stars?.length).toBe(5)
  })

  it('masque la colonne cop/warranty/rating/notes si aucune row ne la fournit', () => {
    const minimalRows: PrixComparatifRow[] = [
      { brand: 'X', priceRange: '100 €' },
      { brand: 'Y', priceRange: '200 €' },
    ]
    const { container } = render(<PrixComparatif title="t" rows={minimalRows} />)
    const headers = Array.from(container.querySelectorAll('thead th')).map((el) =>
      el.textContent?.trim()
    )
    expect(headers).toContain('Marque / modèle')
    expect(headers).toContain('Prix indicatif')
    expect(headers).not.toContain('COP / Perf')
    expect(headers).not.toContain('Garantie')
    expect(headers).not.toContain('Note')
    expect(headers).not.toContain('Point fort')
  })

  it('n’émet PAS de JSON-LD si withSchema absent', () => {
    const { container } = render(<PrixComparatif title="t" rows={sampleRows} />)
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull()
  })

  it('émet un JSON-LD ItemList avec un Product par row si withSchema=true', () => {
    const { container } = render(
      <PrixComparatif title="Comparatif marques" rows={sampleRows} withSchema />
    )
    const parsed = getLdJson(container) as {
      '@type'?: string
      itemListElement?: Array<{
        '@type'?: string
        position?: number
        item?: {
          '@type'?: string
          name?: string
          brand?: { '@type'?: string; name?: string }
          offers?: { '@type'?: string }
        }
      }>
    } | null
    expect(parsed).not.toBeNull()
    expect(parsed?.['@type']).toBe('ItemList')
    expect(parsed?.itemListElement?.length).toBe(sampleRows.length)

    const first = parsed?.itemListElement?.[0]
    expect(first?.['@type']).toBe('ListItem')
    expect(first?.position).toBe(1)
    expect(first?.item?.['@type']).toBe('Product')
    expect(first?.item?.name).toBe('Atlantic Calypso 200 / 270 L')
    expect(first?.item?.brand?.['@type']).toBe('Brand')
    expect(first?.item?.brand?.name).toBe('Atlantic Calypso')
    expect(first?.item?.offers?.['@type']).toBe('AggregateOffer')
  })

  it('XSS-safe : échappe < > & dans le payload JSON-LD via safeJsonStringify', () => {
    const evilRow: PrixComparatifRow = {
      brand: '<script>alert(1)</script>',
      priceRange: '100 €',
    }
    const { container } = render(<PrixComparatif title="t" rows={[evilRow]} withSchema />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const raw = script?.textContent ?? ''
    // Le contenu brut DOIT être échappé Unicode (pas le < littéral)
    expect(raw).not.toContain('<script>')
    expect(raw).not.toContain('</script>')
    expect(raw).toContain('\\u003c')
    // Une fois parsé, la valeur originale est récupérée intacte (sécurité côté HTML, pas data)
    const parsed = JSON.parse(raw) as {
      itemListElement: Array<{ item: { brand: { name: string } } }>
    }
    expect(parsed.itemListElement[0].item.brand.name).toBe('<script>alert(1)</script>')
  })

  it('rend null si rows est vide ou non défini', () => {
    const { container: c1 } = render(<PrixComparatif title="t" rows={[]} />)
    expect(c1.querySelector('table')).toBeNull()

    // @ts-expect-error : test contrat défensif rows undefined
    const { container: c2 } = render(<PrixComparatif title="t" rows={undefined} />)
    expect(c2.querySelector('table')).toBeNull()
  })

  it('applique la classe highlight sur la row signalée', () => {
    const { container } = render(
      <PrixComparatif
        title="t"
        rows={[
          { brand: 'A', priceRange: '1 €', highlight: true },
          { brand: 'B', priceRange: '2 €' },
        ]}
      />
    )
    const rows = container.querySelectorAll('tbody > tr')
    expect(rows[0].className).toMatch(/bg-accent-50/)
    expect(rows[1].className).not.toMatch(/bg-accent-50/)
  })
})
