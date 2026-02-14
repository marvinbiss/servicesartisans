/**
 * GET /api/admin/system/kpis — System dashboard KPIs
 * Platform health, quality metrics, funnel, monitoring.
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify admin with settings:read permission (system KPIs)
    const auth = await requirePermission('settings', 'read')
    if (!auth.success || !auth.admin) return auth.error!

    const adminClient = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // --- Leads ---
    const { count: totalLeads } = await adminClient
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })

    const { count: leadsToday } = await adminClient
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    const { count: leadsWeek } = await adminClient
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())

    const { count: leadsMonth } = await adminClient
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())

    // --- Events ---
    const { count: totalEvents } = await adminClient
      .from('lead_events')
      .select('id', { count: 'exact', head: true })

    const { count: eventsToday } = await adminClient
      .from('lead_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    // --- Assignments ---
    const { count: totalAssignments } = await adminClient
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })

    const { count: assignPending } = await adminClient
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: assignViewed } = await adminClient
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'viewed')

    const { count: assignQuoted } = await adminClient
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'quoted')

    const { count: assignDeclined } = await adminClient
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'declined')

    // --- Providers ---
    const { count: totalProviders } = await adminClient
      .from('providers')
      .select('id', { count: 'exact', head: true })

    const { count: activeProviders } = await adminClient
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    const { data: provWithLeads } = await adminClient
      .from('lead_assignments')
      .select('provider_id')

    const uniqueProvWithLeads = new Set((provWithLeads || []).map((p) => p.provider_id)).size

    // --- Quality ---
    const { data: allAssignments } = await adminClient
      .from('lead_assignments')
      .select('status, assigned_at, viewed_at')

    const allA = allAssignments || []
    const responseTimes = allA
      .filter((a) => a.viewed_at)
      .map((a) => (new Date(a.viewed_at!).getTime() - new Date(a.assigned_at).getTime()) / 60000)
    const avgResponseMinutes = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length)
      : 0

    const totalA = allA.length || 1
    const conversionRate = Math.round(((assignQuoted || 0) / totalA) * 100)
    const declineRate = Math.round(((assignDeclined || 0) / totalA) * 100)

    const { count: expiredCount } = await adminClient
      .from('lead_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'expired')

    const expiredRate = (totalLeads || 0) > 0
      ? Math.round(((expiredCount || 0) / (totalLeads || 1)) * 100)
      : 0

    // --- Funnel ---
    const { data: eventTypeCounts } = await adminClient
      .from('lead_events')
      .select('event_type')

    const etCounts: Record<string, number> = {}
    for (const e of eventTypeCounts || []) {
      etCounts[e.event_type] = (etCounts[e.event_type] || 0) + 1
    }

    const funnelStages = ['created', 'dispatched', 'viewed', 'quoted', 'accepted', 'completed']
    const totalBase = etCounts['created'] || totalLeads || 1
    const funnel = funnelStages.map((stage) => ({
      stage,
      count: etCounts[stage] || 0,
      rate: Math.round(((etCounts[stage] || 0) / totalBase) * 100),
    }))

    // --- Daily trend (last 14 days) ---
    const dailyTrend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - (13 - i))
      return {
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      }
    })

    const { data: recentLeads } = await adminClient
      .from('devis_requests')
      .select('created_at')
      .gte('created_at', dailyTrend[0].date)

    const leadsByDay: Record<string, number> = {}
    for (const l of recentLeads || []) {
      const day = new Date(l.created_at).toISOString().split('T')[0]
      leadsByDay[day] = (leadsByDay[day] || 0) + 1
    }

    const dailyLeads = dailyTrend.map((d) => ({
      ...d,
      count: leadsByDay[d.date] || 0,
    }))

    // --- Top services ---
    const { data: allLeadServices } = await adminClient
      .from('devis_requests')
      .select('service_name')

    const serviceCounts: Record<string, number> = {}
    for (const l of allLeadServices || []) {
      if (l.service_name) {
        serviceCounts[l.service_name] = (serviceCounts[l.service_name] || 0) + 1
      }
    }

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }))

    // --- Top cities ---
    const { data: allLeadCities } = await adminClient
      .from('devis_requests')
      .select('city')

    const cityCounts: Record<string, number> = {}
    for (const l of allLeadCities || []) {
      if (l.city) {
        cityCounts[l.city] = (cityCounts[l.city] || 0) + 1
      }
    }

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }))

    return NextResponse.json({
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
    })
  } catch (error) {
    logger.error('System KPIs GET error', error)
    return NextResponse.json({
      leads: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
      events: { total: 0, today: 0 },
      assignments: { total: 0, pending: 0, viewed: 0, quoted: 0, declined: 0 },
      providers: { total: 0, active: 0, withLeads: 0 },
      quality: { avgResponseMinutes: 0, conversionRate: 0, declineRate: 0, expiredRate: 0 },
      funnel: [],
      dailyLeads: [],
      topServices: [],
      topCities: [],
    })
  }
}
