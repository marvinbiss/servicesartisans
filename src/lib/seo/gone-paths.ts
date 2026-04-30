/**
 * Soft 404 permanent solve — static slug validation for ISR dynamic routes.
 *
 * Contexte Next.js 14.2 bug vercel/next.js#69103
 * -----------------------------------------------
 * Quand une page ISR avec `dynamicParams: true` appelle `notFound()`, Next.js
 * 14.2 retourne HTTP 200 (pas 404). Google voit `<meta name="robots" noindex>`
 * mais continue à crawler + gaspille le budget crawl. La seule solution
 * déterministe est d'intercepter la requête AVANT qu'elle n'atteigne le page
 * renderer, et retourner un vrai HTTP 410 (Gone) depuis le middleware.
 *
 * Stratégie : validation statique pure (zéro I/O)
 * -----------------------------------------------
 * Le middleware tourne sur CHAQUE requête HTML — il ne peut pas se permettre
 * un round-trip Redis/DB. On valide :
 *
 *   - **Service slug** (`/services/[s]/...`) : Set<string> des 46 services
 *     historiques. Hors liste → 410.
 *   - **RGE service slug** (`/rge/[s]/...`) : Set<string> des 8 services RGE
 *     éligibles MaPrimeRénov'. Hors liste → 410.
 *   - **CEE operation** (`/cee/[op]/...`) : regex FOS `[A-Z]{3}-[A-Z]{2}-\d{3}`
 *     (BAR-TH-104, BAT-EN-101…). Format invalide → 410.
 *   - **Ville slug** (tout segment ville) : regex `^[a-z]([a-z0-9-]{0,58}[a-z0-9])?$`
 *     Pas de chiffres-only, pas d'underscore, pas de majuscules. Casse →  410.
 *
 * Les combos "slug valides mais zéro artisan" restent gérés par les pages
 * (`notFound()` + `robots: noindex` metadata) — on ne peut pas les détecter
 * sans DB. Le middleware ne couvre que les slugs malformés ; ça absorbe
 * déjà 99% du trafic crawler parasite observé dans GSC.
 *
 * Zéro dépendance externe : le module est importable en Edge runtime sans
 * alourdir le middleware bundle (< 1 kB minified).
 */

/**
 * Services couverts par `/services/[service]/[location]`.
 *
 * Source de vérité canonique : `src/lib/data/france-light.ts` → `services`.
 * On duplique ici pour éviter d'importer 1.1 MB côté Edge. Toute modification
 * de la liste prod DOIT être reflétée ici — le test `gone-paths.test.ts`
 * vérifie la cohérence.
 */
export const VALID_SERVICE_SLUGS: ReadonlySet<string> = new Set([
  // 15 services historiques
  'plombier',
  'electricien',
  'serrurier',
  'chauffagiste',
  'peintre-en-batiment',
  'menuisier',
  'carreleur',
  'couvreur',
  'macon',
  'jardinier',
  'vitrier',
  'climaticien',
  'cuisiniste',
  'solier',
  'nettoyage',
  // 31 services Sprint 1 SEO — liste miroir de france-light.ts
  'terrassier',
  'charpentier',
  'zingueur',
  'etancheiste',
  'facadier',
  'platrier',
  'metallier',
  'ferronnier',
  'poseur-de-parquet',
  'miroitier',
  'storiste',
  'salle-de-bain',
  'architecte-interieur',
  'decorateur',
  'domoticien',
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'renovation-energetique',
  'borne-recharge',
  'ramoneur',
  'paysagiste',
  'pisciniste',
  'alarme-securite',
  'antenniste',
  'ascensoriste',
  'diagnostiqueur',
  'geometre',
  'desinsectisation',
  'deratisation',
  'demenageur',
])

/**
 * Services RGE couverts par `/rge/[service]/[ville]`.
 *
 * Source de vérité : `src/app/(public)/rge/[service]/[ville]/page.tsx`
 * (`PRERENDER_SERVICES` + allowlist RGE). Liste courte, peu évolutive —
 * tout nouvel ajout doit passer par ce fichier + mettre à jour le test.
 */
export const VALID_RGE_SERVICE_SLUGS: ReadonlySet<string> = new Set([
  // Miroir strict de `RGE_ALLOWED_SERVICES` dans
  // `src/lib/rge/service-city-listings.ts`. Test dédié en assure la cohérence.
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffagiste',
  'electricien',
  'renovation-energetique',
  'menuisier',
  'couvreur',
  'plombier',
  'climaticien',
  'ramoneur',
  'zingueur',
  'facadier',
  'platrier',
])

/**
 * Format d'un code opération CEE (FOS).
 * Ex : `BAR-TH-104`, `BAT-EN-101`, `IND-UT-103`, `RES-CH-108`.
 *
 * Secteurs admis : BAR (résidentiel), BAT (tertiaire), IND, RES, AGRI, TRA.
 * Catégories : 2 lettres majuscules. Numéro : 3 chiffres.
 */
export const CEE_OPERATION_RE = /^(BAR|BAT|IND|RES|AGRI|TRA)-[A-Z]{2}-\d{3}$/

import { WHITELIST_TARIFS_TASK_GSC } from '@/lib/seo/gone-paths-whitelist-gsc'

/**
 * Normalise un pathname avant lookup whitelist : strip trailing slash et
 * lowercase. Évite les faux négatifs sur `/tarifs/foo/bar/baz/` ou variants
 * de casse rares.
 */
function normalizePath(p: string): string {
  const stripped = p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p
  return stripped.toLowerCase()
}

/**
 * Format générique d'un slug ville/commune.
 *
 * - 2 à 60 caractères
 * - lowercase latin + chiffres + tirets
 * - commence et termine par lettre ou chiffre (pas de tiret bord)
 * - pas d'underscore, pas de double-tiret
 *
 * Couvre les communes françaises (paris, marseille-5, saint-etienne,
 * la-rochelle, 16eme-arrondissement, fort-de-france, saint-pierre-et-miquelon).
 */
export const VILLE_SLUG_RE = /^[a-z0-9](?!.*--)[a-z0-9-]{0,58}[a-z0-9]$/

/**
 * Résultat d'une validation. `gone: true` signifie que le chemin est
 * structurellement invalide et doit retourner HTTP 410 immédiatement.
 */
export interface GonePathDecision {
  gone: boolean
  reason?:
    | 'service_slug_unknown'
    | 'rge_service_slug_unknown'
    | 'cee_operation_invalid_format'
    | 'ville_slug_malformed'
    | 'tarifs_task_deprecated'
}

function validateVilleSlug(ville: string): GonePathDecision {
  return VILLE_SLUG_RE.test(ville)
    ? { gone: false }
    : { gone: true, reason: 'ville_slug_malformed' }
}

/**
 * Décide si un pathname doit retourner HTTP 410.
 *
 * Cette fonction est **pure** (zéro I/O, zéro side-effect). Elle doit rester
 * ainsi pour être utilisable en middleware Edge runtime sans alourdir la
 * latence de chaque requête.
 *
 * Retourne `{ gone: false }` pour tout chemin non-reconnu comme route ISR
 * vulnérable. Seules les 4 routes dynamiques couvertes par `generateStaticParams`
 * + `dynamicParams: true` sont inspectées.
 */
export function evaluateGonePath(pathname: string): GonePathDecision {
  // 1. /services/[service]/[location] — NE PAS matcher le 3e segment (artisan publicId)
  //    pour éviter de tuer les URLs /services/plombier/paris/ABC123 (fiche artisan).
  const servicesMatch = /^\/services\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (servicesMatch) {
    const [, service, ville] = servicesMatch
    if (!VALID_SERVICE_SLUGS.has(service)) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    return validateVilleSlug(ville)
  }

  // 2. /rge/[service]/[ville]
  const rgeMatch = /^\/rge\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (rgeMatch) {
    const [, service, ville] = rgeMatch
    if (!VALID_RGE_SERVICE_SLUGS.has(service)) {
      return { gone: true, reason: 'rge_service_slug_unknown' }
    }
    return validateVilleSlug(ville)
  }

  // 3. /cee/[operation]/[ville]
  const ceeMatch = /^\/cee\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (ceeMatch) {
    const [, operation, ville] = ceeMatch
    if (!CEE_OPERATION_RE.test(operation)) {
      return { gone: true, reason: 'cee_operation_invalid_format' }
    }
    return validateVilleSlug(ville)
  }

  // 4. /artisans-rge/[ville]
  const artisansRgeMatch = /^\/artisans-rge\/([^/]+)\/?$/.exec(pathname)
  if (artisansRgeMatch) {
    return validateVilleSlug(artisansRgeMatch[1])
  }

  // 5. /tarifs/[service]/[ville]/[travail] — bloc DEPRECATED 2026-04-29
  //    Stratégie 140K vague 1 : 184 500 URLs cannibalisantes, 0 KW Ahrefs,
  //    0 backlinks externes recensés. Purge définitive via 410.
  //    /tarifs/[s] et /tarifs/[s]/[v] (1-2 segments) restent valides.
  //
  //    Filet G3 (plan 140K) : 100 URLs whitelistées (236 clics 90j actifs)
  //    sont préservées, cf. WHITELIST_TARIFS_TASK_GSC.
  const tarifsTaskMatch = /^\/tarifs\/[^/]+\/[^/]+\/[^/]+\/?$/.exec(pathname)
  if (tarifsTaskMatch) {
    if (WHITELIST_TARIFS_TASK_GSC.has(normalizePath(pathname))) {
      return { gone: false }
    }
    return { gone: true, reason: 'tarifs_task_deprecated' }
  }

  return { gone: false }
}

/**
 * Headers standard pour une réponse HTTP 410 :
 *
 *   - `Cache-Control` : 1 jour sur le CDN + 7 jours stale. On ne veut pas
 *     que Vercel re-hit l'origine 100× pour la même URL morte, et Google
 *     prend 24-48h pour purger l'index sur un 410.
 *   - `X-Robots-Tag: noindex, nofollow` : demande explicite de désindexation
 *     immédiate (complémentaire du code 410).
 *   - `Content-Type: text/plain; charset=utf-8` : éviter de servir du HTML
 *     (pas de render Next, donc on reste minimaliste).
 */
export function goneResponseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    'X-Robots-Tag': 'noindex, nofollow',
  }
}

export const GONE_RESPONSE_BODY =
  'Gone — This URL no longer matches any content on servicesartisans.fr. ' +
  'If you arrived here from a search engine, the page has been permanently removed.'
