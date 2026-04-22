#!/usr/bin/env node
/**
 * scripts/audit-eeat-dom-signals.mjs
 * ----------------------------------
 * Pour chaque page qui émet un schéma JSON-LD Article / BlogPosting /
 * TechArticle / NewsArticle *racine* (avec `@context`), vérifie que l'auteur
 * ET la date de publication sont aussi rendus dans le DOM visible, pas
 * uniquement dans le payload JSON-LD.
 *
 * Pourquoi :
 *   - Google Quality Raters Guidelines §5.1 (Authoritativeness /
 *     Trustworthiness) : "author visible to users" est un critère explicite.
 *     Un article avec JSON-LD-only auteur = "anonymous content" = Low
 *     Quality pour les raters, ce qui alimente le Helpful Content System.
 *   - YMYL (aides financières, rénovation, fiscalité) : E-E-A-T critique.
 *     Sans byline + date rendue, les guides flagship sont sous-pondérés
 *     vs concurrents qui les affichent.
 *   - Les utilisateurs qui voient un byline cliquent +30% (signal CTR).
 *
 * Méthodologie :
 *   1. Repérer les pages qui déclarent un schéma Article-like au niveau
 *      racine (présence de `@context` dans l'objet englobant le `@type`).
 *   2. Ignorer les schémas nested (`hasPart`, `mainEntity`, `itemReviewed`).
 *   3. Pour chaque page candidate, scanner le JSX body pour :
 *        A. Signal DATE : `<time`, `dateTime=`, `toLocaleDateString`,
 *           "Publié le", "Mis à jour", "Dernière mise à jour".
 *        B. Signal AUTEUR : "Par ", "Auteur", "rédigé par", "écrit par",
 *           `{article.author}`, `{author.name}`, ou composant avec
 *           `Author|Byline|ArticleHeader|PublishedAt|DateStamp` dans son nom.
 *   4. Flag les pages qui n'ont pas LES DEUX signaux.
 *   5. Prend en compte les composants importés (depth 1) : si une page
 *      importe `<AuthorByline />` ou `<ArticleHeader />`, les signaux
 *      visibles sont délégués au composant enfant.
 *
 * Usage :
 *   node scripts/audit-eeat-dom-signals.mjs           # human
 *   node scripts/audit-eeat-dom-signals.mjs --json    # JSON
 *   node scripts/audit-eeat-dom-signals.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.tsx$/.test(entry)) acc.push(full)
  }
  return acc
}

function findEnclosingBraceOpen(src, pos) {
  let depth = 0
  let i = pos
  while (i > 0) {
    i--
    const c = src[i]
    if (c === '}') depth++
    else if (c === '{') {
      if (depth === 0) return i
      depth--
    } else if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i--
      while (i > 0 && !(src[i] === quote && src[i - 1] !== '\\')) i--
    }
  }
  return -1
}

function findMatchingBraceClose(src, open) {
  let depth = 1
  let i = open + 1
  while (i < src.length) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    } else if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i++
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++
        i++
      }
    }
    i++
  }
  return -1
}

/**
 * Retourne true si la page émet au moins un schéma Article-like racine.
 * Un schéma est "racine" si son objet englobant contient `@context`.
 */
function hasRootArticleSchema(src) {
  const re = /['"`]@type['"`]\s*:\s*['"`](Article|BlogPosting|TechArticle|NewsArticle)['"`]/g
  for (const m of src.matchAll(re)) {
    const open = findEnclosingBraceOpen(src, m.index)
    if (open < 0) continue
    const close = findMatchingBraceClose(src, open)
    if (close < 0) continue
    const body = src.slice(open + 1, close)
    if (/['"`]@context['"`]/.test(body)) return true
  }
  return false
}

// Signaux DOM visibles à rechercher dans le JSX
const DATE_PATTERNS = [
  /<time\b/,
  /\bdateTime\s*=/,
  /\btoLocaleDateString\s*\(/,
  /Publié le\b/i,
  /Mis à jour\b/i,
  /Dernière mise à jour\b/i,
  /Date de publication\b/i,
  /Publication\s*:/i,
  /<ArticleMeta\b/,
]

const AUTHOR_PATTERNS = [
  /\bPar\s+\{/,
  /\bPar\s+[A-Z]/, // "Par Marvin" etc. (capitalized)
  /\bAuteur\b/i,
  /rédigé par\b/i,
  /écrit par\b/i,
  /\{article\.author\b/,
  /\{authorProfile\.name\b/,
  /\{author\.name\b/,
  /\{authorName\b/,
  /<AuthorByline\b/,
  /<AuthorBio\b/,
  /<ArticleHeader\b/,
  /<ArticleMeta\b/,
  /<PublishedAt\b/,
  /<Byline\b/,
  /<AuthorCard\b/,
]

function matchesAny(src, patterns) {
  for (const p of patterns) if (p.test(src)) return true
  return false
}

/**
 * Cherche les signaux dans le fichier + ses composants importés depth=1.
 */
function hasSignals(file, src) {
  const hasDateInline = matchesAny(src, DATE_PATTERNS)
  const hasAuthorInline = matchesAny(src, AUTHOR_PATTERNS)
  if (hasDateInline && hasAuthorInline) return { date: true, author: true }
  // Depth-1 imports
  let date = hasDateInline
  let author = hasAuthorInline
  const pageDir = dirname(file)
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  for (const m of src.matchAll(importRe)) {
    if (date && author) break
    const spec = m[1]
    if (/^@\/(hooks|lib|types|contexts|stores)(\/|$)/.test(spec)) continue
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
          const childSrc = readFileSync(c, 'utf8')
          if (!date && matchesAny(childSrc, DATE_PATTERNS)) date = true
          if (!author && matchesAny(childSrc, AUTHOR_PATTERNS)) author = true
        } catch {}
        break
      }
    }
  }
  return { date, author }
}

function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
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

const pages = walk('src/app').filter((f) => /page\.tsx$/.test(f))
const gaps = []
let articlePages = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (inferNoindex(readFileSync(f, 'utf8'), normalized)) continue
  const src = readFileSync(f, 'utf8')
  if (!hasRootArticleSchema(src)) continue
  articlePages++
  const { date, author } = hasSignals(f, src)
  if (!date || !author) {
    gaps.push({
      route: pathToRoute(normalized),
      file: normalized,
      missing: [!date && 'date', !author && 'author'].filter(Boolean),
    })
  }
}

const report = {
  article_pages_scanned: articlePages,
  pages_missing_dom_signals: gaps.length,
  coverage_pct:
    articlePages === 0
      ? 100
      : Number((((articlePages - gaps.length) / articlePages) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 E-E-A-T DOM Signals Audit (byline + date visibles)\n')
  console.log(`  Pages Article-like scannées    : ${report.article_pages_scanned}`)
  console.log(`  Pages sans byline+date visible : ${report.pages_missing_dom_signals}`)
  console.log(`  Coverage                       : ${report.coverage_pct}%\n`)
  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages Article exposent byline + date dans le DOM.\n')
  } else {
    console.log('  ❌ Pages sans signaux E-E-A-T visibles :')
    for (const g of gaps.slice(0, 30))
      console.log(`     manque ${g.missing.join('+').padEnd(14)}  ${g.route}`)
    if (gaps.length > 30) console.log(`     ... et ${gaps.length - 30} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
