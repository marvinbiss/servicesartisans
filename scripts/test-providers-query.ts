/**
 * Script de diagnostic pour tester la requête des artisans
 * Usage: npx tsx scripts/test-providers-query.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables SUPABASE manquantes dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProvidersQuery() {
  console.log('\n🔍 Test de la requête des artisans plombiers à Paris...\n')

  // 1. Chercher le service "plombier"
  console.log('1️⃣ Recherche du service "plombier"...')
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', 'plombier')
    .single()

  if (serviceError || !service) {
    console.error('❌ Erreur lors de la recherche du service:', serviceError)
    return
  }
  console.log('✅ Service trouvé:', service.name, '(ID:', service.id + ')')

  // 2. Chercher la location "Paris"
  console.log('\n2️⃣ Recherche de la location "paris"...')
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', 'paris')
    .single()

  if (locationError || !location) {
    console.error('❌ Erreur lors de la recherche de la location:', locationError)
    return
  }
  console.log('✅ Location trouvée:', location.name, '(ID:', location.id + ')')

  // 3. Test 1: Tous les providers à Paris (sans filtre service)
  console.log('\n3️⃣ Test 1: TOUS les artisans à Paris (sans filtre)...')
  const { data: allProviders, error: allError } = await supabase
    .from('providers')
    .select('*')
    .ilike('address_city', location.name)
    .eq('is_active', true)

  if (allError) {
    console.error('❌ Erreur:', allError)
  } else {
    console.log('✅ Total artisans à Paris:', allProviders?.length || 0)
  }

  // 4. Test 2: Plombiers à Paris (AVEC filtre service)
  console.log('\n4️⃣ Test 2: PLOMBIERS à Paris (avec filtre service)...')
  const { data: plumbers, error: plumbersError } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services!inner(service_id)
    `)
    .eq('provider_services.service_id', service.id)
    .ilike('address_city', location.name)
    .eq('is_active', true)
    .order('is_premium', { ascending: false })
    .order('name')

  if (plumbersError) {
    console.error('❌ Erreur:', plumbersError)
  } else {
    console.log('✅ Total PLOMBIERS à Paris:', plumbers?.length || 0)
    
    if (plumbers && plumbers.length > 0) {
      console.log('\n📋 Premiers 5 plombiers:')
      plumbers.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.address_city} (Premium: ${p.is_premium})`)
      })
    }
  }

  // 5. Test 3: Vérifier la table provider_services
  console.log('\n5️⃣ Test 3: Vérification des associations provider_services...')
  const { data: associations, error: assocError } = await supabase
    .from('provider_services')
    .select('*')
    .eq('service_id', service.id)
    .limit(10)

  if (assocError) {
    console.error('❌ Erreur:', assocError)
  } else {
    console.log('✅ Total associations pour "plombier":', associations?.length || 0, '(échantillon de 10)')
  }

  console.log('\n✅ Diagnostic terminé!\n')
}

testProvidersQuery().catch(console.error)
