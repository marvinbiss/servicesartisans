#!/usr/bin/env node
// One-shot : applique 470b_metrics_function_flat.sql + exécute un snapshot J0.
// Lit la connexion depuis .env.local (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD).
// Utilise le pooler session (port 5432) — mêmes credentials que psql.

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

const url = env.NEXT_PUBLIC_SUPABASE_URL
const pwd = env.SUPABASE_DB_PASSWORD
if (!url || !pwd) {
  console.error('Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_DB_PASSWORD dans .env.local')
  process.exit(1)
}

const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!projectRef) {
  console.error(`Impossible d'extraire PROJECT_REF depuis ${url}`)
  process.exit(1)
}

// Essaie plusieurs connection strings possibles (pooler session, pooler transaction, direct)
const candidates = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(pwd)}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(pwd)}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(pwd)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(pwd)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(pwd)}@db.${projectRef}.supabase.co:5432/postgres`,
]

let client
let connectedUrl
for (const cs of candidates) {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } })
  try {
    await c.connect()
    client = c
    connectedUrl = cs.replace(/:[^:@]+@/, ':***@')
    break
  } catch (err) {
    console.log(`[try] ${cs.replace(/:[^:@]+@/, ':***@')} → ${err.message}`)
    await c.end().catch(() => {})
  }
}
if (!client) {
  console.error('[fail] aucune connection string ne fonctionne. Vérifie SUPABASE_DB_PASSWORD et la région du projet.')
  process.exit(1)
}
console.log(`[ok] connecté via ${connectedUrl}`)

try {
  const sql = readFileSync('supabase/migrations/470b_metrics_function_flat.sql', 'utf8')
  await client.query(sql)
  console.log('[ok] fonction snapshot_metrics_daily() créée')

  const snap = await client.query('SELECT * FROM snapshot_metrics_daily()')
  const row = snap.rows[0]
  console.log('[ok] snapshot J0 inséré :')
  console.log({
    captured_at: row.captured_at,
    providers_total: row.providers_total,
    providers_rge_active: row.providers_rge_active,
    providers_claimed: row.providers_claimed,
    devis_requests_7d: row.devis_requests_7d,
    devis_requests_total: row.devis_requests_total,
    estimation_leads_7d: row.estimation_leads_7d,
    cee_leads_7d: row.cee_leads_7d,
    reviews_total: row.reviews_total,
    reviews_published: row.reviews_published,
    reviews_7d: row.reviews_7d,
    invitations_sent_7d: row.invitations_sent_7d,
    claims_pending: row.claims_pending,
    claims_approved_7d: row.claims_approved_7d,
    providers_with_description: row.providers_with_description,
    clicks_7d: row.clicks_7d,
    conversion_rate: row.conversion_rate,
  })
} catch (err) {
  console.error('[fail]', err.message)
  process.exit(2)
} finally {
  await client.end()
}
