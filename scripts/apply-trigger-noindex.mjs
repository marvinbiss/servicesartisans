#!/usr/bin/env node
// Applique 471_trigger_sync_provider_noindex.sql + smoke test.

import { readFileSync } from 'node:fs'
import { Client } from 'pg'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      const k = l.slice(0, i).trim()
      const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
      return [k, v]
    })
)

const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1]
const pwd = env.SUPABASE_DB_PASSWORD

const client = new Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(pwd)}@db.${projectRef}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('[ok] connecté')

  const sql = readFileSync('supabase/migrations/471_trigger_sync_provider_noindex.sql', 'utf8')
  await client.query(sql)
  console.log('[ok] trigger trg_provider_noindex créé')

  // Vérif : le trigger existe bien
  const check = await client.query(`
    SELECT tgname, tgrelid::regclass AS table_name, tgenabled
    FROM pg_trigger
    WHERE tgname = 'trg_provider_noindex'
  `)
  console.log('[check] trigger pg_trigger :', check.rows)

  // Smoke test non-destructif : compte providers qui seraient re-flippés si trigger
  // tournait sur toute la table (juste informationnel, ne modifie rien).
  const stats = await client.query(`
    SELECT
      count(*) FILTER (
        WHERE is_active = true
        AND (rge_valid_until > now() OR claimed_at IS NOT NULL)
        AND noindex = true
      ) AS should_be_indexable_but_noindex,
      count(*) FILTER (
        WHERE NOT (
          is_active = true
          AND (rge_valid_until > now() OR claimed_at IS NOT NULL)
        )
        AND noindex = false
      ) AS should_be_noindex_but_indexed
    FROM public.providers
  `)
  console.log('[dérive actuelle]', stats.rows[0])

  const trig = await client.query(`
    SELECT pg_get_triggerdef(oid) AS def
    FROM pg_trigger
    WHERE tgname = 'trg_provider_noindex'
  `)
  console.log('[definition]', trig.rows[0]?.def)
} catch (err) {
  console.error('[fail]', err.message)
  process.exit(2)
} finally {
  await client.end()
}
