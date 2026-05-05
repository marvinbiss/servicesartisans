// @vitest-environment jsdom
/**
 * Tests for LastUpdated component.
 *
 * Contrat fail-closed : le composant NE DOIT JAMAIS inventer une date de
 * fraîcheur. Si la date est absente/invalide, il ne rend rien.
 * Source : developers.google.com/search/docs/fundamentals/creating-helpful-content
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import LastUpdated from '@/components/seo/LastUpdated'

describe('LastUpdated', () => {
  it('formats an ISO string in French', () => {
    render(<LastUpdated label="Données vérifiées le" date="2026-04-10" />)
    expect(screen.getByText(/Données vérifiées le/)).toBeInTheDocument()
    expect(screen.getByText(/10 avril 2026/)).toBeInTheDocument()
    const timeEl = screen.getByText(/10 avril 2026/)
    expect(timeEl.tagName.toLowerCase()).toBe('time')
    expect(timeEl.getAttribute('datetime')).toBe('2026-04-10')
  })

  it('accepts a Date object', () => {
    const d = new Date('2026-01-15T00:00:00Z')
    render(<LastUpdated label="MAJ" date={d} />)
    expect(screen.getByText(/15 janvier 2026/)).toBeInTheDocument()
  })

  it('renders nothing when `date` prop is null', () => {
    const { container } = render(<LastUpdated label="MAJ" date={null} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/MAJ/)).not.toBeInTheDocument()
  })

  it('renders nothing when `date` prop is undefined', () => {
    const { container } = render(<LastUpdated label="MAJ" />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/MAJ/)).not.toBeInTheDocument()
  })

  it('renders nothing when `date` prop is unparseable', () => {
    const { container } = render(<LastUpdated label="MAJ" date="not-a-date" />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument()
    expect(screen.queryByText(/MAJ/)).not.toBeInTheDocument()
  })
})
