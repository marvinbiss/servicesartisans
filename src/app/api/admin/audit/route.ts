import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET - Liste des logs d'audit
export async function GET(request: NextRequest) {
  try {
    // Verify admin with audit:read permission
    const authResult = await requirePermission('audit', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || 'all'
    const entityType = searchParams.get('entityType') || 'all'
    const adminId = searchParams.get('adminId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin:user_id (
          email,
          full_name
        )
      `, { count: 'exact' })

    // Filtres
    if (action !== 'all') {
      query = query.ilike('action', `%${action}%`)
    }

    if (entityType !== 'all') {
      query = query.eq('resource_type', entityType)
    }

    if (adminId) {
      query = query.eq('user_id', adminId)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      logs: logs || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    logger.error('Admin audit logs error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
