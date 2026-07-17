// @vitest-environment jsdom
/**
 * Tests — InterventionZoneEditor
 * Couvre : slider, presets, affichage ville, callback onChange.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('lucide-react', () => {
  const icon = (name: string) => {
    const I = ({ className }: { className?: string }) => (
      <span data-testid={`icon-${name}`} className={className} />
    )
    I.displayName = name
    return I
  }
  return {
    MapPin: icon('MapPin'),
  }
})

// ── Import après mocks ─────────────────────────────────────────────────────

import { InterventionZoneEditor } from '@/components/artisan-dashboard/InterventionZoneEditor'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('InterventionZoneEditor', () => {
  it('affiche la valeur courante du slider', () => {
    render(<InterventionZoneEditor value={50} city="Paris" onChange={vi.fn()} />)

    // Le summary affiche "50 km" dans le texte principal (text-2xl)
    const summary = screen.getByText((_, el) => {
      return (
        el?.tagName === 'SPAN' &&
        el.classList.contains('text-2xl') &&
        el.textContent?.trim() === '50 km'
      )
    })
    expect(summary).toBeInTheDocument()
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('50')
  })

  it('appelle onChange quand le slider change', () => {
    const onChange = vi.fn()
    render(<InterventionZoneEditor value={50} city="Paris" onChange={onChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '75' } })

    expect(onChange).toHaveBeenCalledWith(75)
  })

  it('met le slider à 25 quand on clique sur le preset 25 km', () => {
    const onChange = vi.fn()
    render(<InterventionZoneEditor value={50} city="Paris" onChange={onChange} />)

    const preset25 = screen.getByRole('button', { name: '25 km' })
    fireEvent.click(preset25)

    expect(onChange).toHaveBeenCalledWith(25)
  })

  it('affiche les 4 presets (10, 25, 50, 100)', () => {
    render(<InterventionZoneEditor value={50} city="Paris" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '10 km' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '25 km' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '50 km' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '100 km' })).toBeInTheDocument()
  })

  it('affiche "50 km autour de Paris" quand city=Paris et value=50', () => {
    render(<InterventionZoneEditor value={50} city="Paris" onChange={vi.fn()} />)

    const summary = screen.getByText((_, el) => {
      return (
        el?.tagName === 'SPAN' &&
        el.classList.contains('text-2xl') &&
        el.textContent?.trim() === '50 km'
      )
    })
    expect(summary).toBeInTheDocument()
    expect(screen.getByText('autour de Paris')).toBeInTheDocument()
  })

  it('affiche "autour de votre adresse" quand city est null', () => {
    render(<InterventionZoneEditor value={30} city={null} onChange={vi.fn()} />)

    expect(screen.getByText('autour de votre adresse')).toBeInTheDocument()
  })

  it('clampe la valeur entre 5 et 200', () => {
    const { rerender } = render(<InterventionZoneEditor value={0} city="Lyon" onChange={vi.fn()} />)
    // Valeur sous le minimum → clampée à 5
    const getSummary = (text: string) =>
      screen.getByText((_, el) => {
        return (
          el?.tagName === 'SPAN' &&
          el.classList.contains('text-2xl') &&
          el.textContent?.trim() === text
        )
      })
    expect(getSummary('5 km')).toBeInTheDocument()

    rerender(<InterventionZoneEditor value={999} city="Lyon" onChange={vi.fn()} />)
    // Valeur au-dessus du maximum → clampée à 200
    expect(getSummary('200 km')).toBeInTheDocument()
  })

  it('met en surbrillance le preset actif', () => {
    render(<InterventionZoneEditor value={25} city="Paris" onChange={vi.fn()} />)

    const preset25 = screen.getByRole('button', { name: '25 km' })
    expect(preset25).toHaveClass('bg-primary-500', 'text-white')

    const preset50 = screen.getByRole('button', { name: '50 km' })
    expect(preset50).toHaveClass('bg-sand-100')
  })
})
