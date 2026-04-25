/**
 * GET /api/artisan/leads/stats — Lead-specific stats for artisan dashboard
 * Returns lead KPIs: counts, conversion, response time, monthly trend.
 *
 * OPTIMIZED 2026-04-01: Replaced JS-side aggregation (1000 rows fetch + 5+ iterations)
 * with SQL COUNT queries via { count: 'exact', head: true }. lead_events no longer
 * loaded entirely — individual count queries instead. Prevents OOM/timeout at 10K+ leads.
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { getProviderForUser, getLeadStats } from '@/lib/services/leads-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const provider = await getProviderForUser(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun profil artisan' } },
        { status: 403 }
      )
    }

    const adminClient = createAdminClient()
    const { stats, monthlyTrend } = await getLeadStats(adminClient, provider.id)

    return NextResponse.json({ stats, monthlyTrend })
  } catch (error) {
    logger.error('Artisan leads stats GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
