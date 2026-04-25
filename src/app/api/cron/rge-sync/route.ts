import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { syncRgeFromAdeme } from '@/lib/rge/sync'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

/**
 * Weekly cron: sync RGE certifications from ADEME API into providers table.
 *
 * Source   : data.gouv.fr — liste-des-entreprises-rge-2
 * Licence  : Etalab 2.0
 * Schedule : `0 2 * * 0` (dimanche 02:00 UTC, déclaré dans vercel.json)
 * Durée    : ~5-8 min sur le dataset complet (~165k lignes)
 *
 * ⚠️ maxDuration = 300s (5 min) — nécessite Vercel Pro.
 * Sur Hobby (60s max), cette route échouera par timeout. Alternative :
 * déclencher `npx tsx scripts/enrich-rge-ademe.ts` depuis une GitHub Action
 * hebdomadaire à la place.
 */

export const maxDuration = 300 // 5 minutes — nécessite Vercel Pro
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return await Sentry.withMonitor(
    'cron-rge-sync',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json(
          { error: 'Serveur mal configuré : CRON_SECRET manquant' },
          { status: 500 }
        )
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Variables Supabase manquantes' }, { status: 500 })
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      Sentry.addBreadcrumb({
        category: 'cron',
        level: 'info',
        message: 'rge-sync start',
      })

      try {
        const result = await syncRgeFromAdeme(supabase, {
          // Full sync en WRITE, pas de limite, backfill activé.
          // isPartialSync: false explicite → clearStaleRge() tourne et nettoie les providers
          // dont le SIRET n'est plus dans le dataset ADEME.
          isPartialSync: false,
        })

        logger.info('RGE sync cron completed', {
          action: 'rge-sync-cron',
          ...result,
        })

        // Monitoring volume/fraîcheur via Sentry breadcrumbs + messages.
        // Permet d'alerter si ademeRowsFetched chute ou si providersUpdated = 0.
        Sentry.captureMessage('RGE sync completed', {
          level: 'info',
          tags: { cron: 'rge-sync' },
          extra: { ...result },
        })

        await pingHeartbeat('rge-sync')
        return NextResponse.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        logger.error('RGE sync cron failed', {
          action: 'rge-sync-cron',
          error: message,
        })
        // Fail-loud : le cron RGE est critique (garde-fou P0 ADEME_MIN_ROWS_FOR_CLEAR,
        // atomicité via RPC 385). Toute exception doit remonter à Sentry pour alerting.
        Sentry.captureException(err, {
          tags: { cron: 'rge-sync' },
          extra: { message },
        })
        return NextResponse.json({ success: false, error: message }, { status: 500 })
      }
    },
    {
      schedule: { type: 'crontab', value: '0 2 * * 0' },
    }
  )
}
