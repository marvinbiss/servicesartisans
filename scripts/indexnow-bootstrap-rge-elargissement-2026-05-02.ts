/**
 * One-shot IndexNow bootstrap pour les 5 nouveaux services RGE (élargissement
 * 2026-05-02). Submet ~150 URLs flagship (5 services × top 30 villes) à
 * IndexNow pour court-circuiter le délai de découverte Google/Bing/Yandex.
 *
 * Pourquoi 30 villes et pas plus :
 *   - Top 30 = 80% du volume de search RGE (loi de Pareto sur les requêtes
 *     géolocalisées rénovation énergétique).
 *   - Le cron daily `/api/cron/indexnow-submit` complète automatiquement
 *     les 9 350 autres URLs en rotation 1/3.
 *
 * Prerequisites :
 *   - Le commit `3f1f6636f` (déploiement Vercel) doit être live pour que
 *     les routes `/rge/[s]/[v]` répondent 200 (pas 410 middleware).
 *   - INDEXNOW_API_KEY dans .env.local (même secret que prod).
 *
 * Usage :
 *   npx tsx scripts/indexnow-bootstrap-rge-elargissement-2026-05-02.ts [--dry-run]
 */
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

const DRY_RUN = process.argv.includes('--dry-run')

const NEW_RGE_SERVICES = [
  'borne-recharge',
  'chauffe-eau-thermodynamique',
  'audit-energetique',
  'ventilation',
  'fenetres',
] as const

const TOP_CITIES = [
  'paris',
  'marseille',
  'lyon',
  'toulouse',
  'nice',
  'nantes',
  'montpellier',
  'strasbourg',
  'bordeaux',
  'lille',
  'rennes',
  'reims',
  'saint-etienne',
  'le-havre',
  'toulon',
  'grenoble',
  'dijon',
  'angers',
  'nimes',
  'villeurbanne',
  'aix-en-provence',
  'le-mans',
  'clermont-ferrand',
  'brest',
  'tours',
  'limoges',
  'amiens',
  'annecy',
  'perpignan',
  'metz',
] as const

function buildUrls(): string[] {
  const urls: string[] = []
  // Hub /rge/[service] (5 URLs)
  for (const svc of NEW_RGE_SERVICES) {
    urls.push(`${SITE_URL}/rge/${svc}`)
  }
  // /rge/[service]/[ville] (5 × 30 = 150 URLs)
  for (const svc of NEW_RGE_SERVICES) {
    for (const city of TOP_CITIES) {
      urls.push(`${SITE_URL}/rge/${svc}/${city}`)
    }
  }
  return urls
}

async function submitBatch(key: string, urls: string[]): Promise<void> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'servicesartisans.fr',
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    }),
  })
  console.log(`[indexnow] status=${res.status} ok=${res.ok} submitted=${urls.length}`)
  if (!res.ok) {
    const body = await res.text()
    console.error(`[indexnow] body=${body}`)
  }
}

async function main(): Promise<void> {
  const urls = buildUrls()
  console.log(`[bootstrap] urls=${urls.length} (5 hub + 5×30 city)`)
  console.log(`[bootstrap] sample[0..3]=${urls.slice(0, 3).join(', ')}`)
  console.log(`[bootstrap] sample[-3..]=${urls.slice(-3).join(', ')}`)

  if (DRY_RUN) {
    console.log('[bootstrap] DRY-RUN — no submission')
    return
  }

  const key = process.env.INDEXNOW_API_KEY
  if (!key) {
    console.error('[bootstrap] missing INDEXNOW_API_KEY in env')
    process.exit(1)
  }

  await submitBatch(key, urls)
  console.log('[bootstrap] done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
