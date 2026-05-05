// @vitest-environment jsdom
/**
 * Convention step — unit tests
 * Happy path + error path + signed state
 *
 * Testing strategy for polling:
 * Convention.tsx calls setInterval after fetch resolves to poll partner status.
 * We stub setInterval to a no-op so polling never fires during tests, which
 * prevents "state update outside act" warnings and test timeouts.
 * waitFor uses setTimeout internally — that is left untouched (real timers).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Convention from '@/app/(private)/espace-artisan/cee/onboarding/steps/Convention'

const mockOnNext = vi.fn()
const mockOnPartnerRefresh = vi.fn().mockResolvedValue(undefined)

// Stable no-op interval: returns a handle but never fires the callback
const NOOP_INTERVAL_ID = 999 as unknown as ReturnType<typeof setInterval>

function makePartner(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    provider_id: 'prov1',
    user_id: 'u1',
    status: 'iban_saved',
    iban_last4: '0189',
    convention_signed_at: null,
    ...overrides,
  } as Parameters<typeof Convention>[0]['partner']
}

describe('Convention step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    // Stub setInterval globally — prevents polling loop from firing
    vi.stubGlobal('setInterval', vi.fn().mockReturnValue(NOOP_INTERVAL_ID))
    // Stub clearInterval to match
    vi.stubGlobal('clearInterval', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders sign button in idle state', () => {
    render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByTestId('convention-sign-btn')).toBeTruthy()
  })

  it('shows already-signed state when convention_signed_at is set', () => {
    render(
      <Convention
        partner={makePartner({ convention_signed_at: '2025-01-01T00:00:00Z' })}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByText(/convention signée/i)).toBeTruthy()
    expect(screen.getByTestId('convention-continue-btn')).toBeTruthy()
  })

  it('clicking continue when signed calls onNext', () => {
    render(
      <Convention
        partner={makePartner({ convention_signed_at: '2025-01-01T00:00:00Z' })}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    fireEvent.click(screen.getByTestId('convention-continue-btn'))
    expect(mockOnNext).toHaveBeenCalled()
  })

  it('shows loading state while creating convention', async () => {
    // A pending promise keeps the component in the loading state
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}) as unknown as Promise<Response>)

    render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    fireEvent.click(screen.getByTestId('convention-sign-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('convention-loading-btn')).toBeTruthy()
    })
  })

  it('shows error on failed POST', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Erreur Yousign' } }),
    } as Response)

    render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    fireEvent.click(screen.getByTestId('convention-sign-btn'))

    await waitFor(() => {
      expect(screen.getByText(/erreur yousign/i)).toBeTruthy()
    })
  })

  it('shows iframe when signerUrl is returned', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { signerUrl: 'https://api.yousign.app/sign/abc123', envelopeId: 'env1' },
      }),
    } as Response)

    const { container } = render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    fireEvent.click(screen.getByTestId('convention-sign-btn'))

    await waitFor(() => {
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe?.getAttribute('src')).toContain('yousign.app')
    })
  })

  it('shows IBAN_REQUIRED error on 409', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: { message: 'Veuillez renseigner votre IBAN avant de générer la convention.' },
      }),
    } as Response)

    render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    fireEvent.click(screen.getByTestId('convention-sign-btn'))

    await waitFor(() => {
      expect(screen.getByText(/veuillez renseigner votre iban/i)).toBeTruthy()
    })
  })

  it('section has aria-labelledby pointing to heading', () => {
    const { container } = render(
      <Convention
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    const section = container.querySelector('[aria-labelledby="convention-heading"]')
    const heading = container.querySelector('#convention-heading')
    expect(section).toBeTruthy()
    expect(heading).toBeTruthy()
  })
})
