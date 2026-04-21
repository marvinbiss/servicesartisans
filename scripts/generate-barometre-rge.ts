/**
 * Baromètre RGE mensuel — CLI wrapper.
 *
 * Thin I/O shell around `src/lib/barometre/rge-aggregate.ts` (pure, tested).
 *
 * Source : table `providers` (sync hebdomadaire ADEME).
 * Output :
 *   1. row dans `barometre_rge_snapshots` (yearmonth unique, upsert)
 *   2. fichier `docs/barometres/barometre-rge-YYYY-MM.md` (citable, PR-ready)
 *
 * Usage :
 *   npx tsx scripts/generate-barometre-rge.ts            # mois courant
 *   npx tsx scripts/generate-barometre-rge.ts 2026-04    # mois explicite
 *   npx tsx scripts/generate-barometre-rge.ts --dry-run  # pas d'écriture DB
 *
 * Env :
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs'
import * as path from 'path'
import { createAdminClient } from '../src/lib/supabase/admin'
import {
  aggregate,
  validYearMonth,
  type ProviderRow,
  type Snapshot,
} from '../src/lib/barometre/rge-aggregate'

function parseArgs(): { yearmonth: string; dryRun: boolean } {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const explicit = args.find((a) => /^\d{4}-\d{2}$/.test(a))
  const yearmonth = explicit ?? new Date().toISOString().slice(0, 7)
  if (!validYearMonth(yearmonth)) {
    throw new Error(`Invalid yearmonth "${yearmonth}" — expected YYYY-MM`)
  }
  return { yearmonth, dryRun }
}

async function fetchAllProviders(): Promise<ProviderRow[]> {
  const supabase = createAdminClient()
  const pageSize = 1000
  const out: ProviderRow[] = []
  let from = 0
  for (;;) {
    const { data, error } = await supabase
      .from('providers')
      .select('id,specialty,address_region,rge_qualifications,rge_valid_until,rge_organismes')
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .order('id', { ascending: true }) // stable pagination on 50k+ rows
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`providers fetch failed: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...(data as ProviderRow[]))
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

async function fetchTotalProviders(): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  if (error) throw new Error(`total providers failed: ${error.message}`)
  return count ?? 0
}

async function upsertSnapshot(snap: Snapshot): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('barometre_rge_snapshots').upsert(
    {
      yearmonth: snap.yearmonth,
      captured_at: snap.captured_at,
      total_rge_active: snap.total_rge_active,
      total_rge_expired: snap.total_rge_expired,
      total_providers: snap.total_providers,
      by_region: snap.by_region,
      by_qualification: snap.by_qualification,
      by_specialty: snap.by_specialty,
      organismes: snap.organismes,
      methodology: snap.methodology,
      source_note: snap.source_note,
    },
    { onConflict: 'yearmonth' }
  )
  if (error) throw new Error(`upsert snapshot failed: ${error.message}`)
}

function writeMarkdown(snap: Snapshot): string {
  const [year, month] = snap.yearmonth.split('-')
  const monthLabel = new Date(`${snap.yearmonth}-01T00:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const nf = (n: number) => n.toLocaleString('fr-FR')

  const lines: string[] = []
  lines.push(`# Baromètre RGE — ${monthLabel}`)
  lines.push('')
  lines.push(
    `**Snapshot du ${new Date(snap.captured_at).toLocaleDateString('fr-FR')}** · Source : ${snap.source_note}`
  )
  lines.push('')
  lines.push('## Chiffres clés')
  lines.push('')
  lines.push(
    `- **${nf(snap.total_rge_active)} artisans RGE actifs** en France au 1er ${monthLabel}`
  )
  lines.push(`- ${nf(snap.total_rge_expired)} artisans avec qualification RGE expirée`)
  lines.push(`- Sur un total de ${nf(snap.total_providers)} artisans référencés`)
  lines.push('')
  lines.push('## Top régions (RGE actifs)')
  lines.push('')
  lines.push('| Rang | Région | RGE actifs | Expirés | Qualification #1 |')
  lines.push('|---:|---|---:|---:|---|')
  snap.by_region.slice(0, 13).forEach((r, i) => {
    lines.push(
      `| ${i + 1} | ${r.region} | ${nf(r.nb_rge_active)} | ${nf(r.nb_rge_expired)} | ${r.top_qualification ?? '—'} |`
    )
  })
  lines.push('')
  lines.push('## Top 10 qualifications RGE')
  lines.push('')
  lines.push('| Rang | Code | Artisans |')
  lines.push('|---:|---|---:|')
  snap.by_qualification.forEach((q) => {
    lines.push(`| ${q.rank} | ${q.code} | ${nf(q.nb_artisans)} |`)
  })
  lines.push('')
  lines.push('## Top 12 spécialités')
  lines.push('')
  lines.push('| Spécialité | RGE actifs | Part |')
  lines.push('|---|---:|---:|')
  snap.by_specialty.forEach((s) => {
    lines.push(`| ${s.specialty} | ${nf(s.nb_rge_active)} | ${s.share_pct}% |`)
  })
  lines.push('')
  lines.push('## Organismes certificateurs')
  lines.push('')
  lines.push('| Organisme | Artisans référencés |')
  lines.push('|---|---:|')
  snap.organismes.forEach((o) => {
    lines.push(`| ${o.organisme} | ${nf(o.nb_artisans)} |`)
  })
  lines.push('')
  lines.push('## Méthodologie')
  lines.push('')
  lines.push(snap.methodology)
  lines.push('')
  lines.push(
    `> Attribution : « Source : ServicesArtisans — Baromètre RGE ${monthLabel} (https://servicesartisans.fr/barometre/rge) ».`
  )
  lines.push('')

  const dir = path.join(process.cwd(), 'docs', 'barometres')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `barometre-rge-${year}-${month}.md`)
  fs.writeFileSync(file, lines.join('\n'), 'utf-8')
  return file
}

async function main(): Promise<void> {
  const { yearmonth, dryRun } = parseArgs()
  console.log(`[barometre-rge] Generating snapshot for ${yearmonth}${dryRun ? ' (dry-run)' : ''}`)

  console.log('[barometre-rge] Fetching providers…')
  const [rows, total] = await Promise.all([fetchAllProviders(), fetchTotalProviders()])
  console.log(`[barometre-rge] ${rows.length} providers with RGE qualifications, ${total} total`)

  const snap = aggregate(rows, yearmonth, total)
  console.log(
    `[barometre-rge] active=${snap.total_rge_active} expired=${snap.total_rge_expired} regions=${snap.by_region.length}`
  )

  const mdPath = writeMarkdown(snap)
  console.log(`[barometre-rge] Markdown written → ${path.relative(process.cwd(), mdPath)}`)

  if (dryRun) {
    console.log('[barometre-rge] --dry-run : skipping DB upsert')
    return
  }

  await upsertSnapshot(snap)
  console.log(`[barometre-rge] Snapshot upserted to barometre_rge_snapshots (${snap.yearmonth})`)
}

// Guard against import by test files — only run when invoked as CLI
const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  /generate-barometre-rge\.(ts|js|mjs|cjs)$/.test(process.argv[1])

if (invokedDirectly) {
  main().catch((err) => {
    console.error('[barometre-rge] FATAL', err)
    process.exit(1)
  })
}
