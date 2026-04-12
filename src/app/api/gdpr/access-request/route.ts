/**
 * RGPD Art. 15 & 16 — Access & Rectification Request API
 * POST: Submit a GDPR access or rectification request
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import { accessRequestSchema, createAccessRequest } from '@/lib/services/gdpr-service'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    const rl = await checkRateLimit(`gdpr-access:${ip}`, { window: 3_600_000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      )
    }

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }

    // Validate
    const validation = accessRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const result = await createAccessRequest(adminClient, validation.data)

    if (result.error) {
      logger.error('GDPR access request insert error', { error: result.error })
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande' },
        { status: 500 }
      )
    }

    logger.info('GDPR access/rectification request submitted', {
      type: validation.data.type,
      requesterEmail: validation.data.email.trim().toLowerCase(),
      hasSiret: !!validation.data.siret,
    })

    return NextResponse.json({
      success: true,
      message:
        'Votre demande a été enregistrée. Vous recevrez un accusé de réception sous 48h et une réponse complète sous 30 jours maximum.',
    })
  } catch (err) {
    logger.error('GDPR access request API unexpected error', { error: err })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
