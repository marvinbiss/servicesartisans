/**
 * Cross-reference GSC top 1000 queries with the internal-linking audit.
 *
 * Goal: test the hypothesis "internal linking is the bottleneck" against data.
 * Output segments queries into actionable buckets, then argue either FOR or
 * AGAINST the 4-week refactor plan.
 */

import * as path from 'path'
import * as fs from 'fs'

const ROOT = path.join(__dirname, '..')
const CSV = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized', 'Requêtes_v2.csv')

type Row = {
  query: string
  clicks: number
  impressions: number
  ctr: number // as fraction (0.44 not 44%)
  position: number
}

function parseCsv(p: string): Row[] {
  const raw = fs.readFileSync(p, 'utf-8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted commas
    const parts: string[] = []
    let cur = ''
    let inQ = false
    for (const ch of lines[i]) {
      if (ch === '"') inQ = !inQ
      else if (ch === ',' && !inQ) {
        parts.push(cur)
        cur = ''
      } else cur += ch
    }
    parts.push(cur)
    if (parts.length < 5) continue
    const [query, clicks, impressions, ctrStr, position] = parts
    rows.push({
      query: query.trim(),
      clicks: Number(clicks) || 0,
      impressions: Number(impressions) || 0,
      ctr: parseFloat(ctrStr.replace('%', '').replace(',', '.')) / 100 || 0,
      position: parseFloat(position.replace(',', '.')) || 0,
    })
  }
  return rows
}

function pct(n: number, d: number): string {
  return d === 0 ? 'n/a' : ((n / d) * 100).toFixed(1) + '%'
}

function main() {
  const rows = parseCsv(CSV)
  console.log(`=== GSC analysis: ${rows.length} queries ===\n`)

  // -- Aggregates
  const totalClicks = rows.reduce((a, r) => a + r.clicks, 0)
  const totalImpr = rows.reduce((a, r) => a + r.impressions, 0)
  const avgCtr = totalImpr > 0 ? totalClicks / totalImpr : 0
  const avgPos = rows.reduce((a, r) => a + r.position * r.impressions, 0) / Math.max(totalImpr, 1)

  console.log(`Total clicks (1000 queries): ${totalClicks}`)
  console.log(`Total impressions: ${totalImpr}`)
  console.log(`CTR weighted: ${(avgCtr * 100).toFixed(2)}%`)
  console.log(`Position weighted by impressions: ${avgPos.toFixed(2)}`)

  // -- Segment 1: top converters (high clicks)
  const topByClicks = [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 20)
  console.log(`\n--- Top 20 by CLICKS ---`)
  for (const r of topByClicks) {
    console.log(
      `  clicks=${r.clicks.toString().padStart(4)} impr=${r.impressions.toString().padStart(6)} ctr=${(r.ctr * 100).toFixed(1).padStart(5)}% pos=${r.position.toFixed(1).padStart(5)}  "${r.query}"`
    )
  }

  // -- Segment 2: low-hanging fruit (rank 4-10, high impressions, low clicks)
  const lowHanging = rows
    .filter((r) => r.position >= 4 && r.position <= 10 && r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30)
  console.log(`\n--- LOW-HANGING FRUIT (rank 4-10, impr >= 50) — push to top 3 ---`)
  console.log(`Count: ${lowHanging.length}`)
  for (const r of lowHanging) {
    console.log(
      `  impr=${r.impressions.toString().padStart(5)} pos=${r.position.toFixed(1).padStart(5)} ctr=${(r.ctr * 100).toFixed(1).padStart(4)}%  "${r.query}"`
    )
  }

  // -- Segment 3: second-page opportunities (rank 11-30, high impressions)
  const secondPage = rows
    .filter((r) => r.position >= 11 && r.position <= 30 && r.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30)
  console.log(`\n--- SECOND-PAGE OPPORTUNITIES (rank 11-30, impr >= 100) — big lift potential ---`)
  console.log(`Count: ${secondPage.length}`)
  for (const r of secondPage) {
    console.log(
      `  impr=${r.impressions.toString().padStart(5)} pos=${r.position.toFixed(1).padStart(5)}  "${r.query}"`
    )
  }

  // -- Segment 4: rank 1-3 but terrible CTR (title/meta issue)
  const badCtr = rows
    .filter((r) => r.position <= 3 && r.impressions >= 20 && r.ctr < 0.05)
    .sort((a, b) => b.impressions - a.impressions)
  console.log(`\n--- RANKING BUT NOT CLICKED (pos 1-3, impr >= 20, CTR < 5%) — title/meta fix ---`)
  console.log(`Count: ${badCtr.length}`)
  for (const r of badCtr.slice(0, 20)) {
    console.log(
      `  impr=${r.impressions.toString().padStart(5)} pos=${r.position.toFixed(1).padStart(5)} ctr=${(r.ctr * 100).toFixed(2).padStart(5)}%  "${r.query}"`
    )
  }

  // -- Segment 5: distribution by position bucket
  console.log(`\n--- DISTRIBUTION BY POSITION BUCKET ---`)
  const buckets = { '1-3': 0, '4-10': 0, '11-20': 0, '21-50': 0, '51+': 0 }
  const clicksByBucket = { '1-3': 0, '4-10': 0, '11-20': 0, '21-50': 0, '51+': 0 }
  const imprByBucket = { '1-3': 0, '4-10': 0, '11-20': 0, '21-50': 0, '51+': 0 }
  for (const r of rows) {
    const b =
      r.position <= 3
        ? '1-3'
        : r.position <= 10
          ? '4-10'
          : r.position <= 20
            ? '11-20'
            : r.position <= 50
              ? '21-50'
              : '51+'
    buckets[b]++
    clicksByBucket[b] += r.clicks
    imprByBucket[b] += r.impressions
  }
  console.log('  Bucket        queries  impressions  clicks    share-clicks')
  for (const b of ['1-3', '4-10', '11-20', '21-50', '51+'] as const) {
    console.log(
      `  ${b.padEnd(12)} ${buckets[b].toString().padStart(6)}  ${imprByBucket[b].toString().padStart(10)}  ${clicksByBucket[b].toString().padStart(5)}  ${pct(clicksByBucket[b], totalClicks)}`
    )
  }

  // -- Segment 6: verdict on hypothesis
  console.log(`\n--- DIAGNOSIS ---`)
  const rankingFine = buckets['1-3'] + buckets['4-10']
  const rankingBad = buckets['11-20'] + buckets['21-50'] + buckets['51+']
  const imprOnGoodRank = imprByBucket['1-3'] + imprByBucket['4-10']
  const imprOnBadRank = imprByBucket['11-20'] + imprByBucket['21-50'] + imprByBucket['51+']

  console.log(
    `  Queries ranking top 10: ${rankingFine} / 1000 (${((rankingFine / 1000) * 100).toFixed(1)}%)`
  )
  console.log(
    `  Impressions on top 10:  ${imprOnGoodRank} / ${totalImpr} (${pct(imprOnGoodRank, totalImpr)})`
  )
  console.log(`  Impressions on rank 11+: ${imprOnBadRank} (${pct(imprOnBadRank, totalImpr)})`)

  // -- Hypothesis test
  console.log(`\n--- HYPOTHESIS TEST: is internal linking the bottleneck? ---`)
  if (rankingFine > 600) {
    console.log(
      `  Most queries (${rankingFine}/1000) already rank top 10. Bottleneck is NOT discovery/PageRank.`
    )
    console.log(
      `  Real levers: (1) push rank 4-10 to top 3 via content depth, (2) fix CTR on bad-CTR top 3 pages.`
    )
  } else if (imprOnBadRank > imprOnGoodRank * 2) {
    console.log(
      `  ${pct(imprOnBadRank, totalImpr)} of impressions are on rank 11+. Google SEES the pages but doesn't rank them.`
    )
    console.log(
      `  This CAN be a linking/authority issue, BUT first check: content quality, topical match, concurrence.`
    )
  } else {
    console.log(
      `  Ranking distribution is mixed. Need page-level diagnosis (is the 4-10 rank because of linking or content?).`
    )
  }

  // -- Linking-specific test: are 2nd-page queries pointing to orphan/low-density pages?
  console.log(`\n--- LINKING-SPECIFIC INDICATOR ---`)
  // GSC queries don't directly give us URLs — we'd need GSC Pages report for that.
  // Indirect: if queries about "rénovation énergétique" rank badly AND we know /renovation-energetique is orphan → linking is plausibly the issue.
  const renovEnerg = rows.filter((r) =>
    /rénovation énerg|renovation energ|maprimer|cee|prime cee|isolation|pompe à chaleur|pac/i.test(
      r.query
    )
  )
  const totalRenovImpr = renovEnerg.reduce((a, r) => a + r.impressions, 0)
  const totalRenovClicks = renovEnerg.reduce((a, r) => a + r.clicks, 0)
  const avgPosRenov = totalRenovImpr
    ? renovEnerg.reduce((a, r) => a + r.position * r.impressions, 0) / totalRenovImpr
    : 0
  console.log(
    `  Pillar #2 queries (rénovation énerg / aides / CEE / PAC / isolation): ${renovEnerg.length} queries`
  )
  console.log(
    `  Impressions: ${totalRenovImpr}  |  Clicks: ${totalRenovClicks}  |  avg pos: ${avgPosRenov.toFixed(1)}`
  )
  if (avgPosRenov > 20) {
    console.log(
      `  ⚠️  Pillar #2 rank >20 on average. /renovation-energetique IS orphan in the audit → plausible linking root cause.`
    )
  } else if (avgPosRenov > 10) {
    console.log(
      `  🟡 Pillar #2 rank 11-20. Needs push but not catastrophic. Could be linking OR content.`
    )
  } else {
    console.log(`  ✅ Pillar #2 ranking well. Not the bottleneck.`)
  }

  console.log(`\n=== END ANALYSIS ===`)
}

main()
