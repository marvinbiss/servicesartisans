#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { generateLlmsTxt } from '../src/manifests/llmstxt.mjs'
import { writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/llmstxt' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const content = generateLlmsTxt()
const target = await writeManifest(values.out, 'llms.txt', content)
process.stdout.write(`Wrote ${target}\n`)
process.stdout.write(`OK: llms.txt manifest generated. dry-run=${dryRun}\n`)
