/**
 * Sprint 4 vague 4 — Génération du fichier outreach Lemlist top 200 artisans
 * RGE non claimés, prêt à importer dans Lemlist.
 *
 * @ahrefs-rationale tmp/ahrefs/audit-vague4-2026-05-04.md
 *   Bottleneck supply : claim_rate 0.002% (19 / 970K). Outreach pro B2B ciblé
 *   sur les artisans à fort potentiel = ceux déjà visibles côté audience.
 *   Critères de tri : rating > review_count > rge_valid_until DESC pour
 *   maximiser la qualité des fiches activées en priorité.
 * @snapshot 2026-05-04
 *
 * Usage : tsx scripts/generate-outreach-top200.ts
 * Output :
 *   - tmp/outreach/lemlist-top200-{snapshot}.csv (importable Lemlist direct)
 *   - tmp/outreach/lemlist-top200-{snapshot}.json (debug + audit interne)
 *   - INSERT côté provider_outreach_log avec opt_out_token (single-use 32 bytes)
 *
 * Politique S3.0c (validée Marvin 2026-05-04) : RGPD pro B2B opt-out 1-clic
 * obligatoire en pied d'email, lien `/api/outreach/opt-out/[token]` vers RPC
 * `outreach_opt_out` (migration 500). Champ `unsubscribe_url` injecté dans
 * Lemlist pour personnalisation par destinataire.
 *
 * Filtres :
 *   - providers.user_id IS NULL          → fiche non claimée
 *   - providers.rge_valid_until > now()  → RGE actif (ADEME source officielle)
 *   - providers.email NOT NULL           → email présent (canal Lemlist)
 *   - providers.is_active = TRUE
 *   - exclu si déjà dans provider_outreach_log avec channel='lemlist'
 *     (évite le double-envoi sur run successif)
 *
 * Volume cible : 200 artisans / batch quotidien, configurable via LIMIT env.
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import crypto from 'node:crypto'

const LIMIT = Number(process.env.OUTREACH_LIMIT || 200)
const CAMPAIGN = process.env.OUTREACH_CAMPAIGN || 'rge-supply-activation-2026-05'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const SNAPSHOT = new Date().toISOString().slice(0, 10)

type ProviderRow = {
  id: string
  name: string | null
  email: string | null
  address_city: string | null
  address_region: string | null
  rating_average: number | null
  review_count: number | null
  rge_valid_until: string | null
}

function loadEnvFromDotenv(): { url: string; serviceRole: string } {
  const candidates = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '.env'),
    join(homedir(), '.secrets', 'servicesartisans.env'),
  ]
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  let serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  for (const path of candidates) {
    if (!existsSync(path)) continue
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const [k, ...rest] = line.split('=')
      if (!k) continue
      const value = rest.join('=').trim().replace(/^"|"$/g, '')
      if (k === 'NEXT_PUBLIC_SUPABASE_URL' && !url) url = value
      if (k === 'SUPABASE_SERVICE_ROLE_KEY' && !serviceRole) serviceRole = value
    }
    if (url && serviceRole) break
  }
  if (!url || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in env or dotenv files')
  }
  return { url, serviceRole }
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

async function main() {
  const { url, serviceRole } = loadEnvFromDotenv()
  const supabase = createClient(url, serviceRole)

  const nowIso = new Date().toISOString()

  // 1) Pool éligible : RGE actif + non claimé + email présent + actif
  const { data: candidates, error: fetchErr } = await supabase
    .from('providers')
    .select(
      'id, name, email, address_city, address_region, rating_average, review_count, rge_valid_until'
    )
    .is('user_id', null)
    .eq('is_active', true)
    .gt('rge_valid_until', nowIso)
    .not('email', 'is', null)
    .order('rating_average', { ascending: false, nullsFirst: false })
    .order('review_count', { ascending: false, nullsFirst: false })
    .order('rge_valid_until', { ascending: false })
    .limit(LIMIT * 3) // pull more to allow exclusion of already-contacted

  if (fetchErr) {
    throw new Error(`providers fetch failed: ${fetchErr.message}`)
  }

  if (!candidates || candidates.length === 0) {
    console.log('[outreach] no candidates, exiting')
    return
  }

  // 2) Exclusion : déjà contactés sur ce canal (anti-doublon batch successifs)
  const candidateIds = candidates.map((c: ProviderRow) => c.id)
  const { data: alreadyContacted } = await supabase
    .from('provider_outreach_log')
    .select('provider_id')
    .eq('channel', 'lemlist')
    .in('provider_id', candidateIds)

  const excluded = new Set((alreadyContacted ?? []).map((r) => r.provider_id))
  const fresh = candidates.filter((c: ProviderRow) => !excluded.has(c.id)).slice(0, LIMIT)

  console.log(
    `[outreach] candidates fetched=${candidates.length} excluded_already=${excluded.size} fresh=${fresh.length}`
  )

  if (fresh.length === 0) {
    console.log('[outreach] no fresh providers, exiting (all already contacted on this channel)')
    return
  }

  // 3) Génération token opt-out par destinataire (32 bytes URL-safe) + insert log
  type OutreachInsert = {
    provider_id: string
    channel: 'lemlist'
    campaign: string
    email_to: string
    sent_at: string
    status: 'sent'
    opt_out_token: string
    metadata: Record<string, unknown>
  }
  const inserts: OutreachInsert[] = fresh.map((p: ProviderRow) => ({
    provider_id: p.id,
    channel: 'lemlist',
    campaign: CAMPAIGN,
    email_to: (p.email || '').trim().toLowerCase(),
    sent_at: nowIso,
    status: 'sent',
    opt_out_token: crypto.randomBytes(32).toString('base64url'),
    metadata: {
      rating_average: p.rating_average,
      review_count: p.review_count,
      address_city: p.address_city,
      address_region: p.address_region,
      snapshot: SNAPSHOT,
    },
  }))

  const { error: insertErr } = await supabase.from('provider_outreach_log').insert(inserts)
  if (insertErr) {
    throw new Error(`outreach log insert failed: ${insertErr.message}`)
  }

  // 4) Export Lemlist CSV (colonnes attendues par l'import standard)
  const header =
    'email,first_name,company,city,region,unsubscribe_url,provider_id,campaign,snapshot\n'
  const lines = inserts.map((row, i) => {
    const provider = fresh[i]
    const unsubscribeUrl = `${SITE_URL}/api/outreach/opt-out/${row.opt_out_token}`
    const cells = [
      csvEscape(row.email_to),
      csvEscape((provider.name || '').split(' ')[0] || 'Bonjour'),
      csvEscape(provider.name || ''),
      csvEscape(provider.address_city || ''),
      csvEscape(provider.address_region || ''),
      csvEscape(unsubscribeUrl),
      csvEscape(provider.id),
      csvEscape(row.campaign),
      csvEscape(SNAPSHOT),
    ]
    return cells.join(',')
  })

  const outDir = join(process.cwd(), 'tmp', 'outreach')
  mkdirSync(outDir, { recursive: true })
  const csvPath = join(outDir, `lemlist-top200-${SNAPSHOT}.csv`)
  const jsonPath = join(outDir, `lemlist-top200-${SNAPSHOT}.json`)
  writeFileSync(csvPath, header + lines.join('\n') + '\n', 'utf8')
  writeFileSync(
    jsonPath,
    JSON.stringify({ snapshot: SNAPSHOT, campaign: CAMPAIGN, count: inserts.length }, null, 2),
    'utf8'
  )

  console.log(`[outreach] wrote ${inserts.length} rows → ${csvPath}`)
  console.log(`[outreach] log inserted in provider_outreach_log (campaign=${CAMPAIGN})`)
}

main().catch((err) => {
  console.error('[outreach] failed', err)
  process.exit(1)
})
