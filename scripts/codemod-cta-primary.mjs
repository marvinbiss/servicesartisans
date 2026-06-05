#!/usr/bin/env node
/**
 * codemod-cta-primary.mjs — wave C design premium (2026-06-06)
 * -----------------------------------------------------------
 * Normalise le CTA canonique DESIGN.md : fill `bg-primary-500` + `hover:bg-primary-600`.
 *
 * Règle 1 (globale, line-based) : tout fill interactif `bg-primary-600` pairé
 *   `hover:bg-primary-700` OU porteur de `text-white` → 500/hover:600.
 *   Idem `bg-primary-700` + `hover:bg-primary-800` → 500/hover:600.
 *   `shadow-primary-600/25` suit le fill → `shadow-primary-500/25`.
 *   Exclut via lookbehind les variantes `hover:`/`focus:`/etc. et les
 *   translucides `bg-primary-600/xx`.
 *
 * Règle 2 (liste explicite) : fills CTA `bg-primary-400 text-white` historiques
 *   → 500. Les usages décoratifs 400 (dots, barres, ping, translucides,
 *   underline header, avatars) sont volontairement conservés.
 *
 * Règle 3 : legacy `hover:bg-primary-300 … border border-primary-300`
 *   (hover plus CLAIR + bordure teintée) → hover:600 sans bordure.
 *
 * Usage : node scripts/codemod-cta-primary.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const dry = process.argv.includes('--dry')

// ——— Règle 2 : fichiers où bg-primary-400 (plein, non translucide) = CTA à canoniser
const FILES_400 = [
  'src/components/ProviderCard.tsx',
  'src/components/home/ClayHeroSearch.tsx',
  'src/components/home/ClayHomePage.tsx',
  'src/components/estimation/LeadForm.tsx',
  'src/components/estimation/CallbackPanel.tsx',
  'src/components/estimation/EstimationWidget.tsx',
  'src/components/estimation/ChatPanel.tsx',
  'src/components/conversion/DevisBottomSheet.tsx',
  'src/components/seo/CrossIntentLinks.tsx',
  'src/components/seo/FallbackProviders.tsx',
  'src/components/seo/LocalProviderShowcase.tsx',
  'src/components/SearchFilters.tsx',
  'src/components/providers/FilterPanel.tsx',
  'src/components/artisan-dashboard/Calendar.tsx',
  'src/app/(public)/widget/page.tsx',
  'src/app/(public)/badge-artisan/BadgeClient.tsx',
  'src/app/(public)/tarifs/page.tsx',
  'src/app/(public)/departements/page.tsx',
  'src/app/(public)/avant-apres/page.tsx',
  'src/app/(public)/avis/[service]/page.tsx',
  'src/app/(public)/guides/eviter-arnaques-artisan/page.tsx',
  'src/app/(public)/guides/pompe-a-chaleur/page.tsx',
  'src/app/(public)/guides/renovation-toiture/page.tsx',
  'src/app/(public)/guides/renovation-salle-de-bain/page.tsx',
  'src/app/(public)/guides/renovation-fenetres/page.tsx',
  'src/app/(public)/guides/permis-construire/page.tsx',
]
// LauncherButton : CTA seulement (préserver le ping décoratif bg-primary-400)
const PATTERN_400 = [
  ['src/components/estimation/LauncherButton.tsx', 'bg-primary-400 text-white', 'bg-primary-500 text-white'],
]
// hover:bg-primary-500 → 600 après renommage du fill (anciens duos 400/500)
const FILES_HOVER_500 = new Set([
  'src/components/ProviderCard.tsx',
  'src/components/seo/FallbackProviders.tsx',
  'src/components/seo/LocalProviderShowcase.tsx',
  'src/app/(public)/tarifs/page.tsx',
  'src/app/(public)/departements/page.tsx',
])

const RE_400 = /(^|[^:-])\bbg-primary-400\b(?!\/)/g
const RE_600 = /(^|[^:-])\bbg-primary-600\b(?!\/)/g
const RE_700 = /(^|[^:-])\bbg-primary-700\b(?!\/)/g

const files = execSync(`git ls-files src -- "*.ts" "*.tsx"`, { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)

let totalEdits = 0
const touched = []

for (const file of files) {
  const norm = file.replace(/\\/g, '/')
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const before = src

  // ——— Règle 1 : line-based 600/700 → 500/600
  src = src
    .split('\n')
    .map((line) => {
      const hasFill600 = RE_600.test(line)
      RE_600.lastIndex = 0
      const hasFill700 = RE_700.test(line)
      RE_700.lastIndex = 0
      const interactive600 = hasFill600 && (line.includes('hover:bg-primary-700') || line.includes('text-white'))
      const interactive700 = hasFill700 && line.includes('hover:bg-primary-800')
      if (interactive600) {
        line = line
          .replace(RE_600, '$1bg-primary-500')
          .replace(/hover:bg-primary-700\b/g, 'hover:bg-primary-600')
          .replace(/shadow-primary-600\/25\b/g, 'shadow-primary-500/25')
      }
      if (interactive700) {
        line = line
          .replace(RE_700, '$1bg-primary-500')
          .replace(/hover:bg-primary-800\b/g, 'hover:bg-primary-600')
      }
      return line
    })
    .join('\n')

  // ——— Règle 2 : 400 → 500 sur fichiers listés
  if (FILES_400.includes(norm)) {
    src = src.replace(RE_400, '$1bg-primary-500')
  }
  for (const [f, from, to] of PATTERN_400) {
    if (norm === f) src = src.split(from).join(to)
  }
  if (FILES_HOVER_500.has(norm)) {
    src = src.replace(/hover:bg-primary-500\b/g, 'hover:bg-primary-600')
  }

  // ——— Règle 3 : legacy hover plus clair + bordure teintée
  src = src
    .split('hover:bg-primary-300 transition-colors border border-primary-300')
    .join('hover:bg-primary-600 transition-colors')
  src = src.split('hover:bg-primary-300 transition-colors').join('hover:bg-primary-600 transition-colors')

  // ——— Règle 4 (globale) : CTA 400 raté par la liste — fill plein 400 + text-white
  // + un hover:bg-primary-* sur la même ligne = bouton, pas décor (les avatars/
  // dots n'ont jamais de hover de fill). → fill 500, hover 500→600.
  src = src
    .split('\n')
    .map((line) => {
      const hasFill400 = RE_400.test(line)
      RE_400.lastIndex = 0
      if (hasFill400 && line.includes('text-white') && /hover:bg-primary-\d/.test(line)) {
        line = line
          .replace(RE_400, '$1bg-primary-500')
          .replace(/hover:bg-primary-500\b/g, 'hover:bg-primary-600')
      }
      return line
    })
    .join('\n')

  if (src !== before) {
    const n = countDiff(before, src)
    totalEdits += n
    touched.push(`${file} (${n} ligne(s))`)
    if (!dry) writeFileSync(file, src)
  }
}

function countDiff(a, b) {
  const la = a.split('\n')
  const lb = b.split('\n')
  let n = 0
  for (let i = 0; i < la.length; i++) if (la[i] !== lb[i]) n++
  return n
}

console.log(`${dry ? '[DRY] ' : ''}${touched.length} fichier(s), ${totalEdits} ligne(s) modifiée(s) :`)
for (const t of touched) console.log('  ' + t)
