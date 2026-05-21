#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { buildMcpRegistryApplication } from '../src/manifests/mcp-registry.mjs'
import { writeManifest } from '../src/util/output-writer.mjs'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: true },
    'no-dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'manifest-out/mcp-registry' },
  },
})

const dryRun = values['no-dry-run'] ? false : values['dry-run']
const payload = buildMcpRegistryApplication()
const target = await writeManifest(values.out, 'application.json', payload)
process.stdout.write(`Wrote ${target}\n`)
process.stdout.write(
  `OK: MCP registry application generated. dry-run=${dryRun}\n`,
)
