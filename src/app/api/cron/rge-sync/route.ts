import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncRgeFromAdeme } from '@/lib/rge/sync'
import { logger } from '@/lib/logger'

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
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured: CRON_SECRET missing' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const result = await syncRgeFromAdeme(supabase, {
      // Full sync en WRITE, pas de limite, backfill activé
    })

    logger.info('RGE sync cron completed', {
      action: 'rge-sync-cron',
      ...result,
    })

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
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
