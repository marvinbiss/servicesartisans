/**
 * Script d'import des donnees Google Maps vers Supabase
 * Execute avec: npx ts-node scripts/import-google-maps.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Types
interface GoogleMapsEntry {
  place_id: string
  url: string
  country: string
  name: string
  category: string
  address: string
  description: string | null
  business_details: Array<{
    details: string
    field_name: string
    link: string | null
  }>
  open_hours: Record<string, string> | null
  reviews_count: number
  rating: number
  main_image: string | null
  lat: number
  lon: number
  services_provided: string[] | null
  open_website: string | null
  phone_number: string | null
  permanently_closed: boolean
  photos_and_videos: string[] | null
}

interface Provider {
  name: string
  slug: string
  source: string
  source_id: string
  source_url: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_region: string | null
  address_department: string | null
  address_country: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  meta_description: string | null
  rating_average: number | null
  review_count: number
  is_verified: boolean
  is_active: boolean
  is_premium: boolean
  open_hours: Record<string, string> | null
  photos: string[] | null
  services_list: string[] | null
}

// Fonction pour parser l'adresse francaise
function parseAddress(address: string): {
  street: string | null
  city: string | null
  postalCode: string | null
  department: string | null
  region: string | null
} {
  // Format: "5 Rue des Nacelles, 34540 Balaruc-les-Bains, France"
  const parts = address.split(',').map(p => p.trim())

  let street: string | null = null
  let city: string | null = null
  let postalCode: string | null = null

  if (parts.length >= 2) {
    street = parts[0]

    // Chercher le code postal et la ville dans la deuxieme partie
    const cityPart = parts[1]
    const postalMatch = cityPart.match(/(\d{5})\s+(.+)/)
    if (postalMatch) {
      postalCode = postalMatch[1]
      city = postalMatch[2]
    } else {
      city = cityPart
    }
  }

  // Determiner le departement depuis le code postal
  let department: string | null = null
  if (postalCode) {
    const deptCode = postalCode.substring(0, 2)
    department = getDepartmentName(deptCode)
  }

  // Determiner la region depuis le departement
  let region: string | null = null
  if (postalCode) {
    region = getRegionFromPostalCode(postalCode)
  }

  return { street, city, postalCode, department, region }
}

// Mapping des codes postaux vers les noms de departements
function getDepartmentName(code: string): string | null {
  const departments: Record<string, string> = {
    '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
    '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardeche', '08': 'Ardennes',
    '09': 'Ariege', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
    '13': 'Bouches-du-Rhone', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
    '17': 'Charente-Maritime', '18': 'Cher', '19': 'Correze', '2A': 'Corse-du-Sud',
    '2B': 'Haute-Corse', '21': 'Cote-d\'Or', '22': 'Cotes-d\'Armor', '23': 'Creuse',
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
    '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
    '974': 'La Reunion', '976': 'Mayotte'
  }
  return departments[code] || null
}

function getRegionFromPostalCode(postalCode: string): string | null {
  const code = postalCode.substring(0, 2)
  const regionMap: Record<string, string> = {
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
    '2A': 'Corse', '2B': 'Corse', '20': 'Corse',
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

// Generer un slug unique
function generateSlug(name: string, city: string | null): string {
  const base = `${name}${city ? `-${city}` : ''}`
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

// Mapper les categories Google Maps vers nos services
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
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

// Transformer une entree Google Maps en provider
function transformToProvider(entry: GoogleMapsEntry): Provider | null {
  // Ignorer les entreprises fermees
  if (entry.permanently_closed) {
    return null
  }

  // Ignorer les entrees sans coordonnees
  if (!entry.lat || !entry.lon) {
    return null
  }

  // Parser l'adresse
  const { street, city, postalCode, department, region } = parseAddress(entry.address)

  // Generer le slug
  const slug = generateSlug(entry.name, city)

  // Extraire le telephone depuis business_details si absent
  let phone = entry.phone_number
  if (!phone) {
    const phoneDetail = entry.business_details?.find(d => d.field_name === 'call')
    if (phoneDetail) {
      phone = phoneDetail.details
    }
  }

  // Extraire le site web depuis business_details si absent
  let website = entry.open_website
  if (!website) {
    const webDetail = entry.business_details?.find(d => d.field_name === 'public' && d.link)
    if (webDetail) {
      website = webDetail.link
    }
  }

  return {
    name: entry.name,
    slug,
    source: 'google_maps',
    source_id: entry.place_id,
    source_url: entry.url,
    address_street: street,
    address_city: city,
    address_postal_code: postalCode,
    address_region: region,
    address_department: department,
    address_country: 'France',
    latitude: entry.lat,
    longitude: entry.lon,
    phone: phone,
    email: null,
    website: website,
    meta_description: entry.description || `${entry.name} - ${mapCategory(entry.category)} a ${city || 'France'}`,
    rating_average: entry.rating || null,
    review_count: entry.reviews_count || 0,
    is_verified: false, // Sera verifie via SIRET plus tard
    is_active: true,
    is_premium: false,
    open_hours: entry.open_hours,
    photos: entry.photos_and_videos?.slice(0, 10) || null,
    services_list: entry.services_provided || [mapCategory(entry.category)],
  }
}

// Fonction principale d'import
async function importGoogleMapsData() {
  console.log('=== Import Google Maps vers Supabase ===')
  console.log('')

  // Lire le fichier JSON
  const filePath = path.join(__dirname, '..', 'Google Maps full information.json')
  console.log(`Lecture du fichier: ${filePath}`)

  let data: GoogleMapsEntry[]
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(content)
    console.log(`${data.length} entrees trouvees`)
  } catch (error) {
    console.error('Erreur lecture fichier:', error)
    process.exit(1)
  }

  // Transformer les donnees
  console.log('Transformation des donnees...')
  const providers: Provider[] = []
  let skipped = 0

  for (const entry of data) {
    const provider = transformToProvider(entry)
    if (provider) {
      providers.push(provider)
    } else {
      skipped++
    }
  }

  console.log(`${providers.length} providers valides (${skipped} ignores)`)

  // Inserer par batch de 100
  const BATCH_SIZE = 100
  let inserted = 0
  let errors = 0

  console.log('')
  console.log('Insertion dans Supabase...')

  for (let i = 0; i < providers.length; i += BATCH_SIZE) {
    const batch = providers.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from('providers')
      .upsert(batch, {
        onConflict: 'source_id',
        ignoreDuplicates: false,
      })
      .select('id')

    if (error) {
      console.error(`Erreur batch ${i / BATCH_SIZE + 1}:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
    }

    // Progress
    const progress = Math.round(((i + batch.length) / providers.length) * 100)
    process.stdout.write(`\rProgression: ${progress}% (${inserted} inseres, ${errors} erreurs)`)
  }

  console.log('')
  console.log('')
  console.log('=== Import termine ===')
  console.log(`Total inseres: ${inserted}`)
  console.log(`Total erreurs: ${errors}`)
}

// Executer
importGoogleMapsData().catch(console.error)
