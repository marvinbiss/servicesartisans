// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceTransparencyCard } from './PriceTransparencyCard'

describe('PriceTransparencyCard', () => {
  it('falls back to FFB benchmark when fewer than 3 rates available', () => {
    render(
      <PriceTransparencyCard
        providers={[
          { hourly_rate_min: 55, hourly_rate_max: 80 },
          { hourly_rate_min: 60, hourly_rate_max: 85 },
        ]}
        specialty="plombier"
        serviceName="Plombier"
        locationName="Lyon"
      />
    )
    expect(screen.getByText(/Tarif moyen plombier .FFB.Capeb 2026./)).toBeDefined()
    // plombier benchmark = 50-70
    expect(screen.getByText(/50.+70.+€\/h/)).toBeDefined()
  })

  it('uses observed median when ≥ 3 rates available', () => {
    render(
      <PriceTransparencyCard
        providers={[
          { hourly_rate_min: 50, hourly_rate_max: 70 },
          { hourly_rate_min: 60, hourly_rate_max: 80 },
          { hourly_rate_min: 55, hourly_rate_max: 75 },
        ]}
        specialty="plombier"
        serviceName="Plombier"
        locationName="Lyon"
      />
    )
    expect(screen.getByText(/Tarif observé sur 3 artisans à Lyon/)).toBeDefined()
    // medians: min=55, max=75
    expect(screen.getByText(/55.+75.+€\/h/)).toBeDefined()
  })

  it('displays disclaimer about excluded costs', () => {
    render(
      <PriceTransparencyCard
        providers={[]}
        specialty="plombier"
        serviceName="Plombier"
        locationName="Lyon"
      />
    )
    expect(screen.getByText(/hors fournitures et déplacement/i)).toBeDefined()
  })

  it('uses default fallback for unknown specialty', () => {
    render(
      <PriceTransparencyCard
        providers={[]}
        specialty="metier-inexistant-xyz"
        serviceName="Inconnu"
        locationName="Lyon"
      />
    )
    // DEFAULT_RANGE = 35-60
    expect(screen.getByText(/35.+60.+€\/h/)).toBeDefined()
  })

  it('aria-labelledby region wrapper', () => {
    const { container } = render(
      <PriceTransparencyCard
        providers={[]}
        specialty="plombier"
        serviceName="Plombier"
        locationName="Lyon"
      />
    )
    const section = container.querySelector('section')
    expect(section?.getAttribute('aria-labelledby')).toBe('price-transparency-heading')
  })
})
