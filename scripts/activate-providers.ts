/**
 * 🚀 Activation des 305K artisans
 *
 * Ce script prépare et active les providers dans Supabase pour les rendre
 * visibles sur le site (sitemap, pages listing, pages profil).
 *
 * 5 étapes :
 *   1. Ajouter la colonne stable_id + backfill (HMAC-SHA256)
 *   2. Résoudre les codes INSEE → noms de villes (geo.api.gouv.fr)
 *   3. Lier providers → services (provider_services)
 *   4. Lier providers → locations (provider_locations)
 *   5. Activer noindex = false pour les providers complets
 *
 * Usage:
 *   npx tsx scripts/activate-providers.ts              # Exécution complète
 *   npx tsx scripts/activate-providers.ts --step 2     # Exécuter une étape spécifique
 *   npx tsx scripts/activate-providers.ts --dry-run    # Simulation sans écriture
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ============================================
// CONFIG
// ============================================

const STABLE_ID_SECRET = 'servicesartisans-stable-id-2024-prod'
const BATCH_SIZE = 500
const FETCH_SIZE = 1000

const DRY_RUN = process.argv.includes('--dry-run')
const STEP_ONLY = process.argv.includes('--step')
  ? parseInt(process.argv[process.argv.indexOf('--step') + 1], 10)
  : null

// Mapping specialty (from collect) → service slug (from france.ts)
const SPECIALTY_TO_SLUG: Record<string, string> = {
  'plombier': 'plombier',
  'electricien': 'electricien',
  'chauffagiste': 'chauffagiste',
  'menuisier': 'menuisier',
  'menuisier-metallique': 'menuisier',
  'carreleur': 'carreleur',
  'couvreur': 'couvreur',
  'macon': 'macon',
  'peintre': 'peintre-en-batiment',
  'charpentier': 'couvreur',
  'isolation': 'climaticien',
  'platrier': 'peintre-en-batiment',
  'finition': 'peintre-en-batiment',
}

// Stats
const stats = {
  step1: { checked: 0, columnAdded: false, backfilled: 0, errors: 0 },
  step2: { communesLoaded: 0, resolved: 0, alreadyOk: 0, errors: 0 },
  step3: { linked: 0, skipped: 0, alreadyLinked: 0, errors: 0 },
  step4: { linked: 0, notMatched: 0, alreadyLinked: 0, errors: 0 },
  step5: { activated: 0, total: 0 },
}

// ============================================
// HELPERS
// ============================================

function generateStableId(uuid: string): string {
  const hmac = createHmac('sha256', STABLE_ID_SECRET)
  hmac.update(uuid)
  return hmac.digest('base64url').substring(0, 16)
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchAllPages<T>(
  table: string,
  select: string,
  filters?: (query: any) => any,
): Promise<T[]> {
  const all: T[] = []
  let offset = 0

  while (true) {
    let query = supabase.from(table).select(select).range(offset, offset + FETCH_SIZE - 1)
    if (filters) query = filters(query)

    const { data, error } = await query

    if (error) {
      console.error(`  Fetch error at offset ${offset}:`, error.message)
      // Retry once after delay
      await sleep(5000)
      const { data: retry } = await query
      if (!retry || retry.length === 0) break
      all.push(...(retry as T[]))
      if (retry.length < FETCH_SIZE) break
      offset += FETCH_SIZE
      continue
    }

    if (!data || data.length === 0) break
    all.push(...(data as T[]))
    if (data.length < FETCH_SIZE) break
    offset += FETCH_SIZE

    // Progress log every 10K
    if (all.length % 10000 < FETCH_SIZE) {
      console.log(`  ... ${all.length} rows fetched`)
    }
  }

  return all
}

// ============================================
// STEP 1: STABLE_ID
// ============================================

async function step1_stableId() {
  console.log('\n📌 ÉTAPE 1: Vérifier/backfill stable_id\n')

  // Check if column exists by trying to select it
  const { error: colCheck } = await supabase
    .from('providers')
    .select('stable_id')
    .limit(1)

  if (colCheck && colCheck.message.includes('stable_id')) {
    console.log('  ⚠️  Colonne stable_id absente.')
    console.log('  ➡️  Vous devez l\'ajouter manuellement dans le SQL Editor de Supabase:')
    console.log('')
    console.log('  ALTER TABLE providers ADD COLUMN IF NOT EXISTS stable_id TEXT;')
    console.log('  CREATE INDEX IF NOT EXISTS idx_providers_stable_id ON providers(stable_id);')
    console.log('')
    console.log('  Puis relancez ce script.')
    stats.step1.columnAdded = false
    return false
  }

  console.log('  ✅ Colonne stable_id existe')

  // Fetch providers without stable_id
  console.log('  Recherche des providers sans stable_id...')
  const providers = await fetchAllPages<{ id: string; stable_id: string | null }>(
    'providers',
    'id, stable_id',
    (q: any) => q.is('stable_id', null),
  )

  console.log(`  ${providers.length} providers sans stable_id`)
  stats.step1.checked = providers.length

  if (providers.length === 0) {
    console.log('  ✅ Tous les providers ont un stable_id')
    return true
  }

  if (DRY_RUN) {
    console.log('  [DRY RUN] Simulation: génération de stable_id pour', providers.length, 'providers')
    const sample = providers.slice(0, 3)
    for (const p of sample) {
      console.log(`    ${p.id} → ${generateStableId(p.id)}`)
    }
    return true
  }

  // Batch update
  console.log(`  Backfill en cours (batch de ${BATCH_SIZE})...`)
  for (let i = 0; i < providers.length; i += BATCH_SIZE) {
    const batch = providers.slice(i, i + BATCH_SIZE)

    // Update one by one (Supabase doesn't support UPDATE with different values per row easily)
    for (const p of batch) {
      const stableId = generateStableId(p.id)
      const { error } = await supabase
        .from('providers')
        .update({ stable_id: stableId })
        .eq('id', p.id)

      if (error) {
        stats.step1.errors++
      } else {
        stats.step1.backfilled++
      }
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ... ${Math.min(i + BATCH_SIZE, providers.length)}/${providers.length} traités`)
    }

    // Rate limit: avoid overwhelming the DB
    await sleep(100)
  }

  console.log(`  ✅ Backfill terminé: ${stats.step1.backfilled} stable_id générés, ${stats.step1.errors} erreurs`)
  return true
}

// ============================================
// STEP 2: FIX ADDRESS_CITY (INSEE → city name)
// ============================================

async function step2_fixCity() {
  console.log('\n📌 ÉTAPE 2: Résoudre les codes INSEE → noms de villes\n')

  // Download all French communes
  console.log('  Téléchargement des communes françaises (geo.api.gouv.fr)...')
  const response = await fetch('https://geo.api.gouv.fr/communes?fields=code,nom&limit=50000')
  if (!response.ok) {
    console.error('  ❌ Erreur API geo:', response.statusText)
    return false
  }

  const communes: Array<{ code: string; nom: string }> = await response.json()
  const communeMap = new Map<string, string>()
  for (const c of communes) {
    communeMap.set(c.code, c.nom)
  }
  stats.step2.communesLoaded = communeMap.size
  console.log(`  ${communeMap.size} communes chargées`)

  // Fetch providers with numeric address_city (INSEE codes)
  console.log('  Recherche des providers avec code INSEE dans address_city...')
  const providers = await fetchAllPages<{ id: string; address_city: string }>(
    'providers',
    'id, address_city',
    (q: any) => q.not('address_city', 'is', null).eq('is_active', true),
  )

  console.log(`  ${providers.length} providers actifs avec address_city`)

  // Filter: only those with numeric codes (INSEE format: 5 digits)
  const toFix = providers.filter(p => /^\d{4,5}$/.test(p.address_city))
  const alreadyOk = providers.length - toFix.length
  stats.step2.alreadyOk = alreadyOk

  console.log(`  ${toFix.length} avec code INSEE à résoudre`)
  console.log(`  ${alreadyOk} déjà avec un nom de ville`)

  if (toFix.length === 0) {
    console.log('  ✅ Aucun code INSEE à résoudre')
    return true
  }

  if (DRY_RUN) {
    const sample = toFix.slice(0, 5)
    for (const p of sample) {
      const cityName = communeMap.get(p.address_city) || '???'
      console.log(`  [DRY RUN] ${p.address_city} → ${cityName}`)
    }
    return true
  }

  // Group by INSEE code for batch update
  const codeToIds = new Map<string, string[]>()
  for (const p of toFix) {
    const existing = codeToIds.get(p.address_city) || []
    existing.push(p.id)
    codeToIds.set(p.address_city, existing)
  }

  console.log(`  ${codeToIds.size} codes INSEE distincts`)
  console.log(`  Mise à jour en cours...`)

  let processed = 0
  for (const [inseeCode, ids] of Array.from(codeToIds.entries())) {
    const cityName = communeMap.get(inseeCode)
    if (!cityName) {
      stats.step2.errors += ids.length
      continue
    }

    // Update in batches
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE)
      const { error } = await supabase
        .from('providers')
        .update({ address_city: cityName })
        .in('id', batch)

      if (error) {
        stats.step2.errors += batch.length
      } else {
        stats.step2.resolved += batch.length
      }
    }

    processed++
    if (processed % 500 === 0) {
      console.log(`  ... ${processed}/${codeToIds.size} codes traités`)
      await sleep(50)
    }
  }

  console.log(`  ✅ ${stats.step2.resolved} providers mis à jour, ${stats.step2.errors} erreurs`)
  return true
}

// ============================================
// STEP 3: LINK PROVIDERS → SERVICES
// ============================================

async function step3_linkServices() {
  console.log('\n📌 ÉTAPE 3: Lier providers aux services\n')

  // Fetch all services
  const { data: services, error: svcErr } = await supabase
    .from('services')
    .select('id, slug, name')

  if (svcErr || !services) {
    console.error('  ❌ Erreur fetch services:', svcErr?.message)
    return false
  }

  const serviceBySlug = new Map<string, string>()
  for (const s of services) {
    serviceBySlug.set(s.slug, s.id)
  }
  console.log(`  ${services.length} services chargés`)

  // Fetch already linked provider IDs
  console.log('  Vérification des liaisons existantes...')
  const linkedProviders = await fetchAllPages<{ provider_id: string }>(
    'provider_services',
    'provider_id',
  )
  const linkedSet = new Set(linkedProviders.map(l => l.provider_id))
  stats.step3.alreadyLinked = linkedSet.size
  console.log(`  ${linkedSet.size} providers déjà liés`)

  // Fetch all providers with specialty
  console.log('  Chargement des providers...')
  const providers = await fetchAllPages<{ id: string; specialty: string }>(
    'providers',
    'id, specialty',
    (q: any) => q.eq('is_active', true).not('specialty', 'is', null),
  )

  console.log(`  ${providers.length} providers actifs avec spécialité`)

  // Filter unlinked
  const unlinked = providers.filter(p => !linkedSet.has(p.id))
  console.log(`  ${unlinked.length} à lier`)

  if (unlinked.length === 0) {
    console.log('  ✅ Tous les providers sont liés')
    return true
  }

  // Build links
  const links: Array<{ provider_id: string; service_id: string; is_primary: boolean }> = []
  for (const p of unlinked) {
    const slug = SPECIALTY_TO_SLUG[p.specialty.toLowerCase()]
    if (!slug) {
      stats.step3.skipped++
      continue
    }
    const serviceId = serviceBySlug.get(slug)
    if (!serviceId) {
      stats.step3.skipped++
      continue
    }
    links.push({ provider_id: p.id, service_id: serviceId, is_primary: true })
  }

  console.log(`  ${links.length} liaisons à créer (${stats.step3.skipped} sans mapping)`)

  if (DRY_RUN) {
    console.log('  [DRY RUN] Simulation:', links.length, 'inserts dans provider_services')
    return true
  }

  // Batch insert
  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('provider_services')
      .insert(batch)

    if (error) {
      stats.step3.errors += batch.length
      // Try individually on error
      for (const link of batch) {
        const { error: singleErr } = await supabase
          .from('provider_services')
          .insert(link)
        if (!singleErr) stats.step3.linked++
        else stats.step3.errors++
      }
      // Subtract the batch errors we already counted
      stats.step3.errors -= batch.length
    } else {
      stats.step3.linked += batch.length
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ... ${Math.min(i + BATCH_SIZE, links.length)}/${links.length}`)
    }
    await sleep(50)
  }

  console.log(`  ✅ ${stats.step3.linked} liaisons créées, ${stats.step3.errors} erreurs`)
  return true
}

// ============================================
// STEP 4: LINK PROVIDERS → LOCATIONS
// ============================================

async function step4_linkLocations() {
  console.log('\n📌 ÉTAPE 4: Lier providers aux locations\n')

  // Fetch all locations
  const { data: locations, error: locErr } = await supabase
    .from('locations')
    .select('id, name, slug, postal_code')

  if (locErr || !locations) {
    console.error('  ❌ Erreur fetch locations:', locErr?.message)
    return false
  }

  const locationByPostal = new Map<string, string>()
  const locationByName = new Map<string, string>()
  for (const loc of locations) {
    if (loc.postal_code) locationByPostal.set(loc.postal_code, loc.id)
    if (loc.name) locationByName.set(normalize(loc.name), loc.id)
  }
  console.log(`  ${locations.length} locations chargées (${locationByPostal.size} par code postal)`)

  // Fetch already linked
  const linkedProviders = await fetchAllPages<{ provider_id: string }>(
    'provider_locations',
    'provider_id',
  )
  const linkedSet = new Set(linkedProviders.map(l => l.provider_id))
  stats.step4.alreadyLinked = linkedSet.size
  console.log(`  ${linkedSet.size} providers déjà liés`)

  // Fetch providers
  console.log('  Chargement des providers...')
  const providers = await fetchAllPages<{
    id: string
    address_city: string | null
    address_postal_code: string | null
  }>(
    'providers',
    'id, address_city, address_postal_code',
    (q: any) => q.eq('is_active', true),
  )

  const unlinked = providers.filter(p => !linkedSet.has(p.id))
  console.log(`  ${unlinked.length} providers à lier`)

  if (unlinked.length === 0) {
    console.log('  ✅ Tous les providers sont liés')
    return true
  }

  // Match
  const links: Array<{ provider_id: string; location_id: string; is_primary: boolean }> = []
  for (const p of unlinked) {
    let locationId: string | undefined

    // 1. Match by postal code
    if (p.address_postal_code) {
      locationId = locationByPostal.get(p.address_postal_code)
    }

    // 2. Fallback: match by city name
    if (!locationId && p.address_city) {
      locationId = locationByName.get(normalize(p.address_city))
    }

    if (locationId) {
      links.push({ provider_id: p.id, location_id: locationId, is_primary: true })
    } else {
      stats.step4.notMatched++
    }
  }

  console.log(`  ${links.length} liaisons à créer`)
  console.log(`  ${stats.step4.notMatched} sans correspondance (ville hors top 141)`)

  if (DRY_RUN) {
    console.log('  [DRY RUN] Simulation:', links.length, 'inserts dans provider_locations')
    return true
  }

  // Batch insert
  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('provider_locations')
      .insert(batch)

    if (error) {
      stats.step4.errors += batch.length
      for (const link of batch) {
        const { error: singleErr } = await supabase
          .from('provider_locations')
          .insert(link)
        if (!singleErr) stats.step4.linked++
        else stats.step4.errors++
      }
      stats.step4.errors -= batch.length
    } else {
      stats.step4.linked += batch.length
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ... ${Math.min(i + BATCH_SIZE, links.length)}/${links.length}`)
    }
    await sleep(50)
  }

  console.log(`  ✅ ${stats.step4.linked} liaisons créées, ${stats.step4.errors} erreurs`)
  return true
}

// ============================================
// STEP 5: ACTIVATE (noindex = false)
// ============================================

async function step5_activate() {
  console.log('\n📌 ÉTAPE 5: Activer noindex = false\n')

  // Count providers that meet all criteria
  // We need: is_active, stable_id, specialty, address_city (non-numeric),
  // exists in provider_services, exists in provider_locations

  // Since Supabase REST doesn't support EXISTS easily, we:
  // 1. Get all provider_ids from provider_services
  // 2. Get all provider_ids from provider_locations
  // 3. Intersect with providers that have all fields
  // 4. Batch update noindex = false

  console.log('  Calcul des providers éligibles...')

  const [serviceLinked, locationLinked] = await Promise.all([
    fetchAllPages<{ provider_id: string }>('provider_services', 'provider_id'),
    fetchAllPages<{ provider_id: string }>('provider_locations', 'provider_id'),
  ])

  const serviceSet = new Set(serviceLinked.map(l => l.provider_id))
  const locationSet = new Set(locationLinked.map(l => l.provider_id))

  console.log(`  ${serviceSet.size} liés aux services`)
  console.log(`  ${locationSet.size} liés aux locations`)

  // Fetch providers with all required fields
  const providers = await fetchAllPages<{
    id: string
    stable_id: string | null
    specialty: string | null
    address_city: string | null
    noindex: boolean
  }>(
    'providers',
    'id, stable_id, specialty, address_city, noindex',
    (q: any) => q
      .eq('is_active', true)
      .not('stable_id', 'is', null)
      .not('specialty', 'is', null)
      .not('address_city', 'is', null),
  )

  console.log(`  ${providers.length} providers avec stable_id + specialty + city`)

  // Filter: must be in both services and locations, and city must not be numeric
  const eligible = providers.filter(p =>
    serviceSet.has(p.id) &&
    locationSet.has(p.id) &&
    p.address_city &&
    !/^\d+$/.test(p.address_city) &&
    p.noindex === true // only update those currently hidden
  )

  stats.step5.total = providers.length
  console.log(`  ${eligible.length} éligibles pour activation`)

  if (eligible.length === 0) {
    console.log('  ✅ Aucun provider à activer (déjà fait ou pas éligible)')
    return true
  }

  if (DRY_RUN) {
    console.log('  [DRY RUN] Simulation: activation de', eligible.length, 'providers')
    return true
  }

  // Batch update
  const ids = eligible.map(p => p.id)
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('providers')
      .update({ noindex: false })
      .in('id', batch)

    if (error) {
      console.error(`  Erreur batch ${i}:`, error.message)
    } else {
      stats.step5.activated += batch.length
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ... ${Math.min(i + BATCH_SIZE, ids.length)}/${ids.length}`)
    }
    await sleep(50)
  }

  console.log(`  ✅ ${stats.step5.activated} providers activés`)
  return true
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   ACTIVATION DES ARTISANS — 5 ÉTAPES    ║')
  console.log('╚══════════════════════════════════════════╝')

  if (DRY_RUN) {
    console.log('\n🏃 MODE DRY RUN — Aucune modification ne sera faite\n')
  }

  if (STEP_ONLY) {
    console.log(`\n▶ Exécution de l'étape ${STEP_ONLY} uniquement\n`)
  }

  const steps = [
    { num: 1, fn: step1_stableId, name: 'stable_id' },
    { num: 2, fn: step2_fixCity, name: 'fix address_city' },
    { num: 3, fn: step3_linkServices, name: 'link services' },
    { num: 4, fn: step4_linkLocations, name: 'link locations' },
    { num: 5, fn: step5_activate, name: 'activate noindex' },
  ]

  for (const step of steps) {
    if (STEP_ONLY && step.num !== STEP_ONLY) continue

    const start = Date.now()
    const ok = await step.fn()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    if (!ok) {
      console.log(`\n⚠️  Étape ${step.num} (${step.name}) a échoué après ${elapsed}s`)
      console.log('Arrêt du script. Corrigez le problème et relancez.')
      break
    }

    console.log(`  ⏱️  Étape ${step.num} terminée en ${elapsed}s`)
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║              RÉSUMÉ FINAL                ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`
  Étape 1 — stable_id:
    Vérifiés: ${stats.step1.checked}
    Backfillés: ${stats.step1.backfilled}
    Erreurs: ${stats.step1.errors}

  Étape 2 — Noms de villes:
    Communes chargées: ${stats.step2.communesLoaded}
    Résolus: ${stats.step2.resolved}
    Déjà OK: ${stats.step2.alreadyOk}
    Erreurs: ${stats.step2.errors}

  Étape 3 — Services:
    Liés: ${stats.step3.linked}
    Déjà liés: ${stats.step3.alreadyLinked}
    Sans mapping: ${stats.step3.skipped}
    Erreurs: ${stats.step3.errors}

  Étape 4 — Locations:
    Liés: ${stats.step4.linked}
    Déjà liés: ${stats.step4.alreadyLinked}
    Hors top 141: ${stats.step4.notMatched}
    Erreurs: ${stats.step4.errors}

  Étape 5 — Activation:
    Activés: ${stats.step5.activated} / ${stats.step5.total}
  `)
}

main().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message)
  process.exit(1)
})
