/**
 * Script pour importer les donnees Google Places Crawler dans Supabase
 * Usage: node scripts/run-import-places.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Erreur: Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont definis dans .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Extract place_id from URL
function extractPlaceId(url) {
  if (!url) return null
  const match = url.match(/query_place_id=([^&]+)/)
  return match ? match[1] : null
}

// Generate SEO-friendly slug
function generateSlug(name, city) {
  const base = `${name}${city ? `-${city}` : ''}`
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

// Get region from department code
function getRegionFromDepartment(deptCode) {
  const regionMap = {
    '01': 'Auvergne-Rhone-Alpes', '03': 'Auvergne-Rhone-Alpes', '07': 'Auvergne-Rhone-Alpes',
    '15': 'Auvergne-Rhone-Alpes', '26': 'Auvergne-Rhone-Alpes', '38': 'Auvergne-Rhone-Alpes',
    '42': 'Auvergne-Rhone-Alpes', '43': 'Auvergne-Rhone-Alpes', '63': 'Auvergne-Rhone-Alpes',
    '69': 'Auvergne-Rhone-Alpes', '73': 'Auvergne-Rhone-Alpes', '74': 'Auvergne-Rhone-Alpes',
    '21': 'Bourgogne-Franche-Comte', '25': 'Bourgogne-Franche-Comte', '39': 'Bourgogne-Franche-Comte',
    '58': 'Bourgogne-Franche-Comte', '70': 'Bourgogne-Franche-Comte', '71': 'Bourgogne-Franche-Comte',
    '89': 'Bourgogne-Franche-Comte', '90': 'Bourgogne-Franche-Comte',
    '22': 'Bretagne', '29': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne',
    '18': 'Centre-Val de Loire', '28': 'Centre-Val de Loire', '36': 'Centre-Val de Loire',
    '37': 'Centre-Val de Loire', '41': 'Centre-Val de Loire', '45': 'Centre-Val de Loire',
    '08': 'Grand Est', '10': 'Grand Est', '51': 'Grand Est', '52': 'Grand Est',
    '54': 'Grand Est', '55': 'Grand Est', '57': 'Grand Est', '67': 'Grand Est', '68': 'Grand Est', '88': 'Grand Est',
    '02': 'Hauts-de-France', '59': 'Hauts-de-France', '60': 'Hauts-de-France', '62': 'Hauts-de-France', '80': 'Hauts-de-France',
    '75': 'Ile-de-France', '77': 'Ile-de-France', '78': 'Ile-de-France', '91': 'Ile-de-France',
    '92': 'Ile-de-France', '93': 'Ile-de-France', '94': 'Ile-de-France', '95': 'Ile-de-France',
    '14': 'Normandie', '27': 'Normandie', '50': 'Normandie', '61': 'Normandie', '76': 'Normandie',
    '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '19': 'Nouvelle-Aquitaine',
    '23': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '33': 'Nouvelle-Aquitaine',
    '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine', '64': 'Nouvelle-Aquitaine',
    '79': 'Nouvelle-Aquitaine', '86': 'Nouvelle-Aquitaine', '87': 'Nouvelle-Aquitaine',
    '09': 'Occitanie', '11': 'Occitanie', '12': 'Occitanie', '30': 'Occitanie', '31': 'Occitanie',
    '32': 'Occitanie', '34': 'Occitanie', '46': 'Occitanie', '48': 'Occitanie', '65': 'Occitanie', '66': 'Occitanie', '81': 'Occitanie', '82': 'Occitanie',
    '44': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire', '72': 'Pays de la Loire', '85': 'Pays de la Loire',
    '04': 'Provence-Alpes-Cote d\'Azur', '05': 'Provence-Alpes-Cote d\'Azur', '06': 'Provence-Alpes-Cote d\'Azur',
    '13': 'Provence-Alpes-Cote d\'Azur', '83': 'Provence-Alpes-Cote d\'Azur', '84': 'Provence-Alpes-Cote d\'Azur',
  }
  return regionMap[deptCode] || null
}

// Transform entry to provider format
function transformToProvider(entry) {
  if (!entry.title || entry.countryCode !== 'FR') {
    return null
  }

  const placeId = extractPlaceId(entry.url)
  // Add place_id suffix to ensure uniqueness
  const slugBase = generateSlug(entry.title, entry.city)
  const slugSuffix = placeId ? `-${placeId.slice(-6)}` : `-${Date.now().toString(36)}`
  const slug = (slugBase + slugSuffix).substring(0, 100)

  const category = entry.categoryName || (entry.categories && entry.categories[0]) || 'Artisan'

  // Truncate meta_description to 155 chars max (with ellipsis)
  let metaDesc = `${entry.title} - ${category} a ${entry.city || 'France'}`
  if (metaDesc.length > 155) {
    metaDesc = metaDesc.substring(0, 152) + '...'
  }

  return {
    name: entry.title.substring(0, 200), // Limit name length too
    slug,
    source: 'google_places',
    source_id: placeId,
    address_street: entry.street ? entry.street.substring(0, 200) : null,
    address_city: entry.city ? entry.city.substring(0, 100) : null,
    address_postal_code: null,
    address_region: null,
    address_department: null,
    latitude: null,
    longitude: null,
    phone: entry.phone ? entry.phone.substring(0, 20) : null,
    website: entry.website ? entry.website.substring(0, 255) : null,
    meta_description: metaDesc,
    is_verified: false,
    is_active: true,
    is_premium: false,
  }
}

async function main() {
  console.log('=== Import Google Places Crawler vers Supabase ===')
  console.log('')

  // Lire le fichier
  const filePath = path.join(__dirname, '..', 'dataset_crawler-google-places_2026-02-01_16-30-35-480.json')
  console.log(`Lecture: ${filePath}`)

  let data
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(content)
    console.log(`${data.length} entrees trouvees`)
  } catch (err) {
    console.error('Erreur lecture:', err.message)
    process.exit(1)
  }

  // Transformer
  console.log('Transformation...')
  const providers = data.map(transformToProvider).filter(Boolean)
  console.log(`${providers.length} providers valides`)

  // Deduplicate by slug
  const seenSlugs = new Set()
  const uniqueProviders = providers.filter(p => {
    if (seenSlugs.has(p.slug)) return false
    seenSlugs.add(p.slug)
    return true
  })
  console.log(`${uniqueProviders.length} providers uniques (apres deduplication)`)

  // Inserer par batch
  const BATCH_SIZE = 50
  let inserted = 0
  let errors = 0

  console.log('')
  console.log('Insertion...')

  for (let i = 0; i < uniqueProviders.length; i += BATCH_SIZE) {
    const batch = uniqueProviders.slice(i, i + BATCH_SIZE)

    const { error, data: result } = await supabase
      .from('providers')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH_SIZE)+1} erreur:`, error.message)
      errors += batch.length
    } else {
      inserted += result?.length || batch.length
    }

    // Progress
    const pct = Math.round(((i + batch.length) / uniqueProviders.length) * 100)
    process.stdout.write(`\r${pct}% (${inserted} inseres, ${errors} erreurs)`)
  }

  console.log('')
  console.log('')
  console.log('=== Termine ===')
  console.log(`Inseres: ${inserted}`)
  console.log(`Erreurs: ${errors}`)
}

main().catch(console.error)
