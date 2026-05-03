/**
 * Sprint V Ahrefs 2026-05-03 — IndexNow ping de l'entité canonique RGE.
 *
 * Pousse 3 URLs vers Bing/Yandex/IndexNow après les Sprints O/T/U :
 *
 *   1. /rge/glossaire        — page canonique DefinedTermSet (nouvelle)
 *   2. /rge/qualifications   — cible canonique du 301 (refresh signal)
 *   3. /qualifications-rge   — ancien 404, désormais 301 (purge cache)
 *
 * Pourquoi ce script et pas /api/indexnow ?
 *   - One-shot, callable sans déploiement Vercel.
 *   - Aligne avec le pattern existant (cf. indexnow-bootstrap-rge.ts).
 *   - Permet `--dry-run` pour vérifier sans push réel.
 *
 * Pourquoi Bing/Yandex ?
 *   - Google n'utilise PAS IndexNow (annoncé 2024 mais jamais activé).
 *     Pour Google, le seul levier est le sitemap + maillage interne (Sprints
 *     S/T/U) + crawl naturel (~7-14j sur nouvelles URLs).
 *   - Bing : crawl ~24h post-IndexNow vs 1-2 semaines naturel. Important
 *     pour AI Overviews (ChatGPT/Copilot pull Bing).
 *   - Yandex : ~24-48h. Marché RU faible mais signal SEO additionnel.
 *
 * Usage:
 *   npx tsx scripts/indexnow-sprint-v-canonical-rge-2026-05-03.ts [--dry-run]
 *
 * Prérequis :
 *   - INDEXNOW_API_KEY dans .env.local (même secret que production)
 *   - Sprint O (page /rge/glossaire) déjà déployé en prod (sinon Bing
 *     verra un 404 et invalidera la soumission).
 */
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { submitToIndexNow, getSprintVCanonicalRgeUrls } from '../src/lib/seo/indexnow'

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  const urls = getSprintVCanonicalRgeUrls()

  // eslint-disable-next-line no-console
  console.log(`[Sprint V IndexNow] ${urls.length} URLs canoniques RGE à push :`)
  for (const u of urls) {
    // eslint-disable-next-line no-console
    console.log(`  - ${u}`)
  }

  if (DRY_RUN) {
    // eslint-disable-next-line no-console
    console.log('\n[DRY RUN] aucune soumission effectuée. Retire --dry-run pour pousser.')
    return
  }

  if (!process.env.INDEXNOW_API_KEY) {
    // eslint-disable-next-line no-console
    console.error('[Sprint V IndexNow] FATAL : INDEXNOW_API_KEY absent dans .env.local')
    process.exit(1)
  }

  const result = await submitToIndexNow(urls)
  if (result.success) {
    // eslint-disable-next-line no-console
    console.log(`\n[Sprint V IndexNow] OK — ${result.submitted} URLs soumises à Bing/Yandex.`)
    // eslint-disable-next-line no-console
    console.log('Recrawl attendu :')
    // eslint-disable-next-line no-console
    console.log('  - Bing  : 24-48h')
    // eslint-disable-next-line no-console
    console.log('  - Yandex: 24-72h')
    // eslint-disable-next-line no-console
    console.log('  - Google: NON couvert par IndexNow — attendre crawl naturel ~7-14j')
  } else {
    // eslint-disable-next-line no-console
    console.error(`\n[Sprint V IndexNow] ÉCHEC : ${result.error ?? 'soumission rejetée'}`)
    process.exit(1)
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[Sprint V IndexNow] FATAL :', err)
  process.exit(1)
})
