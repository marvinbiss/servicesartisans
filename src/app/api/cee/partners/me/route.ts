/**
 * GET /api/cee/partners/me
 *
 * Returns the authenticated artisan's `cee_artisan_partners` record.
 *
 * Security (THREAT_MODEL_PR2 MUST-13, A01 BAC)
 * --------------------------------------------
 * - Uses `createClient()` (cookie-based, RLS-respecting). No service_role.
 * - Filter `.eq('user_id', auth.uid())` explicit — defense-in-depth even
 *   though RLS policy `cee_artisan_partners_artisan_self_read` already
 *   scopes rows.
 * - Never returns `iban_encrypted`. Only `iban_last4` is UI-safe.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisanAuth, serverErrorResponse } from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PARTNER_PUBLIC_COLUMNS =
  'id, provider_id, user_id, status, invited_at, onboarding_started_at, ' +
  'convention_sent_at, convention_signed_at, training_completed_at, ' +
  'certification_score, certified_at, activated_at, suspended_at, ' +
  'revoked_at, iban_last4, bic, titulaire_compte, ' +
  'commission_rate_effective, operations_allowed, zones_allowed, ' +
  'yousign_envelope_id, convention_pdf_url, created_at, updated_at'

export async function GET(_request: NextRequest) {
  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response

  const { ctx } = auth

  try {
    const { data, error } = await ctx.supabase
      .from('cee_artisan_partners')
      .select(PARTNER_PUBLIC_COLUMNS)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (error) {
      logger.error('cee-partners-me: read failed', error, {
        action: 'cee-partners-me-read',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Impossible de récupérer votre dossier partenaire')
    }

    return NextResponse.json({
      success: true,
      data: data ?? null,
    })
  } catch (error) {
    logger.error('cee-partners-me: unexpected error', error, {
      action: 'cee-partners-me-catch',
      userId: ctx.userId,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
