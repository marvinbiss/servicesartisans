import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { safeJsonBody } from '@/lib/api/handler'

// Basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const dynamic = 'force-dynamic'

/**
 * POST /api/devis/abandon-tracking
 * Track form abandonment when user fills email at step 2 but doesn't complete.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`abandon-tracking:${ip}`, {
      window: 60_000,
      max: 5,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const parsed = await safeJsonBody<{
      email?: unknown
      service?: unknown
      city?: unknown
      step?: unknown
    }>(request)
    if (!parsed.ok) return parsed.response
    const { email, service, city, step } = parsed.data

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    // Validate email format before any DB operation
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Format email invalide' }, { status: 400 })
    }

    // Validate optional fields
    if (service && typeof service !== 'string') {
      return NextResponse.json({ error: 'service must be a string' }, { status: 400 })
    }
    if (city && typeof city !== 'string') {
      return NextResponse.json({ error: 'city must be a string' }, { status: 400 })
    }
    if (step !== undefined && (typeof step !== 'number' || step < 1 || step > 10)) {
      return NextResponse.json({ error: 'step must be a number between 1 and 10' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Deduplicate: don't insert if same email abandoned within 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('devis_abandons')
      .select('id')
      .eq('email', email)
      .gte('created_at', twentyFourHoursAgo)
      .is('completed_at', null)
      .limit(1)
      .single()

    if (existing) {
      // Update step reached if higher
      await supabase
        .from('devis_abandons')
        .update({ step_reached: step || 2 })
        .eq('id', existing.id)

      return NextResponse.json({ ok: true, deduplicated: true })
    }

    // Insert new abandon record
    const { error } = await supabase.from('devis_abandons').insert({
      email,
      service_slug: service || null,
      city_slug: city || null,
      step_reached: step || 2,
    })

    if (error) {
      logger.error('[abandon-tracking] Insert error', error)
      return NextResponse.json({ error: 'db error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('[abandon-tracking] Error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
