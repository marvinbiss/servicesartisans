/**
 * Script to detect and fix provider specialties based on their business name
 * Fixes providers with generic "Artisan" specialty
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapping of keywords to specialties
const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  'Plombier': ['plombier', 'plomberie', 'plomb'],
  'Électricien': ['électricien', 'electricien', 'électricité', 'electricite', 'electrique'],
  'Serrurier': ['serrurier', 'serrurerie', 'serrure', 'clé', 'cle'],
  'Vitrier': ['vitrier', 'vitrerie', 'vitre', 'verre', 'miroiterie'],
  'Chauffagiste': ['chauffagiste', 'chauffage', 'chaudière', 'chaudiere', 'climatisation'],
  'Climaticien': ['climaticien', 'climatisation', 'clim', 'froid'],
  'Peintre en bâtiment': ['peintre', 'peinture', 'ravalement', 'façade', 'facade'],
  'Menuisier': ['menuisier', 'menuiserie', 'bois', 'ébéniste', 'ebeniste', 'charpentier'],
  'Carreleur': ['carreleur', 'carrelage', 'faïence', 'faience', 'mosaïque'],
  'Maçon': ['maçon', 'macon', 'maçonnerie', 'maconnerie', 'béton', 'beton'],
  'Couvreur': ['couvreur', 'couverture', 'toiture', 'toit', 'zingueur', 'zinguerie'],
  'Jardinier': ['jardinier', 'jardinage', 'jardin', 'espaces verts', 'paysagiste'],
  'Cuisiniste': ['cuisiniste', 'cuisine', 'aménagement cuisine'],
  'Solier': ['solier', 'sol', 'parquet', 'moquette', 'lino', 'revêtement'],
  'Nettoyage': ['nettoyage', 'ménage', 'menage', 'entretien', 'propreté'],
  'Dépanneur': ['dépannage', 'depannage', 'dépanneur', 'depanneur', 'réparation', 'reparation'],
  'Plâtrier': ['plâtrier', 'platrier', 'plâtre', 'platre', 'placo', 'plaquiste'],
  'Terrassier': ['terrassier', 'terrassement', 'excavation'],
  'Pisciniste': ['pisciniste', 'piscine'],
  'Antenniste': ['antenniste', 'antenne', 'satellite', 'tv'],
  'Domoticien': ['domotique', 'domoticien', 'maison connectée'],
  'Isolation': ['isolation', 'isolant', 'thermique'],
  'Assainissement': ['assainissement', 'fosse septique', 'vidange'],
}

// Detect specialty from business name
function detectSpecialty(name: string): string | null {
  const lowerName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (lowerName.includes(normalizedKeyword)) {
        return specialty
      }
    }
  }

  return null
}

async function main() {
  console.log('🔧 Starting specialty fix...\n')

  // Get all providers with generic "Artisan" specialty or no specialty
  const { data: providers, error: providerError } = await supabase
    .from('providers')
    .select('id, name, specialty, slug')
    .eq('is_active', true)
    .or('specialty.eq.Artisan,specialty.is.null,specialty.eq.')

  if (providerError) {
    console.error('Error fetching providers:', providerError)
    return
  }

  console.log(`Found ${providers?.length || 0} providers with generic/missing specialty\n`)

  let fixed = 0
  let skipped = 0
  const updates: Array<{ id: string; name: string; oldSpecialty: string; newSpecialty: string }> = []

  for (const provider of providers || []) {
    const detectedSpecialty = detectSpecialty(provider.name || '')

    if (detectedSpecialty) {
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          specialty: detectedSpecialty,
        })
        .eq('id', provider.id)

      if (!updateError) {
        fixed++
        updates.push({
          id: provider.id,
          name: provider.name,
          oldSpecialty: provider.specialty || 'null',
          newSpecialty: detectedSpecialty
        })
        console.log(`✅ ${provider.name}: ${provider.specialty || 'null'} → ${detectedSpecialty}`)
      } else {
        console.error(`❌ Error updating ${provider.name}:`, updateError)
      }
    } else {
      skipped++
      // console.log(`⏭️  ${provider.name}: Could not detect specialty`)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   Fixed: ${fixed}`)
  console.log(`   Skipped (could not detect): ${skipped}`)
  console.log(`   Total processed: ${providers?.length || 0}`)

  // Show some examples of fixed providers
  if (updates.length > 0) {
    console.log('\n📝 Examples of fixed providers:')
    updates.slice(0, 10).forEach(u => {
      console.log(`   - ${u.name}: ${u.oldSpecialty} → ${u.newSpecialty}`)
    })
  }
}

main().catch(console.error)
