/**
 * Script soumission dataset data.gouv.fr — Indice Rénovation 2026
 *
 * Usage :
 *   # dry-run (défaut) : affiche le payload, AUCUN POST réseau
 *   npx tsx tmp/datagouv-submission-2026-05-22/script-submit-datagouv.ts
 *
 *   # live : POST réel sur l'API data.gouv.fr (nécessite API key validée)
 *   DATAGOUV_API_KEY=xxx npx tsx tmp/datagouv-submission-2026-05-22/script-submit-datagouv.ts --live
 *
 *   # update d'un dataset existant
 *   DATAGOUV_API_KEY=xxx npx tsx ... --live --action update --id <dataset_id>
 *
 * Fail-loud :
 *   - --live sans DATAGOUV_API_KEY → exit 1 explicite
 *   - --action update sans --id → exit 1
 *   - HTTP non-2xx → exit 1 avec body API
 *
 * Critique :
 *   - Pas de modification de fichier hors `tmp/` ce script.
 *   - Pas de logs sur stdout en dehors des [info] préfixés.
 *   - JAMAIS de fallback silencieux (cf règles CLAUDE.md).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const API_BASE = 'https://www.data.gouv.fr/api/1'
const PAYLOAD_PATH = path.resolve(
  process.cwd(),
  'tmp/datagouv-submission-2026-05-22/dataset-metadata.json'
)

type Args = {
  live: boolean
  action: 'create' | 'update'
  id: string | null
}

function parseArgs(argv: string[]): Args {
  let live = false
  let action: 'create' | 'update' = 'create'
  let id: string | null = null

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--live') live = true
    else if (a === '--dry-run') live = false
    else if (a === '--action') {
      const next = argv[++i]
      if (next !== 'create' && next !== 'update') {
        fail(`--action must be create|update (got: ${String(next)})`)
      }
      action = next
    } else if (a === '--id') {
      id = argv[++i] ?? null
    }
  }
  return { live, action, id }
}

function fail(msg: string): never {
  console.error(`[fatal] ${msg}`)
  process.exit(1)
}

function info(msg: string): void {
  // eslint-disable-next-line no-console
  console.log(`[info] ${msg}`)
}

async function loadPayload(): Promise<Record<string, unknown>> {
  let raw: string
  try {
    raw = await fs.readFile(PAYLOAD_PATH, 'utf-8')
  } catch (err) {
    fail(`cannot read payload at ${PAYLOAD_PATH}: ${(err as Error).message}`)
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch (err) {
    fail(`payload JSON parse failed: ${(err as Error).message}`)
  }
}

async function submitCreate(payload: Record<string, unknown>, apiKey: string): Promise<void> {
  const url = `${API_BASE}/datasets/`
  info(`POST ${url}`)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'ServicesArtisans-Datagouv-Submission/1.0',
    },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  if (!res.ok) {
    fail(`HTTP ${res.status} from data.gouv.fr — body: ${text.slice(0, 2000)}`)
  }
  info(`HTTP ${res.status} OK — response body:`)
  // eslint-disable-next-line no-console
  console.log(text)
}

async function submitUpdate(
  payload: Record<string, unknown>,
  apiKey: string,
  id: string
): Promise<void> {
  const url = `${API_BASE}/datasets/${encodeURIComponent(id)}/`
  info(`PUT ${url}`)
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'ServicesArtisans-Datagouv-Submission/1.0',
    },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  if (!res.ok) {
    fail(`HTTP ${res.status} from data.gouv.fr — body: ${text.slice(0, 2000)}`)
  }
  info(`HTTP ${res.status} OK — response body:`)
  // eslint-disable-next-line no-console
  console.log(text)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const payload = await loadPayload()

  info(`mode = ${args.live ? 'LIVE' : 'DRY-RUN'}, action = ${args.action}`)
  info(`payload title = ${String(payload.title)}`)
  info(`payload license = ${String(payload.license)}`)
  info(`payload tags = ${(payload.tags as unknown[] | undefined)?.length ?? 0}`)
  info(`payload resources = ${(payload.resources as unknown[] | undefined)?.length ?? 0}`)

  if (!args.live) {
    info('[dry-run] would POST/PUT this payload to data.gouv.fr — exiting.')
    info('[dry-run] full payload:')
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  const apiKey = process.env.DATAGOUV_API_KEY
  if (!apiKey || apiKey.length < 8) {
    fail('--live requires DATAGOUV_API_KEY env var (got empty or < 8 chars)')
  }

  if (args.action === 'update' && !args.id) {
    fail('--action update requires --id <dataset_id>')
  }

  if (args.action === 'create') {
    await submitCreate(payload, apiKey)
  } else {
    await submitUpdate(payload, apiKey, args.id as string)
  }
}

main().catch((err) => {
  fail(`unexpected error: ${(err as Error).message}`)
})
