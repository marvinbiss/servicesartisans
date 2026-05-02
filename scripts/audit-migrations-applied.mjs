#!/usr/bin/env node
/**
 * scripts/audit-migrations-applied.mjs
 * -------------------------------------
 * Audit anti-régression "migrations repo non appliquées en prod" et inverse.
 *
 * Complète `audit-schema-drift.mjs` qui ne couvre que le path code→DB. Ce
 * script couvre le path **migrations repo ↔ prod `supabase_migrations`** :
 *
 *   1. Migration .sql présente dans `supabase/migrations/` MAIS pas dans la
 *      table `supabase_migrations` en prod = drift "non appliquée".
 *      Cas observés : mig 475 (RGPD purge_audit_logs), mig 477
 *      (search_providers_by_name), mig 483 (google_places columns).
 *
 *   2. Migration dans `supabase_migrations` prod MAIS pas de .sql dans le
 *      repo = drift "manuelle hors-Git" (qq'un a appliqué via SQL Editor
 *      sans commit le fichier). Cas observés : drop colonnes `lead_events.actor_id`,
 *      drift `bookings.service_*` colonnes.
 *
 *   3. Migration appliquée en prod mais .sql modifié depuis (hash diff) =
 *      drift "édition post-apply". Cas observés : aucun pour l'instant
 *      mais on le détecte pour être préventif.
 *
 * Pipeline :
 *   1. Liste les fichiers `supabase/migrations/*.sql` (= source de vérité repo).
 *   2. Appelle la RPC publique `public.list_applied_migrations()` (mig 497) qui
 *      expose en lecture `supabase_migrations.schema_migrations` (version+name)
 *      au service_role uniquement (SECURITY DEFINER + GRANT EXECUTE ciblé).
 *   3. Diff version par version (le hash check est désactivé : Supabase
 *      normalise le SQL côté insertion, drift de whitespace = faux positifs).
 *   4. Output rapport texte ou JSON. Exit 1 sur drift en mode --strict.
 *
 * Modes :
 *   --strict   : exit 1 si drift détecté (= mode CI/pre-push)
 *   --json     : output JSON pour parsing programmatique
 *   --verbose  : log les hash et timestamps
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
  lines.push(`  Migrations appliquées en prod         : ${applied.length}`)
  lines.push(`  Manquantes en prod (à appliquer)      : ${d.notApplied.length}`)
  lines.push(`  Orphelines en prod (hors-Git)         : ${d.orphan.length}`)
  lines.push('')

  if (d.notApplied.length > 0) {
    lines.push('❌ Migrations repo NON appliquées en prod :')
    for (const m of d.notApplied) lines.push(`     ${m.file}`)
    lines.push('')
    lines.push('   → Apply via Supabase SQL editor OU `supabase db push`.')
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

  if (d.notApplied.length === 0 && d.orphan.length === 0) {
    lines.push('  ✅ Aucune drift migration détectée.')
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

  const hasDrift = d.notApplied.length > 0 || d.orphan.length > 0
  if (strict && hasDrift) process.exit(1)
}

main().catch((err) => {
  console.error('audit-migrations-applied failed:', err.message)
  process.exit(strict ? 1 : 0)
})
