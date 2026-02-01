/**
 * Script pour corriger les données géographiques des providers
 * Assigne region et département corrects basés sur le code postal
 * Usage: node scripts/fix-geography.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Mapping complet des départements
const DEPARTMENTS = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
}

// Mapping des départements vers régions
const DEPT_TO_REGION = {
  // Auvergne-Rhône-Alpes
  '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
  '15': 'Auvergne-Rhône-Alpes', '26': 'Auvergne-Rhône-Alpes', '38': 'Auvergne-Rhône-Alpes',
  '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '63': 'Auvergne-Rhône-Alpes',
  '69': 'Auvergne-Rhône-Alpes', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
  // Bourgogne-Franche-Comté
  '21': 'Bourgogne-Franche-Comté', '25': 'Bourgogne-Franche-Comté', '39': 'Bourgogne-Franche-Comté',
  '58': 'Bourgogne-Franche-Comté', '70': 'Bourgogne-Franche-Comté', '71': 'Bourgogne-Franche-Comté',
  '89': 'Bourgogne-Franche-Comté', '90': 'Bourgogne-Franche-Comté',
  // Bretagne
  '22': 'Bretagne', '29': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne',
  // Centre-Val de Loire
  '18': 'Centre-Val de Loire', '28': 'Centre-Val de Loire', '36': 'Centre-Val de Loire',
  '37': 'Centre-Val de Loire', '41': 'Centre-Val de Loire', '45': 'Centre-Val de Loire',
  // Corse
  '2A': 'Corse', '2B': 'Corse', '20': 'Corse',
  // Grand Est
  '08': 'Grand Est', '10': 'Grand Est', '51': 'Grand Est', '52': 'Grand Est',
  '54': 'Grand Est', '55': 'Grand Est', '57': 'Grand Est', '67': 'Grand Est',
  '68': 'Grand Est', '88': 'Grand Est',
  // Hauts-de-France
  '02': 'Hauts-de-France', '59': 'Hauts-de-France', '60': 'Hauts-de-France',
  '62': 'Hauts-de-France', '80': 'Hauts-de-France',
  // Île-de-France
  '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France',
  '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France',
  '94': 'Île-de-France', '95': 'Île-de-France',
  // Normandie
  '14': 'Normandie', '27': 'Normandie', '50': 'Normandie', '61': 'Normandie', '76': 'Normandie',
  // Nouvelle-Aquitaine
  '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '19': 'Nouvelle-Aquitaine',
  '23': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '33': 'Nouvelle-Aquitaine',
  '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine', '64': 'Nouvelle-Aquitaine',
  '79': 'Nouvelle-Aquitaine', '86': 'Nouvelle-Aquitaine', '87': 'Nouvelle-Aquitaine',
  // Occitanie
  '09': 'Occitanie', '11': 'Occitanie', '12': 'Occitanie', '30': 'Occitanie',
  '31': 'Occitanie', '32': 'Occitanie', '34': 'Occitanie', '46': 'Occitanie',
  '48': 'Occitanie', '65': 'Occitanie', '66': 'Occitanie', '81': 'Occitanie', '82': 'Occitanie',
  // Pays de la Loire
  '44': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire',
  '72': 'Pays de la Loire', '85': 'Pays de la Loire',
  // Provence-Alpes-Côte d'Azur
  '04': 'Provence-Alpes-Côte d\'Azur', '05': 'Provence-Alpes-Côte d\'Azur',
  '06': 'Provence-Alpes-Côte d\'Azur', '13': 'Provence-Alpes-Côte d\'Azur',
  '83': 'Provence-Alpes-Côte d\'Azur', '84': 'Provence-Alpes-Côte d\'Azur',
  // DOM-TOM
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
}

function getDeptCode(postalCode) {
  if (!postalCode) return null
  // DOM-TOM
  if (postalCode.startsWith('97')) {
    return postalCode.substring(0, 3)
  }
  // Corse
  if (postalCode.startsWith('20')) {
    const num = parseInt(postalCode.substring(0, 3))
    return num < 201 ? '2A' : '2B'
  }
  return postalCode.substring(0, 2)
}

async function main() {
  console.log('=== Correction des données géographiques ===\n')

  // Fetch all providers in batches
  let allProviders = []
  let offset = 0
  const FETCH_SIZE = 1000

  console.log('Chargement des providers...')
  while (true) {
    const { data: batch, error } = await supabase
      .from('providers')
      .select('id, address_postal_code, address_city, address_department, address_region')
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

  console.log(`${allProviders.length} providers charges\n`)

  // Find providers that need fixing
  const toFix = []

  for (const provider of allProviders) {
    const deptCode = getDeptCode(provider.address_postal_code)

    if (!deptCode) continue

    const correctDept = DEPARTMENTS[deptCode]
    const correctRegion = DEPT_TO_REGION[deptCode]

    // Check if needs fixing
    const needsFix = (
      provider.address_department !== correctDept ||
      provider.address_region !== correctRegion
    )

    if (needsFix && correctDept && correctRegion) {
      toFix.push({
        id: provider.id,
        address_department: correctDept,
        address_region: correctRegion,
      })
    }
  }

  console.log(`${toFix.length} providers a corriger\n`)

  if (toFix.length === 0) {
    console.log('Toutes les donnees geographiques sont correctes!')
    return
  }

  // Update in batches
  const BATCH_SIZE = 100
  let updated = 0
  let errors = 0

  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const batch = toFix.slice(i, i + BATCH_SIZE)

    // Update each provider individually (Supabase doesn't support bulk update with different values)
    for (const provider of batch) {
      const { error } = await supabase
        .from('providers')
        .update({
          address_department: provider.address_department,
          address_region: provider.address_region,
        })
        .eq('id', provider.id)

      if (error) {
        errors++
      } else {
        updated++
      }
    }

    const pct = Math.round(((i + batch.length) / toFix.length) * 100)
    process.stdout.write(`\r${pct}% (${updated} corriges, ${errors} erreurs)`)
  }

  console.log('\n\n=== Termine ===')
  console.log(`Corriges: ${updated}`)
  console.log(`Erreurs: ${errors}`)
}

main().catch(console.error)
