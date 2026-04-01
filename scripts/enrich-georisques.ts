#!/usr/bin/env npx tsx
/**
 * enrich-georisques.ts — Enrich communes with natural risk data from Géorisques API.
 *
 * Sources:
 * 1. Géorisques GASPAR CatNat — catastrophe naturelle events per commune
 * 2. Géorisques Rapport Risques — risk report (inondation, argile, sismique, radon)
 *
 * Usage:
 *   npx tsx scripts/enrich-georisques.ts                    # Enrich all communes
 *   npx tsx scripts/enrich-georisques.ts --resume           # Resume from progress file
 *   npx tsx scripts/enrich-georisques.ts --limit 100        # Only process 100 communes
 *   npx tsx scripts/enrich-georisques.ts --slug paris       # Only process a specific commune
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

const BATCH_SIZE = 50
const DELAY_MS = 200
const MAX_RETRIES = 3
const PROGRESS_FILE = path.join(__dirname, '.georisques-progress.json')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface ProgressData {
  completed: string[] // code_insee values already processed
  lastUpdated: string
}

function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    }
  } catch {
    // Corrupted file — start fresh
  }
  return { completed: [], lastUpdated: new Date().toISOString() }
}

function saveProgress(progress: ProgressData) {
  progress.lastUpdated = new Date().toISOString()
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<unknown | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url)
      if (response.status === 404) return null
      if (response.status === 429) {
        // Rate limited — wait and retry
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.warn(`  Rate limited, waiting ${waitMs}ms before retry ${attempt}/${retries}`)
        await sleep(waitMs)
        continue
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      if (attempt === retries) {
        console.error(`  Failed after ${retries} attempts: ${url}`, error instanceof Error ? error.message : error)
        return null
      }
      const waitMs = Math.min(500 * Math.pow(2, attempt), 5000)
      console.warn(`  Attempt ${attempt}/${retries} failed, retrying in ${waitMs}ms...`)
      await sleep(waitMs)
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Géorisques API calls
// ---------------------------------------------------------------------------

interface CatNatEvent {
  code_national_catnat: string
  libelle_risque_jo: string
  date_debut_evt: string  // dd/mm/yyyy
  date_fin_evt: string
  date_publication_arrete: string
  code_insee: string
  libelle_commune: string
}

interface CatNatResponse {
  data: CatNatEvent[]
  results: number
  total_pages: number
}

interface RapportRisque {
  risqueInondation?: boolean
  classePotentielleArgile?: string // 'fort', 'moyen', 'faible'
  zoneSismicite?: number // 1-5
  classeRadon?: number // 1-3
  listeRisques?: Array<{ libelle: string }>
}

async function fetchCatNat(codeInsee: string): Promise<{ nbCatNat: number; risques: string[] }> {
  // Fetch all pages of CatNat events
  let allEvents: CatNatEvent[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const url = `https://georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=${codeInsee}&page=${page}`
    const result = await fetchWithRetry(url) as CatNatResponse | null

    if (!result?.data) break

    allEvents = allEvents.concat(result.data)
    totalPages = result.total_pages || 1
    page++
    if (page <= totalPages) await sleep(100)
  }

  if (allEvents.length === 0) {
    return { nbCatNat: 0, risques: [] }
  }

  // Count events since 2000 (date format: dd/mm/yyyy)
  const recentEvents = allEvents.filter(e => {
    const parts = e.date_debut_evt?.split('/')
    if (!parts || parts.length < 3) return false
    const year = parseInt(parts[2], 10)
    return year >= 2000
  })

  // Extract unique risk types
  const risqueSet = new Set<string>()
  for (const e of allEvents) {
    if (e.libelle_risque_jo) {
      risqueSet.add(e.libelle_risque_jo.trim())
    }
  }

  return {
    nbCatNat: recentEvents.length,
    risques: Array.from(risqueSet).slice(0, 10),
  }
}

async function fetchRapportRisques(codeInsee: string): Promise<RapportRisque | null> {
  const rapport: RapportRisque = {}

  // Sismicité (individual endpoint — reliable)
  const sismUrl = `https://georisques.gouv.fr/api/v1/zonage_sismique?code_insee=${codeInsee}`
  const sismResult = await fetchWithRetry(sismUrl) as { data?: Array<{ code_zone?: string; zone_sismicite?: string }> } | null
  if (sismResult?.data?.[0]) {
    const zone = parseInt(sismResult.data[0].code_zone || '0', 10)
    if (zone > 0) rapport.zoneSismicite = zone
  }

  // Radon (individual endpoint)
  const radonUrl = `https://georisques.gouv.fr/api/v1/radon?code_insee=${codeInsee}`
  const radonResult = await fetchWithRetry(radonUrl) as { data?: Array<{ classe_potentiel?: number }> } | null
  if (radonResult?.data?.[0]?.classe_potentiel) {
    rapport.classeRadon = radonResult.data[0].classe_potentiel
  }

  // Inondation is derived from CatNat data (handled by caller)
  // Argile retrait-gonflement — endpoint unreliable, skip for now

  return (rapport.zoneSismicite || rapport.classeRadon) ? rapport : null
}

// ---------------------------------------------------------------------------
// Main enrichment
// ---------------------------------------------------------------------------

interface CommuneRow {
  code_insee: string
  slug: string
  name: string
}

async function enrichCommune(commune: CommuneRow): Promise<boolean> {
  const { code_insee, name } = commune

  // Fetch both APIs in parallel
  const [catnat, rapport] = await Promise.all([
    fetchCatNat(code_insee),
    fetchRapportRisques(code_insee),
  ])

  // Risk labels from CatNat
  const risquesPrincipaux = [...catnat.risques]

  // Determine inondation from CatNat labels
  const risqueInondation = risquesPrincipaux.some(r => /inondation/i.test(r))

  const updateData = {
    risque_inondation: risqueInondation,
    risque_argile: null as string | null, // argile endpoint unreliable
    zone_sismique: rapport?.zoneSismicite || null,
    risque_radon: rapport?.classeRadon || null,
    nb_catnat: catnat.nbCatNat,
    risques_principaux: risquesPrincipaux.length > 0 ? risquesPrincipaux : null,
    georisques_enriched_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('communes')
    .update(updateData)
    .eq('code_insee', code_insee)

  if (error) {
    console.error(`  Failed to update ${name} (${code_insee}):`, error.message)
    return false
  }

  return true
}

async function main() {
  const args = process.argv.slice(2)
  const resumeMode = args.includes('--resume')
  const slugIndex = args.indexOf('--slug')
  const slugFilter = slugIndex >= 0 ? args[slugIndex + 1] : undefined
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1], 10) : undefined

  console.log('🌍 Géorisques Enrichment Script')
  console.log('================================')

  // Load all communes from DB (paginated — Supabase limits to 1000 per query)
  const PAGE_SIZE = 1000
  const allCommunes: CommuneRow[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    let query = supabase
      .from('communes')
      .select('code_insee,slug,name')
      .eq('is_active', true)
      .not('code_insee', 'is', null)
      .order('population', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (slugFilter) {
      query = query.eq('slug', slugFilter)
    }

    const { data, error } = await query
    if (error || !data) {
      console.error('Failed to fetch communes from DB:', error)
      process.exit(1)
    }
    allCommunes.push(...(data as CommuneRow[]))
    if (data.length < PAGE_SIZE) {
      hasMore = false
    } else {
      offset += PAGE_SIZE
    }
  }

  console.log(`Found ${allCommunes.length} communes in DB`)

  // Filter out already-processed if resuming
  const progress = resumeMode ? loadProgress() : { completed: [], lastUpdated: new Date().toISOString() }
  const completedSet = new Set(progress.completed)

  let communes = allCommunes.filter(c => !completedSet.has(c.code_insee))
  if (resumeMode && completedSet.size > 0) {
    console.log(`Resuming — skipping ${completedSet.size} already-processed communes`)
  }

  if (limit) {
    communes = communes.slice(0, limit)
  }

  console.log(`Processing ${communes.length} communes...\n`)

  let processed = 0
  let success = 0
  let failed = 0

  // Process in batches
  for (let i = 0; i < communes.length; i += BATCH_SIZE) {
    const batch = communes.slice(i, i + BATCH_SIZE)

    for (const commune of batch) {
      const ok = await enrichCommune(commune)
      if (ok) {
        success++
        progress.completed.push(commune.code_insee)
      } else {
        failed++
      }
      processed++

      // Rate limiting
      await sleep(DELAY_MS)
    }

    // Log progress every 100 communes
    if (processed % 100 < BATCH_SIZE) {
      console.log(`Progress: ${processed}/${communes.length} (${success} success, ${failed} failed)`)
    }

    // Save progress after each batch
    saveProgress(progress)
  }

  console.log('\n================================')
  console.log(`Done! Processed ${processed} communes`)
  console.log(`  Success: ${success}`)
  console.log(`  Failed:  ${failed}`)

  // Clean up progress file on full completion
  if (failed === 0 && !limit && !slugFilter) {
    try {
      fs.unlinkSync(PROGRESS_FILE)
      console.log('  Progress file cleaned up')
    } catch {
      // ignore
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
