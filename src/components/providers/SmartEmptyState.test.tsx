// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SmartEmptyState } from './SmartEmptyState'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('SmartEmptyState', () => {
  it('renders filter-empty headline + reset button when hasActiveFilters', () => {
    render(
      <SmartEmptyState
        serviceSlug="plombier"
        serviceName="Plombier"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters
        devisHref="/devis/plombier"
      />
    )
    expect(screen.getByText('Aucun artisan ne correspond à ces filtres')).toBeDefined()
    expect(screen.getByText(/Réinitialiser les filtres/)).toBeDefined()
  })

  it('renders no-providers headline + no reset button when !hasActiveFilters', () => {
    render(
      <SmartEmptyState
        serviceSlug="plombier"
        serviceName="Plombier"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters={false}
        devisHref="/devis/plombier"
      />
    )
    expect(screen.getByText(/Aucun plombier référencé à Lyon/)).toBeDefined()
    expect(screen.queryByText(/Réinitialiser les filtres/)).toBeNull()
  })

  it('reset clicks call router.replace with pathname (no query)', () => {
    replace.mockClear()
    Object.defineProperty(window, 'location', {
      value: { pathname: '/services/plombier/lyon' },
      configurable: true,
    })
    render(
      <SmartEmptyState
        serviceSlug="plombier"
        serviceName="Plombier"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters
        devisHref="/devis/plombier"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser les filtres/ }))
    expect(replace).toHaveBeenCalledWith('/services/plombier/lyon', { scroll: false })
  })

  it('renders related-service chips for known service', () => {
    render(
      <SmartEmptyState
        serviceSlug="plombier"
        serviceName="Plombier"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters
        devisHref="/devis/plombier"
      />
    )
    expect(screen.getByText(/Métiers proches à Lyon/)).toBeDefined()
    expect(screen.getByText('Chauffagiste')).toBeDefined()
  })

  it('related chips link to the same ville for the related service', () => {
    render(
      <SmartEmptyState
        serviceSlug="plombier"
        serviceName="Plombier"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters
        devisHref="/devis/plombier"
      />
    )
    const chip = screen.getByText('Chauffagiste').closest('a')
    expect(chip?.getAttribute('href')).toBe('/services/chauffagiste/lyon')
  })

  it('hides chips block when service has no related entries', () => {
    render(
      <SmartEmptyState
        serviceSlug="non-existent-service-slug-x"
        serviceName="Inconnu"
        locationSlug="lyon"
        locationName="Lyon"
        hasActiveFilters
        devisHref="/devis/x"
      />
    )
    expect(screen.queryByText(/Métiers proches/)).toBeNull()
  })
})
