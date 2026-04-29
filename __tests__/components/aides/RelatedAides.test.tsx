import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import RelatedAides from '@/components/aides/RelatedAides'
import type { Aide } from '@/lib/aides/aides-catalog'

const fakeAide = (slug: string, name: string): Aide =>
  ({
    slug,
    name,
    tagline: `tagline-${slug}`,
    kind: 'FinancialProduct',
    description: 'd',
    schemaDescription: 's',
    estimatedVolume: 0,
    category: 'Prime privée',
    montants: [{ label: 'L', max: 'M' }],
    eligibilite: [],
    demarche: [],
    faqs: [],
    cumulableWith: [],
    sources: [],
    lastReviewed: '2026-04-29',
    keywords: [],
    temporalCoverage: '2026-01-01/2026-12-31',
  }) as Aide

describe('RelatedAides', () => {
  it('renders nothing when aides=[]', () => {
    const { container } = render(<RelatedAides aides={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders one card per aide with link to /aides/[slug]', () => {
    const aides = [fakeAide('cee', 'Primes CEE'), fakeAide('eco-ptz', 'Éco-PTZ')]
    render(<RelatedAides aides={aides} />)

    const ceeLink = screen.getByRole('link', { name: /Primes CEE/i })
    expect(ceeLink).toHaveAttribute('href', '/aides/cee')

    const ecoLink = screen.getByRole('link', { name: /Éco-PTZ/i })
    expect(ecoLink).toHaveAttribute('href', '/aides/eco-ptz')
  })

  it('uses custom title prop when provided', () => {
    render(
      <RelatedAides
        title="Aides cumulables avec MaPrimeRénov'"
        aides={[fakeAide('cee', 'Primes CEE')]}
      />
    )
    expect(
      screen.getByRole('heading', { name: /Aides cumulables avec MaPrimeRénov/i })
    ).toBeInTheDocument()
  })
})
