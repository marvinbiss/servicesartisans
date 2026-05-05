import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats/demand — Real demand stats from Supabase.
 * Params: ?service=plomberie&city=lyon
 * Cache: 5 min
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const service = searchParams.get('service')?.trim() || null
    const city = searchParams.get('city')?.trim() || null

    const supabase = createAdminClient()
    const now = new Date()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Build queries
    let weekQuery = supabase
      .from('devis_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString())

    let monthQuery = supabase
      .from('devis_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // 2026-05-05 pivot full RGE — endpoint public consommé par SocialProofBanner.
    // active_providers doit refléter UNIQUEMENT les artisans RGE certifiés actifs
    // pour rester cohérent avec le repositionnement "100% RGE certifiés".
    const todayIso = now.toISOString().slice(0, 10)
    let providerQuery = supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', todayIso)

    if (service) {
      weekQuery = weekQuery.ilike('service_name', `%${service}%`)
      monthQuery = monthQuery.ilike('service_name', `%${service}%`)
    }

    if (city) {
      weekQuery = weekQuery.ilike('city', `%${city}%`)
      monthQuery = monthQuery.ilike('city', `%${city}%`)
      providerQuery = providerQuery.ilike('address_city', `%${city}%`)
    }

    const [weekResult, monthResult, providerResult] = await Promise.all([
      weekQuery,
      monthQuery,
      providerQuery,
    ])

    return NextResponse.json(
      {
        requests_this_week: weekResult.count ?? 0,
        requests_this_month: monthResult.count ?? 0,
        active_providers: providerResult.count ?? 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    logger.error('[stats/demand] Error', err)
    return NextResponse.json(
      { requests_this_week: 0, requests_this_month: 0, active_providers: 0 },
      { status: 200 }
    )
  }
}
