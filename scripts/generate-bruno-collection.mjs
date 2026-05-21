#!/usr/bin/env node
/**
 * scripts/generate-bruno-collection.mjs
 * -------------------------------------
 * CLI : node scripts/generate-bruno-collection.mjs [--out=packages/sa-rge-bruno]
 *
 * Reads the OpenAPI 3.1 spec snapshot (Ralph 27), transforms each operation
 * into a Bruno `.bru` request file, groups by OpenAPI tag, and writes the
 * resulting collection under `packages/sa-rge-bruno/`. The collection is
 * committed (one-click "Open Collection" in Bruno).
 *
 * Idempotent : the `collection/` subdir is wiped and rewritten on every run
 * so renamed/removed operations don't leak stale .bru files.
 *
 * Spec source :
 *   1. `src/app/api/v1/openapi/_spec.snapshot.json` (preferred, committed)
 *   2. fallback : import _spec.ts via tsx if installed
 *   3. else : helpful error pointing at snapshot regeneration
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  toBrunoCollection,
  buildCollectionMeta,
  buildEnvironment,
} from './_bruno-transformer.mjs'

async function loadSpec() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const snapshotPath = path.resolve(
    here,
    '..',
    'src',
    'app',
    'api',
    'v1',
    'openapi',
    '_spec.snapshot.json',
  )
  try {
    const raw = await readFile(snapshotPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    // fall through
  }

  try {
    const specMod = path.resolve(
      here,
      '..',
      'src',
      'app',
      'api',
      'v1',
      'openapi',
      '_spec.ts',
    )
    const mod = await import(pathToFileURL(specMod).href)
    if (mod?.OPENAPI_SPEC) return mod.OPENAPI_SPEC
  } catch {
    // fall through
  }

  throw new Error(
    'No OpenAPI spec source available. Run `npx tsx scripts/snapshot-openapi.mjs` first to write src/app/api/v1/openapi/_spec.snapshot.json.',
  )
}

function parseArgs(argv) {
  const args = { out: 'packages/sa-rge-bruno', baseUrl: '{{base_url}}' }
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.+)$/)
    if (m) args[m[1]] = m[2]
  }
  return args
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function writeCollection(outDir, files) {
  const collectionDir = path.join(outDir, 'collection')
  await rm(collectionDir, { recursive: true, force: true })
  for (const [relPath, content] of files.entries()) {
    const full = path.join(outDir, relPath)
    await ensureDir(path.dirname(full))
    await writeFile(full, content, 'utf8')
  }
}

async function writeStaticFiles(outDir) {
  await writeFile(
    path.join(outDir, 'bruno.json'),
    buildCollectionMeta(),
    'utf8',
  )
  await ensureDir(path.join(outDir, 'environments'))
  await writeFile(
    path.join(outDir, 'environments', 'Production.bru'),
    buildEnvironment('Production', 'https://servicesartisans.fr'),
    'utf8',
  )
  await writeFile(
    path.join(outDir, 'environments', 'Local.bru'),
    buildEnvironment('Local', 'http://localhost:3099'),
    'utf8',
  )
}

export async function generate({ outDir, baseUrl } = {}) {
  const spec = await loadSpec()
  const files = toBrunoCollection(spec, { baseUrl: baseUrl ?? '{{base_url}}' })
  await ensureDir(outDir)
  await writeCollection(outDir, files)
  await writeStaticFiles(outDir)
  return { count: files.size, outDir }
}

async function main() {
  const args = parseArgs(process.argv)
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  )
  const outDir = path.resolve(repoRoot, args.out)
  const { count } = await generate({ outDir, baseUrl: args.baseUrl })
  process.stdout.write(
    `Generated ${count} .bru files under ${path.relative(
      repoRoot,
      outDir,
    )}/collection\n`,
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    process.stderr.write(String(err?.stack || err) + '\n')
    process.exit(1)
  })
}
