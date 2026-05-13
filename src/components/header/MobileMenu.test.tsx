// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import MobileMenu from './MobileMenu'

const baseProps = {
  serviceQuery: '',
  setServiceQuery: () => {},
  locationQuery: '',
  setLocationQuery: () => {},
  isLocating: false,
  handleGeolocation: () => {},
  handleSearch: () => {},
  mobileAccordion: null,
  toggleMobileAccordion: () => {},
  popularCities: [],
  metroRegions: [],
  domTomRegions: [],
  favoritesCount: 0,
}

describe('MobileMenu a11y', () => {
  it('exposes role="dialog" with aria-modal + accessible name', () => {
    render(<MobileMenu {...baseProps} closeMobileMenu={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Menu de navigation' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('Escape key calls closeMobileMenu', () => {
    const close = vi.fn()
    render(<MobileMenu {...baseProps} closeMobileMenu={close} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('moves focus into the drawer on mount', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
    render(<MobileMenu {...baseProps} closeMobileMenu={() => {}} />)
    // Focus should have moved into the dialog (not on the trigger anymore)
    expect(document.activeElement).not.toBe(trigger)
    expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull()
    document.body.removeChild(trigger)
  })

  it('restores focus to the previous element on unmount', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    const { unmount } = render(<MobileMenu {...baseProps} closeMobileMenu={() => {}} />)
    unmount()
    expect(document.activeElement).toBe(trigger)
    document.body.removeChild(trigger)
  })

  it('Tab from last focusable wraps to first (focus trap)', () => {
    render(<MobileMenu {...baseProps} closeMobileMenu={() => {}} />)
    const dialog = screen.getByRole('dialog')
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    expect(focusables.length).toBeGreaterThan(1)
    const last = focusables[focusables.length - 1]
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(focusables[0])
  })

  it('Shift+Tab from first focusable wraps to last', () => {
    render(<MobileMenu {...baseProps} closeMobileMenu={() => {}} />)
    const dialog = screen.getByRole('dialog')
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusables[focusables.length - 1])
  })
})
