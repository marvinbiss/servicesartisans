/**
 * Script pour lier les providers importés aux services
 * Usage: node scripts/link-providers-services.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Mapping des catégories vers les slugs de services
const CATEGORY_TO_SERVICE = {
  // Plomberie
  'plombier': 'plombier',
  'plomberie': 'plombier',
  'chauffagiste': 'chauffagiste',
  'chauffage': 'chauffagiste',
  'climatisation': 'installateur-climatisation',
  'pompe a chaleur': 'installateur-pompe-chaleur',
  'chaudiere': 'depanneur-chaudiere',
  'sanitaire': 'installateur-sanitaire',

  // Electricité
  'electricien': 'electricien',
  'electricite': 'electricien',
  'electrique': 'electricien',

  // Maçonnerie
  'macon': 'macon',
  'maconnerie': 'macon',
  'beton': 'macon',
  'terrassement': 'terrassier',
  'terrassier': 'terrassier',
  'facadier': 'facadier',
  'facade': 'facadier',

  // Menuiserie
  'menuisier': 'menuisier',
  'menuiserie': 'menuisier',
  'charpentier': 'charpentier',
  'charpente': 'charpentier',
  'ebeniste': 'menuisier',

  // Couverture
  'couvreur': 'couvreur',
  'couverture': 'couvreur',
  'toiture': 'couvreur',
  'zingueur': 'couvreur-zingueur',
  'zinguerie': 'couvreur-zingueur',

  // Peinture
  'peintre': 'peintre',
  'peinture': 'peintre',
  'decorateur': 'peintre-decorateur',
  'decoration': 'peintre-decorateur',
  'platrier': 'platrier',
  'platre': 'platrier',
  'platrerie': 'platrier',

  // Serrurerie
  'serrurier': 'serrurier',
  'serrurerie': 'serrurier',
  'metallier': 'metallier',
  'metallerie': 'metallier',

  // Carrelage
  'carreleur': 'carreleur',
  'carrelage': 'carreleur',
  'faience': 'carreleur',

  // Vitrier
  'vitrier': 'vitrier',
  'vitrerie': 'vitrier',
  'miroiterie': 'vitrier',

  // Isolation
  'isolation': 'isolateur',
  'isolateur': 'isolateur',
}

// Trouver le service correspondant à une description
function findServiceSlug(metaDescription) {
  if (!metaDescription) return null

  const desc = metaDescription.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  for (const [keyword, slug] of Object.entries(CATEGORY_TO_SERVICE)) {
    if (desc.includes(keyword)) {
      return slug
    }
  }

  return null
}

async function main() {
  console.log('=== Liaison Providers <-> Services ===\n')

  // 1. Récupérer tous les services avec leur ID
  const { data: services, error: servErr } = await supabase
    .from('services')
    .select('id, slug, name')

  if (servErr) {
    console.error('Erreur services:', servErr.message)
    return
  }

  const serviceMap = {}
  services.forEach(s => {
    serviceMap[s.slug] = s.id
  })
  console.log(`${services.length} services charges`)

  // 2. Récupérer les providers sans liaison
  const { data: linkedIds } = await supabase
    .from('provider_services')
    .select('provider_id')

  const linkedSet = new Set(linkedIds?.map(l => l.provider_id) || [])
  console.log(`${linkedSet.size} providers deja lies`)

  // 3. Récupérer les providers importés (source google_maps ou google_places)
  const { data: providers, error: provErr } = await supabase
    .from('providers')
    .select('id, name, meta_description, source')
    .or('source.eq.google_maps,source.eq.google_places')

  if (provErr) {
    console.error('Erreur providers:', provErr.message)
    return
  }

  console.log(`${providers.length} providers importes trouves`)

  // 4. Filtrer ceux qui n'ont pas de liaison
  const unlinked = providers.filter(p => !linkedSet.has(p.id))
  console.log(`${unlinked.length} providers sans liaison\n`)

  if (unlinked.length === 0) {
    console.log('Tous les providers sont deja lies!')
    return
  }

  // 5. Creer les liaisons
  const links = []
  const notMatched = []

  for (const provider of unlinked) {
    const serviceSlug = findServiceSlug(provider.meta_description)

    if (serviceSlug && serviceMap[serviceSlug]) {
      links.push({
        provider_id: provider.id,
        service_id: serviceMap[serviceSlug],
        is_primary: true,
      })
    } else {
      notMatched.push(provider.name)
    }
  }

  console.log(`${links.length} liaisons a creer`)
  console.log(`${notMatched.length} providers sans correspondance\n`)

  if (links.length === 0) {
    console.log('Aucune liaison a creer')
    return
  }

  // 6. Inserer par batch
  const BATCH_SIZE = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from('provider_services')
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

  if (notMatched.length > 0 && notMatched.length <= 20) {
    console.log('\nProviders sans correspondance:')
    notMatched.forEach(n => console.log(`  - ${n}`))
  }
}

main().catch(console.error)
