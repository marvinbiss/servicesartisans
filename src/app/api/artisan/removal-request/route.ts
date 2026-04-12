/**
 * RGPD Art. 21 — Provider Removal Request API
 * POST: Submit a request to remove a provider page (right of objection)
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'
import { createRemovalRequest } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

const removalSchema = z.object({
  providerId: z.string().uuid('ID artisan invalide'),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
  requesterName: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  requesterEmail: z.string().email('Email invalide'),
  reason: z.string().max(2000, 'Le motif ne peut pas dépasser 2000 caractères').optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    const rl = await checkRateLimit(`removal:${ip}`, { window: 3_600_000, max: 3 })
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
    const validation = removalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createRemovalRequest(validation.data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    logger.error('Removal request API unexpected error', { error: err })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
