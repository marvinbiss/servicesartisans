/**
 * Action #7 (Sprint C 2026-05-03) — Reverse-engineer competitor KW universe.
 *
 * Loads top 1000 KW from 5 RGE/CEE competitors (effy, france_renov, hellio,
 * selectra, sonergia) + SA's own 1000 KW. Computes the "gap" — KW where
 * competitors rank top 10 but SA is absent. Outputs ranked attack list.
 *
 * Why : audit Phase 0 already produced `striking_distance_2026-05.csv`
 * (Action #9) which is content gap on aggregate level. This script gives
 * us per-competitor granularity + identifies the URL pattern each competitor
 * uses to rank — directly actionable as page templates.
 *
 * Filter rules :
 *   - vol >= 200 (lower than Action #9's 300 because we add per-competitor
 *     evidence as a quality signal)
 *   - kd <= 25 (relaxed since 1+ competitor already ranks)
 *   - best_position <= 10 across at least 1 competitor
 *   - exclude SA's existing KW (whatever rank SA holds)
 *   - exclude brand KW (effy, sonergia, hellio, selectra, primeo, bellenergie, lobby, magazine, etc.)
 *   - exclude out-of-scope (attestation*, sociale, gaz passerelle = jargon EDF)
 *
 * Outputs in `docs/audit-ahrefs-2026-05-03/C_gap/` :
 *   1. kw_gap_attack_top100.csv — top 100 KW ranked by (vol × n_competitors / kd)
 *      with recommended SA URL pattern (cluster + slug suggestion)
 *   2. competitor_url_patterns.csv — distinct URL patterns by competitor for
 *      the top 50 KW (input for Sprint F #8 — 4 pillars restant)
 */
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'A_competitors')
const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'C_gap')

const COMPETITORS = ['effy', 'france_renov', 'hellio', 'selectra', 'sonergia'] as const
type Competitor = (typeof COMPETITORS)[number]

type KwEntry = {
  keyword: string
  volume: number
  best_position: number
  sum_traffic: number
  cpc: number | null
  best_position_url: string
  keyword_difficulty: number
  is_transactional?: boolean
  is_commercial?: boolean
  is_informational?: boolean
}

type CompetitorRanking = {
  competitor: Competitor
  position: number
  url: string
  traffic: number
}

type GapKw = {
  keyword: string
  volume: number
  kd: number
  cpc: number | null
  rankings: CompetitorRanking[]
  bestRank: number
  nCompetitors: number
  attackScore: number // vol * nCompetitors / max(kd, 1)
  cluster: string
  recommendedRoute: string | null
  recommendedFile: string | null
}

const EXCLUDE_PATTERNS: RegExp[] = [
  // Brand keywords concurrents (audit) ou hors scope rénovation
  /^attestation/i,
  /\b(primeo|bellenergie|effy|sonergia|hellio|selectra|engie|edf|totalenergies|octopus|malakoff|humanis|alan|axa|maaf|matmut|maif|mma|ffb|qonto|alma)\b/i,
  /\b(es strasbourg|gaz passerelle|ekwateur|enercoop|ovo energy|ohm energie|ohmenergie)\b/i,
  /\b(orange|sosh|sfr|free|bouygues)\b/i,
  /^lobby$|^magazine$/i,
  /\bavis\b.*(primeo|bellenergie|effy|hellio|selectra|sonergia|edf|engie|alma|alan)/i,
  // Hors scope finance / banque / assurance / aides sociales
  /\b(virement|chèque|chequeier|prêt|credit|crédit|carte bancaire|banque|caisse d.{1,3}épargne|société générale|crédit agricole)\b/i,
  /\b(mutuelle|assurance|complémentaire santé|cmu|css|aah|rsa|apl|caf)\b/i,
  /\b(impots?|impôt|fiscal|taxe d.{1,3}habitation|taxe foncière)\b/i,
  /\b(retraite|pension|chômage|pole emploi|pôle emploi)\b/i,
  // Hors scope numérique / téléphonie / médical
  /\b(numérique|numerique|carte sim|forfait mobile|fibre|adsl|abonnement)\b/i,
  /\b(médecin|dentiste|opticien|pharmacie|ordonnance|cnam)\b/i,
  // Hors scope énergie spot/forfait pure (= fournisseur, pas artisan)
  /\b(tarif réglementé|tarif bleu|kwh)\b/i,
  // KW info-only sans intent commercial pertinent
  /\b(qu['e]?est.{1,3}ce que)\b/i,
]

function clusterFor(kw: string): string {
  const k = kw.toLowerCase()
  if (/(pompe.{1,3}chaleur|\bpac\b)/.test(k)) return 'pompe-a-chaleur'
  if (/chauffe.eau|cumulus|thermodynamique/.test(k)) return 'chauffe-eau'
  if (/isolation phonique|isoler phoniquement|isolant phonique/.test(k)) return 'isolation-phonique'
  if (/isolation|isolant|combles|toiture/.test(k)) return 'isolation'
  if (/vmc|ventilation/.test(k)) return 'ventilation'
  if (/poele|granulés|granul[ée]/.test(k)) return 'poele'
  if (/solaire|photovolta/.test(k)) return 'solaire'
  if (/(fenetre|fenêtre|menuiserie|porte d'entrée|porte d entree)/.test(k)) return 'fenetres'
  if (/chaudière|chaudiere|chauffage/.test(k)) return 'chauffage'
  if (/dpe|audit énergétique|audit energetique|diagnostic/.test(k)) return 'audit-energetique'
  if (/maprimerenov|maprimerénov|cee|prime|aide.{1,5}r[ée]nov|certificats? d'?[ée]conomie/.test(k))
    return 'aides-cee'
  if (/devis|estimat|simulat|calcul/.test(k)) return 'simulateur'
  if (/refaire|r[ée]nov|travaux/.test(k)) return 'travaux'
  if (/borne.{1,3}recharge|irve|voiture.{1,3}électrique/.test(k)) return 'irve'
  if (/[ée]coh?abitat|biomasse|g[ée]othermique|a[ée]rothermique/.test(k))
    return 'energie-renouvelable'
  return 'autre'
}

const CLUSTER_TO_HUB: Record<string, { route: string; file: string } | null> = {
  'pompe-a-chaleur': {
    route: '/services/pompe-a-chaleur',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'chauffe-eau': {
    route: '/cee/bar-th-148',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  isolation: {
    route: '/services/isolation-thermique',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'isolation-phonique': null, // pas de page dédiée — input Sprint F
  ventilation: {
    route: '/cee/bar-th-127',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  poele: {
    route: '/cee/bar-th-112',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  solaire: {
    route: '/services/panneaux-solaires',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  fenetres: {
    route: '/cee/bar-en-104',
    file: 'src/app/(public)/cee/[operation]/page.tsx',
  },
  chauffage: {
    route: '/services/chauffagiste',
    file: 'src/app/(public)/services/[service]/page.tsx',
  },
  'audit-energetique': {
    route: '/renovation-energetique',
    file: 'src/app/(public)/renovation-energetique/page.tsx',
  },
  'aides-cee': {
    route: '/aides/maprimerenov',
    file: 'src/app/(public)/aides/[slug]/page.tsx',
  },
  simulateur: {
    route: '/simulateur-aides-renovation',
    file: 'src/app/(public)/simulateur-aides-renovation/page.tsx',
  },
  travaux: null, // pas de hub /travaux — input Sprint F
  irve: null, // pas de hub IRVE — input Sprint F
  'energie-renouvelable': null,
  autre: null,
}

function loadCompetitorKw(competitor: Competitor): KwEntry[] {
  const file = path.join(SRC_DIR, competitor, 'top_keywords_1000.json')
  if (!fs.existsSync(file)) return []
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = JSON.parse(raw) as { keywords?: KwEntry[] }
  return parsed.keywords ?? []
}

function loadSaKw(): KwEntry[] {
  const file = path.join(SRC_DIR, 'sa_keywords_1000.json')
  if (!fs.existsSync(file)) return []
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = JSON.parse(raw) as { keywords?: KwEntry[] }
  return parsed.keywords ?? []
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function isExcluded(kw: string): boolean {
  return EXCLUDE_PATTERNS.some((re) => re.test(kw))
}

function main() {
  console.log('Loading SA keywords...')
  const saKw = loadSaKw()
  const saKeywords = new Set(saKw.map((k) => k.keyword.toLowerCase()))
  console.log(`  → ${saKw.length} SA keywords loaded (set: ${saKeywords.size})`)

  console.log('\nLoading competitor keywords...')
  const allRankings = new Map<string, GapKw>() // keyword → aggregated gap entry
  for (const competitor of COMPETITORS) {
    const kw = loadCompetitorKw(competitor)
    console.log(`  ${competitor.padEnd(15)} : ${kw.length} keywords`)
    for (const k of kw) {
      const norm = k.keyword.toLowerCase().trim()
      // Filters
      if (saKeywords.has(norm)) continue // SA already ranks → skip
      if (isExcluded(norm)) continue
      if (!k.volume || k.volume < 200) continue
      if (k.keyword_difficulty > 25) continue
      if (!k.best_position || k.best_position > 10) continue

      const cluster = clusterFor(k.keyword)
      // Skip cluster "autre" : signal that the KW is not in our vertical.
      // Gardé seulement les clusters sectoriels actionnables (rge/cee/aides/travaux).
      if (cluster === 'autre') continue

      const ranking: CompetitorRanking = {
        competitor,
        position: k.best_position,
        url: k.best_position_url || '',
        traffic: k.sum_traffic || 0,
      }

      const existing = allRankings.get(norm)
      if (existing) {
        existing.rankings.push(ranking)
        existing.bestRank = Math.min(existing.bestRank, k.best_position)
        existing.nCompetitors = existing.rankings.length
      } else {
        allRankings.set(norm, {
          keyword: k.keyword,
          volume: k.volume,
          kd: k.keyword_difficulty,
          cpc: k.cpc,
          rankings: [ranking],
          bestRank: k.best_position,
          nCompetitors: 1,
          attackScore: 0,
          cluster,
          recommendedRoute: null,
          recommendedFile: null,
        })
      }
    }
  }

  console.log(`\nTotal unique gap keywords: ${allRankings.size}`)

  // Compute attack score + recommended route
  const gapList = Array.from(allRankings.values())
  for (const g of gapList) {
    g.attackScore = (g.volume * g.nCompetitors) / Math.max(g.kd, 1)
    const hub = CLUSTER_TO_HUB[g.cluster]
    g.recommendedRoute = hub?.route ?? null
    g.recommendedFile = hub?.file ?? null
  }
  gapList.sort((a, b) => b.attackScore - a.attackScore)

  // Stats by cluster
  console.log('\nDistribution par cluster :')
  const byCluster = new Map<string, number>()
  const byClusterVol = new Map<string, number>()
  for (const g of gapList) {
    byCluster.set(g.cluster, (byCluster.get(g.cluster) ?? 0) + 1)
    byClusterVol.set(g.cluster, (byClusterVol.get(g.cluster) ?? 0) + g.volume)
  }
  Array.from(byCluster.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) =>
      console.log(
        `  ${c.padEnd(22)} ${String(n).padStart(4)} KW   vol ${(byClusterVol.get(c) ?? 0).toLocaleString('fr')}/mois`
      )
    )

  // Output 1 : top 100
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const top100 = gapList.slice(0, 100)
  const totalVol100 = top100.reduce((acc, g) => acc + g.volume, 0)
  console.log(`\nTop 100 attack KW : ${totalVol100.toLocaleString('fr')} vol/mois cumulé`)

  const headers = [
    'rank',
    'keyword',
    'volume',
    'kd',
    'cpc',
    'bestRank',
    'nCompetitors',
    'attackScore',
    'cluster',
    'recommendedRoute',
    'recommendedFile',
    'topCompetitor',
    'topCompetitorUrl',
    'allCompetitors',
  ]
  const lines: string[] = [headers.join(',')]
  top100.forEach((g, i) => {
    const top = g.rankings.sort((a, b) => a.position - b.position)[0]
    const allComp = g.rankings.map((r) => `${r.competitor}#${r.position}`).join('|')
    lines.push(
      [
        String(i + 1),
        g.keyword,
        String(g.volume),
        String(g.kd),
        g.cpc !== null ? String(g.cpc) : '',
        String(g.bestRank),
        String(g.nCompetitors),
        g.attackScore.toFixed(1),
        g.cluster,
        g.recommendedRoute ?? '',
        g.recommendedFile ?? '',
        top?.competitor ?? '',
        top?.url ?? '',
        allComp,
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(path.join(OUT_DIR, 'kw_gap_attack_top100.csv'), lines.join('\n') + '\n', 'utf8')
  console.log(`✅ Wrote ${path.join(OUT_DIR, 'kw_gap_attack_top100.csv')}`)

  // Output 2 : URL patterns by competitor (top 50 KW only — patterns are clearer)
  type PatternStat = {
    competitor: Competitor
    pattern: string
    nKw: number
    totalVol: number
    sampleKw: string[]
  }
  const patternMap = new Map<string, PatternStat>()
  for (const g of top100.slice(0, 50)) {
    for (const r of g.rankings) {
      if (!r.url) continue
      // Extract URL path pattern (replace dynamic segments by [param])
      const url = r.url.replace(/^https?:\/\/[^/]+/, '')
      const pattern = url
        .split('/')
        .map((seg) => {
          if (!seg) return ''
          if (/^\d+$/.test(seg)) return '[id]'
          if (/^[a-z0-9-]+\.html?$/.test(seg)) return '[slug].html'
          return seg.length > 25 ? '[long-slug]' : seg
        })
        .join('/')
      const key = `${r.competitor}::${pattern}`
      const ps = patternMap.get(key)
      if (ps) {
        ps.nKw++
        ps.totalVol += g.volume
        if (ps.sampleKw.length < 3) ps.sampleKw.push(g.keyword)
      } else {
        patternMap.set(key, {
          competitor: r.competitor,
          pattern,
          nKw: 1,
          totalVol: g.volume,
          sampleKw: [g.keyword],
        })
      }
    }
  }
  const patternsSorted = Array.from(patternMap.values()).sort((a, b) => b.totalVol - a.totalVol)

  const pHeaders = ['rank', 'competitor', 'pattern', 'nKw', 'totalVol', 'sampleKw']
  const pLines = [pHeaders.join(',')]
  patternsSorted.slice(0, 30).forEach((p, i) => {
    pLines.push(
      [
        String(i + 1),
        p.competitor,
        p.pattern,
        String(p.nKw),
        String(p.totalVol),
        p.sampleKw.join('|'),
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(
    path.join(OUT_DIR, 'competitor_url_patterns.csv'),
    pLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`✅ Wrote ${path.join(OUT_DIR, 'competitor_url_patterns.csv')}`)

  // Recommendations summary
  console.log('\n=== Recommandations ===')
  const withRoute = top100.filter((g) => g.recommendedRoute !== null)
  const withoutRoute = top100.filter((g) => g.recommendedRoute === null)
  console.log(`  ${withRoute.length} KW → page existante (Sprint C optimization)`)
  console.log(`  ${withoutRoute.length} KW → nouveau hub à créer (Sprint F #8)`)
  const top5WithoutRoute = withoutRoute.slice(0, 5)
  if (top5WithoutRoute.length > 0) {
    console.log('  Top 5 KW sans page hub (priorisation Sprint F) :')
    top5WithoutRoute.forEach((g) =>
      console.log(`    • "${g.keyword}" (${g.volume} vol, kd ${g.kd}, ${g.nCompetitors} comp)`)
    )
  }

  console.log('\nNext step : exploit kw_gap_attack_top100.csv')
  console.log('  - withRoute → optimize on-page (title/H2/maillage) sur Sprint C suite')
  console.log('  - withoutRoute → input prioritaire Sprint F #8 (4 pillars restants)')
}

main()
