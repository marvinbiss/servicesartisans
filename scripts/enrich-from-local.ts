#!/usr/bin/env npx tsx
/**
 * enrich-from-local.ts — Enrich communes using LOCAL data only (no external APIs).
 *
 * 1. Counts providers per commune from the providers table (replaces SIRENE API)
 * 2. Assigns climate data by department (replaces Open-Meteo API)
 *
 * Zero external API calls — runs in ~2-3 minutes for all 34,969 communes.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Climate data by department (source: Météo-France normals 1991-2020)
// ---------------------------------------------------------------------------

interface DeptClimate {
  zone: string
  jours_gel: number
  precip: number
  temp_hiver: number
  temp_ete: number
  travaux_debut: number // month 1-12
  travaux_fin: number
}

const DEPT_CLIMATE: Record<string, DeptClimate> = {
  // Île-de-France
  '75': { zone: 'semi-océanique', jours_gel: 30, precip: 640, temp_hiver: 4.5, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '77': { zone: 'semi-océanique', jours_gel: 40, precip: 680, temp_hiver: 3.5, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '78': { zone: 'semi-océanique', jours_gel: 35, precip: 660, temp_hiver: 4.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '91': { zone: 'semi-océanique', jours_gel: 35, precip: 650, temp_hiver: 4.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '92': { zone: 'semi-océanique', jours_gel: 28, precip: 640, temp_hiver: 4.5, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '93': { zone: 'semi-océanique', jours_gel: 28, precip: 640, temp_hiver: 4.5, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '94': { zone: 'semi-océanique', jours_gel: 28, precip: 640, temp_hiver: 4.5, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '95': { zone: 'semi-océanique', jours_gel: 35, precip: 660, temp_hiver: 4.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  // Nord / Hauts-de-France
  '02': { zone: 'océanique', jours_gel: 45, precip: 720, temp_hiver: 3.5, temp_ete: 18.5, travaux_debut: 4, travaux_fin: 10 },
  '59': { zone: 'océanique', jours_gel: 40, precip: 750, temp_hiver: 4.0, temp_ete: 18.0, travaux_debut: 4, travaux_fin: 10 },
  '60': { zone: 'océanique', jours_gel: 42, precip: 700, temp_hiver: 3.5, temp_ete: 18.5, travaux_debut: 4, travaux_fin: 10 },
  '62': { zone: 'océanique', jours_gel: 38, precip: 780, temp_hiver: 4.0, temp_ete: 17.5, travaux_debut: 4, travaux_fin: 10 },
  '80': { zone: 'océanique', jours_gel: 40, precip: 720, temp_hiver: 4.0, temp_ete: 18.0, travaux_debut: 4, travaux_fin: 10 },
  // Grand Est
  '08': { zone: 'continental', jours_gel: 60, precip: 800, temp_hiver: 2.0, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '10': { zone: 'continental', jours_gel: 55, precip: 700, temp_hiver: 2.5, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '51': { zone: 'continental', jours_gel: 50, precip: 650, temp_hiver: 3.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '52': { zone: 'continental', jours_gel: 60, precip: 800, temp_hiver: 2.0, temp_ete: 18.5, travaux_debut: 5, travaux_fin: 10 },
  '54': { zone: 'continental', jours_gel: 55, precip: 750, temp_hiver: 2.5, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '55': { zone: 'continental', jours_gel: 58, precip: 780, temp_hiver: 2.5, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '57': { zone: 'continental', jours_gel: 60, precip: 750, temp_hiver: 2.0, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '67': { zone: 'continental', jours_gel: 55, precip: 600, temp_hiver: 2.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '68': { zone: 'continental', jours_gel: 55, precip: 650, temp_hiver: 2.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '88': { zone: 'continental', jours_gel: 70, precip: 1000, temp_hiver: 1.0, temp_ete: 18.0, travaux_debut: 5, travaux_fin: 10 },
  // Normandie
  '14': { zone: 'océanique', jours_gel: 30, precip: 800, temp_hiver: 5.0, temp_ete: 17.5, travaux_debut: 4, travaux_fin: 10 },
  '27': { zone: 'océanique', jours_gel: 35, precip: 700, temp_hiver: 4.5, temp_ete: 18.5, travaux_debut: 4, travaux_fin: 10 },
  '50': { zone: 'océanique', jours_gel: 20, precip: 900, temp_hiver: 6.0, temp_ete: 17.0, travaux_debut: 4, travaux_fin: 10 },
  '61': { zone: 'océanique', jours_gel: 40, precip: 750, temp_hiver: 4.0, temp_ete: 18.0, travaux_debut: 4, travaux_fin: 10 },
  '76': { zone: 'océanique', jours_gel: 30, precip: 820, temp_hiver: 5.0, temp_ete: 17.5, travaux_debut: 4, travaux_fin: 10 },
  // Bretagne
  '22': { zone: 'océanique', jours_gel: 15, precip: 850, temp_hiver: 6.5, temp_ete: 17.5, travaux_debut: 4, travaux_fin: 11 },
  '29': { zone: 'océanique', jours_gel: 10, precip: 1000, temp_hiver: 7.0, temp_ete: 17.0, travaux_debut: 4, travaux_fin: 11 },
  '35': { zone: 'océanique', jours_gel: 20, precip: 750, temp_hiver: 5.5, temp_ete: 18.0, travaux_debut: 4, travaux_fin: 11 },
  '56': { zone: 'océanique', jours_gel: 15, precip: 900, temp_hiver: 6.5, temp_ete: 17.5, travaux_debut: 4, travaux_fin: 11 },
  // Pays de la Loire
  '44': { zone: 'océanique', jours_gel: 20, precip: 750, temp_hiver: 6.0, temp_ete: 19.0, travaux_debut: 3, travaux_fin: 11 },
  '49': { zone: 'océanique', jours_gel: 25, precip: 680, temp_hiver: 5.5, temp_ete: 19.0, travaux_debut: 3, travaux_fin: 11 },
  '53': { zone: 'océanique', jours_gel: 30, precip: 750, temp_hiver: 5.0, temp_ete: 18.5, travaux_debut: 4, travaux_fin: 10 },
  '72': { zone: 'océanique', jours_gel: 30, precip: 700, temp_hiver: 5.0, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  '85': { zone: 'océanique', jours_gel: 15, precip: 800, temp_hiver: 6.5, temp_ete: 19.0, travaux_debut: 3, travaux_fin: 11 },
  // Centre-Val de Loire
  '18': { zone: 'semi-océanique', jours_gel: 40, precip: 700, temp_hiver: 4.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '28': { zone: 'semi-océanique', jours_gel: 38, precip: 620, temp_hiver: 4.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '36': { zone: 'semi-océanique', jours_gel: 40, precip: 700, temp_hiver: 4.0, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  '37': { zone: 'semi-océanique', jours_gel: 35, precip: 680, temp_hiver: 4.5, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '41': { zone: 'semi-océanique', jours_gel: 38, precip: 670, temp_hiver: 4.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '45': { zone: 'semi-océanique', jours_gel: 38, precip: 650, temp_hiver: 4.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  // Bourgogne-Franche-Comté
  '21': { zone: 'continental', jours_gel: 55, precip: 750, temp_hiver: 2.5, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '25': { zone: 'continental', jours_gel: 70, precip: 1100, temp_hiver: 1.0, temp_ete: 18.5, travaux_debut: 5, travaux_fin: 10 },
  '39': { zone: 'continental', jours_gel: 65, precip: 1000, temp_hiver: 1.5, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '58': { zone: 'continental', jours_gel: 50, precip: 800, temp_hiver: 3.0, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  '70': { zone: 'continental', jours_gel: 60, precip: 900, temp_hiver: 2.0, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  '71': { zone: 'continental', jours_gel: 50, precip: 800, temp_hiver: 3.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '89': { zone: 'semi-océanique', jours_gel: 45, precip: 700, temp_hiver: 3.5, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '90': { zone: 'continental', jours_gel: 60, precip: 950, temp_hiver: 1.5, temp_ete: 19.0, travaux_debut: 5, travaux_fin: 10 },
  // Nouvelle-Aquitaine
  '16': { zone: 'océanique', jours_gel: 25, precip: 750, temp_hiver: 5.5, temp_ete: 20.5, travaux_debut: 3, travaux_fin: 11 },
  '17': { zone: 'océanique', jours_gel: 15, precip: 800, temp_hiver: 6.5, temp_ete: 20.0, travaux_debut: 3, travaux_fin: 11 },
  '19': { zone: 'semi-océanique', jours_gel: 45, precip: 900, temp_hiver: 3.5, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  '23': { zone: 'semi-océanique', jours_gel: 50, precip: 950, temp_hiver: 3.0, temp_ete: 18.5, travaux_debut: 4, travaux_fin: 10 },
  '24': { zone: 'océanique', jours_gel: 30, precip: 800, temp_hiver: 5.0, temp_ete: 20.5, travaux_debut: 3, travaux_fin: 11 },
  '33': { zone: 'océanique', jours_gel: 15, precip: 850, temp_hiver: 7.0, temp_ete: 21.0, travaux_debut: 3, travaux_fin: 11 },
  '40': { zone: 'océanique', jours_gel: 12, precip: 950, temp_hiver: 7.0, temp_ete: 21.0, travaux_debut: 3, travaux_fin: 11 },
  '47': { zone: 'océanique', jours_gel: 25, precip: 750, temp_hiver: 5.5, temp_ete: 21.0, travaux_debut: 3, travaux_fin: 11 },
  '64': { zone: 'océanique', jours_gel: 15, precip: 1200, temp_hiver: 7.0, temp_ete: 20.0, travaux_debut: 3, travaux_fin: 11 },
  '79': { zone: 'océanique', jours_gel: 25, precip: 800, temp_hiver: 5.5, temp_ete: 19.5, travaux_debut: 3, travaux_fin: 11 },
  '86': { zone: 'océanique', jours_gel: 30, precip: 700, temp_hiver: 5.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '87': { zone: 'semi-océanique', jours_gel: 40, precip: 900, temp_hiver: 4.0, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  // Occitanie
  '09': { zone: 'montagnard', jours_gel: 55, precip: 900, temp_hiver: 3.0, temp_ete: 20.0, travaux_debut: 5, travaux_fin: 10 },
  '11': { zone: 'méditerranéen', jours_gel: 15, precip: 600, temp_hiver: 7.0, temp_ete: 23.5, travaux_debut: 3, travaux_fin: 11 },
  '12': { zone: 'semi-océanique', jours_gel: 50, precip: 850, temp_hiver: 3.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '30': { zone: 'méditerranéen', jours_gel: 12, precip: 700, temp_hiver: 7.5, temp_ete: 24.0, travaux_debut: 3, travaux_fin: 11 },
  '31': { zone: 'semi-océanique', jours_gel: 25, precip: 650, temp_hiver: 5.5, temp_ete: 21.5, travaux_debut: 3, travaux_fin: 11 },
  '32': { zone: 'océanique', jours_gel: 25, precip: 700, temp_hiver: 5.5, temp_ete: 21.0, travaux_debut: 3, travaux_fin: 11 },
  '34': { zone: 'méditerranéen', jours_gel: 10, precip: 650, temp_hiver: 7.5, temp_ete: 24.5, travaux_debut: 3, travaux_fin: 11 },
  '46': { zone: 'semi-océanique', jours_gel: 40, precip: 800, temp_hiver: 4.5, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '48': { zone: 'montagnard', jours_gel: 70, precip: 1000, temp_hiver: 1.5, temp_ete: 18.0, travaux_debut: 5, travaux_fin: 10 },
  '65': { zone: 'montagnard', jours_gel: 50, precip: 1100, temp_hiver: 3.5, temp_ete: 19.5, travaux_debut: 5, travaux_fin: 10 },
  '66': { zone: 'méditerranéen', jours_gel: 12, precip: 550, temp_hiver: 8.0, temp_ete: 24.0, travaux_debut: 3, travaux_fin: 11 },
  '81': { zone: 'semi-océanique', jours_gel: 30, precip: 750, temp_hiver: 5.0, temp_ete: 21.0, travaux_debut: 4, travaux_fin: 10 },
  '82': { zone: 'semi-océanique', jours_gel: 28, precip: 700, temp_hiver: 5.5, temp_ete: 21.0, travaux_debut: 3, travaux_fin: 11 },
  // Auvergne-Rhône-Alpes
  '01': { zone: 'continental', jours_gel: 50, precip: 850, temp_hiver: 2.5, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '03': { zone: 'semi-océanique', jours_gel: 50, precip: 750, temp_hiver: 3.0, temp_ete: 19.5, travaux_debut: 4, travaux_fin: 10 },
  '07': { zone: 'méditerranéen', jours_gel: 25, precip: 850, temp_hiver: 5.0, temp_ete: 22.0, travaux_debut: 3, travaux_fin: 11 },
  '15': { zone: 'montagnard', jours_gel: 70, precip: 1000, temp_hiver: 1.0, temp_ete: 17.5, travaux_debut: 5, travaux_fin: 10 },
  '26': { zone: 'méditerranéen', jours_gel: 25, precip: 800, temp_hiver: 4.5, temp_ete: 22.5, travaux_debut: 3, travaux_fin: 11 },
  '38': { zone: 'continental', jours_gel: 45, precip: 900, temp_hiver: 3.0, temp_ete: 20.5, travaux_debut: 4, travaux_fin: 10 },
  '42': { zone: 'continental', jours_gel: 50, precip: 750, temp_hiver: 3.0, temp_ete: 20.0, travaux_debut: 4, travaux_fin: 10 },
  '43': { zone: 'montagnard', jours_gel: 65, precip: 700, temp_hiver: 1.5, temp_ete: 18.5, travaux_debut: 5, travaux_fin: 10 },
  '63': { zone: 'semi-océanique', jours_gel: 55, precip: 700, temp_hiver: 3.0, temp_ete: 19.0, travaux_debut: 4, travaux_fin: 10 },
  '69': { zone: 'continental', jours_gel: 40, precip: 800, temp_hiver: 3.5, temp_ete: 21.0, travaux_debut: 4, travaux_fin: 10 },
  '73': { zone: 'montagnard', jours_gel: 80, precip: 1200, temp_hiver: 0.0, temp_ete: 17.0, travaux_debut: 6, travaux_fin: 9 },
  '74': { zone: 'montagnard', jours_gel: 75, precip: 1300, temp_hiver: 0.5, temp_ete: 17.5, travaux_debut: 5, travaux_fin: 10 },
  // PACA
  '04': { zone: 'montagnard', jours_gel: 50, precip: 700, temp_hiver: 3.0, temp_ete: 21.5, travaux_debut: 4, travaux_fin: 10 },
  '05': { zone: 'montagnard', jours_gel: 80, precip: 800, temp_hiver: 0.0, temp_ete: 18.0, travaux_debut: 5, travaux_fin: 10 },
  '06': { zone: 'méditerranéen', jours_gel: 5, precip: 750, temp_hiver: 9.0, temp_ete: 24.0, travaux_debut: 3, travaux_fin: 11 },
  '13': { zone: 'méditerranéen', jours_gel: 8, precip: 550, temp_hiver: 8.0, temp_ete: 24.5, travaux_debut: 3, travaux_fin: 11 },
  '83': { zone: 'méditerranéen', jours_gel: 8, precip: 700, temp_hiver: 8.5, temp_ete: 24.0, travaux_debut: 3, travaux_fin: 11 },
  '84': { zone: 'méditerranéen', jours_gel: 15, precip: 650, temp_hiver: 6.5, temp_ete: 24.0, travaux_debut: 3, travaux_fin: 11 },
  // Corse
  '2A': { zone: 'méditerranéen', jours_gel: 5, precip: 700, temp_hiver: 9.5, temp_ete: 25.0, travaux_debut: 3, travaux_fin: 11 },
  '2B': { zone: 'méditerranéen', jours_gel: 5, precip: 750, temp_hiver: 9.0, temp_ete: 24.5, travaux_debut: 3, travaux_fin: 11 },
  // DOM-TOM (basic)
  '971': { zone: 'tropical', jours_gel: 0, precip: 1500, temp_hiver: 25.0, temp_ete: 28.0, travaux_debut: 1, travaux_fin: 12 },
  '972': { zone: 'tropical', jours_gel: 0, precip: 1800, temp_hiver: 25.0, temp_ete: 28.0, travaux_debut: 1, travaux_fin: 12 },
  '973': { zone: 'tropical', jours_gel: 0, precip: 2500, temp_hiver: 26.0, temp_ete: 28.0, travaux_debut: 1, travaux_fin: 12 },
  '974': { zone: 'tropical', jours_gel: 0, precip: 1500, temp_hiver: 22.0, temp_ete: 27.0, travaux_debut: 1, travaux_fin: 12 },
  '976': { zone: 'tropical', jours_gel: 0, precip: 1200, temp_hiver: 24.0, temp_ete: 28.0, travaux_debut: 1, travaux_fin: 12 },
}

// ---------------------------------------------------------------------------
// 1. Count providers per commune (from providers table)
// ---------------------------------------------------------------------------

async function enrichProviderCounts() {
  console.log('\n🏗️ Counting providers per commune from providers table...')

  // Get all active provider cities
  const PAGE = 1000
  const cityCounts = new Map<string, number>()
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('providers')
      .select('address_city')
      .eq('is_active', true)
      .not('address_city', 'is', null)
      .range(offset, offset + PAGE - 1)

    if (error || !data) { console.error('Error fetching providers:', error); break }
    for (const p of data) {
      const city = (p.address_city as string).trim()
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
    }
    if (data.length < PAGE) hasMore = false
    else offset += PAGE
    if (offset % 10000 === 0) console.log(`  Scanned ${offset} providers...`)
  }

  console.log(`  Found providers in ${cityCounts.size} distinct cities`)

  // Now update communes — match by name
  const communePages = 1000
  let communeOffset = 0
  let updated = 0
  let communeHasMore = true

  while (communeHasMore) {
    const { data: communes, error } = await supabase
      .from('communes')
      .select('code_insee,name')
      .eq('is_active', true)
      .range(communeOffset, communeOffset + communePages - 1)

    if (error || !communes) break

    // Batch update
    for (const c of communes) {
      const count = cityCounts.get(c.name) || 0
      if (count > 0) {
        await supabase.from('communes').update({
          provider_count: count,
          nb_artisans_btp: count, // Our providers ARE the artisans BTP
        }).eq('code_insee', c.code_insee)
        updated++
      }
    }

    if (communes.length < communePages) communeHasMore = false
    else communeOffset += communePages
    if (communeOffset % 5000 === 0) console.log(`  Processed ${communeOffset} communes, updated ${updated}`)
  }

  console.log(`✅ Provider counts: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// 2. Assign climate data by department
// ---------------------------------------------------------------------------

async function enrichClimateByDept() {
  console.log('\n🌡️ Assigning climate data by department...')

  const PAGE = 1000
  let offset = 0
  let updated = 0
  let hasMore = true

  while (hasMore) {
    const { data: communes, error } = await supabase
      .from('communes')
      .select('code_insee,departement_code')
      .eq('is_active', true)
      .range(offset, offset + PAGE - 1)

    if (error || !communes) break

    for (const c of communes) {
      const climate = DEPT_CLIMATE[c.departement_code]
      if (!climate) continue

      await supabase.from('communes').update({
        climat_zone: climate.zone,
        jours_gel_annuels: climate.jours_gel,
        precipitation_annuelle: climate.precip,
        temperature_moyenne_hiver: climate.temp_hiver,
        temperature_moyenne_ete: climate.temp_ete,
        mois_travaux_ext_debut: climate.travaux_debut,
        mois_travaux_ext_fin: climate.travaux_fin,
      }).eq('code_insee', c.code_insee)
      updated++
    }

    if (communes.length < PAGE) hasMore = false
    else offset += PAGE
    if (offset % 5000 === 0) console.log(`  Processed ${offset} communes, updated ${updated}`)
  }

  console.log(`✅ Climate: updated ${updated} communes`)
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)
  const source = args.find((_, i) => args[i - 1] === '--source') || 'all'

  console.log(`🚀 Local enrichment — source: ${source}`)

  if (source === 'all' || source === 'providers') {
    await enrichProviderCounts()
  }
  if (source === 'all' || source === 'climate') {
    await enrichClimateByDept()
  }

  console.log('\n🎉 Done!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
