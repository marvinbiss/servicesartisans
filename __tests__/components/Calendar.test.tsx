/**
 * Tests — Calendar (Dashboard Artisan)
 * Couvre : grille 7 colonnes, navigation mois, bookings badges,
 *          indicateurs disponibilité, détail du jour sélectionné.
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
    ChevronLeft: icon('ChevronLeft'),
    ChevronRight: icon('ChevronRight'),
    Clock: icon('Clock'),
    User: icon('User'),
    Phone: icon('Phone'),
  }
})

vi.mock('@/components/ui/Badge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}))

// ── Import après mocks ─────────────────────────────────────────────────────

import Calendar, {
  type CalendarBooking,
  type CalendarAvailabilitySlot,
} from '@/components/artisan-dashboard/Calendar'

// ── Helpers ────────────────────────────────────────────────────────────────

const baseProps = {
  year: 2026,
  month: 3, // Avril (0-indexed)
  bookings: [] as CalendarBooking[],
  availabilitySlots: [] as CalendarAvailabilitySlot[],
  selectedDate: null as string | null,
  onSelectDate: vi.fn(),
  onPreviousMonth: vi.fn(),
  onNextMonth: vi.fn(),
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Calendar', () => {
  it('affiche une grille de 7 colonnes avec les jours de la semaine', () => {
    render(<Calendar {...baseProps} />)

    const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    for (const day of dayHeaders) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('affiche le bon nombre de jours pour avril 2026', () => {
    render(<Calendar {...baseProps} />)

    // Avril a 30 jours — chaque jour est un bouton avec aria-label
    const dayButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('Avril')
    )
    expect(dayButtons).toHaveLength(30)
  })

  it('affiche le titre du mois et de l\'année', () => {
    render(<Calendar {...baseProps} />)
    expect(screen.getByText('Avril 2026')).toBeInTheDocument()
  })

  it('navigue au mois précédent lors du clic', () => {
    const onPrev = vi.fn()
    render(<Calendar {...baseProps} onPreviousMonth={onPrev} />)

    const prevButton = screen.getByLabelText('Mois précédent')
    fireEvent.click(prevButton)
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('navigue au mois suivant lors du clic', () => {
    const onNext = vi.fn()
    render(<Calendar {...baseProps} onNextMonth={onNext} />)

    const nextButton = screen.getByLabelText('Mois suivant')
    fireEvent.click(nextButton)
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('affiche un badge pour un jour avec un booking', () => {
    const bookings: CalendarBooking[] = [
      {
        id: '1',
        client_name: 'Jean Dupont',
        client_email: 'jean@test.fr',
        client_phone: '0612345678',
        service_description: 'Fuite robinet',
        status: 'confirmed',
        date: '2026-04-15',
        start_time: '10:00',
        end_time: '11:00',
      },
    ]

    render(<Calendar {...baseProps} bookings={bookings} />)

    // Le bouton du 15 doit contenir le badge "1"
    const day15 = screen.getByLabelText(/15 Avril 2026.*1 RDV/)
    expect(day15).toBeInTheDocument()

    // Le badge affiche "1"
    expect(day15.querySelector('span')?.textContent).toContain('1')
  })

  it('affiche l\'indicateur vert pour un jour avec disponibilité', () => {
    const slots: CalendarAvailabilitySlot[] = [
      {
        id: 's1',
        date: '2026-04-10',
        start_time: '09:00',
        end_time: '12:00',
      },
    ]

    render(<Calendar {...baseProps} availabilitySlots={slots} />)

    // Le bouton du 10 doit mentionner les créneaux disponibles
    const day10 = screen.getByLabelText(/10 Avril 2026.*créneaux disponibles/)
    expect(day10).toBeInTheDocument()

    // L'indicateur vert (bg-emerald-500) doit être présent
    const greenDot = day10.querySelector('.bg-emerald-500')
    expect(greenDot).not.toBeNull()
  })

  it('affiche le détail des RDV quand un jour est sélectionné', () => {
    const bookings: CalendarBooking[] = [
      {
        id: '1',
        client_name: 'Jean Dupont',
        client_email: null,
        client_phone: '0612345678',
        service_description: 'Fuite robinet',
        status: 'confirmed',
        date: '2026-04-15',
        start_time: '10:00',
        end_time: '11:00',
      },
    ]

    render(<Calendar {...baseProps} bookings={bookings} selectedDate="2026-04-15" />)

    // Le nom du client est visible dans le détail
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Fuite robinet')).toBeInTheDocument()
    expect(screen.getByText('0612345678')).toBeInTheDocument()
    // Le status badge est rendu
    expect(screen.getByTestId('status-badge')).toHaveTextContent('confirmed')
  })

  it('appelle onSelectDate au clic sur un jour', () => {
    const onSelect = vi.fn()
    render(<Calendar {...baseProps} onSelectDate={onSelect} />)

    // Cliquer sur le 20 avril
    const day20 = screen.getByLabelText(/20 Avril 2026/)
    fireEvent.click(day20)
    expect(onSelect).toHaveBeenCalledWith('2026-04-20')
  })

  it('affiche "Aucun rendez-vous ni créneau ce jour" quand rien le jour sélectionné', () => {
    render(<Calendar {...baseProps} selectedDate="2026-04-20" />)
    expect(screen.getByText('Aucun rendez-vous ni créneau ce jour')).toBeInTheDocument()
  })
})
