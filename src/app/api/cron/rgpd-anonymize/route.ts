/**
 * Cron : anonymisation RGPD simulateur_estimations
 * Fréquence : quotidien 03h (voir vercel.json)
 * Doc : docs/rgpd-simulateur-aides.md §4
 *
 * Règles appliquées :
 *   1. rows > 90j avec rfr_exact NOT NULL → rfr_exact = NULL
 *      (rfr_tranche a déjà été calculée à l'insertion — P3/P4)
 *   2. rows > 3 ans sans pipedrive_deal_id → coords NULL + anonymized_at = now
 *   3. rows > 6 mois avec ip_hash NOT NULL → ip_hash = NULL
 *
 * Idempotent : peut tourner plusieurs fois par jour sans effet de bord.
 * Auth : header `Authorization: Bearer ${CRON_SECRET}`.
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_SIZE = 500
const DAYS_90 = 90 * 24 * 60 * 60 * 1000
const YEARS_3 = 3 * 365 * 24 * 60 * 60 * 1000
const MONTHS_6 = 180 * 24 * 60 * 60 * 1000

type SupabaseAdmin = ReturnType<typeof createAdminClient>

/**
 * Règle 1 : RFR > 90j → NULL.
 * La colonne rfr_tranche a été remplie à l'insertion, donc on ne perd rien.
 */
async function applyRule1(supabase: SupabaseAdmin, cutoff: string): Promise<number> {
  let total = 0
  for (;;) {
    // Select ids in batches to avoid long-running UPDATE
    const { data: rows, error: selErr } = await supabase
      .from('simulateur_estimations')
      .select('id')
      .lt('created_at', cutoff)
      .not('rfr_exact', 'is', null)
      .limit(BATCH_SIZE)

    if (selErr) {
      logger.error('rgpd-anonymize: rule1 select failed', selErr)
      throw selErr
    }
    if (!rows || rows.length === 0) break

    const ids = rows.map((r) => r.id as string)
    const { error: updErr } = await supabase
      .from('simulateur_estimations')
      .update({ rfr_exact: null })
      .in('id', ids)

    if (updErr) {
      logger.error('rgpd-anonymize: rule1 update failed', updErr)
      throw updErr
    }

    total += ids.length
    if (rows.length < BATCH_SIZE) break
  }
  return total
}

/**
 * Règle 2 : > 3 ans ET pipedrive_deal_id IS NULL → vider coords + anonymized_at.
 * Si Pipedrive a converti, on garde (obligation légale comptable).
 */
async function applyRule2(supabase: SupabaseAdmin, cutoff: string): Promise<number> {
  let total = 0
  for (;;) {
    const { data: rows, error: selErr } = await supabase
      .from('simulateur_estimations')
      .select('id')
      .lt('created_at', cutoff)
      .is('pipedrive_deal_id', null)
      .is('anonymized_at', null)
      .limit(BATCH_SIZE)

    if (selErr) {
      logger.error('rgpd-anonymize: rule2 select failed', selErr)
      throw selErr
    }
    if (!rows || rows.length === 0) break

    const ids = rows.map((r) => r.id as string)
    const { error: updErr } = await supabase
      .from('simulateur_estimations')
      .update({
        email: null,
        telephone: null,
        prenom: null,
        nom: null,
        anonymized_at: new Date().toISOString(),
      })
      .in('id', ids)

    if (updErr) {
      logger.error('rgpd-anonymize: rule2 update failed', updErr)
      throw updErr
    }

    total += ids.length
    if (rows.length < BATCH_SIZE) break
  }
  return total
}

/**
 * Règle 3 : > 6 mois ET ip_hash IS NOT NULL → ip_hash = NULL.
 */
async function applyRule3(supabase: SupabaseAdmin, cutoff: string): Promise<number> {
  let total = 0
  for (;;) {
    const { data: rows, error: selErr } = await supabase
      .from('simulateur_estimations')
      .select('id')
      .lt('created_at', cutoff)
      .not('ip_hash', 'is', null)
      .limit(BATCH_SIZE)

    if (selErr) {
      logger.error('rgpd-anonymize: rule3 select failed', selErr)
      throw selErr
    }
    if (!rows || rows.length === 0) break

    const ids = rows.map((r) => r.id as string)
    const { error: updErr } = await supabase
      .from('simulateur_estimations')
      .update({ ip_hash: null })
      .in('id', ids)

    if (updErr) {
      logger.error('rgpd-anonymize: rule3 update failed', updErr)
      throw updErr
    }

    total += ids.length
    if (rows.length < BATCH_SIZE) break
  }
  return total
}

export const GET = withCronCheckIn('cron-rgpd-anonymize', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-rgpd-anonymize',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const now = Date.now()
      const cutoff90 = new Date(now - DAYS_90).toISOString()
      const cutoff3y = new Date(now - YEARS_3).toISOString()
      const cutoff6m = new Date(now - MONTHS_6).toISOString()

      const supabase = createAdminClient()

      try {
        const rule1 = await applyRule1(supabase, cutoff90)
        const rule2 = await applyRule2(supabase, cutoff3y)
        const rule3 = await applyRule3(supabase, cutoff6m)

        logger.info('rgpd-anonymize: done', {
          component: 'cron/rgpd-anonymize',
          rule1_rfr_nulled: rule1,
          rule2_coords_anonymized: rule2,
          rule3_ip_hash_nulled: rule3,
        })

        return NextResponse.json({
          ok: true,
          rule1_rfr_nulled: rule1,
          rule2_coords_anonymized: rule2,
          rule3_ip_hash_nulled: rule3,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error'
        logger.error('rgpd-anonymize: failed', err, { component: 'cron/rgpd-anonymize' })
        Sentry.captureException(err, { tags: { cron: 'rgpd-anonymize' } })
        return NextResponse.json({ error: message }, { status: 500 })
      }
    },
    {
      schedule: { type: 'crontab', value: '0 3 * * *' },
    }
  )
})
