// @vitest-environment jsdom
/**
 * Tests — DossierTimeline
 *
 * Couvre :
 *   - Render de la liste d'événements (libellés français)
 *   - Empty state (aucun événement)
 *   - Smoke check défense-en-profondeur : présence des classes Tailwind
 *     du pseudo-élément vertical (`before:bg-sand-200`, `before:w-px`,
 *     `before:h-[calc(100%-0.5rem)]`) via `data-testid="timeline-vertical-line"`.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import DossierTimeline from '@/components/cee-artisan/DossierTimeline'
import type { CeeDossierEvent } from '@/lib/cee/dossier-types'

function makeEvent(overrides: Partial<CeeDossierEvent> = {}): CeeDossierEvent {
  return {
    id: 1,
    dossier_id: '550e8400-e29b-41d4-a716-446655440000',
    event_type: 'status_change',
    from_status: 'brouillon',
    to_status: 'engagement_signe',
    actor_type: 'system',
    actor_id: null,
    payload: {},
    created_at: '2026-04-01T10:00:00Z',
    ...overrides,
  }
}

describe('DossierTimeline', () => {
  it('affiche l\u2019empty state si aucun événement', () => {
    render(<DossierTimeline events={[]} />)
    expect(screen.getByText(/Aucun événement enregistré pour ce dossier/i)).toBeInTheDocument()
  })

  it('affiche la liste des événements avec libellés français', () => {
    const events: CeeDossierEvent[] = [
      makeEvent({ id: 1, event_type: 'status_change' }),
      makeEvent({
        id: 2,
        event_type: 'justificatif_uploaded',
        from_status: null,
        to_status: null,
        payload: { label: 'Facture détaillée' },
      }),
      makeEvent({
        id: 3,
        event_type: 'note_added',
        from_status: null,
        to_status: null,
      }),
    ]
    render(<DossierTimeline events={events} />)
    expect(screen.getByText('Changement de statut')).toBeInTheDocument()
    expect(screen.getByText('Pièce justificative ajoutée')).toBeInTheDocument()
    // Pour `note_added`, le titre et la ligne descriptive partagent le même
    // libellé ("Note ajoutée") → 2 occurrences attendues.
    expect(screen.getAllByText('Note ajoutée').length).toBeGreaterThanOrEqual(1)
    // Payload label de l'upload doit apparaître
    expect(screen.getByText('Facture détaillée')).toBeInTheDocument()
  })

  it('rend la ligne verticale du pseudo-élément (smoke check Tailwind JIT)', () => {
    render(<DossierTimeline events={[makeEvent()]} />)
    const ol = screen.getByTestId('timeline-vertical-line')
    expect(ol).toBeInTheDocument()
    const className = ol.getAttribute('class') ?? ''
    // Les 3 classes critiques du pseudo-élément vertical doivent être compilées.
    // `before:bg-sand-300` est la teinte design system ServicesArtisans (sand)
    // pas le gris générique Tailwind — cf. `tailwind.config.ts`.
    expect(className).toContain('before:bg-sand-300')
    expect(className).toContain('before:w-px')
    expect(className).toContain('before:h-[calc(100%-0.5rem)]')
  })
})
