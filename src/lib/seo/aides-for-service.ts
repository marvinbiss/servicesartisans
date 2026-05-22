/**
 * Aides applicables par service rénovation — Schema.org GovernmentService.
 *
 * Source de vérité pour l'injection de `GovernmentService` Schema sur les
 * templates pSEO `/services/[service]/[ville]` et `/rge/[service]/[ville]`.
 *
 * **Pourquoi ce module existe** :
 *   Avant : injection générique de MaPrimeRénov' + CEE + Éco-PTZ sur TOUS
 *   les services classés `renovation` (cf. service-intents.ts). Le même
 *   triplet d'aides apparaissait sur `chauffagiste`, `panneaux-solaires`,
 *   `isolation-thermique`, etc. — c'est imprécis : la prime CEE BAR-TH-104
 *   n'existe que pour la PAC, BAR-EN-101 pour les combles, BAR-TH-148 pour
 *   le ballon thermo, etc. Knowledge Graph dédoublonnait via @id générique
 *   `#government-service` → entités fusionnées au lieu d'être distinctes.
 *
 *   Après : whitelist stricte de services dont la page peut légitimement
 *   citer des aides + mapping per-service des aides RÉELLEMENT applicables
 *   avec `idFragment` unique (collision KG impossible) + sources officielles
 *   (ANAH / Légifrance / Service-Public / ADEME). Aucune valeur chiffrée
 *   inventée — barème exact = page racine `/aides/...`, ce schema décrit
 *   l'entité gouvernementale (pas le montant).
 *
 * **Règles E-E-A-T (YMYL aides financières)** :
 *   - Aucun chiffre € ou kWh cumac dans `description` (laisse cela aux
 *     pages racines `/aides/maprimerenov`, `/cee/operations/[code]`).
 *   - `sameAs` obligatoire avec ≥1 URL .gouv.fr ou Légifrance.
 *   - `serviceOperator` = entité publique officielle (Anah, DGEC, DG Trésor).
 *   - `temporalCoverage` = durée de l'arrêté/loi (CEE 5e période 2026-2030).
 *
 * **Convention idFragment** :
 *   `aide-<code>-<serviceSlug>` → garantit unicité KG sur les ~50K + 100K
 *   URLs où ce schema sera émis. Sans le suffixe serviceSlug, le même
 *   `#aide-mpr-pac` apparaîtrait sur 50K URLs → KG collapse vers 1 entité.
 *
 * Module pur, zéro I/O. Importable côté SSR App Router.
 */

import { SITE_URL } from './config'

export type ApplicableAide = {
  /** Code court unique (slug-style) — sert au `idFragment` et à `@id`. */
  code: string
  /** Nom officiel du dispositif (tel qu'il apparaît dans les textes Légifrance). */
  name: string
  /**
   * Description neutre du dispositif appliqué au service courant. JAMAIS de
   * chiffre € ou kWh cumac inventé — barème exact reste sur la page racine
   * `/aides/...`. Cible 180-280 chars (sweet spot AI Overviews + Bing AI).
   */
  description: string
  /** Catégorie Schema.org `category` (ex: "Aide à la rénovation énergétique"). */
  category: string
  /** Schema.org `serviceType` (free text). */
  serviceType: string
  /**
   * Audience type — propriétaires occupants, bailleurs, copropriétés,
   * ménages modestes selon les conditions d'éligibilité du dispositif.
   */
  audience: string
  /**
   * Durée d'application du dispositif (ISO 8601 interval). MaPrimeRénov'
   * = millésime annuel (2026), CEE 5e période = 2026-01-01/2030-12-31.
   */
  temporalCoverage: string
  /** Opérateur public officiel (Anah, DGEC, DG Trésor, ADEME). */
  serviceOperator: {
    name: string
    url: string
  }
  /** URLs officielles `.gouv.fr` / Légifrance / Service-Public / ADEME / France Rénov'. */
  sameAs: string[]
  /**
   * Fragment d'ancre de la page consommatrice (`#fragment`). Permet à Google
   * d'attacher le schema à une section précise de la page (mention de l'aide).
   * Si la page n'expose pas cette ancre, KG retombe simplement sur l'URL racine.
   */
  fragment: string
}

// ---------------------------------------------------------------------------
// Whitelist services rénovation dont la page peut citer des aides
// ---------------------------------------------------------------------------

/**
 * Services pour lesquels l'injection de Schema GovernmentService est légitime.
 *
 * Critère : la page (template /services/[s]/[v] ou /rge/[s]/[v]) parle
 * potentiellement d'aides publiques (MPR / CEE / éco-PTZ / TVA 5,5 %) en
 * lien direct avec ce métier.
 *
 * **Hors whitelist = 0 injection** (évite spam Schema sur dépannage / commodité).
 *
 * Aligné avec :
 *   - `RENOVATION_SERVICES` dans `service-intents.ts` (sous-ensemble).
 *   - `RGE_ALLOWED_SERVICES` dans `rge/service-city-listings.ts` (intersection).
 *
 * Les variantes fines de slugs mentionnées dans le brief (`pompe-a-chaleur-air-eau`,
 * `isolation-combles`, `vmc-double-flux`, etc.) ne sont PAS des slugs réels du
 * codebase : elles sont couvertes par leurs aggregator slugs (`pompe-a-chaleur`,
 * `isolation-thermique`, `ventilation`).
 */
export const RENO_SERVICES_WITH_AIDES: ReadonlySet<string> = new Set([
  'pompe-a-chaleur',
  'chauffe-eau-thermodynamique',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffagiste',
  'climaticien',
  'ventilation',
  'fenetres',
  'audit-energetique',
  'diagnostiqueur',
  'renovation-energetique',
  // Métiers enveloppe du bâti qui ouvrent droit à MPR/CEE via leur lien
  // direct avec isolation / étanchéité thermique :
  'couvreur',
  'zingueur',
  'facadier',
  'etancheiste',
  'menuisier', // pose menuiseries extérieures (fenêtres, portes-fenêtres)
])

export function isServiceEligibleForAides(slug: string): boolean {
  return RENO_SERVICES_WITH_AIDES.has(slug)
}

// ---------------------------------------------------------------------------
// Sources officielles (sameAs et serviceOperator partagés)
// ---------------------------------------------------------------------------

const ANAH_OPERATOR = {
  name: "Agence nationale de l'habitat (Anah)",
  url: 'https://www.anah.gouv.fr/',
}

const DGEC_OPERATOR = {
  name: "Direction générale de l'énergie et du climat (DGEC)",
  url: 'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
}

const TRESOR_OPERATOR = {
  name: 'Direction générale du Trésor',
  url: 'https://www.tresor.economie.gouv.fr/',
}

const FRANCE_RENOV = 'https://france-renov.gouv.fr/'
const MPR_GOUV = 'https://www.maprimerenov.gouv.fr/'
const SERVICE_PUBLIC_MPR = 'https://www.service-public.fr/particuliers/vosdroits/F35083'
const SERVICE_PUBLIC_CEE = 'https://www.service-public.fr/particuliers/vosdroits/F1985'
const SERVICE_PUBLIC_ECO_PTZ = 'https://www.service-public.fr/particuliers/vosdroits/F19905'
const LEGIFRANCE_CEE =
  'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985322/'
const LEGIFRANCE_ECO_PTZ = 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044881907/'

// ---------------------------------------------------------------------------
// Templates d'aides réutilisables (factory style, sans valeurs inventées)
// ---------------------------------------------------------------------------

/**
 * MaPrimeRénov' — geste applicable au service courant. Description varie
 * selon le geste (PAC / isolation / VMC / fenêtres / audit) mais conserve
 * `sameAs`, `serviceOperator`, `temporalCoverage` identiques (millésime
 * annuel : barème 2026 actif jusqu'au 31 décembre 2026).
 */
const mprForGesture = (serviceSlug: string, gestureDescription: string): ApplicableAide => ({
  code: 'mpr',
  name: "MaPrimeRénov'",
  description: gestureDescription,
  category: 'Aide à la rénovation énergétique',
  serviceType: 'Aide forfaitaire au geste de rénovation énergétique',
  audience:
    "Propriétaires occupants, propriétaires bailleurs et copropriétés en France métropolitaine et départements d'outre-mer",
  temporalCoverage: '2026-01-01/2026-12-31',
  serviceOperator: ANAH_OPERATOR,
  sameAs: [
    MPR_GOUV,
    `${FRANCE_RENOV}aides/maprimerenov`,
    'https://www.anah.gouv.fr/proprietaires/proprietaires-occupants',
    SERVICE_PUBLIC_MPR,
  ],
  fragment: `aide-mpr-${serviceSlug}`,
})

/**
 * CEE — fiche d'opération standardisée applicable au service. Le `code`
 * pointe l'opération BAR-TH-XXX / BAR-EN-XXX dans le `idFragment` pour
 * dédoublonner KG entre les différentes opérations CEE.
 */
const ceeForOperation = (
  serviceSlug: string,
  operationCode: string,
  operationName: string,
  description: string
): ApplicableAide => ({
  code: `cee-${operationCode.toLowerCase()}`,
  name: `Certificats d'économies d'énergie (CEE) — ${operationName}`,
  description,
  category: 'Aide à la rénovation énergétique privée',
  serviceType: 'Prime CEE — fiche opération standardisée',
  audience: 'Propriétaires occupants, bailleurs, copropriétés et entreprises',
  temporalCoverage: '2026-01-01/2030-12-31',
  serviceOperator: DGEC_OPERATOR,
  sameAs: [DGEC_OPERATOR.url, `${FRANCE_RENOV}aides/cee`, LEGIFRANCE_CEE, SERVICE_PUBLIC_CEE],
  fragment: `aide-cee-${operationCode.toLowerCase()}-${serviceSlug}`,
})

/**
 * Éco-PTZ — prêt à taux zéro applicable à un bouquet de travaux ou un
 * geste unique éligible. Description neutralisée — montants exacts sur
 * la page racine `/aides/eco-ptz`.
 */
const ecoPtzForService = (serviceSlug: string, gestureDescription: string): ApplicableAide => ({
  code: 'eco-ptz',
  name: 'Éco-prêt à taux zéro (éco-PTZ)',
  description: gestureDescription,
  category: 'Prêt aidé à la rénovation énergétique',
  serviceType: 'Prêt sans intérêt',
  audience:
    'Propriétaires occupants, bailleurs et syndicats de copropriétaires de logements achevés depuis plus de 2 ans en France',
  temporalCoverage: '2026-01-01/2027-12-31',
  serviceOperator: TRESOR_OPERATOR,
  sameAs: [SERVICE_PUBLIC_ECO_PTZ, `${FRANCE_RENOV}aides/eco-ptz`, LEGIFRANCE_ECO_PTZ],
  fragment: `aide-eco-ptz-${serviceSlug}`,
})

/**
 * Coup de pouce CEE — bonification contractuelle des primes CEE pour les
 * gestes éligibles d'une charte (chauffage individuel, rénovation d'ampleur,
 * rénovation performante bâtiment résidentiel collectif). Description
 * neutre, valeurs exactes sur `/cee/coup-de-pouce`.
 */
const coupDePouceCEE = (serviceSlug: string, description: string): ApplicableAide => ({
  code: 'cee-coup-de-pouce',
  name: 'Coup de pouce CEE',
  description,
  category: 'Bonification CEE à la rénovation énergétique',
  serviceType: 'Bonification contractuelle de prime CEE',
  audience:
    'Ménages aux revenus modestes et très modestes, propriétaires bailleurs, copropriétés et bailleurs sociaux',
  temporalCoverage: '2026-01-01/2030-12-31',
  serviceOperator: DGEC_OPERATOR,
  sameAs: [
    'https://www.ecologie.gouv.fr/coup-pouce-economies-denergie',
    `${FRANCE_RENOV}aides/coup-de-pouce-economies-denergie`,
  ],
  fragment: `aide-cee-coup-de-pouce-${serviceSlug}`,
})

// ---------------------------------------------------------------------------
// Mapping per-service
// ---------------------------------------------------------------------------

/**
 * Aides applicables par service. Une entrée vide (= service non listé) ⇒
 * 0 injection, conformément à la whitelist `RENO_SERVICES_WITH_AIDES`.
 *
 * Sources des opérations CEE :
 *   - BAR-TH-104 PAC air/eau ou eau/eau : arrêté du 22 décembre 2014
 *   - BAR-TH-148 chauffe-eau thermodynamique : arrêté du 22 décembre 2014
 *   - BAR-TH-129 PAC air/air : arrêté du 22 décembre 2014
 *   - BAR-TH-101 chauffe-eau solaire individuel : arrêté du 22 décembre 2014
 *   - BAR-TH-113 chaudière biomasse individuelle : arrêté du 22 décembre 2014
 *   - BAR-EN-101 isolation combles / toitures : arrêté du 22 décembre 2014
 *   - BAR-EN-102 isolation murs : arrêté du 22 décembre 2014
 *   - BAR-EN-103 isolation planchers bas : arrêté du 22 décembre 2014
 *   - BAR-EN-104 fenêtres / portes-fenêtres : arrêté du 22 décembre 2014
 *   - BAR-TH-125 VMC double flux : arrêté du 22 décembre 2014
 *   - BAR-TH-127 VMC simple flux hygroréglable : arrêté du 22 décembre 2014
 *   - BAR-TH-164 audit énergétique : arrêté du 22 décembre 2014
 *
 * Toutes ces fiches sont publiées sur la base ATEE / DGEC :
 *   https://atee.fr/efficacite-energetique/club-c2e
 *   https://www.ecologie.gouv.fr/operations-standardisees-deconomies-denergie
 */
const SERVICE_AIDES_MAP: Readonly<Record<string, ReadonlyArray<ApplicableAide>>> = {
  // -------------------------------------------------------------------------
  // POMPE À CHALEUR — PAC air/eau, eau/eau, géothermique (le métier)
  // -------------------------------------------------------------------------
  'pompe-a-chaleur': [
    mprForGesture(
      'pompe-a-chaleur',
      "Aide forfaitaire de l'État versée par l'Anah pour l'installation d'une pompe à chaleur (air/eau, eau/eau ou géothermique) en remplacement d'un système de chauffage moins performant, par un artisan RGE QualiPAC."
    ),
    ceeForOperation(
      'pompe-a-chaleur',
      'BAR-TH-104',
      'BAR-TH-104 Pompe à chaleur air/eau ou eau/eau',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'une pompe à chaleur air/eau ou eau/eau par un professionnel RGE QualiPAC, en remplacement d'une chaudière non condensation."
    ),
    coupDePouceCEE(
      'pompe-a-chaleur',
      "Bonification CEE de la prime BAR-TH-104 pour le remplacement d'une chaudière au charbon, fioul ou gaz (hors condensation) par une pompe à chaleur air/eau ou eau/eau. Bonification renforcée pour les ménages aux revenus modestes et très modestes."
    ),
    ecoPtzForService(
      'pompe-a-chaleur',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer l'installation d'une pompe à chaleur (air/eau, eau/eau ou géothermique) dans un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // CHAUFFE-EAU THERMODYNAMIQUE (ballon thermo)
  // -------------------------------------------------------------------------
  'chauffe-eau-thermodynamique': [
    mprForGesture(
      'chauffe-eau-thermodynamique',
      "Aide forfaitaire de l'État versée par l'Anah pour l'installation d'un chauffe-eau thermodynamique en remplacement d'un ancien chauffe-eau électrique ou gaz, par un artisan RGE."
    ),
    ceeForOperation(
      'chauffe-eau-thermodynamique',
      'BAR-TH-148',
      'BAR-TH-148 Chauffe-eau thermodynamique',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'un chauffe-eau thermodynamique à accumulation par un professionnel qualifié, sous conditions de coefficient de performance (COP) et de volume d'eau chaude."
    ),
    ecoPtzForService(
      'chauffe-eau-thermodynamique',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer l'installation d'un chauffe-eau thermodynamique dans un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // PANNEAUX SOLAIRES — solaire thermique et photovoltaïque (le métier)
  // -------------------------------------------------------------------------
  'panneaux-solaires': [
    mprForGesture(
      'panneaux-solaires',
      "Aide forfaitaire de l'État versée par l'Anah pour l'installation d'un système solaire combiné ou d'un chauffe-eau solaire individuel par un artisan RGE QualiSol."
    ),
    ceeForOperation(
      'panneaux-solaires',
      'BAR-TH-101',
      'BAR-TH-101 Chauffe-eau solaire individuel',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'un chauffe-eau solaire individuel (CESI) par un artisan RGE QualiSol."
    ),
    ecoPtzForService(
      'panneaux-solaires',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer l'installation d'un système solaire thermique dans un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // ISOLATION THERMIQUE — combles, murs, toiture, planchers bas (aggregator)
  // -------------------------------------------------------------------------
  'isolation-thermique': [
    mprForGesture(
      'isolation-thermique',
      "Aide forfaitaire de l'État versée par l'Anah pour les travaux d'isolation thermique (combles perdus, rampants de toiture, murs par l'extérieur ou par l'intérieur, planchers bas) réalisés par un artisan RGE."
    ),
    ceeForOperation(
      'isolation-thermique',
      'BAR-EN-101',
      'BAR-EN-101 Isolation des combles et toitures',
      "Prime CEE versée par les fournisseurs d'énergie pour les travaux d'isolation des combles perdus ou des rampants de toiture par un artisan RGE, sous conditions de résistance thermique minimale."
    ),
    ceeForOperation(
      'isolation-thermique',
      'BAR-EN-102',
      'BAR-EN-102 Isolation des murs',
      "Prime CEE versée par les fournisseurs d'énergie pour les travaux d'isolation thermique des murs par l'extérieur (ITE) ou par l'intérieur (ITI) par un artisan RGE."
    ),
    ceeForOperation(
      'isolation-thermique',
      'BAR-EN-103',
      'BAR-EN-103 Isolation des planchers bas',
      "Prime CEE versée par les fournisseurs d'énergie pour les travaux d'isolation thermique des planchers bas sur sous-sol, vide sanitaire ou passage ouvert par un artisan RGE."
    ),
    coupDePouceCEE(
      'isolation-thermique',
      "Bonification CEE des primes d'isolation pour les ménages aux revenus modestes et très modestes (charte Coup de pouce isolation), majoration pour les chartes Rénovation d'ampleur et Rénovation performante."
    ),
    ecoPtzForService(
      'isolation-thermique',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer les travaux d'isolation thermique d'un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // CHAUFFAGISTE — installation chauffage individuel (chaudière biomasse,
  // PAC, poêle à granulés...). Couvre plusieurs gestes éligibles.
  // -------------------------------------------------------------------------
  chauffagiste: [
    mprForGesture(
      'chauffagiste',
      "Aide forfaitaire de l'État versée par l'Anah pour l'installation d'un système de chauffage performant (pompe à chaleur, chaudière biomasse, poêle à granulés ou système solaire combiné) par un artisan RGE en remplacement d'un système moins performant."
    ),
    ceeForOperation(
      'chauffagiste',
      'BAR-TH-104',
      'BAR-TH-104 Pompe à chaleur air/eau ou eau/eau',
      "Prime CEE pour l'installation d'une PAC air/eau ou eau/eau par un chauffagiste RGE QualiPAC, dans le cadre du remplacement d'une chaudière non condensation."
    ),
    ceeForOperation(
      'chauffagiste',
      'BAR-TH-113',
      'BAR-TH-113 Chaudière biomasse individuelle',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'une chaudière biomasse à alimentation manuelle ou automatique par un artisan RGE Qualibois."
    ),
    coupDePouceCEE(
      'chauffagiste',
      "Bonification CEE Chauffage résidentiel individuel pour le remplacement d'une chaudière au charbon, fioul ou gaz (hors condensation) par un équipement performant (PAC, biomasse, solaire). Renforcée pour les ménages modestes."
    ),
    ecoPtzForService(
      'chauffagiste',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer l'installation ou le remplacement d'un système de chauffage performant dans un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // CLIMATICIEN — PAC air/air (climatisation réversible) hors MPR (non éligible)
  // -------------------------------------------------------------------------
  climaticien: [
    ceeForOperation(
      'climaticien',
      'BAR-TH-129',
      'BAR-TH-129 Pompe à chaleur de type air/air',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'une pompe à chaleur de type air/air (climatisation réversible) par un artisan QualiPAC, sous conditions de SCOP minimal."
    ),
  ],

  // -------------------------------------------------------------------------
  // VENTILATION — VMC simple/double flux hygroréglable
  // -------------------------------------------------------------------------
  ventilation: [
    mprForGesture(
      'ventilation',
      "Aide forfaitaire de l'État versée par l'Anah pour l'installation d'une VMC double flux haute performance par un artisan RGE, dans le cadre du parcours par geste ou du parcours accompagné."
    ),
    ceeForOperation(
      'ventilation',
      'BAR-TH-125',
      'BAR-TH-125 VMC double flux autoréglable ou modulée',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'une ventilation mécanique contrôlée (VMC) double flux autoréglable ou modulée par un artisan qualifié."
    ),
    ceeForOperation(
      'ventilation',
      'BAR-TH-127',
      'BAR-TH-127 VMC simple flux hygroréglable',
      "Prime CEE versée par les fournisseurs d'énergie pour l'installation d'une VMC simple flux hygroréglable de type A ou B par un artisan qualifié."
    ),
  ],

  // -------------------------------------------------------------------------
  // FENÊTRES — menuiseries extérieures isolantes
  // -------------------------------------------------------------------------
  fenetres: [
    mprForGesture(
      'fenetres',
      "Aide forfaitaire de l'État versée par l'Anah pour le remplacement de fenêtres ou portes-fenêtres simple vitrage par des menuiseries isolantes (Uw ≤ 1,3 W/m².K) posées par un artisan RGE."
    ),
    ceeForOperation(
      'fenetres',
      'BAR-EN-104',
      'BAR-EN-104 Fenêtres ou portes-fenêtres',
      "Prime CEE versée par les fournisseurs d'énergie pour le remplacement de menuiseries extérieures par des fenêtres ou portes-fenêtres isolantes posées par un artisan qualifié, sous conditions de coefficient de transmission thermique Uw."
    ),
    ecoPtzForService(
      'fenetres',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer le remplacement de fenêtres et portes-fenêtres par des menuiseries isolantes dans un logement achevé depuis plus de 2 ans."
    ),
  ],

  // -------------------------------------------------------------------------
  // AUDIT ÉNERGÉTIQUE — préalable parcours accompagné MaPrimeRénov'
  // -------------------------------------------------------------------------
  'audit-energetique': [
    mprForGesture(
      'audit-energetique',
      "Aide forfaitaire de l'État versée par l'Anah pour la réalisation d'un audit énergétique réglementaire par un auditeur RGE (architecte CNOA, bureau d'études OPQIBI 1905/1911), préalable obligatoire au parcours accompagné MaPrimeRénov'."
    ),
    ceeForOperation(
      'audit-energetique',
      'BAR-TH-164',
      'BAR-TH-164 Audit énergétique réglementaire',
      "Prime CEE versée par les fournisseurs d'énergie pour la réalisation d'un audit énergétique réglementaire d'un logement individuel ou collectif par un auditeur qualifié."
    ),
  ],

  // -------------------------------------------------------------------------
  // DIAGNOSTIQUEUR — DPE + audit énergétique (E-E-A-T fort YMYL)
  // -------------------------------------------------------------------------
  diagnostiqueur: [
    mprForGesture(
      'diagnostiqueur',
      "Aide forfaitaire de l'État versée par l'Anah pour la réalisation d'un audit énergétique préalable au parcours accompagné MaPrimeRénov', réalisé par un diagnostiqueur certifié (DPE) ou un auditeur RGE."
    ),
    ceeForOperation(
      'diagnostiqueur',
      'BAR-TH-164',
      'BAR-TH-164 Audit énergétique réglementaire',
      "Prime CEE pour la réalisation d'un audit énergétique réglementaire d'un logement individuel ou collectif par un auditeur qualifié."
    ),
  ],

  // -------------------------------------------------------------------------
  // RÉNOVATION ÉNERGÉTIQUE — parcours accompagné rénovation d'ampleur
  // -------------------------------------------------------------------------
  'renovation-energetique': [
    mprForGesture(
      'renovation-energetique',
      "Aide forfaitaire de l'État versée par l'Anah pour les bouquets de travaux de rénovation énergétique (parcours par geste ou parcours accompagné MaPrimeRénov' pour les rénovations d'ampleur permettant un saut de classe DPE)."
    ),
    coupDePouceCEE(
      'renovation-energetique',
      "Bonification CEE Rénovation d'ampleur et Rénovation performante de bâtiment résidentiel collectif, accessible via un accompagnateur Mon Accompagnateur Rénov'."
    ),
    ecoPtzForService(
      'renovation-energetique',
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer un bouquet de travaux de rénovation énergétique (jusqu'à 50 000 € pour un éco-PTZ performance globale, durée jusqu'à 20 ans)."
    ),
  ],

  // -------------------------------------------------------------------------
  // COUVREUR / ZINGUEUR — isolation toiture par l'extérieur (sarking, combles)
  // -------------------------------------------------------------------------
  couvreur: [
    mprForGesture(
      'couvreur',
      "Aide forfaitaire de l'État versée par l'Anah pour l'isolation des rampants de toiture ou des combles perdus dans le cadre de la réfection d'une couverture, par un artisan RGE."
    ),
    ceeForOperation(
      'couvreur',
      'BAR-EN-101',
      'BAR-EN-101 Isolation des combles et toitures',
      "Prime CEE versée pour l'isolation des combles ou rampants de toiture (procédé sarking en sur-toiture inclus) lors d'une réfection de couverture par un artisan RGE."
    ),
  ],

  zingueur: [
    ceeForOperation(
      'zingueur',
      'BAR-EN-101',
      'BAR-EN-101 Isolation des combles et toitures',
      "Prime CEE versée pour l'isolation des combles ou rampants de toiture lors d'une réfection de couverture ou de zinguerie par un artisan RGE."
    ),
  ],

  // -------------------------------------------------------------------------
  // FAÇADIER — ITE (isolation thermique par l'extérieur)
  // -------------------------------------------------------------------------
  facadier: [
    mprForGesture(
      'facadier',
      "Aide forfaitaire de l'État versée par l'Anah pour l'isolation thermique des murs par l'extérieur (ITE) dans le cadre d'un ravalement de façade ou d'une rénovation enveloppe, par un artisan RGE."
    ),
    ceeForOperation(
      'facadier',
      'BAR-EN-102',
      'BAR-EN-102 Isolation des murs',
      "Prime CEE pour les travaux d'isolation thermique des murs par l'extérieur (ITE) par un artisan RGE, sous conditions de résistance thermique minimale."
    ),
  ],

  // -------------------------------------------------------------------------
  // ÉTANCHÉISTE — étanchéité toiture-terrasse + ITE
  // -------------------------------------------------------------------------
  etancheiste: [
    ceeForOperation(
      'etancheiste',
      'BAR-EN-101',
      'BAR-EN-101 Isolation des combles et toitures',
      "Prime CEE pour l'isolation des toitures-terrasses lors d'une reprise d'étanchéité, par un artisan RGE qualifié."
    ),
  ],

  // -------------------------------------------------------------------------
  // MENUISIER — pose menuiseries extérieures isolantes
  // -------------------------------------------------------------------------
  menuisier: [
    mprForGesture(
      'menuisier',
      "Aide forfaitaire de l'État versée par l'Anah pour la pose de menuiseries extérieures isolantes (fenêtres, portes-fenêtres) en remplacement de simple vitrage, par un artisan RGE Qualibat menuiserie."
    ),
    ceeForOperation(
      'menuisier',
      'BAR-EN-104',
      'BAR-EN-104 Fenêtres ou portes-fenêtres',
      'Prime CEE pour le remplacement de menuiseries extérieures par des fenêtres ou portes-fenêtres isolantes par un artisan qualifié.'
    ),
  ],
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renvoie la liste des aides applicables au service `serviceSlug`.
 *
 * Retourne `[]` si :
 *   - le service n'est pas dans `RENO_SERVICES_WITH_AIDES` (whitelist stricte) ;
 *   - le service est dans la whitelist mais n'a pas encore d'entrée dans
 *     `SERVICE_AIDES_MAP` (fail-safe : pas d'injection plutôt qu'injection
 *     générique non sourcée).
 *
 * Les pages consommatrices DOIVENT vérifier `arr.length > 0` avant d'itérer
 * (cf. `services/[service]/[location]/page.tsx` et `rge/[service]/[ville]/page.tsx`).
 */
export function getApplicableAidesForService(serviceSlug: string): ReadonlyArray<ApplicableAide> {
  if (!RENO_SERVICES_WITH_AIDES.has(serviceSlug)) return []
  return SERVICE_AIDES_MAP[serviceSlug] ?? []
}

/**
 * Construit l'URL absolue de la page consommatrice pour le paramètre `url`
 * de `getGovernmentServiceSchema`. Centralise la convention `${SITE_URL}${path}`
 * pour éviter les divergences entre callsites.
 *
 * @example
 * buildAidePageUrl('/services/pompe-a-chaleur/paris')
 * // → 'https://servicesartisans.fr/services/pompe-a-chaleur/paris'
 */
export function buildAidePageUrl(path: string): string {
  return `${SITE_URL}${path}`
}
