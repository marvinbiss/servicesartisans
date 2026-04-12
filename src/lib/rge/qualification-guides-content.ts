/**
 * RGE qualification guides — editorial content layer
 * ---------------------------------------------------
 * Guides éditoriaux long-format sur les qualifications RGE délivrées par
 * Qualit'EnR, Qualifelec, le CNOA et l'OPQIBI dans le cadre du dispositif
 * MaPrimeRénov' / CEE :
 *
 *  - QualiPAC  — Pompes à chaleur aérothermiques et géothermiques
 *  - QualiSol  — Solaire thermique (CESI, SSC)
 *  - QualiBois — Chaudières et poêles à bois (Air / Eau)
 *  - Qualifelec RGE — Installations photovoltaïques et électriques renouvelables
 *  - QualiPV — Installations photovoltaïques (Qualit'EnR)
 *  - Architecte éligible audit énergétique (CNOA / OPQIBI 1905-1911)
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
  /**
   * Codes opérations CEE pertinents pour cette qualification.
   * Utilisé pour le maillage interne /rge/qualifications/[slug] → /cee/[code]/guide.
   * Ne contient que des codes qui ont un guide éditorial dans CEE_OPERATION_GUIDES.
   */
  linkedCeeOperations: string[]
}

export const RGE_QUALIFICATION_GUIDES: Record<string, RgeQualificationGuide> = {
  qualipac: {
    slug: 'qualipac',
    name: 'QualiPAC',
    organisme: "Qualit'EnR",
    h1: 'QualiPAC : la qualification RGE des installateurs de pompes à chaleur',
    lede: "Tout savoir sur QualiPAC : périmètre exact, travaux couverts, fiches CEE débloquées et comment vérifier qu'un artisan est réellement titulaire de la qualification.",
    metaTitle: 'QualiPAC : qualification RGE pompes à chaleur 2026',
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
      'BAR-TH-171 — Pompe à chaleur air/eau haute performance',
      'BAR-TH-129 — Pompe à chaleur air/air',
      'BAR-TH-137 — Raccordement d\u2019un bâtiment résidentiel à un réseau de chaleur',
      'BAR-TH-148 — Chauffe-eau thermodynamique',
      'BAR-TH-159 — Pompe à chaleur hybride individuelle',
    ],
    linkedRgeService: 'pompe-a-chaleur',
    linkedCeeOperations: ['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'],
    sections: [
      {
        heading: 'Qui délivre QualiPAC et sur quelles bases?',
        paragraphs: [
          "QualiPAC est une qualification professionnelle délivrée par Qualit'EnR, association loi 1901 accréditée COFRAC, reconnue par l'État dans le cadre du dispositif RGE (Reconnu Garant de l'Environnement). Elle atteste qu'un installateur a suivi une formation certifiante d'au moins 3 jours, qu'il maîtrise le dimensionnement et la mise en service d'une pompe à chaleur, et qu'il respecte les normes NF EN 14511 et NF EN 14825.",
          "La qualification est attribuée pour une durée de 4 ans, avec un audit terrain obligatoire entre la 2ᵉ et la 3ᵉ année. L'artisan doit fournir une attestation d'assurance décennale couvrant les installations thermiques, justifier d'au moins 2 références clients dans les 12 mois et, depuis 2021, réaliser une visite préalable avant édition du devis.",
        ],
      },
      {
        heading: "Comment vérifier qu'un artisan est bien QualiPAC en 2026",
        paragraphs: [
          "La vérification doit toujours se faire sur le site officiel france-renov.gouv.fr ou directement sur qualit-enr.org/annuaire. Ne jamais se contenter d'un logo QualiPAC sur un devis ou un site web : les usurpations sont fréquentes et détectées chaque année par les obligés CEE.",
          "Sur france-renov, saisissez le SIRET de l'entreprise (pas son nom commercial) et vérifiez la colonne \u00ab\u202fDomaines de travaux reconnus\u202f\u00bb. La mention doit explicitement inclure \u00ab\u202fPompe à chaleur\u202f\u00bb et la date de validité doit être postérieure à la date d'acceptation du devis. Une qualification expirée entre le devis et les travaux reste valable, mais l'inverse est un refus systématique.",
        ],
      },
      {
        heading: 'Quelles primes QualiPAC débloque en 2026',
        paragraphs: [
          "QualiPAC est la qualification de référence pour activer les fiches CEE PAC en vigueur (BAR-TH-171, BAR-TH-129, BAR-TH-148, BAR-TH-159), MaPrimeRénov' résidentielle (jusqu'à 5\u202f000\u202f€ pour une PAC air/eau en ménage très modeste au 1er janvier 2026), le Coup de pouce Chauffage (+1\u202f500\u202f€ à +2\u202f000\u202f€ pour le remplacement d'une chaudière fioul) et la TVA à taux réduit de 5,5\u202f%.",
          "Sans QualiPAC (ou une qualification Qualibat 5911 équivalente), aucune de ces aides n'est mobilisable : c'est une condition d'éligibilité prévue par l'arrêté du 24 décembre 2015 modifié. C'est la raison pour laquelle il faut refuser tout devis dont l'artisan n'est pas qualifié, même si le prix affiché est attractif.",
        ],
      },
    ],
    faq: [
      {
        question: 'QualiPAC couvre-t-il les PAC air/air?',
        answer:
          "Oui, QualiPAC module PAC air/air couvre les installations de PAC réversibles (climatiseurs). C'est cette qualification qui ouvre droit à la fiche BAR-TH-129. Vérifiez la mention exacte sur l'attestation.",
      },
      {
        question: 'Un artisan Qualibat 5911 peut-il remplacer QualiPAC?',
        answer:
          'Oui, Qualibat 5911 (installations thermiques de génie climatique, classe 3) est reconnu comme équivalent RGE pour les fiches CEE PAC. En revanche, Qualibat 5912 ou 5931 ne le sont pas.',
      },
      {
        question: 'Combien de temps dure QualiPAC?',
        answer:
          "4 ans à compter de la date de décision du comité technique de Qualit'EnR. Un audit de renouvellement est imposé entre la 2ᵉ et la 3ᵉ année.",
      },
      {
        question: "Que faire si l'artisan refuse de montrer son attestation?",
        answer:
          "Quittez immédiatement. Un artisan RGE qualifié fournit spontanément son attestation Qualit'EnR datée et nominative avec son devis. Un refus est un signal d'alerte fort.",
      },
    ],
  },

  qualisol: {
    slug: 'qualisol',
    name: 'QualiSol',
    organisme: "Qualit'EnR",
    h1: 'QualiSol : la qualification RGE pour le solaire thermique',
    lede: "QualiSol atteste la compétence d'un installateur en chauffe-eau solaire individuel (CESI) et en système solaire combiné (SSC). Découvrez son périmètre exact.",
    metaTitle: 'QualiSol : qualification RGE solaire thermique 2026',
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
    linkedCeeOperations: [],
    sections: [
      {
        heading: 'Ce que QualiSol couvre exactement',
        paragraphs: [
          "QualiSol est une qualification professionnelle Qualit'EnR reconnue RGE, exclusivement dédiée au solaire thermique (production d'eau chaude sanitaire et/ou de chauffage par capteurs thermiques). Elle ne couvre PAS le photovoltaïque, qui relève de la qualification QualiPV ou Qualifelec RGE selon le cas.",
          "Deux modules existent : QualiSol CESI (chauffe-eau solaire individuel) et QualiSol SSC (système solaire combiné chauffage + ECS). Un artisan peut être titulaire de l'un, de l'autre, ou des deux. Vérifier l'intitulé exact sur l'attestation est indispensable pour éviter les mauvaises surprises sur un chantier.",
        ],
      },
      {
        heading: 'Les primes QualiSol débloque en 2026',
        paragraphs: [
          "QualiSol CESI active la fiche CEE BAR-TH-101 (chauffe-eau solaire individuel), MaPrimeRénov' résidentielle (jusqu'à 4\u202f000\u202f€ pour un ménage très modeste) et la TVA à taux réduit de 5,5\u202f%. QualiSol SSC ouvre en plus la fiche BAR-TH-143 (SSC), avec une MaPrimeRénov' pouvant atteindre 10\u202f000\u202f€ pour un SSC en ménage très modeste.",
          "Le solaire thermique est une niche : environ 3\u202f500 chantiers CESI et SSC par an en France, contre plus de 250\u202f000 PAC air/eau. La densité d'artisans QualiSol est faible, avec typiquement 1 à 5 artisans qualifiés par département. Prévoyez un peu plus de temps que pour une PAC classique pour obtenir 3 devis comparatifs.",
        ],
      },
    ],
    faq: [
      {
        question: 'QualiSol et QualiPV, quelle différence?',
        answer:
          "QualiSol = solaire thermique (eau chaude, chauffage). QualiPV = solaire photovoltaïque (production d'électricité). Deux qualifications distinctes, deux installations matérielles différentes.",
      },
      {
        question: 'Un artisan QualiSol CESI peut-il poser un SSC?',
        answer:
          "Non, il doit obtenir en plus le module QualiSol SSC. Les compétences et l'audit terrain sont distincts car le SSC implique le couplage au circuit de chauffage.",
      },
      {
        question: "Combien d'artisans QualiSol en France?",
        answer:
          "Environ 1\u202f500 entreprises en 2026, soit moins de 10\u202f% du nombre d'artisans QualiPAC. La densité territoriale est plus faible en zone rurale.",
      },
      {
        question: "QualiSol est-il suffisant pour MaPrimeRénov'?",
        answer:
          "Oui, à condition que la qualification soit active à la date d'acceptation du devis. MaPrimeRénov' reconnaît QualiSol CESI et SSC comme qualifications RGE valides pour le solaire thermique.",
      },
    ],
  },

  qualibois: {
    slug: 'qualibois',
    name: 'QualiBois',
    organisme: "Qualit'EnR",
    h1: 'QualiBois : la qualification RGE pour le chauffage au bois',
    lede: 'QualiBois Air et QualiBois Eau : deux modules distincts pour les poêles et les chaudières biomasse. Comprendre la différence avant de signer un devis.',
    metaTitle: 'QualiBois : qualification RGE bois et biomasse 2026',
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
    linkedCeeOperations: ['BAR-TH-112', 'BAR-TH-113'],
    sections: [
      {
        heading: 'Air vs Eau : la distinction critique',
        paragraphs: [
          "QualiBois est une qualification Qualit'EnR divisée en deux modules strictement indépendants. QualiBois Air concerne les appareils indépendants non hydraulisés (poêles, inserts, foyers fermés) qui chauffent par rayonnement et convection directe de l'air ambiant. QualiBois Eau concerne les chaudières biomasse qui chauffent un circuit d'eau alimentant des radiateurs ou un plancher chauffant.",
          "Un artisan peut être titulaire de l'un, de l'autre, ou des deux modules. Les compétences, les normes et les exigences d'audit sont distinctes. C'est la source numéro un de confusion et de refus de dossier CEE : un artisan QualiBois Air ne peut PAS légalement poser une chaudière éligible à BAR-TH-113, et inversement.",
        ],
      },
      {
        heading: 'Primes débloquées et performance exigée',
        paragraphs: [
          "QualiBois Air active la fiche CEE BAR-TH-112 (poêle indépendant), avec une prime CEE classique de 500 à 800\u202f€ et jusqu'à 2\u202f500\u202f€ via le Coup de pouce Chauffage. MaPrimeRénov' complète jusqu'à 2\u202f500\u202f€ pour un ménage très modeste au 1er janvier 2026. Le label Flamme Verte 7 étoiles est impératif.",
          "QualiBois Eau active la fiche CEE BAR-TH-113 (chaudière biomasse), qui est l'une des opérations les plus rémunératrices du catalogue DGEC : jusqu'à 5\u202f000\u202f€ de prime CEE pour un ménage très modeste, cumulée à une MaPrimeRénov' pouvant atteindre 10\u202f000\u202f€ pour une chaudière granulés. Le rendement saisonnier minimum est fixé à 87\u202f%.",
        ],
      },
    ],
    faq: [
      {
        question: 'Un poêle bouilleur relève-t-il de QualiBois Air ou Eau?',
        answer:
          "Un poêle bouilleur (poêle hydraulisé raccordé à un ballon d'eau chaude) relève de QualiBois Eau, car il chauffe un circuit hydraulique. QualiBois Air ne couvre que les appareils à convection d'air.",
      },
      {
        question: 'Comment savoir si un artisan a les deux modules?',
        answer:
          "L'attestation Qualit'EnR mentionne explicitement \u00ab\u202fQualiBois Air\u202f\u00bb et/ou \u00ab\u202fQualiBois Eau\u202f\u00bb dans la colonne \u00ab\u202fDomaines reconnus\u202f\u00bb. Sur france-renov.gouv.fr, les deux apparaissent séparément.",
      },
      {
        question: 'Flamme Verte 7\u202f étoiles est-il obligatoire?',
        answer:
          "Pour BAR-TH-112 oui, c'est le seuil minimal DGEC. Pour BAR-TH-113, le label Flamme Verte n'est pas exigé mais un rendement saisonnier de 87\u202f% minimum l'est (selon norme EN 303-5).",
      },
      {
        question: 'Un artisan Qualibat peut-il remplacer QualiBois?',
        answer:
          "Non, pas pour les fiches CEE BAR-TH-112 et BAR-TH-113. Ces opérations exigent spécifiquement QualiBois Air ou Eau, à l'exclusion de toute autre qualification.",
      },
    ],
  },

  qualifelec: {
    slug: 'qualifelec',
    name: 'Qualifelec RGE',
    organisme: 'Qualifelec',
    h1: 'Qualifelec RGE : la qualification des électriciens ENR',
    lede: "Qualifelec RGE atteste la compétence d'un électricien en installations photovoltaïques, IRVE et pompes à chaleur sur boucle électrique. Périmètre et vérification.",
    metaTitle: 'Qualifelec RGE : qualification électricien ENR 2026',
    metaDescription:
      'Qualifelec RGE : qualification délivrée par Qualifelec pour les installations photovoltaïques, bornes IRVE et PAC électriques. Primes débloquées 2026.',
    travauxCouverts: [
      'Installations photovoltaïques raccordées au réseau (PV)',
      'Installations photovoltaïques en autoconsommation',
      'Bornes de recharge pour véhicules électriques (IRVE)',
      'PAC sur boucle électrique (module complémentaire)',
      "Éclairage performant et systèmes de régulation d'énergie",
    ],
    ceeDebloquees: [
      'BAR-EN-104 — Fenêtres ou porte-fenêtres complètes (module électrique associé)',
      'BAR-TH-127 — Ventilation mécanique simple flux hygroréglable',
      'BAT-EQ-127 — Installations de pilotage intelligent (résidentiel collectif)',
    ],
    linkedRgeService: 'electricien',
    // Qualifelec RGE ENR couvre le raccordement électrique des PAC et CET,
    // d'où le mapping identique à QualiPAC sur les trois fiches PAC/CET.
    linkedCeeOperations: ['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'],
    sections: [
      {
        heading: "Qualifelec vs Qualit'EnR : deux organismes complémentaires",
        paragraphs: [
          "Qualifelec est l'organisme historique de qualification des entreprises d'électricité en France, créé en 1955. Depuis 2014, Qualifelec délivre des qualifications RGE dans le cadre du dispositif MaPrimeRénov' / CEE, avec deux mentions phares : Qualifelec RGE PV (photovoltaïque) et Qualifelec RGE SER (systèmes énergie renouvelable, dont PAC).",
          "Contrairement à Qualit'EnR qui couvre les métiers thermiques (PAC, solaire thermique, bois), Qualifelec se positionne sur les métiers électriques : le photovoltaïque, les bornes de recharge IRVE et les systèmes de pilotage intelligent. Les deux organismes sont reconnus par l'État au même niveau RGE — il n'y a aucune hiérarchie entre eux.",
        ],
      },
      {
        heading: 'Le photovoltaïque sans Qualifelec PV est impossible',
        paragraphs: [
          "Depuis 2020, toute installation photovoltaïque résidentielle bénéficiant de la prime à l'autoconsommation versée par EDF OA ou de MaPrimeRénov' doit impérativement être posée par une entreprise titulaire de Qualifelec RGE mention PV (ou QualiPV Qualit'EnR, qui est équivalent). Sans qualification, le bénéfice du tarif d'achat est refusé.",
          "La vérification se fait sur qualifelec.fr/annuaire ou via france-renov.gouv.fr. L'attestation doit mentionner explicitement \u00ab\u202fmention PV\u202f\u00bb ou \u00ab\u202fmention SER\u202f\u00bb selon le type d'installation. Une attestation Qualifelec générique (sans mention RGE) ne suffit pas : c'est une qualification professionnelle, pas une qualification RGE.",
        ],
      },
    ],
    faq: [
      {
        question: 'Qualifelec RGE et QualiPV, quelle différence?',
        answer:
          "Aucune en pratique pour le ménage : les deux ouvrent les mêmes droits (prime à l'autoconsommation EDF OA, MaPrimeRénov'). QualiPV est délivré par Qualit'EnR, Qualifelec mention PV par Qualifelec. Choisissez l'entreprise, pas l'organisme.",
      },
      {
        question: 'Faut-il Qualifelec pour une borne IRVE?',
        answer:
          "Oui si vous souhaitez bénéficier du crédit d'impôt IRVE (300\u202f€ à 500\u202f€). Depuis 2021, l'installateur doit être titulaire de Qualifelec IRVE (niveau 1, 2 ou 3 selon la puissance).",
      },
      {
        question: 'Comment vérifier Qualifelec RGE en 2026?',
        answer:
          "Sur qualifelec.fr/annuaire avec le SIRET de l'entreprise, ou sur france-renov.gouv.fr. L'attestation doit être datée et nominative, avec mention explicite RGE + la catégorie (PV, SER, IRVE).",
      },
      {
        question: 'Un artisan Qualibat électrique peut-il remplacer Qualifelec RGE?',
        answer:
          "Non. Qualibat ne délivre pas de qualifications RGE pour les métiers électriques. Pour le photovoltaïque, seules Qualifelec RGE PV et QualiPV Qualit'EnR sont reconnues.",
      },
    ],
  },

  qualipv: {
    slug: 'qualipv',
    name: 'QualiPV',
    organisme: "Qualit'EnR",
    h1: 'QualiPV : la qualification RGE des installateurs photovoltaïques',
    lede: "QualiPV atteste la compétence d'un installateur en photovoltaïque raccordé au réseau et en autoconsommation. Périmètre, modules Élec et Bât, vérification et primes 2026.",
    metaTitle: 'QualiPV : qualification RGE photovoltaïque 2026',
    metaDescription:
      "QualiPV : qualification RGE Qualit'EnR pour installateurs photovoltaïques. Modules Élec et Bât, travaux couverts, prime à l'autoconsommation et vérification.",
    travauxCouverts: [
      'Installations photovoltaïques raccordées au réseau (vente totale ou surplus)',
      'Installations photovoltaïques en autoconsommation individuelle',
      'Intégration au bâti (IAB) et surimposition toiture',
      'Mise en service, raccordement et déclaration Consuel',
      'Dimensionnement onduleur, batteries de stockage et micro-onduleurs',
    ],
    ceeDebloquees: [
      "Prime à l'autoconsommation photovoltaïque (EDF OA, arrêté tarifaire)",
      "MaPrimeRénov' photovoltaïque (forfait autoconsommation)",
      'Exonération IR sur revenus de la vente de surplus (≤ 3 kWc)',
    ],
    linkedRgeService: 'panneaux-solaires',
    linkedCeeOperations: [],
    sections: [
      {
        heading: 'QualiPV Élec vs QualiPV Bât : comprendre les deux modules',
        paragraphs: [
          "QualiPV est une qualification Qualit'EnR divisée depuis 2017 en deux modules strictement complémentaires. QualiPV Élec couvre la partie électrique de l'installation photovoltaïque : câblage, raccordement, protection, onduleur, mise en service, Consuel. QualiPV Bât couvre la partie bâtiment : étanchéité de la couverture, fixation des modules, intégration au bâti ou surimposition, reprise de la toiture.",
          "Un artisan doit détenir les deux modules pour installer une centrale photovoltaïque complète de A à Z. En pratique, 85\u202f% des entreprises QualiPV sont titulaires des deux mentions. Vérifier la présence simultanée de \u00ab\u202fQualiPV Élec\u202f\u00bb et \u00ab\u202fQualiPV Bât\u202f\u00bb sur l'attestation évite les litiges en cas de sinistre d'étanchéité ou de panne électrique.",
        ],
      },
      {
        heading: 'QualiPV ou Qualifelec RGE PV : laquelle choisir?',
        paragraphs: [
          "Les deux qualifications sont strictement équivalentes aux yeux de l'administration française : elles ouvrent les mêmes droits (prime à l'autoconsommation EDF OA, MaPrimeRénov', exonération IR sur la vente de surplus). QualiPV est délivrée par Qualit'EnR, Qualifelec RGE mention PV par Qualifelec. L'une n'est pas supérieure à l'autre.",
          "Le choix ne doit donc jamais se faire sur l'organisme certificateur mais sur le profil de l'entreprise : références clients, ancienneté, zone d'intervention, qualité du SAV et transparence du devis (puissance crête, onduleur, garanties produits et pose, durée du chantier). Un installateur historique \u00ab\u202félectricité\u202f\u00bb sera plus souvent Qualifelec, un installateur \u00ab\u202fénergies renouvelables\u202f\u00bb plus souvent QualiPV.",
        ],
      },
      {
        heading: 'Ce que QualiPV débloque concrètement en 2026',
        paragraphs: [
          "Pour toute installation photovoltaïque résidentielle en autoconsommation avec vente de surplus (≤ 9 kWc), QualiPV active la prime à l'autoconsommation versée par EDF OA sur 5 ans : selon l'arrêté tarifaire en vigueur au 1er trimestre 2026, elle varie de 80\u202f€/kWc à 180\u202f€/kWc selon la puissance. Sans QualiPV (ou Qualifelec RGE PV équivalent), cette prime est refusée — tout comme l'obligation d'achat du surplus par EDF OA.",
          "Contrairement au solaire thermique, le photovoltaïque n'ouvre pas de fiche CEE standard (absence de fiche BAR-EN dédiée au PV dans le catalogue DGEC). Les aides sont donc exclusivement : prime autoconsommation EDF OA, MaPrimeRénov' photovoltaïque (forfait modeste), tarif d'achat garanti 20 ans du surplus, et TVA 10\u202f% (au lieu de 20\u202f%) pour les installations ≤ 3 kWc en résidence principale de plus de 2 ans.",
        ],
      },
    ],
    faq: [
      {
        question: "QualiPV est-il obligatoire pour la prime à l'autoconsommation?",
        answer:
          "Oui. Depuis l'arrêté du 9 mai 2017, l'installateur doit obligatoirement être titulaire de QualiPV (ou Qualifelec RGE mention PV) pour que le client bénéficie de la prime à l'autoconsommation et du tarif d'achat EDF OA du surplus.",
      },
      {
        question: 'Peut-on poser soi-même des panneaux et demander la prime?',
        answer:
          "Non. L'auto-installation n'ouvre aucun droit à la prime EDF OA ni à MaPrimeRénov'. L'installation doit être réalisée et mise en service par une entreprise QualiPV ou Qualifelec RGE PV, avec Consuel et attestation de conformité.",
      },
      {
        question: "Combien d'artisans QualiPV en France en 2026?",
        answer:
          "Environ 4\u202f500 entreprises QualiPV recensées par Qualit'EnR, plus 2\u202f000 titulaires Qualifelec RGE PV. Forte concentration dans le Sud-Est, la Nouvelle-Aquitaine et l'Occitanie.",
      },
      {
        question: 'QualiPV couvre-t-il les batteries de stockage?',
        answer:
          "Oui, dans le cadre de QualiPV Élec. Le dimensionnement et la pose de batteries lithium-ion résidentielles font partie du référentiel depuis la mise à jour 2022. Vérifier que l'entreprise a une expérience documentée du stockage avant de signer.",
      },
    ],
  },

  'architecte-audit-energetique': {
    slug: 'architecte-audit-energetique',
    name: 'Architecte éligible audit énergétique',
    organisme: 'CNOA / OPQIBI',
    h1: "Architectes et bureaux d'études éligibles à l'audit énergétique MaPrimeRénov'",
    lede: "Pour toucher l'aide MaPrimeRénov' audit énergétique et accéder au Parcours Accompagné, l'auditeur doit figurer sur la liste officielle tenue par le CNOA et l'OPQIBI. Voici comment vérifier et à quoi sert l'audit.",
    metaTitle: 'Architecte audit énergétique RGE : reconnaissance 2026',
    metaDescription:
      "Architectes et bureaux d'études éligibles à l'audit énergétique MaPrimeRénov' : reconnaissance CNOA/OPQIBI, contenu réglementaire, barèmes et vérification officielle.",
    travauxCouverts: [
      'Audit énergétique réglementaire (arrêté du 30 mars 2020 modifié)',
      'Scénarios de travaux avec 2 propositions minimum dont un "scenario performant"',
      'Évaluation de la consommation conventionnelle (kWh/m²/an) avant/après',
      "Chiffrage indicatif des travaux et des aides (MaPrimeRénov', CEE, éco-PTZ)",
      'Rendu graphique, plans et estimation du gain énergétique (classe DPE visée)',
    ],
    ceeDebloquees: [
      "MaPrimeRénov' audit énergétique (forfait 300\u202f€ à 500\u202f€ selon revenus)",
      "Porte d'entrée obligatoire du Parcours Accompagné MaPrimeRénov' (rénovation d'ampleur)",
      "Conditionne l'obtention des bonus 2 sauts, 3 sauts et 4 sauts de classe DPE",
    ],
    linkedRgeService: 'renovation-energetique',
    linkedCeeOperations: [],
    sections: [
      {
        heading: "Ce qu'est réellement cette reconnaissance RGE",
        paragraphs: [
          "Les architectes et bureaux d'études thermiques ne passent pas par Qualit'EnR ni Qualibat : ils sont référencés sur deux listes officielles publiées et mises à jour par le CNOA (Conseil National de l'Ordre des Architectes) et l'OPQIBI (Organisme Professionnel de Qualification de l'Ingénierie Bâtiment et Infrastructure). Seul un professionnel inscrit sur l'une de ces listes peut réaliser un audit énergétique réglementaire ouvrant droit à MaPrimeRénov' audit.",
          "La reconnaissance repose sur l'arrêté du 30 mars 2020 modifié, qui définit le contenu minimal d'un audit énergétique incitatif. Elle est conditionnée à une formation initiale (architecte DPLG/HMONP ou ingénieur thermicien), à une attestation d'assurance RC professionnelle couvrant la mission d'audit, et à une formation continue documentée sur les méthodes de calcul (3CL-DPE, Th-BCE, STD).",
        ],
      },
      {
        heading: "Comment vérifier qu'un architecte est bien éligible en 2026",
        paragraphs: [
          "Deux sources officielles à consulter selon le profil du professionnel. Pour un architecte : l'annuaire du CNOA sur architectes.org, filtre « audit énergétique MaPrimeRénov' ». Pour un bureau d'études thermiques : le site opqibi.com, rubrique « recherche qualifiés », filtre qualification 1905 (audit énergétique des maisons individuelles) ou 1911 (audit énergétique tertiaire).",
          "Une simple mention « RGE » sur un site web d'architecte ne suffit pas : la reconnaissance audit énergétique est une référence distincte, qui ne s'obtient pas automatiquement avec le diplôme. Exigez le numéro d'inscription au tableau de l'Ordre et vérifiez-le sur la base CNOA, puis croisez avec france-renov.gouv.fr/annuaire-rge qui consolide les deux sources.",
        ],
      },
      {
        heading: "À quoi sert réellement l'audit énergétique en 2026",
        paragraphs: [
          "Depuis le 1er avril 2023, l'audit énergétique réglementaire est obligatoire avant la vente d'un logement classé F ou G au DPE (puis E à partir de 2025, D à partir de 2034). Il est aussi la porte d'entrée obligatoire du Parcours Accompagné MaPrimeRénov' pour toute rénovation d'ampleur visant au moins 2 sauts de classe DPE — lui-même indispensable pour mobiliser les forfaits les plus élevés (jusqu'à 90\u202f% des travaux financés pour les ménages très modestes, avec un plafond de 70\u202f000\u202f€ pour 4 sauts).",
          "MaPrimeRénov' finance l'audit lui-même à hauteur de 300\u202f€ (ménages intermédiaires ou supérieurs) à 500\u202f€ (ménages modestes et très modestes). L'audit réalisé par un professionnel non reconnu ne déclenche aucune aide — ni pour l'audit, ni pour les travaux qui en découlent. C'est un point critique à vérifier AVANT de signer une mission.",
        ],
      },
    ],
    faq: [
      {
        question: 'Quelle différence avec un DPE?',
        answer:
          "Le DPE (diagnostic de performance énergétique) est une estimation rapide réglementaire (~200-400\u202f€), l'audit énergétique est une étude approfondie (~800-1500\u202f€) qui propose 2 scénarios chiffrés de travaux avec gain de classe. Seul l'audit ouvre MaPrimeRénov' Parcours Accompagné.",
      },
      {
        question: "Mon architecte n'est pas sur la liste, est-ce grave?",
        answer:
          "Oui si vous comptez mobiliser MaPrimeRénov' audit ou le Parcours Accompagné : l'audit sera refusé. Un audit « volontaire » réalisé par un professionnel non reconnu peut être pédagogiquement utile mais n'ouvre aucune aide publique.",
      },
      {
        question: "Combien d'architectes reconnus en France?",
        answer:
          "Environ 1\u202f200 architectes et 3\u202f400 bureaux d'études qualifiés OPQIBI 1905/1911 sont référencés en 2026, selon les dernières données consolidées par l'ANAH et le CNOA.",
      },
      {
        question: 'Combien de temps dure la reconnaissance?',
        answer:
          "La qualification OPQIBI est délivrée pour 4 ans avec audit de renouvellement. La reconnaissance CNOA audit énergétique est liée à l'inscription active au tableau de l'Ordre et à la formation continue.",
      },
    ],
  },

  'qualibat-5911-thermique': {
    slug: 'qualibat-5911-thermique',
    name: 'Qualibat 5911 — Installation de systèmes thermiques',
    organisme: 'Qualibat',
    h1: 'Qualibat 5911 : la qualification RGE des installateurs de systèmes thermiques',
    lede: "Qualibat 5911 couvre l'installation de systèmes thermiques résidentiels — chaudières gaz et fioul à condensation, pompes à chaleur haute performance, systèmes hybrides. Périmètre, obtention et articulation avec QualiPAC.",
    metaTitle: 'Qualibat 5911 : qualification RGE thermique 2026',
    metaDescription:
      "Qualibat 5911 : qualification RGE délivrée par Qualibat pour l'installation de systèmes thermiques (chaudières condensation, PAC, hybrides). Périmètre et obtention.",
    travauxCouverts: [
      'Chaudières gaz à condensation (individuelles et collectives)',
      'Pompes à chaleur air/eau et eau/eau haute performance',
      'Systèmes hybrides PAC + chaudière gaz condensation (BAR-TH-159)',
      'Chauffe-eau thermodynamiques à accumulation',
      'Raccordement aux réseaux de chaleur et sous-stations résidentielles',
    ],
    // Note : l'ancienne BAR-TH-106 (chaudière gaz/fioul condensation) a été
    // abrogée au 01/01/2024, les chaudières fossiles seules ne débloquent
    // plus de CEE en résidentiel existant.
    ceeDebloquees: [
      'BAR-TH-171 — Pompe à chaleur air/eau haute performance',
      'BAR-TH-172 — Pompe à chaleur eau/eau ou géothermique',
      'BAR-TH-129 — Pompe à chaleur air/air (sous conditions)',
      'BAR-TH-148 — Chauffe-eau thermodynamique',
      'BAR-TH-159 — Pompe à chaleur hybride individuelle',
    ],
    linkedRgeService: 'chauffagiste',
    // BAR-TH-106 abrogée 01/01/2024 — remplacée par BAR-TH-171 (déjà listée)
    linkedCeeOperations: ['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'],
    sections: [
      {
        heading: 'Ce que Qualibat 5911 couvre exactement',
        paragraphs: [
          "Qualibat 5911 est la qualification \u00ab\u202fInstallation de systèmes thermiques\u202f\u00bb délivrée par Qualibat, organisme historique de qualification du bâtiment fondé en 1949. Elle relève de la nomenclature Qualibat chapitre 5 (équipements techniques du bâtiment) et vise spécifiquement les installations de chauffage et de production d'eau chaude sanitaire en secteur résidentiel : pompes à chaleur air/eau et eau/eau, chauffe-eau thermodynamiques, systèmes hybrides PAC + appoint, raccordements aux réseaux de chaleur. Historiquement, 5911 couvrait également les chaudières individuelles gaz ou fioul à condensation — depuis l'abrogation de la BAR-TH-106 au 01/01/2024, ces équipements ne débloquent plus de CEE en résidentiel existant, et MaPrimeRénov' exclut depuis 2023 les énergies fossiles.",
          "Contrairement aux qualifications Qualit'EnR qui sont spécialisées par source d'énergie (QualiPAC pour les PAC, QualiSol pour le solaire thermique, QualiBois pour la biomasse), Qualibat 5911 est une qualification \u00ab\u202flarge\u202f\u00bb qui couvre l'ensemble des technologies thermiques, y compris les énergies fossiles encore partiellement aidées via le dispositif CEE. C'est historiquement la qualification de référence des installateurs chauffagistes \u00ab\u202fgénéralistes\u202f\u00bb, par opposition aux spécialistes ENR.",
        ],
      },
      {
        heading: 'Qualibat 5911 vs QualiPAC : deux approches complémentaires',
        paragraphs: [
          "Qualibat 5911 et QualiPAC ne s'opposent pas, elles se complètent. QualiPAC (Qualit'EnR) est strictement dédié aux pompes à chaleur et atteste d'une maîtrise pointue du dimensionnement, de la mise en service et de la régulation de ce seul équipement. Qualibat 5911 couvre un périmètre plus large incluant les chaudières fossiles condensation, mais avec un niveau d'expertise thermique exigé comparable. Beaucoup d'installateurs chauffagistes historiques détiennent Qualibat 5911 depuis longtemps, puis ajoutent QualiPAC lorsqu'ils renforcent leur activité PAC.",
          "Pour le ménage, l'information pratique est simple : sur les fiches CEE de chauffage en vigueur (BAR-TH-171, BAR-TH-172, BAR-TH-129, BAR-TH-148, BAR-TH-159), les deux qualifications sont reconnues équivalentes par la DGEC et l'ANAH pour déclencher les primes. L'arbitrage se fait donc sur le profil de l'entreprise (références clients, ancienneté, transparence du devis) plutôt que sur l'organisme certificateur. Un artisan qui détient à la fois Qualibat 5911 ET QualiPAC est un signal positif : il maîtrise à la fois l'approche généraliste et la spécialisation PAC.",
        ],
      },
      {
        heading: "Procédure d'obtention et portée exacte",
        paragraphs: [
          "L'obtention de Qualibat 5911 repose sur un dossier d'instruction déposé auprès de Qualibat, incluant les attestations d'assurance décennale couvrant les installations thermiques, les références chantiers des 2 dernières années (au moins 2 à 4 références selon la classe visée), les justificatifs de formation du personnel et l'attestation d'urssaf à jour. Un audit chantier est réalisé par un auditeur Qualibat indépendant pour vérifier la qualité de pose et la conformité aux règles de l'art (DTU 65.x, PGN, normes NF EN).",
          "La qualification est attribuée d'abord en probatoire pendant 2 ans, puis reconfirmée pour 4 ans après un second audit. Elle comporte plusieurs classes (classe 1, 2, 3) selon la puissance et la complexité des installations réalisables : un 5911 classe 3 couvre les plus grosses installations résidentielles et petit tertiaire. Le coût de certification varie selon la taille de l'entreprise et la classe visée, avec un ordre de grandeur généralement compris entre 1\u202f500 et 3\u202f000\u202f€ TTC pour une entreprise artisanale (frais de dossier + audit + cotisation annuelle), auxquels s'ajoutent les frais de renouvellement tous les 4 ans.",
        ],
      },
      {
        heading: "Comment vérifier qu'un artisan est bien Qualibat 5911 en 2026",
        paragraphs: [
          "La vérification doit se faire sur le site officiel qualibat.com/annuaire ou directement sur france-renov.gouv.fr avec le SIRET de l'entreprise (pas son nom commercial). La colonne \u00ab\u202fDomaines de travaux reconnus\u202f\u00bb doit explicitement inclure le code 5911 et la mention \u00ab\u202fRGE\u202f\u00bb (attention : Qualibat délivre également des qualifications non-RGE, seules celles portant la mention RGE ouvrent les aides).",
          "La date de validité du certificat doit être postérieure à la date d'acceptation du devis par le ménage. Un certificat qui expire pendant le chantier reste valable, mais un certificat expiré à la signature entraîne un refus systématique du dossier CEE et MaPrimeRénov'. N'acceptez jamais une photo floue de certificat : exigez le document original Qualibat daté et nominatif, et croisez-le avec l'annuaire en ligne.",
        ],
      },
      {
        heading: "Intérêt de Qualibat 5911 pour l'artisan",
        paragraphs: [
          "Pour un artisan chauffagiste, Qualibat 5911 est l'un des sésames commerciaux les plus importants du secteur résidentiel : il débloque simultanément l'accès aux fiches CEE BAR-TH-171, BAR-TH-172, BAR-TH-129, BAR-TH-148 et BAR-TH-159, à MaPrimeRénov' (qui exclut depuis 2023 les énergies fossiles) et à la TVA 5,5\u202f%. Un chauffagiste non-RGE se coupe de facto de 80 à 90\u202f% du marché résidentiel de la rénovation énergétique.",
          "La qualification est également une preuve de sérieux reconnue par les obligés CEE, les assureurs et les maîtres d'ouvrage. Elle facilite l'accès aux appels d'offres publics et aux marchés de rénovation encadrée (Parcours Accompagné MaPrimeRénov', BAR-TH-174 qui remplace depuis 2024 l'ancienne BAR-TH-164 abrogée). L'investissement de certification et de maintien (formation continue, audits, cotisation) s'amortit en pratique dès le premier chantier CEE facturé. La question n'est donc pas \u00ab\u202ffaut-il obtenir Qualibat 5911\u202f\u00bb mais \u00ab\u202fquand la passer\u202f\u00bb.",
        ],
      },
    ],
    faq: [
      {
        question: 'Qualibat 5911 remplace-t-il QualiPAC pour une fiche CEE PAC?',
        answer:
          "Oui. Qualibat 5911 (classe 3) est explicitement reconnu équivalent à QualiPAC pour les fiches CEE BAR-TH-171 (PAC air/eau haute performance) et BAR-TH-148 (CET), à condition que la qualification soit active et portant la mention RGE à la date d'acceptation du devis. Pour BAR-TH-129 (PAC air/air), Qualit'EnR recommande QualiPAC mention air/air spécifiquement, mais Qualibat 5911 peut rester accepté selon l'obligé — à vérifier au cas par cas.",
      },
      {
        question: 'Quelle différence entre Qualibat 5911 et Qualibat 5912?',
        answer:
          "Qualibat 5911 couvre l'installation de systèmes thermiques individuels complets (chaudières, PAC, systèmes hybrides) en secteur résidentiel et petit tertiaire. Qualibat 5912 est une qualification de classe inférieure, dédiée à la maintenance et au dépannage des installations thermiques existantes. Pour poser un équipement neuf éligible CEE, c'est bien Qualibat 5911 qui est exigé, pas 5912.",
      },
      {
        question: "Combien coûte l'obtention de Qualibat 5911 pour un artisan?",
        answer:
          "Ordre de grandeur de 1\u202f500 à 3\u202f000\u202f€ TTC pour une entreprise artisanale : frais de dossier d'instruction, audit chantier Qualibat, cotisation annuelle Qualibat et formation continue obligatoire. Les frais exacts dépendent de la taille de l'entreprise, de la classe visée et des options (mention RGE + Éco-Artisan). Le chiffrage précis s'obtient en demandant un devis directement à Qualibat.",
      },
      {
        question: 'La mention RGE est-elle automatique sur Qualibat 5911?',
        answer:
          "Non. Qualibat 5911 de base est une qualification professionnelle qui n'ouvre pas les aides publiques. Pour activer les primes CEE et MaPrimeRénov', l'entreprise doit demander spécifiquement la mention RGE, qui implique une formation complémentaire et un engagement sur les règles de l'art ENR. Toujours exiger un certificat avec la mention \u00ab\u202fRGE\u202f\u00bb explicitement imprimée et vérifier sur france-renov.gouv.fr.",
      },
    ],
  },

  'qualibat-7131-isolation': {
    slug: 'qualibat-7131-isolation',
    name: "Qualibat 7131 — Isolation thermique par l'intérieur",
    organisme: 'Qualibat',
    h1: "Qualibat 7131 : la qualification RGE des isolateurs par l'intérieur",
    lede: "Qualibat 7131 atteste la compétence d'un artisan en isolation thermique par l'intérieur : combles perdus, combles aménagés, rampants, planchers bas et murs intérieurs.",
    metaTitle: 'Qualibat 7131 : qualification RGE isolation ITI 2026',
    metaDescription:
      "Qualibat 7131 : qualification RGE Qualibat pour l'isolation thermique par l'intérieur (combles, rampants, murs intérieurs). Primes CEE et MaPrimeRénov'.",
    travauxCouverts: [
      'Isolation des combles perdus (laine soufflée, rouleaux)',
      'Isolation des combles aménagés et rampants de toiture',
      'Isolation des planchers bas sur sous-sol, vide sanitaire ou garage',
      "Isolation thermique des murs par l'intérieur (ITI)",
      'Traitement des ponts thermiques en ITI et étanchéité à l\u2019air',
    ],
    ceeDebloquees: [
      'BAR-EN-101 — Isolation des combles ou toitures',
      'BAR-EN-102 — Isolation des planchers bas',
      'BAR-EN-103 — Isolation des murs',
    ],
    linkedRgeService: 'isolation-thermique',
    linkedCeeOperations: ['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'],
    sections: [
      {
        heading: 'Ce que Qualibat 7131 couvre exactement',
        paragraphs: [
          "Qualibat 7131 est la qualification \u00ab\u202fIsolation thermique\u202f\u00bb délivrée par Qualibat pour l'isolation par l'intérieur (ITI) en secteur résidentiel et tertiaire léger. Elle couvre les travaux d'isolation des combles perdus, des combles aménagés et rampants, des planchers bas (sur sous-sol, vide sanitaire ou garage), et des murs intérieurs par doublage ou contre-cloison. Elle relève de la nomenclature Qualibat chapitre 7 (enveloppe du bâtiment — second œuvre isolation).",
          "Contrairement à Qualibat 7141 qui vise spécifiquement l'isolation thermique extérieure (ITE — bardage, enduit sur isolant), Qualibat 7131 est strictement limitée à l'intérieur du volume bâti. Les matériaux couverts sont larges : laines minérales (verre, roche), laines biosourcées (ouate de cellulose, bois, chanvre, lin), mousses polyuréthane et polystyrène expansé. La qualification ne conditionne pas le choix du matériau mais la maîtrise des règles de pose, de l'étanchéité à l'air et du traitement des ponts thermiques.",
        ],
      },
      {
        heading: 'ITI vs ITE : pourquoi deux qualifications distinctes',
        paragraphs: [
          "L'ITI (isolation thermique par l'intérieur) et l'ITE (isolation thermique par l'extérieur) répondent à deux logiques différentes. L'ITI est plus simple à mettre en œuvre, moins coûteuse, préserve l'aspect extérieur du bâtiment et n'implique pas d'échafaudage lourd ; elle est privilégiée sur les maisons anciennes à façade patrimoniale, les copropriétés où l'ITE est politiquement difficile, et les rénovations ponctuelles pièce par pièce. Son principal inconvénient est la réduction de la surface habitable et la persistance de certains ponts thermiques structurels.",
          "L'ITE est plus performante énergétiquement et supprime la plupart des ponts thermiques, mais elle est plus chère, nécessite un ravalement conjoint et peut poser problème sur les façades en pierre ou avec modénature. Les deux qualifications Qualibat 7131 (ITI) et 7141 (ITE) sont distinctes parce que les règles de l'art, les matériaux et les points de vigilance diffèrent. Un artisan peut cumuler les deux, et beaucoup de spécialistes de l'isolation le font pour couvrir l'ensemble du marché résidentiel.",
        ],
      },
      {
        heading: "Primes CEE et MaPrimeRénov' débloquées",
        paragraphs: [
          "Qualibat 7131 avec mention RGE est la qualification de référence pour activer les trois fiches CEE d'isolation intérieure les plus utilisées : BAR-EN-101 (combles et toitures, exigence R ≥ 7,0 pour les combles perdus), BAR-EN-102 (planchers bas, R ≥ 3,0) et BAR-EN-103 (murs intérieurs, R ≥ 3,7). Elle ouvre également MaPrimeRénov' résidentielle classique (barèmes par m² isolé selon les revenus), le Coup de pouce Isolation et la TVA à taux réduit de 5,5\u202f% (article 278-0 bis A CGI).",
          "Sans une qualification RGE isolation (7131 ou 7141 selon le chantier), aucune de ces aides n'est mobilisable. C'est une condition d'éligibilité prévue par l'arrêté du 24 décembre 2015 modifié, et les obligés CEE vérifient systématiquement le certificat à la date d'acceptation du devis. Un artisan non-RGE se coupe mécaniquement de l'essentiel du marché de la rénovation énergétique aidée.",
        ],
      },
      {
        heading: 'Obtention, coût de certification et renouvellement',
        paragraphs: [
          "L'obtention de Qualibat 7131 repose sur un dossier d'instruction déposé auprès de Qualibat, comprenant les attestations d'assurance décennale couvrant l'isolation, les références chantiers récents (au moins 2 à 4 selon la classe), les justificatifs de formation du personnel et les documents administratifs (URSSAF, fiscal). Un audit chantier est réalisé par un auditeur Qualibat indépendant pour vérifier la qualité de pose (épaisseur, continuité, pare-vapeur, étanchéité à l'air) et la conformité aux DTU 45 (isolation thermique par l'intérieur).",
          "La qualification est attribuée en probatoire pendant 2 ans, puis reconfirmée pour 4 ans après un second audit. Le coût de certification varie selon la taille de l'entreprise, avec un ordre de grandeur typique de 1\u202f500 à 3\u202f000\u202f€ TTC pour une entreprise artisanale (frais de dossier, audit, cotisation annuelle, mention RGE), auxquels s'ajoutent les frais de renouvellement. La mention RGE n'est pas automatique : elle doit être demandée explicitement et repose sur un engagement complémentaire sur les règles de l'art et la formation continue.",
        ],
      },
      {
        heading: "Intérêt pour l'artisan et pour le client",
        paragraphs: [
          "Pour un artisan isolateur, Qualibat 7131 RGE est la condition d'accès au marché aidé de la rénovation énergétique : sans cette qualification, impossible de facturer des chantiers éligibles CEE ou MaPrimeRénov', ce qui représente l'écrasante majorité de la demande résidentielle en 2026. L'investissement de certification s'amortit en pratique dès les premiers chantiers facturés avec aides, et la qualification renforce la crédibilité commerciale auprès des particuliers et des maîtres d'ouvrage.",
          "Pour le client, choisir un artisan Qualibat 7131 RGE est une garantie sur deux plans : d'abord sur le plan financier (éligibilité CEE, MaPrimeRénov' et TVA 5,5\u202f% sécurisée), ensuite sur le plan technique (audit Qualibat indépendant, respect des DTU, traitement correct des ponts thermiques et de l'étanchéité à l'air). Vérifier systématiquement le certificat sur qualibat.com/annuaire ou france-renov.gouv.fr avec le SIRET de l'entreprise avant signature du devis.",
        ],
      },
    ],
    faq: [
      {
        question: 'Qualibat 7131 vs Qualibat 7141 : quelle différence?',
        answer:
          "Qualibat 7131 couvre l'isolation thermique par l'intérieur (ITI) : combles perdus, combles aménagés, rampants, planchers bas et murs intérieurs. Qualibat 7141 couvre l'isolation thermique par l'extérieur (ITE) : bardage rapporté et enduit sur isolant. Les deux sont reconnues RGE mais correspondent à des règles de l'art et des DTU différents. Un artisan qui fait les deux doit détenir les deux qualifications.",
      },
      {
        question: 'Faut-il aussi Qualibat 4131 pour certains chantiers?',
        answer:
          "Qualibat 4131 concerne l'isolation des façades par enduit mince sur isolant (ITE enduite), c'est un sous-segment spécifique de l'ITE. Pour une isolation intérieure classique (ITI), Qualibat 7131 suffit. Pour une ITE bardage, c'est 7141. Pour une ITE enduit sur isolant, Qualibat 4131 ou 7141 selon la nomenclature retenue par l'organisme. Vérifier l'intitulé exact sur l'attestation pour éviter toute confusion.",
      },
      {
        question: 'Un artisan Qualibat 7131 peut-il poser tous les matériaux?',
        answer:
          "Oui en principe : la qualification ne restreint pas le choix des matériaux (laines minérales, biosourcées, mousses PU, polystyrène). En revanche, certains matériaux techniques (ouate de cellulose soufflée, insufflation de fibres de bois) requièrent une formation spécifique du personnel et parfois du matériel dédié. Vérifiez que l'entreprise a de l'expérience documentée sur le matériau que vous souhaitez avant signature.",
      },
    ],
  },

  'qualifelec-irve': {
    slug: 'qualifelec-irve',
    name: 'Qualifelec IRVE',
    organisme: 'Qualifelec',
    h1: 'Qualifelec IRVE : la qualification des installateurs de bornes de recharge',
    lede: "Qualifelec IRVE atteste la compétence d'un électricien à installer des bornes de recharge pour véhicules électriques en résidentiel et tertiaire. Niveaux P1, P2, P3 et obligations réglementaires.",
    metaTitle: 'Qualifelec IRVE : qualification installateur bornes VE 2026',
    metaDescription:
      "Qualifelec IRVE : qualification Qualifelec pour l'installation de bornes de recharge (IRVE P1/P2/P3). Cadre réglementaire, crédit d'impôt et vérification officielle.",
    travauxCouverts: [
      'Installation de bornes wallbox résidentielles (3,7 à 22\u202fkW)',
      'Mise en conformité de la section IRVE du tableau électrique',
      'Déploiement de bornes en copropriété et tertiaire (parkings employés, flottes)',
      'Pose de bornes rapides DC (niveau P3, installateurs spécialisés)',
      "Diagnostic et raccordement à la gestion d'énergie du bâtiment",
    ],
    ceeDebloquees: [
      "Crédit d'impôt IRVE résidentiel (300\u202f€ ou 75\u202f% des dépenses plafonnées)",
      'Programme ADVENIR pour le déploiement en copropriété et tertiaire',
      "Obligation d'installateur qualifié IRVE depuis le décret n° 2017-26 du 12 janvier 2017",
    ],
    linkedRgeService: 'electricien',
    linkedCeeOperations: [],
    sections: [
      {
        heading: "Ce qu'est réellement Qualifelec IRVE",
        paragraphs: [
          "Qualifelec IRVE est une qualification professionnelle délivrée par Qualifelec, organisme historique de qualification des entreprises du génie électrique, reconnu par l'État. Elle atteste qu'une entreprise d'électricité a les compétences techniques et réglementaires pour installer des infrastructures de recharge de véhicules électriques (IRVE) dans le respect du cadre réglementaire français. Elle est obligatoire pour toute installation de borne > 3,7\u202fkW depuis le décret n° 2017-26 du 12 janvier 2017.",
          "Attention : Qualifelec IRVE n'est pas une qualification \u00ab\u202fRGE ENR\u202f\u00bb au sens CEE/MaPrimeRénov' (l'installation d'une borne n'est pas une opération de rénovation énergétique standardisée). C'est une qualification d'installateur qui répond à une obligation réglementaire spécifique et conditionne l'éligibilité au crédit d'impôt IRVE et aux subventions du programme ADVENIR. Le rôle de Qualifelec IRVE est donc distinct de celui de QualiPAC ou de Qualibat 5911.",
        ],
      },
      {
        heading: 'Niveaux P1, P2, P3 : trois périmètres distincts',
        paragraphs: [
          "Qualifelec IRVE se décline en trois niveaux selon la typologie d'installation. Niveau P1 : bornes wallbox résidentielles de 3,7 à 22\u202fkW en courant alternatif (AC), installées dans une maison individuelle ou en extérieur privatif. C'est le niveau le plus couramment demandé pour les particuliers équipant leur garage.",
          "Niveau P2 : installations plus complexes en copropriété (parkings résidentiels collectifs) ou en tertiaire (parkings employés, flottes d'entreprise), avec supervision, gestion dynamique de charge et raccordement à un système de facturation. Niveau P3 : bornes rapides et ultra-rapides en courant continu (DC, > 22\u202fkW jusqu'à 350\u202fkW), réservées aux installateurs disposant de moyens lourds et d'une formation avancée spécifique. Pour une maison individuelle, le niveau P1 suffit ; pour une copropriété ou un tertiaire, viser directement un installateur P2.",
        ],
      },
      {
        heading: 'Cadre réglementaire et obligations techniques',
        paragraphs: [
          "Le cadre réglementaire repose sur plusieurs textes imbriqués : le décret n° 2017-26 du 12 janvier 2017 (obligation d'installateur qualifié pour les bornes > 3,7\u202fkW), l'arrêté du 27 octobre 2021 modifiant les règles d'installation des points de recharge, et la norme NF C 15-100 (installations électriques basse tension) qui encadre la section dédiée IRVE dans le tableau électrique.",
          "Les obligations techniques principales : un circuit dédié au tableau avec disjoncteur différentiel 30\u202fmA de type A ou F (selon la technologie de la borne), un conducteur de section adaptée à la puissance souscrite et à la distance de raccordement, une protection contre les surtensions, et une mise à la terre conforme. L'installateur Qualifelec IRVE est formé pour dimensionner et poser ces éléments correctement, là où un électricien généraliste sans qualification IRVE risque des erreurs de dimensionnement ou de protection.",
        ],
      },
      {
        heading: 'Obtention, formation et renouvellement',
        paragraphs: [
          "L'obtention de Qualifelec IRVE passe par une formation certifiante dispensée par un organisme agréé (2 à 3 jours selon le niveau visé), suivie d'un examen théorique et pratique. Le coût de formation + examen est typiquement compris entre 1\u202f500 et 2\u202f500\u202f€ par personne selon l'organisme et le niveau. À cela s'ajoutent les frais de dossier Qualifelec et la cotisation annuelle de l'entreprise à l'organisme.",
          "La qualification est attribuée pour 4 ans, avec un renouvellement qui implique une formation continue et une vérification documentaire. Pour l'entreprise, l'investissement est significatif mais s'amortit rapidement dès que l'activité IRVE devient récurrente — la demande résidentielle et tertiaire est en forte croissance depuis 2022 et continue d'augmenter avec le durcissement des obligations d'équipement des parkings neufs et rénovés.",
        ],
      },
      {
        heading: "Crédit d'impôt client et programme ADVENIR",
        paragraphs: [
          "Pour le particulier, faire appel à un installateur Qualifelec IRVE est une condition d'éligibilité au crédit d'impôt pour l'installation d'un système de charge à domicile, prévu à l'article 200 quater C du CGI. Le montant est plafonné à 300\u202f€ par système de charge et par foyer fiscal (ou 75\u202f% des dépenses TTC dans certaines configurations), selon les règles en vigueur à la date de facturation. Vérifier le barème exact sur impots.gouv.fr avant de signer.",
          "Pour les copropriétés et le tertiaire, le programme ADVENIR (piloté par l'Avere-France) subventionne une partie du coût d'installation des bornes et du pilotage énergétique, avec des taux d'aide variables selon le type d'installation et le bénéficiaire. L'accès à ADVENIR est conditionné à l'intervention d'un installateur Qualifelec IRVE de niveau adapté (P2 pour la copropriété, P1 ou P2 pour la maison individuelle en option pilotée).",
        ],
      },
    ],
    faq: [
      {
        question: 'IRVE P1 ou P2 pour une maison individuelle?',
        answer:
          "Le niveau P1 est suffisant et adapté pour une borne wallbox résidentielle (3,7 à 22\u202fkW) installée dans un garage ou en extérieur privatif chez un particulier. Le niveau P2 est nécessaire pour les installations de copropriété ou de tertiaire avec gestion dynamique de charge et supervision. Pour une maison individuelle, choisir un installateur P1 permet de bénéficier du crédit d'impôt et garantit le respect du décret 2017-26 sans payer pour une qualification supérieure inutile.",
      },
      {
        question: 'Quelle différence avec un simple électricien?',
        answer:
          "Un électricien classique peut réaliser une installation domestique standard, mais la loi (décret n° 2017-26) impose depuis 2017 que toute borne de recharge > 3,7\u202fkW soit installée par une entreprise titulaire de la qualification IRVE. Au-delà du cadre légal, l'installateur IRVE est formé aux règles spécifiques de la NF C 15-100 section IRVE (protection différentielle 30\u202fmA type A ou F, dimensionnement du circuit dédié) et sait dimensionner correctement l'installation en fonction de la puissance souscrite et des usages — ce qu'un électricien non formé risque de sous-dimensionner.",
      },
      {
        question: "Le crédit d'impôt IRVE est-il automatique?",
        answer:
          "Non. Il est conditionné à plusieurs critères cumulatifs : installation réalisée par une entreprise qualifiée Qualifelec IRVE, facture détaillée mentionnant la référence de la borne et son installation, déclaration dans la déclaration de revenus de l'année suivante. Le montant et les plafonds précis évoluent dans le temps : toujours vérifier les règles applicables sur impots.gouv.fr à la date de facturation. Un simple reçu de borne achetée en ligne et posée par soi-même n'ouvre aucun droit au crédit d'impôt.",
      },
    ],
  },

  'qualit-enr': {
    slug: 'qualit-enr',
    name: "Qualit'EnR",
    organisme: "Qualit'EnR",
    h1: "Qualit'EnR : l'organisme qui fédère les 4 qualifications RGE énergies renouvelables",
    lede: "Qualit'EnR est l'association qui délivre QualiPAC, QualiSol, QualiBois et Chauffage+. Comprendre le rôle du hub et choisir la bonne qualification pour son projet.",
    metaTitle: "Qualit'EnR : hub des qualifications RGE ENR 2026",
    metaDescription:
      "Qualit'EnR fédère QualiPAC, QualiSol, QualiBois et Chauffage+. Rôle de l'organisme, vérification des artisans et choix de la qualification adaptée.",
    travauxCouverts: [
      'QualiPAC — pompes à chaleur aérothermiques et géothermiques',
      'QualiSol — solaire thermique (CESI, SSC)',
      'QualiBois — chaudières et poêles biomasse (Air et Eau)',
      'QualiPV — photovoltaïque raccordé réseau et autoconsommation',
      'Chauffage+ — chaudières à condensation et systèmes hybrides',
    ],
    ceeDebloquees: [
      'BAR-TH-171 — PAC air/eau (via QualiPAC)',
      'BAR-TH-101 — Chauffe-eau solaire individuel (via QualiSol CESI)',
      'BAR-TH-143 — Système solaire combiné (via QualiSol SSC)',
      'BAR-TH-112 — Poêle à bois (via QualiBois Air)',
      'BAR-TH-113 — Chaudière biomasse (via QualiBois Eau)',
    ],
    linkedRgeService: 'renovation-energetique',
    linkedCeeOperations: ['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-112', 'BAR-TH-113', 'BAR-TH-148'],
    sections: [
      {
        heading: "Qu'est-ce que Qualit'EnR exactement?",
        paragraphs: [
          "Qualit'EnR est une association loi 1901 créée en 2006, reconnue par l'État et accréditée COFRAC, qui délivre les qualifications professionnelles RGE dédiées aux énergies renouvelables thermiques et au photovoltaïque en France. Son rôle n'est pas d'être une qualification en soi, mais d'être l'organisme certificateur qui porte quatre appellations distinctes correspondant chacune à une famille d'équipements : QualiPAC (pompes à chaleur), QualiSol (solaire thermique), QualiBois (biomasse) et QualiPV (photovoltaïque). Une cinquième appellation, Chauffage+, couvre les chaudières à condensation et les systèmes hybrides.",
          "Contrairement à Qualibat qui est une qualification « large » couvrant un chapitre de nomenclature, Qualit'EnR adopte une logique spécialisée par source d'énergie : un artisan ne détient pas « Qualit'EnR », il détient une ou plusieurs appellations Qualit'EnR selon les équipements qu'il sait poser. C'est une distinction essentielle au moment de vérifier un devis : toujours regarder quelle appellation précise figure sur l'attestation, et non le logo générique Qualit'EnR.",
        ],
      },
      {
        heading: "Les appellations Qualit'EnR en 2026",
        paragraphs: [
          "QualiPAC couvre les pompes à chaleur air/eau, eau/eau, sol/eau, air/air et les chauffe-eau thermodynamiques. QualiSol couvre le solaire thermique avec deux modules distincts (CESI pour l'eau chaude et SSC pour le chauffage combiné). QualiBois couvre les équipements biomasse avec deux modules (Air pour les poêles et inserts, Eau pour les chaudières hydrauliques). QualiPV couvre le photovoltaïque avec deux modules (Élec pour la partie électrique et Bât pour la partie couverture).",
          "Chaque appellation est délivrée pour 4 ans et implique une formation initiale certifiante, un audit chantier entre la 2ᵉ et la 3ᵉ année de validité, une attestation d'assurance décennale couvrant le domaine concerné et un engagement sur les règles de l'art. Les conditions précises (durée de formation, nombre de références exigées, tarif d'adhésion annuelle) sont publiées sur qualit-enr.org et peuvent évoluer : se référer au site officiel avant toute démarche.",
        ],
      },
      {
        heading: 'Comment choisir la bonne appellation selon son projet',
        paragraphs: [
          "Pour une rénovation qui combine plusieurs équipements (par exemple une PAC air/eau + un chauffe-eau solaire + des panneaux photovoltaïques), il faut impérativement vérifier que l'artisan détient les trois appellations correspondantes, ou qu'il sous-traite à des artisans eux-mêmes qualifiés. Une entreprise qui affiche uniquement QualiPAC ne peut pas légalement faire bénéficier son client des aides CEE et MaPrimeRénov' sur la partie solaire thermique ou photovoltaïque.",
          "Le réflexe à avoir : consulter les guides dédiés à chaque appellation (QualiPAC, QualiSol, QualiBois, QualiPV) pour comprendre exactement leur périmètre, et croiser systématiquement l'attestation de l'artisan avec l'annuaire officiel de Qualit'EnR sur qualit-enr.org/annuaire ou avec france-renov.gouv.fr. Le SIRET est la clé de recherche fiable — jamais le nom commercial, qui peut varier.",
        ],
      },
      {
        heading: 'Vérification officielle et sources',
        paragraphs: [
          "Trois sources officielles pour vérifier qu'un artisan détient bien une qualification Qualit'EnR en 2026 : qualit-enr.org/annuaire (base propriétaire de l'organisme), france-renov.gouv.fr/annuaire-rge (base consolidée État, la plus fiable car elle croise les différents certificateurs RGE) et l'attestation nominative datée remise par l'artisan lors de l'établissement du devis. Une simple mention « Qualit'EnR » sur un site web ou une carte de visite ne suffit pas.",
          "Points de vigilance : la date de validité doit être postérieure à la date d'acceptation du devis, l'appellation précise doit couvrir les travaux prévus (QualiPAC ≠ QualiSol ≠ QualiBois), et la mention RGE doit figurer explicitement. Une qualification Qualit'EnR sans mention RGE existe dans certains cas particuliers et n'ouvre pas les aides publiques. Source : référentiels Qualit'EnR publiés sur qualit-enr.org.",
        ],
      },
    ],
    faq: [
      {
        question: "Qualit'EnR est-il une qualification à part entière?",
        answer:
          "Non. Qualit'EnR est l'organisme certificateur qui délivre quatre appellations distinctes (QualiPAC, QualiSol, QualiBois, QualiPV) et Chauffage+. Un artisan ne détient pas « Qualit'EnR » mais une ou plusieurs de ces appellations. Toujours vérifier l'intitulé exact sur l'attestation.",
      },
      {
        question: "Quelle différence entre Qualit'EnR et Qualibat?",
        answer:
          "Qualit'EnR est spécialisé par source d'énergie renouvelable (PAC, solaire, bois, photovoltaïque), Qualibat est un organisme généraliste du bâtiment qui couvre un large éventail de métiers via une nomenclature chapitrée. Les deux sont reconnus RGE par l'État au même niveau pour les opérations qu'ils couvrent.",
      },
      {
        question: "Un artisan peut-il détenir plusieurs appellations Qualit'EnR?",
        answer:
          "Oui, et c'est fréquent. Beaucoup de spécialistes ENR détiennent QualiPAC + QualiSol, ou QualiBois Air + Eau, ou QualiPV Élec + Bât. Chaque appellation est délivrée indépendamment et suppose sa propre formation et ses propres audits.",
      },
      {
        question: "Comment vérifier une qualification Qualit'EnR en 2026?",
        answer:
          "Sur qualit-enr.org/annuaire ou sur france-renov.gouv.fr/annuaire-rge, en recherchant par SIRET (pas par nom commercial). Vérifier l'appellation exacte, la date de validité postérieure au devis et la mention RGE. Voir site officiel pour le détail des conditions en vigueur.",
      },
    ],
  },

  'eco-artisan': {
    slug: 'eco-artisan',
    name: 'Éco Artisan RGE',
    organisme: 'Qualibat (label FFB)',
    h1: 'Éco Artisan RGE : le label FFB de la rénovation énergétique globale',
    lede: 'Éco Artisan est un label de la Fédération Française du Bâtiment délivré par Qualibat avec mention RGE. Il atteste une démarche qualité en rénovation énergétique globale : évaluation thermique, conseil client, suivi de chantier.',
    metaTitle: 'Éco Artisan RGE : le label FFB de rénovation 2026',
    metaDescription:
      "Éco Artisan RGE : label FFB délivré par Qualibat pour la rénovation énergétique globale. Critères, périmètre, vérification et articulation avec MaPrimeRénov'.",
    travauxCouverts: [
      'Évaluation thermique globale du logement avant travaux',
      'Conseil personnalisé au client sur le bouquet de travaux optimal',
      'Rénovation énergétique multi-postes (isolation, chauffage, ventilation, menuiseries)',
      "Suivi de chantier et accompagnement documentaire MaPrimeRénov'",
      'Engagement qualité FFB sur la durée et le service après-vente',
    ],
    ceeDebloquees: [
      "Accès aux fiches CEE correspondant aux métiers détenus par l'artisan",
      "MaPrimeRénov' classique et Parcours Accompagné (sous conditions)",
      "TVA à taux réduit 5,5 % sur les travaux d'amélioration énergétique",
    ],
    linkedRgeService: 'renovation-energetique',
    linkedCeeOperations: ['BAR-TH-171', 'BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'],
    sections: [
      {
        heading: "Ce qu'est réellement le label Éco Artisan",
        paragraphs: [
          "Éco Artisan est un label créé par la Fédération Française du Bâtiment (FFB) et porté par Qualibat dans le cadre d'une convention de délivrance. Il s'adresse aux entreprises du bâtiment qui souhaitent afficher un engagement qualité sur la rénovation énergétique globale, au-delà de la simple pose d'un équipement isolé. La mention RGE est associée au label lorsque l'entreprise détient une qualification Qualibat RGE sous-jacente couvrant les travaux effectivement réalisés.",
          "Concrètement, Éco Artisan n'est pas une qualification « métier » comme Qualibat 5911 (thermique) ou Qualibat 7131 (isolation intérieure) : c'est un label de démarche qui s'ajoute à une ou plusieurs qualifications Qualibat existantes. L'entreprise labellisée s'engage sur trois piliers : une évaluation thermique préalable au devis, un conseil personnalisé sur le bouquet de travaux, et un suivi qualité après chantier. Source : eco-artisan.net et documentation FFB.",
        ],
      },
      {
        heading: "Critères d'obtention et engagement qualité",
        paragraphs: [
          "L'obtention du label Éco Artisan repose sur plusieurs critères cumulatifs : détenir au moins une qualification Qualibat RGE dans un domaine pertinent pour la rénovation énergétique (isolation, thermique, menuiseries, ventilation), justifier d'une formation spécifique à l'évaluation thermique et au conseil client, fournir une attestation d'assurance décennale couvrant les travaux visés, et signer la charte FFB Éco Artisan qui formalise l'engagement sur la démarche qualité.",
          "Le label est délivré par Qualibat avec mention RGE, ce qui permet à l'entreprise labellisée de faire bénéficier ses clients des aides publiques (MaPrimeRénov', CEE, TVA 5,5 %) sur les travaux correspondant à sa qualification sous-jacente. Les conditions précises (durée de formation, tarif d'adhésion FFB, modalités d'audit) sont publiées sur eco-artisan.net et évoluent dans le temps : se référer au site officiel avant toute démarche.",
        ],
      },
      {
        heading: 'Éco Artisan ou qualification Qualibat classique : quelle différence?',
        paragraphs: [
          "Une qualification Qualibat classique (5911 thermique, 7131 isolation intérieure, 7141 ITE, etc.) est une qualification métier qui atteste la compétence technique sur un corps d'état spécifique. Le label Éco Artisan, lui, atteste une démarche qualité globale sur la rénovation énergétique : il implique un conseil amont au client, une vision d'ensemble du projet (pas seulement « je pose un équipement ») et un suivi post-chantier. Pour le ménage, l'intérêt est d'avoir un interlocuteur capable d'articuler plusieurs postes de travaux et d'orienter vers les bonnes aides.",
          "Dans la pratique, une entreprise Éco Artisan détient presque toujours plusieurs qualifications Qualibat RGE sous-jacentes (par exemple 5911 + 7131 + 7141) pour pouvoir réaliser elle-même un bouquet multi-postes, ou à défaut travaille en co-traitance avec d'autres artisans qualifiés. Le label n'est donc pas un substitut aux qualifications techniques : il s'ajoute à elles. Vérifier toujours que l'entreprise détient les qualifications Qualibat correspondant aux travaux que l'on veut faire réaliser.",
        ],
      },
      {
        heading: 'Vérification officielle et sources',
        paragraphs: [
          "Pour vérifier qu'une entreprise est bien labellisée Éco Artisan RGE en 2026, trois sources officielles : eco-artisan.net (annuaire FFB du label), qualibat.com/annuaire (base Qualibat qui liste les qualifications RGE sous-jacentes) et france-renov.gouv.fr/annuaire-rge (base État consolidée). Toujours rechercher par SIRET de l'entreprise, jamais par nom commercial, et croiser les résultats entre ces trois sources pour fiabiliser la vérification.",
          "Points de vigilance : le label Éco Artisan seul ne suffit pas à ouvrir les aides publiques ; il faut que l'entreprise détienne aussi la qualification Qualibat RGE couvrant le type de travaux prévu, avec une date de validité postérieure à la date d'acceptation du devis. Une mention « Éco Artisan » sans qualification RGE sous-jacente active ne donne droit à aucune prime CEE ni à MaPrimeRénov'. Source : eco-artisan.net et france-renov.gouv.fr.",
        ],
      },
    ],
    faq: [
      {
        question: 'Éco Artisan est-il une qualification RGE à part entière?',
        answer:
          "Non, c'est un label de démarche qualité porté par la FFB et délivré par Qualibat. Il s'ajoute à une ou plusieurs qualifications Qualibat RGE sous-jacentes qui, elles, couvrent les travaux techniques. Sans qualification Qualibat RGE active, le label Éco Artisan n'ouvre aucune aide publique.",
      },
      {
        question: 'Qui délivre le label Éco Artisan?',
        answer:
          "Le label est une marque de la Fédération Française du Bâtiment (FFB) dont la délivrance opérationnelle et le contrôle sont confiés à Qualibat, avec mention RGE lorsque l'entreprise détient les qualifications Qualibat sous-jacentes requises.",
      },
      {
        question: 'Quelle différence entre Éco Artisan et Pros de la Performance Énergétique?',
        answer:
          "Les Pros de la Performance Énergétique (Les Pros de la perf) est un autre label FFB, distinct d'Éco Artisan, orienté entreprises générales de rénovation plus structurées. Les deux labels existent en parallèle et peuvent cohabiter. Voir ffbatiment.fr pour le détail des différences.",
      },
      {
        question: "Un artisan Éco Artisan peut-il gérer un Parcours Accompagné MaPrimeRénov'?",
        answer:
          "Éco Artisan est une bonne indication d'une démarche qualité globale, mais le Parcours Accompagné MaPrimeRénov' exige en plus l'intervention d'un Accompagnateur Rénov' (MAR) agréé. Éco Artisan et MAR sont deux dispositifs distincts : l'un qualifie une démarche entreprise, l'autre est une fonction d'accompagnement réglementaire.",
      },
      {
        question: 'Comment vérifier un label Éco Artisan en 2026?',
        answer:
          "Sur eco-artisan.net ou sur france-renov.gouv.fr, en recherchant par SIRET. Vérifier en parallèle que l'entreprise détient une qualification Qualibat RGE couvrant les travaux prévus, avec une date de validité postérieure au devis. Voir site officiel pour les conditions à jour.",
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
