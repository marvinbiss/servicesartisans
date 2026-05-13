// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFoundClient from './NotFoundClient'

const mockedPathname = vi.fn(() => '/services/plombir-paris')

vi.mock('next/navigation', () => ({
  usePathname: () => mockedPathname(),
}))

vi.mock('@/lib/analytics/tracking', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('@/components/conversion/StickyMobileCTA', () => ({
  default: () => null,
}))

vi.mock('@/components/ExitIntentPopup', () => ({
  default: () => null,
}))

describe('NotFoundClient', () => {
  beforeEach(() => {
    mockedPathname.mockReturnValue('/services/plombir-paris')
  })

  it('renders an H1 that receives focus on mount', () => {
    render(<NotFoundClient />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.getAttribute('tabIndex')).toBe('-1')
    expect(document.activeElement).toBe(h1)
  })

  it('pre-fills the search box with the cleaned last URL segment', () => {
    render(<NotFoundClient />)
    const input = screen.getByLabelText(/Rechercher un service ou une ville/i)
    expect((input as HTMLInputElement).value).toBe('plombir paris')
  })

  it('marks the search form with role=search and aria-label', () => {
    render(<NotFoundClient />)
    const form = screen.getByRole('search')
    expect(form.getAttribute('aria-label')).toMatch(/Recherche/i)
  })

  it('search input is described by a sr-only helper', () => {
    render(<NotFoundClient />)
    const input = screen.getByLabelText(/Rechercher un service ou une ville/i)
    const helperId = input.getAttribute('aria-describedby')
    expect(helperId).toBeTruthy()
    const helper = document.getElementById(helperId!)
    expect(helper?.textContent).toMatch(/métier ou une ville/i)
  })

  it('renders dynamic suggestions as a labelled section when URL matches', () => {
    render(<NotFoundClient />)
    const section = screen.getByRole('region', { name: /Suggestions/i })
    expect(section).toBeTruthy()
  })

  it('renders empty string in search box when pathname is root', () => {
    mockedPathname.mockReturnValue('/')
    render(<NotFoundClient />)
    const input = screen.getByLabelText(/Rechercher un service ou une ville/i)
    expect((input as HTMLInputElement).value).toBe('')
  })
})
