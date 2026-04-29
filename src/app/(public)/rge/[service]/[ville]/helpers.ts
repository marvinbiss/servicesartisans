/**
 * Pure helpers extraits de `page.tsx` pour les rendre testables unitairement
 * sans devoir charger toute la page server-component (qui dépend de
 * server-only modules type next/headers, supabase server client…).
 *
 * Ce fichier ne contient AUCUNE logique server-side ni dépendance à des
 * APIs Next.js — uniquement des helpers déterministes.
 *
 * Sprint 0.1 ULTRA DOMINATION SEO Phase 0.
 */

import { RGE_QUALIFICATION_LABELS } from '@/lib/rge/service-city-listings'
export { safeJsonStringify } from '@/lib/seo/safe-json'

/**
 * Tronque un title à `maxLen` chars pour Google.
 * - Coupe sur frontière de mot quand possible.
 * - Garantit qu'un mot unique sans espace ne soit pas réduit à `…` seul
 *   (audit Sprint 0.2 : `\s+\S*$` ne matche rien sur un seul mot long → fallback hard cut).
 * - Guard contre maxLen ≤ 1 (retourne string vide).
 */
export function truncateTitle(title: string, maxLen = 60): string {
  if (maxLen <= 1) return ''
  if (title.length <= maxLen) return title
  const slice = title.slice(0, maxLen - 1)
  const trimmed = slice.replace(/\s+\S*$/, '')
  // Si le trim coupe tout (mot unique), on garde le slice brut pour ne pas
  // produire un title de 1 char ("…") inutilisable.
  return (trimmed.length > 0 ? trimmed : slice) + '…'
}

// safeJsonStringify : re-export en haut du fichier depuis @/lib/seo/safe-json

/**
 * Feature flag Sprint 0.1 ULTRA DOMINATION SEO Phase 0.
 * Désactivable explicitement via `RGE_UPGRADE_V2=false` (variable serveur uniquement).
 * Toute autre valeur (true / unset) → ON par défaut.
 * Note : pas de préfixe NEXT_PUBLIC_ — lu uniquement côté Server Component.
 */
export function isRgeUpgradeV2(): boolean {
  return process.env.RGE_UPGRADE_V2 !== 'false'
}

/**
 * "avril 2026" — date dynamique pour H1 + headline Article.
 * timeZone forcé à Europe/Paris : sur un runtime UTC (Vercel) le 1er du mois
 * entre 00h00 et 02h00 UTC, le mois affiché serait celui d'avant pour les
 * utilisateurs français. Audit Sprint 0.2.
 */
export function currentMonthYearFr(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date())
}

/** Contenu de l'intro métier-spécifique (100-150 mots) */
export function buildIntroParagraph(
  serviceName: string,
  villeName: string,
  serviceSlug: string
): string {
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  const labelPart = qualif
    ? `Les artisans ${serviceName.toLowerCase()} certifiés RGE à ${villeName} détiennent le label ${qualif.label} (délivré par ${qualif.organisme}), garantissant leur compétence pour ${qualif.specifics}.`
    : `Les artisans ${serviceName.toLowerCase()} certifiés RGE (Reconnu Garant de l’Environnement) à ${villeName} répondent aux critères officiels d’éco-conditionnalité fixés par l’État.`
  return `${labelPart} Cette certification est indispensable pour bénéficier des aides publiques à la rénovation énergétique : MaPrimeRénov’, Certificats d’Économies d’Énergie (CEE), éco-prêt à taux zéro et TVA réduite à 5,5 %. Sans artisan RGE, aucune de ces aides n’est mobilisable. Tous les professionnels listés ci-dessous à ${villeName} ont une qualification vérifiée et toujours active, sourcée directement depuis le registre officiel ADEME / France Rénov’.`
}
