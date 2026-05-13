// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NearbyCitySuggestions } from './NearbyCitySuggestions'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('NearbyCitySuggestions', () => {
  it('renders chips to nearby cities for a known dept', () => {
    render(
      <NearbyCitySuggestions
        serviceSlug="plombier"
        serviceName="Plombier"
        currentCitySlug="lyon"
        currentDepartmentCode="69"
      />
    )
    expect(screen.getByText(/Plombier dans d'autres villes/)).toBeDefined()
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    expect(links.every((a) => a.getAttribute('href')?.startsWith('/services/plombier/'))).toBe(true)
  })

  it('excludes the current city from suggestions', () => {
    render(
      <NearbyCitySuggestions
        serviceSlug="plombier"
        serviceName="Plombier"
        currentCitySlug="paris"
        currentDepartmentCode="75"
      />
    )
    const links = screen.getAllByRole('link')
    expect(links.every((a) => a.getAttribute('href') !== '/services/plombier/paris')).toBe(true)
  })

  it('falls back to national top cities when dept is unknown', () => {
    render(
      <NearbyCitySuggestions
        serviceSlug="plombier"
        serviceName="Plombier"
        currentCitySlug="lyon"
        currentDepartmentCode="ZZ"
      />
    )
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(3)
    // Paris is biggest — should appear in national fallback
    expect(links.some((a) => a.getAttribute('href') === '/services/plombier/paris')).toBe(true)
  })

  it('exposes aria-labelledby on the section', () => {
    const { container } = render(
      <NearbyCitySuggestions
        serviceSlug="plombier"
        serviceName="Plombier"
        currentCitySlug="lyon"
        currentDepartmentCode="69"
      />
    )
    const section = container.querySelector('section')
    expect(section?.getAttribute('aria-labelledby')).toBe('nearby-cities-heading')
  })
})
