/**
 * Helpers partagés Sprint ULTRA DOMINATION SEO Phase 0.
 *
 * Ces helpers étaient à l'origine locaux à `src/app/(public)/rge/[service]/[ville]/helpers.ts`
 * (Sprint 0.1). Sprint 0.2 les promeut au rang de module partagé pour pouvoir
 * être réutilisés sur :
 *   - /villes/[ville]            (5 000 pages)
 *   - /services/[service]        (46 hubs)
 *   - autres templates pSEO à venir
 *
 * Aucune logique server-side, zéro dépendance Next.js — purement déterministe
 * et testable.
 */
export {
  truncateTitle,
  safeJsonStringify,
  isRgeUpgradeV2 as isSeoUpgradeV2,
  currentMonthYearFr,
} from '@/app/(public)/rge/[service]/[ville]/helpers'
