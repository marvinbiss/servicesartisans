import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// OpenStreetMap Nominatim API (gratuit, pas de clé nécessaire)
async function geocodeAddress(street: string, postalCode: string, city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const address = `${street}, ${postalCode} ${city}, France`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ServicesArtisans/1.0'
      }
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Rate limiting: wait between requests
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function enrichGPS() {
  console.log('🗺️  Démarrage de l\'enrichissement GPS...\n')

  // Récupérer les artisans sans GPS mais avec adresse
  const { data: providers, error } = await supabase
    .from('providers')
    .select('id, name, address_street, address_postal_code, address_city')
    .is('latitude', null)
    .is('longitude', null)
    .not('address_street', 'is', null)
    .not('address_city', 'is', null)
    .eq('is_active', true)
    .limit(1675) // Tous les artisans sans GPS

  if (error || !providers) {
    console.error('❌ Erreur récupération providers:', error)
    process.exit(1)
  }

  console.log(`📊 Total artisans à enrichir: ${providers.length}\n`)

  let enriched = 0
  let failed = 0

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    
    try {
      const coords = await geocodeAddress(
        provider.address_street || '',
        provider.address_postal_code || '',
        provider.address_city || ''
      )

      if (coords) {
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            latitude: coords.lat,
            longitude: coords.lon
          })
          .eq('id', provider.id)

        if (updateError) {
          console.error(`❌ Erreur update ${provider.name}:`, updateError.message)
          failed++
        } else {
          enriched++
          if (enriched % 10 === 0) {
            console.log(`✅ ${enriched}/${providers.length} GPS ajoutés... (${Math.round(enriched/providers.length*100)}%)`)
          }
        }
      } else {
        failed++
        if (failed % 50 === 0) {
          console.log(`⚠️  ${failed} adresses non trouvées...`)
        }
      }

      // Rate limiting: 1 request per second (Nominatim policy)
      await sleep(1000)
    } catch (error: any) {
      console.error(`❌ Erreur ${provider.name}:`, error.message)
      failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ ENRICHISSEMENT GPS')
  console.log('='.repeat(60))
  console.log(`✅ GPS ajoutés: ${enriched}`)
  console.log(`❌ Échecs: ${failed}`)
  console.log(`📊 Total traité: ${enriched + failed}`)
  console.log(`📈 Taux de succès: ${Math.round(enriched/(enriched+failed)*100)}%`)
  console.log('='.repeat(60))
}

enrichGPS()
  .then(() => {
    console.log('\n✅ Enrichissement GPS terminé!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
