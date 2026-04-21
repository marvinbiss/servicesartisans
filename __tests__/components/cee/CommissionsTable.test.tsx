/**
 * Tests -- CommissionsTable
 *
 * Couvre :
 *   - Empty state si liste vide
 *   - Affichage erreur si loadError=true
 *   - Rendu tableau avec donnees
 *   - Statuts affichés avec libellés français
 *   - Bouton export CSV présent et déclenche le téléchargement
 *   - Mobile cards rendues
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import CommissionsTable from '@/components/cee-artisan/CommissionsTable'
import type { CeeCommissionRow } from '@/app/(private)/espace-artisan/cee/commissions/page'

function makeCommission(overrides: Partial<CeeCommissionRow> = {}): CeeCommissionRow {
  return {
    id: 'comm-uuid-001',
    dossier_id: 'doss-uuid-001',
    operation_code: 'BAR-TH-171',
    montant_eur: 420,
    status: 'confirmed',
    versement_date: '2026-03-15T00:00:00Z',
    iban_last4: '8723',
    created_at: '2026-03-15T00:00:00Z',
    ...overrides,
  }
}

describe('CommissionsTable -- empty state', () => {
  it('affiche le message Aucune commission si liste vide', () => {
    render(<CommissionsTable commissions={[]} loadError={false} />)
    expect(screen.getByText(/Aucune commission enregistr/i)).toBeInTheDocument()
  })

  it('ne rend pas le tableau si liste vide', () => {
    render(<CommissionsTable commissions={[]} loadError={false} />)
    expect(screen.queryByRole('table')).toBeNull()
  })
})

describe('CommissionsTable -- erreur chargement', () => {
  it('affiche le message erreur si loadError=true', () => {
    render(<CommissionsTable commissions={[]} loadError={true} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Impossible de charger les commissions/i)).toBeInTheDocument()
  })
})

describe('CommissionsTable -- rendu donnees', () => {
  const commissions = [
    makeCommission({ status: 'confirmed', montant_eur: 420, operation_code: 'BAR-TH-171' }),
    makeCommission({
      id: 'comm-002',
      dossier_id: 'doss-002',
      status: 'due',
      montant_eur: 650,
      operation_code: 'BAR-EN-101',
      versement_date: null,
      iban_last4: null,
    }),
  ]

  it('affiche le tableau avec les lignes', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })

  it('affiche les libelles francais des statuts', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    expect(screen.getAllByText('Vers\u00e9').length).toBeGreaterThan(0)
    expect(screen.getAllByText('En attente').length).toBeGreaterThan(0)
  })

  it('affiche le code operation', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    expect(screen.getAllByText('BAR-TH-171').length).toBeGreaterThan(0)
    expect(screen.getAllByText('BAR-EN-101').length).toBeGreaterThan(0)
  })

  it('affiche les 4 derniers chiffres IBAN masques', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    expect(screen.getAllByText(/\*\*\*\*8723/).length).toBeGreaterThan(0)
  })

  it('affiche le tiret si versement_date est null', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    const dashes = screen.getAllByText('\u2014')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('affiche le nombre de versements', () => {
    render(<CommissionsTable commissions={commissions} loadError={false} />)
    expect(screen.getByText(/2 versements/i)).toBeInTheDocument()
  })
})

describe('CommissionsTable -- export CSV', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
    // Capture la ref brute du prototype AVANT vi.spyOn, sinon l'appel
    // `origCreate(tag)` depuis la mockImplementation retombe sur le spy
    // lui-même (stack overflow).
    const origCreate = Document.prototype.createElement
    vi.spyOn(document, 'createElement').mockImplementation(((
      tag: string,
      options?: ElementCreationOptions
    ) => {
      if (tag === 'a') {
        const a = origCreate.call(document, 'a', options)
        vi.spyOn(a, 'click').mockImplementation(() => {})
        return a
      }
      return origCreate.call(document, tag, options)
    }) as typeof document.createElement)
  })

  it('affiche le bouton export', () => {
    render(<CommissionsTable commissions={[makeCommission()]} loadError={false} />)
    expect(screen.getByRole('button', { name: /Exporter CSV/i })).toBeInTheDocument()
  })

  it('declenche la creation blob CSV au clic', () => {
    render(<CommissionsTable commissions={[makeCommission()]} loadError={false} />)
    fireEvent.click(screen.getByRole('button', { name: /Exporter CSV/i }))
    expect(vi.mocked(URL.createObjectURL)).toHaveBeenCalled()
  })
})
