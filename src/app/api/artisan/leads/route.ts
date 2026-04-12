/**
 * Artisan Assigned Leads API
 * GET: Fetch leads assigned to the authenticated artisan via lead_assignments
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import { getProviderForUser, getLeadsForArtisan } from '@/lib/services/leads-service'

const leadsQuerySchema = z.object({
  page: pageSchema,
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().max(50).default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const provider = await getProviderForUser(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun profil artisan trouvé' } },
        { status: 403 }
      )
    }

    // Parse and validate pagination & filter params
    const { searchParams } = request.nextUrl
    const parsed = leadsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const { page, pageSize, status } = parsed.data

    const { assignments, totalItems, totalPages } = await getLeadsForArtisan(
      supabase,
      provider.id,
      { page, pageSize, status }
    )

    return NextResponse.json(
      {
        leads: assignments,
        count: totalItems,
        provider_city: provider.address_city || null,
        pagination: {
          page,
          pageSize,
          totalPages,
          totalItems,
        },
      },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Artisan leads GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
