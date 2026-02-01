/**
 * Database seed script for ServicesArtisans
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const REGIONS = [
  { name: 'Île-de-France', slug: 'ile-de-france', code: '11' },
  { name: 'Auvergne-Rhône-Alpes', slug: 'auvergne-rhone-alpes', code: '84' },
  { name: "Provence-Alpes-Côte d'Azur", slug: 'provence-alpes-cote-d-azur', code: '93' },
  { name: 'Occitanie', slug: 'occitanie', code: '76' },
  { name: 'Nouvelle-Aquitaine', slug: 'nouvelle-aquitaine', code: '75' },
  { name: 'Pays de la Loire', slug: 'pays-de-la-loire', code: '52' },
  { name: 'Bretagne', slug: 'bretagne', code: '53' },
  { name: 'Hauts-de-France', slug: 'hauts-de-france', code: '32' },
  { name: 'Grand Est', slug: 'grand-est', code: '44' },
  { name: 'Normandie', slug: 'normandie', code: '28' },
]

const SERVICES = [
  { name: 'Plombier', slug: 'plombier', name_plural: 'Plombiers', icon: '🔧' },
  { name: 'Électricien', slug: 'electricien', name_plural: 'Électriciens', icon: '⚡' },
  { name: 'Serrurier', slug: 'serrurier', name_plural: 'Serruriers', icon: '🔑' },
  { name: 'Chauffagiste', slug: 'chauffagiste', name_plural: 'Chauffagistes', icon: '🔥' },
  { name: 'Peintre', slug: 'peintre', name_plural: 'Peintres', icon: '🎨' },
  { name: 'Menuisier', slug: 'menuisier', name_plural: 'Menuisiers', icon: '🪚' },
  { name: 'Couvreur', slug: 'couvreur', name_plural: 'Couvreurs', icon: '🏠' },
  { name: 'Maçon', slug: 'macon', name_plural: 'Maçons', icon: '🧱' },
  { name: 'Carreleur', slug: 'carreleur', name_plural: 'Carreleurs', icon: '🔲' },
  { name: 'Climaticien', slug: 'climaticien', name_plural: 'Climaticiens', icon: '❄️' },
]

async function seed() {
  console.log('🌱 Starting seed...')

  // Seed regions
  console.log('📍 Seeding regions...')
  const { error: regionsError } = await supabase
    .from('regions')
    .upsert(REGIONS, { onConflict: 'slug' })

  if (regionsError) {
    console.error('Error seeding regions:', regionsError)
  } else {
    console.log(`✓ ${REGIONS.length} regions seeded`)
  }

  // Seed services
  console.log('🛠️ Seeding services...')
  const { error: servicesError } = await supabase
    .from('services')
    .upsert(
      SERVICES.map((s) => ({ ...s, is_active: true })),
      { onConflict: 'slug' }
    )

  if (servicesError) {
    console.error('Error seeding services:', servicesError)
  } else {
    console.log(`✓ ${SERVICES.length} services seeded`)
  }

  console.log('✅ Seed complete!')
}

seed().catch(console.error)
