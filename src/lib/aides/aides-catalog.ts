/**
 * Catalogue des 12 aides nationales à la rénovation énergétique 2026.
 *
 * Source unique de vérité pour le hub /aides + 12 sous-pages /aides/[slug].
 *
 * ⚠️ YMYL — données financières publiques. Toute modification de montant doit :
 *   1. Pointer une source officielle vérifiable (france-renov.gouv.fr,
 *      service-public.fr, ademe.fr, ou arrêté publié au JORF).
 *   2. Mettre à jour `lastReviewed` à la date de la vérification.
 *   3. Documenter la source via `sourceUrl` + `sourceLabel` pour traçabilité
 *      publique côté UI (bloc « Sources »).
 *
 * Disclaimer affiché sur toutes les pages : « Informations à titre indicatif,
 * vérifiez les conditions exactes sur france-renov.gouv.fr avant signature
 * d'un devis. »
 *
 * Auteur YMYL : claire-dubois (cf. src/lib/data/authors.ts) — methodology
 * publiée incluant croisement 3 sources officielles minimum.
 *
 * Anti-drift : les montants chiffrés réutilisés (MaPrimeRénov / éco-PTZ / CEE)
 * sont importés depuis src/lib/aides/constants.ts (SSoT numérique) puis formatés
 * via formatEur(). Ne JAMAIS hardcoder un nombre déjà présent dans constants.ts.
 */

import { ECO_PTZ, MAPRIMERENOV, formatEur } from './constants'

export type AideKind = 'GovernmentService' | 'FinancialProduct'

export type AideMontant = {
  /** Catégorie de bénéficiaire (« Revenus très modestes (bleu) », etc.) */
  label: string
  /** Montant maximum en euros (ou string si plafond non chiffrable simplement). */
  max: string
  /** Conditions d'octroi (ex : « pompe à chaleur air-eau », « audit énergétique »). */
  condition?: string
}

export type AideSource = {
  url: string
  label: string
}

export type Aide = {
  /** URL slug (ex : « maprimerenov »). KEBAB-CASE strict, [a-z0-9-]+. */
  slug: string
  /** Nom court affiché en H1 (ex : « MaPrimeRénov' »). Apostrophes typo OK. */
  name: string
  /** Sous-titre H1 / meta description teaser. */
  tagline: string
  /** Type Schema.org dominant — détermine GovernmentService vs FinancialProduct. */
  kind: AideKind
  /** Description longue (~250-400 chars) — utilisée en meta description + hero. */
  description: string
  /** Description schema.org (peut différer de description, plus formelle). */
  schemaDescription: string
  /** Volume de recherche estimé Ahrefs (mensuel France). Indicatif, pas de promesse. */
  estimatedVolume: number
  /** Catégorie de classement (ex : « Aide nationale », « Prêt »). */
  category: 'Subvention nationale' | 'Prime privée' | 'Prêt' | 'Avantage fiscal'
  /** Montants détaillés. Au moins 1 entrée. */
  montants: AideMontant[]
  /** Liste des conditions d'éligibilité (3-7 items courts, factuels). */
  eligibilite: string[]
  /** Démarche en 3-7 étapes ordonnées (utilisé pour HowTo Schema). */
  demarche: { name: string; text: string }[]
  /** FAQ 3-5 questions (utilisé pour FAQPage Schema). */
  faqs: { question: string; answer: string }[]
  /** Aides cumulables (slugs du catalog). Ne pas inclure soi-même. */
  cumulableWith: string[]
  /** Sources officielles citées dans le bloc « Sources » + Schema.org sameAs. */
  sources: AideSource[]
  /** Date ISO YYYY-MM-DD de dernière vérification des montants. */
  lastReviewed: string
  /** Mots-clés Schema.org keywords. */
  keywords: string[]
  /** Couverture temporelle Schema.org temporalCoverage (ex : « 2026-01-01/2026-12-31 »). */
  temporalCoverage: string
}

/**
 * Date de revue commune : tous les montants ont été vérifiés croisés sur les
 * sources citées le 2026-04-29. Réviser tous les 90 jours minimum, ou à
 * chaque évolution réglementaire signalée par la veille france-renov.gouv.fr.
 */
const REVIEWED = '2026-04-29'

const DISCLAIMER_FAQ_BASE = {
  question: 'Ces montants sont-ils garantis ?',
  answer:
    "Les montants présentés ici sont à jour au 29 avril 2026, sourcés depuis france-renov.gouv.fr et service-public.fr. Ils peuvent évoluer en cours d'année par décret. Avant signature d'un devis, vérifiez systématiquement les conditions exactes sur france-renov.gouv.fr ou auprès d'un conseiller France Rénov' (3818, appel non surtaxé).",
}

export const aidesCatalog: Aide[] = [
  {
    slug: 'maprimerenov',
    name: "MaPrimeRénov'",
    tagline: "L'aide principale de l'État pour rénover en 2026",
    kind: 'GovernmentService',
    description:
      "Subvention de l'Anah versée aux ménages pour les travaux de rénovation énergétique. Montant calculé selon le revenu fiscal de référence (4 catégories : bleu / jaune / violet / rose) et le type de travaux. Artisan certifié RGE obligatoire à la signature du devis.",
    schemaDescription:
      "Aide financière à la rénovation énergétique versée par l'Agence nationale de l'habitat (Anah) aux propriétaires occupants et bailleurs. Plafond 30 000 € (parcours par geste) ou 70 000 € (parcours accompagné).",
    estimatedVolume: 90000,
    category: 'Subvention nationale',
    montants: [
      {
        label: 'Parcours par geste — plafond global',
        max: formatEur(MAPRIMERENOV.MAX_PARCOURS_GESTE_EUR),
        condition: '1 ou 2 gestes isolés (isolation, fenêtres, pompe à chaleur, etc.)',
      },
      {
        label: 'Parcours accompagné — plafond global',
        max: formatEur(MAPRIMERENOV.MAX_PARCOURS_ACCOMPAGNE_EUR),
        condition: '2+ gestes isolation + saut ≥ 2 classes DPE, accompagnement MAR obligatoire',
      },
      {
        label: 'Pompe à chaleur air-eau — revenus très modestes (bleu)',
        max: `jusqu’à ${formatEur(MAPRIMERENOV.PAC_AIR_EAU_BLEU_EUR)}`,
      },
      {
        label: 'Pompe à chaleur air-eau — revenus modestes (jaune)',
        max: `jusqu’à ${formatEur(MAPRIMERENOV.PAC_AIR_EAU_JAUNE_EUR)}`,
      },
      {
        label: 'Isolation des combles — revenus très modestes (bleu)',
        max: 'jusqu’à 25 €/m²',
      },
      {
        label: 'Audit énergétique — revenus très modestes (bleu)',
        max: 'jusqu’à 500 €',
      },
    ],
    eligibilite: [
      'Logement occupé en résidence principale',
      'Logement achevé depuis plus de 15 ans (ou 2 ans pour le changement de chauffage au fioul/gaz)',
      'Propriétaire occupant ou bailleur (engagement de plafonnement du loyer)',
      'Devis signé par un artisan certifié RGE actif à la date de signature',
      'Dossier déposé sur maprimerenov.gouv.fr AVANT signature du devis',
    ],
    demarche: [
      {
        name: 'Vérifier éligibilité et catégorie de revenus',
        text: 'Calculer votre revenu fiscal de référence (RFR) et identifier votre catégorie : bleu (très modestes), jaune (modestes), violet (intermédiaires) ou rose (supérieurs). Le simulateur officiel sur maprimerenov.gouv.fr indique le montant prévisionnel.',
      },
      {
        name: 'Choisir un artisan RGE et obtenir un devis',
        text: 'Sélectionner un artisan certifié RGE avec qualification active (Qualibat, QualiPAC, QualiBois, Qualifelec). Le devis doit mentionner le numéro de qualification et sa date de validité.',
      },
      {
        name: 'Créer un compte et déposer le dossier',
        text: 'Créer un compte sur maprimerenov.gouv.fr, joindre RIB, dernier avis d’imposition et devis choisi. Le dépôt doit avoir lieu AVANT signature du devis avec l’artisan.',
      },
      {
        name: "Attendre l'accord Anah",
        text: "L'Anah instruit le dossier en 2 à 8 semaines selon la charge locale. Le courrier d'accord (par e-mail) indique le montant prévisionnel de la prime.",
      },
      {
        name: 'Signer le devis et faire réaliser les travaux',
        text: "Signer le devis APRÈS réception de l'accord Anah uniquement. L'artisan réalise les travaux selon les critères techniques de l'aide.",
      },
      {
        name: 'Demander le paiement de la prime',
        text: 'Déposer la facture acquittée sur maprimerenov.gouv.fr. Versement par virement sous 2 à 4 mois après validation du dossier.',
      },
    ],
    faqs: [
      {
        question: "Qui peut bénéficier de MaPrimeRénov' en 2026 ?",
        answer:
          "Tous les propriétaires (occupants ou bailleurs) d'un logement résidence principale achevé depuis plus de 15 ans (ou 2 ans pour remplacement chauffage fioul/gaz). Pas de plafond de revenus pour accéder à l'aide, mais le montant varie selon 4 catégories de revenus (bleu / jaune / violet / rose).",
      },
      {
        question: "Peut-on cumuler MaPrimeRénov' avec les primes CEE ?",
        answer:
          "Oui, le cumul MaPrimeRénov' + CEE (Coup de pouce inclus) est explicitement autorisé sur les mêmes travaux. La TVA réduite à 5,5 % et l'éco-PTZ se cumulent également. Vérifier les plafonds par type de travaux sur france-renov.gouv.fr.",
      },
      {
        question: 'Faut-il signer le devis avant ou après le dépôt du dossier ?',
        answer:
          "APRÈS l'accord. Le dossier MaPrimeRénov' doit être déposé sur maprimerenov.gouv.fr AVANT signature du devis. Signer avant la réception de l'accord Anah rend le dossier inéligible à la prime.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['cee', 'eco-ptz', 'tva-5-5', 'cheque-energie', 'coup-de-pouce', 'maprimeadapt'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/maprimerenov',
        label: "France Rénov' — MaPrimeRénov' (portail officiel État)",
      },
      {
        url: 'https://www.maprimerenov.gouv.fr/',
        label: "Site officiel MaPrimeRénov' (Anah)",
      },
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
        label: "service-public.fr — fiche MaPrimeRénov'",
      },
      {
        url: 'https://www.anah.gouv.fr/',
        label: "Anah — Agence nationale de l'habitat",
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['maprimerenov', 'anah', 'aide-renovation', 'prime-renovation', 'rge'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'cee',
    name: "Primes CEE (Certificats d'économies d'énergie)",
    tagline: 'Primes versées par les fournisseurs d’énergie obligés',
    kind: 'FinancialProduct',
    description:
      "Le dispositif des Certificats d'économies d'énergie (CEE) oblige les fournisseurs d'énergie (TotalEnergies, EDF, Engie, Carrefour, etc.) à financer les travaux de rénovation énergétique de leurs clients sous forme de primes. Montants forfaitaires variant selon la zone climatique (H1/H2/H3) et le type d'opération.",
    schemaDescription:
      "Prime privée versée par les fournisseurs d'énergie au titre du dispositif CEE (Loi POPE 2005). Bonifications « Coup de pouce » pour les ménages modestes ou pour la sortie d'un chauffage au fioul/gaz.",
    estimatedVolume: 60000,
    category: 'Prime privée',
    montants: [
      {
        label: 'Pompe à chaleur air-eau (BAR-TH-171) — zone H1, maison',
        max: 'jusqu’à 5 000 €',
        condition: 'Coefficient d’efficience saisonnière (Etas) ≥ 126 %',
      },
      {
        label: 'Isolation des combles (BAR-EN-101) — précarité énergétique',
        max: '20 €/m²',
        condition: 'Coup de pouce isolation, ménages modestes',
      },
      {
        label: 'Chaudière biomasse (BAR-TH-113) — zone H1, maison individuelle',
        max: 'jusqu’à 4 000 €',
      },
      {
        label: 'VMC double flux (BAR-TH-127) — maison individuelle',
        max: 'jusqu’à 1 200 €',
      },
      {
        label: 'Coup de pouce chauffage — sortie fioul/gaz vers PAC',
        max: 'jusqu’à 5 000 € supplémentaires',
        condition: 'Bonification ménages modestes',
      },
    ],
    eligibilite: [
      'Logement résidentiel (maison ou appartement)',
      'Travaux réalisés par un artisan certifié RGE actif',
      "Devis signé APRÈS validation de l'offre CEE par le délégataire (Sonergia, Hellio, etc.)",
      'Conformité technique aux fiches d’opérations standardisées (BAR-EN-, BAR-TH-, etc.)',
    ],
    demarche: [
      {
        name: 'Choisir un délégataire CEE',
        text: 'Comparer les offres de plusieurs délégataires (Sonergia, Hellio, EDF, TotalEnergies, etc.). La prime varie selon le délégataire et la période.',
      },
      {
        name: "Valider l'offre AVANT le devis",
        text: "Demander une attestation d'offre CEE par e-mail au délégataire. Cette attestation doit dater AVANT la signature du devis avec l'artisan.",
      },
      {
        name: 'Signer le devis avec un artisan RGE',
        text: 'Sélectionner un artisan certifié RGE actif. La qualification RGE est strictement vérifiée à la signature.',
      },
      {
        name: 'Réaliser les travaux',
        text: "L'artisan réalise les travaux selon la fiche d'opération standardisée. Conserver tous les justificatifs techniques.",
      },
      {
        name: 'Envoyer la facture au délégataire',
        text: 'Transmettre la facture acquittée + attestation sur l’honneur signée. Versement de la prime sous 4 à 12 semaines.',
      },
    ],
    faqs: [
      {
        question: 'Pourquoi les primes CEE sont-elles « gratuites » ?',
        answer:
          "Le dispositif CEE est financé par les fournisseurs d'énergie (TotalEnergies, EDF, Engie, etc.) au titre d'une obligation légale (Loi POPE 2005). L'État leur impose un quota d'économies d'énergie à financer chez leurs clients. Pour le bénéficiaire, c'est une prime sans contrepartie, hors qualification RGE et démarche AVANT devis.",
      },
      {
        question: 'Quelle différence entre CEE classique et Coup de pouce ?',
        answer:
          "Le « Coup de pouce » est une bonification CEE pour des opérations spécifiques : sortie d'un chauffage fioul/gaz, isolation pour les ménages modestes, rénovation globale. Le montant est plus élevé que le CEE classique (parfois +50 à +100 %). Liste officielle sur france-renov.gouv.fr.",
      },
      {
        question: "Les primes CEE sont-elles cumulables avec MaPrimeRénov' ?",
        answer:
          "Oui, le cumul MaPrimeRénov' + CEE est explicitement autorisé sur les mêmes travaux. Le total des aides ne peut pas dépasser le coût TTC des travaux (règle anti-enrichissement de l'Anah).",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'eco-ptz', 'tva-5-5', 'cheque-energie', 'coup-de-pouce'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/cee',
        label: "France Rénov' — Primes CEE",
      },
      {
        url: 'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
        label: 'Ministère de la Transition écologique — dispositif CEE',
      },
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
        label: "service-public.fr — Coup de pouce économies d'énergie",
      },
    ],
    lastReviewed: REVIEWED,
    keywords: [
      'cee',
      'certificats-economies-energie',
      'prime-energie',
      'coup-de-pouce',
      'sonergia',
    ],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'eco-ptz',
    name: 'Éco-prêt à taux zéro (éco-PTZ)',
    tagline: 'Prêt sans intérêts pour financer la rénovation',
    kind: 'FinancialProduct',
    description:
      "L'éco-prêt à taux zéro est un prêt bancaire SANS intérêts à rembourser, dédié au financement de travaux de rénovation énergétique. Distribué par les banques partenaires (BNP Paribas, Crédit Agricole, Société Générale, etc.). Cumulable avec MaPrimeRénov' et CEE.",
    schemaDescription:
      "Prêt à taux d'intérêt nul (0 %) accordé par les banques partenaires pour financer la rénovation énergétique d'un logement résidence principale. Plafond 50 000 € sur 20 ans pour rénovation globale.",
    estimatedVolume: 18000,
    category: 'Prêt',
    montants: [
      {
        label: 'Action seule (1 geste)',
        max: `jusqu’à ${formatEur(ECO_PTZ.MAX_ACTION_SEULE_EUR)}`,
        condition: '15 ans de remboursement maximum',
      },
      {
        label: 'Bouquet de travaux (2+ gestes)',
        max: `jusqu’à ${formatEur(ECO_PTZ.MAX_BOUQUET_EUR)}`,
        condition: '15 ans de remboursement',
      },
      {
        label: 'Performance énergétique globale',
        max: `jusqu’à ${formatEur(ECO_PTZ.MAX_GLOBAL_EUR)}`,
        condition: `${ECO_PTZ.DURATION_GLOBAL_YEARS} ans de remboursement, gain énergétique ≥ 35 %`,
      },
      {
        label: 'Assainissement non collectif',
        max: `jusqu’à ${formatEur(ECO_PTZ.MAX_ASSAINISSEMENT_EUR)}`,
      },
    ],
    eligibilite: [
      'Logement résidence principale achevé depuis plus de 2 ans',
      'Propriétaire occupant, bailleur, ou copropriété',
      'Pas de condition de ressources',
      'Travaux réalisés par un artisan certifié RGE',
      "Demande déposée auprès d'une banque partenaire",
    ],
    demarche: [
      {
        name: 'Définir le projet et obtenir des devis RGE',
        text: "Identifier les travaux éligibles (isolation, chauffage, fenêtres, etc.). Obtenir au moins 1 devis d'un artisan RGE.",
      },
      {
        name: 'Identifier une banque partenaire',
        text: "Liste sur france-renov.gouv.fr. Toutes les banques ne distribuent pas l'éco-PTZ. Demander en agence ou en ligne.",
      },
      {
        name: 'Constituer le dossier',
        text: "Devis RGE + formulaire « Emprunteur » + justificatifs (RIB, avis d'imposition, situation pro). Pas d'évaluation thermique requise pour le bouquet de travaux.",
      },
      {
        name: "Signer l'offre de prêt",
        text: "La banque émet une offre de prêt à 0 % d'intérêts. Délai de réflexion légal de 10 jours.",
      },
      {
        name: 'Réaliser les travaux dans les 3 ans',
        text: 'Travaux à réaliser dans un délai de 3 ans après émission du prêt. Justificatifs (factures) à transmettre à la banque.',
      },
    ],
    faqs: [
      {
        question: "L'éco-PTZ est-il vraiment à 0 % ?",
        answer:
          "Oui, le taux d'intérêt est strictement de 0 % — l'État prend en charge les intérêts via un crédit d'impôt versé à la banque. Toutefois, certains frais peuvent s'appliquer : frais de dossier (environ 0 à 200 € selon la banque), assurance emprunteur (facultative mais souvent demandée).",
      },
      {
        question: "Peut-on cumuler éco-PTZ et MaPrimeRénov' ?",
        answer:
          "Oui, le cumul est explicitement autorisé. L'éco-PTZ finance le reste à charge après déduction de MaPrimeRénov', des CEE et de la TVA réduite. Avantage : étaler le remboursement sur 15 à 20 ans à 0 %.",
      },
      {
        question: 'Combien de temps pour obtenir un éco-PTZ ?',
        answer:
          "L'instruction par la banque prend 2 à 8 semaines selon le dossier. Tous les établissements bancaires partenaires ne traitent pas l'éco-PTZ — vérifier la liste à jour sur france-renov.gouv.fr.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'tva-5-5', 'cheque-energie', 'coup-de-pouce'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/eco-ptz',
        label: "France Rénov' — Éco-prêt à taux zéro",
      },
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F19905',
        label: 'service-public.fr — fiche éco-PTZ',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['eco-ptz', 'pret-renovation', 'pret-taux-zero', 'financement-travaux'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'tva-5-5',
    name: 'TVA réduite à 5,5 %',
    tagline: 'Avantage fiscal automatique sur les travaux d’économie d’énergie',
    kind: 'GovernmentService',
    description:
      "La TVA est réduite de 20 % à 5,5 % sur la fourniture et la pose de matériaux et équipements éligibles à la rénovation énergétique. Avantage automatique appliqué directement par l'artisan sur la facture, sans démarche du client.",
    schemaDescription:
      "Taux de TVA réduit à 5,5 % (article 278-0 bis A du Code général des impôts) appliqué sur les travaux d'amélioration de la performance énergétique d'un logement de plus de 2 ans.",
    estimatedVolume: 12000,
    category: 'Avantage fiscal',
    montants: [
      {
        label: 'Économie immédiate sur la facture TTC',
        max: '14,5 % du montant HT',
        condition: 'TVA passe de 20 % à 5,5 % sur la fourniture + pose',
      },
      {
        label: 'Pas de plafond de montant',
        max: 'illimité',
      },
    ],
    eligibilite: [
      'Logement résidence principale ou secondaire achevé depuis plus de 2 ans',
      'Propriétaire occupant, bailleur, syndic ou locataire',
      "Travaux d'amélioration de la performance énergétique (isolation, chauffage, ventilation, ENR)",
      "Matériaux + pose facturés par l'artisan (TVA 5,5 % ne s'applique pas en achat direct)",
    ],
    demarche: [
      {
        name: "Vérifier l'éligibilité des travaux",
        text: "Liste exhaustive des matériaux et équipements éligibles publiée par l'administration fiscale. La majorité des travaux MaPrimeRénov' sont aussi éligibles à la TVA 5,5 %.",
      },
      {
        name: "Signer l'attestation simplifiée",
        text: "Le client signe une attestation simplifiée fournie par l'artisan, certifiant que le logement a plus de 2 ans et que les travaux sont éligibles.",
      },
      {
        name: 'Recevoir la facture à 5,5 %',
        text: "L'artisan applique directement la TVA réduite. Aucune démarche de remboursement. La TVA 20 % n'est jamais avancée.",
      },
    ],
    faqs: [
      {
        question: 'Faut-il faire une demande pour la TVA 5,5 % ?',
        answer:
          "Non. C'est l'artisan qui applique directement le taux réduit sur la facture, après que le client ait signé l'attestation simplifiée certifiant que le logement a plus de 2 ans et que les travaux sont éligibles. Aucune démarche fiscale n'est nécessaire pour le client.",
      },
      {
        question: 'TVA 5,5 % vs TVA 10 % : quelle différence ?',
        answer:
          "La TVA 5,5 % concerne strictement les travaux d'économie d'énergie (isolation, chauffage performant, ventilation). La TVA 10 % s'applique aux autres travaux d'amélioration, transformation, aménagement et entretien sur logements de plus de 2 ans (peinture, plomberie hors chaudière, etc.). Le taux 20 % reste pour les travaux de construction ou d'agrandissement.",
      },
      {
        question: "Peut-on cumuler TVA 5,5 % avec MaPrimeRénov' ?",
        answer:
          "Oui, automatiquement. La TVA 5,5 % réduit le montant TTC de la facture, et MaPrimeRénov' s'applique sur ce montant TTC réduit. Le bénéficiaire profite des deux aides en parallèle.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: [
      'maprimerenov',
      'cee',
      'eco-ptz',
      'cheque-energie',
      'coup-de-pouce',
      'maprimeadapt',
    ],
    sources: [
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F31115',
        label: 'service-public.fr — TVA 5,5 % travaux',
      },
      {
        url: 'https://france-renov.gouv.fr/aides/tva-reduite',
        label: "France Rénov' — TVA réduite à 5,5 %",
      },
      {
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041464976',
        label: 'Code général des impôts — Article 278-0 bis A',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['tva-5-5', 'tva-reduite', 'tva-renovation', 'avantage-fiscal'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'cheque-energie',
    name: 'Chèque énergie',
    tagline: "Aide automatique pour payer factures d'énergie et travaux",
    kind: 'GovernmentService',
    description:
      "Le chèque énergie est une aide nominative envoyée automatiquement par l'État aux ménages modestes (sans démarche). Il sert à payer les factures d'énergie (électricité, gaz, fioul, bois) ou à financer des travaux de rénovation énergétique réalisés par un artisan RGE.",
    schemaDescription:
      "Aide nominative versée automatiquement par l'Agence de services et de paiement (ASP) aux ménages dont le revenu fiscal de référence par unité de consommation (RFR/UC) est inférieur au plafond fixé par décret.",
    estimatedVolume: 22000,
    category: 'Subvention nationale',
    montants: [
      {
        label: 'Montant minimal (RFR/UC élevé du plafond)',
        max: '48 €',
      },
      {
        label: 'Montant maximal (RFR/UC le plus bas)',
        max: '277 €',
      },
      {
        label: 'Bonus rénovation (cumul plusieurs chèques)',
        max: 'jusqu’à 1 385 € sur 5 ans',
        condition: 'Conservation et cumul des chèques énergie reçus',
      },
    ],
    eligibilite: [
      'Revenu fiscal de référence par unité de consommation (RFR/UC) ≤ 11 000 €/an environ',
      "Logement résidence principale taxé à la taxe d'habitation",
      "Aucune démarche : envoi automatique en avril-mai sur la base de l'avis fiscal",
      'Cumulable avec toutes les autres aides',
    ],
    demarche: [
      {
        name: 'Recevoir le chèque automatiquement',
        text: "Le chèque arrive par courrier en avril-mai chaque année. Aucune démarche n'est nécessaire — l'éligibilité est calculée par l'ASP sur la base de votre dernier avis d'imposition.",
      },
      {
        name: "Choisir l'usage : facture ou travaux",
        text: "Le chèque peut être utilisé pour payer une facture d'énergie OU pour financer des travaux RGE. Il est valable 1 an à compter de sa date d'émission.",
      },
      {
        name: 'Pour les travaux : remettre au professionnel RGE',
        text: "L'artisan RGE accepte le chèque comme moyen de paiement direct sur la facture. Il se fait rembourser par l'ASP en transmettant le chèque endossé.",
      },
      {
        name: 'Cumuler plusieurs chèques pour un projet rénovation',
        text: "Garder les chèques énergie reçus chaque année permet de cumuler jusqu'à 1 385 € sur 5 ans pour financer un projet de rénovation énergétique.",
      },
    ],
    faqs: [
      {
        question: 'Comment savoir si je vais recevoir le chèque énergie ?',
        answer:
          "L'éligibilité est calculée automatiquement par l'ASP sur la base de votre revenu fiscal de référence et de la composition du foyer (unités de consommation). Vérifiez votre éligibilité sur chequeenergie.gouv.fr en saisissant votre numéro fiscal.",
      },
      {
        question: "Peut-on cumuler chèque énergie + MaPrimeRénov' ?",
        answer:
          "Oui, le cumul est total et automatique. Le chèque énergie peut servir à régler le reste à charge après déduction de MaPrimeRénov' et des CEE. Plusieurs chèques (sur plusieurs années) peuvent être cumulés pour un même projet de rénovation.",
      },
      {
        question: "Que faire si je n'ai pas reçu le chèque alors que je suis éligible ?",
        answer:
          "Contacter l'ASP via le site chequeenergie.gouv.fr ou le 0 805 204 805 (numéro vert). Une réémission peut être demandée si le chèque a été perdu, volé ou jamais reçu (vérification d'adresse à jour).",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5', 'coup-de-pouce', 'maprimeadapt'],
    sources: [
      {
        url: 'https://chequeenergie.gouv.fr/',
        label: 'Site officiel Chèque énergie',
      },
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F871',
        label: 'service-public.fr — Chèque énergie',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['cheque-energie', 'aide-energie', 'aide-precarite-energetique'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'coup-de-pouce',
    name: 'Coup de pouce économies d’énergie',
    tagline: 'Bonification CEE pour les travaux les plus efficaces',
    kind: 'FinancialProduct',
    description:
      "Le « Coup de pouce » est une bonification du dispositif CEE pour des opérations spécifiques : sortie d'un chauffage fioul/gaz vers une pompe à chaleur, isolation des ménages modestes, rénovation globale. Le montant est sensiblement supérieur au CEE classique.",
    schemaDescription:
      "Bonification du dispositif des Certificats d'économies d'énergie (CEE) accordée par les fournisseurs d'énergie signataires de la charte « Coup de pouce » pour des opérations de rénovation énergétique ciblées.",
    estimatedVolume: 14000,
    category: 'Prime privée',
    montants: [
      {
        label: 'Coup de pouce chauffage — sortie fioul/gaz vers PAC, ménages modestes',
        max: 'jusqu’à 5 000 €',
      },
      {
        label: 'Coup de pouce chauffage — sortie fioul/gaz vers PAC, autres ménages',
        max: 'jusqu’à 4 000 €',
      },
      {
        label: 'Coup de pouce isolation des combles — ménages modestes',
        max: '20 €/m²',
      },
      {
        label: 'Coup de pouce rénovation performante (saut ≥ 2 classes DPE)',
        max: 'jusqu’à 1 500 €/MWh économisé',
        condition: 'Bonification proportionnelle au gain énergétique',
      },
    ],
    eligibilite: [
      'Mêmes conditions que CEE (artisan RGE, devis AVANT travaux)',
      'Opération éligible inscrite sur la charte « Coup de pouce » signée par le fournisseur',
      'Pour les bonifications « ménages modestes » : RFR sous plafond Anah (catégories bleu / jaune)',
      'Conditions techniques renforcées (Etas PAC ≥ 126 %, etc.)',
    ],
    demarche: [
      {
        name: 'Identifier un délégataire signataire',
        text: 'Liste des signataires « Coup de pouce » publiée sur le site du Ministère de la Transition écologique. Tous les délégataires CEE ne signent pas la charte « Coup de pouce ».',
      },
      {
        name: 'Demander une attestation CEE bonifiée',
        text: "L'attestation doit explicitement mentionner « Coup de pouce » et le montant bonifié. Elle doit dater AVANT le devis.",
      },
      {
        name: 'Signer le devis avec un artisan RGE',
        text: "L'artisan doit fournir un équipement aux performances renforcées (PAC haute performance, isolation R ≥ 7 m²·K/W pour les combles, etc.).",
      },
      {
        name: 'Réaliser les travaux et envoyer la facture',
        text: 'Procédure identique au CEE classique. Versement de la prime sous 4 à 12 semaines après réception complète du dossier.',
      },
    ],
    faqs: [
      {
        question: "Coup de pouce vs MaPrimeRénov' : que choisir ?",
        answer:
          "Pas de choix à faire — les deux se cumulent. MaPrimeRénov' est versée par l'Anah (État), le Coup de pouce par le fournisseur d'énergie (privé). Pour une PAC, vous touchez les deux primes en parallèle. Le total ne peut pas dépasser le coût TTC des travaux.",
      },
      {
        question: "Le Coup de pouce s'arrête-t-il en 2026 ?",
        answer:
          "Le dispositif a été reconduit pour la période P5 du dispositif CEE (jusqu'au 31 décembre 2025) puis pour la P6 (2026-2030) avec des conditions renforcées. Vérifier la liste actualisée des opérations éligibles sur france-renov.gouv.fr car certaines bonifications peuvent évoluer en cours d'année.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5', 'cheque-energie'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/cee/coup-de-pouce',
        label: "France Rénov' — Coup de pouce économies d'énergie",
      },
      {
        url: 'https://www.ecologie.gouv.fr/coup-pouce-economies-denergie',
        label: 'Ministère de la Transition écologique — Coup de pouce',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['coup-de-pouce', 'cee-bonifie', 'sortie-fioul', 'sortie-gaz'],
    temporalCoverage: '2026-01-01/2030-12-31',
  },

  {
    slug: 'maprimeadapt',
    name: "MaPrimeAdapt'",
    tagline: 'Aide Anah pour adapter le logement au vieillissement',
    kind: 'GovernmentService',
    description:
      "MaPrimeAdapt' est une aide de l'Anah pour financer l'adaptation du logement à la perte d'autonomie ou au handicap : installation de douche à l'italienne, monte-escalier, élargissement de portes, salle de bain PMR, etc. Cumulable avec MaPrimeRénov' pour les travaux d'amélioration globale.",
    schemaDescription:
      "Subvention Anah pour les travaux d'adaptation du logement à la perte d'autonomie et au handicap, plafond 70 % du coût des travaux dans la limite de 22 000 € HT (revenus très modestes) ou 50 % dans la limite de 22 000 € HT (revenus modestes).",
    estimatedVolume: 9000,
    category: 'Subvention nationale',
    montants: [
      {
        label: 'Revenus très modestes (bleu)',
        max: '70 % du coût HT',
        condition: 'Plafond 22 000 € HT, soit jusqu’à 15 400 € de prime',
      },
      {
        label: 'Revenus modestes (jaune)',
        max: '50 % du coût HT',
        condition: 'Plafond 22 000 € HT, soit jusqu’à 11 000 € de prime',
      },
    ],
    eligibilite: [
      "Personne âgée de 70 ans et plus, OU 60-69 ans avec perte d'autonomie évaluée (GIR 1 à 6)",
      'Personne en situation de handicap (taux ≥ 50 % ou RQTH)',
      'Logement résidence principale (occupant ou bailleur engagé sous loyer modéré)',
      'Revenus inférieurs aux plafonds Anah (catégories bleu ou jaune)',
      'Travaux réalisés par un professionnel (RGE non systématiquement requis)',
    ],
    demarche: [
      {
        name: "Vérifier l'éligibilité",
        text: "Critères d'âge, de revenus et d'évaluation de perte d'autonomie sur monprojet.anah.gouv.fr. Joindre les justificatifs médicaux ou administratifs.",
      },
      {
        name: "Réaliser un diagnostic d'adaptation",
        text: "Un AMO (Assistant à maîtrise d'ouvrage) agréé Anah réalise le diagnostic et définit les travaux nécessaires. Frais d'AMO pris en charge par l'aide.",
      },
      {
        name: 'Déposer le dossier',
        text: 'Sur monprojet.anah.gouv.fr avant signature du devis. Joindre devis du ou des artisans + justificatifs.',
      },
      {
        name: 'Réaliser les travaux',
        text: "Après accord de l'Anah, signer le devis et faire réaliser les travaux. Délai d'instruction Anah : 2 à 4 mois en moyenne.",
      },
      {
        name: 'Demander le paiement',
        text: 'Sur la base de la facture acquittée. Versement par virement sous 2 à 4 mois.',
      },
    ],
    faqs: [
      {
        question: "MaPrimeAdapt' remplace-t-elle l'aide « Habiter facile » ?",
        answer:
          "Oui. MaPrimeAdapt' a remplacé en janvier 2024 les anciens dispositifs Anah « Habiter facile » et le crédit d'impôt CIPMA. Le dispositif est désormais unifié et géré par l'Anah avec un parcours simplifié sur monprojet.anah.gouv.fr.",
      },
      {
        question: "Peut-on cumuler MaPrimeAdapt' avec MaPrimeRénov' ?",
        answer:
          "Oui, sur des travaux distincts. MaPrimeAdapt' finance l'adaptation autonomie (douche PMR, monte-escalier, etc.) et MaPrimeRénov' finance la performance énergétique (isolation, chauffage). Un même chantier peut combiner les deux.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cheque-energie', 'tva-5-5'],
    /* Note : maprimeadapt cumule avec maprimerenov+cheque-energie+tva-5-5
       SUR DES TRAVAUX DISTINCTS (autonomie/handicap vs énergie). Ne cumule
       PAS avec CEE / éco-PTZ / coup-de-pouce qui sont strictement énergie. */
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/maprimeadapt',
        label: "France Rénov' — MaPrimeAdapt'",
      },
      {
        url: 'https://monprojet.anah.gouv.fr/',
        label: 'Anah — Mon Projet',
      },
      {
        url: 'https://www.service-public.fr/particuliers/vosdroits/F37344',
        label: "service-public.fr — MaPrimeAdapt'",
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['maprimeadapt', 'adaptation-logement', 'autonomie', 'handicap', 'anah'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'aide-pompe-a-chaleur',
    name: 'Aides pour pompe à chaleur',
    tagline: "Cumul total : MaPrimeRénov' + CEE + TVA 5,5 % + éco-PTZ",
    kind: 'FinancialProduct',
    description:
      "L'installation d'une pompe à chaleur (air-eau, géothermique, hybride) est éligible au cumul maximal des aides 2026 : MaPrimeRénov' jusqu'à 5 000 €, prime CEE bonifiée jusqu'à 5 000 €, TVA réduite 5,5 % et éco-PTZ jusqu'à 30 000 €. Total cumulé jusqu'à 90 % du coût d'installation pour les ménages très modestes.",
    schemaDescription:
      "Cumul des aides publiques et privées pour l'installation d'une pompe à chaleur (PAC) air-eau, géothermique ou hybride dans une résidence principale.",
    estimatedVolume: 11000,
    category: 'Prime privée',
    montants: [
      {
        label: 'PAC air-eau — revenus très modestes (cumul max)',
        max: "jusqu’à 11 000 € (MaPrimeRénov' + CEE)",
      },
      {
        label: 'PAC géothermique — revenus très modestes',
        max: "jusqu’à 12 000 € (MaPrimeRénov' + CEE)",
      },
      {
        label: 'PAC air-air (climatisation réversible)',
        max: 'CEE uniquement, ~500 à 1 500 €',
        condition: "Pas éligible MaPrimeRénov'",
      },
      {
        label: 'Coup de pouce sortie fioul/gaz',
        max: '+5 000 € supplémentaires',
        condition: 'Bonification CEE pour ménages modestes',
      },
    ],
    eligibilite: [
      'Logement résidence principale > 15 ans (ou 2 ans pour remplacement chauffage fioul/gaz)',
      "Coefficient d'efficience saisonnière (Etas) ≥ 126 % (PAC air-eau)",
      'Installateur certifié RGE QualiPAC',
      'Devis incluant fourniture + pose',
    ],
    demarche: [
      {
        name: 'Demander 3 devis QualiPAC',
        text: "Demander 3 devis à des installateurs RGE QualiPAC. Le devis doit mentionner le COP (Coefficient de performance) et l'Etas de la PAC choisie.",
      },
      {
        name: "Cumuler MaPrimeRénov' + CEE + TVA + éco-PTZ",
        text: "Déposer le dossier MaPrimeRénov' AVANT signature du devis. Demander en parallèle l'attestation CEE auprès d'un délégataire. La TVA 5,5 % est appliquée automatiquement par l'artisan. L'éco-PTZ se demande à la banque.",
      },
      {
        name: "Réaliser l'installation",
        text: "Pose par l'artisan QualiPAC après accord Anah. Mise en service avec procès-verbal de réception et notice d'utilisation.",
      },
      {
        name: 'Demander les paiements',
        text: "MaPrimeRénov' (versement Anah 2-4 mois), CEE (versement délégataire 4-12 semaines), réduction TVA appliquée à la facture (immédiate).",
      },
    ],
    faqs: [
      {
        question: 'Quelle pompe à chaleur choisir : air-eau, air-air ou géothermique ?',
        answer:
          "PAC air-eau : la plus polyvalente (chauffage + ECS), éligible aux aides MaPrimeRénov' + CEE. PAC géothermique : la plus performante (COP ≥ 4) mais coût d'installation élevé (forage). PAC air-air (climatisation réversible) : seulement éligible CEE, pas MaPrimeRénov'. Pour la performance énergétique, privilégier air-eau ou géothermique.",
      },
      {
        question: 'Peut-on remplacer une chaudière gaz par une PAC en 2026 ?',
        answer:
          "Oui, c'est l'opération la plus aidée en 2026. Cumul possible : MaPrimeRénov' (jusqu'à 5 000 €) + Coup de pouce CEE sortie gaz (jusqu'à 5 000 €) + TVA 5,5 % + éco-PTZ. Pour les ménages très modestes, le reste à charge peut être inférieur à 1 500 € sur une PAC à 12 000 €.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5', 'coup-de-pouce'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/pompe-a-chaleur',
        label: "France Rénov' — Aides pompe à chaleur",
      },
      {
        url: 'https://www.ademe.fr/particuliers-eco-citoyens/habitation/renover-maison/aides-financieres/installer-pompe-chaleur',
        label: 'ADEME — Installer une pompe à chaleur',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['pompe-a-chaleur', 'aide-pac', 'pac-air-eau', 'qualipac', 'sortie-fioul'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'aide-isolation',
    name: 'Aides pour isolation thermique',
    tagline: 'Combles, murs, planchers : économies de 25 à 30 % sur la facture',
    kind: 'FinancialProduct',
    description:
      "L'isolation thermique (combles, murs par l'intérieur ou l'extérieur, planchers bas) reste l'opération la plus rentable en rénovation énergétique. Cumul d'aides 2026 : MaPrimeRénov' au m², CEE jusqu'à 20 €/m², Coup de pouce isolation pour ménages modestes, TVA 5,5 %.",
    schemaDescription:
      "Cumul des aides pour les travaux d'isolation thermique d'un logement résidence principale : isolation des combles, des murs (ITE ou ITI) et des planchers bas.",
    estimatedVolume: 8000,
    category: 'Prime privée',
    montants: [
      {
        label: "Isolation combles — revenus très modestes (MaPrimeRénov' + CEE)",
        max: 'jusqu’à 25 €/m²',
      },
      {
        label: 'Isolation murs ITE — revenus très modestes',
        max: 'jusqu’à 75 €/m²',
        condition: 'Plafond 100 m²',
      },
      {
        label: 'Isolation planchers bas — revenus très modestes',
        max: 'jusqu’à 30 €/m²',
      },
      {
        label: 'Coup de pouce isolation combles — ménages modestes',
        max: '+10 €/m² bonifiés',
      },
    ],
    eligibilite: [
      'Logement résidence principale > 15 ans',
      'Résistance thermique R minimum requise (combles : R ≥ 7 m²·K/W ; murs : R ≥ 3,7 m²·K/W ; planchers : R ≥ 3 m²·K/W)',
      'Artisan RGE Qualibat 7141, 7144 ou équivalent',
      "Devis avant dépôt du dossier MaPrimeRénov' et attestation CEE",
    ],
    demarche: [
      {
        name: 'Évaluer la priorité (audit énergétique recommandé)',
        text: "L'audit énergétique (lui-même aidé jusqu'à 500 €) identifie les déperditions principales : 30 % par la toiture, 25 % par les murs, 10 % par les planchers bas. Prioriser combles puis murs.",
      },
      {
        name: 'Demander 3 devis RGE',
        text: "Comparer 3 devis d'artisans RGE Qualibat ou équivalent. Le devis doit mentionner la résistance thermique R du matériau utilisé (laine minérale, biosourcée, polyuréthane, etc.).",
      },
      {
        name: "Déposer dossier MaPrimeRénov' + CEE",
        text: "Dossier MaPrimeRénov' sur maprimerenov.gouv.fr ET attestation CEE auprès d'un délégataire. Les deux dossiers doivent dater AVANT le devis.",
      },
      {
        name: 'Réaliser les travaux après accord',
        text: "L'artisan pose l'isolant selon les règles de l'art (DTU 45.10 pour combles, DTU 45.11 pour ITE). Conserver les fiches techniques des matériaux.",
      },
    ],
    faqs: [
      {
        question: "L'isolation à 1 € existe-t-elle encore en 2026 ?",
        answer:
          'Non. Le dispositif « isolation à 1 € » a été supprimé en juillet 2021 suite à des dérives massives (artisans non-RGE, pose défectueuse). Le remplacement est le « Coup de pouce isolation » qui exige un artisan RGE et un reste à charge symbolique mais non nul (généralement 50 à 200 € sur 100 m² de combles).',
      },
      {
        question: "Combien de temps avant de récupérer l'investissement isolation ?",
        answer:
          "L'isolation des combles est l'opération la plus rentable : retour sur investissement en 4 à 7 ans selon le climat (zone H1 froide = ROI plus rapide). L'ITE (isolation par l'extérieur) prend 10 à 15 ans pour s'amortir, mais valorise considérablement le bien à la revente (gain DPE 2 à 3 classes).",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5', 'coup-de-pouce'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/isolation',
        label: "France Rénov' — Aides isolation",
      },
      {
        url: 'https://www.ademe.fr/particuliers-eco-citoyens/habitation/renover-maison/isolation',
        label: 'ADEME — Isolation thermique',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['isolation', 'isolation-combles', 'ite', 'aide-isolation', 'qualibat-7141'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'aide-fenetres',
    name: 'Aides pour fenêtres double vitrage',
    tagline: "Remplacement simple vitrage : MaPrimeRénov' + CEE 2026",
    kind: 'FinancialProduct',
    description:
      "Le remplacement de fenêtres simple vitrage par du double vitrage à isolation renforcée (Uw ≤ 1,3 W/m²·K) est éligible à MaPrimeRénov' (forfait par fenêtre selon revenus), à la prime CEE et à la TVA 5,5 %. Conseillé en complément d'une isolation des murs ou combles.",
    schemaDescription:
      'Cumul des aides pour le remplacement de fenêtres simple vitrage par double vitrage à isolation renforcée dans un logement résidence principale.',
    estimatedVolume: 15000,
    category: 'Prime privée',
    montants: [
      {
        label: "MaPrimeRénov' fenêtre — revenus très modestes (bleu)",
        max: '100 €/fenêtre',
      },
      {
        label: "MaPrimeRénov' fenêtre — revenus modestes (jaune)",
        max: '80 €/fenêtre',
      },
      {
        label: "MaPrimeRénov' fenêtre — revenus intermédiaires (violet)",
        max: '40 €/fenêtre',
      },
      {
        label: 'Prime CEE fenêtre',
        max: 'jusqu’à 100 €/fenêtre',
        condition: 'Variable selon délégataire et zone climatique',
      },
    ],
    eligibilite: [
      'Logement résidence principale > 15 ans',
      'Coefficient Uw ≤ 1,3 W/m²·K (double vitrage à isolation renforcée)',
      'Artisan RGE Qualibat 3501 ou équivalent (menuisier RGE)',
      "Remplacement de simple vitrage uniquement (le remplacement double-vitrage par triple-vitrage n'est pas éligible MaPrimeRénov')",
    ],
    demarche: [
      {
        name: 'Vérifier les performances du modèle',
        text: 'Coefficient Uw ≤ 1,3 W/m²·K obligatoire. Demander la fiche technique du modèle (label CEKAL ou Acotherm) sur le devis.',
      },
      {
        name: 'Choisir un menuisier RGE',
        text: 'Qualibat 3501 (menuiserie extérieure) ou équivalent. Vérifier la qualification active à la signature du devis.',
      },
      {
        name: "Cumuler MaPrimeRénov' + CEE + TVA",
        text: "Dossier MaPrimeRénov' AVANT devis. Attestation CEE en parallèle. TVA 5,5 % appliquée automatiquement.",
      },
      {
        name: "Réaliser l'installation",
        text: "Pose par l'artisan avec respect des normes d'étanchéité à l'air (DTU 36.5). Conserver les certificats CEKAL ou Acotherm.",
      },
    ],
    faqs: [
      {
        question: 'Combien coûte le remplacement de fenêtres en 2026 ?',
        answer:
          "Le coût moyen d'une fenêtre PVC double vitrage posée est de 600 à 1 200 € (fourniture + pose). Pour de l'aluminium ou du bois exotique, comptez 1 200 à 2 500 €. Avant aides, une rénovation de 8 fenêtres représente 5 000 à 16 000 €. Après cumul MaPrimeRénov' + CEE + TVA 5,5 %, le reste à charge peut être divisé par 2 pour les ménages modestes.",
      },
      {
        question: 'Le triple vitrage est-il éligible aux aides ?',
        answer:
          "Le triple vitrage est éligible à MaPrimeRénov' UNIQUEMENT s'il remplace du simple vitrage. Le passage de double vers triple n'est pas éligible. En zones H2/H3, le triple vitrage est peu rentable thermiquement et plus lourd : le double vitrage à isolation renforcée (Uw 1,1 W/m²·K) est généralement préférable.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/fenetres',
        label: "France Rénov' — Aides fenêtres",
      },
      {
        url: 'https://www.ademe.fr/particuliers-eco-citoyens/habitation/renover-maison/isolation-fenetres',
        label: 'ADEME — Isolation des fenêtres',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['fenetre-double-vitrage', 'aide-fenetre', 'menuiserie-rge', 'qualibat-3501'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'aide-chaudiere',
    name: 'Aides pour chaudière biomasse',
    tagline: 'Chaudière à granulés ou bûches : alternative au fioul',
    kind: 'FinancialProduct',
    description:
      "La chaudière biomasse (granulés, bûches, plaquettes) est une alternative au chauffage fioul ou gaz éligible à MaPrimeRénov' (jusqu'à 7 000 €) + CEE bonifiés (Coup de pouce sortie fioul/gaz) + TVA 5,5 %. Cumulable avec l'éco-PTZ pour étaler le reste à charge.",
    schemaDescription:
      "Cumul des aides pour le remplacement d'un chauffage fossile par une chaudière à granulés, à bûches ou à plaquettes dans un logement résidence principale.",
    estimatedVolume: 6000,
    category: 'Prime privée',
    montants: [
      {
        label: 'Chaudière granulés — revenus très modestes (bleu)',
        max: '7 000 €',
      },
      {
        label: 'Chaudière granulés — revenus modestes (jaune)',
        max: '5 500 €',
      },
      {
        label: 'Chaudière bûches — revenus très modestes (bleu)',
        max: '5 500 €',
      },
      {
        label: 'Coup de pouce sortie fioul/gaz',
        max: '+4 000 € à +5 000 €',
        condition: 'Bonification CEE',
      },
    ],
    eligibilite: [
      'Logement résidence principale > 15 ans (ou 2 ans pour remplacement fioul/gaz)',
      'Chaudière biomasse à haute performance énergétique (rendement ≥ 87 %, label Flamme Verte 7*)',
      'Installateur certifié RGE QualiBois module Eau',
      'Espace de stockage du combustible (silo granulés ou local bûches)',
    ],
    demarche: [
      {
        name: 'Diagnostic chauffage actuel',
        text: 'Évaluer la consommation actuelle (fioul, gaz, électrique) et la surface à chauffer. Une chaudière granulés convient à partir de 100 m². Pour les surfaces inférieures, un poêle granulés (moins coûteux) peut être préférable.',
      },
      {
        name: 'Choisir un installateur QualiBois',
        text: 'Sélectionner un artisan RGE QualiBois module Eau (chaudière). Le module Air (poêle) ne suffit pas pour la chaudière. Demander la fiche technique du modèle (rendement, label Flamme Verte).',
      },
      {
        name: "Cumuler aides MaPrimeRénov' + CEE",
        text: "Dossier MaPrimeRénov' + attestation CEE bonifiée Coup de pouce sortie fioul/gaz. Total cumulé jusqu'à 12 000 € pour les ménages très modestes.",
      },
      {
        name: 'Installer la chaudière',
        text: "Travaux de gros œuvre possibles (silo granulés, conduit de fumée). L'installateur fournit le procès-verbal de réception et les attestations de conformité.",
      },
    ],
    faqs: [
      {
        question: 'Granulés ou bûches : quelle chaudière biomasse choisir ?',
        answer:
          "Granulés : automatisation totale (chargement automatique depuis silo, allumage piloté), confort proche du gaz/fioul. Coût d'installation 15-25 k€. Bûches : moins automatisé (rechargement manuel), combustible 30-40 % moins cher. Coût d'installation 10-18 k€. La chaudière granulés est éligible à un montant MaPrimeRénov' supérieur (7 000 € vs 5 500 € en bleu).",
      },
      {
        question: 'Combien coûte le combustible biomasse ?',
        answer:
          'En 2026, le prix moyen des granulés bois en vrac est de 380 à 450 €/tonne (livré). Pour une maison de 100 m² bien isolée, comptez 2,5 à 3,5 tonnes/an, soit 950 à 1 600 €/an. Les bûches reviennent à 60-90 €/stère selon la région, soit 600 à 1 100 €/an pour une consommation similaire.',
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5', 'coup-de-pouce'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/chaudiere-biomasse',
        label: "France Rénov' — Aides chaudière biomasse",
      },
      {
        url: 'https://www.ademe.fr/particuliers-eco-citoyens/habitation/renover-maison/chauffage-renouvelable',
        label: 'ADEME — Chauffage au bois',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: [
      'chaudiere-biomasse',
      'chaudiere-granules',
      'qualibois',
      'sortie-fioul',
      'flamme-verte',
    ],
    temporalCoverage: '2026-01-01/2026-12-31',
  },

  {
    slug: 'aide-audit-energetique',
    name: "Aides pour l'audit énergétique",
    tagline: 'Diagnostic obligatoire pour le parcours accompagné',
    kind: 'GovernmentService',
    description:
      "L'audit énergétique est un diagnostic approfondi du logement réalisé par un professionnel certifié. Il identifie les déperditions et propose un scénario de rénovation chiffré. Obligatoire pour le parcours accompagné MaPrimeRénov' (saut ≥ 2 classes DPE). Aidé jusqu'à 500 € pour les ménages très modestes.",
    schemaDescription:
      "Aide MaPrimeRénov' pour la réalisation d'un audit énergétique réglementaire (article R126-30 du Code de la construction et de l'habitation) dans un logement résidence principale.",
    estimatedVolume: 4000,
    category: 'Subvention nationale',
    montants: [
      {
        label: "MaPrimeRénov' audit — revenus très modestes (bleu)",
        max: '500 €',
      },
      {
        label: "MaPrimeRénov' audit — revenus modestes (jaune)",
        max: '400 €',
      },
      {
        label: "MaPrimeRénov' audit — revenus intermédiaires (violet)",
        max: '300 €',
      },
      {
        label: "Coût moyen d'un audit",
        max: '800 à 1 500 €',
        condition: 'Reste à charge faible après aide',
      },
    ],
    eligibilite: [
      'Logement résidence principale > 15 ans',
      'Maison individuelle ou copropriété (audit collectif possible)',
      'Auditeur certifié RGE Études (Qualibat OPQIBI 1905, ICE, BET certifié)',
      "Audit conforme à l'article R126-30 du CCH (méthode 3CL ou TH-C-E ex)",
    ],
    demarche: [
      {
        name: 'Identifier un auditeur RGE Études',
        text: "Liste sur france-renov.gouv.fr. L'auditeur doit avoir une qualification RGE Études (différente du RGE travaux). Vérifier que l'audit suit la méthode 3CL ou TH-C-E ex (réglementaire).",
      },
      {
        name: "Déposer le dossier MaPrimeRénov'",
        text: "Sur maprimerenov.gouv.fr AVANT signature du devis avec l'auditeur. Catégorie d'aide « Audit énergétique ».",
      },
      {
        name: "Réaliser l'audit",
        text: "L'auditeur visite le logement (≥ 2 h sur place), collecte les factures d'énergie (3 ans) et produit un rapport de 30+ pages avec scénarios chiffrés.",
      },
      {
        name: 'Demander le paiement de la prime',
        text: "Sur la base du rapport d'audit + facture acquittée. Versement Anah sous 2 à 4 mois.",
      },
    ],
    faqs: [
      {
        question: 'Audit énergétique vs DPE : quelle différence ?',
        answer:
          "Le DPE (Diagnostic de Performance Énergétique) est obligatoire à la vente ou la location et donne une note A à G. L'audit énergétique va plus loin : il propose des scénarios de rénovation chiffrés avec impact en classes DPE et économies attendues. Il est obligatoire pour le parcours accompagné MaPrimeRénov' (rénovation globale).",
      },
      {
        question: "L'audit énergétique est-il obligatoire pour MaPrimeRénov' ?",
        answer:
          "Pour le parcours par geste (1-2 travaux isolés) : non, l'audit n'est pas obligatoire. Pour le parcours accompagné (saut ≥ 2 classes DPE) : OUI, l'audit énergétique est obligatoire en amont des travaux. Il sert à valider la trajectoire de rénovation auprès de l'Anah.",
      },
      DISCLAIMER_FAQ_BASE,
    ],
    cumulableWith: ['maprimerenov', 'cee', 'tva-5-5'],
    sources: [
      {
        url: 'https://france-renov.gouv.fr/aides/audit-energetique',
        label: "France Rénov' — Aides audit énergétique",
      },
      {
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045773053',
        label: 'Code de la construction — Article R126-30',
      },
    ],
    lastReviewed: REVIEWED,
    keywords: ['audit-energetique', 'dpe', 'rge-etudes', 'opqibi', 'parcours-accompagne'],
    temporalCoverage: '2026-01-01/2026-12-31',
  },
]

/**
 * Lookup table par slug pour O(1). Construite immutablement à l'import.
 */
export const aidesBySlug: Record<string, Aide> = Object.fromEntries(
  aidesCatalog.map((a) => [a.slug, a])
)

/**
 * Garde-fou typé : récupère une aide ou null. Préférer cette fonction à
 * `aidesBySlug[slug]` qui retournerait `undefined` non typé.
 */
export function getAideBySlug(slug: string): Aide | null {
  return aidesBySlug[slug] ?? null
}

/**
 * Liste des slugs valides pour `generateStaticParams` et VALID_AIDES sets.
 */
export const aidesSlugs: readonly string[] = aidesCatalog.map((a) => a.slug)

/**
 * Récupère la liste des aides cumulables pour un slug donné, en garantissant
 * que tous les références cibles existent (filtre les slugs orphelins).
 * Utile pour <RelatedAides /> sans risque de 404.
 */
export function getCumulableAides(slug: string): Aide[] {
  const aide = getAideBySlug(slug)
  if (!aide) return []
  return aide.cumulableWith.map((s) => aidesBySlug[s]).filter((a): a is Aide => a !== undefined)
}
