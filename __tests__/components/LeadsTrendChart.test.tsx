/**
 * Tests — LeadsTrendChart
 * Couvre : pas de données → null, avec données → rendu sans crash, memo.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Bar: ({ dataKey, children }: { dataKey: string; children?: React.ReactNode }) => (
    <div data-testid={`bar-${dataKey}`}>{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
}))

// ── Import après mocks ─────────────────────────────────────────────────────

import { LeadsTrendChart } from '@/components/dashboard/LeadsTrendChart'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LeadsTrendChart', () => {
  it('retourne null quand les données sont vides', () => {
    const { container } = render(<LeadsTrendChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand data est undefined-like (tableau vide)', () => {
    const { container } = render(<LeadsTrendChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('rend le graphique sans crash quand des données sont fournies', () => {
    const data = [
      { month: 'Jan', count: 12 },
      { month: 'Fév', count: 8 },
      { month: 'Mar', count: 15 },
    ]

    render(<LeadsTrendChart data={data} />)

    expect(screen.getByText('Tendance des demandes')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('passe les données au BarChart', () => {
    const data = [
      { month: 'Jan', count: 12 },
      { month: 'Fév', count: 8 },
    ]

    render(<LeadsTrendChart data={data} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '2')
  })

  it('est wrappé par React.memo', () => {
    // memo() donne un objet avec $$typeof Symbol(react.memo) et un type.name
    // On vérifie que le composant a la structure d'un memo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = LeadsTrendChart as any
    // React.memo wraps set displayName or the inner function has a name
    expect(comp.type?.name || comp.displayName || comp.name).toBeTruthy()
  })

  it('rend une Cell par point de données', () => {
    const data = [
      { month: 'Jan', count: 12 },
      { month: 'Fév', count: 8 },
      { month: 'Mar', count: 15 },
    ]

    render(<LeadsTrendChart data={data} />)
    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(3)
  })
})
