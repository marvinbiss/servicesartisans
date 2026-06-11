/**
 * Factures de l'artisan (table provider_invoices, mig 547/548).
 * GET /api/artisan/invoices — liste paginée.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import { listProviderInvoices } from '@/lib/services/provider-invoices-service'

export const dynamic = 'force-dynamic'

const NO_STORE = { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }

const listQuerySchema = z.object({
  page: pageSchema,
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { data: provider } = await getProviderIdByUserId(supabase, user.id)
    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const { searchParams } = request.nextUrl
    const parsed = listQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides' } },
        { status: 400 }
      )
    }

    const { data, error } = await listProviderInvoices(supabase, provider.id, parsed.data)
    if (error) {
      logger.error('Artisan invoices GET error:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur serveur' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, ...data }, NO_STORE)
  } catch (error) {
    logger.error('Artisan invoices GET exception:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
