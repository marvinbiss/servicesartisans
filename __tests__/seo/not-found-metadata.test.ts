/**
 * Tests — not-found.tsx metadata coverage
 * ----------------------------------------
 * Bug Next.js 14.2 vercel/next.js#69103 : sur les routes ISR avec
 * `dynamicParams: true`, `notFound()` peut renvoyer HTTP 200 + le composant
 * `not-found.tsx` du segment. Sans `metadata.robots` explicite sur ce
 * composant, le layout racine impose `robots: { index: true, follow: true }`
 * et Google indexe ces réponses (= soft 404).
 *
 * On garantit ici qu'**aucun** route-level `not-found.tsx` ne peut être
 * mergé sans `export const metadata` contenant `robots: { index: false }`.
 * Le test scanne tous les `not-found.tsx` sous `src/app/(public)` et fail si
 * la metadata manque ou n'a pas le bon shape.
 *
 * Exception : le `not-found.tsx` racine (`src/app/not-found.tsx`) est testé
 * séparément (déjà conforme), pas couvert ici car servi sur des paths qui ne
 * sont jamais ISR.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

function walkNotFound(dir: string, rel: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const r = rel ? `${rel}/${entry}` : entry
    const st = statSync(full)
    if (st.isDirectory()) walkNotFound(full, r, out)
    else if (entry === 'not-found.tsx') out.push(r)
  }
}

function findRouteLevelNotFounds(): string[] {
  const out: string[] = []
  walkNotFound(join(REPO_ROOT, 'src', 'app', '(public)'), 'src/app/(public)', out)
  return out
}

describe('not-found.tsx metadata coverage (bug Next.js 14.2 #69103)', () => {
  const files = findRouteLevelNotFounds()

  it('au moins un not-found.tsx route-level existe', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s exporte metadata.robots: { index: false }', (relPath) => {
    const src = readFileSync(join(REPO_ROOT, relPath), 'utf8')

    // 1. Doit importer le type Metadata
    expect(src, `${relPath} doit importer 'type { Metadata } from "next"'`).toMatch(
      /import\s+type\s+\{\s*Metadata\s*\}\s+from\s+['"]next['"]/
    )

    // 2. Doit exporter `metadata` (const, async function, ou function)
    expect(src, `${relPath} doit avoir 'export const metadata'`).toMatch(
      /export\s+const\s+metadata\s*:\s*Metadata/
    )

    // 3. Doit déclarer robots: { index: false, ... }
    //    On accepte plusieurs styles : `index: false` ou `index:false`.
    expect(src, `${relPath} doit déclarer 'index: false' dans robots`).toMatch(
      /robots\s*:\s*\{[^}]*index\s*:\s*false/m
    )

    // 4. Doit déclarer follow: false (cohérence avec root not-found.tsx)
    expect(src, `${relPath} doit déclarer 'follow: false' dans robots`).toMatch(
      /robots\s*:\s*\{[^}]*follow\s*:\s*false/m
    )
  })
})
