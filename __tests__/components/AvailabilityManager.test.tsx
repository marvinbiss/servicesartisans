// @vitest-environment jsdom
/**
 * Tests — AvailabilityManager
 * Couvre : état vide, formulaire, validation fin <= début.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
    Clock: icon('Clock'),
    Plus: icon('Plus'),
    Trash2: icon('Trash2'),
    Calendar: icon('Calendar'),
    Loader2: icon('Loader2'),
    AlertCircle: icon('AlertCircle'),
  }
})

// Mock SWR pour contrôler les données retournées
const mockMutate = vi.fn()
let swrData: { success: boolean; slots: unknown[] } | undefined
let swrError: Error | undefined
let swrIsLoading: boolean

vi.mock('swr', () => ({
  default: () => ({
    data: swrData,
    error: swrError,
    isLoading: swrIsLoading,
    mutate: mockMutate,
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// ── Import après mocks ─────────────────────────────────────────────────────

import { AvailabilityManager } from '@/components/artisan-dashboard/AvailabilityManager'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AvailabilityManager', () => {
  beforeEach(() => {
    swrData = { success: true, slots: [] }
    swrError = undefined
    swrIsLoading = false
    mockFetch.mockReset()
    mockMutate.mockReset()
  })

  it('affiche le message "Aucun créneau" quand il n\'y a pas de créneaux', () => {
    render(<AvailabilityManager />)
    expect(screen.getByText(/Aucun créneau à venir/)).toBeInTheDocument()
  })

  it("affiche les selects d'heure dans le formulaire", () => {
    render(<AvailabilityManager />)

    // Le select de date est présent
    expect(screen.getByLabelText('Date')).toBeInTheDocument()

    // Les selects d'heure sont présents
    expect(screen.getByLabelText('Début')).toBeInTheDocument()
    expect(screen.getByLabelText('Fin')).toBeInTheDocument()

    // Le bouton Ajouter est présent
    expect(screen.getByRole('button', { name: /Ajouter/ })).toBeInTheDocument()
  })

  it("affiche une erreur quand l'heure de fin est avant l'heure de début", () => {
    render(<AvailabilityManager />)

    // Par défaut : début=09:00, fin=10:00 → pas d'erreur
    expect(screen.queryByText(/L'heure de fin doit être après/)).not.toBeInTheDocument()

    // Changer la fin à 08:00 (avant le début à 09:00)
    const finSelect = screen.getByLabelText('Fin')
    fireEvent.change(finSelect, { target: { value: '08:00' } })

    expect(screen.getByText("L'heure de fin doit être après l'heure de début")).toBeInTheDocument()

    // Le bouton Ajouter doit être désactivé
    const addButton = screen.getByRole('button', { name: /Ajouter/ })
    expect(addButton).toBeDisabled()
  })

  it("affiche une erreur quand l'heure de fin est égale à l'heure de début", () => {
    render(<AvailabilityManager />)

    // Mettre début et fin à la même heure
    const debutSelect = screen.getByLabelText('Début')
    const finSelect = screen.getByLabelText('Fin')
    fireEvent.change(debutSelect, { target: { value: '10:00' } })
    fireEvent.change(finSelect, { target: { value: '10:00' } })

    expect(screen.getByText("L'heure de fin doit être après l'heure de début")).toBeInTheDocument()
  })

  it('affiche le spinner de chargement', () => {
    swrIsLoading = true
    swrData = undefined

    render(<AvailabilityManager />)
    expect(screen.getByText('Chargement des créneaux...')).toBeInTheDocument()
  })

  it("affiche le message d'erreur quand le chargement échoue", () => {
    swrError = new Error('Network error')
    swrIsLoading = false

    render(<AvailabilityManager />)
    expect(screen.getByText(/Impossible de charger les créneaux/)).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })
})
