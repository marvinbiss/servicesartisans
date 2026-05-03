/**
 * Diagnostic address_region — état actuel avant normalisation.
 * Audit F (2026-05-03) a révélé : 62.6% des artisans RGE sans région normalisée.
 */
import { supabase } from './lib/supabase-admin'

async function main() {
  console.log('='.repeat(70))
  console.log('DIAGNOSTIC address_region — providers RGE')
  console.log('='.repeat(70))

  const { data, error } = await supabase
    .from('providers')
    .select('id, address_region, address_postal_code, address_department, address_city')
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
    .limit(20000)
  if (error) {
    console.error(error)
    return
  }
  if (!data) return

  const stats = {
    total: data.length,
    null: 0,
    empty: 0,
    code_dept: 0,
    name_normalized: 0,
    name_unaccented: 0,
    name_other: 0,
  }

  const sampleByCategory: Record<string, string[]> = {
    null: [],
    empty: [],
    code_dept: [],
    name_normalized: [],
    name_unaccented: [],
    name_other: [],
  }

  const REGIONS_NORMALIZED = new Set([
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    "Provence-Alpes-Côte d'Azur",
    'Guadeloupe',
    'Martinique',
    'Guyane',
    'La Réunion',
    'Mayotte',
  ])

  const REGIONS_UNACCENTED = new Set([
    'Auvergne-Rhone-Alpes',
    'Bourgogne-Franche-Comte',
    'Ile-de-France',
    "Provence-Alpes-Cote d'Azur",
  ])

  for (const r of data) {
    const reg = r.address_region as string | null
    if (reg === null) {
      stats.null++
      if (sampleByCategory.null.length < 3)
        sampleByCategory.null.push(`(${r.address_postal_code}, ${r.address_city})`)
    } else if (!reg.trim()) {
      stats.empty++
    } else if (/^\d{1,3}$/.test(reg)) {
      stats.code_dept++
      if (sampleByCategory.code_dept.length < 5)
        sampleByCategory.code_dept.push(`"${reg}" (${r.address_postal_code}, ${r.address_city})`)
    } else if (REGIONS_NORMALIZED.has(reg)) {
      stats.name_normalized++
    } else if (REGIONS_UNACCENTED.has(reg)) {
      stats.name_unaccented++
      if (sampleByCategory.name_unaccented.length < 5)
        sampleByCategory.name_unaccented.push(`"${reg}"`)
    } else {
      stats.name_other++
      if (sampleByCategory.name_other.length < 8) sampleByCategory.name_other.push(`"${reg}"`)
    }
  }

  console.log('\nDistribution sur', stats.total, 'fiches RGE :')
  console.log(
    '  - null               :',
    stats.null,
    `(${((100 * stats.null) / stats.total).toFixed(1)}%)`
  )
  console.log('  - empty              :', stats.empty)
  console.log(
    '  - code département   :',
    stats.code_dept,
    `(samples: ${sampleByCategory.code_dept.join(', ')})`
  )
  console.log('  - nom normalisé      :', stats.name_normalized)
  console.log(
    '  - nom sans accent    :',
    stats.name_unaccented,
    `(samples: ${sampleByCategory.name_unaccented.join(', ')})`
  )
  console.log('  - autre              :', stats.name_other)
  if (sampleByCategory.name_other.length) {
    console.log('    samples (autre)    :', sampleByCategory.name_other.join(', '))
  }
  if (sampleByCategory.null.length) {
    console.log('    samples (null)     :', sampleByCategory.null.join(', '))
  }

  // Vérifier address_department / postal_code dispo pour reconstruction
  const has_dept = data.filter((r) => r.address_department).length
  const has_postal = data.filter((r) => r.address_postal_code).length
  console.log('\nDonnées dispo pour reconstruction :')
  console.log(
    '  - address_department :',
    has_dept,
    `(${((100 * has_dept) / stats.total).toFixed(1)}%)`
  )
  console.log(
    '  - address_postal_code:',
    has_postal,
    `(${((100 * has_postal) / stats.total).toFixed(1)}%)`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
