/**
 * CEE operation guides — editorial content layer
 * -----------------------------------------------
 * Guides éditoriaux long-format pour les 5 opérations CEE résidentielles
 * les plus recherchées (intent transactionnel élevé) :
 *
 *  - BAR-TH-104 : Pompe à chaleur air/eau ou eau/eau
 *  - BAR-EN-101 : Isolation des combles ou toitures (ITC)
 *  - BAR-EN-103 : Isolation d'un plancher (ITP)
 *  - BAR-TH-112 : Appareil indépendant de chauffage au bois (poêle)
 *  - BAR-TH-113 : Chaudière biomasse individuelle
 *
 * Ces guides alimentent la route `/cee/[operation]/guide` et sont
 * totalement indépendants de la DB (contenu statique versionné).
 *
 * Chaque guide respecte la rigueur réglementaire demandée :
 *  - Références BOAMP/DGEC : arrêté du 22/12/2014 modifié
 *  - Barèmes CEE classique + bonifié précarité (Forfait kWh cumac)
 *  - MaPrimeRénov' 2026 (montants au 1er janvier 2026)
 *  - TVA 5,5 % (art. 278-0 bis A CGI)
 *  - Qualifications RGE : Qualit'EnR, Qualibat, Qualifelec
 *
 * Source unique pour les composants — ne jamais dupliquer ces chiffres
 * ailleurs dans le repo. Mise à jour trimestrielle recommandée.
 */

export interface CeeGuideFaqItem {
  question: string
  answer: string
}

export interface CeeGuideSection {
  heading: string
  paragraphs: string[]
}

export interface CeeGuideContent {
  /** Code opération CEE (ex: BAR-TH-104) */
  code: string
  /** H1 de la page guide */
  h1: string
  /** Lede éditorial (1-2 phrases, ~160 chars) */
  lede: string
  /** metaTitle (<= 60 chars) */
  metaTitle: string
  /** metaDescription (<= 158 chars) */
  metaDescription: string
  /** Sections éditoriales longues (3-6) */
  sections: CeeGuideSection[]
  /** Montant indicatif de la prime CEE classique (ménage standard) */
  primeClassique: string
  /** Montant indicatif de la prime CEE bonifiée précarité */
  primePrecarite: string
  /** Cumul MaPrimeRénov' (plafond) */
  maPrimeRenov: string
  /** Qualifications RGE requises côté artisan */
  rgeRequises: string[]
  /** FAQ éditoriale (5-6 entrées) */
  faq: CeeGuideFaqItem[]
}

export const CEE_OPERATION_GUIDES: Record<string, CeeGuideContent> = {
  'BAR-TH-104': {
    code: 'BAR-TH-104',
    h1: "Prime CEE BAR-TH-104 : installer une pompe à chaleur air\u2011eau en 2026",
    lede:
      "Guide complet de la fiche d'opération standardisée BAR-TH-104 : conditions techniques, montant de la prime CEE, cumul MaPrimeRénov' et choix d'un artisan RGE QualiPAC.",
    metaTitle: "Guide BAR-TH-104 : prime CEE pompe à chaleur air/eau 2026",
    metaDescription:
      "BAR-TH-104 : prime CEE pompe à chaleur air/eau. Conditions techniques (COP, ETAS), montants 2026, cumul MaPrimeRénov' et QualiPAC obligatoire.",
    primeClassique: "jusqu'à 4\u202f000\u202f€",
    primePrecarite: "jusqu'à 5\u202f500\u202f€ (Coup de pouce Chauffage)",
    maPrimeRenov: "jusqu'à 5\u202f000\u202f€ (ménage très modeste)",
    rgeRequises: ['QualiPAC', "Qualit'EnR"],
    sections: [
      {
        heading: "Ce que couvre exactement la fiche BAR-TH-104",
        paragraphs: [
          "La fiche d'opération standardisée BAR-TH-104, publiée par la DGEC dans l'arrêté du 22 décembre 2014 modifié, encadre le remplacement d'un système de chauffage existant par une pompe à chaleur (PAC) de type air\u2011eau ou eau\u2011eau dans une maison individuelle ou un logement collectif. Elle ne concerne ni les PAC air\u2011air (fiche BAR-TH-129), ni les PAC hybrides (fiche BAR-TH-159).",
          "Pour être éligible, la PAC doit respecter un coefficient de performance (ETAS) minimal fixé par le règlement européen Ecodesign : ≥ 126\u202f% pour une PAC basse température et ≥ 111\u202f% pour une PAC moyenne/haute température. Le modèle doit être équipé d'un régulateur de classe IV minimum et installé en remplacement d'une chaudière gaz, fioul, charbon ou d'un chauffage électrique.",
        ],
      },
      {
        heading: "Le montant de la prime CEE BAR-TH-104 en 2026",
        paragraphs: [
          "Le forfait en kWh cumac est défini par la fiche DGEC et varie selon la zone climatique (H1, H2, H3) et la surface chauffée. Traduit en euros, la prime CEE classique représente en moyenne entre 2\u202f500\u202f€ et 4\u202f000\u202f€ pour une maison de 100\u202fm² chauffée au gaz ou au fioul, selon le cours hebdomadaire du kWh cumac et l'obligor retenu.",
          "Les ménages aux revenus modestes ou très modestes bénéficient du Coup de pouce Chauffage (charte signée par l'ensemble des obligors majeurs), qui porte la prime à un minimum de 4\u202f000\u202f€ et peut atteindre 5\u202f500\u202f€ en zone H1. Ce montant est cumulable avec MaPrimeRénov' (jusqu'à 5\u202f000\u202f€ pour les ménages très modestes au 1er janvier 2026) et avec l'éco\u2011PTZ.",
        ],
      },
      {
        heading: "Quelles qualifications RGE exigées côté artisan",
        paragraphs: [
          "La fiche BAR-TH-104 impose à l'artisan installateur d'être titulaire d'une qualification RGE active au moment de l'acceptation du devis par le ménage. La qualification de référence est QualiPAC (délivrée par Qualit'EnR), qui atteste du respect de la norme NF EN 14511 et de la maîtrise du dimensionnement de la PAC.",
          "À défaut, une qualification Qualibat 5911 (installations thermiques de génie climatique – classe 3) ou Qualifelec RGE (pour les PAC sur boucle électrique) peut être acceptée, à condition qu'elle soit valide à la date de signature du devis. La vérification se fait sur france-renov.gouv.fr ou dans notre annuaire RGE synchronisé ADEME.",
        ],
      },
      {
        heading: "Comment cumuler avec MaPrimeRénov' et la TVA 5,5\u202f%",
        paragraphs: [
          "La prime CEE BAR-TH-104 est cumulable sans plafond avec MaPrimeRénov' résidentielle (ex-Habiter Mieux Agilité) depuis 2021. Pour un ménage aux revenus très modestes remplaçant une chaudière fioul, le reste à charge peut descendre en dessous de 1\u202f500\u202f€ pour une PAC air/eau de qualité.",
          "La TVA à taux réduit de 5,5\u202f% s'applique automatiquement aux fournitures ET à la pose dès lors que la PAC remplit les critères de l'article 278-0 bis A du CGI (performance énergétique minimale). Le ménage n'a aucune démarche à faire : c'est l'artisan qui applique directement le taux sur sa facture.",
        ],
      },
    ],
    faq: [
      {
        question: "La prime CEE BAR-TH-104 est-elle cumulable avec MaPrimeRénov' en 2026\u202f?",
        answer:
          "Oui. Depuis la réforme MaPrimeRénov' de 2021, la prime CEE et MaPrimeRénov' sont entièrement cumulables sans plafond. Seule l'éco\u2011PTZ est limitée à 30\u202f000\u202f€ par logement.",
      },
      {
        question: "Quelle différence entre BAR-TH-104 et BAR-TH-159\u202f?",
        answer:
          "BAR-TH-104 concerne une pompe à chaleur air\u2011eau ou eau\u2011eau classique. BAR-TH-159 concerne une PAC hybride gaz\u2011électricité (PAC couplée à une chaudière gaz à condensation). Les deux ne se cumulent jamais sur un même chantier.",
      },
      {
        question: "Un artisan sans QualiPAC peut-il déclencher la prime\u202f?",
        answer:
          "Non, sauf à être titulaire d'une qualification Qualibat 5911 ou Qualifelec RGE équivalente et en cours de validité à la date du devis. L'obligor refusera le dossier si la qualification n'est pas active.",
      },
      {
        question: "Quand faut-il signer le devis pour être éligible\u202f?",
        answer:
          "Le devis doit être accepté par le ménage APRÈS avoir reçu une offre de prime CEE (nominative) de la part d'un obligor. Signer le devis avant fait perdre définitivement le droit à la prime — c'est l'erreur la plus fréquente.",
      },
      {
        question: "Combien de temps pour toucher la prime après les travaux\u202f?",
        answer:
          "En moyenne 4 à 8 semaines après transmission du dossier complet à l'obligor (facture, attestation sur l'honneur, preuve de qualification RGE, photos du chantier). Certains obligors versent en 2 semaines.",
      },
    ],
  },

  'BAR-EN-101': {
    code: 'BAR-EN-101',
    h1: "Prime CEE BAR-EN-101 : isoler ses combles en 2026",
    lede:
      "Isolation des combles perdus ou aménagés : conditions techniques (R\u202f≥\u202f7), montant de la prime CEE, cumul MaPrimeRénov' et qualifications RGE Qualibat exigées.",
    metaTitle: "Guide BAR-EN-101 : prime CEE isolation combles 2026",
    metaDescription:
      "BAR-EN-101 : prime CEE isolation des combles et toitures. Résistance thermique R\u202f≥\u202f7, montants 2026, cumul MaPrimeRénov' et artisans RGE Qualibat.",
    primeClassique: "jusqu'à 12\u202f€/m² (combles perdus)",
    primePrecarite: "jusqu'à 20\u202f€/m² (Coup de pouce Isolation)",
    maPrimeRenov: "jusqu'à 25\u202f€/m² (ménage très modeste)",
    rgeRequises: ['Qualibat 7131', 'Qualibat 7141'],
    sections: [
      {
        heading: "Le périmètre exact de BAR-EN-101",
        paragraphs: [
          "La fiche BAR-EN-101 couvre l'isolation thermique par l'intérieur (ITI) des combles perdus, des rampants de toiture et des plafonds de combles aménagés dans un logement résidentiel existant (construit depuis plus de 2 ans). Elle exclut les constructions neuves et les extensions.",
          "La condition technique clé est une résistance thermique finale R ≥ 7,0\u202fm²·K/W pour les combles perdus et R ≥ 6,0\u202fm²·K/W pour les rampants. Ces seuils sont plus exigeants que les valeurs de la RT2012 et impliquent des épaisseurs importantes (30 à 40\u202fcm de laine minérale selon le lambda du matériau).",
        ],
      },
      {
        heading: "Le montant de la prime CEE BAR-EN-101",
        paragraphs: [
          "Le barème officiel s'exprime en kWh cumac par m² isolé, multiplié par le cours hebdomadaire pratiqué par l'obligor. En moyenne, un ménage classique perçoit 8 à 12\u202f€/m² en 2026, tandis qu'un ménage précaire éligible au Coup de pouce Isolation touche entre 15 et 20\u202f€/m².",
          "Sur une maison de 100\u202fm² au sol avec combles perdus isolés, cela représente 800 à 1\u202f200\u202f€ pour un ménage standard et jusqu'à 2\u202f000\u202f€ pour un ménage très modeste. Le cumul avec MaPrimeRénov' (jusqu'à 25\u202f€/m² plafonné à 30\u202f% du coût HT) est systématique.",
        ],
      },
      {
        heading: "Les qualifications RGE exigées",
        paragraphs: [
          "La fiche BAR-EN-101 exige impérativement que l'artisan soit titulaire d'une qualification RGE Qualibat 7131 (isolation thermique par l'intérieur – isolation de combles perdus) ou 7141 (ITI de toiture). La qualification doit être active à la date d'acceptation du devis, pas au moment de la pose.",
          "Qualifelec ou Qualit'EnR ne sont pas acceptées pour cette fiche : l'isolation est un métier enveloppe du bâti, pas un métier énergétique. Vérifiez toujours la date de validité du certificat RGE sur france-renov.gouv.fr avant de signer.",
        ],
      },
      {
        heading: "Erreurs classiques qui font refuser le dossier",
        paragraphs: [
          "Les trois erreurs les plus fréquentes qui font perdre la prime : (1) signer le devis avant d'avoir reçu l'offre de prime CEE nominative ; (2) accepter un R inférieur à 7 sans s'en apercevoir (certains artisans proposent du R\u202f=\u202f6,5 pour économiser sur l'épaisseur) ; (3) choisir un artisan dont la qualification RGE expire avant la fin des travaux.",
          "Demandez systématiquement la copie du certificat RGE (datée et nominative) avec le devis, et refusez tout chantier où l'épaisseur posée ne permet pas d'atteindre R\u202f=\u202f7. Un simple contrôle visuel à la livraison suffit : si la laine dépasse les solives, c'est bon signe.",
        ],
      },
    ],
    faq: [
      {
        question: "Quel R minimum pour BAR-EN-101 en 2026\u202f?",
        answer: "R ≥ 7,0\u202fm²·K/W pour les combles perdus et R ≥ 6,0\u202fm²·K/W pour les rampants de toiture. Tout chantier en-dessous est automatiquement rejeté.",
      },
      {
        question: "L'isolation à 1\u202f€ existe-t-elle encore\u202f?",
        answer:
          "Non. Le Coup de pouce Isolation à 1\u202f€ a été supprimé au 30 juin 2021. Aujourd'hui le reste à charge minimum est d'environ 3 à 5\u202f€/m² même pour un ménage précaire.",
      },
      {
        question: "Peut-on cumuler MaPrimeRénov' et CEE sur le même m²\u202f?",
        answer:
          "Oui, le cumul est de plein droit. Le plafond combiné est toutefois limité à 90\u202f% du coût HT pour un ménage très modeste et 75\u202f% pour un ménage modeste.",
      },
      {
        question: "La laine soufflée est-elle éligible\u202f?",
        answer:
          "Oui, à condition que la certification ACERMI du produit atteste le R minimum réellement atteint (et non pas le R nominal en laboratoire). Exigez la fiche produit ACERMI avec le devis.",
      },
      {
        question: "Faut-il une visite technique préalable\u202f?",
        answer:
          "Oui depuis 2021. L'artisan RGE est tenu de réaliser une visite préalable avant édition du devis, obligation vérifiée par les organismes de contrôle mandatés par les obligors.",
      },
    ],
  },

  'BAR-EN-103': {
    code: 'BAR-EN-103',
    h1: "Prime CEE BAR-EN-103 : isoler un plancher bas en 2026",
    lede:
      "Isolation d'un plancher bas sur vide sanitaire, cave ou passage ouvert : résistance thermique R\u202f≥\u202f3, barème CEE 2026, cumul MaPrimeRénov' et qualifications RGE.",
    metaTitle: "Guide BAR-EN-103 : prime CEE isolation plancher 2026",
    metaDescription:
      "BAR-EN-103 : prime CEE isolation d'un plancher bas (vide sanitaire, cave). R\u202f≥\u202f3, montants 2026, cumul MaPrimeRénov' et artisans RGE Qualibat.",
    primeClassique: "jusqu'à 8\u202f€/m²",
    primePrecarite: "jusqu'à 15\u202f€/m²",
    maPrimeRenov: "jusqu'à 25\u202f€/m² (ménage très modeste)",
    rgeRequises: ['Qualibat 7132'],
    sections: [
      {
        heading: "Ce qu'encadre la fiche BAR-EN-103",
        paragraphs: [
          "La fiche BAR-EN-103 couvre l'isolation d'un plancher bas donnant sur un vide sanitaire, un sous-sol non chauffé, une cave, un garage ou un passage ouvert, dans une maison individuelle ou un logement collectif de plus de 2 ans. La pose peut être réalisée par fixation mécanique, collage ou projection de mousse polyuréthane.",
          "La performance minimale exigée est R ≥ 3,0\u202fm²·K/W. Cette valeur correspond typiquement à 10 à 12\u202fcm d'isolant selon le lambda retenu (polystyrène, polyuréthane, laine minérale projetée). L'épaisseur réelle doit être vérifiée sur la fiche produit ACERMI.",
        ],
      },
      {
        heading: "Montant de la prime CEE et cumul d'aides",
        paragraphs: [
          "La prime CEE BAR-EN-103 représente en moyenne 6 à 8\u202f€/m² pour un ménage standard et jusqu'à 15\u202f€/m² pour un ménage très modeste éligible au Coup de pouce Isolation. Sur 80\u202fm² de plancher bas, cela représente 500 à 1\u202f200\u202f€ pour un ménage classique.",
          "Le cumul avec MaPrimeRénov' est automatique : jusqu'à 25\u202f€/m² pour un ménage très modeste (plafond 30\u202f% du coût HT). TVA 5,5\u202f% appliquée directement par l'artisan sur la facture. Éco\u2011PTZ mobilisable en complément si le bouquet de travaux comprend au moins 2 postes éligibles.",
        ],
      },
      {
        heading: "Qualifications RGE et points de vigilance",
        paragraphs: [
          "Seule la qualification Qualibat 7132 (isolation thermique par l'intérieur – planchers) est reconnue pour cette fiche. La qualification doit être active à la date d'acceptation du devis par le ménage. Une qualification expirée pendant le chantier n'invalide pas le dossier, mais une qualification non-renouvelée à la signature entraîne un refus systématique.",
          "Le principal piège : certains artisans proposent du R\u202f=\u202f2,5 pour économiser sur l'épaisseur. Refusez — le dossier sera rejeté en contrôle terrain. Exigez la fiche ACERMI du produit et vérifiez que R\u202f≥\u202f3,0 est bien mentionné en clair.",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle épaisseur pour atteindre R\u202f=\u202f3\u202f?",
        answer:
          "Avec du polyuréthane projeté (lambda 0,023) : 7\u202fcm suffisent. Avec du polystyrène expansé (lambda 0,032) : 10\u202fcm. Avec de la laine minérale (lambda 0,035) : 11 à 12\u202fcm.",
      },
      {
        question: "La mousse polyuréthane projetée est-elle éligible\u202f?",
        answer:
          "Oui, sous réserve que le produit dispose d'une certification ACERMI ou d'un ATE/DTA valide et que le R final posé atteigne bien 3,0 m²·K/W.",
      },
      {
        question: "Peut-on isoler un plancher bas sur terre-plein\u202f?",
        answer:
          "Non, la fiche BAR-EN-103 exclut les planchers sur terre-plein (ceux-ci relèvent d'une isolation par dessus qui n'entre pas dans le périmètre CEE résidentiel standardisé).",
      },
      {
        question: "Faut-il un Qualibat 7132 spécifique\u202f?",
        answer:
          "Oui, c'est la seule qualification reconnue pour cette fiche. Qualibat 7131 (combles) et 7141 (toiture) ne permettent pas de déclencher la prime BAR-EN-103.",
      },
    ],
  },

  'BAR-TH-112': {
    code: 'BAR-TH-112',
    h1: "Prime CEE BAR-TH-112 : installer un poêle à bois ou à granulés en 2026",
    lede:
      "Appareil indépendant de chauffage au bois (poêle bûches ou granulés) : critères Flamme Verte 7*, prime CEE 2026, cumul MaPrimeRénov' et RGE Qualibois.",
    metaTitle: "Guide BAR-TH-112 : prime CEE poêle bois/granulés 2026",
    metaDescription:
      "BAR-TH-112 : prime CEE poêle à bois ou granulés. Flamme Verte 7*, montants 2026, cumul MaPrimeRénov' et qualification RGE Qualibois obligatoire.",
    primeClassique: "jusqu'à 800\u202f€",
    primePrecarite: "jusqu'à 2\u202f500\u202f€ (Coup de pouce)",
    maPrimeRenov: "jusqu'à 2\u202f500\u202f€ (ménage très modeste)",
    rgeRequises: ['Qualibois Air', "Qualit'EnR"],
    sections: [
      {
        heading: "Le champ d'application exact de BAR-TH-112",
        paragraphs: [
          "La fiche BAR-TH-112 concerne l'installation d'un appareil indépendant de chauffage au bois (bûches ou granulés) dans un logement résidentiel de plus de 2 ans. Elle couvre les poêles, les inserts et les foyers fermés. Elle ne couvre pas les chaudières biomasse (relevant de BAR-TH-113) ni les cuisinières à bois.",
          "L'appareil doit impérativement respecter les exigences du label Flamme Verte 7 étoiles (rendement ≥ 75\u202f%, émissions de CO ≤ 0,12\u202f% et de particules ≤ 40\u202fmg/Nm³). La certification doit figurer sur la fiche produit ET sur la facture, sans exception.",
        ],
      },
      {
        heading: "Montants et coup de pouce chauffage bois",
        paragraphs: [
          "La prime CEE classique pour un poêle à granulés Flamme Verte 7* oscille entre 500 et 800\u202f€ en 2026. Les ménages précaires bénéficient du Coup de pouce Chauffage, qui garantit une prime minimale de 800\u202f€ et peut atteindre 2\u202f500\u202f€ pour un ménage très modeste remplaçant une chaudière fioul ou gaz.",
          "Cumulée avec MaPrimeRénov' (jusqu'à 2\u202f500\u202f€ pour un poêle granulés en ménage très modeste au 1er janvier 2026) et la TVA 5,5\u202f%, une installation complète à 6\u202f000\u202f€ TTC peut voir son reste à charge descendre sous les 1\u202f500\u202f€.",
        ],
      },
      {
        heading: "Qualification Qualibois : air vs eau",
        paragraphs: [
          "Pour BAR-TH-112 (poêle indépendant), la qualification RGE exigée est Qualibois Air, délivrée par Qualit'EnR. Qualibois Eau ne couvre que les appareils hydraulisés (chaudières, poêles à bouilleur). Vérifiez toujours la mention \u00ab\u202fQualibois Air\u202f\u00bb sur l'attestation RGE de l'artisan.",
          "Un installateur titulaire de Qualibois Eau ne peut PAS déclencher la prime BAR-TH-112 sur un poêle simple — le dossier sera refusé par l'obligor. C'est une source fréquente de contentieux entre ménages et artisans, souvent détectée trop tard.",
        ],
      },
    ],
    faq: [
      {
        question: "Flamme Verte 7\u202f étoiles est-il obligatoire\u202f?",
        answer:
          "Oui. C'est le seuil minimal DGEC pour BAR-TH-112. Un poêle 5* ou 6* Flamme Verte n'ouvre pas droit à la prime CEE, même s'il est vendu comme \u00ab\u202féco-performant\u202f\u00bb.",
      },
      {
        question: "Quelle différence entre poêle à bûches et à granulés\u202f?",
        answer:
          "Les deux sont éligibles à BAR-TH-112, mais la prime est en général plus élevée pour les poêles à granulés (meilleur rendement et régulation automatique). Les montants exacts varient selon l'obligor.",
      },
      {
        question: "Peut-on installer un poêle en complément d'un chauffage existant\u202f?",
        answer:
          "Oui, BAR-TH-112 n'exige pas le remplacement d'un système existant. Contrairement à BAR-TH-104 (PAC), un poêle peut être installé en chauffage d'appoint ou principal sans contrainte.",
      },
      {
        question: "Le conduit de fumée est-il inclus dans la prime\u202f?",
        answer:
          "Oui, les travaux connexes indispensables (tubage, création de conduit, arrivée d'air comburant) sont inclus dans l'assiette éligible à la TVA 5,5\u202f% et au calcul MaPrimeRénov'.",
      },
    ],
  },

  'BAR-TH-113': {
    code: 'BAR-TH-113',
    h1: "Prime CEE BAR-TH-113 : chaudière biomasse individuelle en 2026",
    lede:
      "Chaudière biomasse (granulés, plaquettes, bûches) : rendement\u202f≥\u202f87\u202f%, prime CEE BAR-TH-113 bonifiée, cumul MaPrimeRénov' et Qualibois Eau obligatoire.",
    metaTitle: "Guide BAR-TH-113 : prime CEE chaudière biomasse 2026",
    metaDescription:
      "BAR-TH-113 : prime CEE chaudière biomasse individuelle (granulés, plaquettes). Rendement ≥\u202f87\u202f%, Coup de pouce, cumul MaPrimeRénov' et Qualibois Eau.",
    primeClassique: "jusqu'à 4\u202f000\u202f€",
    primePrecarite: "jusqu'à 5\u202f000\u202f€ (Coup de pouce Chauffage)",
    maPrimeRenov: "jusqu'à 10\u202f000\u202f€ (ménage très modeste, granulés)",
    rgeRequises: ['Qualibois Eau', "Qualit'EnR"],
    sections: [
      {
        heading: "Périmètre de BAR-TH-113",
        paragraphs: [
          "La fiche BAR-TH-113 couvre l'installation d'une chaudière biomasse individuelle dans un logement résidentiel de plus de 2 ans : granulés, plaquettes forestières ou bois bûches. Elle vise typiquement le remplacement d'une chaudière fioul, gaz ou charbon, et s'inscrit dans le Coup de pouce Chauffage avec un montant bonifié signé par tous les grands obligors.",
          "La performance minimale exigée est un rendement saisonnier ≥ 87\u202f% (calculé selon la norme EN 303-5). Le bois bûches impose en plus un ballon tampon d'au moins 55\u202fL par kW de puissance nominale — une exigence souvent oubliée par les installateurs et qui fait capoter le dossier au contrôle.",
        ],
      },
      {
        heading: "Un des meilleurs rapports prime/investissement",
        paragraphs: [
          "BAR-TH-113 est l'une des opérations CEE les plus rentables grâce au Coup de pouce Chauffage : la prime peut atteindre 4\u202f000 à 5\u202f000\u202f€ pour un ménage classique et jusqu'à 5\u202f000\u202f€ garantis pour un ménage très modeste remplaçant une chaudière fioul.",
          "Cumulée avec MaPrimeRénov' (jusqu'à 10\u202f000\u202f€ pour une chaudière granulés en ménage très modeste au 1er janvier 2026), le reste à charge sur une installation à 20\u202f000\u202f€ TTC peut descendre sous les 5\u202f000\u202f€. La TVA 5,5\u202f% est appliquée automatiquement par l'artisan.",
        ],
      },
      {
        heading: "Qualibois Eau obligatoire (pas Qualibois Air)",
        paragraphs: [
          "Attention, la qualification RGE exigée pour BAR-TH-113 est Qualibois Eau (délivrée par Qualit'EnR). Qualibois Air (poêles) n'est PAS acceptée pour les chaudières. Un installateur qui n'est qualifié qu'en Qualibois Air ne peut pas déclencher la prime BAR-TH-113 — le dossier sera refusé.",
          "Vérifiez toujours la mention explicite \u00ab\u202fQualibois Eau\u202f\u00bb sur l'attestation RGE, et assurez-vous qu'elle est en cours de validité à la date d'acceptation du devis. La vérification se fait en 2 minutes sur france-renov.gouv.fr ou dans notre annuaire RGE.",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle différence BAR-TH-112 / BAR-TH-113\u202f?",
        answer:
          "BAR-TH-112 = poêle ou insert indépendant (chauffage d'une pièce). BAR-TH-113 = chaudière biomasse raccordée à un réseau hydraulique (chauffage central de tout le logement). Les montants, qualifications RGE et exigences techniques diffèrent complètement.",
      },
      {
        question: "Le ballon tampon est-il obligatoire pour bois bûches\u202f?",
        answer:
          "Oui, 55\u202fL/kW minimum pour une chaudière bûches éligible BAR-TH-113. C'est l'erreur la plus fréquente qui invalide le dossier au contrôle terrain. Pour une chaudière granulés, le ballon tampon n'est pas obligatoire.",
      },
      {
        question: "Une chaudière plaquettes est-elle éligible\u202f?",
        answer:
          "Oui, au même titre que les chaudières granulés et bûches, à condition que le rendement saisonnier atteigne 87\u202f% minimum et que l'installateur soit titulaire de Qualibois Eau.",
      },
      {
        question: "Peut-on cumuler avec l'éco-PTZ\u202f?",
        answer:
          "Oui. L'éco-PTZ individuel jusqu'à 30\u202f000\u202f€ peut financer le reste à charge après déduction de la prime CEE et de MaPrimeRénov'. Durée de remboursement jusqu'à 20 ans sans intérêt.",
      },
      {
        question: "Combien de temps entre signature du devis et réception de la prime\u202f?",
        answer:
          "En moyenne 8 à 12 semaines après la fin des travaux (le temps de transmission du dossier à l'obligor, contrôle terrain éventuel et virement). Certains obligors versent en moins de 4 semaines sur dossier complet.",
      },
    ],
  },
}

/** Liste des codes d'opération ayant un guide éditorial long-format */
export const CEE_OPERATIONS_WITH_GUIDE: string[] = Object.keys(CEE_OPERATION_GUIDES)

/** Lookup safe — retourne null si pas de guide pour ce code */
export function getCeeOperationGuide(code: string): CeeGuideContent | null {
  return CEE_OPERATION_GUIDES[code] ?? null
}

/** True si le code possède un guide éditorial dédié */
export function hasCeeOperationGuide(code: string): boolean {
  return code in CEE_OPERATION_GUIDES
}
