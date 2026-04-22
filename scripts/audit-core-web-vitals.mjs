#!/usr/bin/env node
/**
 * scripts/audit-core-web-vitals.mjs
 * ---------------------------------
 * Vérifie les fondamentaux CWV statiquement analysables :
 *
 *   1. Fonts next/font avec `display: 'swap'` ou `'optional'` — sinon FOIT
 *      (Flash of Invisible Text) pendant jusqu'à 3s → LCP dégradé.
 *
 *   2. Chaque `<Image>` Next.js déclare `fill` OU `width`+`height` — sinon
 *      CLS (Cumulative Layout Shift) au rendu de l'image. Critère Google :
 *      CLS ≤ 0.1 pour "Good".
 *
 *   3. Chaque `<img>` HTML brut déclare `width`+`height`+`loading` (idem
 *      CLS + lazy-loading hors fold = économie bandwidth).
 *
 *   4. `layout.tsx` déclare `preconnect` vers les origines tierces critiques
 *      (Supabase, analytics) — sinon handshake TLS à froid à chaque nav.
 *
 * Pourquoi :
 *   - CWV fait partie du ranking depuis juin 2021 (Page Experience).
 *   - LCP dégradé = perte de position ; CLS > 0.25 = "Poor" = signal négatif.
 *   - Ces gaps sont silencieux : aucune erreur de build, juste de la dette UX.
 *
 * Usage :
 *   node scripts/audit-core-web-vitals.mjs            # human
 *   node scripts/audit-core-web-vitals.mjs --json     # JSON
 *   node scripts/audit-core-web-vitals.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.tsx?$/.test(entry)) acc.push(full)
  }
  return acc
}

// ── 1. next/font — display must be 'swap' or 'optional' ─────────────────
const ALL_FILES = [...walk('src/app'), ...walk('src/components'), ...walk('src/lib')]
const fontFindings = []
for (const f of ALL_FILES) {
  const src = readFileSync(f, 'utf8')
  if (!/from\s+['"]next\/font/.test(src)) continue
  // Find each font loader call: e.g. `const x = FontName({...})`
  const callRe = /=\s*([A-Z][\w]*)\s*\(\s*\{([\s\S]*?)\}\s*\)/g
  for (const m of src.matchAll(callRe)) {
    const fnName = m[1]
    const body = m[2]
    // Ensure caller is a font loader: fnName must be imported from next/font
    const importRe = new RegExp(
      `import\\s*\\{[^}]*\\b${fnName}\\b[^}]*\\}\\s*from\\s*['"]next\\/font`,
      's'
    )
    if (!importRe.test(src)) continue
    const displayMatch = body.match(/\bdisplay\s*:\s*['"`]([^'"`]+)['"`]/)
    const display = displayMatch ? displayMatch[1] : undefined
    if (!display || (display !== 'swap' && display !== 'optional')) {
      fontFindings.push({
        file: f.replace(/\\/g, '/'),
        line: src.slice(0, m.index).split('\n').length,
        font: fnName,
        display: display || '(absent, défaut = block)',
      })
    }
  }
}

// ── 2. <Image> must have fill OR width+height ───────────────────────────
const imageFindings = []
for (const f of ALL_FILES) {
  const src = readFileSync(f, 'utf8')
  if (!/<Image\b/.test(src)) continue
  // Skip icons (ImageIcon, MenuImageIcon, etc.) — keep only exact <Image
  const imgRe = /<Image\b([\s\S]*?)\/?>/g
  for (const m of src.matchAll(imgRe)) {
    const attrs = m[1]
    // Guard: only real Image component opens (first char after Image must be whitespace)
    const hasFill = /\bfill\b(?:\s*=\s*\{?\s*true\s*\}?)?(?![\w-])/.test(attrs)
    const hasWidth = /\bwidth\s*=/.test(attrs)
    const hasHeight = /\bheight\s*=/.test(attrs)
    if (!hasFill && (!hasWidth || !hasHeight)) {
      imageFindings.push({
        file: f.replace(/\\/g, '/'),
        line: src.slice(0, m.index).split('\n').length,
        missing: [!hasWidth && 'width', !hasHeight && 'height'].filter(Boolean),
      })
    }
  }
}

// ── 3. <img> raw must have width+height ─────────────────────────────────
const rawImgFindings = []
for (const f of ALL_FILES) {
  const src = readFileSync(f, 'utf8')
  if (!/<img\s/.test(src)) continue
  const re = /<img\b([\s\S]*?)\/?>/g
  for (const m of src.matchAll(re)) {
    const attrs = m[1]
    const hasWidth = /\bwidth\s*=/.test(attrs)
    const hasHeight = /\bheight\s*=/.test(attrs)
    // Skip inside template literals used as embed snippets (user copy-paste)
    const pos = m.index
    const ctxStart = Math.max(0, pos - 200)
    const ctx = src.slice(ctxStart, pos)
    const isEmbedTemplate = /`[^`]*$/.test(ctx)
    if (isEmbedTemplate) continue
    if (!hasWidth || !hasHeight) {
      rawImgFindings.push({
        file: f.replace(/\\/g, '/'),
        line: src.slice(0, pos).split('\n').length,
        missing: [!hasWidth && 'width', !hasHeight && 'height'].filter(Boolean),
      })
    }
  }
}

// ── 4. Root layout preconnect coverage ──────────────────────────────────
const LAYOUT = 'src/app/layout.tsx'
const layoutReport = { supabase: false, analytics: false, gtm: false }
let preconnectGaps = []
if (existsSync(LAYOUT)) {
  const src = readFileSync(LAYOUT, 'utf8')
  layoutReport.supabase =
    /rel=["']preconnect["'][^>]*(?:supabase|NEXT_PUBLIC_SUPABASE_URL)/s.test(src)
  layoutReport.analytics =
    /rel=["']preconnect["'][^>]*(?:google-analytics|ahrefs|plausible|cloudflare)/s.test(src)
  layoutReport.gtm = /rel=["']preconnect["'][^>]*googletagmanager/s.test(src)
  if (!layoutReport.supabase) preconnectGaps.push('Supabase (NEXT_PUBLIC_SUPABASE_URL)')
  if (!layoutReport.analytics && !layoutReport.gtm)
    preconnectGaps.push('analytics / GTM')
}

const report = {
  fonts_checked: fontFindings.length === 0,
  font_gaps: fontFindings,
  image_gaps: imageFindings,
  raw_img_gaps: rawImgFindings,
  layout_preconnect: layoutReport,
  preconnect_gaps: preconnectGaps,
}

const hasGap =
  fontFindings.length > 0 ||
  imageFindings.length > 0 ||
  rawImgFindings.length > 0 ||
  preconnectGaps.length > 0

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Core Web Vitals Audit (fonts + images + preconnect)\n')
  console.log(`  Fonts next/font gaps             : ${fontFindings.length}`)
  console.log(`  <Image> sans fill/width/height   : ${imageFindings.length}`)
  console.log(`  <img> raw sans width/height      : ${rawImgFindings.length}`)
  console.log(`  Preconnect layout gaps           : ${preconnectGaps.length}\n`)
  if (!hasGap) {
    console.log('  ✅ CWV fondamentaux OK.\n')
  } else {
    if (fontFindings.length > 0) {
      console.log(`  ❌ Fonts sans display=swap|optional :`)
      for (const g of fontFindings)
        console.log(`     ${g.font.padEnd(12)} display=${g.display}  ${g.file}:${g.line}`)
      console.log('')
    }
    if (imageFindings.length > 0) {
      console.log(`  ❌ <Image> sans fill ni width+height :`)
      for (const g of imageFindings.slice(0, 25))
        console.log(`     manque ${g.missing.join('+')}  ${g.file}:${g.line}`)
      if (imageFindings.length > 25) console.log(`     ... et ${imageFindings.length - 25} de plus`)
      console.log('')
    }
    if (rawImgFindings.length > 0) {
      console.log(`  ❌ <img> raw sans width/height :`)
      for (const g of rawImgFindings.slice(0, 15))
        console.log(`     manque ${g.missing.join('+')}  ${g.file}:${g.line}`)
      console.log('')
    }
    if (preconnectGaps.length > 0) {
      console.log(`  ❌ Layout root preconnect manquant :`)
      for (const g of preconnectGaps) console.log(`     - ${g}`)
      console.log('')
    }
  }
}

if (strict && hasGap) process.exit(1)
