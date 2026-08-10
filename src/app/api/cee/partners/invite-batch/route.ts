/**
 * POST /api/cee/partners/invite-batch
 *
 * Admin-only. Sends a batch of partner-invitation emails to RGE artisans
 * and ensures a `cee_artisan_partners` row exists (status='invited').
 *
 * Security
 * --------
 * - requirePermission('cee_partners', 'write') — CSRF + admin role checked
 *   by admin-auth. No additional validateOrigin() needed (already inside).
 * - Body validated with zod (array of provider_ids + optional emails).
 *
 * SLA-99.9 hardening (2026-05-06)
 * -------------------------------
 * - IP rate limit 5/min via Upstash (failOpen) — anti-abus batch.
 * - Tightened batch cap to 100 (was 200) pour limiter le blast radius
 *   email + Resend quota burn en cas de mauvaise manip admin.
 * - Promise.race timeout 15s sur le SELECT providers (batch large).
 * - Sentry captureError sur catch racine.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { z } from 'zod'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCeePartner } from '@/lib/cee/leads-service'
import { sendCeePartnerInvite } from '@/lib/cee/emails'
import { logger } from '@/lib/logger'
import { badRequestResponse, serverErrorResponse } from '@/lib/cee/route-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { captureError } from '@/lib/monitoring/sentry'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SLA-99.9 : timeout 15s pour SELECT batch (jusqu'à 100 providers).
const DB_TIMEOUT_MS = 15_000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), ms)),
  ])
}

// SLA-99.9 : 100 max par batch (anti-abus + Resend quota).
const BATCH_MAX = 100

const BodySchema = z.object({
  providerIds: z.array(z.string().uuid()).min(1).max(BATCH_MAX),
})

export async function POST(request: NextRequest) {
  // SLA-99.9 : rate limit IP-based 5/min (anti-abus batch).
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`cee-partners-invite-batch:${ip}`, {
    window: 60_000,
    max: 5,
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

  const authResult = await requirePermission('cee_partners', 'write')
  if (!authResult.success) {
    return authResult.error
  }

  let body: z.infer<typeof BodySchema>
  try {
    const json = await request.json()
    body = BodySchema.parse(json)
  } catch {
    return badRequestResponse(
      'INVALID_BODY',
      `Liste de providers invalide (max ${BATCH_MAX} par batch).`
    )
  }

  const admin = createAdminClient()

  try {
    // SLA-99.9 : timeout 15s sur fetch batch.
    const { data: providers, error } = await withTimeout(
      admin.from('providers').select('id, name, email, user_id').in('id', body.providerIds),
      DB_TIMEOUT_MS,
      'providers_fetch'
    )

    if (error) {
      logger.error('cee-invite-batch: provider fetch failed', error, {
        action: 'cee-invite-fetch',
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    const siteUrl = SITE_URL

    const results = {
      invited: 0,
      skipped: 0,
      emailsSent: 0,
      emailsFailed: 0,
    }

    for (const p of providers ?? []) {
      if (!p.user_id) {
        results.skipped += 1
        continue
      }

      try {
        await createCeePartner(admin, {
          providerId: p.id,
          userId: p.user_id,
        })
        results.invited += 1
      } catch (err) {
        logger.warn('cee-invite-batch: partner create failed', {
          action: 'cee-invite-partner-fail',
          providerId: p.id,
          error: err instanceof Error ? err.message : String(err),
        })
        continue
      }

      if (p.email) {
        const result = await sendCeePartnerInvite({
          to: p.email,
          artisanName: p.name || 'Artisan',
          invitationUrl: `${siteUrl}/espace-artisan/cee/onboarding`,
        })
        if (result.success) results.emailsSent += 1
        else results.emailsFailed += 1
      }
    }

    logger.info('cee-invite-batch: done', {
      action: 'cee-invite-batch-done',
      ...results,
    })

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    logger.error('cee-invite-batch: unexpected error', error, {
      action: 'cee-invite-batch-catch',
    })
    // SLA-99.9 : Sentry alert.
    captureError(error, {
      tags: { route: 'cee-partners-invite-batch', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
