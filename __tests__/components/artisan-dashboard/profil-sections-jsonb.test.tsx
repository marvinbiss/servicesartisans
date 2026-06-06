// @vitest-environment jsdom
/**
 * Régression — sections « Ma fiche » face aux formes jsonb réelles de la DB.
 *
 * `providers.service_prices` a un DEFAUT '{}'::jsonb : un objet vide (pas un
 * tableau). Le cast naïf `(x as T[]) || []` garde l'objet (truthy) et
 * .map/.length crashent la page entière (ErrorBoundary « Une erreur est
 * survenue », vu en prod 2026-06-06 sur /espace-artisan/profil?tab=activite).
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/components/artisan-dashboard/AvailabilityManager', () => ({
  AvailabilityManager: () => null,
}))

import { ServicesTarifsSection } from '@/components/artisan-dashboard/profil/ServicesTarifsSection'
import { FaqSection } from '@/components/artisan-dashboard/profil/FaqSection'
import { DisponibiliteSection } from '@/components/artisan-dashboard/profil/DisponibiliteSection'

const noop = () => {}

describe('ServicesTarifsSection — service_prices jsonb', () => {
  it("rend sans crash quand service_prices = {} (défaut DB '{}'::jsonb)", () => {
    render(
      <ServicesTarifsSection
        provider={{ id: 'p1', service_prices: {}, services_offered: [] }}
        onSaved={noop}
      />
    )
    expect(screen.getByText('Services & Tarifs')).toBeInTheDocument()
    expect(screen.getByText('Grille tarifaire')).toBeInTheDocument()
  })

  it('rend sans crash quand des rows service_prices omettent name/price (legacy)', () => {
    render(
      <ServicesTarifsSection
        provider={{
          id: 'p1',
          service_prices: [{ description: 'sans nom ni prix' }],
          services_offered: null,
        }}
        onSaved={noop}
      />
    )
    expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    expect(screen.getByText('Le prix est requis')).toBeInTheDocument()
  })
})

describe('FaqSection — faq jsonb', () => {
  it('rend sans crash quand faq = {} (drift objet vs tableau)', () => {
    render(<FaqSection provider={{ id: 'p1', faq: {} }} onSaved={noop} />)
    expect(screen.getByText('Foire aux questions')).toBeInTheDocument()
  })
})

describe('DisponibiliteSection — opening_hours jsonb', () => {
  it("rend sans crash quand opening_hours = {} (défaut DB '{}'::jsonb)", () => {
    render(<DisponibiliteSection provider={{ id: 'p1', opening_hours: {} }} onSaved={noop} />)
    expect(screen.getByText('Disponibilité')).toBeInTheDocument()
  })

  it('rend sans crash quand opening_hours est partiel (jours manquants)', () => {
    render(
      <DisponibiliteSection
        provider={{
          id: 'p1',
          opening_hours: { lundi: { ouvert: true, debut: '09:00', fin: '17:00' } },
        }}
        onSaved={noop}
      />
    )
    expect(screen.getByText('Disponibilité')).toBeInTheDocument()
  })
})
