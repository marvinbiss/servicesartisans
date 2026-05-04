/**
 * Verify SIRET/SIREN API - ServicesArtisans
 * Thin handler: parse request, validate, call service, return response
 *
 * Rate-limit DB-backed via Upstash Redis (Sprint 1 vague 4 — 2026-05-04).
 * Avant : Map in-memory perdue à chaque cold-start Vercel → DoS bypassable.
 * Maintenant : Upstash partagé entre instances + fail-close (verify est dans
 * la liste fail-close de l'audit 2026-04-25 aux côtés de payment/gdpr/ai).
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import {
  validateSiretInput,
  validateSirenInput,
  lookupSiret,
  lookupSiren,
} from '@/lib/services/siret-service'

// ─── Main handler ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)

  const rl = await checkRateLimit(`verify-siret:${ip}`, {
    window: 60_000,
    max: 10,
    failOpen: false,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez patienter une minute avant de réessayer.',
        rateLimited: true,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
      }
    )
  }

  const siretParam = request.nextUrl.searchParams.get('siret')
  const sirenParam = request.nextUrl.searchParams.get('siren')

  const isSirenLookup = !siretParam && !!sirenParam
  const rawValue = (siretParam || sirenParam || '').replace(/\s/g, '')

  try {
    if (isSirenLookup) {
      // Validate SIREN
      const validation = validateSirenInput(rawValue)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const result = await lookupSiren(rawValue)
      return NextResponse.json(result)
    } else {
      // Validate SIRET
      const validation = validateSiretInput(rawValue)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const result = await lookupSiret(rawValue)
      return NextResponse.json(result)
    }
  } catch (error) {
    logger.error('SIRET/SIREN public verification error', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
