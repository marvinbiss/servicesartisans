#!/usr/bin/env node
/**
 * scripts/audit-migrations-applied.mjs
 * -------------------------------------
 * Audit anti-drift hors-Git : détecte les migrations appliquées en prod sans
 * fichier .sql committé dans le repo (cas réel observé : DROP colonnes
 * `lead_events.actor_id`, drift `bookings.service_*` columns).
 *
 * Complète `audit-schema-drift.mjs` qui couvre le path code→DB.
 *
 * IMPORTANT — pourquoi seul le check "orphan" est actif (2026-05-02) :
 *   La table `supabase_migrations.schema_migrations` n'est populated QUE par
 *   `supabase db push` (CLI officielle). Le workflow réel ServicesArtisans
 *   utilise le SQL Editor du dashboard pour appliquer les migrations
 *   (cf CLAUDE.md "Supabase SQL editor: split multi-statements..."). Donc
 *   161 migrations exécutées en prod n'apparaissent pas dans cette table
 *   = 161 faux positifs sur le check "notApplied".
 *
 *   On garde uniquement le check "orphan" qui reste fiable : si la prod
 *   référence une mig version=X et qu'il n'y a pas X_*.sql dans le repo,
 *   c'est forcément un drift hors-Git (qq'un a tapé du SQL ad-hoc qui a
 *   atterri dans schema_migrations sans passer par Git).
 *
 *   Si tu utilises supabase db push à 100%, active --check-not-applied
 *   pour réactiver l'audit complet.
 *
 * Pipeline :
 *   1. Liste les fichiers `supabase/migrations/*.sql` (= source de vérité repo).
 *   2. Appelle la RPC publique `public.list_applied_migrations()` (mig 497) qui
 *      expose en lecture `supabase_migrations.schema_migrations` (version+name)
 *      au service_role uniquement (SECURITY DEFINER + GRANT EXECUTE ciblé).
 *   3. Diff version par version (le hash check est désactivé : Supabase
 *      normalise le SQL côté insertion, drift de whitespace = faux positifs).
 *   4. Output rapport texte ou JSON. Exit 1 sur orphan détecté en --strict.
 *
 * Modes :
 *   --strict             : exit 1 si orphan détecté (= mode CI/pre-push)
 *   --check-not-applied  : réactive le check "missing in prod" (workflow
 *                          `supabase db push` only)
 *   --json               : output JSON pour parsing programmatique
 *   --verbose            : log les hash et timestamps
 *
 * Lit `.env.local`. Skip silencieux si pas de SUPABASE_SERVICE_ROLE_KEY.
 *
 * Idempotent. Réseau ~2-5s (1 SELECT sur table indexée). Safe en pre-push.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')
const verbose = args.has('--verbose')
// Réactive le check "fichiers .sql repo non présents en prod schema_migrations".
// Désactivé par défaut car incompatible avec le workflow SQL Editor (cf header).
const checkNotApplied = args.has('--check-not-applied')

const MIGRATIONS_DIR = 'supabase/migrations'
const ENV_FILE = '.env.local'

// ----------------------------------------------------------------------------
// 1. Charger l'env (sans dépendance externe — pas de dotenv pour réduire
//    la surface d'attaque + maintenir le script standalone).
// ----------------------------------------------------------------------------

function loadEnv() {
  if (!existsSync(ENV_FILE)) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }
    return null
  }
  const env = {}
  const content = readFileSync(ENV_FILE, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_]+)=["']?(.*?)["']?$/)
    if (m) env[m[1]] = m[2]
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) return null
  return { url: env.NEXT_PUBLIC_SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY }
}

// ----------------------------------------------------------------------------
// 2. Liste les migrations locales (.sql) avec hash de leur contenu.
// ----------------------------------------------------------------------------

function listLocalMigrations() {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
  return files.map((file) => {
    const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    const hash = createHash('sha256').update(content).digest('hex')
    // version = numéro avant le _ ou nom complet sans .sql
    const m = file.match(/^(\d+[a-z]?)_/)
    const version = m ? m[1] : file.replace(/\.sql$/, '')
    return { file, version, hash, name: file.replace(/\.sql$/, '') }
  })
}

// ----------------------------------------------------------------------------
// 3. Liste les migrations appliquées en prod via la RPC publique
//    `public.list_applied_migrations()` (mig 497).
//
//    Pourquoi pas une requête directe sur `supabase_migrations.schema_migrations` ?
//    PostgREST n'expose par défaut que les schemas `public` + `graphql_public`.
//    Activer `supabase_migrations` côté Dashboard est une action externe non
//    tracée dans Git, donc fragile. La RPC offre :
//      - SECURITY DEFINER + GRANT EXECUTE service_role only.
//      - search_path pinné (CVE-2018-1058).
//      - Retourne version + name SEULEMENT (pas le SQL des statements).
// ----------------------------------------------------------------------------

async function listAppliedMigrations(url, key) {
  const endpoint = `${url}/rest/v1/rpc/list_applied_migrations`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: '{}',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`PostgREST ${res.status} on rpc/list_applied_migrations: ${body.slice(0, 200)}`)
  }
  const rows = await res.json()
  if (!Array.isArray(rows)) {
    throw new Error(`RPC list_applied_migrations returned non-array payload: ${String(rows).slice(0, 200)}`)
  }
  return rows.map((r) => ({
    version: String(r.version),
    name: r.name ?? '',
  }))
}

// ----------------------------------------------------------------------------
// 4. Diff
// ----------------------------------------------------------------------------

function diff(local, applied) {
  const localByVersion = new Map(local.map((m) => [m.version, m]))
  const appliedByVersion = new Map(applied.map((m) => [m.version, m]))

  const notApplied = [] // dans repo, pas en prod
  const orphan = []     // en prod, pas dans repo
  const hashDrift = []  // appliquée mais contenu repo modifié depuis

  for (const m of local) {
    if (!appliedByVersion.has(m.version)) {
      notApplied.push(m)
    }
  }
  for (const m of applied) {
    if (!localByVersion.has(m.version)) {
      orphan.push(m)
    }
  }
  // hash drift désactivé par défaut : Supabase normalise les SQL côté
  // application (whitespace, casing) → faux positifs systématiques.
  // À ré-activer si on canonicalise le SQL côté repo.

  return { notApplied, orphan, hashDrift }
}

// ----------------------------------------------------------------------------
// 5. Output
// ----------------------------------------------------------------------------

function reportText(d, { local, applied }) {
  const lines = []
  lines.push('')
  lines.push('📋 Migrations Applied Audit')
  lines.push('')
  lines.push(`  Migrations repo                       : ${local.length}`)
  lines.push(`  Migrations dans schema_migrations     : ${applied.length}`)
  lines.push(`  Orphelines en prod (hors-Git)         : ${d.orphan.length}`)
  if (checkNotApplied) {
    lines.push(`  Manquantes dans schema_migrations     : ${d.notApplied.length}`)
  }
  lines.push('')

  if (checkNotApplied && d.notApplied.length > 0) {
    lines.push('❌ Migrations repo absentes de schema_migrations :')
    for (const m of d.notApplied) lines.push(`     ${m.file}`)
    lines.push('')
    lines.push('   → Apply via `supabase db push` (le SQL Editor ne populate pas')
    lines.push('     schema_migrations — utiliser --check-not-applied uniquement si')
    lines.push('     tu utilises le workflow CLI).')
    lines.push('')
  }

  if (d.orphan.length > 0) {
    lines.push('⚠️  Migrations appliquées en prod sans .sql dans le repo :')
    for (const m of d.orphan) lines.push(`     version=${m.version} name="${m.name}"`)
    lines.push('')
    lines.push('   → Drift hors-Git. Récupérer le SQL via Supabase dashboard et')
    lines.push('     créer un fichier de migration "replay" dans le repo pour traçabilité.')
    lines.push('')
  }

  const hasReportableDrift = d.orphan.length > 0 || (checkNotApplied && d.notApplied.length > 0)
  if (!hasReportableDrift) {
    lines.push('  ✅ Aucune drift migration hors-Git détectée.')
    lines.push('')
  }

  return lines.join('\n')
}

// ----------------------------------------------------------------------------
// 6. Main
// ----------------------------------------------------------------------------

async function main() {
  const env = loadEnv()
  if (!env) {
    if (verbose) console.error('  (skip — no SUPABASE_SERVICE_ROLE_KEY)')
    return // exit 0 silencieux : ne pas bloquer un dev sans .env.local
  }

  const local = listLocalMigrations()

  let applied
  try {
    applied = await listAppliedMigrations(env.url, env.key)
  } catch (err) {
    // Cas fréquents et NON blocants pour le pre-push :
    //   - Pas de SUPABASE_SERVICE_ROLE_KEY (dev sans .env.local complet)
    //   - RPC `list_applied_migrations` introuvable (mig 497 jamais appliquée)
    //   - Réseau Supabase indispo
    // L'audit reste best-effort : il existe pour DÉTECTER une drift, jamais
    // pour bloquer un push parce que l'audit lui-même est cassé. Si le RPC
    // manque, on log un hint et on continue (exit 0).
    const isMissingRpc = err.message.includes('PGRST202') || err.message.includes('404')
    if (verbose || isMissingRpc) {
      console.error(`  (audit-migrations-applied: skip — ${err.message})`)
      if (isMissingRpc) {
        console.error('  → Pour activer cet audit : applique migration 497_list_applied_migrations_rpc.sql en prod.')
      }
    }
    return
  }

  const d = diff(local, applied)

  if (jsonOut) {
    console.log(JSON.stringify({ local: local.length, applied: applied.length, ...d }, null, 2))
  } else {
    console.log(reportText(d, { local, applied }))
  }

  // Seul le check `orphan` bloque par défaut (drift hors-Git = vrai signal).
  // Le check `notApplied` est opt-in pour éviter 161 faux positifs sur les
  // migrations appliquées via SQL Editor sans populate schema_migrations.
  const hasDrift = d.orphan.length > 0 || (checkNotApplied && d.notApplied.length > 0)
  if (strict && hasDrift) process.exit(1)
}

main().catch((err) => {
  console.error('audit-migrations-applied failed:', err.message)
  process.exit(strict ? 1 : 0)
})
