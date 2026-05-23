import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

// Basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const abandonSchema = z.object({
  email: z.string().min(1).max(254).regex(EMAIL_REGEX, 'Format email invalide'),
})

export const dynamic = 'force-dynamic'

/**
 * POST /api/devis/abandon-complete
 * Mark abandonment as completed — stop sending recovery emails.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`abandon-complete:${ip}`, {
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

    const parsed = abandonSchema.safeParse(await request.json())
    if (!parsed.success) {
      const isMissing = parsed.error.issues.some(
        (i) => i.path[0] === 'email' && (i.code === 'invalid_type' || i.code === 'too_small')
      )
      return NextResponse.json(
        { error: isMissing ? 'email required' : 'Format email invalide' },
        { status: 400 }
      )
    }
    const { email } = parsed.data

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
