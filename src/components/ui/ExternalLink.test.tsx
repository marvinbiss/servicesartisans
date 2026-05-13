// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExternalLink } from './ExternalLink'

describe('ExternalLink', () => {
  it('sets target=_blank + rel=noopener noreferrer', () => {
    render(<ExternalLink href="https://example.fr">Exemple</ExternalLink>)
    const link = screen.getByRole('link', { name: /Exemple/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders the trailing icon hidden from AT by default', () => {
    const { container } = render(<ExternalLink href="https://example.fr">Exemple</ExternalLink>)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('omits the icon when noIcon is true', () => {
    const { container } = render(
      <ExternalLink href="https://example.fr" noIcon>
        Exemple
      </ExternalLink>
    )
    expect(container.querySelector('svg')).toBeNull()
  })

  it('appends a sr-only new-tab announcement', () => {
    render(<ExternalLink href="https://example.fr">Exemple</ExternalLink>)
    const link = screen.getByRole('link', { name: /Exemple/ })
    expect(link.textContent).toContain('ouvre dans un nouvel onglet')
    const srOnly = link.querySelector('.sr-only')
    expect(srOnly).toBeTruthy()
  })

  it('respects a custom newTabAnnouncement', () => {
    render(
      <ExternalLink href="https://example.fr" newTabAnnouncement="lien externe">
        Exemple
      </ExternalLink>
    )
    const link = screen.getByRole('link', { name: /Exemple/ })
    expect(link.textContent).toContain('lien externe')
  })
})
