#!/usr/bin/env npx tsx
/**
 * import-sirene-providers.ts — Import artisans from recherche-entreprises.api.gouv.fr
 * for cities where our database has 0 providers, unblocking /services/[s]/[v] hub
 * pages that currently render empty listings.
 *
 * Target (CEO plan, Pilier 3 vague B.2):
 *   - Orléans (45000, 45100)
 *   - Besançon (25000)
 *   - Nîmes (30000, 30900)
 *   - La Ciotat (13600)
 *
 * For each (city, core trade) pair we hit the public SIRENE search, filter to
 * active establishments, dedup by SIREN, and upsert into `providers` with:
 *   - is_active = false   (manual activation gate)
 *   - is_verified = false (no claim yet)
 *   - noindex = true      (no ranking until the artisan claims or we verify)
 *   - source = 'sirene_import_2026_04_20'
 *
 * Why noindex=true by default: we don't want 4k freshly-imported fiches with
 * no phone/review/claim to flood Google with thin content. They become crawlable
 * only when an artisan claims or we manually verify.
 *
 * CLI:
 *   npx tsx scripts/import-sirene-providers.ts --dry-run           # preview only
 *   npx tsx scripts/import-sirene-providers.ts --limit 5            # per (city,naf)
 *   npx tsx scripts/import-sirene-providers.ts --apply              # actually insert
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { SERVICE_TO_NAF } from '../src/lib/data/service-naf-mapping'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supa = createClient(SUPA_URL, SUPA_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const API_BASE = 'https://recherche-entreprises.api.gouv.fr/search'

type CityTarget = {
  slug: string
  name: string
  postcodes: string[]
  region: string
  inseeCommune: string
}

const CITIES: CityTarget[] = [
  {
    slug: 'orleans',
    name: 'Orléans',
    postcodes: ['45000', '45100'],
    region: 'Centre-Val de Loire',
    inseeCommune: '45234',
  },
  {
    slug: 'besancon',
    name: 'Besançon',
    postcodes: ['25000'],
    region: 'Bourgogne-Franche-Comté',
    inseeCommune: '25056',
  },
  {
    slug: 'nimes',
    name: 'Nîmes',
    postcodes: ['30000', '30900'],
    region: 'Occitanie',
    inseeCommune: '30189',
  },
  {
    slug: 'la-ciotat',
    name: 'La Ciotat',
    postcodes: ['13600'],
    region: "Provence-Alpes-Côte d'Azur",
    inseeCommune: '13028',
  },
]

// Core trades with high demand — skip niche NAFs to keep import manageable.
const CORE_SERVICES = [
  'plombier',
  'electricien',
  'chauffagiste',
  'peintre-en-batiment',
  'menuisier',
  'serrurier',
  'carreleur',
  'couvreur',
  'macon',
  'vitrier',
  'jardinier',
  'facadier',
  'platrier',
  'etancheiste',
  'pompe-a-chaleur',
  'isolation-thermique',
]

type Hit = {
  siren: string
  nom_complet: string
  nom_raison_sociale: string | null
  sigle: string | null
  date_creation: string | null
  etat_administratif: string
  statut_diffusion: string
  tranche_effectif_salarie: string | null
  siege: {
    siret: string
    activite_principale: string
    adresse: string | null
    code_postal: string | null
    libelle_commune: string | null
    latitude: string | null
    longitude: string | null
    etat_administratif: string
    liste_rge: string[] | null
    nom_commercial: string | null
  }
  complements?: { est_rge?: boolean; est_entrepreneur_individuel?: boolean }
}

type SearchResponse = {
  results: Hit[]
  total_results: number
  page: number
  per_page: number
  total_pages: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** SIRENE stores NAF as "4322A"; the public API requires dotted form "43.22A". */
function formatNafApi(naf: string): string {
  const cleaned = naf.replace(/\./g, '')
  if (cleaned.length === 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  return naf
}

async function searchSirene(
  postcode: string,
  naf: string,
  perPage: number,
  attempt = 0
): Promise<Hit[]> {
  const apiNaf = formatNafApi(naf)
  const url = `${API_BASE}?code_postal=${postcode}&activite_principale=${apiNaf}&etat_administratif=A&statut_diffusion=O&page=1&per_page=${perPage}`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (res.status === 429) {
      await sleep(2000)
      return searchSirene(postcode, naf, perPage, attempt)
    }
    if (!res.ok) {
      if (attempt === 0) {
        console.warn(`    ⚠️ HTTP ${res.status} for ${postcode}/${apiNaf}`)
      }
      return []
    }
    const body = (await res.json()) as SearchResponse
    return body.results ?? []
  } catch (err) {
    if (attempt < 2) {
      await sleep(1000 + attempt * 2000)
      return searchSirene(postcode, naf, perPage, attempt + 1)
    }
    console.warn(`    ⚠️ network ${postcode}/${apiNaf}: ${(err as Error).message}`)
    return []
  }
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function stableId(): string {
  return crypto.randomBytes(12).toString('base64url').substring(0, 16)
}

type ProviderRow = {
  siren: string
  siret: string
  name: string
  slug: string
  stable_id: string
  address_city: string
  address_region: string
  address_postcode: string | null
  address_street: string | null
  latitude: number | null
  longitude: number | null
  specialty: string
  is_active: boolean
  is_verified: boolean
  noindex: boolean
  source: string
  source_id: string
}

function hitToProvider(hit: Hit, city: CityTarget, specialty: string): ProviderRow {
  const displayName = hit.siege.nom_commercial || hit.nom_raison_sociale || hit.nom_complet
  const baseSlug = slugify(displayName)
  const sid = stableId()
  const lat = hit.siege.latitude ? parseFloat(hit.siege.latitude) : null
  const lng = hit.siege.longitude ? parseFloat(hit.siege.longitude) : null
  return {
    siren: hit.siren,
    siret: hit.siege.siret,
    name: displayName,
    slug: `${baseSlug}-${sid}`.slice(0, 120),
    stable_id: sid,
    address_city: city.name,
    address_region: city.region,
    address_postcode: hit.siege.code_postal,
    address_street: hit.siege.adresse,
    latitude: lat && Number.isFinite(lat) ? lat : null,
    longitude: lng && Number.isFinite(lng) ? lng : null,
    specialty,
    is_active: false,
    is_verified: false,
    noindex: true,
    source: 'sirene_import_2026_04_20',
    source_id: hit.siren,
  }
}

async function existingSirens(sirens: string[]): Promise<Set<string>> {
  if (sirens.length === 0) return new Set()
  const out = new Set<string>()
  const CHUNK = 500
  for (let i = 0; i < sirens.length; i += CHUNK) {
    const slice = sirens.slice(i, i + CHUNK)
    const { data, error } = await supa.from('providers').select('siren').in('siren', slice)
    if (error) throw new Error(`existingSirens: ${error.message}`)
    for (const r of data || []) if (r.siren) out.add(String(r.siren))
  }
  return out
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--apply')
  const limitArg = args.find((a) => a.startsWith('--limit='))
  const perPage = limitArg ? Math.max(1, Math.min(100, parseInt(limitArg.split('=')[1], 10))) : 25

  console.log(`🏗️  Import SIRENE providers — ${dryRun ? 'DRY RUN' : 'APPLY'}`)
  console.log(
    `   Per-page: ${perPage} | Cities: ${CITIES.length} | Services: ${CORE_SERVICES.length}`
  )
  console.log()

  const allHits = new Map<string, { hit: Hit; city: CityTarget; specialty: string }>()
  let apiCalls = 0

  for (const city of CITIES) {
    console.log(`📍 ${city.name} (${city.postcodes.join(', ')})`)
    for (const specialty of CORE_SERVICES) {
      const nafCodes = SERVICE_TO_NAF[specialty] || []
      for (const naf of nafCodes) {
        for (const pc of city.postcodes) {
          apiCalls++
          const hits = await searchSirene(pc, naf, perPage)
          // Dedup across postcodes/nafs — first occurrence wins.
          for (const h of hits) {
            if (h.siege.etat_administratif !== 'A') continue
            if (allHits.has(h.siren)) continue
            allHits.set(h.siren, { hit: h, city, specialty })
          }
          await sleep(180) // 5 req/s ceiling
        }
      }
      process.stdout.write(`   ${specialty.padEnd(22)} hits=${allHits.size}\r`)
    }
    console.log()
  }

  console.log(`\n📊 Distinct SIREN collected: ${allHits.size} (${apiCalls} API calls)`)

  const sirens = Array.from(allHits.keys())
  const already = await existingSirens(sirens)
  console.log(`   Already in DB: ${already.size}`)

  const toInsert: ProviderRow[] = []
  for (const [siren, { hit, city, specialty }] of allHits) {
    if (already.has(siren)) continue
    toInsert.push(hitToProvider(hit, city, specialty))
  }
  console.log(`   To insert: ${toInsert.length}`)

  // Per-city breakdown
  const byCity = new Map<string, number>()
  const bySpecialty = new Map<string, number>()
  for (const p of toInsert) {
    byCity.set(p.address_city, (byCity.get(p.address_city) || 0) + 1)
    bySpecialty.set(p.specialty, (bySpecialty.get(p.specialty) || 0) + 1)
  }
  console.log('\n   Par ville:')
  for (const [c, n] of byCity) console.log(`     ${c.padEnd(12)} ${n}`)
  console.log('   Top 10 specialties:')
  const topSpec = Array.from(bySpecialty.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  for (const [s, n] of topSpec) console.log(`     ${s.padEnd(22)} ${n}`)

  if (dryRun) {
    console.log('\n⏭️  DRY RUN — add --apply to insert. Sample:')
    for (const p of toInsert.slice(0, 3)) {
      console.log(
        `     ${p.name} | ${p.specialty} | ${p.address_city} ${p.address_postcode} | SIREN ${p.siren}`
      )
    }
    return
  }

  console.log(`\n📥 Inserting ${toInsert.length} providers…`)
  const BATCH = 200
  let inserted = 0
  let errors = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const slice = toInsert.slice(i, i + BATCH)
    const { error } = await supa.from('providers').insert(slice)
    if (error) {
      console.error(`   ❌ Batch ${i}-${i + slice.length}: ${error.message}`)
      // Fallback individual inserts to quarantine bad rows
      for (const row of slice) {
        const { error: e2 } = await supa.from('providers').insert(row)
        if (e2) errors++
        else inserted++
      }
    } else {
      inserted += slice.length
    }
    process.stdout.write(`   ${inserted}/${toInsert.length}\r`)
  }
  console.log(`\n✅ Inserted: ${inserted}  | ❌ Errors: ${errors}`)
  console.log(`   All rows set to is_active=false noindex=true — manual activation required.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
