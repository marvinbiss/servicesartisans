import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRevenueStats, listAllSubscriptions } from '@/lib/stripe-admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const paymentsQuerySchema = z.object({
  type: z.enum(['overview', 'subscriptions']).optional().default('overview'),
  status: z.enum(['all', 'active', 'canceled', 'past_due']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().max(100).optional(),
})

export const dynamic = 'force-dynamic'

// GET - Statistiques et liste des paiements
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
      type: searchParams.get('type') || 'overview',
      status: searchParams.get('status') || 'all',
      limit: searchParams.get('limit') || '20',
      cursor: searchParams.get('cursor') || undefined,
    }
    const result = paymentsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { type, status, limit, cursor } = result.data

    if (type === 'overview') {
      // Statistiques générales
      const stats = await getRevenueStats(30)

      // Compter les abonnements par statut
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')
        .neq('subscription_plan', 'gratuit')

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          activeSubscriptions: activeCount || 0,
          totalUsers: totalUsers || 0,
        },
      })
    }

    if (type === 'subscriptions') {
      // Liste des abonnements Stripe
      const subscriptions = await listAllSubscriptions(
        limit,
        cursor,
        status as 'active' | 'canceled' | 'past_due' | 'all'
      )

      // Enrichir avec les données utilisateur
      const enrichedData = await Promise.all(
        subscriptions.data.map(async (sub) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('stripe_customer_id', sub.customerId)
            .single()

          return {
            ...sub,
            userId: profile?.id,
            userName: profile?.full_name,
            userEmail: profile?.email || sub.customerEmail,
          }
        })
      )

      return NextResponse.json({
        success: true,
        subscriptions: enrichedData,
        hasMore: subscriptions.hasMore,
      })
    }

    return NextResponse.json({
      success: false,
      error: { message: 'Type invalide' },
    }, { status: 400 })
  } catch (error) {
    logger.error('Admin payments error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
