/**
 * Tests — ReputationBlock
 *
 * Couvre :
 *  - loading skeleton, error null
 *  - empty state (flywheel démarre)
 *  - populated KPIs (avg rating, invitations 7j, completion rate)
 *  - action cards : pending response, pending invites, next scheduled
 *  - distribution bar rendering quand published > 0
 *  - lien /espace-artisan/avis
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('swr', () => ({ default: vi.fn() }))

import useSWR from 'swr'
import ReputationBlock from '@/components/artisan-dashboard/ReputationBlock'

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

const emptyData = {
  reviews: {
    total: 0,
    published: 0,
    avgRating: 0,
    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    pendingResponse: 0,
    latestPublishedAt: null,
  },
  invitations: {
    sent7d: 0,
    sent30d: 0,
    pending30d: 0,
    completed30d: 0,
    completionRate30d: null,
    nextScheduledAt: null,
  },
}

describe('<ReputationBlock />', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('skeleton quand isLoading', () => {
    setSWR({ isLoading: true })
    render(<ReputationBlock />)
    expect(screen.getByLabelText('Chargement de la réputation')).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })

  it('retourne null si error', () => {
    setSWR({ error: new Error('boom') })
    const { container } = render(<ReputationBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('empty state flywheel quand aucune review ni invite', () => {
    setSWR({ data: emptyData })
    render(<ReputationBlock />)
    expect(screen.getByText(/flywheel avis démarre bientôt/i)).toBeInTheDocument()
  })

  it("affiche le prochain envoi d'invitation dans l'empty state", () => {
    setSWR({
      data: {
        ...emptyData,
        invitations: {
          ...emptyData.invitations,
          nextScheduledAt: new Date(Date.now() + 5 * 86400000).toISOString(),
        },
      },
    })
    render(<ReputationBlock />)
    expect(screen.getByText(/Prochaine invitation prévue/i)).toBeInTheDocument()
  })

  it('KPIs populés : avg rating + invitations 7j + completionRate', () => {
    setSWR({
      data: {
        reviews: {
          total: 12,
          published: 10,
          avgRating: 4.6,
          distribution: { '1': 0, '2': 0, '3': 1, '4': 2, '5': 7 },
          pendingResponse: 0,
          latestPublishedAt: '2026-04-10T00:00:00Z',
        },
        invitations: {
          sent7d: 3,
          sent30d: 10,
          pending30d: 2,
          completed30d: 8,
          completionRate30d: 80,
          nextScheduledAt: null,
        },
      },
    })
    render(<ReputationBlock />)
    expect(screen.getByText('4.6')).toBeInTheDocument()
    expect(screen.getByText(/Note moyenne/i)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // sent7d
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText(/8\/10/i)).toBeInTheDocument()
  })

  it('affiche le CTA "avis en attente de votre réponse" si pendingResponse>0', () => {
    setSWR({
      data: {
        ...emptyData,
        reviews: { ...emptyData.reviews, published: 5, pendingResponse: 2, total: 5 },
        invitations: { ...emptyData.invitations, sent30d: 5 },
      },
    })
    render(<ReputationBlock />)
    const link = screen.getByRole('link', {
      name: /2 avis en attente de votre réponse/i,
    })
    expect(link).toHaveAttribute('href', '/espace-artisan/avis?filter=unresponded')
  })

  it('affiche "invitation en attente" au pluriel si pending30d>1', () => {
    setSWR({
      data: {
        ...emptyData,
        reviews: { ...emptyData.reviews, published: 1, total: 1 },
        invitations: { ...emptyData.invitations, sent30d: 3, pending30d: 3 },
      },
    })
    render(<ReputationBlock />)
    expect(screen.getByText(/3 invitations client en attente de réponse/i)).toBeInTheDocument()
  })

  it('lien "Gérer mes avis" vers /espace-artisan/avis', () => {
    setSWR({ data: emptyData })
    render(<ReputationBlock />)
    const link = screen.getByRole('link', { name: /Gérer mes avis/i })
    expect(link).toHaveAttribute('href', '/espace-artisan/avis')
  })
})
