import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'db.umjmbdbwcsxrvfqktiui.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Bulgarie93@',
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()
  const r = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'providers'
    AND (column_name LIKE '%noindex%' OR column_name LIKE '%index%' OR column_name LIKE '%seo%' OR column_name LIKE '%robot%')
    ORDER BY column_name
  `)
  console.log('Columns matching noindex/index/seo/robot:')
  if (r.rows.length === 0) console.log('  (none found)')
  r.rows.forEach(row => console.log(' ', row.column_name, '-', row.data_type))

  // Also check all boolean columns
  const r2 = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'providers' AND data_type = 'boolean'
    ORDER BY column_name
  `)
  console.log('\nAll boolean columns:')
  r2.rows.forEach(row => console.log(' ', row.column_name))

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
