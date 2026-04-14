/**
 * GET /api/cee/partners/training/status
 *
 * Retourne le statut de formation de l'artisan courant :
 *   - videos_watched  : tableau de booléens par vidéo (stub — no video tracking table yet)
 *   - quiz_passed     : true si certification_score >= PASS_THRESHOLD
 *   - certified_at    : timestamptz (null si pas certifié)
 *   - score           : score brut (null si pas encore passé)
 *
 * Sécurité :
 *   - Auth obligatoire (401)
 *   - RLS via createClient() (user_id = auth.uid())
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { PASS_THRESHOLD } from '@/lib/cee/quiz-questions'
import {
  requireArtisanAuth,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Number of training videos in the module (static until video tracking table added)
const VIDEO_COUNT = 5

export async function GET(_request: NextRequest) {
  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    const { data: partner, error } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id, certification_score, certified_at, training_completed_at, status')
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (error) {
      logger.error('cee-training-status: DB error', error, {
        action: 'cee-training-status',
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    if (!partner) {
      return notFoundResponse('Aucun dossier partenaire associé à votre compte.')
    }

    const score = (partner as { certification_score: number | null }).certification_score
    const certifiedAt = (partner as { certified_at: string | null }).certified_at
    const trainingCompletedAt = (partner as { training_completed_at: string | null })
      .training_completed_at
    const quizPassed = score !== null && score >= PASS_THRESHOLD

    // videos_watched: stub — returns all true if training_completed_at is set,
    // all false otherwise. Will be replaced by video tracking table in a future PR.
    const videosWatched = Array.from<boolean>({ length: VIDEO_COUNT }).fill(
      trainingCompletedAt !== null
    )

    return NextResponse.json({
      success: true,
      data: {
        videos_watched: videosWatched,
        quiz_passed: quizPassed,
        certified_at: certifiedAt,
        score,
        pass_threshold: PASS_THRESHOLD,
      },
    })
  } catch (error) {
    logger.error('cee-training-status: unhandled error', error, {
      action: 'cee-training-status-catch',
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
