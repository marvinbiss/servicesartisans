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
 *
 * SLA-99.9 hardening (2026-05-06)
 * -------------------------------
 * - IP rate limit 60/min via Upstash (failOpen) — endpoint polling-friendly.
 * - Promise.race timeout 5s sur Supabase.
 * - Sentry captureError sur catch racine.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PASS_THRESHOLD } from '@/lib/cee/quiz-questions'
import { requireArtisanAuth, notFoundResponse, serverErrorResponse } from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { captureError } from '@/lib/monitoring/sentry'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SLA-99.9 : timeout court sur DB.
const DB_TIMEOUT_MS = 5_000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), ms)),
  ])
}

// Number of training videos in the module (static until video tracking table added)
const VIDEO_COUNT = 5

export async function GET(request: NextRequest) {
  // SLA-99.9 : rate limit IP-based 60/min (polling UI status page).
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`cee-partners-training-status:${ip}`, {
    window: 60_000,
    max: 60,
    failOpen: true,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' } },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetTime - Date.now()) / 1000))),
        },
      }
    )
  }

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    // SLA-99.9 : timeout 5s sur lookup.
    const { data: partner, error } = await withTimeout(
      ctx.supabase
        .from('cee_artisan_partners')
        .select('id, certification_score, certified_at, training_completed_at, status')
        .eq('user_id', ctx.userId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'partner_lookup'
    )

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
    // SLA-99.9 : Sentry alert.
    captureError(error, {
      tags: { route: 'cee-partners-training-status', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
