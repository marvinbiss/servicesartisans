/**
 * Script pour réinitialiser les mots de passe des comptes de test
 * Usage: npx tsx scripts/reset-passwords.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPasswords() {
  console.log('🔐 Réinitialisation des mots de passe...\n')

  const accounts = [
    { email: 'admin@servicesartisans.fr', password: 'Test123!', role: 'Admin' },
    { email: 'artisan.test@servicesartisans.fr', password: 'Test123!', role: 'Artisan' },
    { email: 'client.test@servicesartisans.fr', password: 'Test123!', role: 'Client' },
  ]

  for (const account of accounts) {
    console.log(`🔑 Mise à jour ${account.role} (${account.email})...`)
    
    try {
      // Récupérer l'utilisateur par email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error(`   ❌ Erreur récupération users:`, listError.message)
        continue
      }

      const user = users.users.find(u => u.email === account.email)
      
      if (!user) {
        console.log(`   ⚠️  Compte non trouvé - création...`)
        
        // Créer le compte s'il n'existe pas
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.role,
            role: account.role.toLowerCase()
          }
        })
        
        if (createError) {
          console.error(`   ❌ Erreur création:`, createError.message)
        } else {
          console.log(`   ✅ Compte créé avec mot de passe: ${account.password}`)
        }
      } else {
        // Mettre à jour le mot de passe
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: account.password }
        )
        
        if (updateError) {
          console.error(`   ❌ Erreur mise à jour:`, updateError.message)
        } else {
          console.log(`   ✅ Mot de passe mis à jour: ${account.password}`)
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Erreur:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉCAPITULATIF DES COMPTES')
  console.log('='.repeat(60))
  console.log('Email                              | Mot de passe')
  console.log('-'.repeat(60))
  console.log('admin@servicesartisans.fr          | Test123!')
  console.log('artisan.test@servicesartisans.fr   | Test123!')
  console.log('client.test@servicesartisans.fr    | Test123!')
  console.log('='.repeat(60))
  console.log('\n✅ Vous pouvez maintenant vous connecter sur:')
  console.log('   - Admin: https://servicesartisans.fr/admin')
  console.log('   - Artisan: https://servicesartisans.fr/espace-artisan')
  console.log('   - Client: https://servicesartisans.fr/espace-client')
}

resetPasswords()
  .then(() => {
    console.log('\n✅ Réinitialisation terminée!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
