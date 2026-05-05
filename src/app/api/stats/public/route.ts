/**
 * API pour les statistiques publiques du site
 * Retourne les compteurs d'artisans, avis Google, note moyenne, etc.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { villes } from '@/lib/data/france'
import { logger } from '@/lib/logger'

export const revalidate = 60 // Cache for 1 minute (ISR)

export async function GET() {
  try {
    const supabase = createAdminClient()

    // 2026-05-05 pivot full RGE — `artisanCount` doit refléter UNIQUEMENT les
    // artisans RGE certifiés actifs, aligné avec `getSiteStats()` (homepage)
    // et le repositionnement "100% RGE certifiés". Avant le pivot, l'endpoint
    // public renvoyait ~750K (tous providers actifs) ce qui contredisait le
    // count homepage RGE-only ⇒ incohérence visible côté schema.org/SocialProof.
    const todayIso = new Date().toISOString().slice(0, 10)
    const [{ count: artisanCount }, { data: realReviews }] = await Promise.all([
      // Count active RGE artisans
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', todayIso),

      // Get ALL reviews (only exclude synthetic/fake ones)
      supabase
        .from('reviews')
        .select('rating, source')
        // Only exclude reviews explicitly marked as synthetic
        // Include reviews with NULL or empty source (they are real)
        .or('source.is.null,source.eq.,source.neq.synthetic'),
    ])

    // Calculate total REAL reviews and average rating
    let totalReviews = 0
    let totalRating = 0

    if (realReviews && realReviews.length > 0) {
      totalReviews = realReviews.length
      totalRating = realReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
    }

    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0 // Return 0 if no real reviews, NOT a fake fallback value

    return NextResponse.json(
      {
        artisanCount: artisanCount || 0,
        reviewCount: totalReviews,
        averageRating: averageRating,
        cityCount: villes.length,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    logger.error('Error fetching public stats:', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
