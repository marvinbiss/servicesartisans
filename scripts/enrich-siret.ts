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

// API SIRENE de l'INSEE (gratuit, officiel)
async function searchSIRENE(name: string, city: string): Promise<any | null> {
  try {
    // Nettoyer le nom pour la recherche
    const cleanName = name
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(cleanName)}&commune=${encodeURIComponent(city)}&per_page=1`
    
    const response = await fetch(url)
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        siret: result.siege?.siret || null,
        siren: result.siren || null,
        legal_form: result.forme_juridique || null,
        creation_date: result.date_creation || null,
        employee_count: result.tranche_effectif_salarie || null,
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

async function enrichSIRET() {
  console.log('🏢 Démarrage de l\'enrichissement SIRET...\n')

  // Récupérer les artisans sans SIRET
  const { data: providers, error } = await supabase
    .from('providers')
    .select('id, name, address_city')
    .is('siret', null)
    .not('address_city', 'is', null)
    .eq('is_active', true)
    .limit(2090) // Tous les artisans sans SIRET

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
      const sireneData = await searchSIRENE(provider.name, provider.address_city)

      if (sireneData && sireneData.siret) {
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            siret: sireneData.siret,
            legal_form: sireneData.legal_form,
            creation_date: sireneData.creation_date,
            employee_count: sireneData.employee_count,
          })
          .eq('id', provider.id)

        if (updateError) {
          console.error(`❌ Erreur update ${provider.name}:`, updateError.message)
          failed++
        } else {
          enriched++
          if (enriched % 10 === 0) {
            console.log(`✅ ${enriched}/${providers.length} SIRET ajoutés... (${Math.round(enriched/providers.length*100)}%)`)
          }
        }
      } else {
        failed++
        if (failed % 50 === 0) {
          console.log(`⚠️  ${failed} entreprises non trouvées...`)
        }
      }

      // Rate limiting: 2 requests per second
      await sleep(500)
    } catch (error: any) {
      console.error(`❌ Erreur ${provider.name}:`, error.message)
      failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ ENRICHISSEMENT SIRET')
  console.log('='.repeat(60))
  console.log(`✅ SIRET ajoutés: ${enriched}`)
  console.log(`❌ Non trouvés: ${failed}`)
  console.log(`📊 Total traité: ${enriched + failed}`)
  console.log(`📈 Taux de succès: ${Math.round(enriched/(enriched+failed)*100)}%`)
  console.log('='.repeat(60))
}

enrichSIRET()
  .then(() => {
    console.log('\n✅ Enrichissement SIRET terminé!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
