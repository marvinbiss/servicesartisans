#!/usr/bin/env npx tsx
/**
 * enrich-communes-top40.ts — Orchestrator for CEO plan Vague A.
 *
 * Target: 40 specific villes in rank 21-50 on /services/[s]/[v] template.
 * Fills the NULL fields that kill BarometrePrixBlock, LocalInsights,
 * ContexteDPEBlock, PrimesCEEBlock, RisquesGeoBlock → near-duplicate killer.
 *
 * Sources (all free, official):
 *  - DVF Cerema       → prix_m2_moyen, prix_m2_maison, prix_m2_appartement
 *  - INSEE FILOSOFI   → revenu_median (by commune, latest year available)
 *  - Wikipedia REST   → gentile, description (3-sentence extract)
 *  - ADEME DPE        → pct_passoires_dpe, nb_dpe_total
 *  - France Rénov OD  → nb_maprimerenov_annuel (at dept level, cascaded)
 *  - Géorisques       → risque_argile, zone_sismique, risque_inondation, nb_catnat
 *  - SIRENE count     → nb_artisans_btp (via Postgres providers count or API)
 *  - Open-Meteo       → climat_zone + jours_gel for 5 villes missing
 *
 * Idempotent: only updates a field if it is currently NULL.
 * Checkpoint: docs/.enrich-top40-progress.json
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PROGRESS_FILE = path.join(__dirname, '.enrich-top40-progress.json')
const USER_AGENT = 'ServicesArtisans/1.0 (contact@servicesartisans.fr)'

// 40 villes top rank 21-50 from GSC data 2026-04-20
const TOP40_VILLES = [
  'marseille',
  'lyon',
  'athis-mons',
  'nantes',
  'maubeuge',
  'montauban',
  'macon',
  'cholet',
  'caussade',
  'cannes',
  'poitiers',
  'orleans',
  'besancon',
  'la-ciotat',
  'lorient',
  'dijon',
  'darnetal',
  'nimes',
  'albi',
  'ajaccio',
  'le-havre',
  'perpignan',
  'verdun',
  'castelsarrasin',
  'arras',
  'vannes',
  'toulouse',
  'valenciennes',
  'fonsorbes',
  'toulon',
  'cancale',
  'le-muy',
  'annecy',
  'savigny-le-temple',
  'douarnenez',
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type Progress = Record<string, { sources: string[]; ts: string }>

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
  } catch {}
  return {}
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2))
}

function markDone(p: Progress, slug: string, source: string) {
  const entry = p[slug] || { sources: [], ts: '' }
  if (!entry.sources.includes(source)) entry.sources.push(source)
  entry.ts = new Date().toISOString()
  p[slug] = entry
  saveProgress(p)
}

async function fetchJson<T = unknown>(url: string, timeoutMs = 12000): Promise<T | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

// ---------------------------------------------------------------------------
// 1. DVF Etalab CSV — prix m² (raw mutations, aggregated locally)
// ---------------------------------------------------------------------------
// Paris/Marseille/Lyon are split into arrondissements in DVF (75101-75120,
// 13201-13216, 69381-69389). Central INSEE (75056, 13055, 69123) returns 404.
const ARRONDISSEMENTS: Record<string, string[]> = {
  '75056': Array.from({ length: 20 }, (_, i) => `751${String(i + 1).padStart(2, '0')}`),
  '13055': Array.from({ length: 16 }, (_, i) => `132${String(i + 1).padStart(2, '0')}`),
  '69123': Array.from({ length: 9 }, (_, i) => `6938${i + 1}`),
}

async function fetchDvfCsv(codeInsee: string, year: number): Promise<string | null> {
  const dept = codeInsee.slice(0, 2)
  const url = `https://files.data.gouv.fr/geo-dvf/latest/csv/${year}/communes/${dept}/${codeInsee}.csv`
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': USER_AGENT } })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function parseDvfCsv(csv: string): {
  prixMoyen: number | null
  prixMaison: number | null
  prixAppart: number | null
  nbMutations: number
} {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2)
    return { prixMoyen: null, prixMaison: null, prixAppart: null, nbMutations: 0 }
  const header = lines[0].split(',')
  const iValeur = header.indexOf('valeur_fonciere')
  const iType = header.indexOf('type_local')
  const iSurface = header.indexOf('surface_reelle_bati')
  const iNature = header.indexOf('nature_mutation')
  if (iValeur < 0 || iType < 0 || iSurface < 0)
    return { prixMoyen: null, prixMaison: null, prixAppart: null, nbMutations: 0 }
  const samples = { maison: [] as number[], appart: [] as number[], all: [] as number[] }
  const mutationsSeen = new Set<string>()
  const iMut = header.indexOf('id_mutation')
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (iNature >= 0 && parts[iNature] !== 'Vente') continue
    const val = parseFloat(parts[iValeur])
    const surf = parseFloat(parts[iSurface])
    const type = parts[iType]
    if (!val || !surf || surf < 9 || surf > 2000) continue
    const prixM2 = val / surf
    if (prixM2 < 100 || prixM2 > 50000) continue
    if (iMut >= 0) mutationsSeen.add(parts[iMut])
    samples.all.push(prixM2)
    if (type === 'Maison') samples.maison.push(prixM2)
    else if (type === 'Appartement') samples.appart.push(prixM2)
  }
  const median = (arr: number[]) => {
    if (!arr.length) return null
    const sorted = [...arr].sort((a, b) => a - b)
    return Math.round(sorted[Math.floor(sorted.length / 2)])
  }
  return {
    prixMoyen: median(samples.all),
    prixMaison: median(samples.maison),
    prixAppart: median(samples.appart),
    nbMutations: mutationsSeen.size,
  }
}

async function enrichDvf(commune: {
  code_insee: string
  slug: string
  name: string
  prix_m2_moyen: number | null
}) {
  if (commune.prix_m2_moyen) return false
  const inseeCodes = ARRONDISSEMENTS[commune.code_insee] ?? [commune.code_insee]
  let all = { maison: [] as number[], appart: [] as number[], overall: [] as number[], nb: 0 }
  for (const insee of inseeCodes) {
    for (const year of [2024, 2023, 2022]) {
      const csv = await fetchDvfCsv(insee, year)
      if (!csv) continue
      const parsed = parseDvfCsv(csv)
      if (parsed.prixMoyen) all.overall.push(parsed.prixMoyen)
      if (parsed.prixMaison) all.maison.push(parsed.prixMaison)
      if (parsed.prixAppart) all.appart.push(parsed.prixAppart)
      all.nb += parsed.nbMutations
      // One year is enough once we have data
      if (parsed.prixMoyen) break
    }
    await sleep(100)
  }
  if (!all.overall.length) return false
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
  const update: Record<string, number> = {}
  const pm = avg(all.overall)
  if (pm) update.prix_m2_moyen = pm
  const pma = avg(all.maison)
  if (pma) update.prix_m2_maison = pma
  const pap = avg(all.appart)
  if (pap) update.prix_m2_appartement = pap
  if (all.nb) update.nb_transactions_annuelles = Math.round(all.nb / inseeCodes.length)
  if (!Object.keys(update).length) return false
  await supabase.from('communes').update(update).eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 2. INSEE FILOSOFI — revenu_median
// ---------------------------------------------------------------------------
async function enrichFilosofi(commune: { code_insee: string; revenu_median: number | null }) {
  if (commune.revenu_median) return false
  // INSEE opendata FILOSOFI dataset (dispo via data.economie.gouv.fr dataset id)
  // Approche: utiliser opendatasoft INSEE portal
  const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/filosofi-2019/records?where=codgeo%3D%22${commune.code_insee}%22&limit=1`
  const data = await fetchJson<{
    results?: Array<{ med19?: number; med20?: number; mediane?: number }>
  }>(url)
  const r = data?.results?.[0]
  const med = r?.med20 || r?.med19 || r?.mediane
  if (!med) return false
  await supabase
    .from('communes')
    .update({ revenu_median: Math.round(med) })
    .eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 3. Wikipedia REST — gentile + description
// ---------------------------------------------------------------------------
async function enrichWikipedia(commune: {
  code_insee: string
  name: string
  gentile: string | null
  description: string | null
}) {
  if (commune.gentile && commune.description) return false
  const title = encodeURIComponent(commune.name.replace(/\s/g, '_'))
  const update: Record<string, string> = {}
  if (!commune.description) {
    const data = await fetchJson<{ extract?: string }>(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${title}`
    )
    if (data?.extract && data.extract.length > 50) {
      // Cap to ~600 chars (3 sentences) to stay in DB column reasonable
      const trimmed = data.extract.slice(0, 600).replace(/\s+$/, '')
      update.description = trimmed
    }
  }
  if (!commune.gentile) {
    // Gentile via Wikidata (Q-id)
    // First get wikidata QID via summary API
    const sum = await fetchJson<{ wikibase_item?: string }>(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${title}`
    )
    if (sum?.wikibase_item) {
      const wd = await fetchJson<{
        entities?: Record<
          string,
          {
            claims?: { P1549?: Array<{ mainsnak?: { datavalue?: { value?: { text?: string } } } }> }
          }
        >
      }>(`https://www.wikidata.org/wiki/Special:EntityData/${sum.wikibase_item}.json`)
      const gent =
        wd?.entities?.[sum.wikibase_item]?.claims?.P1549?.[0]?.mainsnak?.datavalue?.value?.text
      if (gent) update.gentile = gent
    }
    // Fallback : parse extract text for "les habitants de X sont appelés Y" pattern
    if (!update.gentile && update.description) {
      const m = update.description.match(
        /habitants?\s+(?:sont\s+appelés?|se\s+nomment|s'appellent)\s+(?:les\s+)?([A-ZÉÈÊ][^.]{3,30})/i
      )
      if (m) update.gentile = m[1].trim().replace(/[.,;]$/, '')
    }
  }
  if (!Object.keys(update).length) return false
  await supabase.from('communes').update(update).eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 4. ADEME DPE V2 — pct_passoires_dpe
// ---------------------------------------------------------------------------
// Dataset ID: meg-83tjwtg8dyz4vv7h1dqe (DPE Logements existants depuis 07/2021)
// qs syntax uses Lucene without URL-quoted strings on integer/string exact match.
async function enrichAdemeDpe(commune: {
  code_insee: string
  pct_passoires_dpe: number | null
  nb_dpe_total: number | null
}) {
  if (commune.pct_passoires_dpe !== null && commune.nb_dpe_total !== null) return false
  const base = 'https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines'
  // Total DPE in commune
  const qsTotal = `?size=0&qs=${encodeURIComponent(`code_insee_ban:${commune.code_insee}`)}`
  const total = await fetchJson<{ total?: number }>(base + qsTotal)
  if (!total?.total || total.total === 0) return false
  const nbTotal = total.total
  // Passoires thermiques (F + G)
  const qsFG = `?size=0&qs=${encodeURIComponent(`code_insee_ban:${commune.code_insee} AND etiquette_dpe:(F OR G)`)}`
  const fg = await fetchJson<{ total?: number }>(base + qsFG)
  const nbPass = fg?.total ?? 0
  const pct = Math.round((nbPass / nbTotal) * 1000) / 10
  await supabase
    .from('communes')
    .update({ pct_passoires_dpe: pct, nb_dpe_total: nbTotal })
    .eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 5. Géorisques — risque_argile, zone_sismique, risque_inondation, risque_radon
// ---------------------------------------------------------------------------
// Endpoint: resultats_rapport_risque (the /gaspar/risques path returns a
// different structure that no longer contains the parsed risk levels).
type GeoRisque = { present?: boolean; libelle?: string; libelleStatutCommune?: string | null }
type GeoRisqueResponse = {
  commune?: { codeInsee?: string; libelle?: string }
  risquesNaturels?: Record<string, GeoRisque>
  risquesTechnologiques?: Record<string, GeoRisque>
}

/** Parse a libelleStatutCommune string into a level "faible" | "moyen" | "fort" */
function parseArgileLevel(libelle: string | null | undefined): string | null {
  if (!libelle) return null
  const l = libelle.toLowerCase()
  if (l.includes('fort')) return 'fort'
  if (l.includes('moyen')) return 'moyen'
  if (l.includes('faible')) return 'faible'
  return null
}

/** Parse seisme libelleStatutCommune "Zone 3 / Modérée" → 3 */
function parseZoneSismique(libelle: string | null | undefined): number | null {
  if (!libelle) return null
  const m = libelle.match(/zone\s+(\d)/i)
  return m ? parseInt(m[1], 10) : null
}

/** Parse radon classe "Catégorie 3" → 3 */
function parseRadon(libelle: string | null | undefined): number | null {
  if (!libelle) return null
  const m = libelle.match(/(?:catégorie|classe)\s*(\d)/i)
  return m ? parseInt(m[1], 10) : null
}

async function enrichGeorisques(commune: {
  code_insee: string
  risque_argile: string | null
  zone_sismique: number | null
  risque_inondation?: boolean
}) {
  if (
    commune.risque_argile &&
    commune.zone_sismique !== null &&
    commune.risque_inondation !== undefined
  )
    return false
  const risk = await fetchJson<GeoRisqueResponse>(
    `https://georisques.gouv.fr/api/v1/resultats_rapport_risque?code_insee=${commune.code_insee}`
  )
  if (!risk?.risquesNaturels) return false
  const rn = risk.risquesNaturels
  const update: Record<string, unknown> = {}

  // Argile
  const argile = rn.retraitGonflementArgile
  if (argile?.present) {
    const lvl = parseArgileLevel(argile.libelleStatutCommune)
    if (lvl) update.risque_argile = lvl
  }

  // Séisme zone
  const seisme = rn.seisme
  if (seisme?.libelleStatutCommune) {
    const zs = parseZoneSismique(seisme.libelleStatutCommune)
    if (zs != null) update.zone_sismique = zs
  }

  // Inondation (présent: bool)
  if (rn.inondation?.present != null) update.risque_inondation = !!rn.inondation.present

  // Radon (class 1-3)
  const radon = rn.radon
  if (radon?.libelleStatutCommune) {
    const rc = parseRadon(radon.libelleStatutCommune)
    if (rc != null) update.risque_radon = rc
  }

  // Cat-nat count: not in this endpoint — leave as-is (can be enriched later)
  if (!Object.keys(update).length) return false
  await supabase.from('communes').update(update).eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 6. France Rénov (dept-level, cascaded) — nb_maprimerenov_annuel
// ---------------------------------------------------------------------------
// Cache dept-level data across calls
const maprimeDeptCache = new Map<string, number>()
async function enrichMaPrimeRenov(commune: {
  code_insee: string
  departement_code: string
  nb_maprimerenov_annuel: number | null
  population: number
}) {
  if (commune.nb_maprimerenov_annuel != null) return false
  // Dataset: aides-maprimerenov- par dep (opendata France Rénov 2023 annuel)
  const dept = commune.departement_code
  let deptCount = maprimeDeptCache.get(dept)
  if (deptCount === undefined) {
    // Try opendatasoft France Rénov (dataset id peut varier; on utilise un proxy simplifié)
    const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/maprimerenov-par-departement/records?where=code_departement%3D%22${dept}%22&limit=1`
    const data = await fetchJson<{
      results?: Array<{ nb_dossiers_2023?: number; nb_dossiers?: number }>
    }>(url)
    const n = data?.results?.[0]?.nb_dossiers_2023 ?? data?.results?.[0]?.nb_dossiers
    deptCount = n ?? 0
    maprimeDeptCache.set(dept, deptCount)
  }
  if (!deptCount) return false
  // Heuristique : répartir par poids population commune vs pop dept
  // Pour simplifier : stocker le nombre dept comme proxy (≠ précis mais utile pour template)
  // Amélioration future : pop_commune / pop_dept × deptCount
  const { data: deptPopData } = await supabase
    .from('communes')
    .select('population')
    .eq('departement_code', dept)
    .eq('is_active', true)
  const totalPop = (deptPopData || []).reduce(
    (a, c: { population: number }) => a + (c.population || 0),
    0
  )
  const share = totalPop > 0 && commune.population ? commune.population / totalPop : 0
  const estimated = Math.max(1, Math.round(deptCount * share))
  await supabase
    .from('communes')
    .update({ nb_maprimerenov_annuel: estimated })
    .eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 7. nb_artisans_btp via providers table (free, no API)
// ---------------------------------------------------------------------------
async function enrichNbArtisansBtp(commune: {
  code_insee: string
  slug: string
  name: string
  nb_artisans_btp: number | null
}) {
  if (commune.nb_artisans_btp != null && commune.nb_artisans_btp > 0) return false
  const { count } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .ilike('address_city', commune.name)
  if (count == null) return false
  await supabase
    .from('communes')
    .update({ nb_artisans_btp: count })
    .eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 8. Open-Meteo climate (for 5 missing villes)
// ---------------------------------------------------------------------------
async function enrichClimate(commune: {
  code_insee: string
  latitude: number | null
  longitude: number | null
  climat_zone: string | null
  jours_gel_annuels: number | null
}) {
  if (commune.climat_zone && commune.jours_gel_annuels != null) return false
  if (!commune.latitude || !commune.longitude) return false
  const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${commune.latitude}&longitude=${commune.longitude}&start_date=1991-01-01&end_date=2020-12-31&models=EC_Earth3P_HR&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max,precipitation_sum`
  const data = await fetchJson<{
    daily?: {
      temperature_2m_mean?: number[]
      temperature_2m_min?: number[]
      precipitation_sum?: number[]
    }
  }>(url)
  if (!data?.daily) return false
  const mean = data.daily.temperature_2m_mean || []
  const mins = data.daily.temperature_2m_min || []
  const precip = data.daily.precipitation_sum || []
  if (!mean.length) return false
  const avg = mean.reduce((a, b) => a + b, 0) / mean.length
  const gelDays = mins.filter((t) => t != null && t <= 0).length / Math.max(1, mins.length / 365)
  const precipAnnual = precip.reduce((a, b) => a + b, 0) / Math.max(1, precip.length / 365)
  // Crude zone classification
  let zone = 'semi-océanique'
  if (commune.latitude < 45 && precipAnnual < 700) zone = 'méditerranéen'
  else if (precipAnnual > 900) zone = 'océanique'
  else if (avg < 11 && gelDays > 50) zone = 'continental'
  else if (commune.latitude > 46 && avg < 10) zone = 'montagnard'
  const winter = mean.slice(0, 90).concat(mean.slice(-31)) // Q1+Dec approx
  const summer = mean.slice(150, 240)
  await supabase
    .from('communes')
    .update({
      climat_zone: zone,
      jours_gel_annuels: Math.round(gelDays),
      precipitation_annuelle: Math.round(precipAnnual),
      temperature_moyenne_hiver: winter.length
        ? Math.round((winter.reduce((a, b) => a + b, 0) / winter.length) * 10) / 10
        : null,
      temperature_moyenne_ete: summer.length
        ? Math.round((summer.reduce((a, b) => a + b, 0) / summer.length) * 10) / 10
        : null,
    })
    .eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------
async function main() {
  const progress = loadProgress()
  const args = process.argv.slice(2)
  const onlySource = args.find((_, i) => args[i - 1] === '--source') // dvf|filosofi|wiki|dpe|georisques|maprime|btp|climate
  const dryRun = args.includes('--dry-run')

  console.log(`🚀 Enriching ${TOP40_VILLES.length} top-priority villes`)
  console.log(
    `   Mode: ${onlySource ? `source=${onlySource}` : 'all sources'}${dryRun ? ' [DRY RUN]' : ''}`
  )

  // Fetch commune rows
  const { data: communes, error } = await supabase
    .from('communes')
    .select(
      'code_insee,slug,name,departement_code,latitude,longitude,population,prix_m2_moyen,revenu_median,gentile,description,pct_passoires_dpe,nb_dpe_total,risque_argile,zone_sismique,risque_inondation,risque_radon,nb_catnat,nb_maprimerenov_annuel,nb_artisans_btp,climat_zone,jours_gel_annuels'
    )
    .in('slug', TOP40_VILLES)

  if (error || !communes) {
    console.error('❌ Fetch communes failed:', error?.message)
    process.exit(1)
  }

  console.log(`📍 Found ${communes.length} communes matching`)

  const found = new Set(communes.map((c) => c.slug))
  const missing = TOP40_VILLES.filter((v) => !found.has(v))
  if (missing.length) console.warn(`⚠️  Missing slugs in DB: ${missing.join(', ')}`)

  const sources = onlySource
    ? [onlySource]
    : ['btp', 'dvf', 'filosofi', 'wiki', 'dpe', 'georisques', 'maprime', 'climate']
  const totals: Record<string, number> = {}

  for (const commune of communes) {
    const slug = commune.slug
    console.log(`\n📌 ${slug} (${commune.code_insee})`)

    for (const src of sources) {
      const key = `${slug}:${src}`
      if (progress[slug]?.sources.includes(src)) {
        console.log(`   ⏭️  ${src} already done`)
        continue
      }

      if (dryRun) {
        console.log(`   [DRY] ${src}`)
        continue
      }

      let updated = false
      try {
        if (src === 'btp') updated = await enrichNbArtisansBtp(commune as any)
        else if (src === 'dvf') updated = await enrichDvf(commune as any)
        else if (src === 'filosofi') updated = await enrichFilosofi(commune as any)
        else if (src === 'wiki') updated = await enrichWikipedia(commune as any)
        else if (src === 'dpe') updated = await enrichAdemeDpe(commune as any)
        else if (src === 'georisques') updated = await enrichGeorisques(commune as any)
        else if (src === 'maprime') updated = await enrichMaPrimeRenov(commune as any)
        else if (src === 'climate') updated = await enrichClimate(commune as any)
      } catch (err) {
        console.error(`   ❌ ${src} error:`, (err as Error).message)
      }

      totals[src] = (totals[src] || 0) + (updated ? 1 : 0)
      console.log(`   ${updated ? '✅' : '—'} ${src}${updated ? ' updated' : ''}`)
      markDone(progress, slug, src)
      await sleep(300) // rate limit courtesy
    }
  }

  // Final report
  console.log(`\n📊 Summary:`)
  for (const [src, n] of Object.entries(totals)) {
    console.log(`   ${src}: ${n}/${communes.length} updated`)
  }

  // Touch enriched_at
  if (!dryRun) {
    await supabase
      .from('communes')
      .update({ enriched_at: new Date().toISOString() })
      .in('slug', TOP40_VILLES)
  }

  console.log('\n🎉 Done')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
