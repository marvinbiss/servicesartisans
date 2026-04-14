/**
 * Activate step — unit tests
 * Happy path + error path + checklist states
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Activate from '@/app/(private)/espace-artisan/cee/onboarding/steps/Activate'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockOnPartnerRefresh = vi.fn().mockResolvedValue(undefined)

function makePartner(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    provider_id: 'prov1',
    user_id: 'u1',
    status: 'certified',
    iban_last4: '0189',
    convention_signed_at: '2025-01-01T00:00:00Z',
    certified_at: '2025-01-02T00:00:00Z',
    certification_score: 9,
    ...overrides,
  } as Parameters<typeof Activate>[0]['partner']
}

describe('Activate step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the activate button when all steps complete', () => {
    render(<Activate partner={makePartner()} onPartnerRefresh={mockOnPartnerRefresh} />)
    const btn = screen.getByTestId('activate-btn')
    expect(btn).toBeTruthy()
    expect((btn as HTMLButtonElement).disabled).toBe(false)
  })

  it('shows all 3 checklist items as complete', () => {
    const { container } = render(
      <Activate partner={makePartner()} onPartnerRefresh={mockOnPartnerRefresh} />
    )
    // 3 list items should have accent (complete) styling, not red (incomplete)
    const incompleteItems = container.querySelectorAll('.border-red-200')
    expect(incompleteItems.length).toBe(0)
    const completeItems = container.querySelectorAll('.border-accent-200')
    expect(completeItems.length).toBe(3)
  })

  it('disables activate button when IBAN is missing', () => {
    render(
      <Activate
        partner={makePartner({ iban_last4: null })}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    const btn = screen.getByTestId('activate-btn')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables activate button when convention not signed', () => {
    render(
      <Activate
        partner={makePartner({ convention_signed_at: null })}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    const btn = screen.getByTestId('activate-btn')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('activates and redirects on success (happy path)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { status: 'active' } }),
    } as Response)

    render(<Activate partner={makePartner()} onPartnerRefresh={mockOnPartnerRefresh} />)

    fireEvent.click(screen.getByTestId('activate-btn'))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/cee/partners/activate',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/compte activé/i)).toBeTruthy()
    })

    // Wait for redirect
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/espace-artisan/cee')
      },
      { timeout: 2000 }
    )
  })

  it('shows api error on failed activation', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'Activation impossible depuis le statut actuel.' },
      }),
    } as Response)

    render(<Activate partner={makePartner()} onPartnerRefresh={mockOnPartnerRefresh} />)

    fireEvent.click(screen.getByTestId('activate-btn'))

    await waitFor(() => {
      expect(screen.getByText(/activation impossible/i)).toBeTruthy()
    })
  })

  it('shows warning when steps are incomplete', () => {
    render(
      <Activate
        partner={makePartner({ iban_last4: null, certified_at: null })}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByText(/étapes incomplètes/i)).toBeTruthy()
  })

  it('shows IBAN last4 in the checklist detail', () => {
    render(
      <Activate
        partner={makePartner({ iban_last4: '5678' })}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByText(/5678/)).toBeTruthy()
  })

  it('section has aria-labelledby', () => {
    const { container } = render(
      <Activate partner={makePartner()} onPartnerRefresh={mockOnPartnerRefresh} />
    )
    const section = container.querySelector('[aria-labelledby="activate-heading"]')
    expect(section).toBeTruthy()
  })
})
