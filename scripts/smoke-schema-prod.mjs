#!/usr/bin/env node
// Smoke test post-deploy : vérifie que les colonnes critiques attendues par le
// code applicatif existent réellement en prod. Audit 2026-04-25 a flaggé deux
// drifts schéma silencieux (`profiles.phone_e164` et `providers.is_rge`) qui
// avaient causé respectivement 295 events Sentry et 0 visibility avant
// migration 448. Ce script doit tourner après chaque migration en prod ET dans
// un cron quotidien pour détecter toute nouvelle dérive avant que ça crashe
// les pages publiques.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/smoke-schema-prod.mjs
//
// Exit codes:
//   0 = toutes les colonnes attendues existent
//   1 = au moins une colonne manquante (alerter ops)

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis')
  process.exit(2)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

// Liste exhaustive des colonnes referencées par le code et qui ont déjà
// drifté hors-Git ou risquent de drifter. Chaque entrée = (table, column,
// commentaire). On cible les colonnes des hot paths : profiles (auth/CRUD),
// providers (CEE flow + RGE filtering), reviews (templates SEO), bookings.
const EXPECTED = [
  ['profiles', 'phone_e164', 'restored by migration 474'],
  ['profiles', 'email', ''],
  ['profiles', 'full_name', ''],
  ['profiles', 'is_admin', ''],
  ['profiles', 'user_type', ''],
  ['providers', 'is_rge', 'added by migration 448 — referenced by espace-artisan/cee'],
  ['providers', 'rge_qualifications', 'added by migration 448'],
  ['providers', 'name', 'NOT company_name'],
  ['providers', 'address_city', ''],
  ['providers', 'noindex', ''],
  ['providers', 'stable_id', ''],
  ['reviews', 'content', 'NOT comment — fix 3a82763a3'],
  ['reviews', 'rating', ''],
  ['reviews', 'status', ''],
  ['bookings', 'client_id', ''],
  ['bookings', 'provider_id', ''],
  ['bookings', 'status', ''],
  ['bookings', 'scheduled_date', ''],
]

const failures = []
for (const [table, column, note] of EXPECTED) {
  const { error } = await supabase.from(table).select(column).limit(1)
  if (error) {
    failures.push({ table, column, note, error: error.message })
  }
}

if (failures.length > 0) {
  console.error('\n❌ Schema drift detected :\n')
  for (const f of failures) {
    console.error(`  - ${f.table}.${f.column}  ${f.note ? `(${f.note})` : ''}`)
    console.error(`    → ${f.error}`)
  }
  console.error(`\n${failures.length} colonne(s) manquante(s) en prod.\n`)
  process.exit(1)
}

console.log(`✅ Schema prod OK — ${EXPECTED.length} colonnes vérifiées.`)
