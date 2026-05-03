/**
 * scripts/lemlist-import-prep.ts
 * -----------------------------------------------------------------------------
 * Action #7 Sprint D Ahrefs 2026-05-03 — préparation CSV import Lemlist (top200).
 *
 * Lit `docs/audit-ahrefs-2026-05-03/F_supply/F2_top5000_artisans.csv` (PII
 * gitignored) et produit un CSV minimal prêt pour upload Lemlist UI :
 *   - email (clé Lemlist)
 *   - firstName (dérivé du `name` brut de la BDD ADEME — ProperCase)
 *   - companyName (raison sociale ADEME)
 *   - city, region (utiles pour personnalisation locale)
 *   - topQualif (qualif RGE principale en libellé humain)
 *   - reviewCount, ratingAverage (preuves sociales pour copy commercial)
 *   - leadScore (priority_score, pour ordre de campagne)
 *
 * Filtre :
 *   - email valide (regex basique)
 *   - lead_score décroissant
 *   - max N rangs (par défaut 200, cf. plan F_supply/OUTREACH_PLAYBOOK.md)
 *
 * Usage :
 *   npx tsx scripts/lemlist-import-prep.ts                   # → 200 rows
 *   npx tsx scripts/lemlist-import-prep.ts --top 500         # top 500
 *   npx tsx scripts/lemlist-import-prep.ts --out custom.csv  # output path
 *
 * Output : `docs/audit-ahrefs-2026-05-03/F_supply/outreach_lemlist_top<N>.csv`
 *          (gitignored, PII safe).
 *
 * Idempotent : safe à re-run, output overwritten.
 */

import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { join, resolve } from 'node:path'

const ROOT = process.cwd()
const SOURCE_CSV = join(
  ROOT,
  'docs',
  'audit-ahrefs-2026-05-03',
  'F_supply',
  'F2_top5000_artisans.csv'
)

const QUALIF_LABELS: Record<string, string> = {
  '41': 'QualiPAC (PAC)',
  '43': 'Chauffe-eau thermo',
  '71': 'QualiSol (chauffe-eau solaire)',
  '38': 'QualiBois (chaudière biomasse)',
  '39': 'QualiBois (poêle à granulés)',
  '12': 'QualiPV (photovoltaïque)',
  '14': 'QualiPV (autoconso > 100 kWc)',
  '23': 'Qualibat 7141 (ITE)',
  '24': 'Qualibat 7144 (ITI)',
  '25': 'Qualibat 7131 (combles)',
  '21': 'Qualibat 8631 (audit énergétique)',
  '22': 'Qualibat 8731 (audit + maîtrise)',
  '15': 'Qualibat 5311 (chauffage)',
  '16': 'Qualifelec IRVE',
  '17': 'Qualifelec MPE',
  '52': 'OPQIBI 1905 (audit BET)',
}

type ParsedArgs = { top: number; out: string }

function parseArgs(argv: string[]): ParsedArgs {
  let top = 200
  let out = ''
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--top' && argv[i + 1]) {
      top = Math.max(1, Math.min(5000, Number.parseInt(argv[i + 1] ?? '200', 10) || 200))
      i++
    } else if (argv[i] === '--out' && argv[i + 1]) {
      out = argv[i + 1] ?? ''
      i++
    }
  }
  if (!out) {
    out = join('docs', 'audit-ahrefs-2026-05-03', 'F_supply', `outreach_lemlist_top${top}.csv`)
  }
  return { top, out }
}

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toProperCase(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length === 0 ? '' : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
    .trim()
}

function deriveFirstName(rawName: string): string {
  // ADEME `name` est généralement la raison sociale (ETABLISSEMENTS X, SARL Y).
  // Pas de prénom fiable. Fallback = chaîne vide pour éviter "Bonjour ETABLISSEMENTS"
  // dans les emails Lemlist. Le commercial complète manuellement post-import.
  if (/^(SARL|SAS|SA|EURL|SCI|SCP|SNC|EI|ETS|ETABLISSEMENTS|ENTREPRISE)\b/i.test(rawName)) {
    return ''
  }
  // Sinon : 1er mot capitalisé.
  const first = rawName.split(/\s+/)[0]
  return first ? toProperCase(first) : ''
}

function deriveCompanyName(rawName: string): string {
  return toProperCase(rawName)
}

function deriveTopQualif(qualifsRaw: string): string {
  const codes = qualifsRaw.split('|').filter(Boolean)
  for (const code of codes) {
    if (QUALIF_LABELS[code]) return QUALIF_LABELS[code]
  }
  return codes[0] ? `Qualif ${codes[0]}` : ''
}

type LemlistRow = {
  email: string
  firstName: string
  companyName: string
  city: string
  region: string
  topQualif: string
  reviewCount: number
  ratingAverage: number
  leadScore: number
}

async function main(): Promise<void> {
  const { top, out } = parseArgs(process.argv.slice(2))

  const input = createReadStream(SOURCE_CSV, { encoding: 'utf8' })
  const rl = createInterface({ input, crlfDelay: Infinity })

  const rows: LemlistRow[] = []
  let header: string[] | null = null
  let raw = 0
  let skipped = 0

  for await (const line of rl) {
    if (line.length === 0) continue
    if (header === null) {
      header = parseCsvLine(line)
      continue
    }
    raw++
    const cols = parseCsvLine(line)
    const get = (name: string): string => {
      const idx = header?.indexOf(name) ?? -1
      return idx >= 0 ? (cols[idx] ?? '') : ''
    }

    const email = get('email').trim().toLowerCase()
    if (!EMAIL_RE.test(email)) {
      skipped++
      continue
    }

    const rawName = get('name')
    rows.push({
      email,
      firstName: deriveFirstName(rawName),
      companyName: deriveCompanyName(rawName),
      city: toProperCase(get('address_city')),
      region: get('address_region'),
      topQualif: deriveTopQualif(get('rge_qualifications')),
      reviewCount: Number.parseInt(get('review_count') || '0', 10) || 0,
      ratingAverage: Number.parseFloat(get('rating_average') || '0') || 0,
      leadScore: Number.parseInt(get('priority_score') || '0', 10) || 0,
    })
  }

  rows.sort((a, b) => b.leadScore - a.leadScore)
  const top200 = rows.slice(0, top)

  const outHeader = [
    'email',
    'firstName',
    'companyName',
    'city',
    'region',
    'topQualif',
    'reviewCount',
    'ratingAverage',
    'leadScore',
  ]
  const lines = [outHeader.join(',')]
  for (const r of top200) {
    lines.push(
      [
        r.email,
        r.firstName,
        r.companyName,
        r.city,
        r.region,
        r.topQualif,
        String(r.reviewCount),
        r.ratingAverage.toFixed(2),
        String(r.leadScore),
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  }

  const absOut = resolve(ROOT, out)
  await writeFile(absOut, lines.join('\n') + '\n', 'utf8')

  console.log(`✅ Lemlist CSV ready : ${out}`)
  console.log(`   Source rows scanned : ${raw.toLocaleString('fr-FR')}`)
  console.log(`   Skipped (email invalide) : ${skipped.toLocaleString('fr-FR')}`)
  console.log(`   Output rows : ${top200.length.toLocaleString('fr-FR')}`)
  console.log()
  console.log('   Variables Lemlist disponibles :')
  console.log('     {{email}} {{firstName}} {{companyName}} {{city}} {{region}}')
  console.log('     {{topQualif}} {{reviewCount}} {{ratingAverage}} {{leadScore}}')
  console.log()
  console.log('   ⚠️  Rappel PII : output gitignored (cf .gitignore F_supply/outreach_lemlist_*).')
}

main().catch((err) => {
  console.error('❌ Lemlist prep failed:', err)
  process.exit(1)
})
