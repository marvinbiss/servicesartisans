/**
 * Action #5 (Sprint C 2026-05-03) — Paid Intelligence → Organic LP attack plan.
 *
 * Reads `paid_intelligence_2026-05.csv` (535 pages payantes auditées chez Effy,
 * Engie, Travaux.com) et identifie les LP/aide/funnel_devis à reproduire en
 * organique pour SA — capture transactional intent sans CPC.
 *
 * Why : les pages payantes des concurrents sont où ils placent le plus
 * d'argent sur Google Ads. Reproduire la même structure en organique permet
 * de capturer ce trafic sans coût publicitaire — pattern Effy démontré
 * (50% du trafic Effy vient en organique de pages anciennement-LP indexées).
 *
 * Filter rules :
 *   - url_intent_hint IN ('landing_page', 'aide', 'funnel_devis', 'travaux')
 *   - keywords_paid >= 10 (signal monétisation forte mais on conserve la longue traîne)
 *   - exclude SA's own URLs + URLs cassées (UTM placeholders %7B...%7D)
 *   - dédup URLs (variantes `https`/`http` ou trailing slash) en gardant le max kw_paid
 *
 * Outputs in `docs/audit-ahrefs-2026-05-03/G_lp/` :
 *   1. lp_blueprints_top30.csv — 30 LP avec spec : pattern URL, KW racine,
 *      H1 cible, batch d'attaque (sem 1 / 2 / 3)
 *   2. lp_pattern_distribution.csv — patterns URL × competitor pour design SA
 */
import * as fs from 'fs'
import * as path from 'path'

const SRC_CSV = path.join(
  process.cwd(),
  'docs',
  'audit-ahrefs-2026-05-03',
  'paid_intelligence_2026-05.csv'
)
const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'G_lp')

type SourceRow = {
  competitor: string
  url: string
  keywordsPaid: number
  segmentMatch: string
  intentHint: string
}

type LpBlueprint = {
  rank: number
  competitor: string
  competitorUrl: string
  keywordsPaid: number
  intentHint: string
  cluster: string
  saRouteRecommendation: string
  saH1Recommendation: string
  attackBatch: 1 | 2 | 3
  reason: string
}

const ATTACK_INTENTS = new Set(['landing_page', 'aide', 'funnel_devis', 'travaux'])
const KW_PAID_MIN = 10

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

function readSource(): SourceRow[] {
  const raw = fs.readFileSync(SRC_CSV, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = raw.split('\n')
  const out: SourceRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i])
    if (c.length < 5) continue
    out.push({
      competitor: c[0] ?? '',
      url: c[1] ?? '',
      keywordsPaid: parseInt(c[2] ?? '0', 10) || 0,
      segmentMatch: c[3] ?? '',
      intentHint: c[4] ?? '',
    })
  }
  return out
}

function clusterFromUrl(url: string): string {
  const u = url.toLowerCase()
  // Order matters : verticales énergie spécifiques d'abord, puis intent transversal
  if (/(pompe.{1,3}chaleur|\bpac\b|aerothermie|aérothermie|geothermie|géothermie|pab-pag)/.test(u))
    return 'pompe-a-chaleur'
  if (/(chauffe.eau|cumulus|thermodynamique|cesi|\bballon\b)/.test(u)) return 'chauffe-eau'
  if (/(poele|granulés|granul[ée]|biomasse|cheminée|cheminee|insert)/.test(u)) return 'poele'
  if (/vmc|ventilation/.test(u)) return 'ventilation'
  if (/(climatisation|\bclim\b|climatiseur|theme=clim)/.test(u)) return 'climatisation'
  if (/(adoucisseur|filtration.eau|traitement.eau)/.test(u)) return 'adoucisseur-eau'
  if (/(solaire|photovolta)/.test(u)) return 'solaire'
  if (/(fenetre|fenêtre|menuiserie|\bporte\b|double.vitrage|volet)/.test(u)) return 'fenetres'
  if (
    /(isolation|isolant|combles|toiture|\bmurs?\b|extérieur|exterieur|interieur|intérieur|moisissure)/.test(
      u
    )
  )
    return 'isolation'
  if (/(chaudière|chaudiere|condensation|\bgaz\b)/.test(u)) return 'chauffage'
  // Intent transversal : simulateur ET aides AVANT travaux générique (sinon "guide rénovation" = travaux au lieu d'aides)
  if (/(devis|simulat|calcul|parcours|estimation|theme=)/.test(u)) return 'simulateur'
  if (
    /(maprimerenov|maprimerénov|\bprime\b|\baide\b|aides|cee|certificat|\btva\b|eco-ptz|ecoptz|bareme|anah)/.test(
      u
    )
  )
    return 'aides-cee'
  if (/(refaire|r[ée]nov|travaux)/.test(u)) return 'travaux'
  return 'autre'
}

const CLUSTER_TO_LP_ROUTE: Record<string, { route: string; h1: string }> = {
  'pompe-a-chaleur': {
    route: '/lp/pompe-a-chaleur-aides',
    h1: "Installer une pompe à chaleur en 2026 — jusqu'à 5 000 € d'aides",
  },
  'chauffe-eau': {
    route: '/lp/chauffe-eau-thermodynamique-prime-cee',
    h1: 'Chauffe-eau thermodynamique : 1 200 € de prime CEE en 2026',
  },
  isolation: {
    route: '/lp/isolation-thermique-aides',
    h1: "Isolation thermique : jusqu'à 75 € / m² d'aides en 2026",
  },
  ventilation: {
    route: '/lp/vmc-double-flux-prime',
    h1: "VMC double flux : prime CEE + MaPrimeRénov' 2026",
  },
  poele: {
    route: '/lp/poele-a-granules-aides',
    h1: "Poêle à granulés : 2 500 € d'aides en 2026 (CEE + MaPrimeRénov')",
  },
  solaire: {
    route: '/lp/panneaux-solaires-aides',
    h1: 'Panneaux solaires : aides photovoltaïques 2026 expliquées',
  },
  fenetres: {
    route: '/lp/fenetres-double-vitrage-prime',
    h1: 'Fenêtres double-vitrage : prime CEE BAR-EN-104 en 2026',
  },
  chauffage: {
    route: '/lp/chaudiere-aides-renovation',
    h1: 'Changer sa chaudière en 2026 : aides + artisans RGE',
  },
  'aides-cee': {
    route: '/lp/aides-renovation-2026',
    h1: 'Toutes les aides à la rénovation énergétique en 2026',
  },
  simulateur: {
    route: '/simulateur-aides-renovation', // existant
    h1: 'Simulateur aides rénovation 2026 — 3 minutes',
  },
  travaux: {
    route: '/lp/devis-renovation-globale',
    h1: 'Devis rénovation globale 2026 : artisans RGE de votre région',
  },
  climatisation: {
    route: '/lp/climatisation-aides',
    h1: 'Installer une climatisation réversible en 2026 : aides + artisans RGE',
  },
  'adoucisseur-eau': {
    route: '/lp/adoucisseur-eau',
    h1: "Installer un adoucisseur d'eau en 2026 — devis artisans certifiés",
  },
}

const BATCH_ASSIGNMENT: Record<string, 1 | 2 | 3> = {
  // Batch 1 — semaine 1 : aides + simulateur (intent racine, plus de paid budget concurrent)
  'aides-cee': 1,
  simulateur: 1,
  // Batch 2 — semaine 2 : isolation (gros volume, kd faible audit Action #7)
  isolation: 2,
  // Batch 3 — semaine 3 : verticales énergie (PAC, chauffe-eau, poêle, ventilation, solaire, chauffage, fenetres, clim, adoucisseur)
  'pompe-a-chaleur': 3,
  'chauffe-eau': 3,
  poele: 3,
  ventilation: 3,
  solaire: 3,
  chauffage: 3,
  fenetres: 3,
  climatisation: 3,
  'adoucisseur-eau': 3,
  travaux: 3,
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function normalizeUrl(url: string): string {
  // Drop UTM placeholders + querystring + trailing slash + protocol
  let u = url.split('%7B')[0].split('?')[0].toLowerCase()
  u = u.replace(/^https?:\/\//, '')
  if (u.endsWith('/') && u.length > 1) u = u.slice(0, -1)
  return u
}

function main() {
  const all = readSource()
  console.log(`Loaded ${all.length} pages from ${SRC_CSV}`)

  // Dédup : garder la ligne avec le max kw_paid pour chaque URL normalisée
  const dedupMap = new Map<string, SourceRow>()
  for (const r of all) {
    if (!ATTACK_INTENTS.has(r.intentHint)) continue
    if (r.keywordsPaid < KW_PAID_MIN) continue
    if (r.url.includes('servicesartisans.fr')) continue
    if (r.url.includes('%7B')) continue // URL avec UTM placeholders cassés (Engie)
    const key = normalizeUrl(r.url)
    const prev = dedupMap.get(key)
    if (!prev || r.keywordsPaid > prev.keywordsPaid) dedupMap.set(key, r)
  }
  const filtered = Array.from(dedupMap.values())

  console.log(
    `After filter (intent attack + kw_paid≥${KW_PAID_MIN} + dédup URL) : ${filtered.length}`
  )

  // Cluster + sort
  const blueprints: LpBlueprint[] = filtered
    .map((r, i) => {
      const cluster = clusterFromUrl(r.url)
      const tpl = CLUSTER_TO_LP_ROUTE[cluster] ?? {
        route: '/lp/' + cluster,
        h1: `LP ${cluster} — à briefer`,
      }
      return {
        rank: i + 1,
        competitor: r.competitor,
        competitorUrl: r.url,
        keywordsPaid: r.keywordsPaid,
        intentHint: r.intentHint,
        cluster,
        saRouteRecommendation: tpl.route,
        saH1Recommendation: tpl.h1,
        attackBatch: BATCH_ASSIGNMENT[cluster] ?? 3,
        reason:
          cluster === 'autre'
            ? 'cluster-not-mapped (review manual)'
            : `cluster ${cluster} → batch ${BATCH_ASSIGNMENT[cluster] ?? 3}`,
      }
    })
    .sort((a, b) => b.keywordsPaid - a.keywordsPaid)

  // Re-rank after sort
  blueprints.forEach((b, i) => (b.rank = i + 1))

  const top30 = blueprints.slice(0, 30)

  // Stats
  const byBatch = new Map<number, number>()
  const byCluster = new Map<string, number>()
  for (const b of top30) {
    byBatch.set(b.attackBatch, (byBatch.get(b.attackBatch) ?? 0) + 1)
    byCluster.set(b.cluster, (byCluster.get(b.cluster) ?? 0) + 1)
  }

  console.log('\nTop 30 LP — Distribution :')
  console.log('  Par batch :')
  Array.from(byBatch.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([b, n]) => console.log(`    Batch ${b} : ${n} LP`))
  console.log('  Par cluster :')
  Array.from(byCluster.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`    ${c.padEnd(20)} ${n} LP`))

  const totalKwPaid = top30.reduce((acc, b) => acc + b.keywordsPaid, 0)
  console.log(`\nTotal KW paid cumulés (top 30) : ${totalKwPaid.toLocaleString('fr')}`)
  console.log(
    `  → si capture organique 30% top 10 = ${Math.round(totalKwPaid * 0.3).toLocaleString('fr')} KW activés sans coût ad`
  )

  // Write outputs
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const headers = [
    'rank',
    'attackBatch',
    'cluster',
    'competitor',
    'keywordsPaid',
    'intentHint',
    'competitorUrl',
    'saRouteRecommendation',
    'saH1Recommendation',
    'reason',
  ]
  const lines = [headers.join(',')]
  top30.forEach((b) => {
    lines.push(
      [
        String(b.rank),
        String(b.attackBatch),
        b.cluster,
        b.competitor,
        String(b.keywordsPaid),
        b.intentHint,
        b.competitorUrl,
        b.saRouteRecommendation,
        b.saH1Recommendation,
        b.reason,
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(path.join(OUT_DIR, 'lp_blueprints_top30.csv'), lines.join('\n') + '\n', 'utf8')
  console.log(`\n✅ Wrote ${path.join(OUT_DIR, 'lp_blueprints_top30.csv')}`)

  // Output 2 : pattern distribution by competitor
  type PatternStat = { competitor: string; pattern: string; nUrls: number; totalKwPaid: number }
  const patternMap = new Map<string, PatternStat>()
  for (const b of top30) {
    const url = b.competitorUrl.replace(/^https?:\/\/[^/]+/, '')
    const pattern =
      url
        .split('?')[0]
        .split('/')
        .slice(0, 4) // first 3 path segments
        .map((seg) => (seg.length > 25 ? '[long-slug]' : seg))
        .join('/') || '/'
    const key = `${b.competitor}::${pattern}`
    const ps = patternMap.get(key)
    if (ps) {
      ps.nUrls++
      ps.totalKwPaid += b.keywordsPaid
    } else {
      patternMap.set(key, {
        competitor: b.competitor,
        pattern,
        nUrls: 1,
        totalKwPaid: b.keywordsPaid,
      })
    }
  }

  const pHeaders = ['rank', 'competitor', 'pattern', 'nUrls', 'totalKwPaid']
  const pLines = [pHeaders.join(',')]
  Array.from(patternMap.values())
    .sort((a, b) => b.totalKwPaid - a.totalKwPaid)
    .slice(0, 20)
    .forEach((p, i) => {
      pLines.push(
        [String(i + 1), p.competitor, p.pattern, String(p.nUrls), String(p.totalKwPaid)]
          .map(escapeCsv)
          .join(',')
      )
    })
  fs.writeFileSync(
    path.join(OUT_DIR, 'lp_pattern_distribution.csv'),
    pLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`✅ Wrote ${path.join(OUT_DIR, 'lp_pattern_distribution.csv')}`)
}

main()
