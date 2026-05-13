// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import ExitIntentPopup from './ExitIntentPopup'

describe('ExitIntentPopup', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.body.innerHTML = ''
    // jsdom doesn't ship matchMedia
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    }
  })

  function openPopup() {
    // mouseleave at top of viewport triggers show()
    fireEvent.mouseLeave(document, { clientY: 0 })
  }

  it('does not render until the exit intent fires', () => {
    render(<ExitIntentPopup sessionKey="sa:test-key-1" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('exposes role=dialog with labelledby + describedby on open', () => {
    render(<ExitIntentPopup sessionKey="sa:test-key-2" />)
    act(() => openPopup())
    const dialog = screen.getByRole('dialog')
    const labelId = dialog.getAttribute('aria-labelledby')
    const descId = dialog.getAttribute('aria-describedby')
    expect(labelId).toBeTruthy()
    expect(descId).toBeTruthy()
    expect(document.getElementById(labelId!)).toBeTruthy()
    expect(document.getElementById(descId!)).toBeTruthy()
  })

  it('Escape closes the popup', () => {
    render(<ExitIntentPopup sessionKey="sa:test-key-3" />)
    act(() => openPopup())
    expect(screen.getByRole('dialog')).toBeTruthy()
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('close button is focused on open', () => {
    render(<ExitIntentPopup sessionKey="sa:test-key-4" />)
    act(() => openPopup())
    const closeBtn = screen.getByLabelText('Fermer')
    expect(document.activeElement).toBe(closeBtn)
  })

  it('restores focus to the prior element on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    render(<ExitIntentPopup sessionKey="sa:test-key-5" />)
    act(() => openPopup())
    expect(document.activeElement).not.toBe(trigger)
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(document.activeElement).toBe(trigger)
  })

  it('X icon is aria-hidden so only the button label is announced', () => {
    render(<ExitIntentPopup sessionKey="sa:test-key-6" />)
    act(() => openPopup())
    const closeBtn = screen.getByLabelText('Fermer')
    const svg = closeBtn.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})
