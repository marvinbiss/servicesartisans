/**
 * Tests — Admin Dashboard Components
 * Covers: StatsGrid, RecentActivity, PendingReports, ActivityChart
 *
 * Tests loading/skeleton states, empty states, data rendering,
 * accessibility (aria-labels, roles), and French text assertions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import React from 'react'

// ============================================
// Mock setup — must come before component imports
// ============================================

// --- next/link mock ---
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// --- lucide-react mock ---
vi.mock('lucide-react', () => {
  const iconFactory = (name: string) => {
    const Icon = ({ className }: { className?: string }) => (
      <span data-testid={`icon-${name}`} className={className} />
    )
    Icon.displayName = name
    return Icon
  }

  return {
    Users: iconFactory('Users'),
    Briefcase: iconFactory('Briefcase'),
    Calendar: iconFactory('Calendar'),
    DollarSign: iconFactory('DollarSign'),
    TrendingUp: iconFactory('TrendingUp'),
    TrendingDown: iconFactory('TrendingDown'),
    Minus: iconFactory('Minus'),
    Star: iconFactory('Star'),
    AlertTriangle: iconFactory('AlertTriangle'),
    Activity: iconFactory('Activity'),
    ArrowRight: iconFactory('ArrowRight'),
    CheckCircle: iconFactory('CheckCircle'),
    XCircle: iconFactory('XCircle'),
    Loader2: iconFactory('Loader2'),
    X: iconFactory('X'),
    Info: iconFactory('Info'),
  }
})

// --- recharts mock ---
vi.mock('recharts', () => ({
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}))

// --- adminMutate mock ---
const mockAdminMutate = vi.fn()
vi.mock('@/hooks/admin/useAdminFetch', () => ({
  adminMutate: (...args: unknown[]) => mockAdminMutate(...args),
}))

// --- ConfirmationModal mock ---
vi.mock('@/components/admin/ConfirmationModal', () => ({
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onClose,
    title,
    message,
    children,
  }: {
    isOpen: boolean
    onConfirm: () => void
    onClose: () => void
    title: string
    message: string
    confirmText?: string
    variant?: string
    children?: React.ReactNode
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="confirmation-modal" role="dialog">
        <p data-testid="modal-title">{title}</p>
        <p data-testid="modal-message">{message}</p>
        {children}
        <button data-testid="modal-confirm" onClick={onConfirm}>Confirmer</button>
        <button data-testid="modal-cancel" onClick={onClose}>Annuler</button>
      </div>
    )
  },
}))

// --- Toast mock ---
vi.mock('@/components/admin/Toast', () => ({
  Toast: ({ toast, onClose }: { toast: { type: string; message: string } | null; onClose: () => void }) => {
    if (!toast) return null
    return (
      <div data-testid="toast" data-type={toast.type}>
        {toast.message}
        <button onClick={onClose} data-testid="toast-close">close</button>
      </div>
    )
  },
}))

// --- clsx mock (used by ConfirmationModal) ---
vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

// ============================================
// Component imports — after mocks
// ============================================

import { StatsGrid } from '@/components/admin/dashboard/StatsGrid'
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity'
import { PendingReports } from '@/components/admin/dashboard/PendingReports'
import { ActivityChart } from '@/components/admin/dashboard/ActivityChart'

// ============================================
// Test data factories
// ============================================

function buildStats(overrides: Partial<{
  totalUsers: number
  totalArtisans: number
  totalBookings: number
  totalRevenue: number
  trends: { users: number; bookings: number; revenue: number }
}> = {}) {
  return {
    totalUsers: 1250,
    totalArtisans: 48,
    totalBookings: 320,
    totalRevenue: 150000, // in cents
    trends: {
      users: 12,
      bookings: -5,
      revenue: 0,
    },
    ...overrides,
  }
}

function buildActivityItems() {
  return [
    {
      id: 'a1',
      type: 'booking' as const,
      action: 'Nouvelle réservation',
      details: 'Plomberie chez Jean Dupont',
      timestamp: new Date(Date.now() - 30_000).toISOString(), // 30s ago
      status: 'confirmed',
    },
    {
      id: 'a2',
      type: 'review' as const,
      action: 'Nouvel avis publié',
      details: '5 étoiles pour Martin Électricité',
      timestamp: new Date(Date.now() - 7_200_000).toISOString(), // 2h ago
      status: 'published',
    },
    {
      id: 'a3',
      type: 'report' as const,
      action: 'Signalement reçu',
      details: 'Contenu inapproprié signalé',
      timestamp: new Date(Date.now() - 90_000_000).toISOString(), // ~1 day ago
    },
  ]
}

function buildReports() {
  return [
    {
      id: 'rpt1',
      target_type: 'review',
      reason: 'spam',
      description: 'Ce commentaire est du spam évident',
      status: 'pending',
      created_at: '2026-02-14T10:00:00Z',
      reporter_id: 'user-123',
    },
    {
      id: 'rpt2',
      target_type: 'provider',
      reason: 'fake',
      description: null,
      status: 'pending',
      created_at: '2026-02-13T09:30:00Z',
      reporter_id: null,
    },
  ]
}

function buildChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    bookings: Math.floor(Math.random() * 10),
    users: Math.floor(Math.random() * 5),
    reviews: Math.floor(Math.random() * 3),
  }))
}

function buildEmptyChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    bookings: 0,
    users: 0,
    reviews: 0,
  }))
}

// ============================================
// StatsGrid Tests
// ============================================

describe('StatsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders 4 skeleton cards when loading is true', () => {
      const { container } = render(<StatsGrid stats={null} loading={true} />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(4)
    })

    it('renders skeletons when stats is null (even without loading flag)', () => {
      const { container } = render(<StatsGrid stats={null} />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(4)
    })

    it('does not render any links when loading', () => {
      render(<StatsGrid stats={null} loading={true} />)
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('data rendering', () => {
    it('renders all 4 stat cards with correct French labels', () => {
      render(<StatsGrid stats={buildStats()} />)

      expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
      expect(screen.getByText('Artisans actifs')).toBeInTheDocument()
      expect(screen.getByText('Réservations')).toBeInTheDocument()
      expect(screen.getByText('Revenus ce mois')).toBeInTheDocument()
    })

    it('formats user count with French locale', () => {
      const stats = buildStats({ totalUsers: 1250 })
      render(<StatsGrid stats={stats} />)
      // French locale uses non-breaking space as thousands separator
      const userCard = screen.getByText(/1[\s\u00A0\u202F]?250/)
      expect(userCard).toBeInTheDocument()
    })

    it('formats revenue from cents to euros with French locale', () => {
      const stats = buildStats({ totalRevenue: 150000 }) // 1500.00 EUR
      render(<StatsGrid stats={stats} />)
      // 150000 / 100 = 1500.00, formatted as "1 500,00 €" in fr-FR
      const revenueText = screen.getByText(/1[\s\u00A0\u202F]?500,00\s*€/)
      expect(revenueText).toBeInTheDocument()
    })

    it('renders links to correct admin pages', () => {
      render(<StatsGrid stats={buildStats()} />)
      const links = screen.getAllByRole('link')
      const hrefs = links.map((l) => l.getAttribute('href'))

      expect(hrefs).toContain('/admin/utilisateurs')
      expect(hrefs).toContain('/admin/artisans')
      expect(hrefs).toContain('/admin/reservations')
      expect(hrefs).toContain('/admin/paiements')
    })

    it('renders exactly 4 links (one per stat card)', () => {
      render(<StatsGrid stats={buildStats()} />)
      expect(screen.getAllByRole('link')).toHaveLength(4)
    })
  })

  describe('trend badges', () => {
    it('displays positive trend with + prefix and green styling', () => {
      const stats = buildStats({ trends: { users: 12, bookings: 5, revenue: 8 } })
      render(<StatsGrid stats={stats} />)

      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByText('+5%')).toBeInTheDocument()
      expect(screen.getByText('+8%')).toBeInTheDocument()
    })

    it('displays negative trend without + prefix and red styling', () => {
      const stats = buildStats({ trends: { users: -3, bookings: -10, revenue: -1 } })
      render(<StatsGrid stats={stats} />)

      expect(screen.getByText('-3%')).toBeInTheDocument()
      expect(screen.getByText('-10%')).toBeInTheDocument()
      expect(screen.getByText('-1%')).toBeInTheDocument()
    })

    it('displays zero trend with 0%', () => {
      const stats = buildStats({ trends: { users: 0, bookings: 0, revenue: 0 } })
      render(<StatsGrid stats={stats} />)

      const zeroBadges = screen.getAllByText('0%')
      expect(zeroBadges).toHaveLength(3)
    })

    it('shows "vs mois dernier" text for trended cards', () => {
      render(<StatsGrid stats={buildStats()} />)
      const trendLabels = screen.getAllByText('vs mois dernier')
      // 3 cards have trends: Users, Bookings, Revenue (not Artisans)
      expect(trendLabels).toHaveLength(3)
    })

    it('does not show trend badge for Artisans actifs card', () => {
      const stats = buildStats()
      render(<StatsGrid stats={stats} />)

      // The artisans card links to /admin/artisans
      const artisanLink = screen.getByRole('link', { name: /Artisans actifs/ })
      // Should not contain a trend badge
      expect(within(artisanLink).queryByText(/vs mois dernier/)).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders aria-labels with stat values on each card link', () => {
      const stats = buildStats({ trends: { users: 12, bookings: -5, revenue: 0 } })
      render(<StatsGrid stats={stats} />)

      // Users card: positive trend
      const usersLink = screen.getByRole('link', { name: /Utilisateurs.*tendance \+12%/ })
      expect(usersLink).toBeInTheDocument()

      // Bookings card: negative trend
      const bookingsLink = screen.getByRole('link', { name: /Réservations.*tendance -5%/ })
      expect(bookingsLink).toBeInTheDocument()

      // Revenue card: zero trend
      const revenueLink = screen.getByRole('link', { name: /Revenus ce mois.*tendance 0%/ })
      expect(revenueLink).toBeInTheDocument()
    })

    it('renders aria-label without trend info for Artisans card', () => {
      render(<StatsGrid stats={buildStats()} />)
      const artisanLink = screen.getByRole('link', { name: /Artisans actifs/ })
      expect(artisanLink.getAttribute('aria-label')).not.toContain('tendance')
    })
  })
})

// ============================================
// RecentActivity Tests
// ============================================

describe('RecentActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders skeleton rows when loading', () => {
      const { container } = render(<RecentActivity activity={[]} loading={true} />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(5)
    })

    it('does not render activity items when loading', () => {
      render(<RecentActivity activity={buildActivityItems()} loading={true} />)
      expect(screen.queryByText('Nouvelle réservation')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state message when no activities', () => {
      render(<RecentActivity activity={[]} />)
      expect(screen.getByText('Aucune activité récente')).toBeInTheDocument()
    })

    it('renders the Activity icon in empty state', () => {
      render(<RecentActivity activity={[]} />)
      expect(screen.getByTestId('icon-Activity')).toBeInTheDocument()
    })
  })

  describe('data rendering', () => {
    it('renders all activity items', () => {
      const items = buildActivityItems()
      render(<RecentActivity activity={items} />)

      expect(screen.getByText('Nouvelle réservation')).toBeInTheDocument()
      expect(screen.getByText('Nouvel avis publié')).toBeInTheDocument()
      expect(screen.getByText('Signalement reçu')).toBeInTheDocument()
    })

    it('renders activity detail text', () => {
      const items = buildActivityItems()
      render(<RecentActivity activity={items} />)

      expect(screen.getByText('Plomberie chez Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('5 étoiles pour Martin Électricité')).toBeInTheDocument()
      expect(screen.getByText('Contenu inapproprié signalé')).toBeInTheDocument()
    })

    it('renders French status labels', () => {
      const items = buildActivityItems()
      render(<RecentActivity activity={items} />)

      expect(screen.getByText('Confirmé')).toBeInTheDocument()
      expect(screen.getByText('Publié')).toBeInTheDocument()
    })

    it('does not render status label when status is undefined', () => {
      const items = buildActivityItems()
      render(<RecentActivity activity={items} />)

      // The report item (id: a3) has no status
      // Ensure no extra status badges
      const allStatuses = ['Confirmé', 'Publié']
      allStatuses.forEach((label) => {
        expect(screen.getAllByText(label)).toHaveLength(1)
      })
    })

    it('renders relative time for recent items', () => {
      const items = [
        {
          id: 'recent',
          type: 'user' as const,
          action: 'Nouvel utilisateur',
          details: 'test@example.com',
          timestamp: new Date(Date.now() - 10_000).toISOString(), // 10s ago
        },
      ]
      render(<RecentActivity activity={items} />)
      expect(screen.getByText(/instant/i)).toBeInTheDocument()
    })

    it('renders relative time in minutes for items within the last hour', () => {
      const items = [
        {
          id: 'minutes',
          type: 'booking' as const,
          action: 'Réservation',
          details: 'Détail',
          timestamp: new Date(Date.now() - 300_000).toISOString(), // 5 minutes ago
        },
      ]
      render(<RecentActivity activity={items} />)
      expect(screen.getByText(/Il y a 5 min/)).toBeInTheDocument()
    })

    it('renders relative time in hours for items within the last day', () => {
      const items = [
        {
          id: 'hours',
          type: 'review' as const,
          action: 'Avis',
          details: 'Détail',
          timestamp: new Date(Date.now() - 7_200_000).toISOString(), // 2h ago
        },
      ]
      render(<RecentActivity activity={items} />)
      expect(screen.getByText(/Il y a 2h/)).toBeInTheDocument()
    })

    it('renders relative time in days for items within the last week', () => {
      const items = [
        {
          id: 'days',
          type: 'report' as const,
          action: 'Signalement',
          details: 'Détail',
          timestamp: new Date(Date.now() - 172_800_000).toISOString(), // 2 days ago
        },
      ]
      render(<RecentActivity activity={items} />)
      expect(screen.getByText(/Il y a 2j/)).toBeInTheDocument()
    })

    it('renders formatted date for items older than a week', () => {
      const items = [
        {
          id: 'old',
          type: 'user' as const,
          action: 'Ancien',
          details: 'Détail',
          timestamp: '2025-12-01T10:00:00Z', // long ago
        },
      ]
      render(<RecentActivity activity={items} />)
      // fr-FR date format: 01/12/2025
      expect(screen.getByText(/01\/12\/2025/)).toBeInTheDocument()
    })

    it('handles unknown status gracefully by rendering the raw status string', () => {
      const items = [
        {
          id: 'unknown-status',
          type: 'booking' as const,
          action: 'Test',
          details: 'Détail',
          timestamp: new Date().toISOString(),
          status: 'unknown_status',
        },
      ]
      render(<RecentActivity activity={items} />)
      expect(screen.getByText('unknown_status')).toBeInTheDocument()
    })
  })

  describe('header and navigation', () => {
    it('displays "Activité récente" heading', () => {
      render(<RecentActivity activity={[]} />)
      expect(screen.getByText('Activité récente')).toBeInTheDocument()
    })

    it('renders "Voir tout" link pointing to /admin/journal', () => {
      render(<RecentActivity activity={[]} />)
      const link = screen.getByRole('link', { name: /Voir tout/ })
      expect(link).toHaveAttribute('href', '/admin/journal')
    })
  })

  describe('accessibility', () => {
    it('has region role with correct aria-label', () => {
      render(<RecentActivity activity={[]} />)
      expect(screen.getByRole('region', { name: 'Activité récente' })).toBeInTheDocument()
    })
  })
})

// ============================================
// PendingReports Tests
// ============================================

describe('PendingReports', () => {
  const mockOnMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminMutate.mockResolvedValue({ success: true })
  })

  describe('loading state', () => {
    it('renders 3 skeleton reports when loading', () => {
      const { container } = render(
        <PendingReports reports={[]} loading={true} onMutate={mockOnMutate} />
      )
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(3)
    })

    it('does not render report data when loading', () => {
      render(
        <PendingReports reports={buildReports()} loading={true} onMutate={mockOnMutate} />
      )
      expect(screen.queryByText('Spam')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state message when no reports', () => {
      render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByText('Aucun signalement en attente')).toBeInTheDocument()
      expect(screen.getByText('Tous les signalements ont été traités')).toBeInTheDocument()
    })

    it('renders CheckCircle icon in empty state', () => {
      render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByTestId('icon-CheckCircle')).toBeInTheDocument()
    })

    it('does not show count badge when no reports', () => {
      const { container } = render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      const badge = container.querySelector('.bg-red-100.text-red-700')
      expect(badge).not.toBeInTheDocument()
    })
  })

  describe('data rendering', () => {
    it('renders all pending reports', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      // First report: review + spam
      expect(screen.getByText('Avis')).toBeInTheDocument()
      expect(screen.getByText('Spam')).toBeInTheDocument()
      expect(screen.getByText('Ce commentaire est du spam évident')).toBeInTheDocument()

      // Second report: provider + fake
      expect(screen.getByText('Artisan')).toBeInTheDocument()
      expect(screen.getByText('Faux contenu')).toBeInTheDocument()
    })

    it('shows report count badge', () => {
      const reports = buildReports()
      render(
        <PendingReports reports={reports} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders formatted date in French for each report', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )
      // 14 feb 2026 in fr-FR short: "14 févr. 2026"
      expect(screen.getByText(/14 févr\. 2026/)).toBeInTheDocument()
      expect(screen.getByText(/13 févr\. 2026/)).toBeInTheDocument()
    })

    it('does not render description when it is null', () => {
      const reports = buildReports()
      render(
        <PendingReports reports={reports} loading={false} onMutate={mockOnMutate} />
      )
      // Second report has null description — only the first description should be present
      const descriptions = screen.queryAllByText('Ce commentaire est du spam évident')
      expect(descriptions).toHaveLength(1)
    })

    it('renders correct French reason labels', () => {
      const reports = [
        { id: '1', target_type: 'review', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '2', target_type: 'review', reason: 'inappropriate', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '3', target_type: 'review', reason: 'fake', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '4', target_type: 'review', reason: 'harassment', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '5', target_type: 'review', reason: 'other', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
      ]
      render(
        <PendingReports reports={reports} loading={false} onMutate={mockOnMutate} />
      )

      expect(screen.getByText('Spam')).toBeInTheDocument()
      expect(screen.getByText('Inapproprié')).toBeInTheDocument()
      expect(screen.getByText('Faux contenu')).toBeInTheDocument()
      expect(screen.getByText('Harcèlement')).toBeInTheDocument()
      expect(screen.getByText('Autre')).toBeInTheDocument()
    })

    it('renders correct French target type labels', () => {
      const reports = [
        { id: '1', target_type: 'review', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '2', target_type: 'user', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '3', target_type: 'provider', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
        { id: '4', target_type: 'message', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
      ]
      render(
        <PendingReports reports={reports} loading={false} onMutate={mockOnMutate} />
      )

      expect(screen.getByText('Avis')).toBeInTheDocument()
      expect(screen.getByText('Utilisateur')).toBeInTheDocument()
      expect(screen.getByText('Artisan')).toBeInTheDocument()
      expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('falls back to raw target_type when label is not mapped', () => {
      const reports = [
        { id: '1', target_type: 'booking_unknown', reason: 'spam', description: null, status: 'pending', created_at: '2026-02-10T00:00:00Z', reporter_id: null },
      ]
      render(
        <PendingReports reports={reports} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByText('booking_unknown')).toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('renders resolve button with correct aria-label for each report', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )
      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      expect(resolveButtons).toHaveLength(2)
    })

    it('renders dismiss button with correct aria-label for each report', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )
      const dismissButtons = screen.getAllByRole('button', { name: 'Rejeter ce signalement' })
      expect(dismissButtons).toHaveLength(2)
    })

    it('opens confirmation modal when resolve button is clicked', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Résoudre le signalement')
    })

    it('opens confirmation modal when dismiss button is clicked', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const dismissButtons = screen.getAllByRole('button', { name: 'Rejeter ce signalement' })
      fireEvent.click(dismissButtons[0])

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Rejeter le signalement')
    })

    it('calls adminMutate with correct parameters on resolve confirmation', async () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      // Click resolve on first report
      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      // Confirm in modal
      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      expect(mockAdminMutate).toHaveBeenCalledWith(
        '/api/admin/reports/rpt1/resolve',
        { method: 'POST', body: { action: 'resolve' } }
      )
    })

    it('calls adminMutate with dismiss action on dismiss confirmation', async () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      // Click dismiss on first report
      const dismissButtons = screen.getAllByRole('button', { name: 'Rejeter ce signalement' })
      fireEvent.click(dismissButtons[0])

      // Confirm in modal
      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      expect(mockAdminMutate).toHaveBeenCalledWith(
        '/api/admin/reports/rpt1/resolve',
        { method: 'POST', body: { action: 'dismiss' } }
      )
    })

    it('calls onMutate after successful resolution', async () => {
      mockAdminMutate.mockResolvedValue({ success: true })

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      expect(mockOnMutate).toHaveBeenCalledOnce()
    })

    it('shows success toast after resolving a report', async () => {
      mockAdminMutate.mockResolvedValue({ success: true })

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveTextContent('Signalement résolu')
      expect(toast).toHaveAttribute('data-type', 'success')
    })

    it('shows success toast with dismiss message after rejecting', async () => {
      mockAdminMutate.mockResolvedValue({ success: true })

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const dismissButtons = screen.getAllByRole('button', { name: 'Rejeter ce signalement' })
      fireEvent.click(dismissButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveTextContent('Signalement rejeté')
    })

    it('shows error toast when adminMutate fails', async () => {
      mockAdminMutate.mockRejectedValue(new Error('Erreur serveur'))

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveTextContent('Erreur serveur')
      expect(toast).toHaveAttribute('data-type', 'error')
    })

    it('shows fallback error message when error has no message', async () => {
      mockAdminMutate.mockRejectedValue('string error')

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveTextContent('Erreur lors du traitement')
    })

    it('does not call onMutate when adminMutate fails', async () => {
      mockAdminMutate.mockRejectedValue(new Error('fail'))

      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )

      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      fireEvent.click(resolveButtons[0])

      const confirmBtn = screen.getByTestId('modal-confirm')
      await act(async () => {
        fireEvent.click(confirmBtn)
      })

      expect(mockOnMutate).not.toHaveBeenCalled()
    })
  })

  describe('header and navigation', () => {
    it('displays "Signalements" heading', () => {
      render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByText('Signalements')).toBeInTheDocument()
    })

    it('renders "Voir tout" link pointing to /admin/signalements', () => {
      render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      const link = screen.getByRole('link', { name: /Voir tout/ })
      expect(link).toHaveAttribute('href', '/admin/signalements')
    })
  })

  describe('accessibility', () => {
    it('has region role with correct aria-label', () => {
      render(
        <PendingReports reports={[]} loading={false} onMutate={mockOnMutate} />
      )
      expect(screen.getByRole('region', { name: 'Signalements en attente' })).toBeInTheDocument()
    })

    it('resolve buttons have title attribute "Résoudre"', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )
      const resolveButtons = screen.getAllByRole('button', { name: 'Résoudre ce signalement' })
      resolveButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('title', 'Résoudre')
      })
    })

    it('dismiss buttons have title attribute "Rejeter"', () => {
      render(
        <PendingReports reports={buildReports()} loading={false} onMutate={mockOnMutate} />
      )
      const dismissButtons = screen.getAllByRole('button', { name: 'Rejeter ce signalement' })
      dismissButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('title', 'Rejeter')
      })
    })
  })
})

// ============================================
// ActivityChart Tests
// ============================================

describe('ActivityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders skeleton when loading is true', () => {
      const { container } = render(<ActivityChart data={[]} loading={true} />)
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('does not render chart elements when loading', () => {
      render(<ActivityChart data={buildChartData()} loading={true} />)
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })
  })

  describe('mounting behavior', () => {
    it('renders chart after mounting (client-side hydration)', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      // After mounting, useEffect sets mounted=true, chart should render
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('empty data state', () => {
    it('shows empty state message when all data points are zero', () => {
      render(<ActivityChart data={buildEmptyChartData()} loading={false} />)
      expect(screen.getByText('Aucune donnée sur cette période')).toBeInTheDocument()
    })

    it('does not render chart when data is all zeros', () => {
      render(<ActivityChart data={buildEmptyChartData()} loading={false} />)
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })
  })

  describe('data rendering', () => {
    it('renders the heading "Activité des 30 derniers jours"', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      expect(screen.getByText('Activité des 30 derniers jours')).toBeInTheDocument()
    })

    it('renders a responsive container with area chart', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('renders 3 Area elements for bookings, users, reviews', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)

      expect(screen.getByTestId('area-bookings')).toBeInTheDocument()
      expect(screen.getByTestId('area-users')).toBeInTheDocument()
      expect(screen.getByTestId('area-reviews')).toBeInTheDocument()
    })

    it('assigns correct French names to Area series', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)

      expect(screen.getByTestId('area-bookings')).toHaveAttribute('data-name', 'Réservations')
      expect(screen.getByTestId('area-users')).toHaveAttribute('data-name', 'Inscriptions')
      expect(screen.getByTestId('area-reviews')).toHaveAttribute('data-name', 'Avis')
    })

    it('passes data to AreaChart with correct count', () => {
      const data = buildChartData()
      render(<ActivityChart data={data} loading={false} />)
      expect(screen.getByTestId('area-chart')).toHaveAttribute('data-count', '30')
    })

    it('renders chart axes and grid', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('renders tooltip and legend', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has region role with aria-label describing the chart', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      const region = screen.getByRole('region', { name: /Graphique d'activité des 30 derniers jours/ })
      expect(region).toBeInTheDocument()
    })

    it('renders a screen-reader-only data table for chart data', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)
      const srOnly = screen.getByText(/Graphique montrant les réservations, inscriptions et avis/)
      expect(srOnly).toBeInTheDocument()
    })

    it('screen-reader table contains column headers in French', () => {
      render(<ActivityChart data={buildChartData()} loading={false} />)

      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Réservations')).toBeInTheDocument()
      expect(screen.getByText('Inscriptions')).toBeInTheDocument()
      // "Avis" appears both as legend label and table header — check it exists
      expect(screen.getAllByText('Avis').length).toBeGreaterThanOrEqual(1)
    })

    it('screen-reader table only includes rows with non-zero data', () => {
      const data = [
        { date: '2026-01-01', bookings: 0, users: 0, reviews: 0 },
        { date: '2026-01-02', bookings: 5, users: 2, reviews: 1 },
        { date: '2026-01-03', bookings: 0, users: 0, reviews: 0 },
        { date: '2026-01-04', bookings: 3, users: 0, reviews: 0 },
      ]
      render(<ActivityChart data={data} loading={false} />)

      // Only 2 rows with non-zero data should appear in the sr-only table
      const rows = screen.getAllByRole('row')
      // 1 header row + 2 data rows = 3
      expect(rows).toHaveLength(3)
    })
  })

  describe('empty data array', () => {
    it('handles empty array without crashing', () => {
      render(<ActivityChart data={[]} loading={false} />)
      expect(screen.getByText('Aucune donnée sur cette période')).toBeInTheDocument()
    })
  })
})
