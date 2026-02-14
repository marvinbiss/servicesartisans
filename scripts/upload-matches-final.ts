/**
 * Upload final — UPDATE FROM VALUES par batch de 1000.
 * Chaque batch = 1 seule requête SQL, pas 1000 requêtes individuelles.
 * 16 requêtes au total pour 15 176 matches.
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const SQL_DIR = path.join(__dirname, '.enrich-data', 'matches', 'sql')

async function main() {
  console.log('\n============================================================')
  console.log('  UPLOAD FINAL — 16 batches SQL')
  console.log('============================================================')

  const files = fs.readdirSync(SQL_DIR)
    .filter(f => f.startsWith('batch-') && f.endsWith('.sql'))
    .sort()

  console.log(`  ${files.length} fichiers SQL à exécuter`)

  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  await client.query('SET statement_timeout = 0')
  console.log('  Connecté\n')

  let totalUpdated = 0
  const t0 = Date.now()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SQL_DIR, file), 'utf-8')
    const t = Date.now()
    console.log(`  ${file}...`)

    try {
      const result = await client.query(sql)
      const rows = result.rowCount || 0
      totalUpdated += rows
      console.log(`    ✓ ${rows} mis à jour (${((Date.now()-t)/1000).toFixed(1)}s)`)
    } catch (err: any) {
      console.error(`    ✗ Erreur: ${err.message}`)
    }
  }

  await client.end()

  console.log(`\n  ============ RÉSULTAT ============`)
  console.log(`  ${totalUpdated} artisans enrichis avec téléphone`)
  console.log(`  Temps: ${((Date.now()-t0)/1000).toFixed(0)}s`)
  console.log(`  ==================================\n`)
}

main().catch(err => { console.error('Erreur fatale:', err); process.exit(1) })
