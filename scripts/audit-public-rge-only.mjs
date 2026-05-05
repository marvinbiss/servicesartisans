#!/usr/bin/env node
/**
 * audit-public-rge-only.mjs — pivot full RGE 2026-05-05.
 *
 * SA = annuaire 100% artisans RGE certifiés. Cet audit cumule deux gardes
 * pour éviter de gonfler le compteur de pre-commit (bloat trigger > 90) :
 *
 *   1) helper RGE-only — toute page publique appelant un helper provider
 *      DOIT laisser le default `rgeOnly: true`. Réactiver `{ rgeOnly: false }`
 *      requalifierait la page comme annuaire généraliste.
 *
 *   2) vocabulaire RGE canonique — convention validée KPMG vague 3b :
 *        ✅ "artisan RGE certifié" / "artisan RGE"
 *        ❌ "artisan RGE qualifié" / "RGE qualifié" (RGE = qualification déjà)
 *        ❌ "labellisé RGE" / "agréé RGE"
 *      Les variantes interdites peuvent réapparaître via copy/paste depuis
 *      anciens templates pré-pivot ou contenu IA dans `src/lib/data/blog/`.
 *
 * Scope élargi #2 :
 *   - `src/app/(public)/**`, `src/lib/{data,rge,seo,cee}/**`, `src/components/**`
 *
 * Whitelist :
 *   - Commentaires `//` ou `/*` (KW SEO, docs internes)
 *   - `__tests__/` (peut tester les variantes)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const PUBLIC_ROOT = join(process.cwd(), 'src', 'app', '(public)')
const VOCAB_ROOTS = [
  PUBLIC_ROOT,
  join(process.cwd(), 'src', 'lib', 'data'),
  join(process.cwd(), 'src', 'lib', 'rge'),
  join(process.cwd(), 'src', 'lib', 'seo'),
  join(process.cwd(), 'src', 'lib', 'cee'),
  join(process.cwd(), 'src', 'components'),
]
const strict = process.argv.includes('--strict')

function walk(dir, exts = /\.(tsx?|jsx?)$/) {
  const out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (name === '__tests__' || name === 'node_modules') continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...walk(full, exts))
    else if (exts.test(name)) out.push(full)
  }
  return out
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

const RGE_ONLY_FORBIDDEN = [/\brgeOnly\s*[:=]\s*false\b/]
const VOCAB_FORBIDDEN = [
  {
    regex: /\bqualifi[ée]s?\s+RGE\b/i,
    hint: 'utiliser "RGE certifié" (RGE est une qualification, pas une certification ajoutée)',
  },
  {
    regex: /\bRGE\s+qualifi[ée]s?\b/i,
    hint: 'utiliser "RGE certifié" — convention pivot 2026-05-05',
  },
  {
    regex: /\blabellis[ée]s?\s+RGE\b/i,
    hint: 'utiliser "RGE certifié" — RGE n\'est pas un label marketing',
  },
  {
    regex: /\bagr[ée]{1,2}\s+RGE\b/i,
    hint: 'utiliser "RGE certifié" — RGE n\'est pas un agrément administratif',
  },
]

const rgeOnlyViolations = []
for (const file of walk(PUBLIC_ROOT)) {
  const src = readFileSync(file, 'utf8')
  for (const re of RGE_ONLY_FORBIDDEN) {
    const m = re.exec(src)
    if (!m) continue
    const upTo = src.slice(0, m.index)
    const line = upTo.split(/\r?\n/).length
    rgeOnlyViolations.push({
      file: file.replace(/\\/g, '/').replace(/.*\/src\//, 'src/'),
      line,
      code: m[0],
    })
  }
}

const vocabViolations = []
const seenVocab = new Set()
for (const root of VOCAB_ROOTS) {
  for (const file of walk(root, /\.(tsx?|jsx?|mdx?)$/)) {
    const key = file
    if (seenVocab.has(key)) continue
    seenVocab.add(key)
    const raw = readFileSync(file, 'utf8')
    const codeOnly = stripComments(raw)
    for (const { regex, hint } of VOCAB_FORBIDDEN) {
      const m = regex.exec(codeOnly)
      if (!m) continue
      const upTo = codeOnly.slice(0, m.index)
      const line = upTo.split(/\r?\n/).length
      vocabViolations.push({
        file: file.replace(/\\/g, '/').replace(/.*\/src\//, 'src/'),
        line,
        match: m[0],
        hint,
      })
    }
  }
}

const total = rgeOnlyViolations.length + vocabViolations.length

if (total === 0) {
  console.log(`✅ audit-public-rge-only : helper RGE-only OK + vocabulaire RGE canonique OK.`)
  process.exit(0)
}

if (rgeOnlyViolations.length > 0) {
  console.error(`\n❌ ${rgeOnlyViolations.length} page(s) public désactivent le filtre RGE :\n`)
  for (const v of rgeOnlyViolations) {
    console.error(`  ${v.file}:${v.line}\n    ${v.code}`)
  }
  console.error(
    '\n  Pivot full RGE 2026-05-05 — pages publiques = artisans RGE only. Retirer `rgeOnly: false` ou retirer la page de (public).\n'
  )
}

if (vocabViolations.length > 0) {
  console.error(`\n❌ ${vocabViolations.length} formulation(s) RGE interdite(s) :\n`)
  for (const v of vocabViolations) {
    console.error(`  ${v.file}:${v.line}\n    "${v.match}" — ${v.hint}`)
  }
  console.error(
    `\n  Convention pivot full RGE 2026-05-05 : "artisan RGE certifié" ou "artisan RGE" tout court.\n`
  )
}

process.exit(strict ? 1 : 0)
