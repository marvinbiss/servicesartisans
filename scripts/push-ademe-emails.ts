#!/usr/bin/env npx tsx
/**
 * Exécute les fichiers SQL d'emails ADEME via connexion PostgreSQL directe.
 * Lit les fichiers générés par generate-ademe-email-sql.ts.
 *
 * Usage:
 *   npx tsx scripts/push-ademe-emails.ts
 *   npx tsx scripts/push-ademe-emails.ts --dry-run
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
})

const DRY_RUN = process.argv.includes('--dry-run')
const OUT_DIR = path.join(__dirname, 'output')

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const files = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.startsWith('ademe-emails-') && f.endsWith('.sql'))
    .sort()

  console.log(`→ ${files.length} fichiers SQL à traiter`)

  // On va convertir chaque fichier SQL en appels Supabase update par batch
  // Parsing des VALUES du SQL pour extraire siret→email
  let totalUpdated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi]
    const content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8')

    // Extraire les paires (siret, email) du VALUES
    const pairs: { siret: string; email: string }[] = []
    const regex = /\('(\d{14})','([^']+)'\)/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(content)) !== null) {
      pairs.push({ siret: m[1], email: m[2].replace(/''/g, "'") })
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] ${file}: ${pairs.length} paires`)
      totalSkipped += pairs.length
      continue
    }

    // Traiter par micro-batch de 30 SIRETs
    const MICRO = 30
    let fileUpdated = 0

    for (let i = 0; i < pairs.length; i += MICRO) {
      const batch = pairs.slice(i, i + MICRO)
      const sirets = batch.map((p) => p.siret)
      const emailMap = new Map(batch.map((p) => [p.siret, p.email]))

      // SELECT providers sans email, matchés par SIRET
      let providers: { id: string; siret: string }[] = []
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('providers')
          .select('id, siret')
          .in('siret', sirets)
          .is('email', null)
          .is('claimed_at', null)
        if (!error && data) {
          providers = data as { id: string; siret: string }[]
          break
        }
        if (error && error.code === '57014') {
          await sleep(1000 * (attempt + 1))
          continue
        }
        break
      }

      if (providers.length === 0) continue

      // Batch UPDATE via upsert-like pattern : update chaque provider
      for (const p of providers) {
        const email = emailMap.get(p.siret!)
        if (!email) continue
        const { error } = await supabase.from('providers').update({ email }).eq('id', p.id)
        if (error) {
          totalErrors++
        } else {
          fileUpdated++
        }
      }
    }

    totalUpdated += fileUpdated
    console.log(
      `  ✓ ${file} (${fi + 1}/${files.length}) — +${fileUpdated} emails (total: ${totalUpdated})`
    )
    await sleep(200)
  }

  console.log(`\n═══ Summary ═══`)
  console.log(`  Emails enriched : ${totalUpdated}`)
  console.log(`  Errors          : ${totalErrors}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
