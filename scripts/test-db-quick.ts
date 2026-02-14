import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

async function main() {
  const t0 = Date.now()
  console.log('Connecting...')
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log(`Connected (${Date.now()-t0}ms)`)

  // Disable timeout
  await client.query('SET statement_timeout = 0')
  console.log('statement_timeout = 0')

  // Test SELECT by PK (should use index, fast)
  console.log('\nTest 1: SELECT by LIMIT 1...')
  let t = Date.now()
  const r1 = await client.query("SELECT id, name, phone FROM providers LIMIT 1")
  console.log(`  ${r1.rows[0]?.name?.slice(0, 40)} — ${Date.now()-t}ms`)

  // Test UPDATE by PK (the actual operation we need)
  console.log('\nTest 2: UPDATE by PK (no-op)...')
  t = Date.now()
  const r2 = await client.query("UPDATE providers SET phone = phone WHERE id = $1", [r1.rows[0]?.id])
  console.log(`  ${r2.rowCount} rows — ${Date.now()-t}ms`)

  // Test actual UPDATE with phone IS NULL
  console.log('\nTest 3: UPDATE phone IS NULL by PK...')
  t = Date.now()
  const r3 = await client.query("UPDATE providers SET phone = '0000000000' WHERE id = '00000000-0000-0000-0000-000000000000' AND phone IS NULL")
  console.log(`  ${r3.rowCount} rows — ${Date.now()-t}ms`)

  await client.end()
  console.log(`\nDone in ${Date.now()-t0}ms total`)
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
