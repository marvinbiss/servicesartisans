import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { sendLeadAlert } from '@/lib/services/notifications-service'

// Enveloppe de SendLeadAlertInput. Les contrôles fins (UUID, cap 50,
// types des champs) restent délégués à `sendLeadAlert` qui renvoie ses
// propres 400 — on valide ici juste la forme structurelle.
const leadAlertSchema = z
  .object({
    provider_ids: z.array(z.string()),
    service: z.string().optional(),
    city: z.string().optional(),
    description: z.string().optional(),
    urgency: z.string().optional(),
    client_name: z.string().optional(),
  })
  .passthrough()

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

    const parsed = leadAlertSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'provider_ids required' }, { status: 400 })
    }

    const result = await sendLeadAlert(parsed.data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ ok: true, results: result.data.results })
  } catch (err) {
    logger.error('[lead-alert] Error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
