/**
 * Service intent taxonomy — splits `/services/[service]/[location]` pages
 * into editorial registers matching the primary search intent on Google.
 *
 * Source of truth for the decision : `docs/service-intents-playbook.md`
 * (cross-audit synthesis Ahrefs + GSC + Google 2026 people-first rules).
 *
 * Why this module exists :
 *   Avant : template unique (aides MaPrimeRénov' + CEE + DPE + calendrier
 *   saisonnier) sur TOUS les services, y compris dépannage urgence. Google
 *   voyait 2 intents sur une même URL → signal thin (pattern qui a fait
 *   −18% à travaux.com en 2025, People-first guidelines §4.6.5/4.6.6).
 *
 *   Après : 3 registres éditoriaux purs, chaque page parle à SON intent.
 *   Le maillage cross-intent (`getCrossIntentTarget`) permet la capture du
 *   volume adjacent via 1 lien contextuel en pied de page — jamais par
 *   fusion des blocs.
 *
 * Public API :
 *   - getServiceIntent(slug)                   → 'urgence' | 'renovation' | 'travaux'
 *   - getIntentTitleVariants(intent, ctx)      → title SEO variants (for generateMetadata)
 *   - getIntentH1Variants(intent, ctx)         → H1 variants (SSR render)
 *   - getIntentMetaDescription(intent, ctx)    → meta description
 *   - getCrossIntentTarget(slug)               → optional sibling reroute (different intent)
 *   - shouldRenderRenovationBlocks(intent)     → gate for PrimesCEE / DPE / MaPrimeRénov'
 *   - shouldRenderUrgencyBlock(intent)         → gate for UrgencyBlock
 *
 * Pure module, zéro I/O : importable côté SSR et côté client.
 */

export type ServiceIntent = 'urgence' | 'renovation' | 'travaux'

/**
 * URGENCE — intent dépannage/panne/casse, besoin immédiat.
 * Signal SERP : "plombier 24h", "serrurier urgence", "intervention rapide".
 * YMYL : non. Aides rénovation : non pertinentes. CTA : appel + délai.
 */
const URGENCE_SERVICES: ReadonlySet<string> = new Set([
  'plombier',
  'serrurier',
  'electricien',
  'vitrier',
  'ramoneur',
  'desinsectisation',
  'deratisation',
  'ascensoriste',
])

/**
 * RÉNOVATION — intent projet énergétique, aides publiques en jeu (YMYL).
 * Signal SERP : "pompe à chaleur [ville]", "isolation RGE", "chauffagiste MaPrimeRénov'".
 * E-E-A-T critique : montants aides à jour, auteur identifié, schema
 * `FinancialProduct` + `GovernmentService` autorisés.
 */
const RENOVATION_SERVICES: ReadonlySet<string> = new Set([
  'chauffagiste',
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'renovation-energetique',
  'climaticien',
  'borne-recharge',
  'diagnostiqueur',
  'etancheiste',
  'zingueur',
  'facadier',
])

/**
 * Cross-intent reroute map — pour un service donné, quel service sibling
 * d'intent DIFFÉRENT recommander en bas de page ? Sert à capter le volume
 * de l'intent adjacent sans diluer le registre éditorial de la page courante.
 *
 * Exemple : sur `/services/plombier/paris` (urgence), afficher en pied de
 * page « Projet de rénovation ? → Chauffagistes RGE à Paris » qui pointe
 * vers `/services/chauffagiste/paris` (renovation). Le maillage est
 * contextuel, pas visuel — juste 1 lien `<a href>` standard.
 */
const CROSS_INTENT_REROUTE: Readonly<Record<string, string>> = {
  // URGENCE → RÉNOVATION (capture projet rénovation qui cherchait dépannage)
  plombier: 'chauffagiste',
  electricien: 'borne-recharge',
  ramoneur: 'chauffagiste',
  // RÉNOVATION → URGENCE (capture fuite/panne qui cherchait rénovation)
  chauffagiste: 'plombier',
  climaticien: 'electricien',
  'pompe-a-chaleur': 'plombier',
}

export function getServiceIntent(slug: string): ServiceIntent {
  if (URGENCE_SERVICES.has(slug)) return 'urgence'
  if (RENOVATION_SERVICES.has(slug)) return 'renovation'
  return 'travaux'
}

export function shouldRenderRenovationBlocks(intent: ServiceIntent): boolean {
  return intent === 'renovation'
}

export function shouldRenderUrgencyBlock(intent: ServiceIntent): boolean {
  return intent === 'urgence'
}

export type CrossIntentTarget = {
  targetSlug: string
  targetIntent: ServiceIntent
  sourceIntent: ServiceIntent
  ctaLabel: string
  ctaSubline: string
}

/**
 * Retourne le sibling cross-intent à afficher en pied de page, ou null
 * si aucun reroute naturel n'est défini pour ce service.
 */
export function getCrossIntentTarget(slug: string): CrossIntentTarget | null {
  const sourceIntent = getServiceIntent(slug)
  const targetSlug = CROSS_INTENT_REROUTE[slug]
  if (!targetSlug) return null
  const targetIntent = getServiceIntent(targetSlug)
  if (targetIntent === sourceIntent) return null

  const ctaLabel =
    sourceIntent === 'urgence'
      ? 'Plutôt un projet de rénovation énergétique ?'
      : 'Besoin urgent plutôt qu\u2019un projet ?'

  const ctaSubline =
    sourceIntent === 'urgence'
      ? 'MaPrimeRénov\u2019, CEE, artisans RGE certifiés — voir les pros projet.'
      : 'Intervention rapide, dépannage 24h/24 — voir les pros urgence.'

  return { targetSlug, targetIntent, sourceIntent, ctaLabel, ctaSubline }
}

type TitleContext = {
  serviceName: string
  locationName: string
  providerCount: number
  reviewPrefix: string
  year: number
  departmentCode: string | null
}

type H1Context = {
  serviceName: string
  locationName: string
  providerCount: number
  departmentCode: string | null
  pluralTerm: string
}

/**
 * Title variants SEO par intent. Ordonnés du plus CTR-ambitieux (position
 * hash 0) au plus neutre (fallback). Consommés par `generateMetadata` via
 * `hashCode(serviceSlug + locationSlug) % variants.length`.
 *
 * Règle invariante : chaque variant ≤ 58 caractères (SERP cutoff desktop),
 * c'est la responsabilité du caller (`truncateTitle`) d'enforcer.
 */
export function getIntentTitleVariants(intent: ServiceIntent, ctx: TitleContext): string[] {
  const { serviceName, locationName, providerCount, reviewPrefix, year, departmentCode } = ctx
  const hasProviders = providerCount > 0
  const deptSuffix = departmentCode ? ` (${departmentCode})` : ''

  if (intent === 'urgence') {
    return hasProviders
      ? [
          `${reviewPrefix}${serviceName} ${locationName} 24h/24 · Intervention ${year}`,
          `${reviewPrefix}${serviceName} ${locationName} : ${providerCount} pros dispo 24h`,
          `${reviewPrefix}${serviceName} ${locationName} — Dépannage urgent ${year}`,
          `${reviewPrefix}${serviceName} ${locationName}${deptSuffix} · Urgence 24h/24`,
          `${reviewPrefix}${serviceName} ${locationName} — Devis 2h, intervention rapide`,
          `${serviceName} ${locationName} — Urgence 24h/24`,
          `${serviceName} ${locationName} 24h`,
          `${serviceName} ${locationName}`,
        ]
      : [
          `${reviewPrefix}${serviceName} ${locationName} 24h/24 · Intervention ${year}`,
          `${reviewPrefix}${serviceName} ${locationName} : Dépannage urgence ${year}`,
          `${reviewPrefix}${serviceName} ${locationName}${deptSuffix} · Urgence 24h/24`,
          `${reviewPrefix}${serviceName} ${locationName} — Devis express 2h`,
          `${serviceName} ${locationName} — Urgence 24h/24`,
          `${serviceName} ${locationName} 24h`,
          `${serviceName} ${locationName}`,
        ]
  }

  if (intent === 'renovation') {
    return hasProviders
      ? [
          `${reviewPrefix}${serviceName} RGE ${locationName} · MaPrimeRénov\u2019 ${year}`,
          `${reviewPrefix}${serviceName} ${locationName} : ${providerCount} pros RGE certifiés`,
          `${reviewPrefix}${serviceName} ${locationName} — Artisans RGE + aides ${year}`,
          `${reviewPrefix}${serviceName} RGE ${locationName}${deptSuffix} · Devis aides`,
          `${reviewPrefix}${serviceName} ${locationName} — MaPrimeRénov\u2019 & CEE ${year}`,
          `${serviceName} RGE ${locationName} ${year}`,
          `${serviceName} RGE ${locationName}`,
          `${serviceName} ${locationName}`,
        ]
      : [
          `${reviewPrefix}${serviceName} RGE ${locationName} · MaPrimeRénov\u2019 ${year}`,
          `${reviewPrefix}${serviceName} ${locationName} : Artisans RGE ${year}`,
          `${reviewPrefix}${serviceName} RGE ${locationName}${deptSuffix} · Devis aides`,
          `${reviewPrefix}${serviceName} ${locationName} — Artisans certifiés ${year}`,
          `${serviceName} RGE ${locationName} ${year}`,
          `${serviceName} RGE ${locationName}`,
          `${serviceName} ${locationName}`,
        ]
  }

  // TRAVAUX (défaut)
  // Variant ultra-court en dernière position (`${serviceName} ${locationName}`)
  // = filet pour villes à long nom (Saint-Just-en-Chaussée, Verneuil-d'Avre…) où
  // les autres variants dépassent 41c. Le caller choisit le 1er variant qui rentre.
  return hasProviders
    ? [
        `${reviewPrefix}${serviceName} ${locationName} ${year} — Devis Gratuit`,
        `${reviewPrefix}${serviceName} ${locationName} : ${providerCount} Pros + Devis`,
        `${reviewPrefix}${serviceName} ${locationName}${deptSuffix} — Devis ${year}`,
        `${reviewPrefix}${serviceName} ${locationName} ${year} : ${providerCount} Artisans`,
        `${reviewPrefix}${serviceName} ${locationName} — Artisans vérifiés ${year}`,
        `${serviceName} ${locationName} — Devis ${year}`,
        `${serviceName} ${locationName} ${year}`,
        `${serviceName} ${locationName}`,
      ]
    : [
        `${reviewPrefix}${serviceName} ${locationName} ${year} — Devis Gratuit`,
        `${reviewPrefix}${serviceName} ${locationName} : Devis Gratuit ${year}`,
        `${reviewPrefix}${serviceName} ${locationName}${deptSuffix} — Devis ${year}`,
        `${reviewPrefix}${serviceName} ${locationName} — Artisans ${year}`,
        `${serviceName} ${locationName} — Devis ${year}`,
        `${serviceName} ${locationName} ${year}`,
        `${serviceName} ${locationName}`,
      ]
}

export function getIntentH1Variants(intent: ServiceIntent, ctx: H1Context): string[] {
  const { serviceName, locationName, providerCount, departmentCode, pluralTerm } = ctx
  const hasProviders = providerCount > 0
  const deptSuffix = departmentCode ? ` (${departmentCode})` : ''
  const titleCasePlural = pluralTerm.charAt(0).toUpperCase() + pluralTerm.slice(1)

  if (intent === 'urgence') {
    return hasProviders
      ? [
          `${serviceName} à ${locationName} — intervention 24h/24`,
          `${serviceName} à ${locationName} : dépannage urgent`,
          `${serviceName} à ${locationName} — ${providerCount} pros dispo 24h/24`,
          `${serviceName} à ${locationName}${deptSuffix} · Urgence 24h/24`,
          `${titleCasePlural} urgence à ${locationName}`,
        ]
      : [
          `${serviceName} à ${locationName} — intervention 24h/24`,
          `${serviceName} à ${locationName} : dépannage urgent`,
          `${serviceName} à ${locationName}${deptSuffix} · Urgence 24h/24`,
          `${titleCasePlural} urgence à ${locationName}`,
        ]
  }

  if (intent === 'renovation') {
    return hasProviders
      ? [
          `${serviceName} RGE à ${locationName} — artisans certifiés`,
          `${serviceName} à ${locationName} : ${providerCount} pros RGE`,
          `${serviceName} RGE à ${locationName} — éligibles MaPrimeRénov\u2019`,
          `${serviceName} à ${locationName}${deptSuffix} · RGE certifiés`,
          `${titleCasePlural} RGE de confiance à ${locationName}`,
        ]
      : [
          `${serviceName} RGE à ${locationName} — artisans certifiés`,
          `${serviceName} à ${locationName} : artisans RGE`,
          `${serviceName} RGE à ${locationName}${deptSuffix}`,
          `${titleCasePlural} RGE à ${locationName}`,
        ]
  }

  return hasProviders
    ? [
        `${serviceName} à ${locationName}`,
        `${serviceName} à ${locationName} : pros référencés SIREN`,
        `${serviceName} à ${locationName} — ${providerCount} pros référencés`,
        `${serviceName} à ${locationName}${deptSuffix}`,
        `${titleCasePlural} de confiance à ${locationName}`,
      ]
    : [
        `${serviceName} à ${locationName}`,
        `${serviceName} à ${locationName} : pros référencés SIREN`,
        `${serviceName} à ${locationName} — Artisans qualifiés`,
        `${serviceName} à ${locationName}${deptSuffix}`,
        `${titleCasePlural} de confiance à ${locationName}`,
      ]
}

export function getIntentMetaDescription(
  intent: ServiceIntent,
  ctx: { serviceName: string; locationName: string; providerCount: number; year: number }
): string {
  const { serviceName, locationName, providerCount, year } = ctx
  const svcLower = serviceName.toLowerCase()
  const countFragment =
    providerCount > 0 ? `${providerCount} artisans vérifiés` : 'Artisans vérifiés'

  if (intent === 'urgence') {
    return `${countFragment} à ${locationName} · Dépannage ${svcLower} 24h/24 soir & week-end, devis gratuit ${year}. SIRET vérifié, assurance décennale.`
  }

  if (intent === 'renovation') {
    return `${countFragment} à ${locationName} — certifiés RGE ${year}, éligibles MaPrimeRénov\u2019 & CEE. Devis gratuit, aides simulées, artisans SIRET et garantie décennale.`
  }

  return `Trouvez un ${svcLower} qualifié à ${locationName}. ${countFragment} SIREN, devis gratuit, avis clients transparents et tarifs indicatifs ${year}. Réponse 24h.`
}

/**
 * Export internal sets for test invariants (ne pas utiliser en prod —
 * passer par getServiceIntent()).
 */
export const __internal = {
  URGENCE_SERVICES,
  RENOVATION_SERVICES,
  CROSS_INTENT_REROUTE,
}
