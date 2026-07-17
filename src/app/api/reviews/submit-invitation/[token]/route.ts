import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { hashInvitationToken } from '@/lib/reviews/invitation-token'
import {
  detectFraudIndicators,
  updateArtisanRating,
  revalidateReviewPaths,
} from '@/lib/services/review-service'

const submitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  wouldRecommend: z.boolean().nullable(),
  comment: z.string().trim().max(1200).nullable(),
  authorName: z.string().trim().min(2).max(60),
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params
  const token = params.token?.trim()
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
  }

  // Rate limit: 5 attempts per minute per IP per token
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`review-invite:${ip}:${token.slice(0, 16)}`, {
    window: 60_000,
    max: 5,
    failOpen: true,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives, reessayez dans un instant' },
      { status: 429 }
    )
  }

  let parsed
  try {
    const body = await request.json()
    parsed = submitSchema.safeParse(body)
  } catch {
    return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
  }

  if (!parsed || !parsed.success) {
    return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 })
  }

  const { rating, wouldRecommend, comment, authorName } = parsed.data
  const supabase = createAdminClient()
  const hash = hashInvitationToken(token)

  const { data: invitation, error: lookupError } = await supabase
    .from('review_invitations')
    .select(
      'id, provider_id, client_email, client_name, service_name, sent_at, completed_at, expires_at'
    )
    .eq('token_hash', hash)
    .maybeSingle()

  if (lookupError) {
    logger.error('[submit-invitation] lookup error', lookupError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation introuvable ou expiree' }, { status: 404 })
  }

  if (invitation.completed_at) {
    return NextResponse.json({ error: 'Avis deja enregistre' }, { status: 409 })
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Lien expire' }, { status: 410 })
  }

  const cleanComment = comment?.trim() ?? ''
  const fraudIndicators = detectFraudIndicators(cleanComment, rating)

  // Auto-moderation (Sprint 1.9) — layered heuristic:
  //   - Any fraud indicator → manual queue (safest default).
  //   - Empty or very short comment with extreme rating → manual queue
  //     (would_recommend + rating alone is weak signal when content==null).
  //   - Otherwise → auto-publish. Matches the behaviour of createReview()
  //     for logged-in booking clients so we don't create a divergent trust
  //     path between the two ingestion channels.
  const hasFraudIndicators = fraudIndicators.length > 0
  const weakSignal = cleanComment.length < 15 && (rating === 1 || rating === 5)
  const status = hasFraudIndicators || weakSignal ? 'pending_review' : 'published'

  const insertPayload: Record<string, unknown> = {
    provider_id: invitation.provider_id,
    author_name: authorName,
    author_email: invitation.client_email,
    rating,
    content: cleanComment || null,
    would_recommend: wouldRecommend,
    status,
    fraud_indicators: fraudIndicators.length > 0 ? fraudIndicators : null,
    source: 'invitation',
    created_at: new Date().toISOString(),
  }

  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertError) {
    // If `source` column doesn't exist yet, retry without it (graceful fallback)
    if (insertError.code === 'PGRST204' || /column .* source/i.test(insertError.message)) {
      delete insertPayload.source
      const retry = await supabase.from('reviews').insert(insertPayload).select('id').single()
      if (retry.error) {
        logger.error('[submit-invitation] insert retry failed', retry.error)
        return NextResponse.json(
          { error: 'Impossible d&apos;enregistrer votre avis' },
          { status: 500 }
        )
      }
      await finalizeInvitation(supabase, invitation.id, retry.data.id)
      await postInsertSideEffects(supabase, invitation.provider_id, retry.data.id)
      return NextResponse.json({ success: true, status })
    }

    logger.error('[submit-invitation] insert error', insertError)
    return NextResponse.json({ error: 'Impossible d&apos;enregistrer votre avis' }, { status: 500 })
  }

  await finalizeInvitation(supabase, invitation.id, review.id)
  await postInsertSideEffects(supabase, invitation.provider_id, review.id)

  return NextResponse.json({ success: true, status })
}

async function finalizeInvitation(
  supabase: ReturnType<typeof createAdminClient>,
  invitationId: string,
  reviewId: string
) {
  const { error } = await supabase
    .from('review_invitations')
    .update({
      completed_at: new Date().toISOString(),
      review_id: reviewId,
    })
    .eq('id', invitationId)

  if (error) {
    logger.error('[submit-invitation] finalize error', { invitationId, error })
  }
}

async function postInsertSideEffects(
  supabase: ReturnType<typeof createAdminClient>,
  providerId: string | null,
  reviewId: string
) {
  if (!providerId) return
  updateArtisanRating(supabase, providerId).catch((err) =>
    logger.error('[submit-invitation] updateArtisanRating failed', err)
  )
  revalidateReviewPaths(supabase, providerId, reviewId).catch(() => {})
}
