/**
 * GET /api/admin/journal — Immutable admin action journal
 * Reads from audit_logs (immutable, append-only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const supabase = createAdminClient()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 50
    const offset = (page - 1) * limit
    const actionFilter = url.searchParams.get('action') || null
    const userFilter = url.searchParams.get('user_id') || null

    let query = supabase
      .from('audit_logs')
      .select('id, action, user_id, resource_type, resource_id, new_value, metadata, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (actionFilter) {
      query = query.eq('action', actionFilter)
    }
    if (userFilter) {
      query = query.eq('user_id', userFilter)
    }

    const { data: logs, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { count: totalCount } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      logs: logs || [],
      total: totalCount || 0,
      page,
      pageSize: limit,
    })
  } catch (error) {
    console.error('Journal GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
