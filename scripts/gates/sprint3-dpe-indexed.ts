/**
 * Gate Sprint 3 — DPE pages indexables (status 200 + pas de noindex).
 *
 * Vérifie 8 URLs : hub `/dpe` + 7 classes A→G. Pour chaque URL :
 *   1. HEAD/GET avec User-Agent Googlebot mobile (parité crawl Google)
 *   2. status === 200
 *   3. HTML ne contient PAS de `<meta name="robots" content="noindex">`
 *      ou `<meta name="googlebot" content="noindex">`
 *
 * Cible : 8/8 indexables. Soft 404 (200 + noindex) = FAIL — c'est le bug que
 * la migration noindex RGE-only de 2026-04-19 a introduit ailleurs (cf.
 * memory `servicesartisans-noindex-rge-migration-2026-04-19.md`).
 *
 * Variables d'env :
 *   DPE_BASE_URL  base URL à tester (défaut https://servicesartisans.fr)
 *
 * Sortie : tmp/gate-s3-{ISO}.json
 *
 * Usage :
 *   npx tsx scripts/gates/sprint3-dpe-indexed.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')
const BASE_URL = process.env.DPE_BASE_URL ?? 'https://servicesartisans.fr'

const GOOGLEBOT_UA =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; ' +
  '+http://www.google.com/bot.html)'

const DPE_PATHS: readonly string[] = [
  '/renovation-energetique/dpe',
  '/renovation-energetique/dpe/classe-a',
  '/renovation-energetique/dpe/classe-b',
  '/renovation-energetique/dpe/classe-c',
  '/renovation-energetique/dpe/classe-d',
  '/renovation-energetique/dpe/classe-e',
  '/renovation-energetique/dpe/classe-f',
  '/renovation-energetique/dpe/classe-g',
]

const NOINDEX_RE =
  /<meta[^>]+name=["'](?:robots|googlebot)["'][^>]+content=["'][^"']*noindex[^"']*["']/i

type UrlCheck = {
  url: string
  status: number
  hasNoindex: boolean
  indexable: boolean
  error?: string
}

type GateResult = {
  gate: 'S3'
  metric: 'dpe_pages_indexable'
  current: number
  baseline: number
  delta_pct: number
  target_pct: number
  passed: boolean
  checked_at: string
  notes: string
  details: UrlCheck[]
}

async function checkUrl(url: string): Promise<UrlCheck> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': GOOGLEBOT_UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(15000),
      redirect: 'manual',
    })
    const status = res.status
    if (status !== 200) {
      return { url, status, hasNoindex: false, indexable: false }
    }
    const html = await res.text()
    const hasNoindex = NOINDEX_RE.test(html)
    return { url, status, hasNoindex, indexable: !hasNoindex }
  } catch (err) {
    return {
      url,
      status: 0,
      hasNoindex: false,
      indexable: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  const checks = await Promise.all(DPE_PATHS.map((p) => checkUrl(`${BASE_URL}${p}`)))
  const indexed = checks.filter((c) => c.indexable).length
  const total = DPE_PATHS.length

  const result: GateResult = {
    gate: 'S3',
    metric: 'dpe_pages_indexable',
    current: indexed,
    baseline: total,
    delta_pct: total > 0 ? (indexed / total) * 100 : 0,
    target_pct: 100,
    passed: indexed === total,
    checked_at: new Date().toISOString(),
    notes: `User-Agent Googlebot mobile. Vérif status=200 + absence meta robots noindex.`,
    details: checks,
  }

  const outPath = path.join(TMP_DIR, `gate-s3-${result.checked_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2))
  // eslint-disable-next-line no-console
  console.log(
    `\nGate S3 ${result.passed ? 'PASS' : 'FAIL'} — ${indexed}/${total} indexables. ` +
      `Résultat dans ${outPath}`
  )

  if (!result.passed) process.exit(1)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[gate-s3] FATAL :', err)
  process.exit(2)
})
