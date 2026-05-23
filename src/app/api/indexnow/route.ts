import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { readJsonBodyWithCap } from '@/lib/auth/read-body-with-cap'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY

// 10K URLs × ~200 octets ≈ 2 MB cap théorique. On accepte 4 MB pour avoir
// du headroom. Le cap est imposé en stream-read pour résister à un
// Transfer-Encoding: chunked sans Content-Length.
const MAX_BODY_BYTES = 4 * 1024 * 1024

/**
 * POST /api/indexnow — Submit URLs to IndexNow (Bing, Yandex, etc.)
 * Called by the sitemap health cron or manually after deploys.
 */
export async function POST(request: Request) {
  try {
    if (!INDEXNOW_KEY) {
      return NextResponse.json({ error: 'Clé API IndexNow non configurée' }, { status: 500 })
    }

    if (!verifyCronSecret(request.headers.get('authorization'))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const bodyResult = await readJsonBodyWithCap<{ urls?: unknown }>(request, MAX_BODY_BYTES)
    if (!bodyResult.ok) {
      const { status, error } =
        bodyResult.reason === 'too-large'
          ? { status: 413, error: 'Body trop volumineux' }
          : bodyResult.reason === 'timeout'
            ? { status: 408, error: 'Timeout de lecture du body' }
            : { status: 400, error: 'Données invalides' }
      return NextResponse.json({ error }, { status })
    }

    const rawUrls = bodyResult.data?.urls
    const urls: string[] = Array.isArray(rawUrls)
      ? rawUrls.filter((u): u is string => typeof u === 'string')
      : []

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Aucune URL fournie' }, { status: 400 })
    }

    // IndexNow API - submit to Bing (which shares with Yandex, Seznam, etc.)
    const payload = {
      host: 'servicesartisans.fr',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000), // IndexNow limit: 10K URLs per request
    }

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000), // 15s timeout
      })

      return NextResponse.json({
        status: response.status,
        submitted: urls.length,
        message:
          response.status === 200 ? 'URLs submitted successfully' : 'Submission acknowledged',
      })
    } catch {
      return NextResponse.json({ error: 'Erreur API IndexNow' }, { status: 502 })
    }
  } catch (error) {
    logger.error('[api/indexnow] POST failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
