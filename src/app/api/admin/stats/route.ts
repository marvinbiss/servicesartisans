/**
 * Admin Stats API - ServicesArtisans
 * Platform-wide statistics and analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/middleware'
import { createErrorResponse, ErrorCode, getHttpStatus } from '@/lib/errors/types'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Verify Supabase config
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Configuration serveur manquante'),
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch counts in parallel
    const [
      usersResult,
      artisansResult,
      bookingsResult,
      revenueResult,
      newUsersTodayResult,
      newBookingsTodayResult,
      activeUsers7dResult,
      pendingReportsResult,
      averageRatingResult,
    ] = await Promise.all([
      // Total users
      supabase.from('profiles').select('id', { count: 'exact', head: true }),

      // Total artisans
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_artisan', true),

      // Total bookings
      supabase.from('bookings').select('id', { count: 'exact', head: true }),

      // Total revenue (sum of deposits)
      supabase.from('bookings').select('deposit_amount'),

      // New users today
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),

      // New bookings today
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),

      // Active users (7 days) - users with bookings or messages
      supabase
        .from('bookings')
        .select('client_email')
        .gte('created_at', sevenDaysAgo.toISOString()),

      // Pending reports
      supabase
        .from('user_reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Average rating
      supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'published'),
    ])

    // Calculate revenue
    const totalRevenue =
      revenueResult.data?.reduce((sum, b) => sum + (b.deposit_amount || 0), 0) || 0

    // Calculate unique active users
    const activeEmails = new Set(activeUsers7dResult.data?.map((b) => b.client_email))
    const activeUsers7d = activeEmails.size

    // Calculate average rating
    const ratings = averageRatingResult.data || []
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

    // Fetch recent activity
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('id, client_name, service_description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentActivity = (recentBookings || []).map((b) => ({
      id: b.id,
      type: 'booking' as const,
      action: 'Nouvelle réservation',
      details: `${b.client_name} - ${b.service_description || 'Service'}`,
      timestamp: formatTimeAgo(new Date(b.created_at)),
      status: b.status,
    }))

    // Fetch pending reports
    const { data: reports } = await supabase
      .from('user_reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    const pendingReportsList = (reports || []).map((r) => ({
      id: r.id,
      targetType: r.target_type,
      reason: r.reason,
      description: r.description || '',
      status: r.status,
      createdAt: new Date(r.created_at).toISOString().split('T')[0],
      reporter: r.reporter_id?.slice(0, 8) || 'anonymous',
    }))

    return NextResponse.json({
      stats: {
        totalUsers: usersResult.count || 0,
        totalArtisans: artisansResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue,
        newUsersToday: newUsersTodayResult.count || 0,
        newBookingsToday: newBookingsTodayResult.count || 0,
        activeUsers7d,
        pendingReports: pendingReportsResult.count || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      recentActivity,
      pendingReports: pendingReportsList,
    })
  } catch (error) {
    logger.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'À l\'instant'
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  return `Il y a ${Math.floor(seconds / 86400)}j`
}
