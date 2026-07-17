/**
 * Réponse client à un devis-light via token (accept / refuse).
 * Accès non authentifié par token opaque → client admin (bypass RLS),
 * rate-limité. Aucune intermédiation financement ici (étape 7, post-avocat).
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { respondToQuoteByToken } from '@/lib/services/provider-quotes-service'

export const dynamic = 'force-dynamic'

const respondSchema = z.object({
  action: z.enum(['accepte', 'refuse']),
})

export async function POST(request: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params
  const token = params.token?.trim()
  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Lien invalide' }, { status: 400 })
  }

  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`devis-respond:${ip}:${token.slice(0, 16)}`, {
    window: 60_000,
    max: 10,
    failOpen: true,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessayez dans un instant' },
      { status: 429 }
    )
  }

  let parsed
  try {
    parsed = respondSchema.safeParse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  if (!parsed.success) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await respondToQuoteByToken(supabase, token, parsed.data.action)

  if (error) {
    if (error === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }
    if (error === 'INVALID_TRANSITION') {
      return NextResponse.json({ error: 'Ce devis ne peut plus être modifié.' }, { status: 409 })
    }
    logger.error('[devis respond] error', { error })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: data?.status })
}
