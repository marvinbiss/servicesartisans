#!/usr/bin/env node
/**
 * scripts/check-rls-drift.mjs
 * ----------------------------
 * Check hebdomadaire (lundi matin) : détecte les tables public sans RLS
 * et les vues sans security_invoker=true en prod Supabase.
 *
 * Contexte : drift massif 2026-04-24 (33 CRITICAL, ~55 tables exposées après
 * "Project restart failed Feb 13 2026"). Résolu via mig 472 + SQL editor A-H.
 * Ce script tourne chaque lundi pour détecter toute nouvelle régression.
 *
 * Stratégies (ordre de préférence) :
 *   1. psql via SUPABASE_DB_URL       (connexion directe)
 *   2. Supabase RPC exec_sql_check_rls_drift (doit être créé une fois)
 *
 * Variables d'env requises :
 *   NEXT_PUBLIC_SUPABASE_URL    + SUPABASE_SERVICE_ROLE_KEY   (stratégie 2)
 *   SUPABASE_DB_URL                                           (stratégie 1)
 *
 * Exit codes :
 *   0 = OK, aucun drift
 *   1 = DRIFT détecté (tables ou vues exposées)
 *   2 = ENV_MISSING (variables d'env absentes)
 *   3 = RPC_MISSING (créer la fonction via SQL editor — instructions affichées)
 */

import { execSync, spawnSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const dbUrl = process.env.SUPABASE_DB_URL

// ── PII classification ───────────────────────────────────────────────────────
const PII_TABLES = new Set([
  'profiles',
  'providers',
  'provider_claims',
  'bookings',
  'leads',
  'cee_leads',
  'cee_mandats',
  'audit_logs',
  'kyc_profiles',
  'estimation_leads',
  'lead_assignments',
  'notifications',
  'review_invitations',
  'messages',
])

// ── SQL queries ──────────────────────────────────────────────────────────────
const SQL_TABLES_NO_RLS = `
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = FALSE
  AND c.relname <> 'spatial_ref_sys'
ORDER BY 1;`

const SQL_VIEWS_NO_INVOKER = `
SELECT c.relname AS view_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'v'
  AND NOT EXISTS (
    SELECT 1 FROM pg_options_to_table(c.reloptions)
    WHERE option_name = 'security_invoker' AND option_value = 'true'
  )
ORDER BY 1;`

// ── SQL de création de la RPC (à exécuter une fois dans SQL editor) ──────────
const SQL_CREATE_RPC = `
-- À exécuter une fois dans le SQL editor Supabase pour activer la stratégie RPC.
CREATE OR REPLACE FUNCTION public.exec_sql_check_rls_drift()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_tables jsonb;
  v_views  jsonb;
BEGIN
  SELECT jsonb_agg(c.relname ORDER BY c.relname)
  INTO v_tables
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = FALSE
    AND c.relname <> 'spatial_ref_sys';

  SELECT jsonb_agg(c.relname ORDER BY c.relname)
  INTO v_views
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'v'
    AND NOT EXISTS (
      SELECT 1 FROM pg_options_to_table(c.reloptions)
      WHERE option_name = 'security_invoker' AND option_value = 'true'
    );

  RETURN jsonb_build_object(
    'tables_no_rls',    COALESCE(v_tables, '[]'::jsonb),
    'views_no_invoker', COALESCE(v_views,  '[]'::jsonb)
  );
END;
$$;

-- Restreindre l'accès au service_role uniquement (bypass RLS déjà accordé)
REVOKE ALL ON FUNCTION public.exec_sql_check_rls_drift() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql_check_rls_drift() TO service_role;
`

// ── Helpers ───────────────────────────────────────────────────────────────────
function isPsqlAvailable() {
  const r = spawnSync('which', ['psql'], { encoding: 'utf8' })
  return r.status === 0
}

function runPsql(sql) {
  const out = execSync(`psql "${dbUrl}" -t -A -c '${sql.replace(/'/g, "'\\''").replace(/\n/g, ' ')}'`, {
    timeout: 15_000,
    encoding: 'utf8',
  })
  return out.trim().split('\n').filter(Boolean)
}

function classifyTable(name) {
  return PII_TABLES.has(name) ? 'P0_PII' : 'P1_reference'
}

// ── Main ─────────────────────────────────────────────────────────────────────
let tablesNoRls = []
let viewsNoInvoker = []
let strategy = ''

if (dbUrl && isPsqlAvailable()) {
  // Stratégie 1 : connexion directe psql
  strategy = 'psql'
  try {
    tablesNoRls = runPsql(SQL_TABLES_NO_RLS)
    viewsNoInvoker = runPsql(SQL_VIEWS_NO_INVOKER)
  } catch (err) {
    console.error('psql error:', err.message)
    process.exit(2)
  }
} else if (url && key) {
  // Stratégie 2 : Supabase RPC
  strategy = 'rpc'
  const sb = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await sb.rpc('exec_sql_check_rls_drift')

  if (error) {
    console.error('RPC_MISSING:', error.message)
    console.error('\n─── Créer la RPC une fois dans le SQL editor Supabase ───')
    console.error(SQL_CREATE_RPC)
    console.error('─────────────────────────────────────────────────────────\n')
    process.exit(3)
  }

  tablesNoRls = data?.tables_no_rls ?? []
  viewsNoInvoker = data?.views_no_invoker ?? []
} else {
  console.error('ENV_MISSING: configurer SUPABASE_DB_URL (+ psql) OU NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  console.error('Env manquants dans cet environnement — configurer comme secrets dans env_01BWokwwpXA4xznSUnZU1EM2')
  process.exit(2)
}

// ── Résultats ─────────────────────────────────────────────────────────────────
const date = new Date().toISOString().split('T')[0]
const hasDrift = tablesNoRls.length > 0 || viewsNoInvoker.length > 0

if (!hasDrift) {
  console.log(`OK — RLS drift check passed [${date}] via ${strategy}`)
  console.log(`  ✓ 0 tables sans RLS`)
  console.log(`  ✓ 0 vues sans security_invoker`)
  process.exit(0)
}

// DRIFT détecté
console.error(`\n⚠️  RLS DRIFT DETECTE [${date}]\n`)

if (tablesNoRls.length > 0) {
  console.error(`Tables sans RLS (${tablesNoRls.length}) :`)
  for (const t of tablesNoRls) {
    console.error(`  - ${t}  [${classifyTable(t)}]`)
  }
}

if (viewsNoInvoker.length > 0) {
  console.error(`\nVues sans security_invoker (${viewsNoInvoker.length}) :`)
  for (const v of viewsNoInvoker) {
    console.error(`  - ${v}`)
  }
}

console.error('\n→ Référence fix : supabase/migrations/472_SQL_EDITOR_BLOCKS.md + blocs A-H')
console.error('→ Créer issue GitHub + event Sentry (P0 si tables PII)\n')

// JSON pour consommation programmatique (parsing par CI / Claude)
const result = {
  status: 'DRIFT',
  date,
  tables_no_rls: tablesNoRls.map((t) => ({ name: t, severity: classifyTable(t) })),
  views_no_invoker: viewsNoInvoker,
}
console.log('\n' + JSON.stringify(result, null, 2))

process.exit(1)
