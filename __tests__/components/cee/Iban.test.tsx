// @vitest-environment jsdom
/**
 * Iban step — unit tests
 * Happy path + error path + validation + a11y
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Iban from '@/app/(private)/espace-artisan/cee/onboarding/steps/Iban'

const mockOnNext = vi.fn()
const mockOnPartnerRefresh = vi.fn().mockResolvedValue(undefined)

function renderIban(partnerOverrides = {}) {
  const partner = {
    id: 'p1',
    provider_id: 'prov1',
    user_id: 'u1',
    status: 'onboarding',
    iban_last4: null,
    bic: null,
    titulaire_compte: null,
    ...partnerOverrides,
  } as Parameters<typeof Iban>[0]['partner']

  return render(
    <Iban partner={partner} onNext={mockOnNext} onPartnerRefresh={mockOnPartnerRefresh} />
  )
}

describe('Iban step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the form with IBAN, BIC, titulaire fields', () => {
    const { container } = renderIban()
    // Use id selectors to avoid ambiguity with other text containing "IBAN"
    expect(container.querySelector('#iban-field')).toBeTruthy()
    expect(container.querySelector('#bic-field')).toBeTruthy()
    expect(container.querySelector('#titulaire-field')).toBeTruthy()
  })

  it('shows validation error on IBAN blur with invalid value', async () => {
    const { container } = renderIban()
    const ibanField = container.querySelector('#iban-field') as HTMLInputElement
    fireEvent.change(ibanField, { target: { value: 'INVALID' } })
    fireEvent.blur(ibanField)
    await waitFor(() => {
      expect(screen.getByText(/format iban invalide/i)).toBeTruthy()
    })
  })

  it('shows validation error on BIC blur with invalid value', async () => {
    const { container } = renderIban()
    const bicField = container.querySelector('#bic-field') as HTMLInputElement
    fireEvent.change(bicField, { target: { value: 'X' } })
    fireEvent.blur(bicField)
    await waitFor(() => {
      expect(screen.getByText(/format bic invalide/i)).toBeTruthy()
    })
  })

  it('shows validation error on titulaire blur when empty', async () => {
    const { container } = renderIban()
    const titField = container.querySelector('#titulaire-field') as HTMLInputElement
    fireEvent.focus(titField)
    fireEvent.blur(titField)
    await waitFor(() => {
      expect(screen.getByText(/titulaire.*requis/i)).toBeTruthy()
    })
  })

  it('does not submit with invalid fields', async () => {
    renderIban()
    fireEvent.click(screen.getByTestId('iban-submit-btn'))
    await waitFor(() => {
      expect(vi.mocked(fetch)).not.toHaveBeenCalled()
    })
  })

  it('submits successfully with valid data (happy path)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response)

    const { container } = renderIban()
    fireEvent.change(container.querySelector('#iban-field')!, {
      target: { value: 'FR7630006000011234567890189' },
    })
    fireEvent.change(container.querySelector('#bic-field')!, {
      target: { value: 'BNPAFRPP' },
    })
    fireEvent.change(container.querySelector('#titulaire-field')!, {
      target: { value: 'Jean Dupont' },
    })
    fireEvent.click(screen.getByTestId('iban-submit-btn'))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/cee/partners/onboarding/iban',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/iban enregistré avec succès/i)).toBeTruthy()
    })
  })

  it('shows rate-limit error on 429', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response)

    const { container } = renderIban()
    fireEvent.change(container.querySelector('#iban-field')!, {
      target: { value: 'FR7630006000011234567890189' },
    })
    fireEvent.change(container.querySelector('#bic-field')!, {
      target: { value: 'BNPAFRPP' },
    })
    fireEvent.change(container.querySelector('#titulaire-field')!, {
      target: { value: 'Jean Dupont' },
    })
    fireEvent.click(screen.getByTestId('iban-submit-btn'))

    await waitFor(() => {
      expect(screen.getByText(/trop de tentatives/i)).toBeTruthy()
    })
  })

  it('shows api error message from 400 response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'IBAN invalide côté serveur' },
      }),
    } as Response)

    const { container } = renderIban()
    fireEvent.change(container.querySelector('#iban-field')!, {
      target: { value: 'FR7630006000011234567890189' },
    })
    fireEvent.change(container.querySelector('#bic-field')!, {
      target: { value: 'BNPAFRPP' },
    })
    fireEvent.change(container.querySelector('#titulaire-field')!, {
      target: { value: 'Jean Dupont' },
    })
    fireEvent.click(screen.getByTestId('iban-submit-btn'))

    await waitFor(() => {
      expect(screen.getByText(/iban invalide côté serveur/i)).toBeTruthy()
    })
  })

  it('shows already-saved state when partner has iban_last4', () => {
    renderIban({ iban_last4: '0189' })
    expect(screen.getByText(/iban enregistré/i)).toBeTruthy()
    expect(screen.getByText(/0189/)).toBeTruthy()
    expect(screen.getByTestId('iban-continue-btn')).toBeTruthy()
  })

  it('all form labels have explicit htmlFor', () => {
    const { container } = renderIban()
    const labels = container.querySelectorAll('label[for]')
    expect(labels.length).toBeGreaterThanOrEqual(3)
  })
})
