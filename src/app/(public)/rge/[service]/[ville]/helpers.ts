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

/** Tronque un title à ~60 chars pour Google (Sprint 0.1 : 41 → 60). */
export function truncateTitle(title: string, maxLen = 60): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

/**
 * Sérialise du JSON pour injection dans une balise `<script type="application/ld+json">`
 * en neutralisant les caractères qui pourraient casser la balise et permettre
 * une XSS : `<`, `>`, `&` (cf. audit security Sprint 0.1).
 *
 * Aligné sur le helper interne de `src/components/JsonLd.tsx`.
 */
export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * Feature flag Sprint 0.1 ULTRA DOMINATION SEO Phase 0.
 * Désactivable explicitement via `RGE_UPGRADE_V2=false` (variable serveur uniquement).
 * Toute autre valeur (true / unset) → ON par défaut.
 * Note : pas de préfixe NEXT_PUBLIC_ — lu uniquement côté Server Component.
 */
export function isRgeUpgradeV2(): boolean {
  return process.env.RGE_UPGRADE_V2 !== 'false'
}

/** "avril 2026" — date dynamique pour H1 + headline Article. */
export function currentMonthYearFr(): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())
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
