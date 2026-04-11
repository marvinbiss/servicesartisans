#!/usr/bin/env npx tsx
/**
 * Enrichit email + phone des providers depuis ADEME.
 * - Email : écrit si provider.email IS NULL et non-revendiqué
 * - Phone : écrit si provider.phone IS NULL, non-revendiqué, ET phone pas déjà pris
 *
 * Micro-batches de 30 SIRETs pour éviter les timeouts Supabase.
 *
 * Usage:
 *   npx tsx scripts/push-ademe-contacts.ts
 *   npx tsx scripts/push-ademe-contacts.ts --dry-run
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { fetchAllAdemeRows, aggregateBySiret } from '../src/lib/rge/sync'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DRY_RUN = process.argv.includes('--dry-run')
const MICRO = 30

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Set global de phones déjà utilisés en base (chargé au démarrage)
const usedPhones = new Set<string>()

async function loadUsedPhones() {
  console.log('→ Chargement des phones existants en base...')
  let from = 0
  const PAGE = 10000
  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('phone')
      .not('phone', 'is', null)
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('  Erreur chargement phones:', error.message)
      break
    }
    if (!data || data.length === 0) break
    for (const p of data) {
      if (p.phone) usedPhones.add(p.phone)
    }
    from += PAGE
    if (data.length < PAGE) break
  }
  console.log(`✓ ${usedPhones.size} phones existants chargés`)
}

async function main() {
  const t0 = Date.now()

  // 1. Charger les phones déjà en base (pour dedup)
  await loadUsedPhones()

  // 2. Fetch et agrège ADEME
  const rows = await fetchAllAdemeRows(Infinity, console)
  const { aggregated } = aggregateBySiret(rows, console)

  // 3. Collecter paires siret → {email, phone}
  interface Contact {
    siret: string
    email: string | null
    phone: string | null
  }
  const contacts: Contact[] = []
  for (const [siret, agg] of aggregated) {
    if (agg.email || agg.telephone) {
      contacts.push({ siret, email: agg.email, phone: agg.telephone })
    }
  }
  console.log(`\n→ ${contacts.length} SIRETs avec au moins un contact`)

  // 4. Traiter par micro-batch
  let emailsUpdated = 0
  let phonesUpdated = 0
  let errors = 0

  for (let i = 0; i < contacts.length; i += MICRO) {
    const batch = contacts.slice(i, i + MICRO)
    const sirets = batch.map((c) => c.siret)
    const contactMap = new Map(batch.map((c) => [c.siret, c]))

    // SELECT providers matchés sans email OU sans phone
    let providers: { id: string; siret: string; email: string | null; phone: string | null }[] = []
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('providers')
        .select('id, siret, email, phone')
        .in('siret', sirets)
        .is('claimed_at', null)
      if (!error && data) {
        providers = data as typeof providers
        break
      }
      if (error && error.code === '57014') {
        await sleep(1000 * (attempt + 1))
        continue
      }
      break
    }

    if (providers.length === 0) continue

    for (const p of providers) {
      const c = contactMap.get(p.siret!)
      if (!c) continue

      const updates: Record<string, string> = {}

      // Email : écrire si NULL
      if (!p.email && c.email) {
        updates.email = c.email
      }

      // Phone : écrire si NULL ET pas déjà pris
      if (!p.phone && c.phone && !usedPhones.has(c.phone)) {
        updates.phone = c.phone
        usedPhones.add(c.phone) // Marquer comme pris pour les batches suivants
      }

      if (Object.keys(updates).length === 0) continue

      if (DRY_RUN) {
        if (updates.email) emailsUpdated++
        if (updates.phone) phonesUpdated++
        continue
      }

      const { error } = await supabase.from('providers').update(updates).eq('id', p.id)

      if (error) {
        errors++
        // Si c'est un doublon phone, enlever du set et continuer
        if (error.message?.includes('idx_providers_phone_unique') && updates.phone) {
          usedPhones.add(updates.phone)
        }
      } else {
        if (updates.email) emailsUpdated++
        if (updates.phone) phonesUpdated++
      }
    }

    if (i % 3000 === 0) {
      const pct = ((i / contacts.length) * 100).toFixed(1)
      console.log(
        `  ${pct}% — ${emailsUpdated} emails, ${phonesUpdated} phones (errors: ${errors})`
      )
    }

    await sleep(50)
  }

  const duration = Math.round((Date.now() - t0) / 1000)
  console.log(`\n═══ Summary ═══`)
  console.log(`  Emails enriched : ${emailsUpdated}`)
  console.log(`  Phones enriched : ${phonesUpdated}`)
  console.log(`  Errors          : ${errors}`)
  console.log(`  Duration        : ${duration}s`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
