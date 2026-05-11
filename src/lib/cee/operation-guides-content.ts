/**
 * CEE operation guides — editorial content layer
 * -----------------------------------------------
 * Guides éditoriaux long-format pour les opérations CEE résidentielles
 * à intent transactionnel élevé.
 *
 * Note abrogation : BAR-TH-104 (PAC air/eau standard) a été abrogée par la
 * DGEC au 01/01/2024 et remplacée par BAR-TH-171 (PAC air/eau haute perf,
 * SCOP ≥ 4). Le guide BAR-TH-104 a été dépublié ; toute URL legacy est
 * redirigée en 301 permanent vers `/cee/bar-th-171/guide` via next.config.js.
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

import type { RgeGuideSlug } from '@/lib/rge/qualification-matcher'

/**
 * Date de dernière mise à jour éditoriale du catalogue CEE (barèmes kWh cumac,
 * bonifications précarité, MaPrimeRénov' 2026, tarifs).
 *
 * ⚠️  NE BUMP QUE si le CONTENU de ce fichier change réellement (barème, taux,
 * montant, abrogation, nouvelle opération). Un bump cosmétique sans diff de
 * contenu = fausse fraîcheur = drapeau rouge Google helpful content.
 * Source : developers.google.com/search/docs/fundamentals/creating-helpful-content
 *
 * Évolution future : bascule sur `cee_operations.updated_at` dès que le
 * catalogue sera persisté en DB (sync DGEC automatisée). 3 call-sites
 * concernés : `cee/page.tsx`, `cee/[operation]/page.tsx`, et la constante
 * `CEE_CATALOG_UPDATED_AT` ci-dessous.
 *
 * Format : ISO date (YYYY-MM-DD) — parseable par `new Date(...)`.
 */
export const CEE_CATALOG_UPDATED_AT = '2026-04-10'

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
  /**
   * Slugs des guides qualif RGE correspondant à cette opération
   * (maillage interne /cee/[code]/guide → /rge/qualifications/[slug]).
   * Ne contient que des slugs ayant un guide éditorial dédié.
   */
  requiredQualifications: RgeGuideSlug[]
  /** FAQ éditoriale (5-6 entrées) */
  faq: CeeGuideFaqItem[]
}

export const CEE_OPERATION_GUIDES: Record<string, CeeGuideContent> = {
  // BAR-TH-104 (PAC air/eau standard) — ABROGÉE 01/01/2024, remplacée par BAR-TH-171.
  // Dépubliée 2026-04-09. URLs legacy redirigées en 301 permanent dans next.config.js.

  // BAR-TH-106 (chaudière individuelle gaz/fioul à condensation) — ABROGÉE 01/01/2024 par arrêté du 4 octobre 2023 (JORFTEXT000048158900), remplacée par BAR-TH-171 (PAC air/eau) et BAR-TH-172 (PAC eau/eau).
  // Dépubliée 2026-04-09. URLs legacy redirigées en 301 permanent dans next.config.js.

  'BAR-EN-101': {
    code: 'BAR-EN-101',
    h1: 'Prime CEE BAR-EN-101 : isoler ses combles en 2026',
    lede: 'Isolation des combles perdus ou rampants de toiture\u202f: conditions techniques (R\u202f≥\u202f7 pour combles perdus, R\u202f≥\u202f6 pour rampants), certification ACERMI des isolants et qualification RGE mention «\u202fIsolation thermique\u202f» exigée.',
    metaTitle: 'Guide BAR-EN-101 : prime CEE isolation combles 2026',
    metaDescription:
      'BAR-EN-101\u202f: prime CEE isolation des combles perdus (R\u202f≥\u202f7) et rampants de toiture (R\u202f≥\u202f6). Normes NF EN 12664/12667/12939, ACERMI et RGE «\u202fIsolation thermique\u202f».',
    primeClassique: 'forfait CEE selon barème DGEC et cours obligé',
    primePrecarite: 'bonification Coup de pouce Isolation (ménages modestes)',
    maPrimeRenov: 'cumul de plein droit (plafonds ménage applicables)',
    rgeRequises: ['RGE mention «\u202fIsolation thermique\u202f» (Qualibat ou équivalent)'],
    // Isolation combles — RGE mention «\u202fIsolation thermique\u202f», pas de guide éditorial dédié actuellement.
    requiredQualifications: [],
    sections: [
      {
        heading: 'Le périmètre exact de BAR-EN-101',
        paragraphs: [
          'La fiche BAR-EN-101 couvre l’isolation thermique des combles perdus, des rampants de toiture et des plafonds de combles aménagés dans un logement résidentiel existant (construit depuis plus de 2\u202fans). Elle exclut les constructions neuves et les extensions.',
          'La condition technique clé est une résistance thermique finale R\u202f≥\u202f7\u202fm².K/W pour les combles perdus et R\u202f≥\u202f6\u202fm².K/W pour les rampants de toiture. Ces seuils sont plus exigeants que les valeurs de la RT2012 et impliquent des épaisseurs importantes (typiquement 30 à 40\u202fcm de laine minérale selon le lambda du matériau).',
        ],
      },
      {
        heading: 'Le montant de la prime CEE BAR-EN-101',
        paragraphs: [
          'Le barème officiel s’exprime en kWh cumac par m² isolé, multiplié par le cours hebdomadaire pratiqué par l’obligé\u202f: le montant réellement perçu varie donc selon le volume de CEE en circulation et la politique commerciale du délégataire ou mandataire. Les ménages précaires bénéficient d’une bonification via le Coup de pouce Isolation.',
          'Le cumul avec MaPrimeRénov’ est de plein droit sur le même chantier, sous réserve des plafonds de ressources et du plafond global d’aides cumulées. La TVA à 5,5\u202f% s’applique automatiquement sur matériel et pose dès lors que les critères techniques BAR-EN-101 sont respectés.',
        ],
      },
      {
        heading: 'Qualification RGE et normes produits exigées',
        paragraphs: [
          'La fiche BAR-EN-101 exige que l’artisan soit titulaire d’une qualification RGE portant la mention «\u202fIsolation thermique\u202f» (typiquement Qualibat RGE sur l’activité isolation, ou un équivalent reconnu par l’État). La qualification doit être active à la date d’acceptation du devis, pas au moment de la pose. Vérifiez toujours le certificat RGE sur france-renov.gouv.fr avant de signer.',
          'Les isolants mis en œuvre doivent être certifiés ACERMI (preuve réputée conforme). Les performances thermiques sont mesurées selon les normes NF\u202fEN\u202f12664, NF\u202fEN\u202f12667 et NF\u202fEN\u202f12939 (conductivité thermique λ). Les isolants réfléchissants relèvent de la norme NF\u202fEN\u202fISO\u202f22097, suite à l’arrêté du 18\u202fnovembre\u202f2024 qui révise les fiches BAR-EN-101, BAR-EN-102 et BAR-EN-103.',
        ],
      },
      {
        heading: 'Erreurs classiques qui font refuser le dossier',
        paragraphs: [
          'Les trois erreurs les plus fréquentes qui font perdre la prime\u202f: (1)\u202fsigner le devis avant d’avoir reçu l’offre de prime CEE nominative\u202f; (2)\u202faccepter un R inférieur au seuil (R\u202f<\u202f7 en combles perdus ou R\u202f<\u202f6 en rampants de toiture), certains artisans réduisant volontairement l’épaisseur pour économiser la matière\u202f; (3)\u202fchoisir un artisan dont la qualification RGE expire avant la fin des travaux.',
          'Demandez systématiquement la copie du certificat RGE (datée et nominative) avec le devis, ainsi que la fiche ACERMI de l’isolant retenu. Refusez tout chantier où l’épaisseur posée ne permet pas d’atteindre le R minimal applicable (combles perdus ou rampants). Un simple contrôle visuel à la livraison aide\u202f: si la laine dépasse franchement les solives, l’épaisseur est en général au rendez-vous.',
        ],
      },
    ],
    faq: [
      {
        question: 'Quel R minimum pour BAR-EN-101 en 2026?',
        answer:
          'R ≥ 7,0\u202fm²·K/W pour les combles perdus et R ≥ 6,0\u202fm²·K/W pour les rampants de toiture. Tout chantier en-dessous est automatiquement rejeté.',
      },
      {
        question: 'L’isolation à 1\u202f€ existe-t-elle encore\u202f?',
        answer:
          'Non. Le Coup de pouce Isolation à 1\u202f€ a été supprimé au 30\u202fjuin\u202f2021. Aujourd’hui un reste à charge minimum subsiste systématiquement, même pour les ménages les plus précaires\u202f: son niveau dépend du cours CEE, du barème DGEC en vigueur et de la politique commerciale de l’obligé/mandataire retenu.',
      },
      {
        question: 'Peut-on cumuler MaPrimeRénov’ et CEE sur le même m²\u202f?',
        answer:
          'Oui, le cumul est de plein droit. Des plafonds combinés en pourcentage du coût HT s’appliquent toutefois selon la catégorie de revenus du ménage (très modeste, modeste, intermédiaire, supérieur)\u202f; votre mandataire CEE vérifie l’éligibilité et le plafonnement avant dépôt du dossier.',
      },
      {
        question: 'La laine soufflée est-elle éligible?',
        answer:
          'Oui, à condition que la certification ACERMI du produit atteste le R minimum réellement atteint (et non pas le R nominal en laboratoire). Exigez la fiche produit ACERMI avec le devis.',
      },
      {
        question: 'Faut-il une visite technique préalable?',
        answer:
          "Oui depuis 2021. L'artisan RGE est tenu de réaliser une visite préalable avant édition du devis, obligation vérifiée par les organismes de contrôle mandatés par les obligés.",
      },
    ],
  },

  'BAR-EN-103': {
    code: 'BAR-EN-103',
    h1: 'Prime CEE BAR-EN-103 : isoler un plancher bas en 2026',
    lede: 'Isolation d’un plancher bas sur vide sanitaire, cave ou passage ouvert\u202f: résistance thermique R\u202f≥\u202f3\u202fm².K/W, certification ACERMI des isolants, normes NF\u202fEN\u202f12664/12667/12939 et RGE «\u202fIsolation thermique\u202f».',
    metaTitle: 'Guide BAR-EN-103 : prime CEE isolation plancher 2026',
    metaDescription:
      'BAR-EN-103\u202f: prime CEE isolation d’un plancher bas (vide sanitaire, cave). R\u202f≥\u202f3\u202fm².K/W, normes NF\u202fEN\u202f12664/12667/12939, ACERMI et RGE «\u202fIsolation thermique\u202f».',
    primeClassique: 'forfait CEE selon barème DGEC et cours obligé',
    primePrecarite: 'bonification Coup de pouce Isolation (ménages modestes)',
    maPrimeRenov: 'cumul de plein droit (plafonds ménage applicables)',
    rgeRequises: ['RGE mention «\u202fIsolation thermique\u202f» (Qualibat ou équivalent)'],
    // Isolation plancher — RGE mention «\u202fIsolation thermique\u202f», pas de guide éditorial dédié actuellement.
    requiredQualifications: [],
    sections: [
      {
        heading: "Ce qu'encadre la fiche BAR-EN-103",
        paragraphs: [
          'La fiche BAR-EN-103 couvre l’isolation d’un plancher bas donnant sur un vide sanitaire, un sous-sol non chauffé, une cave, un garage ou un passage ouvert, dans une maison individuelle ou un logement collectif de plus de 2\u202fans. La pose peut être réalisée par fixation mécanique, collage ou projection de mousse polyuréthane.',
          'La performance minimale exigée est R\u202f≥\u202f3\u202fm².K/W. Cette valeur correspond typiquement à 10 à 12\u202fcm d’isolant selon le lambda retenu (polystyrène, polyuréthane, laine minérale projetée). La conductivité λ est mesurée selon les normes NF\u202fEN\u202f12664, NF\u202fEN\u202f12667 et NF\u202fEN\u202f12939\u202f; les isolants réfléchissants relèvent de NF\u202fEN\u202fISO\u202f22097 (arrêté du 18\u202fnovembre\u202f2024). L’isolant doit être certifié ACERMI.',
        ],
      },
      {
        heading: "Montant de la prime CEE et cumul d'aides",
        paragraphs: [
          'La prime CEE BAR-EN-103 s’exprime en kWh cumac par m² isolé, valorisés au cours obligé/mandataire du moment. Les ménages modestes et très modestes bénéficient d’une bonification Coup de pouce Isolation. Le montant final dépend donc du barème DGEC applicable et du cours CEE en vigueur lors du dépôt du dossier.',
          'Le cumul avec MaPrimeRénov’ est automatique dans la limite des plafonds de ressources et du plafond global d’aides (exprimé en pourcentage du coût HT selon la catégorie de revenus). TVA à 5,5\u202f% appliquée directement par l’artisan sur la facture. Éco\u2011PTZ mobilisable en complément si le bouquet de travaux comprend au moins deux postes éligibles.',
        ],
      },
      {
        heading: 'Qualifications RGE et points de vigilance',
        paragraphs: [
          "Seule la qualification Qualibat 7132 (isolation thermique par l'intérieur – planchers) est reconnue pour cette fiche. La qualification doit être active à la date d'acceptation du devis par le ménage. Une qualification expirée pendant le chantier n'invalide pas le dossier, mais une qualification non-renouvelée à la signature entraîne un refus systématique.",
          "Le principal piège : certains artisans proposent du R\u202f=\u202f2,5 pour économiser sur l'épaisseur. Refusez — le dossier sera rejeté en contrôle terrain. Exigez la fiche ACERMI du produit et vérifiez que R\u202f≥\u202f3,0 est bien mentionné en clair.",
        ],
      },
    ],
    faq: [
      {
        question: 'Quelle épaisseur pour atteindre R\u202f=\u202f3?',
        answer:
          'Avec du polyuréthane projeté (lambda 0,023) : 7\u202fcm suffisent. Avec du polystyrène expansé (lambda 0,032) : 10\u202fcm. Avec de la laine minérale (lambda 0,035) : 11 à 12\u202fcm.',
      },
      {
        question: 'La mousse polyuréthane projetée est-elle éligible?',
        answer:
          "Oui, sous réserve que le produit dispose d'une certification ACERMI ou d'un ATE/DTA valide et que le R final posé atteigne bien 3,0 m²·K/W.",
      },
      {
        question: 'Peut-on isoler un plancher bas sur terre-plein?',
        answer:
          "Non, la fiche BAR-EN-103 exclut les planchers sur terre-plein (ceux-ci relèvent d'une isolation par dessus qui n'entre pas dans le périmètre CEE résidentiel standardisé).",
      },
      {
        question: 'Faut-il un Qualibat 7132 spécifique?',
        answer:
          "Oui, c'est la seule qualification reconnue pour cette fiche. Qualibat 7131 (combles) et 7141 (toiture) ne permettent pas de déclencher la prime BAR-EN-103.",
      },
    ],
  },

  'BAR-TH-112': {
    code: 'BAR-TH-112',
    h1: 'Prime CEE BAR-TH-112 : installer un poêle à bois bûches ou granulés en 2026',
    lede: "Appareil indépendant de chauffage au bois — poêle à bûches (EN 13240), poêle à granulés (EN 14785) ou insert/foyer fermé à accumulation (EN 15250) : critères techniques distincts selon le combustible, prime CEE 2026 variable selon signataire, cumul MaPrimeRénov' et RGE QualiBois Air.",
    metaTitle: 'Guide BAR-TH-112 : prime CEE poêle bûches ou granulés 2026',
    metaDescription:
      "BAR-TH-112 : prime CEE poêle bois bûches (EN 13240) ou granulés (EN 14785). Critères rendement, CO et PM distincts, cumul MaPrimeRénov' et QualiBois Air.",
    primeClassique: 'variable selon signataire de la charte — demander simulation',
    primePrecarite: 'bonifiée via Coup de pouce Chauffage — variable selon signataire',
    maPrimeRenov: 'variable selon revenus et combustible — demander simulation',
    rgeRequises: ['QualiBois Air', "Qualit'EnR"],
    requiredQualifications: ['qualibois'],
    sections: [
      {
        heading: "Le champ d'application exact de BAR-TH-112",
        paragraphs: [
          "La fiche BAR-TH-112 concerne l'installation d'un appareil indépendant de chauffage au bois (bûches ou granulés) dans un logement résidentiel de plus de 2 ans. Elle couvre les poêles, les inserts et les foyers fermés à accumulation. Elle ne couvre pas les chaudières biomasse (relevant de BAR-TH-113) ni les cuisinières à bois.",
          "Trois normes produit encadrent les appareils éligibles : EN 13240 pour les poêles à bûches, EN 14785 pour les poêles à granulés et EN 15250 pour les inserts et foyers fermés à accumulation. Le respect de la norme produit correspondante est un préalable, mais ne suffit pas : la fiche DGEC impose en plus des seuils techniques précis, différents selon que l'appareil brûle des bûches ou des granulés.",
        ],
      },
      {
        heading: 'Montants et coup de pouce chauffage bois',
        paragraphs: [
          'La prime CEE classique pour un poêle à granulés Flamme Verte 7* oscille entre 500 et 800\u202f€ en 2026. Les ménages précaires bénéficient du Coup de pouce Chauffage, qui garantit une prime minimale de 800\u202f€ et peut atteindre 2\u202f500\u202f€ pour un ménage très modeste remplaçant une chaudière fioul ou gaz.',
          "Cumulée avec MaPrimeRénov' (jusqu'à 2\u202f500\u202f€ pour un poêle granulés en ménage très modeste au 1er janvier 2026) et la TVA 5,5\u202f%, une installation complète à 6\u202f000\u202f€ TTC peut voir son reste à charge descendre sous les 1\u202f500\u202f€.",
        ],
      },
      {
        heading: 'Qualification QualiBois : air vs eau',
        paragraphs: [
          "Pour BAR-TH-112 (poêle indépendant), la qualification RGE exigée est QualiBois Air, délivrée par Qualit'EnR. QualiBois Eau ne couvre que les appareils hydraulisés (chaudières, poêles à bouilleur). Vérifiez toujours la mention \u00ab\u202fQualiBois Air\u202f\u00bb sur l'attestation RGE de l'artisan.",
          "Un installateur titulaire de QualiBois Eau ne peut PAS déclencher la prime BAR-TH-112 sur un poêle simple — le dossier sera refusé par l'obligé. C'est une source fréquente de contentieux entre ménages et artisans, souvent détectée trop tard.",
        ],
      },
    ],
    faq: [
      {
        question: 'Flamme Verte 7\u202f étoiles est-il obligatoire?',
        answer:
          "Oui. C'est le seuil minimal DGEC pour BAR-TH-112. Un poêle 5* ou 6* Flamme Verte n'ouvre pas droit à la prime CEE, même s'il est vendu comme \u00ab\u202féco-performant\u202f\u00bb.",
      },
      {
        question: 'Quelle différence entre poêle à bûches et à granulés?',
        answer:
          "Les deux sont éligibles à BAR-TH-112, mais la prime est en général plus élevée pour les poêles à granulés (meilleur rendement et régulation automatique). Les montants exacts varient selon l'obligé.",
      },
      {
        question: "Peut-on installer un poêle en complément d'un chauffage existant?",
        answer:
          "Oui, BAR-TH-112 n'exige pas le remplacement d'un système existant. Contrairement à BAR-TH-171 (PAC air/eau), un poêle peut être installé en chauffage d'appoint ou principal sans contrainte.",
      },
      {
        question: 'Le conduit de fumée est-il inclus dans la prime?',
        answer:
          "Oui, les travaux connexes indispensables (tubage, création de conduit, arrivée d'air comburant) sont inclus dans l'assiette éligible à la TVA 5,5\u202f% et au calcul MaPrimeRénov'.",
      },
    ],
  },

  'BAR-TH-113': {
    code: 'BAR-TH-113',
    h1: 'Prime CEE BAR-TH-113 : chaudière biomasse individuelle en 2026',
    lede: "Chaudière biomasse (granulés, plaquettes, bûches) : rendement\u202f≥\u202f87\u202f%, prime CEE BAR-TH-113 bonifiée, cumul MaPrimeRénov' et QualiBois Eau obligatoire.",
    metaTitle: 'Guide BAR-TH-113 : prime CEE chaudière biomasse 2026',
    metaDescription:
      "BAR-TH-113 : prime CEE chaudière biomasse individuelle (granulés, plaquettes). Rendement ≥\u202f87\u202f%, Coup de pouce, cumul MaPrimeRénov' et QualiBois Eau.",
    primeClassique: "jusqu'à 4\u202f000\u202f€",
    primePrecarite: "jusqu'à 5\u202f000\u202f€ (Coup de pouce Chauffage)",
    maPrimeRenov: "jusqu'à 10\u202f000\u202f€ (ménage très modeste, granulés)",
    rgeRequises: ['QualiBois Eau', "Qualit'EnR"],
    requiredQualifications: ['qualibois'],
    sections: [
      {
        heading: 'Périmètre de BAR-TH-113',
        paragraphs: [
          "La fiche BAR-TH-113 couvre l'installation d'une chaudière biomasse individuelle dans un logement résidentiel de plus de 2 ans : granulés, plaquettes forestières ou bois bûches. Elle vise typiquement le remplacement d'une chaudière fioul, gaz ou charbon, et s'inscrit dans le Coup de pouce Chauffage avec un montant bonifié signé par tous les grands obligés.",
          "La performance minimale exigée est un rendement saisonnier ≥ 87\u202f% (calculé selon la norme EN 303-5). Le bois bûches impose en plus un ballon tampon d'au moins 55\u202fL par kW de puissance nominale — une exigence souvent oubliée par les installateurs et qui fait capoter le dossier au contrôle.",
        ],
      },
      {
        heading: 'Un des meilleurs rapports prime/investissement',
        paragraphs: [
          "BAR-TH-113 est l'une des opérations CEE les plus rentables grâce au Coup de pouce Chauffage : la prime peut atteindre 4\u202f000 à 5\u202f000\u202f€ pour un ménage classique et jusqu'à 5\u202f000\u202f€ garantis pour un ménage très modeste remplaçant une chaudière fioul.",
          "Cumulée avec MaPrimeRénov' (jusqu'à 10\u202f000\u202f€ pour une chaudière granulés en ménage très modeste au 1er janvier 2026), le reste à charge sur une installation à 20\u202f000\u202f€ TTC peut descendre sous les 5\u202f000\u202f€. La TVA 5,5\u202f% est appliquée automatiquement par l'artisan.",
        ],
      },
      {
        heading: 'QualiBois Eau obligatoire (pas QualiBois Air)',
        paragraphs: [
          "Attention, la qualification RGE exigée pour BAR-TH-113 est QualiBois Eau (délivrée par Qualit'EnR). QualiBois Air (poêles) n'est PAS acceptée pour les chaudières. Un installateur qui n'est qualifié qu'en QualiBois Air ne peut pas déclencher la prime BAR-TH-113 — le dossier sera refusé.",
          "Vérifiez toujours la mention explicite \u00ab\u202fQualiBois Eau\u202f\u00bb sur l'attestation RGE, et assurez-vous qu'elle est en cours de validité à la date d'acceptation du devis. La vérification se fait en 2 minutes sur france-renov.gouv.fr ou dans notre annuaire RGE.",
        ],
      },
    ],
    faq: [
      {
        question: 'Quelle différence BAR-TH-112 / BAR-TH-113?',
        answer:
          "BAR-TH-112 = poêle ou insert indépendant (chauffage d'une pièce). BAR-TH-113 = chaudière biomasse raccordée à un réseau hydraulique (chauffage central de tout le logement). Les montants, qualifications RGE et exigences techniques diffèrent complètement.",
      },
      {
        question: 'Le ballon tampon est-il obligatoire pour bois bûches?',
        answer:
          "Oui, 55\u202fL/kW minimum pour une chaudière bûches éligible BAR-TH-113. C'est l'erreur la plus fréquente qui invalide le dossier au contrôle terrain. Pour une chaudière granulés, le ballon tampon n'est pas obligatoire.",
      },
      {
        question: 'Une chaudière plaquettes est-elle éligible?',
        answer:
          "Oui, au même titre que les chaudières granulés et bûches, à condition que le rendement saisonnier atteigne 87\u202f% minimum et que l'installateur soit titulaire de QualiBois Eau.",
      },
      {
        question: "Peut-on cumuler avec l'éco-PTZ?",
        answer:
          "Oui. L'éco-PTZ individuel jusqu'à 30\u202f000\u202f€ peut financer le reste à charge après déduction de la prime CEE et de MaPrimeRénov'. Durée de remboursement jusqu'à 20 ans sans intérêt.",
      },
      {
        question: 'Combien de temps entre signature du devis et réception de la prime?',
        answer:
          "En moyenne 8 à 12 semaines après la fin des travaux (le temps de transmission du dossier à l'obligé, contrôle terrain éventuel et virement). Certains obligés versent en moins de 4 semaines sur dossier complet.",
      },
    ],
  },

  'BAR-TH-148': {
    code: 'BAR-TH-148',
    h1: 'Prime CEE BAR-TH-148 : chauffe-eau thermodynamique en 2026',
    lede: "Chauffe-eau thermodynamique (CET), version vA73-3 en vigueur depuis le 1\u1d49\u02b3 novembre 2025 : COP \u003e\u202f2,5 (air extrait) ou \u003e\u202f2,4 (air ambiant, ext\u00e9rieur, autre) mesur\u00e9 selon EN 16147, forfait CEE 6\u1d49 p\u00e9riode, cumul MaPrimeR\u00e9nov' et qualification RGE mention \u00ab\u202fInstallation de pompe \u00e0 chaleur\u202f\u00bb.",
    metaTitle: 'BAR-TH-148 vA73-3 : prime CEE chauffe-eau thermo 2026',
    metaDescription:
      "BAR-TH-148 vA73-3 en vigueur depuis 01/11/2025 (fiche applicable jusqu'au 01/11/2030) : COP \u003e\u202f2,5 air extrait ou \u003e\u202f2,4 air ambiant/ext\u00e9rieur, norme EN 16147, cumul MaPrimeR\u00e9nov'.",
    primeClassique:
      "forfait CEE 6\u1d49 période, variable selon zone climatique et cours kWh cumac de l'obligé \u2014 simulation auprès du signataire",
    primePrecarite:
      'bonification pr\u00e9carit\u00e9 Coup de pouce CEE, variable selon signataire \u2014 simulation personnalis\u00e9e',
    maPrimeRenov:
      "jusqu'\u00e0 1\u202f200\u202f\u20ac (m\u00e9nage tr\u00e8s modeste, au 1er janvier 2026)",
    rgeRequises: [
      'RGE mention \u00ab\u202fInstallation de pompe \u00e0 chaleur\u202f\u00bb (QualiPAC module CET ou \u00e9quivalent)',
    ],
    requiredQualifications: ['qualipac'],
    sections: [
      {
        heading: 'Ce que couvre la fiche BAR-TH-148 vA73-3',
        paragraphs: [
          "La fiche BAR-TH-148 encadre l'installation d'un chauffe-eau thermodynamique (CET) individuel \u00e0 accumulation dans un logement r\u00e9sidentiel existant (plus de 2 ans). Le CET est un ballon d'eau chaude \u00e9quip\u00e9 d'une mini-pompe \u00e0 chaleur qui capte les calories de l'air ambiant, ext\u00e9rieur ou extrait d'une VMC, pour chauffer l'eau sanitaire avec un rendement 2 \u00e0 3 fois sup\u00e9rieur \u00e0 un cumulus \u00e9lectrique classique.",
          "La version en vigueur est BAR-TH-148 vA73-3, applicable depuis le 1\u1d49\u02b3 novembre 2025 suite \u00e0 l'arr\u00eat\u00e9 du 6 septembre 2025 (JORFTEXT000052212320) qui a modifi\u00e9 plusieurs fiches d'op\u00e9rations standardis\u00e9es. La fiche est applicable aux op\u00e9rations engag\u00e9es avant le 1\u1d49\u02b3 novembre 2030. Elle s'inscrit dans le cadre de la 6\u1d49 p\u00e9riode CEE (arr\u00eat\u00e9 du 21 d\u00e9cembre 2025 et d\u00e9cret n\u00b0 2025-1048, en vigueur depuis le 1\u1d49\u02b3 janvier 2026).",
          "La condition technique cl\u00e9 de la vA73-3 porte sur le coefficient de performance (COP) mesur\u00e9 selon la norme NF EN 16147 : COP \u003e\u202f2,5 pour les CET sur air extrait et COP \u003e\u202f2,4 pour les CET sur air ambiant, air ext\u00e9rieur ou autre configuration. Ce seuil diff\u00e9renci\u00e9 a remplac\u00e9 l'ancien seuil unique de 2,5 \u00e0 l'occasion de la vA73-3. Le CET doit \u00eatre install\u00e9 par un professionnel titulaire de la mention RGE \u00ab\u202fInstallation de pompe \u00e0 chaleur\u202f\u00bb en remplacement d'un chauffe-eau \u00e9lectrique ou thermodynamique ancien. La capacit\u00e9 du ballon doit \u00eatre adapt\u00e9e au nombre d'occupants du logement (typiquement 200 \u00e0 300\u202fL pour une famille de 4 personnes).",
        ],
      },
      {
        heading: 'Forfait CEE et rapport investissement/retour',
        paragraphs: [
          "La prime CEE BAR-TH-148 reste modeste compar\u00e9e aux fiches PAC air/eau ou chaudi\u00e8re biomasse. En 6\u1d49 p\u00e9riode, le forfait en kWh cumac d\u00e9pend de la zone climatique (H1, H2, H3) et se traduit en euros via le cours hebdomadaire du kWh cumac sign\u00e9 entre l'obligé et le d\u00e9l\u00e9gataire \u2014 les montants en euros ne sont plus encadr\u00e9s par un plancher r\u00e9glementaire depuis 2022, il faut donc demander une simulation nominative au signataire. La bonification pr\u00e9carit\u00e9 via le Coup de pouce CEE reste mobilisable pour les m\u00e9nages modestes et tr\u00e8s modestes.",
          "Le cumul avec MaPrimeR\u00e9nov' (jusqu'\u00e0 1\u202f200\u202f\u20ac pour un m\u00e9nage tr\u00e8s modeste au 1\u1d49\u02b3 janvier 2026) et la TVA \u00e0 5,5\u202f% (article 278-0 bis A du CGI) rendent l'investissement rentable. Un CET co\u00fbte entre 2\u202f500 et 4\u202f000\u202f\u20ac pose incluse, contre 800 \u00e0 1\u202f500\u202f\u20ac pour un cumulus \u00e9lectrique classique. Le surco\u00fbt est amorti en 3 \u00e0 5 ans gr\u00e2ce \u00e0 la division par 3 de la facture d'eau chaude sanitaire (qui repr\u00e9sente environ 15\u202f% de la consommation \u00e9nerg\u00e9tique d'un logement fran\u00e7ais moyen).",
        ],
      },
      {
        heading: 'Qualification RGE et points de vigilance',
        paragraphs: [
          "La qualification requise pour BAR-TH-148 est la mention RGE \u00ab\u202fInstallation de pompe \u00e0 chaleur\u202f\u00bb. En pratique, la qualification de r\u00e9f\u00e9rence est QualiPAC module chauffe-eau thermodynamique d\u00e9livr\u00e9e par Qualit'EnR. La qualification doit \u00eatre active et porter la mention RGE \u00e0 la date d'acceptation du devis par le m\u00e9nage, sans quoi l'obligé CEE refusera le dossier m\u00eame si l'\u00e9quipement install\u00e9 est techniquement \u00e9ligible.",
          "Point de vigilance majeur : certains installateurs proposent le CET en solution \u00ab\u202fsimple\u202f\u00bb sans vérifier la compatibilité avec le volume d'air disponible pour la captation. Un CET sur air ambiant nécessite un local non chauffé d'au moins 20\u202fm³ bien ventilé. En captation sur air extérieur, prévoir le passage des gaines isolées. Un mauvais dimensionnement divise par 2 le COP réel mesuré en conditions d'usage.",
        ],
      },
    ],
    faq: [
      {
        question: 'Un CET sur VMC est-il éligible BAR-TH-148?',
        answer:
          "Oui. Depuis la vA73-3 en vigueur au 1\u1d49\u02b3 novembre 2025, le seuil applicable aux CET sur air extrait est un COP \u003e\u202f2,5 mesur\u00e9 selon NF EN 16147 (seuil plus exigeant que les CET sur air ambiant/ext\u00e9rieur qui rel\u00e8vent d'un COP \u003e\u202f2,4). La captation sur air extrait VMC reste souvent la meilleure option \u00e9nerg\u00e9tique en maison bien isol\u00e9e.",
      },
      {
        question: 'Peut-on cumuler BAR-TH-148 avec la prime CEE PAC air/eau BAR-TH-171?',
        answer:
          "Non si c'est un système unique (PAC air/eau avec module ECS intégré). Oui si ce sont deux équipements physiquement distincts : une PAC air/eau pour le chauffage + un CET séparé pour l'ECS.",
      },
      {
        question: 'Un CET installé dans un garage est-il acceptable?',
        answer:
          "Oui, à condition que le garage soit non chauffé et d'un volume minimal de 20\u202fm³ (soit environ un garage simple). En volume insuffisant, la performance s'effondre et le dossier peut être refusé en contrôle.",
      },
      {
        question: "Combien d'économies réelles sur la facture ECS?",
        answer:
          "Division par 3 en moyenne comparé à un cumulus électrique. Sur une famille de 4 personnes, l'économie annuelle est de 300 à 450\u202f€ selon la zone climatique et le prix du kWh.",
      },
    ],
  },

  'BAR-TH-125': {
    code: 'BAR-TH-125',
    h1: 'Prime CEE BAR-TH-125 : VMC double flux autoréglable en 2026',
    lede: "Système de ventilation mécanique contrôlée double flux résidentielle\u202f: classe ErP\u202fA exigée (règlement UE\u202f1254/2014), prime CEE BAR-TH-125, cumul MaPrimeRénov' et qualification RGE mention « Ventilation mécanique ».",
    metaTitle: 'Guide BAR-TH-125 : prime CEE VMC double flux 2026',
    metaDescription:
      "BAR-TH-125\u202f: prime CEE VMC double flux résidentielle. Classe ErP\u202fA (règlement UE\u202f1254/2014), norme NF\u202fEN\u202f13141-7, cumul MaPrimeRénov' et RGE Qualibat.",
    primeClassique:
      'forfait kWh\u202fcumac variable — simulation auprès du signataire de la charte',
    primePrecarite:
      'bonification Coup de pouce, variable selon signataire — simulation personnalisée',
    maPrimeRenov: 'éligible, forfait modulé selon revenus',
    rgeRequises: ['RGE mention « Ventilation mécanique » (typiquement Qualibat 5321 / 5322)'],
    // VMC — Qualibat 5322/5321, pas de guide éditorial dédié actuellement.
    requiredQualifications: [],
    sections: [
      {
        heading: "Ce qu'encadre BAR-TH-125",
        paragraphs: [
          "La fiche BAR-TH-125 couvre l'installation d'un système de ventilation mécanique contrôlée (VMC) double flux avec échangeur de chaleur dans un logement résidentiel existant. Contrairement à une VMC simple flux qui se contente d'extraire l'air vicié, la VMC double flux récupère la chaleur de l'air extrait pour préchauffer l'air neuf entrant, ce qui réduit fortement les pertes de chaleur par renouvellement d'air.",
          "L'exigence technique réglementaire porte sur la classe d'efficacité énergétique du système. Pour une VMC double flux résidentielle, la fiche DGEC impose la classe ErP\u202fA au sens du règlement délégué (UE) n°\u202f1254/2014. Pour une VMC double flux collective, le critère est un taux d'échange (efficacité thermique de l'échangeur statique) supérieur ou égal à 75\u202f%. Les performances sont mesurées selon la norme NF\u202fEN\u202f13141-7 (méthodes d'essai des composants pour la ventilation des logements résidentiels). La fiche reste applicable jusqu'au 01/07/2028 selon le calendrier DGEC en vigueur. L'isolation des gaines dans les volumes non chauffés (combles, vide sanitaire) est une règle de l'art pour préserver la performance réelle du système.",
        ],
      },
      {
        heading: 'Montant de la prime CEE BAR-TH-125',
        paragraphs: [
          "Le forfait en kWh\u202fcumac est défini par l'annexe de la fiche BAR-TH-125 publiée par la DGEC et dépend de la zone climatique et de la surface habitable. La conversion en euros dépend du cours hebdomadaire du kWh\u202fcumac et du barème propre à chaque signataire de la charte\u202f: il faut demander une simulation personnalisée au mandataire ou au délégataire, aucun montant plancher n'est imposé par la DGEC.",
          "Les ménages modestes et très modestes peuvent bénéficier d'une bonification précarité dans le cadre du Coup de pouce. MaPrimeRénov' reste cumulable pour la VMC double flux résidentielle et son forfait est modulé selon la couleur de revenus. Le retour sur investissement dépend principalement de la qualité de l'enveloppe du logement et du bon réglage des débits à la mise en service.",
        ],
      },
      {
        heading: 'Qualifications RGE et installation de qualité',
        paragraphs: [
          "La qualification RGE exigée relève de la mention DGEC « Ventilation mécanique », typiquement portée par Qualibat 5321 (travaux de ventilation, aération) ou Qualibat 5322 (ventilation mécanique contrôlée). La qualification doit être active à la date d'acceptation du devis et l'entreprise signataire de l'attestation sur l'honneur doit être la même que celle titulaire du RGE.",
          'Piège fréquent : une VMC double flux mal installée perd tout son intérêt. Les trois erreurs critiques qui invalident la performance : (1) gaines non isolées dans les combles, (2) caisson placé dans un volume non chauffé, (3) débits mal équilibrés entre les pièces humides et les pièces sèches. Exigez un rapport de mise en service avec les débits mesurés par bouche à la livraison.',
        ],
      },
    ],
    faq: [
      {
        question: 'VMC double flux vs simple flux hygro, laquelle préférer?',
        answer:
          "La double flux offre 2 à 3 fois plus de confort et d'économies, mais coûte 3 fois plus cher. Pour un logement très bien isolé (RT2012 ou RE2020), la double flux est pertinente. Pour un logement moyennement isolé, la simple flux hygroréglable (fiche BAR-TH-127) reste rentable.",
      },
      {
        question: 'Peut-on installer une VMC double flux en rénovation?',
        answer:
          "Oui, mais prévoir le passage des gaines dans les faux-plafonds ou les combles. L'opération est plus simple en maison individuelle qu'en appartement. Un audit énergétique préalable est souvent recommandé.",
      },
      {
        question: 'Le by-pass estival est-il obligatoire\u202f?',
        answer:
          "Le by-pass estival n'est pas une obligation réglementaire stricte au titre de BAR-TH-125 — le critère d'éligibilité CEE porte sur la classe ErP\u202fA (règlement UE\u202f1254/2014), pas sur la présence d'un by-pass. C'est un équipement fortement recommandé pour la qualité de l'air intérieur et le confort en mi-saison\u202f: sans by-pass, l'échangeur réchauffe l'air entrant lorsqu'il fait chaud. La plupart des caissons résidentiels du marché l'intègrent en standard.",
      },
      {
        question: 'Faut-il un entretien particulier?',
        answer:
          "Oui : remplacement des filtres tous les 6 à 12 mois et nettoyage de l'échangeur tous les 2 à 3 ans. Budget entretien annuel d'environ 80 à 150\u202f€. Sans entretien, la performance chute rapidement.",
      },
    ],
  },

  'BAR-EN-102': {
    code: 'BAR-EN-102',
    h1: 'Prime CEE BAR-EN-102 : isoler les murs en 2026',
    lede: "Isolation thermique des murs par l'intérieur (ITI) ou par l'extérieur (ITE) : résistance R ≥ 3,7, prime CEE BAR-EN-102 et cumul MaPrimeRénov'.",
    metaTitle: 'Guide BAR-EN-102 : prime CEE isolation murs 2026',
    metaDescription:
      "BAR-EN-102 : prime CEE isolation des murs par l'intérieur ou extérieur. R ≥ 3,7, montants 2026, cumul MaPrimeRénov' et Qualibat RGE.",
    primeClassique: "jusqu'à 20\u202f€/m² (ITE)",
    primePrecarite: "jusqu'à 40\u202f€/m² (Coup de pouce)",
    maPrimeRenov: "jusqu'à 75\u202f€/m² (ménage très modeste, ITE)",
    rgeRequises: ['Qualibat 7131', 'Qualibat 7142'],
    // Isolation murs — Qualibat, pas de guide éditorial dédié actuellement.
    requiredQualifications: [],
    sections: [
      {
        heading: 'ITE ou ITI : deux approches couvertes par BAR-EN-102',
        paragraphs: [
          "La fiche BAR-EN-102 couvre l'isolation thermique des murs donnant sur l'extérieur d'un logement résidentiel existant, qu'elle soit réalisée par l'intérieur (ITI) ou par l'extérieur (ITE). L'ITE est systématiquement privilégiée lorsque c'est techniquement possible : elle supprime les ponts thermiques, n'empiète pas sur la surface habitable et offre un meilleur déphasage thermique en été.",
          "La performance minimale exigée est R ≥ 3,7\u202fm²·K/W. Ce seuil, plus exigeant que la RT2012, impose typiquement 14 à 16\u202fcm d'isolant en polystyrène expansé (lambda 0,032) ou 18 à 20\u202fcm de laine de roche (lambda 0,035). La fiche ACERMI du produit doit attester ce R pour être éligible.",
        ],
      },
      {
        heading: 'Montant de la prime CEE BAR-EN-102',
        paragraphs: [
          'La prime CEE BAR-EN-102 est parmi les plus élevées du catalogue enveloppe : un ménage standard perçoit 15 à 20\u202f€/m² pour une ITE et 10 à 15\u202f€/m² pour une ITI. Les ménages précaires bénéficient du Coup de pouce Isolation qui peut porter la prime à 40\u202f€/m² en ITE.',
          "Cumulée avec MaPrimeRénov' (jusqu'à 75\u202f€/m² pour une ITE en ménage très modeste au 1er janvier 2026), une façade de 100\u202fm² peut bénéficier de plus de 10\u202f000\u202f€ d'aides sur un chantier moyen à 20\u202f000\u202f€ TTC. Le reste à charge pour un ménage très modeste peut descendre sous les 4\u202f000\u202f€.",
        ],
      },
      {
        heading: 'Qualifications RGE et pièges classiques',
        paragraphs: [
          "Deux qualifications sont reconnues : Qualibat 7131 (isolation thermique par l'intérieur) pour l'ITI et Qualibat 7142 (isolation thermique par l'extérieur) pour l'ITE. L'ITE requiert en plus un audit terrain renforcé par Qualibat, car les sinistres dus à une pose défectueuse (décollement, infiltration, fissuration de l'enduit) sont fréquents.",
          "Pièges classiques : (1) choisir un R à peine supérieur à 3,7 pour économiser quelques centimètres d'épaisseur, au prix d'une performance marginale ; (2) négliger les ponts thermiques de dalle et de refend en ITI ; (3) en ITE, accepter une pose sans rupteur de pont thermique au niveau des balcons et des linteaux. Exigez un DTA (document technique d'application) du système ETICS retenu.",
        ],
      },
    ],
    faq: [
      {
        question: 'ITE ou ITI, que choisir en 2026?',
        answer:
          "ITE systématiquement si c'est techniquement possible (pas de façade classée, pas de contraintes d'urbanisme bloquantes). L'ITE supprime les ponts thermiques, préserve la surface habitable et offre 20 à 30\u202f% de performance supplémentaire comparé à une ITI équivalente.",
      },
      {
        question: "Peut-on faire de l'ITE sur une maison mitoyenne?",
        answer:
          "Oui, sous réserve d'un accord du voisin si le débord d'isolant empiète sur sa propriété. Un PLU peut imposer des contraintes esthétiques (parement, couleur). Un permis de construire est souvent requis au-delà de 20\u202fcm d'épaisseur totale (isolant + enduit).",
      },
      {
        question: 'Quelle épaisseur pour atteindre R = 3,7?',
        answer:
          'Polystyrène expansé (lambda 0,032) : 12 à 14\u202fcm. Laine de roche (lambda 0,035) : 14 à 16\u202fcm. Polyuréthane (lambda 0,023) : 9 à 10\u202fcm. Le choix dépend du budget, de la place disponible et des contraintes feu.',
      },
      {
        question: "Les balcons sont-ils un obstacle à l'ITE?",
        answer:
          "Non mais ils nécessitent un traitement spécifique (rupteur de pont thermique ou désolidarisation). Un balcon non traité annule 30 à 40\u202f% de la performance de l'isolation murale. Exigez un plan de traitement des points singuliers.",
      },
    ],
  },

  'BAR-EN-104': {
    code: 'BAR-EN-104',
    h1: 'Prime CEE BAR-EN-104 : remplacer les fenêtres en 2026',
    lede: "Remplacement de fenêtres ou portes-fenêtres : Uw ≤ 1,3, Sw ≥ 0,3, prime CEE BAR-EN-104, cumul MaPrimeRénov' et qualification RGE Qualibat.",
    metaTitle: 'Guide BAR-EN-104 : prime CEE fenêtres 2026',
    metaDescription:
      "BAR-EN-104 : prime CEE remplacement fenêtres et portes-fenêtres. Uw ≤ 1,3, Sw ≥ 0,3, montants 2026 et cumul MaPrimeRénov'.",
    primeClassique: "jusqu'à 100\u202f€/fenêtre",
    primePrecarite: "jusqu'à 200\u202f€/fenêtre",
    maPrimeRenov: "jusqu'à 1\u202f000\u202f€ (ménage très modeste)",
    rgeRequises: ['Qualibat 3512', 'Qualibat 3511'],
    // Menuiserie — Qualibat, pas de guide éditorial dédié actuellement.
    requiredQualifications: [],
    sections: [
      {
        heading: "Ce qu'encadre BAR-EN-104",
        paragraphs: [
          "La fiche BAR-EN-104 couvre le remplacement de fenêtres, portes-fenêtres ou baies vitrées dans un logement résidentiel existant, en remplacement d'un simple vitrage ou d'un double vitrage ancien (antérieur à 2000). Les travaux doivent concerner le dormant ET l'ouvrant (remplacement complet), et non une simple pose d'un double vitrage sur un dormant existant.",
          'Les exigences techniques sont doubles : un coefficient de transmission thermique Uw ≤ 1,3\u202fW/m²·K (standard RT2012 pour le neuf) et un facteur solaire Sw ≥ 0,3 (qui garantit un apport solaire gratuit en hiver). Ces valeurs doivent figurer explicitement sur la fiche technique du produit, certifiée CEKAL ou équivalent.',
        ],
      },
      {
        heading: 'Montant de la prime CEE BAR-EN-104',
        paragraphs: [
          "La prime CEE BAR-EN-104 est calculée par fenêtre remplacée, avec un montant variable selon la zone climatique (H1, H2, H3). En moyenne, un ménage standard perçoit 80 à 100\u202f€ par fenêtre, un ménage précaire jusqu'à 200\u202f€ via le Coup de pouce. Pour une maison de 6 fenêtres, la prime CEE totale représente 500 à 1\u202f200\u202f€.",
          "MaPrimeRénov' complète jusqu'à 1\u202f000\u202f€ pour un ménage très modeste au 1er janvier 2026 (plafond par logement, non par fenêtre). Le reste à charge pour un remplacement complet à 6\u202f000\u202f€ TTC peut descendre autour de 2\u202f500\u202f€ pour un ménage très modeste. La TVA 5,5\u202f% s'applique sur le matériel et la pose.",
        ],
      },
      {
        heading: 'Qualifications RGE et choix du menuisier',
        paragraphs: [
          "Les qualifications reconnues sont Qualibat 3512 (menuiserie extérieure en matériaux mixtes ou composites) et Qualibat 3511 (menuiserie bois extérieure). La qualification doit être active à la date d'acceptation du devis et couvrir explicitement la menuiserie extérieure.",
          "Piège classique : certains menuisiers proposent une \u00ab\u202frénovation\u202f\u00bb en gardant le dormant existant et en posant un nouveau cadre dessus (pose en rénovation). Cette technique est moins performante et n'est éligible à BAR-EN-104 que si le Uw final sur l'ensemble dormant+cadre reste ≤ 1,3, ce qui est rarement atteint. Préférer une dépose totale pour sécuriser l'éligibilité.",
        ],
      },
    ],
    faq: [
      {
        question: 'Un double vitrage existant peut-il être remplacé par BAR-EN-104?',
        answer:
          "Oui si le double vitrage est antérieur à 2000 (reconnaissable par l'absence de gaz argon et un Uw supérieur à 2,5). Pour un double vitrage plus récent, le remplacement n'est pas éligible car le gain énergétique est trop faible.",
      },
      {
        question: 'PVC, alu ou bois, quel matériau privilégier?',
        answer:
          "PVC : meilleur rapport performance/prix, Uw jusqu'à 1,0. Bois : excellentes performances thermiques et esthétiques mais entretien régulier. Aluminium : design moderne mais Uw souvent moins bon sauf gamme haute. Tous sont éligibles si Uw ≤ 1,3 et Sw ≥ 0,3.",
      },
      {
        question: 'Les velux sont-ils éligibles BAR-EN-104?',
        answer:
          "Oui, les fenêtres de toit (velux et marques concurrentes) sont éligibles au même titre que les fenêtres verticales, à condition de respecter les mêmes exigences Uw et Sw. La pose doit inclure le raccordement d'étanchéité à la couverture.",
      },
      {
        question: 'Faut-il remplacer toutes les fenêtres en même temps?',
        answer:
          "Non, BAR-EN-104 est calculée par fenêtre. Vous pouvez remplacer un lot partiel et revenir plus tard. Attention cependant : MaPrimeRénov' est limitée à une demande par an et par logement, donc un remplacement progressif réduit les aides totales.",
      },
    ],
  },

  'BAR-TH-129': {
    code: 'BAR-TH-129',
    h1: 'Prime CEE BAR-TH-129 : pompe à chaleur air/air en 2026',
    lede: "Pompe à chaleur air/air résidentielle\u202f: SCOP\u202f≥\u202f3,9 et puissance nominale\u202f≤\u202f12\u202fkW (règlement UE\u202f206/2012), prime CEE BAR-TH-129, exclusion MaPrimeRénov' et qualification RGE mention « Installation de pompe à chaleur ».",
    metaTitle: 'Guide BAR-TH-129 : prime CEE PAC air/air 2026',
    metaDescription:
      "BAR-TH-129\u202f: prime CEE PAC air/air résidentielle. SCOP\u202f≥\u202f3,9, puissance\u202f≤\u202f12\u202fkW (UE\u202f206/2012), mesure NF\u202fEN\u202f14825, exclusion MaPrimeRénov' depuis 2021.",
    primeClassique:
      'forfait kWh\u202fcumac variable — simulation auprès du signataire de la charte',
    primePrecarite: 'bonification précarité, variable selon signataire — simulation personnalisée',
    maPrimeRenov: "non éligible depuis 2021 (décret MaPrimeRénov' exclut la PAC air/air)",
    rgeRequises: ['QualiPAC mention air/air'],
    requiredQualifications: ['qualipac', 'qualifelec'],
    sections: [
      {
        heading: "Ce qu'encadre BAR-TH-129",
        paragraphs: [
          "La fiche BAR-TH-129 couvre l'installation d'une pompe à chaleur air/air (climatiseur réversible) dans un logement résidentiel existant, en chauffage principal ou en complément d'un système existant. Contrairement à la PAC air/eau (BAR-TH-171) qui alimente des radiateurs ou un plancher chauffant, la PAC air/air souffle directement l'air chaud ou froid dans les pièces via des unités intérieures (splits).",
          "L'exigence technique clé est un SCOP (coefficient de performance saisonnier en chauffage) ≥ 3,9, mesuré selon la norme EN 14825. Ce seuil correspond à une PAC classée A++ ou A+++ sur l'étiquette énergie européenne. Les modèles moins performants ne sont pas éligibles, même s'ils sont vendus comme \u00ab\u202finverter\u202f\u00bb.",
        ],
      },
      {
        heading: "Attention : pas de MaPrimeRénov' sur BAR-TH-129",
        paragraphs: [
          "Point critique souvent ignoré : la pompe à chaleur air/air est EXCLUE de MaPrimeRénov' depuis 2021, contrairement à la PAC air/eau. Seule la prime CEE BAR-TH-129 est mobilisable. Cette exclusion vient du fait que la PAC air/air est souvent utilisée comme climatiseur d'appoint en été, ce qui contredit la logique de rénovation énergétique durable recherchée par MaPrimeRénov'.",
          "La prime CEE BAR-TH-129 représente en moyenne 500 à 800\u202f€ pour un ménage standard et jusqu'à 1\u202f500\u202f€ pour un ménage précaire. Ce montant est modeste par rapport au coût total d'une installation (3\u202f000 à 8\u202f000\u202f€ TTC pour un multi-split couvrant 3 à 4 pièces). Comparer systématiquement à l'option PAC air/eau haute performance (BAR-TH-171 + MaPrimeRénov') qui est souvent plus rentable en rénovation complète.",
        ],
      },
      {
        heading: 'QualiPAC mention air/air obligatoire',
        paragraphs: [
          "La qualification RGE exigée pour BAR-TH-129 est QualiPAC avec la mention spécifique \u00ab\u202fair/air\u202f\u00bb. Un artisan QualiPAC mention \u00ab\u202fair/eau\u202f\u00bb ou \u00ab\u202feau/eau\u202f\u00bb n'est PAS autorisé à poser une PAC air/air éligible BAR-TH-129. Vérifiez la mention exacte sur l'attestation Qualit'EnR fournie avec le devis.",
          "Qualifelec IRVE, Qualibat 5911 et autres qualifications ne sont pas reconnues pour cette fiche. C'est une restriction stricte car la pose d'une PAC air/air implique une manipulation de fluide frigorigène (certification F-Gaz catégorie I requise en plus) que seules les entreprises QualiPAC air/air sont censées maîtriser.",
        ],
      },
    ],
    faq: [
      {
        question: 'Une PAC air/air peut-elle remplacer un chauffage électrique?',
        answer:
          "Oui, c'est son usage le plus fréquent. Une PAC air/air multi-split couvrant 3 à 4 pièces permet de diviser par 2,5 à 3 la consommation électrique de chauffage par rapport à des convecteurs. Rentabilité typique en 6 à 10 ans.",
      },
      {
        question: "Pourquoi MaPrimeRénov' exclut la PAC air/air?",
        answer:
          "Parce qu'elle est majoritairement installée pour la climatisation estivale plutôt que pour le chauffage. MaPrimeRénov' vise à financer la sortie des énergies fossiles pour le chauffage, pas à encourager la climatisation. La seule aide mobilisable reste la prime CEE.",
      },
      {
        question: 'Un climatiseur mobile est-il éligible?',
        answer:
          'Non, BAR-TH-129 ne couvre que les systèmes fixes (monosplits et multisplits) installés par un professionnel RGE avec raccordement frigorifique. Les climatiseurs mobiles et les monoblocs sans unité extérieure sont exclus.',
      },
      {
        question: 'Combien de temps dure une installation PAC air/air?',
        answer:
          "15 à 20 ans pour une installation de qualité correctement entretenue. L'entretien annuel (nettoyage des filtres, contrôle du fluide) coûte 100 à 200\u202f€ et est obligatoire au-delà de 4\u202fkg de fluide frigorigène.",
      },
    ],
  },

  'BAR-TH-143': {
    code: 'BAR-TH-143',
    h1: 'Prime CEE BAR-TH-143 : système solaire combiné (SSC) en 2026',
    lede: "Système solaire combiné : capteurs solaires thermiques couplés à un ballon tampon pour couvrir ECS et chauffage. Prime CEE BAR-TH-143, MaPrimeRénov' et qualification QualiSol SSC.",
    metaTitle: 'Guide BAR-TH-143 : prime CEE système solaire combiné 2026',
    metaDescription:
      "BAR-TH-143 : prime CEE système solaire combiné (SSC) chauffage + ECS. Surface captée, montants, cumul MaPrimeRénov' et qualification QualiSol SSC.",
    primeClassique: 'ordre de grandeur 3\u202f000 à 4\u202f500\u202f€ selon surface captée',
    primePrecarite: 'ordre de grandeur 5\u202f000 à 6\u202f500\u202f€ (Coup de pouce)',
    maPrimeRenov:
      "éligible, forfait modulé selon revenus (jusqu'à ~10\u202f000\u202f€ ménage très modeste)",
    rgeRequises: ['QualiSol SSC', "Qualit'EnR"],
    requiredQualifications: ['qualisol'],
    sections: [
      {
        heading: 'Ce que couvre exactement la fiche BAR-TH-143',
        paragraphs: [
          "La fiche d'opération standardisée BAR-TH-143, publiée par la DGEC dans l'arrêté du 22 décembre 2014 modifié, encadre l'installation d'un système solaire combiné (SSC) dans une maison individuelle résidentielle. Le SSC associe des capteurs solaires thermiques (plans vitrés ou tubes sous vide) à un ballon de stockage tampon, pour assurer à la fois la production d'eau chaude sanitaire et une partie du chauffage du logement — typiquement via un plancher chauffant basse température ou des radiateurs basse température.",
          "Le SSC se distingue du chauffe-eau solaire individuel (CESI, fiche BAR-TH-101) qui ne produit que de l'ECS, et du solaire thermique collectif. La fiche BAR-TH-143 impose une surface de capteurs généralement comprise entre 10 et 20\u202fm² et un ballon tampon dimensionné entre 500 et 1\u202f000\u202fL selon la surface captée, conformément aux règles de l'art Socol et aux normes NF EN 12975 / NF EN 12976 pour les capteurs et kits certifiés.",
        ],
      },
      {
        heading: 'Principe technique et couverture réelle des besoins',
        paragraphs: [
          "Un SSC correctement dimensionné couvre en moyenne 40 à 60\u202f% des besoins annuels en chauffage + ECS d'une maison individuelle bien orientée (plein sud ± 45°, inclinaison 45-60°), selon le climat et la qualité de l'enveloppe. Le taux de couverture chute rapidement dans les régions peu ensoleillées ou sur des logements mal isolés, ce qui rend le dimensionnement préalable (étude thermique + simulation dynamique) absolument indispensable avant signature.",
          "Le SSC est pertinent dans les zones climatiques H2 sud-ouest et H3 méditerranéenne, et peut rester intéressant en H2 nord et H1 sud si l'enveloppe est performante. En climat continental froid ou en nord Bretagne, la rentabilité solaire seule devient incertaine : l'opération n'a d'intérêt qu'en complément d'un autre système (chaudière biomasse ou PAC) qui prend le relais sur les longues périodes sans ensoleillement.",
        ],
      },
      {
        heading: 'Montant indicatif de la prime CEE BAR-TH-143',
        paragraphs: [
          'Le forfait en kWh cumac est indexé sur la surface de capteurs installée et la zone climatique. Traduit en euros au cours hebdomadaire 2026, la prime CEE classique se situe typiquement dans une fourchette de 3\u202f000 à 4\u202f500\u202f€ pour une installation résidentielle standard de 12 à 15\u202fm² de capteurs. Ce montant est bonifié via le Coup de pouce Chauffage pour les ménages modestes et très modestes, qui atteignent couramment une fourchette de 5\u202f000 à 6\u202f500\u202f€.',
          "Ces ordres de grandeur restent indicatifs : le barème exact figure dans l'annexe de la fiche DGEC publiée au BOAMP, qu'il faut consulter pour chaque chantier. Les chiffres réels dépendent de la surface captée, de la zone climatique (H1, H2, H3), du cours du kWh cumac et de la politique commerciale de l'obligé. Ne jamais accepter un engagement chiffré verbal : exigez l'offre de prime CEE nominative avant de signer le devis.",
        ],
      },
      {
        heading: "Cumul MaPrimeRénov', TVA 5,5\u202f% et qualifications RGE",
        paragraphs: [
          "BAR-TH-143 est pleinement éligible à MaPrimeRénov' résidentielle, contrairement aux chaudières fossiles : le SSC est une énergie renouvelable soutenue par la politique publique (arrêté du 22 décembre 2014 modifié, décret n° 2022-1649 du 23 décembre 2022 qui a maintenu les EnR dans le dispositif). Le forfait MaPrimeRénov' est modulé selon la couleur de revenus, avec un forfait ménage très modeste pouvant approcher 10\u202f000\u202f€ pour un SSC à performance vérifiée. Le cumul avec la prime CEE est automatique.",
          "Côté artisan, la qualification exigée est QualiSol module SSC (délivrée par Qualit'EnR). QualiSol CESI (chauffe-eau solaire individuel) ne suffit PAS : le SSC implique le couplage hydraulique au circuit de chauffage, ce qui relève du module SSC. Vérifiez la mention \u00ab\u202fQualiSol SSC\u202f\u00bb en toutes lettres sur l'attestation RGE avant signature. La TVA 5,5\u202f% (article 278-0 bis A du CGI) est appliquée directement par l'installateur sur fournitures et pose.",
        ],
      },
      {
        heading: 'Pièges classiques et points de vigilance',
        paragraphs: [
          "Trois pièges récurrents font perdre du rendement ou invalident le dossier : (1) le sous-dimensionnement du ballon tampon (un ballon trop petit provoque des surchauffes estivales, dégrade le fluide caloporteur et casse la régulation) ; (2) une orientation ou une inclinaison contraire aux règles Socol (plein sud ± 45° idéal, rupture nette de performance au-delà) ; (3) le choix d'un émetteur incompatible (radiateurs haute température : le SSC ne peut pas produire d'eau à 70\u202f°C sur la durée, il faut des émetteurs basse température).",
          "Quatrième point critique : la régulation. Un SSC sans régulation solaire performante (sonde de capteur, sonde de ballon, logique anti-surchauffe, fonction drain-back si le kit le prévoit) perd une grande partie de son potentiel. Exigez la référence exacte du régulateur sur le devis et vérifiez qu'il dispose d'un monitoring accessible (affichage température capteur, compteur d'énergie solaire produite).",
        ],
      },
      {
        heading: "Quand une PAC est plus pertinente qu'un SSC",
        paragraphs: [
          "Le SSC n'est pas toujours la meilleure option. Sur une maison en climat peu ensoleillé ou à enveloppe moyennement isolée, une pompe à chaleur air/eau haute performance (fiche BAR-TH-171) offre souvent un meilleur ratio investissement/économie annuelle, avec une couverture 100\u202f% des besoins sur toute l'année. Comparer systématiquement les deux devis avant de trancher : un SSC sur une maison de 100\u202fm² bien orientée en climat sud-ouest peut être excellent, mais le même SSC dans un pavillon Nord-Est exposé au vent dominant sera décevant.",
          "Pour les ménages qui souhaitent aller plus loin dans la décarbonation, le couplage SSC + chaudière biomasse (BAR-TH-113) ou SSC + PAC est techniquement possible et ouvre les primes des deux fiches. Ce type de montage relève d'un vrai projet de rénovation, idéalement cadré par un audit énergétique préalable et le dispositif Mon Accompagnateur Rénov' (fiche BAR-TH-174, qui remplace depuis le 01/01/2024 l'ancienne BAR-TH-164 abrogée).",
        ],
      },
    ],
    faq: [
      {
        question: "Un SSC peut-il couvrir 100\u202f% du chauffage d'une maison?",
        answer:
          "Non. Même parfaitement dimensionné et bien orienté, un SSC couvre au maximum 40 à 60\u202f% des besoins annuels de chauffage + ECS. Il doit obligatoirement être associé à un système d'appoint (chaudière biomasse, PAC, chaudière gaz condensation existante) qui prend le relais en hiver et lors des longues périodes sans ensoleillement.",
      },
      {
        question: 'QualiSol CESI suffit-il pour installer un SSC?',
        answer:
          "Non. QualiSol se décline en deux modules strictement distincts : CESI (chauffe-eau solaire individuel) et SSC (système solaire combiné). Seul le module QualiSol SSC couvre le couplage au circuit de chauffage. Un artisan titulaire uniquement de QualiSol CESI ne peut pas déclencher la prime BAR-TH-143 — le dossier sera refusé par l'obligé.",
      },
      {
        question: 'Le SSC est-il pertinent dans le nord de la France?',
        answer:
          "C'est pertinent uniquement si la maison est très bien isolée (RT2012 ou mieux) et bien orientée. En climat H1 nord, le taux de couverture solaire chute et la rentabilité est plus fragile que sur le sud-ouest ou le pourtour méditerranéen. Un dimensionnement par simulation dynamique (logiciel Polysun, TRNSYS ou équivalent) est indispensable avant d'engager l'investissement.",
      },
      {
        question: 'Faut-il un entretien particulier sur un SSC?',
        answer:
          "Oui. Contrôle annuel de la pression du circuit primaire et de l'état du fluide caloporteur (glycol propylène), vérification des sondes de régulation et de l'anode du ballon tampon. Tous les 5 à 7 ans, vidange et remplacement du fluide caloporteur. Budget entretien annuel typique : 150 à 250\u202f€.",
      },
    ],
  },

  'BAR-TH-159': {
    code: 'BAR-TH-159',
    h1: 'Prime CEE BAR-TH-159 : pompe à chaleur hybride individuelle en 2026',
    lede: "PAC hybride individuelle (PAC air/eau coupl\u00e9e \u00e0 une chaudi\u00e8re gaz condensation) : ETAS \u2265 111\u202f% (r\u00e8glement UE 813/2013), taux de couverture PAC \u2265 70\u202f%, classe de r\u00e9gulateur IV \u00e0 VIII, prime CEE BAR-TH-159, exclusion MaPrimeR\u00e9nov'.",
    metaTitle: 'Guide BAR-TH-159 : PAC hybride ETAS 111\u202f% taux 70\u202f% 2026',
    metaDescription:
      "BAR-TH-159 (arr\u00eat\u00e9 20/07/2022, v. A50-4 applicable 01/04/2023) : PAC hybride ETAS \u2265 111\u202f%, taux couverture PAC \u2265 70\u202f%, classe r\u00e9gulateur IV-VIII, exclusion MaPrimeR\u00e9nov' depuis 2023.",
    primeClassique:
      'forfait CEE 6\u1d49 p\u00e9riode, variable selon zone climatique et surface \u2014 simulation aupr\u00e8s du signataire de la charte',
    primePrecarite:
      'bonification pr\u00e9carit\u00e9 Coup de pouce Chauffage, variable selon signataire \u2014 simulation personnalis\u00e9e',
    maPrimeRenov:
      'non éligible depuis le 1er janvier 2023 (décret n° 2022-1649, exclusion des chaudières gaz)',
    rgeRequises: [
      'RGE mention \u00ab Installation de pompe \u00e0 chaleur \u00bb (typiquement QualiPAC module air/eau)',
    ],
    requiredQualifications: ['qualipac'],
    sections: [
      {
        heading: 'Ce que couvre exactement la fiche BAR-TH-159',
        paragraphs: [
          "La fiche d'op\u00e9ration standardis\u00e9e BAR-TH-159, cr\u00e9\u00e9e par l'arr\u00eat\u00e9 du 22 d\u00e9cembre 2014 et modifi\u00e9e en dernier lieu par l'arr\u00eat\u00e9 du 20 juillet 2022 (JORFTEXT000046138797), encadre l'installation d'une pompe \u00e0 chaleur hybride individuelle dans un logement r\u00e9sidentiel existant (maison individuelle ou logement collectif, de plus de 2 ans \u00e0 la date d'engagement de l'op\u00e9ration). La version en vigueur est v. A50-4, applicable aux op\u00e9rations engag\u00e9es depuis le 1\u1d49\u02b3 avril 2023. Le syst\u00e8me hybride combine une pompe \u00e0 chaleur air/eau et un dispositif d'appoint (chaudi\u00e8re gaz \u00e0 condensation), pilot\u00e9s par un r\u00e9gulateur unique qui bascule automatiquement entre les deux \u00e9nergies selon la temp\u00e9rature ext\u00e9rieure et la demande.",
          "La logique de r\u00e9gulation est la suivante : tant que la PAC fonctionne avec un COP favorable, elle assure la totalit\u00e9 du chauffage. En dessous de la temp\u00e9rature de bascule (souvent entre -5 et 0\u202f\u00b0C selon le r\u00e9glage), le r\u00e9gulateur arr\u00eate la PAC et relaie vers la chaudi\u00e8re d'appoint. BAR-TH-159 est strictement distincte de BAR-TH-171 (PAC air/eau seule) : les deux fiches ne se cumulent jamais sur le m\u00eame chantier. \u00c0 noter que l'ancienne BAR-TH-106 (chaudi\u00e8re gaz/fioul seule) a \u00e9t\u00e9 abrog\u00e9e au 01/01/2024 \u2014 une chaudi\u00e8re gaz seule n'est donc plus \u00e9ligible aux CEE en r\u00e9sidentiel existant.",
        ],
      },
      {
        heading: 'Crit\u00e8res techniques r\u00e9glementaires (v. A50-4)',
        paragraphs: [
          "La fiche BAR-TH-159 impose quatre crit\u00e8res cumulatifs, tous exig\u00e9s pour qu'un dossier soit \u00e9ligible au d\u00e9p\u00f4t CEE : (1) l'efficacit\u00e9 \u00e9nerg\u00e9tique saisonni\u00e8re pour le chauffage (ETAS) du syst\u00e8me PAC + dispositif d'appoint hors r\u00e9gulation doit \u00eatre sup\u00e9rieure ou \u00e9gale \u00e0 111\u202f%, d\u00e9termin\u00e9e selon le r\u00e8glement (UE) 813/2013\u202f; (2) le taux de couverture de la pompe \u00e0 chaleur, d\u00e9fini comme le rapport entre l'\u00e9nergie fournie par la PAC (hors appoint) et les besoins annuels de chauffage du logement, doit \u00eatre sup\u00e9rieur ou \u00e9gal \u00e0 70\u202f%\u202f; (3) le syst\u00e8me doit \u00eatre \u00e9quip\u00e9 d'un r\u00e9gulateur de classe IV, V, VI, VII ou VIII au sens du \u00a76.1 de la communication 2014/C 207/02 de la Commission europ\u00e9enne\u202f; (4) une note de dimensionnement du g\u00e9n\u00e9rateur, comparant la puissance nominale de la PAC aux d\u00e9perditions du b\u00e2timent \u00e0 la temp\u00e9rature de base r\u00e9glementaire de la zone, doit \u00eatre remise au b\u00e9n\u00e9ficiaire et conserv\u00e9e au dossier.",
          "Ces quatre exigences sont cumulatives : le non-respect de l'une d'entre elles entra\u00eene le rejet du dossier en contr\u00f4le a posteriori. Le taux de couverture 70\u202f% en particulier est v\u00e9rifi\u00e9 par les organismes de contr\u00f4le via l'analyse du profil de charge du logement et des courbes de bascule du r\u00e9gulateur \u2014 un syst\u00e8me mal r\u00e9gl\u00e9 dans lequel la chaudi\u00e8re gaz reprend la main d\u00e8s 5\u202f\u00b0C ext\u00e9rieur ne respectera pas ce seuil et expose l'installation \u00e0 un rappel de prime. La note de dimensionnement est devenue en 2024-2025 le premier motif de non-conformit\u00e9 constat\u00e9 sur les dossiers BAR-TH-159 en contr\u00f4le PNCEE.",
        ],
      },
      {
        heading: 'Positionnement historique de la PAC hybride',
        paragraphs: [
          "La PAC hybride a connu un essor marqué entre 2018 et 2022, portée par MaPrimeRénov' et par le Coup de pouce Chauffage dans une logique de sortie progressive du fioul. Elle permettait à l'époque de conserver une chaudière gaz existante récente tout en réduisant fortement la facture énergétique, et cumulait les aides CEE + MaPrimeRénov' hybride.",
          "Le décret n° 2022-1649 du 23 décembre 2022, qui a exclu toutes les chaudières à énergie fossile du dispositif MaPrimeRénov' à compter du 1er janvier 2023, a directement frappé la PAC hybride : même couplée à une PAC, dès lors qu'elle comporte une chaudière gaz, elle n'est plus éligible MaPrimeRénov' résidentielle. Conséquence : le volume d'installations hybrides s'est effondré en 2023-2024, au profit des solutions PAC seules (BAR-TH-171, qui a remplacé l'ancienne BAR-TH-104 au 01/01/2024) ou biomasse (BAR-TH-113) qui restent pleinement aidées.",
        ],
      },
      {
        heading: 'Montant indicatif de la prime CEE BAR-TH-159',
        paragraphs: [
          "Le forfait en kWh cumac est défini par l'annexe de la fiche BAR-TH-159 (arrêté 20/07/2022) et varie selon la zone climatique (H1/H2/H3) et la surface chauffée. La conversion en euros dépend du cours hebdomadaire du kWh cumac et du barème propre à chaque signataire de la charte Coup de pouce Chauffage : il faut donc demander une simulation personnalisée au mandataire ou au délégataire, aucun montant plancher n'est imposé par la DGEC depuis 2022.",
          "Les ménages modestes et très modestes bénéficient d'une bonification au titre du Coup de pouce Chauffage, également fixée librement par le signataire de la charte. Sans MaPrimeRénov', le montant total d'aides mobilisables reste inférieur à celui d'une PAC seule (BAR-TH-171 + MaPrimeRénov'), ce qui rend l'opération économiquement moins attractive qu'elle ne l'était en 2021-2022. La TVA 5,5\u202f% reste applicable sur la partie PAC de l'installation.",
        ],
      },
      {
        heading: 'Qualification RGE exigée',
        paragraphs: [
          "La fiche BAR-TH-159 exige une qualification RGE active à la date d'acceptation du devis, sous la mention DGEC « Installation de pompe à chaleur » (typiquement QualiPAC module air/eau de Qualit'EnR). Le référentiel de la fiche impose que le signataire de l'attestation sur l'honneur soit le même que l'entreprise titulaire de la qualification RGE couvrant la pose de la PAC.",
          "En pratique, la grande majorité des installateurs de PAC hybrides sont titulaires de QualiPAC et proposent la solution en remplacement d'une chaudière gaz vieillissante. Vérifiez toujours la mention explicite sur l'attestation RGE et assurez-vous qu'elle couvre bien la pose de systèmes hybrides : certains installateurs « PAC pure » ne maîtrisent pas le réglage de la régulation de bascule, ce qui dégrade rapidement la performance réelle et constitue un motif de non-conformité en contrôle PNCEE.",
        ],
      },
      {
        heading: "Quand l'hybride garde du sens en 2026",
        paragraphs: [
          "La PAC hybride reste techniquement pertinente dans un cas précis : un logement mal isolé avec des émetteurs haute température existants (radiateurs fonte), où une PAC air/eau seule aurait un COP dégradé et ne pourrait pas assurer le confort par grand froid. L'appoint gaz permet alors de ne pas remplacer tous les radiateurs tout en réduisant la consommation annuelle de 40 à 60\u202f% par rapport à la chaudière gaz seule.",
          "Dans une logique de rénovation performante, l'hybride reste cependant une transition et non une cible. La stratégie publique 2026 oriente vers le découplage complet des énergies fossiles : plutôt que d'investir dans un système hybride, il est souvent plus pertinent d'envisager un bouquet « isolation + PAC air/eau haute performance » (fiche BAR-TH-171), voire une rénovation d'ampleur éligible à la fiche BAR-TH-174 (rénovation globale maison individuelle, avec accompagnement obligatoire par un opérateur Mon Accompagnateur Rénov' agréé par l'Anah), qui ouvre des bonifications CEE supérieures.",
        ],
      },
      {
        heading: "Pièges classiques de l'hybride",
        paragraphs: [
          "Trois pièges fréquents : (1) la complexité du système, qui double le nombre de composants (PAC + chaudière + régulateur de bascule + vases d'expansion + vannes 3 voies) et multiplie les points de panne ; (2) le coût initial élevé, typiquement 12\u202f000 à 18\u202f000\u202f€ TTC hors aides, contre 10\u202f000 à 14\u202f000\u202f€ pour une PAC seule bien dimensionnée ; (3) la maintenance double, car il faut un entretien annuel PAC (contrôle fluide frigorigène) ET un entretien annuel chaudière gaz (combustion, échangeur), soit un budget entretien typique de 250 à 400\u202f€/an.",
          "Quatrième point : le réglage de la température de bascule. Mal paramétrée, la chaudière gaz prend le relais trop tôt et la PAC ne fonctionne presque jamais, ce qui annule complètement l'intérêt du dispositif. Exigez un rapport de mise en service avec les seuils de bascule documentés, et un accès au monitoring de la régulation pour vérifier dans le temps le ratio PAC/chaudière effectivement constaté.",
        ],
      },
    ],
    faq: [
      {
        question: "Pourquoi MaPrimeRénov' ne finance plus les PAC hybrides?",
        answer:
          "Depuis le 1er janvier 2023, le décret n° 2022-1649 du 23 décembre 2022 a exclu toutes les énergies fossiles de MaPrimeRénov', y compris les systèmes hybrides comportant une chaudière gaz. Seule la prime CEE BAR-TH-159 et la TVA 5,5\u202f% (sur la partie PAC) restent mobilisables. C'est une baisse importante des aides disponibles par rapport à la période 2021-2022.",
      },
      {
        question: 'La PAC hybride est-elle encore intéressante en 2026?',
        answer:
          "Cas d'usage restreint : logement mal isolé avec radiateurs haute température existants, où la PAC seule ne peut pas assurer le confort sans remplacer tous les émetteurs. Dans la majorité des cas, une PAC air/eau haute performance seule (BAR-TH-171) associée à des travaux d'isolation offre un meilleur retour économique grâce au cumul CEE + MaPrimeRénov'.",
      },
      {
        question: 'Quelle différence avec BAR-TH-171 (PAC seule)?',
        answer:
          "BAR-TH-171 couvre une PAC air/eau haute performance (ETAS \u2265 126\u202f% en basse temp\u00e9rature ou \u2265 111\u202f% en moyenne/haute temp\u00e9rature, r\u00e8glement UE 813/2013) install\u00e9e seule, sans chaudi\u00e8re gaz. Elle est \u00e9ligible \u00e0 MaPrimeR\u00e9nov' et au Coup de pouce Chauffage, avec un montant total d'aides nettement sup\u00e9rieur \u00e0 BAR-TH-159. Depuis l'abrogation de l'ancienne BAR-TH-104 au 01/01/2024, BAR-TH-171 est la seule fiche CEE mobilisable pour une PAC air/eau seule. BAR-TH-171 et BAR-TH-159 ne se cumulent jamais sur le m\u00eame logement.",
      },
      {
        question: 'Quelle alternative plus performante en rénovation?',
        answer:
          "Deux alternatives recommandées : (1) BAR-TH-171 — PAC air/eau haute performance seule, associée à des travaux d'isolation (combles BAR-EN-101, murs BAR-EN-102) ; (2) BAR-TH-174 — rénovation d'ampleur d'une maison individuelle encadrée par Mon Accompagnateur Rénov', prolongée par arrêté du 7 janvier 2026, qui vise au moins 2 sauts de classe DPE. Les montants précis dépendent du signataire de la charte et du profil du ménage — consulter le simulateur officiel du signataire.",
      },
    ],
  },

  // BAR-TH-164 (rénovation globale d'une maison individuelle) — ABROGÉE par arrêté du 19 décembre 2023 (JORFTEXT000048680133), remplacée par BAR-TH-174 (rénovation d'ampleur maison individuelle).
  // Dépubliée 2026-04-09. URLs legacy redirigées en 301 permanent dans next.config.js.

  'BAR-TH-171': {
    code: 'BAR-TH-171',
    h1: 'Prime CEE BAR-TH-171 : pompe \u00e0 chaleur air/eau haute performance en 2026',
    lede: "Unique fiche CEE pour la PAC air/eau depuis l'abrogation de BAR-TH-104 au 01/01/2024 : ETAS \u2265 126\u202f% (basse temp\u00e9rature, sortie 35\u202f\u00b0C) ou \u2265 111\u202f% (moyenne/haute temp\u00e9rature, sortie 55\u202f\u00b0C) selon le r\u00e8glement (UE) 813/2013, r\u00e9gulateur de classe IV \u00e0 VIII, bonification \u00d75 sur le volume CEE (01/10/2025 \u2192 31/12/2030) au titre de l'arr\u00eat\u00e9 modificatif du 15 d\u00e9cembre 2025.",
    metaTitle: 'BAR-TH-171 2026 : PAC air/eau ETAS \u2265 126/111\u202f% bonifi\u00e9e \u00d75',
    metaDescription:
      "BAR-TH-171 vA78.4 (arr\u00eat\u00e9 15/12/2025) : ETAS \u2265 126\u202f% (BT) ou \u2265 111\u202f% (MT/HT), r\u00e8glement UE 813/2013, bonification \u00d75 du 01/10/2025 au 31/12/2030, fiche applicable jusqu'au 30/06/2028.",
    primeClassique:
      "forfait CEE bonifi\u00e9 \u00d75 (01/10/2025 \u2192 31/12/2030), variable selon zone climatique, surface et cours kWh cumac de l'obligé \u2014 simulation aupr\u00e8s du signataire",
    primePrecarite:
      'bonification Coup de pouce Chauffage sur forfait \u00d75, variable selon signataire \u2014 simulation personnalis\u00e9e',
    maPrimeRenov:
      "jusqu'\u00e0 5\u202f000\u202f\u20ac (m\u00e9nage tr\u00e8s modeste, au 1er janvier 2026)",
    rgeRequises: [
      'RGE mention \u00ab\u202fInstallation de pompe \u00e0 chaleur\u202f\u00bb (typiquement QualiPAC module air/eau)',
    ],
    requiredQualifications: ['qualipac'],
    sections: [
      {
        heading: 'Ce que couvre exactement la fiche BAR-TH-171',
        paragraphs: [
          "La fiche d'op\u00e9ration standardis\u00e9e BAR-TH-171, publi\u00e9e par la DGEC dans l'arr\u00eat\u00e9 du 22 d\u00e9cembre 2014 modifi\u00e9, encadre l'installation d'une pompe \u00e0 chaleur air/eau dite \u00ab\u202fhaute performance \u00e9nerg\u00e9tique\u202f\u00bb dans une maison individuelle ou un logement collectif existant. Depuis le 1\u1d49\u02b3 janvier 2024, elle est la seule fiche CEE mobilisable pour une PAC air/eau : l'ancienne BAR-TH-104, qui acceptait des mod\u00e8les \u00e0 SCOP \u2265 3,4, a \u00e9t\u00e9 abrog\u00e9e par la DGEC dans l'arr\u00eat\u00e9 modificatif de fin 2023.",
          "Pour \u00eatre \u00e9ligible BAR-TH-171 dans sa r\u00e9daction vA78.4 applicable depuis le 1\u1d49\u02b3 janvier 2026, la PAC doit respecter une efficacit\u00e9 \u00e9nerg\u00e9tique saisonni\u00e8re pour le chauffage (ETAS) conforme au r\u00e8glement (UE) 813/2013, d\u00e9termin\u00e9e selon l'application install\u00e9e : ETAS \u2265 126\u202f% pour une application basse temp\u00e9rature (\u00e9metteurs d\u00e9livrant \u00e0 35\u202f\u00b0C, typiquement plancher/plafond/mur chauffant) ou ETAS \u2265 111\u202f% pour une application moyenne ou haute temp\u00e9rature (radiateurs basse temp\u00e9rature \u00e0 45-55\u202f\u00b0C). La PAC doit \u00e9galement \u00eatre \u00e9quip\u00e9e d'un r\u00e9gulateur de classe IV, V, VI, VII ou VIII au sens du \u00a76.1 de la communication 2014/C 207/02 de la Commission europ\u00e9enne. Le calcul de l'ETAS int\u00e8gre les mesures de performance r\u00e9alis\u00e9es selon NF EN 14825 mais la valeur r\u00e9glementaire de r\u00e9f\u00e9rence est bien l'ETAS exprim\u00e9 en pourcentage, pas le SCOP instantan\u00e9. Les mod\u00e8les dont l'ETAS est inf\u00e9rieur aux seuils pr\u00e9cit\u00e9s ne sont plus \u00e9ligibles \u00e0 aucune prime CEE r\u00e9sidentielle en PAC air/eau.",
        ],
      },
      {
        heading: 'Arr\u00eat\u00e9 modificatif du 15 d\u00e9cembre 2025 et bonification \u00d75',
        paragraphs: [
          "L'arr\u00eat\u00e9 modificatif du 15 d\u00e9cembre 2025 (JORFTEXT000053043176), entr\u00e9 en vigueur au 1\u1d49\u02b3 janvier 2026, s'inscrit dans la 6\u1d49 p\u00e9riode CEE (arr\u00eat\u00e9 du 21 d\u00e9cembre 2025 et d\u00e9cret n\u00b0 2025-1048). Il consolide le r\u00e9gime BAR-TH-171 pour la p\u00e9riode 2026-2030 et reconduit la fiche dans sa r\u00e9daction applicable \u00e0 la 6\u1d49 p\u00e9riode, avec une validit\u00e9 r\u00e9glementaire jusqu'au 30 juin 2028 (reconduction \u00e9ventuelle \u00e0 confirmer par arr\u00eat\u00e9 ult\u00e9rieur).",
          "Mesure majeure pour les m\u00e9nages et les mandataires CEE : une bonification de coefficient multiplicateur \u00d75 sur le volume de certificats d\u00e9livr\u00e9s au titre de BAR-TH-171 est applicable du 1\u1d49\u02b3 octobre 2025 au 31 d\u00e9cembre 2030. Concr\u00e8tement, le forfait kWh cumac de la fiche est multipli\u00e9 par 5 dans le calcul du volume CEE g\u00e9n\u00e9r\u00e9 par l'op\u00e9ration, ce qui augmente sensiblement le montant en euros reconstitu\u00e9 par l'obligé ou le d\u00e9l\u00e9gataire \u2014 sans qu'aucun plancher en euros ne soit fix\u00e9 par la r\u00e9glementation depuis 2022. Le montant d\u00e9finitif d\u00e9pend de la zone climatique (H1, H2, H3), de la surface chauff\u00e9e et du cours hebdomadaire du kWh cumac du signataire \u00e0 la date de l'offre nominative.",
          "Cons\u00e9quence op\u00e9rationnelle : la BAR-TH-171 devient sur 2026-2030 la voie \u00e0 privil\u00e9gier syst\u00e9matiquement en r\u00e9novation ambitieuse, surtout lorsqu'une isolation pr\u00e9alable a \u00e9t\u00e9 r\u00e9alis\u00e9e. Sur un logement bien isol\u00e9, le dimensionnement d'une PAC haute performance est plus facile (besoins moindres, modulation en plage optimale) et le gain en facture \u00e9nerg\u00e9tique est maximal. Toute simulation chiffr\u00e9e doit \u00eatre demand\u00e9e directement au signataire de la charte CEE au moment de l'offre.",
        ],
      },
      {
        heading: "Ce qu'il faut vérifier avant de signer un devis BAR-TH-171",
        paragraphs: [
          "La v\u00e9rification cl\u00e9 porte sur l'ETAS r\u00e9el du mod\u00e8le propos\u00e9, pas sur la valeur marketing du catalogue. L'ETAS \u00e0 renseigner dans le dossier CEE est celui d\u00e9termin\u00e9 selon le r\u00e8glement (UE) 813/2013 (le calcul sous-jacent s'appuie sur NF EN 14825) pour l'application install\u00e9e : basse temp\u00e9rature (seuil 126\u202f%) pour un plancher chauffant, ou moyenne/haute temp\u00e9rature (seuil 111\u202f%) pour des radiateurs. Exigez la fiche technique compl\u00e8te du constructeur et, en cas de doute, demandez une attestation constructeur faisant figurer l'ETAS calcul\u00e9 pour l'application vis\u00e9e.",
          "C\u00f4t\u00e9 b\u00e2ti, la BAR-TH-171 prend tout son sens sur un logement dont les combles sont d\u00e9j\u00e0 isol\u00e9s (R \u2265 7) et id\u00e9alement les murs (isolation int\u00e9rieure ou ext\u00e9rieure en cours ou pass\u00e9e). Sur une passoire thermique, installer une PAC haute performance sans traiter l'enveloppe est une erreur classique : la PAC fonctionne alors en permanence \u00e0 puissance maximale, l'ETAS r\u00e9el s'effondre et la facture reste \u00e9lev\u00e9e. L'ordre logique reste : isolation d'abord, PAC haute performance ensuite.",
        ],
      },
      {
        heading: "Cumul MaPrimeR\u00e9nov', Coup de pouce et TVA 5,5\u202f%",
        paragraphs: [
          "La BAR-TH-171 est cumulable sans plafond avec MaPrimeR\u00e9nov' r\u00e9sidentielle (jusqu'\u00e0 5\u202f000\u202f\u20ac pour un m\u00e9nage tr\u00e8s modeste rempla\u00e7ant une chaudi\u00e8re fossile, au 1\u1d49\u02b3 janvier 2026) et avec le Coup de pouce Chauffage pour la sortie des \u00e9nergies fossiles. Le montant du Coup de pouce est fix\u00e9 par les chartes sign\u00e9es entre les obligés et le m\u00e9nage \u2014 aucun plancher r\u00e9glementaire en euros n'est impos\u00e9, la simulation doit \u00eatre demand\u00e9e directement au signataire de la charte. La BAR-TH-171 ouvre \u00e9galement droit \u00e0 l'\u00e9co\u2011PTZ.",
          "La TVA \u00e0 taux r\u00e9duit de 5,5\u202f% s'applique automatiquement \u00e0 la fourniture et \u00e0 la pose (article 278-0 bis A du CGI) d\u00e8s lors que l'ETAS conforme (\u2265 126\u202f% en basse temp\u00e9rature ou \u2265 111\u202f% en moyenne/haute temp\u00e9rature) est attest\u00e9 sur le devis et la facture. L'artisan doit faire figurer explicitement la r\u00e9f\u00e9rence BAR-TH-171 et la valeur ETAS du mod\u00e8le pour l'application install\u00e9e sur ses documents commerciaux, sans quoi l'obligé CEE refusera le dossier m\u00eame si le mod\u00e8le install\u00e9 est techniquement \u00e9ligible.",
        ],
      },
    ],
    faq: [
      {
        question: 'BAR-TH-171 remplace-t-elle d\u00e9finitivement BAR-TH-104?',
        answer:
          "Oui. L'ancienne BAR-TH-104 a \u00e9t\u00e9 abrog\u00e9e par la DGEC au 1\u1d49\u02b3 janvier 2024. BAR-TH-171 est depuis cette date la seule fiche CEE mobilisable pour une PAC air/eau en r\u00e9sidentiel. Elle exige un ETAS (efficacit\u00e9 \u00e9nerg\u00e9tique saisonni\u00e8re pour le chauffage, r\u00e8glement UE 813/2013) \u2265 126\u202f% en application basse temp\u00e9rature ou \u2265 111\u202f% en moyenne/haute temp\u00e9rature, avec un r\u00e9gulateur de classe IV \u00e0 VIII \u2014 r\u00e9gime plus exigeant que l'ancienne BAR-TH-104 qui s'appuyait sur un SCOP \u2265 3,4. L'arr\u00eat\u00e9 modificatif du 15 d\u00e9cembre 2025 (JORFTEXT000053043176) a par ailleurs introduit une bonification \u00d75 du volume CEE d\u00e9livr\u00e9 au titre de BAR-TH-171, applicable du 1\u1d49\u02b3 octobre 2025 au 31 d\u00e9cembre 2030. Les mod\u00e8les ne respectant pas les seuils ETAS ne sont plus \u00e9ligibles \u00e0 aucune prime CEE r\u00e9sidentielle en PAC air/eau.",
      },
      {
        question: "Jusqu'\u00e0 quelle date la fiche BAR-TH-171 est-elle en vigueur?",
        answer:
          "Dans sa r\u00e9daction issue de l'arr\u00eat\u00e9 modificatif du 15 d\u00e9cembre 2025, la fiche BAR-TH-171 est applicable jusqu'au 30 juin 2028. Une reconduction ou une \u00e9volution des crit\u00e8res techniques est \u00e0 attendre par arr\u00eat\u00e9 ult\u00e9rieur avant cette date \u2014 il convient de v\u00e9rifier la derni\u00e8re version publi\u00e9e sur L\u00e9gifrance au moment de la signature du devis. La bonification \u00d75 du volume CEE court, elle, du 1\u1d49\u02b3 octobre 2025 au 31 d\u00e9cembre 2030, ind\u00e9pendamment de la validit\u00e9 de la fiche.",
      },
      {
        question: 'Quelles qualifications RGE pour BAR-TH-171?',
        answer:
          "La qualification requise est la mention RGE \u00ab Installation de pompe \u00e0 chaleur \u00bb. En pratique, la qualification de r\u00e9f\u00e9rence est QualiPAC module air/eau d\u00e9livr\u00e9e par Qualit'EnR. La qualification doit \u00eatre active et porter explicitement la mention RGE \u00e0 la date d'acceptation du devis par le m\u00e9nage, sans quoi l'obligé CEE refusera le dossier quelle que soit la qualit\u00e9 technique de l'installation.",
      },
      {
        question: "L'ETAS d\u00e9clar\u00e9 par le constructeur est-il suffisant?",
        answer:
          "Non, pas tel quel : l'ETAS \u00e0 renseigner dans le dossier CEE est l'ETAS d\u00e9termin\u00e9 selon le r\u00e8glement (UE) 813/2013 pour l'application effectivement install\u00e9e (basse temp\u00e9rature 35\u202f\u00b0C, ou moyenne/haute temp\u00e9rature 55\u202f\u00b0C). Exigez la fiche technique compl\u00e8te du mod\u00e8le faisant figurer l'ETAS calcul\u00e9 dans l'application install\u00e9e et la classe de r\u00e9gulateur (IV \u00e0 VIII). La valeur marketing mise en avant dans les catalogues ne suffit pas \u2014 seule la valeur officielle pour l'application install\u00e9e fait foi au dossier CEE.",
      },
    ],
  },

  'BAR-TH-172': {
    code: 'BAR-TH-172',
    h1: 'Prime CEE BAR-TH-172 : pompe à chaleur géothermique en 2026',
    lede: "Fiche BAR-TH-172 : PAC eau/eau et sol/eau à captage horizontal ou sondes verticales. Conditions techniques, forfait CEE majoré, MaPrimeRénov' et QualiPAC module géothermie.",
    metaTitle: 'BAR-TH-172 : prime CEE PAC géothermique 2026',
    metaDescription:
      "BAR-TH-172 : prime CEE pompe à chaleur géothermique (eau/eau, sol/eau). Captage horizontal ou sondes verticales, MaPrimeRénov' et QualiPAC géothermie.",
    primeClassique: 'forfait CEE majoré (zone climatique et surface)',
    primePrecarite: 'bonification précarité Coup de pouce Chauffage',
    maPrimeRenov: "jusqu'à 5\u202f000\u202f€ (ménage très modeste) + Parcours Accompagné",
    rgeRequises: ['QualiPAC module Géothermie', 'Qualibat 5911 mention géothermie'],
    requiredQualifications: ['qualipac'],
    sections: [
      {
        heading: 'Ce que couvre exactement la fiche BAR-TH-172',
        paragraphs: [
          "La fiche BAR-TH-172 encadre l'installation d'une pompe à chaleur géothermique (eau/eau ou sol/eau) dans un logement résidentiel existant. Elle couvre les deux grandes familles de captage : horizontal enterré (boucles de polyéthylène posées à environ 60\u202fcm à 1\u202fm de profondeur, sur une emprise au sol équivalente à 1,5 à 2 fois la surface chauffée) et vertical (sondes géothermiques descendues à 80-120\u202fm de profondeur via forages).",
          "Le principe thermodynamique exploite la température quasi constante du sol et de la nappe phréatique toute l'année (≈ 10 à 14\u202f°C à quelques mètres de profondeur). Cette stabilité donne à la géothermie un SCOP réel plus élevé et surtout plus constant que l'aérothermie, avec des performances peu affectées par les vagues de froid hivernal — un avantage structurel sur les PAC air/eau qui perdent en efficacité à basse température extérieure.",
        ],
      },
      {
        heading: 'Le forfait CEE BAR-TH-172 et les cumuls mobilisables',
        paragraphs: [
          "Le forfait CEE de la BAR-TH-172 est élevé, à la mesure de la complexité de pose (terrassement ou forage) et de la performance atteinte. Il varie selon la zone climatique (H1, H2, H3) et la surface chauffée, et se traduit en euros via le cours hebdomadaire du kWh cumac de l'obligé. Les montants précis doivent être demandés au cas par cas dans l'offre de prime CEE nominative.",
          "La BAR-TH-172 est pleinement cumulable avec MaPrimeRénov' résidentielle classique, avec le Coup de pouce Chauffage pour la sortie des énergies fossiles, et avec le Parcours Accompagné MaPrimeRénov' (fiche BAR-TH-174, qui a remplacé l'ancienne BAR-TH-164 abrogée début 2024) pour les rénovations d'ampleur visant au moins 2 sauts de classe DPE. L'éco-PTZ et la TVA 5,5\u202f% s'appliquent également.",
        ],
      },
      {
        heading: 'Captage horizontal ou sondes verticales : arbitrer',
        paragraphs: [
          "Le captage horizontal est moins cher à mettre en œuvre (pas de forage), mais nécessite une surface de terrain disponible importante (1,5 à 2 fois la surface chauffée), non plantée d'arbres, et une étude de sol préalable pour confirmer la conductivité thermique. Il est généralement privilégié pour les maisons individuelles avec grand terrain en zone pavillonnaire.",
          "Les sondes verticales sont adaptées aux terrains exigus (emprise au sol réduite à quelques m²) mais impliquent des forages coûteux réalisés par une entreprise spécialisée, et un permis de forage déclaratif auprès du BRGM via le téléservice \u00ab\u202fDuplos\u202f\u00bb. L'ARS est également informée pour surveiller les interactions avec les nappes phréatiques. Cette solution est indispensable en milieu urbain ou périurbain dense.",
        ],
      },
      {
        heading: 'Investissement, ROI et points de vigilance',
        paragraphs: [
          'La géothermie reste une solution premium avec un investissement initial élevé : en ordre de grandeur, une installation complète (étude de sol, captage horizontal ou forage vertical, PAC, plancher chauffant basse température, mise en service) se situe typiquement dans une fourchette de 15\u202f000 à 25\u202f000\u202f€ TTC pour une maison individuelle, avec de fortes variations selon la nature du sol, la profondeur des forages et la puissance installée. Ces chiffres sont indicatifs et doivent être confirmés par un devis chiffré artisan.',
          "Le retour sur investissement (ROI) hors aides est long — typiquement 12 à 20 ans selon la facture énergétique évitée et le coût du kWh électrique — mais les aides publiques (CEE + MaPrimeRénov' + Coup de pouce) peuvent réduire significativement le temps de retour pour les ménages modestes. La géothermie est le choix de raison pour une maison individuelle bien isolée, équipée d'un émetteur basse température, sur un terrain suffisant et avec un horizon de détention long du logement.",
        ],
      },
    ],
    faq: [
      {
        question: 'Captage horizontal ou sondes verticales : lequel choisir?',
        answer:
          "Horizontal si vous disposez d'un terrain d'au moins 1,5 à 2 fois la surface chauffée, non planté d'arbres, avec un sol de conductivité correcte — c'est la solution la moins chère. Vertical si votre terrain est exigu ou en zone urbaine dense, ou si la nature du sol (rocheux, argileux gonflant) rend l'horizontal peu performant. Les sondes verticales coûtent plus cher à l'installation mais sont plus stables et universelles.",
      },
      {
        question: 'Quels permis et déclarations sont nécessaires?',
        answer:
          "Pour le captage horizontal, aucun permis spécifique en règle générale (travaux sur terrain privé), mais une étude de sol est indispensable. Pour les sondes verticales, une déclaration préalable au BRGM via le téléservice \u00ab\u202fDuplos\u202f\u00bb est obligatoire (décret n° 2015-15), et l'ARS surveille les installations de plus de 200\u202fm de profondeur ou en zone sensible pour l'alimentation en eau potable. L'entreprise de forage doit être agréée.",
      },
      {
        question: 'La géothermie est-elle adaptée à tous les logements?',
        answer:
          "Non. Elle est optimale sur une maison individuelle déjà isolée (combles R ≥ 7, murs traités) et équipée d'un émetteur basse température (plancher chauffant). Sur une passoire thermique ou avec des radiateurs haute température, la PAC géothermique fonctionnera à plein régime sans atteindre ses performances nominales, et le ROI devient défavorable. L'ordre rationnel reste : isoler d'abord, remplacer les émetteurs si besoin, passer à la géothermie ensuite.",
      },
    ],
  },

  'BAR-EN-108': {
    code: 'BAR-EN-108',
    h1: 'Prime CEE BAR-EN-108 : installer des volets isolants en 2026',
    lede: 'Fiche BAR-EN-108 : fermeture isolante (volets extérieurs) avec Delta R ≥ 0,22. Forfait CEE modeste, installateur qualifié et limites énergétiques réelles.',
    metaTitle: 'BAR-EN-108 : prime CEE volets isolants 2026',
    metaDescription:
      "BAR-EN-108 : prime CEE fermeture isolante (volets). Delta R ≥ 0,22, Uv ≤ 1,8, non-éligible MaPrimeRénov', gain énergétique réel limité.",
    primeClassique: 'forfait modeste (prime par fenêtre équipée)',
    primePrecarite: 'bonification précarité modérée',
    maPrimeRenov: 'non éligible (hors Parcours Accompagné en geste annexe)',
    rgeRequises: ['Installateur qualifié menuiserie (pas de RGE strict)'],
    requiredQualifications: [],
    sections: [
      {
        heading: 'Ce que couvre exactement la fiche BAR-EN-108',
        paragraphs: [
          "La fiche BAR-EN-108, publiée par la DGEC dans l'arrêté du 22 décembre 2014 modifié, couvre l'installation d'une fermeture isolante (volets roulants, volets battants, persiennes) en remplacement d'une fermeture existante ou en primo-installation sur une baie vitrée d'un logement résidentiel existant. Le terme \u00ab\u202ffermeture\u202f\u00bb englobe l'ensemble des dispositifs mobiles qui recouvrent une baie depuis l'extérieur.",
          'Les exigences techniques portent sur deux indicateurs : un coefficient de transmission thermique du volet Uv ≤ 1,8\u202fW/m²·K et un Delta R (gain de résistance thermique additionnelle apporté à la baie) ≥ 0,22\u202fm²·K/W. Ces valeurs doivent figurer explicitement sur la fiche technique du produit et la facture.',
        ],
      },
      {
        heading: 'Le montant de la prime CEE BAR-EN-108',
        paragraphs: [
          "La prime CEE BAR-EN-108 est modeste : le forfait en kWh cumac par m² de baie équipée est faible comparé aux opérations d'enveloppe principales (BAR-EN-101 combles, BAR-EN-102 murs). Elle reste néanmoins très demandée car le geste est simple, rapide à mettre en œuvre et le reste à charge faible sur un remplacement de volets déjà envisagé pour des raisons d'usage.",
          "⚠️ Contrairement à la majorité des opérations CEE enveloppe, BAR-EN-108 n'est PAS éligible à MaPrimeRénov' classique : les volets ne sont pas dans le périmètre des gestes MPR résidentiels, sauf lorsqu'ils sont intégrés comme geste annexe dans un dossier Parcours Accompagné. Le cumul se limite donc en pratique à la prime CEE seule et à la TVA 10\u202f% (le taux 5,5\u202f% ne s'applique pas non plus, les volets ne relevant pas de l'article 278-0 bis A CGI en tant qu'équipement d'économie d'énergie principal).",
        ],
      },
      {
        heading: 'Installateur qualifié : ce que dit réellement la fiche',
        paragraphs: [
          "La BAR-EN-108 n'impose pas de qualification RGE au sens strict (il n'existe pas de label RGE spécifique pour les volets). La fiche DGEC exige toutefois que l'installateur soit \u00ab\u202fqualifié\u202f\u00bb pour ce type de travaux. En pratique, les artisans qui posent régulièrement ces ouvrages disposent souvent d'une qualification Qualibat en menuiserie extérieure (par exemple 3591 ou équivalent) ou relèvent d'un métier fermetures/stores encadré par la profession.",
          "Pour le ménage, l'important est de vérifier que l'entreprise a une assurance décennale couvrant explicitement les fermetures et menuiseries extérieures, fournit une facture détaillée mentionnant les caractéristiques techniques Uv et Delta R, et propose un produit certifié (CEKAL, NF Fermetures, Certita CSTBat). L'absence de label RGE ne doit pas conduire à choisir un installateur sans références ni assurance à jour.",
        ],
      },
      {
        heading: 'Gain énergétique réel et hiérarchisation des travaux',
        paragraphs: [
          "Il faut être honnête sur le gain énergétique réel : l'installation de volets isolants représente en moyenne une économie de 2 à 5\u202f% de la consommation de chauffage d'un logement, essentiellement par réduction des déperditions nocturnes sur les baies vitrées. L'effet le plus sensible est en réalité le confort thermique d'été (réduction de la chaleur entrante en journée) plutôt que l'économie de chauffage hivernale.",
          "Pour un logement mal isolé, la priorité budgétaire doit rester l'enveloppe principale : isolation des combles (BAR-EN-101), isolation des murs (BAR-EN-102) et remplacement des fenêtres simple vitrage (BAR-EN-104). Les volets isolants viennent en complément utile après ces trois gestes, pas à leur place. Un artisan sérieux orientera le ménage dans cette hiérarchie plutôt que de pousser BAR-EN-108 en premier.",
        ],
      },
    ],
    faq: [
      {
        question: 'Les volets isolants valent-ils le coup?',
        answer:
          "En geste isolé sur un logement déjà bien isolé : oui, pour le confort d'été et un gain marginal hiver (2 à 5\u202f%). En premier geste sur une passoire thermique : non, le retour sur investissement énergétique est très faible et d'autres travaux (combles, murs, fenêtres) apportent un gain bien supérieur pour un reste à charge comparable ou plus avantageux grâce à MaPrimeRénov'.",
      },
      {
        question: "BAR-EN-108 est-elle cumulable avec MaPrimeRénov'?",
        answer:
          "Non en règle générale : les volets ne sont pas dans le périmètre de MaPrimeRénov' résidentielle classique. Seule exception notable : l'intégration comme geste annexe dans un dossier Parcours Accompagné MaPrimeRénov' (rénovation d'ampleur), où les volets peuvent être valorisés dans le bouquet global. La prime CEE BAR-EN-108 reste seule mobilisable dans le cas standard.",
      },
    ],
  },
}

/** Liste des codes d'opération ayant un guide éditorial long-format */
export const CEE_OPERATIONS_WITH_GUIDE: string[] = Object.keys(CEE_OPERATION_GUIDES)

/** Lookup safe — retourne null si pas de guide pour ce code (case-insensitive) */
export function getCeeOperationGuide(code: string): CeeGuideContent | null {
  return CEE_OPERATION_GUIDES[code.toUpperCase()] ?? null
}

/** True si le code possède un guide éditorial dédié (case-insensitive) */
export function hasCeeOperationGuide(code: string): boolean {
  return code.toUpperCase() in CEE_OPERATION_GUIDES
}
