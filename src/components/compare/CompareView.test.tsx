// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompareView } from './CompareView'
import type { CompareProvider } from './CompareProvider'

const compareListMock: { value: CompareProvider[] } = { value: [] }

vi.mock('@/components/compare/CompareProvider', async () => {
  const actual = await vi.importActual<typeof import('@/components/compare/CompareProvider')>(
    '@/components/compare/CompareProvider'
  )
  return {
    ...actual,
    useCompare: () => ({
      compareList: compareListMock.value,
      addToCompare: vi.fn(),
      removeFromCompare: vi.fn(),
      clearCompare: vi.fn(),
      isInCompare: () => false,
    }),
  }
})

const FAR_FUTURE = new Date('2099-12-31').toISOString()

const baseProvider: CompareProvider = {
  id: 'a',
  name: 'Artisan A',
  slug: 'a',
}

describe('CompareView — Tier B enriched rows', () => {
  it('renders RGE row with check when at least one qualif active', () => {
    compareListMock.value = [
      {
        ...baseProvider,
        rge_qualifications: [
          {
            code: 'RGE-X',
            nom: 'Quali',
            organisme: 'Org',
            domaine: null,
            meta_domaine: null,
            date_debut: '2020-01-01',
            date_fin: FAR_FUTURE,
            url: null,
          },
        ],
      },
      { ...baseProvider, id: 'b', name: 'Artisan B' },
    ]
    render(<CompareView onClose={() => {}} />)
    expect(screen.getByText('Certifié RGE')).toBeDefined()
  })

  it('renders Tarif horaire row with range when min/max set', () => {
    compareListMock.value = [
      { ...baseProvider, hourly_rate_min: 40, hourly_rate_max: 70 },
      { ...baseProvider, id: 'b', name: 'Artisan B' },
    ]
    render(<CompareView onClose={() => {}} />)
    expect(screen.getByText('Tarif horaire')).toBeDefined()
    expect(screen.getByText(/40.*70.*€\/h/)).toBeDefined()
  })

  it('renders "Sur devis" fallback when no hourly rate', () => {
    compareListMock.value = [
      { ...baseProvider, hourly_rate_min: null, hourly_rate_max: null },
      { ...baseProvider, id: 'b', name: 'Artisan B' },
    ]
    render(<CompareView onClose={() => {}} />)
    expect(screen.getAllByText('Sur devis').length).toBeGreaterThan(0)
  })

  it('renders Urgences row reflecting emergency_available OR available_24h', () => {
    compareListMock.value = [
      { ...baseProvider, emergency_available: true },
      { ...baseProvider, id: 'b', name: 'Artisan B', available_24h: true },
    ]
    render(<CompareView onClose={() => {}} />)
    expect(screen.getByText('Urgences 24/7')).toBeDefined()
  })

  it('renders Devis gratuit row', () => {
    compareListMock.value = [
      { ...baseProvider, free_quote: true },
      { ...baseProvider, id: 'b', name: 'Artisan B', free_quote: false },
    ]
    render(<CompareView onClose={() => {}} />)
    expect(screen.getByText('Devis gratuit')).toBeDefined()
  })
})
