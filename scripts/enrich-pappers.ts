/**
 * Enrichissement Pappers — Dirigeants & Données Financières
 *
 * API Pappers (api.pappers.fr) — Clé API requise (PAPPERS_API_KEY dans .env.local)
 * Enrichit sélectivement les artisans avec:
 *   - Dirigeants (gérant, président, etc.) → table provider_directors
 *   - Données financières (CA, résultat net, effectif) → table provider_financials
 *   - Capital social, date de radiation → table providers
 *
 * Stratégie: enrichit uniquement les artisans qui ont un SIREN valide
 * et dont les données financières/dirigeants ne sont pas encore remplies.
 *
 * Usage:
 *   npx tsx scripts/enrich-pappers.ts                    # Enrichir tous les artisans
 *   npx tsx scripts/enrich-pappers.ts --limit 100        # Limiter à 100 artisans
 *   npx tsx scripts/enrich-pappers.ts --dept 75          # Uniquement Paris
 *   npx tsx scripts/enrich-pappers.ts --naf 43.21A       # Uniquement électriciens
 *   npx tsx scripts/enrich-pappers.ts --resume           # Reprendre après interruption
 *   npx tsx scripts/enrich-pappers.ts --dry-run          # Vérifier sans écrire
 */

import * as fs from 'fs'
import * as path from 'path'
import { supabase } from './lib/supabase-admin'
import { upsertDirectors, upsertFinancials } from './lib/supabase-admin'

// ============================================
// CONFIG
// ============================================

const PAPPERS_API_KEY = process.env.PAPPERS_API_KEY
const PAPPERS_API_BASE = 'https://api.pappers.fr/v2'
const RATE_LIMIT_MS = 500      // 2 req/s (respecte les limites Pappers)
const MAX_RETRIES = 3
const BATCH_SIZE = 500          // Nombre de providers par batch DB
const PROGRESS_SAVE_INTERVAL = 25
const PROGRESS_FILE = path.join(__dirname, '.enrich-pappers-progress.json')

// ============================================
// STATE
// ============================================

let shuttingDown = false
let lastRequestTime = 0
let startTime = Date.now()

const stats = {
  apiCalls: 0,
  processed: 0,
  directorsAdded: 0,
  financialsAdded: 0,
  capitalUpdated: 0,
  notFound: 0,
  errors: 0,
  skipped: 0,
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function rateLimitWait(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed)
  }
  lastRequestTime = Date.now()
}

function fmt(n: number): string { return n.toLocaleString('fr-FR') }

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60}m${s % 60}s`
  if (m > 0) return `${m}m${s % 60}s`
  return `${s}s`
}

// ============================================
// PAPPERS API TYPES
// ============================================

interface PappersEntreprise {
  siren: string
  nom_entreprise: string
  siege: {
    siret: string
    adresse_ligne_1?: string
    code_postal?: string
    ville?: string
  }
  capital?: number
  date_radiation?: string
  effectifs?: string
  representants?: PappersRepresentant[]
  finances?: PappersFinance[]
}

interface PappersRepresentant {
  nom: string
  prenom?: string
  qualite?: string
  date_de_naissance?: string
  nationalite?: string
  type_de_representant?: string
}

interface PappersFinance {
  annee: number
  chiffre_affaires?: number
  resultat?: number
  effectif?: string
  date_de_cloture?: string
}

// ============================================
// PAPPERS API CLIENT
// ============================================

async function fetchPappersEntreprise(siren: string): Promise<PappersEntreprise | null> {
  await rateLimitWait()
  stats.apiCalls++

  const url = `${PAPPERS_API_BASE}/entreprise?api_token=${PAPPERS_API_KEY}&siren=${siren}`

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      })

      if (response.status === 404) {
        return null
      }

      if (response.status === 429) {
        const wait = 3000 * attempt
        console.warn(`   Rate limit — attente ${wait / 1000}s (tentative ${attempt}/${MAX_RETRIES})`)
        await sleep(wait)
        continue
      }

      if (response.status === 401 || response.status === 403) {
        console.error(`   Erreur auth Pappers (${response.status}) — verifiez PAPPERS_API_KEY`)
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return (await response.json()) as PappersEntreprise
    } catch (error: any) {
      if (attempt === MAX_RETRIES) {
        console.error(`   Echec API SIREN ${siren}: ${error.message}`)
        stats.errors++
        return null
      }
      await sleep(1000 * attempt)
    }
  }

  return null
}

// ============================================
// ENRICHMENT LOGIC
// ============================================

async function enrichProvider(
  provider: { id: string; siren: string; name: string },
  dryRun: boolean,
): Promise<void> {
  const data = await fetchPappersEntreprise(provider.siren)

  if (!data) {
    stats.notFound++
    return
  }

  // 1. Update provider fields (capital, date_radiation)
  if (!dryRun) {
    const updateFields: Record<string, unknown> = {}

    if (data.capital !== undefined && data.capital !== null) {
      updateFields.capital = data.capital
      stats.capitalUpdated++
    }

    if (data.date_radiation) {
      updateFields.date_radiation = data.date_radiation
    }

    if (data.effectifs) {
      updateFields.employee_count = data.effectifs
    }

    // Mark enrichment source
    updateFields.source_api = 'pappers'
    updateFields.derniere_maj_api = new Date().toISOString()

    if (Object.keys(updateFields).length > 0) {
      await supabase
        .from('providers')
        .update(updateFields)
        .eq('id', provider.id)
    }
  }

  // 2. Upsert directors
  if (data.representants && data.representants.length > 0) {
    const directors = data.representants
      .filter(r => r.nom && r.type_de_representant !== 'commissaire aux comptes')
      .map(r => ({
        nom: r.nom,
        prenom: r.prenom || undefined,
        fonction: r.qualite || undefined,
        date_naissance: r.date_de_naissance || undefined,
        nationalite: r.nationalite || undefined,
        source: 'pappers',
      }))

    if (directors.length > 0 && !dryRun) {
      const upserted = await upsertDirectors(provider.id, directors)
      stats.directorsAdded += upserted
    } else if (dryRun) {
      stats.directorsAdded += directors.length
    }
  }

  // 3. Upsert financials
  if (data.finances && data.finances.length > 0) {
    const financials = data.finances
      .filter(f => f.annee && (f.chiffre_affaires !== undefined || f.resultat !== undefined))
      .map(f => ({
        annee: f.annee,
        chiffre_affaires: f.chiffre_affaires ?? null,
        resultat_net: f.resultat ?? null,
        effectif: f.effectif ?? null,
        source: 'pappers',
      }))

    if (financials.length > 0 && !dryRun) {
      const upserted = await upsertFinancials(provider.id, financials)
      stats.financialsAdded += upserted
    } else if (dryRun) {
      stats.financialsAdded += financials.length
    }
  }

  stats.processed++
}

// ============================================
// PROGRESS TRACKING
// ============================================

interface ProgressState {
  lastProcessedId: string | null
  stats: typeof stats
}

function loadProgress(): ProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
  return { lastProcessedId: null, stats: { ...stats } }
}

function saveProgress(lastId: string): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    lastProcessedId: lastId,
    stats: { ...stats },
  }, null, 2))
}

function clearProgress(): void {
  try { fs.unlinkSync(PROGRESS_FILE) } catch { /* ignore */ }
}

// ============================================
// CLI ARGS
// ============================================

function parseArgs(): {
  limit: number
  dept?: string
  naf?: string
  resume: boolean
  dryRun: boolean
} {
  const args = process.argv.slice(2)
  const result: ReturnType<typeof parseArgs> = {
    limit: 0,
    resume: false,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit': result.limit = parseInt(args[++i]) || 0; break
      case '--dept': result.dept = args[++i]; break
      case '--naf': result.naf = args[++i]; break
      case '--resume': result.resume = true; break
      case '--dry-run': result.dryRun = true; break
    }
  }

  return result
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs()

  if (!PAPPERS_API_KEY) {
    console.error('PAPPERS_API_KEY manquante dans .env.local')
    console.error('Obtenez une cle sur https://www.pappers.fr/api')
    process.exit(1)
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('  ENRICHISSEMENT PAPPERS — DIRIGEANTS & FINANCES')
  console.log('  Source: api.pappers.fr (cle API requise)')
  console.log('='.repeat(60))
  console.log('')

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    console.log('\n   Arret gracieux en cours...')
    shuttingDown = true
  })

  // Resume support
  let lastProcessedId: string | null = null
  if (args.resume) {
    const progress = loadProgress()
    lastProcessedId = progress.lastProcessedId
    if (progress.stats) Object.assign(stats, progress.stats)
    console.log(`   Reprise depuis ID: ${lastProcessedId || 'debut'}`)
    console.log(`   Precedent: ${fmt(stats.processed)} traites, ${fmt(stats.directorsAdded)} dirigeants, ${fmt(stats.financialsAdded)} finances\n`)
  }

  if (args.dryRun) {
    console.log('   MODE DRY-RUN: aucune ecriture en base\n')
  }

  startTime = Date.now()
  let totalProcessed = 0
  let offset = 0

  while (!shuttingDown) {
    // Build query for providers needing enrichment
    let query = supabase
      .from('providers')
      .select('id, siren, name')
      .eq('is_active', true)
      .eq('is_artisan', true)
      .not('siren', 'is', null)
      .order('id', { ascending: true })

    // Filter: only providers not already enriched by Pappers
    // (source_api != 'pappers' or source_api is null)
    // We check if they don't already have directors
    if (args.dept) {
      query = query.eq('address_department', args.dept)
    }
    if (args.naf) {
      query = query.eq('code_naf', args.naf)
    }

    // Resume from last processed ID
    if (lastProcessedId) {
      query = query.gt('id', lastProcessedId)
    }

    query = query.range(offset, offset + BATCH_SIZE - 1)

    const { data: providers, error } = await query

    if (error) {
      console.error(`   Erreur DB: ${error.message}`)
      stats.errors++
      await sleep(5000)
      continue
    }

    if (!providers || providers.length === 0) break

    // Filter out providers without valid SIREN
    const validProviders = providers.filter(
      p => p.siren && p.siren.length === 9 && /^\d{9}$/.test(p.siren)
    )

    stats.skipped += providers.length - validProviders.length

    for (const provider of validProviders) {
      if (shuttingDown) break

      // Check if already enriched (has directors)
      const { count } = await supabase
        .from('provider_directors')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', provider.id)

      if (count && count > 0) {
        stats.skipped++
        lastProcessedId = provider.id
        continue
      }

      await enrichProvider(provider, args.dryRun)
      lastProcessedId = provider.id
      totalProcessed++

      // Progress display
      if (totalProcessed % 10 === 0) {
        const elapsed = Date.now() - startTime
        const rate = elapsed > 0 ? Math.round(totalProcessed / (elapsed / 60000)) : 0
        process.stdout.write(
          `\r   ${fmt(totalProcessed)} traites | ` +
          `${fmt(stats.directorsAdded)} dirigeants | ` +
          `${fmt(stats.financialsAdded)} finances | ` +
          `${fmt(stats.notFound)} non trouves | ` +
          `${rate}/min` +
          ' '.repeat(10)
        )
      }

      // Save progress periodically
      if (totalProcessed % PROGRESS_SAVE_INTERVAL === 0 && lastProcessedId) {
        saveProgress(lastProcessedId)
      }

      // Check limit
      if (args.limit > 0 && totalProcessed >= args.limit) {
        console.log(`\n\n   Limite atteinte: ${args.limit} artisans`)
        shuttingDown = true
        break
      }
    }

    // If we got fewer results than batch size, we're done
    if (providers.length < BATCH_SIZE) break

    // Reset offset since we use cursor-based pagination (gt id)
    offset = 0
  }

  // Save final progress
  if (lastProcessedId) saveProgress(lastProcessedId)

  if (shuttingDown && args.limit === 0) {
    console.log(`\n   Progression sauvegardee. Utilisez --resume pour reprendre.`)
  } else if (!shuttingDown) {
    clearProgress()
  }

  // ============================================
  // SUMMARY
  // ============================================

  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? Math.round(totalProcessed / (elapsed / 60000)) : 0

  console.log('\n')
  console.log('='.repeat(60))
  console.log('  RESUME ENRICHISSEMENT PAPPERS')
  console.log('='.repeat(60))
  console.log(`  Duree:              ${formatDuration(elapsed)}`)
  console.log(`  Requetes API:       ${fmt(stats.apiCalls)}`)
  console.log(`  Artisans traites:   ${fmt(stats.processed)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Dirigeants ajoutes: ${fmt(stats.directorsAdded)}`)
  console.log(`  Finances ajoutees:  ${fmt(stats.financialsAdded)}`)
  console.log(`  Capital mis a jour: ${fmt(stats.capitalUpdated)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Non trouves:        ${fmt(stats.notFound)}`)
  console.log(`  Ignores:            ${fmt(stats.skipped)}`)
  console.log(`  Erreurs:            ${fmt(stats.errors)}`)
  console.log(`  Debit:              ${fmt(rate)} artisans/min`)
  console.log('='.repeat(60))
  console.log('')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n   Erreur fatale:', error)
    process.exit(1)
  })
