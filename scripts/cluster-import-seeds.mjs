#!/usr/bin/env node
/**
 * cluster-import-seeds — upsert ALL_SEEDS dans renovation_clusters (mig 524).
 *
 * Usage :
 *   node scripts/cluster-import-seeds.mjs [--dry-run]
 *
 * Idempotent : ON CONFLICT (slug) DO UPDATE sur primary_kw, volume_monthly,
 * kd_ahrefs, cpc_eur, ahrefs_source_date, updated_at uniquement. Ne touche
 * pas content_jsonb / critic_passed_at / published_at / noindex (deja en DB).
 *
 * Env requis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')

const seedsModulePath = path.join(__dirname, '..', 'src', 'lib', 'clusters', 'taxonomy.ts')
const { tsImport } = await import('tsx/esm/api')
const taxonomy = await tsImport(seedsModulePath, import.meta.url)
const { ALL_SEEDS } = taxonomy

console.log(`Loaded ${ALL_SEEDS.length} seeds from taxonomy`)

if (DRY_RUN) {
  for (const s of ALL_SEEDS) {
    console.log(
      `  ${s.clusterType.padEnd(10)} ${s.slug.padEnd(36)} vol=${String(s.volumeMonthly).padStart(7)} kd=${String(s.kdAhrefs).padStart(4)}`,
    )
  }
  console.log('--- DRY RUN: no DB writes ---')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rows = ALL_SEEDS.map((s) => ({
  slug: s.slug,
  parent_cluster_slug: s.parentClusterSlug,
  cluster_type: s.clusterType,
  service_slug: s.serviceSlug,
  primary_kw: s.primaryKw,
  volume_monthly: s.volumeMonthly,
  kd_ahrefs: s.kdAhrefs,
  cpc_eur: s.cpcEur,
  ahrefs_source_date: s.ahrefsSourceDate,
  updated_at: new Date().toISOString(),
}))

const { error } = await supabase
  .from('renovation_clusters')
  .upsert(rows, {
    onConflict: 'slug',
    ignoreDuplicates: false,
  })

if (error) {
  console.error('Upsert failed:', error.message)
  process.exit(1)
}

const { count } = await supabase
  .from('renovation_clusters')
  .select('*', { count: 'exact', head: true })

console.log(`OK. renovation_clusters now has ${count} rows.`)
