#!/usr/bin/env node
/**
 * cluster-pipeline-run — déclenche manuellement les 3 crons cluster-*.
 *
 * Usage :
 *   node scripts/cluster-pipeline-run.mjs <stage>
 *
 * Stages : `generate` | `critic` | `publish` | `all`
 *
 * Env requis :
 *   - SA_BASE_URL (ex https://servicesartisans.fr ou http://localhost:3000)
 *   - CRON_SECRET (Bearer)
 *
 * `all` enchaine les 3 dans l'ordre avec sleep 5s entre étapes (laisse le
 * temps aux ISR purges / DB writes de stabiliser).
 */

import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') })

const baseUrl = process.env.SA_BASE_URL ?? 'http://localhost:3000'
const cronSecret = process.env.CRON_SECRET

if (!cronSecret) {
  console.error('Missing CRON_SECRET in env')
  process.exit(1)
}

const STAGES = ['generate', 'critic', 'publish']
const arg = process.argv[2]
const stages = arg === 'all' || !arg ? STAGES : [arg]

for (const stage of stages) {
  if (!STAGES.includes(stage)) {
    console.error(`Unknown stage: ${stage}. Use generate / critic / publish / all.`)
    process.exit(1)
  }
}

for (const stage of stages) {
  const url = `${baseUrl}/api/cron/cluster-${stage}`
  console.log(`→ ${url}`)
  const t0 = Date.now()
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${cronSecret}` },
  })
  const body = await res.json().catch(() => ({ raw: 'non-json' }))
  const dt = Date.now() - t0
  console.log(`  ${res.status} (${dt}ms) ${JSON.stringify(body)}`)
  if (!res.ok) {
    console.error(`Stage ${stage} failed`)
    process.exit(1)
  }
  if (stages.length > 1) await sleep(5000)
}

console.log('OK.')
