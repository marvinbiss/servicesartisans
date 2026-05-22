/**
 * Gate Sprint 1 — VMC cluster clicks 30 jours.
 *
 * Lit l'export GSC `tmp/gsc-vmc-export.csv` (paste manuel, jamais MCP GSC :
 * cf. règle global feedback_gsc_manual_paste), filtre les lignes du cluster
 * `/renovation-energetique/travaux/vmc/`, somme les clics 30 jours, compare
 * à la baseline (cible +30% vs baseline pour valider le gate).
 *
 * Format CSV attendu (GSC export "Pages") :
 *   Top pages,Clicks,Impressions,CTR,Position
 *   https://servicesartisans.fr/renovation-energetique/travaux/vmc/...,123,4567,2.7%,18.4
 *
 * Variables d'env :
 *   GSC_VMC_CSV       chemin custom du CSV (défaut tmp/gsc-vmc-export.csv)
 *   GSC_VMC_BASELINE  baseline clics/jour (défaut 12 = 360 sur 30 jours)
 *
 * Sortie : tmp/gate-s1-{ISO}.json
 *
 * Usage :
 *   npx tsx scripts/gates/sprint1-vmc-clicks.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')
const CSV_PATH = process.env.GSC_VMC_CSV ?? path.join(TMP_DIR, 'gsc-vmc-export.csv')
const BASELINE_PER_DAY = Number(process.env.GSC_VMC_BASELINE ?? '12')
const BASELINE_30D = BASELINE_PER_DAY * 30
const TARGET_PCT = 30
const CLUSTER_PREFIX = '/renovation-energetique/travaux/vmc/'

type GateResult = {
  gate: 'S1'
  metric: 'vmc_cluster_clicks_30d'
  current: number
  baseline: number
  delta_pct: number
  target_pct: number
  passed: boolean
  checked_at: string
  notes: string
}

function parseCsvLine(line: string): string[] {
  // GSC exports use simple CSV (no embedded commas in URLs). Split on comma,
  // strip surrounding double-quotes if present.
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
}

function readClicksFromCsv(filePath: string): number {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `CSV introuvable : ${filePath}. Exporter depuis GSC > Performance > Pages, ` +
        `filtrer par préfixe ${CLUSTER_PREFIX}, sauvegarder en CSV.`
    )
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    throw new Error(`CSV vide ou sans data : ${filePath}`)
  }

  // Detect header — find columns "Page"/"URL" and "Clicks"
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const urlIdx = headers.findIndex((h) => h.includes('page') || h.includes('url'))
  const clicksIdx = headers.findIndex((h) => h.includes('click'))
  if (urlIdx === -1 || clicksIdx === -1) {
    throw new Error(
      `Header CSV invalide. Attendu une colonne Page/URL et Clicks. Reçu : ${headers.join(', ')}`
    )
  }

  let total = 0
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const url = cols[urlIdx] ?? ''
    if (!url.includes(CLUSTER_PREFIX)) continue
    const n = Number(cols[clicksIdx] ?? '0')
    if (!Number.isFinite(n)) continue
    total += n
  }
  return total
}

function main(): void {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  let current = 0
  let notes = ''
  try {
    current = readClicksFromCsv(CSV_PATH)
    notes = `Source CSV : ${CSV_PATH}. Cluster prefix : ${CLUSTER_PREFIX}.`
  } catch (err) {
    notes = `ECHEC lecture CSV : ${(err as Error).message}`
    // eslint-disable-next-line no-console
    console.error(notes)
  }

  const deltaPct = BASELINE_30D > 0 ? ((current - BASELINE_30D) / BASELINE_30D) * 100 : 0
  const passed = current > 0 && deltaPct >= TARGET_PCT

  const result: GateResult = {
    gate: 'S1',
    metric: 'vmc_cluster_clicks_30d',
    current,
    baseline: BASELINE_30D,
    delta_pct: Number(deltaPct.toFixed(2)),
    target_pct: TARGET_PCT,
    passed,
    checked_at: new Date().toISOString(),
    notes,
  }

  const outPath = path.join(TMP_DIR, `gate-s1-${result.checked_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2))
  // eslint-disable-next-line no-console
  console.log(`\nGate S1 ${passed ? 'PASS' : 'FAIL'} — résultat écrit dans ${outPath}`)

  if (!passed) process.exit(1)
}

main()
