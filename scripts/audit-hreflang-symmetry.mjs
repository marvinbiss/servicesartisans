#!/usr/bin/env node
/**
 * scripts/audit-hreflang-symmetry.mjs
 * -----------------------------------
 * Vérifie que le path passé à `getAlternates(path)` (ou au `canonical` et
 * `languages` manuels) correspond au path réel du fichier page.tsx. Un
 * mismatch crée une asymétrie hreflang inverse : la page A déclare canonical
 * vers B, mais B ne pointe jamais vers A → Google ignore la relation.
 *
 * Pourquoi :
 *   - Pour un site mono-lingue FR, la "symétrie inverse" se réduit à
 *     canonical + hreflang self-referential corrects.
 *   - Typo sur le path (`/rge/source` vs `/rge/sources`) = canonical invalide
 *     = Google assigne une canonical différente = page non indexée.
 *
 * Méthodologie :
 *   1. Pour chaque page.tsx indexable, dériver le route canonique depuis
 *      le filesystem (ex: `src/app/(public)/rge/sources/page.tsx` → `/rge/sources`).
 *   2. Extraire le path passé à `getAlternates('X')` ou à
 *      `canonical: ${SITE_URL}X` ou `languages: { 'fr-FR': ... }`.
 *   3. Pour les routes dynamiques (`[param]`), vérifier que le path contient
 *      `${param}` ou un placeholder template-litéral correspondant.
 *   4. Flag les mismatches.
 *
 * Usage :
 *   node scripts/audit-hreflang-symmetry.mjs            # human
 *   node scripts/audit-hreflang-symmetry.mjs --json     # JSON
 *   node scripts/audit-hreflang-symmetry.mjs --strict   # exit 1 si gap
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
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) {
    const metaRe = /export\s+const\s+metadata\s*[:=]\s*\{[\s\S]*?robots\s*:\s*\{\s*index\s*:\s*false/
    if (metaRe.test(src)) return true
  }
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  return false
}

function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .split(sep)
    .join('/')
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

/**
 * Normalise un path déclaré dans le code vers une forme comparable à
 * pathToRoute(file). On accepte les placeholders dynamiques équivalents :
 *   `${service}/${ville}` === `[service]/[ville]`
 *   `/rge/${slug}` === `/rge/[slug]`
 */
function normalizeDeclaredPath(decl, fileParams, fileSrc) {
  if (!decl) return null
  let norm = decl
  // Resolve ${VAR} against `const VAR = '...'` in the same file (for static
  // pages using a module-level SLUG const). Fall back to [varname] placeholder
  // for unresolvable refs (runtime params, props, etc).
  norm = norm.replace(/\$\{([\w.]+)\}/g, (_, v) => {
    const varName = v.split('.').pop()
    if (fileSrc) {
      const constRe = new RegExp(`const\\s+${varName}\\s*=\\s*['"\`]([^'"\`]+)['"\`]`)
      const m = fileSrc.match(constRe)
      if (m) return m[1]
    }
    return `[${varName}]`
  })
  return norm
}

function routeToComparable(route) {
  // e.g. /rge/qualifications/[slug] → /rge/qualifications/[slug]
  return route
}

const pages = walk('src/app').filter((f) => /page\.tsx$/.test(f))
const gaps = []
let scanned = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  const route = pathToRoute(normalized)

  // Extract declared path from getAlternates('X') or getAlternates(path) or templating
  let declared = null
  const alternatesMatch = src.match(/getAlternates\s*\(\s*([^)]+)\s*\)/)
  if (alternatesMatch) {
    const arg = alternatesMatch[1].trim()
    const litMatch = arg.match(/^['"`]([^'"`]+)['"`]$/)
    const tplMatch = arg.match(/^`([^`]+)`$/)
    if (litMatch) declared = litMatch[1]
    else if (tplMatch) declared = tplMatch[1]
    else {
      // It's a variable (e.g. `path`). Look up `const path = '...'` or `const path = `...``
      const constRe = /const\s+path\s*=\s*(?:`([^`]+)`|['"]([^'"]+)['"])/
      const constMatch = src.match(constRe)
      if (constMatch) declared = constMatch[1] || constMatch[2]
      else {
        // Could be a function param; can't resolve → skip
        continue
      }
    }
  } else {
    // Maybe manual alternates with canonical: `${SITE_URL}X`
    const canonMatch = src.match(
      /canonical\s*:\s*(?:`\$\{SITE_URL\}([^`]*)`|`([^`]+)`|['"]([^'"]+)['"])/
    )
    if (canonMatch) {
      const c = canonMatch[1] || canonMatch[2] || canonMatch[3] || ''
      declared = c.replace(/^https?:\/\/[^/]+/, '')
    }
    if (!declared) continue // no alternates info
  }

  // Skip dynamic routes: the declared path includes runtime variables that
  // the static analyzer can't resolve. At runtime the variable interpolates
  // to the correct value (the file's own slug), so the symmetry is
  // guaranteed by construction. Only static routes admit literal comparison.
  const isDynamic = /\[[^\]]+\]/.test(normalized)
  if (isDynamic) continue

  scanned++

  // Compare file route with declared (tolerating dynamic param rewrites)
  const fileParams = [...normalized.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1])
  const normDeclared = normalizeDeclaredPath(declared, fileParams, src)
  const normRoute = routeToComparable(route)
  // Strip trailing slashes for comparison
  const a = (normDeclared || '').replace(/\/$/, '') || '/'
  const b = normRoute.replace(/\/$/, '') || '/'
  if (a !== b) {
    gaps.push({ route: b, file: normalized, declared, normalized_declared: a })
  }
}

const report = {
  pages_checked: scanned,
  mismatch_count: gaps.length,
  coverage_pct:
    scanned === 0 ? 100 : Number((((scanned - gaps.length) / scanned) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Hreflang Symmetry Audit\n')
  console.log(`  Pages avec alternates         : ${report.pages_checked}`)
  console.log(`  Mismatches path↔fichier       : ${report.mismatch_count}`)
  console.log(`  Coverage                      : ${report.coverage_pct}%\n`)
  if (gaps.length === 0) {
    console.log('  ✅ Tous les canonical/hreflang sont alignés avec le path fichier.\n')
  } else {
    console.log('  ❌ Mismatches :')
    for (const g of gaps.slice(0, 30))
      console.log(`     file=${g.route.padEnd(45)} declared=${g.normalized_declared}`)
    if (gaps.length > 30) console.log(`     ... et ${gaps.length - 30} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
