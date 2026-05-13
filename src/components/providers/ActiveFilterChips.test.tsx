// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { ActiveFilterChips } from './ActiveFilterChips'

const replace = vi.fn()
const searchParamsState: { value: URLSearchParams } = { value: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/services/plombier/lyon',
  useSearchParams: () => searchParamsState.value,
}))

function setParams(qs: string) {
  searchParamsState.value = new URLSearchParams(qs)
}

describe('ActiveFilterChips', () => {
  it('renders nothing when no filters active', () => {
    setParams('')
    const { container } = render(<ActiveFilterChips />)
    expect(container.firstChild).toBeNull()
  })

  it('renders one chip per active filter', () => {
    setParams('rge=1&verified=1&rmin=4')
    render(<ActiveFilterChips />)
    expect(screen.getByText('RGE certifié')).toBeDefined()
    expect(screen.getByText('Vérifié')).toBeDefined()
    expect(screen.getByText(/Note ≥ 4/)).toBeDefined()
  })

  it('clicking chip removes that filter from URL', () => {
    setParams('rge=1&verified=1')
    replace.mockClear()
    render(<ActiveFilterChips />)
    fireEvent.click(screen.getByRole('button', { name: /Retirer le filtre RGE certifié/ }))
    expect(replace).toHaveBeenCalledWith('/services/plombier/lyon?verified=1', { scroll: false })
  })

  it('removing rating filter resets to 0', () => {
    setParams('rmin=4')
    replace.mockClear()
    render(<ActiveFilterChips />)
    fireEvent.click(screen.getByRole('button', { name: /Retirer le filtre Note/ }))
    expect(replace).toHaveBeenCalledWith('/services/plombier/lyon', { scroll: false })
  })

  it('"Tout effacer" appears when 2+ filters active', () => {
    setParams('rge=1&verified=1')
    render(<ActiveFilterChips />)
    expect(screen.getByText('Tout effacer')).toBeDefined()
  })

  it('"Tout effacer" hidden when only 1 filter active', () => {
    setParams('rge=1')
    render(<ActiveFilterChips />)
    expect(screen.queryByText('Tout effacer')).toBeNull()
  })

  it('"Tout effacer" clears all filters', () => {
    setParams('rge=1&verified=1&fq=1&rmin=4')
    replace.mockClear()
    render(<ActiveFilterChips />)
    fireEvent.click(screen.getByText('Tout effacer'))
    expect(replace).toHaveBeenCalledWith('/services/plombier/lyon', { scroll: false })
  })
})
