// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StickyMobileDevisCTA } from './StickyMobileDevisCTA'

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('StickyMobileDevisCTA', () => {
  beforeEach(() => setScroll(0))
  afterEach(() => setScroll(0))

  it('starts hidden (translate-y-full)', () => {
    render(<StickyMobileDevisCTA href="/devis" serviceLabel="Plombier" villeLabel="Lyon" />)
    const wrapper = screen.getByLabelText(/Recevoir mes devis/).closest('div')
    expect(wrapper?.className).toContain('translate-y-full')
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')
  })

  it('becomes visible after threshold scroll', () => {
    render(<StickyMobileDevisCTA href="/devis" serviceLabel="Plombier" villeLabel="Lyon" />)
    setScroll(700)
    const wrapper = screen.getByLabelText(/Recevoir mes devis/).closest('div')
    expect(wrapper?.className).toContain('translate-y-0')
    expect(wrapper?.getAttribute('aria-hidden')).toBe('false')
  })

  it('respects custom threshold', () => {
    render(
      <StickyMobileDevisCTA
        href="/devis"
        serviceLabel="Plombier"
        villeLabel="Lyon"
        threshold={1000}
      />
    )
    setScroll(700)
    const wrapper = screen.getByLabelText(/Recevoir mes devis/).closest('div')
    expect(wrapper?.className).toContain('translate-y-full')
    setScroll(1100)
    expect(wrapper?.className).toContain('translate-y-0')
  })

  it('renders link with full aria-label after scroll', () => {
    render(<StickyMobileDevisCTA href="/devis/p" serviceLabel="Plombier" villeLabel="Lyon" />)
    setScroll(700)
    const link = screen.getByLabelText(/Recevoir mes devis Plombier à Lyon/)
    expect(link.getAttribute('href')).toBe('/devis/p')
  })

  it('hidden md+ via md:hidden wrapper class', () => {
    render(<StickyMobileDevisCTA href="/devis" serviceLabel="Plombier" villeLabel="Lyon" />)
    const wrapper = screen.getByLabelText(/Recevoir mes devis/).closest('div')
    expect(wrapper?.className).toContain('md:hidden')
  })
})
