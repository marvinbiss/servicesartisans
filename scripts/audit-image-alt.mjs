#!/usr/bin/env node
/**
 * scripts/audit-image-alt.mjs
 * --------------------------
 * Détecte les images SANS attribut `alt` dans les composants TSX/JSX.
 *
 * Pourquoi :
 *   - Accessibilité (WCAG 2.1 AA — critère 1.1.1 "Non-text Content")
 *   - Google Image SERP = trafic complémentaire, l'alt est le signal principal
 *   - Lighthouse a11y score dégradé → signal qualité indirect pour Core Web Vitals
 *
 * Règle : tout `<img>` ou `<Image>` doit déclarer `alt=`. Exception : `alt=""`
 * est VALIDE pour les images purement décoratives (selon WAI-ARIA) —
 * on la reporte en "decorative" séparément.
 *
 * Limites :
 *   - On ne résout pas la valeur `alt={expr}` (seule la présence de
 *     l'attribut compte).
 *   - On scan `src/` uniquement (pas de MDX/CMS).
 *
 * Usage :
 *   node scripts/audit-image-alt.mjs            # human
 *   node scripts/audit-image-alt.mjs --json     # JSON
 *   node scripts/audit-image-alt.mjs --strict   # exit 1 si missing alt
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|jsx)$/.test(entry)) acc.push(full)
  }
  return acc
}

/**
 * Extrait tous les tags `<img>` et `<Image>` d'un fichier source.
 * Retourne un array d'objets { tag, attrs, hasAlt, altEmpty }.
 *
 * On capture tout entre `<img|<Image` et le prochain `>` au même niveau.
 * Les JSX auto-closing (`/>`) et classic (`>...</Image>`) sont tous gérés
 * car on n'analyse que les attributs d'ouverture.
 */
function extractImages(src) {
  const results = []
  // Match `<img`, `<Image`, `<NextImage` (common aliases) suivis de :
  //   - whitespace + attributes + `>` ou `/>`
  // On ne considère pas les classNames `Image` dans du texte (car précédés de <).
  const re = /<(img|Image|NextImage)\b([^>]*?)\/?>/gs
  for (const m of src.matchAll(re)) {
    const tag = m[1]
    const attrs = m[2]
    // Ignore commented-out JSX (précédé par `//` ou dans `/* ... */`) :
    // détection approximative en regardant le char précédent
    const start = m.index ?? 0
    const prev = src.slice(Math.max(0, start - 2), start)
    if (prev === '//') continue

    // Détecte alt=
    const altMatch = attrs.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/)
    let hasAlt = !!altMatch
    let altEmpty = false
    if (altMatch) {
      const stringVal = altMatch[1] ?? altMatch[2]
      if (stringVal != null && stringVal.trim() === '') altEmpty = true
      // Pour les expressions `alt={...}`, on considère hasAlt=true (présence)
    }
    results.push({ tag, attrs: attrs.trim(), hasAlt, altEmpty })
  }
  return results
}

const files = walk('src')
const missing = []
const decorative = []
let totalImages = 0

for (const f of files) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const imgs = extractImages(src)
  for (const img of imgs) {
    totalImages++
    if (!img.hasAlt) {
      missing.push({ file: normalized, tag: img.tag, snippet: `<${img.tag} ${img.attrs}` })
    } else if (img.altEmpty) {
      decorative.push({ file: normalized, tag: img.tag })
    }
  }
}

const report = {
  files_scanned: files.length,
  total_images: totalImages,
  images_missing_alt: missing.length,
  images_decorative_alt_empty: decorative.length,
  coverage_pct: totalImages === 0 ? 100 : Number(((1 - missing.length / totalImages) * 100).toFixed(2)),
  missing,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Image Alt Coverage Audit\n')
  console.log(`  Fichiers TSX/JSX scannés       : ${report.files_scanned}`)
  console.log(`  Total images détectées         : ${report.total_images}`)
  console.log(`  Sans attribut alt              : ${report.images_missing_alt}`)
  console.log(`  Décoratives (alt="")           : ${report.images_decorative_alt_empty}`)
  console.log(`  Coverage alt                   : ${report.coverage_pct}%\n`)

  if (missing.length === 0) {
    console.log('  ✅ Toutes les images ont un attribut alt déclaré.\n')
  } else {
    console.log('  ⚠️  Images sans alt :')
    for (const m of missing.slice(0, 50)) {
      const preview = m.snippet.length > 100 ? m.snippet.slice(0, 100) + '...' : m.snippet
      console.log(`     ${m.file}`)
      console.log(`         ${preview}`)
    }
    if (missing.length > 50) console.log(`     ... et ${missing.length - 50} de plus`)
    console.log('')
  }
}

if (strict && missing.length > 0) process.exit(1)
