import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/seo/cannibalization
 *
 * Returns detected keyword cannibalization pairs.
 * Each pair represents two pages competing for the same query,
 * with fluctuating positions indicating Google cannot decide which to rank.
 *
 * Query params:
 *   - status: filter by status ('detected' | 'investigating' | 'resolved' | 'ignored')
 *   - limit: max results (default 100)
 */
export async function GET(request: Request) {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'detected'
  const limit = Math.min(Number(searchParams.get('limit') || '100'), 500)

  const supabase = createAdminClient()

  let query = supabase
    .from('seo_cannibalization_pairs')
    .select(
      'id, query, page_a, page_b, avg_position_a, avg_position_b, total_impressions, status, resolution, detected_at, resolved_at'
    )
    .order('total_impressions', { ascending: false })
    .limit(limit)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    // Table might not exist yet
    if (error.message?.includes('relation') || error.code === '42P01') {
      return NextResponse.json({
        data: [],
        count: 0,
        message:
          'Table seo_cannibalization_pairs non disponible. Lancez le script cannibalization-detector.ts.',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la requete seo_cannibalization_pairs', details: error.message },
      { status: 500 }
    )
  }

  // Group by query for summary stats
  const queryGroups = new Map<string, number>()
  for (const row of data || []) {
    queryGroups.set(row.query, (queryGroups.get(row.query) || 0) + 1)
  }

  return NextResponse.json({
    data: data || [],
    count: data?.length || 0,
    unique_queries: queryGroups.size,
    summary: {
      total_pairs: data?.length || 0,
      total_impressions_at_risk: (data || []).reduce(
        (sum, r) => sum + (r.total_impressions || 0),
        0
      ),
    },
    timestamp: new Date().toISOString(),
  })
}
