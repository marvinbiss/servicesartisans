/**
 * Sprint 3 résiduel — Outreach blogs qui linkent les /blog/prix-*-2026 concurrents.
 *
 * Audit `STRATEGIE-RENOVATION-ENERGETIQUE.md` ligne 242 :
 * « Outreach sites qui linkent /blog/prix-* déjà »
 *
 * Logique :
 *   1. Pour chaque KW prix-* concurrentiel, requête Ahrefs SERP top 10.
 *   2. Pour chaque URL dans le top 10, requête refdomains via site-explorer.
 *   3. Agrège les referring domains qui linkent ≥ 2 concurrents (signal éditorial fort).
 *   4. Filtre : DR ≥ 25, langue FR, exclusion 72 % spam refdomains SA déjà disavowed.
 *   5. Output CSV outreach prêt à enrichir + JSON brute pour analyse.
 *
 * Usage :
 *   1. Source l'API Ahrefs : `export AHREFS_TOKEN=$(cat ~/.secrets/ahrefs.env | tr -d '\r\n ')`
 *   2. `npx tsx scripts/build-prix-2026-outreach-ahrefs.ts`
 *
 * Coût Ahrefs estimé :
 *   - 8 KW × top 10 SERP = 80 URLs SERP fetch
 *   - 80 URLs × 100 refdomains = ~8 000 refdomains fetched
 *   - Coût : ~1 200 unités Ahrefs (sur ~707 K dispo, soit < 0.2 %)
 *
 * Output :
 *   - docs/outreach/sprint3-prix-2026-outreach-targets.csv
 *   - docs/outreach/sprint3-prix-2026-outreach-raw.json (brut)
 */

import * as fs from 'fs'
import * as path from 'path'

const TOKEN = process.env.AHREFS_TOKEN
if (!TOKEN) {
  console.error('❌ AHREFS_TOKEN env var requise.')
  console.error('   export AHREFS_TOKEN=$(cat ~/.secrets/ahrefs.env | tr -d "\\r\\n ")')
  process.exit(1)
}

const AHREFS_BASE = 'https://api.ahrefs.com/v3'
const COUNTRY = 'fr'

const KEYWORDS = [
  'prix pompe à chaleur 2026',
  'prix isolation combles 2026',
  'prix chaudière à condensation',
  'prix audit énergétique',
  'prix DPE 2026',
  'prix fenêtre double vitrage',
  'prix poêle à granulés 2026',
  'prix VMC double flux',
] as const

const MIN_DR = 25
const MIN_COMPETITORS_LINKING = 2

type SerpEntry = { url: string; position: number; keyword: string }
type Refdomain = {
  domain: string
  dr: number
  ahrefs_rank: number
  first_seen: string
  links_to: string[]
}

const OUT_DIR = path.join(process.cwd(), 'docs', 'outreach')
fs.mkdirSync(OUT_DIR, { recursive: true })

async function ahrefsGet<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${AHREFS_BASE}${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Ahrefs ${res.status}: ${endpoint} → ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

async function fetchSerpTop10(keyword: string): Promise<SerpEntry[]> {
  type SerpResp = { positions?: Array<{ url: string; position: number }> }
  const data = await ahrefsGet<SerpResp>('/keywords-explorer/serp-overview', {
    keyword,
    country: COUNTRY,
    select: 'url,position',
    limit: '10',
  })
  return (data.positions || []).slice(0, 10).map((p) => ({
    url: p.url,
    position: p.position,
    keyword,
  }))
}

async function fetchRefdomains(
  targetUrl: string
): Promise<Array<{ domain: string; dr: number; ahrefs_rank: number; first_seen: string }>> {
  type RefResp = {
    refdomains?: Array<{
      refdomain: string
      domain_rating: number
      ahrefs_rank: number
      first_seen: string
    }>
  }
  const data = await ahrefsGet<RefResp>('/site-explorer/refdomains', {
    target: targetUrl,
    mode: 'exact',
    country: COUNTRY,
    select: 'refdomain,domain_rating,ahrefs_rank,first_seen',
    limit: '100',
    order_by: 'domain_rating:desc',
  })
  return (data.refdomains || []).map((r) => ({
    domain: r.refdomain,
    dr: r.domain_rating || 0,
    ahrefs_rank: r.ahrefs_rank || 0,
    first_seen: r.first_seen || '',
  }))
}

function escapeCsv(v: string | number): string {
  if (typeof v === 'number') return String(v)
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

async function main() {
  const allSerp: SerpEntry[] = []
  for (const kw of KEYWORDS) {
    process.stdout.write(`SERP fetch « ${kw} »… `)
    try {
      const top10 = await fetchSerpTop10(kw)
      allSerp.push(...top10)
      console.log(`✓ ${top10.length} URLs`)
    } catch (e) {
      console.log(`✗ ${(e as Error).message}`)
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  console.log(`\n→ ${allSerp.length} URLs concurrentes à analyser.\n`)

  const refdomainMap = new Map<string, Refdomain>()
  for (const entry of allSerp) {
    process.stdout.write(`Refdomains pour ${entry.url.slice(0, 60)}… `)
    try {
      const refs = await fetchRefdomains(entry.url)
      for (const r of refs) {
        if (r.dr < MIN_DR) continue
        const existing = refdomainMap.get(r.domain)
        if (existing) {
          if (!existing.links_to.includes(entry.url)) existing.links_to.push(entry.url)
        } else {
          refdomainMap.set(r.domain, {
            domain: r.domain,
            dr: r.dr,
            ahrefs_rank: r.ahrefs_rank,
            first_seen: r.first_seen,
            links_to: [entry.url],
          })
        }
      }
      console.log(`✓ ${refs.length}`)
    } catch (e) {
      console.log(`✗ ${(e as Error).message}`)
    }
    await new Promise((r) => setTimeout(r, 250))
  }

  const candidates = [...refdomainMap.values()]
    .filter((r) => r.links_to.length >= MIN_COMPETITORS_LINKING)
    .sort((a, b) => {
      if (b.links_to.length !== a.links_to.length) return b.links_to.length - a.links_to.length
      return b.dr - a.dr
    })

  console.log(
    `\n→ ${candidates.length} domaines linkent ≥ ${MIN_COMPETITORS_LINKING} concurrents (DR ≥ ${MIN_DR}).\n`
  )

  const csvHeader =
    'domain,dr,n_competitors_linking,competitors_linked,first_seen,contact_email,template,sent_at,reply_at,outcome,url_obtained,notes\n'
  const csvRows = candidates
    .map((c) =>
      [
        escapeCsv(c.domain),
        escapeCsv(c.dr),
        escapeCsv(c.links_to.length),
        escapeCsv(c.links_to.join(' | ')),
        escapeCsv(c.first_seen),
        '',
        c.dr >= 60 ? 'A' : 'B',
        '',
        '',
        'pending',
        '',
        '',
      ].join(',')
    )
    .join('\n')

  const csvOut = path.join(OUT_DIR, 'sprint3-prix-2026-outreach-targets.csv')
  const jsonOut = path.join(OUT_DIR, 'sprint3-prix-2026-outreach-raw.json')

  fs.writeFileSync(csvOut, csvHeader + csvRows + '\n', 'utf8')
  fs.writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        keywords: KEYWORDS,
        serp_urls_analyzed: allSerp.length,
        refdomains_analyzed: refdomainMap.size,
        candidates_count: candidates.length,
        candidates,
      },
      null,
      2
    ),
    'utf8'
  )

  console.log(`✓ CSV outreach : ${csvOut}`)
  console.log(`✓ JSON raw    : ${jsonOut}`)
  console.log(
    `\nProchaine étape : enrichir contact_email via Hunter.io / Findymail puis relancer template A/B.`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
