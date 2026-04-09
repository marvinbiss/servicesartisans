/**
 * RGE qualification guides — editorial content layer
 * ---------------------------------------------------
 * Guides éditoriaux long-format sur les 4 qualifications RGE "métier"
 * délivrées par Qualit'EnR et Qualifelec dans le cadre du dispositif
 * MaPrimeRénov' / CEE :
 *
 *  - QualiPAC  — Pompes à chaleur aérothermiques et géothermiques
 *  - QualiSol  — Solaire thermique (CESI, SSC)
 *  - QualiBois — Chaudières et poêles à bois (Air / Eau)
 *  - Qualifelec RGE — Installations photovoltaïques et électriques renouvelables
 *
 * Ces guides complètent l'annuaire `/rge/[service]` en expliquant au
 * grand public ce que chaque qualification couvre réellement, qui la
 * délivre, comment la vérifier et quelles primes elle ouvre.
 *
 * Source : référentiels Qualit'EnR (2026), Qualifelec (2026) et arrêté
 * du 24 décembre 2015 modifié (conditions d'éligibilité MaPrimeRénov').
 */

export interface RgeQualificationFaqItem {
  question: string
  answer: string
}

export interface RgeQualificationSection {
  heading: string
  paragraphs: string[]
}

export interface RgeQualificationGuide {
  /** Slug d'URL */
  slug: string
  /** Nom officiel de la qualification */
  name: string
  /** Organisme certificateur */
  organisme: string
  /** H1 de la page */
  h1: string
  /** Lede éditorial court */
  lede: string
  /** metaTitle (<= 60 chars) */
  metaTitle: string
  /** metaDescription (<= 158 chars) */
  metaDescription: string
  /** Liste des travaux couverts */
  travauxCouverts: string[]
  /** Fiches CEE débloquées */
  ceeDebloquees: string[]
  /** Sections éditoriales */
  sections: RgeQualificationSection[]
  /** FAQ éditoriale */
  faq: RgeQualificationFaqItem[]
  /** Slug RGE service hub associé (pour cross-linking /rge/[service]) */
  linkedRgeService: string
}

export const RGE_QUALIFICATION_GUIDES: Record<string, RgeQualificationGuide> = {
  qualipac: {
    slug: 'qualipac',
    name: 'QualiPAC',
    organisme: "Qualit'EnR",
    h1: "QualiPAC : la qualification RGE des installateurs de pompes à chaleur",
    lede:
      "Tout savoir sur QualiPAC : périmètre exact, travaux couverts, fiches CEE débloquées et comment vérifier qu'un artisan est réellement titulaire de la qualification.",
    metaTitle: "QualiPAC : qualification RGE pompes à chaleur 2026",
    metaDescription:
      "QualiPAC : qualification RGE Qualit'EnR pour installateurs de PAC aérothermiques et géothermiques. Périmètre, vérification et primes débloquées.",
    travauxCouverts: [
      'Pompes à chaleur air/eau (aérothermie)',
      'Pompes à chaleur eau/eau (géothermie sur nappe)',
      'Pompes à chaleur sol/eau (géothermie horizontale ou verticale)',
      'PAC hybrides gaz/électricité',
      'Chauffe-eau thermodynamiques (module ECS seul)',
    ],
    ceeDebloquees: [
      'BAR-TH-104 — Pompe à chaleur air/eau ou eau/eau',
      'BAR-TH-129 — Pompe à chaleur air/air',
      'BAR-TH-137 — Raccordement d\u2019un bâtiment résidentiel à un réseau de chaleur',
      'BAR-TH-148 — Chauffe-eau thermodynamique',
      'BAR-TH-159 — Pompe à chaleur hybride individuelle',
    ],
    linkedRgeService: 'pompe-a-chaleur',
    sections: [
      {
        heading: "Qui délivre QualiPAC et sur quelles bases\u202f?",
        paragraphs: [
          "QualiPAC est une qualification professionnelle délivrée par Qualit'EnR, association loi 1901 accréditée COFRAC, reconnue par l'État dans le cadre du dispositif RGE (Reconnu Garant de l'Environnement). Elle atteste qu'un installateur a suivi une formation certifiante d'au moins 3 jours, qu'il maîtrise le dimensionnement et la mise en service d'une pompe à chaleur, et qu'il respecte les normes NF EN 14511 et NF EN 14825.",
          "La qualification est attribuée pour une durée de 4 ans, avec un audit terrain obligatoire entre la 2ᵉ et la 3ᵉ année. L'artisan doit fournir une attestation d'assurance décennale couvrant les installations thermiques, justifier d'au moins 2 références clients dans les 12 mois et, depuis 2021, réaliser une visite préalable avant édition du devis.",
        ],
      },
      {
        heading: "Comment vérifier qu'un artisan est bien QualiPAC en 2026",
        paragraphs: [
          "La vérification doit toujours se faire sur le site officiel france-renov.gouv.fr ou directement sur qualit-enr.org/annuaire. Ne jamais se contenter d'un logo QualiPAC sur un devis ou un site web : les usurpations sont fréquentes et détectées chaque année par les obligors CEE.",
          "Sur france-renov, saisissez le SIRET de l'entreprise (pas son nom commercial) et vérifiez la colonne \u00ab\u202fDomaines de travaux reconnus\u202f\u00bb. La mention doit explicitement inclure \u00ab\u202fPompe à chaleur\u202f\u00bb et la date de validité doit être postérieure à la date d'acceptation du devis. Une qualification expirée entre le devis et les travaux reste valable, mais l'inverse est un refus systématique.",
        ],
      },
      {
        heading: "Quelles primes QualiPAC débloque en 2026",
        paragraphs: [
          "QualiPAC est la qualification de référence pour activer 5 fiches CEE (BAR-TH-104, 129, 137, 148, 159), MaPrimeRénov' résidentielle (jusqu'à 5\u202f000\u202f€ pour une PAC air/eau en ménage très modeste au 1er janvier 2026), le Coup de pouce Chauffage (+1\u202f500\u202f€ à +2\u202f000\u202f€ pour le remplacement d'une chaudière fioul) et la TVA à taux réduit de 5,5\u202f%.",
          "Sans QualiPAC (ou une qualification Qualibat 5911 équivalente), aucune de ces aides n'est mobilisable : c'est une condition d'éligibilité prévue par l'arrêté du 24 décembre 2015 modifié. C'est la raison pour laquelle il faut refuser tout devis dont l'artisan n'est pas qualifié, même si le prix affiché est attractif.",
        ],
      },
    ],
    faq: [
      {
        question: "QualiPAC couvre-t-il les PAC air/air\u202f?",
        answer:
          "Oui, QualiPAC module PAC air/air couvre les installations de PAC réversibles (climatiseurs). C'est cette qualification qui ouvre droit à la fiche BAR-TH-129. Vérifiez la mention exacte sur l'attestation.",
      },
      {
        question: "Un artisan Qualibat 5911 peut-il remplacer QualiPAC\u202f?",
        answer:
          "Oui, Qualibat 5911 (installations thermiques de génie climatique, classe 3) est reconnu comme équivalent RGE pour les fiches CEE PAC. En revanche, Qualibat 5912 ou 5931 ne le sont pas.",
      },
      {
        question: "Combien de temps dure QualiPAC\u202f?",
        answer:
          "4 ans à compter de la date de décision du comité technique de Qualit'EnR. Un audit de renouvellement est imposé entre la 2ᵉ et la 3ᵉ année.",
      },
      {
        question: "Que faire si l'artisan refuse de montrer son attestation\u202f?",
        answer:
          "Quittez immédiatement. Un artisan RGE qualifié fournit spontanément son attestation Qualit'EnR datée et nominative avec son devis. Un refus est un signal d'alerte fort.",
      },
    ],
  },

  qualisol: {
    slug: 'qualisol',
    name: 'QualiSol',
    organisme: "Qualit'EnR",
    h1: "QualiSol : la qualification RGE pour le solaire thermique",
    lede:
      "QualiSol atteste la compétence d'un installateur en chauffe-eau solaire individuel (CESI) et en système solaire combiné (SSC). Découvrez son périmètre exact.",
    metaTitle: "QualiSol : qualification RGE solaire thermique 2026",
    metaDescription:
      "QualiSol : qualification RGE Qualit'EnR pour CESI et SSC. Travaux couverts, primes CEE débloquées, vérification officielle et artisans qualifiés.",
    travauxCouverts: [
      'Chauffe-eau solaire individuel (CESI)',
      'Système solaire combiné (SSC) chauffage + ECS',
      'Dispositifs solaires thermiques collectifs en résidentiel',
      'Mise en service et équilibrage des boucles primaires',
    ],
    ceeDebloquees: [
      'BAR-TH-101 — Chauffe-eau solaire individuel',
      'BAR-TH-143 — Système solaire combiné',
    ],
    linkedRgeService: 'panneaux-solaires',
    sections: [
      {
        heading: "Ce que QualiSol couvre exactement",
        paragraphs: [
          "QualiSol est une qualification professionnelle Qualit'EnR reconnue RGE, exclusivement dédiée au solaire thermique (production d'eau chaude sanitaire et/ou de chauffage par capteurs thermiques). Elle ne couvre PAS le photovoltaïque, qui relève de la qualification QualiPV ou Qualifelec RGE selon le cas.",
          "Deux modules existent : QualiSol CESI (chauffe-eau solaire individuel) et QualiSol SSC (système solaire combiné chauffage + ECS). Un artisan peut être titulaire de l'un, de l'autre, ou des deux. Vérifier l'intitulé exact sur l'attestation est indispensable pour éviter les mauvaises surprises sur un chantier.",
        ],
      },
      {
        heading: "Les primes QualiSol débloque en 2026",
        paragraphs: [
          "QualiSol CESI active la fiche CEE BAR-TH-101 (chauffe-eau solaire individuel), MaPrimeRénov' résidentielle (jusqu'à 4\u202f000\u202f€ pour un ménage très modeste) et la TVA à taux réduit de 5,5\u202f%. QualiSol SSC ouvre en plus la fiche BAR-TH-143 (SSC), avec une MaPrimeRénov' pouvant atteindre 10\u202f000\u202f€ pour un SSC en ménage très modeste.",
          "Le solaire thermique est une niche : environ 3\u202f500 chantiers CESI et SSC par an en France, contre plus de 250\u202f000 PAC air/eau. La densité d'artisans QualiSol est faible, avec typiquement 1 à 5 artisans qualifiés par département. Prévoyez un peu plus de temps que pour une PAC classique pour obtenir 3 devis comparatifs.",
        ],
      },
    ],
    faq: [
      {
        question: "QualiSol et QualiPV, quelle différence\u202f?",
        answer:
          "QualiSol = solaire thermique (eau chaude, chauffage). QualiPV = solaire photovoltaïque (production d'électricité). Deux qualifications distinctes, deux installations matérielles différentes.",
      },
      {
        question: "Un artisan QualiSol CESI peut-il poser un SSC\u202f?",
        answer:
          "Non, il doit obtenir en plus le module QualiSol SSC. Les compétences et l'audit terrain sont distincts car le SSC implique le couplage au circuit de chauffage.",
      },
      {
        question: "Combien d'artisans QualiSol en France\u202f?",
        answer:
          "Environ 1\u202f500 entreprises en 2026, soit moins de 10\u202f% du nombre d'artisans QualiPAC. La densité territoriale est plus faible en zone rurale.",
      },
      {
        question: "QualiSol est-il suffisant pour MaPrimeRénov'\u202f?",
        answer:
          "Oui, à condition que la qualification soit active à la date d'acceptation du devis. MaPrimeRénov' reconnaît QualiSol CESI et SSC comme qualifications RGE valides pour le solaire thermique.",
      },
    ],
  },

  qualibois: {
    slug: 'qualibois',
    name: 'QualiBois',
    organisme: "Qualit'EnR",
    h1: "QualiBois : la qualification RGE pour le chauffage au bois",
    lede:
      "QualiBois Air et QualiBois Eau : deux modules distincts pour les poêles et les chaudières biomasse. Comprendre la différence avant de signer un devis.",
    metaTitle: "QualiBois : qualification RGE bois et biomasse 2026",
    metaDescription:
      "QualiBois Air (poêles) et Eau (chaudières biomasse) : qualification RGE Qualit'EnR. Travaux couverts, fiches CEE BAR-TH-112/113 et vérification.",
    travauxCouverts: [
      'Poêles à bûches et à granulés indépendants (QualiBois Air)',
      'Inserts et foyers fermés (QualiBois Air)',
      'Chaudières biomasse individuelles à granulés (QualiBois Eau)',
      'Chaudières biomasse individuelles à plaquettes (QualiBois Eau)',
      'Chaudières biomasse individuelles à bûches (QualiBois Eau)',
    ],
    ceeDebloquees: [
      'BAR-TH-112 — Appareil indépendant de chauffage au bois (QualiBois Air)',
      'BAR-TH-113 — Chaudière biomasse individuelle (QualiBois Eau)',
    ],
    linkedRgeService: 'chauffagiste',
    sections: [
      {
        heading: "Air vs Eau : la distinction critique",
        paragraphs: [
          "QualiBois est une qualification Qualit'EnR divisée en deux modules strictement indépendants. QualiBois Air concerne les appareils indépendants non hydraulisés (poêles, inserts, foyers fermés) qui chauffent par rayonnement et convection directe de l'air ambiant. QualiBois Eau concerne les chaudières biomasse qui chauffent un circuit d'eau alimentant des radiateurs ou un plancher chauffant.",
          "Un artisan peut être titulaire de l'un, de l'autre, ou des deux modules. Les compétences, les normes et les exigences d'audit sont distinctes. C'est la source numéro un de confusion et de refus de dossier CEE : un artisan QualiBois Air ne peut PAS légalement poser une chaudière éligible à BAR-TH-113, et inversement.",
        ],
      },
      {
        heading: "Primes débloquées et performance exigée",
        paragraphs: [
          "QualiBois Air active la fiche CEE BAR-TH-112 (poêle indépendant), avec une prime CEE classique de 500 à 800\u202f€ et jusqu'à 2\u202f500\u202f€ via le Coup de pouce Chauffage. MaPrimeRénov' complète jusqu'à 2\u202f500\u202f€ pour un ménage très modeste au 1er janvier 2026. Le label Flamme Verte 7 étoiles est impératif.",
          "QualiBois Eau active la fiche CEE BAR-TH-113 (chaudière biomasse), qui est l'une des opérations les plus rémunératrices du catalogue DGEC : jusqu'à 5\u202f000\u202f€ de prime CEE pour un ménage très modeste, cumulée à une MaPrimeRénov' pouvant atteindre 10\u202f000\u202f€ pour une chaudière granulés. Le rendement saisonnier minimum est fixé à 87\u202f%.",
        ],
      },
    ],
    faq: [
      {
        question: "Un poêle bouilleur relève-t-il de QualiBois Air ou Eau\u202f?",
        answer:
          "Un poêle bouilleur (poêle hydraulisé raccordé à un ballon d'eau chaude) relève de QualiBois Eau, car il chauffe un circuit hydraulique. QualiBois Air ne couvre que les appareils à convection d'air.",
      },
      {
        question: "Comment savoir si un artisan a les deux modules\u202f?",
        answer:
          "L'attestation Qualit'EnR mentionne explicitement \u00ab\u202fQualiBois Air\u202f\u00bb et/ou \u00ab\u202fQualiBois Eau\u202f\u00bb dans la colonne \u00ab\u202fDomaines reconnus\u202f\u00bb. Sur france-renov.gouv.fr, les deux apparaissent séparément.",
      },
      {
        question: "Flamme Verte 7\u202f étoiles est-il obligatoire\u202f?",
        answer:
          "Pour BAR-TH-112 oui, c'est le seuil minimal DGEC. Pour BAR-TH-113, le label Flamme Verte n'est pas exigé mais un rendement saisonnier de 87\u202f% minimum l'est (selon norme EN 303-5).",
      },
      {
        question: "Un artisan Qualibat peut-il remplacer QualiBois\u202f?",
        answer:
          "Non, pas pour les fiches CEE BAR-TH-112 et BAR-TH-113. Ces opérations exigent spécifiquement QualiBois Air ou Eau, à l'exclusion de toute autre qualification.",
      },
    ],
  },

  qualifelec: {
    slug: 'qualifelec',
    name: 'Qualifelec RGE',
    organisme: 'Qualifelec',
    h1: "Qualifelec RGE : la qualification des électriciens ENR",
    lede:
      "Qualifelec RGE atteste la compétence d'un électricien en installations photovoltaïques, IRVE et pompes à chaleur sur boucle électrique. Périmètre et vérification.",
    metaTitle: "Qualifelec RGE : qualification électricien ENR 2026",
    metaDescription:
      "Qualifelec RGE : qualification délivrée par Qualifelec pour les installations photovoltaïques, bornes IRVE et PAC électriques. Primes débloquées 2026.",
    travauxCouverts: [
      'Installations photovoltaïques raccordées au réseau (PV)',
      'Installations photovoltaïques en autoconsommation',
      'Bornes de recharge pour véhicules électriques (IRVE)',
      'PAC sur boucle électrique (module complémentaire)',
      "Éclairage performant et systèmes de régulation d'énergie",
    ],
    ceeDebloquees: [
      "BAR-EN-104 — Fenêtres ou porte-fenêtres complètes (module électrique associé)",
      "BAR-TH-127 — Ventilation mécanique simple flux hygroréglable",
      "BAT-EQ-127 — Installations de pilotage intelligent (résidentiel collectif)",
    ],
    linkedRgeService: 'electricien',
    sections: [
      {
        heading: "Qualifelec vs Qualit'EnR : deux organismes complémentaires",
        paragraphs: [
          "Qualifelec est l'organisme historique de qualification des entreprises d'électricité en France, créé en 1955. Depuis 2014, Qualifelec délivre des qualifications RGE dans le cadre du dispositif MaPrimeRénov' / CEE, avec deux mentions phares : Qualifelec RGE PV (photovoltaïque) et Qualifelec RGE SER (systèmes énergie renouvelable, dont PAC).",
          "Contrairement à Qualit'EnR qui couvre les métiers thermiques (PAC, solaire thermique, bois), Qualifelec se positionne sur les métiers électriques : le photovoltaïque, les bornes de recharge IRVE et les systèmes de pilotage intelligent. Les deux organismes sont reconnus par l'État au même niveau RGE — il n'y a aucune hiérarchie entre eux.",
        ],
      },
      {
        heading: "Le photovoltaïque sans Qualifelec PV est impossible",
        paragraphs: [
          "Depuis 2020, toute installation photovoltaïque résidentielle bénéficiant de la prime à l'autoconsommation versée par EDF OA ou de MaPrimeRénov' doit impérativement être posée par une entreprise titulaire de Qualifelec RGE mention PV (ou QualiPV Qualit'EnR, qui est équivalent). Sans qualification, le bénéfice du tarif d'achat est refusé.",
          "La vérification se fait sur qualifelec.fr/annuaire ou via france-renov.gouv.fr. L'attestation doit mentionner explicitement \u00ab\u202fmention PV\u202f\u00bb ou \u00ab\u202fmention SER\u202f\u00bb selon le type d'installation. Une attestation Qualifelec générique (sans mention RGE) ne suffit pas : c'est une qualification professionnelle, pas une qualification RGE.",
        ],
      },
    ],
    faq: [
      {
        question: "Qualifelec RGE et QualiPV, quelle différence\u202f?",
        answer:
          "Aucune en pratique pour le ménage : les deux ouvrent les mêmes droits (prime à l'autoconsommation EDF OA, MaPrimeRénov'). QualiPV est délivré par Qualit'EnR, Qualifelec mention PV par Qualifelec. Choisissez l'entreprise, pas l'organisme.",
      },
      {
        question: "Faut-il Qualifelec pour une borne IRVE\u202f?",
        answer:
          "Oui si vous souhaitez bénéficier du crédit d'impôt IRVE (300\u202f€ à 500\u202f€). Depuis 2021, l'installateur doit être titulaire de Qualifelec IRVE (niveau 1, 2 ou 3 selon la puissance).",
      },
      {
        question: "Comment vérifier Qualifelec RGE en 2026\u202f?",
        answer:
          "Sur qualifelec.fr/annuaire avec le SIRET de l'entreprise, ou sur france-renov.gouv.fr. L'attestation doit être datée et nominative, avec mention explicite RGE + la catégorie (PV, SER, IRVE).",
      },
      {
        question: "Un artisan Qualibat électrique peut-il remplacer Qualifelec RGE\u202f?",
        answer:
          "Non. Qualibat ne délivre pas de qualifications RGE pour les métiers électriques. Pour le photovoltaïque, seules Qualifelec RGE PV et QualiPV Qualit'EnR sont reconnues.",
      },
    ],
  },
}

/** Liste des slugs de qualifications RGE ayant un guide éditorial */
export const RGE_QUALIFICATIONS_WITH_GUIDE: string[] = Object.keys(RGE_QUALIFICATION_GUIDES)

/** Lookup safe — retourne null si pas de guide pour ce slug */
export function getRgeQualificationGuide(slug: string): RgeQualificationGuide | null {
  return RGE_QUALIFICATION_GUIDES[slug] ?? null
}

/** True si le slug possède un guide dédié */
export function hasRgeQualificationGuide(slug: string): boolean {
  return slug in RGE_QUALIFICATION_GUIDES
}
