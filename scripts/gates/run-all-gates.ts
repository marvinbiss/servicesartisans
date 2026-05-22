/**
 * Orchestrateur de tous les gates Sprint 1-5.
 *
 * Lance chaque gate en sous-processus (npx tsx) pour isoler les exits et
 * éviter qu'un FAIL ne stoppe les autres. Agrège les JSON produits dans
 * `tmp/gate-s{1..5}-{ISO}.json` (le dernier fichier de chaque sprint) et
 * écrit `tmp/gates-status-{ISO}.json` avec le récap.
 *
 * Exit code :
 *   0 si tous les gates PASS
 *   1 si au moins un FAIL
 *   2 si erreur infra (gate non trouvé, etc.)
 *
 * Usage :
 *   npx tsx scripts/gates/run-all-gates.ts
 *
 * Variables d'env : voir chaque gate individuellement.
 */
import * as fs from 'fs'
import * as path from 'path'
import { spawnSync } from 'child_process'

const GATES_DIR = __dirname
const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')

const GATE_SCRIPTS: ReadonlyArray<{ id: string; script: string }> = [
  { id: 'S1', script: 'sprint1-vmc-clicks.ts' },
  { id: 'S2', script: 'sprint2-pac-rewrite-vol.ts' },
  { id: 'S3', script: 'sprint3-dpe-indexed.ts' },
  { id: 'S4', script: 'sprint4-pac-leads.ts' },
  { id: 'S5', script: 'sprint5-embeds-tier1.ts' },
]

type GateOutcome = {
  id: string
  script: string
  exit_code: number
  passed: boolean
  result_file: string | null
  current: number | null
  baseline: number | null
  notes: string | null
}

function findLatestResult(gateId: string): string | null {
  const prefix = `gate-${gateId.toLowerCase()}-`
  if (!fs.existsSync(TMP_DIR)) return null
  const files = fs
    .readdirSync(TMP_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .map((f) => ({ f, mtime: fs.statSync(path.join(TMP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  return files.length > 0 ? path.join(TMP_DIR, files[0].f) : null
}

function runGate(scriptName: string): { exitCode: number } {
  const scriptPath = path.join(GATES_DIR, scriptName)
  const res = spawnSync('npx', ['tsx', scriptPath], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  return { exitCode: res.status ?? 1 }
}

function main(): void {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  // eslint-disable-next-line no-console
  console.log('=== Run all gates Sprint 1-5 ===\n')

  const outcomes: GateOutcome[] = []

  for (const gate of GATE_SCRIPTS) {
    // eslint-disable-next-line no-console
    console.log(`\n--- Gate ${gate.id} : ${gate.script} ---`)
    const { exitCode } = runGate(gate.script)
    const resultFile = findLatestResult(gate.id)
    let current: number | null = null
    let baseline: number | null = null
    let notes: string | null = null
    let passed = exitCode === 0

    if (resultFile) {
      try {
        const data = JSON.parse(fs.readFileSync(resultFile, 'utf8')) as {
          current?: number
          baseline?: number
          passed?: boolean
          notes?: string
        }
        current = data.current ?? null
        baseline = data.baseline ?? null
        notes = data.notes ?? null
        if (typeof data.passed === 'boolean') passed = data.passed
      } catch {
        /* parse error tolerated */
      }
    }

    outcomes.push({
      id: gate.id,
      script: gate.script,
      exit_code: exitCode,
      passed,
      result_file: resultFile,
      current,
      baseline,
      notes,
    })
  }

  const passedCount = outcomes.filter((o) => o.passed).length
  const allPassed = passedCount === outcomes.length

  const summary = {
    checked_at: new Date().toISOString(),
    total: outcomes.length,
    passed: passedCount,
    failed: outcomes.length - passedCount,
    overall_passed: allPassed,
    gates: outcomes,
  }

  const outPath = path.join(
    TMP_DIR,
    `gates-status-${summary.checked_at.replace(/[:.]/g, '-')}.json`
  )
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8')

  // eslint-disable-next-line no-console
  console.log('\n=== Récap ===')
  // eslint-disable-next-line no-console
  console.log('Gate | Pass | Current     | Baseline    | Exit')
  // eslint-disable-next-line no-console
  console.log('-----|------|-------------|-------------|-----')
  for (const o of outcomes) {
    const cur = o.current !== null ? String(o.current).padEnd(11) : '   n/a     '
    const base = o.baseline !== null ? String(o.baseline).padEnd(11) : '   n/a     '
    // eslint-disable-next-line no-console
    console.log(` ${o.id}  |  ${o.passed ? 'OK ' : 'KO '} | ${cur} | ${base} | ${o.exit_code}`)
  }
  // eslint-disable-next-line no-console
  console.log(`\n${passedCount}/${outcomes.length} gates PASS.`)
  // eslint-disable-next-line no-console
  console.log(`Résumé écrit dans ${outPath}`)

  process.exit(allPassed ? 0 : 1)
}

main()
