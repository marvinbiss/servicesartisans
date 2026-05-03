import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Sprint AG Ahrefs 2026-05-03 — verrou découverte crawler endpoints open-data.
 *
 * L'endpoint /api/glossaire-rge.json (Sprint AC, CC-BY 4.0) doit être
 * déclaré dans le shard `static` du sitemap pour assurer sa découverte
 * explicite par data.gouv.fr Validator, Bing et Yandex. Google flaggera
 * "blocked by noindex" via X-Robots-Tag — c'est OK : on veut signaler
 * la présence d'un asset technique, pas l'indexer en SERP.
 *
 * Approche : parsing source (cf. __tests__/lib/seo/noindex-sitemap-drift.test.ts).
 * Importer directement `@/app/sitemap` est lourd (boot guard
 * `assertTierPartitionCoverage`, deps Supabase admin), le verrou source
 * suffit pour garantir qu'aucun rebase silencieux ne supprime l'entry.
 *
 * Pattern attendu dans src/app/sitemap.ts :
 *   {
 *     url: `${SITE_URL}/api/glossaire-rge.json`,
 *     lastModified: STATIC_DATE,
 *     changeFrequency: 'monthly',
 *     priority: 0.3,
 *   }
 *
 * Si Sprint AF (CSV endpoint) est mergé : le test vérifie aussi `.csv`.
 */

const SITEMAP_PATH = join(process.cwd(), 'src/app/sitemap.ts')
const SITEMAP_SRC = readFileSync(SITEMAP_PATH, 'utf8')

// Helper : extrait le bloc { url: ..., ... } qui contient l'URL cible.
// Retourne null si l'URL n'est pas trouvée. Pas de regex multiline cassante :
// on cherche le marqueur `${SITE_URL}/<path>` puis on remonte/descend pour
// délimiter le `{` … `},` englobant.
function extractEntryFor(urlSuffix: string): string | null {
  const marker = '`${SITE_URL}' + urlSuffix + '`'
  const idx = SITEMAP_SRC.indexOf(marker)
  if (idx === -1) return null
  // Remonter au `{` ouvrant (≤ 30 lignes)
  const openIdx = SITEMAP_SRC.lastIndexOf('{', idx)
  if (openIdx === -1) return null
  // Descendre au `}` fermant en équilibrant les accolades
  let depth = 0
  let closeIdx = -1
  for (let i = openIdx; i < SITEMAP_SRC.length; i++) {
    const ch = SITEMAP_SRC[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        closeIdx = i
        break
      }
    }
  }
  if (closeIdx === -1) return null
  return SITEMAP_SRC.slice(openIdx, closeIdx + 1)
}

describe('Sprint AG — déclaration sitemap endpoints open-data', () => {
  it("le shard static contient l'URL `/api/glossaire-rge.json`", () => {
    const entry = extractEntryFor('/api/glossaire-rge.json')
    expect(
      entry,
      "L'entry pour /api/glossaire-rge.json est introuvable dans src/app/sitemap.ts. " +
        'Vérifier le shard `static` (autour de la ligne 280, après /rge/glossaire).'
    ).not.toBeNull()
  })

  it("l'entry /api/glossaire-rge.json a priority 0.3 (asset technique)", () => {
    const entry = extractEntryFor('/api/glossaire-rge.json')!
    expect(entry).toMatch(/priority:\s*0\.3\b/)
  })

  it("l'entry /api/glossaire-rge.json a changeFrequency 'monthly'", () => {
    const entry = extractEntryFor('/api/glossaire-rge.json')!
    expect(entry).toMatch(/changeFrequency:\s*['"]monthly['"]/)
  })

  it("l'entry /api/glossaire-rge.json utilise STATIC_DATE pour lastModified", () => {
    const entry = extractEntryFor('/api/glossaire-rge.json')!
    expect(entry).toMatch(/lastModified:\s*STATIC_DATE\b/)
  })

  it('STATIC_DATE est une string YYYY-MM-DD valide (sanity check sur la constante)', () => {
    // STATIC_DATE = new Date().toISOString().slice(0, 10) → YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10)
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // Verrou défensif : la déclaration de la constante n'a pas dérivé.
    expect(SITEMAP_SRC).toMatch(
      /const STATIC_DATE = new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/
    )
  })

  // ── Sprint AF coordination — si /api/glossaire-rge.csv route existe,
  //    son entry sitemap doit aussi être déclarée (même format).
  it('si la route /api/glossaire-rge.csv est mergée (Sprint AF), elle est dans le sitemap avec priority 0.3', async () => {
    const { existsSync } = await import('node:fs')
    const csvRoutePath = join(process.cwd(), 'src/app/api/glossaire-rge.csv/route.ts')
    if (!existsSync(csvRoutePath)) {
      // Sprint AF pas encore mergé — skip silencieux.
      return
    }
    const entry = extractEntryFor('/api/glossaire-rge.csv')
    expect(
      entry,
      'La route /api/glossaire-rge.csv existe mais son entry sitemap est manquante. ' +
        'Ajouter le bloc juste après /api/glossaire-rge.json dans src/app/sitemap.ts.'
    ).not.toBeNull()
    expect(entry!).toMatch(/priority:\s*0\.3\b/)
    expect(entry!).toMatch(/changeFrequency:\s*['"]monthly['"]/)
  })
})
