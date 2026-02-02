/**
 * Artisan Stats API
 * GET: Fetch dashboard statistics for artisan
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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

    // Get devis sent by this artisan
    const { data: devis } = await supabase
      .from('devis')
      .select('*, request:devis_requests(*)')
      .eq('artisan_id', user.id)

    // Get reviews for this artisan
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('artisan_id', user.id)

    // Get unread messages count
    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    // Calculate stats
    const totalDevis = devis?.length || 0
    const acceptedDevis = devis?.filter(d => d.status === 'accepted').length || 0
    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Profile views would need a separate tracking table
    // For now, return a placeholder
    const profileViews = 0

    const stats = {
      profileViews: {
        value: profileViews,
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
      totalReviews: reviews?.length || 0,
      unreadMessages: unreadMessages || 0,
    }

    // Get recent demandes
    const { data: recentDemandes } = await supabase
      .from('devis_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

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
