#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const STORES = [
  'submit-llmstxt.mjs',
  'submit-data-gouv.mjs',
  'submit-google-dataset.mjs',
  'submit-hf.mjs',
  'submit-mcp-registry.mjs',
  'submit-chatgpt-plugin.mjs',
  'refresh-wikidata-stub.mjs',
]

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const flag = dryRun ? '--dry-run' : '--no-dry-run'

function runOne(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, script), flag], {
      stdio: 'inherit',
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${script} exited with ${code}`))
    })
    child.on('error', reject)
  })
}

let failures = 0
for (const script of STORES) {
  process.stdout.write(`\n--- ${script} ---\n`)
  try {
    await runOne(script)
  } catch (err) {
    failures += 1
    process.stderr.write(`FAILED: ${script}: ${err.message}\n`)
  }
}

process.stdout.write(
  `\nSummary: ${STORES.length - failures}/${STORES.length} stores OK. dry-run=${dryRun}\n`,
)
if (failures > 0) process.exit(1)
