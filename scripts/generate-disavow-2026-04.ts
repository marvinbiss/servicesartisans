#!/usr/bin/env npx tsx
/**
 * generate-disavow-2026-04.ts — Parse ahrefs-backlinks.csv and emit a disavow.txt
 * file in Google Search Console format.
 *
 * Input  : docs/ahrefs-audit-2026-04/normalized/ahrefs-backlinks.csv
 * Output : docs/seo/disavow-2026-04-20.txt
 *
 * Rules:
 *  - Entries flagged "Is spam" = true → disavow by domain
 *  - Entries with DR < 5 AND anchor length > 80 (link-farm pattern) → disavow
 *  - Entries with 0 domain_traffic + nofollow + keyword anchor = link-farm → disavow
 *  - Clean entries (non-spam, topical anchor) preserved via exclusion
 *
 * Manual review step recommended before upload.
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized', 'ahrefs-backlinks.csv')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'seo')
const OUTPUT = path.join(OUTPUT_DIR, 'disavow-2026-04-20.txt')

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
    const host = u.hostname.replace(/^www\./, '')
    return host
  } catch {
    return null
  }
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`❌ Missing input: ${INPUT}`)
    process.exit(1)
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const raw = fs.readFileSync(INPUT, 'utf-8').replace(/^\uFEFF/, '')
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
    console.error(`❌ "Referring page URL" column missing`)
    process.exit(1)
  }

  const domains = new Map<
    string,
    { reasons: Set<string>; drs: number[]; count: number; anchors: Set<string> }
  >()
  const preserved: string[] = []

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

    const reasons: string[] = []
    if (isSpam) reasons.push('flagged_spam')
    if (dr < 5 && anchor.length > 80) reasons.push('low_dr_long_anchor')
    if (
      domTraffic === 0 &&
      refDoms > 100 &&
      (!target || target === 'https://servicesartisans.fr/')
    ) {
      reasons.push('zero_traffic_pbn_pattern')
    }
    if (
      /seo|backlink|aged.domain|pbn|rank.+boost|seo.?agency|seo.?express|buyseolink/i.test(refUrl)
    ) {
      reasons.push('seo_spam_pattern')
    }
    if (/\.(shop|xyz|top|party|sale|online|site|fyi|cv|info)(\/|$)/i.test(refUrl) && refDoms > 50) {
      reasons.push('dubious_tld_farm')
    }

    if (reasons.length > 0) {
      const entry = domains.get(domain) || {
        reasons: new Set<string>(),
        drs: [],
        count: 0,
        anchors: new Set<string>(),
      }
      reasons.forEach((r) => entry.reasons.add(r))
      entry.drs.push(dr)
      entry.count++
      if (anchor) entry.anchors.add(anchor.slice(0, 60))
      domains.set(domain, entry)
    } else {
      const anchorPreview = anchor.slice(0, 50)
      preserved.push(
        `[PRESERVE] ${domain.padEnd(35)} DR=${String(dr).padStart(3)} ${nof ? 'nofol' : 'dofol'}  "${anchorPreview}"`
      )
    }
  }

  // Emit disavow.txt
  const lines_out: string[] = []
  lines_out.push('# Disavow generated 2026-04-20 — ServicesArtisans')
  lines_out.push('# Source: docs/ahrefs-audit-2026-04/normalized/ahrefs-backlinks.csv')
  lines_out.push('# Rules: Ahrefs spam flag, low DR + long anchor, zero traffic PBN pattern,')
  lines_out.push('#        SEO spam keywords, dubious TLD link farms')
  lines_out.push('# Review before uploading to Google Search Console Disavow Tool.')
  lines_out.push('')

  const sorted = Array.from(domains.entries()).sort((a, b) => b[1].count - a[1].count)
  for (const [domain, e] of sorted) {
    const avgDr = e.drs.reduce((a, b) => a + b, 0) / e.drs.length
    const reasons = Array.from(e.reasons).join(',')
    lines_out.push(`# links=${e.count} avgDR=${avgDr.toFixed(1)} reasons=${reasons}`)
    lines_out.push(`domain:${domain}`)
  }

  fs.writeFileSync(OUTPUT, lines_out.join('\n'), 'utf-8')

  console.log(`✅ Disavow file written: ${OUTPUT}`)
  console.log(`   Domains disavowed: ${domains.size}`)
  console.log(`   Links disavowed:   ${sorted.reduce((a, [, e]) => a + e.count, 0)}`)
  console.log(`   Links preserved:   ${preserved.length}`)
  console.log()
  console.log('Preserved clean backlinks (review these, should NOT be in disavow):')
  for (const p of preserved) console.log('  ' + p)
  console.log()
  console.log('Next step:')
  console.log('  1. Review', OUTPUT)
  console.log(
    '  2. Upload to GSC → Disavow Links tool → https://search.google.com/search-console/disavow-links'
  )
}

main()
