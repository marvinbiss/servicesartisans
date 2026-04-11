/**
 * Tests — DossierListCard
 *
 * Couvre :
 *   - Render avec données complètes (code opération, prime, statut, date)
 *   - Render avec prime/date null (affiche le fallback "—")
 *   - Lien href correct vers la page détail
 *   - StatusBadge affiche le libellé français
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
import type { CeeDossier } from '@/lib/cee/dossier-types'

function makeDossier(overrides: Partial<CeeDossier> = {}): CeeDossier {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    devis_id: null,
    client_id: null,
    provider_id: 'prov-1',
    delegataire_id: null,
    operation_code: 'BAR-TH-104',
    status: 'engagement_signe',
    date_engagement: '2026-04-01T00:00:00Z',
    date_pre_visite: null,
    date_debut_travaux: null,
    date_fin_travaux: null,
    date_ah_signature: null,
    date_depot_delegataire: null,
    date_depot_pncee: null,
    date_validation: null,
    zone_climatique: 'H1',
    postal_code: '75011',
    kwhc_estime: 150_000,
    kwhc_depose: null,
    prime_estimee_eur: 1240,
    prime_versee_eur: null,
    precarite: false,
    justificatifs: [],
    rejection_reason: null,
    notes: null,
    metadata: {},
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('DossierListCard', () => {
  it('affiche le code opération', () => {
    render(<DossierListCard dossier={makeDossier()} />)
    expect(screen.getByText('BAR-TH-104')).toBeInTheDocument()
  })

  it('affiche la prime estimée formatée en euros français', () => {
    render(<DossierListCard dossier={makeDossier({ prime_estimee_eur: 1240 })} />)
    // Intl.NumberFormat('fr-FR', EUR) => "1 240 €" (espace insécable)
    expect(screen.getByText(/1\s?240/)).toBeInTheDocument()
  })

  it('affiche le libellé français du statut via StatusBadge', () => {
    render(<DossierListCard dossier={makeDossier({ status: 'engagement_signe' })} />)
    expect(screen.getByText('Engagement signé')).toBeInTheDocument()
  })

  it('affiche le libellé français pour le statut "valide"', () => {
    render(<DossierListCard dossier={makeDossier({ status: 'valide' })} />)
    expect(screen.getByText('Validé')).toBeInTheDocument()
  })

  it('affiche "—" si la prime est null', () => {
    render(<DossierListCard dossier={makeDossier({ prime_estimee_eur: null })} />)
    // Le tiret em-dash apparaît dans la zone prime
    expect(screen.getAllByText(/—/).length).toBeGreaterThan(0)
  })

  it('affiche "—" si la date d\'engagement est null', () => {
    render(
      <DossierListCard
        dossier={makeDossier({
          date_engagement: null,
          prime_estimee_eur: 500,
        })}
      />
    )
    expect(screen.getAllByText(/—/).length).toBeGreaterThan(0)
  })

  it('pointe vers /espace-artisan/cee/[id]', () => {
    const dossier = makeDossier({ id: 'abc-123' })
    render(<DossierListCard dossier={dossier} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/espace-artisan/cee/abc-123')
  })

  it('affiche la zone climatique et le code postal quand présents', () => {
    render(
      <DossierListCard dossier={makeDossier({ zone_climatique: 'H2', postal_code: '69001' })} />
    )
    expect(screen.getByText(/H2/)).toBeInTheDocument()
    expect(screen.getByText(/69001/)).toBeInTheDocument()
  })

  it("n'affiche pas la ligne zone si postal_code est null", () => {
    const { container } = render(<DossierListCard dossier={makeDossier({ postal_code: null })} />)
    expect(container.textContent).not.toMatch(/Zone :/)
  })
})
