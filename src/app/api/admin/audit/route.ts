import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Liste des logs d'audit
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

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
        admin:admin_id (
          email,
          full_name
        )
      `, { count: 'exact' })

    // Filtres
    if (action !== 'all') {
      query = query.ilike('action', `%${action}%`)
    }

    if (entityType !== 'all') {
      query = query.eq('entity_type', entityType)
    }

    if (adminId) {
      query = query.eq('admin_id', adminId)
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
    console.error('Admin audit logs error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
