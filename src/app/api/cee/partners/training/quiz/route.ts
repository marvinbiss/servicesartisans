/**
 * POST /api/cee/partners/training/quiz
 *
 * Accepts the artisan's quiz answers, scores them SERVER-SIDE, and if the
 * score >= PASS_THRESHOLD transitions the partner to `certified`.
 *
 * Security (THREAT_MODEL_PR2)
 * ---------------------------
 * - MUST-9  : validateOrigin() (CSRF)
 * - MUST-8  : rate limit 3 req/min per user_id
 * - MUST-7  : score calculated server-side from QUIZ_QUESTIONS. Any `score`
 *             or `certified` field in client body is IGNORED (CWE-602).
 * - MUST-6  : transition via updateCeePartnerStatus (throws on illegal).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit } from '@/lib/cee/rate-limit'
import { scoreQuiz, QUIZ_QUESTIONS, PASS_THRESHOLD } from '@/lib/cee/quiz-questions'
import { updateCeePartnerStatus } from '@/lib/cee/leads-service'
import { sendCeeCertificationEmail } from '@/lib/cee/emails'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  rateLimitedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Accept only `answers: { [id]: number }`. All other fields are stripped.
// Out-of-range indexes are accepted at the schema level and scored as wrong
// by scoreQuiz — preserves MUST-7 semantics (server decides; client cannot
// force a 400 by passing an unusual index).
const BodySchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0)),
})

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) return csrfRejectResponse()

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  const rl = checkRateLimit(`cee:quiz:${ctx.userId}`, {
    max: 3,
    windowMs: 60_000,
  })
  if (!rl.allowed) return rateLimitedResponse(rl.resetMs)

  // Body parse. Deliberately strip client-provided `score` / `certified`.
  let parsed: z.infer<typeof BodySchema>
  try {
    const json = await request.json()
    parsed = BodySchema.parse(json)
  } catch {
    return badRequestResponse('INVALID_BODY', 'Réponses de quiz invalides.')
  }

  // MUST-7 server-side scoring.
  const result = scoreQuiz(parsed.answers)

  try {
    const { data: partner, error: readError } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id, status')
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (readError) {
      logger.error('cee-quiz: partner lookup failed', readError, {
        action: 'cee-quiz-lookup',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }
    if (!partner) {
      return notFoundResponse('Aucun dossier partenaire associé à votre compte.')
    }

    const admin = createAdminClient()

    // Persist score + training_completed_at.
    const { error: updateError } = await admin
      .from('cee_artisan_partners')
      .update({
        certification_score: result.score,
        training_completed_at: new Date().toISOString(),
      })
      .eq('id', partner.id)

    if (updateError) {
      logger.error('cee-quiz: score update failed', updateError, {
        action: 'cee-quiz-update',
        partnerId: partner.id,
      })
      return serverErrorResponse('UPDATE_FAILED', 'Erreur serveur')
    }

    // MUST-6 transition (atomic) : convention_signed → certified OR training → certified.
    // PARTNER_TRANSITIONS autorise les 2 chemins → une seule transition suffit,
    // évitant la non-atomicité d'une double update (quiz = preuve de formation).
    let certified = false
    if (result.passed) {
      try {
        if (partner.status !== 'certified' && partner.status !== 'active') {
          await updateCeePartnerStatus(admin, partner.id, 'certified')
        }
        certified = true

        // Fail-open email.
        if (ctx.email) {
          sendCeeCertificationEmail({
            to: ctx.email,
            artisanName: ctx.email.split('@')[0],
            score: result.score,
            certificatePdfUrl: null,
          }).catch((err) => {
            logger.warn('cee-quiz: certification email failed (fail-open)', {
              action: 'cee-quiz-email-fail',
              error: err instanceof Error ? err.message : String(err),
            })
          })
        }
      } catch (transError) {
        logger.warn('cee-quiz: status transition blocked', {
          action: 'cee-quiz-transition-block',
          partnerId: partner.id,
          from: partner.status,
          error:
            transError instanceof Error
              ? transError.message
              : String(transError),
        })
      }
    }

    logger.info('cee-quiz: scored', {
      action: 'cee-quiz-scored',
      partnerId: partner.id,
      score: result.score,
      passed: result.passed,
      certified,
    })

    return NextResponse.json({
      success: true,
      data: {
        score: result.score,
        total: result.total,
        passThreshold: PASS_THRESHOLD,
        passed: result.passed,
        certified,
        questionCount: QUIZ_QUESTIONS.length,
      },
    })
  } catch (error) {
    logger.error('cee-quiz: unexpected error', error, {
      action: 'cee-quiz-catch',
      userId: ctx.userId,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
