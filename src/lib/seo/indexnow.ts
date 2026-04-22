import { SITE_URL } from '@/lib/seo/config'

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
      })

      // IndexNow returns 200, 202, or 204 on success
      if (response.ok || response.status === 202) {
        totalSubmitted += batch.length
      }
    } catch {
      // Continue with next batch rather than failing entirely
    }
  }

  return { submitted: totalSubmitted, success: totalSubmitted > 0 }
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
  const urls = [
    `/services/${serviceSlug}/${villeSlug}`,
    `/avis/${serviceSlug}/${villeSlug}`,
    `/tarifs/${serviceSlug}/${villeSlug}`,
    `/urgence/${serviceSlug}/${villeSlug}`,
    `/devis/${serviceSlug}/${villeSlug}`,
    `/rge/${serviceSlug}/${villeSlug}`,
    `/villes/${villeSlug}`,
  ]
  if (providerPublicId) {
    urls.push(`/services/${serviceSlug}/${villeSlug}/${providerPublicId}`)
  }
  return urls
}
