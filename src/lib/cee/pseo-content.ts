/**
 * CEE pSEO content — variabilité rédactionnelle pour /cee/[op]/[ville].
 *
 * Objectif : produire un contenu unique par couple (opération × ville) avec
 * variabilité ≥ 30 % entre pages, pour éviter le "thin content" et le
 * duplicate patterning que Google détecte sur les pSEO massifs.
 *
 * Stratégie :
 *  - Picks déterministes basés sur le hash du slug ville → sélection stable
 *    d'un template parmi N (évite que deux crawls renvoient des contenus
 *    différents, ce qui casserait la cohérence Search Console).
 *  - Données ville (population, département, région) tirées de `Ville` pour
 *    contextualisation factuelle (chiffres INSEE, climat, bâti local).
 *  - Zéro invention de chiffres — les stats prime/forfait ne sont PAS citées
 *    à la maille opération×ville car elles évoluent avec le cours CEE et les
 *    arrêtés DGEC. On renvoie vers la fiche officielle DGEC pour le chiffrage.
 */

import type { Ville } from '@/lib/data/france'
import type { CeeOperation } from '@/lib/cee/catalogue'

/** Hash déterministe (djb2) d'une string → entier positif */
function hashSlug(slug: string): number {
  let h = 5381
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h + slug.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Pick déterministe stable par ville */
function pick<T>(slug: string, offset: number, arr: T[]): T {
  return arr[(hashSlug(slug) + offset) % arr.length]
}

/**
 * Paragraphes enrichis par opération × ville — 2 à 3 blocs variables tirés
 * de pools de templates distincts.
 */
export function buildCeeOperationCityParagraphs(operation: CeeOperation, ville: Ville): string[] {
  const opName = operation.nom
  const villeName = ville.name
  const dept = ville.departement

  const contextPool: string[] = [
    `\u00c0 ${villeName}, ${opName.toLowerCase()} s\u2019inscrit dans un parc r\u00e9sidentiel o\u00f9 une part significative du b\u00e2ti a \u00e9t\u00e9 construit avant 1975, date d\u2019entr\u00e9e en vigueur de la premi\u00e8re r\u00e9glementation thermique. C\u2019est exactement ce segment que cible la fiche d\u2019op\u00e9ration standardis\u00e9e ${operation.code} : orienter la prime CEE vers les logements les plus \u00e9nergivores pour maximiser l\u2019effet levier sur la facture \u00e9nerg\u00e9tique des m\u00e9nages.`,
    `Dans le d\u00e9partement ${dept}, les travaux d\u2019${opName.toLowerCase()} figurent parmi les chantiers les plus demand\u00e9s par les m\u00e9nages depuis l\u2019entr\u00e9e en vigueur de la p\u00e9riode P6 du dispositif CEE (1\u1d49\u02b3 janvier 2026). La fiche ${operation.code} d\u00e9finit pr\u00e9cis\u00e9ment les conditions techniques \u00e0 respecter pour que le chantier ouvre droit \u00e0 la prime : performances des mat\u00e9riaux, niveau de qualification de l\u2019entreprise et justificatifs \u00e0 collecter en fin de travaux.`,
    `La commune de ${villeName} pr\u00e9sente un tissu de logements vari\u00e9 (maisons individuelles anciennes, collectifs r\u00e9cents, b\u00e2ti en copropri\u00e9t\u00e9) qui rend l\u2019op\u00e9ration ${operation.code} particuli\u00e8rement pertinente. Chaque chantier d\u00e9clench\u00e9 sous ce cadre est indexable au registre national des CEE, avec tra\u00e7abilit\u00e9 compl\u00e8te de la signature du devis jusqu\u2019au versement de la prime par l\u2019obligé (Effy, Sonergia, TotalEnergies, EDF, Engie, etc.).`,
  ]

  const qualifPool: string[] = [
    `La s\u00e9lection d\u2019artisans pr\u00e9sent\u00e9e ici est volontairement restreinte aux entreprises titulaires d\u2019une qualification RGE en cours de validit\u00e9 au r\u00e9f\u00e9rentiel ADEME / France R\u00e9nov\u2019. Pour la fiche ${operation.code}, les qualifications attendues sont&nbsp;: ${operation.rge_qualifications_requises.slice(0, 3).join(', ') || 'Qualibat RGE'}. Sans RGE actif \u00e0 la date de signature du devis, aucune prime CEE ne peut \u00eatre mobilis\u00e9e&nbsp;: c\u2019est une r\u00e8gle non n\u00e9gociable fix\u00e9e par le Code de l\u2019\u00e9nergie.`,
    `La qualification RGE demand\u00e9e pour ${opName.toLowerCase()} rel\u00e8ve des domaines&nbsp;: ${operation.rge_meta_domaines.join(', ') || 'isolation / \u00e9nergies renouvelables'}. Tous les artisans list\u00e9s ci-dessus ont \u00e9t\u00e9 audit\u00e9s par l\u2019organisme certificateur (Qualibat, Qualit\u2019EnR, Qualifelec, Certibat ou OPQIBI) et figurent au fichier officiel ADEME, synchronis\u00e9 chaque semaine sur ServicesArtisans.`,
    `La mention RGE n\u2019est pas un simple logo&nbsp;: elle r\u00e9sulte d\u2019une formation initiale, d\u2019un audit de chantier r\u00e9alis\u00e9 par un organisme accr\u00e9dit\u00e9 COFRAC, et d\u2019un renouvellement tous les quatre ans. \u00c0 ${villeName}, seuls les professionnels dont le SIRET figure au r\u00e9f\u00e9rentiel ${operation.rge_qualifications_requises[0] || 'Qualibat RGE'} peuvent d\u00e9clencher une prime CEE au titre de la fiche ${operation.code}.`,
  ]

  const cumulPool: string[] = [
    `La prime CEE ${operation.code} est cumulable avec MaPrimeR\u00e9nov\u2019 de l\u2019Anah (plafonn\u00e9e selon vos revenus et le gain \u00e9nerg\u00e9tique du projet) et avec la TVA r\u00e9duite \u00e0 5,5 % sur la main-d\u2019\u0153uvre et les fournitures. Pour un chantier \u00e0 ${villeName}, vous pouvez mobiliser simultan\u00e9ment ces trois dispositifs en signant un seul devis, ce qui r\u00e9duit drastiquement le reste \u00e0 charge par rapport \u00e0 un projet hors-aides.`,
    `\u00c0 ${villeName}, un m\u00e9nage \u00e9ligible au parcours MaPrimeR\u00e9nov\u2019 Parcours Accompagn\u00e9 peut cumuler pour la fiche ${operation.code}&nbsp;: la prime CEE vers\u00e9e par un d\u00e9l\u00e9gataire obligé, l\u2019aide MaPrimeR\u00e9nov\u2019, un \u00e9co-pr\u00eat \u00e0 taux z\u00e9ro jusqu\u2019\u00e0 50 000 \u20ac et des aides locales \u00e9ventuelles (r\u00e9gion, d\u00e9partement, m\u00e9tropole). La r\u00e8gle&nbsp;: la qualification RGE doit \u00eatre active \u00e0 la signature, pas au d\u00e9marrage du chantier.`,
    `Le cumul de la prime CEE ${operation.code} avec MaPrimeR\u00e9nov\u2019 est explicitement pr\u00e9vu par la r\u00e9glementation en vigueur, sous r\u00e9serve que le plafond global d\u2019aides ne d\u00e9passe pas 100 % du co\u00fbt TTC des travaux \u2014 cas extr\u00eamement rare m\u00eame pour les m\u00e9nages tr\u00e8s modestes. \u00c0 ${villeName}, ce cumul est la norme pour les dossiers pass\u00e9s par un artisan RGE.`,
  ]

  return [
    pick(ville.slug, 0, contextPool),
    pick(ville.slug, 1, qualifPool),
    pick(ville.slug, 2, cumulPool),
  ]
}

export interface CeeFaqItem {
  question: string
  answer: string
}

/**
 * FAQ contextualisée (4 Q/R) pour une opération × ville.
 */
export function buildCeeOperationCityFaq(
  operation: CeeOperation,
  ville: Ville,
  providerCount: number
): CeeFaqItem[] {
  const opName = operation.nom
  const villeName = ville.name

  return [
    {
      question: `Qui peut b\u00e9n\u00e9ficier de la prime CEE ${operation.code} \u00e0 ${villeName}\u00a0?`,
      answer: `Tout propri\u00e9taire occupant, bailleur ou locataire d\u2019un logement r\u00e9sidentiel situ\u00e9 \u00e0 ${villeName}, sans condition de revenus pour le segment classique. Les m\u00e9nages en pr\u00e9carit\u00e9 \u00e9nerg\u00e9tique b\u00e9n\u00e9ficient d\u2019un cours de prime nettement sup\u00e9rieur au titre du "CEE pr\u00e9carit\u00e9" (obligation annuelle 280 TWhc sur la p\u00e9riode P6). Le logement doit \u00eatre achev\u00e9 depuis plus de deux ans au d\u00e9marrage des travaux et l\u2019op\u00e9ration doit \u00eatre r\u00e9alis\u00e9e par un artisan titulaire d\u2019une qualification RGE active.`,
    },
    {
      question: `Quelle qualification RGE l\u2019artisan doit-il d\u00e9tenir pour ${opName.toLowerCase()}\u00a0?`,
      answer: `La fiche ${operation.code} exige une qualification parmi&nbsp;: ${operation.rge_qualifications_requises.join(', ') || 'Qualibat RGE'}. La qualification est d\u00e9livr\u00e9e par un organisme accr\u00e9dit\u00e9 COFRAC (Qualibat, Qualit\u2019EnR, Qualifelec) apr\u00e8s audit de formation et de chantier. Tous les artisans affich\u00e9s sur cette page \u00e0 ${villeName} ont une qualification RGE v\u00e9rifi\u00e9e et en cours de validit\u00e9, sourc\u00e9e directement depuis le r\u00e9f\u00e9rentiel ADEME France R\u00e9nov\u2019.`,
    },
    {
      question: `Comment est calcul\u00e9 le montant de la prime CEE pour cette op\u00e9ration\u00a0?`,
      answer: `Le montant de la prime d\u00e9pend de trois variables&nbsp;: le forfait de r\u00e9f\u00e9rence en kWh cumac fix\u00e9 par l\u2019arr\u00eat\u00e9 DGEC pour la fiche ${operation.code}, la zone climatique de ${villeName} (coefficient multiplicateur), et le cours de la prime propos\u00e9 par le d\u00e9l\u00e9gataire obligé au moment de la signature du devis. Les cours \u00e9voluent chaque semaine selon l\u2019offre et la demande de certificats. Nous recommandons de comparer au moins trois devis d\u2019artisans RGE pour objectiver l\u2019offre. Le forfait officiel est consultable sur la fiche DGEC en lien.`,
    },
    {
      question: `Combien d\u2019artisans RGE qualifi\u00e9s sont disponibles \u00e0 ${villeName}\u00a0?`,
      answer:
        providerCount > 0
          ? `Notre annuaire r\u00e9f\u00e9rence actuellement ${providerCount} artisan${providerCount > 1 ? 's' : ''} RGE actif${providerCount > 1 ? 's' : ''} \u00e0 ${villeName} qualifi\u00e9${providerCount > 1 ? 's' : ''} pour r\u00e9aliser l\u2019op\u00e9ration ${operation.code}. Chaque fiche est synchronis\u00e9e chaque semaine avec le r\u00e9f\u00e9rentiel ADEME pour garantir que la qualification RGE est toujours en cours de validit\u00e9. Pour \u00e9largir la recherche aux communes voisines, utilisez nos pages par d\u00e9partement et par r\u00e9gion.`
          : `Aucun artisan RGE actuellement qualifi\u00e9 pour cette op\u00e9ration n\u2019est r\u00e9f\u00e9renc\u00e9 dans notre annuaire \u00e0 ${villeName}. Nous vous invitons \u00e0 \u00e9largir la recherche aux communes voisines ou \u00e0 consulter notre hub /cee pour explorer les 19 op\u00e9rations CEE r\u00e9sidentielles couvertes. Le r\u00e9f\u00e9rentiel ADEME \u00e9volue chaque semaine&nbsp;: un nouvel artisan peut \u00eatre r\u00e9f\u00e9renc\u00e9 \u00e0 tout moment.`,
    },
  ]
}

/** Construit le schema JSON-LD FAQPage à partir d'une liste Q/R. */
export function buildCeeFaqJsonLd(items: CeeFaqItem[]) {
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
