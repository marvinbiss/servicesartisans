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
import {
  parseArgileLevel,
  parseZoneSismique,
  parseRadon,
  parseDvfCsv,
  dvfDept,
  isPriceM2Sane,
  isPctSane,
  isPositiveCount,
} from './enrich-communes-parsers'

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

// ---------------------------------------------------------------------------
// HTTP layer — exponential backoff + jitter + Retry-After + circuit breaker
// ---------------------------------------------------------------------------
// Stripe-grade : 4xx non-retryable (sauf 408/429), 5xx retryable jusqu'à 3
// tentatives avec jitter, respect de Retry-After, circuit breaker par host
// (3 échecs consécutifs → tout skip pour ce host pour le reste du run).

const HOST_FAILURES = new Map<string, number>()
const CIRCUIT_BREAKER_THRESHOLD = 3

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function isCircuitOpen(host: string): boolean {
  return (HOST_FAILURES.get(host) || 0) >= CIRCUIT_BREAKER_THRESHOLD
}

function noteFailure(host: string) {
  HOST_FAILURES.set(host, (HOST_FAILURES.get(host) || 0) + 1)
}

function noteSuccess(host: string) {
  if (HOST_FAILURES.has(host)) HOST_FAILURES.delete(host)
}

/** Fetch JSON avec retry exponentiel + jitter + Retry-After. Renvoie null
 *  uniquement après épuisement des tentatives ou circuit breaker ouvert. */
async function fetchJson<T = unknown>(
  url: string,
  timeoutMs = 12000,
  maxAttempts = 3
): Promise<T | null> {
  const host = hostOf(url)
  if (isCircuitOpen(host)) return null

  let lastErr: string | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      })

      // 4xx non-retryable except 408/429
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        // 404 is the canonical "not found" → not a failure for circuit breaker
        if (res.status !== 404) noteFailure(host)
        return null
      }

      // Retryable : 408, 429, 5xx
      if (res.status === 408 || res.status === 429 || res.status >= 500) {
        const retryAfter = res.headers.get('retry-after')
        const retryAfterMs = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 30_000) : 0
        if (attempt < maxAttempts) {
          const backoff =
            retryAfterMs || 250 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250)
          await sleep(backoff)
          continue
        }
        noteFailure(host)
        return null
      }

      if (!res.ok) {
        noteFailure(host)
        return null
      }

      const json = (await res.json()) as T
      noteSuccess(host)
      return json
    } catch (err) {
      lastErr = (err as Error)?.message || 'unknown'
      if (attempt < maxAttempts) {
        await sleep(250 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250))
        continue
      }
      noteFailure(host)
      return null
    } finally {
      clearTimeout(t)
    }
  }
  if (lastErr) {
    // last-resort log pour visibilité ; rester silencieux sinon (les
    // 404 expected — FILOSOFI/MaPrime — ne loggent pas).
  }
  return null
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
  const dept = dvfDept(codeInsee)
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

async function enrichDvf(commune: {
  code_insee: string
  slug: string
  name: string
  prix_m2_moyen: number | null
}) {
  if (commune.prix_m2_moyen) return false
  const inseeCodes = ARRONDISSEMENTS[commune.code_insee] ?? [commune.code_insee]
  const all = { maison: [] as number[], appart: [] as number[], overall: [] as number[], nb: 0 }
  for (const insee of inseeCodes) {
    for (const year of [2024, 2023, 2022]) {
      const csv = await fetchDvfCsv(insee, year)
      if (!csv) continue
      const parsed = parseDvfCsv(csv)
      // Filtre minimum 5 mutations par insee×year pour éviter les outliers
      // (un seul appartement vendu donne un prix m² aberrant pour une commune entière).
      if (parsed.nbMutations < 5) continue
      if (parsed.prixMoyen) all.overall.push(parsed.prixMoyen)
      if (parsed.prixMaison) all.maison.push(parsed.prixMaison)
      if (parsed.prixAppart) all.appart.push(parsed.prixAppart)
      all.nb += parsed.nbMutations
      if (parsed.prixMoyen) break
    }
    await sleep(100)
  }
  if (!all.overall.length) return false
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
  const update: Record<string, number> = {}
  const pm = avg(all.overall)
  if (isPriceM2Sane(pm)) update.prix_m2_moyen = pm
  const pma = avg(all.maison)
  if (isPriceM2Sane(pma)) update.prix_m2_maison = pma
  const pap = avg(all.appart)
  if (isPriceM2Sane(pap)) update.prix_m2_appartement = pap
  if (isPositiveCount(all.nb))
    update.nb_transactions_annuelles = Math.round(all.nb / inseeCodes.length)
  if (!Object.keys(update).length) return false
  await supabase.from('communes').update(update).eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 2. INSEE FILOSOFI — revenu_median
// ---------------------------------------------------------------------------
// Vérifié 2026-04-29 : tous les endpoints OpenDataSoft FILOSOFI sont 404
// (data.economie.gouv.fr/filosofi-2021, public.opendatasoft.com/filosofi-2021-comm,
// filosofi-niveau-communes). Le portail INSEE n'a plus d'API publique stable
// depuis 2025-11. Workflow officiel = téléchargement manuel CSV/XLSX puis
// import via `scripts/import-insee-ademe-csv.ts --filosofi=./filosofi.csv`.
let _filosofiWarned = false
async function enrichFilosofi(commune: { code_insee: string; revenu_median: number | null }) {
  if (commune.revenu_median) return false
  if (!_filosofiWarned) {
    console.log('   ℹ️  FILOSOFI: tous les endpoints OpenDataSoft sont 404 (vérifié 2026-04-29).')
    console.log('       Utiliser : scripts/import-insee-ademe-csv.ts --filosofi=./filosofi.csv')
    _filosofiWarned = true
  }
  return false
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
// Dataset id `meg-83tjwtg8dyz4vv7h1dqe` (DPE Logements existants depuis
// 07/2021). Vérifié 2026-04-29 : 200 OK, retourne {total, results} pour
// `qs=code_insee_ban:75056`. Le slug humain `dpe-v2-logements-existants`
// retourne 404, on garde donc l'id technique.
// Fields : `code_insee_ban` (5 chars) + `etiquette_dpe` (A..G).
async function enrichAdemeDpe(commune: {
  code_insee: string
  pct_passoires_dpe: number | null
  nb_dpe_total: number | null
}) {
  if (commune.pct_passoires_dpe !== null && commune.nb_dpe_total !== null) return false
  const base = 'https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines'
  const qsTotal = `?size=0&qs=${encodeURIComponent(`code_insee_ban:${commune.code_insee}`)}`
  const total = await fetchJson<{ total?: number }>(base + qsTotal)
  if (!total?.total || total.total === 0) return false
  const nbTotal = total.total
  const qsFG = `?size=0&qs=${encodeURIComponent(`code_insee_ban:${commune.code_insee} AND etiquette_dpe:(F OR G)`)}`
  const fg = await fetchJson<{ total?: number }>(base + qsFG)
  const nbPass = fg?.total ?? 0
  const pct = Math.round((nbPass / nbTotal) * 1000) / 10
  if (!isPositiveCount(nbTotal) || !isPctSane(pct)) return false
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
  risquesNaturels?: Record<string, GeoRisque> & {
    retraitGonflementArgile?: GeoRisque
    seisme?: GeoRisque
    inondation?: GeoRisque
    radon?: GeoRisque
  }
  risquesTechnologiques?: Record<string, GeoRisque>
}

// Géorisques expose le rapport-risque via 2 hosts différents selon les
// périodes. On essaie www. (canonical 2026) puis l'apex en fallback. Schema
// reste stable : `risquesNaturels` map keyed sur code interne (libellés FR).
const GEORISQUES_HOSTS = ['https://www.georisques.gouv.fr', 'https://georisques.gouv.fr']

async function fetchGeorisques(codeInsee: string): Promise<GeoRisqueResponse | null> {
  for (const host of GEORISQUES_HOSTS) {
    const data = await fetchJson<GeoRisqueResponse>(
      `${host}/api/v1/resultats_rapport_risque?code_insee=${codeInsee}`
    )
    if (data?.risquesNaturels) return data
  }
  return null
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
  const risk = await fetchGeorisques(commune.code_insee)
  if (!risk?.risquesNaturels) return false
  const rn = risk.risquesNaturels
  const update: Record<string, unknown> = {}

  // Argile — clé canonical Géorisques 2026 vérifiée live : `retraitGonflementArgile`.
  const argile = rn.retraitGonflementArgile
  if (argile?.present || argile?.libelleStatutCommune) {
    const lvl = parseArgileLevel(argile.libelleStatutCommune)
    if (lvl) update.risque_argile = lvl
  }

  const seisme = rn.seisme
  if (seisme?.libelleStatutCommune) {
    const zs = parseZoneSismique(seisme.libelleStatutCommune)
    if (zs != null) update.zone_sismique = zs
  }

  if (rn.inondation?.present != null) update.risque_inondation = !!rn.inondation.present

  const radon = rn.radon
  if (radon?.libelleStatutCommune) {
    const rc = parseRadon(radon.libelleStatutCommune)
    if (rc != null) update.risque_radon = rc
  }

  if (!Object.keys(update).length) return false
  await supabase.from('communes').update(update).eq('code_insee', commune.code_insee)
  return true
}

// ---------------------------------------------------------------------------
// 6. France Rénov (dept-level, cascaded) — nb_maprimerenov_annuel
// ---------------------------------------------------------------------------
// Vérifié 2026-04-29 : aides-france-renov-departements + maprimerenov-
// departements + maprimerenov-par-departement = tous 404. Pas d'API publique
// stable. Workflow officiel = téléchargement manuel via
// data.gouv.fr "base-de-donnees-maprimerenov" puis import via
// `scripts/import-insee-ademe-csv.ts --maprime=./maprime.csv`.
let _maprimeWarned = false
async function enrichMaPrimeRenov(commune: {
  code_insee: string
  departement_code: string
  nb_maprimerenov_annuel: number | null
  population: number
}) {
  if (commune.nb_maprimerenov_annuel != null) return false
  if (!_maprimeWarned) {
    console.log(
      '   ℹ️  MaPrimeRénov: tous les endpoints OpenDataSoft sont 404 (vérifié 2026-04-29).'
    )
    console.log('       Utiliser : scripts/import-insee-ademe-csv.ts --maprime=./maprime.csv')
    _maprimeWarned = true
  }
  return false
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
type CommuneRow = {
  code_insee: string
  slug: string
  name: string
  departement_code: string
  latitude: number | null
  longitude: number | null
  population: number
  prix_m2_moyen: number | null
  revenu_median: number | null
  gentile: string | null
  description: string | null
  pct_passoires_dpe: number | null
  nb_dpe_total: number | null
  risque_argile: string | null
  zone_sismique: number | null
  risque_inondation?: boolean
  risque_radon?: number | null
  nb_catnat?: number | null
  nb_maprimerenov_annuel: number | null
  nb_artisans_btp: number | null
  climat_zone: string | null
  jours_gel_annuels: number | null
}

/** Mappe une source au prédicat "donnée déjà présente en DB". Sert au mode
 *  `--retry-failed` pour relancer uniquement les sources dont la colonne
 *  cible est restée NULL malgré un précédent run marqué "done". */
function isSourceFilled(src: string, c: CommuneRow): boolean {
  switch (src) {
    case 'btp':
      return c.nb_artisans_btp != null && c.nb_artisans_btp > 0
    case 'dvf':
      return c.prix_m2_moyen != null
    case 'filosofi':
      return c.revenu_median != null
    case 'wiki':
      return !!c.gentile && !!c.description
    case 'dpe':
      return c.pct_passoires_dpe != null && c.nb_dpe_total != null
    case 'georisques':
      return !!c.risque_argile && c.zone_sismique != null
    case 'maprime':
      return c.nb_maprimerenov_annuel != null
    case 'climate':
      return !!c.climat_zone && c.jours_gel_annuels != null
    default:
      return false
  }
}

async function main() {
  const progress = loadProgress()
  const args = process.argv.slice(2)
  const onlySource = args.find((_, i) => args[i - 1] === '--source')
  const dryRun = args.includes('--dry-run')
  // `--retry-failed` ignore le checkpoint pour les sources dont la colonne
  // cible est encore NULL en DB. Évite les villes "done" sans données (cas
  // rencontré 2026-04-20 : 35 villes marquées dvf/dpe/georisques mais 0
  // colonne remplie car endpoints down silencieusement).
  const retryFailed = args.includes('--retry-failed')

  console.log(`🚀 Enriching ${TOP40_VILLES.length} top-priority villes`)
  console.log(
    `   Mode: ${onlySource ? `source=${onlySource}` : 'all sources'}${dryRun ? ' [DRY RUN]' : ''}${retryFailed ? ' [RETRY-FAILED]' : ''}`
  )

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
  const attempts: Record<string, number> = {}

  for (const c of communes) {
    const commune = c as CommuneRow
    const slug = commune.slug
    console.log(`\n📌 ${slug} (${commune.code_insee})`)

    for (const src of sources) {
      const filled = isSourceFilled(src, commune)
      const checkpointHit = progress[slug]?.sources.includes(src)
      // Skip uniquement si checkpoint hit ET donnée présente. En mode
      // `--retry-failed`, le checkpoint à lui seul ne suffit plus.
      if (checkpointHit && (filled || !retryFailed)) {
        console.log(
          `   ⏭️  ${src} already done${filled ? '' : ' (but column still NULL — pass --retry-failed to retry)'}`
        )
        continue
      }

      if (dryRun) {
        console.log(`   [DRY] ${src}${retryFailed && !filled ? ' (would retry)' : ''}`)
        continue
      }

      attempts[src] = (attempts[src] || 0) + 1
      let updated = false
      try {
        if (src === 'btp') updated = await enrichNbArtisansBtp(commune)
        else if (src === 'dvf') updated = await enrichDvf(commune)
        else if (src === 'filosofi') updated = await enrichFilosofi(commune)
        else if (src === 'wiki') updated = await enrichWikipedia(commune)
        else if (src === 'dpe') updated = await enrichAdemeDpe(commune)
        else if (src === 'georisques') updated = await enrichGeorisques(commune)
        else if (src === 'maprime') updated = await enrichMaPrimeRenov(commune)
        else if (src === 'climate') updated = await enrichClimate(commune)
      } catch (err) {
        console.error(`   ❌ ${src} error:`, (err as Error).message)
      }

      totals[src] = (totals[src] || 0) + (updated ? 1 : 0)
      console.log(`   ${updated ? '✅' : '—'} ${src}${updated ? ' updated' : ' (no data)'}`)
      // Mark done UNIQUEMENT si la donnée a vraiment été écrite. Sinon on
      // garde le slot ouvert pour un retry futur sans avoir besoin de
      // `--retry-failed`. Préserve l'état des sources qui n'ont pas encore
      // tourné (idempotence).
      if (updated) markDone(progress, slug, src)
      await sleep(300)
    }
  }

  console.log(`\n📊 Summary (attempts → updated) :`)
  for (const src of sources) {
    const a = attempts[src] || 0
    const t = totals[src] || 0
    console.log(`   ${src.padEnd(11)} ${a} → ${t}`)
  }

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
