/**
 * Script pour étendre la liste des villes dans france.ts
 * Fetch toutes les communes de 10 000+ habitants depuis geo.api.gouv.fr
 * Génère des descriptions SEO riches et des quartiers/communes voisines
 * Fusionne avec les villes existantes (qui gardent leurs données originales)
 *
 * Usage: npx tsx scripts/generate-villes.ts
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
  centre?: { type: string; coordinates: [number, number] }
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
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function escapeString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ---------------------------------------------------------------------------
// Region & department context for SEO descriptions
// ---------------------------------------------------------------------------

const regionContext: Record<string, { adjective: string; traits: string[] }> = {
  'Île-de-France': { adjective: 'francilienne', traits: ['la r\u00e9gion parisienne', 'le dynamisme \u00e9conomique', 'un habitat dense n\u00e9cessitant des artisans r\u00e9actifs'] },
  'Auvergne-Rh\u00f4ne-Alpes': { adjective: 'rh\u00f4nalpine', traits: ['les Alpes et la vall\u00e9e du Rh\u00f4ne', 'un patrimoine b\u00e2ti montagnard et urbain', 'des besoins en chauffage et isolation'] },
  'Provence-Alpes-C\u00f4te d\'Azur': { adjective: 'proven\u00e7ale', traits: ['le climat m\u00e9diterran\u00e9en', 'des b\u00e2timents anciens en pierre', 'des besoins en climatisation et r\u00e9novation'] },
  'Occitanie': { adjective: 'occitane', traits: ['le sud de la France', 'un patrimoine architectural riche', 'un ensoleillement favorisant les travaux ext\u00e9rieurs'] },
  'Nouvelle-Aquitaine': { adjective: 'n\u00e9o-aquitaine', traits: ['le sud-ouest atlantique', 'un habitat vari\u00e9 du littoral \u00e0 l\'int\u00e9rieur', 'des besoins en r\u00e9novation \u00e9nerg\u00e9tique'] },
  'Hauts-de-France': { adjective: 'nordiste', traits: ['le nord de la France', 'un patrimoine industriel en reconversion', 'des besoins importants en isolation thermique'] },
  'Grand Est': { adjective: 'du Grand Est', traits: ['le carrefour europ\u00e9en', 'une architecture alsacienne et lorraine', 'des hivers rigoureux n\u00e9cessitant une bonne isolation'] },
  'Pays de la Loire': { adjective: 'lig\u00e9rienne', traits: ['la fa\u00e7ade atlantique', 'les ch\u00e2teaux de la Loire', 'un dynamisme immobilier croissant'] },
  'Bretagne': { adjective: 'bretonne', traits: ['le littoral atlantique', 'un habitat en granit et ardoise', 'des besoins sp\u00e9cifiques li\u00e9s au climat oc\u00e9anique'] },
  'Normandie': { adjective: 'normande', traits: ['le patrimoine historique', 'une architecture \u00e0 colombages', 'des besoins en r\u00e9novation et \u00e9tanch\u00e9it\u00e9'] },
  'Bourgogne-Franche-Comt\u00e9': { adjective: 'bourguignonne', traits: ['le c\u0153ur de la France', 'un patrimoine viticole et historique', 'des b\u00e2timents anciens \u00e0 r\u00e9nover'] },
  'Centre-Val de Loire': { adjective: 'du Centre', traits: ['les ch\u00e2teaux de la Loire', 'un patrimoine architectural exceptionnel', 'des besoins en entretien de maisons individuelles'] },
  'Corse': { adjective: 'corse', traits: ['l\'\u00eele de beaut\u00e9', 'un habitat m\u00e9diterran\u00e9en traditionnel', 'des artisans aux savoir-faire insulaires'] },
  'Guadeloupe': { adjective: 'guadeloup\u00e9enne', traits: ['les Antilles fran\u00e7aises', 'un climat tropical', 'des besoins sp\u00e9cifiques en construction cyclonique'] },
  'Martinique': { adjective: 'martiniquaise', traits: ['les Cara\u00efbes', 'une architecture cr\u00e9ole', 'des artisans sp\u00e9cialis\u00e9s en climat tropical'] },
  'Guyane': { adjective: 'guyanaise', traits: ['l\'Am\u00e9rique du Sud', 'un climat \u00e9quatorial', 'des besoins adapt\u00e9s au milieu tropical'] },
  'La R\u00e9union': { adjective: 'r\u00e9unionnaise', traits: ['l\'oc\u00e9an Indien', 'une g\u00e9ographie volcanique', 'des constructions adapt\u00e9es aux cyclones'] },
  'Mayotte': { adjective: 'mahoraise', traits: ['l\'archipel des Comores', 'un d\u00e9veloppement rapide', 'des besoins croissants en construction'] },
}

function getSizeLabel(pop: number): string {
  if (pop >= 200000) return 'grande m\u00e9tropole'
  if (pop >= 100000) return 'grande ville'
  if (pop >= 50000) return 'ville importante'
  if (pop >= 30000) return 'ville dynamique'
  if (pop >= 20000) return 'ville active'
  return 'commune'
}

function generateRichDescription(
  name: string,
  departement: string,
  region: string,
  population: number,
  nearbyNames: string[],
): string {
  const ctx = regionContext[region] || { adjective: 'fran\u00e7aise', traits: ['la France', 'un patrimoine diversifi\u00e9', 'des artisans qualifi\u00e9s'] }
  const sizeLabel = getSizeLabel(population)
  const popStr = formatPopulation(population)
  const nearby = nearbyNames.slice(0, 3)
  const nearbyStr = nearby.length > 0 ? `, ainsi que ${nearby.join(', ')}` : ''

  // 8 template variants for diversity — pick deterministically by name hash
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const templates = [
    // 0
    `${name} est une ${sizeLabel} de ${popStr} habitants situ\u00e9e dans le d\u00e9partement ${departement} en ${region}. Nos artisans qualifi\u00e9s interviennent \u00e0 ${name}${nearbyStr} pour tous vos travaux : plomberie, \u00e9lectricit\u00e9, serrurerie, peinture, r\u00e9novation et d\u00e9pannage urgent.`,
    // 1
    `Trouvez un artisan de confiance \u00e0 ${name} (${departement}). Avec ${popStr} habitants, cette ${sizeLabel} ${ctx.adjective} dispose d\u2019un r\u00e9seau de professionnels exp\u00e9riment\u00e9s pour la r\u00e9novation, le d\u00e9pannage et l\u2019entretien de votre habitat${nearbyStr}.`,
    // 2
    `Besoin d\u2019un professionnel \u00e0 ${name} ? Situ\u00e9e en ${region}, cette ${sizeLabel} du ${departement} b\u00e9n\u00e9ficie de ${ctx.traits[2]}. Comparez les artisans et demandez un devis gratuit pour vos travaux${nearbyStr}.`,
    // 3
    `\u00c0 ${name}, ${sizeLabel} du ${departement} (${popStr} hab.), trouvez rapidement un artisan qualifi\u00e9 pour vos projets. Que ce soit pour ${ctx.traits[1]}, nos professionnels interviennent dans toute la commune${nearbyStr}.`,
    // 4
    `Artisans v\u00e9rifi\u00e9s \u00e0 ${name} et ses environs. Cette ${sizeLabel} ${ctx.adjective} de ${popStr} habitants en ${departement} compte de nombreux professionnels pour la plomberie, l\u2019\u00e9lectricit\u00e9, la menuiserie, la peinture et tous vos travaux${nearbyStr}.`,
    // 5
    `${name} (${departement}, ${region}) est une ${sizeLabel} de ${popStr} habitants o\u00f9 nos artisans certifi\u00e9s proposent des services de qualit\u00e9 : r\u00e9novation, construction, d\u00e9pannage et entretien. Devis gratuit et intervention rapide${nearbyStr}.`,
    // 6
    `D\u00e9couvrez les meilleurs artisans \u00e0 ${name} en ${departement}. Avec ${ctx.traits[0]} et ${popStr} habitants, cette ${sizeLabel} offre un large choix de professionnels pour tous vos travaux de r\u00e9novation et d\u00e9pannage${nearbyStr}.`,
    // 7
    `Vous habitez \u00e0 ${name} ou ses environs ? Nos artisans qualifi\u00e9s du ${departement} sont disponibles pour tous vos travaux. ${name}, ${sizeLabel} ${ctx.adjective} de ${popStr} habitants, m\u00e9rite des professionnels \u00e0 la hauteur${nearbyStr}.`,
  ]

  return templates[hash % templates.length]
}

// ---------------------------------------------------------------------------
// Parsing existing villes from france.ts
// ---------------------------------------------------------------------------

function parseExistingVilles(content: string): Map<string, { description: string; quartiers: string[]; codePostal: string }> {
  const map = new Map<string, { description: string; quartiers: string[]; codePostal: string }>()
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
        const entryRegex = /\{\s*slug:\s*'([^']+)',\s*name:\s*'(?:[^'\\]|\\.)*',\s*region:\s*'(?:[^'\\]|\\.)*',\s*departement:\s*'(?:[^'\\]|\\.)*',\s*departementCode:\s*'([^']*)',\s*population:\s*'([^']*)',\s*codePostal:\s*'([^']*)',\s*description:\s*'((?:[^'\\]|\\.)*)',\s*quartiers:\s*\[(.*?)\],?\s*\}/gs
        let m
        while ((m = entryRegex.exec(villesSection)) !== null) {
          const slug = m[1]
          const codePostal = m[4]
          const description = m[5].replace(/\\'/g, "'")
          const quartiersRaw = m[6]
          const quartiers = quartiersRaw
            .split(',')
            .map(q => q.trim().replace(/^'|'$/g, '').replace(/\\'/g, "'"))
            .filter(q => q.length > 0)
          map.set(slug, { description, quartiers, codePostal })
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
// Find nearby communes using coordinates
// ---------------------------------------------------------------------------

function findNearbyCommunes(
  target: GeoCommune,
  allCommunes: GeoCommune[],
  maxCount: number = 6,
  maxDistanceKm: number = 25,
): string[] {
  if (!target.centre?.coordinates) return []
  const [lon, lat] = target.centre.coordinates

  // Same department communes, sorted by distance
  const candidates = allCommunes
    .filter(c =>
      c.code !== target.code &&
      c.population >= 2000 && // Only meaningful communes
      c.centre?.coordinates &&
      c.departement.code === target.departement.code
    )
    .map(c => ({
      name: c.nom,
      distance: haversineKm(lat, lon, c.centre!.coordinates[1], c.centre!.coordinates[0]),
    }))
    .filter(c => c.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance)

  return candidates.slice(0, maxCount).map(c => c.name)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching all communes from geo.api.gouv.fr...')

  const url = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,population,departement,region,centre&limit=50000'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)

  const allCommunes: GeoCommune[] = await res.json()
  console.log(`Total communes fetched: ${allCommunes.length}`)

  const big = allCommunes.filter(c => c.population >= 10000)
  console.log(`Communes with 10,000+ inhabitants: ${big.length}`)
  big.sort((a, b) => b.population - a.population)

  // Read existing france.ts
  const francePath = path.join(__dirname, '..', 'src', 'lib', 'data', 'france.ts')
  const content = fs.readFileSync(francePath, 'utf-8')

  const existingMap = parseExistingVilles(content)
  console.log(`Existing villes preserved: ${existingMap.size}`)

  // Index all communes by department for faster nearby lookup
  const communesByDept = new Map<string, GeoCommune[]>()
  for (const c of allCommunes) {
    const dept = c.departement.code
    if (!communesByDept.has(dept)) communesByDept.set(dept, [])
    communesByDept.get(dept)!.push(c)
  }

  // Build the new villes array
  const seenSlugs = new Set<string>()
  const newVilles: Ville[] = []
  let enrichedCount = 0

  for (const c of big) {
    const slug = slugify(c.nom)
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)

    const existing = existingMap.get(slug)
    const codePostal = existing?.codePostal || (c.codesPostaux?.[0] || '')

    if (existing) {
      // Keep existing ville data entirely
      newVilles.push({
        slug,
        name: c.nom,
        region: c.region.nom,
        departement: c.departement.nom,
        departementCode: c.departement.code,
        population: formatPopulation(c.population),
        codePostal,
        description: existing.description,
        quartiers: existing.quartiers,
      })
    } else {
      // Generate rich data for new ville
      const nearby = findNearbyCommunes(c, communesByDept.get(c.departement.code) || [], 6, 25)
      const description = generateRichDescription(
        c.nom, c.departement.nom, c.region.nom, c.population, nearby
      )

      // Use nearby communes as "quartiers et environs"
      const quartiers = nearby.length > 0
        ? ['Centre-ville', ...nearby]
        : ['Centre-ville']

      newVilles.push({
        slug,
        name: c.nom,
        region: c.region.nom,
        departement: c.departement.nom,
        departementCode: c.departement.code,
        population: formatPopulation(c.population),
        codePostal,
        description,
        quartiers,
      })
      enrichedCount++
    }
  }

  console.log(`Total villes: ${newVilles.length}`)
  console.log(`Existing kept: ${newVilles.length - enrichedCount}`)
  console.log(`New enriched: ${enrichedCount}`)

  // Generate TypeScript
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

  // Replace in france.ts
  const normalized = content.replace(/\r\n/g, '\n')
  const [sliceStart, sliceEnd] = findVillesArrayBounds(normalized)

  const newVillesBlock = `// ${newVilles.length} villes fran\u00e7aises (communes de 10 000+ habitants)\nexport const villes: Ville[] = [\n${villesCode},\n]\n`

  const newContent = normalized.substring(0, sliceStart) + newVillesBlock + normalized.substring(sliceEnd)

  fs.writeFileSync(francePath, newContent, 'utf-8')

  console.log(`\nDone! Updated france.ts with ${newVilles.length} villes.`)
  console.log(`Pages /villes/[ville]: ${newVilles.length}`)
  console.log(`Pages /services/[service]/[location]: ${newVilles.length * 15}`)

  // Show samples
  const samples = newVilles.filter(v => !existingMap.has(v.slug)).slice(0, 3)
  for (const s of samples) {
    console.log(`\n--- ${s.name} (${s.departement}) ---`)
    console.log(`Description: ${s.description}`)
    console.log(`Quartiers: ${s.quartiers.join(', ')}`)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
