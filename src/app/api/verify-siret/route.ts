/**
 * Verify SIRET/SIREN API - ServicesArtisans
 * Thin handler: parse request, validate, call service, return response
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getClientIp } from '@/lib/rate-limiter'
import {
  validateSiretInput,
  validateSirenInput,
  lookupSiret,
  lookupSiren,
} from '@/lib/services/siret-service'

// ─── Rate limiting (in-memory, per IP) ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  if (entry.count > RATE_LIMIT_MAX) {
    return true
  }
  return false
}

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const keys = Array.from(rateLimitMap.keys())
    keys.forEach((key) => {
      const value = rateLimitMap.get(key)
      if (value && now > value.resetAt) {
        rateLimitMap.delete(key)
      }
    })
  }, 300_000)
}

// ─── Main handler ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request.headers)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez patienter une minute avant de réessayer.',
        rateLimited: true,
      },
      { status: 429 }
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
