// @vitest-environment jsdom
/**
 * Tests -- NouveauDossierForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/cee/climate-zones', () => ({
  postalCodeToClimateZone: (cp: string) => {
    if (cp === '75011') return 'H1'
    if (cp === '13001') return 'H3'
    return null
  },
}))

import NouveauDossierForm from '@/components/cee-artisan/NouveauDossierForm'

const BASE_PROPS = {
  providerId: 'prov-test-123',
  providerName: 'Dupont Plomberie',
  rgeQualifications: [{ code: 'QualiPAC', date_fin: '2027-12-31' }],
  isCertified: true,
}

describe('NouveauDossierForm -- blocage formation', () => {
  it('affiche alerte si isCertified=false', () => {
    render(<NouveauDossierForm {...BASE_PROPS} isCertified={false} />)
    expect(screen.getByText(/Formation obligatoire requise/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Acc\u00e9der \u00e0 la formation/i })
    ).toBeInTheDocument()
  })

  it('ne rend pas alerte si certifie', () => {
    render(<NouveauDossierForm {...BASE_PROPS} isCertified={true} />)
    expect(screen.queryByText(/Formation obligatoire/i)).toBeNull()
  })
})

describe('NouveauDossierForm -- etape Client', () => {
  it('affiche les champs de etape 1', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/T\u00e9l\u00e9phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse du chantier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument()
  })

  it('affiche le stepper avec 4 etapes', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    expect(
      screen.getByRole('navigation', { name: /\u00c9tapes du formulaire/i })
    ).toBeInTheDocument()
    const stepNav = screen.getByRole('navigation', { name: /\u00c9tapes du formulaire/i })
    const buttons = stepNav.querySelectorAll('button')
    expect(buttons.length).toBe(4)
  })

  it('affiche les erreurs de validation si on clique Suivant sans remplir', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
    expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument()
    expect(screen.getByText(/Adresse email invalide/i)).toBeInTheDocument()
  })

  it('ne passe pas etape 2 si email invalide', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'Jean Test' } })
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByLabelText(/T\u00e9l\u00e9phone/i), {
      target: { value: '0612345678' },
    })
    fireEvent.change(screen.getByLabelText(/Adresse du chantier/i), {
      target: { value: '12 rue Test' },
    })
    fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '75011' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument()
    expect(screen.getByText(/Adresse email invalide/i)).toBeInTheDocument()
  })
})

describe('NouveauDossierForm -- navigation etape 1 vers 2', () => {
  function fillStep1AndNext() {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'Jean Test' } })
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'jean@test.fr' } })
    fireEvent.change(screen.getByLabelText(/T\u00e9l\u00e9phone/i), {
      target: { value: '0612345678' },
    })
    fireEvent.change(screen.getByLabelText(/Adresse du chantier/i), {
      target: { value: '12 rue de la Paix' },
    })
    fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '75011' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
  }

  it('affiche etape Chantier apres validation client', () => {
    fillStep1AndNext()
    expect(screen.getByText(/Type de logement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Surface habitable/i)).toBeInTheDocument()
  })

  it('affiche le bouton Precedent a etape 2', () => {
    fillStep1AndNext()
    expect(screen.getByRole('button', { name: /Pr\u00e9c\u00e9dent/i })).toBeInTheDocument()
  })
})

describe('NouveauDossierForm -- submit OK', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'new-dossier-id-456' }),
      })
    )
  })

  it('appelle POST /api/cee/dossiers avec les bonnes donnees', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)

    // Etape 1
    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'Jean Test' } })
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'jean@test.fr' } })
    fireEvent.change(screen.getByLabelText(/T\u00e9l\u00e9phone/i), {
      target: { value: '0612345678' },
    })
    fireEvent.change(screen.getByLabelText(/Adresse du chantier/i), {
      target: { value: '12 rue Test' },
    })
    fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '75011' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    // Etape 2
    fireEvent.change(screen.getByLabelText(/Type de logement/i), { target: { value: 'maison' } })
    fireEvent.change(screen.getByLabelText(/Surface habitable/i), { target: { value: '85' } })
    fireEvent.change(screen.getByLabelText(/Ann\u00e9e de construction/i), {
      target: { value: '1985' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    // Etape 3
    await waitFor(() => expect(screen.getByLabelText(/Op\u00e9ration CEE/i)).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/Op\u00e9ration CEE/i), {
      target: { value: 'BAR-TH-171' },
    })
    await waitFor(() => expect(screen.getByLabelText(/ETAS/i)).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/ETAS/i), { target: { value: '111' } })
    fireEvent.change(screen.getByLabelText(/COP/i), { target: { value: '3.8' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    // Etape 4 apercu
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Cr\u00e9er le dossier/i })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Cr\u00e9er le dossier/i }))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/cee/dossiers',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
})

describe('NouveauDossierForm -- submit erreur API', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Erreur serveur interne' }),
      })
    )
  })

  it('affiche le message erreur retourne par API', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)

    fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: 'Jean Test' } })
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'jean@test.fr' } })
    fireEvent.change(screen.getByLabelText(/T\u00e9l\u00e9phone/i), {
      target: { value: '0612345678' },
    })
    fireEvent.change(screen.getByLabelText(/Adresse du chantier/i), {
      target: { value: '12 rue Test' },
    })
    fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '75011' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    fireEvent.change(screen.getByLabelText(/Type de logement/i), { target: { value: 'maison' } })
    fireEvent.change(screen.getByLabelText(/Surface habitable/i), { target: { value: '85' } })
    fireEvent.change(screen.getByLabelText(/Ann\u00e9e de construction/i), {
      target: { value: '1985' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    await waitFor(() => expect(screen.getByLabelText(/Op\u00e9ration CEE/i)).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/Op\u00e9ration CEE/i), {
      target: { value: 'BAR-TH-171' },
    })
    await waitFor(() => expect(screen.getByLabelText(/ETAS/i)).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/ETAS/i), { target: { value: '111' } })
    fireEvent.change(screen.getByLabelText(/COP/i), { target: { value: '3.8' } })
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Cr\u00e9er le dossier/i })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Cr\u00e9er le dossier/i }))

    await waitFor(() => expect(screen.getByText(/Erreur serveur interne/i)).toBeInTheDocument())
  })
})
