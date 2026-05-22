/**
 * Sprint 5 (2026-05-22) — IndexNow ping pour l'Indice Rénovation +
 * cluster Ballon thermodynamique.
 *
 * URLs poussées :
 *   1. /barometre/renovation-energetique-2026
 *      Page baromètre CC-BY 4.0 (Sprint 5). Cible Linkable Asset pour les
 *      backlinks médias rénovation. Bing/Yandex doivent crawler vite pour
 *      servir l'AI Overview "indice rénovation France 2026".
 *   2. /api/v1/barometre/renovation/embed.html
 *      Endpoint embed HTML CC-BY 4.0 que les médias intègrent en iframe.
 *      Doit être indexé pour le suivi backlinks via signature canonical.
 *   3. /renovation-energetique/travaux/ballon-thermodynamique/prix
 *      Pillar prix ballon thermodynamique (Sprint 20/80 commercial KD≤5).
 *   4. /renovation-energetique/travaux/ballon-thermodynamique/installation
 *      Pillar installation, jumeau du précédent dans le funnel devis.
 *
 * Pourquoi un script et pas /api/indexnow ?
 *   - One-shot opérationnel post-déploiement (cf. indexnow-sprint-v-canonical-rge).
 *   - Permet --dry-run pour valider sans push réel ni quota gaspillé.
 *   - Trace fichier `tmp/indexnow-sprint5-{ISO}.log` pour audit a posteriori.
 *
 * Usage :
 *   npx tsx scripts/indexnow-sprint5-barometre.ts [--dry-run]
 *
 * Prérequis :
 *   - INDEXNOW_API_KEY dans .env.local (même secret que prod)
 *   - Page baromètre et endpoint embed déployés en prod (sinon 404 ⇒ Bing
 *     invalide la soumission)
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

const SPRINT5_URLS: readonly string[] = [
  `${SITE_URL}/barometre/renovation-energetique-2026`,
  `${SITE_URL}/api/v1/barometre/renovation/embed.html`,
  `${SITE_URL}/renovation-energetique/travaux/ballon-thermodynamique/prix`,
  `${SITE_URL}/renovation-energetique/travaux/ballon-thermodynamique/installation`,
]

const DRY_RUN = process.argv.includes('--dry-run')

function nowIso(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function logLine(logPath: string, line: string): void {
  // eslint-disable-next-line no-console
  console.log(line)
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, 'utf8')
}

async function submitBatch(key: string, urls: string[]): Promise<{ status: number; ok: boolean }> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(15000),
  })
  return { status: res.status, ok: res.ok || res.status === 202 }
}

async function main(): Promise<void> {
  const tmpDir = path.join(__dirname, '..', 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  const logPath = path.join(tmpDir, `indexnow-sprint5-${nowIso()}.log`)

  logLine(logPath, '=== IndexNow Sprint 5 — baromètre + ballon thermodynamique ===')
  logLine(logPath, `Mode    : ${DRY_RUN ? 'DRY-RUN (no submit)' : 'LIVE SUBMIT'}`)
  logLine(logPath, `Site    : ${SITE_URL}`)
  logLine(logPath, `URLs    : ${SPRINT5_URLS.length}`)
  for (const u of SPRINT5_URLS) logLine(logPath, `  - ${u}`)

  if (DRY_RUN) {
    logLine(logPath, '[DRY-RUN] aucune soumission effectuée. Retire --dry-run pour pousser.')
    logLine(logPath, `Log : ${logPath}`)
    return
  }

  const key = process.env.INDEXNOW_API_KEY
  if (!key) {
    logLine(logPath, 'FATAL : INDEXNOW_API_KEY absent dans .env.local')
    process.exit(1)
  }

  logLine(logPath, 'Soumission IndexNow…')
  let result: { status: number; ok: boolean }
  try {
    result = await submitBatch(key, [...SPRINT5_URLS])
  } catch (err) {
    logLine(logPath, `FATAL : exception réseau ${String(err)}`)
    process.exit(2)
  }

  logLine(logPath, `Statut HTTP : ${result.status} ${result.ok ? 'OK' : 'FAIL'}`)
  if (!result.ok) {
    logLine(logPath, 'ECHEC : IndexNow a rejeté la soumission.')
    logLine(logPath, `Log : ${logPath}`)
    process.exit(3)
  }

  logLine(logPath, `OK — ${SPRINT5_URLS.length} URLs soumises à Bing/Yandex.`)
  logLine(logPath, 'Recrawl attendu : Bing 24-48h, Yandex 24-72h.')
  logLine(logPath, 'Google : NON couvert par IndexNow — crawl naturel ~7-14j.')
  logLine(logPath, `Log : ${logPath}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[indexnow-sprint5] FATAL :', err)
  process.exit(1)
})
