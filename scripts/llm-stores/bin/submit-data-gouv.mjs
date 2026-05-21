#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { buildDataGouvAllDatasets } from '../src/manifests/data-gouv.mjs'
import { slugify, writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/data-gouv' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const datasets = buildDataGouvAllDatasets()
for (const ds of datasets) {
  const filename = `${slugify(ds.title)}.json`
  const target = await writeManifest(values.out, filename, ds)
  process.stdout.write(`Wrote ${target}\n`)
}
process.stdout.write(
  `OK: ${datasets.length} data.gouv.fr dataset manifest(s) generated. dry-run=${dryRun}\n`,
)
