// @vitest-environment jsdom
/**
 * Tests — NextActionsBlock sous conditions adverses
 *
 * Quand SWR renvoie une erreur sur un endpoint, data=undefined côté hook.
 * NextActionsBlock doit continuer à fonctionner avec les sources disponibles
 * sans crasher ni afficher de fausse priorité.
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

function wireMixed(src: Sources, errored: Set<string>) {
  mockUseSWR.mockImplementation((key: unknown) => {
    const url = typeof key === 'string' ? key : ''
    let dataKey: keyof Sources | null = null
    if (url.includes('/rge')) dataKey = 'rge'
    else if (url.includes('/reputation')) dataKey = 'rep'
    else if (url.includes('/funnel')) dataKey = 'funnel'
    else if (url.includes('/stats')) dataKey = 'stats'

    const isErrored = dataKey != null && errored.has(dataKey)
    return {
      data: isErrored ? undefined : dataKey ? src[dataKey] : undefined,
      error: isErrored ? new Error('boom') : undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as never
  })
}

describe('<NextActionsBlock /> — partial failure', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('2 sur 4 en erreur (funnel+stats) : reste fonctionnel sur rge+rep', () => {
    wireMixed(
      {
        rge: { hasRge: true, status: 'expired', daysUntilExpiry: -10 }, // P0
        rep: { reviews: { pendingResponse: 3 }, invitations: { nextScheduledAt: null } }, // P1
      },
      new Set(['funnel', 'stats'])
    )
    render(<NextActionsBlock />)
    // Doit afficher P0 RGE et P1 avis, mais pas de P0 pending leads (source KO)
    expect(screen.getByText(/RGE est expirée/i)).toBeInTheDocument()
    expect(screen.getByText(/3 avis en attente/i)).toBeInTheDocument()
    expect(screen.queryByText(/demandes non consultées/i)).not.toBeInTheDocument()
  })

  it('toutes les sources en erreur : bloc masque (ni skeleton infini, ni faux inbox zero)', () => {
    wireMixed({}, new Set(['rge', 'rep', 'funnel', 'stats']))
    const { container } = render(<NextActionsBlock />)
    // Audit 2026-06-06 : 4 sources en erreur -> return null. Un skeleton
    // permanent ou un "Tout est sous controle" seraient mensongers.
    expect(container.firstChild).toBeNull()
  })

  it('seule source rep disponible : affiche uniquement action rep', () => {
    wireMixed(
      {
        rep: { reviews: { pendingResponse: 5 }, invitations: { nextScheduledAt: null } },
      },
      new Set(['rge', 'funnel', 'stats'])
    )
    render(<NextActionsBlock />)
    expect(screen.getByText(/5 avis en attente/i)).toBeInTheDocument()
    // Pas d'action RGE ni funnel
    expect(screen.queryByText(/RGE/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Taux de réponse/i)).not.toBeInTheDocument()
  })

  it('mélange : rge OK + rep KO + funnel OK + stats KO', () => {
    wireMixed(
      {
        rge: { hasRge: false, status: 'none', daysUntilExpiry: null }, // P2
        funnel: { counts: { pending: 4, assigned: 10 }, rates: { responseRate: 70 } },
      },
      new Set(['rep', 'stats'])
    )
    render(<NextActionsBlock />)
    // "Devenir RGE" (P2) et pas d'autres sources
    expect(screen.getByText(/Devenez Reconnu Garant/i)).toBeInTheDocument()
    // pending=4 dans funnel → pending lead action (P0) car on lit counts.pending
    expect(screen.getByText(/4 demandes non consultées/i)).toBeInTheDocument()
  })
})
