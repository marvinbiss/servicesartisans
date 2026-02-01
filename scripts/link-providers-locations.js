/**
 * Script pour lier les providers aux locations basé sur leur ville/code postal
 * Usage: node scripts/link-providers-locations.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

async function main() {
  console.log('=== Liaison Providers <-> Locations ===\n')

  // 1. Récupérer toutes les locations indexées par code postal et nom
  console.log('Chargement des locations...')

  // Fetch all locations in batches (Supabase limits to 1000)
  let allLocations = []
  let offset = 0
  const FETCH_SIZE = 1000

  while (true) {
    const { data: batch, error } = await supabase
      .from('locations')
      .select('id, name, postal_code, slug')
      .range(offset, offset + FETCH_SIZE - 1)

    if (error) {
      console.error('Erreur fetch locations:', error.message)
      break
    }

    if (!batch || batch.length === 0) break

    allLocations = allLocations.concat(batch)
    offset += FETCH_SIZE

    if (batch.length < FETCH_SIZE) break
  }

  const locations = allLocations
  const locErr = null

  if (locErr) {
    console.error('Erreur locations:', locErr.message)
    return
  }

  // Créer des index pour recherche rapide
  const locationByPostal = new Map()
  const locationByName = new Map()

  locations.forEach(loc => {
    if (loc.postal_code) {
      locationByPostal.set(loc.postal_code, loc)
    }
    if (loc.name) {
      const normalizedName = loc.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
      locationByName.set(normalizedName, loc)
    }
  })

  console.log(`${locations.length} locations chargees`)
  console.log(`${locationByPostal.size} avec code postal`)

  // 2. Récupérer les providers qui n'ont pas de liaison location
  const { data: linkedIds } = await supabase
    .from('provider_locations')
    .select('provider_id')

  const linkedSet = new Set(linkedIds?.map(l => l.provider_id) || [])
  console.log(`${linkedSet.size} providers deja lies a des locations`)

  // 3. Récupérer tous les providers (en batches)
  let allProviders = []
  offset = 0

  while (true) {
    const { data: batch, error } = await supabase
      .from('providers')
      .select('id, name, address_city, address_postal_code')
      .range(offset, offset + FETCH_SIZE - 1)

    if (error) {
      console.error('Erreur fetch providers:', error.message)
      break
    }

    if (!batch || batch.length === 0) break

    allProviders = allProviders.concat(batch)
    offset += FETCH_SIZE

    if (batch.length < FETCH_SIZE) break
  }

  const providers = allProviders
  const provErr = null

  if (provErr) {
    console.error('Erreur providers:', provErr.message)
    return
  }

  console.log(`${providers.length} providers trouves`)

  // 4. Filtrer ceux sans liaison
  const unlinked = providers.filter(p => !linkedSet.has(p.id))
  console.log(`${unlinked.length} providers sans liaison location\n`)

  if (unlinked.length === 0) {
    console.log('Tous les providers sont deja lies!')
    return
  }

  // 5. Trouver les locations correspondantes
  const links = []
  const notMatched = []

  for (const provider of unlinked) {
    let location = null

    // Essayer par code postal d'abord
    if (provider.address_postal_code) {
      location = locationByPostal.get(provider.address_postal_code)
    }

    // Sinon essayer par nom de ville
    if (!location && provider.address_city) {
      const normalizedCity = provider.address_city.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
      location = locationByName.get(normalizedCity)
    }

    if (location) {
      links.push({
        provider_id: provider.id,
        location_id: location.id,
        is_primary: true,
      })
    } else {
      notMatched.push({ name: provider.name, city: provider.address_city, postal: provider.address_postal_code })
    }
  }

  console.log(`${links.length} liaisons a creer`)
  console.log(`${notMatched.length} providers sans correspondance\n`)

  if (links.length === 0) {
    console.log('Aucune liaison a creer')
    if (notMatched.length > 0) {
      console.log('\nExemples sans correspondance:')
      notMatched.slice(0, 10).forEach(p => console.log(`  - ${p.name} (${p.city}, ${p.postal})`))
    }
    return
  }

  // 6. Insérer par batch
  const BATCH_SIZE = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from('provider_locations')
      .insert(batch)

    if (error) {
      console.error(`Batch erreur:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
    }

    const pct = Math.round(((i + batch.length) / links.length) * 100)
    process.stdout.write(`\r${pct}% (${inserted} inseres, ${errors} erreurs)`)
  }

  console.log('\n')
  console.log('=== Termine ===')
  console.log(`Liaisons creees: ${inserted}`)
  console.log(`Erreurs: ${errors}`)
  console.log(`Sans correspondance: ${notMatched.length}`)
}

main().catch(console.error)
