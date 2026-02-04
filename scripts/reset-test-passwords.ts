/**
 * Script pour réinitialiser les mots de passe des comptes de test
 * Usage: npx tsx scripts/reset-test-passwords.ts
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

const NEW_PASSWORD = 'Test123!'

async function resetTestPasswords() {
  console.log('🔐 Réinitialisation des mots de passe...\n')

  const testAccounts = [
    { email: 'admin@servicesartisans.fr', name: 'ADMIN' },
    { email: 'artisan.test@servicesartisans.fr', name: 'ARTISAN' },
    { email: 'client.test@servicesartisans.fr', name: 'CLIENT' }
  ]

  for (const account of testAccounts) {
    console.log(`🔄 Traitement du compte ${account.name} (${account.email})...`)

    // 1. Trouver l'utilisateur par email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error(`   ❌ Erreur lors de la récupération des utilisateurs:`, listError.message)
      continue
    }

    const user = users.users.find(u => u.email === account.email)

    if (!user) {
      console.log(`   ⚠️  Compte non trouvé - création nécessaire`)
      console.log(`   💡 Exécutez: npx tsx scripts/create-test-accounts.ts`)
      continue
    }

    // 2. Réinitialiser le mot de passe
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: NEW_PASSWORD }
    )

    if (updateError) {
      console.error(`   ❌ Erreur lors de la mise à jour:`, updateError.message)
    } else {
      console.log(`   ✅ Mot de passe réinitialisé avec succès!`)
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(60))
  console.log('📋 MOTS DE PASSE RÉINITIALISÉS')
  console.log('='.repeat(60))
  console.log('\n🔑 NOUVEAU MOT DE PASSE POUR TOUS LES COMPTES:')
  console.log(`   ${NEW_PASSWORD}`)
  
  console.log('\n👤 COMPTES MIS À JOUR:')
  console.log(`   1️⃣  admin@servicesartisans.fr`)
  console.log(`   2️⃣  artisan.test@servicesartisans.fr`)
  console.log(`   3️⃣  client.test@servicesartisans.fr`)

  console.log('\n🌐 URLs DE CONNEXION:')
  console.log(`   👑 Admin:    https://servicesartisans.fr/admin`)
  console.log(`   🔧 Artisan:  https://servicesartisans.fr/espace-artisan`)
  console.log(`   👤 Client:   https://servicesartisans.fr/espace-client`)
  console.log(`   🔐 Login:    https://servicesartisans.fr/connexion`)
  console.log('='.repeat(60))
}

resetTestPasswords()
  .then(() => {
    console.log('\n✅ Opération terminée!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Erreur:', err)
    process.exit(1)
  })
