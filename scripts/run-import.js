/**
 * Script pour importer les donnees Google Maps dans Supabase
 * Usage: node scripts/run-import.js
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

// Fonctions utilitaires
function parseAddress(address) {
  const parts = address.split(',').map(p => p.trim())
  let street = null, city = null, postalCode = null

  if (parts.length >= 2) {
    street = parts[0]
    const cityPart = parts[1]
    const postalMatch = cityPart.match(/(\d{5})\s+(.+)/)
    if (postalMatch) {
      postalCode = postalMatch[1]
      city = postalMatch[2]
    } else {
      city = cityPart
    }
  }

  // Use short codes - the database expects varchar(3) for department
  const departmentCode = postalCode ? postalCode.substring(0, 2) : null
  const region = postalCode ? getRegionFromPostalCode(postalCode) : null

  return { street, city, postalCode, departmentCode, region }
}

function getDepartmentName(code) {
  const departments = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardeche', '08': 'Ardennes',
    '09': 'Ariege', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
    '13': 'Bouches-du-Rhone', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
    '17': 'Charente-Maritime', '18': 'Cher', '19': 'Correze',
    '21': 'Cote-d\'Or', '22': 'Cotes-d\'Armor', '23': 'Creuse',
    '24': 'Dordogne', '25': 'Doubs', '26': 'Drome', '27': 'Eure',
    '28': 'Eure-et-Loir', '29': 'Finistere', '30': 'Gard', '31': 'Haute-Garonne',
    '32': 'Gers', '33': 'Gironde', '34': 'Herault', '35': 'Ille-et-Vilaine',
    '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isere', '39': 'Jura',
    '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
    '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
    '48': 'Lozere', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
    '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
    '56': 'Morbihan', '57': 'Moselle', '58': 'Nievre', '59': 'Nord',
    '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dome',
    '64': 'Pyrenees-Atlantiques', '65': 'Hautes-Pyrenees', '66': 'Pyrenees-Orientales',
    '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhone', '70': 'Haute-Saone',
    '71': 'Saone-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
    '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
    '79': 'Deux-Sevres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
    '83': 'Var', '84': 'Vaucluse', '85': 'Vendee', '86': 'Vienne',
    '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
    '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
    '95': 'Val-d\'Oise',
  }
  return departments[code] || null
}

function getRegionFromPostalCode(postalCode) {
  const code = postalCode.substring(0, 2)
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
  return regionMap[code] || null
}

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

function mapCategory(category) {
  const categoryMap = {
    'Plumber': 'Plombier',
    'Electrician': 'Electricien',
    'Locksmith': 'Serrurier',
    'Heating contractor': 'Chauffagiste',
    'Air conditioning contractor': 'Climatisation',
    'Roofer': 'Couvreur',
    'Painter': 'Peintre',
    'Carpenter': 'Menuisier',
    'Mason': 'Macon',
    'Glazier': 'Vitrier',
    'Flooring contractor': 'Carreleur',
    'Kitchen remodeler': 'Cuisiniste',
    'Bathroom remodeler': 'Salle de bain',
    'General contractor': 'Entreprise generale',
    'Handyman': 'Bricolage',
  }
  return categoryMap[category] || category
}

function transformToProvider(entry) {
  if (entry.permanently_closed || !entry.lat || !entry.lon) {
    return null
  }

  const { street, city, postalCode, departmentCode, region } = parseAddress(entry.address || '')
  const slug = generateSlug(entry.name, city)

  let phone = entry.phone_number
  if (!phone && entry.business_details) {
    const phoneDetail = entry.business_details.find(d => d.field_name === 'call')
    if (phoneDetail) phone = phoneDetail.details
  }

  let website = entry.open_website
  if (!website && entry.business_details) {
    const webDetail = entry.business_details.find(d => d.field_name === 'public' && d.link)
    if (webDetail) website = webDetail.link
  }

  // Only use columns that exist in the providers table schema
  return {
    name: entry.name,
    slug,
    source: 'google_maps',
    source_id: entry.place_id,
    address_street: street,
    address_city: city,
    address_postal_code: postalCode,
    address_region: region,
    address_department: departmentCode,
    latitude: entry.lat,
    longitude: entry.lon,
    phone,
    website,
    meta_description: entry.description || `${entry.name} - ${mapCategory(entry.category)} a ${city || 'France'}`,
    is_verified: false,
    is_active: true,
    is_premium: false,
  }
}

async function main() {
  console.log('=== Import Google Maps vers Supabase ===')
  console.log('')

  // Lire le fichier
  const filePath = path.join(__dirname, '..', 'Google Maps full information.json')
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

  // Inserer par batch
  const BATCH_SIZE = 50
  let inserted = 0
  let errors = 0

  console.log('')
  console.log('Insertion...')

  // Deduplicate by slug to avoid conflicts
  const seenSlugs = new Set()
  const uniqueProviders = providers.filter(p => {
    if (seenSlugs.has(p.slug)) return false
    seenSlugs.add(p.slug)
    return true
  })
  console.log(`${uniqueProviders.length} providers uniques (apres deduplication)`)

  for (let i = 0; i < uniqueProviders.length; i += BATCH_SIZE) {
    const batch = uniqueProviders.slice(i, i + BATCH_SIZE)

    const { error, data } = await supabase
      .from('providers')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH_SIZE)+1} erreur:`, error.message)
      errors += batch.length
    } else {
      inserted += data?.length || batch.length
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
