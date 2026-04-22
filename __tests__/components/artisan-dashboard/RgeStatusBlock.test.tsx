/**
 * Tests — RgeStatusBlock
 *
 * Couvre les 5 branches de rendu :
 *  - loading (skeleton aria-busy)
 *  - error → null
 *  - hasRge=false → bandeau "Devenir RGE"
 *  - status=expired → bandeau rouge
 *  - status=expiring_soon → bandeau ambre
 *  - status=active → badge vert + date
 *
 * + liste qualifications (top 4, overflow), lien france-renov sécurisé.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('swr', () => ({ default: vi.fn() }))

import useSWR from 'swr'
import RgeStatusBlock from '@/components/artisan-dashboard/RgeStatusBlock'

const mockUseSWR = vi.mocked(useSWR)

type SWRReturn = {
  data?: unknown
  error?: unknown
  isLoading?: boolean
}

function setSWR(ret: SWRReturn) {
  mockUseSWR.mockReturnValue({
    data: ret.data,
    error: ret.error ?? undefined,
    isLoading: ret.isLoading ?? false,
    mutate: vi.fn(),
    isValidating: false,
  } as never)
}

describe('<RgeStatusBlock />', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('skeleton quand isLoading (aria-busy)', () => {
    setSWR({ isLoading: true })
    render(<RgeStatusBlock />)
    expect(screen.getByLabelText('Chargement du statut RGE')).toHaveAttribute('aria-busy', 'true')
  })

  it('retourne null si error', () => {
    setSWR({ error: new Error('boom') })
    const { container } = render(<RgeStatusBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si data absente', () => {
    setSWR({ data: undefined })
    const { container } = render(<RgeStatusBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('bandeau "Aucune qualification RGE détectée" quand hasRge=false', () => {
    setSWR({
      data: {
        hasRge: false,
        status: 'none',
        rgeValidUntil: null,
        daysUntilExpiry: null,
        qualifications: [],
        lastSyncedAt: null,
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText(/Aucune qualification RGE détectée/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Comment devenir RGE/i })
    expect(link).toHaveAttribute('href', 'https://www.france-renov.gouv.fr/devenir-rge')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('bandeau rouge si expired', () => {
    setSWR({
      data: {
        hasRge: true,
        status: 'expired',
        rgeValidUntil: '2026-01-01T00:00:00Z',
        daysUntilExpiry: -30,
        qualifications: [{ code: 'RGE-1', organisme: 'Qualibat' }],
        lastSyncedAt: null,
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText(/Votre qualification RGE est expirée/i)).toBeInTheDocument()
    expect(screen.getByText(/30 jours/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Qualibat/i).length).toBeGreaterThan(0)
  })

  it('bandeau ambre avec countdown si expiring_soon', () => {
    setSWR({
      data: {
        hasRge: true,
        status: 'expiring_soon',
        rgeValidUntil: '2026-05-01T00:00:00Z',
        daysUntilExpiry: 15,
        qualifications: [],
        lastSyncedAt: null,
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText(/RGE expire dans 15 jours/i)).toBeInTheDocument()
  })

  it('"jour" au singulier pour daysUntilExpiry=1', () => {
    setSWR({
      data: {
        hasRge: true,
        status: 'expiring_soon',
        rgeValidUntil: '2026-04-23T00:00:00Z',
        daysUntilExpiry: 1,
        qualifications: [],
        lastSyncedAt: null,
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText(/RGE expire dans 1 jour$/i)).toBeInTheDocument()
  })

  it('badge Active + date si active', () => {
    setSWR({
      data: {
        hasRge: true,
        status: 'active',
        rgeValidUntil: '2027-01-01T00:00:00Z',
        daysUntilExpiry: 250,
        qualifications: [{ code: 'RGE-1' }],
        lastSyncedAt: '2026-04-20T00:00:00Z',
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText(/\(250 jours\)/)).toBeInTheDocument()
  })

  it('affiche + N autres qualifications si >4', () => {
    setSWR({
      data: {
        hasRge: true,
        status: 'active',
        rgeValidUntil: '2027-01-01T00:00:00Z',
        daysUntilExpiry: 200,
        qualifications: [1, 2, 3, 4, 5, 6].map((i) => ({ code: `RGE-${i}` })),
        lastSyncedAt: null,
        sourceUrl: null,
      },
    })
    render(<RgeStatusBlock />)
    expect(screen.getByText(/\+ 2 autres qualifications/i)).toBeInTheDocument()
  })
})
