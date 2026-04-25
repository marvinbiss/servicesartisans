/**
 * Script pour réinitialiser les mots de passe des comptes de test
 *
 * Usage: SEED_PASSWORD=... npx tsx scripts/reset-passwords.ts
 *
 * Sécurité (audit 2026-04-25) : aucun password en dur dans le source.
 * Le script lit `SEED_PASSWORD` de l'env ; si absent, il génère une valeur
 * aléatoire et l'imprime UNE fois sur stdout. Aucun autre console.log ne
 * révèle la valeur.
 */

import { randomBytes } from 'node:crypto'
import * as path from 'node:path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement manquantes!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

function generatePassword(): string {
  return `${randomBytes(12).toString('base64url')}!`
}

const seedPassword = process.env.SEED_PASSWORD ?? generatePassword()

async function resetPasswords() {
  console.log('🔐 Réinitialisation des mots de passe...\n')

  if (!process.env.SEED_PASSWORD) {
    console.log(
      `ℹ️  SEED_PASSWORD non fourni — mot de passe généré (1 fois) :\n   ${seedPassword}\n`
    )
  }

  const accounts = [
    { email: 'admin@servicesartisans.fr', role: 'Admin' },
    { email: 'artisan.test@servicesartisans.fr', role: 'Artisan' },
    { email: 'client.test@servicesartisans.fr', role: 'Client' },
  ]

  for (const account of accounts) {
    console.log(`🔑 Mise à jour ${account.role} (${account.email})...`)

    try {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()

      if (listError) {
        console.error(`   ❌ Erreur récupération users:`, listError.message)
        continue
      }

      const user = users.users.find((u) => u.email === account.email)

      if (!user) {
        console.log(`   ⚠️  Compte non trouvé - création...`)

        const { error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: seedPassword,
          email_confirm: true,
          user_metadata: {
            full_name: account.role,
            role: account.role.toLowerCase(),
          },
        })

        if (createError) {
          console.error(`   ❌ Erreur création:`, createError.message)
        } else {
          console.log(`   ✅ Compte créé`)
        }
      } else {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: seedPassword,
        })

        if (updateError) {
          console.error(`   ❌ Erreur mise à jour:`, updateError.message)
        } else {
          console.log(`   ✅ Mot de passe mis à jour`)
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`   ❌ Erreur:`, message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉCAPITULATIF DES COMPTES')
  console.log('='.repeat(60))
  for (const account of accounts) {
    console.log(`${account.email.padEnd(38)} | ${account.role}`)
  }
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
