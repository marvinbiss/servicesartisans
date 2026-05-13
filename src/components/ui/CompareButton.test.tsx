// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { CompareButton } from './CompareButton'
import { CompareProviderWrapper } from '@/components/compare/CompareProvider'

const fakeProvider = {
  id: 'p1',
  name: 'Plomberie Lyon',
  slug: 'plomberie-lyon',
}

function renderButton() {
  return render(
    <CompareProviderWrapper>
      <CompareButton provider={fakeProvider} />
    </CompareProviderWrapper>
  )
}

describe('CompareButton', () => {
  beforeEach(() => {
    // CompareProviderWrapper persists state in localStorage — clear between
    // cases so each test starts from an empty compare list.
    localStorage.clear()
  })

  it('renders idle label and aria-pressed=false initially', () => {
    renderButton()
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.textContent).toContain('Comparer')
  })

  it('clicking adds to compare list and flips label + aria-pressed', () => {
    renderButton()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.textContent).toContain('Ajouté')
  })

  it('announces "ajouté" via live region after add', () => {
    renderButton()
    fireEvent.click(screen.getByRole('button'))
    const live = screen.getByRole('status')
    expect(live.textContent).toContain('Plomberie Lyon ajouté')
  })

  it('announces "retiré" when toggled off', () => {
    renderButton()
    const btn = screen.getByRole('button')
    fireEvent.click(btn) // add
    fireEvent.click(btn) // remove
    expect(screen.getByRole('status').textContent).toContain('retiré')
  })

  it('press flag flips back off after the animation timer', () => {
    vi.useFakeTimers()
    try {
      renderButton()
      const btn = screen.getByRole('button')
      fireEvent.click(btn)
      expect(btn.className).toContain('scale-[0.94]')
      act(() => {
        vi.advanceTimersByTime(250)
      })
      expect(btn.className).not.toContain('scale-[0.94]')
    } finally {
      vi.useRealTimers()
    }
  })
})
