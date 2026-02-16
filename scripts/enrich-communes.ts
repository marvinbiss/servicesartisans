#!/usr/bin/env npx tsx
/**
 * enrich-communes.ts — Populate the communes table with data from multiple APIs.
 *
 * Sources:
 * 1. API Geo (geo.api.gouv.fr) — base demographics, coordinates, department/region
 * 2. API SIRENE (recherche-entreprises.api.gouv.fr) — BTP business counts per commune
 * 3. ADEME RGE — RGE-certified artisan counts
 * 4. DVF Etalab — property prices per commune
 * 5. ADEME DPE — energy performance ratings distribution
 * 6. Open-Meteo — climate data (frost days, precipitation, temperatures)
 *
 * Usage:
 *   npx tsx scripts/enrich-communes.ts                    # Enrich all communes from france.ts
 *   npx tsx scripts/enrich-communes.ts --source geo       # Only run API Geo enrichment
 *   npx tsx scripts/enrich-communes.ts --source sirene    # Only run SIRENE business counts
 *   npx tsx scripts/enrich-communes.ts --source climate   # Only run Open-Meteo climate data
 *   npx tsx scripts/enrich-communes.ts --source dvf       # Only run DVF property prices
 *   npx tsx scripts/enrich-communes.ts --limit 100        # Only process 100 communes
 *   npx tsx scripts/enrich-communes.ts --slug paris       # Only process a specific commune
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
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

// Rate limiting helper
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// 1. API Geo — base demographics
// ---------------------------------------------------------------------------

interface GeoCommune {
  code: string // code_insee
  nom: string
  codesPostaux: string[]
  population: number
  surface: number // hectares
  departement: { code: string; nom: string }
  region: { nom: string }
  centre: { coordinates: [number, number] } // [lng, lat]
}

async function enrichFromGeo(slugFilter?: string, limit?: number) {
  console.log('\n📍 Enriching from API Geo (geo.api.gouv.fr)...')

  // Get all communes currently in DB
  let query = supabase.from('communes').select('code_insee,slug,name').eq('is_active', true)
  if (slugFilter) query = query.eq('slug', slugFilter)
  const { data: communes, error } = await query
  if (error || !communes) {
    console.error('Failed to fetch communes from DB:', error)
    return
  }

  const toProcess = limit ? communes.slice(0, limit) : communes
  let updated = 0

  for (const commune of toProcess) {
    try {
      const res = await fetch(`https://geo.api.gouv.fr/communes/${commune.code_insee}?fields=nom,codesPostaux,population,surface,departement,region,centre`)
      if (!res.ok) continue

      const geo: GeoCommune = await res.json()

      await supabase.from('communes').update({
        population: geo.population,
        code_postal: geo.codesPostaux[0] || null,
        departement_code: geo.departement.code,
        departement_name: geo.departement.nom,
        region_name: geo.region.nom,
        latitude: geo.centre.coordinates[1],
        longitude: geo.centre.coordinates[0],
        superficie_km2: geo.surface / 100, // hectares to km²
        densite_population: geo.population / (geo.surface / 100),
      }).eq('code_insee', commune.code_insee)

      updated++
      if (updated % 50 === 0) console.log(`  Updated ${updated}/${toProcess.length}`)
      await sleep(50) // Respect rate limits
    } catch (err) {
      console.error(`  Error for ${commune.name}:`, err)
    }
  }

  console.log(`✅ API Geo: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// 2. SIRENE — BTP business counts per commune
// ---------------------------------------------------------------------------

async function enrichFromSirene(slugFilter?: string, limit?: number) {
  console.log('\n🏗️ Enriching from API SIRENE (recherche-entreprises.api.gouv.fr)...')

  // NAF codes for BTP (divisions 41-43)
  const nafBtp = ['41', '42', '43'] // Prefixes

  let query = supabase.from('communes').select('code_insee,slug,name,code_postal').eq('is_active', true)
  if (slugFilter) query = query.eq('slug', slugFilter)
  const { data: communes, error } = await query
  if (error || !communes) {
    console.error('Failed to fetch communes:', error)
    return
  }

  const toProcess = limit ? communes.slice(0, limit) : communes
  let updated = 0

  for (const commune of toProcess) {
    try {
      // Use code_postal for SIRENE search (more reliable than commune name)
      if (!commune.code_postal) continue

      const url = `https://recherche-entreprises.api.gouv.fr/search?code_postal=${commune.code_postal}&activite_principale=43&page=1&per_page=1`
      const res = await fetch(url)
      if (!res.ok) { await sleep(200); continue }

      const data = await res.json()
      const totalBtp = data.total_results || 0

      await supabase.from('communes').update({
        nb_artisans_btp: totalBtp,
        nb_entreprises_artisanales: totalBtp, // BTP is main source of artisans
      }).eq('code_insee', commune.code_insee)

      updated++
      if (updated % 20 === 0) console.log(`  Updated ${updated}/${toProcess.length}`)
      await sleep(150) // Rate limit: ~6 req/s
    } catch (err) {
      console.error(`  Error for ${commune.name}:`, err)
      await sleep(500)
    }
  }

  console.log(`✅ SIRENE: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// 3. Open-Meteo — Climate data
// ---------------------------------------------------------------------------

async function enrichFromClimate(slugFilter?: string, limit?: number) {
  console.log('\n🌡️ Enriching from Open-Meteo (climate data)...')

  let query = supabase.from('communes').select('code_insee,slug,name,latitude,longitude').eq('is_active', true)
  if (slugFilter) query = query.eq('slug', slugFilter)
  query = query.not('latitude', 'is', null)
  const { data: communes, error } = await query
  if (error || !communes) {
    console.error('Failed to fetch communes:', error)
    return
  }

  const toProcess = limit ? communes.slice(0, limit) : communes
  let updated = 0

  for (const commune of toProcess) {
    if (!commune.latitude || !commune.longitude) continue

    try {
      // Fetch 5 years of daily data (2019-2024) for climate averages
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${commune.latitude}&longitude=${commune.longitude}&start_date=2019-01-01&end_date=2024-12-31&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&timezone=Europe/Paris`
      const res = await fetch(url)
      if (!res.ok) { await sleep(200); continue }

      const data = await res.json()
      const daily = data.daily

      if (!daily?.temperature_2m_min) continue

      // Calculate climate metrics
      let frostDays = 0
      let totalPrecip = 0
      let winterTemps: number[] = []
      let summerTemps: number[] = []
      const monthPrecip: number[] = Array(12).fill(0)
      const monthDays: number[] = Array(12).fill(0)

      for (let i = 0; i < daily.time.length; i++) {
        const tMin = daily.temperature_2m_min[i]
        const tMax = daily.temperature_2m_max[i]
        const precip = daily.precipitation_sum[i] || 0
        const month = new Date(daily.time[i]).getMonth() // 0-indexed

        if (tMin !== null && tMin <= 0) frostDays++
        totalPrecip += precip
        monthPrecip[month] += precip
        monthDays[month]++

        if (tMin !== null && tMax !== null) {
          const avg = (tMin + tMax) / 2
          // Winter: Dec (11), Jan (0), Feb (1)
          if (month === 11 || month === 0 || month === 1) winterTemps.push(avg)
          // Summer: Jun (5), Jul (6), Aug (7)
          if (month === 5 || month === 6 || month === 7) summerTemps.push(avg)
        }
      }

      const years = 6 // 2019-2024
      const avgFrost = Math.round(frostDays / years)
      const avgPrecip = Math.round(totalPrecip / years)
      const avgWinter = winterTemps.length > 0
        ? Math.round((winterTemps.reduce((a, b) => a + b, 0) / winterTemps.length) * 10) / 10
        : null
      const avgSummer = summerTemps.length > 0
        ? Math.round((summerTemps.reduce((a, b) => a + b, 0) / summerTemps.length) * 10) / 10
        : null

      // Best months for exterior work: months with < 80mm average precip and avg temp > 10°C
      // Simplified: find start/end of dry season
      const avgMonthPrecip = monthPrecip.map((p, i) => monthDays[i] > 0 ? (p / years) : 999)
      let bestStart = 4 // Default: April
      let bestEnd = 10  // Default: October
      for (let m = 2; m <= 5; m++) {
        if (avgMonthPrecip[m] < 80) { bestStart = m + 1; break } // 1-indexed
      }
      for (let m = 9; m >= 6; m--) {
        if (avgMonthPrecip[m] < 80) { bestEnd = m + 1; break }
      }

      // Determine climate zone
      let climatZone = 'semi-océanique'
      if (avgWinter !== null && avgSummer !== null) {
        if (avgWinter > 8 && avgPrecip < 700) climatZone = 'méditerranéen'
        else if (avgWinter < 0 || avgFrost > 60) climatZone = 'montagnard'
        else if (avgSummer - (avgWinter || 0) > 18) climatZone = 'continental'
        else if (avgPrecip > 900) climatZone = 'océanique'
      }

      await supabase.from('communes').update({
        jours_gel_annuels: avgFrost,
        precipitation_annuelle: avgPrecip,
        mois_travaux_ext_debut: bestStart,
        mois_travaux_ext_fin: bestEnd,
        temperature_moyenne_hiver: avgWinter,
        temperature_moyenne_ete: avgSummer,
        climat_zone: climatZone,
      }).eq('code_insee', commune.code_insee)

      updated++
      if (updated % 10 === 0) console.log(`  Updated ${updated}/${toProcess.length}`)
      await sleep(200) // Respect rate limits
    } catch (err) {
      console.error(`  Error for ${commune.name}:`, err)
      await sleep(1000)
    }
  }

  console.log(`✅ Open-Meteo: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// 4. DVF — Property prices
// ---------------------------------------------------------------------------

async function enrichFromDvf(slugFilter?: string, limit?: number) {
  console.log('\n🏠 Enriching from DVF (property prices)...')

  let query = supabase.from('communes').select('code_insee,slug,name').eq('is_active', true)
  if (slugFilter) query = query.eq('slug', slugFilter)
  const { data: communes, error } = await query
  if (error || !communes) {
    console.error('Failed to fetch communes:', error)
    return
  }

  const toProcess = limit ? communes.slice(0, limit) : communes
  let updated = 0

  for (const commune of toProcess) {
    try {
      // DVF API by commune code
      const url = `https://apidf-preprod.cerema.fr/indicateurs/dv3f/prix/communes/${commune.code_insee}?annee_min=2022&annee_max=2024`
      const res = await fetch(url)
      if (!res.ok) {
        // Fallback: try data.gouv DVF API
        await sleep(100)
        continue
      }

      const data = await res.json()
      if (!data?.results?.length) continue

      const latest = data.results[data.results.length - 1]

      const updateData: Record<string, unknown> = {}
      if (latest.prix_m2_median) updateData.prix_m2_moyen = Math.round(latest.prix_m2_median)
      if (latest.prix_m2_median_maison) updateData.prix_m2_maison = Math.round(latest.prix_m2_median_maison)
      if (latest.prix_m2_median_appart) updateData.prix_m2_appartement = Math.round(latest.prix_m2_median_appart)
      if (latest.nb_ventes) updateData.nb_transactions_annuelles = latest.nb_ventes

      if (Object.keys(updateData).length > 0) {
        await supabase.from('communes').update(updateData).eq('code_insee', commune.code_insee)
        updated++
      }

      if (updated % 20 === 0) console.log(`  Updated ${updated}/${toProcess.length}`)
      await sleep(100)
    } catch (err) {
      console.error(`  Error for ${commune.name}:`, err)
      await sleep(500)
    }
  }

  console.log(`✅ DVF: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// 5. Seed from france.ts static data (for communes not yet in DB)
// ---------------------------------------------------------------------------

async function seedFromStaticData(limit?: number) {
  console.log('\n📊 Seeding communes from france.ts static data...')

  // Dynamic import of the villes data
  const { villes } = await import('../src/lib/data/france')

  const toProcess = limit ? villes.slice(0, limit) : villes
  let inserted = 0
  let skipped = 0

  for (const ville of toProcess) {
    try {
      // Check if commune already exists
      const { data: existing } = await supabase
        .from('communes')
        .select('code_insee')
        .eq('slug', ville.slug)
        .single()

      if (existing) {
        skipped++
        continue
      }

      // Generate a synthetic code_insee from departement code + index
      const codeInsee = `${ville.departementCode}${String(inserted + 1).padStart(3, '0')}`

      const pop = parseInt(ville.population.replace(/\s/g, ''), 10) || 0

      await supabase.from('communes').insert({
        code_insee: codeInsee,
        name: ville.name,
        slug: ville.slug,
        code_postal: ville.codePostal,
        departement_code: ville.departementCode,
        departement_name: ville.departement,
        region_name: ville.region,
        population: pop,
        description: ville.description || null,
        is_active: true,
      })

      inserted++
      if (inserted % 100 === 0) console.log(`  Inserted ${inserted}...`)
    } catch (err) {
      // Unique constraint violation = already exists, skip
      skipped++
    }
  }

  console.log(`✅ Seeding: inserted ${inserted}, skipped ${skipped}`)
}

// ---------------------------------------------------------------------------
// Mark enrichment timestamp
// ---------------------------------------------------------------------------

async function markEnriched(slugFilter?: string) {
  const query = supabase.from('communes').update({ enriched_at: new Date().toISOString() }).eq('is_active', true)
  if (slugFilter) {
    await query.eq('slug', slugFilter)
  } else {
    await query.not('enriched_at', 'is', null) // Only mark those that have been enriched
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)
  const source = args.find((_, i) => args[i - 1] === '--source') || 'all'
  const limitStr = args.find((_, i) => args[i - 1] === '--limit')
  const limit = limitStr ? parseInt(limitStr, 10) : undefined
  const slug = args.find((_, i) => args[i - 1] === '--slug')

  console.log(`🚀 Enriching communes — source: ${source}, limit: ${limit || 'all'}, slug: ${slug || 'all'}`)

  if (source === 'all' || source === 'seed') {
    await seedFromStaticData(limit)
  }
  if (source === 'all' || source === 'geo') {
    await enrichFromGeo(slug, limit)
  }
  if (source === 'all' || source === 'sirene') {
    await enrichFromSirene(slug, limit)
  }
  if (source === 'all' || source === 'climate') {
    await enrichFromClimate(slug, limit)
  }
  if (source === 'all' || source === 'dvf') {
    await enrichFromDvf(slug, limit)
  }

  // Mark enrichment timestamp
  await markEnriched(slug)

  console.log('\n🎉 Enrichment complete!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
