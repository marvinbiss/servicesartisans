/**
 * Artisan Claim API
 * POST: Submit a claim request for a provider page (SIRET verification + admin review)
 * Auth is OPTIONAL — anonymous claims are supported (account created on admin approval)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'
import { createClaim } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

const claimSchema = z.object({
  providerId: z.string().uuid('ID artisan invalide'),
  siret: z.string().regex(/^\d{9}(\d{5})?$/, 'Entrez un SIREN (9 chiffres) ou SIRET (14 chiffres)'),
  fullName: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  position: z.string().min(2, 'Le poste est requis'),
})

export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 3 requests per hour per IP)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    const rl = await checkRateLimit(`claim:${ip}`, { window: 3_600_000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
        { status: 429 }
      )
    }

    // Auth is OPTIONAL — try to get user, but don't fail if not logged in
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Validate body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }

    const validation = claimSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createClaim(validation.data, user?.id ?? null)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.details &&
            process.env.NODE_ENV === 'development' && { debug: result.details }),
        },
        { status: result.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    logger.error('Claim API unexpected error', { error: err })
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && { debug: String(err) }),
      },
      { status: 500 }
    )
  }
}
