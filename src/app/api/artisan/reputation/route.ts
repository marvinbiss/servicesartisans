/**
 * Artisan Reputation API — flywheel visibility on dashboard
 *
 * GET /api/artisan/reputation
 *
 * Retourne pour l'artisan connecté :
 *   - reviews: avg rating, total, published, rating distribution,
 *              pendingResponse (avis publiés sans réponse artisan)
 *   - invitations: sent7d, sent30d, pending30d (envoyées non converties),
 *                  completionRate7d, nextScheduled (invitation planifiée
 *                  la plus proche — signal "ça fonctionne pour moi")
 *
 * Séparé de /api/artisan/stats pour éviter d'alourdir la route principale
 * (déjà 17+ queries parallèles) et pour permettre cache SWR indépendant.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type RatingDistribution = Record<'1' | '2' | '3' | '4' | '5', number>

type ReputationPayload = {
  reviews: {
    total: number
    published: number
    avgRating: number
    distribution: RatingDistribution
    pendingResponse: number
    latestPublishedAt: string | null
  }
  invitations: {
    sent7d: number
    sent30d: number
    pending30d: number
    completed30d: number
    completionRate30d: number | null
    nextScheduledAt: string | null
  }
}

export async function GET() {
  const startedAt = Date.now()
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Resolve provider for this user
    const { data: providerRows } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    const provider = providerRows?.[0]
    if (!provider) {
      return NextResponse.json(
        { error: 'Profil artisan introuvable ou désactivé' },
        { status: 403 }
      )
    }

    const providerId = provider.id as string

    // Admin client for review_invitations (RLS deny-all public, service_role bypass)
    const admin = createAdminClient()

    const since7d = new Date(Date.now() - 7 * 86400000).toISOString()
    const since30d = new Date(Date.now() - 30 * 86400000).toISOString()

    // ─── Parallel queries ─────────────────────────────────────────────────
    const [reviewsData, latestPublished, invitationsData, nextScheduled] = await Promise.all([
      // All reviews for this provider (needed for distribution + avg)
      admin
        .from('reviews')
        .select('rating, status, reply, created_at')
        .eq('provider_id', providerId),

      // Latest published review timestamp (for "dernier avis" badge)
      admin
        .from('reviews')
        .select('created_at')
        .eq('provider_id', providerId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Invitations over the last 30d
      admin
        .from('review_invitations')
        .select('sent_at, completed_at, scheduled_at')
        .eq('provider_id', providerId)
        .gte('scheduled_at', since30d),

      // Next scheduled invitation not yet sent
      admin
        .from('review_invitations')
        .select('scheduled_at')
        .eq('provider_id', providerId)
        .is('sent_at', null)
        .is('completed_at', null)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])

    if (reviewsData.error) {
      logger.error('reputation: reviews query failed', reviewsData.error)
    }
    if (invitationsData.error) {
      logger.error('reputation: invitations query failed', invitationsData.error)
    }

    const reviewRows = reviewsData.data ?? []
    const publishedRows = reviewRows.filter((r) => r.status === 'published')
    const pendingResponseRows = publishedRows.filter(
      (r) => !r.reply || (typeof r.reply === 'string' && r.reply.trim() === '')
    )

    const distribution: RatingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    for (const r of publishedRows) {
      const key = String(r.rating) as keyof RatingDistribution
      if (key in distribution) distribution[key]++
    }

    const avgRating =
      publishedRows.length > 0
        ? publishedRows.reduce((sum, r) => sum + (r.rating ?? 0), 0) / publishedRows.length
        : 0

    const invitationRows = invitationsData.data ?? []
    const sent7d = invitationRows.filter((i) => i.sent_at && i.sent_at >= since7d).length
    const sent30d = invitationRows.filter((i) => !!i.sent_at).length
    const completed30d = invitationRows.filter((i) => !!i.completed_at).length
    const pending30d = invitationRows.filter((i) => !!i.sent_at && !i.completed_at).length

    const completionRate30d = sent30d > 0 ? Math.round((completed30d / sent30d) * 1000) / 10 : null

    const payload: ReputationPayload = {
      reviews: {
        total: reviewRows.length,
        published: publishedRows.length,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution,
        pendingResponse: pendingResponseRows.length,
        latestPublishedAt: latestPublished.data?.created_at ?? null,
      },
      invitations: {
        sent7d,
        sent30d,
        pending30d,
        completed30d,
        completionRate30d,
        nextScheduledAt: nextScheduled.data?.scheduled_at ?? null,
      },
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Server-Timing': `db;dur=${Date.now() - startedAt}`,
      },
    })
  } catch (err) {
    logger.error('reputation GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
