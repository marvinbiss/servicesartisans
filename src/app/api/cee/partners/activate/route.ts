/**
 * POST /api/cee/partners/activate
 *
 * Transitions the partner from `certified` to `active`. Can be triggered
 * automatically by the artisan after passing the quiz (if pre-requisites
 * are met) or manually by an admin (re-activation of a suspended partner).
 *
 * Security (THREAT_MODEL_PR2)
 * ---------------------------
 * - MUST-9  : validateOrigin() (CSRF)
 * - MUST-6  : transition via updateCeePartnerStatus. Only `certified → active`
 *             and `suspended → active` are allowed. Anything else throws.
 * - A01 BAC : artisan can only activate THEIR OWN record. RLS + explicit
 *             user_id filter.
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/cee/csrf'
import { updateCeePartnerStatus } from '@/lib/cee/leads-service'
import { sendCeePartnerActivatedEmail } from '@/lib/cee/emails'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  notFoundResponse,
  serverErrorResponse,
  badRequestResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) return csrfRejectResponse()

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    const { data: partner, error: readError } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id, status')
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (readError) {
      logger.error('cee-activate: partner lookup failed', readError, {
        action: 'cee-activate-lookup',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }
    if (!partner) {
      return notFoundResponse('Aucun dossier partenaire associé à votre compte.')
    }

    const admin = createAdminClient()

    // MUST-6 transition. updateCeePartnerStatus throws on illegal.
    try {
      await updateCeePartnerStatus(admin, partner.id, 'active')
    } catch (transError) {
      logger.warn('cee-activate: illegal transition', {
        action: 'cee-activate-illegal',
        partnerId: partner.id,
        from: partner.status,
        error:
          transError instanceof Error
            ? transError.message
            : String(transError),
      })
      return badRequestResponse(
        'ILLEGAL_TRANSITION',
        'Activation impossible depuis le statut actuel. Complétez les étapes précédentes.'
      )
    }

    // Fail-open notification email.
    if (ctx.email) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
      sendCeePartnerActivatedEmail({
        to: ctx.email,
        artisanName: ctx.email.split('@')[0],
        dashboardUrl: `${siteUrl}/espace-artisan/cee`,
      }).catch((err) => {
        logger.warn('cee-activate: email failed (fail-open)', {
          action: 'cee-activate-email-fail',
          error: err instanceof Error ? err.message : String(err),
        })
      })
    }

    logger.info('cee-activate: partner activated', {
      action: 'cee-activate-ok',
      partnerId: partner.id,
    })

    return NextResponse.json({
      success: true,
      data: { status: 'active' },
    })
  } catch (error) {
    logger.error('cee-activate: unexpected error', error, {
      action: 'cee-activate-catch',
      userId: ctx.userId,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
