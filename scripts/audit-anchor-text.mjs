#!/usr/bin/env node
/**
 * scripts/audit-anchor-text.mjs
 * -----------------------------
 * Détecte les anchor texts génériques sur les liens internes (`<Link>`/`<a>`).
 *
 * Pourquoi :
 *   - "Cliquez ici", "En savoir plus", "Voir", etc. ne donnent AUCUN signal
 *     sémantique à Google → le PageRank est transmis sans thème.
 *   - WCAG 2.4.4 — Link Purpose : un lien doit être compréhensible hors contexte.
 *   - Une mauvaise anchor text dilue la pertinence topique de la page cible.
 *
 * Règle : interdire les ancres génériques listées ci-dessous pour les liens
 * internes. Les boutons UI neutres (ex: "Valider", "Annuler") ne sont pas
 * des liens et ne sont pas concernés.
 *
 * Usage :
 *   node scripts/audit-anchor-text.mjs            # human
 *   node scripts/audit-anchor-text.mjs --json     # JSON
 *   node scripts/audit-anchor-text.mjs --strict   # exit 1 si ancres génériques
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

/**
 * Liste des ancres génériques bannies — insensibles à la casse et à la
 * ponctuation finale. On inclut les variantes FR + EN les plus courantes.
 * Les ancres avec icônes chevron (ex: `En savoir plus <ArrowRight />`) sont
 * également matchées car on normalise le texte après retrait des tags.
 */
const BANNED_ANCHORS = [
  'cliquez ici',
  'cliquer ici',
  'cliquez',
  'click here',
  'en savoir plus',
  'lire la suite',
  'read more',
  'ici',
  'plus',
  'voir',
  'voir plus',
  'voir ici',
  'consulter',
  'découvrir',
]

function normalizeAnchor(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|jsx)$/.test(entry)) acc.push(full)
  }
  return acc
}

/**
 * Extrait les ancres de tous les `<Link href="/path">TEXT</Link>` et
 * `<a href="/path">TEXT</a>` qui pointent vers une route interne (href
 * commence par `/`). On ignore les liens externes (http/https).
 */
function extractAnchors(src) {
  const found = []
  // Link internes avec text children
  // Match ouvrant jusqu'au > PUIS contenu jusqu'au </Tag>
  const re = /<(Link|a)\b([^>]*?)>([\s\S]*?)<\/\1>/g
  for (const m of src.matchAll(re)) {
    const attrs = m[2]
    const inner = m[3]
    // href doit commencer par / (ou être {} qu'on ignore)
    const hrefMatch = attrs.match(/href=['"](\/[^'"#?]*)['"]|href=\{\s*`(\/[^`]*)`/)
    if (!hrefMatch) continue
    const href = hrefMatch[1] || hrefMatch[2]

    // Retire les tags internes (ex: <ArrowRight />), garde le texte humain
    // Ignore les expressions `{variable}` — on peut pas les résoudre.
    let plainText = inner
      .replace(/<[^>]+>/g, ' ') // strip tags
      .replace(/\{[^}]*\}/g, ' ') // strip JSX expressions (on ne peut pas résoudre)
      .replace(/\s+/g, ' ')
      .trim()
    if (!plainText) continue
    const normalized = normalizeAnchor(plainText)
    if (!normalized) continue
    found.push({ href, text: plainText, normalized })
  }
  return found
}

const files = walk('src').filter(
  (f) => !/[\/\\]__tests__[\/\\]/.test(f) && !/[\/\\]scripts[\/\\]/.test(f)
)
const violations = []
let totalInternalLinks = 0

for (const f of files) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const anchors = extractAnchors(src)
  totalInternalLinks += anchors.length
  for (const a of anchors) {
    if (BANNED_ANCHORS.includes(a.normalized)) {
      violations.push({ file: normalized, href: a.href, anchor: a.text, normalized: a.normalized })
    }
  }
}

const report = {
  files_scanned: files.length,
  total_internal_anchors: totalInternalLinks,
  violations_count: violations.length,
  generic_anchor_rate_pct:
    totalInternalLinks === 0
      ? 0
      : Number(((violations.length / totalInternalLinks) * 100).toFixed(2)),
  banned_anchors: BANNED_ANCHORS,
  violations,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Anchor Text Quality Audit\n')
  console.log(`  Fichiers scannés           : ${report.files_scanned}`)
  console.log(`  Liens internes avec texte  : ${report.total_internal_anchors}`)
  console.log(`  Ancres génériques          : ${report.violations_count}`)
  console.log(`  Taux d'ancres génériques   : ${report.generic_anchor_rate_pct}%\n`)

  if (violations.length === 0) {
    console.log('  ✅ Aucune ancre générique détectée.\n')
  } else {
    console.log('  ⚠️  Ancres génériques à remplacer :')
    for (const v of violations.slice(0, 50)) {
      console.log(`     [${v.normalized}] → ${v.href}`)
      console.log(`        ${v.file}`)
    }
    if (violations.length > 50) console.log(`     ... et ${violations.length - 50} de plus`)
    console.log('')
  }
}

if (strict && violations.length > 0) process.exit(1)
