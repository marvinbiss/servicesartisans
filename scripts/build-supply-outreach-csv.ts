/**
 * Action #11 (Sprint A) — Build outreach CSV for supply activation campaign.
 *
 * Queries Supabase live to extract top N RGE artisans matching the same
 * priority logic as `docs/audit-ahrefs-2026-05-03/F_supply/supply_outreach_priority.sql`,
 * enriched with canonical fiche URL + claim CTA. Output is Lemlist-compatible.
 *
 * Why query live (not reuse F2 CSV): the F2 dump from `audit-supply-rge-2026-05.ts`
 * stored `address_city` as INSEE code (e.g. "68375") which yields broken
 * `/services/artisan/68375/...` URLs. Live query reads the full provider row
 * (specialty + address_city as name + address_region) so URLs are correct.
 *
 * Usage:
 *   npx tsx scripts/build-supply-outreach-csv.ts            # default: top 200, score>=80
 *   npx tsx scripts/build-supply-outreach-csv.ts --limit 500 --min-score 70
 *
 * Output: docs/audit-ahrefs-2026-05-03/F_supply/outreach_lemlist_top<N>.csv
 *         (gitignored — F_supply/*.csv pattern)
 */
import * as fs from 'fs'
import * as path from 'path'
import { supabase } from './lib/supabase-admin'

const SITE_URL = 'https://servicesartisans.fr'
const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'F_supply')

const TOP_VILLES_SLUGS = [
  'paris',
  'marseille',
  'lyon',
  'toulouse',
  'nice',
  'nantes',
  'montpellier',
  'strasbourg',
  'bordeaux',
  'lille',
  'rennes',
  'reims',
  'le-havre',
  'toulon',
  'grenoble',
  'dijon',
  'angers',
  'nimes',
  'villeurbanne',
  'saint-denis',
  'aix-en-provence',
  'le-mans',
  'clermont-ferrand',
  'brest',
  'tours',
  'amiens',
  'limoges',
  'annecy',
  'perpignan',
  'besancon',
  'metz',
  'orleans',
] as const
const TOP_VILLES = new Set<string>(TOP_VILLES_SLUGS)

type RgeQualif = {
  code?: string
  nom?: string
  organisme?: string
  domaine?: string
  date_fin?: string
}

type ProviderRow = {
  id: string
  stable_id: string | null
  name: string
  slug: string | null
  email: string | null
  phone: string | null
  siret: string | null
  specialty: string | null
  address_city: string | null
  address_postal_code: string | null
  address_region: string | null
  rge_qualifications: RgeQualif[] | null
  rge_expires_at: string | null
  review_count: number | null
  rating_average: number | null
  claimed_at: string | null
}

function parseArgs(argv: string[]): { limit: number; minScore: number } {
  let limit = 200
  let minScore = 80
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit' && argv[i + 1]) limit = Math.max(1, parseInt(argv[++i], 10))
    if (argv[i] === '--min-score' && argv[i + 1]) minScore = Math.max(0, parseInt(argv[++i], 10))
  }
  return { limit, minScore }
}

function isUsableEmail(email: string | null): boolean {
  if (!email) return false
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false
  if (/no[-_]?reply|donotreply|placeholder|exemple\.com|example\.com/i.test(email)) return false
  return true
}

function escapeCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function toRgeLabel(qualifs: RgeQualif[] | null): string {
  if (!qualifs || qualifs.length === 0) return ''
  // Déduplique par code (un même org peut donner plusieurs lignes pour la
  // même qualif). Préfère `code` court (ex: "41"), fallback `organisme`.
  const seen = new Set<string>()
  const labels: string[] = []
  for (const q of qualifs) {
    const key = q.code ?? q.organisme ?? q.nom ?? ''
    if (!key || seen.has(key)) continue
    seen.add(key)
    labels.push(key)
  }
  return labels.join(', ')
}

function toRgeOrganismes(qualifs: RgeQualif[] | null): string {
  if (!qualifs || qualifs.length === 0) return ''
  const seen = new Set<string>()
  for (const q of qualifs) {
    if (q.organisme) seen.add(q.organisme)
  }
  return Array.from(seen).join(', ')
}

function firstName(fullName: string): string {
  if (!fullName) return ''
  const cleaned = fullName.replace(/\([^)]*\)/g, '').trim()
  const tokens = cleaned
    .split(/\s+/)
    .filter((t) => !/^(SARL|SAS|SASU|SCI|EURL|EI|SA|ETS|ETABLISSEMENTS|SCP|SNC|SCOP)$/i.test(t))
  if (tokens.length === 0) return ''
  const last = tokens[tokens.length - 1]
  return last.charAt(0).toUpperCase() + last.slice(1).toLowerCase()
}

function computePriorityScore(p: ProviderRow): number {
  let score = 0
  const nbQualifs = p.rge_qualifications?.length ?? 0
  if (nbQualifs >= 2) score += 50
  if (isUsableEmail(p.email)) score += 30
  if (p.phone && p.phone.trim().length > 0) score += 20
  if (p.slug && TOP_VILLES.has(p.slug.split('-').pop() ?? '')) score += 15
  if (p.rge_expires_at) {
    const expDate = new Date(p.rge_expires_at)
    const oneYearFromNow = new Date()
    oneYearFromNow.setDate(oneYearFromNow.getDate() + 365)
    if (expDate >= oneYearFromNow) score += 10
  }
  return score
}

async function fetchCandidates(): Promise<ProviderRow[]> {
  const all: ProviderRow[] = []
  const pageSize = 1000
  let from = 0
  const maxRows = 50_000

  while (from < maxRows) {
    const { data, error } = await supabase
      .from('providers')
      .select(
        'id, stable_id, name, slug, email, phone, siret, specialty, address_city, address_postal_code, address_region, rge_qualifications, rge_expires_at, review_count, rating_average, claimed_at'
      )
      .eq('is_active', true)
      .is('claimed_at', null)
      .not('rge_qualifications', 'is', null)
      .not('email', 'is', null)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error('Supabase error:', error.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break

    for (const r of data) {
      const row = r as ProviderRow
      if (!row.rge_qualifications || row.rge_qualifications.length === 0) continue
      all.push(row)
    }

    if (data.length < pageSize) break
    from += pageSize
  }

  return all
}

async function main() {
  const { limit, minScore } = parseArgs(process.argv.slice(2))
  console.log(`Fetching RGE candidates from Supabase (claimed_at IS NULL + email NOT NULL)...`)
  const candidates = await fetchCandidates()
  console.log(`  → ${candidates.length.toLocaleString('fr')} candidates fetched`)

  const scored = candidates
    .map((p) => ({ row: p, score: computePriorityScore(p) }))
    .filter(({ row, score }) => score >= minScore && isUsableEmail(row.email))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const reviewDiff = (b.row.review_count ?? 0) - (a.row.review_count ?? 0)
      if (reviewDiff !== 0) return reviewDiff
      return (b.row.rating_average ?? 0) - (a.row.rating_average ?? 0)
    })

  console.log(
    `  → ${scored.length.toLocaleString('fr')} after filter (score>=${minScore} + usable email)`
  )

  // Dedup by email (Lemlist deduplicates anyway, but cleaner output).
  const seenEmails = new Set<string>()
  const top = []
  for (const item of scored) {
    const email = item.row.email!.toLowerCase().trim()
    if (seenEmails.has(email)) continue
    seenEmails.add(email)
    top.push(item)
    if (top.length >= limit) break
  }
  console.log(`  → ${top.length} retained for outreach (after email dedup)`)

  const headers = [
    'email',
    'firstName',
    'companyName',
    'postalCode',
    'addressRegion',
    'specialty',
    'rgeCodes',
    'rgeOrganismes',
    'nbQualifs',
    'priorityScore',
    'ficheUrl',
    'claimUrl',
  ]

  const lines: string[] = [headers.join(',')]
  let skippedNoUrl = 0
  for (const { row, score } of top) {
    // Use the /artisan/{slug} compat redirect (server-side resolves the
    // canonical /services/[s]/[v]/[publicId] URL via DB lookup). Avoids
    // client-side mis-construction when address_city is INSEE code (5 digits)
    // instead of city name. Cf. src/app/(public)/artisan/[slug]/page.tsx.
    const handle = row.slug || row.stable_id
    if (!handle) {
      skippedNoUrl++
      continue
    }
    const fullUrl = `${SITE_URL}/artisan/${handle}`
    const claimUrl = `${fullUrl}#revendiquer`

    const csvRow = [
      row.email!,
      firstName(row.name),
      row.name,
      row.address_postal_code ?? '',
      row.address_region ?? '',
      row.specialty ?? '',
      toRgeLabel(row.rge_qualifications),
      toRgeOrganismes(row.rge_qualifications),
      String(row.rge_qualifications?.length ?? 0),
      String(score),
      fullUrl,
      claimUrl,
    ].map(escapeCsv)

    lines.push(csvRow.join(','))
  }

  if (skippedNoUrl > 0) {
    console.warn(`  ⚠️  ${skippedNoUrl} rows skipped (no fiche URL — missing slug/stable_id)`)
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const outCount = lines.length - 1
  const outPath = path.join(OUT_DIR, `outreach_lemlist_top${outCount}.csv`)
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')
  console.log(`\n✅ Wrote ${outPath}`)
  console.log(`   ${outCount} contacts ready for Lemlist upload.`)
  console.log(`\nNext steps:`)
  console.log(
    `  1. Upload CSV to Lemlist (campaign: "Supply Activation Q2 2026 — RGE top ${outCount}")`
  )
  console.log(
    `  2. Use email template in docs/audit-ahrefs-2026-05-03/F_supply/OUTREACH_PLAYBOOK.md`
  )
  console.log(`  3. Track conversion in Pipedrive pipeline "Claim Onboarding"`)
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
