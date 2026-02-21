/**
 * Artisan Assigned Leads API
 * GET: Fetch leads assigned to the authenticated artisan via lead_assignments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get provider linked to this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé' },
        { status: 403 }
      )
    }

    // Parse pagination & filter params
    const { searchParams } = request.nextUrl
    const rawPage = parseInt(searchParams.get('page') || '1', 10)
    const rawPageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const status = searchParams.get('status') || 'all'

    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage)
    const pageSize = Math.min(50, Math.max(1, isNaN(rawPageSize) ? 20 : rawPageSize))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Count query (head: true returns only count, no rows)
    let countQuery = supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', provider.id)

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting leads:', countError)
      return NextResponse.json(
        { error: 'Erreur lors du comptage des leads' },
        { status: 500 }
      )
    }

    const totalItems = count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    // Data query with pagination
    let dataQuery = supabase
      .from('lead_assignments')
      .select(`
        id,
        status,
        assigned_at,
        viewed_at,
        lead:devis_requests (
          id,
          service_name,
          city,
          postal_code,
          description,
          urgency,
          client_name,
          client_phone,
          created_at,
          status
        )
      `)
      .eq('provider_id', provider.id)
      .order('assigned_at', { ascending: false })
      .range(from, to)

    if (status !== 'all') {
      dataQuery = dataQuery.eq('status', status)
    }

    const { data: assignments, error: assignError } = await dataQuery

    if (assignError) {
      console.error('Error fetching assigned leads:', assignError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leads: assignments || [],
      count: totalItems,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
      },
    })
  } catch (error) {
    console.error('Artisan leads GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
