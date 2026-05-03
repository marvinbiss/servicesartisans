import type { BlogArticle } from './articles'

/**
 * Batch isolation phonique — Action #3 Bloc 3 Ahrefs 2026-05-03.
 *
 * Cible KW : "isolation phonique mur mitoyen" (~800 vol/mois, KD 7, Hellio
 * pos #20-30) + variants "isolation phonique mur" (1.4K), "isolation acoustique
 * appartement" (2.1K), "isolation phonique cloison" (1.1K).
 *
 * Source plan : `docs/audit-ahrefs-2026-05-03/E_site/STRIKING_DISTANCE_PLAN.md`
 * (kw_attack_create_50.csv — 19 KW à créer).
 *
 * Article long-form 1 500+ mots, schema HowTo + FAQ, ton expert YMYL avec
 * réglementation NRA 2000 + jurisprudence Cass. Civ. 3, copropriété (loi
 * ELAN 2018), Articles 1240/1241 du Code civil (responsabilité voisinage).
 */

export const isolationPhoniqueArticles: Record<string, BlogArticle> = {
  'isolation-phonique-mur-mitoyen': {
    title: 'Isolation phonique mur mitoyen : guide complet 2026 (prix, méthodes, démarches)',
    excerpt:
      'Comment isoler phoniquement un mur mitoyen efficacement : techniques masse-ressort-masse, prix au m², démarches copropriété, aides financières et jurisprudence trouble anormal de voisinage. Guide expert 2026.',
    metaTitle: 'Isolation phonique mur mitoyen 2026 : prix et méthodes',
    metaDescription:
      'Isolation phonique mur mitoyen 2026 : technique masse-ressort-masse, Placophonique 80-150 €/m², démarches copro, recours trouble voisinage.',
    image: '🔇',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les normes acoustiques du bâti (NRA 2000, NF S 31-080) et consulte des artisans plâtriers RGE et acousticiens pour produire des guides conformes à la réglementation 2026.",
    date: '2026-05-03',
    updatedDate: '2026-05-03',
    readTime: '12 min',
    category: 'Conseils',
    tags: [
      'isolation',
      'phonique',
      'acoustique',
      'mur mitoyen',
      'voisinage',
      'copropriété',
      '2026',
    ],
    keyTakeaways: [
      "Le mur mitoyen est la 1ère source de bruit aérien en habitat collectif (jusqu'à 65 dB transmis)",
      "La technique masse-ressort-masse est la seule efficace : isolant 45-80 mm + lame d'air + plaque BA13 phonique",
      'Prix au m² : 80 à 150 € pose comprise (laine de roche + Placophonique)',
      "Réglementation NRA 2000 impose 53 dB d'affaiblissement entre logements (DnT,A ≥ 53 dB)",
      'Trouble anormal de voisinage : seuil émergence 5 dB(A) jour, 3 dB(A) nuit (Code santé publique)',
      "Pas d'aide MaPrimeRénov' (l'isolation phonique seule n'est pas éligible) mais éligible Éco-PTZ travaux performance",
      'En copropriété : autorisation AG si modification de structure, simple information sinon',
    ],
    content: [
      `## Pourquoi le mur mitoyen est-il la 1ère source de bruit en habitat collectif

Le mur mitoyen (séparant deux logements en mitoyenneté ou deux appartements) transmet le bruit aérien (voix, télé, musique) et parfois le bruit d'impact (chocs, percussions). En immeuble collectif d'avant 1996, les murs séparatifs sont souvent en simple cloison de briques creuses ou parpaing brut (15-20 cm) sans aucune isolation acoustique : leur indice d'affaiblissement Rw plafonne à 40-45 dB, alors que la réglementation NRA 2000 (Nouvelle Réglementation Acoustique) impose un DnT,A ≥ 53 dB entre deux logements depuis le 1er janvier 1996.

Concrètement, une conversation à voix normale (60 dB) dans le logement voisin sera perçue à 15-20 dB chez vous (chuchotement) avec un mur conforme NRA 2000, mais à 35-40 dB (conversation distincte) avec un mur ancien non isolé. La différence de confort acoustique est radicale — et c'est cette transmission qui ruine le sommeil et provoque les conflits de voisinage les plus fréquents.`,

      `## Le seul principe efficace : la technique masse-ressort-masse

Aucun isolant épais ne suffit à lui seul à bloquer le son : le bruit aérien contourne par les flancs (sols, plafonds, gaines) et traverse par résonance. La seule solution acoustiquement validée est la **technique masse-ressort-masse** (M-R-M) qui consiste à dissocier complètement deux parois lourdes par un absorbeur souple :

1. **Masse 1** = mur existant (briques, parpaing) — il reste tel quel
2. **Ressort** = laine minérale acoustique (laine de roche ou laine de verre haute densité 50-80 kg/m³) sur 45 à 100 mm d'épaisseur, posée entre rails métalliques M48 désolidarisés du mur
3. **Masse 2** = plaque de plâtre phonique (BA13 Placophonique, Placosilence ou Knauf Diamant) plus dense que le BA13 standard

Le système crée une cavité résonante qui absorbe les ondes sonores au lieu de les transmettre. L'épaisseur totale est de 70 à 130 mm, ce qui réduit de 3 à 5 cm la surface habitable par face traitée. L'affaiblissement gagné est de **+15 à +25 dB** sur le mur traité — passage de 40-45 dB Rw à 55-65 dB Rw.

Les variantes premium ajoutent une **deuxième couche de plaque phonique** (double Placophonique 25 mm) ou un **panneau de plomb de 2 mm** intercalé pour les très basses fréquences (home cinéma voisin, batterie). Coût supplémentaire 30-50 €/m².`,

      `## Prix moyens 2026 : entre 80 et 150 €/m² posé

Voici les fourchettes de prix observées en 2026, fournitures et pose comprises, pour traitement d'un mur mitoyen courant en région parisienne et grandes villes (le différentiel province / Paris est de -15 à -25 %) :

- **Doublage Placophonique standard** (rails M48 + laine de roche 45 mm + BA13 phonique) : 80 à 100 €/m². Affaiblissement gagné +15 à +18 dB. Suffit pour une conversation voisin gênante.
- **Doublage Placophonique renforcé** (laine de roche 70 mm + double BA13 25 mm) : 110 à 140 €/m². Affaiblissement gagné +20 à +23 dB. Recommandé pour télé/musique fréquente.
- **Contre-cloison maçonnée désolidarisée** (briquettes 50 mm + laine de roche 60 mm + BA13) : 130 à 180 €/m². Affaiblissement +22 à +27 dB. La meilleure performance, perte 12 à 15 cm de surface.
- **Système masse-ressort-masse premium** (plomb 2 mm + double laine + double BA13) : 180 à 250 €/m². Pour studio musique ou home cinéma voisin.

Pour un mur mitoyen courant de 12 à 18 m² (3 m de hauteur × 4-6 m de longueur), comptez un budget total de **1 200 à 2 500 €** pour un Placophonique standard, **1 800 à 4 000 €** pour la version renforcée. Travaux réalisés en 2 à 4 jours par un plâtrier qualifié (Qualibat 4131 cloisons sèches).`,

      `## Comparaison rapide des matériaux acoustiques

Trois familles de matériaux dominent. La **laine de roche acoustique** (Rockfon, Rockwool RockSono 70 kg/m³) est la référence : excellent rapport performance/prix, incombustible classe A1, résistance au feu. Indice d'absorption acoustique αw ≥ 0,90 pour les épaisseurs 50-80 mm.

La **laine de verre haute densité** (Isover ou Ursa Pure 40 SSP, 35 kg/m³) coûte 15-20 % moins cher et offre des performances similaires sur les fréquences moyennes-aiguës (parole, télé). Légèrement moins efficace que la laine de roche sur les basses fréquences (musique, home cinéma).

Les **panneaux composites** (Placo Phonique Duo, Knauf Soundboard, Siniat Acoustic) intègrent l'isolant et la plaque en un seul produit sandwich. Plus rapides à poser (1 jour vs 2 jours), légèrement moins performants (+12 à +15 dB), prix au m² 25-35 €. Solution intermédiaire pour rénovation rapide.

À éviter : les **peintures anti-bruit, mousses acoustiques décoratives, panneaux liège** vendus par Internet à 20 €/m². Leur efficacité réelle est de +1 à +3 dB en laboratoire et inexistante in situ. Aucune marque sérieuse ne les recommande pour un mur mitoyen.`,

      `## Démarches en copropriété : information ou autorisation AG

En copropriété, deux régimes s'appliquent selon la nature des travaux d'isolation phonique :

**Pas d'autorisation AG** si vous posez un doublage acoustique côté intérieur de votre logement, sans toucher à la structure du mur mitoyen ni aux gaines techniques communes. Le mur séparatif est un mur porteur partie commune, mais le doublage côté votre logement reste partie privative. Une simple information au syndic suffit (lettre RAR conseillée) avec descriptif des travaux et plan.

**Autorisation AG à la majorité absolue** (Article 25 loi 1965) si les travaux affectent les parties communes : ouverture pour passer une gaine de désolidarisation jusqu'au plafond/sol, modification de l'enduit côté palier, percement de la cloison séparative pour traiter le bruit en flanc. La demande doit être déposée 1 à 3 mois avant la prochaine AG avec devis et descriptif technique signé par un acousticien (300-800 € l'étude préalable).

Si vous êtes locataire, l'accord écrit du propriétaire est obligatoire (Article 7 e loi 1989). Précisez si la dépose des travaux à votre départ est exigible — généralement non si les travaux améliorent le bien.`,

      `## Trouble anormal de voisinage : recours juridique en cas d'échec amiable

La jurisprudence Cass. Civ. 3, depuis l'arrêt fondateur de 1986, reconnaît le droit à indemnisation du voisin victime d'un trouble anormal de voisinage (Articles 1240 et 1241 du Code civil — anciens 1382/1383). Le seuil d'anormalité est apprécié par le juge selon trois critères : intensité, durée et fréquence.

Le **Code de la santé publique** (Article R1334-31) fixe des seuils objectifs : émergence sonore de +5 dB(A) le jour (7h-22h) et +3 dB(A) la nuit (22h-7h) par rapport au bruit ambiant. Au-delà, le bruit est légalement constitutif d'une infraction (amende forfaitaire 68 € à 450 €) et permet une action civile en cessation + dommages-intérêts.

Étapes pratiques en cas de conflit :
1. **Médiation amiable** : conciliateur de justice (gratuit, contact via tribunal judiciaire) ou syndic en copropriété
2. **Constat d'huissier** : 250-450 € pour mesure acoustique objective avec sonomètre certifié, point de départ d'une action
3. **Action devant tribunal judiciaire** : sommation de cesser sous astreinte + dommages-intérêts (forfait 1 500 à 8 000 € selon ancienneté du trouble)

Beaucoup de voisins gênants acceptent finalement de réduire les nuisances ou de cofinancer l'isolation phonique au stade de la médiation, par crainte du contentieux.`,

      `## Aides financières 2026 : éligibilité limitée

Contrairement à l'isolation thermique, l'**isolation phonique seule n'est pas éligible à MaPrimeRénov'** ni aux primes CEE classiques (BAR-EN-101 à 108) — ces dispositifs financent uniquement les travaux qui réduisent la consommation énergétique (R thermique ≥ 3,7 m².K/W).

Trois leviers de financement restent ouverts :

- **Éco-PTZ Performance Énergétique Globale** (jusqu'à 30 000 €) si l'isolation phonique est réalisée dans le cadre d'un bouquet de travaux qui inclut au moins 2 actions thermiques (isolation murs + remplacement chauffage par exemple). La performance acoustique est alors un bénéfice collatéral financé indirectement.
- **TVA réduite à 10 %** sur les matériaux et la main-d'œuvre pour tous les travaux d'amélioration dans un logement de plus de 2 ans (vs 20 % en TVA standard).
- **Aides locales** : certaines villes (Paris dispositif MurMur, métropole de Lyon, Toulouse) financent 30-50 % des travaux d'isolation acoustique des façades exposées au bruit routier ou aérien (PEB aéroport). Le mur mitoyen intérieur n'est pas couvert sauf cas spécifique (logement social, copropriété en grande difficulté).

Pour une isolation phonique mur mitoyen pure, le financement reste donc largement à votre charge — d'où l'importance d'un devis comparatif (3 plâtriers Qualibat) et d'une stratégie d'action progressive (1 mur traité par an).`,

      `## Choisir le bon artisan : Qualibat 4131 + acousticien si projet complexe

Pour un doublage Placophonique standard, un plâtrier Qualibat 4131 (cloisons sèches) ou Qualibat 4311 (plâtrerie traditionnelle) est suffisant. Demandez à voir 2-3 chantiers récents équivalents et exigez un devis détaillé avec : épaisseur isolant, marque + densité, type de plaque BA13 phonique, traitement des points singuliers (prises électriques, plinthes, jonction sol/plafond).

Pour un projet complexe (home cinéma voisin, studio musique, traitement des flancs et plafond simultanément), faites appel à un **acousticien CICF** ou **CINOV-GIAc** pour une étude acoustique préalable (300-1 500 € selon ampleur). Il mesurera l'affaiblissement actuel au sonomètre, identifiera les ponts phoniques (gaines, prises, plinthes, jonctions) et dimensionnera la solution. Sans cette étude, vous risquez d'investir 3 000 € sans réduction perceptible si les flancs ne sont pas traités.

Évitez les "spécialistes anti-bruit" qui démarchent à domicile avec promesses miraculeuses (rouleaux phoniques 50 €/m² posés en 1 jour) : leur efficacité est marginale (+3 à +5 dB) et les aides RGE n'existent pas pour ces produits. Privilégiez toujours un artisan vérifié sur l'annuaire France Rénov' ou notre annuaire ServicesArtisans, avec assurance décennale couvrant les travaux d'isolation acoustique.`,
    ],
    faq: [
      {
        question: 'Quel matériau isolant choisir pour un mur mitoyen bruyant ?',
        answer:
          "La laine de roche acoustique (Rockfon, Rockwool RockSono 70 kg/m³) sur 45 à 80 mm d'épaisseur, posée entre rails M48 désolidarisés du mur, puis recouverte d'une plaque BA13 phonique (Placophonique, Placosilence). Cette technique masse-ressort-masse offre +15 à +23 dB d'affaiblissement (passage Rw 40 dB à 55-63 dB). Évitez les peintures anti-bruit et mousses décoratives, leur efficacité est marginale (+1 à +3 dB).",
      },
      {
        question: "Quel est le prix de l'isolation phonique d'un mur mitoyen au m² ?",
        answer:
          '80 à 100 €/m² pour un doublage Placophonique standard (laine de roche 45 mm + BA13 phonique), 110 à 140 €/m² pour version renforcée (laine 70 mm + double BA13), 130 à 180 €/m² pour une contre-cloison maçonnée désolidarisée. Pour un mur mitoyen courant de 12-18 m², budget total 1 200 à 4 000 € pose comprise par un plâtrier Qualibat 4131. Travaux réalisés en 2 à 4 jours.',
      },
      {
        question: "Faut-il l'accord de la copropriété pour isoler un mur mitoyen ?",
        answer:
          "Non si vous posez un doublage acoustique côté intérieur de votre logement sans toucher à la structure du mur ni aux gaines communes — une simple information au syndic suffit (lettre RAR conseillée). Oui à la majorité absolue Article 25 loi 1965 si les travaux affectent les parties communes (gaines, percement traversant, modification enduit palier). Demande déposée 1 à 3 mois avant l'AG avec descriptif technique signé par un acousticien.",
      },
      {
        question: "L'isolation phonique est-elle éligible à MaPrimeRénov' ou à la prime CEE ?",
        answer:
          "Non. MaPrimeRénov' et les primes CEE BAR-EN-101 à 108 financent uniquement les travaux qui réduisent la consommation énergétique (résistance thermique R ≥ 3,7 m².K/W). L'isolation phonique seule n'est pas éligible. Trois leviers restent ouverts : Éco-PTZ Performance Énergétique Globale jusqu'à 30 000 € si bouquet de travaux thermiques associé, TVA réduite à 10 %, aides locales spécifiques (Paris dispositif MurMur, métropole de Lyon).",
      },
      {
        question: 'Quels recours juridiques contre un voisin trop bruyant ?',
        answer:
          "Le Code de la santé publique (R1334-31) fixe le seuil de trouble anormal à +5 dB(A) le jour et +3 dB(A) la nuit par rapport au bruit ambiant. Étapes : médiation gratuite par conciliateur de justice ou syndic, constat d'huissier avec sonomètre certifié (250-450 €), action civile devant tribunal judiciaire pour sommation de cesser sous astreinte + dommages-intérêts (1 500 à 8 000 €). La jurisprudence Cass. Civ. 3 reconnaît depuis 1986 le droit à indemnisation sur le fondement Articles 1240/1241 Code civil.",
      },
      {
        question: "Quelle est l'efficacité réelle d'une isolation phonique mur mitoyen ?",
        answer:
          "Un mur mitoyen ancien non isolé plafonne à 40-45 dB Rw d'affaiblissement (conversation voisine perçue à 35-40 dB chez vous). Après traitement Placophonique standard, +15 à +18 dB gagnés (Rw 55-63 dB) → conversation perçue à 15-20 dB seulement (chuchotement). La réglementation NRA 2000 exige DnT,A ≥ 53 dB entre logements — vous serez donc au-dessus de la norme actuelle de l'habitat neuf après traitement. Les bruits d'impact (chocs, percussions) nécessitent en complément un traitement sol/plafond car ils contournent par flancs.",
      },
    ],
  },
}
