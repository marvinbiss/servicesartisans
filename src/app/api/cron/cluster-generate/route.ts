/**
 * Cron : cluster-generate
 * ----------------------------------------------------------------------------
 * Schedule recommandé : `0 *\/6 * * *` (4 runs/jour, batch 50 = 200/jour total).
 * Selectionne les seeds dans `renovation_clusters` sans `content_jsonb`,
 * appelle `generateClusterContent` avec ground-truth injecté, persiste le
 * draft (content_jsonb + updated_at). Critic gate s'execute dans un cron
 * séparé `cluster-critic` (idempotent, sépare LLM bulk vs LLM YMYL).
 *
 * Anti-pattern évités :
 *   - PAS de Critic ici (cost split : bulk_seo génération != YMYL Opus)
 *   - PAS de publication ici (gate sur critic_passed_at)
 *   - PAS de batch > 50 (Anthropic Tier 1 RPM cap, voir memory tier1-limits)
 *
 * Auth : Bearer CRON_SECRET (timing-safe via verifyCronSecret).
 */

import { NextResponse } from 'next/server'

import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { createAdminClient } from '@/lib/supabase/admin'
import { initLLMRegistryFromEnv } from '@/lib/llm/registry-init'
import {
  assembleGroundTruth,
  generateClusterContent,
  type GenerateClusterInput,
} from '@/lib/clusters'
import type { ClusterSeed } from '@/lib/clusters'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const BATCH_LIMIT = 50
const DEFAULT_AUTHOR_NAME = 'Rédaction ServicesArtisans'
const DEFAULT_AUTHOR_ROLE = 'Conseil en rénovation énergétique'

// SLA-99.9 : cap dur par run (alias explicite de BATCH_LIMIT) + wall-clock guard
// (maxDuration 300 → marge 10s) + lease anti-double-run.
const MAX_CLUSTERS_PER_RUN = BATCH_LIMIT
const MAX_RUNTIME_MS = 290_000
const LEASE_NAME = 'cron_cluster_generate'
const LEASE_TTL_SECONDS = 15 * 60

let registryBooted = false
function ensureRegistry(): boolean {
  if (registryBooted) return true
  try {
    initLLMRegistryFromEnv()
    registryBooted = true
    return true
  } catch (err) {
    logger.error('cron.cluster-generate.registry_boot_failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return false
  }
}

type ClusterRowForGenerate = {
  slug: string
  parent_cluster_slug: string | null
  cluster_type: 'pillar' | 'cluster' | 'long-tail'
  service_slug: string | null
  primary_kw: string
  volume_monthly: number | null
  kd_ahrefs: number | null
  cpc_eur: number | null
  ahrefs_source_date: string
}

function rowToSeed(row: ClusterRowForGenerate): ClusterSeed {
  return {
    slug: row.slug,
    parentClusterSlug: row.parent_cluster_slug,
    clusterType: row.cluster_type,
    serviceSlug: row.service_slug,
    primaryKw: row.primary_kw,
    volumeMonthly: row.volume_monthly ?? 0,
    kdAhrefs: row.kd_ahrefs ?? 0,
    cpcEur: row.cpc_eur ?? 0,
    ahrefsSourceDate: row.ahrefs_source_date,
  }
}

export const GET = withCronCheckIn('cron-cluster-generate', async (request: Request) => {
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
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const leaseResult = await admin
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = leaseResult.data as boolean | null
    leaseErr = leaseResult.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('cron.cluster-generate.lease_error', {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('cron.cluster-generate.skipped', { lease: LEASE_NAME })
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  try {
    const { data, error } = await admin
      .from('renovation_clusters')
      .select(
        'slug, parent_cluster_slug, cluster_type, service_slug, primary_kw, volume_monthly, kd_ahrefs, cpc_eur, ahrefs_source_date'
      )
      .is('content_jsonb', null)
      .order('volume_monthly', { ascending: false, nullsFirst: false })
      .limit(MAX_CLUSTERS_PER_RUN)

    if (error) {
      logger.error('cron.cluster-generate.query_failed', { error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as ClusterRowForGenerate[]
    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        errors: 0,
        batchLimit: MAX_CLUSTERS_PER_RUN,
      })
    }

    const freshness = new Date().toISOString().slice(0, 10)
    let processed = 0
    let errors = 0
    for (const row of rows) {
      // SLA-99.9 : wall-clock guard (1 génération LLM = plusieurs secondes).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      const seed = rowToSeed(row)
      try {
        const groundTruth = await assembleGroundTruth(seed.serviceSlug, freshness)
        const input: GenerateClusterInput = {
          seed,
          groundTruth,
          authorName: DEFAULT_AUTHOR_NAME,
          authorRole: DEFAULT_AUTHOR_ROLE,
        }
        const draft = await generateClusterContent(input)
        const { error: upErr } = await admin
          .from('renovation_clusters')
          .update({
            content_jsonb: draft.contentJsonb,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', seed.slug)
        if (upErr) throw new Error(upErr.message)
        processed += 1
      } catch (err) {
        errors += 1
        logger.error('cron.cluster-generate.row_failed', {
          slug: seed.slug,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    logger.info('cron.cluster-generate.batch_done', {
      processed,
      errors,
      batchLimit: MAX_CLUSTERS_PER_RUN,
    })
    return NextResponse.json({ ok: true, processed, errors, batchLimit: MAX_CLUSTERS_PER_RUN })
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await admin.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
