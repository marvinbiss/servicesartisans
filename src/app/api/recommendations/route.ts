/**
 * GET /api/recommendations — Public endpoint for artisan recommendations
 * Returns up to 5 providers matching a service + city, sorted by verified + rating.
 *
 * Query params:
 *   - service: service slug (e.g., "plombier")
 *   - city: city name (e.g., "Lille")
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  service: z.string().min(1).max(100),
  city: z.string().min(1).max(200),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const parsed = querySchema.safeParse({
      service: searchParams.get('service'),
      city: searchParams.get('city'),
    })

    if (!parsed.success) {
      return NextResponse.json({ providers: [] })
    }

    const { service, city } = parsed.data
    const supabase = createAdminClient()
    const fields =
      'id, name, slug, stable_id, specialty, address_city, rating_average, review_count, is_verified'

    // Try same city first
    const { data: cityData } = await supabase
      .from('providers')
      .select(fields)
      .eq('is_active', true)
      .ilike('specialty', `%${service}%`)
      .ilike('address_city', city)
      .order('is_verified', { ascending: false })
      .order('rating_average', { ascending: false, nullsFirst: false })
      .limit(5)

    if (cityData && cityData.length >= 3) {
      return NextResponse.json(
        { providers: cityData },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
      )
    }

    // Fallback: fill remaining with broader results
    const existingIds = (cityData || []).map((p) => p.id)
    const remaining = 5 - (cityData?.length || 0)

    const { data: broadData } = await supabase
      .from('providers')
      .select(fields)
      .eq('is_active', true)
      .ilike('specialty', `%${service}%`)
      .order('is_verified', { ascending: false })
      .order('rating_average', { ascending: false, nullsFirst: false })
      .limit(remaining + existingIds.length)

    const combined = [...(cityData || [])]
    for (const p of broadData || []) {
      if (!existingIds.includes(p.id) && combined.length < 5) {
        combined.push(p)
      }
    }

    return NextResponse.json(
      { providers: combined },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (error) {
    logger.error('[api/recommendations] GET failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
