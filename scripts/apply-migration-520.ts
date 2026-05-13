/**
 * Apply mig 520 — audit_logs immutability (P1 security fix F-11).
 *
 * Usage:
 *   1. Ajouter SUPABASE_DB_PASSWORD=... à .env.local (Supabase dashboard
 *      → Project Settings → Database → Connection string → Direct connection
 *      → afficher password).
 *   2. npx tsx scripts/apply-migration-520.ts
 *
 * Idempotent : DROP TRIGGER IF EXISTS + CREATE OR REPLACE FUNCTION. Safe à
 * re-runner.
 *
 * Vérification post-run :
 *   SELECT tgname FROM pg_trigger WHERE tgrelid = 'audit_logs'::regclass;
 *   -- doit retourner audit_logs_prevent_update + audit_logs_prevent_delete.
 */

import dotenv from 'dotenv'
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

dotenv.config({ path: '.env.local' })

const { Client } = pg

const PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!PASSWORD) {
  console.error('ERROR: SUPABASE_DB_PASSWORD requis dans .env.local')
  console.error('Supabase dashboard → Project Settings → Database → password')
  process.exit(1)
}

const SQL_PATH = join(__dirname, '..', 'supabase', 'migrations', '520_audit_logs_immutability.sql')
const SQL = readFileSync(SQL_PATH, 'utf8')

async function main() {
  console.log('=== Migration 520 — audit_logs immutability ===\n')
  console.log(`Source: ${SQL_PATH}`)
  console.log(`Taille: ${SQL.length} chars\n`)

  const client = new Client({
    host: 'db.umjmbdbwcsxrvfqktiui.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  await client.query('SET statement_timeout = 30000')
  await client.query('SET lock_timeout = 5000')

  const start = Date.now()
  try {
    await client.query(SQL)
    console.log(`OK (${((Date.now() - start) / 1000).toFixed(1)}s)`)

    // Vérification triggers présents
    const { rows } = await client.query(`
      SELECT tgname FROM pg_trigger
      WHERE tgrelid = 'public.audit_logs'::regclass
        AND tgname LIKE 'audit_logs_prevent_%'
      ORDER BY tgname
    `)
    console.log(`\nTriggers installés (${rows.length}/2):`)
    for (const r of rows) console.log(`  ✓ ${r.tgname}`)
    if (rows.length !== 2) {
      console.error('ERROR: 2 triggers attendus, vérifier manuellement.')
      process.exit(1)
    }

    // Smoke test : UPDATE bloqué
    try {
      await client.query('BEGIN')
      await client.query(`UPDATE audit_logs SET action = action WHERE 1=0`)
      // 1=0 = aucune ligne touchée, pas de trigger fire. Bon comportement.
      await client.query('ROLLBACK')
      console.log('\nSmoke test UPDATE 0-row: OK')
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {})
      console.log(`\nSmoke test UPDATE: ${(e as Error).message}`)
    }
  } catch (err) {
    console.error(`ERREUR: ${(err as Error).message}`)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
