/**
 * Cron : cluster-critic
 * ----------------------------------------------------------------------------
 * Schedule recommandé : `30 *\/6 * * *` (4 runs/jour, offset 30 min de
 * cluster-generate). Selectionne les rows `content_jsonb is not null AND
 * critic_passed_at is null` (drafts non-critiqués), invoque `runClusterCritic`
 * qui :
 *   - persiste critic_runs row (mig 525)
 *   - stamp critic_passed_at SI verdict = approve
 *   - laisse pour relecture humaine SI revise/block (pas de delete auto)
 *
 * Auth : Bearer CRON_SECRET. nodejs runtime, maxDuration 300.
 */

import { NextResponse } from 'next/server'

import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { createAdminClient } from '@/lib/supabase/admin'
import { initLLMRegistryFromEnv } from '@/lib/llm/registry-init'
import { runClusterCritic, type ClusterContent } from '@/lib/clusters'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const BATCH_LIMIT = 50

let registryBooted = false
function ensureRegistry(): boolean {
  if (registryBooted) return true
  try {
    initLLMRegistryFromEnv()
    registryBooted = true
    return true
  } catch (err) {
    logger.error('cron.cluster-critic.registry_boot_failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}

export const GET = withCronCheckIn('cron-cluster-critic', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!ensureRegistry()) {
    return NextResponse.json({ error: 'LLM registry boot failed' }, { status: 503 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('renovation_clusters')
    .select('slug, primary_kw, content_jsonb')
    .not('content_jsonb', 'is', null)
    .is('critic_passed_at', null)
    .order('updated_at', { ascending: true })
    .limit(BATCH_LIMIT)

  if (error) {
    logger.error('cron.cluster-critic.query_failed', { error: error.message })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as Array<{
    slug: string
    primary_kw: string
    content_jsonb: ClusterContent
  }>

  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      approved: 0,
      revised: 0,
      blocked: 0,
      errors: 0,
      batchLimit: BATCH_LIMIT,
    })
  }

  let approved = 0
  let revised = 0
  let blocked = 0
  let errors = 0

  for (const row of rows) {
    const traceId = `cron-critic-${Date.now()}-${row.slug}`
    try {
      const result = await runClusterCritic({
        slug: row.slug,
        content: row.content_jsonb,
        primaryKw: row.primary_kw,
        traceId,
        agentName: 'cron-cluster-critic',
      })
      if (result.verdict.decision === 'approve') approved += 1
      else if (result.verdict.decision === 'revise') revised += 1
      else blocked += 1
    } catch (err) {
      errors += 1
      logger.error('cron.cluster-critic.row_failed', {
        slug: row.slug,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const processed = rows.length
  logger.info('cron.cluster-critic.batch_done', {
    processed,
    approved,
    revised,
    blocked,
    errors,
  })
  return NextResponse.json({
    ok: true,
    processed,
    approved,
    revised,
    blocked,
    errors,
    batchLimit: BATCH_LIMIT,
  })
})
