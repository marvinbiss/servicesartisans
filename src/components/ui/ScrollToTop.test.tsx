// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ScrollToTop from './ScrollToTop'

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    }
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
  })

  it('renders hidden when the page has not been scrolled', () => {
    render(<ScrollToTop />)
    const btn = screen.getByRole('button', { name: /Remonter/i })
    expect(btn.className).toContain('opacity-0')
    expect(btn.className).toContain('pointer-events-none')
  })

  it('becomes visible after scrolling past one viewport', () => {
    render(<ScrollToTop />)
    Object.defineProperty(window, 'scrollY', { value: 1500, configurable: true })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    const btn = screen.getByRole('button', { name: /Remonter/i })
    expect(btn.className).toContain('opacity-100')
  })

  it('clicking scrolls to top and focuses <main>', () => {
    const main = document.createElement('main')
    document.body.appendChild(main)
    render(<ScrollToTop />)
    fireEvent.click(screen.getByRole('button', { name: /Remonter/i }))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(document.activeElement).toBe(main)
  })

  it('prefers-reduced-motion uses behavior=auto', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia
    render(<ScrollToTop />)
    fireEvent.click(screen.getByRole('button', { name: /Remonter/i }))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('ArrowUp icon is aria-hidden so only the button label is announced', () => {
    const { container } = render(<ScrollToTop />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})
