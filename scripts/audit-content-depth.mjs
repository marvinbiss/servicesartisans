#!/usr/bin/env node
/**
 * scripts/audit-content-depth.mjs
 * ------------------------------
 * Détecte les pages indexables STATIQUES dont le contenu textuel brut est
 * trop court pour être considéré par Google comme du contenu de valeur.
 *
 * Pourquoi :
 *   - Google Search Central, "Thin content" (quality evaluator guidelines
 *     section 7.4) : les pages < 150-200 mots indexables bloquent la phase
 *     "indexed" et finissent en "crawled – currently not indexed" dans GSC.
 *   - Lighthouse SEO audit "Document has a meta description" et
 *     "Document doesn't have short content" flag < 100 mots.
 *
 * Méthodologie :
 *   1. Parcours des `page.tsx` indexables (exclut noindex + redirects).
 *   2. Pour chaque page, extraire le texte rendu JSX (on strippe tags,
 *      expressions `{...}` qu'on ne peut pas résoudre, imports/utils).
 *   3. Compter les mots (tokens séparés par whitespace, ≥ 2 caractères).
 *   4. Flag les pages < MIN_WORDS (défaut 150).
 *
 * Limite : pages qui chargent leur contenu dynamiquement (DB, CMS, API)
 * affichent beaucoup moins de mots en static analysis que ce que Google
 * crawle. On exclut explicitement les pages avec `getPageContent` ou
 * `CmsContent` (contenu CMS = rempli runtime) et les dynamic routes
 * (servis par generateMetadata + runtime data).
 *
 * Usage :
 *   node scripts/audit-content-depth.mjs             # human
 *   node scripts/audit-content-depth.mjs --json      # JSON
 *   node scripts/audit-content-depth.mjs --strict    # exit 1 si thin page
 *   node scripts/audit-content-depth.mjs --min=100   # override MIN_WORDS
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const minArg = args.find((a) => a.startsWith('--min='))
const MIN_WORDS = minArg ? parseInt(minArg.split('=')[1], 10) : 150

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

function isDynamicRoute(file) {
  return /\[[^\]]+\]/.test(file)
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
 * Une page dépend de contenu runtime si :
 *   - elle importe/utilise `getPageContent` (CMS)
 *   - elle importe `CmsContent` (rendu HTML dynamique depuis la DB)
 *   - elle importe des données importantes via variables (tradeContent,
 *     articles, etc.) injectées dans le JSX
 * Dans ce cas, le word-count static est un faux-négatif.
 */
function isRuntimeContentHeavy(src) {
  if (/\bgetPageContent\s*\(/.test(src)) return true
  if (/\bCmsContent\b/.test(src)) return true
  return false
}

/**
 * Extrait le texte de tous les JSX strings (entre `>` et `<`), des
 * attributs `title=`, `alt=`, `aria-label=`. On compte aussi les string
 * literals dans les arrays `faqItems`, `tldr`, `steps` s'ils sont en
 * top-level de la page (patterns typiques des guides flagship).
 */
function extractTextWords(src) {
  // 1. Strip imports et exports statiques (metadata, revalidate, etc.).
  //    Pour les exports scalaires (revalidate = false, dynamic = 'auto'), on
  //    strippe jusqu'à la fin de la ligne (évite de manger le reste du fichier
  //    via une greedy `[^{;]*`). Pour les objets, on strippe le bloc `{...}`.
  let working = src
    .replace(/^import\s[^;\n]+$/gm, '')
    .replace(
      /export\s+const\s+(metadata|viewport)(?:\s*:\s*\w+)?\s*=\s*\{[\s\S]*?\n\}/g,
      ''
    )
    .replace(
      /export\s+const\s+(revalidate|dynamic|dynamicParams|fetchCache|runtime|preferredRegion|maxDuration)\s*=\s*[^\n]+/g,
      ''
    )

  // 2. Retire les commentaires JSX (safe car délimiteur {/* })
  working = working.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  // 3. Retire le contenu des balises <script>, <style> et JSON-LD data props
  working = working
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')

  // 4. Collecte le texte JSX : tout ce qui est entre `>` et `<` (hors
  //    expressions `{...}` qu'on évacue).
  const words = []
  const textRe = />([^<{]*)</g
  for (const m of working.matchAll(textRe)) {
    const txt = m[1].trim()
    if (!txt) continue
    for (const tok of txt.split(/\s+/)) {
      if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) words.push(tok)
    }
  }

  // 5. Ajoute le texte des string literals dans les attributs (title, alt,
  //    aria-label) : souvent 10-30 mots de SEO clé.
  const attrWordRe = /(?:title|alt|aria-label|placeholder|aria-describedby)\s*=\s*["']([^"']{3,})["']/g
  for (const m of working.matchAll(attrWordRe)) {
    for (const tok of m[1].split(/\s+/)) {
      if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) words.push(tok)
    }
  }

  // 6. Ajoute le texte des strings littérales dans les data-arrays top-level
  //    (faqItems, tldr, steps, bullets, questions). Heuristique : on prend
  //    toute string literal de ≥ 40 caractères (signature contenu vs label UI).
  const dataStringRe = /["'`]([^"'`]{40,})["'`]/g
  for (const m of working.matchAll(dataStringRe)) {
    const txt = m[1]
    if (/\n/.test(txt) || /\s/.test(txt)) {
      for (const tok of txt.split(/\s+/)) {
        if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) words.push(tok)
      }
    }
  }

  return words.length
}

/**
 * Ajoute au compte mots le texte des composants locaux ou alias `@/`
 * importés directement par la page (profondeur 1). On exclut les helpers
 * génériques (icones Lucide, hooks SWR, React, lib, etc.) pour ne pas
 * gonfler artificiellement le total avec du code non-contenu.
 */
function countImportedWords(pageFile, src) {
  const pageDir = dirname(pageFile)
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  let total = 0
  for (const m of src.matchAll(importRe)) {
    const spec = m[1]
    // Skip les imports non-contenu (hooks, data, lib)
    if (/^@\/(hooks|lib|types|contexts|stores)(\/|$)/.test(spec)) continue
    if (/^@\/lib\//.test(spec)) continue
    const candidates = []
    if (spec.startsWith('./')) {
      const base = `${pageDir}/${spec.replace(/^\.\//, '')}`
      candidates.push(base + '.tsx', base + '.ts', `${base}/index.tsx`)
    } else if (spec.startsWith('@/')) {
      const base = spec.replace(/^@\//, 'src/')
      candidates.push(base + '.tsx', base + '.ts', `${base}/index.tsx`)
    }
    for (const c of candidates) {
      if (existsSync(c)) {
        try {
          total += extractTextWords(readFileSync(c, 'utf8'))
        } catch {}
        break
      }
    }
  }
  return total
}

const pages = walk('src/app')
const thin = []
const stats = []
let scanned = 0
let skippedDynamic = 0
let skippedRuntime = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (isDynamicRoute(normalized)) {
    skippedDynamic++
    continue
  }
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  if (isRuntimeContentHeavy(src)) {
    skippedRuntime++
    continue
  }
  // Agrège le word-count de la page + ses composants importés (depth 1)
  // afin d'approcher le texte réellement rendu en SSR.
  const directWc = extractTextWords(src)
  const importedWc = countImportedWords(f, src)
  const wc = directWc + importedWc
  const route = pathToRoute(normalized)
  stats.push({ route, file: normalized, word_count: wc, direct: directWc, imported: importedWc })
  scanned++
  if (wc < MIN_WORDS) {
    thin.push({ route, file: normalized, word_count: wc, direct: directWc, imported: importedWc })
  }
}

const sortedStats = [...stats].sort((a, b) => a.word_count - b.word_count)
const median = sortedStats.length
  ? sortedStats[Math.floor(sortedStats.length / 2)].word_count
  : 0

const report = {
  min_words_threshold: MIN_WORDS,
  static_pages_scanned: scanned,
  skipped_dynamic: skippedDynamic,
  skipped_runtime_content: skippedRuntime,
  median_word_count: median,
  thin_pages_count: thin.length,
  coverage_pct: scanned === 0 ? 100 : Number((((scanned - thin.length) / scanned) * 100).toFixed(1)),
  thin_pages: thin.sort((a, b) => a.word_count - b.word_count),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`\n📋 Content Depth Audit (min ${MIN_WORDS} mots)\n`)
  console.log(`  Pages statiques scannées    : ${report.static_pages_scanned}`)
  console.log(`  Pages dyn. skippées         : ${report.skipped_dynamic}`)
  console.log(`  Pages CMS/runtime skippées  : ${report.skipped_runtime_content}`)
  console.log(`  Médiane mots/page           : ${report.median_word_count}`)
  console.log(`  Pages thin (< ${MIN_WORDS})       : ${report.thin_pages_count}`)
  console.log(`  Coverage                    : ${report.coverage_pct}%\n`)

  if (thin.length === 0) {
    console.log(`  ✅ Aucune page thin (< ${MIN_WORDS} mots).\n`)
  } else {
    console.log('  ⚠️  Pages thin :')
    for (const p of thin.slice(0, 30)) {
      console.log(`     ${String(p.word_count).padStart(4)} mots  ${p.route}`)
    }
    if (thin.length > 30) console.log(`     ... et ${thin.length - 30} de plus`)
    console.log('')
  }
}

if (strict && thin.length > 0) process.exit(1)
