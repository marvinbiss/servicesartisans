/**
 * RGPD Art. 15 & 16 — Access & Rectification Request API
 * POST: Submit a GDPR access or rectification request
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const accessRequestSchema = z.object({
  type: z.enum(['access', 'rectification'], {
    error: 'Le type doit être "access" ou "rectification"',
  }),
  name: z.string().min(2, 'Le nom est requis (min. 2 caractères)').max(200),
  email: z.string().email('Email invalide'),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres').optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000, 'La description ne peut pas dépasser 2000 caractères'),
})

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || request.headers.get('cf-connecting-ip')
      || 'unknown'
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
      return NextResponse.json(
        { error: 'Corps de requête invalide' },
        { status: 400 }
      )
    }

    // Validate
    const validation = accessRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { type, name, email, siret, description } = validation.data
    const adminClient = createAdminClient()

    // Insert into gdpr_access_requests
    const { error: insertError } = await adminClient
      .from('gdpr_access_requests')
      .insert({
        request_type: type,
        requester_name: name.trim(),
        requester_email: email.trim().toLowerCase(),
        siret: siret || null,
        description: description.trim(),
        status: 'pending',
      })

    if (insertError) {
      logger.error('GDPR access request insert error', { error: insertError })
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande' },
        { status: 500 }
      )
    }

    logger.info('GDPR access/rectification request submitted', {
      type,
      requesterEmail: email.trim().toLowerCase(),
      hasSiret: !!siret,
    })

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été enregistrée. Vous recevrez un accusé de réception sous 48h et une réponse complète sous 30 jours maximum.',
    })
  } catch (err) {
    logger.error('GDPR access request API unexpected error', { error: err })
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
