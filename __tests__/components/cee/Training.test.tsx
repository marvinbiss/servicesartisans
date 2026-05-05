// @vitest-environment jsdom
/**
 * Training step — unit tests
 * Happy path + error path + certification + a11y
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Training from '@/app/(private)/espace-artisan/cee/onboarding/steps/Training'
import { QUIZ_QUESTIONS, PASS_THRESHOLD } from '@/lib/cee/quiz-questions'

const mockOnNext = vi.fn()
const mockOnPartnerRefresh = vi.fn().mockResolvedValue(undefined)

function makePartner(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    provider_id: 'prov1',
    user_id: 'u1',
    status: 'convention_signed',
    convention_signed_at: '2025-01-01T00:00:00Z',
    certified_at: null,
    certification_score: null,
    ...overrides,
  } as Parameters<typeof Training>[0]['partner']
}

/**
 * Click the first radio option for every question using stable DOM ids.
 * Format: `q-${question.id}-c-0`
 */
function answerAllQuestions(container: HTMLElement) {
  QUIZ_QUESTIONS.forEach((q) => {
    const radio = container.querySelector(`#q-${q.id}-c-0`) as HTMLInputElement
    if (radio) fireEvent.click(radio)
  })
}

describe('Training step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders video placeholders and quiz form', () => {
    render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByTestId('quiz-form')).toBeTruthy()
    // 4 video placeholder divs with role="img"
    const videoAreas = screen.getAllByRole('img')
    expect(videoAreas.length).toBeGreaterThanOrEqual(4)
  })

  it('renders all 10 quiz questions', () => {
    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    const fieldsets = container.querySelectorAll('fieldset')
    expect(fieldsets.length).toBe(QUIZ_QUESTIONS.length)
  })

  it('shows validation error when submitting without answering all questions', async () => {
    render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    fireEvent.click(screen.getByTestId('quiz-submit-btn'))
    await waitFor(() => {
      expect(screen.getByText(/répondez à toutes les questions/i)).toBeTruthy()
    })
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('submits quiz and shows passed result (happy path)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          score: PASS_THRESHOLD,
          total: QUIZ_QUESTIONS.length,
          passed: true,
          certified: true,
        },
      }),
    } as Response)

    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    answerAllQuestions(container)
    fireEvent.click(screen.getByTestId('quiz-submit-btn'))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/cee/partners/training/quiz',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/quiz réussi/i)).toBeTruthy()
    })
  })

  it('shows failed result and retry option when score too low', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          score: PASS_THRESHOLD - 2,
          total: QUIZ_QUESTIONS.length,
          passed: false,
          certified: false,
        },
      }),
    } as Response)

    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    answerAllQuestions(container)
    fireEvent.click(screen.getByTestId('quiz-submit-btn'))

    await waitFor(() => {
      expect(screen.getByText(/quiz échoué/i)).toBeTruthy()
      expect(screen.getByTestId('quiz-retry-btn')).toBeTruthy()
    })
  })

  it('resets state when retry is clicked', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          score: 5,
          total: QUIZ_QUESTIONS.length,
          passed: false,
          certified: false,
        },
      }),
    } as Response)

    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    answerAllQuestions(container)
    fireEvent.click(screen.getByTestId('quiz-submit-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('quiz-retry-btn')).toBeTruthy()
    })

    fireEvent.click(screen.getByTestId('quiz-retry-btn'))

    await waitFor(() => {
      expect(screen.queryByText(/quiz échoué/i)).toBeNull()
    })
  })

  it('shows rate-limit error on 429', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response)

    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )

    answerAllQuestions(container)
    fireEvent.click(screen.getByTestId('quiz-submit-btn'))

    await waitFor(() => {
      expect(screen.getByText(/trop de tentatives/i)).toBeTruthy()
    })
  })

  it('shows already-certified state when partner is certified', () => {
    render(
      <Training
        partner={makePartner({
          certified_at: '2025-01-01T00:00:00Z',
          certification_score: 9,
        })}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    expect(screen.getByText(/formation validée/i)).toBeTruthy()
    expect(screen.getByTestId('training-continue-btn')).toBeTruthy()
  })

  it('each question fieldset has a legend', () => {
    const { container } = render(
      <Training
        partner={makePartner()}
        onNext={mockOnNext}
        onPartnerRefresh={mockOnPartnerRefresh}
      />
    )
    const fieldsets = container.querySelectorAll('fieldset')
    fieldsets.forEach((fs) => {
      expect(fs.querySelector('legend')).toBeTruthy()
    })
  })
})
