#!/usr/bin/env node
/**
 * Wrapper around `npx promptfoo eval` that:
 *   1. Targets the YMYL config at evals/factual-aides.yaml
 *   2. Propagates promptfoo's exit code so CI gates correctly
 *   3. Keeps stdout/stderr inherited for live log streaming
 *
 * Promptfoo is invoked via `npx` on demand: we deliberately do not add
 * `promptfoo` to package.json devDependencies in this commit (scope minimal).
 * GitHub Actions caches `~/.npm`, so the npx fetch only pays once per runner.
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const configPath = resolve(here, '..', 'factual-aides.yaml')

const isWin = process.platform === 'win32'
const npxBin = isWin ? 'npx.cmd' : 'npx'

const result = spawnSync(npxBin, ['--yes', 'promptfoo@latest', 'eval', '--config', configPath], {
  stdio: 'inherit',
})

if (result.error) {
  console.error('eval-runner: failed to invoke promptfoo —', result.error.message)
  process.exit(1)
}

process.exit(typeof result.status === 'number' ? result.status : 1)
