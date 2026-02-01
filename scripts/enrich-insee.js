/**
 * Script pour enrichir les providers avec les données INSEE/SIRENE
 * Utilise l'API recherche-entreprises.fabrique.social.gouv.fr
 * Usage: node scripts/enrich-insee.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// API Config
const API_BASE = 'https://recherche-entreprises.api.gouv.fr'
const RATE_LIMIT_DELAY = 200 // ms entre les requêtes

// Mapping tranches effectifs
const TRANCHES_EFFECTIFS = {
  '00': { min: 0, max: 0 },
  '01': { min: 1, max: 2 },
  '02': { min: 3, max: 5 },
  '03': { min: 6, max: 9 },
  '11': { min: 10, max: 19 },
  '12': { min: 20, max: 49 },
  '21': { min: 50, max: 99 },
  '22': { min: 100, max: 199 },
  '31': { min: 200, max: 249 },
  '32': { min: 250, max: 499 },
  '41': { min: 500, max: 999 },
  '42': { min: 1000, max: 1999 },
  '51': { min: 2000, max: 4999 },
  '52': { min: 5000, max: 9999 },
  '53': { min: 10000, max: 99999 },
}

// Rechercher une entreprise par nom et ville
async function searchEnterprise(name, city, department) {
  const searchTerm = `${name}`.substring(0, 50)

  const params = new URLSearchParams({
    q: searchTerm,
    etat_administratif: 'A',
    per_page: '5',
  })

  if (department) {
    params.set('departement', department)
  }

  // Filtrer sur section F (Construction) pour les artisans du bâtiment
  params.set('section_activite_principale', 'F')

  const url = `${API_BASE}/search?${params.toString()}`

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit - attendre
        await new Promise(r => setTimeout(r, 60000))
        return searchEnterprise(name, city, department)
      }
      return null
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return null
    }

    // Trouver le meilleur match (même ville si possible)
    const normalizedCity = city?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')

    for (const result of data.results) {
      const resultCity = result.siege?.libelle_commune?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')

      if (!city || !resultCity || resultCity.includes(normalizedCity) || normalizedCity.includes(resultCity)) {
        return result
      }
    }

    // Sinon retourner le premier résultat
    return data.results[0]

  } catch (error) {
    console.error(`Erreur recherche ${name}:`, error.message)
    return null
  }
}

// Extraire les données INSEE d'un résultat
function extractInseeData(result) {
  if (!result) return null

  const tranche = result.tranche_effectif_salarie
  const effectif = tranche && TRANCHES_EFFECTIFS[tranche]
    ? Math.round((TRANCHES_EFFECTIFS[tranche].min + TRANCHES_EFFECTIFS[tranche].max) / 2)
    : null

  return {
    siret: result.siege?.siret || null,
    siren: result.siren || null,
    legal_form: result.nature_juridique || null,
    creation_date: result.date_creation || null,
    employee_count: effectif,
    // Coordonnées GPS si disponibles
    latitude: result.siege?.latitude ? parseFloat(result.siege.latitude) : null,
    longitude: result.siege?.longitude ? parseFloat(result.siege.longitude) : null,
  }
}

async function main() {
  console.log('=== Enrichissement INSEE/SIRENE ===\n')

  // 1. Récupérer les providers sans SIRET
  console.log('Chargement des providers sans SIRET...')

  let allProviders = []
  let offset = 0
  const FETCH_SIZE = 1000

  while (true) {
    const { data: batch, error } = await supabase
      .from('providers')
      .select('id, name, address_city, address_department, address_postal_code')
      .is('siret', null)
      .or('source.eq.google_maps,source.eq.google_places')
      .range(offset, offset + FETCH_SIZE - 1)

    if (error) {
      console.error('Erreur:', error.message)
      break
    }

    if (!batch || batch.length === 0) break
    allProviders = allProviders.concat(batch)
    offset += FETCH_SIZE
    if (batch.length < FETCH_SIZE) break
  }

  console.log(`${allProviders.length} providers a enrichir\n`)

  if (allProviders.length === 0) {
    console.log('Tous les providers ont deja un SIRET!')
    return
  }

  // 2. Enrichir chaque provider
  let enriched = 0
  let notFound = 0
  let errors = 0

  for (let i = 0; i < allProviders.length; i++) {
    const provider = allProviders[i]

    // Afficher la progression
    if (i % 50 === 0) {
      const pct = Math.round((i / allProviders.length) * 100)
      console.log(`${pct}% - ${enriched} enrichis, ${notFound} non trouves, ${errors} erreurs`)
    }

    // Rechercher dans l'API SIRENE
    const result = await searchEnterprise(
      provider.name,
      provider.address_city,
      provider.address_department || provider.address_postal_code?.substring(0, 2)
    )

    // Attendre pour respecter le rate limit
    await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY))

    if (!result) {
      notFound++
      continue
    }

    const inseeData = extractInseeData(result)

    if (!inseeData || !inseeData.siret) {
      notFound++
      continue
    }

    // Mettre à jour le provider
    const updateData = {
      siret: inseeData.siret,
      siren: inseeData.siren,
      legal_form: inseeData.legal_form,
      creation_date: inseeData.creation_date,
      employee_count: inseeData.employee_count,
    }

    // Ajouter les coordonnées si manquantes
    if (inseeData.latitude && !provider.latitude) {
      updateData.latitude = inseeData.latitude
      updateData.longitude = inseeData.longitude
    }

    const { error: updateError } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', provider.id)

    if (updateError) {
      console.error(`Erreur update ${provider.name}:`, updateError.message)
      errors++
    } else {
      enriched++
    }
  }

  console.log('\n=== Termine ===')
  console.log(`Enrichis: ${enriched}`)
  console.log(`Non trouves: ${notFound}`)
  console.log(`Erreurs: ${errors}`)
}

main().catch(console.error)
