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

// Audit B/C #2 (2026-05-04) : claim simplifié 5 champs → 2 champs obligatoires
// (SIREN/SIRET + email). fullName, phone, position deviennent OPTIONNELS pour
// réduire la friction massive (claim rate 0.002% = 19/970K). L'admin enrichit
// au moment de la validation via INSEE ou contact direct.
const claimSchema = z.object({
  providerId: z.string().uuid('ID artisan invalide'),
  siret: z.string().regex(/^\d{9}(\d{5})?$/, 'Entrez un SIREN (9 chiffres) ou SIRET (14 chiffres)'),
  email: z.string().email('Email invalide'),
  fullName: z.string().min(2).optional().or(z.literal('')),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s.\-()]/g, ''))
    .pipe(z.string().min(10).or(z.literal('')))
    .optional(),
  position: z.string().optional().or(z.literal('')),
})

export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 3 requests per hour per IP)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    const rl = await checkRateLimit(`claim:${ip}`, {
      window: 3_600_000,
      max: 3,
      failOpen: true,
    })
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

    // F-2 security fix : RL par providerId (anti-flood SIRET d'une même fiche
    // depuis N IPs). 2 tentatives / 24h / fiche. Couvre le cas où l'IP RL
    // (3/h) ne suffit pas car l'attaquant rote ses IPs.
    const providerRl = await checkRateLimit(`claim:provider:${validation.data.providerId}`, {
      window: 24 * 3_600_000,
      max: 2,
      failOpen: true,
    })
    if (!providerRl.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes pour cette fiche. Réessayez plus tard.' },
        { status: 429 }
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
