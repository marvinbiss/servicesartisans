/**
 * Chantier #C (2026-05-03) — SA lost keywords recovery analysis.
 *
 * L'audit Phase 0 (`sa_lost_keywords_2026-05.csv`) est vide et les diff JSON
 * (`sa_kw_diff*.json`) ont échoué côté API (mauvais select). Pull live via
 * Ahrefs `site-explorer/organic-keywords` avec filter `status=left` (= KW
 * présents dans `date_compared` mais absents dans `date` = perdus).
 *
 * Filter rules :
 *   - status='left' (lost)
 *   - dans la période date_compared → date (~30 jours)
 *   - exclure brand keywords (servicesartisans, marvin, etc.)
 *   - identifier les URLs concernées pour priorisation actions
 *
 * Outputs in `docs/audit-ahrefs-2026-05-03/E_site/` :
 *   1. sa_lost_keywords_LIVE.csv — top 100 KW perdus avec recommandation action
 *   2. sa_lost_keywords_by_url.csv — agrégé par URL impactée
 */
import * as fs from 'fs'
import * as path from 'path'

const AUDIT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03')
const OUT_DIR = path.join(AUDIT_DIR, 'E_site')

const TOKEN_FILE = process.env.AHREFS_TOKEN_FILE ?? '/c/Users/USER/.secrets/ahrefs.env'
const TARGET = 'servicesartisans.fr'
const COUNTRY = 'fr'
// Period of analysis : last 30 days (date_compared = 30 days ago)
const DATE_NOW = '2026-05-03'
const DATE_PREV = '2026-04-03'

const EXCLUDE_BRAND_RE = /\b(servicesartisans|marvin|bissohong)\b/i

type LiveKw = {
  keyword: string | null
  status: string | null
  volume: number | null
  best_position: number | null
  sum_traffic: number | null
  best_position_url: string | null
  keyword_difficulty: number | null
  cpc: number | null
}

function readToken(): string {
  // Try Windows path first (cygwin /c/Users/...) then native C:\
  const candidates = [
    TOKEN_FILE,
    'C:\\Users\\USER\\.secrets\\ahrefs.env',
    path.join(process.env.USERPROFILE ?? '', '.secrets', 'ahrefs.env'),
  ]
  for (const f of candidates) {
    try {
      const t = fs.readFileSync(f, 'utf8').trim()
      if (t) return t
    } catch {
      /* try next */
    }
  }
  throw new Error(`Cannot read Ahrefs token from any candidate: ${candidates.join(', ')}`)
}

async function fetchLost(): Promise<LiveKw[]> {
  const token = readToken()
  const params = new URLSearchParams({
    target: TARGET,
    mode: 'domain',
    country: COUNTRY,
    date: DATE_NOW,
    date_compared: DATE_PREV,
    select:
      'keyword,status,volume,best_position,sum_traffic,best_position_url,keyword_difficulty,cpc',
    where: JSON.stringify({ and: [{ field: 'status', is: ['eq', 'left'] }] }),
    order_by: 'sum_traffic:desc',
    limit: '500',
  })
  const url = `https://api.ahrefs.com/v3/site-explorer/organic-keywords?${params.toString()}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Ahrefs ${res.status} : ${await res.text()}`)
  const json = (await res.json()) as { keywords?: LiveKw[] }
  return json.keywords ?? []
}

function categorize(kw: LiveKw): 'P0_high_value' | 'P1_quickwin' | 'P2_long_tail' {
  const vol = kw.volume ?? 0
  const traf = kw.sum_traffic ?? 0
  const pos = kw.best_position ?? 0
  // P0 : vol >= 1000 (volume réel) AND ranked top 30 (récupérable)
  if (vol >= 1000 && pos > 0 && pos <= 30) return 'P0_high_value'
  // P1 : vol >= 200 AND pos top 20
  if (vol >= 200 && pos > 0 && pos <= 20) return 'P1_quickwin'
  return 'P2_long_tail'
}

function recommendAction(kw: LiveKw): string {
  const url = kw.best_position_url ?? ''
  const pos = kw.best_position ?? 0
  if (!url) return 'no_url_lost — investigate via GSC'
  if (pos > 0 && pos <= 10) return 'minor_serp_drop — recheck content + indexnow ping'
  if (pos > 10 && pos <= 30) return 'moderate_drop — refresh content + internal links + indexnow'
  if (pos > 30 && pos <= 50) return 'major_drop — likely content quality or thin page issue'
  return 'unranked_now — page possibly deleted or 404 ; check route alive + redirect'
}

function escapeCsv(v: string | number | null): string {
  if (v === null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

async function main() {
  console.log(`Pulling lost keywords ${DATE_PREV} → ${DATE_NOW} for ${TARGET}...`)
  const all = await fetchLost()
  console.log(`Total raw lost (status=left) : ${all.length}`)

  const filtered = all.filter(
    (k) => k.keyword && !EXCLUDE_BRAND_RE.test(k.keyword) && (k.volume ?? 0) >= 50
  )
  console.log(`After filter (non-brand + vol>=50) : ${filtered.length}`)

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  // Output 1 : lost keywords detailed
  const headers = [
    'rank',
    'priority',
    'keyword',
    'volume',
    'best_position',
    'sum_traffic',
    'keyword_difficulty',
    'cpc_eur',
    'best_position_url',
    'recommended_action',
  ]
  const lines = [headers.join(',')]
  filtered.forEach((k, i) => {
    lines.push(
      [
        String(i + 1),
        categorize(k),
        k.keyword ?? '',
        String(k.volume ?? 0),
        String(k.best_position ?? 0),
        String(k.sum_traffic ?? 0),
        String(k.keyword_difficulty ?? 0),
        String(k.cpc ?? 0),
        k.best_position_url ?? '',
        recommendAction(k),
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(path.join(OUT_DIR, 'sa_lost_keywords_LIVE.csv'), lines.join('\n') + '\n', 'utf8')
  console.log(`✅ Wrote ${path.join(OUT_DIR, 'sa_lost_keywords_LIVE.csv')}`)

  // Output 2 : agrégé par URL
  type UrlAgg = {
    url: string
    nKw: number
    totalLostTraffic: number
    sumVolumeLost: number
    topKw: string
    topKwVolume: number
  }
  const urlMap = new Map<string, UrlAgg>()
  for (const k of filtered) {
    const url = k.best_position_url || '(unknown)'
    const prev = urlMap.get(url)
    const vol = k.volume ?? 0
    const traf = k.sum_traffic ?? 0
    if (prev) {
      prev.nKw++
      prev.totalLostTraffic += traf
      prev.sumVolumeLost += vol
      if (vol > prev.topKwVolume) {
        prev.topKw = k.keyword ?? ''
        prev.topKwVolume = vol
      }
    } else {
      urlMap.set(url, {
        url,
        nKw: 1,
        totalLostTraffic: traf,
        sumVolumeLost: vol,
        topKw: k.keyword ?? '',
        topKwVolume: vol,
      })
    }
  }
  const urlHeaders = [
    'rank',
    'url',
    'nKw',
    'totalLostTraffic',
    'sumVolumeLost',
    'topKw',
    'topKwVolume',
  ]
  const urlLines = [urlHeaders.join(',')]
  Array.from(urlMap.values())
    .sort((a, b) => b.sumVolumeLost - a.sumVolumeLost)
    .slice(0, 50)
    .forEach((u, i) => {
      urlLines.push(
        [
          String(i + 1),
          u.url,
          String(u.nKw),
          String(u.totalLostTraffic),
          String(u.sumVolumeLost),
          u.topKw,
          String(u.topKwVolume),
        ]
          .map(escapeCsv)
          .join(',')
      )
    })
  fs.writeFileSync(
    path.join(OUT_DIR, 'sa_lost_keywords_by_url.csv'),
    urlLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`✅ Wrote ${path.join(OUT_DIR, 'sa_lost_keywords_by_url.csv')}`)

  // Stats
  const byPriority = new Map<string, { n: number; vol: number }>()
  for (const k of filtered) {
    const p = categorize(k)
    const prev = byPriority.get(p) ?? { n: 0, vol: 0 }
    prev.n++
    prev.vol += k.volume ?? 0
    byPriority.set(p, prev)
  }
  console.log('\n--- Distribution ---')
  Array.from(byPriority.entries())
    .sort()
    .forEach(([p, s]) =>
      console.log(`  ${p.padEnd(20)} : ${s.n} KW, ${s.vol.toLocaleString('fr')} vol cumulé`)
    )

  console.log('\n--- Top 10 P0 (high value à récup en priorité) ---')
  const p0 = filtered
    .filter((k) => categorize(k) === 'P0_high_value')
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
  p0.slice(0, 10).forEach((k, i) => {
    console.log(
      `  ${i + 1}. ${(k.keyword ?? '').padEnd(35)} vol=${k.volume} pos=${k.best_position} kd=${k.keyword_difficulty} → ${k.best_position_url}`
    )
  })
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
