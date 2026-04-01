/**
 * Tests — OpeningHoursEditor
 * Couvre : valeurs par défaut, toggle jour, "appliquer aux jours ouvrés",
 *          callback onChange.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('lucide-react', () => {
  const icon = (name: string) => {
    const I = ({ className }: { className?: string }) => <span data-testid={`icon-${name}`} className={className} />
    I.displayName = name
    return I
  }
  return {
    Copy: icon('Copy'),
  }
})

// ── Import après mocks ─────────────────────────────────────────────────────

import { OpeningHoursEditor, DEFAULT_OPENING_HOURS } from '@/components/artisan-dashboard/OpeningHoursEditor'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('OpeningHoursEditor', () => {
  it('affiche les valeurs par défaut : lundi-vendredi ouvert 08:00-18:00, samedi-dimanche fermé', () => {
    render(<OpeningHoursEditor value={DEFAULT_OPENING_HOURS} onChange={vi.fn()} />)

    // Les 7 jours sont affichés
    expect(screen.getByText('Lundi')).toBeInTheDocument()
    expect(screen.getByText('Mardi')).toBeInTheDocument()
    expect(screen.getByText('Mercredi')).toBeInTheDocument()
    expect(screen.getByText('Jeudi')).toBeInTheDocument()
    expect(screen.getByText('Vendredi')).toBeInTheDocument()
    expect(screen.getByText('Samedi')).toBeInTheDocument()
    expect(screen.getByText('Dimanche')).toBeInTheDocument()

    // Les jours ouvrés ont des toggles cochés
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(7)

    // Lundi-Vendredi : ouvert (aria-checked="true")
    for (let i = 0; i < 5; i++) {
      expect(switches[i]).toHaveAttribute('aria-checked', 'true')
    }

    // Samedi-Dimanche : fermé
    expect(switches[5]).toHaveAttribute('aria-checked', 'false')
    expect(switches[6]).toHaveAttribute('aria-checked', 'false')

    // "Fermé" affiché pour samedi et dimanche
    const fermeLabels = screen.getAllByText('Fermé')
    expect(fermeLabels).toHaveLength(2)
  })

  it('appelle onChange quand on toggle un jour ouvert vers fermé', () => {
    const onChange = vi.fn()
    render(<OpeningHoursEditor value={DEFAULT_OPENING_HOURS} onChange={onChange} />)

    // Toggle le lundi (index 0, ouvert → fermé)
    const lundiSwitch = screen.getByLabelText('Lundi ouvert')
    fireEvent.click(lundiSwitch)

    expect(onChange).toHaveBeenCalledOnce()
    const newValue = onChange.mock.calls[0][0]
    expect(newValue.lundi.ouvert).toBe(false)
    expect(newValue.lundi.debut).toBe('')
    expect(newValue.lundi.fin).toBe('')
  })

  it('appelle onChange quand on toggle un jour fermé vers ouvert', () => {
    const onChange = vi.fn()
    render(<OpeningHoursEditor value={DEFAULT_OPENING_HOURS} onChange={onChange} />)

    // Toggle le samedi (index 5, fermé → ouvert)
    const samediSwitch = screen.getByLabelText('Samedi ouvert')
    fireEvent.click(samediSwitch)

    expect(onChange).toHaveBeenCalledOnce()
    const newValue = onChange.mock.calls[0][0]
    expect(newValue.samedi.ouvert).toBe(true)
    expect(newValue.samedi.debut).toBe('08:00')
    expect(newValue.samedi.fin).toBe('18:00')
  })

  it('copie les horaires du lundi sur tous les jours ouvrés', () => {
    const customValue = {
      ...DEFAULT_OPENING_HOURS,
      lundi: { ouvert: true, debut: '09:00', fin: '17:00' },
    }
    const onChange = vi.fn()
    render(<OpeningHoursEditor value={customValue} onChange={onChange} />)

    // Cliquer sur "Appliquer le lundi aux jours ouvrés"
    const applyButton = screen.getByTitle('Copier les horaires du lundi sur mardi-vendredi')
    fireEvent.click(applyButton)

    expect(onChange).toHaveBeenCalledOnce()
    const newValue = onChange.mock.calls[0][0]

    // Tous les jours ouvrés doivent avoir les horaires du lundi
    for (const day of ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'] as const) {
      expect(newValue[day].ouvert).toBe(true)
      expect(newValue[day].debut).toBe('09:00')
      expect(newValue[day].fin).toBe('17:00')
    }

    // Samedi et dimanche restent inchangés
    expect(newValue.samedi.ouvert).toBe(false)
    expect(newValue.dimanche.ouvert).toBe(false)
  })

  it('appelle onChange avec le bon format quand on change une heure', () => {
    const onChange = vi.fn()
    render(<OpeningHoursEditor value={DEFAULT_OPENING_HOURS} onChange={onChange} />)

    // Changer l'heure d'ouverture du lundi
    const lundiDebut = screen.getByLabelText("Heure d'ouverture Lundi")
    fireEvent.change(lundiDebut, { target: { value: '10:00' } })

    expect(onChange).toHaveBeenCalledOnce()
    const newValue = onChange.mock.calls[0][0]
    expect(newValue.lundi.debut).toBe('10:00')
    expect(newValue.lundi.fin).toBe('18:00')
    expect(newValue.lundi.ouvert).toBe(true)
  })

  it('affiche une erreur quand la fermeture est avant l\'ouverture', () => {
    const badHours = {
      ...DEFAULT_OPENING_HOURS,
      lundi: { ouvert: true, debut: '18:00', fin: '08:00' },
    }
    render(<OpeningHoursEditor value={badHours} onChange={vi.fn()} />)

    expect(screen.getByText('Fermeture avant ouverture')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Corrigez les horaires invalides')
  })
})
