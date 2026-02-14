/**
 * Admin Stats API - ServicesArtisans
 * Platform-wide statistics and analytics
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { requirePermission } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify admin with settings:read permission (dashboard stats)
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    // Fallback values used when tables/columns don't exist
    const mockStats = {
      totalUsers: 0,
      totalArtisans: 0,
      totalBookings: 0,
      totalRevenue: 0,
      newUsersToday: 0,
      newBookingsToday: 0,
      activeUsers7d: 0,
      pendingReports: 0,
      averageRating: 0,
    }

    // Fetch all counts in parallel, gracefully handling individual failures
    const [usersResult, artisansResult, bookingsResult] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
    ])

    const usersCount = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0
    const artisansCount = artisansResult.status === 'fulfilled' ? (artisansResult.value.count || 0) : 0
    const bookingsCount = bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0

    // Mock recent activity for demo
    const recentActivity = [
      { id: '1', type: 'booking', action: 'Nouvelle réservation', details: 'Jean D. a réservé chez Plomberie Pro', timestamp: 'Il y a 5 min', status: 'confirmed' },
      { id: '2', type: 'review', action: 'Nouvel avis', details: 'Marie L. a laissé 5 étoiles', timestamp: 'Il y a 12 min' },
      { id: '3', type: 'user', action: 'Nouvel artisan', details: 'Électricité Express a rejoint la plateforme', timestamp: 'Il y a 23 min' },
      { id: '4', type: 'report', action: 'Nouveau signalement', details: 'Avis signalé pour contenu inapproprié', timestamp: 'Il y a 45 min', status: 'pending' },
    ]

    // Mock pending reports for demo
    const pendingReportsList = [
      { id: '1', targetType: 'review', reason: 'spam', description: 'Avis promotionnel non sollicité', status: 'pending', createdAt: '2024-01-15', reporter: 'user123' },
      { id: '2', targetType: 'user', reason: 'fake', description: 'Profil suspect avec faux avis', status: 'pending', createdAt: '2024-01-14', reporter: 'user456' },
    ]

    return NextResponse.json({
      stats: {
        totalUsers: usersCount || mockStats.totalUsers,
        totalArtisans: artisansCount || mockStats.totalArtisans,
        totalBookings: bookingsCount || mockStats.totalBookings,
        totalRevenue: mockStats.totalRevenue,
        newUsersToday: mockStats.newUsersToday,
        newBookingsToday: mockStats.newBookingsToday,
        activeUsers7d: mockStats.activeUsers7d,
        pendingReports: mockStats.pendingReports,
        averageRating: mockStats.averageRating,
      },
      recentActivity,
      pendingReports: pendingReportsList,
    })
  } catch (error) {
    logger.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
