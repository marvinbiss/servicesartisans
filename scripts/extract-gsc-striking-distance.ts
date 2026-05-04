/**
 * Tier 1 (T1.4) 2026-05-04 — Extract striking-distance keywords from GSC.
 *
 * Pourquoi GSC plutôt qu'Ahrefs : Ahrefs Bloc 2-3 buggé sur 4 datasets
 * (résolution KW partielle, dump sa_pos vide). GSC a la donnée canonique :
 * rank moyen sur 90 jours, impressions, clics, CTR — directement depuis les
 * SERP réelles que voit Google.
 *
 * Striking distance = rank 4-20. Au-delà de 20, gain CTR marginal sans
 * gros déplacement. Sous 4, on est déjà au top — pas du striking distance.
 *
 * Stratégie de cluster : on filtre sur le vocabulaire rénovation énergétique
 * (PAC, isolation, MPR, CEE, DPE, audit, RGE, etc.) — c'est là que la fenêtre
 * 6-18 mois pré-Effy est ouverte (cf. mémoire ahrefs-deep-audit-20agents).
 *
 * Sortie :
 *   - docs/audit-ahrefs-2026-05-04/gsc_striking_distance.csv
 *   - docs/audit-ahrefs-2026-05-04/gsc_striking_distance_summary.md
 *
 * Usage :
 *   GSC_CREDENTIALS='{...service-account-json...}' \
 *   GSC_SITE_URL='https://servicesartisans.fr/' \
 *   npx tsx scripts/extract-gsc-striking-distance.ts
 *
 * Variables alternatives : GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY,
 * ou GOOGLE_SERVICE_ACCOUNT_KEY (JSON brut). Voir scripts/gsc-sync.ts pour
 * la conf canonique.
 */
import * as fs from 'fs'
import * as path from 'path'
import { google, type searchconsole_v1 } from 'googleapis'

const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-04')
const OUT_CSV = path.join(OUT_DIR, 'gsc_striking_distance.csv')
const OUT_SUMMARY = path.join(OUT_DIR, 'gsc_striking_distance_summary.md')

const LOOKBACK_DAYS = 90
const GSC_ROW_LIMIT = 25000
const STRIKING_MIN_POS = 4
const STRIKING_MAX_POS = 20.5
const MIN_IMPRESSIONS = 50

type Cluster =
  | 'pompe-a-chaleur'
  | 'isolation'
  | 'maprimerenov'
  | 'cee-prime'
  | 'rge'
  | 'audit-dpe'
  | 'eco-ptz'
  | 'chauffage'
  | 'ventilation-vmc'
  | 'solaire'
  | 'fenetres-menuiserie'
  | 'aides-territoire'
  | 'autre-renovation'

type ClusterRule = {
  cluster: Cluster
  /** Mots-clés positifs : si l'un présent, candidat. */
  any: readonly string[]
  /** Optionnel : mot-clé bloquant (ex : "occasion" pour PAC). */
  blockers?: readonly string[]
}

const CLUSTER_RULES: readonly ClusterRule[] = [
  {
    cluster: 'pompe-a-chaleur',
    any: [
      'pompe a chaleur',
      'pompe à chaleur',
      'pac air-eau',
      'pac air eau',
      'pac geothermie',
      'qualipac',
    ],
  },
  {
    cluster: 'isolation',
    any: ['isolation', 'ite', 'iti', 'comble', 'rampant', 'sarking'],
  },
  {
    cluster: 'maprimerenov',
    any: ['maprimerenov', 'ma prime renov', 'maprime renov', 'prime renov', 'mpr '],
  },
  {
    cluster: 'cee-prime',
    any: ['cee', 'certificat economie', 'coup de pouce', 'prime energie'],
    blockers: ['ceestre', 'ceeppe'],
  },
  {
    cluster: 'rge',
    any: ['rge', 'reconnu garant', 'qualibat', 'qualifelec', 'qualibois', 'qualisol'],
  },
  {
    cluster: 'audit-dpe',
    any: ['dpe', 'audit energetique', 'audit énergétique', 'diagnostic performance', 'passoire'],
  },
  {
    cluster: 'eco-ptz',
    any: ['eco-ptz', 'eco ptz', 'éco-ptz', 'pret taux zero', 'prêt taux zéro'],
  },
  {
    cluster: 'chauffage',
    any: [
      'chauffage',
      'chaudiere',
      'chaudière',
      'poele',
      'poêle',
      'granule',
      'granulé',
      'biomasse',
    ],
    blockers: ['chauffage central voiture'],
  },
  {
    cluster: 'ventilation-vmc',
    any: ['vmc', 'ventilation double flux', 'vmc double flux', 'ventilation simple flux'],
  },
  {
    cluster: 'solaire',
    any: [
      'panneau solaire',
      'photovoltaique',
      'photovoltaïque',
      'solaire thermique',
      'autoconsommation',
    ],
  },
  {
    cluster: 'fenetres-menuiserie',
    any: ['fenetre', 'fenêtre', 'double vitrage', 'menuiserie', "porte d'entree", 'volet'],
  },
  {
    cluster: 'aides-territoire',
    any: ['aide renovation', 'aides renovation', 'subvention', 'anah', 'france renov'],
  },
]

type GscRow = {
  query: string
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

type ClassifiedRow = GscRow & {
  cluster: Cluster
  /** Quick-win score : impressions × proximité-top-3 (10 - position). */
  score: number
}

function createGSCClient(): searchconsole_v1.Searchconsole {
  const rawCredentials = process.env.GSC_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (rawCredentials) {
    const credentials = JSON.parse(rawCredentials)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    return google.searchconsole({ version: 'v1', auth })
  }

  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !privateKey) {
    throw new Error(
      'GSC credentials missing. Set GSC_CREDENTIALS (JSON) or GSC_SERVICE_ACCOUNT_EMAIL + GSC_PRIVATE_KEY'
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  return google.searchconsole({ version: 'v1', auth })
}

function getSiteUrl(): string {
  const siteUrl = process.env.GSC_SITE_URL
  if (siteUrl) return siteUrl
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  return publicUrl.replace(/\/+$/, '') + '/'
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  end.setDate(end.getDate() - 3)
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, "'")
}

function classify(query: string): Cluster | null {
  const q = normalize(query)
  for (const rule of CLUSTER_RULES) {
    if (rule.blockers?.some((b) => q.includes(normalize(b)))) continue
    if (rule.any.some((kw) => q.includes(normalize(kw)))) return rule.cluster
  }
  return null
}

async function fetchAllRows(
  client: searchconsole_v1.Searchconsole,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<GscRow[]> {
  const all: GscRow[] = []
  let startRow = 0

  while (true) {
    const response = await client.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: GSC_ROW_LIMIT,
        startRow,
        type: 'web',
      },
    })
    const rows = response.data.rows ?? []
    if (rows.length === 0) break

    for (const r of rows) {
      const [query, page] = r.keys ?? []
      if (!query || !page) continue
      all.push({
        query,
        page,
        impressions: r.impressions ?? 0,
        clicks: r.clicks ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      })
    }

    if (rows.length < GSC_ROW_LIMIT) break
    startRow += GSC_ROW_LIMIT
    process.stderr.write(`  fetched ${all.length} rows, paginating from ${startRow}...\n`)
  }

  return all
}

function classifyRows(rows: GscRow[]): ClassifiedRow[] {
  const out: ClassifiedRow[] = []
  for (const r of rows) {
    if (r.position < STRIKING_MIN_POS || r.position > STRIKING_MAX_POS) continue
    if (r.impressions < MIN_IMPRESSIONS) continue
    const cluster = classify(r.query)
    if (!cluster) continue
    const proximity = Math.max(0, 10 - r.position)
    const score = r.impressions * proximity
    out.push({ ...r, cluster, score })
  }
  return out
}

function csvEscape(s: string | number): string {
  const v = String(s)
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function writeCsv(rows: ClassifiedRow[]): void {
  const header = [
    'cluster',
    'query',
    'page',
    'impressions',
    'clicks',
    'ctr_pct',
    'position',
    'score',
  ].join(',')
  const sorted = [...rows].sort((a, b) => b.score - a.score)
  const body = sorted
    .map((r) =>
      [
        r.cluster,
        csvEscape(r.query),
        csvEscape(r.page),
        r.impressions,
        r.clicks,
        (r.ctr * 100).toFixed(2),
        r.position.toFixed(2),
        Math.round(r.score),
      ].join(',')
    )
    .join('\n')
  fs.writeFileSync(OUT_CSV, `${header}\n${body}\n`, 'utf8')
}

function writeSummary(
  rows: ClassifiedRow[],
  dateRange: { startDate: string; endDate: string }
): void {
  const total = rows.length
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)

  const byCluster = new Map<Cluster, ClassifiedRow[]>()
  for (const r of rows) {
    const arr = byCluster.get(r.cluster) ?? []
    arr.push(r)
    byCluster.set(r.cluster, arr)
  }

  const lines: string[] = []
  lines.push(`# GSC Striking Distance — rénovation énergétique`)
  lines.push('')
  lines.push(
    `Source : Google Search Console API — données ${dateRange.startDate} → ${dateRange.endDate} (90 jours).`
  )
  lines.push(
    `Filtre : position ${STRIKING_MIN_POS}-${STRIKING_MAX_POS}, impressions ≥ ${MIN_IMPRESSIONS}, cluster réno.`
  )
  lines.push('')
  lines.push(`**Total queries striking-distance** : ${total}`)
  lines.push(`**Total impressions sur 90j** : ${totalImpressions.toLocaleString('fr-FR')}`)
  lines.push(`**Clics actuels** : ${totalClicks.toLocaleString('fr-FR')}`)
  lines.push('')

  const clusterRows: Array<[Cluster, number, number, number]> = []
  for (const [cluster, list] of byCluster.entries()) {
    const imp = list.reduce((s, r) => s + r.impressions, 0)
    const clk = list.reduce((s, r) => s + r.clicks, 0)
    clusterRows.push([cluster, list.length, imp, clk])
  }
  clusterRows.sort((a, b) => b[2] - a[2])

  lines.push(`## Par cluster (trié par impressions)`)
  lines.push('')
  lines.push(`| Cluster | Queries | Impressions 90j | Clics 90j |`)
  lines.push(`|---|---:|---:|---:|`)
  for (const [c, n, imp, clk] of clusterRows) {
    lines.push(`| ${c} | ${n} | ${imp.toLocaleString('fr-FR')} | ${clk.toLocaleString('fr-FR')} |`)
  }
  lines.push('')

  lines.push(`## Top 30 quick-wins (score = impressions × (10 − position))`)
  lines.push('')
  lines.push(`| # | Cluster | Query | Page | Imp | Clic | CTR % | Pos | Score |`)
  lines.push(`|---:|---|---|---|---:|---:|---:|---:|---:|`)
  const top = [...rows].sort((a, b) => b.score - a.score).slice(0, 30)
  top.forEach((r, i) => {
    const pageShort = r.page.replace('https://servicesartisans.fr', '')
    const queryShort = r.query.length > 60 ? `${r.query.slice(0, 60)}…` : r.query
    lines.push(
      `| ${i + 1} | ${r.cluster} | ${queryShort} | ${pageShort} | ${r.impressions} | ${r.clicks} | ${(r.ctr * 100).toFixed(1)} | ${r.position.toFixed(1)} | ${Math.round(r.score)} |`
    )
  })
  lines.push('')

  lines.push(`## Lecture stratégique`)
  lines.push('')
  lines.push(
    `- **Position 4-10** = quick wins on-page (title fitting au plus fort intent, FS-bait paragraphe initial, internal-link boost).`
  )
  lines.push(
    `- **Position 11-20** = striking distance classique. Audit contenu vs SERP top 3, ajout sections couvrant les sub-intents manquants.`
  )
  lines.push(
    `- Score = impressions × (10 − position) → privilégie les queries hauts volumes ET déjà proches du top.`
  )
  lines.push(
    `- Cross-check toujours avec rank Ahrefs Bloc 1 si KW présent (vérifie qu'on ne tape pas un cluster où Effy/Hellio rentrent en force).`
  )

  fs.writeFileSync(OUT_SUMMARY, lines.join('\n'), 'utf8')
}

async function main(): Promise<void> {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  const client = createGSCClient()
  const siteUrl = getSiteUrl()
  const dateRange = getDateRange(LOOKBACK_DAYS)

  process.stderr.write(`GSC site: ${siteUrl}\n`)
  process.stderr.write(`Range: ${dateRange.startDate} → ${dateRange.endDate}\n`)
  process.stderr.write(`Fetching all queries…\n`)

  const rawRows = await fetchAllRows(client, siteUrl, dateRange.startDate, dateRange.endDate)
  process.stderr.write(`  ${rawRows.length} raw rows fetched.\n`)

  const classified = classifyRows(rawRows)
  process.stderr.write(`  ${classified.length} rows in striking distance × cluster réno.\n`)

  writeCsv(classified)
  writeSummary(classified, dateRange)

  process.stderr.write(`\nWrote:\n  ${OUT_CSV}\n  ${OUT_SUMMARY}\n`)
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
