#!/usr/bin/env npx tsx
/**
 * Génère des fichiers SQL pour enrichir les emails providers depuis ADEME.
 * Pas de connexion Supabase nécessaire — output = fichiers .sql à exécuter
 * directement dans le SQL editor Supabase.
 *
 * Usage:
 *   npx tsx scripts/generate-ademe-email-sql.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fetchAllAdemeRows, aggregateBySiret } from '../src/lib/rge/sync'

const OUT_DIR = path.join(__dirname, 'output')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

function escapeSql(s: string): string {
  return s.replace(/'/g, "''")
}

async function main() {
  // 1. Fetch ADEME
  const rows = await fetchAllAdemeRows(Infinity, console)
  const { aggregated } = aggregateBySiret(rows, console)

  // 2. Collecter les paires siret→email
  const pairs: { siret: string; email: string }[] = []
  for (const [siret, agg] of aggregated) {
    if (agg.email) {
      pairs.push({ siret, email: agg.email })
    }
  }

  console.log(`\n→ ${pairs.length} SIRETs avec email sur ${aggregated.size} total`)

  // 3. Générer des fichiers SQL par batch de 1000 (limite SQL editor)
  const BATCH = 1000
  const files: string[] = []

  for (let i = 0; i < pairs.length; i += BATCH) {
    const batch = pairs.slice(i, i + BATCH)
    const fileNum = Math.floor(i / BATCH) + 1

    // Construire un UPDATE avec VALUES list
    const values = batch.map((p) => `('${escapeSql(p.siret)}','${escapeSql(p.email)}')`).join(',')

    const sql = `UPDATE providers p SET email = v.email FROM (VALUES ${values}) AS v(siret, email) WHERE p.siret = v.siret AND p.email IS NULL AND p.claimed_at IS NULL;`

    const fileName = `ademe-emails-${String(fileNum).padStart(3, '0')}.sql`
    const filePath = path.join(OUT_DIR, fileName)
    fs.writeFileSync(filePath, sql)
    files.push(fileName)
  }

  console.log(`\n✓ Généré ${files.length} fichiers SQL dans ${OUT_DIR}`)
  console.log(`  Total paires siret→email : ${pairs.length}`)
  console.log(`  Fichiers : ${files[0]} → ${files[files.length - 1]}`)
  console.log(`\nColle chaque fichier dans le SQL editor Supabase.`)
  console.log(`Ou bien, concatène-les et exécute en une fois si le editor le supporte.`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
