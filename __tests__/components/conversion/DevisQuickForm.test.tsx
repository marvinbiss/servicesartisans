// @vitest-environment jsdom
/**
 * Tests pour DevisQuickForm — 4-champs friction-free pour templates pSEO.
 *
 * Contrat couvert :
 *  - Render basic : 4 inputs (nom, tel, CP, service) + button + RGPD link
 *  - Validation client : phone FR, CP 5 chiffres, nom min 2 chars
 *  - Soumission success : POST /api/devis avec body { service, nom, telephone,
 *    codePostal, ville?, source? } + bloc role="status"
 *  - Soumission error : message role="alert" rendu, formulaire toujours là
 *  - Default values : defaultService + defaultPostalCode pré-remplis
 *  - Services prop : liste personnalisée affichée
 *  - defaultService hors liste : injecté en tête
 *  - Source invalide (regex) : omis du body envoyé
 *  - aria-labelledby sur form + RGPD link
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import DevisQuickForm from '@/components/conversion/DevisQuickForm'

const originalFetch = global.fetch

beforeEach(() => {
  global.fetch = vi.fn(
    async () => new Response(JSON.stringify({ success: true, id: 'devis-1' }), { status: 200 })
  ) as typeof fetch
})

afterEach(() => {
  global.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('DevisQuickForm', () => {
  it('renders 4 inputs + submit + RGPD link + aria-labelledby form', () => {
    render(<DevisQuickForm />)
    expect(screen.getByLabelText(/nom complet/i)).toBeDefined()
    expect(screen.getByLabelText(/téléphone/i)).toBeDefined()
    expect(screen.getByLabelText(/code postal/i)).toBeDefined()
    expect(screen.getByLabelText(/type de travaux/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /recevoir mes devis gratuits/i })).toBeDefined()
    // RGPD link
    const rgpdLink = screen.getByRole('link', { name: /rgpd/i }) as HTMLAnchorElement
    expect(rgpdLink.getAttribute('href')).toBe('/rgpd')
    // form has accessible name (heading default)
    const form = document.querySelector('form')!
    expect(form.getAttribute('aria-labelledby')).toBeTruthy()
  })

  it('blocks submit when phone is invalid (FR regex)', async () => {
    render(<DevisQuickForm />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), { target: { value: 'Jean Dupont' } })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '12345' } })
    fireEvent.change(screen.getByLabelText(/code postal/i), { target: { value: '75001' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/téléphone/i)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('blocks submit when postal code is not 5 digits', async () => {
    render(<DevisQuickForm />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), { target: { value: 'Jean Dupont' } })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '0612345678' } })
    // CP input strips non-digits and caps to 5 — 'abc' => ''
    fireEvent.change(screen.getByLabelText(/code postal/i), { target: { value: 'abc' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/code postal/i)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('blocks submit when name is shorter than 2 characters', async () => {
    render(<DevisQuickForm />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '0612345678' } })
    fireEvent.change(screen.getByLabelText(/code postal/i), { target: { value: '75001' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/nom/i)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits successfully with cleaned phone + correct body shape', async () => {
    render(
      <DevisQuickForm
        defaultService="pompe-a-chaleur"
        defaultPostalCode="69001"
        defaultVille="Lyon"
        source="rge-quick-test"
      />
    )

    fireEvent.change(screen.getByLabelText(/nom complet/i), {
      target: { value: '  Jean Dupont  ' },
    })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '06 12 34 56 78' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/devis')
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body).toEqual({
      service: 'pompe-a-chaleur',
      nom: 'Jean Dupont',
      telephone: '0612345678',
      codePostal: '69001',
      ville: 'Lyon',
      source: 'rge-quick-test',
    })

    // Success block visible (role=status, aria-live=polite)
    const status = await screen.findByRole('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.textContent).toMatch(/demande reçue/i)
  })

  it('renders error from API and keeps form mounted', async () => {
    global.fetch = vi.fn(
      async () => new Response(JSON.stringify({ error: 'Trop de requêtes' }), { status: 429 })
    ) as typeof fetch

    render(<DevisQuickForm />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), { target: { value: 'Jean Dupont' } })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '0612345678' } })
    fireEvent.change(screen.getByLabelText(/code postal/i), { target: { value: '75001' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/trop de requêtes/i)
    // form still in DOM
    expect(screen.getByRole('button', { name: /recevoir mes devis gratuits/i })).toBeDefined()
  })

  it('pre-fills defaultService and defaultPostalCode', () => {
    render(<DevisQuickForm defaultService="isolation-thermique" defaultPostalCode="33000" />)
    const cp = screen.getByLabelText(/code postal/i) as HTMLInputElement
    const select = screen.getByLabelText(/type de travaux/i) as HTMLSelectElement
    expect(cp.value).toBe('33000')
    expect(select.value).toBe('isolation-thermique')
  })

  it('renders custom services list when provided', () => {
    render(
      <DevisQuickForm
        services={[
          { slug: 'plomberie', label: 'Plomberie urgence' },
          { slug: 'electricite', label: 'Électricité dépannage' },
        ]}
      />
    )
    const select = screen.getByLabelText(/type de travaux/i) as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(['plomberie', 'electricite'])
  })

  it('injects defaultService at top when not in services list', () => {
    render(
      <DevisQuickForm
        defaultService="rge-pompe-chaleur"
        services={[{ slug: 'isolation-thermique', label: 'Isolation' }]}
      />
    )
    const select = screen.getByLabelText(/type de travaux/i) as HTMLSelectElement
    expect(select.value).toBe('rge-pompe-chaleur')
    expect(Array.from(select.options).map((o) => o.value)).toEqual([
      'rge-pompe-chaleur',
      'isolation-thermique',
    ])
  })

  it('omits invalid source from API body (Pipedrive pollution guard)', async () => {
    render(<DevisQuickForm source="Has Spaces & Dots." />)
    fireEvent.change(screen.getByLabelText(/nom complet/i), { target: { value: 'Jean Dupont' } })
    fireEvent.change(screen.getByLabelText(/téléphone/i), { target: { value: '0612345678' } })
    fireEvent.change(screen.getByLabelText(/code postal/i), { target: { value: '75001' } })

    fireEvent.click(screen.getByRole('button', { name: /recevoir mes devis gratuits/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body).not.toHaveProperty('source')
  })

  it('renders custom heading prop', () => {
    render(<DevisQuickForm heading="Recevez 3 devis RGE en 24h" />)
    expect(screen.getByRole('heading', { name: /recevez 3 devis rge en 24h/i })).toBeDefined()
  })
})
