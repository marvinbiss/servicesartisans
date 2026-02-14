import { Client } from 'pg'

async function main() {
  console.log('Connecting...')
  const c = new Client({
    connectionString: 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  })
  await c.connect()
  console.log('Connected OK')

  const t0 = Date.now()
  const r = await c.query(
    `UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL`,
    ['0609421713', '596c3f86-290d-4226-aa52-1fd048cbbdaa']
  )
  console.log(`UPDATE: ${r.rowCount} rows in ${Date.now() - t0}ms`)

  await c.end()
  console.log('Done')
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
