/**
 * Canonical fingerprint — Bouclier 2 plan ULTRA DOMINATION SEO v2.
 *
 * Snapshote l'empreinte SEO (canonical / title / meta / h1 / noindex)
 * de N URLs critiques chaque jour, compare au snapshot précédent, alerte
 * sur drift. Catch les régressions silencieuses :
 *   - canonical changé (impact indexation immédiat)
 *   - noindex basculé (page disparaît de Google)
 *   - title/meta/h1 modifiés (CTR / matching keyword peut chuter)
 *
 * Pas de Chrome/Playwright — on parse le HTML servi côté serveur (suffisant
 * pour Next.js qui rend canonical/title/meta server-side même avec ISR).
 *
 * Conception fail-safe : URL en erreur réseau = fingerprint vide stocké
 * avec status_code, severity = 'ok' (on ne reverse pas un crawl raté en
 * critical).
 */
import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/** Cap pour le slice du <head> (octets). Couvre largement tous les head Next.js. */
const HEAD_SLICE_CAP = 16 * 1024

export type SeoFingerprintComponents = {
  canonical: string | null
  title: string | null
  metaDescription: string | null
  h1: string | null
  noindex: boolean
}

export type SeoFingerprint = SeoFingerprintComponents & {
  url: string
  fingerprint: string
  statusCode: number
}

export type DriftSeverity = 'ok' | 'warn' | 'critical' | 'new'

export type FingerprintDrift = {
  url: string
  severity: DriftSeverity
  changes: {
    canonical?: { before: string | null; after: string | null }
    title?: { before: string | null; after: string | null }
    metaDescription?: { before: string | null; after: string | null }
    h1?: { before: string | null; after: string | null }
    noindex?: { before: boolean; after: boolean }
  }
}

/**
 * Parse les composantes SEO depuis du HTML brut. Resilient :
 *   - title vide/absent → null
 *   - canonical relatif accepté (pas résolu — c'est ce que Google voit)
 *   - 1er h1 trouvé (multiple h1 = problème lui-même mais pas notre job)
 *   - noindex = robots meta CONTAINS 'noindex' (case-insensitive)
 *
 * Hardening :
 *   - Slice sur les premiers 16KB pour les regex `<head>` (canonical/title/meta/robots)
 *     → anti-ReDoS sur HTML pathologique.
 *   - Body h1 cherché sur HTML complet mais regex non-greedy + `[^<]*` ou
 *     [\\s\\S]*? bornés → linéaire sur input bien formé.
 *   - Flag `s` non disponible avant ES2018 mais TS strict-mode + Node 20 OK.
 *   - Whitespace-trim sur canonical pour éviter faux drift sur trailing space CDN.
 */
export function parseHtmlForFingerprint(html: string): SeoFingerprintComponents {
  // Le <head> tient toujours dans les premiers KB. Slicer évite le ReDoS sur
  // page géante non-fermée et accélère les regex sans changer la sémantique.
  const head = html.slice(0, HEAD_SLICE_CAP)

  const canonicalMatch = head.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  const canonicalHrefFirst = head.match(
    /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i
  )
  const canonicalRaw = canonicalMatch?.[1] ?? canonicalHrefFirst?.[1] ?? null
  const canonical = canonicalRaw ? canonicalRaw.trim() || null : null

  // Title : `[^<]*` linéaire, pas de tag enfants attendus.
  const titleMatch = head.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch?.[1]?.trim() || null

  const metaDescMatch = head.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
  )
  const metaDescContentFirst = head.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i
  )
  const metaDescriptionRaw = metaDescMatch?.[1] ?? metaDescContentFirst?.[1] ?? null
  const metaDescription = metaDescriptionRaw ? metaDescriptionRaw.trim() || null : null

  // h1 sur HTML complet (peut être loin du head). Lazy match borné par
  // `</h1>` — V8 traite ce cas en linéaire.
  const h1Match = html.match(/<h1[^>]*>([\s\S]{0,8192}?)<\/h1>/i)
  const h1 = h1Match?.[1]?.replace(/<[^>]+>/g, '').trim() || null

  const robotsMatch = head.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i)
  const robotsContentFirst = head.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i
  )
  const robotsContent = robotsMatch?.[1] ?? robotsContentFirst?.[1] ?? ''
  const noindex = /noindex/i.test(robotsContent)

  return { canonical, title, metaDescription, h1, noindex }
}

/**
 * SHA-256 hex sur la sérialisation canonique (clés triées) des composantes.
 * Toute modification d'une composante change le hash → drift detectable.
 */
export function computeFingerprint(components: SeoFingerprintComponents): string {
  const normalized = {
    canonical: components.canonical,
    h1: components.h1,
    metaDescription: components.metaDescription,
    noindex: components.noindex,
    title: components.title,
  }
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

/**
 * Compare un nouveau fingerprint à l'ancien. Sévérité :
 *   - 'critical' si canonical OR noindex changent
 *   - 'warn' si title OR metaDescription OR h1 changent
 *   - 'ok' si fingerprint identique
 *   - 'new' si pas d'ancienne empreinte
 */
export function classifyDrift(
  before: SeoFingerprintComponents | null,
  after: SeoFingerprintComponents
): FingerprintDrift['severity'] {
  if (!before) return 'new'
  if (before.canonical !== after.canonical) return 'critical'
  if (before.noindex !== after.noindex) return 'critical'
  if (before.title !== after.title) return 'warn'
  if (before.metaDescription !== after.metaDescription) return 'warn'
  if (before.h1 !== after.h1) return 'warn'
  return 'ok'
}

/**
 * Compute le diff détaillé entre deux fingerprints (composantes uniquement).
 */
export function computeChanges(
  before: SeoFingerprintComponents | null,
  after: SeoFingerprintComponents
): FingerprintDrift['changes'] {
  if (!before) return {}
  const changes: FingerprintDrift['changes'] = {}
  if (before.canonical !== after.canonical) {
    changes.canonical = { before: before.canonical, after: after.canonical }
  }
  if (before.title !== after.title) {
    changes.title = { before: before.title, after: after.title }
  }
  if (before.metaDescription !== after.metaDescription) {
    changes.metaDescription = { before: before.metaDescription, after: after.metaDescription }
  }
  if (before.h1 !== after.h1) {
    changes.h1 = { before: before.h1, after: after.h1 }
  }
  if (before.noindex !== after.noindex) {
    changes.noindex = { before: before.noindex, after: after.noindex }
  }
  return changes
}

/**
 * Fetcher HTML par défaut — anti-SSRF + body cap + timeout.
 * Return { html, statusCode } ou null en erreur réseau.
 *
 * Hardening :
 *   - redirect:'error' bloque SSRF via redirect malicieux
 *   - Body cap (default 1.5MB) → log warn si dépassé pour rester auditable
 *   - User-Agent identifié pour Googlebot-friendly logs serveur
 */
export async function fetchHtmlForFingerprint(
  url: string,
  bodyCapBytes = 1_500_000
): Promise<{ html: string; statusCode: number } | null> {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'ServicesArtisansBot/1.0 (+canonical-fingerprint)',
        Accept: 'text/html',
      },
    })
    const buf = await res.arrayBuffer()
    if (buf.byteLength > bodyCapBytes) {
      logger.warn('[canonical-fingerprint] body cap exceeded', {
        kind: 'canonical_fp_body_cap',
        url,
        bytes: buf.byteLength,
        cap: bodyCapBytes,
      })
      return null
    }
    const html = new TextDecoder().decode(buf)
    return { html, statusCode: res.status }
  } catch {
    return null
  }
}

export type FingerprintFetcher = (
  url: string
) => Promise<{ html: string; statusCode: number } | null>

/**
 * Snapshote N URLs en parallèle borné. Préserve l'ordre des URLs en sortie.
 *
 * Une URL en échec réseau (fetcher → null) est SKIPPÉE plutôt que stockée
 * comme fingerprint vide. Raison : un fingerprint empty avec noindex=false
 * deviendrait la baseline du prochain run, masquant un éventuel passage
 * réel en noindex pendant la panne. Mieux vaut un trou dans le dashboard
 * (count < 12) qu'un faux "ok".
 */
export async function captureFingerprints(
  urls: string[],
  fetcher: FingerprintFetcher,
  concurrency = 5
): Promise<SeoFingerprint[]> {
  const results: SeoFingerprint[] = []
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const fetched = await fetcher(url)
        if (!fetched) return null
        const components = parseHtmlForFingerprint(fetched.html)
        return {
          url,
          ...components,
          fingerprint: computeFingerprint(components),
          statusCode: fetched.statusCode,
        }
      })
    )
    for (const item of batchResults) {
      if (item !== null) results.push(item)
    }
  }
  return results
}

/**
 * Charge la dernière empreinte connue par URL, retourne map.
 *
 * Filtre `status_code > 0` : les snapshots issus d'erreur réseau (depuis le
 * patch v2 ils ne sont plus persistés du tout, mais on garde le filtre pour
 * compatibilité avec d'éventuelles lignes héritées). Si plusieurs runs OK
 * existent, on prend le plus récent (snapshot_date DESC).
 */
export async function loadPreviousFingerprints(
  supabase: SupabaseClient,
  urls: string[]
): Promise<Map<string, SeoFingerprintComponents>> {
  const map = new Map<string, SeoFingerprintComponents>()
  if (urls.length === 0) return map
  await Promise.all(
    urls.map(async (url) => {
      try {
        const { data, error } = await supabase
          .from('seo_canonical_fingerprints')
          .select('canonical, title, meta_description, h1, noindex')
          .eq('url', url)
          .gt('status_code', 0)
          .order('snapshot_date', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error || !data) return
        map.set(url, {
          canonical: (data as { canonical: string | null }).canonical,
          title: (data as { title: string | null }).title,
          metaDescription: (data as { meta_description: string | null }).meta_description,
          h1: (data as { h1: string | null }).h1,
          noindex: (data as { noindex: boolean }).noindex ?? false,
        })
      } catch {
        // skip — pas de précédent ou erreur transient
      }
    })
  )
  return map
}

/**
 * UPSERT batch (snapshot_date, url) avec drift_severity calculé.
 */
export async function persistFingerprints(
  supabase: SupabaseClient,
  fingerprints: Array<SeoFingerprint & { driftSeverity: DriftSeverity }>
): Promise<{ ok: boolean; upserted: number }> {
  if (fingerprints.length === 0) return { ok: true, upserted: 0 }
  const today = new Date().toISOString().slice(0, 10)
  const rows = fingerprints.map((f) => ({
    snapshot_date: today,
    url: f.url,
    fingerprint: f.fingerprint,
    canonical: f.canonical,
    title: f.title,
    meta_description: f.metaDescription,
    h1: f.h1,
    noindex: f.noindex,
    status_code: f.statusCode,
    drift_severity: f.driftSeverity,
  }))
  const { error } = await supabase
    .from('seo_canonical_fingerprints')
    .upsert(rows, { onConflict: 'snapshot_date,url' })
  if (error) return { ok: false, upserted: 0 }
  return { ok: true, upserted: rows.length }
}
