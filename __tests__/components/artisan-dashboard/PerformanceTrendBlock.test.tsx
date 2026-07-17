// @vitest-environment jsdom
/**
 * Tests — PerformanceTrendBlock
 *
 * Couvre :
 *  - loading skeleton, error null
 *  - empty state quand tous les totaux sont à 0
 *  - rendu des 4 lignes + totaux
 *  - calcul delta 15j récents vs 15j précédents :
 *      * growth 0→X → +100%
 *      * flat → pas de delta affiché (0)
 *      * décroissance → signe négatif
 *  - sparkline SVG rendu (role="img") avec aria-label
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('swr', () => ({ default: vi.fn() }))

import useSWR from 'swr'
import PerformanceTrendBlock from '@/components/artisan-dashboard/PerformanceTrendBlock'

const mockUseSWR = vi.mocked(useSWR)

function setSWR(ret: { data?: unknown; error?: unknown; isLoading?: boolean }) {
  mockUseSWR.mockReturnValue({
    data: ret.data,
    error: ret.error ?? undefined,
    isLoading: ret.isLoading ?? false,
    mutate: vi.fn(),
    isValidating: false,
  } as never)
}

type DayPoint = { day: string; count: number }
function zeros(n: number): DayPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    day: `2026-04-${String(i + 1).padStart(2, '0')}`,
    count: 0,
  }))
}

describe('<PerformanceTrendBlock />', () => {
  beforeEach(() => {
    mockUseSWR.mockReset()
  })

  it('skeleton quand isLoading', () => {
    setSWR({ isLoading: true })
    render(<PerformanceTrendBlock />)
    expect(screen.getByLabelText('Chargement des tendances')).toHaveAttribute('aria-busy', 'true')
  })

  it('retourne null si error', () => {
    setSWR({ error: new Error('x') })
    const { container } = render(<PerformanceTrendBlock />)
    expect(container.firstChild).toBeNull()
  })

  it('empty state si tous les totaux sont à 0', () => {
    setSWR({
      data: {
        days: 30,
        series: {
          profileViews: zeros(30),
          phoneReveals: zeros(30),
          phoneClicks: zeros(30),
          demandesRecues: zeros(30),
        },
        totals: {
          profileViews: 0,
          phoneReveals: 0,
          phoneClicks: 0,
          demandesRecues: 0,
        },
      },
    })
    render(<PerformanceTrendBlock />)
    expect(screen.getByText(/Aucune activité enregistrée/i)).toBeInTheDocument()
  })

  it("affiche les 4 lignes + totaux et des sparklines role='img'", () => {
    const series: DayPoint[] = [
      ...zeros(10),
      ...Array.from({ length: 20 }, (_, i) => ({
        day: `2026-04-${String(i + 11).padStart(2, '0')}`,
        count: i,
      })),
    ]
    setSWR({
      data: {
        days: 30,
        series: {
          profileViews: series,
          phoneReveals: series.map((p) => ({ ...p, count: p.count * 2 })),
          phoneClicks: series,
          demandesRecues: series,
        },
        totals: {
          profileViews: 190,
          phoneReveals: 380,
          phoneClicks: 190,
          demandesRecues: 190,
        },
      },
    })
    render(<PerformanceTrendBlock />)
    expect(screen.getByText('Vues du profil')).toBeInTheDocument()
    expect(screen.getByText('Numéros affichés')).toBeInTheDocument()
    expect(screen.getByText('Appels reçus')).toBeInTheDocument()
    expect(screen.getByText('Demandes reçues')).toBeInTheDocument()
    expect(screen.getByText('380')).toBeInTheDocument()
    expect(screen.getAllByRole('img').length).toBe(4) // 4 sparklines SVG
  })

  it('delta +100% quand première moitié=0, seconde moitié>0', () => {
    const series: DayPoint[] = [
      ...zeros(15),
      ...Array.from({ length: 15 }, (_, i) => ({
        day: `2026-04-${String(i + 16).padStart(2, '0')}`,
        count: 5,
      })),
    ]
    setSWR({
      data: {
        days: 30,
        series: {
          profileViews: series,
          phoneReveals: zeros(30),
          phoneClicks: zeros(30),
          demandesRecues: zeros(30),
        },
        totals: {
          profileViews: 75,
          phoneReveals: 0,
          phoneClicks: 0,
          demandesRecues: 0,
        },
      },
    })
    render(<PerformanceTrendBlock />)
    expect(screen.getByText('+100%')).toBeInTheDocument()
  })

  it('delta négatif quand la seconde moitié est plus faible', () => {
    const first = Array.from({ length: 15 }, (_, i) => ({
      day: `2026-04-${String(i + 1).padStart(2, '0')}`,
      count: 10,
    }))
    const second = Array.from({ length: 15 }, (_, i) => ({
      day: `2026-04-${String(i + 16).padStart(2, '0')}`,
      count: 5,
    }))
    const series = [...first, ...second]
    setSWR({
      data: {
        days: 30,
        series: {
          profileViews: series,
          phoneReveals: zeros(30),
          phoneClicks: zeros(30),
          demandesRecues: zeros(30),
        },
        totals: {
          profileViews: 225,
          phoneReveals: 0,
          phoneClicks: 0,
          demandesRecues: 0,
        },
      },
    })
    render(<PerformanceTrendBlock />)
    // (75-150)/150 = -50%
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('aucun delta affiché quand flat (deux moitiés identiques)', () => {
    const series: DayPoint[] = Array.from({ length: 30 }, (_, i) => ({
      day: `2026-04-${String(i + 1).padStart(2, '0')}`,
      count: 3,
    }))
    setSWR({
      data: {
        days: 30,
        series: {
          profileViews: series,
          phoneReveals: zeros(30),
          phoneClicks: zeros(30),
          demandesRecues: zeros(30),
        },
        totals: {
          profileViews: 90,
          phoneReveals: 0,
          phoneClicks: 0,
          demandesRecues: 0,
        },
      },
    })
    render(<PerformanceTrendBlock />)
    // 0% delta → rien affiché
    expect(screen.queryByText(/\+0%/)).not.toBeInTheDocument()
    expect(screen.queryByText(/-0%/)).not.toBeInTheDocument()
  })
})
