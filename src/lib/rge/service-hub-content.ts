/**
 * RGE service hub — contenu éditorial par service
 * ------------------------------------------------
 * Contenu unique pour chaque route `/rge/[service]` : description longue,
 * travaux couverts, montants d'aides de référence, FAQ contextualisée.
 *
 * Source de vérité unique pour l'éditorial hub par service RGE.
 * Pas de données dynamiques ici — tout est statique et versionné avec le code.
 * Les stats (totalActive, topCities) viennent de `getRgeServiceStats()`.
 *
 * Rigueur réglementaire : les montants cités sont ceux en vigueur au
 * 1er janvier 2026 (MaPrimeRénov' barèmes publiés par l'Anah, CEE coup-de-pouce
 * arrêté DGEC du 30/12/2025). En cas de mise à jour réglementaire, actualiser
 * cette table et rebuild.
 */

import type { RgeAllowedService } from './service-city-listings'

export interface RgeServiceTravaux {
  label: string
  detail: string
}

export interface RgeServiceAide {
  label: string
  montant: string
  detail: string
}

export interface RgeServiceFaqItem {
  question: string
  answer: string
}

export interface RgeServiceHubContent {
  /** H1 éditorial, différent du display title pour varier */
  h1: string
  /** Chapeau 1-2 phrases, injecté dans le hero */
  lede: string
  /** 2-3 paragraphes riches (contenu pSEO unique) */
  description: string[]
  /** Liste des travaux typiques couverts par la qualification */
  travaux: RgeServiceTravaux[]
  /** Aides publiques applicables avec montants indicatifs 2026 */
  aides: RgeServiceAide[]
  /** FAQ 4-5 questions uniques, centrées sur le métier */
  faq: RgeServiceFaqItem[]
  /** Meta SEO */
  metaTitle: string
  metaDescription: string
}

const C: Record<RgeAllowedService, RgeServiceHubContent> = {
  'pompe-a-chaleur': {
    h1: 'Pompe à chaleur : certification RGE QualiPAC & aides',
    lede: "Installateurs QualiPAC certifiés pour l'installation de pompes à chaleur aérothermiques et géothermiques, éligibles MaPrimeRénov' et coup de pouce CEE.",
    description: [
      "La pompe à chaleur est le poste numéro un de MaPrimeRénov' en France avec plus de 400 000 dossiers validés chaque année. Installer une PAC performante suppose un dimensionnement précis (bilan thermique, coefficient de performance SCOP, intégration hydraulique) qu'un artisan non qualifié ne maîtrise pas toujours. La mention RGE QualiPAC, délivrée par Qualit'EnR après formation théorique, examen et audit chantier, est la seule garantie reconnue par l'Anah et les délégataires CEE.",
      "Sans qualification QualiPAC active à la date de signature du devis, aucune aide publique n'est mobilisable : ni MaPrimeRénov', ni la prime Coup de Pouce chauffage, ni la TVA réduite à 5,5 %. Les contrôles a posteriori de l'Anah (échantillon de ~5 % des dossiers) aboutissent à des demandes de remboursement intégral lorsque la qualification fait défaut.",
      "Les artisans listés ci-dessous sont tous titulaires d'une qualification QualiPAC ou équivalent Qualibat RGE, à jour dans le référentiel France Rénov' de l'ADEME, synchronisé chaque semaine.",
    ],
    travaux: [
      {
        label: 'PAC air/eau aérothermique',
        detail:
          'Remplacement chaudière fioul ou gaz, intégration radiateurs basse température ou plancher chauffant.',
      },
      {
        label: 'PAC géothermique',
        detail: 'Captage horizontal ou vertical, forage géothermique, échangeur sol/eau.',
      },
      {
        label: 'PAC hybride gaz + air/eau',
        detail: 'Basculement automatique selon température extérieure et prix des énergies.',
      },
      {
        label: 'Chauffe-eau thermodynamique',
        detail: 'ECS sur air ambiant ou air extrait, COP annuel > 3.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' PAC air/eau",
        montant: '2 000 à 5 000 €',
        detail: 'Barème revenus très modestes à intermédiaires, forfait par type de PAC.',
      },
      {
        label: 'Coup de Pouce Chauffage CEE',
        montant: "jusqu'à 5 000 €",
        detail:
          "Bonus délégataire (Effy, Sonergia, TotalEnergies) en substitution d'une chaudière fioul.",
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: "Taux réduit sur fourniture + pose si l'entreprise est RGE à la date du devis.",
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 50 000 €",
        detail: 'Prêt à taux zéro pour financer le reste à charge, sans condition de ressources.',
      },
    ],
    faq: [
      {
        question: 'Quelle différence entre QualiPAC et Qualibat pour une PAC ?',
        answer:
          "QualiPAC (Qualit'EnR) est la qualification de référence spécifique aux pompes à chaleur — aérothermiques et géothermiques — et c'est celle qu'exigent en priorité l'Anah et les délégataires CEE. Qualibat RGE « chauffage » peut également couvrir les PAC lorsque l'entreprise est multi-corps d'état. Les deux ouvrent droit à MaPrimeRénov' et aux primes CEE à condition d'être actives à la date de signature du devis. QualiPAC reste la plus lisible pour un particulier.",
      },
      {
        question: 'Un installateur QualiPAC peut-il intervenir pour une PAC air/air ?',
        answer:
          "Non, la qualification QualiPAC couvre les pompes à chaleur air/eau et géothermiques, pas les split air/air. Pour une climatisation réversible air/air éligible au coup de pouce CEE, il faut s'orienter vers un artisan climaticien titulaire d'une autre qualification (Qualibat RGE ou QualiClim). Cette distinction est fondamentale : un devis PAC air/air signé avec un artisan QualiPAC seul peut être requalifié par le délégataire CEE et rejeté.",
      },
      {
        question: 'Combien coûte une pompe à chaleur air/eau installée ?',
        answer:
          "Le prix d'une PAC air/eau varie de 10 000 € à 18 000 € TTC pose comprise pour une maison individuelle, hors options (ballon tampon, planchers chauffants, dépose chaudière). Après déduction de MaPrimeRénov' (2 000 à 5 000 €) et de la prime CEE (2 500 à 5 000 € selon délégataire), le reste à charge pour un ménage aux revenus modestes tombe souvent sous 5 000 €. Demandez toujours au moins trois devis d'artisans RGE QualiPAC pour objectiver les prix.",
      },
      {
        question: 'La qualification RGE couvre-t-elle la maintenance annuelle ?',
        answer:
          "Non. La mention RGE est adossée à l'installation initiale et ouvre droit aux aides sur ce chantier précis. L'entretien annuel obligatoire de la PAC (arrêté du 30 mars 2020 pour les PAC > 4 kW) peut être réalisé par tout installateur qualifié, RGE ou non. En revanche, de nombreux installateurs RGE proposent un contrat d'entretien en complément du chantier initial — c'est souvent la meilleure garantie de performance dans la durée.",
      },
    ],
    metaTitle: "Artisan RGE pompe à chaleur (QualiPAC) — MaPrimeRénov'",
    metaDescription:
      "Trouvez un installateur RGE QualiPAC pour votre pompe à chaleur. Données ADEME officielles, éligibles MaPrimeRénov', prime CEE et TVA 5,5 %.",
  },

  'isolation-thermique': {
    h1: 'Isolation thermique : certification RGE Qualibat & aides',
    lede: "Spécialistes Qualibat RGE de l'isolation par l'intérieur (ITI), par l'extérieur (ITE), des combles perdus et des planchers bas. Brique n°1 des économies d'énergie.",
    description: [
      "L'isolation thermique est le chantier à plus fort ROI énergétique en rénovation : jusqu'à 30 % d'économies sur la facture de chauffage pour une isolation de combles, 25 % pour une ITE complète. C'est aussi le poste le plus fraudé historiquement (arnaques « isolation à 1 € » démantelées en 2020-2022), ce qui rend la vérification RGE d'autant plus critique.",
      "La qualification de référence est Qualibat RGE, déclinée en plusieurs codes techniques (7141 ITI combles, 7142 ITI murs, 7143 ITE, 7144 isolation plancher bas) que les artisans accumulent selon leur gamme de chantiers. Un artisan ITE-ITI complet cumule généralement 3 à 4 de ces codes. Tous figurent au référentiel France Rénov' si la mention est active.",
      "Les artisans listés sur cette page couvrent l'ensemble des travaux d'isolation éligibles MaPrimeRénov' et aux primes CEE, avec une qualification en cours de validité au référentiel ADEME synchronisé chaque semaine.",
    ],
    travaux: [
      {
        label: "Isolation par l'extérieur (ITE)",
        detail: 'Enduit mince sur polystyrène, bardage rapporté, sarking toiture.',
      },
      {
        label: "Isolation par l'intérieur (ITI)",
        detail: 'Doublage laine minérale, polyuréthane, plaques de plâtre isolantes.',
      },
      {
        label: 'Isolation combles perdus',
        detail: 'Soufflage laine de verre, laine de roche, ouate de cellulose.',
      },
      {
        label: 'Isolation plancher bas',
        detail: 'Sous-face de plancher sur vide sanitaire, garage non chauffé, cave.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' ITE",
        montant: "jusqu'à 75 €/m²",
        detail: 'Forfait au mètre carré de paroi isolée, modulé selon revenus.',
      },
      {
        label: "MaPrimeRénov' ITI",
        montant: "jusqu'à 25 €/m²",
        detail: "Forfait moindre qu'ITE, mais cumul possible avec CEE.",
      },
      {
        label: 'Coup de Pouce Isolation CEE',
        montant: "jusqu'à 30 €/m²",
        detail: 'Délégataires (Effy, Sonergia, TotalEnergies) pour combles et planchers bas.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit systématique sur fourniture et pose par entreprise RGE.',
      },
    ],
    faq: [
      {
        question: 'ITE ou ITI : que choisir pour un logement ancien ?',
        answer:
          "L'ITE est techniquement supérieure : elle supprime les ponts thermiques, préserve l'inertie des murs anciens, ne réduit pas la surface habitable et permet un ravalement simultané. Mais elle modifie l'aspect extérieur et nécessite souvent une autorisation en secteur protégé (ABF). L'ITI est moins coûteuse, indiquée pour les façades patrimoniales ou en copropriété où l'ITE est refusée. MaPrimeRénov' favorise l'ITE (75 €/m² max contre 25 €/m² pour l'ITI) car elle est plus performante. Un bon artisan Qualibat RGE sait orienter selon le diagnostic.",
      },
      {
        question: 'Les aides « isolation à 1 € » existent-elles encore en 2026 ?',
        answer:
          "Non. Le dispositif Coup de Pouce Isolation à 1 € a été supprimé le 1er juillet 2021 suite aux fraudes massives. Depuis, les primes CEE combles/planchers restent substantielles (jusqu'à 30 €/m²) mais ne couvrent plus 100 % du chantier. Tout devis actuel qui vous promet une isolation « gratuite » doit être considéré comme suspect : vérifiez systématiquement la qualification RGE de l'entreprise et comparez au moins trois offres avant de signer.",
      },
      {
        question: 'Quelle résistance thermique R minimum pour les aides ?',
        answer:
          "Les seuils R (résistance thermique en m².K/W) sont fixés par l'arrêté MaPrimeRénov' : R ≥ 7 pour les combles perdus, R ≥ 6 pour les rampants de toiture, R ≥ 3,7 pour les murs (ITE ou ITI), R ≥ 3 pour les planchers bas. En dessous de ces seuils, aucune aide n'est versée. Un artisan Qualibat RGE sait calculer la R résultante selon l'épaisseur et le lambda du matériau — exigez toujours la mention explicite de la R atteinte sur le devis.",
      },
      {
        question: 'Peut-on cumuler MaPrimeRénov\u2019 et primes CEE sur un même chantier ?',
        answer:
          "Oui, le cumul est non seulement autorisé mais prévu par les textes. MaPrimeRénov' (aide de l'Anah) et les primes CEE (délégataires obligés) sont deux dispositifs distincts qui se cumulent sur un même chantier d'isolation, à condition d'en faire la demande séparément. Par exemple, pour 100 m² d'ITE : 7 500 € MaPrimeRénov' + 3 000 € CEE = 10 500 € d'aides cumulées. La règle d'or : déposer MaPrimeRénov' AVANT signature du devis et mobiliser le CEE AVANT démarrage des travaux.",
      },
    ],
    metaTitle: "Artisan RGE isolation (ITE/ITI) — Qualibat MaPrimeRénov'",
    metaDescription:
      "Trouvez un artisan RGE Qualibat pour l'isolation thermique (ITE, ITI, combles, planchers). Données ADEME, éligibles aides publiques.",
  },

  chauffagiste: {
    h1: 'Chauffagiste RGE : qualification, labels & aides',
    lede: 'Installateurs RGE de chaudières biomasse, poêles à granulés, systèmes hybrides et chauffage bas-carbone. QualiBois, Chauffage + et Qualibat RGE.',
    description: [
      "Le remplacement d'un système de chauffage ancien — fioul, gaz vétuste, convecteurs électriques — est l'un des chantiers les plus impactants en rénovation énergétique. Un chauffagiste RGE certifié sait dimensionner précisément la puissance du générateur, adapter l'émission (radiateurs, plancher, ventilo-convecteurs) et raccorder le tout à l'hydraulique existante sans créer de dysfonctionnement.",
      "La mention de référence est QualiBois (Qualit'EnR) pour la biomasse, Chauffage + (Qualibat) pour les systèmes gaz à condensation haute performance. Certains artisans cumulent plusieurs qualifications et couvrent l'ensemble de la gamme chauffage. Sans mention RGE active, le Coup de Pouce Chauffage CEE — qui peut atteindre 5 000 € pour un remplacement de chaudière fioul — n'est pas mobilisable.",
      "Les chauffagistes listés ci-dessous disposent tous d'une qualification RGE active (QualiBois, Chauffage +, ou Qualibat RGE chauffage), vérifiée chaque semaine au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Chaudière biomasse granulés',
        detail: 'Installation, raccordement silo, évacuation cendres, régulation.',
      },
      {
        label: 'Poêle à granulés étanche',
        detail: 'Conduit concentrique, rendement > 90 %, pilotage thermostat.',
      },
      {
        label: 'Chaudière gaz à condensation',
        detail: 'Remplacement chaudière gaz ancienne, raccordement ventouse ou cheminée.',
      },
      {
        label: 'Système hybride PAC + gaz',
        detail: 'Basculement automatique selon température extérieure et coût énergies.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' chaudière biomasse",
        montant: "jusqu'à 11 000 €",
        detail: 'Barème Anah pour ménages très modestes, chaudière à alimentation automatique.',
      },
      {
        label: 'Coup de Pouce Chauffage CEE',
        montant: "jusqu'à 5 000 €",
        detail: "Prime bonifiée en substitution d'une chaudière fioul ou gaz vétuste.",
      },
      {
        label: "MaPrimeRénov' poêle granulés",
        montant: "jusqu'à 2 500 €",
        detail: 'Forfait selon revenus pour appareil indépendant biomasse.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur fourniture et pose par artisan RGE.',
      },
    ],
    faq: [
      {
        question: 'QualiBois ou Chauffage + : quelle qualification pour quelle chaudière ?',
        answer:
          "QualiBois est la qualification spécifique aux appareils de chauffage à biomasse (chaudières bois, poêles à granulés, inserts). Elle est délivrée par Qualit'EnR, le même organisme que QualiPAC. Chauffage + (Qualibat) couvre les chaudières gaz à condensation haute performance. Un chauffagiste peut cumuler les deux s'il installe les deux familles. Pour savoir laquelle exiger, la règle simple : type de combustible bois → QualiBois ; gaz → Chauffage + ou Qualibat RGE chauffage.",
      },
      {
        question: 'Le remplacement de chaudière fioul donne droit à quelle aide ?',
        answer:
          "Le Coup de Pouce Chauffage CEE est le dispositif le plus généreux pour substituer une chaudière fioul : jusqu'à 5 000 € versés par le délégataire (Effy, Sonergia, TotalEnergies, EDF, Engie) pour l'installation d'une PAC air/eau, chaudière biomasse, ou système solaire combiné. Cumulable avec MaPrimeRénov' qui ajoute 2 000 à 11 000 € selon revenus et type d'équipement. Total d'aides possible : 16 000 € pour un ménage très modeste passant au granulé.",
      },
      {
        question: 'Une chaudière gaz à condensation est-elle encore aidée en 2026 ?',
        answer:
          "Non, plus par MaPrimeRénov'. L'Anah a supprimé l'aide au gaz depuis le 1er janvier 2023 pour recentrer le dispositif sur les énergies renouvelables. Le Coup de Pouce CEE reste mobilisable uniquement pour des chaudières très haute performance (étiquette énergétique A+ ou A++) et uniquement en substitution d'un équipement gaz ancien. La TVA 5,5 % reste applicable si l'artisan est RGE Qualibat Chauffage.",
      },
      {
        question: "Combien coûte l'installation d'une chaudière granulés complète ?",
        answer:
          "Entre 15 000 € et 25 000 € TTC pose comprise pour une maison individuelle (chaudière + silo + régulation + raccordement + dépose ancien système). Après cumul MaPrimeRénov' Très Modestes (11 000 €) + Coup de Pouce CEE (4 000 €) + Éco-PTZ, le reste à charge pour un ménage éligible peut descendre sous 3 000 €. Seule condition : chaudière à alimentation automatique, label Flamme Verte 7*, installation par chauffagiste RGE QualiBois.",
      },
    ],
    metaTitle: 'Chauffagiste RGE (QualiBois, Chauffage +) — Aides 2026',
    metaDescription:
      "Trouvez un chauffagiste RGE pour chaudière biomasse, poêle granulés ou gaz condensation. Données ADEME, MaPrimeRénov', CEE.",
  },

  'panneaux-solaires': {
    h1: "Panneaux solaires : qualification RGE & MaPrimeRénov'",
    lede: "Spécialistes QualiPV et QualiSol certifiés pour le photovoltaïque, le solaire thermique et l'autoconsommation. Prime à l'investissement et obligation d'achat.",
    description: [
      "L'installation photovoltaïque résidentielle connaît une croissance annuelle > 30 % en France depuis 2022. Deux qualifications RGE spécifiques encadrent le métier : QualiPV (modules photovoltaïques et autoconsommation) et QualiSol (chauffe-eau solaire et systèmes solaires combinés). Les deux sont délivrées par Qualit'EnR après examen théorique et audit chantier.",
      "La mention RGE est obligatoire pour accéder à la prime à l'investissement autoconsommation (0,23 € à 0,38 €/Wc selon la puissance installée) et au tarif d'obligation d'achat pour la revente du surplus. Sans QualiPV actif au contrat de raccordement Enedis, l'obligation d'achat EDF OA n'est pas délivrée.",
      "Les installateurs listés ci-dessous sont titulaires d'une qualification QualiPV ou QualiSol active, vérifiée chaque semaine au référentiel ADEME. Le solaire est un métier où l'écart technique entre un bon et un mauvais installateur est massif : dimensionnement d'onduleur, orientation, ombrages, câblage DC — un chantier mal exécuté perd 20 à 30 % de productible.",
    ],
    travaux: [
      {
        label: 'Installation photovoltaïque 3-9 kWc',
        detail: 'Modules polycristallins ou monocristallins, onduleur central ou micro-onduleurs.',
      },
      {
        label: 'Chauffe-eau solaire individuel (CESI)',
        detail: 'Capteurs plans ou sous vide, ballon bi-énergie, régulation différentielle.',
      },
      {
        label: 'Système solaire combiné (SSC)',
        detail: 'Production ECS + chauffage, couplage chaudière ou PAC, plancher solaire direct.',
      },
      {
        label: 'Autoconsommation avec revente surplus',
        detail: 'Raccordement Enedis, contrat EDF OA, optimisation pilotage consommation.',
      },
    ],
    aides: [
      {
        label: "Prime à l'investissement autoconsommation",
        montant: "jusqu'à 1 140 €",
        detail:
          'Versée sur 5 ans par EDF OA pour une installation 3 kWc en autoconsommation avec vente du surplus.',
      },
      {
        label: "MaPrimeRénov' CESI/SSC",
        montant: "jusqu'à 4 000 €",
        detail: 'Forfait Anah pour chauffe-eau solaire individuel ou système solaire combiné.',
      },
      {
        label: 'TVA à 10 % photovoltaïque',
        montant: '—',
        detail:
          'Taux intermédiaire (pas 5,5 %) sur les installations < 3 kWc réalisées par une entreprise RGE.',
      },
      {
        label: 'Obligation achat surplus EDF OA',
        montant: '0,13 €/kWh',
        detail:
          'Tarif garanti 20 ans, indexé annuellement, pour la revente du surplus non consommé.',
      },
    ],
    faq: [
      {
        question: 'QualiPV, QualiSol, QualiBois — pourquoi tant de signatures ?',
        answer:
          "Qualit'EnR a segmenté ses qualifications par famille d'énergie renouvelable pour garantir la spécialisation de chaque professionnel. QualiPV couvre strictement le photovoltaïque (modules, onduleurs, raccordement Enedis). QualiSol couvre le solaire thermique (CESI, systèmes solaires combinés, production ECS). Un installateur peut cumuler les deux, mais c'est relativement rare — les métiers sont différents (électricité pour le PV, plomberie-chauffage pour le thermique). Exigez la mention spécifique à votre chantier.",
      },
      {
        question: 'Combien rapporte une installation photovoltaïque 3 kWc en 2026 ?',
        answer:
          "Pour une installation 3 kWc orientée plein sud avec inclinaison 30° sans ombrage, le productible moyen est de 3 300 à 4 000 kWh/an selon la région (optimum sud de la France). En autoconsommation avec revente du surplus (taux d'autoconsommation typique 40-60 %), les économies + revente cumulées représentent 600 à 900 €/an. ROI sur 8 à 12 ans selon l'ensoleillement. Toutes les installations sous 9 kWc bénéficient de la prime à l'investissement, versée sur 5 ans.",
      },
      {
        question: 'Un installateur sans QualiPV peut-il poser des panneaux ?',
        answer:
          "Techniquement oui, mais vous perdrez l'accès à la prime à l'investissement, au tarif d'obligation d'achat pour la revente du surplus et à la TVA réduite. De plus, la garantie décennale sur l'installation peut être contestée par l'assureur si le professionnel n'était pas qualifié à la date du chantier. Exigez toujours un devis émis par une entreprise RGE QualiPV active, et vérifiez la mention directement sur le site france-renov.gouv.fr avant de signer.",
      },
      {
        question: 'Solaire thermique ou photovoltaïque : que choisir ?',
        answer:
          "Ce sont deux usages différents. Le photovoltaïque produit de l'électricité (autoconsommation + revente), rentable si vous avez une consommation diurne significative (télétravail, domotique, pompe à chaleur). Le solaire thermique (CESI ou SSC) produit de l'eau chaude et/ou chauffage, rentable si votre ECS représente une part significative de la facture (famille nombreuse, chauffage ECS électrique). On peut combiner les deux : photovoltaïque pour l'électricité, CESI pour l'eau chaude — deux aides MaPrimeRénov' séparées.",
      },
    ],
    metaTitle: 'Installateur RGE photovoltaïque (QualiPV) — Prime 2026',
    metaDescription:
      "Trouvez un installateur RGE QualiPV ou QualiSol pour panneaux solaires. Prime investissement, obligation d'achat EDF OA, données ADEME.",
  },

  'renovation-energetique': {
    h1: 'Rénovation énergétique : certification RGE & aides',
    lede: "Spécialistes de la rénovation énergétique globale et de l'accompagnement Mon Accompagnateur Rénov'. Parcours MaPrimeRénov' Accompagné jusqu'à 70 000 € d'aides.",
    description: [
      "La rénovation énergétique globale — appelée « parcours accompagné » depuis 2024 — consiste à enchaîner plusieurs chantiers (isolation + chauffage + ventilation) pour atteindre un gain de classe DPE significatif (minimum 2 classes). C'est le dispositif le plus généreux de MaPrimeRénov' : jusqu'à 70 000 € d'aides cumulées pour un ménage aux revenus très modestes.",
      "Ce parcours nécessite obligatoirement un Accompagnateur Rénov' agréé par l'Anah (MAR) — un professionnel qui audite le logement, propose un scénario de travaux, chiffre les gains énergétiques et supervise l'exécution. Les artisans RGE qui interviennent sur ces chantiers doivent être qualifiés pour chaque lot (isolation, chauffage, ventilation) et coordonnés par le MAR.",
      "Les entreprises listées ci-dessous sont titulaires d'une qualification RGE « rénovation globale » ou d'une combinaison de qualifications Qualibat / Qualit'EnR couvrant plusieurs corps d'état. Certaines cumulent également l'agrément Mon Accompagnateur Rénov', ce qui simplifie la coordination.",
    ],
    travaux: [
      {
        label: 'Audit énergétique réglementaire',
        detail: 'Diagnostic DPE, scénarios de rénovation, gain de classe énergétique ciblé.',
      },
      {
        label: 'Bouquet isolation + chauffage + VMC',
        detail: 'Coordination multi-lots pour franchir 2 classes DPE minimum.',
      },
      {
        label: 'Accompagnement MAR',
        detail: "Suivi de chantier par Mon Accompagnateur Rénov', dépôt des dossiers d'aides.",
      },
      {
        label: 'Rénovation BBC globale',
        detail: 'Performance bâtiment basse consommation, gain > 40 % énergie primaire.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' Parcours Accompagné",
        montant: "jusqu'à 70 000 €",
        detail: '80 % du coût HT pour ménages très modestes, saut de 4 classes DPE.',
      },
      {
        label: 'Prime CEE bonifiée rénovation globale',
        montant: "jusqu'à 15 000 €",
        detail: 'Versée par les délégataires CEE en complément.',
      },
      {
        label: 'Éco-PTZ Performance Globale',
        montant: "jusqu'à 50 000 €",
        detail: 'Prêt à taux zéro dédié à la rénovation globale, 20 ans.',
      },
      {
        label: 'TVA à 5,5 % sur tout le bouquet',
        montant: '—',
        detail: 'Taux réduit systématique sur tous les lots réalisés par entreprises RGE.',
      },
    ],
    faq: [
      {
        question: "Qu'est-ce qu'un Accompagnateur Rénov\u2019 et pourquoi est-il obligatoire ?",
        answer:
          "Mon Accompagnateur Rénov' (MAR) est un professionnel agréé par l'Anah depuis 2024 pour encadrer les rénovations globales. Son rôle : auditer le logement, proposer un scénario de travaux pertinent, chiffrer le gain énergétique attendu, vérifier les devis des artisans, déposer les demandes d'aides auprès de l'Anah et des délégataires CEE, et contrôler la bonne exécution du chantier. Son intervention est obligatoire pour accéder à MaPrimeRénov' Parcours Accompagné et est elle-même financée jusqu'à 2 000 € par l'Anah.",
      },
      {
        question: 'Combien coûte une rénovation énergétique globale ?',
        answer:
          "Le coût varie très fortement selon l'état initial du logement et l'objectif énergétique. Fourchette indicative : 40 000 € à 90 000 € TTC pour une maison individuelle de 100-120 m² passant d'une classe F/G à une classe C/B. Après cumul MaPrimeRénov' Parcours Accompagné (jusqu'à 70 000 €) + CEE bonifiée + Éco-PTZ, le reste à charge pour un ménage aux revenus très modestes peut descendre sous 10 % du coût total. Demandez systématiquement un audit énergétique au préalable pour objectiver le chiffrage.",
      },
      {
        question: 'Peut-on faire une rénovation globale avec un seul artisan ?',
        answer:
          "Rarement en pratique. La rénovation globale implique des lots techniques différents (isolation, chauffage, ventilation, souvent menuiserie) qu'un seul artisan couvre rarement entièrement. Deux solutions : soit un mandataire multi-corps d'état (entreprise générale du bâtiment) qui sous-traite à des artisans RGE spécialisés, soit plusieurs artisans indépendants coordonnés par votre Accompagnateur Rénov'. Dans tous les cas, chaque intervenant doit être RGE pour son lot.",
      },
      {
        question: "Quel gain énergétique minimum pour toucher MaPrimeRénov' Accompagné ?",
        answer:
          "Depuis 2024, l'aide MaPrimeRénov' Parcours Accompagné exige un saut d'au moins 2 classes DPE pour être mobilisée (par exemple passer de F à D). Au-delà, les aides sont bonifiées selon le nombre de classes franchies : 2 classes = barème standard, 3 classes = bonus +10 %, 4 classes = bonus +20 %. Le gain énergétique doit être attesté par un audit avant et après travaux, réalisé par un diagnostiqueur certifié.",
      },
    ],
    metaTitle: "Rénovation globale RGE — Parcours MaPrimeRénov' Accompagné",
    metaDescription:
      "Trouvez un artisan RGE rénovation énergétique globale. Parcours Accompagné MaPrimeRénov', MAR, jusqu'à 70 000 € d'aides.",
  },

  electricien: {
    h1: 'Électricien RGE : certification Qualifelec & aides',
    lede: 'Électriciens certifiés Qualifelec RGE pour bornes de recharge IRVE, photovoltaïque et solutions électriques performantes éligibles aux aides.',
    description: [
      "La qualification Qualifelec RGE est délivrée par l'organisme Qualifelec (branche RGE depuis 2013) aux entreprises d'électricité qui justifient d'une compétence spécifique en rénovation énergétique. Trois domaines sont couverts : l'installation de bornes de recharge pour véhicules électriques (IRVE niveau 1 à 3), le photovoltaïque résidentiel avec raccordement Enedis, et les solutions de pilotage énergétique (domotique, effacement, délestage).",
      "Pour les bornes IRVE, le crédit d'impôt de 500 € par borne (prolongé jusqu'en 2026) exige obligatoirement un installateur Qualifelec IRVE niveau 1 minimum. Sans cette mention, aucun crédit d'impôt et aucune prime ADVENIR (jusqu'à 960 € en copropriété) ne sont accessibles.",
      "Les électriciens listés ci-dessous sont tous titulaires d'une qualification Qualifelec RGE active, vérifiée chaque semaine au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Borne de recharge IRVE maison individuelle',
        detail:
          'Borne 7,4 kW à 22 kW, raccordement tableau, protection différentielle 30 mA type B.',
      },
      {
        label: 'IRVE copropriété et parking collectif',
        detail: 'Infrastructure collective, comptage individuel, conformité arrêté IRVE 2019.',
      },
      {
        label: 'Raccordement photovoltaïque',
        detail: 'Câblage DC, onduleur, couplage réseau Enedis, injection surplus.',
      },
      {
        label: 'Pilotage énergétique et domotique',
        detail: 'Effacement chauffe-eau, délestage PAC, gestion autoconsommation.',
      },
    ],
    aides: [
      {
        label: 'Crédit impôt borne IRVE',
        montant: '500 €/borne',
        detail: "Déduction directe sur l'impôt sur le revenu, sans condition de ressources.",
      },
      {
        label: 'Prime ADVENIR copropriété',
        montant: "jusqu'à 960 €",
        detail: 'Aide spécifique pour bornes en copropriété, versée par Avere-France.',
      },
      {
        label: 'Prime CEE photovoltaïque Autoconso',
        montant: 'variable',
        detail: 'Bonification CEE pour installation photovoltaïque avec autoconsommation.',
      },
      {
        label: 'TVA à 5,5 % IRVE',
        montant: '—',
        detail: 'Taux réduit sur la fourniture + pose de borne dans un logement > 2 ans.',
      },
    ],
    faq: [
      {
        question: 'Qualifelec IRVE niveau 1, 2, 3 : que signifient ces niveaux ?',
        answer:
          "Qualifelec IRVE est déclinée en trois niveaux selon la puissance et la complexité des installations. Niveau 1 : bornes résidentielles jusqu'à 22 kW en courant alternatif (maison individuelle, copropriété simple). Niveau 2 : infrastructures collectives en copropriété avec pilotage énergétique. Niveau 3 : bornes rapides en courant continu, stations publiques. Pour une borne résidentielle, Qualifelec IRVE niveau 1 suffit et ouvre droit au crédit d'impôt 500 €.",
      },
      {
        question: "Ai-je besoin d'un électricien RGE pour une borne IRVE à domicile ?",
        answer:
          "Oui, obligatoirement. Le crédit d'impôt IRVE (500 € par borne, prolongé jusqu'au 31 décembre 2026) est conditionné au recours à un électricien titulaire de la qualification Qualifelec IRVE niveau 1 minimum à la date d'émission de la facture. Sans cette qualification, aucun crédit d'impôt n'est accordé même si l'installation est techniquement conforme. De plus, la garantie décennale peut être contestée par l'assureur en cas d'installation par un non-qualifié.",
      },
      {
        question: "Combien coûte l'installation d'une borne de recharge 7,4 kW ?",
        answer:
          "Pour une borne 7,4 kW (rechargement lent nuit, véhicule 50 kWh en 7-8 h) installée à domicile par un électricien Qualifelec IRVE : 1 200 € à 2 000 € TTC pose comprise, selon la distance câblage-tableau, la présence d'un mur porteur et le modèle de borne (Wallbox, Schneider, Legrand). Après crédit d'impôt 500 €, le reste à charge se situe entre 700 et 1 500 €. Pour un véhicule particulier, la borne 7,4 kW est presque toujours suffisante — les 11 kW et 22 kW n'ont d'intérêt qu'en usage intensif.",
      },
      {
        question: "Qualifelec couvre-t-elle aussi l'installation de panneaux solaires ?",
        answer:
          "Oui, partiellement. Qualifelec dispose d'une qualification « SPV » (solaire photovoltaïque) qui couvre le raccordement électrique des installations photovoltaïques résidentielles : câblage DC, onduleur, liaison réseau Enedis, protection. Mais elle ne couvre pas la pose physique des modules sur toiture (c'est le métier du couvreur ou de l'entreprise photovoltaïque spécialisée). QualiPV (Qualit'EnR) reste la qualification la plus lisible pour un projet photovoltaïque complet clé en main.",
      },
    ],
    metaTitle: 'Électricien RGE Qualifelec IRVE & photovoltaïque',
    metaDescription:
      'Trouvez un électricien RGE Qualifelec pour borne IRVE ou photovoltaïque. Crédit impôt 500 €, prime ADVENIR, données ADEME.',
  },

  menuisier: {
    h1: "Menuiserie RGE : certification Qualibat & MaPrimeRénov'",
    lede: "Menuisiers Qualibat RGE pour remplacement de fenêtres, portes d'entrée et baies vitrées à haute performance thermique. Aides MaPrimeRénov' et CEE.",
    description: [
      "Le remplacement des menuiseries anciennes (simple vitrage, double vitrage premier âge) est l'un des travaux les plus rentables en confort et en économies d'énergie : jusqu'à 15 % de réduction des déperditions thermiques pour une maison individuelle bien équipée en double ou triple vitrage. La qualification Qualibat RGE « menuiseries extérieures » (code 3511 / 3512) est délivrée aux entreprises qui maîtrisent la pose étanche selon la norme DTU 36.5.",
      "L'aide MaPrimeRénov' pour les fenêtres est forfaitaire (100 € par équipement pour les revenus intermédiaires, 200 € pour les revenus modestes) et ne couvre que le remplacement d'anciens vitrages simples. Cumulée aux primes CEE et à la TVA 5,5 %, elle ramène le coût moyen à 400-500 € par fenêtre posée.",
      "Les menuisiers listés ci-dessous sont titulaires d'une qualification Qualibat RGE menuiseries extérieures active, vérifiée au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Remplacement fenêtres double/triple vitrage',
        detail: 'PVC, aluminium, bois ou mixte, Uw ≤ 1,3 W/m².K pour éligibilité aides.',
      },
      {
        label: "Porte d'entrée performante",
        detail: 'Ud ≤ 1,7 W/m².K, isolation thermique et renforcement sécurité.',
      },
      {
        label: 'Baies coulissantes et fenêtres de toit',
        detail: 'Grandes ouvertures, volets roulants intégrés, Velux performants.',
      },
      {
        label: 'Volets roulants isolants',
        detail: 'Caisson intégré, motorisation, amélioration performance globale.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' fenêtre",
        montant: '100 à 200 €/fenêtre',
        detail: 'Forfait par équipement remplacé depuis un simple vitrage, selon revenus.',
      },
      {
        label: 'Prime CEE fenêtres',
        montant: "jusqu'à 100 €/fenêtre",
        detail: 'Versée par délégataire CEE en complément MaPrimeRénov\u2019.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur fourniture + pose par entreprise RGE.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 7 000 €",
        detail: "Prêt à taux zéro si les fenêtres sont dans un bouquet d'au moins 2 travaux.",
      },
    ],
    faq: [
      {
        question: 'Quel coefficient Uw est exigé pour les aides MaPrimeRénov\u2019 ?',
        answer:
          "Pour être éligible à MaPrimeRénov' sur les fenêtres, le coefficient de transmission thermique global Uw de la fenêtre doit être ≤ 1,3 W/m².K (norme depuis 2023). Cela correspond à un double vitrage performant ou un triple vitrage standard. Pour les portes d'entrée, le seuil est Ud ≤ 1,7 W/m².K. Les devis doivent mentionner explicitement le coefficient Uw (pas Ug qui ne concerne que le vitrage). Exigez la fiche technique du fabricant.",
      },
      {
        question: 'PVC, aluminium ou bois : quelle menuiserie choisir ?',
        answer:
          "Les trois matériaux atteignent les seuils Uw ≤ 1,3 W/m².K requis pour les aides. PVC : le plus économique (400-600 €/fenêtre standard), très bonne performance thermique, entretien zéro. Aluminium : plus cher (700-1000 €/fenêtre) mais finesse des profilés, idéal pour grandes baies. Bois : esthétique patrimoniale, performance thermique supérieure, entretien régulier requis. Bois/alu : compromis haut de gamme (> 1 200 €/fenêtre). Le choix dépend du budget et de l'architecture — un bon menuisier Qualibat RGE conseille selon l'exposition et l'existant.",
      },
      {
        question:
          "MaPrimeRénov' couvre-t-elle le remplacement d'un double vitrage par un autre double vitrage ?",
        answer:
          "Non. Depuis 2023, l'aide MaPrimeRénov' fenêtres ne couvre que le remplacement d'anciens vitrages simples (ou de vitrages double premier âge d'avant 1990 avec justificatif). Remplacer un double vitrage récent par un autre, même plus performant, n'est pas éligible. Cette restriction vise à concentrer les aides sur les logements les plus déperditifs. Le Coup de Pouce CEE peut toutefois être mobilisable dans certains cas spécifiques — vérifiez avec votre menuisier RGE.",
      },
      {
        question: "Combien de temps dure le remplacement d'une fenêtre ?",
        answer:
          'Pour un remplacement en « rénovation » (dépose ancienne fenêtre puis pose nouvelle dans la même ouverture) : 2 à 4 heures par fenêtre incluant étanchéité et finitions. Pour une pose « en applique » ou « en tableau » avec redimensionnement, compter 4 à 8 heures. Un bon menuisier RGE pose 4 à 6 fenêtres par jour en rénovation standard. Demandez un planning précis sur le devis — les menuiseries sont commandées sur mesure, délai de fabrication 3 à 6 semaines.',
      },
    ],
    metaTitle: 'Menuisier RGE fenêtres & portes — Qualibat 2026',
    metaDescription:
      "Trouvez un menuisier RGE Qualibat pour remplacement fenêtres, portes, baies. Aides MaPrimeRénov', CEE, TVA 5,5 %.",
  },

  couvreur: {
    h1: 'Couvreur RGE : qualification isolation toiture & aides',
    lede: "Couvreurs Qualibat RGE spécialisés en isolation de toiture par l'extérieur (sarking), couverture éco-performante et traitement des combles.",
    description: [
      "La toiture est le premier poste de déperdition thermique d'un logement (jusqu'à 30 % des pertes en maison individuelle). Un couvreur RGE Qualibat maîtrise deux techniques d'isolation complémentaires : l'isolation par l'extérieur en sarking (pose d'un isolant rigide sur la charpente visible) et l'isolation des combles aménageables par l'intérieur (laine minérale ou biosourcée entre chevrons).",
      "La qualification de référence est Qualibat RGE « couverture » et « isolation toiture », délivrée après audit chantier et formation continue. Sans cette mention, ni MaPrimeRénov' (jusqu'à 75 €/m² pour une isolation sarking) ni les primes CEE combles ne sont mobilisables.",
      "Les couvreurs listés ci-dessous sont titulaires d'une qualification Qualibat RGE couverture active, synchronisée chaque semaine avec le référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Isolation sarking',
        detail: 'Isolant rigide sur charpente, préservation volume combles, R ≥ 6.',
      },
      {
        label: 'Isolation combles aménageables',
        detail: 'Laine minérale entre chevrons, pare-vapeur, R ≥ 6.',
      },
      {
        label: 'Réfection couverture + isolation',
        detail: 'Rénovation totale toiture avec mise à niveau isolation.',
      },
      {
        label: 'Zinguerie et étanchéité',
        detail: 'Gouttières zinc, bandes de rive, noues et faîtages étanches.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' isolation toiture",
        montant: "jusqu'à 75 €/m²",
        detail: 'Forfait ITE toiture (sarking), modulé selon revenus.',
      },
      {
        label: 'Prime CEE combles',
        montant: "jusqu'à 20 €/m²",
        detail: 'Délégataires pour isolation combles perdus ou aménageables.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur isolation thermique réalisée par couvreur RGE.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 15 000 €",
        detail: "Prêt à taux zéro si l'isolation toiture est dans un bouquet de travaux.",
      },
    ],
    faq: [
      {
        question: 'Sarking ou isolation entre chevrons : que choisir ?',
        answer:
          "Le sarking (isolation par l'extérieur en toiture) est la méthode de référence lorsqu'on refait la couverture : on pose l'isolant rigide directement sur la charpente apparente, puis la couverture par-dessus. Avantages : pas de perte de volume intérieur, charpente préservée, ponts thermiques supprimés, rendu esthétique intérieur conservé. Inconvénient : coût plus élevé (200-300 €/m² avec couverture). L'isolation entre chevrons (laine minérale par l'intérieur) est moins chère (60-100 €/m²) mais réduit le volume habitable et laisse des ponts thermiques au niveau des chevrons. Pour une rénovation globale avec DPE visé, le sarking est presque toujours préférable.",
      },
      {
        question: "Combien coûte l'isolation d'une toiture en sarking ?",
        answer:
          "Pour une maison individuelle de 120 m² de toiture : 25 000 à 40 000 € TTC pose comprise (fourniture isolant haute performance + couverture neuve + zinguerie). Après cumul MaPrimeRénov' (jusqu'à 9 000 € pour 120 m²) + prime CEE + TVA 5,5 %, le reste à charge pour un ménage aux revenus modestes peut descendre sous 15 000 €. C'est un chantier lourd mais qui combine réfection de toiture et rénovation énergétique en une seule intervention.",
      },
      {
        question: 'Quelle résistance thermique R pour une toiture isolée ?',
        answer:
          "Les seuils réglementaires pour accéder aux aides MaPrimeRénov' et CEE : R ≥ 6 m².K/W pour les rampants de toiture (combles aménagés), R ≥ 7 m².K/W pour les combles perdus. En sarking, cela correspond à 24 cm de polyuréthane (lambda 0,022) ou 28 cm de fibre de bois (lambda 0,038). En rampants, à 20 cm de laine de verre entre chevrons + 10 cm complémentaires sous chevrons. Un bon couvreur RGE calcule la R résultante sur devis — exigez la mention explicite.",
      },
      {
        question: 'Peut-on combiner réfection couverture et isolation pour maximiser les aides ?',
        answer:
          "Oui, c'est même la stratégie optimale. Un chantier combinant réfection complète de couverture + isolation sarking est éligible à MaPrimeRénov' pour la part isolation, aux primes CEE pour la performance énergétique, et à la TVA 5,5 % sur l'ensemble du chantier. Si le logement a > 2 ans, vous bénéficiez aussi de la TVA 10 % sur la part couverture (entretien-rénovation). En moyenne, le cumul d'aides ramène le coût net à 40-60 % du devis initial pour une rénovation complète de toiture.",
      },
    ],
    metaTitle: 'Couvreur RGE isolation toiture (sarking) — Qualibat',
    metaDescription:
      "Trouvez un couvreur RGE Qualibat pour isolation sarking, combles, réfection toiture. Données ADEME, MaPrimeRénov', CEE.",
  },

  plombier: {
    h1: 'Plombier RGE : qualification chauffe-eau thermo & aides',
    lede: "Plombiers-chauffagistes RGE spécialisés en chauffe-eau thermodynamique (CET), solutions ECS performantes et remplacement d'équipements énergivores.",
    description: [
      "Le chauffe-eau thermodynamique (CET) est la solution ECS la plus performante pour un logement moderne : il capte les calories de l'air ambiant ou extrait pour produire de l'eau chaude, avec un COP moyen de 3 — soit 3 fois moins de consommation électrique qu'un cumulus classique. L'aide MaPrimeRénov' CET peut atteindre 1 200 € pour un ménage très modeste, cumulable avec la prime CEE.",
      "La qualification Chauffage + de Qualibat ou QualiPAC de Qualit'EnR sont les deux mentions de référence pour l'installation d'un CET. Le plombier doit maîtriser le dimensionnement, l'intégration sur l'arrivée d'eau existante, la gestion des condensats et le raccordement électrique du compresseur.",
      "Les plombiers-chauffagistes listés ci-dessous sont titulaires d'une qualification RGE active (Chauffage +, QualiPAC ou équivalent Qualibat) vérifiée au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Chauffe-eau thermodynamique (CET)',
        detail: 'Installation sur air ambiant ou air extrait, COP ≥ 3, évacuation condensats.',
      },
      {
        label: 'Ballon ECS solaire',
        detail: 'Couplage avec chauffe-eau solaire individuel (CESI), appoint électrique.',
      },
      {
        label: 'Remplacement cumulus vétuste',
        detail: 'Dépose ancien cumulus, installation CET ou ballon hybride.',
      },
      {
        label: 'Optimisation réseau ECS',
        detail: 'Bouclage, isolation tuyauteries, mitigeurs thermostatiques.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' CET",
        montant: "jusqu'à 1 200 €",
        detail: 'Forfait Anah pour chauffe-eau thermodynamique classe A ou A+.',
      },
      {
        label: 'Prime CEE ECS',
        montant: "jusqu'à 350 €",
        detail: 'Versée par délégataire CEE en complément.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur fourniture + pose par plombier RGE.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 7 000 €",
        detail: "Si le CET est dans un bouquet d'au moins 2 travaux de rénovation énergétique.",
      },
    ],
    faq: [
      {
        question: 'Chauffe-eau thermodynamique ou chauffe-eau solaire : que choisir ?',
        answer:
          "Les deux sont des solutions performantes mais répondent à des logiques différentes. Le chauffe-eau thermodynamique (CET) est plus simple à installer (pas de panneaux en toiture), fonctionne toute l'année quelle que soit la météo, et coûte 2 500 à 4 000 € TTC. Le chauffe-eau solaire individuel (CESI) offre des économies supérieures (70 % sur l'ECS annuelle en région sud) mais coûte 5 000 à 8 000 € TTC et dépend de l'ensoleillement. MaPrimeRénov' aide les deux, mais le CESI est mieux doté (jusqu'à 4 000 € contre 1 200 € pour le CET).",
      },
      {
        question: 'Un CET fonctionne-t-il dans un logement petit ou sans cave ?',
        answer:
          "Un CET a besoin d'un volume minimum d'air pour capter les calories : idéalement 20 m³ (soit une pièce de 8 m² sous 2,5 m de hauteur). Dans un logement sans cave ou sans buanderie, il existe des CET sur air extrait qui se raccordent directement au circuit VMC — ils ne dégradent pas l'air ambiant. En copropriété sans espace dédié, c'est souvent la seule solution. Un plombier Chauffage + saura dimensionner selon votre configuration.",
      },
      {
        question: "Combien de temps dure l'installation d'un CET ?",
        answer:
          "Pour le remplacement d'un cumulus existant par un CET dans un local technique déjà équipé : demi-journée à une journée (dépose ancien cumulus, pose CET, raccordements eau + électricité + évacuation condensats). Pour une installation neuve ou un déplacement, compter 1 à 1,5 jour. Un bon plombier RGE anticipe les contraintes (volume d'air, évacuation condensats, prise électrique dédiée 16 A, disjoncteur différentiel) sur le devis — exigez un dimensionnement précis avant signature.",
      },
      {
        question: 'Quelle est la durée de vie moyenne d\u2019un CET ?',
        answer:
          "Un CET de qualité installé dans les règles dure 15 à 20 ans, soit une durée de vie équivalente à celle d'une pompe à chaleur (avec laquelle il partage le même principe technique). Le compresseur est la pièce la plus sollicitée — sur les modèles haut de gamme (Atlantic, De Dietrich, Thermor), les garanties s'étendent à 5 voire 7 ans. Un contrat d'entretien annuel (vidange + contrôle compresseur + mesure COP) par votre installateur RGE est vivement recommandé pour maintenir la performance.",
      },
    ],
    metaTitle: 'Plombier RGE chauffe-eau thermodynamique — Aides CET',
    metaDescription:
      "Trouvez un plombier RGE pour chauffe-eau thermodynamique. MaPrimeRénov' CET, prime CEE, TVA 5,5 %, données ADEME.",
  },

  climaticien: {
    h1: 'Climaticien RGE : qualification PAC air/air & aides',
    lede: 'Climaticiens QualiPAC et Qualibat RGE pour climatisation réversible, pompes à chaleur air/air et multi-splits éligibles au coup de pouce CEE.',
    description: [
      "La climatisation réversible (PAC air/air) est une solution de chauffage d'appoint et de rafraîchissement estival très efficace dans les logements bien isolés. Contrairement à la PAC air/eau (éligible MaPrimeRénov'), la PAC air/air n'ouvre pas droit à l'aide de l'Anah — en revanche, la prime Coup de Pouce CEE reste mobilisable pour remplacer un chauffage électrique ou fossile dans un logement classé F ou G.",
      "La qualification de référence est QualiPAC (Qualit'EnR) déclinée pour les PAC air/air, ou Qualibat RGE « climatisation et pompes à chaleur ». Le climaticien doit maîtriser le calcul de charge thermique, le dimensionnement des unités intérieures (une par pièce à traiter), le tirage frigorifique et la récupération des fluides (certificat d'aptitude à la manipulation des fluides frigorigènes obligatoire depuis 2008).",
      "Les climaticiens listés ci-dessous sont titulaires d'une qualification RGE active et d'une attestation fluides frigorigènes valide, vérifiées au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'PAC air/air mono-split',
        detail: '1 unité extérieure + 1 unité intérieure pour une pièce principale.',
      },
      {
        label: 'PAC air/air multi-split',
        detail: '1 unité extérieure + 2 à 5 unités intérieures pour maison complète.',
      },
      {
        label: 'Climatisation réversible gainable',
        detail: 'Unité centrale dissimulée en faux plafond, diffusion par gaines.',
      },
      {
        label: 'Maintenance fluides frigorigènes',
        detail: 'Contrôle étanchéité, recharge, récupération fluides R410A/R32.',
      },
    ],
    aides: [
      {
        label: 'Coup de Pouce CEE PAC air/air',
        montant: "jusqu'à 1 200 €",
        detail: "Substitution d'un chauffage électrique ou fossile, logement F/G.",
      },
      {
        label: "MaPrimeRénov'",
        montant: '—',
        detail: 'Non éligible pour les PAC air/air depuis 2021.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur la fourniture et la pose par climaticien RGE.',
      },
      {
        label: "Crédit d'impôt transition énergétique",
        montant: '—',
        detail: 'Supprimé depuis 2021, remplacé par MaPrimeRénov\u2019.',
      },
    ],
    faq: [
      {
        question: "Pourquoi la PAC air/air n'est-elle pas éligible à MaPrimeRénov' ?",
        answer:
          "L'Anah a retiré la PAC air/air du barème MaPrimeRénov' en 2021 pour concentrer les aides sur les solutions à plus fort ROI énergétique (PAC air/eau, chaudière biomasse, isolation). Raison : la PAC air/air couvre mal l'eau chaude sanitaire et est moins performante qu'une PAC air/eau en chauffage principal. Elle reste toutefois très pertinente comme solution d'appoint ou dans des logements petits bien isolés. Le Coup de Pouce CEE reste mobilisable (jusqu'à 1 200 €) pour substituer un chauffage électrique dans un logement classé F ou G.",
      },
      {
        question: "Attestation de capacité fluides frigorigènes : qu'est-ce que c'est ?",
        answer:
          "Depuis le décret 2007-737 du 7 mai 2007, toute entreprise qui manipule des fluides frigorigènes (installation, entretien, récupération) doit détenir une attestation de capacité délivrée par un organisme agréé. Cette attestation est distincte de la mention RGE mais indispensable pour installer une climatisation. Un climaticien Qualibat RGE légitime cumule les deux. À défaut de cette attestation, l'installation est illégale et l'assureur peut refuser la décennale en cas de sinistre.",
      },
      {
        question: 'Combien coûte une climatisation réversible multi-split ?',
        answer:
          "Pour une installation multi-split 1 unité extérieure + 3 unités intérieures (séjour + 2 chambres) couvrant environ 70 m² : 6 000 à 9 000 € TTC pose comprise, selon la marque (Daikin, Mitsubishi, Toshiba, Atlantic) et la puissance. Avec la prime Coup de Pouce CEE (jusqu'à 1 200 € si substitution d'un chauffage électrique en logement F/G) et la TVA 5,5 %, le reste à charge tourne autour de 5 000 à 7 500 €. Demandez systématiquement un calcul de charge thermique sur devis.",
      },
      {
        question: 'Peut-on combiner PAC air/air et PAC air/eau dans un même logement ?',
        answer:
          "Oui, et c'est parfois une stratégie pertinente : PAC air/eau pour le chauffage principal et l'ECS (couvre l'essentiel des besoins annuels), PAC air/air multi-split pour le rafraîchissement estival et l'appoint chauffage dans certaines pièces. Les deux équipements sont indépendants mais peuvent être installés par le même artisan RGE s'il cumule QualiPAC et Qualibat climatisation. Dans ce cas, la PAC air/eau ouvre droit à MaPrimeRénov' et la PAC air/air au Coup de Pouce CEE — les deux aides se cumulent.",
      },
    ],
    metaTitle: 'Climaticien RGE QualiPAC air/air — Coup de Pouce CEE',
    metaDescription:
      'Trouvez un climaticien RGE pour PAC air/air réversible. Coup de Pouce CEE, attestation fluides frigorigènes, données ADEME.',
  },

  ramoneur: {
    h1: 'Ramoneur RGE : certification chauffage bois & aides',
    lede: "Ramoneurs et entreprises d'entretien RGE pour appareils à bois (poêles, chaudières, inserts). Condition de maintien des aides et des assurances.",
    description: [
      "L'entretien annuel des appareils de chauffage au bois n'est pas un simple confort : c'est une obligation réglementaire (arrêté du 23 février 2009 pour les chaudières > 4 kW, règlement sanitaire départemental pour tous les conduits) et une condition de maintien des garanties constructeur et décennale. Un ramonage mal exécuté ou absent est aussi l'une des principales causes d'incendie domestique et d'intoxication au monoxyde de carbone.",
      "La qualification QualiBois Entretien (Qualit'EnR) certifie les entreprises capables d'intervenir sur poêles à granulés, chaudières biomasse et inserts — tous équipements éligibles MaPrimeRénov' si l'installation initiale est RGE. Pour maintenir l'éligibilité aux aides rétroactives et à la décennale, la mention RGE de l'entreprise d'entretien compte autant que celle de l'installateur initial.",
      "Les ramoneurs et entreprises d'entretien listés ci-dessous sont tous titulaires d'une qualification QualiBois Entretien active, vérifiée au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Ramonage conduit fumée',
        detail: "Brossage mécanique ou chimique, délivrance certificat pour l'assureur.",
      },
      {
        label: 'Entretien poêle à granulés',
        detail: 'Nettoyage chambre combustion, échangeur, vidange cendrier, contrôle sondes.',
      },
      {
        label: 'Entretien chaudière biomasse',
        detail: 'Contrôle brûleur, échangeur, système alimentation granulés, rendement.',
      },
      {
        label: 'Tubage et réhabilitation conduit',
        detail: 'Installation tubage flexible inox, remise en conformité DTU 24.1.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' entretien",
        montant: '—',
        detail: "Non éligible pour l'entretien seul (l'aide porte sur l'installation initiale).",
      },
      {
        label: 'TVA à 10 %',
        montant: '—',
        detail: "Taux intermédiaire sur prestations d'entretien dans un logement > 2 ans.",
      },
      {
        label: "Crédit d'impôt entretien",
        montant: '—',
        detail: 'Supprimé depuis 2021, non remplacé.',
      },
      {
        label: 'Maintien garantie décennale',
        montant: '—',
        detail: "L'entretien annuel documenté est une condition de maintien de l'assurance.",
      },
    ],
    faq: [
      {
        question: "L'entretien annuel est-il obligatoire pour un poêle à granulés ?",
        answer:
          "Oui, deux obligations coexistent. L'obligation de ramonage (1 à 2 fois par an selon le règlement sanitaire départemental, généralement 2 fois par an pour un appareil à usage principal) imposée par la préfecture. Et l'obligation d'entretien annuel de l'appareil lui-même (nettoyage chambre de combustion, échangeur, vidange cendrier, contrôle des sondes et de la programmation) imposée par l'arrêté du 15 septembre 2009 pour les équipements > 4 kW. Le certificat d'entretien annuel est exigé par l'assureur en cas de sinistre — sans certificat, la décennale peut être refusée.",
      },
      {
        question: 'Combien coûte un entretien annuel de poêle à granulés ?',
        answer:
          "Entre 150 et 250 € TTC pour une prestation complète (entretien poêle + ramonage conduit + contrôle sécurité), selon la région et l'accessibilité du conduit. La plupart des installateurs RGE QualiBois proposent un contrat annuel d'entretien à 180-220 € incluant une intervention planifiée et une garantie de disponibilité en cas de panne. C'est souvent le meilleur rapport qualité-prix, notamment pour maintenir la performance du COP et prévenir les pannes coûteuses.",
      },
      {
        question: 'Que vérifie concrètement le ramoneur lors du passage annuel ?',
        answer:
          "Un ramonage complet comprend : contrôle de l'état général du conduit de fumée (inspection visuelle, parfois caméra), brossage mécanique ou chimique (selon accessibilité), retrait des suies et bistres, contrôle de l'étanchéité et des joints, vérification du tirage, et contrôle des conditions d'évacuation des produits de combustion. Pour un appareil à granulés, s'ajoutent le nettoyage de la chambre de combustion, du brasero, de l'échangeur et du système d'alimentation en granulés. Le ramoneur délivre obligatoirement un certificat daté et signé — conservez-le, votre assureur peut l'exiger.",
      },
      {
        question: 'Le ramoneur doit-il être RGE ?',
        answer:
          "Pour un simple ramonage de conduit, non : un ramoneur patenté (ancienne qualification professionnelle) suffit. En revanche, pour l'entretien complet d'un poêle à granulés ou d'une chaudière biomasse éligibles MaPrimeRénov', la qualification QualiBois Entretien est fortement recommandée — elle garantit une intervention dans les règles de l'art selon les recommandations du fabricant et maintient l'éligibilité aux aides en cas de remplacement futur. De plus, certains contrats constructeur exigent un entretien par un professionnel RGE pour maintenir la garantie.",
      },
    ],
    metaTitle: 'Ramoneur RGE QualiBois — Entretien poêle granulés',
    metaDescription:
      'Trouvez un ramoneur RGE QualiBois pour entretien poêle granulés et chaudière biomasse. Certificat annuel obligatoire.',
  },

  zingueur: {
    h1: 'Zingueur RGE : qualification couverture-isolation & aides',
    lede: "Zingueurs Qualibat RGE pour couverture zinc, isolation de toiture et travaux d'étanchéité performants. Cumul aides isolation + réfection couverture.",
    description: [
      "Le zingueur est l'artisan spécialisé dans la couverture métallique (zinc, cuivre, aluminium) et dans les ouvrages de zinguerie (gouttières, descentes, noues, solins, bandes de rive). Dans une rénovation énergétique complète, il intervient souvent en tandem avec le couvreur ou en entreprise tout-corps-d'état pour combiner réfection de toiture et isolation par l'extérieur (sarking).",
      "La qualification de référence est Qualibat RGE « couverture » ou « zinguerie-couverture », délivrée après audit chantier et formation continue. Un zingueur RGE légitime maîtrise à la fois la pose des isolants rigides sur charpente et les techniques d'étanchéité périphérique (abergements de cheminées, raccords verre et zinc, noues).",
      "Les zingueurs listés ci-dessous sont titulaires d'une qualification Qualibat RGE couverture active, vérifiée au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Couverture zinc joint debout',
        detail: 'Technique historique haut de gamme, étanchéité longue durée.',
      },
      {
        label: 'Isolation sarking + couverture',
        detail: 'Chantier combiné isolation extérieure + réfection couverture.',
      },
      {
        label: 'Zinguerie gouttières et descentes',
        detail: 'Remplacement gouttières zinc, naissances, tuyaux de descente.',
      },
      {
        label: 'Étanchéité noues et solins',
        detail: 'Raccords entre versants, autour de cheminées et lucarnes.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' isolation sarking",
        montant: "jusqu'à 75 €/m²",
        detail: 'Applicable à la part isolation du chantier combiné couverture.',
      },
      {
        label: 'Prime CEE combles',
        montant: "jusqu'à 20 €/m²",
        detail: 'Versée par délégataires pour la performance thermique atteinte.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur la part isolation, 10 % sur la part couverture entretien.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 15 000 €",
        detail: "Prêt à taux zéro si l'isolation toiture est incluse dans un bouquet.",
      },
    ],
    faq: [
      {
        question: 'Zingueur ou couvreur : quelle différence pour une réfection de toit ?',
        answer:
          "Les deux métiers se recoupent largement. Historiquement, le couvreur pose tous types de couverture (tuile, ardoise, zinc) et maîtrise la charpente légère. Le zingueur est spécialisé dans les ouvrages en zinc (couverture zinc joint debout, gouttières, noues, solins) et est souvent sollicité en complément d'un couvreur tuile/ardoise pour les finitions métalliques. Pour une rénovation énergétique avec isolation sarking, les deux métiers peuvent intervenir selon la couverture finale — exigez dans tous les cas une qualification Qualibat RGE couverture active.",
      },
      {
        question: 'Combien coûte une couverture zinc joint debout ?',
        answer:
          "Le zinc joint debout est une technique haut de gamme : 150 à 250 €/m² posé selon la complexité du toit (nombre de noues, arêtiers, lucarnes) et le type de support. Pour une toiture de 100 m² : 15 000 à 25 000 € TTC hors isolation. Si le chantier combine isolation sarking + couverture zinc, le coût total monte à 30 000-50 000 € TTC mais avec cumul d'aides qui peuvent ramener le reste à charge à 15 000-25 000 €. Le zinc a une durée de vie exceptionnelle (80-100 ans) qui amortit le surcoût initial.",
      },
      {
        question: 'Le zinc est-il compatible avec une isolation par sarking ?',
        answer:
          "Oui, parfaitement. Le zinc joint debout est même l'une des couvertures les plus compatibles avec le sarking car il se pose sur voligeage continu (plancher bois) qui suit naturellement la pose d'un isolant rigide (polyuréthane, fibre de bois) sur la charpente apparente. La séquence classique : chevrons/charpente → isolant rigide 20-24 cm → support continu (OSB ou volige) → écran sous-toiture → liteaux → zinc. Un bon zingueur Qualibat RGE maîtrise cette séquence et garantit l'étanchéité globale.",
      },
      {
        question:
          'Peut-on conserver une couverture tuile et faire intervenir un zingueur pour les finitions ?',
        answer:
          "Oui, et c'est très fréquent. Dans une rénovation de toiture tuile ou ardoise, le zingueur intervient sur les ouvrages métalliques périphériques : gouttières zinc, bandes de rive, abergements de cheminées, solins, noues, faîtages ventilés. Ces ouvrages représentent 15 à 25 % du coût total de la couverture mais sont critiques pour l'étanchéité. Un zingueur RGE garantit la qualité de ces raccords souvent négligés — c'est là que se concentrent la majorité des infiltrations sur toitures vieillissantes.",
      },
    ],
    metaTitle: 'Zingueur RGE Qualibat — Couverture zinc & isolation',
    metaDescription:
      "Trouvez un zingueur RGE Qualibat pour couverture zinc, sarking et isolation toiture. Données ADEME, MaPrimeRénov'.",
  },

  facadier: {
    h1: 'Façadier RGE : certification ITE Qualibat & aides',
    lede: "Façadiers Qualibat RGE spécialisés en isolation thermique par l'extérieur (ITE), ravalement performant et rénovation des façades anciennes.",
    description: [
      "L'isolation thermique par l'extérieur (ITE) est la solution la plus performante pour isoler les murs d'une maison individuelle : elle supprime les ponts thermiques au niveau des refends et des planchers intermédiaires, préserve l'inertie des murs anciens, ne réduit pas la surface habitable et permet un ravalement simultané. Le façadier RGE est le professionnel clé de cette technique.",
      "La qualification Qualibat RGE « ITE » (code 7143) couvre les trois grandes familles : enduit mince sur isolant (ETICS), bardage rapporté ventilé, et vêture. Un façadier RGE doit maîtriser le diagnostic de la façade existante, le choix de l'isolant adapté (polystyrène, laine de roche, fibre de bois), la préparation du support et la pose des profilés de finition.",
      "Les façadiers listés ci-dessous sont titulaires d'une qualification Qualibat RGE ITE active, vérifiée chaque semaine au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'ITE enduit mince sur polystyrène',
        detail: 'Technique la plus courante et économique, performance R jusqu\u2019à 5.',
      },
      {
        label: 'ITE bardage ventilé',
        detail: 'Bardage bois, composite ou métallique sur ossature, pour rénovation lourde.',
      },
      {
        label: 'Ravalement + isolation combinés',
        detail: 'Rénovation esthétique et énergétique en une seule intervention.',
      },
      {
        label: 'Traitement humidité et fissures',
        detail:
          'Diagnostic préalable à l\u2019ITE : ces désordres doivent être traités avant pose isolant.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' ITE",
        montant: "jusqu'à 75 €/m²",
        detail: 'Forfait au mètre carré isolé, modulé selon revenus.',
      },
      {
        label: 'Prime CEE ITE',
        montant: "jusqu'à 20 €/m²",
        detail: 'Versée par délégataires, cumulable avec MaPrimeRénov\u2019.',
      },
      { label: 'TVA à 5,5 %', montant: '—', detail: 'Taux réduit sur la part isolation ITE.' },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 15 000 €",
        detail: 'Prêt à taux zéro pour financer la part non couverte par les aides.',
      },
    ],
    faq: [
      {
        question: 'Quelle épaisseur minimum pour une ITE performante ?',
        answer:
          "Pour atteindre le seuil R ≥ 3,7 m².K/W exigé par MaPrimeRénov' et les primes CEE, il faut au minimum : 14 cm de polystyrène graphité (lambda 0,031), ou 16 cm de polystyrène blanc (lambda 0,036), ou 18 cm de laine de roche (lambda 0,035), ou 20 cm de fibre de bois (lambda 0,038). L'épaisseur recommandée est plutôt R ≥ 5 (soit 18-24 cm selon matériau) pour maximiser les économies et atteindre les exigences BBC-Effinergie. Un bon façadier RGE calcule la R sur devis.",
      },
      {
        question: 'ITE ou ravalement simple : peut-on faire les deux ensemble ?',
        answer:
          "Oui, et c'est économiquement très pertinent. Un ravalement de façade classique coûte 80-150 €/m² (échafaudage + préparation support + enduit + finition). Une ITE avec enduit mince coûte 150-250 €/m² (surcoût isolant + pose + finition). Le différentiel brut est compensé par les aides MaPrimeRénov' + CEE qui peuvent atteindre 95 €/m² cumulés. Résultat : pour quelques milliers d'euros de plus, vous obtenez une façade neuve + une isolation performante. Si votre façade a besoin d'un ravalement, faites toujours étudier l'ITE en parallèle.",
      },
      {
        question: "Qu'est-ce qu'un diagnostic préalable à l'ITE ?",
        answer:
          "Avant toute ITE, un façadier sérieux réalise un diagnostic de la façade existante pour identifier les pathologies à traiter en amont : fissures structurelles (à réparer), remontées d'humidité capillaire (à drainer), salpêtre (à traiter), support friable (à consolider). Poser un isolant sur une façade non préparée est une garantie de désordres ultérieurs (décollement de l'enduit, gonflements, moisissures). Ce diagnostic est parfois inclus dans le devis, parfois facturé en supplément (200-500 €) — exigez-le systématiquement.",
      },
      {
        question: 'Combien coûte une ITE complète pour une maison individuelle ?',
        answer:
          "Pour une maison de 120 m² de surface habitable, la surface de façade à isoler est typiquement de 150 à 180 m² (déduction des ouvertures). Avec une ITE enduit mince sur polystyrène : 25 000 à 40 000 € TTC pose comprise (échafaudage + isolant + enduit + finitions). Avec cumul MaPrimeRénov' (jusqu'à 13 500 € pour 180 m²) + CEE (jusqu'à 3 600 €) + TVA 5,5 %, le reste à charge pour un ménage aux revenus modestes descend à 10 000-20 000 €. C'est le chantier de rénovation énergétique avec le meilleur ROI après l'isolation de toiture.",
      },
    ],
    metaTitle: 'Façadier RGE ITE — Qualibat isolation extérieure',
    metaDescription:
      "Trouvez un façadier RGE Qualibat pour ITE, ravalement performant. Données ADEME, MaPrimeRénov', primes CEE.",
  },

  platrier: {
    h1: 'Plâtrier RGE : qualification isolation ITI & aides',
    lede: "Plâtriers Qualibat RGE spécialisés en isolation thermique par l'intérieur (ITI), cloisons performantes et doublage de murs anciens.",
    description: [
      "L'isolation thermique par l'intérieur (ITI) reste la technique la plus économique et la moins invasive pour isoler les murs d'un logement — notamment en copropriété où l'ITE est souvent refusée. Le plâtrier-plaquiste RGE Qualibat est le professionnel de référence pour cette technique : il maîtrise la pose des doublages isolants (complexes laine + plaque de plâtre) et la gestion des points singuliers (tableaux de fenêtre, coffres de volet roulant, angles).",
      "La qualification Qualibat RGE ITI (codes 7141 murs, 7142 combles) certifie l'entreprise après audit chantier. Un plâtrier RGE sait calculer le R résultant selon l'épaisseur et le lambda du matériau, garantir l'étanchéité à l'air (pare-vapeur continu), et traiter les ponts thermiques aux jonctions plancher-mur — points critiques souvent négligés par les plaquistes non formés.",
      "Les plâtriers listés ci-dessous sont titulaires d'une qualification Qualibat RGE ITI active, vérifiée au référentiel ADEME.",
    ],
    travaux: [
      {
        label: 'Doublage laine + plaque de plâtre',
        detail: "Complexe ITI standard, R jusqu'à 4, épaisseur 10-14 cm.",
      },
      {
        label: 'ITI polyuréthane (PIR)',
        detail: 'Isolant mince haute performance, R équivalent avec moitié d\u2019épaisseur.',
      },
      {
        label: 'Cloisons isolantes distributives',
        detail: 'Séparation de pièces avec performance acoustique et thermique.',
      },
      {
        label: 'Isolation planchers bas par dessous',
        detail: 'Projection mousse polyuréthane en sous-face plancher.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' ITI",
        montant: "jusqu'à 25 €/m²",
        detail: 'Forfait ITI murs, inférieur à ITE mais cumulable avec CEE.',
      },
      {
        label: 'Prime CEE ITI',
        montant: "jusqu'à 15 €/m²",
        detail: 'Versée par délégataires CEE en complément.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur la part isolation réalisée par plâtrier RGE.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 15 000 €",
        detail: "Prêt à taux zéro si l'ITI est dans un bouquet de travaux.",
      },
    ],
    faq: [
      {
        question: 'ITI ou ITE : laquelle privilégier pour un logement ancien ?',
        answer:
          "L'ITE est techniquement supérieure (suppression des ponts thermiques, préservation de l'inertie, pas de perte de surface habitable) mais elle modifie l'aspect extérieur et nécessite parfois une autorisation en secteur protégé. L'ITI est moins performante mais beaucoup plus souple : elle s'adapte aux copropriétés, aux façades patrimoniales classées ABF, et aux budgets serrés. MaPrimeRénov' favorise l'ITE (75 €/m² contre 25 €/m²) mais l'ITI reste une excellente option quand l'ITE n'est pas possible. Un bon plâtrier RGE saura orienter selon votre configuration.",
      },
      {
        question: 'Combien de surface habitable perd-on avec une ITI de 12 cm ?',
        answer:
          "Pour une pièce de 4 × 4 m (16 m² habitable), une ITI périphérique de 12 cm réduit la surface utile d'environ 0,7 à 0,9 m² (selon le nombre de murs isolés). Sur une maison de 100 m², une ITI complète sur toutes les façades extérieures représente 3 à 5 m² de perte — soit 3 à 5 % de la surface habitable. C'est le principal inconvénient de l'ITI face à l'ITE. Pour limiter cette perte, les complexes ITI au polyuréthane (PIR) permettent d'atteindre la même R avec 7-8 cm au lieu de 12-14 cm.",
      },
      {
        question: 'Quels points singuliers faut-il traiter en ITI ?',
        answer:
          "Les points critiques d'une ITI sont : les tableaux et linteaux de fenêtres (retour d'isolant obligatoire pour éviter les ponts thermiques et la condensation), les coffres de volets roulants (à isoler individuellement), les angles rentrants et sortants (continuité du pare-vapeur), la jonction plancher-mur (étanchéité à l'air), les prises électriques et interrupteurs (boîtiers étanches à l'air). Un plâtrier Qualibat RGE traite tous ces points sur devis — exigez la mention explicite, c'est un indicateur fiable de sérieux.",
      },
      {
        question: 'Peut-on cumuler une ITI sur une façade déjà partiellement isolée ?',
        answer:
          "Oui, mais avec précaution. Ajouter une ITI sur un mur déjà isolé par l'extérieur (ITE existante) est rarement pertinent : le ROI marginal est faible et le risque de condensation dans les couches intermédiaires est élevé. Ajouter une ITI sur un mur avec ancienne isolation par l'intérieur dégradée (placo des années 1980, R faible) est en revanche très courant : on dépose l'ancien complexe, on traite le support, puis on pose un ITI moderne à R ≥ 3,7 pour bénéficier des aides MaPrimeRénov' et CEE. Un diagnostic humidité préalable est indispensable dans tous les cas.",
      },
    ],
    metaTitle: 'Plâtrier RGE ITI — Qualibat isolation intérieure',
    metaDescription:
      "Trouvez un plâtrier RGE Qualibat pour ITI, doublage isolant et cloisons performantes. Aides MaPrimeRénov' et CEE.",
  },
  // === Élargissement RGE 2026-05-02 — slugs RGE-only ===
  'borne-recharge': {
    h1: 'Borne de recharge : certification RGE IRVE Qualifelec',
    lede: "Électriciens certifiés Qualifelec IRVE pour l'installation de bornes de recharge en maison, copropriété et entreprise — éligibles au programme ADVENIR.",
    description: [
      "L'installation d'une borne de recharge pour véhicule électrique de plus de 3,7 kW exige un installateur titulaire de la qualification Qualifelec IRVE (Infrastructure de Recharge de Véhicule Électrique), seul label reconnu par le programme ADVENIR pour le versement des primes. La qualification se décline en trois niveaux : P1 (jusqu'à 22 kW AC), P2 (avec supervision et communication) et P3 (charge rapide DC).",
      "Sans installateur Qualifelec IRVE actif à la date de signature du devis, aucune prime ADVENIR (jusqu'à 1 600 € en copropriété, 960 € en entreprise) n'est mobilisable, et le crédit d'impôt forfaitaire de 500 € pour les particuliers (résidences principales) ne peut pas être réclamé. Les contrôles d'Enedis et du programme ADVENIR aboutissent à un retrait de la prime lorsque la qualification fait défaut.",
      "Les artisans listés ci-dessous sont tous titulaires d'une qualification Qualifelec IRVE active dans le référentiel France Rénov' / ADEME, mise à jour chaque semaine.",
    ],
    travaux: [
      {
        label: 'Borne murale 7 à 22 kW (Wallbox)',
        detail:
          'Borne AC monophasée ou triphasée pour maison individuelle, sortie de garage ou parking extérieur.',
      },
      {
        label: 'Infrastructure copropriété',
        detail:
          "Câblage colonne montante, borne partagée, gestion d'accès par badge ou app — droit à la prise.",
      },
      {
        label: 'Bornes entreprise et flotte',
        detail:
          'Plusieurs bornes en parking salariés ou clients, supervision énergétique, refacturation.',
      },
      {
        label: 'Charge rapide DC (50 kW+)',
        detail:
          'Stations DC pour parkings publics, hôtels, restaurants — qualification Qualifelec IRVE P3.',
      },
    ],
    aides: [
      {
        label: 'Prime ADVENIR copropriété',
        montant: "jusqu'à 1 660 €/borne",
        detail:
          'Prise en charge par le programme ADVENIR, financé par les CEE — borne partagée en copro.',
      },
      {
        label: 'Crédit d’impôt borne particulier',
        montant: '500 € forfait',
        detail:
          "Crédit d'impôt fixe pour résidence principale, doublé à 1 000 € si pilotage énergétique.",
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail:
          "Taux réduit sur fourniture + pose en logement de plus de 2 ans, si l'installateur est Qualifelec IRVE.",
      },
      {
        label: 'Aides locales',
        montant: 'variable',
        detail:
          'Certaines régions et métropoles abondent ADVENIR (Île-de-France, Grand Lyon, etc.).',
      },
    ],
    faq: [
      {
        question: 'Pourquoi l’installateur doit-il être Qualifelec IRVE ?',
        answer:
          "Au-delà de 3,7 kW, l'arrêté du 27 décembre 2016 (modifié 2022) impose une installation par un professionnel qualifié IRVE. Sans cette qualification, votre installation est non conforme : assurance habitation susceptible d'être refusée en cas de sinistre, prime ADVENIR rejetée, crédit d'impôt redressé. Qualifelec est l'organisme accrédité COFRAC qui délivre cette mention après formation et audit.",
      },
      {
        question: 'Quelle puissance choisir pour une borne maison ?',
        answer:
          'Une Wallbox 7,4 kW monophasée couvre 99 % des besoins quotidiens (recharge 30 km/h). En triphasé, une 11 kW ou 22 kW divise le temps par 2 ou 3 mais nécessite un abonnement Enedis adapté (12 kVA mini en 22 kW). Au-delà, la charge rapide DC (50 kW+) est réservée aux usages intensifs et coûte 5 à 10 fois plus cher.',
      },
      {
        question: 'Combien coûte une borne posée en maison ?',
        answer:
          "Une Wallbox 7,4 kW posée par un installateur Qualifelec IRVE coûte 1 200 à 2 000 € TTC tout compris (matériel + pose + protection différentielle Type B). Une borne pilotable communicante avec gestion de la puissance va de 2 000 à 3 000 €. Après crédit d'impôt 500 € (1 000 € si pilotage), le reste à charge est de 700 à 2 000 €.",
      },
      {
        question: 'Comment vérifier qu’un installateur est bien Qualifelec IRVE ?',
        answer:
          "Le référentiel officiel est l'annuaire France Rénov' (france-renov.gouv.fr) : il recense toutes les qualifications RGE actives, dont Qualifelec IRVE. Notre vérificateur interne /verifier-artisan croise directement le SIRET de l'entreprise avec ce référentiel et affiche la liste des qualifications en cours de validité. Ne vous fiez jamais à un logo Qualifelec imprimé sur un devis sans contrôle officiel.",
      },
    ],
    metaTitle: 'Installateur borne de recharge Qualifelec IRVE — ADVENIR',
    metaDescription:
      "Trouvez un installateur Qualifelec IRVE certifié pour votre borne de recharge. Prime ADVENIR, crédit d'impôt 500 €.",
  },
  'chauffe-eau-thermodynamique': {
    h1: 'Chauffe-eau thermodynamique : qualification RGE & aides',
    lede: "Plombiers et chauffagistes QualiPAC module CET pour l'installation de chauffe-eau thermodynamiques — éligibles MaPrimeRénov' et prime CEE BAR-TH-148.",
    description: [
      "Le chauffe-eau thermodynamique (CET) capte les calories de l'air ambiant ou extrait pour produire l'eau chaude sanitaire avec un coefficient de performance (COP) annuel supérieur à 3, soit 3 fois moins d'électricité qu'un cumulus classique. Son installation requiert un artisan titulaire de la qualification QualiPAC module CET (Qualit'EnR), spécifiquement validée pour ce produit.",
      "Sans qualification QualiPAC CET active à la date de signature du devis, ni MaPrimeRénov' (forfait 400 à 1 200 € selon revenus) ni la prime CEE BAR-TH-148 (200 à 700 € selon délégataire) ne sont mobilisables. La TVA réduite à 5,5 % suit la même règle.",
      "Les artisans listés sont titulaires d'une qualification active dans le référentiel France Rénov' / ADEME, synchronisé chaque semaine.",
    ],
    travaux: [
      {
        label: 'CET sur air ambiant (cave/garage)',
        detail: "Volume technique requis ≥ 20 m³, puisage des calories de l'air non chauffé.",
      },
      {
        label: 'CET sur air extrait (VMC)',
        detail: 'Couplé à la VMC, idéal en logement neuf ou rénovation lourde — COP > 3,5.',
      },
      {
        label: 'CET sur air extérieur (split)',
        detail: 'Unité extérieure + ballon intérieur, parfait quand pas de volume technique.',
      },
      {
        label: 'Remplacement cumulus électrique',
        detail:
          'Dépose ancien cumulus, raccordement hydraulique et électrique, mise en service et règlement programmation.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' CET",
        montant: '400 à 1 200 €',
        detail: 'Forfait par tranche de revenus (bleu, jaune, violet, rose).',
      },
      {
        label: 'Prime CEE BAR-TH-148',
        montant: '200 à 700 €',
        detail: 'Versée par les délégataires obligés (Effy, Sonergia, TotalEnergies, Engie, EDF).',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: "Taux réduit sur fourniture + pose si l'artisan est QualiPAC CET RGE.",
      },
      {
        label: 'Éco-PTZ travaux énergétiques',
        montant: "jusqu'à 50 000 €",
        detail: 'Prêt à taux zéro pour financer le reste à charge en bouquet de travaux.',
      },
    ],
    faq: [
      {
        question: 'Quelle est la différence entre CET et cumulus électrique ?',
        answer:
          "Un cumulus électrique chauffe l'eau par effet Joule (résistance) avec un rendement de 1 (1 kWh consommé = 1 kWh restitué). Un CET utilise un cycle thermodynamique pour capter les calories de l'air et atteint un COP de 3 à 3,5 (1 kWh consommé = 3 à 3,5 kWh restitués). À l'usage, la facture ECS divisée par 3 — un foyer de 4 personnes économise 250 à 400 €/an.",
      },
      {
        question: 'Faut-il un volume technique pour installer un CET ?',
        answer:
          "Pour un CET sur air ambiant (le plus courant), oui : un local non chauffé d'au moins 20 m³ (cave, garage attenant, buanderie). Sans ce volume, on s'oriente vers un CET sur air extrait (couplé VMC) ou un split avec unité extérieure. Un installateur QualiPAC CET vous oriente sur le modèle adapté à votre configuration.",
      },
      {
        question: 'Combien coûte un CET installé ?',
        answer:
          "Le prix d'un CET 200 à 250 L posé par un artisan RGE va de 2 800 à 4 500 € TTC selon la marque et la configuration (air ambiant, air extrait, split). Après MaPrimeRénov' (400 à 1 200 €) et prime CEE (200 à 700 €), le reste à charge pour un ménage modeste tombe à 1 200-2 500 €.",
      },
      {
        question: 'Le CET est-il bruyant ?',
        answer:
          "Le compresseur d'un CET émet 35 à 45 dB selon les modèles, équivalent à un réfrigérateur silencieux. Installé en cave ou garage, il est quasiment imperceptible. En buanderie attenante à une chambre, choisissez un modèle inverter et privilégiez les marques qui communiquent leur niveau acoustique en dB(A) à 1 m.",
      },
    ],
    metaTitle: 'Artisan RGE chauffe-eau thermodynamique — QualiPAC CET',
    metaDescription:
      "Plombiers et chauffagistes QualiPAC CET pour votre chauffe-eau thermodynamique. MaPrimeRénov' jusqu'à 1 200 € + CEE BAR-TH-148.",
  },
  'audit-energetique': {
    h1: "Audit énergétique : RGE réglementaire & MaPrimeRénov'",
    lede: "Architectes CNOA et bureaux d'études OPQIBI 1905/1911 pour réaliser un audit énergétique conforme — point d'entrée obligatoire de la rénovation d'ampleur MaPrimeRénov'.",
    description: [
      "L'audit énergétique réglementaire est une étude approfondie qui établit l'état des lieux thermique d'un logement et propose au minimum deux scénarios de rénovation chiffrés permettant d'atteindre la classe B ou la classe A du DPE. Il est obligatoire depuis avril 2023 pour vendre un logement classé F ou G, et il conditionne l'accès au parcours MaPrimeRénov' Rénovation d'ampleur.",
      "Seuls les architectes inscrits au Conseil National de l'Ordre (CNOA), les bureaux d'études qualifiés OPQIBI 1905 ou 1911, et certaines entreprises Qualibat 8731 peuvent réaliser un audit conforme à l'arrêté du 4 mai 2022. Le rapport doit comporter un descriptif énergétique, deux scénarios chiffrés, une évaluation économique et un schéma de phasage.",
      "Les professionnels listés ici sont titulaires d'une qualification active reconnue par France Rénov' et l'ADEME — chaque audit ouvre droit à une prime forfaitaire MaPrimeRénov' (300 à 500 €) et déclenche le parcours d'accompagnement par Mon Accompagnateur Rénov'.",
    ],
    travaux: [
      {
        label: 'Audit énergétique réglementaire (vente F/G)',
        detail: "Audit obligatoire pour la vente d'un logement classé F ou G, depuis avril 2023.",
      },
      {
        label: 'Audit incitatif MaPrimeRénov’',
        detail: "Préalable au parcours Rénovation d'ampleur — donne droit à la prime audit.",
      },
      {
        label: 'Étude thermique RT/RE',
        detail: 'Étude thermique réglementaire pour permis de construire (RE 2020 en neuf).',
      },
      {
        label: 'Diagnostic technique global (DTG)',
        detail: 'Audit énergétique copropriété avec scénarios de rénovation par parties communes.',
      },
    ],
    aides: [
      {
        label: "Prime audit MaPrimeRénov'",
        montant: '300 à 500 €',
        detail:
          "Forfait selon revenus (bleu/jaune/violet/rose) — versé après réalisation de l'audit.",
      },
      {
        label: "MaPrimeRénov' Parcours Accompagné",
        montant: "jusqu'à 70 000 €",
        detail: "L'audit est obligatoire pour entrer dans le parcours rénovation d'ampleur.",
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail:
          "Taux réduit sur les travaux de rénovation énergétique mis en œuvre suite à l'audit.",
      },
      {
        label: 'Éco-PTZ Performance globale',
        montant: "jusqu'à 50 000 €",
        detail: "Prêt à taux zéro éligible si l'audit prouve un gain énergétique de 35 % minimum.",
      },
    ],
    faq: [
      {
        question: 'Audit énergétique ou DPE : quelle différence ?',
        answer:
          "Le DPE est un diagnostic réglementaire de 2 à 3 pages avec étiquette énergie A à G, obligatoire pour la vente ou la location. L'audit énergétique réglementaire est un rapport beaucoup plus poussé (40 à 80 pages) qui détaille les déperditions par poste, propose deux scénarios de rénovation chiffrés, et indique le gain énergétique en kWh/m²/an. Il est obligatoire pour la vente des passoires thermiques (F et G) depuis avril 2023.",
      },
      {
        question: 'Combien coûte un audit énergétique réglementaire ?',
        answer:
          "Le prix d'un audit énergétique réalisé par un architecte CNOA ou un BET OPQIBI va de 800 à 1 800 € TTC selon la complexité du logement (maison, copropriété, surface, présence de combles). MaPrimeRénov' verse une prime audit forfaitaire de 300 à 500 € selon les revenus, ce qui ramène le reste à charge à 300-1 500 €.",
      },
      {
        question: 'Qui peut réaliser un audit énergétique conforme ?',
        answer:
          "Trois profils sont reconnus par l'arrêté du 4 mai 2022 : les architectes inscrits au tableau du Conseil National de l'Ordre (CNOA), les bureaux d'études qualifiés OPQIBI 1905 ou 1911, et certaines entreprises Qualibat 8731 « audit énergétique ». Notre annuaire ne liste que des professionnels dont la qualification est active à date — exigez toujours le numéro de qualification sur le devis.",
      },
      {
        question: 'L’audit est-il obligatoire pour MaPrimeRénov’ ?',
        answer:
          "Oui pour le parcours MaPrimeRénov' Rénovation d'ampleur (jusqu'à 70 000 € d'aide). Non pour le parcours par geste (un travail isolé : changement de chaudière, isolation des combles, etc.). Pour rentrer dans le parcours d'ampleur, l'audit conditionne l'accès au gain énergétique de 2 classes minimum exigé par l'Anah.",
      },
    ],
    metaTitle: 'Audit énergétique réglementaire — Architectes & BET OPQIBI',
    metaDescription:
      "Architectes CNOA et bureaux d'études OPQIBI pour votre audit énergétique réglementaire. Prime MaPrimeRénov' 300-500 €.",
  },
  ventilation: {
    h1: 'VMC : certification RGE ventilation & aides',
    lede: 'Installateurs Qualibat RGE ventilation pour VMC simple flux hygroréglable et double flux haute performance — éligibles prime CEE BAR-TH-125.',
    description: [
      "Une ventilation mécanique contrôlée (VMC) performante est le complément indispensable de toute rénovation d'isolation : sans renouvellement d'air maîtrisé, l'humidité s'accumule et provoque condensation, moisissures et dégradations du bâti. La VMC double flux récupère 75 à 90 % de la chaleur de l'air extrait pour préchauffer l'air neuf entrant — gain énergétique de 5 à 15 % sur la facture chauffage.",
      "L'installation par un artisan Qualibat RGE ventilation conditionne l'accès à la prime CEE BAR-TH-125 (jusqu'à 800 € pour une VMC double flux), et l'éligibilité au parcours MaPrimeRénov' Rénovation d'ampleur lorsque la ventilation fait partie du bouquet de travaux.",
      "Les artisans listés sont titulaires d'une qualification active dans le référentiel France Rénov' / ADEME, mise à jour chaque semaine.",
    ],
    travaux: [
      {
        label: 'VMC simple flux hygroréglable',
        detail: 'Type B, débit modulé selon humidité — solution standard rénovation logement.',
      },
      {
        label: 'VMC double flux haute performance',
        detail:
          'Récupération de chaleur 75-90 %, idéale en rénovation BBC ou maison passive — BAR-TH-125.',
      },
      {
        label: 'VMR (ventilation mécanique répartie)',
        detail:
          'Bouches autonomes pièce par pièce — solution sans gaines, adaptée appartements existants.',
      },
      {
        label: 'Maintenance et entretien VMC',
        detail:
          'Nettoyage des bouches, remplacement des filtres, contrôle des débits — réglementaire annuel.',
      },
    ],
    aides: [
      {
        label: 'Prime CEE BAR-TH-125 (VMC double flux)',
        montant: "jusqu'à 800 €",
        detail: 'Versée par les délégataires obligés selon les revenus du foyer.',
      },
      {
        label: "MaPrimeRénov' Rénovation d'ampleur",
        montant: 'forfait variable',
        detail: 'VMC intégrée au bouquet quand au moins 2 gestes sont réalisés.',
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur fourniture + pose en logement de plus de 2 ans.',
      },
      {
        label: 'Éco-PTZ',
        montant: "jusqu'à 50 000 €",
        detail: 'Prêt à taux zéro pour financer le reste à charge.',
      },
    ],
    faq: [
      {
        question: 'VMC simple flux ou double flux : laquelle choisir ?',
        answer:
          "La VMC simple flux hygroréglable type B est le standard en rénovation : moins chère (700-1 500 € posée), elle évacue l'air vicié et le remplace par de l'air extérieur via les entrées d'air sur les fenêtres. La VMC double flux (3 500-7 000 € posée) récupère 75 à 90 % de la chaleur de l'air extrait — pertinente uniquement si le logement est déjà bien isolé (R ≥ 5 en murs et combles), sinon le retour sur investissement est trop long.",
      },
      {
        question: 'Pourquoi installer une VMC après isolation ?',
        answer:
          "Une isolation efficace rend le bâtiment quasi étanche à l'air. Sans renouvellement mécanique, l'humidité produite par les occupants (cuisine, salle de bain, respiration) ne s'évacue plus : elle condense sur les parois froides (ponts thermiques) et provoque moisissures, dégradation du placo et insalubrité. La VMC est obligatoire dans tout logement neuf depuis 1982 et fortement recommandée après isolation.",
      },
      {
        question: 'Combien coûte une VMC double flux ?',
        answer:
          "Le prix d'une VMC double flux haute performance posée par un Qualibat RGE va de 3 500 à 7 000 € TTC selon la surface, la configuration des gaines et le rendement de l'échangeur. Après prime CEE BAR-TH-125 (jusqu'à 800 €) et MaPrimeRénov' Rénovation d'ampleur si applicable, le reste à charge tombe à 2 000-5 000 €.",
      },
      {
        question: 'À quelle fréquence entretenir une VMC ?',
        answer:
          "Pour une VMC simple flux : nettoyer les bouches d'extraction tous les 6 mois, changer les filtres si présents tous les ans, faire vérifier les débits par un professionnel tous les 3 ans. Pour une VMC double flux : remplacer les filtres tous les 3 à 6 mois (essentiel pour la qualité d'air), nettoyer l'échangeur tous les 2 ans, vérifier les débits tous les 3 ans. Un entretien négligé divise la performance par 2.",
      },
    ],
    metaTitle: 'Artisan RGE VMC — Qualibat ventilation BAR-TH-125',
    metaDescription:
      "Installateurs Qualibat RGE pour VMC simple flux et double flux. Prime CEE BAR-TH-125 jusqu'à 800 €.",
  },
  fenetres: {
    h1: "Fenêtres : certification RGE remplacement & MaPrimeRénov'",
    lede: "Menuisiers Qualibat RGE pour le remplacement de fenêtres et baies isolantes — éligibles MaPrimeRénov' et primes CEE BAR-EN-104 / BAR-EN-108.",
    description: [
      "Les fenêtres anciennes représentent 10 à 15 % des déperditions thermiques d'une maison non rénovée. Le remplacement par des fenêtres performantes (Uw ≤ 1,3 W/m².K) avec un menuisier Qualibat RGE conditionne l'accès à MaPrimeRénov' (forfait 40 à 100 €/équipement selon revenus) et aux primes CEE BAR-EN-104 (fenêtres) ou BAR-EN-108 (porte d'entrée donnant sur l'extérieur).",
      "Sans qualification RGE menuiserie active à la date de signature du devis, aucune aide publique n'est mobilisable. Les contrôles a posteriori des délégataires CEE et de l'Anah aboutissent à un retrait de la prime lorsque la qualification fait défaut.",
      "Les menuisiers listés sont titulaires d'une qualification active dans le référentiel France Rénov' / ADEME, mise à jour chaque semaine.",
    ],
    travaux: [
      {
        label: 'Remplacement fenêtre PVC double vitrage',
        detail: 'Solution standard logement, Uw ≤ 1,3 — la plus diffusée pour MaPrimeRénov’.',
      },
      {
        label: 'Fenêtre aluminium à rupture thermique',
        detail: 'Profil fin, esthétique contemporaine, Uw 1,2-1,4 — copro et grandes ouvertures.',
      },
      {
        label: 'Fenêtre bois ou bois/alu',
        detail: 'Cadre bois isolant naturel, idéal en rénovation patrimoniale ou ABF.',
      },
      {
        label: 'Triple vitrage haute performance',
        detail: 'Uw ≤ 0,9 — pertinent uniquement en façade nord ou maison passive.',
      },
    ],
    aides: [
      {
        label: "MaPrimeRénov' fenêtres",
        montant: '40 à 100 €/équipement',
        detail: 'Forfait par fenêtre selon revenus (bleu/jaune/violet) — non éligible rose.',
      },
      {
        label: 'Prime CEE BAR-EN-104',
        montant: '40 à 100 €/m²',
        detail: 'Versée par les délégataires obligés (Effy, Sonergia, TotalEnergies).',
      },
      {
        label: 'Prime CEE BAR-EN-108 (porte)',
        montant: 'forfait',
        detail: "Pour la porte d'entrée donnant sur l'extérieur, classe 4 minimum.",
      },
      {
        label: 'TVA à 5,5 %',
        montant: '—',
        detail: 'Taux réduit sur fourniture + pose en logement de plus de 2 ans.',
      },
    ],
    faq: [
      {
        question: 'Quelle valeur Uw viser pour bénéficier des aides ?',
        answer:
          "MaPrimeRénov' et les primes CEE imposent un coefficient de transmission thermique Uw ≤ 1,3 W/m².K (vitrage Ug ≤ 1,1). C'est le standard du double vitrage à isolation renforcée (4/16/4 argon, intercalaire warm edge) commercialisé en grande distribution depuis 10 ans. Le triple vitrage descend à Uw ≤ 0,9 mais coûte 30 à 50 % plus cher pour un gain énergétique marginal en façade sud ou est.",
      },
      {
        question: 'PVC, alu ou bois : lequel choisir ?',
        answer:
          "Le PVC est le plus répandu (60 % du marché) : performant thermiquement, peu cher (300 à 600 €/fenêtre posée), entretien minimal. L'aluminium à rupture thermique est plus cher (500 à 1 000 €) mais offre des profils fins et un design contemporain. Le bois ou bois/alu (700 à 1 500 €) reste la solution patrimoniale et environnementale, exigée par les Architectes des Bâtiments de France en secteur protégé.",
      },
      {
        question: 'Combien coûte le remplacement de fenêtres ?',
        answer:
          "Le prix d'une fenêtre PVC double vitrage 120 × 100 cm posée par un menuisier RGE va de 350 à 700 € TTC. Pour 6 fenêtres, comptez 2 500 à 4 200 €. Après MaPrimeRénov' (240 à 600 €) et prime CEE (200 à 500 €), le reste à charge pour un ménage modeste tombe sous 2 500 €.",
      },
      {
        question: 'Faut-il une autorisation pour changer ses fenêtres ?',
        answer:
          "En copropriété : OUI, accord de l'AG si l'aspect extérieur change (couleur, matériau, dimensions). En maison individuelle : déclaration préalable de travaux en mairie si vous modifiez l'aspect extérieur (matériau, couleur, taille). En zone protégée (ABF, secteur sauvegardé), l'avis de l'Architecte des Bâtiments de France est obligatoire et impose souvent du bois.",
      },
    ],
    metaTitle: 'Menuisier RGE fenêtres — Qualibat BAR-EN-104',
    metaDescription:
      "Menuisiers Qualibat RGE pour remplacement de fenêtres et baies isolantes. MaPrimeRénov' + prime CEE BAR-EN-104.",
  },
}

export function getRgeServiceHubContent(slug: RgeAllowedService): RgeServiceHubContent {
  return C[slug]
}
