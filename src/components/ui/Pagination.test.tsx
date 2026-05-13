// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing when only one page', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} baseUrl="/list" />)
    expect(container.firstChild).toBeNull()
  })

  it('labels the current page with aria-current and aria-label', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/list" />)
    const current = screen.getByText('2', { selector: 'span' })
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.getAttribute('aria-label')).toMatch(/page courante/i)
  })

  it('labels every page link with "Aller à la page N"', () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl="/list" />)
    expect(screen.getByRole('link', { name: /Aller à la page 2/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Aller à la page 3/i })).toBeTruthy()
  })

  it('disables prev on first page with aria-disabled and no link', () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl="/list" />)
    expect(screen.queryByRole('link', { name: /précédente/i })).toBeNull()
    const disabled = screen.getAllByText('Précédent', { selector: 'span' })[0]
      .parentElement as HTMLElement
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
  })

  it('disables next on last page with aria-disabled and no link', () => {
    render(<Pagination currentPage={3} totalPages={3} baseUrl="/list" />)
    expect(screen.queryByRole('link', { name: /suivante/i })).toBeNull()
    const disabled = screen.getAllByText('Suivant', { selector: 'span' })[0]
      .parentElement as HTMLElement
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
  })

  it('sets rel="prev" and rel="next" on adjacent page links', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/list" />)
    const prev = screen.getByRole('link', { name: /précédente/i })
    const next = screen.getByRole('link', { name: /suivante/i })
    expect(prev.getAttribute('rel')).toBe('prev')
    expect(next.getAttribute('rel')).toBe('next')
  })

  it('hides ellipsis from assistive tech', () => {
    render(<Pagination currentPage={5} totalPages={10} baseUrl="/list" />)
    const ellipsis = screen.getAllByText('...')
    expect(ellipsis.length).toBeGreaterThan(0)
    ellipsis.forEach((el) => expect(el.getAttribute('aria-hidden')).toBe('true'))
  })
})
