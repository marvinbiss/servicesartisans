import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Liste des devis
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('devis_requests')
      .select('*', { count: 'exact' })

    // Filtre par statut
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Recherche
    if (search) {
      query = query.or(`service_name.ilike.%${search}%,postal_code.ilike.%${search}%`)
    }

    const { data: quotes, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      quotes: quotes || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin quotes list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
