#!/usr/bin/env npx tsx
/**
 * enrich-rge-ademe.ts — Match providers avec le dataset RGE ADEME officiel.
 *
 * Source    : https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2
 * Dataset   : data.gouv.fr / liste-des-entreprises-rge-2
 * Licence   : Etalab 2.0 — attribution "Source : ADEME — France Rénov'" obligatoire
 * Volume    : ~60-75k entreprises RGE actives, ~150-200k lignes (1 ligne = 1 qualification)
 *
 * Stratégie Phase 1 (matching only) :
 *   1. Télécharge toutes les qualifications actives depuis l'API ADEME
 *   2. Groupe par SIRET → agrège les qualifications par entreprise
 *   3. Match contre providers.siret → UPDATE les colonnes rge_*
 *   4. Backfill communes.nb_artisans_rge via agrégat SQL
 *
 * Phase 2 (PR séparée) : importer les RGE absents de notre base comme
 * fiches non-revendiquées (axe acquisition artisans).
 *
 * Usage :
 *   npx tsx scripts/enrich-rge-ademe.ts                 # Sync complet
 *   npx tsx scripts/enrich-rge-ademe.ts --dry-run       # Aucun UPDATE, log seulement
 *   npx tsx scripts/enrich-rge-ademe.ts --limit 1000    # N'ingère que 1000 lignes ADEME
 *   npx tsx scripts/enrich-rge-ademe.ts --skip-backfill # Saute le backfill communes
 *
 * Env requis :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ADEME data-fair endpoint — pagination par cursor `after` (recommandé pour >10k lignes)
const ADEME_BASE = 'https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines'
const ADEME_PAGE_SIZE = 10_000
const ADEME_USER_AGENT = 'servicesartisans-rge-sync/1.0 (contact@servicesartisans.fr)'

// CLI flags
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const SKIP_BACKFILL = args.includes('--skip-backfill')
const LIMIT_ARG = args.find(a => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Ligne brute du dataset ADEME (schéma confirmé 2026-04-09 via dry-run).
 * Chaque ligne = UNE qualification pour UN SIRET donné.
 * Total dataset : ~165k lignes.
 */
interface AdemeRgeRow {
  _id?: string
  siret?: string
  nom_entreprise?: string
  code_qualification?: string
  nom_qualification?: string
  nom_certificat?: string
  organisme?: string
  domaine?: string          // ex: "Architecte", "Isolation thermique", "Pompe à chaleur"
  meta_domaine?: string     // ex: "Rénovation globale", "Chauffage", "Isolation"
  particulier?: boolean
  lien_date_debut?: string  // ISO YYYY-MM-DD
  lien_date_fin?: string    // ISO YYYY-MM-DD (2099-01-01 si indéfini)
  url_qualification?: string
  adresse?: string
  code_postal?: string
  commune?: string
  latitude?: number
  longitude?: number
  telephone?: string
  email?: string
  site_internet?: string
}

interface RgeQualification {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

interface AggregatedProvider {
  siret: string
  qualifications: RgeQualification[]
  valid_until: string // ISO date, MAX(date_fin)
  organismes: string[]
  source_url: string
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeSiret(raw: string | undefined | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, '').replace(/\D/g, '')
  if (cleaned.length !== 14) return null
  return cleaned
}

function isValidDate(iso: string | undefined): boolean {
  if (!iso) return false
  const d = new Date(iso)
  return !Number.isNaN(d.getTime())
}

// ---------------------------------------------------------------------------
// 1. Fetch ADEME dataset (pagination cursor)
// ---------------------------------------------------------------------------

async function fetchAllAdemeRows(): Promise<AdemeRgeRow[]> {
  console.log('→ Fetching ADEME RGE dataset...')
  const rows: AdemeRgeRow[] = []
  let after: string | null = null
  let page = 0

  while (rows.length < LIMIT) {
    const url = new URL(ADEME_BASE)
    url.searchParams.set('size', String(Math.min(ADEME_PAGE_SIZE, LIMIT - rows.length)))
    // Filtrage client-side après fetch (le paramètre `qs` de data-fair retourne
    // 400 sur les opérateurs de date — on filtre côté JS dans aggregateBySiret)
    if (after) url.searchParams.set('after', after)

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': ADEME_USER_AGENT, Accept: 'application/json' },
    })

    if (!res.ok) {
      // Gestion 429 : backoff progressif
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '30', 10)
        console.warn(`  429 rate-limited, sleeping ${retryAfter}s...`)
        await sleep(retryAfter * 1000)
        continue
      }
      throw new Error(`ADEME API failed: ${res.status} ${res.statusText}`)
    }

    const body = await res.json() as { results?: AdemeRgeRow[]; next?: string; total?: number }
    const batch = body.results || []
    rows.push(...batch)
    page++
    console.log(`  Page ${page}: +${batch.length} rows (total: ${rows.length}${body.total ? `/${body.total}` : ''})`)

    // data-fair renvoie un `next` token ou une URL. On tente les deux conventions.
    if (!body.next || batch.length === 0) break
    // Si `next` est une URL complète, extraire le token `after`
    try {
      const nextUrl = new URL(body.next)
      after = nextUrl.searchParams.get('after')
    } catch {
      after = body.next
    }
    if (!after) break

    // Rate limit soft : 200ms entre pages (ADEME tolère ~10 req/s)
    await sleep(200)
  }

  console.log(`✓ Fetched ${rows.length} RGE qualification rows from ADEME`)
  return rows
}

// ---------------------------------------------------------------------------
// 2. Aggregate rows by SIRET
// ---------------------------------------------------------------------------

function aggregateBySiret(rows: AdemeRgeRow[]): Map<string, AggregatedProvider> {
  console.log('→ Aggregating rows by SIRET...')
  const byS: Map<string, AggregatedProvider> = new Map()
  const today = new Date().toISOString().slice(0, 10)
  let skipped = 0
  let expired = 0

  for (const row of rows) {
    const siret = normalizeSiret(row.siret)
    if (!siret) { skipped++; continue }
    if (!isValidDate(row.lien_date_debut) || !isValidDate(row.lien_date_fin)) { skipped++; continue }
    if (!row.code_qualification || !row.nom_qualification || !row.organisme) { skipped++; continue }

    const dateFin = row.lien_date_fin!.slice(0, 10)
    // Filtre client-side : on ignore les qualifs expirées
    if (dateFin < today) { expired++; continue }

    const qual: RgeQualification = {
      code: row.code_qualification,
      nom: row.nom_qualification,
      organisme: row.organisme,
      domaine: row.domaine || null,
      meta_domaine: row.meta_domaine || null,
      date_debut: row.lien_date_debut!.slice(0, 10),
      date_fin: dateFin,
      url: row.url_qualification || null,
    }

    const existing = byS.get(siret)
    if (existing) {
      // Dédup par code qualif + organisme (un artisan peut avoir la même qualif via 2 certificateurs)
      const dupKey = `${qual.code}|${qual.organisme}`
      const alreadyThere = existing.qualifications.find(q => `${q.code}|${q.organisme}` === dupKey)
      if (!alreadyThere) {
        existing.qualifications.push(qual)
        if (qual.date_fin > existing.valid_until) existing.valid_until = qual.date_fin
        if (!existing.organismes.includes(qual.organisme)) existing.organismes.push(qual.organisme)
      }
    } else {
      byS.set(siret, {
        siret,
        qualifications: [qual],
        valid_until: qual.date_fin,
        organismes: [qual.organisme],
        // Lien vers l'annuaire officiel france-renov (plus stable que url_qualification
        // qui pointe vers le certificateur et peut varier)
        source_url: `https://france-renov.gouv.fr/annuaire-rge?siret=${siret}`,
      })
    }
  }

  if (expired > 0) console.log(`  Filtered ${expired} expired qualifications (lien_date_fin < ${today})`)

  // Cap à 10 qualifs / 5 organismes par entreprise (matches CHECK constraints migration 380)
  for (const agg of byS.values()) {
    if (agg.qualifications.length > 10) agg.qualifications = agg.qualifications.slice(0, 10)
    if (agg.organismes.length > 5) agg.organismes = agg.organismes.slice(0, 5)
  }

  console.log(`✓ Aggregated into ${byS.size} unique SIRET (skipped ${skipped} invalid rows)`)
  return byS
}

// ---------------------------------------------------------------------------
// 3. Match against providers and UPDATE
// ---------------------------------------------------------------------------

async function matchAndUpdate(aggregated: Map<string, AggregatedProvider>): Promise<{ matched: number; updated: number }> {
  console.log('→ Matching against providers.siret...')

  const sirets = Array.from(aggregated.keys())
  const BATCH = 500
  let matched = 0
  let updated = 0
  const now = new Date().toISOString()

  for (let i = 0; i < sirets.length; i += BATCH) {
    const chunk = sirets.slice(i, i + BATCH)

    // Fetch existing providers
    const { data: providers, error: selErr } = await supabase
      .from('providers')
      .select('id, siret')
      .in('siret', chunk)

    if (selErr) {
      console.error(`  batch ${i}-${i + BATCH}: SELECT failed`, selErr)
      continue
    }
    if (!providers || providers.length === 0) continue

    matched += providers.length

    if (DRY_RUN) {
      console.log(`  [dry-run] would update ${providers.length} providers`)
      continue
    }

    // UPDATE one by one (Supabase n'a pas d'UPDATE multi-row avec valeurs différentes
    // dans la même requête → on paie le coût, mais c'est ~30k updates max et c'est
    // en cron quotidien, acceptable).
    for (const p of providers) {
      const agg = aggregated.get(p.siret!)
      if (!agg) continue

      const { error: updErr } = await supabase
        .from('providers')
        .update({
          rge_qualifications: agg.qualifications,
          rge_valid_until: agg.valid_until,
          rge_organismes: agg.organismes,
          rge_last_synced_at: now,
          rge_source_url: agg.source_url,
        })
        .eq('id', p.id)

      if (updErr) {
        console.error(`  UPDATE failed for ${p.id}:`, updErr.message)
        continue
      }
      updated++
    }

    console.log(`  batch ${i}-${i + chunk.length}: matched ${providers.length}, updated ${updated}`)
  }

  console.log(`✓ Matched ${matched} providers, updated ${updated}`)
  return { matched, updated }
}

// ---------------------------------------------------------------------------
// 4. Clear stale RGE on providers no longer in dataset
// ---------------------------------------------------------------------------

async function clearStaleRge(currentSirets: Set<string>): Promise<number> {
  console.log('→ Clearing stale RGE on providers no longer in ADEME dataset...')

  // Providers qui ont un RGE stocké mais dont le SIRET n'est plus dans le dataset
  // (expiration, radiation, changement SIRET) → on nettoie pour éviter faux badges.
  const { data: stale, error } = await supabase
    .from('providers')
    .select('id, siret')
    .not('rge_valid_until', 'is', null)

  if (error || !stale) {
    console.error('  Failed to fetch stale:', error)
    return 0
  }

  const toClear = stale.filter(p => !p.siret || !currentSirets.has(p.siret))
  if (toClear.length === 0) {
    console.log('  No stale RGE to clear')
    return 0
  }

  if (DRY_RUN) {
    console.log(`  [dry-run] would clear ${toClear.length} stale RGE`)
    return toClear.length
  }

  const { error: updErr } = await supabase
    .from('providers')
    .update({
      rge_qualifications: null,
      rge_valid_until: null,
      rge_organismes: null,
      rge_source_url: null,
      // on garde rge_last_synced_at pour la traçabilité
    })
    .in('id', toClear.map(p => p.id))

  if (updErr) {
    console.error('  Clear failed:', updErr)
    return 0
  }

  console.log(`✓ Cleared ${toClear.length} stale RGE`)
  return toClear.length
}

// ---------------------------------------------------------------------------
// 5. Backfill communes.nb_artisans_rge
// ---------------------------------------------------------------------------

async function backfillCommunes(): Promise<void> {
  if (SKIP_BACKFILL) {
    console.log('→ Skipping commune backfill (--skip-backfill)')
    return
  }

  console.log('→ Backfilling communes.nb_artisans_rge...')

  if (DRY_RUN) {
    console.log('  [dry-run] would execute SQL UPDATE on communes')
    return
  }

  // Nécessite une fonction RPC côté DB car pas de SQL arbitraire via supabase-js.
  // À créer dans une migration suivante ; en attendant, on fait la version JS.
  const { data: communes, error } = await supabase
    .from('communes')
    .select('slug, name')
    .eq('is_active', true)

  if (error || !communes) {
    console.error('  Failed to fetch communes:', error)
    return
  }

  let updated = 0
  for (const c of communes) {
    const { count, error: cntErr } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('address_city', c.name)
      .gt('rge_valid_until', new Date().toISOString().slice(0, 10))

    if (cntErr) continue

    const { error: updErr } = await supabase
      .from('communes')
      .update({ nb_artisans_rge: count || 0 })
      .eq('slug', c.slug)

    if (!updErr) updated++
  }

  console.log(`✓ Backfilled ${updated} communes`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const t0 = Date.now()
  console.log('═══ enrich-rge-ademe ═══')
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}`)
  console.log(`Limit: ${LIMIT === Infinity ? 'none' : LIMIT}`)
  console.log('')

  const rows = await fetchAllAdemeRows()
  const aggregated = aggregateBySiret(rows)
  const { matched, updated } = await matchAndUpdate(aggregated)
  const cleared = await clearStaleRge(new Set(aggregated.keys()))
  await backfillCommunes()

  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  console.log('')
  console.log('═══ Summary ═══')
  console.log(`  ADEME rows fetched : ${rows.length}`)
  console.log(`  Unique SIRETs      : ${aggregated.size}`)
  console.log(`  Providers matched  : ${matched}`)
  console.log(`  Providers updated  : ${updated}`)
  console.log(`  Stale cleared      : ${cleared}`)
  console.log(`  Duration           : ${dt}s`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
