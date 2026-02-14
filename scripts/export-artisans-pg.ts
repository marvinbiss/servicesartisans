/**
 * Export artisans via direct Postgres — par département, 4 workers parallèles.
 * Chaque worker a sa propre connexion et traite 1/4 des départements.
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const CACHE_DIR = path.join(__dirname, '.enrich-data')
const CACHE_FILE = path.join(CACHE_DIR, 'artisans-cache.jsonl')
const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const WORKERS = 4

const DEPTS = [
  '01','02','03','04','05','06','07','08','09','10',
  '11','12','13','14','15','16','17','18','19','2A','2B',
  '21','22','23','24','25','26','27','28','29',
  '30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48','49',
  '50','51','52','53','54','55','56','57','58','59',
  '60','61','62','63','64','65','66','67','68','69',
  '70','71','72','73','74','75','76','77','78','79',
  '80','81','82','83','84','85','86','87','88','89',
  '90','91','92','93','94','95',
  '971','972','973','974','976',
]

async function createClient(): Promise<Client> {
  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  await client.query('SET statement_timeout = 0')
  return client
}

async function workerFn(workerId: number, depts: string[], outFile: string): Promise<number> {
  const client = await createClient()
  const outStream = fs.createWriteStream(outFile)
  let count = 0

  for (const dept of depts) {
    let retries = 0
    let rows: any[] = []

    while (retries < 5) {
      try {
        const result = await client.query(
          `SELECT id, name, phone, address_postal_code as cp, address_city as city, address_department as dept, is_active
           FROM providers WHERE address_department = $1`,
          [dept]
        )
        rows = result.rows.filter((r: any) => r.is_active)
        break
      } catch (e: any) {
        retries++
        console.log(`  [W${workerId}] ⚠ Dept ${dept}: ${e.message} (retry ${retries})`)
        await new Promise(r => setTimeout(r, 3000 * retries))
        if (retries >= 3) {
          try { await client.end() } catch {}
          const newClient = await createClient()
          Object.assign(client, newClient)
        }
      }
    }

    for (const row of rows) {
      const { is_active, ...data } = row
      outStream.write(JSON.stringify(data) + '\n')
      count++
    }

    console.log(`  [W${workerId}] Dept ${dept}: ${rows.length.toLocaleString('fr-FR')} | sous-total: ${count.toLocaleString('fr-FR')}`)
  }

  outStream.end()
  await new Promise(resolve => outStream.on('finish', resolve))
  try { await client.end() } catch {}
  return count
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log(`  EXPORT ARTISANS — POSTGRES (${WORKERS} workers parallèles)`)
  console.log('='.repeat(60))
  const startTime = Date.now()

  // Split departments across workers
  const chunks: string[][] = Array.from({ length: WORKERS }, () => [])
  DEPTS.forEach((d, i) => chunks[i % WORKERS].push(d))

  for (let i = 0; i < WORKERS; i++) {
    console.log(`  Worker ${i}: ${chunks[i].length} depts (${chunks[i][0]}..${chunks[i][chunks[i].length - 1]})`)
  }
  console.log()

  // Each worker writes to its own temp file
  const tempFiles = chunks.map((_, i) => path.join(CACHE_DIR, `artisans-part-${i}.jsonl`))

  // Run all workers in parallel
  const results = await Promise.all(
    chunks.map((depts, i) => workerFn(i, depts, tempFiles[i]))
  )

  const total = results.reduce((a, b) => a + b, 0)

  // Merge temp files into final cache
  const finalStream = fs.createWriteStream(CACHE_FILE)
  for (const tf of tempFiles) {
    const content = fs.readFileSync(tf, 'utf-8')
    if (content) finalStream.write(content)
    fs.unlinkSync(tf)
  }
  finalStream.end()
  await new Promise(resolve => finalStream.on('finish', resolve))

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const rate = elapsed > 0 ? Math.round(total / elapsed) : 0
  console.log(`\n  ✓ ${total.toLocaleString('fr-FR')} artisans exportés`)
  console.log(`  Vitesse: ${rate}/s (${WORKERS} workers)`)
  console.log(`  Durée: ${elapsed}s`)
  console.log(`  → artisans-cache.jsonl`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e.message); process.exit(1) })
