#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { buildAllGoogleDatasetJsonLd } from '../src/manifests/google-dataset.mjs'
import { slugify, writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/google-dataset' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const datasets = buildAllGoogleDatasetJsonLd()
for (const ds of datasets) {
  const filename = `${slugify(ds.name)}.jsonld`
  const target = await writeManifest(values.out, filename, ds)
  process.stdout.write(`Wrote ${target}\n`)
}
process.stdout.write(
  `OK: ${datasets.length} Google Dataset JSON-LD manifest(s) generated. dry-run=${dryRun}\n`,
)
