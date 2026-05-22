/**
 * Gate Sprint 5 — Embeds Tier 1 (baromètre rénovation 2026).
 *
 * Deux signaux convergents :
 *   (a) Ahrefs `/v3/site-explorer/refdomains` sur la page baromètre. Compte
 *       les domaines référents avec DR ≥ 50 (Tier 1). Source officielle de
 *       vérité backlinks acquis dans la nature.
 *   (b) Parse `docs/outreach/sprint5-tracking.md` (tableau Markdown du suivi
 *       outreach). Compte les lignes dont la colonne `status` = "live".
 *       Source de vérité interne, plus rapide qu'Ahrefs (delay 1-7j).
 *
 * Sortie JSON : les deux compteurs + statut PASS si ≥ 1 embed Tier 1 ET
 * outreach_live ≥ 3 (cible mini Sprint 5 — 12 médias visés au pitch).
 *
 * Variables d'env :
 *   AHREFS_API_TOKEN       token Ahrefs (fallback : `~/.secrets/ahrefs.env`)
 *   AHREFS_TOKEN_FILE      chemin custom du fichier token
 *   SPRINT5_TARGET_URL     URL audit Ahrefs (défaut page baromètre)
 *   SPRINT5_TRACKING_MD    chemin tracking (défaut docs/outreach/sprint5-tracking.md)
 *   SPRINT5_TIER1_TARGET   cible refdomains DR≥50 (défaut 1)
 *   SPRINT5_LIVE_TARGET    cible outreach live (défaut 3)
 *
 * Sortie : tmp/gate-s5-{ISO}.json
 *
 * Usage :
 *   npx tsx scripts/gates/sprint5-embeds-tier1.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')

const TARGET_URL =
  process.env.SPRINT5_TARGET_URL ??
  'https://servicesartisans.fr/barometre/renovation-energetique-2026'
const TRACKING_MD =
  process.env.SPRINT5_TRACKING_MD ?? path.join(REPO_ROOT, 'docs', 'outreach', 'sprint5-tracking.md')
const TIER1_TARGET = Number(process.env.SPRINT5_TIER1_TARGET ?? '1')
const LIVE_TARGET = Number(process.env.SPRINT5_LIVE_TARGET ?? '3')
const DR_TIER1_MIN = 50

type RefDomain = {
  domain: string
  domain_rating: number
  first_seen: string | null
}

type AhrefsResponse = {
  refdomains?: RefDomain[]
}

type GateResult = {
  gate: 'S5'
  metric: 'sprint5_embeds_tier1'
  current: number
  baseline: number
  delta_pct: number
  target_pct: number
  passed: boolean
  checked_at: string
  notes: string
  details: {
    ahrefs_tier1_refdomains: number
    outreach_live: number
    tier1_target: number
    live_target: number
    tier1_examples: string[]
  }
}

function readAhrefsToken(): string {
  if (process.env.AHREFS_API_TOKEN) return process.env.AHREFS_API_TOKEN.trim()
  const candidates = [
    process.env.AHREFS_TOKEN_FILE,
    '/c/Users/USER/.secrets/ahrefs.env',
    'C:\\Users\\USER\\.secrets\\ahrefs.env',
    path.join(process.env.USERPROFILE ?? '', '.secrets', 'ahrefs.env'),
    path.join(process.env.HOME ?? '', '.secrets', 'ahrefs.env'),
  ].filter((p): p is string => typeof p === 'string' && p.length > 0)
  for (const f of candidates) {
    try {
      const t = fs.readFileSync(f, 'utf8').trim()
      if (t) return t
    } catch {
      /* try next */
    }
  }
  throw new Error(
    `Token Ahrefs introuvable. Set AHREFS_API_TOKEN ou place le token dans ~/.secrets/ahrefs.env`
  )
}

async function fetchTier1Refdomains(): Promise<{ count: number; examples: string[] }> {
  const token = readAhrefsToken()
  const url = new URL('https://api.ahrefs.com/v3/site-explorer/refdomains')
  url.searchParams.set('target', TARGET_URL)
  url.searchParams.set('mode', 'exact')
  url.searchParams.set('limit', '1000')
  url.searchParams.set(
    'select',
    'domain,domain_rating,first_seen,dofollow_links_to_target,traffic_domain'
  )
  url.searchParams.set('order_by', 'domain_rating:desc')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) {
    throw new Error(`Ahrefs API HTTP ${res.status} : ${await res.text().catch(() => '')}`)
  }
  const json = (await res.json()) as AhrefsResponse
  const tier1 = (json.refdomains ?? []).filter((r) => (r.domain_rating ?? 0) >= DR_TIER1_MIN)
  return {
    count: tier1.length,
    examples: tier1.slice(0, 10).map((r) => `${r.domain} (DR ${r.domain_rating})`),
  }
}

function countOutreachLive(filePath: string): number {
  if (!fs.existsSync(filePath)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[gate-s5] tracking absent : ${filePath} — fallback 0. Créer le tableau Markdown ` +
        `avec une colonne "status" pour activer le compteur.`
    )
    return 0
  }
  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split(/\r?\n/)

  // Find the first table header containing "status".
  let headerIdx = -1
  let statusCol = -1
  for (let i = 0; i < lines.length - 1; i++) {
    const cols = lines[i].split('|').map((c) => c.trim().toLowerCase())
    if (cols.some((c) => c === 'status')) {
      const sepLine = lines[i + 1] ?? ''
      if (/^\s*\|?\s*:?-+/.test(sepLine)) {
        headerIdx = i
        statusCol = cols.findIndex((c) => c === 'status')
        break
      }
    }
  }
  if (headerIdx === -1 || statusCol === -1) return 0

  let liveCount = 0
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const row = lines[i]
    if (!row.trim().startsWith('|')) break
    const cols = row.split('|').map((c) => c.trim().toLowerCase())
    if ((cols[statusCol] ?? '') === 'live') liveCount += 1
  }
  return liveCount
}

async function main(): Promise<void> {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  let tier1Count = 0
  let tier1Examples: string[] = []
  let notes = ''
  try {
    const { count, examples } = await fetchTier1Refdomains()
    tier1Count = count
    tier1Examples = examples
    notes = `Ahrefs OK. Tier1 = DR ≥ ${DR_TIER1_MIN} sur ${TARGET_URL}.`
  } catch (err) {
    notes = `ECHEC Ahrefs : ${(err as Error).message}`
    // eslint-disable-next-line no-console
    console.error(notes)
  }

  const liveCount = countOutreachLive(TRACKING_MD)
  const passed = tier1Count >= TIER1_TARGET && liveCount >= LIVE_TARGET

  const result: GateResult = {
    gate: 'S5',
    metric: 'sprint5_embeds_tier1',
    current: tier1Count,
    baseline: TIER1_TARGET,
    delta_pct: 0,
    target_pct: 0,
    passed,
    checked_at: new Date().toISOString(),
    notes,
    details: {
      ahrefs_tier1_refdomains: tier1Count,
      outreach_live: liveCount,
      tier1_target: TIER1_TARGET,
      live_target: LIVE_TARGET,
      tier1_examples: tier1Examples,
    },
  }

  const outPath = path.join(TMP_DIR, `gate-s5-${result.checked_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2))
  // eslint-disable-next-line no-console
  console.log(
    `\nGate S5 ${passed ? 'PASS' : 'FAIL'} — Ahrefs Tier1 ${tier1Count}/${TIER1_TARGET}, ` +
      `outreach live ${liveCount}/${LIVE_TARGET}. Résultat dans ${outPath}`
  )

  if (!passed) process.exit(1)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[gate-s5] FATAL :', err)
  process.exit(2)
})
