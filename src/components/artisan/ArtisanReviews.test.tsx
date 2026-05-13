// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { ArtisanReviews } from './ArtisanReviews'
import type { Review } from './types'

function makeReviews(count: number): Review[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `r${i}`,
    author: `Auteur ${i}`,
    rating: 5,
    comment: `Avis ${i} — service rapide et propre.`,
    date: '2026-05-01',
    dateISO: '2026-05-01',
    verified: false,
  })) as Review[]
}

describe('ArtisanReviews load-more', () => {
  it('shows the "Voir tous" button when more than 3 reviews', () => {
    render(<ArtisanReviews reviews={makeReviews(5)} />)
    expect(screen.getByRole('button', { name: /Voir tous les avis/ })).toBeDefined()
  })

  it('hides the button when 3 or fewer reviews', () => {
    render(<ArtisanReviews reviews={makeReviews(3)} />)
    expect(screen.queryByRole('button', { name: /Voir tous les avis/ })).toBeNull()
  })

  it('clicking expands all reviews', () => {
    render(<ArtisanReviews reviews={makeReviews(7)} />)
    expect(screen.getAllByText(/Avis \d+/).length).toBe(3)
    fireEvent.click(screen.getByRole('button', { name: /Voir tous les avis/ }))
    expect(screen.getAllByText(/Avis \d+/).length).toBe(7)
  })

  it('announces the number of newly revealed reviews via live region', async () => {
    render(<ArtisanReviews reviews={makeReviews(7)} />)
    fireEvent.click(screen.getByRole('button', { name: /Voir tous les avis/ }))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    const live = screen.getByRole('status')
    expect(live.textContent).toContain('4 avis supplémentaires affichés')
  })

  it('focus moves to the first newly revealed card after expanding', async () => {
    render(<ArtisanReviews reviews={makeReviews(7)} />)
    fireEvent.click(screen.getByRole('button', { name: /Voir tous les avis/ }))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    // First new card is the 4th review (index 3) — its text is "Avis 3"
    const active = document.activeElement as HTMLElement | null
    expect(active?.textContent).toContain('Avis 3')
  })
})
