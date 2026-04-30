import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { sendLeadAlert } from '@/lib/services/notifications-service'

/**
 * POST /api/notifications/send-lead-alert
 * Send immediate email + SMS alerts to matched artisans when a new devis is submitted.
 * Called internally after devis insertion.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: internal-only endpoint — require CRON_SECRET
    const authHeader = request.headers.get('authorization') || ''
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Rate limiting: 3 requests per minute per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`send-lead-alert:${ip}`, {
      window: 60_000,
      max: 3,
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

    const body = await request.json()

    const result = await sendLeadAlert(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ ok: true, results: result.data.results })
  } catch (err) {
    logger.error('[lead-alert] Error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
