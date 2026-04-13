#!/usr/bin/env node
/**
 * Générateur de banque d'images Unsplash pour ServicesArtisans
 *
 * Usage :
 *   UNSPLASH_ACCESS_KEY=xxx node scripts/generate-unsplash-images.mjs
 *
 * Clé gratuite : https://unsplash.com/developers → New Application → Access Key
 * Rate limit : 50 requêtes/heure (free tier)
 *
 * Le script génère des fichiers TypeScript dans src/lib/data/images-generated/
 * avec ~50 images par service (2 pages de 30 résultats).
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'src/lib/data/images-generated')

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
if (!ACCESS_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY manquante.')
  console.error('   Crée une app gratuite sur https://unsplash.com/developers')
  console.error('   Puis : UNSPLASH_ACCESS_KEY=xxx node scripts/generate-unsplash-images.mjs')
  process.exit(1)
}

// ── Mapping service slug → mots-clés de recherche Unsplash (anglais = meilleurs résultats) ──
const SERVICE_KEYWORDS = {
  'plombier': ['plumber working', 'plumbing repair', 'pipe wrench', 'bathroom plumbing'],
  'electricien': ['electrician work', 'electrical wiring', 'circuit breaker', 'electrical panel'],
  'serrurier': ['locksmith', 'door lock repair', 'key cutting', 'security lock'],
  'chauffagiste': ['heating repair', 'boiler maintenance', 'radiator install', 'HVAC technician'],
  'peintre-en-batiment': ['house painting', 'wall painting interior', 'painter roller', 'paint renovation'],
  'menuisier': ['carpenter workshop', 'woodworking', 'custom furniture making', 'wood cabinet'],
  'carreleur': ['tile installation', 'bathroom tiles', 'floor tiling', 'ceramic tile work'],
  'couvreur': ['roof repair', 'roofer working', 'roofing tiles', 'roof construction'],
  'macon': ['masonry work', 'bricklayer', 'concrete construction', 'stone wall building'],
  'jardinier': ['gardener working', 'garden landscaping', 'hedge trimming', 'lawn maintenance'],
  'climaticien': ['air conditioning install', 'HVAC system', 'AC unit repair', 'climate control'],
  'cuisiniste': ['kitchen renovation', 'kitchen design modern', 'kitchen cabinet install', 'kitchen remodel'],
  'salle-de-bain': ['bathroom renovation', 'modern bathroom design', 'shower install', 'bathroom remodel'],
  'vitrier': ['glass repair', 'window glazing', 'glass cutting', 'window installation'],
  'poseur-de-parquet': ['hardwood floor install', 'parquet flooring', 'wood floor sanding', 'laminate flooring'],
  'facadier': ['facade renovation', 'exterior plastering', 'building facade', 'stucco application'],
  'charpentier': ['timber framing', 'roof structure wood', 'carpentry construction', 'wood beam install'],
  'terrassier': ['excavation work', 'earthmoving equipment', 'foundation digging', 'land grading'],
  'isolation-thermique': ['insulation install', 'thermal insulation wall', 'home insulation', 'spray foam insulation'],
  'domoticien': ['smart home install', 'home automation', 'smart thermostat', 'connected home'],
  'paysagiste': ['landscape design', 'garden architecture', 'outdoor landscaping', 'patio design'],
  'pisciniste': ['swimming pool construction', 'pool maintenance', 'pool installation', 'backyard pool'],
  'alarme-securite': ['home security system', 'alarm installation', 'security camera', 'surveillance system'],
  'platrier': ['plastering wall', 'drywall install', 'plaster ceiling', 'gypsum board'],
  'antenniste': ['satellite dish install', 'TV antenna', 'antenna technician', 'cable installation'],
  'architecte-interieur': ['interior design', 'home staging', 'interior architecture', 'modern interior'],
  'ascensoriste': ['elevator repair', 'lift maintenance', 'elevator technician', 'escalator repair'],
  'borne-recharge': ['EV charging station', 'electric car charger', 'charging point install', 'EV infrastructure'],
  'decorateur': ['home decoration', 'interior decorator', 'wallpaper hanging', 'home styling'],
  'demenageur': ['moving service', 'furniture movers', 'moving truck', 'packing boxes moving'],
  'deratisation': ['pest control', 'rodent control', 'exterminator work', 'pest management'],
  'desinsectisation': ['insect control', 'bug exterminator', 'pest treatment', 'fumigation'],
  'diagnostiqueur': ['home inspection', 'building diagnostic', 'energy audit home', 'property inspection'],
  'etancheiste': ['waterproofing', 'roof sealing', 'membrane waterproof', 'leak repair roof'],
  'ferronnier': ['ironwork craft', 'wrought iron gate', 'metal railing', 'blacksmith forge'],
  'geometre': ['land surveyor', 'surveying equipment', 'topographic survey', 'property boundary'],
  'metallier': ['metalworking', 'steel fabrication', 'metal welding', 'aluminum structure'],
  'miroitier': ['mirror installation', 'glass workshop', 'custom mirror', 'glass replacement'],
  'nettoyage': ['professional cleaning', 'deep cleaning house', 'industrial cleaning', 'cleaning service'],
  'panneaux-solaires': ['solar panel install', 'photovoltaic roof', 'solar energy home', 'solar technician'],
  'pompe-a-chaleur': ['heat pump install', 'air source heat pump', 'geothermal system', 'heat pump outdoor'],
  'ramoneur': ['chimney sweep', 'fireplace cleaning', 'chimney inspection', 'flue cleaning'],
  'renovation-energetique': ['energy renovation home', 'green building', 'eco renovation', 'energy efficient home'],
  'solier': ['floor covering install', 'vinyl flooring', 'carpet laying', 'linoleum floor'],
  'storiste': ['blinds installation', 'awning install', 'roller shutters', 'window shading'],
  'zingueur': ['zinc roofing', 'gutter installation', 'metal flashing', 'downspout repair'],
}

const PAGES_PER_SERVICE = 1 // 1 page × 30 = 30 photos par keyword
const PER_PAGE = 30
const RATE_LIMIT_DELAY_MS = 4000 // ~15 req/min — safe for 50 req/hour free tier with bursts

// ── Fetch helpers ──

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function searchUnsplash(query, page = 1) {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(PER_PAGE))
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high') // Safe content only

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  })

  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    // Wait until rate limit resets (typically 1 hour from first request)
    const resetHeader = res.headers.get('x-ratelimit-reset') // Unix timestamp
    let waitMs = 10 * 60_000 // Default 10 min
    if (resetHeader) {
      const resetTime = parseInt(resetHeader, 10) * 1000
      waitMs = Math.max(resetTime - Date.now() + 5000, 60_000) // +5s buffer
    }
    const waitMin = Math.ceil(waitMs / 60_000)
    console.error(`⚠️  Rate limit atteint (remaining: ${remaining}). Pause ${waitMin} min...`)
    await sleep(waitMs)
    return searchUnsplash(query, page) // Retry
  }

  if (!res.ok) {
    console.error(`❌ Erreur API ${res.status}: ${await res.text()}`)
    return []
  }

  const data = await res.json()
  return data.results || []
}

function photoToEntry(photo) {
  // Extract the photo ID part from the Unsplash URL
  // URLs look like: https://images.unsplash.com/photo-XXXXX?ixlib=...
  const rawUrl = photo.urls?.raw || photo.urls?.regular || ''
  const match = rawUrl.match(/photo-([a-zA-Z0-9_-]+)/)
  const photoId = match ? match[1] : photo.id

  return {
    id: photoId,
    alt: (photo.alt_description || photo.description || '').slice(0, 120),
    photographer: photo.user?.name || 'Unknown',
    unsplashId: photo.id, // For attribution
  }
}

// ── Progress tracking ──

function loadProgress() {
  const progressFile = join(OUTPUT_DIR, '_progress.json')
  if (existsSync(progressFile)) {
    return JSON.parse(readFileSync(progressFile, 'utf-8'))
  }
  return {}
}

function saveProgress(progress) {
  const progressFile = join(OUTPUT_DIR, '_progress.json')
  writeFileSync(progressFile, JSON.stringify(progress, null, 2))
}

// ── Main ──

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const progress = loadProgress()
  const services = Object.keys(SERVICE_KEYWORDS)

  console.log(`\n🖼️  Génération d'images pour ${services.length} services`)
  console.log(`   Objectif : ~${PAGES_PER_SERVICE * PER_PAGE} images/service\n`)

  const allResults = {}
  let totalPhotos = 0
  let requestCount = 0

  for (const slug of services) {
    // Skip if already done
    if (progress[slug]?.complete) {
      console.log(`⏭️  ${slug} — déjà fait (${progress[slug].count} photos)`)
      allResults[slug] = progress[slug].photos || []
      totalPhotos += progress[slug].count
      continue
    }

    const keywords = SERVICE_KEYWORDS[slug]
    const photos = new Map() // Dedup by photo ID

    // Use max 2 keywords to save API calls (46 services × 2 = 92 requests)
    const keywordsToUse = keywords.slice(0, 2)
    for (const keyword of keywordsToUse) {
      console.log(`🔍 ${slug} — "${keyword}"...`)
      const results = await searchUnsplash(keyword, 1)
      requestCount++

      for (const photo of results) {
        const entry = photoToEntry(photo)
        if (entry.id && !photos.has(entry.id)) {
          photos.set(entry.id, entry)
        }
      }

      await sleep(RATE_LIMIT_DELAY_MS)
    }

    const photoArray = Array.from(photos.values()).slice(0, 60)
    allResults[slug] = photoArray
    totalPhotos += photoArray.length

    // Save progress after each service
    progress[slug] = { complete: true, count: photoArray.length, photos: photoArray }
    saveProgress(progress)

    console.log(`✅ ${slug} — ${photoArray.length} photos (total: ${totalPhotos}, requêtes: ${requestCount})\n`)
  }

  // ── Generate TypeScript files ──
  // Split into files of ~8 services each for manageable file sizes
  const SERVICES_PER_FILE = 8
  const serviceList = Object.entries(allResults)
  const fileCount = Math.ceil(serviceList.length / SERVICES_PER_FILE)

  // Generate index file
  let indexImports = ''
  let indexExports = ''

  for (let i = 0; i < fileCount; i++) {
    const batch = serviceList.slice(i * SERVICES_PER_FILE, (i + 1) * SERVICES_PER_FILE)
    const batchNum = i + 4 // Start at batch4 (batch1-3 already exist)
    const varName = `serviceImagePool_gen${batchNum}`
    const fileName = `images-gen${batchNum}.ts`

    let content = `/**\n * Auto-generated by scripts/generate-unsplash-images.mjs\n * ${batch.length} services, ${batch.reduce((s, [, p]) => s + p.length, 0)} images\n * NE PAS MODIFIER MANUELLEMENT\n */\n\n`
    content += `function unsplash(id: string, w = 800, h = 500): string {\n`
    content += `  return \`https://images.unsplash.com/photo-\${id}?auto=format&fit=crop&w=\${w}&h=\${h}&q=80\`\n`
    content += `}\n\n`
    content += `export const ${varName}: Record<string, { src: string; alt: string }[]> = {\n`

    for (const [slug, photos] of batch) {
      content += `  '${slug}': [\n`
      for (const photo of photos) {
        const alt = (photo.alt || `Travaux de ${slug.replace(/-/g, ' ')}`).replace(/'/g, "\\'")
        content += `    { src: unsplash('${photo.id}'), alt: '${alt}' },\n`
      }
      content += `  ],\n`
    }

    content += `}\n`

    const filePath = join(ROOT, 'src/lib/data/images-generated', fileName)
    writeFileSync(filePath, content)
    console.log(`📄 ${fileName} — ${batch.length} services`)

    indexImports += `import { ${varName} } from './images-generated/${fileName.replace('.ts', '')}'\n`
    indexExports += `  ${varName},\n`
  }

  // Generate barrel index
  let barrelContent = `/**\n * Auto-generated barrel export for all generated image pools\n * NE PAS MODIFIER MANUELLEMENT\n */\n\n`
  barrelContent += indexImports
  barrelContent += `\nexport const generatedImagePools = [\n${indexExports}]\n`
  barrelContent += `\nexport type GeneratedImagePool = Record<string, { src: string; alt: string }[]>\n`

  writeFileSync(join(OUTPUT_DIR, 'index.ts'), barrelContent)

  console.log(`\n🎉 Terminé !`)
  console.log(`   ${totalPhotos} photos pour ${services.length} services`)
  console.log(`   ${fileCount} fichiers générés dans src/lib/data/images-generated/`)
  console.log(`   ${requestCount} requêtes API Unsplash utilisées`)
  console.log(`\n📝 Prochaine étape : mettre à jour src/lib/data/images.ts pour importer les nouveaux pools`)
}

main().catch(console.error)
