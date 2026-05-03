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
 * Source de vérité unique : `src/lib/services/canonical-slugs.ts` (leaf module
 * sans imports — Edge-friendly, 0 coût bundle). Catalog.ts (server) et ce
 * module (Edge middleware) consomment la même constante → zero drift triple.
 */
import { CANONICAL_SERVICE_SLUGS_SET } from '@/lib/services/canonical-slugs'
export const VALID_SERVICE_SLUGS: ReadonlySet<string> = CANONICAL_SERVICE_SLUGS_SET

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
  // Élargissement RGE 2026-05-02 (cf. RGE_ALLOWED_SERVICES) — slugs RGE-only.
  'borne-recharge',
  'chauffe-eau-thermodynamique',
  'audit-energetique',
  'ventilation',
  'fenetres',
])

/**
 * Slugs problèmes couverts par `/problemes/[probleme]` et
 * `/problemes/[probleme]/[ville]`.
 *
 * Source de vérité : `src/lib/data/problems.ts` + `problems-extra.ts`.
 * Liste dupliquée ici pour edge runtime (zéro I/O, < 1 kB minified).
 *
 * Pivot RGE 2026-05-01 : les entrées `nuisibles` et `infestation-fourmis`
 * ont été retirées car leur seul service associé (desinsectisation /
 * deratisation) a été supprimé. Tout slug hors liste retourne 410.
 *
 * Le test `gone-paths.test.ts` vérifie la cohérence avec problems.ts/extra.ts.
 */
export const VALID_PROBLEM_SLUGS: ReadonlySet<string> = new Set([
  // problems.ts (catégories principales)
  'fuite-eau',
  'canalisation-bouchee',
  'panne-chaudiere',
  'serrure-bloquee',
  'porte-claquee',
  'panne-electrique',
  'court-circuit',
  'fissure-mur',
  'infiltration-toiture',
  'degat-des-eaux',
  'humidite',
  'moisissure',
  'mur-humide',
  'fenetre-qui-condense',
  'peinture-qui-cloque',
  'probleme-isolation',
  // problems-extra.ts (problèmes granulaires)
  'wc-bouche',
  'wc-qui-coule',
  'chasse-eau-bloquee',
  'robinet-qui-fuit',
  'robinet-qui-goutte',
  'tuyau-pvc-qui-fuit',
  'gel-tuyaux',
  'panne-ballon-eau-chaude',
  'ballon-eau-chaude-panne',
  'odeur-egout',
  'odeur-humidite-cave',
  'inondation',
  'chaudiere-qui-fuit',
  'panne-chauffage',
  'radiateur-froid',
  'radiateur-qui-siffle',
  'disjoncteur-qui-saute',
  'prise-qui-chauffe',
  'alarme-declenchee',
  'interphone-panne',
  'porte-entree-qui-gonfle',
  'porte-qui-grince',
  'porte-garage-bloquee',
  'fenetre-qui-ferme-mal',
  'volet-bloque',
  'volet-roulant-bloque',
  'vitre-cassee',
  'reparation-toiture',
  'fuite-toiture',
  'fuite-toiture-ardoise',
  'tuile-cassee',
  'toit-qui-fuit',
  'gouttiere-bouchee',
  'fissure-facade',
  'peinture-facade-ecaillee',
  'tache-humidite-plafond',
  'plancher-qui-craque',
  'parquet-qui-gondole',
  'escalier-bois-qui-craque',
  'carrelage-fissure',
  'joint-salle-de-bain-moisi',
  'affaissement-terrasse',
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
 *
 * `redirect` (mutuellement exclusif avec `gone:true`) signifie qu'on doit
 * faire un 301 vers une URL canonique vivante. Utilisé pour le filet G3
 * sur `/tarifs/[s]/[v]/[task]` : la page a été supprimée, mais GSC montre
 * qu'elle reçoit du trafic réel — on redirige vers `/services/[s]/[v]#tarifs`
 * pour préserver l'équité de lien et l'expérience utilisateur.
 */
export interface GonePathDecision {
  gone: boolean
  reason?:
    | 'service_slug_unknown'
    | 'rge_service_slug_unknown'
    | 'cee_operation_invalid_format'
    | 'ville_slug_malformed'
    | 'tarifs_task_deprecated'
    | 'problem_slug_unknown'
  redirect?: { to: string; status: 301 }
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

  // 5a. /devis/[service]/[ville] — bloc DEPRECATED 2026-04-30
  //     Diagnostic GSC 30/04 : ~37 000 URLs en "explorée actuellement non
  //     indexée" (32.9 % du total 112 429). Page n'existe plus dans l'app
  //     router (seul /devis et /devis/[service] subsistent). Avant ce filet,
  //     Google retombait sur le 404 défaut Next.js → soft 404 → crawl budget
  //     gaspillé. On 301 vers /services/[s]/[v] qui est la canonical durable
  //     (bloc devis intégré, mêmes artisans, intent identique).
  //     Si service unknown ou ville malformée → 410 (Google oublie vite).
  const devisMatch = /^\/devis\/([^/]+)\/([^/]+)\/?$/i.exec(pathname)
  if (devisMatch) {
    const [, service, ville] = devisMatch
    const serviceLower = service.toLowerCase()
    if (!VALID_SERVICE_SLUGS.has(serviceLower)) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    const villeDecision = validateVilleSlug(ville.toLowerCase())
    if (villeDecision.gone) return villeDecision
    return {
      gone: false,
      redirect: {
        to: `/services/${serviceLower}/${ville.toLowerCase()}`,
        status: 301,
      },
    }
  }

  // 5b. /tarifs/[service]/[ville] — bloc DEPRECATED 2026-04-30
  //     Diagnostic GSC 30/04 : ~14 000 URLs en "explorée actuellement non
  //     indexée" (12.7 %). Page n'existe plus (seul /tarifs/[service] hub
  //     subsiste). 301 vers /services/[s]/[v]#tarifs (PriceTableHTML +
  //     baromètre prix communaux y vivent). Cohérent avec le filet G3
  //     existant pour /tarifs/[s]/[v]/[task] whitelistées.
  const tarifsCityMatch = /^\/tarifs\/([^/]+)\/([^/]+)\/?$/i.exec(pathname)
  if (tarifsCityMatch) {
    const [, service, ville] = tarifsCityMatch
    const serviceLower = service.toLowerCase()
    if (!VALID_SERVICE_SLUGS.has(serviceLower)) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    const villeDecision = validateVilleSlug(ville.toLowerCase())
    if (villeDecision.gone) return villeDecision
    return {
      gone: false,
      redirect: {
        to: `/services/${serviceLower}/${ville.toLowerCase()}#tarifs`,
        status: 301,
      },
    }
  }

  // 6. /tarifs/[service]/[ville]/[travail] — bloc DEPRECATED 2026-04-29
  //    Stratégie 140K vague 1 : 184 500 URLs cannibalisantes, 0 KW Ahrefs,
  //    0 backlinks externes recensés. Purge définitive via 410.
  //    /tarifs/[s] (hub 1 segment) reste valide ; /tarifs/[s]/[v] traité
  //    en 5b ci-dessus (301 vers /services/[s]/[v]#tarifs).
  //
  //    Filet G3 (plan 140K) : 100 URLs whitelistées (236 clics 90j actifs)
  //    sont 301-redirigées vers /services/[s]/[v]#tarifs (page vivante avec
  //    PriceTableHTML). On ne peut pas servir la page d'origine — elle a été
  //    supprimée du repo (V1 #2/#3 strategy 140K) — mais on préserve l'équité
  //    de lien et le clic GSC actif au lieu de renvoyer 404.
  const tarifsTaskMatch = /^\/tarifs\/([^/]+)\/([^/]+)\/[^/]+\/?$/i.exec(pathname)
  if (tarifsTaskMatch) {
    if (WHITELIST_TARIFS_TASK_GSC.has(normalizePath(pathname))) {
      const [, service, ville] = tarifsTaskMatch
      return {
        gone: false,
        redirect: {
          to: `/services/${service.toLowerCase()}/${ville.toLowerCase()}#tarifs`,
          status: 301,
        },
      }
    }
    return { gone: true, reason: 'tarifs_task_deprecated' }
  }

  // 7. /problemes/[probleme] — bloc DEPRECATED 2026-05-01 (pivot RGE)
  //    Les entrées `nuisibles` et `infestation-fourmis` ont été retirées
  //    de problems.ts car le seul service associé (desinsectisation/
  //    deratisation) a été supprimé du catalogue. Sans ce filet, Next.js 14.2
  //    + ISR + notFound() renvoie HTTP 200 (soft 404) — Google continue à
  //    crawler. On retourne 410 pour purge index immédiate.
  const problemMatch = /^\/problemes\/([^/]+)\/?$/.exec(pathname)
  if (problemMatch) {
    const [, probleme] = problemMatch
    if (!VALID_PROBLEM_SLUGS.has(probleme)) {
      return { gone: true, reason: 'problem_slug_unknown' }
    }
    return { gone: false }
  }

  // 8. /problemes/[probleme]/[ville] — même logique que bloc 7 + validation ville.
  //    Couvre les ~7 000 URLs whitelistées par `isProblemeIndexable` (top 50/100/200
  //    villes selon urgencyLevel) ainsi que les milliers d'URLs en queue
  //    "explorée non indexée" qui pointaient vers nuisibles/infestation-fourmis.
  const problemVilleMatch = /^\/problemes\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (problemVilleMatch) {
    const [, probleme, ville] = problemVilleMatch
    if (!VALID_PROBLEM_SLUGS.has(probleme)) {
      return { gone: true, reason: 'problem_slug_unknown' }
    }
    return validateVilleSlug(ville)
  }

  // 9. Bare hubs `/[prefix]/[service]` (1 segment service slug) — pivot RGE 2026-05-03.
  //    Couvre `/avis/serrurier`, `/devis/serrurier`, `/tarifs/serrurier`,
  //    `/services/serrurier`, `/urgence/serrurier`, `/services/serrurier/autour-de-moi`.
  //    Bug Next.js 14.2 #69103 : `notFound()` sur ISR + dynamicParams=true retourne
  //    HTTP 200 + noindex au lieu de 404 → soft 404 leak. On force 410.
  const bareHubMatch = /^\/(services|avis|devis|tarifs|urgence)\/([^/]+)\/?$/.exec(pathname)
  if (bareHubMatch) {
    const [, , service] = bareHubMatch
    if (!VALID_SERVICE_SLUGS.has(service.toLowerCase())) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    return { gone: false }
  }

  // 9b. `/services/[service]/autour-de-moi` — sous-route hub, même gating.
  const autourDeMoiMatch = /^\/services\/([^/]+)\/autour-de-moi\/?$/.exec(pathname)
  if (autourDeMoiMatch) {
    if (!VALID_SERVICE_SLUGS.has(autourDeMoiMatch[1].toLowerCase())) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    return { gone: false }
  }

  // 10. /avis/[service]/[ville] + /urgence/[service]/[ville] — patterns 2-segment
  //     manquants au filet avant 2026-05-03. Sans ce bloc, /avis/serrurier/paris
  //     etc retombe en soft 404 (Next.js 14.2 bug).
  const avisVilleMatch = /^\/(avis|urgence)\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (avisVilleMatch) {
    const [, , service, ville] = avisVilleMatch
    if (!VALID_SERVICE_SLUGS.has(service.toLowerCase())) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    return validateVilleSlug(ville)
  }

  // 11. /departements/[dept]/[service] + /regions/[region]/[service]
  //     Mêmes leaks soft-404 sur les dead slugs en hiérarchie territoriale.
  const territoryServiceMatch = /^\/(departements|regions)\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (territoryServiceMatch) {
    const [, , territory, service] = territoryServiceMatch
    if (!VILLE_SLUG_RE.test(territory)) {
      return { gone: true, reason: 'ville_slug_malformed' }
    }
    if (!VALID_SERVICE_SLUGS.has(service.toLowerCase())) {
      return { gone: true, reason: 'service_slug_unknown' }
    }
    return { gone: false }
  }

  // 12. /rge/[service]/departement/[dept] — variante RGE territoriale.
  const rgeDeptMatch = /^\/rge\/([^/]+)\/departement\/([^/]+)\/?$/.exec(pathname)
  if (rgeDeptMatch) {
    const [, service, dept] = rgeDeptMatch
    if (!VALID_RGE_SERVICE_SLUGS.has(service.toLowerCase())) {
      return { gone: true, reason: 'rge_service_slug_unknown' }
    }
    if (!VILLE_SLUG_RE.test(dept)) {
      return { gone: true, reason: 'ville_slug_malformed' }
    }
    return { gone: false }
  }

  // 13. /qualifications-rge — Sprint U Ahrefs 2026-05-03.
  //     Lien historique du Footer (`Footer.tsx` ligne 34 avant fix Sprint U)
  //     pointait vers cette URL qui n'a jamais existé comme route. Audit
  //     P0 2026-05-03 l'avait listée comme "hub à crawler" (cf.
  //     scripts/audit-site-p0-2026-05-03.ts:371) — confirmé absent du repo.
  //     ~459K pages renvoyaient un 404 sur ce lien. On 301 vers
  //     /rge/qualifications (page hub réelle) pour préserver toute équité
  //     de lien externe + corriger le crawl path.
  if (pathname === '/qualifications-rge' || pathname === '/qualifications-rge/') {
    return {
      gone: false,
      redirect: {
        to: '/rge/qualifications',
        status: 301,
      },
    }
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
