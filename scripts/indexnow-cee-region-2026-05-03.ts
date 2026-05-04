/**
 * Sprint AI Wave D Ahrefs 2026-05-03 — IndexNow ping cluster CEE×région.
 *
 * Push toutes les URLs /cee/[op]/region/[region] (~266) vers Bing/Yandex
 * pour amorcer la découverte rapide post-déploiement (sinon 7-14 jours
 * naturel via crawl sitemap).
 *
 * Usage:
 *   npx tsx scripts/indexnow-cee-region-2026-05-03.ts [--dry-run]
 *
 * Prérequis :
 *   - INDEXNOW_API_KEY dans .env.local
 *   - Pages /cee/[op]/region/[region] déployées en prod (Sprint AI Wave D)
 */
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { submitToIndexNow, getCeeRegionalUrls } from '../src/lib/seo/indexnow'
import { CEE_OPERATION_CODES } from '../src/lib/cee/operation-codes'
import { CEE_REGIONAL_SLUGS } from '../src/lib/cee/regional-specifics'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const urls = getCeeRegionalUrls(CEE_OPERATION_CODES, CEE_REGIONAL_SLUGS)

  // eslint-disable-next-line no-console
  console.log(`[Sprint AI Wave D IndexNow] ${urls.length} URLs CEE×région à push`)

  if (DRY_RUN) {
    // eslint-disable-next-line no-console
    console.log('[DRY-RUN] Aucune soumission effectuée. Sample 5 URLs :')
    for (const u of urls.slice(0, 5)) {
      // eslint-disable-next-line no-console
      console.log(`  - ${u}`)
    }
    process.exit(0)
  }

  // IndexNow accepte 10 000 URLs/req. 266 < 10K → 1 batch suffit.
  const result = await submitToIndexNow(urls)
  // eslint-disable-next-line no-console
  console.log(`[result] ok=${result.ok} status=${result.status ?? '-'}`)
  process.exit(result.ok ? 0 : 1)
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[fatal]', err)
  process.exit(1)
})
