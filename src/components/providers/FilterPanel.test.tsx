// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import {
  FilterPanel,
  parseFilters,
  countActiveFilters,
  filtersToSearchParams,
  EMPTY_FILTERS,
} from './FilterPanel'

const replace = vi.fn()
const searchParamsState: { value: URLSearchParams } = { value: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsState.value,
}))

function setParams(qs: string) {
  searchParamsState.value = new URLSearchParams(qs)
}

describe('FilterPanel helpers', () => {
  it('parseFilters reads all keys correctly', () => {
    const params = new URLSearchParams('rge=1&verified=1&claimed=1&emergency=1&fq=1&rmin=4')
    const f = parseFilters(params)
    expect(f.rge).toBe(true)
    expect(f.verified).toBe(true)
    expect(f.claimed).toBe(true)
    expect(f.emergency).toBe(true)
    expect(f.freeQuote).toBe(true)
    expect(f.ratingMin).toBe(4)
  })

  it('parseFilters rejects invalid ratingMin', () => {
    const params = new URLSearchParams('rmin=2')
    expect(parseFilters(params).ratingMin).toBe(0)
  })

  it('countActiveFilters counts correctly', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0)
    expect(countActiveFilters({ ...EMPTY_FILTERS, rge: true, ratingMin: 4 })).toBe(2)
  })

  it('filtersToSearchParams round-trips', () => {
    const params = filtersToSearchParams({
      ...EMPTY_FILTERS,
      rge: true,
      ratingMin: 4.5,
    })
    expect(params.get('rge')).toBe('1')
    expect(params.get('rmin')).toBe('4.5')
    expect(params.get('verified')).toBeNull()
  })
})

describe('FilterPanel a11y', () => {
  beforeEach(() => {
    setParams('')
    replace.mockClear()
  })

  it('sidebar exposes role landmark via <aside>', () => {
    render(<FilterPanel resultCount={42} variant="sidebar" />)
    expect(screen.getAllByLabelText('Filtres recherche').length).toBeGreaterThan(0)
  })

  it('mobile trigger advertises haspopup + expanded state', () => {
    render(<FilterPanel resultCount={42} variant="sidebar" />)
    const triggers = screen.getAllByText('Filtres')
    const triggerBtn = triggers
      .map((el) => el.closest('button'))
      .find((b) => b?.getAttribute('aria-haspopup') === 'dialog')
    expect(triggerBtn).toBeTruthy()
    expect(triggerBtn?.getAttribute('aria-expanded')).toBe('false')
  })

  it('drawer opens with role=dialog when trigger clicked', () => {
    render(<FilterPanel resultCount={42} variant="sidebar" />)
    const triggers = screen.getAllByText('Filtres')
    const triggerBtn = triggers
      .map((el) => el.closest('button'))
      .find((b) => b?.getAttribute('aria-haspopup') === 'dialog')
    fireEvent.click(triggerBtn!)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('Esc closes the drawer', () => {
    render(<FilterPanel resultCount={42} variant="sidebar" />)
    const triggers = screen.getAllByText('Filtres')
    const triggerBtn = triggers
      .map((el) => el.closest('button'))
      .find((b) => b?.getAttribute('aria-haspopup') === 'dialog')
    fireEvent.click(triggerBtn!)
    expect(screen.queryByRole('dialog')).toBeTruthy()
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opening drawer locks body scroll', () => {
    render(<FilterPanel resultCount={42} variant="sidebar" />)
    const triggers = screen.getAllByText('Filtres')
    const triggerBtn = triggers
      .map((el) => el.closest('button'))
      .find((b) => b?.getAttribute('aria-haspopup') === 'dialog')
    fireEvent.click(triggerBtn!)
    expect(document.body.style.overflow).toBe('hidden')
  })
})
