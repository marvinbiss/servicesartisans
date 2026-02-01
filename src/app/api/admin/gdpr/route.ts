import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET - Liste des demandes RGPD
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'

    const offset = (page - 1) * limit

    // Essayer de récupérer depuis data_export_requests ou gdpr_requests
    let query = supabase
      .from('data_export_requests')
      .select('*', { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: requests, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      // Si la table n'existe pas, retourner une liste vide
      logger.error('GDPR requests error', error)
      return NextResponse.json({
        success: true,
        requests: [],
        total: 0,
        page: 1,
        totalPages: 1,
      })
    }

    return NextResponse.json({
      success: true,
      requests: requests || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    logger.error('Admin GDPR requests error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
