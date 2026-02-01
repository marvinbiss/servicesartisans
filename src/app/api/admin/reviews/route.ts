import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin with reviews:read permission
    const authResult = await requirePermission('reviews', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'pending'

    const offset = (page - 1) * limit

    let query = supabase
      .from('reviews')
      .select(`
        *,
        provider:providers(id, company_name)
      `, { count: 'exact' })

    // Apply filters
    if (filter === 'pending') {
      query = query.eq('moderation_status', 'pending')
    } else if (filter === 'flagged') {
      query = query.eq('is_flagged', true)
    } else if (filter === 'approved') {
      query = query.eq('moderation_status', 'approved')
    } else if (filter === 'rejected') {
      query = query.eq('moderation_status', 'rejected')
    }

    const { data: reviews, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Transform data
    const transformedReviews = (reviews || []).map((review) => ({
      id: review.id,
      author_name: review.author_name || 'Anonyme',
      author_email: review.author_email || '',
      provider_name: review.provider?.company_name || 'Inconnu',
      provider_id: review.provider_id,
      rating: review.rating,
      comment: review.comment,
      response: review.response,
      moderation_status: review.moderation_status || 'pending',
      is_visible: review.is_visible,
      is_flagged: review.is_flagged || false,
      created_at: review.created_at,
    }))

    return NextResponse.json({
      success: true,
      reviews: transformedReviews,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    logger.error('Admin reviews list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
