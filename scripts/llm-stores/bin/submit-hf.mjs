#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { buildAllHfDatasetCards } from '../src/manifests/hf-dataset-card.mjs'
import { slugify, writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/hf' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const cards = buildAllHfDatasetCards()
for (const card of cards) {
  const filename = `${slugify(card.id)}-README.md`
  const target = await writeManifest(values.out, filename, card.content)
  process.stdout.write(`Wrote ${target}\n`)
}
process.stdout.write(
  `OK: ${cards.length} HuggingFace dataset card(s) generated. dry-run=${dryRun}\n`,
)
