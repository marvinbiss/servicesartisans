import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO_ROOT = process.cwd()

/**
 * Sprint Y Ahrefs 2026-05-03 — verrou cross-linking glossaires.
 *
 * Audit Reviewer 2 SEO Schema avait flaggé MEDIUM : `/glossaire` orphan vs
 * `/rge/glossaire` (Sprint O) — risque split topical authority si overlap.
 * Audit Sprint Y a confirmé 0 overlap thématique :
 *   - /glossaire        = 150+ termes vocabulaire bâtiment général
 *   - /rge/glossaire    = 16 certifications RGE (QualiPAC, Qualibat…)
 *
 * Au lieu de canonicaliser/rediriger, on cross-link les 2 pages pour
 * construire un cluster sémantique. Ce test vérifie que les liens
 * bidirectionnels restent en place.
 */

const GLOSSAIRE_PAGE = join(REPO_ROOT, 'src', 'app', '(public)', 'glossaire', 'page.tsx')
const RGE_GLOSSAIRE_PAGE = join(REPO_ROOT, 'src', 'app', '(public)', 'rge', 'glossaire', 'page.tsx')

describe('Sprint Y — cross-linking /glossaire <-> /rge/glossaire', () => {
  it('/glossaire contient un lien vers /rge/glossaire', () => {
    const src = readFileSync(GLOSSAIRE_PAGE, 'utf8')
    expect(src).toContain('href="/rge/glossaire"')
  })

  it('/glossaire utilise un anchor text descriptif "Glossaire RGE"', () => {
    const src = readFileSync(GLOSSAIRE_PAGE, 'utf8')
    // Vérifie que "Glossaire RGE" apparaît proche du href (heuristique
    // window de 500 chars = même Link block).
    const idx = src.indexOf('href="/rge/glossaire"')
    expect(idx).toBeGreaterThan(-1)
    const slice = src.slice(idx, idx + 1200)
    expect(slice).toContain('Glossaire RGE')
  })

  it('/rge/glossaire contient un lien retour vers /glossaire', () => {
    const src = readFileSync(RGE_GLOSSAIRE_PAGE, 'utf8')
    expect(src).toContain('href="/glossaire"')
  })

  it('/rge/glossaire utilise un anchor text "Glossaire bâtiment"', () => {
    const src = readFileSync(RGE_GLOSSAIRE_PAGE, 'utf8')
    const idx = src.indexOf('href="/glossaire"')
    expect(idx).toBeGreaterThan(-1)
    const slice = src.slice(idx, idx + 1200)
    expect(slice).toContain('Glossaire bâtiment')
  })

  it('aucun lien rel=nofollow sur les 2 cross-links (PageRank flow préservé)', () => {
    for (const filePath of [GLOSSAIRE_PAGE, RGE_GLOSSAIRE_PAGE]) {
      const src = readFileSync(filePath, 'utf8')
      const targetHref = filePath === GLOSSAIRE_PAGE ? 'href="/rge/glossaire"' : 'href="/glossaire"'
      const idx = src.indexOf(targetHref)
      expect(idx).toBeGreaterThan(-1)
      const slice = src.slice(Math.max(0, idx - 200), idx + 300)
      expect(slice).not.toMatch(/rel=["'][^"']*nofollow/)
    }
  })
})
