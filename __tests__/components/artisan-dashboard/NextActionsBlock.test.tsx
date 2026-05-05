// @vitest-environment jsdom
/**
 * Tests — NextActionsBlock
 *
 * Couvre la logique de priorisation multi-source :
 *  - Loading (toutes sources undefined)
 *  - Inbox zero (aucun signal)
 *  - P0 RGE expired en tête
 *  - P0 pending leads
 *  - P1 expiring_soon, avis non-répondu, responseRate<50 (avec assigned>=3)
 *  - P1 messages non lus
 *  - P2 pas RGE, <3 photos
 *  - Tri p0 → p1 → p2
 *  - Overflow "+ N autres actions"
 *
 * NextActionsBlock consomme 4 clés SWR — on mocke useSWR par URL passée.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('swr', () => ({ default: vi.fn() }))

import useSWR from 'swr'
import NextActionsBlock from '@/components/artisan-dashboard/NextActionsBlock'

const mockUseSWR = vi.mocked(useSWR)

type Sources = {
  rge?: unknown
  rep?: unknown
  funnel?: unknown
  stats?: unknown
}

function wireSources(src: Sources) {
  mockUseSWR.mockImplementation((key: unknown) => {
    const url = typeof key === 'string' ? key : ''
    let data: unknown
    if (url.includes('/rge')) data = src.rge
    else if (url.includes('/reputation')) data = src.rep
    else if (url.includes('/funnel')) data = src.funnel
    else if (url.includes('/stats')) data = src.stats
    return {
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never
  })
}

describe('<NextActionsBlock />', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('loading quand toutes les sources sont vides', () => {
    wireSources({}) // 4 useSWR retournent data=undefined
    render(<NextActionsBlock />)
    expect(screen.getByLabelText('Chargement des actions prioritaires')).toBeInTheDocument()
  })

  it('inbox zero quand aucun signal problématique', () => {
    wireSources({
      rge: { hasRge: true, status: 'active', daysUntilExpiry: 200 },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 10 }, rates: { responseRate: 90 } },
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    expect(screen.getByText(/inbox zero/i)).toBeInTheDocument()
  })

  it('place RGE expiré en P0 (premier)', () => {
    wireSources({
      rge: { hasRge: true, status: 'expired', daysUntilExpiry: -10 },
      rep: { reviews: { pendingResponse: 1 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 5 }, rates: { responseRate: 80 } },
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    const items = screen.getAllByRole('listitem')
    // Le premier item doit contenir "RGE est expirée"
    expect(items[0].textContent).toMatch(/RGE est expirée/i)
  })

  it('P0 pending leads surface avec le count', () => {
    wireSources({
      rge: { hasRge: true, status: 'active', daysUntilExpiry: 200 },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 4, assigned: 10 }, rates: { responseRate: 80 } },
      stats: {
        stats: { pendingDemandesCount: 4, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    expect(screen.getByText(/4 demandes non consultées/i)).toBeInTheDocument()
  })

  it('P1 responseRate<50 uniquement si assigned>=3 (évite faux positif tôt)', () => {
    wireSources({
      rge: { hasRge: true, status: 'active', daysUntilExpiry: 200 },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 2 }, rates: { responseRate: 30 } }, // 2 < 3
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    // Doit être inbox zero car 2 < 3
    expect(screen.queryByText(/Taux de réponse à/i)).not.toBeInTheDocument()
  })

  it('P1 responseRate<50 apparaît si assigned≥3', () => {
    wireSources({
      rge: { hasRge: true, status: 'active', daysUntilExpiry: 200 },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 5 }, rates: { responseRate: 30 } },
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    expect(screen.getByText(/Taux de réponse à 30%/i)).toBeInTheDocument()
  })

  it('P2 devenir RGE si hasRge=false', () => {
    wireSources({
      rge: { hasRge: false, status: 'none', daysUntilExpiry: null },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 0 }, rates: { responseRate: null } },
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    expect(screen.getByText(/Devenez Reconnu Garant/i)).toBeInTheDocument()
  })

  it('P2 portfolio thin si <3 photos', () => {
    wireSources({
      rge: { hasRge: true, status: 'active', daysUntilExpiry: 200 },
      rep: { reviews: { pendingResponse: 0 }, invitations: { nextScheduledAt: null } },
      funnel: { counts: { pending: 0, assigned: 0 }, rates: { responseRate: null } },
      stats: {
        stats: { pendingDemandesCount: 0, unreadMessages: 0, portfolioPhotoCount: 1 },
      },
    })
    render(<NextActionsBlock />)
    expect(screen.getByText(/Seulement 1 photo sur votre profil/i)).toBeInTheDocument()
  })

  it('tri : P0 avant P1 avant P2', () => {
    wireSources({
      rge: { hasRge: false, status: 'none', daysUntilExpiry: null }, // P2 devenir RGE
      rep: { reviews: { pendingResponse: 2 }, invitations: { nextScheduledAt: null } }, // P1
      funnel: { counts: { pending: 3, assigned: 10 }, rates: { responseRate: 60 } }, // P0 pending leads
      stats: {
        stats: { pendingDemandesCount: 3, unreadMessages: 0, portfolioPhotoCount: 5 },
      },
    })
    render(<NextActionsBlock />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(3)
    // Premier = P0 pending leads (P0 RGE absent)
    expect(items[0].textContent).toMatch(/3 demandes non consultées/i)
    // Le dernier rendu doit être P2 devenir RGE
    expect(items[items.length - 1].textContent).toMatch(/Devenez Reconnu Garant/i)
  })

  it('overflow : affiche "+ N autres actions" si plus de 5', () => {
    wireSources({
      rge: { hasRge: false, status: 'expired', daysUntilExpiry: -10 }, // P0
      rep: { reviews: { pendingResponse: 5 }, invitations: { nextScheduledAt: null } }, // P1
      funnel: { counts: { pending: 3, assigned: 10 }, rates: { responseRate: 30 } }, // P0 + P1
      stats: {
        stats: { pendingDemandesCount: 3, unreadMessages: 4, portfolioPhotoCount: 0 },
      },
    })
    render(<NextActionsBlock />)
    // hasRge=false → "Devenir RGE" P2 ; + rge expired P0 ; + pending P0 ;
    // + avis P1 ; + responseRate P1 ; + messages P1 ; + portfolio P2 = 7 actions
    expect(screen.getByText(/\+ \d+ autres? actions? moins prioritaires?/i)).toBeInTheDocument()
  })
})
