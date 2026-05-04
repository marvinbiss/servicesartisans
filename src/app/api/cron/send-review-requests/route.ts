/**
 * DEPRECATED 2026-04-25 — superseded by /api/cron/send-review-invitations.
 *
 * Cette route émettait des liens `/donner-avis/${booking.id.slice(0,8)}` qui
 * sont 404 depuis le rename de slug en `/invitation-avis/[token]`
 * (commit 2556b731). Le canal officiel est désormais
 * `send-review-invitations` (token HMAC, table `review_invitations`).
 *
 * On garde le handler vivant uniquement pour répondre 200 si Vercel garde
 * en cache l'ancienne route ou si un acteur externe ping. Le cron a été
 * retiré du `vercel.json` ; ce fichier peut être supprimé après confirmation
 * qu'il n'est plus appelé.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const GET = withCronCheckIn('cron-send-review-requests', async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[Review Cron] Unauthorized access attempt')
    return NextResponse.json(
      { success: false, error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    deprecated: true,
    message: 'Use /api/cron/send-review-invitations instead',
    sentCount: 0,
  })
})
