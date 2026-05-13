#!/usr/bin/env node
/**
 * scripts/audit-h1-uniqueness.mjs
 * ------------------------------
 * Vérifie que chaque page indexable a EXACTEMENT un `<h1>` dans son JSX.
 *
 * Pourquoi :
 *   - 0 H1 : Google fallback sur le title ou l'URL → signal faible
 *   - 2+ H1 : ambiguïté du topic principal → ranking dilué
 *   - H1 absent sur page pSEO = pattern typique "thin content"
 *
 * Limites :
 *   - On scan seulement le fichier `page.tsx` + ses sous-composants immédiats
 *     (LocalComponent.tsx importé depuis le même dossier). Les H1 injectés
 *     depuis des composants réutilisables (ex: HeroPanel) sont approximés
 *     par présence d'import.
 *   - Les H1 conditionnels (`{condition && <h1>}`) sont comptés (prudent).
 *
 * Usage :
 *   node scripts/audit-h1-uniqueness.mjs            # human
 *   node scripts/audit-h1-uniqueness.mjs --json     # JSON
 *   node scripts/audit-h1-uniqueness.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

/**
 * Allowlist explicite — routes dont le H1 supplémentaire est derrière une
 * interaction (submit success, modal open) et n'apparaît donc PAS dans le
 * HTML crawlé par Google. Chaque entrée doit documenter le "why" pour
 * justifier l'exception (audit social review).
 */
const H1_ALLOWLIST = {
  '/contact':
    'ContactPageClient expose un <h1>Message envoyé</h1> derrière `if (isSubmitted)` — rendu uniquement post-submit, invisible aux crawlers.',
}

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
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
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

function stripComments(src) {
  // On retire uniquement les commentaires JSX `{/* ... */}` (safe, car leur
  // délimiteur `{` ne peut pas apparaître dans une string de code) et les
  // commentaires `//` en début de ligne. On NE retire PAS les `/* ... */`
  // bruts : ils peuvent être matchés par erreur à l'intérieur d'une string
  // (ex: `'A2P**/***'` crée un faux `/*` qui mange le reste du fichier).
  return src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')
}

/**
 * Count `<h1>` opening tags dans `src`. Simple count.
 */
function countH1(src) {
  const matches = stripComments(src).match(/<(?:h1|PageHeroH1)\b/g)
  return matches ? matches.length : 0
}

/**
 * Count H1 de manière branche-consciente : on prend le MAX parmi les
 * branches `return`. Rationale : plusieurs `return` représentent des
 * rendus exclusifs (soit data-driven côté serveur, soit state-driven côté
 * client). Seul l'un d'entre eux est rendu, donc la somme surestime.
 *
 * Limite connue : si un composant parent rend un <h1> PLUS un enfant qui a
 * aussi un <h1>, la somme parent+enfant est correcte (ils coexistent dans
 * le DOM). Cette fonction compte par branche, pas l'intersection avec les
 * enfants — c'est le travail de `resolveLocalH1`.
 */
function countH1BranchAware(src) {
  const cleaned = stripComments(src)
  const returnIdxs = [...cleaned.matchAll(/\breturn\s+[(<]/g)].map((m) => m.index ?? 0)
  if (returnIdxs.length <= 1) {
    return countH1(cleaned)
  }
  let maxH1 = 0
  for (let i = 0; i < returnIdxs.length; i++) {
    const start = returnIdxs[i]
    const end = returnIdxs[i + 1] ?? cleaned.length
    const segment = cleaned.slice(start, end)
    const count = (segment.match(/<(?:h1|PageHeroH1)\b/g) || []).length
    if (count > maxH1) maxH1 = count
  }
  return maxH1
}

/**
 * Résout les composants locaux importés et agrège leur contenu H1.
 * Cas couverts :
 *   - `import X from './X'` ou `'./X.tsx'`
 *   - `import X from '@/components/...'` (cherche dans src/components)
 *
 * On se limite à une profondeur 1 (pas de suivi récursif) pour éviter
 * la complexité. Les layouts communs (ex: hero partagé) ne sont pas
 * analysés ; à surveiller manuellement.
 */
function resolveLocalH1(pageFile, src) {
  const pageDir = dirname(pageFile)
  let extraH1 = 0
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  for (const m of src.matchAll(importRe)) {
    const spec = m[1]
    const candidates = []
    if (spec.startsWith('./')) {
      const base = join(pageDir, spec.replace(/^\.\//, ''))
      candidates.push(base + '.tsx', base + '.ts', join(base, 'index.tsx'))
    } else if (spec.startsWith('@/')) {
      const base = spec.replace(/^@\//, 'src/')
      candidates.push(base + '.tsx', base + '.ts', join(base, 'index.tsx'))
    }
    for (const c of candidates) {
      if (existsSync(c)) {
        try {
          const childSrc = readFileSync(c, 'utf8')
          // Branch-aware : un client component avec H1 dans une branche
          // conditionnelle (ex: `if (isSubmitted) return <h1>`) n'expose
          // pas ce H1 en SSR-initial.
          extraH1 += countH1BranchAware(childSrc)
        } catch {}
        break
      }
    }
  }
  return extraH1
}

const pages = walk('src/app')
const gaps = []
let indexable = 0
let exactlyOne = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++
  const inlineH1 = countH1BranchAware(src)
  const importedH1 = resolveLocalH1(f, src)
  let totalH1 = inlineH1 + importedH1

  // Pattern "server + client split" : le page.tsx serveur a >1 `return` (une
  // branche avec <h1> inline, une branche qui délègue à un Client component
  // avec son propre <h1>). À l'exécution, une SEULE branche rend. Si le
  // composant Client est importé EXCLUSIVEMENT dans une des branches sans
  // <h1> inline, on ne double-compte pas.
  if (inlineH1 === 1 && importedH1 === 1) {
    const cleaned = stripComments(src)
    const returnBlocks = [...cleaned.matchAll(/\breturn\s+[(<][\s\S]*?(?=\n\s*\}\s*\n|\n[a-z]|$)/g)]
    if (returnBlocks.length >= 2) {
      // Détecte les branches qui rendent un composant Client typique (PascalCase + "Client")
      const branchesWithClient = returnBlocks.filter((b) =>
        /<[A-Z]\w*(?:Client|PageClient)\b/.test(b[0])
      )
      const branchesWithInlineH1 = returnBlocks.filter((b) => /<(?:h1|PageHeroH1)\b/.test(b[0]))
      // Si les deux branches sont disjointes (pas de chevauchement H1 + Client),
      // le total runtime = 1 par branche. On accepte.
      const overlap = branchesWithClient.filter((b) => branchesWithInlineH1.includes(b))
      if (branchesWithClient.length > 0 && branchesWithInlineH1.length > 0 && overlap.length === 0) {
        totalH1 = 1
      }
    }
  }

  const route = pathToRoute(normalized)
  if (totalH1 === 1) {
    exactlyOne++
  } else if (H1_ALLOWLIST[route]) {
    // Exception documentée — on compte comme OK mais on le trace dans le rapport
    exactlyOne++
  } else {
    gaps.push({
      route,
      file: normalized,
      inline_h1: inlineH1,
      imported_h1: importedH1,
      total_h1: totalH1,
    })
  }
}

const report = {
  indexable_pages: indexable,
  exactly_one_h1: exactlyOne,
  pages_with_gap: gaps.length,
  coverage_pct: indexable === 0 ? 100 : Number(((exactlyOne / indexable) * 100).toFixed(1)),
  allowlisted_exceptions: Object.keys(H1_ALLOWLIST),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 H1 Uniqueness Audit\n')
  console.log(`  Pages indexables scannées  : ${report.indexable_pages}`)
  console.log(`  Exactement 1 H1            : ${report.exactly_one_h1}`)
  console.log(`  Pages avec gap (0 ou ≥2)   : ${report.pages_with_gap}`)
  console.log(`  Coverage                   : ${report.coverage_pct}%\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages indexables ont exactement 1 H1.\n')
  } else {
    console.log('  ⚠️  Pages avec H1 anormal :')
    for (const g of gaps) {
      const label = g.total_h1 === 0 ? 'AUCUN H1' : `${g.total_h1} H1`
      console.log(
        `     ${g.route.padEnd(50)} ${label.padEnd(10)} (inline=${g.inline_h1}, imports=${g.imported_h1})`
      )
    }
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
