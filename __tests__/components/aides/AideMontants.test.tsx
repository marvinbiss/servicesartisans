// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import AideMontants from '@/components/aides/AideMontants'

describe('AideMontants', () => {
  it('renders a table row per montant', () => {
    render(
      <AideMontants
        aideName="Test Aide"
        montants={[
          { label: 'Cat A', max: '5 000 €', condition: 'Cond A' },
          { label: 'Cat B', max: '10 000 €' },
        ]}
      />
    )
    expect(screen.getByText('Cat A')).toBeInTheDocument()
    expect(screen.getByText('Cat B')).toBeInTheDocument()
    expect(screen.getByText('5 000 €')).toBeInTheDocument()
    expect(screen.getByText('10 000 €')).toBeInTheDocument()
  })

  it('uses em-dash for missing condition', () => {
    render(<AideMontants aideName="X" montants={[{ label: 'L', max: 'M' }]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('exposes accessible heading + caption to france-renov.gouv.fr', () => {
    render(<AideMontants aideName="Foo" montants={[{ label: 'L', max: 'M' }]} />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Montants Foo en 2026')
    const link = screen.getByRole('link', { name: /france-renov\.gouv\.fr/i })
    expect(link).toHaveAttribute('href', 'https://france-renov.gouv.fr/')
    // E-E-A-T : pas de nofollow vers source gouvernementale officielle (DR 92).
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link.getAttribute('rel')).not.toContain('nofollow')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
