/**
 * Cron quotidien : noindex-sweep RGE-only
 * ----------------------------------------------------------------------------
 * Auth : Bearer CRON_SECRET
 * Schedule : `30 3 * * *` UTC (déclaré dans vercel.json)
 *
 * Raison d'être : le trigger `sync_provider_noindex` (migration 456) couvre
 * les mutations sur rge_valid_until / rge_qualifications / claimed_at /
 * is_active. Il ne couvre PAS l'expiration purement temporelle — quand une
 * qualification RGE passe dans le passé à minuit sans UPDATE, aucun trigger
 * ne se déclenche, la fiche reste indexable à tort.
 *
 * Ce cron lance deux UPDATEs idempotents chaque nuit :
 *   1. Flip-to-noindex : is_active ET noindex=false ET claim=null ET
 *      (rge_valid_until NULL OR <= today) → noindex=true
 *   2. Recovery flip-to-indexable : is_active ET noindex=true ET
 *      (rge_valid_until > today OR claimed_at NOT NULL) → noindex=false
 *      (safety net si admin a posé noindex=true manuellement sur un RGE actif)
 *
 * Monitoring : les counts sont logués par structured log. Pas d'alerte dure
 * — c'est de la maintenance, pas un signal business.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const t0 = Date.now()
  const today = new Date().toISOString().slice(0, 10)

  try {
    const supabase = createAdminClient()

    // Phase 1 — Expire RGE sans claim : flip noindex=true.
    // WHERE : actif + actuellement indexable + pas revendiqué
    //         ET (pas de RGE OU RGE expirée).
    const { error: expiredErr, count: expiredCount } = await supabase
      .from('providers')
      .update({ noindex: true }, { count: 'exact' })
      .eq('is_active', true)
      .eq('noindex', false)
      .is('claimed_at', null)
      .or(`rge_valid_until.is.null,rge_valid_until.lte.${today}`)

    if (expiredErr) throw expiredErr

    // Phase 2 — Recovery : flip noindex=false pour les providers qui méritent
    // d'être indexables mais ont été marqués noindex=true (admin manuel,
    // backfill historique, etc.). Filet de sécurité, généralement 0 rows.
    const { error: recoveredErr, count: recoveredCount } = await supabase
      .from('providers')
      .update({ noindex: false }, { count: 'exact' })
      .eq('is_active', true)
      .eq('noindex', true)
      .or(`rge_valid_until.gt.${today},claimed_at.not.is.null`)

    if (recoveredErr) throw recoveredErr

    const elapsedMs = Date.now() - t0
    const expired = expiredCount ?? 0
    const recovered = recoveredCount ?? 0

    logger.info('[noindex-sweep] done', {
      expired,
      recovered,
      totalFlipped: expired + recovered,
      elapsedMs,
      today,
    })

    return NextResponse.json({
      ok: true,
      expired,
      recovered,
      totalFlipped: expired + recovered,
      elapsedMs,
      today,
    })
  } catch (error) {
    logger.error('[noindex-sweep] cron failed', error)
    return NextResponse.json({ ok: false, error: 'noindex-sweep cron failure' }, { status: 500 })
  }
}
