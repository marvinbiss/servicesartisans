/**
 * Chantier #B (2026-05-03) — Competitor top pages benchmark.
 *
 * Charge :
 *   - top_pages.json × 3 concurrents (hellio, selectra, sonergia) — 100 pages chacun
 *   - competitor_intelligence_2026-05.csv — vue consolidée 300 pages × 4 concurrents
 *
 * Identifie les 50 meilleures pages secteur rénovation énergétique chez la
 * concurrence (segment_match=yes) → reverse-engineer leur structure éditoriale
 * et leur cluster pour informer Sprint éditorial SA.
 *
 * Filter rules :
 *   - segment_match = 'yes' (renovation énergétique scope)
 *   - sum_traffic >= 200 (signal volume réel)
 *   - top_keyword_volume >= 200 (KW racine valable)
 *   - top_keyword_best_position <= 10 (concurrent rank top 10 = template solide)
 *   - exclure brand keywords (free, octopus, malakoff, etc.)
 *
 * Outputs in `docs/audit-ahrefs-2026-05-03/B_competitor_pages/` :
 *   1. top_pages_benchmark_50.csv — 50 pages avec cluster + URL pattern + recommendation SA
 *   2. competitor_url_taxonomy.csv — taxonomy des URL patterns par concurrent
 */
import * as fs from 'fs'
import * as path from 'path'

const AUDIT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03')
const COMPETITORS_TOP_PAGES = ['hellio', 'selectra', 'sonergia'] as const
const CONSOLIDATED_CSV = path.join(AUDIT_DIR, 'competitor_intelligence_2026-05.csv')

type SourceRow = {
  competitor: string
  dr: number
  url: string
  traffic: number
  position: number
  topKeyword: string
  volume: number
  keywords: number
  valueUsd: number
  segmentMatch: 'yes' | 'no'
}

type BenchmarkRow = {
  rank: number
  cluster: string
  competitor: string
  dr: number
  url: string
  urlPattern: string
  topKeyword: string
  volume: number
  position: number
  traffic: number
  saRouteRecommendation: string
  saAttackPriority: 'P0' | 'P1' | 'P2'
}

const EXCLUDE_BRAND_RE = new RegExp(
  '\\b(free|orange|sfr|bouygues|octopus|malakoff|edf|engie|totalenergies|eni|primeo|enercoop|gefa|axa|maaf|matmut)\\b',
  'i'
)

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        cur += c
      }
    } else {
      if (c === ',') {
        out.push(cur)
        cur = ''
      } else if (c === '"' && cur.length === 0) {
        inQuotes = true
      } else {
        cur += c
      }
    }
  }
  out.push(cur)
  return out
}

function loadConsolidated(): SourceRow[] {
  const raw = fs.readFileSync(CONSOLIDATED_CSV, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = raw.split('\n')
  const out: SourceRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i])
    if (c.length < 10) continue
    out.push({
      competitor: c[0] ?? '',
      dr: parseFloat(c[1] ?? '0') || 0,
      url: c[2] ?? '',
      traffic: parseInt(c[3] ?? '0', 10) || 0,
      position: parseInt(c[4] ?? '0', 10) || 0,
      topKeyword: c[5] ?? '',
      volume: parseInt(c[6] ?? '0', 10) || 0,
      keywords: parseInt(c[7] ?? '0', 10) || 0,
      valueUsd: parseInt(c[8] ?? '0', 10) || 0,
      segmentMatch: (c[9] === 'yes' ? 'yes' : 'no') as 'yes' | 'no',
    })
  }
  return out
}

function clusterFromUrlOrKeyword(url: string, keyword: string): string {
  const u = (url + ' ' + keyword).toLowerCase()
  if (/(pompe.{1,3}chaleur|\bpac\b|aerothermie|aérothermie|geothermie|géothermie|pab-pag)/.test(u))
    return 'pompe-a-chaleur'
  if (/(chauffe.eau|cumulus|thermodynamique|cesi|\bballon\b)/.test(u)) return 'chauffe-eau'
  if (/(poele|granulés|granul[ée]|biomasse|cheminée|cheminee|insert)/.test(u)) return 'poele'
  if (/vmc|ventilation/.test(u)) return 'ventilation'
  if (/(climatisation|\bclim\b|climatiseur)/.test(u)) return 'climatisation'
  if (/(adoucisseur|filtration.eau|traitement.eau)/.test(u)) return 'adoucisseur-eau'
  if (/(solaire|photovolta)/.test(u)) return 'solaire'
  if (/(fenetre|fenêtre|menuiserie|\bporte\b|double.vitrage|volet)/.test(u)) return 'fenetres'
  if (
    /(isolation|isolant|combles|toiture|\bmurs?\b|extérieur|exterieur|interieur|intérieur|moisissure|phoniqu)/.test(
      u
    )
  )
    return 'isolation'
  if (/(chaudière|chaudiere|condensation|\bgaz\b)/.test(u)) return 'chauffage'
  if (/(devis|simulat|calcul|parcours|estimation)/.test(u)) return 'simulateur'
  if (
    /(maprimerenov|maprimerénov|\bprime\b|\baide\b|aides|cee|certificat|\btva\b|eco-ptz|ecoptz|bareme|anah|ch[èe]que.*[ée]nergie)/.test(
      u
    )
  )
    return 'aides-cee'
  if (/(dpe|diagnostic|audit.{0,5}[ée]nerg|classe.{0,5}[ée]nerg|passoire)/.test(u))
    return 'diagnostic'
  if (/(refaire|r[ée]nov|travaux|chantier|prix.*m2|prix.*m²)/.test(u)) return 'travaux'
  return 'autre'
}

const CLUSTER_TO_SA_ROUTE: Record<string, string> = {
  'pompe-a-chaleur': '/services/pompe-a-chaleur',
  'chauffe-eau': '/cee/bar-th-148',
  poele: '/cee/bar-th-112',
  ventilation: '/cee/bar-th-127',
  climatisation: '/lp/climatisation-aides',
  'adoucisseur-eau': '/lp/adoucisseur-eau',
  solaire: '/services/panneaux-solaires',
  fenetres: '/lp/fenetres-double-vitrage-prime',
  isolation: '/services/isolation-thermique',
  chauffage: '/services/chauffagiste',
  simulateur: '/simulateur-aides-renovation',
  'aides-cee': '/aides',
  diagnostic: '/diagnostic',
  travaux: '/travaux',
  autre: '/',
}

function urlPattern(url: string): string {
  // Remove protocol + host, keep first 3 path segments (or replace long ones)
  return (
    url
      .replace(/^https?:\/\/[^/]+/, '')
      .split('?')[0]
      .split('/')
      .slice(0, 4)
      .map((seg) => (seg.length > 30 ? '[long-slug]' : seg))
      .join('/') || '/'
  )
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function main() {
  const all = loadConsolidated()
  console.log(`Loaded consolidated CSV : ${all.length} rows`)

  // Dédup by URL : keep highest traffic
  const dedup = new Map<string, SourceRow>()
  for (const r of all) {
    const key = r.url
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase()
    const prev = dedup.get(key)
    if (!prev || r.traffic > prev.traffic) dedup.set(key, r)
  }

  const filtered = Array.from(dedup.values()).filter(
    (r) =>
      r.segmentMatch === 'yes' &&
      r.traffic >= 200 &&
      r.volume >= 200 &&
      r.position > 0 &&
      r.position <= 10 &&
      !EXCLUDE_BRAND_RE.test(r.topKeyword)
  )

  console.log(
    `After filter (segment=yes + traf≥200 + vol≥200 + pos≤10 + non-brand) : ${filtered.length}`
  )

  // Cluster + map
  const benchmarks: BenchmarkRow[] = filtered
    .map((r): BenchmarkRow => {
      const cluster = clusterFromUrlOrKeyword(r.url, r.topKeyword)
      const priority: BenchmarkRow['saAttackPriority'] =
        r.position <= 3 && r.volume >= 1000 && r.traffic >= 1000
          ? 'P0'
          : r.position <= 5 && r.volume >= 500
            ? 'P1'
            : 'P2'
      return {
        rank: 0,
        cluster,
        competitor: r.competitor,
        dr: r.dr,
        url: r.url,
        urlPattern: urlPattern(r.url),
        topKeyword: r.topKeyword,
        volume: r.volume,
        position: r.position,
        traffic: r.traffic,
        saRouteRecommendation: CLUSTER_TO_SA_ROUTE[cluster] ?? '/',
        saAttackPriority: priority,
      }
    })
    .sort((a, b) => b.traffic - a.traffic)

  benchmarks.forEach((b, i) => (b.rank = i + 1))
  const top50 = benchmarks.slice(0, 50)

  // Stats
  const byCluster = new Map<string, number>()
  const byCompetitor = new Map<string, number>()
  const byPriority = new Map<string, number>()
  for (const b of top50) {
    byCluster.set(b.cluster, (byCluster.get(b.cluster) ?? 0) + 1)
    byCompetitor.set(b.competitor, (byCompetitor.get(b.competitor) ?? 0) + 1)
    byPriority.set(b.saAttackPriority, (byPriority.get(b.saAttackPriority) ?? 0) + 1)
  }

  console.log('\nTop 50 distribution :')
  console.log('  Par cluster :')
  Array.from(byCluster.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`    ${c.padEnd(20)} ${n} pages`))
  console.log('  Par concurrent :')
  Array.from(byCompetitor.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`    ${c.padEnd(20)} ${n} pages`))
  console.log("  Par priorité d'attaque :")
  Array.from(byPriority.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([p, n]) => console.log(`    ${p} : ${n} pages`))

  const totalTraffic = top50.reduce((s, b) => s + b.traffic, 0)
  console.log(`\nTraffic cumulé top 50 : ${totalTraffic.toLocaleString('fr')}/mois`)
  console.log(
    `  → si SA capture 25% via reverse-engineering = ${Math.round(totalTraffic * 0.25).toLocaleString('fr')} clics/mois`
  )

  // Outputs
  const outDir = path.join(AUDIT_DIR, 'B_competitor_pages')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Output 1 : top 50 benchmark
  const headers = [
    'rank',
    'cluster',
    'saAttackPriority',
    'competitor',
    'dr',
    'url',
    'urlPattern',
    'topKeyword',
    'volume',
    'position',
    'traffic',
    'saRouteRecommendation',
  ]
  const lines = [headers.join(',')]
  top50.forEach((b) => {
    lines.push(
      [
        String(b.rank),
        b.cluster,
        b.saAttackPriority,
        b.competitor,
        String(b.dr),
        b.url,
        b.urlPattern,
        b.topKeyword,
        String(b.volume),
        String(b.position),
        String(b.traffic),
        b.saRouteRecommendation,
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(path.join(outDir, 'top_pages_benchmark_50.csv'), lines.join('\n') + '\n', 'utf8')
  console.log(`\n✅ Wrote ${path.join(outDir, 'top_pages_benchmark_50.csv')}`)

  // Output 2 : taxonomy par competitor × pattern
  type TaxonomyStat = {
    competitor: string
    pattern: string
    nUrls: number
    totalTraffic: number
    avgPosition: number
  }
  const taxMap = new Map<string, TaxonomyStat>()
  for (const b of top50) {
    const key = `${b.competitor}::${b.urlPattern}`
    const prev = taxMap.get(key)
    if (prev) {
      prev.nUrls++
      prev.totalTraffic += b.traffic
      prev.avgPosition = (prev.avgPosition * (prev.nUrls - 1) + b.position) / prev.nUrls
    } else {
      taxMap.set(key, {
        competitor: b.competitor,
        pattern: b.urlPattern,
        nUrls: 1,
        totalTraffic: b.traffic,
        avgPosition: b.position,
      })
    }
  }

  const taxHeaders = ['rank', 'competitor', 'urlPattern', 'nUrls', 'totalTraffic', 'avgPosition']
  const taxLines = [taxHeaders.join(',')]
  Array.from(taxMap.values())
    .sort((a, b) => b.totalTraffic - a.totalTraffic)
    .slice(0, 30)
    .forEach((t, i) => {
      taxLines.push(
        [
          String(i + 1),
          t.competitor,
          t.pattern,
          String(t.nUrls),
          String(t.totalTraffic),
          t.avgPosition.toFixed(1),
        ]
          .map(escapeCsv)
          .join(',')
      )
    })
  fs.writeFileSync(
    path.join(outDir, 'competitor_url_taxonomy.csv'),
    taxLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`✅ Wrote ${path.join(outDir, 'competitor_url_taxonomy.csv')}`)

  // Cross-check : top_pages.json individuels (validation que la consolidation couvre)
  console.log('\n--- Sanity check top_pages.json individuels ---')
  for (const c of COMPETITORS_TOP_PAGES) {
    const file = path.join(AUDIT_DIR, 'A_competitors', c, 'top_pages.json')
    if (!fs.existsSync(file)) continue
    const items = (JSON.parse(fs.readFileSync(file, 'utf8')).pages ?? []) as Array<{
      sum_traffic: number
    }>
    const totalTraf = items.reduce((s, p) => s + (p.sum_traffic ?? 0), 0)
    console.log(
      `  ${c.padEnd(15)} : ${items.length} pages, ${totalTraf.toLocaleString('fr')} traffic cumulé total`
    )
  }
}

main()
