/**
 * Script d'import des données Google Maps dans Supabase
 * Importe 1000 artisans avec leurs vrais avis Google
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Charger les variables d'environnement depuis .env.local
config({ path: path.join(process.cwd(), '.env.local') })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes!')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Fonction pour slugifier un texte
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Fonction pour extraire le code postal de l'adresse
function extractPostalCode(address: string): string {
  const match = address.match(/\b\d{5}\b/)
  return match ? match[0] : ''
}

// Fonction pour extraire la ville de l'adresse
function extractCity(address: string): string {
  const parts = address.split(',')
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2].trim()
    return cityPart.replace(/\d{5}/, '').trim()
  }
  return ''
}

// Fonction pour extraire la rue de l'adresse
function extractStreet(address: string): string {
  const parts = address.split(',')
  return parts[0]?.trim() || ''
}

// Fonction pour mapper les catégories Google vers nos catégories
function mapCategory(googleCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Plumber': 'Plombier',
    'Electrician': 'Électricien',
    'Heating contractor': 'Chauffagiste',
    'Painter': 'Peintre',
    'Carpenter': 'Menuisier',
    'Mason': 'Maçon',
    'Roofer': 'Couvreur',
    'Locksmith': 'Serrurier',
    // Ajoutez d'autres mappings au besoin
  }
  return categoryMap[googleCategory] || googleCategory
}

async function importData() {
  console.log('🚀 Début de l\'import des données Google Maps...\n')

  // Vérifier si des données existent déjà
  const { count: existingCount } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'google_places')

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  ATTENTION: ${existingCount} providers Google existent déjà!`)
    console.log('❌ Pour éviter les doublons, le script s\'arrête.')
    console.log('\n📝 Pour réimporter, supprimez d\'abord les données existantes:')
    console.log('   DELETE FROM reviews WHERE provider_id IN (SELECT id FROM providers WHERE source = \'google_places\');')
    console.log('   DELETE FROM providers WHERE source = \'google_places\';')
    process.exit(1)
  }

  // Lire le fichier JSON
  const filePath = path.join(process.cwd(), 'Google Maps full information.json')
  console.log('📂 Lecture du fichier:', filePath)
  
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const googleData = JSON.parse(rawData)
  
  console.log(`✅ ${googleData.length} artisans trouvés dans le fichier\n`)

  let providersInserted = 0
  let reviewsInserted = 0
  let errors = 0

  // Traiter chaque artisan
  for (let i = 0; i < googleData.length; i++) {
    const item = googleData[i]
    
    try {
      console.log(`[${i + 1}/${googleData.length}] Import de: ${item.name}`)

      // Extraire les informations d'adresse
      const postalCode = extractPostalCode(item.address || '')
      const city = extractCity(item.address || '')
      const street = extractStreet(item.address || '')

      // Préparer les données du provider
      const providerData = {
        name: item.name,
        slug: slugify(`${item.name}-${city || ''}-${item.place_id.substring(0, 8)}`),
        specialty: mapCategory(item.category),
        address_street: street,
        address_city: city,
        address_postal_code: postalCode,
        address_country: 'France',
        phone: item.phone_number || null,
        email: null,
        website: item.open_website || null,
        description: item.description || null,
        rating_average: item.rating || null,
        review_count: item.reviews_count || 0,
        latitude: item.lat || null,
        longitude: item.lon || null,
        source: 'google_places',
        source_id: item.place_id,
        is_verified: true,
        is_active: !item.permanently_closed && !item.temporarily_closed,
        is_premium: false,
        avatar_url: item.main_image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Vérifier si le provider existe déjà (par source_id)
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('source_id', item.place_id)
        .single()

      if (existingProvider) {
        console.log(`  ⏭️  Déjà existant, ignoré`)
        continue
      }

      // Insérer le provider
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .insert(providerData)
        .select('id')
        .single()

      if (providerError) {
        console.error(`  ❌ Erreur provider: ${providerError.message}`)
        errors++
        continue
      }

      providersInserted++
      console.log(`  ✅ Provider inséré (ID: ${provider.id})`)

      // Insérer les avis si disponibles
      if (item.top_reviews && item.top_reviews.length > 0) {
        const reviewsData = item.top_reviews.map((review: any) => ({
          provider_id: provider.id,
          author_name: review.reviewer_name,
          rating: review.rating,
          content: review.content,
          source: 'google',
          source_id: `${item.place_id}-${review.reviewer_name}`,
          source_date: review.review_date ? new Date(review.review_date).toISOString() : null,
          is_verified: true,
          is_visible: true,
          created_at: review.review_date ? new Date(review.review_date).toISOString() : new Date().toISOString(),
        }))

        const { error: reviewsError } = await supabase
          .from('reviews')
          .insert(reviewsData)

        if (reviewsError) {
          console.error(`  ⚠️  Erreur avis: ${reviewsError.message}`)
        } else {
          reviewsInserted += reviewsData.length
          console.log(`  ✅ ${reviewsData.length} avis insérés`)
        }
      }

      // Pause pour éviter de surcharger l'API
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

    } catch (error) {
      console.error(`  ❌ Erreur: ${error}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DE L\'IMPORT')
  console.log('='.repeat(60))
  console.log(`✅ Providers insérés: ${providersInserted}`)
  console.log(`✅ Avis insérés: ${reviewsInserted}`)
  console.log(`❌ Erreurs: ${errors}`)
  console.log('='.repeat(60))
}

// Exécuter l'import
importData()
  .then(() => {
    console.log('\n🎉 Import terminé avec succès!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
