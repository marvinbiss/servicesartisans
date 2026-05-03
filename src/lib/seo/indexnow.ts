import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

// Read at call-time so scripts that dotenv.config() after static-import
// transitively loading this module still pick up the key. Module-load read
// caused "No key or empty URL list" in publish-descriptions.ts.
const getIndexNowKey = (): string | undefined => process.env.INDEXNOW_API_KEY

const BATCH_SIZE = 10_000

interface IndexNowResult {
  submitted: number
  success: boolean
  error?: string
}

/**
 * Submit URLs to IndexNow (Bing, Yandex, and other participating search engines).
 * Batches up to 10,000 URLs per call per the IndexNow spec.
 * Should only be called server-side (API routes, cron jobs).
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const indexnowKey = getIndexNowKey()
  if (!indexnowKey || urls.length === 0) {
    return { submitted: 0, success: false, error: 'No key or empty URL list' }
  }

  const absoluteUrls = urls.map((u) => (u.startsWith('http') ? u : `${SITE_URL}${u}`))

  let totalSubmitted = 0

  for (let i = 0; i < absoluteUrls.length; i += BATCH_SIZE) {
    const batch = absoluteUrls.slice(i, i + BATCH_SIZE)
    const batchIndex = Math.floor(i / BATCH_SIZE)

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key: indexnowKey,
          keyLocation: `${SITE_URL}/${indexnowKey}.txt`,
          urlList: batch,
        }),
        // Audit 2026-04-25 (Vague E-bis) : sans timeout, un IndexNow latent
        // hang la lambda jusqu'au kill Vercel (jusqu'à 90s sur sitemap-providers,
        // 30s ailleurs). 7 callers l'utilisent dont crons et review-service
        // en `await`, donc impact en cascade. 15s = aligné avec /api/indexnow.
        signal: AbortSignal.timeout(15000),
      })

      // IndexNow returns 200, 202, or 204 on success
      if (response.ok || response.status === 202) {
        totalSubmitted += batch.length
      } else {
        logger.warn('[indexnow] non-success response', {
          batchIndex,
          batchSize: batch.length,
          status: response.status,
        })
      }
    } catch (err) {
      // Continue with next batch rather than failing entirely.
      // Audit 2026-04-25 (Vague E-ter) : log structuré au lieu de catch
      // silencieux, pour visibilité sur timeout/network/certificate errors.
      const isTimeout = err instanceof Error && err.name === 'TimeoutError'
      logger.warn('[indexnow] batch failed', {
        batchIndex,
        batchSize: batch.length,
        timeout: isTimeout,
        error: isTimeout ? 'AbortSignal.timeout(15000)' : String(err),
      })
    }
  }

  return { submitted: totalSubmitted, success: totalSubmitted > 0 }
}

/**
 * Sprint V Ahrefs 2026-05-03 — URLs canoniques de l'entité RGE à pousser
 * sur IndexNow après les Sprints O/T/U.
 *
 *   1. /rge/glossaire — page canonique DefinedTermSet (nouvelle, Sprint O).
 *      Bing/Yandex doivent l'indexer pour servir les rich snippets
 *      "definition" sur "qu'est-ce que QualiPAC", etc.
 *   2. /rge/qualifications — cible canonique du 301 Sprint U (refresh
 *      pour signaler la nouvelle source de PageRank entrant).
 *   3. /qualifications-rge — ancien chemin 404, désormais 301 vers (2).
 *      Push pour que Bing/Yandex re-crawl, voient le 301, et retirent
 *      le 404 du cache (sinon Bing met 4-6 semaines à le purger).
 *
 * Ces 3 URLs sont la liste minimale d'amorçage du nouveau cluster RGE
 * canonique. Les ~459K pages avec footer modifié (Sprint T) ne sont
 * PAS dans cette liste — la propagation naturelle via crawl du sitemap
 * est suffisante pour un changement footer (PageRank flow secondaire).
 *
 * Module pure : retourne des paths relatifs, transformés en URLs absolues
 * par submitToIndexNow.
 */
export function getSprintVCanonicalRgeUrls(): string[] {
  return ['/rge/glossaire', '/rge/qualifications', '/qualifications-rge']
}

/**
 * Build the list of affected URLs when a provider changes.
 * Inclut TOUS les templates pSEO qui consomment rating_average / review_count
 * pour émettre Schema.org aggregateRating (étoiles SERP). Étendu 2026-04-22
 * pour couvrir rge, cee, tarifs, urgence, devis, avis — l'omission rendait
 * le recrawl Google 5× plus lent sur ces pages.
 */
export function getProviderAffectedUrls(
  serviceSlug: string,
  villeSlug: string,
  providerPublicId?: string
): string[] {
  // /tarifs/[s]/[v] et /devis/[s]/[v] retirés 2026-04-30 — pages dépréciées,
  // 301 vers /services/[s]/[v] (et /services/[s]/[v]#tarifs). Inutile de
  // notifier IndexNow d'une URL qui 301 — on perd un signal de fraîcheur sur
  // la canonical. /urgence/[s]/[v] reste car la page existe (4×25 = 100 URLs
  // whitelistées) et redirect côté page-level pour le reste.
  const urls = [
    `/services/${serviceSlug}/${villeSlug}`,
    `/avis/${serviceSlug}/${villeSlug}`,
    `/urgence/${serviceSlug}/${villeSlug}`,
    `/rge/${serviceSlug}/${villeSlug}`,
    `/villes/${villeSlug}`,
  ]
  if (providerPublicId) {
    urls.push(`/services/${serviceSlug}/${villeSlug}/${providerPublicId}`)
  }
  return urls
}
