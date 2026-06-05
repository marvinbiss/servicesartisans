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
 *
 * SLA-99.9 hardening (2026-05-06)
 * -------------------------------
 * - IP rate limit 10/min via Upstash (failOpen) en complément du userId limiter.
 * - Promise.race timeout 5s sur Supabase pour éviter les hangs.
 * - audit_logs entry (best-effort, non bloquant) sur transition réussie.
 * - Sentry captureError sur catch racine avec tag critical=true.
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
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { captureError } from '@/lib/monitoring/sentry'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SLA-99.9 : timeout court sur DB pour ne jamais hang la function Vercel.
const DB_TIMEOUT_MS = 5_000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), ms)),
  ])
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request, { requireOrigin: true })) return csrfRejectResponse()

  // SLA-99.9 : rate limit IP-based (defense in depth contre abus distribué).
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`cee-partners-activate:${ip}`, {
    window: 60_000,
    max: 10,
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
    // SLA-99.9 : timeout 5s sur lookup partner.
    const lookup = await withTimeout(
      ctx.supabase
        .from('cee_artisan_partners')
        .select('id, status')
        .eq('user_id', ctx.userId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'partner_lookup'
    )
    const { data: partner, error: readError } = lookup

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
      await withTimeout(
        updateCeePartnerStatus(admin, partner.id, 'active'),
        DB_TIMEOUT_MS,
        'transition'
      )
    } catch (transError) {
      logger.warn('cee-activate: illegal transition', {
        action: 'cee-activate-illegal',
        partnerId: partner.id,
        from: partner.status,
        error: transError instanceof Error ? transError.message : String(transError),
      })
      return badRequestResponse(
        'ILLEGAL_TRANSITION',
        'Activation impossible depuis le statut actuel. Complétez les étapes précédentes.'
      )
    }

    // SLA-99.9 : audit_logs best-effort (non bloquant).
    admin
      .from('audit_logs')
      .insert({
        user_id: ctx.userId,
        action: 'cee_partner_activated',
        resource_type: 'cee_artisan_partners',
        resource_id: partner.id,
        metadata: { from: partner.status, to: 'active' },
      })
      .then(({ error: auditError }) => {
        if (auditError) {
          logger.warn('cee-activate: audit log failed (non-blocking)', {
            action: 'cee-activate-audit-fail',
            partnerId: partner.id,
            error: auditError.message,
          })
        }
      })

    // Fail-open notification email.
    if (ctx.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
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
    // SLA-99.9 : Sentry alert sur erreur racine.
    captureError(error, {
      tags: { route: 'cee-partners-activate', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
