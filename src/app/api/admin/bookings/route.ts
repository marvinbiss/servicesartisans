import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const bookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional().default('all'),
  search: z.string().max(100).optional().default(''),
})

export const dynamic = 'force-dynamic'

// GET - Liste des réservations
export async function GET(request: NextRequest) {
  try {
    // Verify admin with services:read permission
    const authResult = await requirePermission('services', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'all',
      search: searchParams.get('search') || '',
    }
    const result = bookingsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { page, limit, status, search } = result.data

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

    // Recherche (sanitized to prevent injection)
    if (search) {
      const sanitized = sanitizeSearchQuery(search)
      if (sanitized) {
        query = query.or(`client_email.ilike.%${sanitized}%,service.ilike.%${sanitized}%`)
      }
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
    logger.error('Admin bookings list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
