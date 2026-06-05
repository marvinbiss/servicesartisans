// @vitest-environment jsdom
/**
 * Tests — DossierListCard (schéma V3, migration 431)
 *
 * Couvre :
 *   - Render avec données complètes (code opération, prime, statut, date devis)
 *   - Render avec prime/date null (affiche le fallback "—")
 *   - Lien href correct vers la page détail
 *   - StatusBadge affiche le libellé français de l'enum V3
 *   - Code postal affiché / masqué
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock next/link pour éviter le routeur — simple <a>
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
  } & React.HTMLAttributes<HTMLAnchorElement>) =>
    React.createElement('a', { href, ...rest }, children),
}))

import DossierListCard from '@/components/cee-artisan/DossierListCard'
import type { CeeDossierV3Row } from '@/lib/cee/dossiers-v3'

function makeDossier(overrides: Partial<CeeDossierV3Row> = {}): CeeDossierV3Row {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    reference: 'SAE-202604-000001',
    provider_id: 'prov-1',
    operation_code: 'BAR-TH-104',
    status: 'submitted_by_artisan',
    client_code_postal: '75011',
    date_devis: '2026-04-01T00:00:00Z',
    date_chantier_prevue: null,
    date_chantier_realisee: null,
    montant_ht_cts: 500000,
    montant_ttc_cts: 550000,
    prime_cee_cts: 100000,
    prime_total_cts: 124000,
    reste_a_charge_cts: 426000,
    commission_amount_cts: 50000,
    commission_status: 'pending',
    qa_score: null,
    metadata: {},
    created_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('DossierListCard', () => {
  it('affiche le code opération', () => {
    render(<DossierListCard dossier={makeDossier()} />)
    expect(screen.getByText('BAR-TH-104')).toBeInTheDocument()
  })

  it('affiche la prime (prime_total_cts/100) formatée en euros français', () => {
    render(<DossierListCard dossier={makeDossier({ prime_total_cts: 124000 })} />)
    // 124000 cts → 1 240 € (espace insécable)
    expect(screen.getByText(/1\s?240/)).toBeInTheDocument()
  })

  it('utilise prime_cee_cts en fallback si prime_total_cts est null', () => {
    render(
      <DossierListCard dossier={makeDossier({ prime_total_cts: null, prime_cee_cts: 80000 })} />
    )
    expect(screen.getByText(/800/)).toBeInTheDocument()
  })

  it('affiche le libellé français du statut V3 via StatusBadge', () => {
    render(<DossierListCard dossier={makeDossier({ status: 'submitted_by_artisan' })} />)
    expect(screen.getByText('Soumis')).toBeInTheDocument()
  })

  it('affiche le libellé pour le statut "validated_pncee"', () => {
    render(<DossierListCard dossier={makeDossier({ status: 'validated_pncee' })} />)
    expect(screen.getByText('Validé PNCEE')).toBeInTheDocument()
  })

  it('affiche "—" si la prime est null (total + cee)', () => {
    render(
      <DossierListCard dossier={makeDossier({ prime_total_cts: null, prime_cee_cts: null })} />
    )
    expect(screen.getAllByText(/—/).length).toBeGreaterThan(0)
  })

  it('affiche "—" si la date de devis est null', () => {
    render(<DossierListCard dossier={makeDossier({ date_devis: null, prime_total_cts: 50000 })} />)
    expect(screen.getAllByText(/—/).length).toBeGreaterThan(0)
  })

  it('pointe vers /espace-artisan/cee/[id]', () => {
    const dossier = makeDossier({ id: 'abc-123' })
    render(<DossierListCard dossier={dossier} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/espace-artisan/cee/abc-123')
  })

  it('affiche le code postal quand présent', () => {
    render(<DossierListCard dossier={makeDossier({ client_code_postal: '69001' })} />)
    expect(screen.getByText(/69001/)).toBeInTheDocument()
  })

  it("n'affiche pas la ligne code postal si client_code_postal est null", () => {
    const { container } = render(
      <DossierListCard dossier={makeDossier({ client_code_postal: null })} />
    )
    expect(container.textContent).not.toMatch(/Code postal :/)
  })
})
