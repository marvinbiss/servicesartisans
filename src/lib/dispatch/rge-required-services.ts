/**
 * Services qui REQUIÈRENT un artisan RGE pour le dispatch.
 *
 * Mirror TS de la colonne `algorithm_config.rge_required_services` (migration
 * 498). Tout changement ici doit être répliqué en SQL via UPDATE :
 *
 *   UPDATE public.algorithm_config
 *   SET rge_required_services = ARRAY[...]::TEXT[];
 *
 * Critère d'inclusion : un client ne peut PAS bénéficier de MaPrimeRénov' /
 * CEE / aides ANAH sur ce service sans que l'artisan soit RGE-valide. Donc
 * envoyer le lead à un non-RGE = trahir la promesse "100% RGE" + condamner
 * le dossier d'aide.
 *
 * Critère d'exclusion : services hybrides où la présence d'aide dépend du
 * type d'opération précis (chauffagiste = dépannage chaudière OU pose PAC).
 * Pour ces services-là, le caller doit passer `ceeEligible` à `dispatchLead`
 * en se basant sur le contexte du formulaire, pas sur le slug.
 */

export const RGE_REQUIRED_SERVICES = [
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffe-eau-thermodynamique',
  'audit-energetique',
  'renovation-energetique',
  'ventilation',
  'fenetres',
  'borne-recharge',
] as const

export type RgeRequiredService = (typeof RGE_REQUIRED_SERVICES)[number]

const RGE_REQUIRED_SET: ReadonlySet<string> = new Set(RGE_REQUIRED_SERVICES)

/**
 * True si le service exige un artisan RGE par construction (aide d'État
 * conditionnée). Utilisé côté form pour décider :
 *  - d'afficher un disclaimer "tous nos artisans sont RGE certifiés",
 *  - de pré-cocher `ceeEligible` dans la requête API,
 *  - de bloquer la création d'un lead si aucun RGE n'est dispo (UX premium).
 *
 * Le dispatch SQL fait le filtrage final ; cette fonction est purement
 * informationnelle côté client.
 */
export function isRgeRequiredService(slug: string | null | undefined): boolean {
  if (!slug) return false
  return RGE_REQUIRED_SET.has(slug)
}
