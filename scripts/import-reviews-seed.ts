/**
 * Seed reviews from a CSV (GMB export, manual list, legacy platform).
 *
 * CSV columns expected (tab or comma, header on line 1):
 *   provider_siret   (14 digits, used to resolve provider_id)
 *   author_name
 *   author_email     (optional)
 *   rating           (1-5)
 *   content          (text, optional, wrap with quotes if it contains commas)
 *   would_recommend  (true/false/1/0, optional)
 *   source           (e.g. 'google', 'trustpilot', 'manual' — default 'seed')
 *   reviewed_at      (ISO date, optional; defaults to now)
 *
 * Usage:
 *   npx tsx scripts/import-reviews-seed.ts path/to/file.csv
 *   npx tsx scripts/import-reviews-seed.ts path/to/file.csv --dry-run
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { config as loadDotenv } from 'dotenv'

loadDotenv({ path: resolve(process.cwd(), '.env.local') })
loadDotenv({ path: resolve(process.cwd(), '.env') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const [, , filePath, maybeDryRun] = process.argv
if (!filePath) {
  console.error('Usage: npx tsx scripts/import-reviews-seed.ts <csv-path> [--dry-run]')
  process.exit(1)
}

const dryRun = maybeDryRun === '--dry-run'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

type Row = {
  provider_siret: string
  author_name: string
  author_email: string
  rating: number
  content: string
  would_recommend: boolean | null
  source: string
  reviewed_at: string
}

function parseCsv(raw: string): Row[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const header = lines[0].split(/\t|,/).map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)

  const iSiret = idx('provider_siret')
  const iAuthor = idx('author_name')
  const iEmail = idx('author_email')
  const iRating = idx('rating')
  const iContent = idx('content')
  const iRecommend = idx('would_recommend')
  const iSource = idx('source')
  const iDate = idx('reviewed_at')

  if (iSiret < 0 || iAuthor < 0 || iRating < 0) {
    throw new Error('CSV must contain provider_siret, author_name, rating columns')
  }

  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const rating = Number(cols[iRating])
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) continue
    const siret = cols[iSiret]?.replace(/\D/g, '') ?? ''
    if (siret.length !== 14) continue

    rows.push({
      provider_siret: siret,
      author_name: (cols[iAuthor] ?? '').trim().slice(0, 60),
      author_email: (iEmail >= 0 ? cols[iEmail] : '').trim(),
      rating,
      content: (iContent >= 0 ? cols[iContent] : '').trim().slice(0, 1200),
      would_recommend:
        iRecommend >= 0
          ? ['true', '1', 'yes', 'oui'].includes(cols[iRecommend].trim().toLowerCase())
            ? true
            : ['false', '0', 'no', 'non'].includes(cols[iRecommend].trim().toLowerCase())
              ? false
              : null
          : null,
      source: (iSource >= 0 && cols[iSource] ? cols[iSource] : 'seed').trim().slice(0, 40),
      reviewed_at:
        iDate >= 0 && cols[iDate] ? new Date(cols[iDate]).toISOString() : new Date().toISOString(),
    })
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if ((ch === ',' || ch === '\t') && !inQuotes) {
      cells.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  cells.push(cur)
  return cells
}

async function run() {
  const csv = readFileSync(resolve(filePath), 'utf-8')
  const rows = parseCsv(csv)
  console.log(`Parsed ${rows.length} valid rows`)

  if (rows.length === 0) {
    console.error('Nothing to import')
    process.exit(1)
  }

  const sirets = Array.from(new Set(rows.map((r) => r.provider_siret)))
  const { data: providers, error: fetchErr } = await supabase
    .from('providers')
    .select('id, siret')
    .in('siret', sirets)

  if (fetchErr) {
    console.error('Provider lookup failed', fetchErr)
    process.exit(1)
  }

  const providerIdBySiret = new Map<string, string>()
  for (const p of providers ?? []) {
    if (p.siret) providerIdBySiret.set(p.siret.replace(/\D/g, ''), p.id)
  }

  console.log(`Resolved ${providerIdBySiret.size}/${sirets.length} providers`)

  let ready = 0
  let missing = 0
  const payload = rows
    .map((r) => {
      const providerId = providerIdBySiret.get(r.provider_siret)
      if (!providerId) {
        missing++
        return null
      }
      ready++
      return {
        provider_id: providerId,
        author_name: r.author_name,
        author_email: r.author_email || null,
        rating: r.rating,
        content: r.content || null,
        would_recommend: r.would_recommend,
        status: 'published',
        created_at: r.reviewed_at,
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  console.log(`Ready to import: ${ready}, skipped (siret not found): ${missing}`)

  if (dryRun) {
    console.log('DRY RUN — no insert performed')
    console.log(JSON.stringify(payload.slice(0, 3), null, 2))
    return
  }

  const { error: insertErr, count } = await supabase
    .from('reviews')
    .insert(payload, { count: 'exact' })

  if (insertErr) {
    console.error('Insert failed', insertErr)
    process.exit(1)
  }

  console.log(`Inserted ${count ?? ready} reviews. Triggers will update provider rating/count.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
