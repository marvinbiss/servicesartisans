import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

// Basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/devis/abandon-complete
 * Mark abandonment as completed — stop sending recovery emails.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`abandon-complete:${ip}`, { window: 60_000, max: 5 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    // Validate email format before any DB operation
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Format email invalide' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mark the most recent abandon as completed
    const { error } = await supabase
      .from('devis_abandons')
      .update({ completed_at: new Date().toISOString() })
      .eq('email', email)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      logger.error('[abandon-complete] Update error', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('[abandon-complete] Error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
