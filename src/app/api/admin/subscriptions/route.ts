import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const subscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  filter: z.enum(['all', 'active', 'past_due', 'canceled']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin with payments:read permission
    const authResult = await requirePermission('payments', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      filter: searchParams.get('filter') || 'all',
    }
    const result = subscriptionsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid parameters', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { page, limit, filter } = result.data

    const offset = (page - 1) * limit

    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        provider:providers(id, company_name)
      `, { count: 'exact' })

    // Apply filters
    if (filter === 'active') {
      query = query.eq('status', 'active')
    } else if (filter === 'past_due') {
      query = query.eq('status', 'past_due')
    } else if (filter === 'canceled') {
      query = query.eq('status', 'canceled')
    }

    const { data: subscriptions, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get subscription stats
    const { data: allSubs } = await supabase
      .from('subscriptions')
      .select('plan, status, amount')
      .eq('status', 'active')

    const stats = {
      totalRevenue: (allSubs || []).reduce((acc, s) => acc + (s.amount || 0), 0),
      activeSubscriptions: (allSubs || []).length,
      premiumCount: (allSubs || []).filter((s) => s.plan === 'premium').length,
      basicCount: (allSubs || []).filter((s) => s.plan === 'basic').length,
      freeCount: 0,
      churnRate: 0,
    }

    // Transform data
    const transformedSubs = (subscriptions || []).map((sub) => ({
      id: sub.id,
      provider_id: sub.provider_id,
      provider_name: sub.provider?.company_name || 'Inconnu',
      plan: sub.plan || 'free',
      status: sub.status || 'active',
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      amount: sub.amount || 0,
      payment_method: sub.payment_method,
      created_at: sub.created_at,
    }))

    return NextResponse.json({
      success: true,
      subscriptions: transformedSubs,
      stats,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    logger.error('Admin subscriptions list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
