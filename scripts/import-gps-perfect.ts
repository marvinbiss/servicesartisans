/**
 * 🗺️ IMPORT GPS PARFAIT - Google Maps → Supabase
 * Importe tous les artisans avec coordonnées GPS EXACTES
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// Types
interface GoogleMapsEntry {
  place_id: string
  name: string
  category: string
  address: string
  lat: number
  lon: number
  rating: number
  reviews_count: number
  phone_number: string | null
  open_website: string | null
  description: string | null
  photos_and_videos: string[] | null
  open_hours: Record<string, string> | null
  services_provided: string[] | null
  permanently_closed: boolean
}

// Fonction pour créer un slug unique
function createSlug(name: string, placeId: string): string {
  const cleanName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const shortId = placeId.substring(placeId.length - 6)
  return `${cleanName}-${shortId}`
}

// Parser l'adresse
function parseAddress(address: string): {
  street: string | null
  city: string | null
  postalCode: string | null
} {
  const parts = address.split(',').map(p => p.trim())

  let street: string | null = null
  let city: string | null = null
  let postalCode: string | null = null

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

  return { street, city, postalCode }
}

// Mapper les catégories
function mapCategoryToSpecialty(category: string): string {
  const cat = category.toLowerCase()
  
  if (cat.includes('plumb')) return 'Plombier'
  if (cat.includes('electric')) return 'Électricien'
  if (cat.includes('locksmith') || cat.includes('serr')) return 'Serrurier'
  if (cat.includes('paint')) return 'Peintre'
  if (cat.includes('mason') || cat.includes('maçon')) return 'Maçon'
  if (cat.includes('carpenter') || cat.includes('menuisi')) return 'Menuisier'
  if (cat.includes('heat') || cat.includes('chauff')) return 'Chauffagiste'
  if (cat.includes('roof') || cat.includes('couv')) return 'Couvreur'
  if (cat.includes('charpent')) return 'Charpentier'
  
  return 'Artisan'
}

async function importGoogleMapsData() {
  console.log('🚀 Démarrage de l\'import GPS PARFAIT...\n')

  // Charger le fichier JSON
  const jsonPath = 'Google Maps full information.json'
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Fichier non trouvé: ${jsonPath}`)
    process.exit(1)
  }

  console.log(`📖 Lecture de ${jsonPath}...`)
  const rawData = fs.readFileSync(jsonPath, 'utf-8')
  const entries: GoogleMapsEntry[] = JSON.parse(rawData)

  console.log(`✅ ${entries.length} entrées trouvées\n`)

  // Filtrer les entrées avec GPS valides
  const validEntries = entries.filter(e => 
    e.lat && 
    e.lon && 
    !isNaN(e.lat) && 
    !isNaN(e.lon) &&
    e.lat >= -90 && e.lat <= 90 &&
    e.lon >= -180 && e.lon <= 180 &&
    !e.permanently_closed
  )

  console.log(`🗺️  ${validEntries.length} entrées avec GPS valides (${entries.length - validEntries.length} ignorées)\n`)

  // Import par lots de 100
  const BATCH_SIZE = 100
  let imported = 0
  let errors = 0
  let skipped = 0

  for (let i = 0; i < validEntries.length; i += BATCH_SIZE) {
    const batch = validEntries.slice(i, i + BATCH_SIZE)
    
    console.log(`📦 Lot ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(validEntries.length / BATCH_SIZE)} (${batch.length} entrées)...`)

    for (const entry of batch) {
      try {
        const { street, city, postalCode } = parseAddress(entry.address)
        const specialty = mapCategoryToSpecialty(entry.category)

        // Vérifier si existe déjà
        const { data: existing } = await supabase
          .from('providers')
          .select('id')
          .eq('source_id', entry.place_id)
          .single()

        if (existing) {
          // Mettre à jour avec GPS si manquant
          const { error: updateError } = await supabase
            .from('providers')
            .update({
              latitude: entry.lat,
              longitude: entry.lon,
              phone: entry.phone_number,
              website: entry.open_website,
              rating_average: entry.rating || null,
              review_count: entry.reviews_count || 0,
            })
            .eq('id', existing.id)

          if (updateError) {
            console.error(`   ⚠️  Erreur mise à jour ${entry.name}: ${updateError.message}`)
            errors++
          } else {
            skipped++
          }
          continue
        }

        // Créer nouveau provider avec GPS
        const provider = {
          name: entry.name,
          slug: createSlug(entry.name, entry.place_id),
          source: 'google_maps',
          source_id: entry.place_id,
          source_url: `https://www.google.com/maps/place/?q=place_id:${entry.place_id}`,
          
          // 🗺️ COORDONNÉES GPS EXACTES 🗺️
          latitude: entry.lat,
          longitude: entry.lon,
          
          // Adresse
          address_street: street,
          address_city: city,
          address_postal_code: postalCode,
          address_country: 'France',
          
          // Contact
          phone: entry.phone_number,
          website: entry.open_website,
          
          // Métadonnées
          meta_description: entry.description,
          specialty,
          
          // Ratings
          rating_average: entry.rating || null,
          review_count: entry.reviews_count || 0,
          
          // Status
          is_active: true,
          is_verified: false,
          is_premium: false,
          
          // Données additionnelles
          open_hours: entry.open_hours,
          photos: entry.photos_and_videos ? entry.photos_and_videos.slice(0, 5) : null,
          services_list: entry.services_provided,
        }

        const { error: insertError } = await supabase
          .from('providers')
          .insert(provider)

        if (insertError) {
          console.error(`   ❌ Erreur insertion ${entry.name}: ${insertError.message}`)
          errors++
        } else {
          imported++
          
          // Afficher progression toutes les 50 entrées
          if (imported % 50 === 0) {
            console.log(`   ✅ ${imported} importés avec GPS parfait...`)
          }
        }

      } catch (error) {
        console.error(`   ❌ Erreur ${entry.name}:`, error)
        errors++
      }
    }

    // Pause entre les lots
    if (i + BATCH_SIZE < validEntries.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 IMPORT GPS PARFAIT TERMINÉ !')
  console.log('='.repeat(60))
  console.log(`✅ Nouveaux importés : ${imported}`)
  console.log(`🔄 Mis à jour        : ${skipped}`)
  console.log(`❌ Erreurs           : ${errors}`)
  console.log(`📊 Total traité      : ${imported + skipped + errors}`)
  console.log('='.repeat(60))

  // Vérifier la qualité GPS
  const { data: providersWithGPS } = await supabase
    .from('providers')
    .select('id')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  const { data: totalProviders } = await supabase
    .from('providers')
    .select('id')

  console.log(`\n🗺️  Providers avec GPS : ${providersWithGPS?.length || 0} / ${totalProviders?.length || 0}`)
  console.log(`📍 Taux de couverture GPS : ${((providersWithGPS?.length || 0) / (totalProviders?.length || 1) * 100).toFixed(1)}%\n`)
}

// Exécution
importGoogleMapsData()
  .then(() => {
    console.log('✅ Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
