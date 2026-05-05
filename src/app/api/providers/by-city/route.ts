/**
 * API pour récupérer les artisans par ville
 * Utilisé pour afficher les markers sur la carte
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getCityValues } from '@/lib/insee-resolver'

const byCityQuerySchema = z.object({
  city: z.string().min(1, 'City parameter is required').max(200),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  rge: z.enum(['0', '1']).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryValidation = byCityQuerySchema.safeParse({
      city: searchParams.get('city') || undefined,
      limit: searchParams.get('limit') || undefined,
      rge: searchParams.get('rge') || undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: queryValidation.error.issues[0]?.message || 'Paramètres invalides' },
        { status: 400 }
      )
    }

    const { city, limit, rge } = queryValidation.data
    // 2026-05-05 pivot full RGE — markers carte = artisans RGE certifiés only.
    // Bypass admin/debug via `?rge=0`.
    const rgeOnly = rge === '0' ? false : true

    const supabase = createAdminClient()

    let query = supabase
      .from('providers')
      .select(
        'id, name, slug, latitude, longitude, rating_average, review_count, specialty, address_city'
      )
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      // Use .in() with INSEE codes instead of ILIKE to avoid full table scan on 750K rows
      .in('address_city', getCityValues(city))
    if (rgeOnly) {
      const todayIso = new Date().toISOString().slice(0, 10)
      query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
    }
    const { data: providers, error } = await query
      .order('rating_average', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Error fetching providers by city:', error)
      return NextResponse.json({ error: 'Échec de la récupération des artisans' }, { status: 500 })
    }

    return NextResponse.json(
      {
        providers: providers || [],
        count: providers?.length || 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    logger.error('Error in providers by city API:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
