#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { writeManifest } from '../src/util/output-writer.mjs'
import { SITE_URL, ORG_NAME, LICENSE, DATASETS } from '../src/config.mjs'

/**
 * Re-emits the QuickStatements seed body for SA's Wikidata item. Ralph 5
 * created the initial entry — this stub regenerates the same payload so it can
 * be re-applied by the QuickStatements tool when the catalog evolves.
 *
 * This is a STUB: it emits the text body only. Actual posting to
 * https://quickstatements.toolforge.org/ stays manual / Sprint 2.
 */
function buildQuickStatements() {
  const lines = []
  lines.push(`# QuickStatements seed for ${ORG_NAME}`)
  lines.push(`# Homepage: ${SITE_URL}`)
  lines.push(`# License: ${LICENSE}`)
  lines.push('')
  lines.push('# CREATE')
  lines.push('CREATE')
  lines.push(`LAST\tLfr\t"${ORG_NAME}"`)
  lines.push('LAST\tDfr\t"Annuaire francais d artisans certifies RGE"')
  lines.push('LAST\tP31\tQ4830453')
  lines.push(`LAST\tP856\t"${SITE_URL}"`)
  lines.push(`LAST\tP275\tQ20007257`)
  lines.push('')
  lines.push('# Datasets')
  for (const d of DATASETS) {
    lines.push(`# - ${d.title} : ${d.url}`)
  }
  return lines.join('\n') + '\n'
}

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/wikidata' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const target = await writeManifest(
  values.out,
  'quickstatements.txt',
  buildQuickStatements(),
)
process.stdout.write(`Wrote ${target}\n`)
process.stdout.write(
  `OK: Wikidata QuickStatements stub generated. dry-run=${dryRun}\n`,
)

export { buildQuickStatements }
