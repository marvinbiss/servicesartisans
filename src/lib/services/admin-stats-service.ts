/**
 * Admin Stats Service — Centralized Supabase queries for admin stats/analytics/audit/export/KPIs
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supabase client type (admin) */
type SupabaseClient = ReturnType<typeof createAdminClient>

const BATCH_SIZE = 1000

// ── Stats (dashboard) ─────────────────────────────────────────────────────

export interface DashboardStatsResult {
  stats: {
    totalUsers: number
    totalArtisans: number
    totalBookings: number
    totalRevenue: number
    pendingReports: number
    averageRating: number
    newUsersToday: number
    newBookingsToday: number
    activeUsers7d: number
    trends: { users: number; bookings: number; revenue: number }
  }
  recentActivity: ActivityItem[]
  pendingReports: PendingReport[]
  chartData: DayChartPoint[]
  estimationLeads: {
    total: number
    today: number
    recent: EstimationLeadRow[]
  }
}

export interface ActivityItem {
  id: string
  type: string
  action: string
  details: string
  timestamp: string
  status?: string
}

export interface PendingReport {
  id: string
  target_type: string
  reason: string
  description: string | null
  status: string
  created_at: string
  reporter_id: string | null
}

export interface DayChartPoint {
  date: string
  users: number
  bookings: number
  reviews: number
}

export interface EstimationLeadRow {
  id: string
  nom: string | null
  telephone: string
  metier: string
  ville: string
  source: string
  created_at: string
}

// ── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsParams {
  range: string
  search: string
  feedPage: number
}

export interface AnalyticsProvider {
  id: string
  name: string
  city: string
  specialty: string
  slug: string
  stableId: string
  views: number
  reveals: number
  clicks: number
  lastActivity: string
}

export interface AnalyticsRecentEvent {
  id: string
  type: string
  source: string
  date: string
  providerName: string
  providerCity: string
  providerSlug: string
  providerStableId: string
  providerSpecialty: string
  url: string
}

export interface AnalyticsResult {
  totals: { views: number; reveals: number; clicks: number }
  trends: { views: number | null; reveals: number | null; clicks: number | null }
  chartData: { date: string; views: number; reveals: number; clicks: number }[]
  providers: AnalyticsProvider[]
  recentEvents: AnalyticsRecentEvent[]
  eventTotal: number
  feedPage: number
  feedPerPage: number
}

// ── Visitors ──────────────────────────────────────────────────────────────

export interface VisitorParams {
  range: string
}

export interface VisitorResult {
  totals: {
    uniqueVisitors: number
    totalPageViews: number
    avgPagesPerSession: number
    totalSessions: number
  }
  trends: { visitors: number | null; pageViews: number | null }
  dailyChart: { date: string; visitors: number; pageViews: number }[]
  weeklyChart: { week: string; visitors: number; pageViews: number }[]
  topPages: { path: string; views: number; uniqueVisitors: number }[]
  recentSessions: {
    sessionId: string
    visitorId: string
    pages: { path: string; time: string; title?: string }[]
    startTime: string
    pageCount: number
  }[]
}

// ── Audit ─────────────────────────────────────────────────────────────────

export interface AuditParams {
  page: number
  limit: number
  action: string
  entityType: string
  adminId?: string
  dateFrom?: string
  dateTo?: string
}

export interface AuditLogRow {
  id: string
  action: string
  user_id: string | null
  resource_type: string | null
  resource_id: string | null
  old_value: unknown
  new_value: unknown
  metadata: unknown
  created_at: string
  admin: { email: string; full_name: string | null } | null
}

export interface AuditResult {
  logs: AuditLogRow[]
  total: number
  page: number
  totalPages: number
}

// ── Export ─────────────────────────────────────────────────────────────────

export type ExportType = 'providers' | 'quotes' | 'reviews'

export interface ExportResult {
  data: Record<string, unknown>[]
  filename: string
}

// ── Journal ───────────────────────────────────────────────────────────────

export interface JournalParams {
  page: number
  action: string | null
  userId: string | null
}

export interface JournalRow {
  id: string
  action: string
  user_id: string | null
  resource_type: string | null
  resource_id: string | null
  new_value: unknown
  metadata: unknown
  created_at: string
}

export interface JournalResult {
  logs: JournalRow[]
  total: number
  page: number
  pageSize: number
}

// ── KPIs ──────────────────────────────────────────────────────────────────

export interface KPIsResult {
  leads: { total: number; today: number; thisWeek: number; thisMonth: number }
  events: { total: number; today: number }
  assignments: { total: number; pending: number; viewed: number; quoted: number; declined: number }
  providers: { total: number; active: number; withLeads: number }
  quality: {
    avgResponseMinutes: number
    conversionRate: number
    declineRate: number
    expiredRate: number
  }
  funnel: { stage: string; count: number; rate: number }[]
  dailyLeads: { date: string; label: string; count: number }[]
  topServices: { service: string; count: number }[]
  topCities: { city: string; count: number }[]
}

// ── Estimation Leads ──────────────────────────────────────────────────────

export interface EstimationLeadsParams {
  page: number
  limit: number
  source: string
  search?: string
  metier?: string
  from?: string
  to?: string
}

export interface EstimationLeadsResult {
  data: Record<string, unknown>[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  stats: { total: number; today: number; chat: number; callback: number }
}

// ── Crawl Stats ───────────────────────────────────────────────────────────

export interface CrawlStatsResult {
  topPages: { url: string; count: number }[]
  crawlRate: unknown[]
  pageTypes: unknown[]
  recentCrawls: { url: string; user_agent: string; created_at: string }[]
  totalCrawls30d: number
}

// ---------------------------------------------------------------------------
// Helpers (shared)
// ---------------------------------------------------------------------------

/** Safely extract count from a PromiseSettledResult */
function safeCount(r: PromiseSettledResult<{ count: number | null; error?: unknown }>): number {
  if (r.status !== 'fulfilled') return 0
  if (r.value.error) return 0
  return r.value.count ?? 0
}

/** Safely extract data array from a PromiseSettledResult */
function safeData<T>(r: PromiseSettledResult<{ data: T[] | null; error?: unknown }>): T[] {
  if (r.status !== 'fulfilled') return []
  if (r.value.error) return []
  return r.value.data ?? []
}

/** Log errors from a batch of Promise.allSettled results */
function logBatchErrors(
  label: string,
  results: PromiseSettledResult<{ error?: { message: string; code?: string } | null }>[]
): void {
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      logger.warn(`[admin-stats] ${label}[${i}] rejected`, { reason: String(r.reason) })
    } else if (r.value.error) {
      logger.warn(`[admin-stats] ${label}[${i}] query error`, {
        message: r.value.error.message,
        code: r.value.error.code,
      })
    }
  })
}

/** Compute % change between two periods */
function trend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/** Compute % change — returns null when no previous data */
function trendNullable(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

/** Group timestamps by YYYY-MM-DD, return counts per day */
function countByDay(rows: { created_at: string }[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const day = r.created_at.slice(0, 10)
    map[day] = (map[day] || 0) + 1
  }
  return map
}

/**
 * Fetch all rows from a query by paginating in batches of BATCH_SIZE.
 * Supabase PostgREST max-rows default is 1000.
 */
async function fetchAllBatched<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const all: T[] = []
  let offset = 0
  while (true) {
    const { data, error } = await buildQuery(offset, offset + BATCH_SIZE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < BATCH_SIZE) break
    offset += BATCH_SIZE
  }
  return all
}

// ---------------------------------------------------------------------------
// 1. getDashboardStats
// ---------------------------------------------------------------------------

export async function getDashboardStats(supabase?: SupabaseClient): Promise<DashboardStatsResult> {
  const sb = supabase ?? createAdminClient()
  const now = new Date()
  const todayStart = now.toISOString().slice(0, 10) + 'T00:00:00.000Z'
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString()

  const [
    totalUsersR,
    totalArtisansR,
    totalBookingsR,
    pendingReportsR,
    reviewsR,
    newUsersTodayR,
    newBookingsTodayR,
    usersThisMonthR,
    usersLastMonthR,
    bookingsThisMonthR,
    bookingsLastMonthR,
    revThisMonthR,
    revLastMonthR,
    activeUsers7dR,
    recentBookingsR,
    recentReviewsR,
    pendingReportsListR,
    chartProfilesR,
    chartBookingsR,
    chartReviewsR,
    estimationTotalR,
    estimationTodayR,
    recentEstimationLeadsR,
  ] = await Promise.allSettled([
    sb.from('profiles').select('id', { count: 'exact', head: true }),
    sb.from('providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('bookings').select('id', { count: 'exact', head: true }),
    sb.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('reviews').select('rating').eq('status', 'published').limit(200),
    sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    sb.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    sb
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart),
    sb
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', lastMonthStart)
      .lt('created_at', thisMonthStart),
    sb
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart),
    sb
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', lastMonthStart)
      .lt('created_at', thisMonthStart),
    sb
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart)
      .eq('payment_status', 'paid'),
    sb
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', lastMonthStart)
      .lt('created_at', thisMonthStart)
      .eq('payment_status', 'paid'),
    sb
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('updated_at', sevenDaysAgo),
    sb
      .from('bookings')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb
      .from('reviews')
      .select('id, rating, author_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb
      .from('user_reports')
      .select('id, target_type, reason, description, status, created_at, reporter_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
    sb.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo).limit(5000),
    sb.from('bookings').select('created_at').gte('created_at', thirtyDaysAgo).limit(5000),
    sb.from('reviews').select('created_at').gte('created_at', thirtyDaysAgo).limit(5000),
    sb.from('estimation_leads').select('id', { count: 'exact', head: true }),
    sb
      .from('estimation_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    sb
      .from('estimation_leads')
      .select('id, nom, telephone, metier, ville, source, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  logBatchErrors('queries', [
    totalUsersR,
    totalArtisansR,
    totalBookingsR,
    pendingReportsR,
    reviewsR,
    newUsersTodayR,
    newBookingsTodayR,
    usersThisMonthR,
    usersLastMonthR,
    bookingsThisMonthR,
    bookingsLastMonthR,
    revThisMonthR,
    revLastMonthR,
    activeUsers7dR,
    recentBookingsR,
    recentReviewsR,
    pendingReportsListR,
    chartProfilesR,
    chartBookingsR,
    chartReviewsR,
    estimationTotalR,
    estimationTodayR,
    recentEstimationLeadsR,
  ])

  // Average rating
  const ratings = safeData<{ rating: number }>(
    reviewsR as PromiseSettledResult<{ data: { rating: number }[] | null }>
  )
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
      : 0

  // Revenue trend (paid bookings count, no amount column)
  const paidThisMonth = safeCount(
    revThisMonthR as PromiseSettledResult<{ count: number | null; error?: unknown }>
  )
  const paidLastMonth = safeCount(
    revLastMonthR as PromiseSettledResult<{ count: number | null; error?: unknown }>
  )

  // Activity feed
  const activity: ActivityItem[] = []

  for (const b of safeData<{ id: string; status: string; created_at: string }>(
    recentBookingsR as PromiseSettledResult<{
      data: { id: string; status: string; created_at: string }[] | null
    }>
  )) {
    activity.push({
      id: `b-${b.id}`,
      type: 'booking',
      action: 'Nouvelle réservation',
      details: 'Nouvelle réservation',
      timestamp: b.created_at,
      status: b.status,
    })
  }

  for (const r of safeData<{
    id: string
    rating: number
    author_name: string | null
    status: string
    created_at: string
  }>(
    recentReviewsR as PromiseSettledResult<{
      data:
        | {
            id: string
            rating: number
            author_name: string | null
            status: string
            created_at: string
          }[]
        | null
    }>
  )) {
    activity.push({
      id: `r-${r.id}`,
      type: 'review',
      action: 'Nouvel avis',
      details: `${r.author_name || 'Anonyme'} — ${r.rating} étoile${r.rating > 1 ? 's' : ''}`,
      timestamp: r.created_at,
      status: r.status,
    })
  }

  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Pending reports
  const pendingReports = safeData<PendingReport>(
    pendingReportsListR as PromiseSettledResult<{ data: PendingReport[] | null }>
  )

  // Chart data (30 days)
  const profilesByDay = countByDay(
    safeData<{ created_at: string }>(
      chartProfilesR as PromiseSettledResult<{ data: { created_at: string }[] | null }>
    )
  )
  const bookingsByDay = countByDay(
    safeData<{ created_at: string }>(
      chartBookingsR as PromiseSettledResult<{ data: { created_at: string }[] | null }>
    )
  )
  const reviewsByDay = countByDay(
    safeData<{ created_at: string }>(
      chartReviewsR as PromiseSettledResult<{ data: { created_at: string }[] | null }>
    )
  )

  const chartData: DayChartPoint[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    chartData.push({
      date: key,
      users: profilesByDay[key] || 0,
      bookings: bookingsByDay[key] || 0,
      reviews: reviewsByDay[key] || 0,
    })
  }

  return {
    stats: {
      totalUsers: safeCount(totalUsersR),
      totalArtisans: safeCount(totalArtisansR),
      totalBookings: safeCount(totalBookingsR),
      totalRevenue: 0,
      pendingReports: safeCount(pendingReportsR),
      averageRating,
      newUsersToday: safeCount(newUsersTodayR),
      newBookingsToday: safeCount(newBookingsTodayR),
      activeUsers7d: safeCount(activeUsers7dR),
      trends: {
        users: trend(safeCount(usersThisMonthR), safeCount(usersLastMonthR)),
        bookings: trend(safeCount(bookingsThisMonthR), safeCount(bookingsLastMonthR)),
        revenue: trend(paidThisMonth, paidLastMonth),
      },
    },
    recentActivity: activity.slice(0, 10),
    pendingReports,
    chartData,
    estimationLeads: {
      total: safeCount(estimationTotalR),
      today: safeCount(estimationTodayR),
      recent: safeData<EstimationLeadRow>(
        recentEstimationLeadsR as PromiseSettledResult<{ data: EstimationLeadRow[] | null }>
      ),
    },
  }
}

// ---------------------------------------------------------------------------
// 2. getAnalyticsEvents
// ---------------------------------------------------------------------------

const FEED_PER_PAGE = 50

export async function getAnalyticsEvents(
  params: AnalyticsParams,
  supabase?: SupabaseClient
): Promise<AnalyticsResult> {
  const sb = supabase ?? createAdminClient()
  const { range, search, feedPage } = params

  // Date filter
  let dateFilter: string | null = null
  const now = Date.now()
  if (range === '7d') dateFilter = new Date(now - 7 * 86400000).toISOString()
  else if (range === '30d') dateFilter = new Date(now - 30 * 86400000).toISOString()
  else if (range === '90d') dateFilter = new Date(now - 90 * 86400000).toISOString()

  // Previous period
  let prevStart: string | null = null
  let prevEnd: string | null = null
  if (range === '7d') {
    prevStart = new Date(now - 14 * 86400000).toISOString()
    prevEnd = new Date(now - 7 * 86400000).toISOString()
  } else if (range === '30d') {
    prevStart = new Date(now - 60 * 86400000).toISOString()
    prevEnd = new Date(now - 30 * 86400000).toISOString()
  } else if (range === '90d') {
    prevStart = new Date(now - 180 * 86400000).toISOString()
    prevEnd = new Date(now - 90 * 86400000).toISOString()
  }

  const feedOffset = (feedPage - 1) * FEED_PER_PAGE

  const [events, prevEvents, recentResult, countResult] = await Promise.all([
    fetchAllBatched<{
      provider_id: string
      event_type: string
      created_at: string
      source: string
      providers: unknown
    }>((from, to) => {
      let q = sb
        .from('analytics_events')
        .select(
          'provider_id, event_type, created_at, source, providers!inner(name, address_city, slug, stable_id, specialty)'
        )
        .neq('event_type', 'page_view')
        .order('created_at', { ascending: false })
        .range(from, to)
      if (dateFilter) q = q.gte('created_at', dateFilter)
      return q
    }),

    prevStart && prevEnd
      ? fetchAllBatched<{ event_type: string }>((from, to) =>
          sb
            .from('analytics_events')
            .select('event_type')
            .neq('event_type', 'page_view')
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .gte('created_at', prevStart!)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .lt('created_at', prevEnd!)
            .range(from, to)
        )
      : Promise.resolve([]),

    (() => {
      let q = sb
        .from('analytics_events')
        .select(
          'id, provider_id, event_type, source, created_at, metadata, providers!inner(name, address_city, slug, stable_id, specialty)'
        )
        .neq('event_type', 'page_view')
        .order('created_at', { ascending: false })
        .range(feedOffset, feedOffset + FEED_PER_PAGE - 1)
      if (dateFilter) q = q.gte('created_at', dateFilter)
      return q
    })(),

    (() => {
      let q = sb
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .neq('event_type', 'page_view')
      if (dateFilter) q = q.gte('created_at', dateFilter)
      return q
    })(),
  ])

  // Current totals
  const totals = {
    views: events.filter((e) => e.event_type === 'artisan_profile_view').length,
    reveals: events.filter((e) => e.event_type === 'phone_reveal').length,
    clicks: events.filter((e) => e.event_type === 'phone_click').length,
  }

  // Previous totals
  const prevTotals = {
    views: prevEvents.filter((e) => e.event_type === 'artisan_profile_view').length,
    reveals: prevEvents.filter((e) => e.event_type === 'phone_reveal').length,
    clicks: prevEvents.filter((e) => e.event_type === 'phone_click').length,
  }

  const trends = {
    views: trendNullable(totals.views, prevTotals.views),
    reveals: trendNullable(totals.reveals, prevTotals.reveals),
    clicks: trendNullable(totals.clicks, prevTotals.clicks),
  }

  // Daily chart
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 60
  const chartData: { date: string; views: number; reveals: number; clicks: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    const dateStr = d.toISOString().split('T')[0]
    chartData.push({
      date: dateStr,
      views: events.filter(
        (e) => e.event_type === 'artisan_profile_view' && e.created_at.startsWith(dateStr)
      ).length,
      reveals: events.filter(
        (e) => e.event_type === 'phone_reveal' && e.created_at.startsWith(dateStr)
      ).length,
      clicks: events.filter(
        (e) => e.event_type === 'phone_click' && e.created_at.startsWith(dateStr)
      ).length,
    })
  }

  // Per-provider aggregation
  type ProviderInfo = {
    name: string
    address_city: string
    slug: string
    stable_id: string
    specialty: string
  }
  const providerMap = new Map<string, AnalyticsProvider>()

  for (const event of events) {
    if (!event.provider_id) continue

    if (!providerMap.has(event.provider_id)) {
      const p = event.providers as unknown as ProviderInfo
      providerMap.set(event.provider_id, {
        id: event.provider_id,
        name: p?.name || 'Inconnu',
        city: p?.address_city || '',
        specialty: p?.specialty || '',
        slug: p?.slug || '',
        stableId: p?.stable_id || '',
        views: 0,
        reveals: 0,
        clicks: 0,
        lastActivity: event.created_at,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = providerMap.get(event.provider_id)!
    if (event.event_type === 'artisan_profile_view') entry.views++
    else if (event.event_type === 'phone_reveal') entry.reveals++
    else if (event.event_type === 'phone_click') entry.clicks++

    if (event.created_at > entry.lastActivity) {
      entry.lastActivity = event.created_at
    }
  }

  let providers = Array.from(providerMap.values()).sort(
    (a, b) => b.views + b.reveals + b.clicks - (a.views + a.reveals + a.clicks)
  )

  if (search) {
    providers = providers.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.city.toLowerCase().includes(search) ||
        p.specialty.toLowerCase().includes(search)
    )
  }

  // Recent activity feed
  const recentEvents: AnalyticsRecentEvent[] = (recentResult.data || []).map(
    (e: {
      id: string
      event_type: string
      source: string
      created_at: string
      metadata: unknown
      providers: unknown
    }) => {
      const p = e.providers as unknown as ProviderInfo
      const meta = e.metadata as Record<string, string> | null
      return {
        id: e.id,
        type: e.event_type,
        source: e.source,
        date: e.created_at,
        providerName: p?.name || 'Inconnu',
        providerCity: p?.address_city || '',
        providerSlug: p?.slug || '',
        providerStableId: p?.stable_id || '',
        providerSpecialty: p?.specialty || '',
        url: meta?.url || '',
      }
    }
  )

  return {
    totals,
    trends,
    chartData,
    providers,
    recentEvents,
    eventTotal: countResult.count || 0,
    feedPage,
    feedPerPage: FEED_PER_PAGE,
  }
}

// ---------------------------------------------------------------------------
// 3. getVisitorStats
// ---------------------------------------------------------------------------

interface PageViewEvent {
  visitor_id: string | null
  ip_hash: string | null
  session_id: string | null
  page_path: string | null
  metadata: Record<string, string> | null
  created_at: string
}

export async function getVisitorStats(
  params: VisitorParams,
  supabase?: SupabaseClient
): Promise<VisitorResult> {
  const sb = supabase ?? createAdminClient()
  const { range } = params

  const now = Date.now()
  let dateFilter: string | null = null
  if (range === '7d') dateFilter = new Date(now - 7 * 86400000).toISOString()
  else if (range === '30d') dateFilter = new Date(now - 30 * 86400000).toISOString()
  else if (range === '90d') dateFilter = new Date(now - 90 * 86400000).toISOString()

  let prevStart: string | null = null
  let prevEnd: string | null = null
  if (range === '7d') {
    prevStart = new Date(now - 14 * 86400000).toISOString()
    prevEnd = new Date(now - 7 * 86400000).toISOString()
  } else if (range === '30d') {
    prevStart = new Date(now - 60 * 86400000).toISOString()
    prevEnd = new Date(now - 30 * 86400000).toISOString()
  } else if (range === '90d') {
    prevStart = new Date(now - 180 * 86400000).toISOString()
    prevEnd = new Date(now - 90 * 86400000).toISOString()
  }

  const [events, prevEvents] = await Promise.all([
    fetchAllBatched<PageViewEvent>((from, to) => {
      let q = sb
        .from('analytics_events')
        .select('visitor_id, ip_hash, session_id, page_path, metadata, created_at')
        .eq('event_type', 'page_view')
        .order('created_at', { ascending: true })
        .range(from, to)
      if (dateFilter) q = q.gte('created_at', dateFilter)
      return q
    }),

    prevStart && prevEnd
      ? fetchAllBatched<{ visitor_id: string | null; ip_hash: string | null }>((from, to) =>
          sb
            .from('analytics_events')
            .select('visitor_id, ip_hash')
            .eq('event_type', 'page_view')
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .gte('created_at', prevStart!)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .lt('created_at', prevEnd!)
            .range(from, to)
        )
      : Promise.resolve([]),
  ])

  const getVisitorKey = (e: {
    visitor_id: string | null
    ip_hash: string | null
    session_id?: string | null
  }) => e.visitor_id || e.ip_hash || e.session_id || 'anonymous'

  const allVisitors = new Set(events.map(getVisitorKey))
  const prevVisitors = new Set(prevEvents.map(getVisitorKey))
  const uniqueVisitors = allVisitors.size
  const prevUniqueVisitors = prevVisitors.size

  // Daily breakdown
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 60
  const dailyVisitorsMap = new Map<string, Set<string>>()
  const dailyPageViewsMap = new Map<string, number>()

  for (let i = days - 1; i >= 0; i--) {
    const dateStr = new Date(now - i * 86400000).toISOString().split('T')[0]
    dailyVisitorsMap.set(dateStr, new Set())
    dailyPageViewsMap.set(dateStr, 0)
  }

  for (const e of events) {
    const dateStr = e.created_at.split('T')[0]
    const visitorKey = getVisitorKey(e)
    dailyVisitorsMap.get(dateStr)?.add(visitorKey)
    dailyPageViewsMap.set(dateStr, (dailyPageViewsMap.get(dateStr) || 0) + 1)
  }

  const dailyChart = Array.from(dailyVisitorsMap.entries()).map(([date, visitors]) => ({
    date,
    visitors: visitors.size,
    pageViews: dailyPageViewsMap.get(date) || 0,
  }))

  // Weekly breakdown
  const weeklyMap = new Map<string, { visitors: Set<string>; pageViews: number }>()
  for (const e of events) {
    const d = new Date(e.created_at)
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    const weekKey = monday.toISOString().split('T')[0]
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { visitors: new Set(), pageViews: 0 })
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const week = weeklyMap.get(weekKey)!
    week.visitors.add(getVisitorKey(e))
    week.pageViews++
  }

  const weeklyChart = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }))

  // Top pages
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>()
  for (const e of events) {
    if (!e.page_path) continue
    if (!pageMap.has(e.page_path)) {
      pageMap.set(e.page_path, { views: 0, visitors: new Set() })
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = pageMap.get(e.page_path)!
    entry.views++
    entry.visitors.add(getVisitorKey(e))
  }

  const topPages = Array.from(pageMap.entries())
    .map(([path, data]) => ({
      path,
      views: data.views,
      uniqueVisitors: data.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)

  // Sessions
  const sessionMap = new Map<
    string,
    { visitorId: string; pages: { path: string; time: string; title?: string }[] }
  >()
  for (const e of events) {
    if (!e.session_id) continue
    if (!sessionMap.has(e.session_id)) {
      sessionMap.set(e.session_id, { visitorId: getVisitorKey(e), pages: [] })
    }
    const meta = e.metadata
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sessionMap.get(e.session_id)!.pages.push({
      path: e.page_path || '/',
      time: e.created_at,
      title: meta?.title,
    })
  }

  const sessionSizes = Array.from(sessionMap.values()).map((s) => s.pages.length)
  const avgPagesPerSession =
    sessionSizes.length > 0
      ? Math.round((sessionSizes.reduce((a, b) => a + b, 0) / sessionSizes.length) * 10) / 10
      : 0

  const recentSessions = Array.from(sessionMap.entries())
    .filter(([, s]) => s.pages.length >= 2)
    .sort(([, a], [, b]) => {
      const lastA = a.pages[a.pages.length - 1].time
      const lastB = b.pages[b.pages.length - 1].time
      return lastB.localeCompare(lastA)
    })
    .map(([sessionId, s]) => ({
      sessionId: sessionId.substring(0, 16),
      visitorId: s.visitorId.substring(0, 12),
      pages: s.pages,
      startTime: s.pages[0].time,
      pageCount: s.pages.length,
    }))

  return {
    totals: {
      uniqueVisitors,
      totalPageViews: events.length,
      avgPagesPerSession,
      totalSessions: sessionMap.size,
    },
    trends: {
      visitors: trendNullable(uniqueVisitors, prevUniqueVisitors),
      pageViews: trendNullable(events.length, prevEvents.length),
    },
    dailyChart,
    weeklyChart,
    topPages,
    recentSessions,
  }
}

// ---------------------------------------------------------------------------
// 4. getAuditLogs
// ---------------------------------------------------------------------------

export async function getAuditLogs(
  params: AuditParams,
  sanitizeSearchQuery: (q: string) => string,
  supabase?: SupabaseClient
): Promise<AuditResult> {
  const sb = supabase ?? createAdminClient()
  const { page, limit, action, entityType, adminId, dateFrom, dateTo } = params

  const offset = (page - 1) * limit

  let query = sb.from('audit_logs').select('*', { count: 'exact' })

  if (action !== 'all') {
    const sanitizedAction = sanitizeSearchQuery(action)
    if (sanitizedAction) {
      query = query.ilike('action', `%${sanitizedAction}%`)
    }
  }

  if (entityType !== 'all') {
    query = query.eq('resource_type', entityType)
  }

  if (adminId) {
    query = query.eq('user_id', adminId)
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  const {
    data: logs,
    count,
    error,
  } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (error) {
    logger.warn('Audit logs query failed, returning empty list', {
      code: error.code,
      message: error.message,
    })
    return { logs: [], total: 0, page, totalPages: 0 }
  }

  // Enrich with admin profile info
  const enrichedLogs = logs || []
  const userIds = Array.from(
    new Set(
      enrichedLogs.map((l: Record<string, unknown>) => l.user_id as string | null).filter(Boolean)
    )
  ) as string[]
  const profilesMap = new Map<string, { email: string; full_name: string | null }>()

  if (userIds.length > 0) {
    try {
      const { data: profiles } = await sb
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      if (profiles) {
        profiles.forEach((p: { id: string; email: string; full_name: string | null }) =>
          profilesMap.set(p.id, { email: p.email, full_name: p.full_name })
        )
      }
    } catch {
      // profiles table may not exist, continue without enrichment
    }
  }

  const logsWithAdmin: AuditLogRow[] = enrichedLogs.map((log: Record<string, unknown>) => ({
    id: log.id as string,
    action: log.action as string,
    user_id: log.user_id as string | null,
    resource_type: log.resource_type as string | null,
    resource_id: log.resource_id as string | null,
    old_value: log.old_value,
    new_value: log.new_value,
    metadata: log.metadata,
    created_at: log.created_at as string,
    admin: log.user_id ? profilesMap.get(log.user_id as string) || null : null,
  }))

  return {
    logs: logsWithAdmin,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// ---------------------------------------------------------------------------
// 5. exportData
// ---------------------------------------------------------------------------

export async function exportData(
  type: ExportType,
  supabase?: SupabaseClient
): Promise<ExportResult> {
  const sb = supabase ?? createAdminClient()

  let data: Record<string, unknown>[]
  let filename: string

  switch (type) {
    case 'providers': {
      const { data: providers } = await sb
        .from('providers')
        .select('id, slug, name, address_city, phone, email, is_active, created_at')
        .order('created_at', { ascending: false })
      data = (providers || []) as Record<string, unknown>[]
      filename = 'providers'
      break
    }
    case 'quotes': {
      const { data: quotes } = await sb
        .from('quotes')
        .select('id, request_id, provider_id, amount, description, valid_until, status')
        .order('status', { ascending: true })
      data = (quotes || []) as Record<string, unknown>[]
      filename = 'quotes'
      break
    }
    case 'reviews': {
      const { data: reviews } = await sb
        .from('reviews')
        .select('id, provider_id, author_name, rating, content, status, created_at')
        .order('created_at', { ascending: false })
      data = (reviews || []) as Record<string, unknown>[]
      filename = 'reviews'
      break
    }
  }

  return { data, filename }
}

// ---------------------------------------------------------------------------
// 6. getJournalEntries
// ---------------------------------------------------------------------------

export async function getJournalEntries(
  params: JournalParams,
  supabase?: SupabaseClient
): Promise<JournalResult> {
  const sb = supabase ?? createAdminClient()
  const { page, action, userId } = params
  const limit = 50
  const offset = (page - 1) * limit

  let query = sb
    .from('audit_logs')
    .select('id, action, user_id, resource_type, resource_id, new_value, metadata, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) {
    query = query.eq('action', action)
  }
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: logs, error } = await query

  if (error) {
    logger.warn('Journal query failed, returning empty list', {
      code: error.code,
      message: error.message,
    })
    return { logs: [], total: 0, page, pageSize: limit }
  }

  let totalCount = 0
  try {
    const { count } = await sb.from('audit_logs').select('id', { count: 'exact', head: true })
    totalCount = count || 0
  } catch {
    /* use 0 */
  }

  return {
    logs: (logs || []) as JournalRow[],
    total: totalCount || 0,
    page,
    pageSize: limit,
  }
}

// ---------------------------------------------------------------------------
// 7. getKPIs
// ---------------------------------------------------------------------------

export async function getKPIs(supabase?: SupabaseClient): Promise<KPIsResult> {
  const sb = supabase ?? createAdminClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Batch 1: count queries
  const [
    totalLeadsRes,
    leadsTodayRes,
    leadsWeekRes,
    leadsMonthRes,
    totalEventsRes,
    eventsTodayRes,
    totalAssignmentsRes,
    assignPendingRes,
    assignViewedRes,
    assignQuotedRes,
    assignDeclinedRes,
    totalProvidersRes,
    activeProvidersRes,
  ] = await Promise.all([
    sb.from('devis_requests').select('id', { count: 'exact', head: true }),
    sb
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    sb
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString()),
    sb
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString()),
    sb.from('lead_events').select('id', { count: 'exact', head: true }),
    sb
      .from('lead_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    sb.from('lead_assignments').select('id', { count: 'exact', head: true }),
    sb
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    sb.from('lead_assignments').select('id', { count: 'exact', head: true }).eq('status', 'viewed'),
    sb.from('lead_assignments').select('id', { count: 'exact', head: true }).eq('status', 'quoted'),
    sb
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'declined'),
    sb.from('providers').select('id', { count: 'exact', head: true }),
    sb.from('providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const totalLeads = totalLeadsRes.count
  const leadsToday = leadsTodayRes.count
  const leadsWeek = leadsWeekRes.count
  const leadsMonth = leadsMonthRes.count
  const totalEvents = totalEventsRes.count
  const eventsToday = eventsTodayRes.count
  const totalAssignments = totalAssignmentsRes.count
  const assignPending = assignPendingRes.count
  const assignViewed = assignViewedRes.count
  const assignQuoted = assignQuotedRes.count
  const assignDeclined = assignDeclinedRes.count
  const totalProviders = totalProvidersRes.count
  const activeProviders = activeProvidersRes.count

  // Daily trend (last 14 days)
  const dailyTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(todayStart)
    d.setDate(d.getDate() - (13 - i))
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    }
  })

  // Batch 2: data queries
  const [
    provWithLeadsRes,
    allAssignmentsRes,
    expiredCountRes,
    eventTypeCountsRes,
    recentLeadsRes,
    allLeadServicesRes,
    allLeadCitiesRes,
  ] = await Promise.all([
    sb.from('lead_assignments').select('provider_id'),
    sb.from('lead_assignments').select('status, assigned_at, viewed_at'),
    sb.from('lead_events').select('id', { count: 'exact', head: true }).eq('event_type', 'expired'),
    sb.from('lead_events').select('event_type'),
    sb.from('devis_requests').select('created_at').gte('created_at', dailyTrend[0].date),
    sb.from('devis_requests').select('service_name'),
    sb.from('devis_requests').select('city'),
  ])

  // Providers with leads
  const uniqueProvWithLeads = new Set(
    (provWithLeadsRes.data || []).map((p: { provider_id: string }) => p.provider_id)
  ).size

  // Quality
  const allA = (allAssignmentsRes.data || []) as {
    status: string
    assigned_at: string
    viewed_at: string | null
  }[]
  const responseTimes = allA
    .filter((a) => a.viewed_at)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((a) => (new Date(a.viewed_at!).getTime() - new Date(a.assigned_at).getTime()) / 60000)
  const avgResponseMinutes =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length)
      : 0

  const totalA = allA.length || 1
  const conversionRate = Math.round(((assignQuoted || 0) / totalA) * 100)
  const declineRate = Math.round(((assignDeclined || 0) / totalA) * 100)

  const expiredCount = expiredCountRes.count
  const expiredRate =
    (totalLeads || 0) > 0 ? Math.round(((expiredCount || 0) / (totalLeads || 1)) * 100) : 0

  // Funnel
  const etCounts: Record<string, number> = {}
  for (const e of (eventTypeCountsRes.data || []) as { event_type: string }[]) {
    etCounts[e.event_type] = (etCounts[e.event_type] || 0) + 1
  }

  const funnelStages = ['created', 'dispatched', 'viewed', 'quoted', 'accepted', 'completed']
  const totalBase = etCounts['created'] || totalLeads || 1
  const funnel = funnelStages.map((stage) => ({
    stage,
    count: etCounts[stage] || 0,
    rate: Math.round(((etCounts[stage] || 0) / totalBase) * 100),
  }))

  // Daily trend data
  const leadsByDay: Record<string, number> = {}
  for (const l of (recentLeadsRes.data || []) as { created_at: string }[]) {
    const day = new Date(l.created_at).toISOString().split('T')[0]
    leadsByDay[day] = (leadsByDay[day] || 0) + 1
  }

  const dailyLeads = dailyTrend.map((d) => ({
    ...d,
    count: leadsByDay[d.date] || 0,
  }))

  // Top services
  const serviceCounts: Record<string, number> = {}
  for (const l of (allLeadServicesRes.data || []) as { service_name: string | null }[]) {
    if (l.service_name) {
      serviceCounts[l.service_name] = (serviceCounts[l.service_name] || 0) + 1
    }
  }

  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([service, count]) => ({ service, count }))

  // Top cities
  const cityCounts: Record<string, number> = {}
  for (const l of (allLeadCitiesRes.data || []) as { city: string | null }[]) {
    if (l.city) {
      cityCounts[l.city] = (cityCounts[l.city] || 0) + 1
    }
  }

  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }))

  return {
    leads: {
      total: totalLeads || 0,
      today: leadsToday || 0,
      thisWeek: leadsWeek || 0,
      thisMonth: leadsMonth || 0,
    },
    events: {
      total: totalEvents || 0,
      today: eventsToday || 0,
    },
    assignments: {
      total: totalAssignments || 0,
      pending: assignPending || 0,
      viewed: assignViewed || 0,
      quoted: assignQuoted || 0,
      declined: assignDeclined || 0,
    },
    providers: {
      total: totalProviders || 0,
      active: activeProviders || 0,
      withLeads: uniqueProvWithLeads,
    },
    quality: {
      avgResponseMinutes,
      conversionRate,
      declineRate,
      expiredRate,
    },
    funnel,
    dailyLeads,
    topServices,
    topCities,
  }
}

// ---------------------------------------------------------------------------
// 8. getEstimationLeads
// ---------------------------------------------------------------------------

export async function getEstimationLeads(
  params: EstimationLeadsParams,
  supabase?: SupabaseClient
): Promise<EstimationLeadsResult> {
  const sb = supabase ?? createAdminClient()
  const { page, limit, source, search, metier, from, to } = params
  const offset = (page - 1) * limit

  let query = sb
    .from('estimation_leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (source !== 'all') {
    query = query.eq('source', source)
  }

  if (search) {
    query = query.or(
      `telephone.ilike.%${search}%,nom.ilike.%${search}%,email.ilike.%${search}%,ville.ilike.%${search}%`
    )
  }

  if (metier) {
    query = query.ilike('metier', `%${metier}%`)
  }

  if (from) {
    query = query.gte('created_at', from)
  }

  if (to) {
    query = query.lte('created_at', `${to}T23:59:59.999Z`)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Erreur base de données: ${error.message}`)
  }

  // Stats query
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [totalRes, todayRes, chatRes, callbackRes] = await Promise.all([
    sb.from('estimation_leads').select('id', { count: 'exact', head: true }),
    sb
      .from('estimation_leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    sb.from('estimation_leads').select('id', { count: 'exact', head: true }).eq('source', 'chat'),
    sb
      .from('estimation_leads')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'callback'),
  ])

  return {
    data: (data ?? []) as Record<string, unknown>[],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
    stats: {
      total: totalRes.count ?? 0,
      today: todayRes.count ?? 0,
      chat: chatRes.count ?? 0,
      callback: callbackRes.count ?? 0,
    },
  }
}

// ---------------------------------------------------------------------------
// 9. deleteEstimationLead
// ---------------------------------------------------------------------------

export async function deleteEstimationLead(id: string, supabase?: SupabaseClient): Promise<void> {
  const sb = supabase ?? createAdminClient()
  const { error } = await sb.from('estimation_leads').delete().eq('id', id)
  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// 10. getCrawlStats
// ---------------------------------------------------------------------------

export async function getCrawlStats(supabase?: SupabaseClient): Promise<CrawlStatsResult> {
  const sb = supabase ?? createAdminClient()

  const [topPages, crawlRate, pageTypes, recentCrawls] = await Promise.all([
    sb
      .from('googlebot_logs')
      .select('url')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .limit(10000),
    sb.rpc('googlebot_crawl_rate_by_day'),
    sb.rpc('googlebot_page_type_distribution'),
    sb
      .from('googlebot_logs')
      .select('url, user_agent, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // Aggregate top pages
  const pageCounts = new Map<string, number>()
  for (const row of (topPages.data || []) as { url: string }[]) {
    pageCounts.set(row.url, (pageCounts.get(row.url) || 0) + 1)
  }
  const topPagesResult = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([url, count]) => ({ url, count }))

  return {
    topPages: topPagesResult,
    crawlRate: (crawlRate.data || []) as unknown[],
    pageTypes: (pageTypes.data || []) as unknown[],
    recentCrawls: (recentCrawls.data || []) as {
      url: string
      user_agent: string
      created_at: string
    }[],
    totalCrawls30d: topPages.data?.length || 0,
  }
}
