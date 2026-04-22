#!/usr/bin/env node
/**
 * scripts/audit-favicon-viewport.mjs
 * ----------------------------------
 * Vérifie la présence et la validité des métadonnées obligatoires au
 * niveau APP ROOT (rendues sur CHAQUE page via Next.js 14 App Router) :
 *
 *   1. favicon root — `src/app/favicon.ico` ou `src/app/icon.{png,svg,ico}`
 *      OU `src/app/icon.tsx` (dynamic icon). Google utilise le favicon dans
 *      le SERP mobile et desktop depuis 2019.
 *   2. manifest.json — `src/app/manifest.ts` ou `src/app/manifest.json`
 *      nécessaire pour PWA install + qualité mobile.
 *   3. viewport metadata — `export const viewport` dans `src/app/layout.tsx`
 *      avec `width: 'device-width'` (mobile-first indexing requiert ça).
 *   4. themeColor — couleur de barre browser, soft UX signal.
 *
 * Pourquoi :
 *   - Favicon absent = aucune icône dans SERP, logo par défaut « page blanche ».
 *   - Viewport absent = Google flag la page « not mobile-friendly » (pénalité
 *     mobile-first indexing).
 *   - Manifest manquant = Lighthouse PWA score 0.
 *
 * Règle stricte : favicon + viewport obligatoires.
 * Règle soft : manifest + themeColor reportés.
 *
 * Usage :
 *   node scripts/audit-favicon-viewport.mjs            # human
 *   node scripts/audit-favicon-viewport.mjs --json     # JSON
 *   node scripts/audit-favicon-viewport.mjs --strict   # exit 1 si gap critique
 */

import { readFileSync, existsSync } from 'node:fs'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

// 1. Favicon — Next.js privilégie `src/app/favicon.ico` (file convention),
// mais des assets dans `public/favicon.*` fonctionnent via lien dans metadata.
// Les deux chemins sont tolérés ; seul compte qu'au moins UN favicon soit servi.
const FAVICON_CANDIDATES = [
  'src/app/favicon.ico',
  'src/app/icon.ico',
  'src/app/icon.png',
  'src/app/icon.svg',
  'src/app/icon.jpg',
  'src/app/icon.tsx',
  'src/app/icon.ts',
  'src/app/apple-icon.png',
  'src/app/apple-icon.jpg',
  'src/app/apple-icon.tsx',
  'public/favicon.ico',
  'public/favicon.png',
  'public/favicon.svg',
  'public/icon.svg',
  'public/apple-touch-icon.png',
]
const faviconFound = FAVICON_CANDIDATES.filter((c) => existsSync(c))
const hasFavicon = faviconFound.length > 0

// 2. Manifest
const MANIFEST_CANDIDATES = [
  'src/app/manifest.ts',
  'src/app/manifest.tsx',
  'src/app/manifest.json',
  'public/manifest.json',
  'public/manifest.webmanifest',
]
const manifestFound = MANIFEST_CANDIDATES.filter((c) => existsSync(c))
const hasManifest = manifestFound.length > 0

// 3. Viewport — doit être dans `src/app/layout.tsx`
const LAYOUT_PATH = 'src/app/layout.tsx'
let viewportPresent = false
let viewportWidth = null
let themeColorPresent = false
let layoutError = null

if (!existsSync(LAYOUT_PATH)) {
  layoutError = 'src/app/layout.tsx introuvable'
} else {
  const src = readFileSync(LAYOUT_PATH, 'utf8')
  // `export const viewport` (Next.js 14.2+) OU `viewport` dans metadata export.
  // Supporte l'annotation de type TS (ex: `export const viewport: Viewport = {`).
  const viewportExport = src.match(
    /export\s+const\s+viewport(?:\s*:\s*\w+)?\s*=\s*\{([\s\S]*?)\n\}/
  )
  const metadataViewport = src.match(/viewport\s*:\s*\{([\s\S]*?)\n\s*\}/)
  const block = viewportExport?.[1] ?? metadataViewport?.[1] ?? null
  if (block) {
    viewportPresent = true
    const widthMatch = block.match(/width\s*:\s*['"]([^'"]+)['"]/)
    viewportWidth = widthMatch ? widthMatch[1] : null
    themeColorPresent = /themeColor\s*:/.test(block)
  } else {
    // Fallback : `<meta name="viewport">` inline dans le layout
    if (/<meta\s+name=["']viewport["']/.test(src)) {
      viewportPresent = true
      viewportWidth = 'inline-meta-tag'
    }
  }
}

const viewportValid = viewportPresent && viewportWidth === 'device-width'

const criticalGaps = []
if (!hasFavicon) criticalGaps.push('favicon absent (src/app/favicon.ico ou icon.*)')
if (!viewportPresent) criticalGaps.push('viewport metadata absente dans layout.tsx')
if (viewportPresent && !viewportValid)
  criticalGaps.push(`viewport.width = "${viewportWidth}" (attendu: "device-width")`)
if (layoutError) criticalGaps.push(layoutError)

const softGaps = []
if (!hasManifest) softGaps.push('manifest absent (src/app/manifest.ts|json)')
if (viewportPresent && !themeColorPresent) softGaps.push('themeColor absent du viewport')

const report = {
  favicon: {
    present: hasFavicon,
    files: faviconFound,
  },
  manifest: {
    present: hasManifest,
    files: manifestFound,
  },
  viewport: {
    present: viewportPresent,
    width: viewportWidth,
    valid_device_width: viewportValid,
    theme_color_present: themeColorPresent,
  },
  critical_gaps: criticalGaps,
  soft_gaps: softGaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Favicon + Viewport + Manifest Audit\n')
  console.log(`  Favicon   : ${hasFavicon ? '✓' : '✗'} ${faviconFound.join(', ') || '—'}`)
  console.log(`  Manifest  : ${hasManifest ? '✓' : '✗'} ${manifestFound.join(', ') || '—'}`)
  console.log(
    `  Viewport  : ${viewportPresent ? '✓' : '✗'} width="${viewportWidth ?? '—'}" themeColor=${
      themeColorPresent ? '✓' : '✗'
    }`
  )
  console.log('')
  if (criticalGaps.length === 0 && softGaps.length === 0) {
    console.log('  ✅ Tous les meta root sont conformes.\n')
  } else {
    if (criticalGaps.length) {
      console.log('  ❌ Gaps critiques :')
      for (const g of criticalGaps) console.log(`     - ${g}`)
      console.log('')
    }
    if (softGaps.length) {
      console.log('  ⚠️  Gaps soft (non bloquants) :')
      for (const g of softGaps) console.log(`     - ${g}`)
      console.log('')
    }
  }
}

if (strict && criticalGaps.length > 0) process.exit(1)
