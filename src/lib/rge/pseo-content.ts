/**
 * pSEO content helpers for RGE routes.
 *
 * Generates unique, city-varied copy and FAQ entries for:
 *   - /artisans-rge/[ville]          (generic RGE by city)
 *   - /rge/[service]/[ville]         (service x city)
 *
 * Design goals:
 *  - Zero duplicate content : each paragraph injects ville.name, count,
 *    departement, "grande ville vs commune" fragment, rang top cities,
 *    periods (hiver/rentrée) pour varier naturellement.
 *  - Fail-open : si les données sont absentes (build, DB down), on retourne
 *    un fallback statique soigné.
 *  - Pas d'appel DB, pas d'IO : helpers purs, sérialisables par Next ISR.
 */

import type { Ville } from '@/lib/data/france'
import { villes } from '@/lib/data/france'
import { RGE_QUALIFICATION_LABELS, type RgeAllowedService } from '@/lib/rge/service-city-listings'

export interface RgeFaqItem {
  question: string
  answer: string
}

/** Retourne le rang (1-based) d'une ville dans le classement population, ou null. */
function getVilleRank(villeSlug: string): number | null {
  const idx = villes.findIndex((v) => v.slug === villeSlug)
  return idx === -1 ? null : idx + 1
}

/** Tier d'une ville : metropole (top 10), grande (top 50), moyenne (top 250), commune. */
export type VilleTier = 'metropole' | 'grande' | 'moyenne' | 'commune'

function getVilleTier(villeSlug: string): VilleTier {
  const rank = getVilleRank(villeSlug)
  if (rank === null) return 'commune'
  if (rank <= 10) return 'metropole'
  if (rank <= 50) return 'grande'
  if (rank <= 250) return 'moyenne'
  return 'commune'
}

/** Formatte un count en FR avec gestion du pluriel sur "artisan". */
function fmtCount(count: number): string {
  return count.toLocaleString('fr-FR')
}

/**
 * Génère 3-4 paragraphes uniques pour /artisans-rge/[ville].
 * Variation : tier ville, count, departement, mention saisonnière, rang.
 */
export function buildGenericRgeParagraphs(ville: Ville, count: number): string[] {
  const tier = getVilleTier(ville.slug)
  const rank = getVilleRank(ville.slug)
  const countLabel = count > 0 ? fmtCount(count) : 'plusieurs'
  const artisanWord = count > 1 ? 'artisans' : 'artisan'

  // Paragraphe 1 — contexte ville + enjeu énergétique
  const p1Tier: Record<VilleTier, string> = {
    metropole: `${ville.name} fait partie des dix plus grandes agglomérations françaises (${ville.region}) : le parc immobilier y concentre à la fois des copropriétés anciennes énergivores et des maisons individuelles en périphérie, deux cibles prioritaires du plan national de rénovation.`,
    grande: `${ville.name}, préfecture ou sous-préfecture du département ${ville.departement} (${ville.region}), présente un tissu résidentiel mixte où la rénovation énergétique est devenue un enjeu économique autant qu'environnemental.`,
    moyenne: `Ville moyenne du département ${ville.departement} (${ville.region}), ${ville.name} compte un parc de logements dont une part significative a été construite avant la première réglementation thermique de 1974, avec des besoins concrets en isolation et en remplacement des chaudières anciennes.`,
    commune: `Commune du département ${ville.departement} (${ville.region}), ${ville.name} est concernée comme toute la France par l'interdiction progressive de location des passoires thermiques (classes F et G au DPE) depuis 2025 — un calendrier qui accélère les projets de rénovation chez les propriétaires.`,
  }

  // Paragraphe 2 — utilité du label RGE (varie selon count + tier)
  const p2Count =
    count >= 100
      ? `Avec ${countLabel} ${artisanWord} RGE actifs recensés à ${ville.name}, la densité locale de professionnels certifiés permet de comparer plusieurs devis sans sortir de la commune et de raccourcir les délais d'intervention.`
      : count >= 20
        ? `Les ${countLabel} ${artisanWord} RGE actifs à ${ville.name} couvrent les principaux corps d'état énergétiques : pompe à chaleur, isolation, menuiseries, solaire et chauffage bois.`
        : count > 0
          ? `Même si ${ville.name} ne compte que ${countLabel} ${artisanWord} RGE recensés en direct, les professionnels certifiés des communes voisines interviennent couramment sur l'ensemble du bassin de vie.`
          : `Le nombre d'artisans RGE référencés à ${ville.name} varie au fil des renouvellements de qualifications auprès de Qualibat, Qualit'EnR et Qualifelec — notre base est synchronisée chaque semaine depuis l'ADEME.`

  const p2 = `${p2Count} Choisir un artisan RGE n'est pas une option : c'est la condition réglementaire fixée par l'État pour débloquer MaPrimeRénov', les Certificats d'Économies d'Énergie (CEE), l'éco-prêt à taux zéro et la TVA réduite à 5,5 % sur la main d'œuvre et les matériaux.`

  // Paragraphe 3 — aides disponibles (détaillées)
  const p3 = `À ${ville.name} comme partout en France, un foyer aux revenus "bleus" (très modestes) peut cumuler MaPrimeRénov' Sérénité (jusqu'à 50 % du montant TTC des travaux) avec les primes CEE versées par les délégataires (Effy, Sonergia, TotalEnergies, Engie). Pour un remplacement de chaudière fioul par une pompe à chaleur air/eau, l'addition des aides dépasse fréquemment 10 000 € sur un projet de 18 000 €. L'éco-PTZ permet ensuite de financer le reste à charge sans intérêts, jusqu'à 50 000 € remboursables sur 20 ans.`

  // Paragraphe 4 — comment vérifier / variation saisonnière
  const p4Rank =
    rank && rank <= 20
      ? `Dans les grandes agglomérations comme ${ville.name}, les carnets de commandes des artisans RGE se tendent fortement entre octobre et février — période où la demande d'audits énergétiques et de remplacements de chaudières culmine. Anticiper sa demande dès le printemps garantit un chantier réalisé avant l'hiver suivant.`
      : `Les artisans RGE du secteur de ${ville.name} sont particulièrement sollicités à l'automne, au moment où les propriétaires anticipent l'hiver. Déposer ses demandes d'aides en amont (MaPrimeRénov' et CEE) permet d'éviter la bousculade de fin d'année.`

  const p4 = `${p4Rank} Avant de signer un devis, vérifiez la validité du label via l'annuaire officiel France Rénov' ou directement sur le site de l'organisme certificateur (Qualibat, Qualit'EnR, Qualifelec, Certibat) : une qualification RGE est valable 4 ans et doit être suivie d'un audit tous les 2 ans. Un artisan dont le label est expiré ou suspendu ne permet pas d'obtenir les aides.`

  return [p1Tier[tier], p2, p3, p4]
}

/**
 * FAQ générique pour /artisans-rge/[ville] (4-5 questions).
 * Contextualisé via count + ville + departement.
 */
export function buildGenericRgeFaq(ville: Ville, count: number): RgeFaqItem[] {
  const countLabel = count > 0 ? fmtCount(count) : 'Plusieurs'
  const artisanWord = count > 1 ? 'artisans' : 'artisan'

  return [
    {
      question: `Combien d'artisans RGE y a-t-il à ${ville.name} ?`,
      answer:
        count > 0
          ? `Notre base référence actuellement ${countLabel} ${artisanWord} RGE actif${count > 1 ? 's' : ''} à ${ville.name}, toutes spécialités confondues (pompe à chaleur, isolation, solaire, menuiseries, chauffage bois…). Les données sont synchronisées chaque semaine depuis le registre officiel ADEME publié sur data.gouv.fr.`
          : `Le nombre d'artisans RGE à ${ville.name} évolue en permanence au rythme des renouvellements de qualifications. Notre base est synchronisée chaque semaine depuis le registre ADEME. Si aucun résultat n'apparaît, élargissez la recherche au département ${ville.departement} ou consultez les communes voisines.`,
    },
    {
      question: `Qu'est-ce que le label RGE et est-il obligatoire ?`,
      answer: `Le label RGE (Reconnu Garant de l'Environnement) est délivré par des organismes accrédités par le COFRAC — Qualibat, Qualit'EnR, Qualifelec et Certibat. Il n'est pas obligatoire pour exercer, mais il est la condition réglementaire fixée par l'État pour que vos travaux soient éligibles à MaPrimeRénov', aux CEE, à l'éco-PTZ et à la TVA à 5,5 %. Sans RGE, aucune de ces aides n'est mobilisable.`,
    },
    {
      question: `Quelles aides puis-je obtenir avec un artisan RGE à ${ville.name} en 2026 ?`,
      answer: `À ${ville.name} (${ville.departement}), un particulier peut cumuler en 2026 : MaPrimeRénov' (forfait selon revenus et travaux, jusqu'à 11 000 € pour une PAC air/eau en ménage "bleu"), les primes CEE des délégataires (Effy, Sonergia, TotalEnergies), l'éco-PTZ jusqu'à 50 000 €, la TVA réduite à 5,5 % et les aides locales éventuelles de la région ${ville.region} ou du département.`,
    },
    {
      question: `Comment vérifier qu'un artisan est bien certifié RGE ?`,
      answer: `Trois moyens fiables : (1) consulter l'annuaire officiel France Rénov' sur france-renov.gouv.fr (moteur "trouver un professionnel RGE"), (2) vérifier directement sur le site de l'organisme certificateur (qualibat.com, qualit-enr.org, qualifelec.fr), (3) demander à l'artisan son attestation RGE nominative avec le numéro de qualification et la date de validité. Une qualification RGE est valable 4 ans avec un audit tous les 2 ans.`,
    },
    {
      question: `Que faire si aucun artisan RGE n'est disponible dans ma ville ?`,
      answer: `Les artisans RGE d'un bassin de vie interviennent couramment dans un rayon de 30 à 50 km autour de leur siège. Si aucun résultat n'apparaît à ${ville.name}, élargissez au département ${ville.departement} ou aux principales villes voisines. Les qualifications RGE étant attachées à l'entreprise et non à la commune, un artisan domicilié à 40 km reste parfaitement éligible pour vos travaux et vos demandes d'aides.`,
    },
  ]
}

/**
 * Construit un JSON-LD FAQPage schema.org à partir d'une liste Q/R.
 */
export function buildFaqJsonLd(items: RgeFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  }
}

/* =========================================================================
 * service x ville  (/rge/[service]/[ville])
 * ========================================================================= */

/**
 * Fragments métier pour les 2-3 paragraphes enrichis.
 * Chaque entrée doit rester factuelle (aides réelles, types d'équipement réels).
 */
const SERVICE_COPY: Record<
  string,
  {
    intro: string // mentionne types, technologies
    aides: string // aides spécifiques 2026
  }
> = {
  'pompe-a-chaleur': {
    intro: `Trois grandes familles de pompes à chaleur se partagent le marché résidentiel : l'air/eau (la plus fréquente, raccordée à un circuit de radiateurs ou un plancher chauffant), l'air/air (climatisation réversible, pas éligible à MaPrimeRénov' en rénovation), et la géothermie sur sondes verticales (la plus performante mais la plus coûteuse à installer). La qualification QualiPAC délivrée par Qualit'EnR couvre ces trois technologies et exige une formation initiale, un chantier de référence et un audit sur site tous les deux ans.`,
    aides: `En 2026, l'installation d'une pompe à chaleur air/eau par un artisan QualiPAC donne accès à MaPrimeRénov' (forfait de 3 000 € à 11 000 € selon revenus), à la prime CEE "Coup de pouce chauffage" (jusqu'à 5 000 € supplémentaires pour le remplacement d'une chaudière fioul ou gaz), à l'éco-PTZ et à la TVA à 5,5 %. Pour un ménage "bleu" remplaçant une chaudière fioul, le reste à charge sur un projet de 18 000 € tombe fréquemment sous les 3 000 €.`,
  },
  'panneaux-solaires': {
    intro: `La qualification QualiPV couvre l'installation photovoltaïque (production d'électricité) et la QualiSol le solaire thermique (production d'eau chaude sanitaire). Les deux sont délivrées par Qualit'EnR. Une installation résidentielle typique de 3 kWc produit environ 3 000 à 3 600 kWh/an dans le sud de la France, 2 400 à 2 800 kWh/an dans le nord. L'autoconsommation avec vente du surplus est devenue le modèle économique le plus rentable depuis la baisse du tarif d'achat intégral.`,
    aides: `En 2026, une installation photovoltaïque en autoconsommation par un artisan QualiPV ouvre droit à la prime à l'autoconsommation versée par EDF OA (environ 80 à 380 €/kWc selon la puissance), à un tarif d'achat du surplus fixé trimestriellement par la CRE, et à la TVA à 10 % pour les installations ≤ 3 kWc. Le solaire thermique (chauffe-eau solaire) est quant à lui éligible à MaPrimeRénov' et aux CEE via QualiSol.`,
  },
  'isolation-thermique': {
    intro: `L'isolation représente le premier levier d'économie d'énergie selon l'ADEME : jusqu'à 30 % des déperditions passent par la toiture, 25 % par les murs et 10 % par les planchers bas. Deux approches existent — l'ITI (isolation par l'intérieur), moins coûteuse mais qui réduit la surface habitable, et l'ITE (isolation par l'extérieur), plus performante thermiquement, qui ne traite pas les ponts thermiques des planchers et permet un ravalement simultané. Les deux exigent une qualification Qualibat RGE spécifique.`,
    aides: `Le dispositif "Coup de pouce isolation" CEE a été fortement recentré en 2026 sur les ménages modestes et très modestes, mais l'ITE et l'ITI restent éligibles à MaPrimeRénov' (forfait jusqu'à 75 €/m² pour l'ITE en ménage "bleu"), aux CEE classiques, à l'éco-PTZ et à la TVA à 5,5 %. L'isolation des combles perdus reste le poste le plus rentable avec un temps de retour moyen de 3 à 5 ans.`,
  },
  chauffagiste: {
    intro: `Un chauffagiste RGE peut installer et entretenir des chaudières gaz à condensation, des chaudières bois (bûches, granulés), des systèmes hybrides (PAC + appoint gaz), et des chauffe-eau thermodynamiques. Les qualifications de référence sont Qualibat RGE "chauffage +" et QualiBois délivrée par Qualit'EnR pour les appareils à bois. Depuis le 1er juillet 2022, l'installation de nouvelles chaudières au fioul est interdite dans les logements — seul le remplacement par une solution décarbonée reste éligible aux aides.`,
    aides: `En 2026, un chauffagiste RGE donne accès à MaPrimeRénov' pour la chaudière biomasse (jusqu'à 10 000 € pour les chaudières à granulés en ménage "bleu"), à la prime CEE "Coup de pouce chauffage" pour le remplacement d'une chaudière fioul ou gaz, à l'éco-PTZ et à la TVA 5,5 %. Les chaudières gaz à condensation ne sont plus éligibles à MaPrimeRénov' depuis 2023, mais restent éligibles aux CEE.`,
  },
  electricien: {
    intro: `Un électricien RGE Qualifelec intervient sur trois segments éligibles aux aides : l'installation de bornes de recharge pour véhicules électriques (IRVE), l'installation et le raccordement d'installations photovoltaïques en autoconsommation, et les systèmes de régulation/pilotage de chauffage électrique performants. La mention "IRVE" est une qualification spécifique à la certification Qualifelec, obligatoire pour débloquer le crédit d'impôt de 500 € sur les bornes.`,
    aides: `Une borne de recharge installée par un électricien Qualifelec IRVE ouvre droit au crédit d'impôt de 500 € (75 % du montant plafonné) et, dans certains cas, à une prime CEE Advenir pour les installations en copropriété. Le photovoltaïque en autoconsommation bénéficie de la prime EDF OA et d'un tarif d'achat du surplus.`,
  },
  'renovation-energetique': {
    intro: `La rénovation énergétique globale couvre les projets qui combinent plusieurs gestes simultanés : isolation + changement de chauffage + ventilation. Depuis 2024, l'État concentre ses aides sur ces rénovations d'ampleur via MaPrimeRénov' Parcours accompagné, qui impose un accompagnement par "Mon Accompagnateur Rénov'" (MAR) agréé, un audit énergétique préalable et un gain minimum de 2 classes au DPE.`,
    aides: `Le parcours accompagné MaPrimeRénov' 2026 peut couvrir jusqu'à 80 % du montant des travaux (plafond 70 000 €) pour les ménages "bleus" passant d'une classe F/G à B, cumulable avec les CEE "Rénovation globale". Un accompagnement MAR est obligatoire et pris en charge partiellement par l'aide. L'éco-PTZ "performance globale" peut atteindre 50 000 €.`,
  },
  menuisier: {
    intro: `Le remplacement des fenêtres simple vitrage par du double ou triple vitrage représente environ 10 à 15 % des déperditions thermiques. La qualification Qualibat RGE menuiserie couvre la pose de menuiseries extérieures (fenêtres, portes-fenêtres, portes d'entrée, volets isolants) avec des critères stricts sur le coefficient Uw (≤ 1,3 W/m²·K pour les fenêtres) et sur la mise en œuvre (étanchéité à l'air).`,
    aides: `En 2026, le remplacement de fenêtres par un menuisier RGE donne droit à MaPrimeRénov' (forfait 40 à 100 €/équipement selon revenus), aux CEE, à l'éco-PTZ et à la TVA 5,5 %. La rentabilité pure du changement de fenêtres étant plus faible que l'isolation des combles, c'est un geste qui s'intègre généralement dans une rénovation plus large.`,
  },
  couvreur: {
    intro: `L'isolation des combles perdus et rampants est la première mesure recommandée par l'ADEME pour réduire la facture énergétique. Un couvreur Qualibat RGE "couverture isolation" peut intervenir sur l'isolation par soufflage de ouate, laine de verre ou laine de roche en combles perdus, sur l'isolation entre chevrons ou en sarking pour les combles aménagés, et sur la couverture éco-performante (tuiles photovoltaïques, toiture végétalisée).`,
    aides: `L'isolation de combles perdus reste éligible à MaPrimeRénov' et aux CEE en 2026. Le "Coup de pouce isolation" a été recentré sur les ménages très modestes, mais les forfaits CEE classiques demeurent pour tous les revenus. La TVA à 5,5 % s'applique à la main d'œuvre et aux matériaux, et l'éco-PTZ peut financer le reste à charge.`,
  },
  zingueur: {
    intro: `Un zingueur RGE peut intervenir sur la couverture métallique (zinc, aluminium, acier), l'étanchéité toiture-terrasse et l'isolation thermique de toiture, avec une qualification Qualibat RGE couverture. Les travaux d'isolation par sarking (par l'extérieur de la charpente) sont particulièrement efficaces pour les combles aménagés car ils ne sacrifient pas la hauteur sous plafond.`,
    aides: `Tous les travaux d'isolation de toiture menés par un zingueur Qualibat RGE couverture sont éligibles à MaPrimeRénov', aux CEE, à l'éco-PTZ et à la TVA 5,5 %, à condition de respecter les résistances thermiques minimales imposées par l'arrêté du 30 mars 2009 (R ≥ 7 m²·K/W pour les combles perdus, R ≥ 6 en rampants).`,
  },
  facadier: {
    intro: `L'isolation thermique par l'extérieur (ITE) est la solution la plus performante pour traiter en une seule opération les déperditions par les murs et les ponts thermiques des planchers. Un façadier Qualibat RGE ITE maîtrise les systèmes sous enduit mince sur polystyrène expansé, les bardages ventilés sur ossature bois et les systèmes hydrauliques avec laine minérale. Les contraintes urbanistiques (PLU, secteurs sauvegardés) peuvent nécessiter une déclaration préalable.`,
    aides: `L'ITE est l'un des gestes les mieux soutenus par MaPrimeRénov' 2026 (forfait jusqu'à 75 €/m² pour les ménages "bleus"), par les CEE et par l'éco-PTZ. Le "Coup de pouce isolation" a été maintenu pour les murs en façade extérieure pour les ménages modestes. Le temps de retour moyen d'une ITE se situe entre 10 et 15 ans sans aides, 5 à 8 ans avec le montage complet.`,
  },
  platrier: {
    intro: `L'isolation thermique par l'intérieur (ITI) reste la solution la plus accessible et la moins coûteuse pour isoler des murs existants : mise en œuvre rapide, pas d'autorisation d'urbanisme, et possibilité de traiter pièce par pièce. Un plâtrier Qualibat RGE ITI pose des doublages collés (complexes PSE + placo) ou des contre-cloisons sur ossature métallique avec isolant semi-rigide, selon l'état du support.`,
    aides: `L'ITI est éligible à MaPrimeRénov' (forfait jusqu'à 25 €/m² pour les ménages "bleus"), aux CEE, à l'éco-PTZ et à la TVA 5,5 %. La contrepartie de son moindre coût est qu'elle ne traite pas les ponts thermiques des planchers et qu'elle réduit la surface habitable d'environ 8 à 12 cm par mur traité.`,
  },
  plombier: {
    intro: `Un plombier RGE peut installer des chauffe-eau thermodynamiques (qui captent les calories de l'air ambiant pour chauffer l'eau sanitaire) et des systèmes solaires combinés. Les qualifications de référence sont "Chauffage +" et "QualiPAC CET" délivrées par Qualibat et Qualit'EnR. Un CET bien dimensionné divise par 3 la consommation d'un ballon électrique classique.`,
    aides: `L'installation d'un chauffe-eau thermodynamique par un plombier RGE ouvre droit à MaPrimeRénov' (forfait 400 à 1 200 € selon revenus), aux CEE "Coup de pouce chauffe-eau", à l'éco-PTZ et à la TVA 5,5 %.`,
  },
  climaticien: {
    intro: `Une PAC air/air (climatisation réversible) est classée par la réglementation française comme système de refroidissement prioritaire, pas comme chauffage principal : elle n'est donc PAS éligible à MaPrimeRénov' en rénovation depuis 2021. Elle reste toutefois une solution de confort d'été pertinente, notamment dans les régions à fortes chaleurs estivales. La qualification QualiPAC couvre cette technologie.`,
    aides: `Contrairement à la PAC air/eau, la PAC air/air n'est pas éligible à MaPrimeRénov' ni aux principaux CEE résidentiels. Seule la TVA à 10 % s'applique pour les équipements en résidence principale de plus de 2 ans. Pour un investissement 100 % finançable par les aides, orientez-vous vers une PAC air/eau ou géothermique.`,
  },
  ramoneur: {
    intro: `L'entretien annuel d'un appareil de chauffage bois est obligatoire : il conditionne la validité de l'assurance habitation et le maintien des performances énergétiques. Un ramoneur qualifié QualiBois Entretien (Qualit'EnR) réalise un ramonage mécanique, un contrôle du tirage et un nettoyage du foyer. Deux ramonages par an sont exigés en période d'usage continu pour les appareils à bois.`,
    aides: `L'entretien lui-même n'est pas éligible aux aides à la rénovation, mais la mise en conformité d'une installation bois (changement d'appareil vers un modèle Flamme Verte 7 étoiles, mise aux normes du conduit) peut relever des forfaits MaPrimeRénov' chaudière biomasse et CEE via un artisan QualiBois Installation.`,
  },
}

/** Copie par défaut (fallback générique, quand service inconnu). */
const SERVICE_COPY_FALLBACK = {
  intro: `Les artisans de ce métier certifiés RGE répondent aux critères d'éco-conditionnalité fixés par l'État et sont audités périodiquement par l'organisme certificateur. Leur qualification est nominative et rattachée à l'entreprise, avec une validité de 4 ans renouvelable.`,
  aides: `Les travaux éligibles réalisés par cet artisan RGE donnent accès, selon leur nature, à MaPrimeRénov', aux Certificats d'Économies d'Énergie (CEE), à l'éco-PTZ et à la TVA à 5,5 %.`,
}

/**
 * Génère 2-3 paragraphes spécifiques au service x ville pour /rge/[service]/[ville].
 */
export function buildServiceCityParagraphs(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
  count: number
): string[] {
  const tier = getVilleTier(ville.slug)
  const copy = SERVICE_COPY[serviceSlug] ?? SERVICE_COPY_FALLBACK
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  const countLabel = count > 0 ? fmtCount(count) : null

  // Paragraphe métier (types, techno, qualification)
  const p1 = copy.intro

  // Paragraphe aides spécifiques
  const p2 = copy.aides

  // Paragraphe ancrage local (ville-specific)
  const tierPhrase: Record<VilleTier, string> = {
    metropole: `Dans une agglomération comme ${ville.name}, la concentration de professionnels permet de comparer plusieurs devis dans un rayon proche et d'obtenir des délais d'intervention plus courts qu'en zone rurale.`,
    grande: `À ${ville.name} (${ville.departement}), le marché de la rénovation énergétique reste concurrentiel : demander systématiquement 3 devis RGE permet de vérifier que les prix sont alignés sur les références locales.`,
    moyenne: `À ${ville.name}, le nombre d'artisans ${serviceName.toLowerCase()} RGE reste plus limité qu'en grande agglomération : les bons professionnels ont souvent 2 à 4 mois de carnet de commandes, anticipez votre demande.`,
    commune: `Pour une commune du département ${ville.departement} comme ${ville.name}, il est fréquent que les artisans ${serviceName.toLowerCase()} RGE interviennent depuis la ville-centre voisine, dans un rayon de 20 à 40 km : cela reste parfaitement compatible avec les demandes d'aides.`,
  }

  const localCount = countLabel
    ? `${countLabel} ${serviceName.toLowerCase()} RGE ${count > 1 ? 'sont actifs' : 'est actif'} à ${ville.name} selon la dernière synchronisation ADEME. `
    : ''
  const qualifMention = qualif
    ? `Privilégiez ceux qui détiennent la qualification ${qualif.label} (${qualif.organisme}) : c'est le référentiel le plus exigeant pour ce métier. `
    : ''

  const p3 = `${localCount}${qualifMention}${tierPhrase[tier]}`

  return [p1, p2, p3]
}

/**
 * FAQ service x ville (4-5 entrées) — contextualisée service + ville.
 */
export function buildServiceCityFaq(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
  count: number
): RgeFaqItem[] {
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  const qualifLabel = qualif?.label ?? 'RGE'
  const organisme = qualif?.organisme ?? 'Qualibat, Qualit\u2019EnR ou Qualifelec'
  const svcLower = serviceName.toLowerCase()

  const countAnswer =
    count > 0
      ? `Notre base recense actuellement ${fmtCount(count)} ${svcLower} certifi${count > 1 ? 's' : ''} RGE à ${ville.name}, avec des qualifications en cours de validité vérifiées chaque semaine depuis le registre ADEME officiel.`
      : `Le nombre de ${svcLower} RGE à ${ville.name} varie au rythme des renouvellements de qualifications. Notre base est synchronisée chaque semaine depuis l'ADEME — consultez également les communes voisines du département ${ville.departement} pour élargir le champ.`

  // Aide spécifique selon service
  const aidesByService: Record<string, string> = {
    'pompe-a-chaleur': `Pour installer une pompe à chaleur air/eau à ${ville.name} en 2026, un ménage "bleu" (très modeste) peut obtenir jusqu'à 11 000 € de MaPrimeRénov', cumulables avec 5 000 € de prime CEE "Coup de pouce chauffage" pour le remplacement d'une chaudière fioul ou gaz, l'éco-PTZ jusqu'à 50 000 € et la TVA à 5,5 %.`,
    'panneaux-solaires': `Pour une installation photovoltaïque en autoconsommation à ${ville.name} en 2026, vous pouvez obtenir la prime à l'autoconsommation EDF OA (80 à 380 €/kWc selon puissance), le tarif d'achat du surplus fixé par la CRE, et la TVA à 10 % pour les installations ≤ 3 kWc. Le solaire thermique (QualiSol) reste éligible à MaPrimeRénov' et aux CEE.`,
    'isolation-thermique': `À ${ville.name}, les travaux d'isolation (ITI ou ITE) réalisés par un artisan Qualibat RGE donnent droit en 2026 à MaPrimeRénov' (jusqu'à 75 €/m² en ITE pour les ménages "bleus"), aux CEE classiques, à l'éco-PTZ et à la TVA 5,5 %.`,
    chauffagiste: `À ${ville.name}, un chauffagiste RGE donne accès en 2026 à MaPrimeRénov' chaudière biomasse (jusqu'à 10 000 € pour les chaudières granulés en ménage "bleu"), à la prime CEE "Coup de pouce chauffage", à l'éco-PTZ et à la TVA 5,5 %.`,
    'renovation-energetique': `Pour une rénovation globale à ${ville.name} en 2026, le parcours accompagné MaPrimeRénov' peut financer jusqu'à 80 % des travaux (plafond 70 000 €) pour les ménages "bleus" passant d'une classe F/G à B, avec accompagnement MAR obligatoire.`,
  }
  const aidesAnswer =
    aidesByService[serviceSlug] ??
    `Les travaux de ${svcLower} RGE à ${ville.name} donnent accès en 2026 à MaPrimeRénov', aux Certificats d'Économies d'Énergie (CEE), à l'éco-PTZ jusqu'à 50 000 € et à la TVA à 5,5 %, sous réserve que l'artisan détienne bien une qualification ${qualifLabel} en cours de validité.`

  return [
    {
      question: `Combien y a-t-il de ${svcLower} RGE à ${ville.name} ?`,
      answer: countAnswer,
    },
    {
      question: `Comment choisir un artisan ${qualifLabel} à ${ville.name} ?`,
      answer: `Vérifiez trois points : (1) la qualification ${qualifLabel} est en cours de validité sur l'annuaire France Rénov' ou sur le site de ${organisme}, (2) l'artisan fournit une attestation RGE nominative avec numéro et date de validité, (3) le devis mentionne clairement les aides mobilisables (MaPrimeRénov', CEE, TVA réduite). Demandez systématiquement 3 devis à ${ville.name} pour comparer prix et prestations.`,
    },
    {
      question: `Quelles aides pour ${svcLower} à ${ville.name} en 2026 ?`,
      answer: aidesAnswer,
    },
    {
      question: `Un artisan ${qualifLabel} hors ${ville.name} peut-il intervenir chez moi ?`,
      answer: `Oui. Les qualifications RGE sont nominatives et rattachées à l'entreprise, pas à la commune. Un artisan ${qualifLabel} domicilié dans une commune voisine du département ${ville.departement} intervient couramment à ${ville.name} dans un rayon de 20 à 50 km, et les aides (MaPrimeRénov', CEE, TVA 5,5 %) restent intégralement mobilisables sans restriction géographique.`,
    },
    {
      question: `Que vérifier sur le devis d'un ${svcLower} RGE ?`,
      answer: `Le devis doit obligatoirement mentionner : le numéro SIRET de l'entreprise, le numéro et la date de validité de la qualification ${qualifLabel}, le détail HT / TVA / TTC avec le taux de 5,5 % appliqué aux travaux éligibles, la marque et la référence du matériel installé, la performance technique (COP pour une PAC, résistance thermique pour une isolation, etc.) et la garantie décennale de l'entreprise.`,
    },
  ]
}

/**
 * Sélectionne jusqu'à N villes voisines pour l'internal linking à partir
 * d'une ville donnée. Critère : même departementCode si possible, sinon
 * même région, sinon top national. Sans appel DB.
 */
export function getNeighborVilles(
  villeSlug: string,
  limit = 5
): Array<{ slug: string; name: string }> {
  const current = villes.find((v) => v.slug === villeSlug)
  if (!current) {
    return villes.slice(0, limit).map((v) => ({ slug: v.slug, name: v.name }))
  }

  const sameDept = villes
    .filter((v) => v.slug !== villeSlug && v.departementCode === current.departementCode)
    .slice(0, limit)

  if (sameDept.length >= limit) {
    return sameDept.map((v) => ({ slug: v.slug, name: v.name }))
  }

  const sameRegion = villes
    .filter(
      (v) =>
        v.slug !== villeSlug &&
        v.region === current.region &&
        v.departementCode !== current.departementCode
    )
    .slice(0, limit - sameDept.length)

  const combined = [...sameDept, ...sameRegion]
  if (combined.length >= limit) {
    return combined.map((v) => ({ slug: v.slug, name: v.name }))
  }

  const topFallback = villes
    .filter((v) => v.slug !== villeSlug && !combined.some((c) => c.slug === v.slug))
    .slice(0, limit - combined.length)

  return [...combined, ...topFallback].map((v) => ({
    slug: v.slug,
    name: v.name,
  }))
}

/** Services principaux pour le cross-linking depuis /artisans-rge/[ville]. */
export const MAIN_RGE_SERVICES: Array<{
  slug: RgeAllowedService
  label: string
}> = [
  { slug: 'pompe-a-chaleur', label: 'Pompe à chaleur' },
  { slug: 'isolation-thermique', label: 'Isolation thermique' },
  { slug: 'panneaux-solaires', label: 'Panneaux solaires' },
  { slug: 'chauffagiste', label: 'Chauffage bois' },
]
