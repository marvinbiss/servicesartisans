/**
 * Tier 0 bleeding stop 2026-05-04 — backfill `providers.address_region` NULL.
 *
 * @ahrefs-rationale tmp/ahrefs/AUDIT-KPMG-AGENT5-supply-funnel-2026-05-04.md
 *   Snapshot F4 daté 2026-05-03 montre 62,6 % `address_region` NULL sur les
 *   46 137 RGE actifs (~28 928 fiches). Casse outreach Lemlist (personnalisation
 *   région), dispatch RGE-aware (filtre region), Schema.org Place areaServed.
 *   Mig 498 prétend "100% normalisation 2026-05-03" mais c'est dans un commentaire,
 *   pas un UPDATE actif. Vraie source de vérité = ce script.
 *
 * Stratégie :
 *   1. SELECT providers WHERE address_region IS NULL AND address_postal_code IS NOT NULL
 *   2. Pour chaque ligne, déduire le code département via postal_code[:2]
 *      (les DROM-COM 97x/98x prennent les 3 premiers chiffres)
 *   3. Lookup region via mapping départements (france.ts)
 *   4. UPDATE par batch 500 avec idempotence (re-runnable)
 *
 * Usage : tsx scripts/backfill-address-region.ts [--dry-run] [--limit N]
 *
 * Idempotent : re-running ne touche que les NULL restants.
 */

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { departements } from '../src/lib/data/france'

const DRY_RUN = process.argv.includes('--dry-run')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const HARD_LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity
const BATCH_SIZE = 500

type ProviderRow = {
  id: string
  address_postal_code: string | null
}

function loadEnv(): { url: string; serviceRole: string } {
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
    throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY (.env.local or ~/.secrets)')
  }
  return { url, serviceRole }
}

function deptCodeFromPostal(postal: string): string | null {
  const trimmed = postal.replace(/\s/g, '')
  if (trimmed.length < 2) return null
  // DROM-COM (Guadeloupe 971, Martinique 972, Guyane 973, Réunion 974, Mayotte 976)
  if (trimmed.startsWith('97') || trimmed.startsWith('98')) {
    return trimmed.slice(0, 3)
  }
  // Corse 2A/2B → postal 200xx-201xx (Corse-du-Sud 2A) ou 202xx-206xx (Haute-Corse 2B)
  if (trimmed.startsWith('20')) {
    const num = Number.parseInt(trimmed.slice(0, 5), 10)
    if (num >= 20000 && num <= 20190) return '2A'
    if (num >= 20200 && num <= 20620) return '2B'
    return '20'
  }
  return trimmed.slice(0, 2)
}

const deptToRegion = new Map<string, string>()
for (const d of departements) {
  deptToRegion.set(d.code, d.region)
}

async function main() {
  const { url, serviceRole } = loadEnv()
  const supabase = createClient(url, serviceRole)

  console.log(`[backfill-region] mode=${DRY_RUN ? 'DRY-RUN' : 'WRITE'} batch=${BATCH_SIZE}`)
  console.log(`[backfill-region] mapping loaded: ${deptToRegion.size} départements`)

  let cursor = ''
  let scanned = 0
  let updated = 0
  let skippedNoPostal = 0
  let skippedUnknownDept = 0

  for (;;) {
    if (scanned >= HARD_LIMIT) break

    let query = supabase
      .from('providers')
      .select('id, address_postal_code')
      .is('address_region', null)
      .not('address_postal_code', 'is', null)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE)

    if (cursor) query = query.gt('id', cursor)

    const { data: rows, error } = await query
    if (error) {
      console.error('[backfill-region] fetch error:', error.message)
      process.exit(1)
    }

    const batch = (rows ?? []) as ProviderRow[]
    if (batch.length === 0) break

    type UpdatePayload = { id: string; region: string }
    const updates: UpdatePayload[] = []

    for (const row of batch) {
      scanned++
      const postal = row.address_postal_code?.trim()
      if (!postal) {
        skippedNoPostal++
        continue
      }
      const deptCode = deptCodeFromPostal(postal)
      if (!deptCode) {
        skippedNoPostal++
        continue
      }
      const region = deptToRegion.get(deptCode)
      if (!region) {
        skippedUnknownDept++
        continue
      }
      updates.push({ id: row.id, region })
    }

    if (!DRY_RUN && updates.length > 0) {
      // Updates groupés par région pour minimiser les round-trips.
      const byRegion = new Map<string, string[]>()
      for (const u of updates) {
        const arr = byRegion.get(u.region) ?? []
        arr.push(u.id)
        byRegion.set(u.region, arr)
      }
      for (const [region, ids] of byRegion) {
        const { error: updateErr } = await supabase
          .from('providers')
          .update({ address_region: region })
          .in('id', ids)
        if (updateErr) {
          console.error(`[backfill-region] update error region=${region}:`, updateErr.message)
          continue
        }
        updated += ids.length
      }
    } else if (DRY_RUN) {
      updated += updates.length
    }

    cursor = batch[batch.length - 1].id
    process.stdout.write(
      `\r[backfill-region] scanned=${scanned.toLocaleString('fr-FR')} updated=${updated.toLocaleString('fr-FR')} skipped_no_postal=${skippedNoPostal} skipped_unknown_dept=${skippedUnknownDept}`
    )
  }

  console.log(`\n[backfill-region] done.`)
  console.log(`  scanned: ${scanned.toLocaleString('fr-FR')}`)
  console.log(`  updated: ${updated.toLocaleString('fr-FR')}${DRY_RUN ? ' (DRY-RUN)' : ''}`)
  console.log(`  skipped (no/invalid postal): ${skippedNoPostal}`)
  console.log(`  skipped (unknown dept): ${skippedUnknownDept}`)
  if (skippedUnknownDept > 0) {
    console.log(`  → review providers with non-French postal codes`)
  }
}

main().catch((err) => {
  console.error('[backfill-region] failed', err)
  process.exit(1)
})
