/**
 * Tests — scripts/generate-bruno-collection.mjs
 *
 * End-to-end : we run `generate()` against a tmp dir and assert the
 * collection structure on disk. Reading the snapshot from
 * `src/app/api/v1/openapi/_spec.snapshot.json` is part of the contract.
 */

import { describe, it, expect } from 'vitest'
import { mkdtemp, readFile, readdir, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { generate } from '../../scripts/generate-bruno-collection.mjs'

async function listAll(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) await listAll(full, acc)
    else acc.push(full)
  }
  return acc
}

describe('generate-bruno-collection — end to end', () => {
  it('writes a populated collection to the target directory', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    const result = (await generate({ outDir: out })) as {
      count: number
      outDir: string
    }
    expect(result.count).toBeGreaterThan(15)

    const all = await listAll(out)
    const bru = all.filter((f) => f.endsWith('.bru'))
    expect(bru.length).toBeGreaterThan(15)

    // bruno.json + environments
    expect(all.some((f) => f.endsWith('bruno.json'))).toBe(true)
    expect(all.some((f) => f.endsWith(path.join('environments', 'Production.bru')))).toBe(true)
    expect(all.some((f) => f.endsWith(path.join('environments', 'Local.bru')))).toBe(true)
  })

  it('writes bruno.json with the expected metadata', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out })
    const text = await readFile(path.join(out, 'bruno.json'), 'utf8')
    const parsed = JSON.parse(text)
    expect(parsed.type).toBe('collection')
    expect(parsed.name).toBe('ServicesArtisans RGE-OS')
  })

  it('Production env points at servicesartisans.fr', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out })
    const text = await readFile(path.join(out, 'environments', 'Production.bru'), 'utf8')
    expect(text).toContain('base_url: https://servicesartisans.fr')
  })

  it('Local env points at localhost:3099', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out })
    const text = await readFile(path.join(out, 'environments', 'Local.bru'), 'utf8')
    expect(text).toContain('base_url: http://localhost:3099')
  })

  it('is idempotent — second run leaves the same file set', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out })
    const first = (await listAll(out)).sort()
    await generate({ outDir: out })
    const second = (await listAll(out)).sort()
    expect(second).toEqual(first)
  })

  it('honours a custom baseUrl', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out, baseUrl: 'https://example.test' })
    const all = await listAll(out)
    const someBru = all.find((f) => f.endsWith('.bru') && !f.includes('environments'))
    expect(someBru).toBeDefined()
    const text = await readFile(someBru!, 'utf8')
    expect(text).toContain('url: https://example.test')
  })

  it('writes a non-empty .bru file under a tag folder', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'bruno-test-'))
    await generate({ outDir: out })
    const all = await listAll(out)
    const someBru = all.find(
      (f) => f.endsWith('.bru') && f.includes(`${path.sep}collection${path.sep}`)
    )
    expect(someBru).toBeDefined()
    const st = await stat(someBru!)
    expect(st.size).toBeGreaterThan(50)
  })
})
