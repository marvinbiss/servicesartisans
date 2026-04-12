import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import {
  adminUpdateQuoteSchema,
  adminGetQuote,
  adminUpdateQuote,
  adminDeleteQuoteById,
} from '@/lib/services/quotes-service'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin with services:read permission
    const authResult = await requirePermission('services', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const result = await adminGetQuote(supabase, params.id)

    if (result.error) {
      logger.error('Quote fetch error', { message: result.error })
      return NextResponse.json(
        { success: false, error: { message: 'Devis non trouvé' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ quote: result.data })
  } catch (error) {
    logger.error('Quote fetch error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin with services:write permission
    const authResult = await requirePermission('services', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const validation = adminUpdateQuoteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: validation.error.flatten() },
        },
        { status: 400 }
      )
    }

    const result = await adminUpdateQuote(supabase, params.id, validation.data)

    if (result.error) {
      logger.error('Quote operation error', { message: result.error })
      return NextResponse.json(
        { success: false, error: { message: "Erreur lors de l'opération" } },
        { status: 500 }
      )
    }

    // Log audit
    await logAdminAction(
      authResult.admin.id,
      'quote_updated',
      'booking',
      params.id,
      validation.data
    )

    return NextResponse.json({ quote: result.data })
  } catch (error) {
    logger.error('Quote update error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin with services:delete permission
    const authResult = await requirePermission('services', 'delete')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const result = await adminDeleteQuoteById(supabase, params.id)

    if (result.error) {
      logger.error('Quote operation error', { message: result.error })
      return NextResponse.json(
        { success: false, error: { message: "Erreur lors de l'opération" } },
        { status: 500 }
      )
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'quote_deleted', 'booking', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Quote delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
