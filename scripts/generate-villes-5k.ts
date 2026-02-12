/**
 * Script pour étendre la liste des villes dans france.ts
 * Ajoute toutes les communes de 5 000+ habitants (actuellement le seuil est 10 000)
 * Fusionne avec les villes existantes (qui gardent leurs données originales)
 *
 * Usage: npx tsx scripts/generate-villes-5k.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Ville {
  slug: string
  name: string
  region: string
  departement: string
  departementCode: string
  population: string
  codePostal: string
  description: string
  quartiers: string[]
}

interface GeoCommune {
  nom: string
  code: string
  codesPostaux: string[]
  population: number
  departement: { code: string; nom: string }
  region: { code: string; nom: string }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatPopulation(pop: number): string {
  const rounded = Math.round(pop / 1000) * 1000
  // For small populations, round to nearest 500
  const value = pop < 10000 ? Math.round(pop / 500) * 500 : rounded
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function escapeString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

// ---------------------------------------------------------------------------
// Parsing existing villes from france.ts
// ---------------------------------------------------------------------------

interface ExistingVilleData {
  slug: string
  name: string
  region: string
  departement: string
  departementCode: string
  population: string
  codePostal: string
  description: string
  quartiers: string[]
}

function parseExistingVilles(content: string): Map<string, ExistingVilleData> {
  const map = new Map<string, ExistingVilleData>()
  const normalized = content.replace(/\r\n/g, '\n')

  const startMarker = 'export const villes: Ville[] = ['
  const startIdx = normalized.indexOf(startMarker)
  if (startIdx === -1) return map

  const arrayStart = startIdx + startMarker.length - 1
  let depth = 0
  for (let i = arrayStart; i < normalized.length; i++) {
    if (normalized[i] === '[') depth++
    else if (normalized[i] === ']') {
      depth--
      if (depth === 0) {
        const villesSection = normalized.substring(arrayStart + 1, i)
        const entryRegex = /\{\s*slug:\s*'([^']+)',\s*name:\s*'((?:[^'\\]|\\.)*)',\s*region:\s*'((?:[^'\\]|\\.)*)',\s*departement:\s*'((?:[^'\\]|\\.)*)',\s*departementCode:\s*'([^']*)',\s*population:\s*'([^']*)',\s*codePostal:\s*'([^']*)',\s*description:\s*'((?:[^'\\]|\\.)*)',\s*quartiers:\s*\[(.*?)\],?\s*\}/gs
        let m
        while ((m = entryRegex.exec(villesSection)) !== null) {
          const slug = m[1]
          const name = m[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
          const region = m[3].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
          const departement = m[4].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
          const departementCode = m[5]
          const population = m[6]
          const codePostal = m[7]
          const description = m[8].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
          const quartiersRaw = m[9]
          const quartiers = quartiersRaw
            .split(',')
            .map(q => q.trim().replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\\\/g, '\\'))
            .filter(q => q.length > 0)
          map.set(slug, { slug, name, region, departement, departementCode, population, codePostal, description, quartiers })
        }
        break
      }
    }
  }
  return map
}

function findVillesArrayBounds(content: string): [number, number] {
  const normalized = content.replace(/\r\n/g, '\n')
  const marker = 'export const villes: Ville[] = ['
  const markerIdx = normalized.indexOf(marker)
  // Find the start of the comment line above the export
  const commentIdx = normalized.lastIndexOf('\n', markerIdx)
  const startIdx = commentIdx >= 0 ? commentIdx + 1 : markerIdx
  const bracketStart = markerIdx + marker.length - 1
  let depth = 0
  let endIdx = bracketStart
  for (let i = bracketStart; i < normalized.length; i++) {
    if (normalized[i] === '[') depth++
    else if (normalized[i] === ']') {
      depth--
      if (depth === 0) {
        endIdx = i + 1
        if (normalized[endIdx] === '\n') endIdx++
        break
      }
    }
  }
  return [startIdx, endIdx]
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching all communes from geo.api.gouv.fr...')

  const url = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,population,departement,region&limit=50000'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)

  const allCommunes: GeoCommune[] = await res.json()
  console.log(`Total communes fetched: ${allCommunes.length}`)

  const qualifying = allCommunes.filter(c => c.population >= 5000)
  console.log(`Communes with 5,000+ inhabitants: ${qualifying.length}`)
  qualifying.sort((a, b) => b.population - a.population)

  // Read existing france.ts
  const francePath = path.join(__dirname, '..', 'src', 'lib', 'data', 'france.ts')
  const content = fs.readFileSync(francePath, 'utf-8')

  const existingMap = parseExistingVilles(content)
  console.log(`Existing villes parsed: ${existingMap.size}`)

  // Build the new villes array
  // Track slugs to handle duplicates (same city name in different departments)
  const seenSlugs = new Map<string, string>() // slug -> commune code
  const newVilles: Ville[] = []
  let keptCount = 0
  let addedCount = 0

  for (const c of qualifying) {
    let slug = slugify(c.nom)

    // Handle duplicate slugs: cities with same name in different departments
    if (seenSlugs.has(slug) && seenSlugs.get(slug) !== c.code) {
      slug = `${slug}-${c.departement.code}`
    }

    // If still duplicate, skip (shouldn't happen)
    if (seenSlugs.has(slug)) continue
    seenSlugs.set(slug, c.code)

    // Check if this city already exists in the current file
    // Try both the regular slug and the department-suffixed slug
    const existing = existingMap.get(slug) || existingMap.get(slugify(c.nom))

    if (existing) {
      // Keep existing ville data entirely (preserve handcrafted descriptions & quartiers)
      newVilles.push({
        slug: existing.slug, // Keep the original slug
        name: existing.name,
        region: existing.region,
        departement: existing.departement,
        departementCode: existing.departementCode,
        population: existing.population,
        codePostal: existing.codePostal,
        description: existing.description,
        quartiers: existing.quartiers,
      })
      keptCount++
    } else {
      // Generate new ville entry
      const codePostal = c.codesPostaux?.[0] || ''
      const description = `Trouvez des artisans qualifiés à ${c.nom} (${c.departement.nom}). Nos professionnels interviennent dans toute la commune et ses environs pour tous vos travaux.`

      newVilles.push({
        slug,
        name: c.nom,
        region: c.region.nom,
        departement: c.departement.nom,
        departementCode: c.departement.code,
        population: formatPopulation(c.population),
        codePostal,
        description,
        quartiers: ['Centre-ville'],
      })
      addedCount++
    }
  }

  // Also add any existing villes that are NOT in the API results (edge cases)
  // This ensures we don't lose manually-added cities
  const allNewSlugs = new Set(newVilles.map(v => v.slug))
  for (const [slug, ville] of existingMap) {
    if (!allNewSlugs.has(slug)) {
      console.log(`  Keeping existing city not found in API: ${ville.name} (${slug})`)
      newVilles.push(ville)
      keptCount++
    }
  }

  // Sort by population descending (parse the formatted population string)
  newVilles.sort((a, b) => {
    const popA = parseInt(a.population.replace(/\s/g, ''), 10) || 0
    const popB = parseInt(b.population.replace(/\s/g, ''), 10) || 0
    return popB - popA
  })

  console.log(`\nTotal villes: ${newVilles.length}`)
  console.log(`Existing kept: ${keptCount}`)
  console.log(`New added: ${addedCount}`)

  // Generate TypeScript for the villes array
  const villesCode = newVilles.map(v => {
    const quartiersStr = v.quartiers.map(q => `'${escapeString(q)}'`).join(', ')
    return `  {
    slug: '${escapeString(v.slug)}',
    name: '${escapeString(v.name)}',
    region: '${escapeString(v.region)}',
    departement: '${escapeString(v.departement)}',
    departementCode: '${escapeString(v.departementCode)}',
    population: '${v.population}',
    codePostal: '${escapeString(v.codePostal)}',
    description: '${escapeString(v.description)}',
    quartiers: [${quartiersStr}],
  }`
  }).join(',\n')

  // Replace the villes array in france.ts, preserving everything else
  const normalized = content.replace(/\r\n/g, '\n')
  const [sliceStart, sliceEnd] = findVillesArrayBounds(normalized)

  const newVillesBlock = `// ${newVilles.length} villes françaises (communes de 5 000+ habitants)\nexport const villes: Ville[] = [\n${villesCode},\n]\n`

  const newContent = normalized.substring(0, sliceStart) + newVillesBlock + normalized.substring(sliceEnd)

  fs.writeFileSync(francePath, newContent, 'utf-8')

  console.log(`\nDone! Updated france.ts with ${newVilles.length} villes.`)
  console.log(`Pages /villes/[ville]: ${newVilles.length}`)
  console.log(`Pages /services/[service]/[location]: ${newVilles.length * 15}`)

  // Show a few sample new entries
  const samples = newVilles.filter(v => !existingMap.has(v.slug)).slice(0, 5)
  if (samples.length > 0) {
    console.log('\n--- Sample new entries ---')
    for (const s of samples) {
      console.log(`  ${s.name} (${s.departement}, pop. ${s.population}): ${s.description.substring(0, 80)}...`)
    }
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
