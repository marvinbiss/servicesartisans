/**
 * Fetch Bloc 3 long-tail keywords from Ahrefs API
 *
 * Sprint 3 vague 4 (2026-05-04) — sourcing matching-terms sur 7 seeds
 * critiques pour générer pages /guides/[topic]/[modifier] long-tail.
 * Quota cible : ~10-15K unités sur 24K dispo (reset 2026-05-18).
 *
 * Usage : tsx scripts/fetch-bloc3-longtail.ts
 * Output : tmp/ahrefs/bloc3-longtail-2026-05-04.csv
 *
 * Token : ~/.secrets/ahrefs.env (40 char, prefix -fUKR_)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

type AhrefsKwRow = {
  keyword: string
  volume: number | null
  difficulty: number | null
  cpc: number | null
}

type CsvRow = {
  seed: string
  keyword: string
  volume: number
  kd: number
  cpc: number | null
}

const SEEDS = [
  'vmc',
  'pompe a chaleur',
  'panneau solaire',
  'ma prime renov',
  'cee',
  'dpe',
  'isolation',
] as const

const COUNTRY = 'fr'
const LIMIT_PER_SEED = 100
const MIN_VOLUME = 100
const MAX_KD = 30

function getToken(): string {
  const path = join(homedir(), '.secrets', 'ahrefs.env')
  return readFileSync(path, 'utf8').replace(/[\r\n\s]/g, '')
}

async function fetchMatching(seed: string, token: string): Promise<AhrefsKwRow[]> {
  const url = new URL('https://api.ahrefs.com/v3/keywords-explorer/matching-terms')
  url.searchParams.set('keywords', seed)
  url.searchParams.set('country', COUNTRY)
  url.searchParams.set('match_mode', 'terms')
  url.searchParams.set('limit', String(LIMIT_PER_SEED))
  url.searchParams.set('select', 'keyword,volume,difficulty,cpc')
  url.searchParams.set('order_by', 'volume:desc')

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ahrefs ${res.status} for "${seed}": ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as { keywords?: AhrefsKwRow[] }
  return data.keywords ?? []
}

async function fetchQuota(token: string): Promise<{ used: number; limit: number }> {
  const res = await fetch('https://api.ahrefs.com/v3/subscription-info/limits-and-usage', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const data = (await res.json()) as {
    limits_and_usage: { units_limit_workspace: number; units_usage_workspace: number }
  }
  return {
    used: data.limits_and_usage.units_usage_workspace,
    limit: data.limits_and_usage.units_limit_workspace,
  }
}

function toCsv(rows: CsvRow[]): string {
  const header = 'seed,keyword,volume,kd,cpc\n'
  const escape = (v: string) =>
    v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
  const body = rows
    .map((r) => `${escape(r.seed)},${escape(r.keyword)},${r.volume},${r.kd},${r.cpc ?? ''}`)
    .join('\n')
  return header + body + '\n'
}

async function main() {
  const token = getToken()
  const before = await fetchQuota(token)
  console.log(
    `[bloc3] quota before: ${before.used.toLocaleString()} / ${before.limit.toLocaleString()}`
  )

  const all: CsvRow[] = []
  for (const seed of SEEDS) {
    process.stdout.write(`[bloc3] fetching "${seed}"… `)
    const rows = await fetchMatching(seed, token)
    const filtered = rows
      .filter((r) => r.volume != null && r.volume >= MIN_VOLUME)
      .filter((r) => r.difficulty != null && r.difficulty <= MAX_KD)
      .map((r) => ({
        seed,
        keyword: r.keyword,
        volume: r.volume as number,
        kd: r.difficulty as number,
        cpc: r.cpc,
      }))
    all.push(...filtered)
    console.log(
      `${filtered.length}/${rows.length} after filter (vol>=${MIN_VOLUME}, kd<=${MAX_KD})`
    )
  }

  // Dedup par keyword en gardant le max volume (un kw peut matcher plusieurs seeds)
  const byKw = new Map<string, CsvRow>()
  for (const r of all) {
    const existing = byKw.get(r.keyword)
    if (!existing || r.volume > existing.volume) byKw.set(r.keyword, r)
  }
  const deduped = [...byKw.values()].sort((a, b) => b.volume - a.volume)

  const outDir = join(process.cwd(), 'tmp', 'ahrefs')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'bloc3-longtail-2026-05-04.csv')
  writeFileSync(outPath, toCsv(deduped), 'utf8')
  console.log(`[bloc3] wrote ${deduped.length} unique KW → ${outPath}`)

  const after = await fetchQuota(token)
  const cost = after.used - before.used
  console.log(
    `[bloc3] quota after: ${after.used.toLocaleString()} (cost: ${cost.toLocaleString()} units)`
  )
}

main().catch((err) => {
  console.error('[bloc3] failed', err)
  process.exit(1)
})
