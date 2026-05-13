#!/usr/bin/env node
/**
 * scripts/codemod-pageheroh1.mjs
 * ------------------------------
 * Migre les H1 de pages indexables vers le composant `<PageHeroH1>`
 * (cf. `src/components/ui/PageHeroH1.tsx`, conforme DESIGN.md L66).
 *
 * Cibles (patterns EXACTS — pas de regex souple pour éviter de toucher
 * des H1 spécifiques type hero dark/white) :
 *
 *   1. `<h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">`
 *      → `<PageHeroH1 size="article">`
 *
 *   2. `<h1 data-speakable="true" className="text-3xl md:text-4xl font-bold text-charcoal-900">`
 *      → `<PageHeroH1 size="page">`
 *
 * Pour chaque fichier touché :
 *   - Ajoute l'import `import { PageHeroH1 } from '@/components/ui/PageHeroH1'`
 *     juste après le dernier import `@/components/...` (ou en fin de bloc imports).
 *   - Remplace chaque `</h1>` qui suit immédiatement un `<PageHeroH1` ouvrant
 *     dans le même bloc rendu par `</PageHeroH1>`.
 *
 * Usage :
 *   node scripts/codemod-pageheroh1.mjs --dry      # affiche les diffs
 *   node scripts/codemod-pageheroh1.mjs            # applique
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const DRY = process.argv.includes('--dry')

const PATTERNS = [
  {
    open: '<h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">',
    replace: '<PageHeroH1 size="article">',
  },
  {
    open: '<h1 data-speakable="true" className="text-3xl md:text-4xl font-bold text-charcoal-900">',
    replace: '<PageHeroH1 size="page">',
  },
]

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      walk(full, acc)
    } else if (/\.tsx$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

function ensureImport(src) {
  // Vérifie présence du STATEMENT import — pas juste du symbole (markup migré
  // contient déjà `<PageHeroH1`, ce qui causerait un early-return faux+).
  if (/^import\s+\{[^}]*PageHeroH1[^}]*\}\s+from\s+['"]@\/components\/ui\/PageHeroH1['"]/m.test(src))
    return src
  if (/^import\s+PageHeroH1\s+from\s+['"]@\/components\/ui\/PageHeroH1['"]/m.test(src)) return src
  // Insère après le dernier import "@/components/..."
  const lines = src.split('\n')
  let lastComponentsImport = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^import .* from ['"]@\/components\//.test(lines[i])) {
      lastComponentsImport = i
    }
  }
  if (lastComponentsImport === -1) {
    // Fallback : après le 1er import quel qu'il soit
    for (let i = 0; i < lines.length; i++) {
      if (/^import /.test(lines[i])) {
        lastComponentsImport = i
        break
      }
    }
  }
  if (lastComponentsImport === -1) return src
  lines.splice(
    lastComponentsImport + 1,
    0,
    "import { PageHeroH1 } from '@/components/ui/PageHeroH1'"
  )
  return lines.join('\n')
}

/**
 * Remplace chaque occurrence d'un pattern `<h1 ...>` par `<PageHeroH1 ...>`,
 * et le `</h1>` correspondant (le plus proche après) par `</PageHeroH1>`.
 *
 * Approche : on remplace l'open exact, puis on cherche le PROCHAIN `</h1>`
 * et on le remplace. Répété par occurrence.
 */
function migrateFile(src) {
  let out = src
  for (const { open, replace } of PATTERNS) {
    while (out.includes(open)) {
      const openIdx = out.indexOf(open)
      const closeIdx = out.indexOf('</h1>', openIdx + open.length)
      if (closeIdx === -1) {
        // Aucun </h1> trouvé après → casse l'invariant, on abandonne
        return null
      }
      out =
        out.slice(0, openIdx) +
        replace +
        out.slice(openIdx + open.length, closeIdx) +
        '</PageHeroH1>' +
        out.slice(closeIdx + '</h1>'.length)
    }
  }
  return out
}

const files = walk(join(process.cwd(), 'src', 'app'))
let touched = 0
let h1Count = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  let hasPattern = false
  for (const { open } of PATTERNS) {
    if (src.includes(open)) {
      hasPattern = true
      const occurrences = src.split(open).length - 1
      h1Count += occurrences
    }
  }
  const usesPageHeroH1 = /<PageHeroH1\b/.test(src)
  if (!hasPattern && !usesPageHeroH1) continue

  const migrated = hasPattern ? migrateFile(src) : src
  if (migrated === null) {
    console.error(`⚠️  ${file} — pattern <h1> sans </h1> matching, skipped`)
    continue
  }
  const withImport = ensureImport(migrated)
  if (withImport === src) continue
  touched++
  if (DRY) {
    console.log(`[DRY] ${file.replace(process.cwd() + sep, '')}`)
  } else {
    writeFileSync(file, withImport, 'utf8')
  }
}

console.log(
  `${DRY ? '[DRY] ' : ''}${touched} fichier(s) migré(s), ${h1Count} H1 → PageHeroH1`
)
