// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HubReviewsCarousel } from './HubReviewsCarousel'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const ID_A = '11111111-1111-4111-8111-111111111111'
const ID_B = '22222222-2222-4222-8222-222222222222'

describe('HubReviewsCarousel', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
  })
  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('renders nothing when providerIds is empty', async () => {
    const { container } = render(<HubReviewsCarousel providerIds={[]} />)
    await waitFor(() => expect(container.firstChild).toBeNull())
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('renders nothing when API returns 0 reviews', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: [] }),
    } as Response)
    const { container } = render(<HubReviewsCarousel providerIds={[ID_A]} />)
    await waitFor(() => expect(container.firstChild).toBeNull())
  })

  it('renders review cards from API response', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reviews: [
          {
            id: 'r1',
            rating: 5,
            content: 'Travail soigné et ponctuel. Recommandé sans hésiter.',
            author_name: 'Marie',
            provider_id: ID_A,
            provider_name: 'Plomberie Dupont',
            created_at: '2026-04-15T10:00:00Z',
          },
        ],
      }),
    } as Response)
    render(<HubReviewsCarousel providerIds={[ID_A]} />)
    await waitFor(() => expect(screen.getByText(/Travail soigné/)).toBeDefined())
    expect(screen.getByText('Marie')).toBeDefined()
    expect(screen.getByText(/Plomberie Dupont/)).toBeDefined()
  })

  it('caps providerIds at 50 in API request', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reviews: [] }),
    } as Response)
    const ids = Array.from(
      { length: 60 },
      (_, i) => `${(i + 1).toString().padStart(8, '0')}-aaaa-4aaa-8aaa-aaaaaaaaaaaa`
    )
    render(<HubReviewsCarousel providerIds={ids} />)
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
    const url = fetchSpy.mock.calls[0]?.[0] as string
    const idsInUrl = decodeURIComponent(url.split('ids=')[1] ?? '').split(',')
    expect(idsInUrl.length).toBe(50)
  })

  it('passes accessible heading id', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reviews: [
          {
            id: 'r1',
            rating: 4,
            content: 'Très bon échange avec un professionnel sérieux.',
            author_name: 'Jean',
            provider_id: ID_B,
            provider_name: null,
            created_at: '2026-04-10T10:00:00Z',
          },
        ],
      }),
    } as Response)
    render(<HubReviewsCarousel providerIds={[ID_B]} heading="Avis récents" />)
    await waitFor(() => expect(screen.getByText('Avis récents')).toBeDefined())
    expect(screen.getByRole('region').getAttribute('aria-labelledby')).toBe('hub-reviews-heading')
  })
})
