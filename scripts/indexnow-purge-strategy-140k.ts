/**
 * IndexNow purge — stratégie 140K (vagues V1 + V2 + V2 #7).
 *
 * Pinge IndexNow (Bing, Yandex, Seznam, Naver) avec toutes les URLs qui ont
 * changé/disparu par la stratégie de réduction sitemap 718K → ~215K :
 *
 *   V1 #1 : /tarifs/[s]/[v]/[task]            DELETE 410     ~184 500 URLs
 *   V1 #2 : /devis/[s]/[v]                    301 → /services ~104 282 URLs
 *   V1 #3 : /tarifs/[s]/[v]                   301 → /services ~104 282 URLs
 *   V2 #4 : /urgence/[s]/[v] hors whitelist   301 → /services ~106 449 URLs
 *   V2 #7 : /problemes/[p]/[v] hors whitelist 301 → /services  ~23 500 URLs
 *                                              TOTAL          ~522 700 URLs
 *
 * Pourquoi pinger malgré 410/301 transparents ?
 *   - Bing crawle ~5× plus lentement que Google sur sites mid-DR (DR 0.6) →
 *     sans IndexNow, la propagation 301/410 prend 60-90 jours.
 *   - IndexNow déclenche un re-crawl Bing en 24-48h → consolidation canonique
 *     ~10× plus rapide. Yandex aussi.
 *   - Google n'écoute pas IndexNow, mais le crawl budget Bing libéré
 *     améliore les signaux globaux de fraîcheur (lastmod cohérent).
 *
 * Budget rate-limit IndexNow (best practice 2026) :
 *   - Bing tolère ~10K URLs/batch, ~1 batch/min, mais throttle au-delà de
 *     ~50K URLs/jour pour un site mid-DR. On ship donc en 5 shards × 10K
 *     × 1 jour entre chaque = 5 jours d'étalement.
 *
 * Idempotent : IndexNow accepte les soumissions répétées.
 *
 * Usage :
 *   npx tsx scripts/indexnow-purge-strategy-140k.ts                    # dry-run, count par bloc
 *   npx tsx scripts/indexnow-purge-strategy-140k.ts --shard 0          # submit shard 0 (top priority)
 *   npx tsx scripts/indexnow-purge-strategy-140k.ts --shard 0 --max 5000  # cap pour tester
 *   npx tsx scripts/indexnow-purge-strategy-140k.ts --all              # submit TOUS les shards (lourd)
 *
 * Shards (priorité décroissante) :
 *   0 = /devis  (301, signal canonical fort, top 500 villes × 47 svc = 23 500)
 *   1 = /tarifs (301, signal canonical fort, top 500 villes × 47 svc = 23 500)
 *   2 = /urgence hors whitelist (301, top 200 villes × 47 svc = 9 400)
 *   3 = /problemes hors whitelist (301, top 200 villes × 30 prob = 6 000)
 *   4 = /tarifs/[s]/[v]/[task] (410 sample top 100 villes × 47 svc × 5 task = 23 500)
 */
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { villes, services } from '../src/lib/data/france'
import { isUrgenceIndexable } from '../src/lib/seo/urgence-whitelist'
import { isProblemeIndexable } from '../src/lib/seo/problemes-whitelist'
import problems from '../src/lib/data/problems'

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const INDEXNOW_BATCH_SIZE = 10_000
const SLEEP_BETWEEN_BATCHES_MS = 60_000 // 1 min — anti-throttle Bing
const TOP_TARIFS_TASKS = ['installation', 'reparation', 'depannage', 'renovation', 'entretien']

type ShardId = 0 | 1 | 2 | 3 | 4
type Shard = {
  id: ShardId
  name: string
  build: () => string[]
  reason: '301' | '410'
}

function buildDevisUrls(): string[] {
  const top500 = villes.slice(0, 500)
  return services.flatMap((s) => top500.map((v) => `/devis/${s.slug}/${v.slug}`))
}

function buildTarifsUrls(): string[] {
  const top500 = villes.slice(0, 500)
  return services.flatMap((s) => top500.map((v) => `/tarifs/${s.slug}/${v.slug}`))
}

function buildUrgenceUrls(): string[] {
  const top200 = villes.slice(0, 200)
  const urls: string[] = []
  for (const s of services) {
    for (const v of top200) {
      if (!isUrgenceIndexable(s.slug, v.slug)) {
        urls.push(`/urgence/${s.slug}/${v.slug}`)
      }
    }
  }
  return urls
}

function buildProblemesUrls(): string[] {
  const top200 = villes.slice(0, 200)
  const urls: string[] = []
  for (const p of problems) {
    for (const v of top200) {
      if (!isProblemeIndexable(p.slug, v.slug)) {
        urls.push(`/problemes/${p.slug}/${v.slug}`)
      }
    }
  }
  return urls
}

function buildTarifsTaskUrls(): string[] {
  const top100 = villes.slice(0, 100)
  return services.flatMap((s) =>
    top100.flatMap((v) => TOP_TARIFS_TASKS.map((task) => `/tarifs/${s.slug}/${v.slug}/${task}`))
  )
}

const SHARDS: Shard[] = [
  { id: 0, name: 'devis-301', build: buildDevisUrls, reason: '301' },
  { id: 1, name: 'tarifs-301', build: buildTarifsUrls, reason: '301' },
  { id: 2, name: 'urgence-non-whitelist-301', build: buildUrgenceUrls, reason: '301' },
  { id: 3, name: 'problemes-non-whitelist-301', build: buildProblemesUrls, reason: '301' },
  { id: 4, name: 'tarifs-task-410', build: buildTarifsTaskUrls, reason: '410' },
]

async function submitBatch(
  key: string,
  urls: string[],
  batchIndex: number
): Promise<{ status: number; ok: boolean }> {
  const absolute = urls.map((u) => `${SITE_URL}${u}`)
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: absolute,
    }),
  })
  return { status: res.status, ok: res.ok || res.status === 202 }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function processShard(shard: Shard, max: number | null, dryRun: boolean, key: string) {
  console.log(`\n=== Shard ${shard.id} — ${shard.name} (${shard.reason}) ===`)
  const all = shard.build()
  const slice = max ? all.slice(0, max) : all
  console.log(`  URLs générées : ${all.length}`)
  if (max && max < all.length) {
    console.log(`  Cap --max=${max} appliqué : submit ${slice.length} URLs`)
  }
  if (dryRun) {
    console.log(`  [DRY-RUN] Pas de submit. Sample 3 URLs :`)
    slice.slice(0, 3).forEach((u) => console.log(`    - ${u}`))
    return
  }

  const totalBatches = Math.ceil(slice.length / INDEXNOW_BATCH_SIZE)
  let submitted = 0
  for (let i = 0; i < slice.length; i += INDEXNOW_BATCH_SIZE) {
    const batchIndex = Math.floor(i / INDEXNOW_BATCH_SIZE)
    const batch = slice.slice(i, i + INDEXNOW_BATCH_SIZE)
    const t0 = Date.now()
    const result = await submitBatch(key, batch, batchIndex)
    const dt = Date.now() - t0
    console.log(
      `  Batch ${batchIndex + 1}/${totalBatches} — ${batch.length} URLs — ${result.status} ${result.ok ? 'OK' : 'FAIL'} (${dt}ms)`
    )
    if (result.ok) submitted += batch.length
    if (i + INDEXNOW_BATCH_SIZE < slice.length) {
      console.log(`  Sleep ${SLEEP_BETWEEN_BATCHES_MS / 1000}s avant batch suivant…`)
      await sleep(SLEEP_BETWEEN_BATCHES_MS)
    }
  }
  console.log(`  ✅ Submitted ${submitted}/${slice.length}`)
}

async function main() {
  const args = process.argv.slice(2)
  const shardArg =
    args.find((a) => a.startsWith('--shard='))?.split('=')[1] ?? args[args.indexOf('--shard') + 1]
  const maxArg =
    args.find((a) => a.startsWith('--max='))?.split('=')[1] ?? args[args.indexOf('--max') + 1]
  const all = args.includes('--all')
  const dryRun = !all && shardArg === undefined

  console.log('=== IndexNow purge — stratégie 140K ===')
  console.log(`Mode : ${dryRun ? 'DRY-RUN' : 'LIVE SUBMIT'}`)
  console.log(`Site : ${SITE_URL}`)

  const key = process.env.INDEXNOW_API_KEY
  if (!dryRun && !key) {
    console.error('\nERROR: INDEXNOW_API_KEY missing from .env.local')
    process.exit(1)
  }

  if (dryRun) {
    let total = 0
    for (const shard of SHARDS) {
      const urls = shard.build()
      total += urls.length
      console.log(`  Shard ${shard.id} (${shard.name}, ${shard.reason}) : ${urls.length} URLs`)
    }
    console.log(`\nTOTAL : ${total} URLs (${Math.ceil(total / INDEXNOW_BATCH_SIZE)} batches)`)
    console.log(
      `\nÉtalement recommandé : 1 shard / jour pour rester sous le throttle Bing (~50K/j).`
    )
    console.log('Lancer : npx tsx scripts/indexnow-purge-strategy-140k.ts --shard 0')
    return
  }

  const max = maxArg ? parseInt(maxArg, 10) : null
  if (all) {
    for (const shard of SHARDS) {
      await processShard(shard, max, false, key!)
    }
  } else {
    const shardId = parseInt(shardArg!, 10) as ShardId
    const shard = SHARDS.find((s) => s.id === shardId)
    if (!shard) {
      console.error(`Shard inconnu : ${shardArg}. Disponibles : 0..4`)
      process.exit(1)
    }
    await processShard(shard, max, false, key!)
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
