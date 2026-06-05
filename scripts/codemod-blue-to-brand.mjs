#!/usr/bin/env node
/**
 * codemod-blue-to-brand.mjs — wave C-bis design premium (2026-06-06)
 * ------------------------------------------------------------------
 * DESIGN.md : « blue-* — Use primary-* (except verified-badge semantic blue) ».
 * Triage validé (716 occ classifiées en 8 buckets) :
 *
 *   FOCUS_RING  → focus:ring/border-primary-500 (« focus rings terracotta »)
 *   BUTTON      → fill canonique bg-primary-500 + hover:bg-primary-600
 *   LINK        → text-primary-600/700
 *   CALLOUT/MISC→ sand neutre + charcoal (décision 2026-06-06 : info = neutre,
 *                 distinction par icône — pas de bleu, pas de primary-tinted
 *                 confusable avec warnings amber)
 *
 * CONSERVÉS (skip) :
 *   - VerifiedBadge.tsx — exception sémantique explicite DESIGN.md
 *   - Contexte MaPrimeRénov'/barème « Bleu » — couleur officielle ANAH
 *     (anah-thresholds, SimulateurList bleu, calendrier-2026, swatch/th barème)
 *   - Réseaux sociaux (Facebook/LinkedIn bleu de marque)
 *   - Gradients catégoriels métiers (plombier/salle-de-bain = bleu eau,
 *     france.ts + urgence config) et gradients admin analytics
 *
 * Usage : node scripts/codemod-blue-to-brand.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const dry = process.argv.includes('--dry')

const SKIP_FILES = new Set([
  'src/components/reviews/VerifiedBadge.tsx',
  'src/lib/simulateur/anah-thresholds.ts',
  'src/components/admin/simulateur/SimulateurList.tsx',
  'src/lib/data/france.ts',
  'src/lib/data/france-light.ts',
  'src/app/(public)/urgence/[service]/[ville]/page.tsx',
])

const MPR_RE = /maprimerenov|bar[èe]me|MPR|[Bb]leu\b/
const SOCIAL_RE = /facebook|linkedin|twitter|youtube|instagram/i
const GRADIENT_RE = /(from|to|via)-blue-\d/

function transformLine(line) {
  // a) focus rings — avant tout (les variantes focus: ne doivent pas matcher les règles génériques)
  line = line
    .replace(/focus(-visible|-within)?:ring-blue-(\d{2,3})(\/\d+)?/g, 'focus$1:ring-primary-$2$3')
    .replace(/focus(-visible|-within)?:border-blue-(\d{2,3})/g, 'focus$1:border-primary-$2')

  // b) boutons : fill bleu interactif → canonique 500/hover:600
  if (/\bbg-blue-[67]00\b/.test(line) && /(text-white|hover:bg-blue-[78]00)/.test(line)) {
    line = line
      .replace(/hover:bg-blue-[78]00\b/g, 'hover:bg-primary-600')
      .replace(/\bbg-blue-[67]00\b/g, 'bg-primary-500')
      .replace(/\bborder-blue-[67]00\b/g, 'border-primary-500')
      .replace(/\bring-blue-(\d{2,3})\b/g, 'ring-primary-$1')
      .replace(/\bshadow-blue-(\d{2,3})\/(\d+)\b/g, 'shadow-primary-$1/$2')
  }

  // c) liens : couleur texte bleu + affordance underline/hover
  if (/(underline|hover:text-blue)/.test(line)) {
    line = line
      .replace(/hover:text-blue-(\d{2,3})\b/g, 'hover:text-primary-$1')
      .replace(/\btext-blue-600\b/g, 'text-primary-600')
      .replace(/\btext-blue-700\b/g, 'text-primary-700')
      .replace(/\btext-blue-800\b/g, 'text-primary-800')
  }

  // d) reste (callouts info, icônes, table headers, chips) → sand/charcoal neutre
  line = line
    .replace(/\bbg-blue-50(\/\d+)?\b/g, 'bg-sand-100$1')
    .replace(/\bbg-blue-100\b/g, 'bg-sand-200')
    .replace(/\bborder-blue-100\b/g, 'border-sand-200')
    .replace(/\bborder-blue-200\b/g, 'border-sand-300')
    .replace(/\bborder-blue-[345]00\b/g, 'border-charcoal-300')
    .replace(/\bborder-blue-600\b/g, 'border-charcoal-400')
    .replace(/\btext-blue-[45]00\b/g, 'text-charcoal-500')
    .replace(/\btext-blue-600\b/g, 'text-charcoal-600')
    .replace(/\btext-blue-700\b/g, 'text-charcoal-700')
    .replace(/\btext-blue-800\b/g, 'text-charcoal-800')
    .replace(/\btext-blue-900\b/g, 'text-charcoal-900')
    .replace(/\bbg-blue-400\b/g, 'bg-charcoal-300')
    .replace(/\bbg-blue-500\b/g, 'bg-charcoal-400')
    .replace(/hover:bg-blue-50\b/g, 'hover:bg-sand-100')
    .replace(/hover:bg-blue-100\b/g, 'hover:bg-sand-200')
    .replace(/\bring-blue-(\d{2,3})(\/\d+)?\b/g, 'ring-primary-$1$2')
    // fills résiduels sans text-white (tabs sélectionnés, tiles) → canonique
    .replace(/hover:bg-blue-[78]00\b/g, 'hover:bg-primary-600')
    .replace(/\bbg-blue-[678]00\b/g, 'bg-primary-500')

  return line
}

const files = execSync('git ls-files src', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(ts|tsx)$/.test(f))

let totalLines = 0
const touched = []

for (const file of files) {
  const norm = file.replace(/\\/g, '/')
  if (SKIP_FILES.has(norm)) continue
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (!/-blue-\d/.test(src)) continue

  const lines = src.split('\n')
  let edits = 0
  const out = lines.map((line, i) => {
    if (!/-blue-\d/.test(line)) return line
    const ctx =
      (lines[i - 2] || '') + (lines[i - 1] || '') + line + (lines[i + 1] || '') + (lines[i + 2] || '')
    if (MPR_RE.test(ctx) || SOCIAL_RE.test(ctx) || GRADIENT_RE.test(line)) return line
    const next = transformLine(line)
    if (next !== line) edits++
    return next
  })

  if (edits > 0) {
    totalLines += edits
    touched.push(`${file} (${edits})`)
    if (!dry) writeFileSync(file, out.join('\n'))
  }
}

console.log(`${dry ? '[DRY] ' : ''}${touched.length} fichier(s), ${totalLines} ligne(s)`)
touched.slice(0, 40).forEach((t) => console.log('  ' + t))
if (touched.length > 40) console.log(`  … +${touched.length - 40} fichiers`)
