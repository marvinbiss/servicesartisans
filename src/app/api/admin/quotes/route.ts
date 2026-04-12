import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { sanitizeSearchQuery, isValidUuid } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { paginationSchema } from '@/lib/validations/schemas'
import { z } from 'zod'
import { adminListQuotes, adminDeleteQuote } from '@/lib/services/quotes-service'

// GET query params schema
const quotesQuerySchema = paginationSchema.extend({
  status: z
    .enum(['all', 'pending', 'sent', 'accepted', 'refused', 'completed'])
    .optional()
    .default('all'),
  search: z.string().max(100).optional().default(''),
})

export const dynamic = 'force-dynamic'

// GET - Liste des demandes de devis (devis_requests)
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
    const result = quotesQuerySchema.safeParse(queryParams)
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

    const queryResult = await adminListQuotes(
      supabase,
      { status, search, page, limit },
      sanitizeSearchQuery
    )

    if (queryResult.error) {
      logger.warn('Devis requests query failed, returning empty list', {
        message: queryResult.error,
      })
    }

    return NextResponse.json({
      success: true,
      demandes: queryResult.data.demandes,
      assignments: queryResult.data.assignments,
      total: queryResult.data.total,
      page: queryResult.data.page,
      totalPages: queryResult.data.totalPages,
    })
  } catch (error) {
    logger.error('Admin devis requests list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une demande de devis
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requirePermission('services', 'delete')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const id = body?.id

    if (!id || !isValidUuid(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const result = await adminDeleteQuote(supabase, id)

    if (result.error) {
      logger.error('Devis request delete error', { message: result.error })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression' } },
        { status: 500 }
      )
    }

    await logAdminAction(authResult.admin.id, 'devis_request_deleted', 'devis_request', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Devis request delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
