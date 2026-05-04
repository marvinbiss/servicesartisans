/**
 * Tier 20 — Sources d'autorité officielles pour les Article schemas YMYL.
 *
 * Pourquoi : Google QRG section 3.4 (trustworthiness) reconnaît explicitement
 * le linking sortant vers des sources autoritaires (.gouv.fr, ANAH, ADEME,
 * Légifrance) comme un signal positif. Les Article Schema.org peuvent émettre
 * ces sources via le champ `citation` (Schema.org Thing | CreativeWork | URL).
 *
 * AI Overviews + Bing AI utilisent ces signaux pour valider l'expertise
 * éditoriale et privilégier les pages qui s'appuient sur des sources
 * publiques officielles plutôt que sur du contenu auto-référencé.
 *
 * Convention : chaque export est un tableau de strings (URLs absolues)
 * passable directement comme `citation` dans Schema.org Article. Pour les
 * pages avec des sources éditoriales spécifiques (ex. fiche CEE qui pointe
 * vers `operation.url_fiche_officielle`), on concatène : `[...specifique,
 * ...MAPRIMERENOV_AUTHORITY_CITATIONS]`.
 */

/**
 * Sources autorité MaPrimeRénov' (ANAH, France Rénov').
 */
export const MAPRIMERENOV_AUTHORITY_CITATIONS: readonly string[] = [
  'https://www.maprimerenov.gouv.fr/',
  'https://france-renov.gouv.fr/aides/maprimerenov',
  'https://www.anah.gouv.fr/proprietaires/proprietaires-occupants',
  'https://www.service-public.fr/particuliers/vosdroits/F35083',
] as const

/**
 * Sources autorité Certificats d'économies d'énergie (CEE).
 */
export const CEE_AUTHORITY_CITATIONS: readonly string[] = [
  'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
  'https://france-renov.gouv.fr/aides/cee',
  'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985322/',
  'https://www.service-public.fr/particuliers/vosdroits/F1985',
] as const

/**
 * Sources autorité label RGE (Reconnu Garant de l'Environnement).
 */
export const RGE_AUTHORITY_CITATIONS: readonly string[] = [
  'https://france-renov.gouv.fr/annuaire-rge',
  'https://www.ademe.fr/professionnels/professionnels-batiment/qualifications-rge',
  'https://www.qualibat.com/',
  'https://www.qualit-enr.org/',
] as const

/**
 * Sources autorité éco-PTZ (Prêt à Taux Zéro travaux).
 */
export const ECO_PTZ_AUTHORITY_CITATIONS: readonly string[] = [
  'https://www.service-public.fr/particuliers/vosdroits/F19905',
  'https://france-renov.gouv.fr/aides/eco-ptz',
  'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044881907/',
] as const

/**
 * Sources autorité TVA réduite à 5,5 % (rénovation énergétique).
 */
export const TVA_REDUITE_AUTHORITY_CITATIONS: readonly string[] = [
  'https://www.service-public.fr/particuliers/vosdroits/F31390',
  'https://bofip.impots.gouv.fr/bofip/4441-PGP.html',
] as const

/**
 * Sources autorité Pompe à chaleur (réglementation, aides, qualifications).
 */
export const PAC_AUTHORITY_CITATIONS: readonly string[] = [
  'https://france-renov.gouv.fr/travaux/changer-chaudiere/pompe-chaleur',
  'https://www.qualit-enr.org/qualipac/',
  'https://www.ademe.fr/particuliers-eco-citoyens/maison/economies-denergie/quel-systeme-chauffage-choisir',
] as const

/**
 * Sources autorité Coup de pouce CEE (chartes DGEC).
 */
export const COUP_DE_POUCE_AUTHORITY_CITATIONS: readonly string[] = [
  'https://www.ecologie.gouv.fr/coup-pouce-economies-denergie',
  'https://france-renov.gouv.fr/aides/coup-de-pouce-economies-denergie',
] as const

/**
 * Sources autorité Isolation (DTU 45.x, ITE/ITI, Cstb).
 */
export const ISOLATION_AUTHORITY_CITATIONS: readonly string[] = [
  'https://france-renov.gouv.fr/travaux/isolation',
  'https://www.ademe.fr/particuliers-eco-citoyens/maison/economies-denergie/isolation',
  'https://www.cstb.fr/',
] as const

/**
 * Catalogue par topic clé : permet à un caller de demander les citations
 * autorité par mot-clé sans hardcoder l'URL liste à chaque page.
 */
export const AUTHORITY_CITATIONS_BY_TOPIC: Readonly<Record<string, readonly string[]>> = {
  maprimerenov: MAPRIMERENOV_AUTHORITY_CITATIONS,
  cee: CEE_AUTHORITY_CITATIONS,
  rge: RGE_AUTHORITY_CITATIONS,
  'eco-ptz': ECO_PTZ_AUTHORITY_CITATIONS,
  tva: TVA_REDUITE_AUTHORITY_CITATIONS,
  pac: PAC_AUTHORITY_CITATIONS,
  'coup-de-pouce': COUP_DE_POUCE_AUTHORITY_CITATIONS,
  isolation: ISOLATION_AUTHORITY_CITATIONS,
} as const

/**
 * Retourne les citations autorité pour un ou plusieurs topics, dédupliquées.
 */
export function getAuthorityCitations(topics: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const topic of topics) {
    const list = AUTHORITY_CITATIONS_BY_TOPIC[topic]
    if (!list) continue
    for (const url of list) {
      if (!seen.has(url)) {
        seen.add(url)
        out.push(url)
      }
    }
  }
  return out
}
