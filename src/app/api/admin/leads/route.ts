/**
 * Admin Leads API
 * GET: Lead counts + active artisans for a city x metier
 * Uses service_role (bypasses RLS)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { getAdminLeadCounts, getActiveArtisans } from '@/lib/services/leads-service'

const leadsQuerySchema = z.object({
  city: z.string().max(200).nullable().default(null),
  service: z.string().max(200).nullable().default(null),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify admin with services:read permission
    const auth = await requirePermission('services', 'read')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!auth.success || !auth.admin) return auth.error!

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const parsed = leadsQuerySchema.safeParse({
      city: searchParams.get('city') || null,
      service: searchParams.get('service') || null,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    // Sanitize search inputs to prevent ILIKE injection
    const city = parsed.data.city ? sanitizeSearchQuery(parsed.data.city) : null
    const service = parsed.data.service ? sanitizeSearchQuery(parsed.data.service) : null

    const filters = { city, service }

    const [{ leadsCreated, leadsAssigned }, artisans] = await Promise.all([
      getAdminLeadCounts(supabase, filters),
      getActiveArtisans(supabase, filters),
    ])

    return NextResponse.json({
      leadsCreated,
      leadsAssigned,
      artisans,
      artisanCount: artisans.length,
      filters: { city, service },
    })
  } catch (error) {
    logger.error('Admin leads GET error', error)
    return NextResponse.json({
      leadsCreated: 0,
      leadsAssigned: 0,
      artisans: [],
      artisanCount: 0,
      filters: { city: null, service: null },
    })
  }
}
