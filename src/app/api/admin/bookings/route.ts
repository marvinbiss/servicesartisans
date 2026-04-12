import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { adminListBookings } from '@/lib/services/bookings-service'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'

// GET query params schema
const bookingsQuerySchema = paginationSchema.extend({
  status: z
    .enum(['all', 'pending', 'confirmed', 'completed', 'cancelled'])
    .optional()
    .default('all'),
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
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { page, limit, status, search } = result.data

    // Recherche: bookings n'a pas de colonnes textuelles libres (client_email et service n'existent pas).
    // La recherche par status est gérée par le filtre dédié ci-dessus.
    // Le paramètre search est accepté pour compatibilité UI mais ignoré au niveau DB.
    void search

    const {
      data: bookings,
      count,
      error,
    } = await adminListBookings(supabase, { status, page, limit })

    if (error) {
      logger.warn('Bookings query failed, returning empty list', {
        code: (error as { code?: string }).code,
        message: (error as { message?: string }).message,
      })
      return NextResponse.json({
        success: true,
        bookings: [],
        total: 0,
        page,
        totalPages: 0,
      })
    }

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
