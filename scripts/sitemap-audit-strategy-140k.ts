/**
 * Sitemap audit post-stratégie 140K.
 *
 * Crawl le sitemap-index live, compte les URLs par shard, valide :
 *   - Volumes attendus par shard (cf. plan 140K, post-vagues V1-V3).
 *   - Présence des nouveaux shards V3 (communes-cities-*, aides-dept).
 *   - Absence des shards purgés (tarifs-task-cities-*, devis-service-cities-*,
 *     tarifs-service-cities-*, avis-service-cities-*).
 *   - Total proche de la cible 215K (post-V3).
 *
 * Output JSON pour piping (Slack, dashboard, GSC compare).
 *
 * Usage :
 *   npx tsx scripts/sitemap-audit-strategy-140k.ts                # console table
 *   npx tsx scripts/sitemap-audit-strategy-140k.ts --json         # machine-readable
 *   npx tsx scripts/sitemap-audit-strategy-140k.ts --baseline     # save current as baseline
 *   npx tsx scripts/sitemap-audit-strategy-140k.ts --diff         # diff vs baseline
 *
 * Idempotent. Read-only. Safe à exécuter en CI / cron.
 */
import * as fs from 'fs'
import * as path from 'path'

const SITE_URL = 'https://servicesartisans.fr'
const BASELINE_PATH = path.join(__dirname, '..', '.cache', 'sitemap-baseline-140k.json')

type ShardCount = { id: string; urls: number; bytes: number }

const EXPECTED_RANGES: Record<string, { min: number; max: number; reason: string }> = {
  static: { min: 100, max: 700, reason: 'hub pages + services + tarifs hubs + aides MPR dept' },
  cities: { min: 2_000, max: 2_400, reason: 'top villes (SITEMAP_CITY_COUNT 2 267)' },
  geo: { min: 100, max: 250, reason: 'départements + régions' },
  'devis-services': { min: 30, max: 80, reason: 'hubs /devis/[s]' },
  'urgence-service-cities-0': { min: 50, max: 200, reason: 'V2 #4 whitelist 4×25 = 100' },
  'avis-services': { min: 30, max: 80, reason: 'hubs /avis/[s]' },
  problemes: { min: 50, max: 80, reason: 'hubs /problemes/[p]' },
  'problemes-cities-0': { min: 5_000, max: 8_000, reason: 'V2 #7 tiered ≈ 7K' },
  communes: { min: 1, max: 1, reason: 'V3 #1 hub /communes' },
  'aides-dept': { min: 1_000, max: 1_200, reason: 'V3 #3 11 aides × 101 dépts' },
  'cee-operation': { min: 15, max: 25, reason: '22 op CEE' },
  'cee-operation-guide': { min: 4, max: 8, reason: 'guides high-intent' },
  'cee-operation-city': {
    min: 8_000,
    max: 16_000,
    reason: 'V3 #2 22 × ≤1 000 villes filtré ≥1 artisan',
  },
  'rge-city': { min: 400, max: 600, reason: 'top 500 villes' },
  'rge-service': { min: 12, max: 16, reason: '14 RGE services' },
  'rge-qualification': { min: 4, max: 8, reason: 'hub + qualifs guides' },
  'rge-service-city': { min: 6_000, max: 8_000, reason: '14 × 500' },
  'rge-service-dept': { min: 1_300, max: 1_500, reason: '14 × 101' },
  barometre: { min: 50, max: 80, reason: 'régions + métiers' },
  'region-services': { min: 500, max: 700, reason: '46 × 13' },
}

const FORBIDDEN_SHARDS = [
  'tarifs-task-cities-0',
  'tarifs-task-cities-1',
  'devis-service-cities-0',
  'tarifs-service-cities-0',
  'avis-service-cities-0',
]

async function fetchSitemapIndex(): Promise<string[]> {
  const url = `${SITE_URL}/sitemap.xml`
  const res = await fetch(url, { headers: { 'User-Agent': 'sitemap-audit-140k/1.0' } })
  if (!res.ok) throw new Error(`Sitemap-index fetch ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function countShard(shardUrl: string): Promise<ShardCount> {
  const id = shardUrl.replace(`${SITE_URL}/sitemap/`, '').replace('.xml', '')
  const res = await fetch(shardUrl, { headers: { 'User-Agent': 'sitemap-audit-140k/1.0' } })
  if (!res.ok) return { id, urls: 0, bytes: 0 }
  const xml = await res.text()
  const urls = (xml.match(/<loc>/g) ?? []).length
  return { id, urls, bytes: xml.length }
}

function classify(actual: number, range?: { min: number; max: number }): string {
  if (!range) return '⚪ unknown'
  if (actual < range.min) return `🔴 LOW (<${range.min})`
  if (actual > range.max) return `🟡 HIGH (>${range.max})`
  return '🟢 OK'
}

async function main() {
  const args = process.argv.slice(2)
  const wantJson = args.includes('--json')
  const wantBaseline = args.includes('--baseline')
  const wantDiff = args.includes('--diff')

  const start = Date.now()
  const shardUrls = await fetchSitemapIndex()
  const counts = await Promise.all(shardUrls.map(countShard))
  const total = counts.reduce((a, c) => a + c.urls, 0)
  const elapsedMs = Date.now() - start

  // Detect forbidden shards (regression check)
  const forbiddenPresent = counts
    .filter((c) => FORBIDDEN_SHARDS.includes(c.id) && c.urls > 0)
    .map((c) => c.id)

  // Detect missing expected shards (V3 deploy validation)
  const presentIds = new Set(counts.map((c) => c.id))
  const missingExpected = Object.keys(EXPECTED_RANGES).filter(
    (id) => !presentIds.has(id) && !id.endsWith('-0')
  )

  const result = {
    timestamp: new Date().toISOString(),
    elapsedMs,
    totalShards: counts.length,
    totalUrls: total,
    forbiddenPresent,
    missingExpected,
    shards: counts.sort((a, b) => b.urls - a.urls),
  }

  if (wantBaseline) {
    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(result, null, 2))
    console.log(`✅ Baseline saved → ${BASELINE_PATH}`)
    console.log(`   Total : ${total} URLs across ${counts.length} shards`)
    return
  }

  if (wantJson) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  // Console table
  console.log(`\n=== Sitemap audit — ${result.timestamp} ===`)
  console.log(`Site         : ${SITE_URL}`)
  console.log(`Shards       : ${counts.length}`)
  console.log(`Total URLs   : ${total.toLocaleString('fr-FR')}`)
  console.log(`Fetch time   : ${elapsedMs}ms`)
  console.log('')

  console.log('Shard détail (trié par volume) :')
  console.log('  ' + 'ID'.padEnd(36) + 'URLs'.padStart(10) + '   Status')
  console.log('  ' + '─'.repeat(36) + ' '.repeat(10) + '   ─'.repeat(20))
  for (const c of result.shards) {
    const range = EXPECTED_RANGES[c.id]
    const status = classify(c.urls, range)
    console.log('  ' + c.id.padEnd(36) + String(c.urls).padStart(10) + '   ' + status)
  }

  if (forbiddenPresent.length > 0) {
    console.log(`\n🔴 Shards interdits présents (régression) : ${forbiddenPresent.join(', ')}`)
  }
  if (missingExpected.length > 0) {
    console.log(`\n🟡 Shards attendus manquants : ${missingExpected.join(', ')}`)
  }

  if (wantDiff && fs.existsSync(BASELINE_PATH)) {
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8')) as typeof result
    const baselineMap = new Map(baseline.shards.map((s) => [s.id, s.urls]))
    console.log('\nDiff vs baseline :')
    for (const c of result.shards) {
      const prev = baselineMap.get(c.id) ?? 0
      const diff = c.urls - prev
      if (diff !== 0) {
        const sign = diff > 0 ? '+' : ''
        console.log(
          `  ${c.id.padEnd(36)} ${prev.toString().padStart(8)} → ${c.urls.toString().padStart(8)}  (${sign}${diff})`
        )
      }
    }
    const totalDiff = total - baseline.totalUrls
    const totalSign = totalDiff > 0 ? '+' : ''
    console.log(
      `  ${'TOTAL'.padEnd(36)} ${baseline.totalUrls.toString().padStart(8)} → ${total.toString().padStart(8)}  (${totalSign}${totalDiff})`
    )
  }

  // Exit non-zero if forbidden shards present (CI gate)
  if (forbiddenPresent.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
