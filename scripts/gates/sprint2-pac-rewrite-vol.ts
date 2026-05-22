/**
 * Gate Sprint 2 — PAC rewrite organic volume (Ahrefs rerank).
 *
 * Lit l'export Ahrefs `tmp/ahrefs-pac-rerank.csv` (Site Explorer > Organic
 * Keywords filtré sur le préfixe PAC) et somme `search_volume` pour les
 * keywords positionnés ≤ 20 sur les URLs du cluster PAC.
 *
 * Cible : 50 000 vol/mois cumulé sur le cluster PAC après le rewrite Sprint 2.
 *
 * Format CSV attendu (Ahrefs Organic Keywords export) :
 *   Keyword,Volume,KD,CPC,Position,URL,...
 *   pompe a chaleur air eau,18000,32,4.5,12,https://servicesartisans.fr/renovation-energetique/travaux/pompe-a-chaleur/...
 *
 * Le matcher URL accepte les variantes courantes du cluster PAC :
 *   /renovation-energetique/travaux/pompe-a-chaleur/
 *   /renovation-energetique/travaux/pac-air-eau/
 *   /renovation-energetique/travaux/pac-air-air/
 *   /renovation-energetique/travaux/pac-geothermie/
 *   /renovation-energetique/travaux/pac-eau-eau/
 *   /services/pompe-a-chaleur/
 *
 * Variables d'env :
 *   AHREFS_PAC_CSV    chemin custom (défaut tmp/ahrefs-pac-rerank.csv)
 *   PAC_VOL_TARGET    cible vol cumulé (défaut 50000)
 *   PAC_POS_MAX       position max retenue (défaut 20)
 *
 * Sortie : tmp/gate-s2-{ISO}.json
 *
 * Usage :
 *   npx tsx scripts/gates/sprint2-pac-rewrite-vol.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')
const CSV_PATH = process.env.AHREFS_PAC_CSV ?? path.join(TMP_DIR, 'ahrefs-pac-rerank.csv')
const TARGET = Number(process.env.PAC_VOL_TARGET ?? '50000')
const POS_MAX = Number(process.env.PAC_POS_MAX ?? '20')

const PAC_PATTERNS: readonly RegExp[] = [
  /\/renovation-energetique\/travaux\/pompe-a-chaleur\//i,
  /\/renovation-energetique\/travaux\/pac-air-eau\//i,
  /\/renovation-energetique\/travaux\/pac-air-air\//i,
  /\/renovation-energetique\/travaux\/pac-geothermie\//i,
  /\/renovation-energetique\/travaux\/pac-eau-eau\//i,
  /\/services\/pompe-a-chaleur\//i,
]

type GateResult = {
  gate: 'S2'
  metric: 'pac_cluster_search_volume_top20'
  current: number
  baseline: number
  delta_pct: number
  target_pct: number
  passed: boolean
  checked_at: string
  notes: string
}

function parseCsvLine(line: string): string[] {
  // Ahrefs CSV: keywords + URLs can contain commas; respect double-quotes.
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

function urlMatchesPac(url: string): boolean {
  return PAC_PATTERNS.some((re) => re.test(url))
}

function sumVolume(filePath: string): { totalVolume: number; matched: number } {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `CSV introuvable : ${filePath}. Export Ahrefs > Site Explorer > Organic Keywords ` +
        `filtré sur servicesartisans.fr préfixe PAC, position ≤ ${POS_MAX}.`
    )
  }
  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) throw new Error(`CSV vide : ${filePath}`)

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const volIdx = headers.findIndex((h) => h === 'volume' || h === 'search volume')
  const posIdx = headers.findIndex((h) => h === 'position' || h === 'current position')
  const urlIdx = headers.findIndex((h) => h === 'url' || h.includes('current url'))
  if (volIdx === -1 || posIdx === -1 || urlIdx === -1) {
    throw new Error(
      `Header CSV invalide. Attendu colonnes Volume + Position + URL. Reçu : ${headers.join(', ')}`
    )
  }

  let total = 0
  let matched = 0
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const url = cols[urlIdx] ?? ''
    const pos = Number(cols[posIdx] ?? '999')
    const vol = Number(cols[volIdx] ?? '0')
    if (!Number.isFinite(pos) || pos > POS_MAX) continue
    if (!urlMatchesPac(url)) continue
    if (!Number.isFinite(vol)) continue
    total += vol
    matched += 1
  }
  return { totalVolume: total, matched }
}

function main(): void {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  let current = 0
  let notes = ''
  try {
    const { totalVolume, matched } = sumVolume(CSV_PATH)
    current = totalVolume
    notes = `Source CSV : ${CSV_PATH}. ${matched} keywords retenus (pos ≤ ${POS_MAX}, cluster PAC).`
  } catch (err) {
    notes = `ECHEC lecture CSV : ${(err as Error).message}`
    // eslint-disable-next-line no-console
    console.error(notes)
  }

  const deltaPct = TARGET > 0 ? ((current - TARGET) / TARGET) * 100 : 0
  const passed = current >= TARGET

  const result: GateResult = {
    gate: 'S2',
    metric: 'pac_cluster_search_volume_top20',
    current,
    baseline: TARGET,
    delta_pct: Number(deltaPct.toFixed(2)),
    target_pct: 0,
    passed,
    checked_at: new Date().toISOString(),
    notes,
  }

  const outPath = path.join(TMP_DIR, `gate-s2-${result.checked_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2))
  // eslint-disable-next-line no-console
  console.log(`\nGate S2 ${passed ? 'PASS' : 'FAIL'} — résultat écrit dans ${outPath}`)

  if (!passed) process.exit(1)
}

main()
