// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialProofBadge } from './SocialProofBadge'

describe('SocialProofBadge', () => {
  it('renders nothing when count < 3 (anti-fake guard)', () => {
    const { container: c0 } = render(<SocialProofBadge average={4.8} count={0} />)
    expect(c0.firstChild).toBeNull()

    const { container: c1 } = render(<SocialProofBadge average={5} count={1} />)
    expect(c1.firstChild).toBeNull()

    const { container: c2 } = render(<SocialProofBadge average={4.5} count={2} />)
    expect(c2.firstChild).toBeNull()
  })

  it('renders the badge once count >= 3', () => {
    render(<SocialProofBadge average={4.7} count={142} />)
    const node = screen.getByTestId('social-proof-badge')
    expect(node).toBeTruthy()
    expect(node.textContent).toContain('4.7/5')
    expect(node.textContent).toContain('142')
    expect(node.textContent).toContain('avis vérifiés')
  })

  it('returns null on invalid average (NaN, negative, > 5)', () => {
    const { container: cNaN } = render(<SocialProofBadge average={NaN} count={10} />)
    expect(cNaN.firstChild).toBeNull()

    const { container: cNeg } = render(<SocialProofBadge average={-1} count={10} />)
    expect(cNeg.firstChild).toBeNull()

    const { container: cHigh } = render(<SocialProofBadge average={5.5} count={10} />)
    expect(cHigh.firstChild).toBeNull()

    const { container: cZero } = render(<SocialProofBadge average={0} count={10} />)
    expect(cZero.firstChild).toBeNull()
  })

  it('formats counts with French locale (espace insécable)', () => {
    render(<SocialProofBadge average={4.5} count={1234} />)
    const node = screen.getByTestId('social-proof-badge')
    // fr-FR uses U+00A0 or U+202F as thousands separator depending on Node ICU.
    // Accept any whitespace between "1" and "234".
    expect(node.textContent).toMatch(/1\s?234/)
  })

  it('supports custom label', () => {
    render(<SocialProofBadge average={4.9} count={50} label="avis vérifiés en Île-de-France" />)
    expect(screen.getByTestId('social-proof-badge').textContent).toContain(
      'avis vérifiés en Île-de-France'
    )
  })

  it('exposes an accessible aria-label with the rating + count', () => {
    render(<SocialProofBadge average={4.3} count={87} label="avis vérifiés" />)
    const node = screen.getByTestId('social-proof-badge')
    const aria = node.getAttribute('aria-label') ?? ''
    expect(aria).toContain('4.3 sur 5')
    expect(aria).toContain('87')
    expect(aria).toContain('avis vérifiés')
  })

  it('renders exactly 5 stars (filled = rounded average, hidden from a11y)', () => {
    const { container } = render(<SocialProofBadge average={3.6} count={20} />)
    const stars = container.querySelectorAll('svg')
    expect(stars.length).toBe(5)
    // First 4 should be filled-amber (rounded(3.6) = 4), last one not.
    const filledCount = Array.from(stars).filter((s) =>
      s.classList.contains('fill-amber-400')
    ).length
    expect(filledCount).toBe(4)
  })

  it('respects size + variant props without crashing', () => {
    const { container: cSm } = render(
      <SocialProofBadge average={4.5} count={10} size="sm" variant="block" />
    )
    expect(cSm.firstChild).not.toBeNull()
    expect((cSm.firstChild as HTMLElement).className).toContain('text-xs')

    const { container: cLg } = render(<SocialProofBadge average={4.5} count={10} size="lg" />)
    expect((cLg.firstChild as HTMLElement).className).toContain('text-base')
  })
})
