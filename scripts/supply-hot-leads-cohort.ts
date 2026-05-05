#!/usr/bin/env npx tsx
/**
 * supply-hot-leads-cohort.ts
 * --------------------------
 * Identifie les providers les plus chauds pour outreach claim :
 * ceux qui ont reçu ≥1 lead_assignment dans les 90 derniers jours
 * mais ne sont pas claimés (user_id IS NULL).
 *
 * Pitch : "Vous avez reçu N leads via ServicesArtisans dans les 30 derniers
 * jours. Claim votre fiche pour les consulter avant expiration."
 *
 * 10x plus fort que pitch RGE générique : c'est de la valeur déjà créée,
 * pas de la promesse future. Conversion claim attendue 5-15% vs <1%
 * pour outreach cold RGE.
 *
 * Output : `docs/supply/hot-leads-cohort-<date>.csv` (gitignored).
 *
 * Usage :
 *   npx tsx scripts/supply-hot-leads-cohort.ts            # summary console
 *   npx tsx scripts/supply-hot-leads-cohort.ts --write    # écrit le CSV
 *   npx tsx scripts/supply-hot-leads-cohort.ts --days 30  # fenêtre custom
 */

import * as fs from 'fs'
import * as path from 'path'
import { supabase } from './lib/supabase-admin'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const daysFlag = process.argv.findIndex((a) => a === '--days')
const DAYS_WINDOW = daysFlag >= 0 ? parseInt(process.argv[daysFlag + 1] ?? '90', 10) : 90

if (!Number.isFinite(DAYS_WINDOW) || DAYS_WINDOW < 1 || DAYS_WINDOW > 365) {
  console.error('--days must be 1-365')
  process.exit(1)
}

const SITE_URL = 'https://servicesartisans.fr'
const OUT_DIR = path.join(process.cwd(), 'docs', 'supply')

async function main() {
  const cutoff = new Date(Date.now() - DAYS_WINDOW * 24 * 60 * 60 * 1000).toISOString()

  console.log(
    `\n📊 Hot leads cohort — providers non-claimés avec leads reçus depuis ${DAYS_WINDOW}j`
  )
  console.log(`   cutoff : ${cutoff}\n`)

  // Step 1 — récupérer les provider_id avec ≥1 assignment depuis le cutoff
  // (pas de DISTINCT côté Supabase JS, on agrège côté client).
  const { data: assignments, error: aErr } = await supabase
    .from('lead_assignments')
    .select('provider_id, status, assigned_at')
    .gte('assigned_at', cutoff)

  if (aErr) {
    console.error('Erreur lead_assignments :', aErr.message)
    process.exit(1)
  }

  if (!assignments || assignments.length === 0) {
    console.log('   Aucun assignment dans la fenêtre. Stop.\n')
    return
  }

  // Agréger par provider_id : count + last_assigned + has_pending
  const byProvider = new Map<
    string,
    { count: number; lastAssigned: string; hasPending: boolean; hasViewed: boolean }
  >()
  for (const a of assignments) {
    const existing = byProvider.get(a.provider_id) ?? {
      count: 0,
      lastAssigned: a.assigned_at,
      hasPending: false,
      hasViewed: false,
    }
    existing.count += 1
    if (a.assigned_at > existing.lastAssigned) existing.lastAssigned = a.assigned_at
    if (a.status === 'pending') existing.hasPending = true
    if (a.status === 'viewed') existing.hasViewed = true
    byProvider.set(a.provider_id, existing)
  }

  console.log(`   ${byProvider.size} providers distincts ont reçu des leads.\n`)

  // Step 2 — récupérer les providers non-claimés (user_id IS NULL) avec contact info
  const providerIds = Array.from(byProvider.keys())
  const BATCH = 200
  const candidates: Array<{
    id: string
    name: string
    email: string | null
    phone: string | null
    city: string | null
    region: string | null
    siret: string | null
    leadsCount: number
    lastAssigned: string
    hasPending: boolean
    fiche_url: string
  }> = []

  for (let i = 0; i < providerIds.length; i += BATCH) {
    const slice = providerIds.slice(i, i + BATCH)
    const { data: providers, error: pErr } = await supabase
      .from('providers')
      .select(
        'id, name, slug, stable_id, email, phone, address_city, address_region, siret, user_id, is_active'
      )
      .in('id', slice)
      .is('user_id', null)
      .eq('is_active', true)

    if (pErr) {
      console.error('Erreur providers batch :', pErr.message)
      continue
    }

    for (const p of providers ?? []) {
      const agg = byProvider.get(p.id)!
      const hasContact = !!(p.email || p.phone)
      if (!hasContact) continue
      // URL canonical fiche : /artisan/<stable_id>/<slug> (pattern SA)
      const ficheUrl = p.stable_id
        ? `${SITE_URL}/artisan/${p.stable_id}/${p.slug ?? 'fiche'}`
        : `${SITE_URL}/artisan/${p.id}`
      candidates.push({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        city: p.address_city,
        region: p.address_region,
        siret: p.siret,
        leadsCount: agg.count,
        lastAssigned: agg.lastAssigned,
        hasPending: agg.hasPending,
        fiche_url: ficheUrl,
      })
    }
  }

  // Sort by hottest : pending leads first, then highest count, then most recent
  candidates.sort((a, b) => {
    if (a.hasPending !== b.hasPending) return a.hasPending ? -1 : 1
    if (a.leadsCount !== b.leadsCount) return b.leadsCount - a.leadsCount
    return b.lastAssigned.localeCompare(a.lastAssigned)
  })

  console.log(`📋 Cohort hot leads :`)
  console.log(`   Candidats avec contact (email|phone)  : ${candidates.length}`)
  console.log(
    `   Avec ≥1 lead pending (jamais vu)      : ${candidates.filter((c) => c.hasPending).length}`
  )
  console.log(
    `   Avec email                            : ${candidates.filter((c) => c.email).length}`
  )
  console.log(
    `   Avec phone (no email)                 : ${candidates.filter((c) => c.phone && !c.email).length}`
  )
  console.log(
    `   Total leads dans la cohorte           : ${candidates.reduce((s, c) => s + c.leadsCount, 0)}`
  )
  console.log()
  console.log(`   Top 10 par hotness :`)
  for (const c of candidates.slice(0, 10)) {
    console.log(
      `     - ${c.name.padEnd(40)} ${c.city?.padEnd(20) ?? '—'.padEnd(20)} leads=${c.leadsCount} pending=${c.hasPending} email=${c.email ? '✓' : '✗'}`
    )
  }
  console.log()

  if (write) {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
    const date = new Date().toISOString().slice(0, 10)
    const outFile = path.join(OUT_DIR, `hot-leads-cohort-${date}.csv`)
    const header = [
      'provider_id',
      'name',
      'siret',
      'email',
      'phone',
      'city',
      'region',
      'leads_count',
      'has_pending',
      'last_assigned',
      'fiche_url',
    ].join(',')
    const rows = candidates.map((c) =>
      [
        c.id,
        csvEscape(c.name),
        c.siret ?? '',
        c.email ?? '',
        c.phone ?? '',
        csvEscape(c.city ?? ''),
        csvEscape(c.region ?? ''),
        String(c.leadsCount),
        c.hasPending ? 'true' : 'false',
        c.lastAssigned,
        c.fiche_url,
      ].join(',')
    )
    fs.writeFileSync(outFile, [header, ...rows].join('\n'), 'utf8')
    console.log(`   ✅ CSV écrit : ${outFile} (${candidates.length} lignes)\n`)
  } else {
    console.log(`   ℹ️  Run avec --write pour générer le CSV.\n`)
  }
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
