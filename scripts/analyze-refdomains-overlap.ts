/**
 * Chantier #A (2026-05-03) — Refdomains overlap analysis.
 *
 * Charge les refdomains_200.json des 5 concurrents (effy, france_renov, hellio,
 * selectra, sonergia) et identifie les domaines qui linkent vers ≥2 concurrents.
 * Ces domaines sont **chauds** : ils linkent déjà vers le secteur rénovation
 * énergétique → forte probabilité d'accepter un lien vers SA si on pitche bien.
 *
 * Filtres :
 *   - Exclure plateformes génériques (google, youtube, wikipedia, apple, …)
 *   - DR >= 25 (signal autorité minimum)
 *   - traffic_domain >= 1000 (au moins un peu de trafic réel)
 *   - is_spam = false
 *   - is_root_domain = true (pas de sous-domaine bizarre)
 *   - dofollow_links >= 1 (au moins 1 dofollow chez le concurrent — preuve qu'ils
 *     acceptent le dofollow vers ce secteur)
 *
 * Outputs in `docs/audit-ahrefs-2026-05-03/A_competitors/` :
 *   1. refdomains_overlap_top100.csv — top 100 domaines linkant vers ≥2 concurrents
 *   2. refdomains_solo_high_dr.csv — top 50 domaines DR≥40 chez UN seul concurrent
 *      (cible exclusive, pitch "élargissement panel rénovation énergétique")
 */
import * as fs from 'fs'
import * as path from 'path'

const AUDIT_DIR = path.join(process.cwd(), 'docs', 'audit-ahrefs-2026-05-03')
const COMPETITORS = ['effy', 'france_renov', 'hellio', 'selectra', 'sonergia'] as const

type RawRefdomain = {
  domain: string
  domain_rating: number
  traffic_domain: number
  first_seen: string | null
  dofollow_links: number
  is_spam: boolean
  is_root_domain: boolean
}

type AggregatedRow = {
  domain: string
  maxDr: number
  maxTraffic: number
  competitorsHit: string[]
  totalDofollow: number
  firstSeenMin: string
}

const EXCLUDE_GENERIC = new Set([
  'google.com',
  'youtube.com',
  'wikipedia.org',
  'apple.com',
  'amazon.com',
  'amazon.fr',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'instagram.com',
  'pinterest.com',
  'pinterest.fr',
  'tiktok.com',
  'reddit.com',
  'github.com',
  'stackoverflow.com',
  'medium.com',
  'wordpress.com',
  'blogspot.com',
  'squarespace.com',
  'shopify.com',
  'wix.com',
  'webflow.com',
  'goo.gl',
  'bit.ly',
  'tinyurl.com',
  'archive.org',
  'web.archive.org',
  'vimeo.com',
  'dailymotion.com',
  'discord.com',
  'twitch.tv',
])

const DR_MIN = 25
const TRAFFIC_MIN = 1000

function loadCompetitor(competitor: string): RawRefdomain[] {
  const file = path.join(AUDIT_DIR, 'A_competitors', competitor, 'refdomains_200.json')
  if (!fs.existsSync(file)) return []
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = JSON.parse(raw)
  const items = (parsed.refdomains as RawRefdomain[]) ?? []
  return items
}

function applyFilters(r: RawRefdomain): boolean {
  if (EXCLUDE_GENERIC.has(r.domain)) return false
  if ((r.domain_rating ?? 0) < DR_MIN) return false
  if ((r.traffic_domain ?? 0) < TRAFFIC_MIN) return false
  if (r.is_spam) return false
  if (!r.is_root_domain) return false
  if ((r.dofollow_links ?? 0) < 1) return false
  return true
}

function escapeCsv(v: string | number): string {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function main() {
  // 1. Aggrege par domaine
  const map = new Map<string, AggregatedRow>()
  for (const competitor of COMPETITORS) {
    const items = loadCompetitor(competitor)
    let kept = 0
    for (const r of items) {
      if (!applyFilters(r)) continue
      kept++
      const existing = map.get(r.domain)
      if (existing) {
        if (!existing.competitorsHit.includes(competitor)) {
          existing.competitorsHit.push(competitor)
        }
        existing.maxDr = Math.max(existing.maxDr, r.domain_rating ?? 0)
        existing.maxTraffic = Math.max(existing.maxTraffic, r.traffic_domain ?? 0)
        existing.totalDofollow += r.dofollow_links ?? 0
        if (r.first_seen && (!existing.firstSeenMin || r.first_seen < existing.firstSeenMin)) {
          existing.firstSeenMin = r.first_seen
        }
      } else {
        map.set(r.domain, {
          domain: r.domain,
          maxDr: r.domain_rating ?? 0,
          maxTraffic: r.traffic_domain ?? 0,
          competitorsHit: [competitor],
          totalDofollow: r.dofollow_links ?? 0,
          firstSeenMin: r.first_seen ?? '',
        })
      }
    }
    console.log(`Loaded ${competitor}: ${items.length} raw → ${kept} after filter`)
  }

  const allRows = Array.from(map.values())
  console.log(`\nTotal unique domains (after filter): ${allRows.length}`)

  // 2. Overlap : domaines linkant ≥2 concurrents
  const overlap = allRows
    .filter((r) => r.competitorsHit.length >= 2)
    .sort((a, b) => {
      // Tri par n_competitors DESC, puis maxDr DESC
      if (b.competitorsHit.length !== a.competitorsHit.length)
        return b.competitorsHit.length - a.competitorsHit.length
      return b.maxDr - a.maxDr
    })

  console.log(`\nDomains linking ≥2 concurrents : ${overlap.length}`)
  console.log(`  ≥3 concurrents : ${overlap.filter((r) => r.competitorsHit.length >= 3).length}`)
  console.log(`  ≥4 concurrents : ${overlap.filter((r) => r.competitorsHit.length >= 4).length}`)
  console.log(`  = 5 concurrents : ${overlap.filter((r) => r.competitorsHit.length === 5).length}`)

  // 3. Solo high-DR : domaines linkant 1 seul concurrent mais DR≥40 (cibles exclusives)
  const solo = allRows
    .filter((r) => r.competitorsHit.length === 1 && r.maxDr >= 40)
    .sort((a, b) => b.maxDr - a.maxDr)

  console.log(`\nDomains linking 1 concurrent only with DR≥40 : ${solo.length}`)

  // 4. Outputs
  const outDir = path.join(AUDIT_DIR, 'A_competitors')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Output 1 : overlap top 100
  const overlapHeaders = [
    'rank',
    'domain',
    'maxDr',
    'maxTraffic',
    'nCompetitors',
    'competitorsHit',
    'totalDofollowToCompetitors',
    'firstSeenMin',
    'pitchPriority',
  ]
  const overlapLines = [overlapHeaders.join(',')]
  overlap.slice(0, 100).forEach((r, i) => {
    const priority =
      r.competitorsHit.length >= 4 && r.maxDr >= 50
        ? 'tier_1_hot'
        : r.competitorsHit.length >= 3 && r.maxDr >= 40
          ? 'tier_2_warm'
          : 'tier_3_cold'
    overlapLines.push(
      [
        String(i + 1),
        r.domain,
        String(r.maxDr),
        String(r.maxTraffic),
        String(r.competitorsHit.length),
        r.competitorsHit.sort().join('|'),
        String(r.totalDofollow),
        r.firstSeenMin,
        priority,
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(
    path.join(outDir, 'refdomains_overlap_top100.csv'),
    overlapLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`\n✅ Wrote ${path.join(outDir, 'refdomains_overlap_top100.csv')}`)

  // Output 2 : solo high-DR top 50
  const soloHeaders = [
    'rank',
    'domain',
    'maxDr',
    'maxTraffic',
    'soleCompetitor',
    'dofollowLinks',
    'firstSeen',
    'pitchAngle',
  ]
  const soloLines = [soloHeaders.join(',')]
  solo.slice(0, 50).forEach((r, i) => {
    const angle =
      r.maxDr >= 60
        ? 'high_authority_press_or_inst'
        : r.maxDr >= 50
          ? 'sector_blog_or_directory'
          : 'specialized_btp_or_local'
    soloLines.push(
      [
        String(i + 1),
        r.domain,
        String(r.maxDr),
        String(r.maxTraffic),
        r.competitorsHit[0] ?? '',
        String(r.totalDofollow),
        r.firstSeenMin,
        angle,
      ]
        .map(escapeCsv)
        .join(',')
    )
  })
  fs.writeFileSync(
    path.join(outDir, 'refdomains_solo_high_dr.csv'),
    soloLines.join('\n') + '\n',
    'utf8'
  )
  console.log(`✅ Wrote ${path.join(outDir, 'refdomains_solo_high_dr.csv')}`)

  // 5. Distribution stats
  console.log('\n--- Top 10 hot leads (≥3 concurrents, DR DESC) ---')
  overlap.slice(0, 10).forEach((r, i) => {
    console.log(
      `  ${i + 1}. ${r.domain.padEnd(35)} DR=${r.maxDr.toString().padEnd(4)} ${r.competitorsHit.length}/5 concurrents (${r.competitorsHit.sort().join(', ')})`
    )
  })
}

main()
