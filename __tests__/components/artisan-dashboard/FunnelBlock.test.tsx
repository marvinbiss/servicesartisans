// @vitest-environment jsdom
/**
 * Tests — FunnelBlock
 *
 * Couvre :
 *  - loading aria-busy, error null
 *  - empty state si assigned=0
 *  - funnel steps rendus avec %
 *  - rates + délai médian formaté (min/h/j)
 *  - nudge amber si responseRate<50
 *  - nudge green si responseRate≥80
 *  - delta vs previousPeriod (signe + pt)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('swr', () => ({ default: vi.fn() }))

import useSWR from 'swr'
import FunnelBlock from '@/components/artisan-dashboard/FunnelBlock'

const mockUseSWR = vi.mocked(useSWR)

function setSWR(ret: { data?: unknown; error?: unknown; isLoading?: boolean }) {
  mockUseSWR.mockReturnValue({
    data: ret.data,
    error: ret.error ?? undefined,
    isLoading: ret.isLoading ?? false,
    mutate: vi.fn(),
    isValidating: false,
  } as never)
}

describe('<FunnelBlock />', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('skeleton quand isLoading', () => {
    setSWR({ isLoading: true })
    render(<FunnelBlock />)
    expect(screen.getByLabelText('Chargement du funnel de conversion')).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })

  it('retourne null si error', () => {
    setSWR({ error: new Error('x') })
    const { container } = render(<FunnelBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('empty state si aucun lead', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 0, viewed: 0, quoted: 0, declined: 0, pending: 0 },
        rates: { responseRate: null, quoteRate: null, declineRate: null },
        responseMedianMinutes: null,
        previousPeriod: { assigned: 0, responseRate: null },
      },
    })
    render(<FunnelBlock />)
    expect(screen.getByText(/Aucune demande reçue/i)).toBeInTheDocument()
  })

  it('nudge amber + message dispatch si responseRate<50', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 3, quoted: 1, declined: 0, pending: 7 },
        rates: { responseRate: 30, quoteRate: 33.3, declineRate: 0 },
        responseMedianMinutes: 120,
        previousPeriod: { assigned: 5, responseRate: 40 },
      },
    })
    render(<FunnelBlock />)
    expect(screen.getByText(/Votre taux de réponse est inférieur à 50%/i)).toBeInTheDocument()
    expect(screen.getAllByText(/30%/).length).toBeGreaterThan(0)
  })

  it('nudge green si responseRate≥80', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 9, quoted: 5, declined: 1, pending: 0 },
        rates: { responseRate: 90, quoteRate: 55.6, declineRate: 11.1 },
        responseMedianMinutes: 5,
        previousPeriod: { assigned: 5, responseRate: 85 },
      },
    })
    render(<FunnelBlock />)
    expect(screen.getByText(/Excellent taux de réponse/i)).toBeInTheDocument()
  })

  it('delta affiché avec signe + vs previousPeriod', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 7, quoted: 2, declined: 1, pending: 1 },
        rates: { responseRate: 70, quoteRate: 28.6, declineRate: 14.3 },
        responseMedianMinutes: 45,
        previousPeriod: { assigned: 5, responseRate: 60 },
      },
    })
    render(<FunnelBlock />)
    // delta = 70 - 60 = 10 pt
    expect(screen.getByText(/\+10 pt/)).toBeInTheDocument()
  })

  it('formatte le délai médian en minutes / heures / jours', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 7, quoted: 2, declined: 1, pending: 1 },
        rates: { responseRate: 70, quoteRate: 28.6, declineRate: 14.3 },
        responseMedianMinutes: 45,
        previousPeriod: { assigned: 5, responseRate: 60 },
      },
    })
    const { rerender } = render(<FunnelBlock />)
    expect(screen.getByText('45 min')).toBeInTheDocument()

    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 7, quoted: 2, declined: 1, pending: 1 },
        rates: { responseRate: 70, quoteRate: 28.6, declineRate: 14.3 },
        responseMedianMinutes: 90, // 1h30
        previousPeriod: { assigned: 5, responseRate: 60 },
      },
    })
    rerender(<FunnelBlock />)
    expect(screen.getByText('1 h 30')).toBeInTheDocument()

    setSWR({
      data: {
        days: 30,
        counts: { assigned: 10, viewed: 7, quoted: 2, declined: 1, pending: 1 },
        rates: { responseRate: 70, quoteRate: 28.6, declineRate: 14.3 },
        responseMedianMinutes: 60 * 24 * 2, // 2 jours
        previousPeriod: { assigned: 5, responseRate: 60 },
      },
    })
    rerender(<FunnelBlock />)
    expect(screen.getByText('2 j')).toBeInTheDocument()
  })

  it('lien "Voir les demandes"', () => {
    setSWR({
      data: {
        days: 30,
        counts: { assigned: 5, viewed: 3, quoted: 1, declined: 0, pending: 2 },
        rates: { responseRate: 60, quoteRate: 33.3, declineRate: 0 },
        responseMedianMinutes: 30,
        previousPeriod: { assigned: 0, responseRate: null },
      },
    })
    render(<FunnelBlock />)
    const link = screen.getByRole('link', { name: /Voir les demandes/i })
    expect(link).toHaveAttribute('href', '/espace-artisan/demandes')
  })
})
