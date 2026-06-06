/**
 * Anti-régression bug 2026-06-06 — CTAs devis pointant vers des slugs morts.
 *
 * Post-pivot RGE (2026-05-03), seuls les 21 slugs de CANONICAL_SERVICE_SLUGS
 * sont servis ; le middleware retourne HTTP 410 pour tout autre slug sur
 * `/devis/[s]`, `/tarifs/[s]`, `/avis/[s]`, `/urgence/[s]`, `/services/[s]`.
 *
 * Bug découvert : 4 pages guides passaient `serviceSlug="chauffage"` /
 * `"isolation"` / `"plomberie"` / `"cuisine"` à <StickyMobileCTA> → le CTA
 * flottant desktop générait `/devis/chauffage` → 410 « page introuvable ».
 *
 * Ce test scanne src/ et fail si un littéral JSX/href référence un slug
 * hors catalogue canon. Couvre :
 *   - props `serviceSlug="<slug>"`
 *   - hrefs littéraux `/devis/<slug>`, `/tarifs/<slug>`, `/avis/<slug>`,
 *     `/urgence/<slug>`, `/services/<slug>` (1 segment, hors sous-routes
 *     statiques connues type `autour-de-moi`)
 */

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { CANONICAL_SERVICE_SLUGS_SET } from '@/lib/services/canonical-slugs'

const SRC_DIR = join(process.cwd(), 'src')

/** Sous-routes statiques légitimes sous /services|devis|tarifs|avis|urgence. */
const STATIC_SUBROUTES = new Set(['autour-de-moi'])

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      walk(full, acc)
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.test\.(tsx|ts)$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

type Violation = { file: string; line: number; match: string; slug: string }

function scanFile(file: string): Violation[] {
  const violations: Violation[] = []
  const rel = file
    .slice(SRC_DIR.length + 1)
    .split(sep)
    .join('/')
  const lines = readFileSync(file, 'utf8').split('\n')

  const serviceSlugRe = /serviceSlug=["']([a-z][a-z0-9-]*)["']/g
  // Hrefs littéraux 1-segment : capture le slug, ignore les segments dynamiques.
  const hrefRe = /href=["'`]\/(devis|tarifs|avis|urgence|services)\/([a-z][a-z0-9-]*)["'`]/g

  lines.forEach((text, i) => {
    let m: RegExpExecArray | null
    serviceSlugRe.lastIndex = 0
    while ((m = serviceSlugRe.exec(text)) !== null) {
      const slug = m[1]
      if (!CANONICAL_SERVICE_SLUGS_SET.has(slug)) {
        violations.push({ file: rel, line: i + 1, match: m[0], slug })
      }
    }
    hrefRe.lastIndex = 0
    while ((m = hrefRe.exec(text)) !== null) {
      const slug = m[2]
      if (STATIC_SUBROUTES.has(slug)) continue
      if (!CANONICAL_SERVICE_SLUGS_SET.has(slug)) {
        violations.push({ file: rel, line: i + 1, match: m[0], slug })
      }
    }
  })
  return violations
}

describe('CTAs devis — aucun slug mort (410 middleware)', () => {
  it('aucun littéral serviceSlug= ou href=/devis|tarifs|avis|urgence|services/<slug> hors canon', () => {
    const files = walk(SRC_DIR)
    expect(files.length).toBeGreaterThan(100)

    const violations = files.flatMap(scanFile)

    const report = violations
      .map((v) => `${v.file}:${v.line} → ${v.match} (slug mort: "${v.slug}")`)
      .join('\n')

    expect(violations, `Slugs morts détectés (410 garanti en prod) :\n${report}`).toEqual([])
  })
})
