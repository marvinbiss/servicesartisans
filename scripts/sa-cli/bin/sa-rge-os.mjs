#!/usr/bin/env node
import { run } from '../src/index.mjs'

run(process.argv.slice(2))
  .then((code) => {
    if (typeof code === 'number' && code !== 0) process.exit(code)
  })
  .catch((err) => {
    process.stderr.write(`sa-rge-os: ${err.message}\n`)
    process.exit(1)
  })
