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
