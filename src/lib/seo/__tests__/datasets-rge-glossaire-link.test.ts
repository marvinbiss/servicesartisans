import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Sprint AH Ahrefs 2026-05-03 — verrou cohérence open-data inventaire.
 *
 * La page /datasets/rge est l'inventaire canonique des assets open-data RGE
 * de ServicesArtisans. Doit lister explicitement les endpoints glossaire
 * créés par les Sprints AC (.json) et AF (.csv) pour :
 *
 *   1. Découverte par les visiteurs cherchant "open data RGE"
 *   2. Cohérence éditoriale (un seul lieu = inventaire complet)
 *   3. PageRank flow (capter backlinks /datasets/rge → /api/glossaire-rge.*)
 *
 * Pattern : scan source-level (readFileSync + toContain) — même pattern que
 * `nav-broken-links.test.ts` (Sprint W). Pas de render React, pas de mocks DB,
 * latence test ~1ms.
 */

const PAGE_PATH = join(process.cwd(), 'src', 'app', '(public)', 'datasets', 'rge', 'page.tsx')

const PAGE_SOURCE = readFileSync(PAGE_PATH, 'utf8')

describe('Sprint AH — /datasets/rge mentionne les endpoints glossaire RGE', () => {
  it('contient un lien <a href="/api/glossaire-rge.json"> follow (pas de rel=nofollow)', () => {
    // Le lien doit exister — accepte plusieurs variantes (href="…" ou href='…')
    const hasJsonLink =
      PAGE_SOURCE.includes('href="/api/glossaire-rge.json"') ||
      PAGE_SOURCE.includes("href='/api/glossaire-rge.json'") ||
      PAGE_SOURCE.includes('href={"/api/glossaire-rge.json"}')
    expect(hasJsonLink, 'lien /api/glossaire-rge.json absent de /datasets/rge').toBe(true)

    // Garde anti-nofollow : on cherche un bloc <a … href="/api/glossaire-rge.json" …
    // qui contiendrait rel="nofollow" dans la même balise. Le lien doit rester
    // follow pour faire fluer le PageRank vers l'asset open-data.
    const tagMatch = PAGE_SOURCE.match(/<a[^>]*href="\/api\/glossaire-rge\.json"[^>]*>/)
    if (tagMatch) {
      expect(tagMatch[0], 'lien JSON glossaire ne doit pas être nofollow').not.toMatch(
        /rel=["'][^"']*nofollow/
      )
    }
  })

  it('contient un lien <a href="/api/glossaire-rge.csv"> (Sprint AF en parallèle)', () => {
    const hasCsvLink =
      PAGE_SOURCE.includes('href="/api/glossaire-rge.csv"') ||
      PAGE_SOURCE.includes("href='/api/glossaire-rge.csv'") ||
      PAGE_SOURCE.includes('href={"/api/glossaire-rge.csv"}')
    expect(hasCsvLink, 'lien /api/glossaire-rge.csv absent de /datasets/rge').toBe(true)
  })

  it('mentionne "Glossaire RGE" comme anchor / titre éditorial', () => {
    expect(PAGE_SOURCE).toMatch(/Glossaire RGE/i)
  })

  it('mentionne /rge/glossaire (page HTML canonique de référence)', () => {
    const hasHtmlLink =
      PAGE_SOURCE.includes('href="/rge/glossaire"') || PAGE_SOURCE.includes("href='/rge/glossaire'")
    expect(hasHtmlLink, 'lien /rge/glossaire (entité canonique Sprint O) absent').toBe(true)
  })

  it('émet un Schema.org Dataset distinct pour le glossaire (hasPart ou Dataset à part)', () => {
    // On accepte 2 patterns valides :
    //   1. Dataset distinct dans jsonLdItems avec name "Glossaire RGE"
    //   2. hasPart inline pointant vers /api/glossaire-rge.json
    const hasGlossaryDataset =
      /name:\s*['"]Glossaire RGE/i.test(PAGE_SOURCE) ||
      /'hasPart'[\s\S]{0,400}glossaire-rge/i.test(PAGE_SOURCE)
    expect(
      hasGlossaryDataset,
      'Schema Dataset glossaire RGE absent (ni Dataset distinct ni hasPart)'
    ).toBe(true)

    // Doit pointer en distribution vers l'endpoint JSON-LD
    expect(PAGE_SOURCE).toMatch(/contentUrl[^,]*glossaire-rge\.json/)
  })

  it('a une section éditoriale "Datasets complémentaires" (ou équivalent)', () => {
    const hasSection =
      /Datasets compl[ée]mentaires|Autres jeux de donn[ée]es|Datasets associ[ée]s/i.test(
        PAGE_SOURCE
      )
    expect(hasSection, 'section éditoriale "Datasets complémentaires" absente').toBe(true)
  })
})
