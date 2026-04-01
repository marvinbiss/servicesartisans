/**
 * GET /api/artisan/leads/stats — Lead-specific stats for artisan dashboard
 * Returns lead KPIs: counts, conversion, response time, monthly trend.
 *
 * OPTIMIZED 2026-04-01: Replaced JS-side aggregation (1000 rows fetch + 5+ iterations)
 * with SQL COUNT queries via { count: 'exact', head: true }. lead_events no longer
 * loaded entirely — individual count queries instead. Prevents OOM/timeout at 10K+ leads.
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .single()

    if (!provider) {
      return NextResponse.json({ success: false, error: { message: 'Aucun profil artisan' } }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const providerId = provider.id
    const now = new Date()

    // Date boundaries
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

    // 6-month trend boundaries
    const trendMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      return {
        start: d.toISOString(),
        end: end.toISOString(),
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      }
    })

    // -----------------------------------------------------------------------
    // Wave 1 — All independent SQL COUNT queries in parallel
    // { count: 'exact', head: true } returns only the count, zero rows transferred.
    // -----------------------------------------------------------------------
    const [
      totalCount,
      pendingCount,
      viewedCount,
      declinedCount,
      quotedCount,
      acceptedCount,
      completedCount,
      thisMonthCount,
      lastMonthCount,
      ...trendCounts
    ] = await Promise.all([
      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId),

      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'pending'),

      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'viewed'),

      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'declined'),

      adminClient
        .from('lead_events')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('event_type', 'quoted'),

      adminClient
        .from('lead_events')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('event_type', 'accepted'),

      adminClient
        .from('lead_events')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('event_type', 'completed'),

      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .gte('assigned_at', thisMonthStart),

      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .gte('assigned_at', lastMonthStart)
        .lt('assigned_at', thisMonthStart),

      // Monthly trend: 6 count queries
      ...trendMonths.map((m) =>
        adminClient
          .from('lead_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .gte('assigned_at', m.start)
          .lt('assigned_at', m.end)
      ),
    ])

    if (totalCount.error) {
      logger.error('Leads stats total count error:', totalCount.error)
      return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
    }

    // Average response time — limited to 500 recent viewed leads
    const { data: responseTimeRows } = await adminClient
      .from('lead_assignments')
      .select('assigned_at, viewed_at')
      .eq('provider_id', providerId)
      .not('viewed_at', 'is', null)
      .order('assigned_at', { ascending: false })
      .limit(500)

    const responseTimes = (responseTimeRows || []).map(
      (a) =>
        (new Date(a.viewed_at as string).getTime() - new Date(a.assigned_at).getTime()) /
        60000
    )
    const avgResponseMinutes =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
        : 0

    // Extract count values
    const total = totalCount.count ?? 0
    const pending = pendingCount.count ?? 0
    const viewed = viewedCount.count ?? 0
    const declined = declinedCount.count ?? 0
    const quoted = quotedCount.count ?? 0
    const accepted = acceptedCount.count ?? 0
    const completed = completedCount.count ?? 0
    const thisMonth = thisMonthCount.count ?? 0
    const lastMonth = lastMonthCount.count ?? 0

    const conversionRate = quoted > 0 ? Math.round((accepted / quoted) * 100) : 0
    const monthlyGrowth =
      lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

    const monthlyTrend = trendMonths.map((m, i) => ({
      month: m.label,
      count: trendCounts[i].count ?? 0,
    }))

    return NextResponse.json({
      stats: {
        total,
        pending,
        viewed,
        quoted,
        declined,
        accepted,
        completed,
        conversionRate,
        avgResponseMinutes,
        thisMonth,
        lastMonth,
        monthlyGrowth,
      },
      monthlyTrend,
    })
  } catch (error) {
    logger.error('Artisan leads stats GET error:', error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
