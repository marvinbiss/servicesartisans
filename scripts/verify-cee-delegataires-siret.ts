#!/usr/bin/env npx tsx
/**
 * verify-cee-delegataires-siret.ts
 *
 * Vérifie et enrichit les SIRET des lignes `cee_delegataires` (migration 386/387)
 * via l'API publique officielle `recherche-entreprises.api.gouv.fr`
 * (source INSEE/Bodacc, gratuite, sans clé).
 *
 * Règle absolue (zero-tolerance sur les données légales) :
 *   Un SIRET n'est retenu QUE SI tous les critères ci-dessous sont vrais :
 *     1. L'API renvoie exactement 1 résultat actif (etat_administratif = 'A')
 *        après filtrage.
 *     2. Le nom normalisé (lower, sans accents, sans forme juridique) match la
 *        raison_sociale de la DB à >= 90% (containment strict OU Levenshtein).
 *     3. Le SIRET du siège social est disponible (`siege.siret`).
 *     4. L'entreprise est une grande entité (tranche_effectif_salarie >= '20'
 *        OU catégorie juridique >= 5500).
 *
 *   Sinon -> siret reste NULL et on propose de noter la raison dans `notes`.
 *
 * Usage :
 *   npx tsx scripts/verify-cee-delegataires-siret.ts              # dry-run par défaut
 *   npx tsx scripts/verify-cee-delegataires-siret.ts --dry-run    # idem
 *   npx tsx scripts/verify-cee-delegataires-siret.ts --apply      # écrit en DB
 *
 * Env requis (chargés depuis .env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// -----------------------------------------------------------------------------
// Env loading
// -----------------------------------------------------------------------------
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '[FATAL] Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

// -----------------------------------------------------------------------------
// CLI flags
// -----------------------------------------------------------------------------
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const dryRun = !apply // dry-run par défaut

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface DelegataireRow {
  id: string
  slug: string
  nom_commercial: string
  raison_sociale: string
  siret: string | null
  notes: string | null
}

interface ApiSiege {
  siret?: string
  etat_administratif?: string
}

interface ApiResult {
  siren?: string
  nom_complet?: string
  nom_raison_sociale?: string
  nature_juridique?: string
  tranche_effectif_salarie?: string | null
  etat_administratif?: string
  siege?: ApiSiege
  matching_etablissements?: Array<{ siret?: string; etat_administratif?: string }>
}

interface ApiResponse {
  results?: ApiResult[]
  total_results?: number
}

type Verdict =
  | { kind: 'match'; siret: string; nameScore: number; apiName: string }
  | { kind: 'ambiguous'; count: number; reason: string }
  | { kind: 'not_found'; reason: string }
  | { kind: 'rejected'; reason: string }

// -----------------------------------------------------------------------------
// Normalisation & scoring (pur, testable)
// -----------------------------------------------------------------------------

/**
 * Normalise une raison sociale pour comparaison :
 *  - lowercase
 *  - suppression des accents
 *  - suppression des formes juridiques (SA, SAS, SARL, SNC, etc.)
 *  - suppression de la ponctuation
 *  - compactage des espaces
 */
export function normalizeName(input: string): string {
  if (!input) return ''
  let s = input.toLowerCase()
  // strip accents
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // remove parentheses content like "(Economie d'Energie SAS)"
  s = s.replace(/\([^)]*\)/g, ' ')
  // remove punctuation
  s = s.replace(/[^a-z0-9\s]/g, ' ')
  // remove common legal forms (whole words)
  const legalForms = [
    'sas',
    'sasu',
    'sarl',
    'eurl',
    'sa',
    'snc',
    'sci',
    'scop',
    'sca',
    'gie',
    'selarl',
    'selas',
    'selasu',
    'societe',
    'france',
    'francaise',
  ]
  const re = new RegExp(`\\b(${legalForms.join('|')})\\b`, 'g')
  s = s.replace(re, ' ')
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

/** Levenshtein distance (iterative, O(n*m) space-optimized). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const prev = new Array<number>(b.length + 1)
  const curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return prev[b.length]
}

/**
 * Score de similarité [0,1] entre deux noms (après normalisation applied en amont).
 * Utilise le max de :
 *  - containment strict (l'un contient l'autre exactement, mot à mot)
 *  - similarité Levenshtein normalisée
 */
export function nameScore(dbName: string, apiName: string): number {
  const a = normalizeName(dbName)
  const b = normalizeName(apiName)
  if (!a || !b) return 0
  if (a === b) return 1

  // Containment strict : si l'un des deux contient entièrement l'autre
  // et que le plus petit a au moins 3 caractères utiles.
  const shorter = a.length <= b.length ? a : b
  const longer = a.length <= b.length ? b : a
  if (shorter.length >= 3) {
    const pattern = new RegExp(`(^|\\s)${escapeRegex(shorter)}(\\s|$)`)
    if (pattern.test(longer)) {
      // containment quasi-parfait, on cap à 0.95 pour préserver la marge
      return 0.95
    }
  }

  // Levenshtein normalisé
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  const sim = 1 - dist / maxLen
  return sim
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Retourne true si l'entité est jugée "grande" au sens de nos critères :
 *  - tranche_effectif_salarie >= '20' (codes INSEE 21..53), OU
 *  - nature_juridique >= 5500 (SA, SAS, grands groupes cotés, etc.)
 */
export function isLargeEntity(r: ApiResult): boolean {
  const tranche = r.tranche_effectif_salarie
  if (tranche && /^\d+$/.test(tranche)) {
    const code = parseInt(tranche, 10)
    // Codes INSEE effectif : 21 = 20-49, 22 = 50-99, ..., 53 = 10000+
    if (code >= 21) return true
  }
  const nj = r.nature_juridique
  if (nj && /^\d+$/.test(nj)) {
    const code = parseInt(nj, 10)
    if (code >= 5500) return true
  }
  return false
}

// -----------------------------------------------------------------------------
// API call
// -----------------------------------------------------------------------------

const API_BASE = 'https://recherche-entreprises.api.gouv.fr/search'
const RATE_LIMIT_MS = 200
const MATCH_THRESHOLD = 0.9

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callApi(query: string): Promise<ApiResponse> {
  const url = `${API_BASE}?q=${encodeURIComponent(query)}&etat_administratif=A&limite_matching_etablissements=5`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'servicesartisans-cee-verify/1.0' },
  })
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as ApiResponse
}

// -----------------------------------------------------------------------------
// Verdict logic
// -----------------------------------------------------------------------------

function evaluate(row: DelegataireRow, resp: ApiResponse): Verdict {
  const all = resp.results ?? []
  const active = all.filter((r) => (r.etat_administratif ?? 'A') === 'A')

  if (active.length === 0) {
    return { kind: 'not_found', reason: 'no active result' }
  }

  // Filtrer ceux qui matchent le nom (>= threshold) ET qui sont de grandes entités
  const candidates = active.filter((r) => {
    const apiName = r.nom_raison_sociale ?? r.nom_complet ?? ''
    const score = nameScore(row.raison_sociale, apiName)
    return score >= MATCH_THRESHOLD && isLargeEntity(r)
  })

  if (candidates.length === 0) {
    // Si on a des résultats actifs mais aucun ne passe les filtres, on regarde
    // si c'est un problème de nom ou de taille
    const bestScore = active.reduce((max, r) => {
      const apiName = r.nom_raison_sociale ?? r.nom_complet ?? ''
      return Math.max(max, nameScore(row.raison_sociale, apiName))
    }, 0)
    if (bestScore < MATCH_THRESHOLD) {
      return {
        kind: 'not_found',
        reason: `best name score ${(bestScore * 100).toFixed(0)}% < 90%`,
      }
    }
    return {
      kind: 'rejected',
      reason: 'name match OK but not a large entity (tranche_effectif/nature_juridique)',
    }
  }

  if (candidates.length > 1) {
    return {
      kind: 'ambiguous',
      count: candidates.length,
      reason: `${candidates.length} large entities match the name`,
    }
  }

  const only = candidates[0]
  const siret = only.siege?.siret
  if (!siret) {
    return { kind: 'rejected', reason: 'no siege.siret in API response' }
  }
  if (!/^\d{14}$/.test(siret)) {
    return { kind: 'rejected', reason: `invalid SIRET format: ${siret}` }
  }
  const apiName = only.nom_raison_sociale ?? only.nom_complet ?? ''
  const score = nameScore(row.raison_sociale, apiName)
  return { kind: 'match', siret, nameScore: score, apiName }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function fetchDelegataires(supabase: SupabaseClient): Promise<DelegataireRow[]> {
  const { data, error } = await supabase
    .from('cee_delegataires')
    .select('id, slug, nom_commercial, raison_sociale, siret, notes')
    .is('siret', null)
    .order('vague_priorite', { ascending: true })
    .order('slug', { ascending: true })
  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`)
  }
  return (data ?? []) as DelegataireRow[]
}

async function applyUpdate(
  supabase: SupabaseClient,
  row: DelegataireRow,
  siret: string
): Promise<void> {
  const { error } = await supabase.from('cee_delegataires').update({ siret }).eq('id', row.id)
  if (error) {
    throw new Error(`Update failed for ${row.slug}: ${error.message}`)
  }
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  verify-cee-delegataires-siret')
  console.log(`  Mode: ${dryRun ? 'DRY-RUN (no writes)' : 'APPLY (writes enabled)'}`)
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const rows = await fetchDelegataires(supabase)
  console.log(`Fetched ${rows.length} delegataires with siret IS NULL`)
  console.log('')

  let matched = 0
  let ambiguous = 0
  let notFound = 0
  let rejected = 0
  let errors = 0

  const details: Array<{ slug: string; verdict: Verdict | { kind: 'error'; reason: string } }> = []

  for (const row of rows) {
    try {
      const query = row.raison_sociale
      const resp = await callApi(query)
      const verdict = evaluate(row, resp)
      details.push({ slug: row.slug, verdict })

      switch (verdict.kind) {
        case 'match': {
          matched++
          console.log(
            `[OK]   ${row.slug.padEnd(18)} -> SIRET ${verdict.siret} (match ${(verdict.nameScore * 100).toFixed(0)}% | "${verdict.apiName}")`
          )
          if (apply) {
            await applyUpdate(supabase, row, verdict.siret)
            console.log(`       ↳ DB updated`)
          }
          break
        }
        case 'ambiguous': {
          ambiguous++
          console.log(
            `[AMB]  ${row.slug.padEnd(18)} -> ambiguous (${verdict.count} candidates) — ${verdict.reason}`
          )
          break
        }
        case 'not_found': {
          notFound++
          console.log(`[NF]   ${row.slug.padEnd(18)} -> not found (${verdict.reason})`)
          break
        }
        case 'rejected': {
          rejected++
          console.log(`[REJ]  ${row.slug.padEnd(18)} -> rejected (${verdict.reason})`)
          break
        }
      }
    } catch (err) {
      errors++
      const reason = err instanceof Error ? err.message : String(err)
      details.push({ slug: row.slug, verdict: { kind: 'error', reason } })
      console.log(`[ERR]  ${row.slug.padEnd(18)} -> ${reason}`)
    }
    await sleep(RATE_LIMIT_MS)
  }

  console.log('')
  console.log('═══ Summary ═══')
  console.log(`  Total processed : ${rows.length}`)
  console.log(`  Matched (100%)  : ${matched}`)
  console.log(`  Ambiguous       : ${ambiguous}`)
  console.log(`  Not found       : ${notFound}`)
  console.log(`  Rejected        : ${rejected}`)
  console.log(`  API errors      : ${errors}`)
  console.log('')
  if (dryRun) {
    console.log('DRY-RUN: no DB writes performed. Re-run with --apply after review.')
  } else {
    console.log(`APPLY: ${matched} row(s) updated in cee_delegataires.`)
  }

  // Suggested `notes` snippets for non-matched rows (for manual patch)
  const nonMatched = details.filter((d) => d.verdict.kind !== 'match')
  if (nonMatched.length > 0) {
    console.log('')
    console.log('─── Suggested notes for non-matched rows ───')
    for (const d of nonMatched) {
      const v = d.verdict
      const reason =
        v.kind === 'ambiguous' ||
        v.kind === 'not_found' ||
        v.kind === 'rejected' ||
        v.kind === 'error'
          ? v.reason
          : 'unknown'
      console.log(
        `  ${d.slug}: -- TODO: auto-match INSEE echoue (${reason}). Verif manuelle requise.`
      )
    }
  }
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
