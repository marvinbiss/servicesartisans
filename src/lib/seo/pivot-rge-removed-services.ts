/**
 * src/lib/seo/pivot-rge-removed-services.ts
 * ------------------------------------------
 * Liste centralisée des slugs métiers retirés lors du pivot full RGE
 * du 2026-05-03. Source unique de vérité importée depuis :
 *   - src/app/sitemap.ts (filtre des URLs émises)
 *   - src/lib/seo/gone-paths.ts (redirect 301 vers /renovation-energetique)
 *   - src/middleware.ts (potentiel pour future redirection edge)
 *
 * Repositionnement : « Le premier annuaire 100% artisans RGE certifiés ».
 * Les 4 métiers commodity (serrurier, vitrier, carreleur, cuisiniste) ne
 * peuvent pas obtenir de qualification RGE (Reconnu Garant de l'Environnement).
 * Volume search perdu ~50K/mois mais positionnement narratif renforcé.
 *
 * Ces slugs sont conservés dans `src/lib/data/trade-content.ts` comme matière
 * pour les redirects 301 (cohérence sémantique pour Google) mais ne sont plus
 * émis dans aucun sitemap ni indexés.
 *
 * Pour réintégrer un slug : retirer de ce Set ET vérifier qu'il existe dans
 * src/lib/data/france.ts (services array).
 */

export const PIVOT_RGE_REMOVED_SLUGS: ReadonlySet<string> = new Set([
  'serrurier',
  'vitrier',
  'carreleur',
  'cuisiniste',
])

/**
 * Helper : true si le slug a été retiré par le pivot full RGE 2026-05-03.
 * Utiliser dans tout filtre `.filter(slug => !isRemovedByRgePivot(slug))`.
 */
export function isRemovedByRgePivot(slug: string): boolean {
  return PIVOT_RGE_REMOVED_SLUGS.has(slug)
}

/**
 * Métiers où un artisan RGE peut légitimement prendre l'urgence.
 *
 * Décision Marvin 2026-05-03 (revert partiel Phase 2) : rouvrir /urgence/*
 * uniquement pour les trades dont un artisan RGE certifié peut couvrir
 * l'intervention sans casser le narratif « 100% RGE » :
 *   - plombier      → fuite/dégât des eaux/chauffe-eau (RGE Qualibat 5311)
 *   - chauffagiste  → panne chaudière/PAC, fuite gaz (RGE QualiPAC, Qualibat 5911)
 *   - electricien   → coupure, court-circuit, IRVE (RGE Qualifelec)
 *   - couvreur      → fuite toiture, tempête, tuiles (RGE Qualibat 7113)
 *   - climaticien   → panne clim, fluide frigorigène (RGE QualiPAC)
 *
 * Les autres slugs urgence (peintre, maçon, menuisier…) ne sont pas des
 * urgences réalistes et leur version /urgence/{slug}/* reste noindex +
 * hors sitemap.
 */
export const URGENCE_RGE_COMPATIBLE_SLUGS: ReadonlySet<string> = new Set([
  'plombier',
  'chauffagiste',
  'electricien',
  'couvreur',
  'climaticien',
])

/**
 * Helper : true si le slug peut conserver une URL `/urgence/{slug}/*`
 * indexable + listée au sitemap après le pivot RGE.
 */
export function isUrgenceRgeCompatible(slug: string): boolean {
  return URGENCE_RGE_COMPATIBLE_SLUGS.has(slug)
}
