/**
 * Analytics API - ServicesArtisans
 * Stores and retrieves booking funnel analytics
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const analyticsPostSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().min(1).max(100).optional(),
  timestamp: z.string().datetime().optional(),
})

// GET request query params schema
const analyticsGetSchema = z.object({
  artisanId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d']).optional(),
  type: z.enum(['funnel', 'overview', 'trends']).optional(),
})

// Use service role for analytics storage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/analytics - Store analytics event
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = analyticsPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { event, properties, sessionId, timestamp } = result.data

    // Get client info from headers
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Store event in database
    const { error } = await supabase.from('analytics_events').insert({
      event_type: event,
      properties: properties || {},
      session_id: sessionId,
      user_agent: userAgent,
      ip_address: ip,
      created_at: timestamp || new Date().toISOString(),
    })

    if (error) {
      logger.error('Analytics insert error:', error)
      // Don't fail the request - analytics should not break the app
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Analytics error:', error)
    return NextResponse.json({ success: false }, { status: 200 }) // Always return 200
  }
}

// GET /api/analytics - Get analytics summary (admin only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      artisanId: searchParams.get('artisanId'),
      period: searchParams.get('period') || '30d',
      type: searchParams.get('type') || 'funnel',
    }
    const result = analyticsGetSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { artisanId, period, type } = result.data

    // Calculate date range
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    if (type === 'funnel') {
      // Get funnel metrics
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_type, properties')
        .gte('created_at', startDate.toISOString())
        .or(`properties->artisanId.eq.${artisanId},properties->>artisanId.eq.${artisanId}`)

      if (error) throw error

      // Count events by type
      const funnelSteps = [
        'artisan_profile_view',
        'calendar_opened',
        'date_selected',
        'slot_selected',
        'form_started',
        'form_completed',
        'booking_initiated',
        'booking_completed',
      ]

      const counts: Record<string, number> = {}
      funnelSteps.forEach((step) => {
        counts[step] = events?.filter((e) => e.event_type === step).length || 0
      })

      // Calculate conversion rates
      const funnel = funnelSteps.map((step, index) => ({
        step,
        count: counts[step],
        dropOff: index > 0 && counts[funnelSteps[index - 1]] > 0
          ? Math.round(
              ((counts[funnelSteps[index - 1]] - counts[step]) /
                counts[funnelSteps[index - 1]]) *
                100
            )
          : 0,
      }))

      const overallConversion =
        counts['artisan_profile_view'] > 0
          ? Math.round(
              (counts['booking_completed'] / counts['artisan_profile_view']) * 100 * 100
            ) / 100
          : 0

      return NextResponse.json({
        period,
        funnel,
        overallConversion,
        totalViews: counts['artisan_profile_view'],
        totalBookings: counts['booking_completed'],
      })
    }

    if (type === 'overview') {
      // Get bookings data
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, created_at, deposit_amount')
        .eq('artisan_id', artisanId)
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      const total = bookings?.length || 0
      const completed = bookings?.filter((b) => b.status === 'completed').length || 0
      const cancelled = bookings?.filter((b) => b.status === 'cancelled').length || 0
      const revenue = bookings?.reduce((sum, b) => sum + (b.deposit_amount || 0), 0) || 0

      return NextResponse.json({
        period,
        totalBookings: total,
        completedBookings: completed,
        cancelledBookings: cancelled,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
        totalRevenue: revenue / 100, // Convert cents to euros
        avgRevenuePerBooking: total > 0 ? Math.round(revenue / total) / 100 : 0,
      })
    }

    if (type === 'trends') {
      // Get daily booking counts
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('created_at')
        .eq('artisan_id', artisanId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const dailyCounts: Record<string, number> = {}
      bookings?.forEach((booking) => {
        const date = booking.created_at.split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      })

      // Fill in missing dates
      const trends: { date: string; bookings: number }[] = []
      const currentDate = new Date(startDate)
      const today = new Date()

      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0]
        trends.push({
          date: dateStr,
          bookings: dailyCounts[dateStr] || 0,
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return NextResponse.json({
        period,
        trends,
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    logger.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
