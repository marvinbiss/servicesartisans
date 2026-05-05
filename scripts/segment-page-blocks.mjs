#!/usr/bin/env node
/**
 * Compteur de mots par bloc <section> sur une page prod.
 *
 * Usage:
 *   node scripts/segment-page-blocks.mjs <url> [--out=tmp.json]
 */
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const url = args.find((a) => !a.startsWith('--'))
if (!url) {
  console.error('Usage: node scripts/segment-page-blocks.mjs <url>')
  process.exit(1)
}
const outArg = args.find((a) => a.startsWith('--out='))?.split('=')[1] ?? null

async function fetchHtml(u) {
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)/.test(u)
  const headers = { 'User-Agent': 'SA-SSR-Audit/1.0' }
  if (isLocal) {
    headers['X-Forwarded-Proto'] = 'https'
    headers['X-Forwarded-Host'] = 'servicesartisans.fr'
  }
  const r = await fetch(u, { headers, redirect: 'follow' })
  return r.text()
}

function stripChrome(html) {
  let s = html
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
  s = s.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
  s = s.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
  s = s.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
  s = s.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')
  return s
}

function isolateMain(html) {
  // Greedy on <main>...</main> so nested close tags don't truncate.
  const m = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)
  if (m) return m[1]
  const b = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)
  return b ? b[1] : html
}

function htmlToText(html) {
  let s = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '…')
  return s
}

function countWords(text) {
  let n = 0
  for (const tok of text.split(/\s+/)) {
    if (tok.length >= 2 && /[a-zA-ZÀ-ſ0-9]/.test(tok)) n++
  }
  return n
}

function firstHeading(chunk) {
  const m = chunk.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i)
  if (!m) return null
  return htmlToText(m[1]).trim().replace(/\s+/g, ' ').slice(0, 80)
}

function dataAttr(chunk, attr) {
  const re = new RegExp(`data-${attr}\\s*=\\s*['"]([^'"]+)['"]`, 'i')
  const m = chunk.match(re)
  return m ? m[1] : null
}

/**
 * Segment by top-level <section> tags. Tracks nesting depth so we skip
 * inner sections (their words count toward the outer section).
 */
function segmentBySection(html) {
  const blocks = []
  const re = /<(\/?)(section)\b[^>]*>/gi
  let depth = 0
  let outerStart = -1
  let m
  while ((m = re.exec(html)) !== null) {
    const closing = m[1] === '/'
    if (!closing) {
      if (depth === 0) outerStart = m.index
      depth++
    } else {
      depth--
      if (depth === 0 && outerStart >= 0) {
        const end = m.index + m[0].length
        blocks.push(html.slice(outerStart, end))
        outerStart = -1
      }
    }
  }
  return blocks
}

function bytesOf(s) {
  return Buffer.byteLength(s, 'utf8')
}

;(async () => {
  console.log(`\nSegmentation par bloc — ${url}\n`)
  const raw = await fetchHtml(url)
  const totalBytes = bytesOf(raw)
  const cleaned = stripChrome(raw)
  // Next.js streaming SSR injects sections AFTER </main> via <template>
  // chunks ; on chunke donc le body entier (chrome déjà strippé).
  const body = cleaned.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? cleaned
  const totalWords = countWords(htmlToText(body))
  console.log(`HTML brut         : ${(totalBytes / 1024).toFixed(0)} KiB`)
  console.log(`Mots SSR (body, hors header/footer/nav) : ${totalWords}\n`)

  const sections = segmentBySection(body)
  console.log(`Top-level <section>: ${sections.length}\n`)

  const rows = sections.map((chunk, i) => {
    const text = htmlToText(chunk)
    const words = countWords(text)
    const heading = firstHeading(chunk) ?? `(section #${i + 1} sans heading)`
    const id = (chunk.match(/<section[^>]+\bid\s*=\s*['"]([^'"]+)['"]/i)?.[1]) ?? null
    const dataBlock =
      dataAttr(chunk, 'block') ||
      dataAttr(chunk, 'bloc') ||
      dataAttr(chunk, 'speakable')
    return { idx: i + 1, words, heading, id, dataBlock, bytes: bytesOf(chunk) }
  })

  rows.sort((a, b) => b.words - a.words)

  const sumSection = rows.reduce((s, r) => s + r.words, 0)
  const outsideSections = totalWords - sumSection
  console.log('Mots par <section> (trié par poids):\n')
  console.log('   #  WORDS  KiB  HEADING')
  console.log('   -  -----  ---  -------')
  for (const r of rows) {
    const tag = r.id ? ` [#${r.id}]` : r.dataBlock ? ` [data:${r.dataBlock}]` : ''
    console.log(
      `  ${String(r.idx).padStart(2)}  ${String(r.words).padStart(5)}  ${(r.bytes / 1024).toFixed(0).padStart(3)}  ${r.heading}${tag}`
    )
  }
  console.log(`\n  Σ sections = ${sumSection} mots`)
  console.log(`  Hors <section> (header/footer/nav inline) = ${outsideSections} mots\n`)

  const top5 = rows.slice(0, 5)
  console.log('Top 5 contributeurs :')
  for (const r of top5) {
    const pct = ((r.words / totalWords) * 100).toFixed(0)
    console.log(`  ${String(r.words).padStart(5)} mots (${pct}%) — ${r.heading}`)
  }

  if (outArg) {
    writeFileSync(outArg, JSON.stringify({ url, totalWords, totalBytes, rows }, null, 2))
    console.log(`\nDump → ${outArg}`)
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
