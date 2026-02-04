import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MasonData {
  title: string
  totalScore: number
  reviewsCount: number
  street: string | null
  city: string
  state: string | null
  countryCode: string
  website: string | null
  phone: string | null
  categories: string[]
  url: string
  categoryName: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractPlaceId(url: string): string {
  const match = url.match(/query_place_id=([^&]+)/)
  return match ? match[1] : generateSlug(url)
}

async function importMasons() {
  console.log('🚀 Démarrage de l\'import des maçons...\n')

  // Lire le fichier JSON
  const filePath = path.join(__dirname, '..', 'dataset_crawler-google-places_2026-02-01_16-30-35-480.json')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ ERREUR: Fichier non trouvé:', filePath)
    process.exit(1)
  }

  const rawData = fs.readFileSync(filePath, 'utf-8')
  const masons: MasonData[] = JSON.parse(rawData)

  console.log(`📊 Total maçons à importer: ${masons.length}\n`)

  let imported = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const mason of masons) {
    try {
      const sourceId = extractPlaceId(mason.url)
      const slug = generateSlug(mason.title)

      // Vérifier si le provider existe déjà (par source_id)
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('source_id', sourceId)
        .single()

      const providerData = {
        name: mason.title,
        slug: slug,
        source_id: sourceId,
        source: 'google_maps',
        specialty: mason.categoryName || 'Artisan',
        address_street: mason.street || '',
        address_city: mason.city || '',
        phone: mason.phone || null,
        website: mason.website || null,
        rating_average: mason.totalScore || null,
        review_count: mason.reviewsCount || 0,
        is_verified: false,
      }

      if (existingProvider) {
        // Update existing provider
        const { error } = await supabase
          .from('providers')
          .update(providerData)
          .eq('id', existingProvider.id)

        if (error) {
          console.error(`❌ Erreur update ${mason.title}:`, error.message)
          errors++
        } else {
          updated++
          if (updated % 50 === 0) {
            console.log(`✅ ${updated} artisans mis à jour...`)
          }
        }
      } else {
        // Upsert to handle slug conflicts
        const { error } = await supabase
          .from('providers')
          .upsert(providerData, { onConflict: 'slug' })

        if (error) {
          // If still error, try with modified slug
          const modifiedSlug = `${slug}-${sourceId.substring(0, 8)}`
          const modifiedData = { ...providerData, slug: modifiedSlug }
          
          const { error: retryError } = await supabase
            .from('providers')
            .insert(modifiedData)
          
          if (retryError) {
            console.error(`❌ Erreur insert ${mason.title}:`, retryError.message)
            errors++
          } else {
            imported++
            if (imported % 50 === 0) {
              console.log(`✨ ${imported} nouveaux artisans importés...`)
            }
          }
        } else {
          imported++
          if (imported % 50 === 0) {
            console.log(`✨ ${imported} nouveaux artisans importés...`)
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ Erreur traitement ${mason.title}:`, error.message)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DE L\'IMPORT')
  console.log('='.repeat(60))
  console.log(`✨ Nouveaux artisans importés: ${imported}`)
  console.log(`🔄 Artisans mis à jour: ${updated}`)
  console.log(`⏭️  Artisans ignorés: ${skipped}`)
  console.log(`❌ Erreurs: ${errors}`)
  console.log(`📊 Total traité: ${imported + updated + skipped + errors}`)
  console.log('='.repeat(60))
}

// Exécuter l'import
importMasons()
  .then(() => {
    console.log('\n✅ Import terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
