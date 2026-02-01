import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filter === 'verified') {
      query = query.eq('is_verified', true).eq('is_active', true)
    } else if (filter === 'pending') {
      query = query.eq('is_verified', false).eq('is_active', true)
    } else if (filter === 'suspended') {
      query = query.eq('is_active', false)
    }

    // Apply search
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
    }

    const { data: providers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      providers: providers || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin providers list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
