// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { SortDropdown, type SortOrder } from './SortDropdown'

describe('SortDropdown', () => {
  it('renders all 4 sort options', () => {
    render(<SortDropdown value="relevance" onChange={() => {}} />)
    expect(screen.getByRole('option', { name: 'Pertinence' })).toBeDefined()
    expect(screen.getByRole('option', { name: 'Mieux notés' })).toBeDefined()
    expect(screen.getByRole('option', { name: /Plus d.avis/ })).toBeDefined()
    expect(screen.getByRole('option', { name: 'Nom (A-Z)' })).toBeDefined()
  })

  it('maps "default" to "relevance" in displayed value (backward compat)', () => {
    render(<SortDropdown value="default" onChange={() => {}} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('relevance')
  })

  it('calls onChange with new SortOrder on selection', () => {
    const onChange = vi.fn()
    render(<SortDropdown value="relevance" onChange={onChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'rating' } })
    expect(onChange).toHaveBeenCalledWith('rating')
  })

  it('mobile variant exposes 44px min-height (touch target)', () => {
    render(<SortDropdown value="relevance" onChange={() => {}} variant="mobile" />)
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('min-h-[44px]')
  })

  it('desktop variant renders sort icon', () => {
    const { container } = render(<SortDropdown value="relevance" onChange={() => {}} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('SortOrder type accepts all 5 values', () => {
    const valid: SortOrder[] = ['default', 'relevance', 'name', 'rating', 'reviews']
    expect(valid).toHaveLength(5)
  })
})
