#!/usr/bin/env node
/**
 * scripts/audit-robots-directives.mjs
 * -----------------------------------
 * Vérifie que `src/app/robots.ts` contient les directives critiques Google
 * Search Central 2026 :
 *   - Paths privés disallow (admin, api, auth, espace-client, espace-artisan, booking)
 *   - Bots qui n'honorent PAS `*` sont déclarés explicitement : AdsBot-Google,
 *     AdsBot-Google-Mobile, APIs-Google, Mediapartners-Google
 *   - Sitemap URL présent
 *   - AUCUN `disallow: '/'` global (ou disallow wildcard sur /services, /guides, /artisan, /rge, /cee)
 *
 * Pourquoi :
 *   - Google spec : "The `*` wildcard does NOT cover AdsBot" — si on oublie
 *     AdsBot-Google dans robots, les landing pages Ads perdent leur
 *     déroulement de crawl → quality score Ads impacté.
 *   - Un disallow accidentel sur `/guides/` ou `/services/` écroule tout le
 *     SEO : Google arrête de crawler la zone principale.
 *   - Sitemap manquant = Google doit tout découvrir via liens, inefficace
 *     à 459K URLs.
 *
 * Usage :
 *   node scripts/audit-robots-directives.mjs            # human
 *   node scripts/audit-robots-directives.mjs --json     # JSON
 *   node scripts/audit-robots-directives.mjs --strict   # exit 1 si gap
 */

import { readFileSync, existsSync } from 'node:fs'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROBOTS = 'src/app/robots.ts'

if (!existsSync(ROBOTS)) {
  console.error('src/app/robots.ts introuvable.')
  process.exit(1)
}

const src = readFileSync(ROBOTS, 'utf8')

// ── 1. Paths privés DOIVENT être dans les disallow ───────────────────────
const CRITICAL_PRIVATE_PATHS = [
  '/admin/',
  '/api/',
  '/auth/',
  '/espace-client/',
  '/espace-artisan/',
  '/booking/',
]
const missingPrivate = CRITICAL_PRIVATE_PATHS.filter((p) => !src.includes(`'${p}'`))

// ── 2. Bots qui n'honorent PAS `*` ───────────────────────────────────────
const MANDATORY_BOTS = [
  'Googlebot',
  'Bingbot',
  'AdsBot-Google',
  'AdsBot-Google-Mobile',
  'APIs-Google',
  'Mediapartners-Google',
]
const missingBots = MANDATORY_BOTS.filter((b) => {
  // Match either as exact string in array literal or as userAgent: 'bot'
  const re = new RegExp(`['"\`]${b}['"\`]`)
  return !re.test(src)
})

// ── 3. Sitemap URL présent ───────────────────────────────────────────────
const hasSitemap = /sitemap\s*:\s*\[[\s\S]*?sitemap/.test(src) || /sitemap\s*:\s*[`'"]\s*[^`'"]*sitemap/.test(src)

// ── 4. Aucun disallow wildcard sur les zones SEO critiques ───────────────
const DANGEROUS_WILDCARDS = [
  /disallow\s*:\s*\[?[^\]]*['"`]\/services\/?\*?['"`]/,
  /disallow\s*:\s*\[?[^\]]*['"`]\/guides\/?\*?['"`]/,
  /disallow\s*:\s*\[?[^\]]*['"`]\/artisan\/?\*?['"`]/,
  /disallow\s*:\s*\[?[^\]]*['"`]\/rge\/?\*?['"`]/,
  /disallow\s*:\s*\[?[^\]]*['"`]\/cee\/?\*?['"`]/,
  /disallow\s*:\s*\[?[^\]]*['"`]\/blog\/?\*?['"`]/,
]
const dangerousDisallow = DANGEROUS_WILDCARDS.filter((r) => r.test(src))

// ── 5. Global `disallow: '/'` uniquement pour les bots blacklistés ───────
// (vérif structurelle : on cherche des disallow:['/'] ou disallow:'/' PAS
// entourés d'un userAgent blacklist type GPTBot/SemrushBot)
const globalBlockRe = /disallow\s*:\s*\[?\s*['"`]\/['"`]\s*\]?/g
let hasSuspiciousGlobalBlock = false
for (const m of src.matchAll(globalBlockRe)) {
  // Extract context ±300 chars
  const ctx = src.slice(Math.max(0, m.index - 300), m.index + 50)
  // If the block has a legitimate blacklist bot context, OK
  const blacklistBots =
    /GPTBot|CCBot|anthropic-ai|Timpibot|Diffbot|Omgilibot|Kangaroo Bot|ImagesiftBot|img2dataset|Bytespider|SemrushBot|MJ12bot|DotBot|BLEXBot|PetalBot|DataForSeoBot|Google-Extended/
  if (!blacklistBots.test(ctx)) {
    hasSuspiciousGlobalBlock = true
    break
  }
}

const gaps = []
if (missingPrivate.length > 0)
  gaps.push(`Paths privés manquants : ${missingPrivate.join(', ')}`)
if (missingBots.length > 0) gaps.push(`Bots spéciaux manquants : ${missingBots.join(', ')}`)
if (!hasSitemap) gaps.push('Sitemap URL manquant')
if (dangerousDisallow.length > 0)
  gaps.push(`Disallow dangereux sur zones indexables (${dangerousDisallow.length} match)`)
if (hasSuspiciousGlobalBlock)
  gaps.push('disallow: "/" global sans userAgent blacklist associé')

const report = {
  file: ROBOTS,
  critical_private_paths_required: CRITICAL_PRIVATE_PATHS.length,
  critical_private_paths_missing: missingPrivate,
  mandatory_bots_required: MANDATORY_BOTS.length,
  mandatory_bots_missing: missingBots,
  sitemap_declared: hasSitemap,
  dangerous_wildcards: dangerousDisallow.length,
  suspicious_global_block: hasSuspiciousGlobalBlock,
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 robots.txt Directives Audit\n')
  console.log(`  Paths privés requis          : ${CRITICAL_PRIVATE_PATHS.length}`)
  console.log(`    → manquants                : ${missingPrivate.length}`)
  console.log(`  Bots spéciaux requis         : ${MANDATORY_BOTS.length}`)
  console.log(`    → manquants                : ${missingBots.length}`)
  console.log(`  Sitemap URL                  : ${hasSitemap ? '✓' : '✗'}`)
  console.log(`  Disallow dangereux (SEO)     : ${dangerousDisallow.length}`)
  console.log(`  Block global suspect         : ${hasSuspiciousGlobalBlock ? 'oui' : 'non'}\n`)
  if (gaps.length === 0) {
    console.log('  ✅ robots.ts conforme Google Search Central 2026.\n')
  } else {
    console.log('  ❌ Gaps :')
    for (const g of gaps) console.log(`     - ${g}`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
