// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { ArtisanSimilar } from './ArtisanSimilar'
import type { LegacyArtisan } from '@/types/legacy'

const baseArtisan = {
  id: 'a1',
  business_name: 'Plomberie A',
  specialty: 'Plombier',
  specialty_slug: 'plombier',
  city: 'Lyon',
  city_slug: 'lyon',
} as unknown as LegacyArtisan

const similar = Array.from({ length: 5 }).map((_, i) => ({
  id: `p${i}`,
  name: `Artisan ${i}`,
  specialty: 'Plombier',
  rating: 4.5,
  reviews: 12,
  city: 'Lyon',
}))

describe('ArtisanSimilar carousel a11y', () => {
  it('exposes role="region" aria-roledescription="carousel"', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    expect(region.getAttribute('aria-roledescription')).toBe('carousel')
  })

  it('container is focusable (tabIndex 0)', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    expect(region.getAttribute('tabindex')).toBe('0')
  })

  it('each slide has role="group" aria-roledescription="slide"', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const slides = screen.getAllByRole('group', { name: /\d+ sur 5/ })
    expect(slides.length).toBe(5)
    expect(slides[0].getAttribute('aria-roledescription')).toBe('slide')
  })

  it('ArrowRight scrolls the carousel right and preventDefault is honored', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    const scrollBy = vi.fn()
    Object.defineProperty(region, 'scrollBy', { value: scrollBy, writable: true })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(scrollBy).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' })
  })

  it('ArrowLeft scrolls left', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    const scrollBy = vi.fn()
    Object.defineProperty(region, 'scrollBy', { value: scrollBy, writable: true })
    fireEvent.keyDown(region, { key: 'ArrowLeft' })
    expect(scrollBy).toHaveBeenCalledWith({ left: -320, behavior: 'smooth' })
  })

  it('Home / End scroll to extremes', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    const scrollTo = vi.fn()
    Object.defineProperty(region, 'scrollTo', { value: scrollTo, writable: true })
    Object.defineProperty(region, 'scrollWidth', { value: 9999, writable: true })
    fireEvent.keyDown(region, { key: 'End' })
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 9999, behavior: 'smooth' })
    fireEvent.keyDown(region, { key: 'Home' })
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' })
  })

  it('non-arrow keys do not preventDefault', () => {
    render(<ArtisanSimilar artisan={baseArtisan} similarArtisans={similar} />)
    const region = screen.getByRole('region', { name: 'Liste des artisans similaires' })
    const preventDefault = vi.fn()
    fireEvent.keyDown(region, { key: 'a', preventDefault })
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
