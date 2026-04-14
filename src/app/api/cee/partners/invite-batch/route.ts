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
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCeePartner } from '@/lib/cee/leads-service'
import { sendCeePartnerInvite } from '@/lib/cee/emails'
import { logger } from '@/lib/logger'
import { badRequestResponse, serverErrorResponse } from '@/lib/cee/route-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BodySchema = z.object({
  providerIds: z.array(z.string().uuid()).min(1).max(200),
})

export async function POST(request: NextRequest) {
  const authResult = await requirePermission('cee_partners', 'write')
  if (!authResult.success || !authResult.admin) {
    return authResult.error!
  }

  let body: z.infer<typeof BodySchema>
  try {
    const json = await request.json()
    body = BodySchema.parse(json)
  } catch {
    return badRequestResponse('INVALID_BODY', 'Liste de providers invalide.')
  }

  const admin = createAdminClient()

  try {
    // Fetch providers + linked user_id.
    const { data: providers, error } = await admin
      .from('providers')
      .select('id, name, email, user_id')
      .in('id', body.providerIds)

    if (error) {
      logger.error('cee-invite-batch: provider fetch failed', error, {
        action: 'cee-invite-fetch',
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

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
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
