/**
 * scripts/llm-stores-submit.ts
 *
 * Orchestrator centralizing submission of the ServicesArtisans MCP server +
 * REST APIs to the 8 main "LLM stores" (MCP registries, AI marketplaces,
 * public API directories).
 *
 * Dry-run by default — only prints which artefacts exist and what manual
 * action Marvin must take. `--no-dry-run` is gated behind explicit
 * credentials (none committed) and is intentionally NOT implemented
 * yet — submissions remain manual until Sprint 2.
 *
 * Usage :
 *   npx tsx scripts/llm-stores-submit.ts                       # all stores, dry-run
 *   npx tsx scripts/llm-stores-submit.ts --store=mcp-registry  # one store
 *   npx tsx scripts/llm-stores-submit.ts --json                # machine output
 *   npx tsx scripts/llm-stores-submit.ts --no-dry-run          # gated, currently fails-loud
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

type StoreReadiness = {
  store: string
  ready: boolean
  artefact: string
  artefactExists: boolean
  bytes: number | null
  manualAction: string
  credentialsNeeded: string[]
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const SUBMISSION_DIR = resolve(REPO_ROOT, 'tmp/llm-stores-submission-2026-05-22')

const STORES: ReadonlyArray<Omit<StoreReadiness, 'ready' | 'artefactExists' | 'bytes'>> = [
  {
    store: 'mcp-registry',
    artefact: `${SUBMISSION_DIR}/mcp-server-manifest.json`,
    manualAction:
      'Open PR on github.com/modelcontextprotocol/servers OR submit form at modelcontextprotocol.io/servers (see mcp-registry-pr.md).',
    credentialsNeeded: ['github_pat (PR opening)'],
  },
  {
    store: 'smithery',
    artefact: `${SUBMISSION_DIR}/smithery-submission.yaml`,
    manualAction:
      'Run `smithery publish ./smithery-submission.yaml` OR submit at smithery.ai/new (see smithery-submission.yaml header).',
    credentialsNeeded: ['SMITHERY_TOKEN', 'github oauth'],
  },
  {
    store: 'glama',
    artefact: `${SUBMISSION_DIR}/glama-submission.md`,
    manualAction:
      'Submit form at glama.ai/mcp/servers (see glama-submission.md for field-by-field values).',
    credentialsNeeded: ['github oauth (Glama login)'],
  },
  {
    store: 'awesome-mcp',
    artefact: `${SUBMISSION_DIR}/awesome-mcp-pr-template.md`,
    manualAction:
      'Open PR on github.com/punkpeye/awesome-mcp-servers using the row template (see awesome-mcp-pr-template.md).',
    credentialsNeeded: ['github_pat (PR opening)'],
  },
  {
    store: 'openai-plugins',
    artefact: `${SUBMISSION_DIR}/openai-plugin-manifest.json`,
    manualAction:
      'Manifest mirrored at public/.well-known/ai-plugin.json. OpenAI plugin store sunset 2024 but still consumed by GPT builders + various Action stores. No active submission step.',
    credentialsNeeded: [],
  },
  {
    store: 'huggingface',
    artefact: `${SUBMISSION_DIR}/huggingface-space-readme.md`,
    manualAction:
      'Create Space at huggingface.co/new-space (org=servicesartisans, name=rge-explorer, SDK=Gradio). Copy README + app.py skeleton.',
    credentialsNeeded: ['HF_TOKEN'],
  },
  {
    store: 'postman-public',
    artefact: `${SUBMISSION_DIR}/postman-collection.json`,
    manualAction:
      'Import postman-collection.json into Postman, publish to Public API Network (visibility=Public) at postman.com/api-network.',
    credentialsNeeded: ['Postman account', 'POSTMAN_API_KEY for CLI'],
  },
  {
    store: 'public-apis',
    artefact: `${SUBMISSION_DIR}/public-apis-pr.md`,
    manualAction:
      'Open PR on github.com/public-apis/public-apis with the markdown row (see public-apis-pr.md). Run repo validator script before submit.',
    credentialsNeeded: ['github_pat (PR opening)'],
  },
]

type CliArgs = {
  store: string | null
  noDryRun: boolean
  json: boolean
}

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    options: {
      store: { type: 'string' },
      'no-dry-run': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
    strict: true,
  })
  return {
    store: typeof values.store === 'string' ? values.store : null,
    noDryRun: Boolean(values['no-dry-run']),
    json: Boolean(values.json),
  }
}

function inspectStore(
  base: Omit<StoreReadiness, 'ready' | 'artefactExists' | 'bytes'>
): StoreReadiness {
  const exists = existsSync(base.artefact)
  let bytes: number | null = null
  let ready = false
  if (exists) {
    const st = statSync(base.artefact)
    bytes = st.size
    if (base.artefact.endsWith('.json')) {
      try {
        JSON.parse(readFileSync(base.artefact, 'utf8'))
        ready = true
      } catch {
        ready = false
      }
    } else {
      ready = bytes > 0
    }
  }
  return { ...base, ready, artefactExists: exists, bytes }
}

function formatHuman(rows: StoreReadiness[], dryRun: boolean): string {
  const lines: string[] = []
  lines.push('ServicesArtisans LLM stores submission — orchestrator')
  lines.push(`mode: ${dryRun ? 'DRY-RUN (default)' : 'LIVE (gated)'}`)
  lines.push(`submission dir: ${SUBMISSION_DIR}`)
  lines.push('')
  for (const r of rows) {
    const status = r.ready ? 'READY' : r.artefactExists ? 'INVALID' : 'MISSING'
    const size = r.bytes != null ? `${r.bytes} B` : '—'
    lines.push(`  [${status.padEnd(7)}] ${r.store.padEnd(20)} ${size.padStart(8)}   ${r.artefact}`)
    lines.push(`            action      : ${r.manualAction}`)
    if (r.credentialsNeeded.length > 0) {
      lines.push(`            credentials : ${r.credentialsNeeded.join(', ')}`)
    }
  }
  lines.push('')
  const readyCount = rows.filter((r) => r.ready).length
  lines.push(`Summary: ${readyCount}/${rows.length} stores ready.`)
  if (!dryRun) {
    lines.push('LIVE mode requested but not implemented — manual submission required.')
  }
  return lines.join('\n')
}

function main() {
  const args = parseCliArgs()
  const filtered = args.store ? STORES.filter((s) => s.store === args.store) : STORES
  if (args.store && filtered.length === 0) {
    const list = STORES.map((s) => s.store).join(', ')
    process.stderr.write(`Unknown --store=${args.store}. Known: ${list}\n`)
    process.exit(2)
  }
  const rows = filtered.map(inspectStore)

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        {
          mode: args.noDryRun ? 'live' : 'dry-run',
          submissionDir: SUBMISSION_DIR,
          stores: rows,
          summary: {
            total: rows.length,
            ready: rows.filter((r) => r.ready).length,
            missing: rows.filter((r) => !r.artefactExists).length,
            invalid: rows.filter((r) => r.artefactExists && !r.ready).length,
          },
        },
        null,
        2
      ) + '\n'
    )
  } else {
    process.stdout.write(formatHuman(rows, !args.noDryRun) + '\n')
  }

  if (args.noDryRun) {
    const missingCreds = rows
      .flatMap((r) => r.credentialsNeeded)
      .filter((c) => !c.toLowerCase().includes('account') && !process.env[c])
    process.stderr.write(
      `\nLIVE mode not implemented. Missing env-gated credentials: ${missingCreds.join(', ') || '(none enumerated)'}\n`
    )
    process.exit(3)
  }
}

main()
