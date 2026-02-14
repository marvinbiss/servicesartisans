/**
 * Reconstruit le fichier .collect-progress.json
 * en vérifiant quelles combinaisons NAF×département ont déjà des artisans en base.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { supabase } from './lib/supabase-admin'
import { CODES_NAF, DEPARTEMENTS } from './lib/naf-config'

const PROGRESS_FILE = path.join(__dirname, '.collect-progress.json')

async function main() {
  console.log('Reconstruction du fichier de progression...\n')

  const completedTasks: string[] = []
  let total = 0
  const nafCodes = Object.keys(CODES_NAF)

  for (const code of nafCodes) {
    let deptCount = 0
    for (const dept of DEPARTEMENTS) {
      const { count, error } = await supabase
        .from('providers')
        .select('id', { count: 'exact', head: true })
        .eq('code_naf', code)
        .eq('address_department', dept)

      if (error) {
        console.error(`  Erreur ${code}|${dept}: ${error.message}`)
        continue
      }

      if (count && count > 0) {
        completedTasks.push(`${code}|${dept}`)
        deptCount++
      }
    }
    console.log(`  ${code} (${CODES_NAF[code].slice(0, 35)}): ${deptCount}/101 depts`)
    total += deptCount
  }

  const progress = {
    completedTasks,
    startedAt: new Date().toISOString(),
    stats: {
      totalCollected: 0,
      totalPages: 0,
      apiCalls: 0,
      errors: 0,
      truncated: 0,
    },
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
  console.log(`\nTermine: ${total}/1313 taches marquees comme completees`)
  console.log(`Fichier: ${PROGRESS_FILE}`)
}

main().catch(e => { console.error(e); process.exit(1) })
