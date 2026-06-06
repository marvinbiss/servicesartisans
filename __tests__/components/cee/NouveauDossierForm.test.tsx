// @vitest-environment jsdom
/**
 * Tests -- NouveauDossierForm (payload DossierClientInputSchema)
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

vi.mock('@/lib/api/adresse', () => ({
  getCommunesByCodePostal: vi.fn(async (cp: string) => {
    if (cp === '75011') {
      return [{ citycode: '75056', city: 'Paris', name: 'Paris', postcode: '75011' }]
    }
    return []
  }),
}))

import NouveauDossierForm from '@/components/cee-artisan/NouveauDossierForm'

const BASE_PROPS = {
  rgeQualifications: [{ code: 'QualiPAC', date_fin: '2027-12-31' }],
  isCertified: true,
  commissionRate: 10,
}

async function fillStep1AndNext() {
  fireEvent.change(screen.getByLabelText(/^Nom/i), { target: { value: 'Test' } })
  fireEvent.change(screen.getByLabelText(/Prénom/i), { target: { value: 'Jean' } })
  fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'jean@test.fr' } })
  fireEvent.change(screen.getByLabelText(/Téléphone/i), {
    target: { value: '0612345678' },
  })
  fireEvent.change(screen.getByLabelText(/Adresse du chantier/i), {
    target: { value: '12 rue de la Paix' },
  })
  fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '75011' } })
  // Auto-sélection de la commune unique (effet async api-adresse)
  await waitFor(() =>
    expect((screen.getByLabelText(/Commune/i) as HTMLSelectElement).value).toBe('75056')
  )
  fireEvent.change(screen.getByLabelText(/Personnes au foyer/i), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText(/Catégorie de revenus/i), {
    target: { value: 'modeste' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
}

function fillStep2AndNext() {
  fireEvent.change(screen.getByLabelText(/Type de logement/i), { target: { value: 'maison' } })
  fireEvent.change(screen.getByLabelText(/Surface habitable/i), { target: { value: '85' } })
  fireEvent.change(screen.getByLabelText(/Année de construction/i), {
    target: { value: '1985' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
}

async function fillStep3AndNext() {
  await waitFor(() => expect(screen.getByLabelText(/Opération CEE/i)).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/Opération CEE/i), {
    target: { value: 'BAR-TH-171' },
  })
  await waitFor(() => expect(screen.getByLabelText(/ETAS/i)).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/ETAS/i), { target: { value: '111' } })
  fireEvent.change(screen.getByLabelText(/COP/i), { target: { value: '3.8' } })
  fireEvent.change(screen.getByLabelText(/Montant du devis HT/i), { target: { value: '8500' } })
  fireEvent.change(screen.getByLabelText(/Montant du devis TTC/i), {
    target: { value: '8967.50' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
}

describe('NouveauDossierForm -- blocage formation', () => {
  it('affiche alerte si isCertified=false', () => {
    render(<NouveauDossierForm {...BASE_PROPS} isCertified={false} />)
    expect(screen.getByText(/Formation obligatoire requise/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Accéder à la formation/i })).toBeInTheDocument()
  })

  it('ne rend pas alerte si certifie', () => {
    render(<NouveauDossierForm {...BASE_PROPS} isCertified={true} />)
    expect(screen.queryByText(/Formation obligatoire/i)).toBeNull()
  })
})

describe('NouveauDossierForm -- etape Client', () => {
  it('affiche les champs de etape 1', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    expect(screen.getByLabelText(/^Nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse du chantier/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Commune/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Personnes au foyer/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Catégorie de revenus/i)).toBeInTheDocument()
  })

  it('affiche le stepper avec 4 etapes', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    expect(screen.getByRole('navigation', { name: /Étapes du formulaire/i })).toBeInTheDocument()
    const stepNav = screen.getByRole('navigation', { name: /Étapes du formulaire/i })
    const buttons = stepNav.querySelectorAll('button')
    expect(buttons.length).toBe(4)
  })

  it('affiche les erreurs de validation si on clique Suivant sans remplir', () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }))
    expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument()
    expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument()
    expect(screen.getByText(/Adresse email invalide/i)).toBeInTheDocument()
    expect(screen.getByText(/catégorie de revenus est requise/i)).toBeInTheDocument()
  })

  it('ne passe pas etape 2 si email invalide', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    fireEvent.change(screen.getByLabelText(/^Nom/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Prénom/i), { target: { value: 'Jean' } })
    fireEvent.change(screen.getByLabelText(/Adresse email/i), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByLabelText(/Téléphone/i), {
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
  it('affiche etape Chantier apres validation client', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    await fillStep1AndNext()
    expect(screen.getByText(/Type de logement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Surface habitable/i)).toBeInTheDocument()
  })

  it('affiche le bouton Precedent a etape 2', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)
    await fillStep1AndNext()
    expect(screen.getByRole('button', { name: /Précédent/i })).toBeInTheDocument()
  })
})

describe('NouveauDossierForm -- submit OK', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { id: 'new-dossier-id-456' } }),
      })
    )
  })

  it('appelle POST /api/cee/dossiers avec le payload DossierClientInput', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)

    await fillStep1AndNext()
    fillStep2AndNext()
    await fillStep3AndNext()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer le dossier/i })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Créer le dossier/i }))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/cee/dossiers',
        expect.objectContaining({ method: 'POST' })
      )
    })

    const call = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((call[1] as { body: string }).body)
    expect(body.operation_code).toBe('BAR-TH-171')
    expect(body.client).toMatchObject({
      nom: 'Test',
      prenom: 'Jean',
      email: 'jean@test.fr',
      code_postal: '75011',
      commune_insee: '75056',
    })
    expect(body.foyer_personnes).toBe(4)
    expect(body.revenus_categorie).toBe('modeste')
    expect(body.montant_ht_eur).toBe(8500)
    expect(body.montant_ttc_eur).toBe(8967.5)
    expect(body.type_travaux).toContain('Pompe à chaleur air/eau')
    expect(body.date_devis).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('NouveauDossierForm -- submit erreur API', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: { code: 'DB_ERROR', message: 'Erreur serveur interne' },
        }),
      })
    )
  })

  it('affiche le message erreur retourne par API', async () => {
    render(<NouveauDossierForm {...BASE_PROPS} />)

    await fillStep1AndNext()
    fillStep2AndNext()
    await fillStep3AndNext()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Créer le dossier/i })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Créer le dossier/i }))

    await waitFor(() => expect(screen.getByText(/Erreur serveur interne/i)).toBeInTheDocument())
  })
})
