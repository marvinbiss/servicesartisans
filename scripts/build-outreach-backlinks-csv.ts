/**
 * Action #10 (Sprint B 2026-05-03) — Build outreach CSV for backlinks campaign.
 *
 * Reads `docs/audit-ahrefs-2026-05-03/outreach_targets_2026-05.csv` (384 domains
 * audited via Ahrefs Phase 0), filters top 50 prioritised across 4 tiers, and
 * outputs a Lemlist-compatible CSV with pitch angle pre-set per tier.
 *
 * Tier strategy (most promising first) :
 *   - tier1_press      → 8 → pitch "data scoop" (49K RGE, baromètre, dataset gouv)
 *   - tier3_inst       → 21 → pitch "citation open-data" (data.gouv.fr légitimité)
 *   - tier2_btp        → 10 → pitch "partenariat éditorial" (échange contenu)
 *   - tier4_general    → top 11 by priority_score → pitch "link insertion / guest post"
 *
 * Selection : top N per tier, sorted by priority_score DESC. Total = 50 cibles.
 *
 * Contact emails NOT included (each needs Hunter.io / Findymail enrichment by
 * Marvin). The CSV has a `contactEmail` column left empty for downstream
 * enrichment.
 *
 * Usage :
 *   npx tsx scripts/build-outreach-backlinks-csv.ts
 *
 * Output : docs/audit-ahrefs-2026-05-03/D_backlinks/outreach_lemlist_top50.csv
 *          (gitignored, no PII but kept local until Marvin enriches contacts)
 */
import * as fs from 'fs'
import * as path from 'path'

const SRC_CSV = path.join(
  process.cwd(),
  'docs',
  'audit-ahrefs-2026-05-03',
  'outreach_targets_2026-05.csv'
)
const OUT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03', 'D_backlinks')

type Row = {
  domain: string
  tier: 'tier1_press' | 'tier2_btp' | 'tier3_inst' | 'tier4_general'
  dr: number
  trafficDomain: number
  nCompetitorsLinking: number
  linkedCompetitors: string
  priorityScore: number
}

type PitchAngle = {
  subject: string
  asset: string
  hook: string
}

const PITCH_BY_TIER: Record<Row['tier'], PitchAngle> = {
  tier1_press: {
    subject: 'Data inédite : 49 000 artisans RGE en France (carto + baromètre)',
    asset: 'Dataset open-data /datasets/rge + page baromètre /barometre/rge',
    hook: 'Premier acteur du secteur à publier l\'annuaire RGE en open data sur data.gouv.fr — angle "transparence" idéal pour un papier rénovation énergétique.',
  },
  tier2_btp: {
    subject: 'Échange éditorial RGE : on cite vos contenus, vous citez nos data',
    asset: 'Pillar /rge + dataset data.gouv.fr',
    hook: 'Partenariat win-win : on enrichit vos articles RGE avec nos datasets sourcés ADEME, vous nous citez comme source de référence sur le secteur.',
  },
  tier3_inst: {
    subject: 'Dataset RGE open-data : ressource utile pour vos références',
    asset: 'Dataset data.gouv.fr (CC-BY 4.0)',
    hook: "Dataset publié sur data.gouv.fr (~49K fiches, maj mensuelle, licence ouverte). Référencement naturel dans vos pages d'orientation rénovation énergétique.",
  },
  tier4_general: {
    subject: 'Lien insertion ou guest post — sujet RGE / rénovation énergétique',
    asset: 'Guest post original sur RGE/CEE/MaPrimeRénov ou insertion de lien sur article existant',
    hook: 'Contenu original 1500+ mots avec data exclusives (carto interactive, dataset open-data). Pas de duplicate content.',
  },
}

const TARGETS_PER_TIER: Record<Row['tier'], number> = {
  tier1_press: 8,
  tier3_inst: 21,
  tier2_btp: 10,
  tier4_general: 11,
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        cur += c
      }
    } else {
      if (c === ',') {
        out.push(cur)
        cur = ''
      } else if (c === '"' && cur.length === 0) {
        inQuotes = true
      } else {
        cur += c
      }
    }
  }
  out.push(cur)
  return out
}

function readSource(): Row[] {
  const raw = fs.readFileSync(SRC_CSV, 'utf8').replace(/\r\n/g, '\n').trim()
  const lines = raw.split('\n')
  const out: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i])
    if (c.length < 7) continue
    const tier = c[1] as Row['tier']
    if (!['tier1_press', 'tier2_btp', 'tier3_inst', 'tier4_general'].includes(tier)) continue
    out.push({
      domain: c[0],
      tier,
      dr: parseInt(c[2] ?? '0', 10) || 0,
      trafficDomain: parseInt(c[3] ?? '0', 10) || 0,
      nCompetitorsLinking: parseInt(c[4] ?? '0', 10) || 0,
      linkedCompetitors: c[5] ?? '',
      priorityScore: parseFloat(c[6] ?? '0') || 0,
    })
  }
  return out
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function main() {
  const all = readSource()
  console.log(`Loaded ${all.length} domains from ${SRC_CSV}`)

  const byTier = new Map<Row['tier'], Row[]>()
  for (const r of all) {
    const arr = byTier.get(r.tier) ?? []
    arr.push(r)
    byTier.set(r.tier, arr)
  }
  for (const arr of byTier.values()) {
    arr.sort((a, b) => b.priorityScore - a.priorityScore)
  }

  const selected: Row[] = []
  for (const tier of ['tier1_press', 'tier3_inst', 'tier2_btp', 'tier4_general'] as const) {
    const slice = (byTier.get(tier) ?? []).slice(0, TARGETS_PER_TIER[tier])
    selected.push(...slice)
    console.log(
      `  ${tier.padEnd(15)} : ${slice.length} retained / ${(byTier.get(tier) ?? []).length} available`
    )
  }

  console.log(`\nTotal selected: ${selected.length}`)

  // Lemlist columns
  const headers = [
    'email', // À enrichir manuellement (Hunter.io / Findymail)
    'firstName', // À enrichir
    'lastName', // À enrichir
    'jobTitle', // À enrichir (rédac chef, journaliste, contenu, etc.)
    'domain',
    'tier',
    'dr',
    'trafficDomain',
    'priorityScore',
    'linkedCompetitors',
    'pitchAsset',
    'pitchHook',
    'pitchSubject',
    'contactPageUrl', // URL "Nous contacter" du domaine pour scraping email manuel
  ]

  const lines = [headers.join(',')]
  for (const r of selected) {
    const pitch = PITCH_BY_TIER[r.tier]
    lines.push(
      [
        '', // email (à enrichir)
        '', // firstName
        '', // lastName
        '', // jobTitle
        r.domain,
        r.tier,
        String(r.dr),
        String(r.trafficDomain),
        String(r.priorityScore),
        r.linkedCompetitors,
        pitch.asset,
        pitch.hook,
        pitch.subject,
        `https://${r.domain}/contact`,
      ]
        .map(escapeCsv)
        .join(',')
    )
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `outreach_lemlist_top${selected.length}.csv`)
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')

  console.log(`\n✅ Wrote ${outPath}`)
  console.log(`   ${selected.length} domains ready for contact enrichment.`)
  console.log(`\nNext steps:`)
  console.log(`  1. Marvin : enrichir colonnes email/firstName/lastName/jobTitle`)
  console.log(`     - Hunter.io : recherche par domain`)
  console.log(`     - Findymail : recherche par nom + entreprise`)
  console.log(`     - À défaut : visiter contactPageUrl manuellement`)
  console.log(`  2. Upload CSV à Lemlist (campagne "Backlinks Q2 2026 — Authority Pillar")`)
  console.log(
    `  3. Templates email : docs/audit-ahrefs-2026-05-03/D_backlinks/OUTREACH_BACKLINKS_PLAYBOOK.md`
  )
  console.log(`  4. Suivi Pipedrive pipeline "Backlinks Q2 2026"`)
}

main()
