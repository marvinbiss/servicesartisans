/**
 * Welcome step — unit tests
 * Happy path + error path + accessibility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Welcome from '@/app/(private)/espace-artisan/cee/onboarding/steps/Welcome'

const mockOnNext = vi.fn()
const mockOnPartnerRefresh = vi.fn().mockResolvedValue(undefined)

function renderWelcome() {
  return render(
    <Welcome
      partner={null}
      onNext={mockOnNext}
      onPartnerRefresh={mockOnPartnerRefresh}
    />
  )
}

describe('Welcome step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the heading and consent checkbox', () => {
    renderWelcome()
    expect(screen.getByRole('heading', { name: /bienvenue/i })).toBeTruthy()
    expect(screen.getByLabelText(/je comprends/i)).toBeTruthy()
  })

  it('shows an error when continuing without consent', async () => {
    renderWelcome()
    const continueBtn = screen.getByTestId('welcome-continue-btn')
    fireEvent.click(continueBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
      expect(screen.getByText(/vous devez accepter/i)).toBeTruthy()
    })
  })

  it('does not call onNext without consent', async () => {
    renderWelcome()
    fireEvent.click(screen.getByTestId('welcome-continue-btn'))
    await waitFor(() => {
      expect(mockOnNext).not.toHaveBeenCalled()
    })
  })

  it('calls onNext after checking consent and clicking continue', async () => {
    renderWelcome()
    const checkbox = screen.getByLabelText(/je comprends/i)
    fireEvent.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(true)

    fireEvent.click(screen.getByTestId('welcome-continue-btn'))

    await waitFor(() => {
      expect(mockOnPartnerRefresh).toHaveBeenCalled()
      expect(mockOnNext).toHaveBeenCalled()
    })
  })

  it('clears the error when user checks the checkbox', async () => {
    renderWelcome()
    // Trigger error
    fireEvent.click(screen.getByTestId('welcome-continue-btn'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })
    // Check checkbox
    fireEvent.click(screen.getByLabelText(/je comprends/i))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('error element has id consent-error and role alert', async () => {
    const { container } = renderWelcome()
    fireEvent.click(screen.getByTestId('welcome-continue-btn'))
    await waitFor(() => {
      const errorEl = container.querySelector('#consent-error')
      expect(errorEl).toBeTruthy()
      expect(errorEl?.getAttribute('role')).toBe('alert')
    })
  })

  it('renders 4 benefit items', () => {
    renderWelcome()
    const list = screen.getByRole('list')
    const items = list.querySelectorAll('li')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('consent checkbox has htmlFor pointing to the input id', () => {
    const { container } = renderWelcome()
    const label = container.querySelector('label[for="consent-checkbox"]')
    expect(label).toBeTruthy()
    const input = container.querySelector('#consent-checkbox')
    expect(input).toBeTruthy()
  })
})
