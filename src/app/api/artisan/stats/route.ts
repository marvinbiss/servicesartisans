/**
 * Artisan Stats API - ServicesArtisans
 * GET: Fetch dashboard statistics for artisan
 * OPTIMIZED: Uses RPC function to avoid N+1 queries
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['week', 'month', 'year']).default('month'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query params
    const validation = querySchema.safeParse({
      period: searchParams.get('period') || 'month',
    })

    const period = validation.success ? validation.data.period : 'month'

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Try optimized RPC first (single query for all stats)
    const { data: rpcStats, error: rpcError } = await supabase.rpc('get_artisan_dashboard_stats', {
      p_artisan_id: user.id,
      p_period: period,
    })

    // Fallback to multiple queries if RPC not available
    if (rpcError) {
      logger.warn('RPC not available, using fallback queries', { error: rpcError.message })
      return await getLegacyStats(supabase, user, profile)
    }

    // Parallelize independent queries
    const [{ count: unreadMessages }, { data: recentDemandes }] = await Promise.all([
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false),
      supabase
        .from('devis_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    // Transform bookingsByDay to include day names
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const bookingsByDayMap = new Map(
      (rpcStats?.bookingsByDay || []).map((d: { day: number; count: number }) => [d.day, d.count])
    )
    const bookingsByDay = dayNames.map((day, index) => ({
      day,
      count: bookingsByDayMap.get(index) || 0,
    }))

    // Calculate percentage changes with division-by-zero protection
    const periodBookings = rpcStats?.periodBookings || 0
    const lastPeriodBookings = rpcStats?.lastPeriodBookings || 0
    const periodRevenue = rpcStats?.periodRevenue || 0
    const lastPeriodRevenue = rpcStats?.lastPeriodRevenue || 0

    const bookingsChange = lastPeriodBookings > 0
      ? ((periodBookings - lastPeriodBookings) / lastPeriodBookings) * 100
      : periodBookings > 0 ? 100 : 0

    const revenueChange = lastPeriodRevenue > 0
      ? ((periodRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100
      : periodRevenue > 0 ? 100 : 0

    const stats = {
      // Legacy format for backward compatibility
      profileViews: {
        value: 0,
        change: '+0%',
      },
      demandesRecues: {
        value: rpcStats?.totalBookings || 0,
        change: `${bookingsChange >= 0 ? '+' : ''}${Math.round(bookingsChange)}%`,
      },
      devisEnvoyes: {
        value: rpcStats?.totalBookings || 0,
        change: `${bookingsChange >= 0 ? '+' : ''}${Math.round(bookingsChange)}%`,
      },
      clientsSatisfaits: {
        value: periodBookings,
        change: `${bookingsChange >= 0 ? '+' : ''}${Math.round(bookingsChange)}%`,
      },
      averageRating: rpcStats?.averageRating || 0,
      totalReviews: rpcStats?.totalReviews || 0,
      unreadMessages: unreadMessages || 0,

      // New enhanced stats
      totalBookings: rpcStats?.totalBookings || 0,
      totalBookingsChange: Math.round(bookingsChange),
      monthlyRevenue: periodRevenue,
      monthlyRevenueChange: Math.round(revenueChange),
      upcomingBookings: rpcStats?.upcomingBookings || 0,
      fillRate: rpcStats?.fillRate || 0,
      cancelRate: rpcStats?.cancelRate || 0,
      bookingsByDay,
      bookingsByMonth: rpcStats?.bookingsByMonth || [],
      topServices: rpcStats?.topServices || [],
    }

    return NextResponse.json({
      stats,
      profile,
      recentDemandes: recentDemandes || [],
    })
  } catch (error) {
    logger.error('Stats GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Fallback to legacy queries when RPC is not available
 */
async function getLegacyStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string },
  profile: Record<string, unknown>
) {
  // Parallelize all independent queries
  const [{ data: devis }, { data: reviews }, { count: unreadMessages }, { data: recentDemandes }] = await Promise.all([
    supabase
      .from('devis')
      .select('*, request:devis_requests(*)')
      .eq('artisan_id', user.id),
    supabase
      .from('reviews')
      .select('*')
      .eq('artisan_id', user.id),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false),
    supabase
      .from('devis_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate stats with division-by-zero protection
  const totalDevis = devis?.length || 0
  const acceptedDevis = devis?.filter(d => d.status === 'accepted').length || 0
  const reviewCount = reviews?.length || 0
  const averageRating = reviewCount > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  const stats = {
    profileViews: {
      value: 0,
      change: '+0%',
    },
    demandesRecues: {
      value: totalDevis,
      change: '+0%',
    },
    devisEnvoyes: {
      value: totalDevis,
      change: '+0%',
    },
    clientsSatisfaits: {
      value: acceptedDevis,
      change: '+0%',
    },
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviewCount,
    unreadMessages: unreadMessages || 0,

    // Empty enhanced stats for backward compatibility
    totalBookings: 0,
    totalBookingsChange: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
    upcomingBookings: 0,
    fillRate: 0,
    cancelRate: 0,
    bookingsByDay: [
      { day: 'Dim', count: 0 },
      { day: 'Lun', count: 0 },
      { day: 'Mar', count: 0 },
      { day: 'Mer', count: 0 },
      { day: 'Jeu', count: 0 },
      { day: 'Ven', count: 0 },
      { day: 'Sam', count: 0 },
    ],
    bookingsByMonth: [],
    topServices: [],
  }

  return NextResponse.json({
    stats,
    profile,
    recentDemandes: recentDemandes || [],
  })
}
