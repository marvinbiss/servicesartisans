// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import SearchFilters from './SearchFilters'

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: /Filtres/ }))
}

describe('SearchFilters — toolbar roving tabindex', () => {
  it('renders the expanded panel with role="toolbar" and horizontal orientation', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('only the first toolbar item is tabbable initially', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const items = document.querySelectorAll('[data-toolbar-item]')
    expect(items[0].getAttribute('tabindex')).toBe('0')
    for (let i = 1; i < items.length; i++) {
      expect(items[i].getAttribute('tabindex')).toBe('-1')
    }
  })

  it('ArrowRight moves the active tabindex to the next item', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    const items = toolbar.querySelectorAll<HTMLElement>('[data-toolbar-item]')
    items[0].focus()
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' })
    expect(items[1].getAttribute('tabindex')).toBe('0')
    expect(items[0].getAttribute('tabindex')).toBe('-1')
  })

  it('ArrowLeft wraps from first to last', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    const items = toolbar.querySelectorAll<HTMLElement>('[data-toolbar-item]')
    items[0].focus()
    fireEvent.keyDown(toolbar, { key: 'ArrowLeft' })
    expect(items[items.length - 1].getAttribute('tabindex')).toBe('0')
  })

  it('End jumps to the last item', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    const items = toolbar.querySelectorAll<HTMLElement>('[data-toolbar-item]')
    items[0].focus()
    fireEvent.keyDown(toolbar, { key: 'End' })
    expect(items[items.length - 1].getAttribute('tabindex')).toBe('0')
  })

  it('Home jumps back to the first item', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    const items = toolbar.querySelectorAll<HTMLElement>('[data-toolbar-item]')
    items[1].focus()
    fireEvent.keyDown(toolbar, { key: 'Home' })
    expect(items[0].getAttribute('tabindex')).toBe('0')
  })

  it('non-arrow keys do not steal default behaviour (no preventDefault)', () => {
    render(<SearchFilters onFilterChange={() => {}} totalResults={42} />)
    openPanel()
    const toolbar = screen.getByRole('toolbar', { name: 'Options de filtrage' })
    const event = { key: 'a', preventDefault: vi.fn() }
    fireEvent.keyDown(toolbar, event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('toggling Vérifié still fires the onFilterChange callback', () => {
    const onFilterChange = vi.fn()
    render(<SearchFilters onFilterChange={onFilterChange} totalResults={42} />)
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Vérifié' }))
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ verified: true }))
  })
})
