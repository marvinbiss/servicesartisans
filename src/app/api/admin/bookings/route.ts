import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Liste des réservations
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
      .from('bookings')
      .select(`
        *,
        profiles:artisan_id (
          id,
          full_name,
          email,
          company_name
        )
      `, { count: 'exact' })

    // Filtre par statut
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Recherche
    if (search) {
      query = query.or(`client_email.ilike.%${search}%,service.ilike.%${search}%`)
    }

    const { data: bookings, count, error } = await query
      .order('booking_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin bookings list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
