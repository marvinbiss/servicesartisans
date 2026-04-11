/**
 * Tests — CeePrimeEstimateCard
 *
 * Couvre :
 *   - loading state (skeleton visible)
 *   - eligible render (carte visible, montant formaté FR, disclaimer présent)
 *   - non-eligible render (return null)
 *   - garde : si serviceSlug vide ou postalCode invalide → pas de fetch
 *   - pas de promesse absolue : le texte contient "jusqu'à"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import React from 'react'
import CeePrimeEstimateCard from '@/components/devis/CeePrimeEstimateCard'

// ============================================
// Fetch mock helpers
// ============================================

type FetchResponse = {
  ok: boolean
  json: () => Promise<unknown>
}

function mockFetchOnce(body: unknown, ok = true) {
  const fn = vi.fn(
    (): Promise<FetchResponse> =>
      Promise.resolve({
        ok,
        json: () => Promise.resolve(body),
      })
  )
  global.fetch = fn as unknown as typeof fetch
  return fn
}

/** Never-resolving fetch — pour tester le skeleton. */
function mockFetchPending() {
  const fn = vi.fn(() => new Promise<FetchResponse>(() => {}))
  global.fetch = fn as unknown as typeof fetch
  return fn
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// ============================================
// Tests
// ============================================

describe('CeePrimeEstimateCard — garde', () => {
  it('renders nothing and does not fetch when serviceSlug is empty', () => {
    const fetchFn = mockFetchPending()
    const { container } = render(<CeePrimeEstimateCard serviceSlug="" postalCode="75011" />)
    expect(container).toBeEmptyDOMElement()
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('renders nothing and does not fetch when postalCode is invalid', () => {
    const fetchFn = mockFetchPending()
    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75" />
    )
    expect(container).toBeEmptyDOMElement()
    expect(fetchFn).not.toHaveBeenCalled()
  })
})

describe('CeePrimeEstimateCard — loading', () => {
  it('shows skeleton while fetch is pending', () => {
    mockFetchPending()
    render(<CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />)
    expect(screen.getByTestId('cee-prime-card-loading')).toBeInTheDocument()
  })
})

describe('CeePrimeEstimateCard — eligible', () => {
  it('renders the card with max prime formatted FR and disclaimer', async () => {
    mockFetchOnce({
      eligible: true,
      codes: ['BAR-TH-104'],
      zone_climatique: 'H1',
      items: [
        {
          code: 'BAR-TH-104',
          nom: 'Pompe à chaleur air/eau',
          prime_estimate: {
            euros_classique_min: 765,
            euros_classique_max: 1125,
            euros_precarite_min: 1360,
            euros_precarite_max: 2450,
          },
        },
      ],
    })

    render(<CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />)

    const card = await waitFor(() => screen.getByTestId('cee-prime-card'))
    expect(card).toBeInTheDocument()

    // Montant : 2 450 € (max des euros_precarite_max), avec "jusqu’à"
    // (apostrophe typographique Unicode U+2019 — échappe eslint no-unescaped-entities)
    expect(card.textContent).toContain('jusqu\u2019\u00e0')
    // Le séparateur est une fine espace insécable (\u202f) + nbsp avant €
    expect(card.textContent).toMatch(/2[\s\u202f\u00a0]?450[\s\u202f\u00a0]?€/)

    // Disclaimer obligatoire (pas de promesse absolue)
    expect(card.textContent).toContain('Estimation indicative')

    // Mention partenariat mandataire (booste conversion)
    expect(card.textContent).toMatch(/partenariat mandataire/i)
  })

  it('calls the estimate API with correct body', async () => {
    const fetchFn = mockFetchOnce({
      eligible: false,
      codes: [],
      zone_climatique: null,
      items: [],
    })

    render(<CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />)

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledWith(
        '/api/cee/estimate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            serviceSlug: 'chauffagiste',
            postalCode: '75011',
          }),
        })
      )
    })
  })
})

describe('CeePrimeEstimateCard — non-eligible', () => {
  it('returns null when API says not eligible', async () => {
    mockFetchOnce({
      eligible: false,
      codes: [],
      zone_climatique: null,
      items: [],
    })

    const { container } = render(<CeePrimeEstimateCard serviceSlug="plombier" postalCode="75011" />)

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('cee-prime-card')).not.toBeInTheDocument()
  })

  it('returns null when eligible but no prime_estimate', async () => {
    mockFetchOnce({
      eligible: true,
      codes: ['BAR-TH-104'],
      zone_climatique: 'H1',
      items: [{ code: 'BAR-TH-104', nom: 'Op', prime_estimate: null }],
    })

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('returns null when API shape is invalid (missing eligible boolean)', async () => {
    mockFetchOnce({ success: false, error: { code: 'oops' } })

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('cee-prime-card')).not.toBeInTheDocument()
  })

  it('returns null when API shape has eligible as string (not boolean)', async () => {
    // Shape invalide : `eligible: "true"` (string). Le composant doit rejeter
    // via le guard `typeof eligible === 'boolean'` et masquer la carte.
    mockFetchOnce({
      eligible: 'true',
      codes: ['BAR-TH-171'],
      zone_climatique: 'H1',
      items: [],
    })

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('cee-prime-card')).not.toBeInTheDocument()
    expect(screen.queryByText(/prime CEE/i)).not.toBeInTheDocument()
  })

  it('returns null when API shape has eligible as null', async () => {
    // Shape invalide : `eligible: null`. Même guard, carte masquée.
    mockFetchOnce({
      eligible: null,
      codes: [],
      zone_climatique: null,
      items: [],
    })

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByTestId('cee-prime-card')).not.toBeInTheDocument()
    expect(screen.queryByText(/prime CEE/i)).not.toBeInTheDocument()
  })

  it('returns null when API body is null', async () => {
    mockFetchOnce(null)

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('returns null when fetch fails (network error)', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network'))) as unknown as typeof fetch

    const { container } = render(
      <CeePrimeEstimateCard serviceSlug="chauffagiste" postalCode="75011" />
    )

    await waitFor(() => {
      expect(screen.queryByTestId('cee-prime-card-loading')).not.toBeInTheDocument()
    })
    expect(container).toBeEmptyDOMElement()
  })
})
