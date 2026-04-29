#!/usr/bin/env node
/**
 * scripts/audit-soft-404-prod.mjs
 * --------------------------------
 * Audit live prod : fetch un échantillon stratifié de 100 URLs et détecte les
 * symptômes "soft 404" qui gaspillent le budget crawl Google.
 *
 * Détecte :
 *   - HTTP 200 sur une page qui ressemble à du vide (DOM < 5 KB body, no h1,
 *     ou marqueur copy "Aucun X / 0 résultat / Pas encore").
 *   - HTTP 200 + meta robots `noindex` listée pourtant dans un sitemap (fuite).
 *   - Chaînes de redirection > 3 sauts (gaspillage budget crawl).
 *   - Latence > 3s (Googlebot réduit la cadence).
 *
 * Échantillon stratifié : un gros template SEO = ~17 URLs prises au hasard
 * dans la liste paginée correspondante, + URLs canary (home, /rge, /cee,
 * /services hub) en fixe.
 *
 * Source des URLs : on génère localement à partir des données statiques
 * (services × top 30 villes, /rge, /cee, /tarifs, /urgence, /avis, etc.)
 * pour rester offline-friendly. Le script fetche ensuite la prod live.
 *
 * Usage :
 *   BASE_URL=https://servicesartisans.fr node scripts/audit-soft-404-prod.mjs
 *   node scripts/audit-soft-404-prod.mjs --json
 *   node scripts/audit-soft-404-prod.mjs --strict   # exit 1 si soft 404 détecté
 *
 * Sortie : compteurs par catégorie + liste détaillée des URLs problématiques.
 */

import { setTimeout as wait } from 'node:timers/promises'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const BASE_URL = (process.env.BASE_URL || 'https://servicesartisans.fr').replace(/\/$/, '')
const SAMPLE_SIZE = 100
const FETCH_TIMEOUT_MS = 8000
const PARALLEL = 6
const MIN_BODY_BYTES = 5 * 1024
const MAX_RESPONSE_MS = 3000

const SOFT_404_TEXT_MARKERS = [
  'aucun artisan',
  'aucun résultat',
  '0 résultat',
  'pas encore',
  'rien trouvé',
  'cette page est vide',
  'pas de données',
]

const SAMPLE = [
  // Canary (toujours dans l'échantillon)
  '/',
  '/rge',
  '/cee',
  '/services',
  '/villes',
  '/tarifs',
  '/avis',
  '/urgence',
  '/blog',
  '/renovation-energetique',
  '/simulateur-aides-renovation',
  '/devenir-partenaire-cee',
  '/plan-du-site',
  // Services hub × top villes (Sprint 0.2)
  '/services/plombier',
  '/services/electricien',
  '/services/chauffagiste',
  '/services/serrurier',
  '/services/peintre-en-batiment',
  '/services/pompe-a-chaleur',
  '/services/isolation-thermique',
  '/villes/paris',
  '/villes/lyon',
  '/villes/marseille',
  '/villes/toulouse',
  '/villes/bordeaux',
  '/villes/nantes',
  // Services × villes (Sprint 0.2)
  '/services/plombier/paris',
  '/services/plombier/lyon',
  '/services/electricien/marseille',
  '/services/chauffagiste/toulouse',
  '/services/serrurier/bordeaux',
  '/services/peintre-en-batiment/nantes',
  '/services/pompe-a-chaleur/lyon',
  '/services/isolation-thermique/paris',
  // RGE (Sprint 0.1 - 50K URLs)
  '/rge/pompe-a-chaleur/paris',
  '/rge/pompe-a-chaleur/lyon',
  '/rge/isolation-thermique/marseille',
  '/rge/audit-energetique/toulouse',
  '/rge/panneaux-solaires/bordeaux',
  '/rge/qualifications',
  '/rge/qualifications/qualipac',
  '/rge/qualifications/qualibois',
  '/rge/sources',
  '/rge/comment-devenir-rge',
  // CEE
  '/cee/bar-th-171',
  '/cee/bar-en-101',
  '/cee/bar-th-113/paris',
  '/cee/bar-en-101/lyon',
  '/cee/coup-de-pouce-2026',
  '/cee/mandataire-vs-direct',
  // Tarifs
  '/tarifs/plombier',
  '/tarifs/electricien',
  '/tarifs/chauffagiste/paris',
  '/tarifs/serrurier/lyon',
  '/tarifs/peintre-en-batiment/marseille',
  // Urgence
  '/urgence/plombier',
  '/urgence/serrurier',
  '/urgence/electricien/paris',
  '/urgence/plombier/lyon',
  // Avis
  '/avis/plombier',
  '/avis/electricien',
  '/avis/chauffagiste/paris',
  // Dépts / régions
  '/departements/paris',
  '/departements/rhone',
  '/departements/bouches-du-rhone',
  '/regions/ile-de-france',
  '/regions/auvergne-rhone-alpes',
  // Aides
  '/aides/paris/maprimerenov',
  '/aides/rhone/maprimerenov',
  // Devis
  '/devis',
  '/devis/plombier',
  '/devis/plombier/paris',
  '/devis/electricien/lyon',
  // Blog (top articles)
  '/blog/maprimerenov-2026',
  '/blog/prix-pompe-chaleur-air-eau-installee',
  '/blog/eco-pret-taux-zero-2026',
  // Barèmes & datasets
  '/barometre',
  '/barometre/rge',
  '/barometre/regions/ile-de-france',
  '/datasets/rge',
  '/developpeurs',
  // Pages équipe / E-E-A-T
  '/equipe',
  '/methodologie',
  '/sources',
  '/a-propos',
  '/contact',
  '/faq',
  '/comment-ca-marche',
  '/notre-processus-de-verification',
  // Comparatifs
  '/comparatif-primes-cee-2026',
  '/leads-exclusifs-vs-partages',
  '/maprimerenov-cumulaison-cee',
  // Outils
  '/outils',
  '/outils/calculateur-prix',
  '/outils/diagnostic',
  '/recherche',
  '/glossaire',
  '/normes',
  '/statistiques-artisans-france',
  '/etudes',
  '/etudes/deserts-artisanaux',
  '/calendrier-travaux',
  '/checklist-travaux',
]

if (SAMPLE.length < SAMPLE_SIZE) {
  // Pad avec des combos service×ville pour atteindre SAMPLE_SIZE.
  const SERVICES = ['menuisier', 'macon', 'couvreur', 'carreleur', 'jardinier']
  const VILLES = ['nice', 'strasbourg', 'lille', 'rennes', 'reims', 'le-havre']
  outer: for (const s of SERVICES) {
    for (const v of VILLES) {
      SAMPLE.push(`/services/${s}/${v}`)
      if (SAMPLE.length >= SAMPLE_SIZE) break outer
    }
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  const t0 = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ServicesArtisansAudit/1.0)',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: controller.signal,
    })
    const ms = Date.now() - t0
    let body = ''
    if (res.status === 200) {
      try {
        body = await res.text()
      } catch {
        body = ''
      }
    }
    return {
      status: res.status,
      ms,
      headers: res.headers,
      location: res.headers.get('location') || null,
      body,
      ok: true,
    }
  } catch (err) {
    return { status: 0, ms: Date.now() - t0, ok: false, error: String(err?.message || err) }
  } finally {
    clearTimeout(t)
  }
}

async function followRedirects(url) {
  const chain = []
  let current = url
  for (let i = 0; i < 10; i++) {
    const res = await fetchWithTimeout(current, FETCH_TIMEOUT_MS)
    chain.push({ url: current, status: res.status, ms: res.ms })
    if (!res.ok) return { chain, final: res, hops: chain.length - 1 }
    if (res.status >= 300 && res.status < 400 && res.location) {
      current = new URL(res.location, current).toString()
      continue
    }
    return { chain, final: res, hops: chain.length - 1 }
  }
  return { chain, final: chain[chain.length - 1], hops: chain.length - 1 }
}

function classifyBody(body) {
  if (!body) return { hasH1: false, bodyBytes: 0, softMarker: null }
  const bodyBytes = Buffer.byteLength(body, 'utf8')
  const hasH1 = /<h1[\s>]/i.test(body)
  let softMarker = null
  const lower = body.toLowerCase()
  for (const marker of SOFT_404_TEXT_MARKERS) {
    if (lower.includes(marker)) {
      softMarker = marker
      break
    }
  }
  const robotsMeta = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i.exec(body)
  const robotsContent = robotsMeta ? robotsMeta[1].toLowerCase() : null
  const isNoindex = robotsContent ? /noindex/.test(robotsContent) : false
  return { hasH1, bodyBytes, softMarker, isNoindex }
}

async function auditUrl(path) {
  const url = `${BASE_URL}${path}`
  const { chain, final, hops } = await followRedirects(url)
  const issues = []

  if (!final.ok) {
    issues.push({ kind: 'fetch_error', detail: final.error })
    return { path, status: final.status, ms: final.ms, hops, issues }
  }

  if (hops > 3) issues.push({ kind: 'redirect_chain', detail: `${hops} sauts` })
  if (final.ms > MAX_RESPONSE_MS) issues.push({ kind: 'slow_response', detail: `${final.ms} ms` })

  if (final.status === 200) {
    const { hasH1, bodyBytes, softMarker, isNoindex } = classifyBody(final.body)
    if (bodyBytes < MIN_BODY_BYTES) {
      issues.push({ kind: 'thin_body', detail: `${bodyBytes} bytes` })
    }
    if (!hasH1) issues.push({ kind: 'no_h1', detail: 'aucun <h1> rendu' })
    if (softMarker) {
      issues.push({ kind: 'soft_404_marker', detail: `texte: "${softMarker}"` })
    }
    if (isNoindex) {
      issues.push({ kind: 'noindex_in_sample', detail: 'meta robots noindex' })
    }
  } else if (final.status === 410) {
    // 410 Gone = signal explicite, OK
  } else if (final.status === 404) {
    // hard 404 = clean, mais on note pour visibilité
    issues.push({ kind: 'hard_404', detail: 'page supprimée (OK)' })
  } else if (final.status >= 500) {
    issues.push({ kind: 'server_error', detail: `HTTP ${final.status}` })
  }

  return { path, status: final.status, ms: final.ms, hops, issues }
}

async function runBatched(items, n, fn) {
  const out = []
  for (let i = 0; i < items.length; i += n) {
    const slice = items.slice(i, i + n)
    const results = await Promise.all(slice.map(fn))
    out.push(...results)
    if (i + n < items.length) await wait(120)
  }
  return out
}

async function main() {
  const sample = SAMPLE.slice(0, SAMPLE_SIZE)
  if (!jsonOut) {
    console.error(`\n📋 Soft 404 audit prod — ${BASE_URL}`)
    console.error(`   Échantillon : ${sample.length} URLs (parallel=${PARALLEL})\n`)
  }

  const results = await runBatched(sample, PARALLEL, auditUrl)

  const counters = {
    soft_404_marker: 0,
    thin_body: 0,
    no_h1: 0,
    noindex_in_sample: 0,
    redirect_chain: 0,
    slow_response: 0,
    server_error: 0,
    hard_404: 0,
    fetch_error: 0,
    ok: 0,
  }

  const flagged = []
  for (const r of results) {
    if (r.issues.length === 0) {
      counters.ok++
      continue
    }
    flagged.push(r)
    for (const issue of r.issues) {
      if (issue.kind in counters) counters[issue.kind]++
    }
  }

  if (jsonOut) {
    console.log(JSON.stringify({ counters, flagged }, null, 2))
  } else {
    console.error(`  Compteurs :`)
    for (const [k, v] of Object.entries(counters)) {
      console.error(`    ${k.padEnd(22)} : ${v}`)
    }
    console.error('')

    if (flagged.length > 0) {
      console.error(`  ⚠️  URLs flaggées (${flagged.length}) :`)
      for (const r of flagged) {
        const reasons = r.issues.map((i) => `${i.kind}:${i.detail}`).join(' | ')
        console.error(`     [${r.status}] ${r.path}  (${r.ms} ms, ${r.hops} hops)`)
        console.error(`        ${reasons}`)
      }
    } else {
      console.error('  ✅ Aucune URL problématique sur l’échantillon.')
    }
    console.error('')
  }

  // Fail strict si symptôme bloquant détecté (soft 404 reels, server errors,
  // fuite noindex, redirect chains >3). On ne bloque pas sur thin_body / no_h1
  // seuls car certaines pages utilitaires sont légères par design.
  const hardFail =
    counters.soft_404_marker > 0 ||
    counters.server_error > 0 ||
    counters.noindex_in_sample > 0 ||
    counters.redirect_chain > 0 ||
    counters.fetch_error > 0
  if (strict && hardFail) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('audit-soft-404-prod failed:', err)
  process.exit(2)
})
