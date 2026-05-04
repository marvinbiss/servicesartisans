/**
 * Action #9 (Sprint A) — Analyze striking distance KW from Ahrefs Phase 0 audit.
 *
 * The CSV `striking_distance_2026-05.csv` is mis-named — it contains 590
 * keywords where SA is NOT positioned (sa_pos empty), but where competitors
 * (sonergia, others) rank top 5. This is content gap, not classic striking
 * distance (pos 11-20).
 *
 * We pivot to the most rigorous use of this data:
 *   1. Filter: vol >= 300 AND kd <= 15 (attackable easy wins, ~127 KW)
 *   2. Exclude noise: brand names (primeo, bellenergie), out-of-scope KW
 *      ("attestation d'hébergement"), generic non-renovation terms
 *   3. Cluster KW by service vertical (pompe-à-chaleur, isolation, chauffe-eau,
 *      ventilation, fenetres, etc.)
 *   4. For each KW, try to match an existing SA page via cluster routing:
 *      - /services/[s]           (service hub)
 *      - /services/[s]/[v]       (service × ville)
 *      - /cee/[op]/guide         (CEE guide)
 *      - /rge/[s]                (RGE service)
 *      - /blog/[slug]            (blog article)
 *      - /guides/[slug]          (long-form guide)
 *   5. Output:
 *      - kw_attack_existing_50.csv : 50 top KW with existing SA page → on-page
 *        optimization (title, H1, FS-bait, internal links)
 *      - kw_attack_create_50.csv   : 50 top KW with no matching page → input
 *        for Sprint B (#3 pillar /rge) or Sprint F (#8 4 pillars)
 *
 * Usage:
 *   npx tsx scripts/analyze-striking-distance-2026-05.ts
 *
 * Output dir: docs/audit-ahrefs-2026-05-03/E_site/ (commitable, no PII)
 */
import * as fs from 'fs'
import * as path from 'path'

const SRC_CSV = path.join(
  process.cwd(),
  'docs',
  'audit-ahrefs-2026-05-03',
  'striking_distance_2026-05.csv'
)
const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'E_site')

type SourceRow = {
  bucket: string
  keyword: string
  volume: number
  kd: number
  sa_pos: string
  best_competitor: string
  best_pos: string
  best_url: string
}

type Cluster =
  | 'pompe-a-chaleur'
  | 'chauffe-eau'
  | 'isolation'
  | 'isolation-phonique'
  | 'ventilation'
  | 'poele'
  | 'solaire'
  | 'fenetres'
  | 'chauffage'
  | 'audit-energetique'
  | 'aides-cee'
  | 'autre'

type Match = {
  kw: string
  vol: number
  kd: number
  bucket: string
  competitor: string
  cluster: Cluster
  matchedRoute: string | null
  matchedFile: string | null
  reason: string
}

const EXCLUDE_PATTERNS: RegExp[] = [
  /^attestation/i, // "attestation d'hébergement" — hors scope rénovation
  /primeo/i, // marque concurrent
  /bellenergie/i, // marque concurrent
  /^lobby$|^magazine$/i,
  /\bavis\b.*(primeo|bellenergie|effy|hellio)/i, // brand reviews
]

function clusterFor(kw: string): Cluster {
  const k = kw.toLowerCase()
  if (/(pompe.{1,3}chaleur|\bpac\b)/.test(k)) return 'pompe-a-chaleur'
  if (/chauffe.eau|cumulus|thermodynamique/.test(k)) return 'chauffe-eau'
  if (/isolation phonique|isoler phoniquement|isolant phonique/.test(k)) return 'isolation-phonique'
  if (/isolation|isolant|combles|toiture/.test(k)) return 'isolation'
  if (/vmc|ventilation/.test(k)) return 'ventilation'
  if (/poele|granulés|granul[ée]/.test(k)) return 'poele'
  if (/solaire|photovolta/.test(k)) return 'solaire'
  if (/(fenetre|fenêtre|menuiserie|porte d'entrée)/.test(k)) return 'fenetres'
  if (/chaudière|chaudiere|chauffage/.test(k)) return 'chauffage'
  if (/dpe|audit énergétique|audit energetique|diagnostic/.test(k)) return 'audit-energetique'
  if (/maprimerenov|cee|prime|aide.{1,5}r[ée]nov/.test(k)) return 'aides-cee'
  return 'autre'
}

// Route mapping verified live 2026-05-03 (all routes return HTTP 200) :
// /services/[s] only for: pompe-a-chaleur, isolation-thermique, panneaux-solaires,
//   chauffagiste, menuisier (no chauffe-eau-thermodynamique, no ventilation, no
//   fenetres, no audit-energetique, no poele-* — pivot RGE-only kept lean).
// /cee/[op] (without /guide — guides 410 since 2026) for thematic verticals.
// /rge/[s] for RGE-flagged hubs (pompe-a-chaleur, isolation-thermique, chauffagiste,
//   panneaux-solaires).
const CLUSTER_TO_HUB_ROUTE: Record<Cluster, { route: string; file: string } | null> = {
  'pompe-a-chaleur': {
    route: '/services/pompe-a-chaleur',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'chauffe-eau': {
    // CET = Chauffe-Eau Thermodynamique = BAR-TH-148
    route: '/cee/bar-th-148',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  isolation: {
    route: '/services/isolation-thermique',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'isolation-phonique': {
    // No dedicated service nor CEE op for phonique. /blog hub or future guide.
    route: '/blog',
    file: 'src/app/(public)/blog/page.tsx',
  },
  ventilation: {
    // VMC double flux = BAR-TH-127
    route: '/cee/bar-th-127',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  poele: {
    // Poêle à granulés = BAR-TH-112 (le /guide est 410)
    route: '/cee/bar-th-112',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  solaire: {
    route: '/services/panneaux-solaires',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  fenetres: {
    // Fenêtres = BAR-EN-104
    route: '/cee/bar-en-104',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  chauffage: {
    route: '/services/chauffagiste',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'audit-energetique': {
    // No /services/audit-energetique en pivot RGE-only. Hub /renovation-energetique.
    route: '/renovation-energetique',
    file: 'src/app/(public)/renovation-energetique/page.tsx',
  },
  'aides-cee': {
    route: '/aides/maprimerenov',
    file: 'src/app/(public)/aides/[slug]/page.tsx',
  },
  autre: null,
}

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

function readCsv(): SourceRow[] {
  const raw = fs.readFileSync(SRC_CSV, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = raw.split('\n')
  const out: SourceRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i])
    out.push({
      bucket: c[0] ?? '',
      keyword: c[1] ?? '',
      volume: parseInt(c[2] ?? '0', 10) || 0,
      kd: parseInt(c[3] ?? '0', 10) || 0,
      sa_pos: c[4] ?? '',
      best_competitor: c[5] ?? '',
      best_pos: c[6] ?? '',
      best_url: c[7] ?? '',
    })
  }
  return out
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function main() {
  const all = readCsv()
  console.log(`Loaded ${all.length} KW from ${SRC_CSV}`)

  // Filter: attackable easy wins
  const filtered = all
    .filter((r) => r.volume >= 300 && r.kd <= 15)
    .filter((r) => !EXCLUDE_PATTERNS.some((re) => re.test(r.keyword)))

  console.log(`After filter (vol≥300, kd≤15, brand exclusion): ${filtered.length}`)

  // Cluster each KW
  const matched: Match[] = filtered.map((r) => {
    const cluster = clusterFor(r.keyword)
    const hub = CLUSTER_TO_HUB_ROUTE[cluster]
    return {
      kw: r.keyword,
      vol: r.volume,
      kd: r.kd,
      bucket: r.bucket,
      competitor: r.best_competitor,
      cluster,
      matchedRoute: hub?.route ?? null,
      matchedFile: hub?.file ?? null,
      reason: hub ? 'cluster→hub' : 'no-hub-mapping',
    }
  })

  // Sort by volume desc
  matched.sort((a, b) => b.vol - a.vol)

  // Split: existing (matchedRoute != null) vs create (null)
  const existing = matched.filter((m) => m.matchedRoute !== null).slice(0, 50)
  const create = matched.filter((m) => m.matchedRoute === null).slice(0, 50)

  console.log(`Existing-page attack (top 50): ${existing.length}`)
  console.log(`Create-page attack (top 50):   ${create.length}`)

  // Stats by cluster
  const byCluster = new Map<Cluster, number>()
  for (const m of matched) {
    byCluster.set(m.cluster, (byCluster.get(m.cluster) ?? 0) + 1)
  }
  console.log('\nDistribution par cluster :')
  Array.from(byCluster.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${c.padEnd(20)} ${n} KW`))

  // Volume capture estimate (top 50 existing)
  const totalVolExisting = existing.reduce((acc, m) => acc + m.vol, 0)
  const totalVolCreate = create.reduce((acc, m) => acc + m.vol, 0)
  console.log(`\nVolume mensuel exploitable :`)
  console.log(`  - 50 KW existing-page  : ${totalVolExisting.toLocaleString('fr')}/mois`)
  console.log(`  - 50 KW create-page    : ${totalVolCreate.toLocaleString('fr')}/mois`)

  // Write CSVs
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const headers = [
    'rank',
    'keyword',
    'volume',
    'kd',
    'cluster',
    'matchedRoute',
    'matchedFile',
    'bestCompetitor',
    'reason',
  ]

  function writeCsv(rows: Match[], filename: string) {
    const lines = [headers.join(',')]
    rows.forEach((m, i) => {
      lines.push(
        [
          String(i + 1),
          m.kw,
          String(m.vol),
          String(m.kd),
          m.cluster,
          m.matchedRoute ?? '',
          m.matchedFile ?? '',
          m.competitor,
          m.reason,
        ]
          .map(escapeCsv)
          .join(',')
      )
    })
    const outPath = path.join(OUT_DIR, filename)
    fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')
    console.log(`✅ Wrote ${outPath}`)
  }

  writeCsv(existing, 'kw_attack_existing_50.csv')
  writeCsv(create, 'kw_attack_create_50.csv')

  console.log('\nNext step (Action #9 follow-up):')
  console.log('  → Pour chaque KW de kw_attack_existing_50.csv, vérifier que la page est optimisée')
  console.log('    (title contient le KW, H1 aligné, contenu ≥ 800 mots, ≥3 internal links)')
  console.log('  → kw_attack_create_50.csv = brief input pour Sprint B (#3) et Sprint F (#8)')
}

main()
