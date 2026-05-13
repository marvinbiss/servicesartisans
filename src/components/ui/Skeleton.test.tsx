// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton, ProviderCardSkeleton, ProviderListSkeleton } from './Skeleton'

describe('Skeleton primitives', () => {
  it('Skeleton renders shimmer overlay by default', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('animate-[shimmer_2s_infinite]')
  })

  it('Skeleton without shimmer omits animation', () => {
    const { container } = render(<Skeleton shimmer={false} />)
    const el = container.firstChild as HTMLElement
    expect(el.className).not.toContain('animate-')
  })

  it('ProviderCardSkeleton exposes aria-busy + accessible label', () => {
    render(<ProviderCardSkeleton />)
    const card = screen.getByRole('article')
    expect(card.getAttribute('aria-busy')).toBe('true')
    expect(card.getAttribute('aria-label')).toBe("Chargement d'un artisan")
  })

  it('ProviderListSkeleton renders N cards (default 5)', () => {
    render(<ProviderListSkeleton />)
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })

  it('ProviderListSkeleton respects custom count', () => {
    render(<ProviderListSkeleton count={3} />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('ProviderListSkeleton has aria-label for screen readers', () => {
    render(<ProviderListSkeleton count={1} />)
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Chargement des artisans')
    expect(screen.getByText(/Chargement en cours/)).toBeDefined()
  })
})
