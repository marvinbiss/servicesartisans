/**
 * Contenu SEO riche pour chaque corps de metier.
 * Utilise sur les pages hub de services pour ajouter du contenu contextuel
 * (guide de prix, FAQ, conseils pratiques).
 */

export interface TradeContent {
  slug: string
  name: string
  priceRange: {
    min: number
    max: number
    unit: string
  }
  commonTasks: string[]
  tips: string[]
  faq: { q: string; a: string }[]
  emergencyInfo?: string
  certifications: string[]
  averageResponseTime: string
}

export const tradeContent: Record<string, TradeContent> = {
  plombier: {
    slug: 'plombier',
    name: 'Plombier',
    priceRange: {
      min: 60,
      max: 90,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Debouchage de canalisation : 80 a 250 \u20AC selon la complexite',
      'Remplacement d\'un chauffe-eau : 800 a 2 500 \u20AC (fourniture + pose)',
      'Reparation de fuite d\'eau : 90 a 300 \u20AC',
      'Installation d\'un WC : 200 a 600 \u20AC (hors fourniture)',
      'Pose d\'un robinet mitigeur : 80 a 200 \u20AC (hors fourniture)',
      'Remplacement d\'un ballon d\'eau chaude : 600 a 2 000 \u20AC',
    ],
    tips: [
      'Verifiez que le plombier dispose d\'une assurance responsabilite civile professionnelle et d\'une garantie decennale, obligatoires pour les travaux de plomberie.',
      'Demandez toujours un devis detaille avant le debut des travaux : un professionnel serieux ne commence jamais sans accord ecrit sur le prix.',
      'Privilegiez un plombier certifie RGE si vous envisagez des travaux lies au chauffage ou a l\'eau chaude, car cela vous ouvre droit aux aides de l\'Etat (MaPrimeRenov\', CEE).',
      'En cas d\'urgence, coupez l\'arrivee d\'eau generale avant l\'arrivee du plombier pour limiter les degats. Le compteur se trouve souvent dans la cave ou a l\'exterieur.',
      'Mefiez-vous des plombiers qui refusent de donner un devis par ecrit ou qui exigent un paiement integral avant intervention : ce sont des signaux d\'alerte.',
    ],
    faq: [
      {
        q: 'Combien coute une intervention de plombier en urgence ?',
        a: 'Une intervention d\'urgence coute en moyenne entre 150 et 400 \u20AC, avec des majorations possibles la nuit (+50 a 100 %), le week-end (+25 a 50 %) et les jours feries (+50 a 100 %). Exigez toujours un devis avant que le plombier ne commence les travaux, meme en urgence.',
      },
      {
        q: 'Comment savoir si mon plombier est fiable ?',
        a: 'Verifiez son numero SIRET sur le site de l\'INSEE, son inscription au registre des metiers, et demandez une copie de son assurance decennale. Un plombier serieux fournit ces documents sans difficulte. Consultez egalement les avis en ligne et demandez des references de chantiers recents.',
      },
      {
        q: 'Quels travaux de plomberie puis-je faire moi-meme ?',
        a: 'Vous pouvez changer un joint de robinet, remplacer un flexible de douche ou deboucher un siphon avec une ventouse. En revanche, toute intervention sur les canalisations encastrees, le chauffe-eau ou l\'arrivee d\'eau principale doit etre confiee a un professionnel pour des raisons de securite et d\'assurance.',
      },
      {
        q: 'Le plombier doit-il fournir une facture ?',
        a: 'Oui, c\'est obligatoire pour toute prestation superieure a 25 \u20AC. La facture doit mentionner le detail des travaux, le prix unitaire des pieces, le taux horaire de la main-d\'oeuvre et la TVA appliquee (10 % pour la renovation, 20 % pour le neuf). Conservez-la precieusement pour la garantie.',
      },
    ],
    emergencyInfo:
      'En cas de fuite d\'eau importante ou de canalisation bouchee, un plombier d\'urgence peut intervenir 24h/24 et 7j/7. Coupez immediatement l\'arrivee d\'eau au compteur general et contactez un professionnel. Les tarifs d\'urgence sont majores de 50 a 100 % par rapport a une intervention en journee.',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Qualibat',
      'PG (Professionnel du Gaz)',
      'QualiPAC (pour les pompes a chaleur)',
    ],
    averageResponseTime: 'Sous 2 heures en urgence, 24 a 48h pour un rendez-vous standard',
  },

  electricien: {
    slug: 'electricien',
    name: 'Electricien',
    priceRange: {
      min: 50,
      max: 80,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Mise aux normes d\'un tableau electrique : 800 a 2 500 \u20AC',
      'Installation d\'un point lumineux : 80 a 200 \u20AC',
      'Pose d\'une prise electrique supplementaire : 60 a 150 \u20AC',
      'Remplacement d\'un interrupteur differentiel : 150 a 350 \u20AC',
      'Installation d\'un interphone ou visiophone : 300 a 1 200 \u20AC',
      'Refection complete de l\'electricite d\'un appartement (60 m\u00B2) : 5 000 a 10 000 \u20AC',
    ],
    tips: [
      'Assurez-vous que l\'electricien respecte la norme NF C 15-100, obligatoire pour toute installation electrique en France. Demandez un certificat de conformite Consuel a la fin des travaux.',
      'Comparez au moins trois devis en verifiant que chacun detaille les fournitures, la main-d\'oeuvre et le cout des mises en conformite eventuelles.',
      'Choisissez un electricien certifie IRVE si vous souhaitez installer une borne de recharge pour vehicule electrique : c\'est obligatoire pour beneficier du credit d\'impot.',
      'Avant toute intervention, verifiez que l\'electricien possede une habilitation electrique valide (B1, B2 ou BR selon le type de travaux).',
      'Pour des travaux de renovation energetique (chauffage electrique performant, VMC), un electricien RGE est indispensable pour obtenir les aides financieres de l\'Etat.',
    ],
    faq: [
      {
        q: 'Ma maison est ancienne, faut-il refaire toute l\'electricite ?',
        a: 'Pas necessairement, mais un diagnostic electrique est fortement recommande pour les installations de plus de 15 ans. Un electricien qualifie evaluera la conformite a la norme NF C 15-100 et proposera les mises a niveau necessaires. Une renovation partielle (tableau, prises de terre, differentiels) coute entre 1 500 et 4 000 \u20AC selon la surface.',
      },
      {
        q: 'Combien coute l\'installation d\'une borne de recharge pour voiture electrique ?',
        a: 'L\'installation d\'une borne de recharge domestique (wallbox 7 kW) coute entre 1 200 et 2 500 \u20AC pose comprise. Un credit d\'impot de 300 \u20AC est disponible, a condition de faire appel a un electricien certifie IRVE. Le delai d\'installation est generalement de 1 a 3 jours.',
      },
      {
        q: 'Qu\'est-ce que le certificat Consuel et est-il obligatoire ?',
        a: 'Le Consuel (Comite National pour la Securite des Usagers de l\'Electricite) delivre une attestation de conformite electrique. Il est obligatoire pour toute nouvelle installation ou renovation complete avant la mise sous tension par Enedis. Le cout est d\'environ 120 a 180 \u20AC selon le type d\'installation.',
      },
    ],
    emergencyInfo:
      'En cas de panne electrique, de fils denuges ou d\'odeur de brule, coupez immediatement le disjoncteur general et appelez un electricien d\'urgence. Ne tentez jamais de reparer vous-meme un probleme electrique. Un electricien d\'astreinte peut intervenir sous 1 a 3 heures, avec une majoration de 50 a 100 % en dehors des heures ouvrees.',
    certifications: [
      'Qualifelec',
      'RGE (Reconnu Garant de l\'Environnement)',
      'IRVE (Infrastructure de Recharge pour Vehicules Electriques)',
      'Habilitation electrique (B1, B2, BR)',
      'Qualibat',
    ],
    averageResponseTime: 'Sous 3 heures en urgence, 24 a 72h pour un rendez-vous standard',
  },

  serrurier: {
    slug: 'serrurier',
    name: 'Serrurier',
    priceRange: {
      min: 80,
      max: 150,
      unit: '\u20AC/intervention',
    },
    commonTasks: [
      'Ouverture de porte claquee (sans effraction) : 80 a 150 \u20AC',
      'Ouverture de porte blindee : 150 a 400 \u20AC',
      'Changement de serrure standard : 100 a 300 \u20AC (fourniture incluse)',
      'Pose d\'une serrure multipoints : 300 a 800 \u20AC',
      'Blindage de porte existante : 800 a 2 000 \u20AC',
      'Installation d\'une porte blindee complete : 1 500 a 4 500 \u20AC',
    ],
    tips: [
      'En cas de porte claquee, ne paniquez pas : un serrurier qualifie peut ouvrir sans degradation dans la majorite des cas. Ne faites jamais appel a un depanneur trouve sur un prospectus dans votre boite aux lettres.',
      'Exigez un devis ferme et definitif avant toute intervention, y compris en urgence. La loi oblige le serrurier a vous remettre un devis ecrit pour toute prestation depassant 150 \u20AC.',
      'Mefiez-vous des serruriers qui annoncent des prix tres bas par telephone puis gonflent la facture une fois sur place. Verifiez les avis en ligne et le numero SIRET avant d\'appeler.',
      'Privilegiez les serruriers ayant une adresse physique verifiable (atelier ou magasin). C\'est un gage de serieux et de recours possible en cas de probleme.',
      'Apres un cambriolage, faites intervenir la police avant le serrurier. Vous aurez besoin du depot de plainte pour votre assurance, et il ne faut pas toucher a la scene.',
    ],
    faq: [
      {
        q: 'Combien coute une ouverture de porte le dimanche ou la nuit ?',
        a: 'Une ouverture de porte en horaires non ouvres (nuit, dimanche, jours feries) coute entre 150 et 350 \u20AC pour une porte standard, et entre 250 et 500 \u20AC pour une porte blindee. Les majorations de nuit (entre 20h et 6h) vont de 50 a 100 % du tarif de base. Demandez toujours le prix total avant que le serrurier n\'intervienne.',
      },
      {
        q: 'Quelle serrure choisir pour securiser mon logement ?',
        a: 'Pour une securite optimale, optez pour une serrure certifiee A2P (Assurance Prevention Protection). Il existe 3 niveaux : A2P* (resistance de 5 min a l\'effraction), A2P** (10 min) et A2P*** (15 min). Les assureurs exigent souvent un niveau A2P** minimum. Comptez 200 a 600 \u20AC pour la serrure et 100 a 200 \u20AC pour la pose.',
      },
      {
        q: 'Mon assurance prend-elle en charge les frais de serrurier ?',
        a: 'Oui, la plupart des contrats d\'assurance habitation couvrent les frais de serrurier en cas de cambriolage, de perte de cles ou de porte claquee, souvent dans le cadre de la garantie assistance. Verifiez votre contrat et contactez votre assureur avant l\'intervention si possible. Conservez la facture et le devis pour le remboursement.',
      },
      {
        q: 'Comment eviter les arnaques aux serruriers ?',
        a: 'Verifiez le SIRET de l\'entreprise, recherchez des avis en ligne et privilegiez le bouche-a-oreille. Refusez toute intervention sans devis prealable ecrit. Un serrurier honnete accepte toujours de detailler ses tarifs. En cas de doute, contactez la DGCCRF (Direction Generale de la Concurrence) au 0809 540 550.',
      },
    ],
    emergencyInfo:
      'En cas de porte claquee ou de serrure cassee, un serrurier d\'urgence intervient generalement sous 30 minutes a 1 heure en zone urbaine. Attention aux majorations : +50 % en soiree (apres 19h), +75 a 100 % la nuit (apres 22h), le dimanche et les jours feries. Exigez toujours un devis ecrit avant le debut de l\'intervention.',
    certifications: [
      'A2P Service (certification des serruriers par le CNPP)',
      'Qualibat',
      'Certification Qualisr (Qualification Serrurerie)',
    ],
    averageResponseTime: 'Sous 30 minutes en urgence en zone urbaine, 1 a 2h en zone rurale',
  },

  chauffagiste: {
    slug: 'chauffagiste',
    name: 'Chauffagiste',
    priceRange: {
      min: 60,
      max: 100,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Entretien annuel de chaudiere gaz : 100 a 200 \u20AC',
      'Remplacement d\'une chaudiere gaz a condensation : 3 000 a 7 000 \u20AC (fourniture + pose)',
      'Installation d\'une pompe a chaleur air-eau : 8 000 a 15 000 \u20AC',
      'Desembouage d\'un circuit de chauffage : 400 a 900 \u20AC',
      'Remplacement de radiateurs : 300 a 800 \u20AC par radiateur (fourniture + pose)',
      'Installation d\'un plancher chauffant : 50 a 100 \u20AC/m\u00B2',
    ],
    tips: [
      'L\'entretien annuel de votre chaudiere est obligatoire par la loi (decret du 9 juin 2009). Prevoyez-le a l\'automne, avant la saison de chauffe, pour eviter les pannes en plein hiver.',
      'Privilegiez un chauffagiste certifie RGE pour beneficier des aides financieres : MaPrimeRenov\' (jusqu\'a 5 000 \u20AC pour une pompe a chaleur), CEE, eco-pret a taux zero et TVA a 5,5 %.',
      'Comparez les performances energetiques (COP pour les pompes a chaleur, rendement pour les chaudieres) et pas seulement le prix d\'achat. Une chaudiere a condensation consomme 15 a 30 % de moins qu\'un modele classique.',
      'Demandez un bilan thermique complet avant l\'installation d\'un nouveau systeme de chauffage. Un bon chauffagiste dimensionne l\'installation en fonction de la surface, de l\'isolation et de la zone climatique.',
      'Souscrivez un contrat d\'entretien annuel : il coute entre 120 et 250 \u20AC par an et inclut generalement la visite obligatoire, le depannage prioritaire et les pieces d\'usure.',
    ],
    faq: [
      {
        q: 'Quand dois-je remplacer ma chaudiere ?',
        a: 'Une chaudiere a une duree de vie moyenne de 15 a 20 ans. Les signes qui doivent alerter : pannes frequentes, surconsommation de gaz, bruits inhabituels, eau pas assez chaude. Si votre chaudiere a plus de 15 ans, un remplacement par un modele a condensation vous fera economiser 20 a 30 % sur votre facture energetique.',
      },
      {
        q: 'Pompe a chaleur ou chaudiere gaz : que choisir ?',
        a: 'La pompe a chaleur air-eau est plus ecologique et beneficie de plus d\'aides (MaPrimeRenov\' jusqu\'a 5 000 \u20AC), mais son cout d\'installation est plus eleve (8 000 a 15 000 \u20AC contre 3 000 a 7 000 \u20AC pour une chaudiere gaz). Elle est ideale pour les maisons bien isolees. La chaudiere gaz a condensation reste pertinente en appartement ou si le reseau de gaz est deja installe.',
      },
      {
        q: 'Les aides de l\'Etat pour le chauffage sont-elles cumulables ?',
        a: 'Oui, sous conditions de revenus et avec un artisan RGE. Vous pouvez cumuler MaPrimeRenov\', les CEE (Certificats d\'Economies d\'Energie), l\'eco-pret a taux zero (jusqu\'a 50 000 \u20AC) et la TVA reduite a 5,5 %. Le montant total peut couvrir 50 a 90 % du cout des travaux pour les menages modestes.',
      },
      {
        q: 'Ma chaudiere est en panne en plein hiver, que faire ?',
        a: 'Verifiez d\'abord les elements simples : thermostat, pression du circuit (entre 1 et 1,5 bar), disjoncteur dedie. Si le probleme persiste, appelez un chauffagiste en urgence. La plupart interviennent sous 4 a 12 heures. Si vous avez un contrat d\'entretien, le depannage est souvent inclus ou prioritaire.',
      },
    ],
    emergencyInfo:
      'En cas de panne de chauffage en hiver ou de fuite de gaz, un chauffagiste d\'urgence peut intervenir sous 4 a 12 heures. En cas d\'odeur de gaz, ouvrez les fenetres, ne touchez pas aux interrupteurs electriques, quittez le logement et appelez immediatement le numero d\'urgence GRDF : 0 800 47 33 33 (gratuit, 24h/24).',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Qualibat',
      'PG (Professionnel du Gaz)',
      'QualiPAC (pompes a chaleur)',
      'Qualifioul (installations fioul)',
      'QualiSol (chauffe-eau solaire)',
    ],
    averageResponseTime: 'Sous 4 heures en urgence, 48 a 72h pour un rendez-vous standard',
  },

  'peintre-en-batiment': {
    slug: 'peintre-en-batiment',
    name: 'Peintre en batiment',
    priceRange: {
      min: 25,
      max: 45,
      unit: '\u20AC/m\u00B2',
    },
    commonTasks: [
      'Peinture d\'une piece (murs + plafond, 12 m\u00B2) : 400 a 800 \u20AC',
      'Ravalement de facade (enduit + peinture) : 40 a 100 \u20AC/m\u00B2',
      'Pose de papier peint : 15 a 35 \u20AC/m\u00B2 (hors fourniture)',
      'Laquage de boiseries et portes : 30 a 60 \u20AC/m\u00B2',
      'Traitement et peinture de volets : 50 a 120 \u20AC par volet',
      'Peinture de plafond seul : 18 a 35 \u20AC/m\u00B2',
    ],
    tips: [
      'Un bon peintre commence toujours par une preparation minutieuse des surfaces : lessivage, poncement, rebouchage des fissures et application d\'une sous-couche. Cette etape represente 60 % du travail et garantit un resultat durable.',
      'Demandez au peintre de preciser la marque et la gamme de peinture utilisee. Les peintures professionnelles (Tollens, Sikkens, Zolpan) offrent un meilleur rendu et une meilleure tenue que les premiers prix de grande surface.',
      'Pour un ravalement de facade, verifiez que le peintre possede une garantie decennale, car les travaux exterieurs engagent la responsabilite du professionnel pendant 10 ans.',
      'Le devis doit indiquer le nombre de couches prevues (minimum 2 pour un resultat optimal), le type de finition (mat, satine, brillant) et si la preparation des supports est incluse.',
      'Privilegiez les peintures a faible emission de COV (Composants Organiques Volatils), identifiees par le label A+ sur l\'etiquette, surtout pour les chambres et les pieces de vie.',
    ],
    faq: [
      {
        q: 'Combien coute la peinture d\'un appartement complet ?',
        a: 'Pour un appartement de 60 m\u00B2, comptez entre 2 500 et 5 000 \u20AC pour la peinture de toutes les pieces (murs et plafonds), fournitures incluses. Le prix varie selon l\'etat des murs (plus de preparation = plus cher), le nombre de couleurs et la qualite de la peinture choisie. Demandez au moins 3 devis pour comparer.',
      },
      {
        q: 'Faut-il vider entierement la piece avant les travaux de peinture ?',
        a: 'Idealement oui, mais un bon peintre peut travailler dans une piece partiellement videe. Il protegera les meubles restants avec des baches et du ruban de masquage. Prevoyez toutefois de deplacer les meubles au centre de la piece et de debarrasser les etageres et les cadres.',
      },
      {
        q: 'Quelle est la difference entre peinture mate, satinee et brillante ?',
        a: 'La peinture mate masque les imperfections et donne un aspect sobre, ideale pour les plafonds et les chambres. La satinee est lavable et resistante, parfaite pour les pieces de vie, couloirs et cuisines. La brillante (ou laquee) offre un rendu tres lisse et se nettoie facilement, recommandee pour les boiseries et les salles de bain.',
      },
      {
        q: 'Combien de temps faut-il pour peindre un appartement ?',
        a: 'Pour un appartement de 60 m\u00B2, comptez 5 a 8 jours de travail incluant la preparation, l\'application de 2 couches et les finitions. Le delai peut etre plus long si les murs necessitent d\'importants travaux de preparation (rebouchage, enduit, poncement).',
      },
    ],
    certifications: [
      'Qualibat (qualification 6111 pour la peinture)',
      'RGE (si travaux d\'isolation thermique par l\'exterieur)',
      'OPPBTP (Organisation Professionnelle de Prevention du Batiment)',
    ],
    averageResponseTime: '48 a 72h pour un devis, debut des travaux sous 1 a 3 semaines',
  },

  menuisier: {
    slug: 'menuisier',
    name: 'Menuisier',
    priceRange: {
      min: 45,
      max: 75,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Pose d\'une fenetre double vitrage PVC : 300 a 800 \u20AC (hors fourniture)',
      'Fabrication et pose d\'un placard sur mesure : 800 a 3 000 \u20AC',
      'Pose d\'une porte interieure : 150 a 400 \u20AC (hors fourniture)',
      'Installation d\'une cuisine amenagee : 1 500 a 5 000 \u20AC (pose uniquement)',
      'Creation d\'un escalier sur mesure : 3 000 a 10 000 \u20AC',
      'Pose de parquet massif ou contrecolle : 30 a 70 \u20AC/m\u00B2 (pose uniquement)',
    ],
    tips: [
      'Distinguez le menuisier d\'agencement (placards, cuisines, dressings sur mesure) du menuisier poseur (fenetres, portes, parquet). Choisissez le specialiste adapte a votre projet pour un resultat optimal.',
      'Pour le remplacement de fenetres, un menuisier certifie RGE est indispensable pour beneficier de MaPrimeRenov\' et des CEE. La pose doit respecter le DTU 36.5 pour garantir l\'etancheite.',
      'Demandez a voir des realisations precedentes du menuisier, surtout pour du mobilier sur mesure. Les photos de chantiers termines sont un bon indicateur de la qualite du travail.',
      'Verifiez que le devis precise l\'essence de bois utilisee (chene, hetre, sapin, bois exotique) et son origine. Le label PEFC ou FSC garantit un bois issu de forets gerees durablement.',
      'Pour des fenetres ou des volets, comparez les performances thermiques (coefficient Uw en W/m\u00B2.K) et pas uniquement le prix. Un bon vitrage isolant se rentabilise en economies de chauffage.',
    ],
    faq: [
      {
        q: 'Combien coute le remplacement de toutes les fenetres d\'une maison ?',
        a: 'Pour une maison standard avec 8 a 12 fenetres, comptez entre 5 000 et 15 000 \u20AC selon le materiau (PVC : le moins cher, aluminium : intermediaire, bois : le plus cher) et le type de vitrage. Avec les aides (MaPrimeRenov\' + CEE), la facture peut etre reduite de 30 a 50 % pour les menages modestes.',
      },
      {
        q: 'Bois, PVC ou aluminium : quel materiau choisir pour mes fenetres ?',
        a: 'Le PVC offre le meilleur rapport qualite-prix et une bonne isolation (a partir de 300 \u20AC la fenetre). Le bois est le plus esthetique et isolant mais necessite un entretien regulier (a partir de 500 \u20AC). L\'aluminium est fin, moderne et sans entretien, mais moins isolant (a partir de 450 \u20AC). Le mixte bois-alu combine les avantages des deux.',
      },
      {
        q: 'Faut-il un permis de construire pour changer les fenetres ?',
        a: 'Non, mais une declaration prealable de travaux en mairie est obligatoire si vous modifiez l\'aspect exterieur de la facade (forme, couleur, materiau des fenetres). En zone protegee (ABF, sites classes), l\'accord de l\'Architecte des Batiments de France est necessaire. Les delais d\'instruction sont de 1 a 2 mois.',
      },
    ],
    certifications: [
      'Qualibat (qualification menuiserie)',
      'RGE (pour les travaux d\'isolation par les fenetres)',
      'Certification QB (Qualite Bois)',
      'FCBA (Institut Technologique Foret Cellulose Bois-construction Ameublement)',
    ],
    averageResponseTime: '48 a 72h pour un devis, debut des travaux sous 2 a 4 semaines',
  },

  carreleur: {
    slug: 'carreleur',
    name: 'Carreleur',
    priceRange: {
      min: 35,
      max: 65,
      unit: '\u20AC/m\u00B2',
    },
    commonTasks: [
      'Pose de carrelage au sol (format standard) : 35 a 55 \u20AC/m\u00B2 (pose uniquement)',
      'Pose de carrelage grand format (60x60 et plus) : 50 a 75 \u20AC/m\u00B2',
      'Pose de faience murale (salle de bain) : 40 a 65 \u20AC/m\u00B2',
      'Pose de mosaique : 60 a 100 \u20AC/m\u00B2',
      'Carrelage d\'une terrasse exterieure : 45 a 80 \u20AC/m\u00B2',
      'Depose d\'ancien carrelage + repose : 15 a 30 \u20AC/m\u00B2 supplementaires',
    ],
    tips: [
      'Le prix de la pose depend fortement du format des carreaux : les grands formats (60x60, 80x80) et les poses en diagonale ou en decale coutent 20 a 40 % plus cher que la pose droite en format standard.',
      'Verifiez que le carreleur inclut la preparation du support dans son devis : ragerage, mise a niveau et etancheite (obligatoire en salle de bain sous la norme DTU 52.1). Un support mal prepare est la premiere cause de decollement.',
      'Prevoyez 10 a 15 % de carrelage supplementaire pour les coupes et la casse. Pour les grands formats et les poses complexes, cette marge peut monter a 20 %.',
      'Demandez au carreleur son avis sur le type de carrelage adapte a votre usage : classement UPEC pour l\'interieur (U pour usure, P pour poinconnement, E pour eau, C pour chimique), et classement R pour l\'antiderapant en exterieur.',
      'Pour une salle de bain, exigez une etancheite sous carrelage (systeme SPEC conforme au DTU 52.1). C\'est un travail supplementaire mais indispensable pour eviter les infiltrations.',
    ],
    faq: [
      {
        q: 'Combien de temps faut-il pour carreler une salle de bain ?',
        a: 'Pour une salle de bain standard de 5 a 8 m\u00B2 (sol + murs), comptez 3 a 5 jours de travail incluant la preparation, la pose de l\'etancheite, le carrelage et les joints. Ajoutez 1 a 2 jours si l\'ancien carrelage doit etre depose. Le sechage des joints necessite 24h supplementaires avant utilisation.',
      },
      {
        q: 'Puis-je poser du carrelage sur un ancien carrelage ?',
        a: 'Oui, c\'est possible si l\'ancien carrelage est bien adherent, plan et en bon etat. Le carreleur utilisera un primaire d\'accrochage specifique. Attention cependant : cette technique ajoute environ 1 cm d\'epaisseur au sol, ce qui peut poser des problemes de seuil de porte et de hauteur sous plafond dans certaines pieces.',
      },
      {
        q: 'Quel carrelage choisir pour un sol de cuisine ?',
        a: 'Pour une cuisine, privilegiez un carrelage gres cerame classement UPEC U3 P3 E2 C1 minimum : resistant a l\'usure, aux chocs, a l\'eau et aux produits menagers. Les formats 30x60 ou 60x60 en finition mate ou satinee sont les plus pratiques. Evitez les finitions tres brillantes (glissantes) et les couleurs trop claires (salissantes).',
      },
    ],
    certifications: [
      'Qualibat (qualification 6321 pour carrelage et revetements)',
      'CSTB (Centre Scientifique et Technique du Batiment)',
    ],
    averageResponseTime: '48 a 72h pour un devis, debut des travaux sous 2 a 4 semaines',
  },

  couvreur: {
    slug: 'couvreur',
    name: 'Couvreur',
    priceRange: {
      min: 50,
      max: 90,
      unit: '\u20AC/m\u00B2',
    },
    commonTasks: [
      'Reparation de fuite de toiture : 200 a 800 \u20AC',
      'Remplacement de tuiles cassees : 40 a 80 \u20AC/m\u00B2',
      'Refection complete de toiture (100 m\u00B2) : 8 000 a 18 000 \u20AC',
      'Pose de gouttiere en zinc : 40 a 80 \u20AC/ml',
      'Nettoyage et demoussage de toiture : 15 a 30 \u20AC/m\u00B2',
      'Installation de fenetre de toit (Velux) : 500 a 1 500 \u20AC (hors fourniture)',
    ],
    tips: [
      'Faites inspecter votre toiture tous les 5 ans et apres chaque episode de grelons ou de tempete. Une petite reparation a temps evite un remplacement complet bien plus couteux.',
      'Verifiez que le couvreur dispose d\'une garantie decennale a jour et d\'une assurance responsabilite civile. Les travaux de toiture engagent la solidite de l\'ouvrage et sont couverts 10 ans.',
      'Profitez d\'une refection de toiture pour ameliorer l\'isolation : l\'isolation par l\'exterieur (sarking) ou par l\'interieur permet de reduire les deperditions thermiques de 25 a 30 %. Un couvreur RGE ouvre droit aux aides de l\'Etat.',
      'Ne montez jamais seul sur un toit pour evaluer les degats. La chute de hauteur est la premiere cause d\'accident mortel dans le batiment. Laissez l\'inspection a un professionnel equipe.',
      'Demandez des photos avant/apres et un rapport d\'intervention ecrit. Certains couvreurs utilisent des drones pour inspecter la toiture sans echafaudage, ce qui reduit les couts.',
    ],
    faq: [
      {
        q: 'Combien coute une refection complete de toiture ?',
        a: 'Pour une maison de 100 m\u00B2 de toiture, comptez entre 8 000 et 18 000 \u20AC selon le materiau (tuiles terre cuite : 50-80 \u20AC/m\u00B2, ardoise : 80-120 \u20AC/m\u00B2, zinc : 60-100 \u20AC/m\u00B2) et la complexite (pente, cheminee, lucarnes). Ce prix inclut la depose, la fourniture et la pose. L\'echafaudage represente 10 a 15 % du budget.',
      },
      {
        q: 'Faut-il un permis de construire pour refaire sa toiture ?',
        a: 'Une declaration prealable de travaux suffit si vous conservez le meme materiau et la meme couleur. En revanche, un permis de construire est necessaire si vous modifiez la pente, la hauteur ou le type de couverture. En zone protegee (ABF), l\'accord de l\'Architecte des Batiments de France est requis.',
      },
      {
        q: 'A quelle frequence faut-il demousser sa toiture ?',
        a: 'Un demoussage est recommande tous les 3 a 5 ans, selon l\'exposition et l\'environnement (plus frequent pres d\'arbres ou en zone humide). Le demoussage coute entre 15 et 30 \u20AC/m\u00B2 et prolonge la duree de vie de votre couverture. Evitez le nettoyeur haute pression, qui endommage les tuiles.',
      },
      {
        q: 'Ma toiture fuit apres une tempete, que faire en urgence ?',
        a: 'Placez des recipients sous les fuites et contactez un couvreur d\'urgence. Prenez des photos des degats pour votre assurance et declarez le sinistre sous 5 jours (2 jours pour une catastrophe naturelle). En attendant le couvreur, vous pouvez bacher temporairement la zone depuis l\'interieur des combles, sans monter sur le toit.',
      },
    ],
    certifications: [
      'Qualibat (qualification 3111 pour couverture en tuiles)',
      'RGE (pour l\'isolation de toiture)',
      'Compagnons du Devoir (formation d\'excellence)',
      'Certification Qualit\'EnR',
    ],
    averageResponseTime: 'Sous 24h en urgence (fuite), 1 a 2 semaines pour un devis standard',
  },

  macon: {
    slug: 'macon',
    name: 'Macon',
    priceRange: {
      min: 45,
      max: 70,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Construction d\'un mur en parpaings : 50 a 80 \u20AC/m\u00B2',
      'Coulee d\'une dalle beton (garage, terrasse) : 60 a 120 \u20AC/m\u00B2',
      'Ouverture d\'un mur porteur (avec IPN) : 2 500 a 6 000 \u20AC',
      'Construction d\'une extension : 1 200 a 2 000 \u20AC/m\u00B2',
      'Reparation de fissures structurelles : 50 a 200 \u20AC/ml',
      'Montage d\'un mur de cloture : 100 a 250 \u20AC/ml',
    ],
    tips: [
      'Pour toute ouverture dans un mur porteur, exigez une etude structurelle realisee par un bureau d\'etudes agree. Le macon doit suivre les preconisations de l\'ingenieur et poser une poutre (IPN) dimensionnee pour reprendre les charges.',
      'Verifiez les references du macon sur des chantiers similaires au votre. Un macon specialise en neuf n\'a pas forcement l\'experience de la renovation, et inversement.',
      'Les travaux de maconnerie sont soumis a la garantie decennale obligatoire. Demandez une copie de l\'attestation d\'assurance avant le debut du chantier et verifiez qu\'elle couvre le type de travaux prevus.',
      'Pour une extension ou une construction, une declaration prealable ou un permis de construire est obligatoire selon la surface. En dessous de 20 m\u00B2, une declaration suffit ; au-dela, le permis est requis (seuil porte a 40 m\u00B2 en zone PLU).',
      'Privilegiez les periodes de printemps et d\'automne pour les travaux de maconnerie : le beton et le mortier necessitent des temperatures comprises entre 5 et 30\u00B0C pour une prise optimale.',
    ],
    faq: [
      {
        q: 'Combien coute la construction d\'une extension de maison ?',
        a: 'Le prix d\'une extension en maconnerie traditionnelle varie de 1 200 a 2 000 \u20AC/m\u00B2 selon les finitions, la complexite de la structure et la region. Une extension de 20 m\u00B2 coute ainsi entre 24 000 et 40 000 \u20AC. Ce prix comprend les fondations, les murs, la toiture et le clos couvert, mais pas les finitions interieures.',
      },
      {
        q: 'Peut-on abattre un mur porteur soi-meme ?',
        a: 'Absolument pas. L\'ouverture d\'un mur porteur sans etude structurelle prealable et sans professionnel qualifie peut provoquer l\'effondrement partiel ou total du batiment. De plus, en copropriete, l\'accord du syndicat est obligatoire. Le cout d\'une ouverture dans un mur porteur (etude + travaux) est de 2 500 a 6 000 \u20AC.',
      },
      {
        q: 'Quelles sont les fondations necessaires pour un mur de cloture ?',
        a: 'Un mur de cloture en parpaings necessite une semelle de fondation en beton arme d\'au moins 30 cm de profondeur et 40 cm de largeur, hors gel (50 a 80 cm selon la region). Le macon doit respecter les regles d\'urbanisme locales (hauteur maximale, retrait par rapport a la limite de propriete).',
      },
    ],
    certifications: [
      'Qualibat (qualification 2111 pour maconnerie)',
      'RGE (si travaux d\'isolation par l\'exterieur)',
      'NF DTU 20.1 (norme de reference pour la maconnerie)',
    ],
    averageResponseTime: '3 a 5 jours pour un devis, debut des travaux sous 3 a 6 semaines',
  },

  jardinier: {
    slug: 'jardinier',
    name: 'Jardinier',
    priceRange: {
      min: 30,
      max: 50,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Tonte de pelouse (jardin de 200 m\u00B2) : 30 a 60 \u20AC',
      'Taille de haie : 15 a 25 \u20AC/ml',
      'Elagage d\'arbre (hauteur moyenne) : 200 a 600 \u20AC par arbre',
      'Creation de jardin (plantations + engazonnement) : 20 a 50 \u20AC/m\u00B2',
      'Entretien mensuel d\'un jardin (200 m\u00B2) : 100 a 200 \u20AC/mois',
      'Abattage d\'arbre avec dessouchage : 400 a 1 500 \u20AC selon la taille',
    ],
    tips: [
      'Les prestations de jardinage a domicile ouvrent droit a un credit d\'impot de 50 % dans la limite de 5 000 \u20AC de depenses par an (soit 2 500 \u20AC de credit d\'impot). Le jardinier doit etre declare en tant que service a la personne (SAP).',
      'Privilegiez un contrat annuel d\'entretien plutot que des interventions ponctuelles : le tarif horaire est generalement 20 a 30 % inferieur et le jardinier connait mieux votre terrain au fil des saisons.',
      'Pour l\'elagage d\'arbres de plus de 7 metres, faites appel a un elagueur-grimpeur certifie CS (Certificat de Specialisation) taille et soins des arbres. L\'elagage non professionnel peut tuer l\'arbre et engager votre responsabilite.',
      'Verifiez que le jardinier evacue les dechets verts ou prevoyez ce poste dans le devis. L\'evacuation et le traitement en dechetterie representent un cout supplementaire de 50 a 150 \u20AC par intervention.',
      'Pour la creation d\'un jardin, demandez un plan d\'amenagement tenant compte de l\'exposition, du sol et du climat de votre region. Un jardinier-paysagiste saura choisir des plantes adaptees qui necessiteront moins d\'entretien.',
    ],
    faq: [
      {
        q: 'Puis-je beneficier d\'un credit d\'impot pour les travaux de jardinage ?',
        a: 'Oui, les petits travaux de jardinage (tonte, taille de haies, desherbage, debroussaillage) beneficient d\'un credit d\'impot de 50 % dans la limite de 5 000 \u20AC par an. Le jardinier doit etre agree services a la personne (SAP) ou vous devez passer par un organisme agree (CESU). Les travaux de creation paysagere ne sont pas eligibles.',
      },
      {
        q: 'A-t-on le droit de couper les branches du voisin qui depassent ?',
        a: 'Non, vous ne pouvez pas couper vous-meme les branches de votre voisin qui depassent sur votre terrain. L\'article 673 du Code civil vous autorise a demander a votre voisin de les couper, et en cas de refus, a saisir le tribunal. Depuis 2023, si votre voisin ne reagit pas sous 2 mois apres mise en demeure, vous pouvez faire couper a ses frais.',
      },
      {
        q: 'Quelle est la meilleure periode pour tailler les haies ?',
        a: 'La taille principale se fait en fin d\'hiver (fevrier-mars), avant la reprise de vegetation. Une seconde taille d\'entretien est recommandee en fin d\'ete (septembre). Attention : la taille est interdite du 15 mars au 31 juillet dans les zones agricoles pour proteger la nidification des oiseaux (arrete du 24 avril 2015).',
      },
      {
        q: 'Quel budget pour l\'entretien annuel d\'un jardin de 500 m\u00B2 ?',
        a: 'Comptez entre 1 500 et 3 500 \u20AC par an pour un entretien complet comprenant la tonte bimensuelle (avril a octobre), 2 tailles de haie, le desherbage des massifs et le ramassage des feuilles a l\'automne. Ce budget peut etre reduit de 50 % grace au credit d\'impot si le jardinier est agree SAP.',
      },
    ],
    certifications: [
      'CS Taille et soins des arbres (pour l\'elagage)',
      'Agrement Services a la Personne (SAP)',
      'Certiphyto (utilisation de produits phytosanitaires)',
      'CAPA Travaux Paysagers',
    ],
    averageResponseTime: '24 a 48h pour un devis, debut des travaux sous 1 a 2 semaines',
  },

  vitrier: {
    slug: 'vitrier',
    name: 'Vitrier',
    priceRange: {
      min: 50,
      max: 100,
      unit: '\u20AC/intervention',
    },
    commonTasks: [
      'Remplacement d\'un simple vitrage : 60 a 150 \u20AC/m\u00B2 (fourniture + pose)',
      'Pose de double vitrage : 150 a 350 \u20AC/m\u00B2',
      'Remplacement d\'une vitre cassee (standard) : 80 a 200 \u20AC',
      'Survitrage d\'une fenetre existante : 80 a 150 \u20AC/m\u00B2',
      'Pose d\'une credence en verre (cuisine) : 200 a 500 \u20AC/m\u00B2',
      'Installation d\'une paroi de douche en verre : 400 a 1 200 \u20AC',
    ],
    tips: [
      'En cas de vitre cassee, securisez la zone avec du carton ou du ruban adhesif en attendant le vitrier. Ne tentez pas de retirer les morceaux de verre a mains nues.',
      'Privilegiez le double vitrage 4/16/4 pour un bon rapport qualite-prix en isolation thermique. Le triple vitrage n\'est justifie que dans les regions tres froides.',
      'Demandez au vitrier de vous fournir le coefficient d\'isolation (Ug) du vitrage propose. Plus ce chiffre est bas, meilleure est l\'isolation : Ug < 1,1 W/m\u00B2.K pour du bon double vitrage.',
      'Pour une credence ou une paroi de douche, exigez du verre securit (trempe) conforme a la norme EN 12150 : en cas de casse, il se fragmente en petits morceaux non coupants.',
      'Un vitrier d\'urgence peut intervenir pour securiser une vitrine commerciale ou une baie vitree cassee. Verifiez que le professionnel propose un service de mise en securite provisoire.',
    ],
    faq: [
      {
        q: 'Combien coute le remplacement d\'une vitre cassee ?',
        a: 'Le remplacement d\'une vitre simple coute entre 80 et 200 \u20AC pour une fenetre standard (environ 1 m\u00B2). Pour du double vitrage, comptez 150 a 350 \u20AC/m\u00B2 fourniture et pose comprises. Les tarifs augmentent pour les grandes dimensions, les formes speciales et les interventions en urgence (+50 a 100 %).',
      },
      {
        q: 'Mon assurance couvre-t-elle le remplacement d\'une vitre ?',
        a: 'Oui, si la casse est due a un evenement couvert par votre contrat (tempete, vandalisme, cambriolage). La garantie bris de glace, souvent en option, couvre les vitres, miroirs et plaques vitroceramiques. Declarez le sinistre sous 5 jours ouvres et conservez les morceaux de verre si possible.',
      },
      {
        q: 'Double ou triple vitrage : lequel choisir ?',
        a: 'Le double vitrage 4/16/4 avec gaz argon (Ug \u2248 1,1 W/m\u00B2.K) suffit dans la majorite des cas en France metropolitaine. Le triple vitrage (Ug \u2248 0,6 W/m\u00B2.K) est recommande uniquement pour les facades nord en climat continental ou montagnard. Il est plus lourd et plus cher (+40 a 60 %) pour un gain d\'isolation modeste en climat tempere.',
      },
    ],
    emergencyInfo:
      'En cas de vitre cassee (effraction, tempete, accident), un vitrier d\'urgence peut intervenir sous 1 a 3 heures pour securiser l\'ouverture avec un panneau provisoire. Le remplacement definitif se fait generalement sous 24 a 48h. Majorations : +50 a 100 % la nuit et le week-end.',
    certifications: [
      'Qualibat (qualification miroiterie-vitrerie)',
      'Certification Cekal (performance des vitrages isolants)',
      'NF DTU 39 (norme de reference pour la vitrerie)',
    ],
    averageResponseTime: 'Sous 2 heures en urgence, 24 a 48h pour un rendez-vous standard',
  },

  climaticien: {
    slug: 'climaticien',
    name: 'Climaticien',
    priceRange: {
      min: 60,
      max: 100,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Installation d\'un split mural (2,5 kW) : 1 500 a 3 000 \u20AC',
      'Pose d\'une climatisation gainable : 5 000 a 12 000 \u20AC',
      'Installation d\'une climatisation multi-split (3 unites) : 4 000 a 8 000 \u20AC',
      'Entretien annuel d\'une climatisation : 100 a 200 \u20AC',
      'Recharge de gaz refrigerant : 200 a 500 \u20AC',
      'Installation d\'une pompe a chaleur air-air : 3 000 a 7 000 \u20AC',
    ],
    tips: [
      'Privilegiez un climaticien certifie RGE et detenteur de l\'attestation de capacite a manipuler les fluides frigorigenes, obligatoire depuis 2015 pour toute intervention sur un circuit frigorifique.',
      'Une pompe a chaleur air-air (climatisation reversible) est plus economique qu\'une climatisation classique : elle consomme 1 kWh d\'electricite pour produire 3 a 4 kWh de chaleur ou de froid (COP de 3 a 4).',
      'Le dimensionnement est crucial : une climatisation trop puissante consomme plus et degrade le confort (cycles courts). Exigez un bilan thermique avant toute installation.',
      'L\'entretien annuel est obligatoire pour les systemes contenant plus de 2 kg de fluide frigorigene (la plupart des splits). Le carnet d\'entretien doit etre tenu a jour.',
      'Attention au bruit : verifiez le niveau sonore de l\'unite exterieure (en dB(A)) et respectez les distances reglementaires avec le voisinage. L\'installation d\'une unite exterieure en copropriete necessite souvent l\'accord de l\'assemblee generale.',
    ],
    faq: [
      {
        q: 'Combien coute l\'installation d\'une climatisation ?',
        a: 'Un split mural standard (2,5 kW, pour une piece de 25 m\u00B2) coute entre 1 500 et 3 000 \u20AC pose comprise. Un systeme multi-split (3 unites interieures) revient a 4 000 a 8 000 \u20AC. La climatisation gainable (invisible, conduits dans les faux plafonds) coute 5 000 a 12 000 \u20AC. Les modeles reversibles (chaud/froid) sont plus economiques a l\'usage.',
      },
      {
        q: 'La climatisation reversible est-elle economique pour le chauffage ?',
        a: 'Oui, une pompe a chaleur air-air reversible consomme 3 a 4 fois moins d\'electricite qu\'un radiateur electrique classique grace a son COP (Coefficient de Performance). Pour un appartement de 60 m\u00B2, l\'economie est de 300 a 600 \u20AC par an sur la facture de chauffage. L\'investissement est amorti en 3 a 5 ans.',
      },
      {
        q: 'Faut-il une autorisation pour installer une climatisation ?',
        a: 'L\'unite exterieure ne necessite pas de permis de construire, mais une declaration prealable peut etre exigee dans certaines communes (verifiez le PLU). En copropriete, l\'accord de l\'assemblee generale est generalement requis. Respectez les reglementations sur le bruit (emergence < 5 dB(A) le jour, < 3 dB(A) la nuit).',
      },
    ],
    emergencyInfo:
      'En cas de panne de climatisation pendant une canicule, un climaticien d\'urgence peut intervenir sous 4 a 12 heures. Verifiez d\'abord les reglages, le disjoncteur dedie et les filtres (encrasses = perte de performance). En attendant, fermez les volets, aérez la nuit et utilisez un ventilateur.',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Attestation de capacite fluides frigorigenes',
      'Qualibat',
      'QualiPAC (pompes a chaleur)',
      'Qualifroid',
    ],
    averageResponseTime: 'Sous 6 heures en urgence (canicule), 48 a 72h pour un devis standard',
  },

  cuisiniste: {
    slug: 'cuisiniste',
    name: 'Cuisiniste',
    priceRange: {
      min: 3000,
      max: 15000,
      unit: '\u20AC (cuisine complete)',
    },
    commonTasks: [
      'Cuisine equipee entree de gamme (5 ml) : 3 000 a 6 000 \u20AC (fourniture + pose)',
      'Cuisine equipee milieu de gamme : 6 000 a 12 000 \u20AC',
      'Cuisine sur mesure haut de gamme : 12 000 a 30 000 \u20AC',
      'Remplacement d\'un plan de travail : 200 a 800 \u20AC/ml selon le materiau',
      'Pose seule d\'une cuisine (hors meubles) : 1 500 a 4 000 \u20AC',
      'Installation d\'un ilot central : 2 000 a 8 000 \u20AC',
    ],
    tips: [
      'Faites realiser plusieurs plans d\'amenagement avant de vous engager. Un bon cuisiniste propose un plan 3D gratuit et prend en compte vos habitudes culinaires, pas uniquement l\'esthetique.',
      'Verifiez que le devis inclut tous les postes : meubles, plan de travail, electromenager, plomberie, electricite, credence et finitions. Les "surprises" representent souvent 10 a 20 % du budget initial.',
      'Le triangle d\'activite (evier-plaque-refrigerateur) est la cle d\'une cuisine fonctionnelle : la distance entre chaque point ne doit pas depasser 2,5 m pour un confort optimal.',
      'Privilegiez les charnieres et glissieres de marque (Blum, Hettich, Grass) : ce sont les pieces les plus sollicitees et la qualite de la quincaillerie determine la durabilite de la cuisine.',
      'Demandez la garantie sur les meubles (minimum 5 ans), le plan de travail et la pose. Un cuisiniste serieux offre un service apres-vente et un ajustement des portes apres 6 mois d\'utilisation.',
    ],
    faq: [
      {
        q: 'Quel budget prevoir pour une cuisine equipee ?',
        a: 'Pour une cuisine de 5 metres lineaires, comptez 3 000 a 6 000 \u20AC en entree de gamme (meubles en melamine, electromenager basique), 6 000 a 12 000 \u20AC en milieu de gamme (facades laquees, electromenager de marque) et 12 000 a 30 000 \u20AC pour du haut de gamme ou du sur-mesure. La pose represente 15 a 25 % du budget total.',
      },
      {
        q: 'Combien de temps dure l\'installation d\'une cuisine ?',
        a: 'L\'installation complete (depose ancienne cuisine, plomberie, electricite, pose des meubles, plan de travail, electromenager et finitions) prend entre 3 et 7 jours ouvres. Ajoutez 1 a 2 semaines de delai pour la fabrication des meubles sur mesure et 2 a 3 mois pour le haut de gamme.',
      },
      {
        q: 'Quel plan de travail choisir ?',
        a: 'Le stratifie est le plus abordable (50-150 \u20AC/ml) et disponible en nombreux decors. Le bois massif (150-300 \u20AC/ml) est chaleureux mais demande un entretien regulier. Le quartz (250-500 \u20AC/ml) est tres resistant et sans entretien. Le granit (300-600 \u20AC/ml) est indestructible. La ceramique (400-800 \u20AC/ml) resiste a tout (chaleur, rayures, taches).',
      },
    ],
    certifications: [
      'Qualibat',
      'Label Cuisine Qualite (AFNOR)',
      'Garantie Meubles de France',
    ],
    averageResponseTime: '48 a 72h pour un premier rendez-vous, 4 a 8 semaines pour la livraison',
  },

  solier: {
    slug: 'solier',
    name: 'Solier',
    priceRange: {
      min: 25,
      max: 60,
      unit: '\u20AC/m\u00B2',
    },
    commonTasks: [
      'Pose de parquet flottant : 20 a 35 \u20AC/m\u00B2 (pose uniquement)',
      'Pose de parquet massif colle : 35 a 60 \u20AC/m\u00B2',
      'Pose de sol PVC/vinyle en lames ou dalles : 15 a 30 \u20AC/m\u00B2',
      'Pose de moquette : 10 a 25 \u20AC/m\u00B2',
      'Ragréage du sol (mise à niveau) : 15 a 30 \u20AC/m\u00B2',
      'Pose de sol souple linoléum : 20 a 40 \u20AC/m\u00B2',
    ],
    tips: [
      'Le ragréage (mise à niveau du support) est souvent indispensable avant la pose d\'un revetement de sol. Un sol mal prepare est la premiere cause de desordres. Ce poste peut representer 15 a 30 \u20AC/m\u00B2 supplementaires.',
      'Le parquet contrecolle offre le meilleur compromis entre esthetique (couche d\'usure en bois noble) et stabilite (pas de retrait ni gonflement). Il est compatible avec le chauffage au sol.',
      'Les sols PVC/vinyle nouvelle generation (LVT - Luxury Vinyl Tiles) offrent un rendu tres realiste (imitation bois, pierre) avec une grande resistance a l\'eau et a l\'usure, ideaux pour les salles de bain et cuisines.',
      'Demandez au solier le classement UPEC du revetement propose et verifiez qu\'il correspond a l\'usage de la piece : U3 P3 minimum pour une entree ou un couloir, U2 P2 suffisant pour une chambre.',
      'Prevoyez 5 a 10 % de materiau supplementaire pour les coupes et les raccords. Pour les poses en diagonale ou dans les pieces en L, cette marge monte a 15 %.',
    ],
    faq: [
      {
        q: 'Parquet massif, contrecolle ou stratifie : lequel choisir ?',
        a: 'Le parquet massif (30-80 \u20AC/m\u00B2) est le plus noble et durable (poncable plusieurs fois), mais sensible a l\'humidite. Le contrecolle (25-60 \u20AC/m\u00B2) offre le meilleur compromis qualite-prix et convient au chauffage au sol. Le stratifie (10-25 \u20AC/m\u00B2) est le moins cher mais ne peut pas etre ponce et a une duree de vie limitee (10-15 ans).',
      },
      {
        q: 'Peut-on poser du parquet sur du carrelage existant ?',
        a: 'Oui, a condition que le carrelage soit bien adherent, plan (tolerance de 2 mm sous la regle de 2 m) et propre. Le solier posera une sous-couche d\'isolation phonique et thermique. Attention : l\'ajout d\'epaisseur (8 a 15 mm) peut necessiter de raboter les portes et d\'adapter les seuils.',
      },
      {
        q: 'Quel sol choisir pour une salle de bain ?',
        a: 'Les meilleurs choix sont le sol PVC/vinyle (etanche, antiderapant, 15-30 \u20AC/m\u00B2), le parquet teck ou bambou (naturellement resistant a l\'eau, 40-70 \u20AC/m\u00B2) ou le sol souple linoleum (ecologique, antibacterien, 20-40 \u20AC/m\u00B2). Evitez le stratifie classique qui gonfle au contact de l\'eau. Le carrelage reste la solution la plus durable.',
      },
    ],
    certifications: [
      'Qualibat (qualification 6411 pour revetements de sol souples)',
      'Qualibat (qualification 6421 pour parquets)',
      'Certification UPEC (Union Professionnelle de l\'Expertise en Construction)',
    ],
    averageResponseTime: '48 a 72h pour un devis, debut des travaux sous 1 a 3 semaines',
  },

  nettoyage: {
    slug: 'nettoyage',
    name: 'Nettoyage',
    priceRange: {
      min: 25,
      max: 45,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Nettoyage de fin de chantier (appartement 60 m\u00B2) : 400 a 800 \u20AC',
      'Nettoyage de copropriete (parties communes) : 200 a 500 \u20AC/mois',
      'Nettoyage de vitres (logement) : 5 a 10 \u20AC/m\u00B2',
      'Remise en etat apres sinistre : 500 a 2 000 \u20AC',
      'Nettoyage de facade (karcher professionnel) : 10 a 25 \u20AC/m\u00B2',
      'Debarras et nettoyage de locaux : 30 a 50 \u20AC/m\u00B2',
    ],
    tips: [
      'Pour un nettoyage de fin de chantier, exigez un cahier des charges precis : lessivage des murs, decapage des sols, nettoyage des vitres (interieur + exterieur), degraissage de la cuisine et nettoyage des sanitaires.',
      'Verifiez que l\'entreprise de nettoyage dispose d\'une assurance responsabilite civile professionnelle et que ses salaries sont declares (demandez un extrait Kbis et une attestation URSSAF).',
      'Pour le nettoyage regulier de copropriete, un contrat annuel avec un cahier des charges detaille (frequence, surfaces, prestations) est plus economique que des interventions ponctuelles.',
      'Les entreprises de nettoyage a domicile agreees services a la personne (SAP) ouvrent droit a un credit d\'impot de 50 % dans la limite de 12 000 \u20AC de depenses par an.',
      'Pour un nettoyage apres sinistre (degat des eaux, incendie), conservez les factures pour votre assurance. La plupart des contrats d\'assurance habitation couvrent ces frais.',
    ],
    faq: [
      {
        q: 'Combien coute un nettoyage de fin de chantier ?',
        a: 'Pour un appartement de 60 m\u00B2, comptez 400 a 800 \u20AC selon l\'etat des lieux et l\'etendue des travaux realises. Pour une maison de 120 m\u00B2, le budget est de 700 a 1 500 \u20AC. Ce tarif inclut le lessivage des murs, le decapage et lustrage des sols, le nettoyage des vitres et la desinfection des sanitaires.',
      },
      {
        q: 'Puis-je beneficier d\'un credit d\'impot pour le nettoyage ?',
        a: 'Oui, le menage a domicile beneficie d\'un credit d\'impot de 50 % si l\'entreprise est agreee services a la personne (SAP) ou si vous employez directement une personne via le CESU. Le plafond est de 12 000 \u20AC de depenses par an (+1 500 \u20AC par enfant a charge). Seul le nettoyage a domicile est eligible, pas le nettoyage professionnel de locaux.',
      },
      {
        q: 'Comment choisir une entreprise de nettoyage fiable ?',
        a: 'Verifiez le SIRET, l\'inscription au registre du commerce (Kbis), l\'attestation URSSAF a jour et l\'assurance RC professionnelle. Demandez des references clients et consultez les avis en ligne. Une entreprise serieuse propose un devis gratuit apres visite sur site et ne demande jamais de paiement en especes.',
      },
    ],
    certifications: [
      'Qualipropre (certification du secteur de la proprete)',
      'Agrement Services a la Personne (SAP) pour le menage a domicile',
      'ISO 14001 (management environnemental)',
      'Ecolabel Europeen (utilisation de produits ecologiques)',
    ],
    averageResponseTime: '24 a 48h pour un devis, intervention sous 3 a 5 jours',
  },
}

/**
 * Recupere le contenu d'un corps de metier par son slug.
 * Retourne undefined si le slug n'existe pas.
 */
export function getTradeContent(slug: string): TradeContent | undefined {
  return tradeContent[slug]
}

/**
 * Recupere tous les slugs de metiers disponibles.
 */
export function getTradesSlugs(): string[] {
  return Object.keys(tradeContent)
}
