/**
 * Tests for LastUpdated component.
 *
 * Focus : comportement fail-open du parsing de date + format français.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import LastUpdated from '@/components/seo/LastUpdated'

describe('LastUpdated', () => {
  it('formats an ISO string in French', () => {
    render(<LastUpdated label="Données vérifiées le" date="2026-04-10" />)
    expect(screen.getByText(/Données vérifiées le/)).toBeInTheDocument()
    // Date affichée dans la langue FR hardcodée (jour mois année).
    expect(screen.getByText(/10 avril 2026/)).toBeInTheDocument()
    // L'attribut datetime utilise la forme ISO YYYY-MM-DD
    const timeEl = screen.getByText(/10 avril 2026/)
    expect(timeEl.tagName.toLowerCase()).toBe('time')
    expect(timeEl.getAttribute('datetime')).toBe('2026-04-10')
  })

  it('accepts a Date object', () => {
    const d = new Date('2026-01-15T00:00:00Z')
    render(<LastUpdated label="MAJ" date={d} />)
    expect(screen.getByText(/15 janvier 2026/)).toBeInTheDocument()
  })

  it('falls back to current date when `date` prop is null', () => {
    render(<LastUpdated label="MAJ" date={null} />)
    // Ne doit jamais afficher "Invalid Date" — contrat fail-open strict.
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument()
    // L'année courante doit apparaître (ou future via mocks de temps).
    const yearNow = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(yearNow)))).toBeInTheDocument()
  })

  it('falls back gracefully on an unparseable string', () => {
    render(<LastUpdated label="MAJ" date="not-a-date" />)
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument()
    const yearNow = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(yearNow)))).toBeInTheDocument()
  })
})
