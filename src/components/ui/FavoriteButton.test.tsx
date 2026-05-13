// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest'
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react'
import { FavoriteButton } from './FavoriteButton'

describe('FavoriteButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders aria-pressed=false initially', () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('clicking flips aria-pressed and aria-label', () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('aria-label')).toBe('Retirer Plomberie A des favoris')
  })

  it('announces "ajouté aux favoris" via live region', () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    fireEvent.click(screen.getByRole('button'))
    const live = screen.getByRole('status')
    expect(live.textContent).toContain('Plomberie A ajouté aux favoris')
  })

  it('announces "retiré des favoris" when toggled off', () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.getByRole('status').textContent).toContain('Plomberie A retiré des favoris')
  })

  it('Heart icon is aria-hidden so SR only hears the button label', () => {
    const { container } = render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const heart = container.querySelector('svg')
    expect(heart?.getAttribute('aria-hidden')).toBe('true')
  })

  it('press animation flag is set then cleared after the timer', async () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.className).toContain('animate-[favoriteScale_0.3s_ease-in-out]')
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })
    expect(btn.className).not.toContain('animate-[favoriteScale_0.3s_ease-in-out]')
  })

  it('rapid double-tap re-announces the latest state', () => {
    render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    fireEvent.click(btn)
    // After 3 clicks: !favorited -> favorited -> !favorited -> favorited
    // So final state is favorited=true, message="ajouté"
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toContain('ajouté')
  })

  it('unmount mid-animation does not throw', () => {
    const { unmount } = render(<FavoriteButton providerId="p1" providerName="Plomberie A" />)
    fireEvent.click(screen.getByRole('button'))
    expect(() => unmount()).not.toThrow()
    cleanup()
  })
})
