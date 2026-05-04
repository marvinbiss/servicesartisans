#!/usr/bin/env npx tsx
/**
 * Sprint AI Wave J — Disavow Round 3 (2026-05-03).
 *
 * Successeur de scripts/generate-disavow-2026-04.ts. Différences clés :
 *   - CLI flags --input / --output / --previous (incrémental possible)
 *   - Allowlist explicite des partenaires propres détectés en Round 2
 *     (keskeces.fr DR 24 etc.) — protection contre re-disavow accidentel
 *   - Heuristiques durcies post-Round 2 :
 *       · TLD à risque élargi (.click, .work, .ws, .biz) si DR<10
 *       · Ratio anchor-length/dr > 8 = pattern PBN haut de gamme
 *       · Templates `add-listing.php`, `?ref=`, `/profile/`, `/users/` =
 *         auto-profile spam (pas un vrai backlink éditorial)
 *   - Diff lisible vs round précédent (added / removed)
 *
 * Usage :
 *   npx tsx scripts/generate-disavow-2026-05.ts \
 *       --input docs/ahrefs-audit-2026-05/normalized/ahrefs-backlinks.csv \
 *       --output docs/seo/disavow-2026-05-03.txt \
 *       --previous docs/seo/disavow-2026-04-29.txt
 *
 * Prérequis : exporter Ahrefs UI > Backlinks > Export CSV (avec colonnes
 *   "Referring page URL", "Domain rating", "Is spam", "Nofollow", "Anchor",
 *   "Referring domains", "Domain traffic", "Target URL"), puis poser le
 *   fichier dans docs/ahrefs-audit-2026-05/normalized/ahrefs-backlinks.csv.
 */

import * as fs from 'fs'
import * as path from 'path'

// -----------------------------------------------------------------------------
// CLI args
// -----------------------------------------------------------------------------

interface CliArgs {
  input: string
  output: string
  previous: string | null
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const get = (flag: string): string | null => {
    const i = args.indexOf(flag)
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null
  }
  const ROOT = path.join(__dirname, '..')
  return {
    input:
      get('--input') ??
      path.join(ROOT, 'docs', 'ahrefs-audit-2026-05', 'normalized', 'ahrefs-backlinks.csv'),
    output: get('--output') ?? path.join(ROOT, 'docs', 'seo', 'disavow-2026-05-03.txt'),
    previous: get('--previous') ?? path.join(ROOT, 'docs', 'seo', 'disavow-2026-04-29.txt'),
  }
}

// -----------------------------------------------------------------------------
// Allowlist : partenaires propres confirmés Round 2 — JAMAIS désavouer.
// -----------------------------------------------------------------------------

const ALLOWLIST: ReadonlySet<string> = new Set([
  'keskeces.fr', // DR 24 traf 10K — meilleur asset confirmé Round 2
  'data.gouv.fr', // futur backlink Wave G dataset CEE régional
  'france-renov.gouv.fr',
  'ademe.fr',
  'service-public.fr',
  'maprimerenov.gouv.fr',
  'anah.gouv.fr',
  'sonergia.fr', // partenaire mandataire CEE futur
])

// -----------------------------------------------------------------------------
// CSV parser (RFC 4180-light, suffisant pour Ahrefs export)
// -----------------------------------------------------------------------------

function parseLine(line: string): string[] {
  const parts: string[] = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) {
      parts.push(cur)
      cur = ''
    } else cur += ch
  }
  parts.push(cur)
  return parts.map((p) => p.replace(/^"|"$/g, '').trim())
}

function rootDomain(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `http://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

// -----------------------------------------------------------------------------
// Heuristiques Round 3 (durcies vs Round 2)
// -----------------------------------------------------------------------------

const SUSPECT_TLDS_DR10 =
  /\.(shop|xyz|top|party|sale|online|site|fyi|cv|info|click|work|ws|biz|icu|website)(\/|$)/i
const SEO_SPAM_KEYWORDS =
  /seo|backlink|aged.domain|pbn|rank.+boost|seo.?agency|seo.?express|buyseolink|optimize.?traffic|growth.?link/i
const AUTO_PROFILE_PATHS =
  /(\/(profile|users|members|author)\/[^/]+|\?ref=|add[-_]listing\.php|\/forum\/[a-z0-9-]+)/i

interface DomainBucket {
  reasons: Set<string>
  drs: number[]
  count: number
  anchors: Set<string>
  refs: Set<string>
}

function classifyEntry(opts: {
  refUrl: string
  isSpam: boolean
  dr: number
  anchor: string
  refDoms: number
  domTraffic: number
  target: string
}): string[] {
  const { refUrl, isSpam, dr, anchor, refDoms, domTraffic, target } = opts
  const reasons: string[] = []

  if (isSpam) reasons.push('flagged_spam')

  if (dr < 5 && anchor.length > 80) reasons.push('low_dr_long_anchor')

  // Round 3 nouveau : ratio anchor/dr suspect (PBN haut de gamme avec ancre suroptimisée)
  if (dr >= 5 && dr < 25 && anchor.length > 60 && anchor.length / Math.max(dr, 1) > 8) {
    reasons.push('high_anchor_to_dr_ratio')
  }

  // PBN orphelins (zero traffic + nombreux refs sortants + cible homepage uniquement)
  if (domTraffic === 0 && refDoms > 100 && (!target || target === 'https://servicesartisans.fr/')) {
    reasons.push('zero_traffic_pbn_pattern')
  }

  if (SEO_SPAM_KEYWORDS.test(refUrl)) reasons.push('seo_spam_pattern')

  // Round 3 durcissement : TLD à risque + DR < 10 (Round 2 = DR < seuil + refDoms > 50,
  // mais on a vu des PBN propres avec très peu de refDoms)
  if (SUSPECT_TLDS_DR10.test(refUrl) && dr < 10) {
    reasons.push('dubious_tld_low_dr')
  }

  // Round 3 nouveau : auto-profile spam pages (pas de signal éditorial)
  if (AUTO_PROFILE_PATHS.test(refUrl) && dr < 30) {
    reasons.push('auto_profile_spam')
  }

  return reasons
}

// -----------------------------------------------------------------------------
// Diff vs round précédent
// -----------------------------------------------------------------------------

function readPrevious(file: string): Set<string> {
  if (!fs.existsSync(file)) return new Set()
  const raw = fs.readFileSync(file, 'utf-8').replace(/^﻿/, '')
  const out = new Set<string>()
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^domain:(.+)$/)
    if (m) out.add(m[1].trim().toLowerCase())
  }
  return out
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function main(): void {
  const argv = parseArgs()

  if (!fs.existsSync(argv.input)) {
    console.error(`❌ Missing Ahrefs export: ${argv.input}`)
    console.error()
    console.error('Steps :')
    console.error('  1. https://app.ahrefs.com/site-explorer/backlinks/?target=servicesartisans.fr')
    console.error('  2. Export CSV (utilise quota léger ~500 unités)')
    console.error(`  3. Place dans : ${argv.input}`)
    console.error('  4. Re-run ce script')
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(argv.output), { recursive: true })

  const raw = fs.readFileSync(argv.input, 'utf-8').replace(/^﻿/, '')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseLine(lines[0])
  const idx = (name: string) => header.findIndex((h) => h.trim() === name)

  const iRef = idx('Referring page URL')
  const iDr = idx('Domain rating')
  const iSpam = idx('Is spam')
  const iNof = idx('Nofollow')
  const iAnchor = idx('Anchor')
  const iRefDoms = idx('Referring domains')
  const iDomTraffic = idx('Domain traffic')
  const iTarget = idx('Target URL')

  if (iRef < 0) {
    console.error('❌ "Referring page URL" column missing in CSV')
    process.exit(1)
  }

  const buckets = new Map<string, DomainBucket>()
  const preserved: string[] = []
  let allowlistHits = 0

  for (let i = 1; i < lines.length; i++) {
    const parts = parseLine(lines[i])
    const refUrl = parts[iRef] || ''
    const isSpam = (parts[iSpam] || '').toLowerCase() === 'true'
    const dr = parseFloat(parts[iDr] || '0') || 0
    const nof = (parts[iNof] || '').toLowerCase() === 'true'
    const anchor = parts[iAnchor] || ''
    const refDoms = parseInt(parts[iRefDoms] || '0') || 0
    const domTraffic = parseInt(parts[iDomTraffic] || '0') || 0
    const target = parts[iTarget] || ''
    const domain = rootDomain(refUrl)
    if (!domain) continue

    if (ALLOWLIST.has(domain)) {
      allowlistHits++
      preserved.push(`[ALLOWLIST] ${domain}  DR=${dr}  "${anchor.slice(0, 60)}"`)
      continue
    }

    const reasons = classifyEntry({ refUrl, isSpam, dr, anchor, refDoms, domTraffic, target })
    if (reasons.length > 0) {
      const e = buckets.get(domain) ?? {
        reasons: new Set<string>(),
        drs: [],
        count: 0,
        anchors: new Set<string>(),
        refs: new Set<string>(),
      }
      reasons.forEach((r) => e.reasons.add(r))
      e.drs.push(dr)
      e.count++
      if (anchor) e.anchors.add(anchor.slice(0, 60))
      e.refs.add(refUrl)
      buckets.set(domain, e)
    } else {
      preserved.push(
        `[KEEP] ${domain.padEnd(35)} DR=${String(dr).padStart(3)} ${nof ? 'nofol' : 'dofol'}  "${anchor.slice(0, 50)}"`
      )
    }
  }

  // -- Diff vs Round précédent --
  const previous = readPrevious(argv.previous ?? '')
  const current = new Set(Array.from(buckets.keys()).map((d) => d.toLowerCase()))
  const added = [...current].filter((d) => !previous.has(d)).sort()
  const removed = [...previous].filter((d) => !current.has(d)).sort()

  // -- Emit disavow.txt --
  const out: string[] = []
  out.push('# Disavow file — servicesartisans.fr — Round 3')
  out.push(`# Generated  : ${new Date().toISOString().slice(0, 10)}`)
  out.push(`# Source     : ${path.relative(path.join(__dirname, '..'), argv.input)}`)
  out.push(`# Previous   : ${argv.previous ? path.basename(argv.previous) : '(none)'}`)
  out.push(`# Total      : ${buckets.size} domains`)
  out.push(`# Added      : ${added.length} (vs Round 2)`)
  out.push(`# Removed    : ${removed.length} (vs Round 2 — récupérés ou disparu de l'export)`)
  out.push(`# Allowlist  : ${ALLOWLIST.size} domaines protégés (${allowlistHits} hits ignorés)`)
  out.push('# Method     :')
  out.push('#   - Ahrefs spam flag')
  out.push('#   - Low DR (<5) + long anchor (>80)')
  out.push('#   - High anchor/DR ratio (>8) — PBN haut de gamme suroptimisé')
  out.push('#   - Zero traffic + 100+ refDoms — PBN orphelin')
  out.push('#   - SEO spam keywords (rank/seo/backlink/pbn/aged-domain/optimize-traffic)')
  out.push('#   - TLD à risque + DR < 10 (.shop .xyz .top .party .work .ws .biz .icu .website)')
  out.push('#   - Auto-profile spam (/profile/, ?ref=, add-listing.php, /forum/)')
  out.push("# Format     : `domain:` syntaxe Google = neutralise l'intégralité du domaine")
  out.push('# Upload     : Google Search Console > Outils anciens > Désaveu de liens')
  out.push('#              https://search.google.com/search-console/disavow-links')
  out.push('# Property   : sc-domain:servicesartisans.fr')
  out.push('')
  out.push('# === DOMAINES À DÉSAVOUER (tri alpha) ===')
  out.push('')

  const sorted = Array.from(buckets.keys()).sort()
  for (const domain of sorted) {
    out.push(`domain:${domain}`)
  }

  fs.writeFileSync(argv.output, out.join('\n'), 'utf-8')

  // -- Console summary --
  console.log(`✅ Disavow Round 3 : ${argv.output}`)
  console.log(`   Domains       : ${buckets.size}`)
  console.log(`   Added vs R2   : ${added.length}`)
  console.log(`   Removed vs R2 : ${removed.length}`)
  console.log(`   Allowlist hits: ${allowlistHits}`)
  console.log(`   Preserved     : ${preserved.length}`)
  console.log()
  if (added.length > 0) {
    console.log('--- ADDED (nouveaux disavow Round 3) ---')
    added.forEach((d) => console.log('  +', d))
  }
  if (removed.length > 0) {
    console.log('--- REMOVED (récupérés depuis Round 2) ---')
    removed.forEach((d) => console.log('  -', d))
  }
  console.log()
  console.log('--- TOP 30 PRESERVED (à valider manuellement) ---')
  preserved.slice(0, 30).forEach((p) => console.log('  ' + p))
  console.log()
  console.log('Next steps :')
  console.log('  1. Review', argv.output)
  console.log('  2. Upload to GSC → Disavow Links tool')
  console.log('     https://search.google.com/search-console/disavow-links')
  console.log('  3. Update MEMORY.md projet — entry "Disavow Round 3 2026-05-03 soumis"')
}

main()
