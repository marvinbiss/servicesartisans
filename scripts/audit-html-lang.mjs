#!/usr/bin/env node
/**
 * scripts/audit-html-lang.mjs
 * --------------------------
 * Vérifie que `<html lang="fr">` (ou équivalent) est déclaré sur le layout
 * root de l'app. ServicesArtisans est 100% francophone.
 *
 * Pourquoi :
 *   - Accessibilité (WCAG 2.1 — 3.1.1 Language of Page, niveau A) :
 *     les lecteurs d'écran choisissent la bonne prononciation.
 *   - Google Search Central : `lang` aide le ciblage linguistique SERP
 *     (complément à hreflang). Sans `lang`, Google devine — mal souvent.
 *   - Browsers : orthographe auto, traduction in-browser, fallback fonts.
 *
 * Règle : `<html lang="fr">` ou `lang="fr-FR"` sur `src/app/layout.tsx`.
 *
 * Usage :
 *   node scripts/audit-html-lang.mjs            # human
 *   node scripts/audit-html-lang.mjs --json     # JSON
 *   node scripts/audit-html-lang.mjs --strict   # exit 1 si manquant
 */

import { readFileSync, existsSync } from 'node:fs'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const LAYOUT_PATH = 'src/app/layout.tsx'
const ACCEPTED_LANGS = ['fr', 'fr-FR', 'fr-fr']

let error = null
let langFound = null

if (!existsSync(LAYOUT_PATH)) {
  error = `${LAYOUT_PATH} introuvable`
} else {
  const src = readFileSync(LAYOUT_PATH, 'utf8')
  // Match `<html lang="xx"` ou `<html lang={...}`
  const literalMatch = src.match(/<html\b[^>]*\blang=["']([^"']+)["']/)
  if (literalMatch) {
    langFound = literalMatch[1]
  } else {
    // Expression lang={var} — on essaie de résoudre le var
    const exprMatch = src.match(/<html\b[^>]*\blang=\{([^}]+)\}/)
    if (exprMatch) {
      const varName = exprMatch[1].trim()
      // Cherche une const locale du même nom
      const constRe = new RegExp(
        `const\\s+${varName}\\s*=\\s*["']([^"']+)["']`,
        'm'
      )
      const cm = src.match(constRe)
      if (cm) langFound = cm[1]
      else langFound = `<expr:${varName}>`
    } else if (/<html\b[^>]*>/.test(src)) {
      error = '<html> trouvé mais sans attribut lang'
    } else {
      error = 'Pas de <html> dans layout.tsx (layout racine invalide ?)'
    }
  }
}

const valid = langFound != null && ACCEPTED_LANGS.includes(langFound)

const report = {
  layout_file: LAYOUT_PATH,
  lang_found: langFound,
  accepted_values: ACCEPTED_LANGS,
  valid,
  error,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 <html lang> Audit\n')
  console.log(`  Layout : ${LAYOUT_PATH}`)
  console.log(`  lang=  : ${langFound ?? '—'}`)
  console.log(`  Valid  : ${valid ? '✓' : '✗'}`)
  if (error) console.log(`  Erreur : ${error}`)
  console.log('')
  if (valid) {
    console.log(`  ✅ <html lang="${langFound}"> valide.\n`)
  } else {
    console.log(
      `  ❌ <html> doit avoir lang ∈ {${ACCEPTED_LANGS.join(', ')}} pour ServicesArtisans FR.\n`
    )
  }
}

if (strict && !valid) process.exit(1)
