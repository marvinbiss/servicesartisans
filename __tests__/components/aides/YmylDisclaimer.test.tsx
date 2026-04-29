import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'

describe('YmylDisclaimer', () => {
  it('renders the canonical YMYL message + 3818 number + france-renov link', () => {
    render(<YmylDisclaimer />)
    expect(screen.getByText(/Informations à titre indicatif/i)).toBeInTheDocument()
    expect(screen.getByText(/3818/)).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /france-renov\.gouv\.fr/i })
    expect(link).toHaveAttribute('href', 'https://france-renov.gouv.fr/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('nofollow')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('default variant uses small footer typography (text-xs)', () => {
    const { container } = render(<YmylDisclaimer />)
    const p = container.querySelector('p[data-ymyl-disclaimer="true"]')
    expect(p).toHaveClass('text-xs')
  })

  it('prominent variant uses larger body typography (text-sm)', () => {
    const { container } = render(<YmylDisclaimer variant="prominent" />)
    const p = container.querySelector('p[data-ymyl-disclaimer="true"]')
    expect(p).toHaveClass('text-sm')
  })

  it('prefix prop is rendered before the standard message', () => {
    render(<YmylDisclaimer prefix="Aide nationale 2026." />)
    expect(screen.getByText(/Aide nationale 2026\./)).toBeInTheDocument()
    expect(screen.getByText(/Informations à titre indicatif/i)).toBeInTheDocument()
  })

  it('exposes data-ymyl-disclaimer="true" for integration tests + analytics', () => {
    const { container } = render(<YmylDisclaimer />)
    expect(container.querySelector('[data-ymyl-disclaimer="true"]')).not.toBeNull()
  })

  it('accepts and merges custom className', () => {
    const { container } = render(<YmylDisclaimer className="mt-3 custom-class" />)
    const p = container.querySelector('p[data-ymyl-disclaimer="true"]')
    expect(p).toHaveClass('mt-3')
    expect(p).toHaveClass('custom-class')
  })
})
