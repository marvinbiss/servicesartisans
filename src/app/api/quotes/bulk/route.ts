import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import {
  bulkStatusUpdateSchema,
  bulkDeleteSchema,
  bulkUpdateQuotes,
  bulkDeleteQuotes,
} from '@/lib/services/quotes-service'

export const dynamic = 'force-dynamic'

// PATCH /api/quotes/bulk - Bulk update quote status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = bulkStatusUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const result = await bulkUpdateQuotes(supabase, user.id, parsed.data)

    if (result.error === 'PROVIDER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    if (result.error === 'QUOTES_NOT_OWNED') {
      return NextResponse.json(
        { success: false, error: { message: 'Certaines demandes ne vous appartiennent pas' } },
        { status: 403 }
      )
    }

    if (result.error) throw new Error(result.error)

    return NextResponse.json({
      success: true,
      updated: result.updated,
    })
  } catch (error) {
    logger.error('Bulk update quotes error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/bulk - Bulk delete quotes
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = bulkDeleteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const result = await bulkDeleteQuotes(supabase, user.id, parsed.data.quote_ids)

    if (result.error === 'PROVIDER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    if (result.error) throw new Error(result.error)

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
    })
  } catch (error) {
    logger.error('Bulk delete quotes error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
