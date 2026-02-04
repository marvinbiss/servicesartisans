/**
 * Script pour créer des comptes de test
 * Usage: npx tsx scripts/create-test-accounts.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('URL Supabase:', supabaseUrl ? '✅ Configurée' : '❌ Manquante')
console.log('Service Key:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n')

  // 1. Créer le compte Client
  console.log('📧 Création du compte CLIENT...')
  const clientEmail = 'client.test@servicesartisans.fr'
  const clientPassword = 'Test123!'

  const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
    email: clientEmail,
    password: clientPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Jean Dupont',
      role: 'client'
    }
  })

  if (clientAuthError) {
    if (clientAuthError.message.includes('already been registered')) {
      console.log('   ⚠️  Le compte client existe déjà')
    } else {
      console.error('   ❌ Erreur:', clientAuthError.message)
    }
  } else {
    console.log('   ✅ Compte client créé!')

    // Créer le profil client
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: clientAuth.user.id,
        email: clientEmail,
        full_name: 'Jean Dupont',
        phone: '0612345678',
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.log('   ⚠️  Profil:', profileError.message)
    } else {
      console.log('   ✅ Profil client créé!')
    }
  }

  // 2. Créer le compte Artisan
  console.log('\n🔧 Création du compte ARTISAN...')
  const artisanEmail = 'artisan.test@servicesartisans.fr'
  const artisanPassword = 'Test123!'

  const { data: artisanAuth, error: artisanAuthError } = await supabase.auth.admin.createUser({
    email: artisanEmail,
    password: artisanPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Pierre Martin',
      role: 'artisan'
    }
  })

  if (artisanAuthError) {
    if (artisanAuthError.message.includes('already been registered')) {
      console.log('   ⚠️  Le compte artisan existe déjà')
    } else {
      console.error('   ❌ Erreur:', artisanAuthError.message)
    }
  } else {
    console.log('   ✅ Compte artisan créé!')

    // Créer le profil artisan
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: artisanAuth.user.id,
        email: artisanEmail,
        full_name: 'Pierre Martin',
        phone: '0698765432',
        role: 'artisan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.log('   ⚠️  Profil:', profileError.message)
    } else {
      console.log('   ✅ Profil artisan créé!')
    }

    // Créer l'entrée provider
    const { error: providerError } = await supabase
      .from('providers')
      .upsert({
        id: artisanAuth.user.id,
        user_id: artisanAuth.user.id,
        company_name: 'Plomberie Martin',
        slug: 'plomberie-martin',
        description: 'Plombier professionnel avec 15 ans d\'expérience. Interventions rapides sur Paris et Île-de-France.',
        services: ['Plomberie', 'Chauffage', 'Sanitaire'],
        service_area: ['Paris', 'Île-de-France'],
        address: '123 Rue de la Plomberie',
        city: 'Paris',
        postal_code: '75001',
        phone: '0698765432',
        email: artisanEmail,
        siret: '12345678901234',
        is_verified: true,
        is_active: true,
        rating: 4.8,
        review_count: 47,
        hourly_rate: 55,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (providerError) {
      console.log('   ⚠️  Provider:', providerError.message)
    } else {
      console.log('   ✅ Fiche artisan créée!')
    }
  }

  // 3. Créer un compte Admin
  console.log('\n👑 Création du compte ADMIN...')
  const adminEmail = 'admin@servicesartisans.fr'
  const adminPassword = 'Test123!'

  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin ServicesArtisans',
      role: 'admin'
    }
  })

  if (adminAuthError) {
    if (adminAuthError.message.includes('already been registered')) {
      console.log('   ⚠️  Le compte admin existe déjà')
    } else {
      console.error('   ❌ Erreur:', adminAuthError.message)
    }
  } else {
    console.log('   ✅ Compte admin créé!')

    // Créer le profil admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminAuth.user.id,
        email: adminEmail,
        full_name: 'Admin ServicesArtisans',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.log('   ⚠️  Profil:', profileError.message)
    } else {
      console.log('   ✅ Profil admin créé!')
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50))
  console.log('📋 COMPTES DE TEST CRÉÉS')
  console.log('='.repeat(50))
  console.log('\n👤 COMPTE CLIENT:')
  console.log(`   Email:    ${clientEmail}`)
  console.log(`   Password: ${clientPassword}`)
  console.log(`   URL:      http://localhost:3001/espace-client`)

  console.log('\n🔧 COMPTE ARTISAN:')
  console.log(`   Email:    ${artisanEmail}`)
  console.log(`   Password: ${artisanPassword}`)
  console.log(`   URL:      http://localhost:3001/espace-artisan`)

  console.log('\n👑 COMPTE ADMIN:')
  console.log(`   Email:    ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   URL:      http://localhost:3001/admin`)

  console.log('\n🔐 PAGE DE CONNEXION: http://localhost:3001/connexion')
  console.log('='.repeat(50))
}

createTestAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erreur:', err)
    process.exit(1)
  })
