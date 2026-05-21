#!/usr/bin/env node
/**
 * scripts/snapshot-openapi.mjs
 * ----------------------------
 * One-shot snapshot of OPENAPI_SPEC into a committed JSON file.
 *
 * Why : `generate-bruno-collection.mjs` cannot directly import the TS const
 * `OPENAPI_SPEC` from `src/app/api/v1/openapi/_spec.ts` without a TS loader
 * (tsx). Shipping a snapshotted JSON next to the source decouples the
 * generator from the TS toolchain, makes generation reproducible from any
 * Node 20+ environment, and lets reviewers diff the spec change inline.
 *
 * Usage : `npx tsx scripts/snapshot-openapi.mjs`
 *
 * Output : `src/app/api/v1/openapi/_spec.snapshot.json` (committed).
 *
 * Regenerate after every change to `_spec.ts`. A future iteration may wire
 * a pre-commit guard that fails when `_spec.ts` is staged without an
 * accompanying snapshot bump.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url))
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
  const out = path.resolve(
    here,
    '..',
    'src',
    'app',
    'api',
    'v1',
    'openapi',
    '_spec.snapshot.json',
  )
  await writeFile(out, JSON.stringify(mod.OPENAPI_SPEC, null, 2) + '\n', 'utf8')
  process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    process.stderr.write(String(err) + '\n')
    process.exit(1)
  })
}
