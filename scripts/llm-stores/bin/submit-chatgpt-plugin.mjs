#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { buildChatGptPluginManifest } from '../src/manifests/chatgpt-plugin.mjs'
import { writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/chatgpt-plugin' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const payload = buildChatGptPluginManifest()
const target = await writeManifest(values.out, 'ai-plugin.json', payload)
process.stdout.write(`Wrote ${target}\n`)
process.stdout.write(
  `OK: ChatGPT ai-plugin.json manifest generated. dry-run=${dryRun}\n`,
)
