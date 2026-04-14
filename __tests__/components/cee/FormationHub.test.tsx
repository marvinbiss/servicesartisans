/**
 * Tests -- FormationHub
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import FormationHub from '@/components/cee-artisan/FormationHub'

const BASE_PROPS = {
  providerId: 'prov-test-123',
  certifiedAt: null,
  certificationScore: null,
  trainingCompletedAt: null,
  needsRecycling: false,
}

describe('FormationHub -- badge certifie', () => {
  it('affiche le badge si certifiedAt est renseigne et pas de recyclage', () => {
    render(
      <FormationHub
        {...BASE_PROPS}
        certifiedAt="2026-01-15T00:00:00Z"
        certificationScore={9}
        needsRecycling={false}
      />
    )
    expect(screen.getByText(/Certifi\u00e9 CEE SA Energy/i)).toBeInTheDocument()
    expect(screen.getByText(/Score : 9\/10/i)).toBeInTheDocument()
  })

  it('ne rend pas le badge si certifiedAt est null', () => {
    render(<FormationHub {...BASE_PROPS} />)
    expect(screen.queryByText(/Certifi\u00e9 CEE SA Energy/i)).toBeNull()
  })
})

describe('FormationHub -- alerte recyclage', () => {
  it('affiche alerte recyclage si needsRecycling=true', () => {
    render(
      <FormationHub {...BASE_PROPS} certifiedAt="2025-01-01T00:00:00Z" needsRecycling={true} />
    )
    expect(screen.getByText(/Recyclage annuel requis/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('ne rend pas alerte si needsRecycling=false', () => {
    render(
      <FormationHub {...BASE_PROPS} certifiedAt="2026-03-01T00:00:00Z" needsRecycling={false} />
    )
    expect(screen.queryByText(/Recyclage annuel requis/i)).toBeNull()
  })
})

describe('FormationHub -- modules video', () => {
  it('affiche 4 modules video', () => {
    render(<FormationHub {...BASE_PROPS} />)
    expect(screen.getByText(/Introduction au dispositif CEE/i)).toBeInTheDocument()
    expect(screen.getByText(/Montage d/i)).toBeInTheDocument()
    const watchButtons = screen.getAllByRole('button', { name: /Regarder/i })
    expect(watchButtons.length).toBe(4)
  })

  it('bloque le quiz tant que les videos ne sont pas regardees', () => {
    render(<FormationHub {...BASE_PROPS} />)
    expect(screen.getByText(/Regardez tous les modules/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /D\u00e9marrer le quiz/i })).toBeNull()
  })

  it('deverrouille le quiz apres avoir regarde toutes les videos', async () => {
    render(<FormationHub {...BASE_PROPS} />)

    for (let i = 0; i < 4; i++) {
      const watchBtns = screen.getAllByRole('button', { name: /Regarder/i })
      fireEvent.click(watchBtns[0])
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Marquer comme vu/i })).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: /Marquer comme vu/i }))
    }

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /D\u00e9marrer le quiz/i })).toBeInTheDocument()
    )
  })
})

describe('FormationHub -- quiz score suffisant', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ score: 9, passed: true }),
      })
    )
  })

  async function openQuiz() {
    render(
      <FormationHub {...BASE_PROPS} certifiedAt="2026-01-01T00:00:00Z" needsRecycling={true} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Repasser le quiz/i }))
    await waitFor(() =>
      expect(screen.getByRole('list', { name: /Questions du quiz/i })).toBeInTheDocument()
    )
  }

  it('affiche 10 questions apres demarrage', async () => {
    await openQuiz()
    const fieldsets = screen.getAllByRole('group')
    expect(fieldsets.length).toBeGreaterThanOrEqual(10)
  })

  it('affiche le resultat succes apres soumission avec score >= 8', async () => {
    await openQuiz()
    const radioGroups = screen.getAllByRole('group')
    for (const group of radioGroups) {
      const radios = group.querySelectorAll('input[type="radio"]')
      if (radios.length > 0) fireEvent.click(radios[0])
    }
    fireEvent.click(screen.getByRole('button', { name: /Valider mes r\u00e9ponses/i }))
    await waitFor(() => expect(screen.getByText(/9 \/ 10/i)).toBeInTheDocument())
    expect(screen.getByText(/F\u00e9licitations/i)).toBeInTheDocument()
  })
})

describe('FormationHub -- quiz score insuffisant', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ score: 5, passed: false }),
      })
    )
  })

  it('affiche le bouton Repasser si score < 8', async () => {
    render(
      <FormationHub {...BASE_PROPS} certifiedAt="2026-01-01T00:00:00Z" needsRecycling={true} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Repasser le quiz/i }))
    await waitFor(() =>
      expect(screen.getByRole('list', { name: /Questions du quiz/i })).toBeInTheDocument()
    )
    const radioGroups = screen.getAllByRole('group')
    for (const group of radioGroups) {
      const radios = group.querySelectorAll('input[type="radio"]')
      if (radios.length > 0) fireEvent.click(radios[0])
    }
    fireEvent.click(screen.getByRole('button', { name: /Valider mes r\u00e9ponses/i }))
    await waitFor(() => expect(screen.getByText(/5 \/ 10/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Repasser le quiz/i })).toBeInTheDocument()
  })
})

describe('FormationHub -- erreur API quiz', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Erreur interne serveur' }),
      })
    )
  })

  it('affiche le message erreur en cas echec API', async () => {
    render(
      <FormationHub {...BASE_PROPS} certifiedAt="2026-01-01T00:00:00Z" needsRecycling={true} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Repasser le quiz/i }))
    await waitFor(() =>
      expect(screen.getByRole('list', { name: /Questions du quiz/i })).toBeInTheDocument()
    )
    const radioGroups = screen.getAllByRole('group')
    for (const group of radioGroups) {
      const radios = group.querySelectorAll('input[type="radio"]')
      if (radios.length > 0) fireEvent.click(radios[0])
    }
    fireEvent.click(screen.getByRole('button', { name: /Valider mes r\u00e9ponses/i }))
    await waitFor(() => expect(screen.getByText(/Erreur interne serveur/i)).toBeInTheDocument())
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
