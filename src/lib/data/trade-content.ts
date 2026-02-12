/**
 * Contenu SEO riche pour chaque corps de métier.
 * Utilisé sur les pages hub de services pour ajouter du contenu contextuel
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
      'Débouchage de canalisation : 80 à 250 \u20AC selon la complexité',
      'Remplacement d\'un chauffe-eau : 800 à 2 500 \u20AC (fourniture + pose)',
      'Réparation de fuite d\'eau : 90 à 300 \u20AC',
      'Installation d\'un WC : 200 à 600 \u20AC (hors fourniture)',
      'Pose d\'un robinet mitigeur : 80 à 200 \u20AC (hors fourniture)',
      'Remplacement d\'un ballon d\'eau chaude : 600 à 2 000 \u20AC',
    ],
    tips: [
      'Vérifiez que le plombier dispose d\'une assurance responsabilité civile professionnelle et d\'une garantie décennale, obligatoires pour les travaux de plomberie.',
      'Demandez toujours un devis détaillé avant le début des travaux : un professionnel sérieux ne commence jamais sans accord écrit sur le prix.',
      'Privilégiez un plombier certifié RGE si vous envisagez des travaux liés au chauffage ou à l\'eau chaude, car cela vous ouvre droit aux aides de l\'État (MaPrimeRenov\', CEE).',
      'En cas d\'urgence, coupez l\'arrivée d\'eau générale avant l\'arrivée du plombier pour limiter les dégâts. Le compteur se trouve souvent dans la cave ou à l\'extérieur.',
      'Méfiez-vous des plombiers qui refusent de donner un devis par écrit ou qui exigent un paiement intégral avant intervention : ce sont des signaux d\'alerte.',
    ],
    faq: [
      {
        q: 'Combien coûte une intervention de plombier en urgence ?',
        a: 'Une intervention d\'urgence coûte en moyenne entre 150 et 400 \u20AC, avec des majorations possibles la nuit (+50 à 100 %), le week-end (+25 à 50 %) et les jours fériés (+50 à 100 %). Exigez toujours un devis avant que le plombier ne commence les travaux, même en urgence.',
      },
      {
        q: 'Comment savoir si mon plombier est fiable ?',
        a: 'Vérifiez son numéro SIRET sur le site de l\'INSEE, son inscription au registre des métiers, et demandez une copie de son assurance décennale. Un plombier sérieux fournit ces documents sans difficulté. Consultez également les avis en ligne et demandez des références de chantiers récents.',
      },
      {
        q: 'Quels travaux de plomberie puis-je faire moi-même ?',
        a: 'Vous pouvez changer un joint de robinet, remplacer un flexible de douche ou déboucher un siphon avec une ventouse. En revanche, toute intervention sur les canalisations encastrées, le chauffe-eau ou l\'arrivée d\'eau principale doit être confiée à un professionnel pour des raisons de sécurité et d\'assurance.',
      },
      {
        q: 'Le plombier doit-il fournir une facture ?',
        a: 'Oui, c\'est obligatoire pour toute prestation supérieure à 25 \u20AC. La facture doit mentionner le détail des travaux, le prix unitaire des pièces, le taux horaire de la main-d\'oeuvre et la TVA appliquée (10 % pour la rénovation, 20 % pour le neuf). Conservez-la précieusement pour la garantie.',
      },
    ],
    emergencyInfo:
      'En cas de fuite d\'eau importante ou de canalisation bouchée, un plombier d\'urgence peut intervenir 24h/24 et 7j/7. Coupez immédiatement l\'arrivée d\'eau au compteur général et contactez un professionnel. Les tarifs d\'urgence sont majorés de 50 à 100 % par rapport à une intervention en journée.',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Qualibat',
      'PG (Professionnel du Gaz)',
      'QualiPAC (pour les pompes à chaleur)',
    ],
    averageResponseTime: 'Sous 2 heures en urgence, 24 à 48h pour un rendez-vous standard',
  },

  electricien: {
    slug: 'electricien',
    name: 'Électricien',
    priceRange: {
      min: 50,
      max: 80,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Mise aux normes d\'un tableau électrique : 800 à 2 500 \u20AC',
      'Installation d\'un point lumineux : 80 à 200 \u20AC',
      'Pose d\'une prise électrique supplémentaire : 60 à 150 \u20AC',
      'Remplacement d\'un interrupteur différentiel : 150 à 350 \u20AC',
      'Installation d\'un interphone ou visiophone : 300 à 1 200 \u20AC',
      'Réfection complète de l\'électricité d\'un appartement (60 m²) : 5 000 à 10 000 \u20AC',
    ],
    tips: [
      'Assurez-vous que l\'électricien respecte la norme NF C 15-100, obligatoire pour toute installation électrique en France. Demandez un certificat de conformité Consuel à la fin des travaux.',
      'Comparez au moins trois devis en vérifiant que chacun détaille les fournitures, la main-d\'oeuvre et le coût des mises en conformité éventuelles.',
      'Choisissez un électricien certifié IRVE si vous souhaitez installer une borne de recharge pour véhicule électrique : c\'est obligatoire pour bénéficier du crédit d\'impôt.',
      'Avant toute intervention, vérifiez que l\'électricien possède une habilitation électrique valide (B1, B2 ou BR selon le type de travaux).',
      'Pour des travaux de rénovation énergétique (chauffage électrique performant, VMC), un électricien RGE est indispensable pour obtenir les aides financières de l\'État.',
    ],
    faq: [
      {
        q: 'Ma maison est ancienne, faut-il refaire toute l\'électricité ?',
        a: 'Pas nécessairement, mais un diagnostic électrique est fortement recommandé pour les installations de plus de 15 ans. Un électricien qualifié évaluera la conformité à la norme NF C 15-100 et proposera les mises à niveau nécessaires. Une rénovation partielle (tableau, prises de terre, différentiels) coûte entre 1 500 et 4 000 \u20AC selon la surface.',
      },
      {
        q: 'Combien coûte l\'installation d\'une borne de recharge pour voiture électrique ?',
        a: 'L\'installation d\'une borne de recharge domestique (wallbox 7 kW) coûte entre 1 200 et 2 500 \u20AC pose comprise. Un crédit d\'impôt de 300 \u20AC est disponible, à condition de faire appel à un électricien certifié IRVE. Le délai d\'installation est généralement de 1 à 3 jours.',
      },
      {
        q: 'Qu\'est-ce que le certificat Consuel et est-il obligatoire ?',
        a: 'Le Consuel (Comité National pour la Sécurité des Usagers de l\'Électricité) délivre une attestation de conformité électrique. Il est obligatoire pour toute nouvelle installation ou rénovation complète avant la mise sous tension par Enedis. Le coût est d\'environ 120 à 180 \u20AC selon le type d\'installation.',
      },
    ],
    emergencyInfo:
      'En cas de panne électrique, de fils dénudés ou d\'odeur de brûlé, coupez immédiatement le disjoncteur général et appelez un électricien d\'urgence. Ne tentez jamais de réparer vous-même un problème électrique. Un électricien d\'astreinte peut intervenir sous 1 à 3 heures, avec une majoration de 50 à 100 % en dehors des heures ouvrées.',
    certifications: [
      'Qualifelec',
      'RGE (Reconnu Garant de l\'Environnement)',
      'IRVE (Infrastructure de Recharge pour Véhicules Électriques)',
      'Habilitation électrique (B1, B2, BR)',
      'Qualibat',
    ],
    averageResponseTime: 'Sous 3 heures en urgence, 24 à 72h pour un rendez-vous standard',
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
      'Ouverture de porte claquée (sans effraction) : 80 à 150 \u20AC',
      'Ouverture de porte blindée : 150 à 400 \u20AC',
      'Changement de serrure standard : 100 à 300 \u20AC (fourniture incluse)',
      'Pose d\'une serrure multipoints : 300 à 800 \u20AC',
      'Blindage de porte existante : 800 à 2 000 \u20AC',
      'Installation d\'une porte blindée complète : 1 500 à 4 500 \u20AC',
    ],
    tips: [
      'En cas de porte claquée, ne paniquez pas : un serrurier qualifié peut ouvrir sans dégradation dans la majorité des cas. Ne faites jamais appel à un dépanneur trouvé sur un prospectus dans votre boîte aux lettres.',
      'Exigez un devis ferme et définitif avant toute intervention, y compris en urgence. La loi oblige le serrurier à vous remettre un devis écrit pour toute prestation dépassant 150 \u20AC.',
      'Méfiez-vous des serruriers qui annoncent des prix très bas par téléphone puis gonflent la facture une fois sur place. Vérifiez les avis en ligne et le numéro SIRET avant d\'appeler.',
      'Privilégiez les serruriers ayant une adresse physique vérifiable (atelier ou magasin). C\'est un gage de sérieux et de recours possible en cas de problème.',
      'Après un cambriolage, faites intervenir la police avant le serrurier. Vous aurez besoin du dépôt de plainte pour votre assurance, et il ne faut pas toucher à la scène.',
    ],
    faq: [
      {
        q: 'Combien coûte une ouverture de porte le dimanche ou la nuit ?',
        a: 'Une ouverture de porte en horaires non ouvrés (nuit, dimanche, jours fériés) coûte entre 150 et 350 \u20AC pour une porte standard, et entre 250 et 500 \u20AC pour une porte blindée. Les majorations de nuit (entre 20h et 6h) vont de 50 à 100 % du tarif de base. Demandez toujours le prix total avant que le serrurier n\'intervienne.',
      },
      {
        q: 'Quelle serrure choisir pour sécuriser mon logement ?',
        a: 'Pour une sécurité optimale, optez pour une serrure certifiée A2P (Assurance Prévention Protection). Il existe 3 niveaux : A2P* (résistance de 5 min à l\'effraction), A2P** (10 min) et A2P*** (15 min). Les assureurs exigent souvent un niveau A2P** minimum. Comptez 200 à 600 \u20AC pour la serrure et 100 à 200 \u20AC pour la pose.',
      },
      {
        q: 'Mon assurance prend-elle en charge les frais de serrurier ?',
        a: 'Oui, la plupart des contrats d\'assurance habitation couvrent les frais de serrurier en cas de cambriolage, de perte de clés ou de porte claquée, souvent dans le cadre de la garantie assistance. Vérifiez votre contrat et contactez votre assureur avant l\'intervention si possible. Conservez la facture et le devis pour le remboursement.',
      },
      {
        q: 'Comment éviter les arnaques aux serruriers ?',
        a: 'Vérifiez le SIRET de l\'entreprise, recherchez des avis en ligne et privilégiez le bouche-à-oreille. Refusez toute intervention sans devis préalable écrit. Un serrurier honnête accepte toujours de détailler ses tarifs. En cas de doute, contactez la DGCCRF (Direction Générale de la Concurrence) au 0809 540 550.',
      },
    ],
    emergencyInfo:
      'En cas de porte claquée ou de serrure cassée, un serrurier d\'urgence intervient généralement sous 30 minutes à 1 heure en zone urbaine. Attention aux majorations : +50 % en soirée (après 19h), +75 à 100 % la nuit (après 22h), le dimanche et les jours fériés. Exigez toujours un devis écrit avant le début de l\'intervention.',
    certifications: [
      'A2P Service (certification des serruriers par le CNPP)',
      'Qualibat',
      'Certification Qualisr (Qualification Serrurerie)',
    ],
    averageResponseTime: 'Sous 30 minutes en urgence en zone urbaine, 1 à 2h en zone rurale',
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
      'Entretien annuel de chaudière gaz : 100 à 200 \u20AC',
      'Remplacement d\'une chaudière gaz à condensation : 3 000 à 7 000 \u20AC (fourniture + pose)',
      'Installation d\'une pompe à chaleur air-eau : 8 000 à 15 000 \u20AC',
      'Désembouage d\'un circuit de chauffage : 400 à 900 \u20AC',
      'Remplacement de radiateurs : 300 à 800 \u20AC par radiateur (fourniture + pose)',
      'Installation d\'un plancher chauffant : 50 à 100 \u20AC/m²',
    ],
    tips: [
      'L\'entretien annuel de votre chaudière est obligatoire par la loi (décret du 9 juin 2009). Prévoyez-le à l\'automne, avant la saison de chauffe, pour éviter les pannes en plein hiver.',
      'Privilégiez un chauffagiste certifié RGE pour bénéficier des aides financières : MaPrimeRenov\' (jusqu\'à 5 000 \u20AC pour une pompe à chaleur), CEE, éco-prêt à taux zéro et TVA à 5,5 %.',
      'Comparez les performances énergétiques (COP pour les pompes à chaleur, rendement pour les chaudières) et pas seulement le prix d\'achat. Une chaudière à condensation consomme 15 à 30 % de moins qu\'un modèle classique.',
      'Demandez un bilan thermique complet avant l\'installation d\'un nouveau système de chauffage. Un bon chauffagiste dimensionne l\'installation en fonction de la surface, de l\'isolation et de la zone climatique.',
      'Souscrivez un contrat d\'entretien annuel : il coûte entre 120 et 250 \u20AC par an et inclut généralement la visite obligatoire, le dépannage prioritaire et les pièces d\'usure.',
    ],
    faq: [
      {
        q: 'Quand dois-je remplacer ma chaudière ?',
        a: 'Une chaudière a une durée de vie moyenne de 15 à 20 ans. Les signes qui doivent alerter : pannes fréquentes, surconsommation de gaz, bruits inhabituels, eau pas assez chaude. Si votre chaudière a plus de 15 ans, un remplacement par un modèle à condensation vous fera économiser 20 à 30 % sur votre facture énergétique.',
      },
      {
        q: 'Pompe à chaleur ou chaudière gaz : que choisir ?',
        a: 'La pompe à chaleur air-eau est plus écologique et bénéficie de plus d\'aides (MaPrimeRenov\' jusqu\'à 5 000 \u20AC), mais son coût d\'installation est plus élevé (8 000 à 15 000 \u20AC contre 3 000 à 7 000 \u20AC pour une chaudière gaz). Elle est idéale pour les maisons bien isolées. La chaudière gaz à condensation reste pertinente en appartement ou si le réseau de gaz est déjà installé.',
      },
      {
        q: 'Les aides de l\'État pour le chauffage sont-elles cumulables ?',
        a: 'Oui, sous conditions de revenus et avec un artisan RGE. Vous pouvez cumuler MaPrimeRenov\', les CEE (Certificats d\'Économies d\'Énergie), l\'éco-prêt à taux zéro (jusqu\'à 50 000 \u20AC) et la TVA réduite à 5,5 %. Le montant total peut couvrir 50 à 90 % du coût des travaux pour les ménages modestes.',
      },
      {
        q: 'Ma chaudière est en panne en plein hiver, que faire ?',
        a: 'Vérifiez d\'abord les éléments simples : thermostat, pression du circuit (entre 1 et 1,5 bar), disjoncteur dédié. Si le problème persiste, appelez un chauffagiste en urgence. La plupart interviennent sous 4 à 12 heures. Si vous avez un contrat d\'entretien, le dépannage est souvent inclus ou prioritaire.',
      },
    ],
    emergencyInfo:
      'En cas de panne de chauffage en hiver ou de fuite de gaz, un chauffagiste d\'urgence peut intervenir sous 4 à 12 heures. En cas d\'odeur de gaz, ouvrez les fenêtres, ne touchez pas aux interrupteurs électriques, quittez le logement et appelez immédiatement le numéro d\'urgence GRDF : 0 800 47 33 33 (gratuit, 24h/24).',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Qualibat',
      'PG (Professionnel du Gaz)',
      'QualiPAC (pompes à chaleur)',
      'Qualifioul (installations fioul)',
      'QualiSol (chauffe-eau solaire)',
    ],
    averageResponseTime: 'Sous 4 heures en urgence, 48 à 72h pour un rendez-vous standard',
  },

  'peintre-en-batiment': {
    slug: 'peintre-en-batiment',
    name: 'Peintre en bâtiment',
    priceRange: {
      min: 25,
      max: 45,
      unit: '\u20AC/m²',
    },
    commonTasks: [
      'Peinture d\'une pièce (murs + plafond, 12 m²) : 400 à 800 \u20AC',
      'Ravalement de façade (enduit + peinture) : 40 à 100 \u20AC/m²',
      'Pose de papier peint : 15 à 35 \u20AC/m² (hors fourniture)',
      'Laquage de boiseries et portes : 30 à 60 \u20AC/m²',
      'Traitement et peinture de volets : 50 à 120 \u20AC par volet',
      'Peinture de plafond seul : 18 à 35 \u20AC/m²',
    ],
    tips: [
      'Un bon peintre commence toujours par une préparation minutieuse des surfaces : lessivage, ponçage, rebouchage des fissures et application d\'une sous-couche. Cette étape représente 60 % du travail et garantit un résultat durable.',
      'Demandez au peintre de préciser la marque et la gamme de peinture utilisée. Les peintures professionnelles (Tollens, Sikkens, Zolpan) offrent un meilleur rendu et une meilleure tenue que les premiers prix de grande surface.',
      'Pour un ravalement de façade, vérifiez que le peintre possède une garantie décennale, car les travaux extérieurs engagent la responsabilité du professionnel pendant 10 ans.',
      'Le devis doit indiquer le nombre de couches prévues (minimum 2 pour un résultat optimal), le type de finition (mat, satiné, brillant) et si la préparation des supports est incluse.',
      'Privilégiez les peintures à faible émission de COV (Composants Organiques Volatils), identifiées par le label A+ sur l\'étiquette, surtout pour les chambres et les pièces de vie.',
    ],
    faq: [
      {
        q: 'Combien coûte la peinture d\'un appartement complet ?',
        a: 'Pour un appartement de 60 m², comptez entre 2 500 et 5 000 \u20AC pour la peinture de toutes les pièces (murs et plafonds), fournitures incluses. Le prix varie selon l\'état des murs (plus de préparation = plus cher), le nombre de couleurs et la qualité de la peinture choisie. Demandez au moins 3 devis pour comparer.',
      },
      {
        q: 'Faut-il vider entièrement la pièce avant les travaux de peinture ?',
        a: 'Idéalement oui, mais un bon peintre peut travailler dans une pièce partiellement vidée. Il protégera les meubles restants avec des bâches et du ruban de masquage. Prévoyez toutefois de déplacer les meubles au centre de la pièce et de débarrasser les étagères et les cadres.',
      },
      {
        q: 'Quelle est la différence entre peinture mate, satinée et brillante ?',
        a: 'La peinture mate masque les imperfections et donne un aspect sobre, idéale pour les plafonds et les chambres. La satinée est lavable et résistante, parfaite pour les pièces de vie, couloirs et cuisines. La brillante (ou laquée) offre un rendu très lisse et se nettoie facilement, recommandée pour les boiseries et les salles de bain.',
      },
      {
        q: 'Combien de temps faut-il pour peindre un appartement ?',
        a: 'Pour un appartement de 60 m², comptez 5 à 8 jours de travail incluant la préparation, l\'application de 2 couches et les finitions. Le délai peut être plus long si les murs nécessitent d\'importants travaux de préparation (rebouchage, enduit, ponçage).',
      },
    ],
    certifications: [
      'Qualibat (qualification 6111 pour la peinture)',
      'RGE (si travaux d\'isolation thermique par l\'extérieur)',
      'OPPBTP (Organisation Professionnelle de Prévention du Bâtiment)',
    ],
    averageResponseTime: '48 à 72h pour un devis, début des travaux sous 1 à 3 semaines',
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
      'Pose d\'une fenêtre double vitrage PVC : 300 à 800 \u20AC (hors fourniture)',
      'Fabrication et pose d\'un placard sur mesure : 800 à 3 000 \u20AC',
      'Pose d\'une porte intérieure : 150 à 400 \u20AC (hors fourniture)',
      'Installation d\'une cuisine aménagée : 1 500 à 5 000 \u20AC (pose uniquement)',
      'Création d\'un escalier sur mesure : 3 000 à 10 000 \u20AC',
      'Pose de parquet massif ou contrecollé : 30 à 70 \u20AC/m² (pose uniquement)',
    ],
    tips: [
      'Distinguez le menuisier d\'agencement (placards, cuisines, dressings sur mesure) du menuisier poseur (fenêtres, portes, parquet). Choisissez le spécialiste adapté à votre projet pour un résultat optimal.',
      'Pour le remplacement de fenêtres, un menuisier certifié RGE est indispensable pour bénéficier de MaPrimeRenov\' et des CEE. La pose doit respecter le DTU 36.5 pour garantir l\'étanchéité.',
      'Demandez à voir des réalisations précédentes du menuisier, surtout pour du mobilier sur mesure. Les photos de chantiers terminés sont un bon indicateur de la qualité du travail.',
      'Vérifiez que le devis précise l\'essence de bois utilisée (chêne, hêtre, sapin, bois exotique) et son origine. Le label PEFC ou FSC garantit un bois issu de forêts gérées durablement.',
      'Pour des fenêtres ou des volets, comparez les performances thermiques (coefficient Uw en W/m².K) et pas uniquement le prix. Un bon vitrage isolant se rentabilise en économies de chauffage.',
    ],
    faq: [
      {
        q: 'Combien coûte le remplacement de toutes les fenêtres d\'une maison ?',
        a: 'Pour une maison standard avec 8 à 12 fenêtres, comptez entre 5 000 et 15 000 \u20AC selon le matériau (PVC : le moins cher, aluminium : intermédiaire, bois : le plus cher) et le type de vitrage. Avec les aides (MaPrimeRenov\' + CEE), la facture peut être réduite de 30 à 50 % pour les ménages modestes.',
      },
      {
        q: 'Bois, PVC ou aluminium : quel matériau choisir pour mes fenêtres ?',
        a: 'Le PVC offre le meilleur rapport qualité-prix et une bonne isolation (à partir de 300 \u20AC la fenêtre). Le bois est le plus esthétique et isolant mais nécessite un entretien régulier (à partir de 500 \u20AC). L\'aluminium est fin, moderne et sans entretien, mais moins isolant (à partir de 450 \u20AC). Le mixte bois-alu combine les avantages des deux.',
      },
      {
        q: 'Faut-il un permis de construire pour changer les fenêtres ?',
        a: 'Non, mais une déclaration préalable de travaux en mairie est obligatoire si vous modifiez l\'aspect extérieur de la façade (forme, couleur, matériau des fenêtres). En zone protégée (ABF, sites classés), l\'accord de l\'Architecte des Bâtiments de France est nécessaire. Les délais d\'instruction sont de 1 à 2 mois.',
      },
    ],
    certifications: [
      'Qualibat (qualification menuiserie)',
      'RGE (pour les travaux d\'isolation par les fenêtres)',
      'Certification QB (Qualité Bois)',
      'FCBA (Institut Technologique Forêt Cellulose Bois-construction Ameublement)',
    ],
    averageResponseTime: '48 à 72h pour un devis, début des travaux sous 2 à 4 semaines',
  },

  carreleur: {
    slug: 'carreleur',
    name: 'Carreleur',
    priceRange: {
      min: 35,
      max: 65,
      unit: '\u20AC/m²',
    },
    commonTasks: [
      'Pose de carrelage au sol (format standard) : 35 à 55 \u20AC/m² (pose uniquement)',
      'Pose de carrelage grand format (60x60 et plus) : 50 à 75 \u20AC/m²',
      'Pose de faïence murale (salle de bain) : 40 à 65 \u20AC/m²',
      'Pose de mosaïque : 60 à 100 \u20AC/m²',
      'Carrelage d\'une terrasse extérieure : 45 à 80 \u20AC/m²',
      'Dépose d\'ancien carrelage + repose : 15 à 30 \u20AC/m² supplémentaires',
    ],
    tips: [
      'Le prix de la pose dépend fortement du format des carreaux : les grands formats (60x60, 80x80) et les poses en diagonale ou en décalé coûtent 20 à 40 % plus cher que la pose droite en format standard.',
      'Vérifiez que le carreleur inclut la préparation du support dans son devis : ragréage, mise à niveau et étanchéité (obligatoire en salle de bain sous la norme DTU 52.1). Un support mal préparé est la première cause de décollement.',
      'Prévoyez 10 à 15 % de carrelage supplémentaire pour les coupes et la casse. Pour les grands formats et les poses complexes, cette marge peut monter à 20 %.',
      'Demandez au carreleur son avis sur le type de carrelage adapté à votre usage : classement UPEC pour l\'intérieur (U pour usure, P pour poinçonnement, E pour eau, C pour chimique), et classement R pour l\'antidérapant en extérieur.',
      'Pour une salle de bain, exigez une étanchéité sous carrelage (système SPEC conforme au DTU 52.1). C\'est un travail supplémentaire mais indispensable pour éviter les infiltrations.',
    ],
    faq: [
      {
        q: 'Combien de temps faut-il pour carreler une salle de bain ?',
        a: 'Pour une salle de bain standard de 5 à 8 m² (sol + murs), comptez 3 à 5 jours de travail incluant la préparation, la pose de l\'étanchéité, le carrelage et les joints. Ajoutez 1 à 2 jours si l\'ancien carrelage doit être déposé. Le séchage des joints nécessite 24h supplémentaires avant utilisation.',
      },
      {
        q: 'Puis-je poser du carrelage sur un ancien carrelage ?',
        a: 'Oui, c\'est possible si l\'ancien carrelage est bien adhérent, plan et en bon état. Le carreleur utilisera un primaire d\'accrochage spécifique. Attention cependant : cette technique ajoute environ 1 cm d\'épaisseur au sol, ce qui peut poser des problèmes de seuil de porte et de hauteur sous plafond dans certaines pièces.',
      },
      {
        q: 'Quel carrelage choisir pour un sol de cuisine ?',
        a: 'Pour une cuisine, privilégiez un carrelage grès cérame classement UPEC U3 P3 E2 C1 minimum : résistant à l\'usure, aux chocs, à l\'eau et aux produits ménagers. Les formats 30x60 ou 60x60 en finition mate ou satinée sont les plus pratiques. Évitez les finitions très brillantes (glissantes) et les couleurs trop claires (salissantes).',
      },
    ],
    certifications: [
      'Qualibat (qualification 6321 pour carrelage et revêtements)',
      'CSTB (Centre Scientifique et Technique du Bâtiment)',
    ],
    averageResponseTime: '48 à 72h pour un devis, début des travaux sous 2 à 4 semaines',
  },

  couvreur: {
    slug: 'couvreur',
    name: 'Couvreur',
    priceRange: {
      min: 50,
      max: 90,
      unit: '\u20AC/m²',
    },
    commonTasks: [
      'Réparation de fuite de toiture : 200 à 800 \u20AC',
      'Remplacement de tuiles cassées : 40 à 80 \u20AC/m²',
      'Réfection complète de toiture (100 m²) : 8 000 à 18 000 \u20AC',
      'Pose de gouttière en zinc : 40 à 80 \u20AC/ml',
      'Nettoyage et démoussage de toiture : 15 à 30 \u20AC/m²',
      'Installation de fenêtre de toit (Velux) : 500 à 1 500 \u20AC (hors fourniture)',
    ],
    tips: [
      'Faites inspecter votre toiture tous les 5 ans et après chaque épisode de grêlons ou de tempête. Une petite réparation à temps évite un remplacement complet bien plus coûteux.',
      'Vérifiez que le couvreur dispose d\'une garantie décennale à jour et d\'une assurance responsabilité civile. Les travaux de toiture engagent la solidité de l\'ouvrage et sont couverts 10 ans.',
      'Profitez d\'une réfection de toiture pour améliorer l\'isolation : l\'isolation par l\'extérieur (sarking) ou par l\'intérieur permet de réduire les déperditions thermiques de 25 à 30 %. Un couvreur RGE ouvre droit aux aides de l\'État.',
      'Ne montez jamais seul sur un toit pour évaluer les dégâts. La chute de hauteur est la première cause d\'accident mortel dans le bâtiment. Laissez l\'inspection à un professionnel équipé.',
      'Demandez des photos avant/après et un rapport d\'intervention écrit. Certains couvreurs utilisent des drones pour inspecter la toiture sans échafaudage, ce qui réduit les coûts.',
    ],
    faq: [
      {
        q: 'Combien coûte une réfection complète de toiture ?',
        a: 'Pour une maison de 100 m² de toiture, comptez entre 8 000 et 18 000 \u20AC selon le matériau (tuiles terre cuite : 50-80 \u20AC/m², ardoise : 80-120 \u20AC/m², zinc : 60-100 \u20AC/m²) et la complexité (pente, cheminée, lucarnes). Ce prix inclut la dépose, la fourniture et la pose. L\'échafaudage représente 10 à 15 % du budget.',
      },
      {
        q: 'Faut-il un permis de construire pour refaire sa toiture ?',
        a: 'Une déclaration préalable de travaux suffit si vous conservez le même matériau et la même couleur. En revanche, un permis de construire est nécessaire si vous modifiez la pente, la hauteur ou le type de couverture. En zone protégée (ABF), l\'accord de l\'Architecte des Bâtiments de France est requis.',
      },
      {
        q: 'À quelle fréquence faut-il démousser sa toiture ?',
        a: 'Un démoussage est recommandé tous les 3 à 5 ans, selon l\'exposition et l\'environnement (plus fréquent près d\'arbres ou en zone humide). Le démoussage coûte entre 15 et 30 \u20AC/m² et prolonge la durée de vie de votre couverture. Évitez le nettoyeur haute pression, qui endommage les tuiles.',
      },
      {
        q: 'Ma toiture fuit après une tempête, que faire en urgence ?',
        a: 'Placez des récipients sous les fuites et contactez un couvreur d\'urgence. Prenez des photos des dégâts pour votre assurance et déclarez le sinistre sous 5 jours (2 jours pour une catastrophe naturelle). En attendant le couvreur, vous pouvez bâcher temporairement la zone depuis l\'intérieur des combles, sans monter sur le toit.',
      },
    ],
    certifications: [
      'Qualibat (qualification 3111 pour couverture en tuiles)',
      'RGE (pour l\'isolation de toiture)',
      'Compagnons du Devoir (formation d\'excellence)',
      'Certification Qualit\'EnR',
    ],
    averageResponseTime: 'Sous 24h en urgence (fuite), 1 à 2 semaines pour un devis standard',
  },

  macon: {
    slug: 'macon',
    name: 'Maçon',
    priceRange: {
      min: 45,
      max: 70,
      unit: '\u20AC/h',
    },
    commonTasks: [
      'Construction d\'un mur en parpaings : 50 à 80 \u20AC/m²',
      'Coulée d\'une dalle béton (garage, terrasse) : 60 à 120 \u20AC/m²',
      'Ouverture d\'un mur porteur (avec IPN) : 2 500 à 6 000 \u20AC',
      'Construction d\'une extension : 1 200 à 2 000 \u20AC/m²',
      'Réparation de fissures structurelles : 50 à 200 \u20AC/ml',
      'Montage d\'un mur de clôture : 100 à 250 \u20AC/ml',
    ],
    tips: [
      'Pour toute ouverture dans un mur porteur, exigez une étude structurelle réalisée par un bureau d\'études agréé. Le maçon doit suivre les préconisations de l\'ingénieur et poser une poutre (IPN) dimensionnée pour reprendre les charges.',
      'Vérifiez les références du maçon sur des chantiers similaires au vôtre. Un maçon spécialisé en neuf n\'a pas forcément l\'expérience de la rénovation, et inversement.',
      'Les travaux de maçonnerie sont soumis à la garantie décennale obligatoire. Demandez une copie de l\'attestation d\'assurance avant le début du chantier et vérifiez qu\'elle couvre le type de travaux prévus.',
      'Pour une extension ou une construction, une déclaration préalable ou un permis de construire est obligatoire selon la surface. En dessous de 20 m², une déclaration suffit ; au-delà, le permis est requis (seuil porté à 40 m² en zone PLU).',
      'Privilégiez les périodes de printemps et d\'automne pour les travaux de maçonnerie : le béton et le mortier nécessitent des températures comprises entre 5 et 30°C pour une prise optimale.',
    ],
    faq: [
      {
        q: 'Combien coûte la construction d\'une extension de maison ?',
        a: 'Le prix d\'une extension en maçonnerie traditionnelle varie de 1 200 à 2 000 \u20AC/m² selon les finitions, la complexité de la structure et la région. Une extension de 20 m² coûte ainsi entre 24 000 et 40 000 \u20AC. Ce prix comprend les fondations, les murs, la toiture et le clos couvert, mais pas les finitions intérieures.',
      },
      {
        q: 'Peut-on abattre un mur porteur soi-même ?',
        a: 'Absolument pas. L\'ouverture d\'un mur porteur sans étude structurelle préalable et sans professionnel qualifié peut provoquer l\'effondrement partiel ou total du bâtiment. De plus, en copropriété, l\'accord du syndicat est obligatoire. Le coût d\'une ouverture dans un mur porteur (étude + travaux) est de 2 500 à 6 000 \u20AC.',
      },
      {
        q: 'Quelles sont les fondations nécessaires pour un mur de clôture ?',
        a: 'Un mur de clôture en parpaings nécessite une semelle de fondation en béton armé d\'au moins 30 cm de profondeur et 40 cm de largeur, hors gel (50 à 80 cm selon la région). Le maçon doit respecter les règles d\'urbanisme locales (hauteur maximale, retrait par rapport à la limite de propriété).',
      },
    ],
    certifications: [
      'Qualibat (qualification 2111 pour maçonnerie)',
      'RGE (si travaux d\'isolation par l\'extérieur)',
      'NF DTU 20.1 (norme de référence pour la maçonnerie)',
    ],
    averageResponseTime: '3 à 5 jours pour un devis, début des travaux sous 3 à 6 semaines',
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
      'Tonte de pelouse (jardin de 200 m²) : 30 à 60 \u20AC',
      'Taille de haie : 15 à 25 \u20AC/ml',
      'Élagage d\'arbre (hauteur moyenne) : 200 à 600 \u20AC par arbre',
      'Création de jardin (plantations + engazonnement) : 20 à 50 \u20AC/m²',
      'Entretien mensuel d\'un jardin (200 m²) : 100 à 200 \u20AC/mois',
      'Abattage d\'arbre avec dessouchage : 400 à 1 500 \u20AC selon la taille',
    ],
    tips: [
      'Les prestations de jardinage à domicile ouvrent droit à un crédit d\'impôt de 50 % dans la limite de 5 000 \u20AC de dépenses par an (soit 2 500 \u20AC de crédit d\'impôt). Le jardinier doit être déclaré en tant que service à la personne (SAP).',
      'Privilégiez un contrat annuel d\'entretien plutôt que des interventions ponctuelles : le tarif horaire est généralement 20 à 30 % inférieur et le jardinier connaît mieux votre terrain au fil des saisons.',
      'Pour l\'élagage d\'arbres de plus de 7 mètres, faites appel à un élagueur-grimpeur certifié CS (Certificat de Spécialisation) taille et soins des arbres. L\'élagage non professionnel peut tuer l\'arbre et engager votre responsabilité.',
      'Vérifiez que le jardinier évacue les déchets verts ou prévoyez ce poste dans le devis. L\'évacuation et le traitement en déchetterie représentent un coût supplémentaire de 50 à 150 \u20AC par intervention.',
      'Pour la création d\'un jardin, demandez un plan d\'aménagement tenant compte de l\'exposition, du sol et du climat de votre région. Un jardinier-paysagiste saura choisir des plantes adaptées qui nécessiteront moins d\'entretien.',
    ],
    faq: [
      {
        q: 'Puis-je bénéficier d\'un crédit d\'impôt pour les travaux de jardinage ?',
        a: 'Oui, les petits travaux de jardinage (tonte, taille de haies, désherbage, débroussaillage) bénéficient d\'un crédit d\'impôt de 50 % dans la limite de 5 000 \u20AC par an. Le jardinier doit être agréé services à la personne (SAP) ou vous devez passer par un organisme agréé (CESU). Les travaux de création paysagère ne sont pas éligibles.',
      },
      {
        q: 'A-t-on le droit de couper les branches du voisin qui dépassent ?',
        a: 'Non, vous ne pouvez pas couper vous-même les branches de votre voisin qui dépassent sur votre terrain. L\'article 673 du Code civil vous autorise à demander à votre voisin de les couper, et en cas de refus, à saisir le tribunal. Depuis 2023, si votre voisin ne réagit pas sous 2 mois après mise en demeure, vous pouvez faire couper à ses frais.',
      },
      {
        q: 'Quelle est la meilleure période pour tailler les haies ?',
        a: 'La taille principale se fait en fin d\'hiver (février-mars), avant la reprise de végétation. Une seconde taille d\'entretien est recommandée en fin d\'été (septembre). Attention : la taille est interdite du 15 mars au 31 juillet dans les zones agricoles pour protéger la nidification des oiseaux (arrêté du 24 avril 2015).',
      },
      {
        q: 'Quel budget pour l\'entretien annuel d\'un jardin de 500 m² ?',
        a: 'Comptez entre 1 500 et 3 500 \u20AC par an pour un entretien complet comprenant la tonte bimensuelle (avril à octobre), 2 tailles de haie, le désherbage des massifs et le ramassage des feuilles à l\'automne. Ce budget peut être réduit de 50 % grâce au crédit d\'impôt si le jardinier est agréé SAP.',
      },
    ],
    certifications: [
      'CS Taille et soins des arbres (pour l\'élagage)',
      'Agrément Services à la Personne (SAP)',
      'Certiphyto (utilisation de produits phytosanitaires)',
      'CAPA Travaux Paysagers',
    ],
    averageResponseTime: '24 à 48h pour un devis, début des travaux sous 1 à 2 semaines',
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
      'Remplacement d\'un simple vitrage : 60 à 150 \u20AC/m² (fourniture + pose)',
      'Pose de double vitrage : 150 à 350 \u20AC/m²',
      'Remplacement d\'une vitre cassée (standard) : 80 à 200 \u20AC',
      'Survitrage d\'une fenêtre existante : 80 à 150 \u20AC/m²',
      'Pose d\'une crédence en verre (cuisine) : 200 à 500 \u20AC/m²',
      'Installation d\'une paroi de douche en verre : 400 à 1 200 \u20AC',
    ],
    tips: [
      'En cas de vitre cassée, sécurisez la zone avec du carton ou du ruban adhésif en attendant le vitrier. Ne tentez pas de retirer les morceaux de verre à mains nues.',
      'Privilégiez le double vitrage 4/16/4 pour un bon rapport qualité-prix en isolation thermique. Le triple vitrage n\'est justifié que dans les régions très froides.',
      'Demandez au vitrier de vous fournir le coefficient d\'isolation (Ug) du vitrage proposé. Plus ce chiffre est bas, meilleure est l\'isolation : Ug < 1,1 W/m².K pour du bon double vitrage.',
      'Pour une crédence ou une paroi de douche, exigez du verre sécurit (trempé) conforme à la norme EN 12150 : en cas de casse, il se fragmente en petits morceaux non coupants.',
      'Un vitrier d\'urgence peut intervenir pour sécuriser une vitrine commerciale ou une baie vitrée cassée. Vérifiez que le professionnel propose un service de mise en sécurité provisoire.',
    ],
    faq: [
      {
        q: 'Combien coûte le remplacement d\'une vitre cassée ?',
        a: 'Le remplacement d\'une vitre simple coûte entre 80 et 200 \u20AC pour une fenêtre standard (environ 1 m²). Pour du double vitrage, comptez 150 à 350 \u20AC/m² fourniture et pose comprises. Les tarifs augmentent pour les grandes dimensions, les formes spéciales et les interventions en urgence (+50 à 100 %).',
      },
      {
        q: 'Mon assurance couvre-t-elle le remplacement d\'une vitre ?',
        a: 'Oui, si la casse est due à un événement couvert par votre contrat (tempête, vandalisme, cambriolage). La garantie bris de glace, souvent en option, couvre les vitres, miroirs et plaques vitrocéramiques. Déclarez le sinistre sous 5 jours ouvrés et conservez les morceaux de verre si possible.',
      },
      {
        q: 'Double ou triple vitrage : lequel choisir ?',
        a: 'Le double vitrage 4/16/4 avec gaz argon (Ug \u2248 1,1 W/m².K) suffit dans la majorité des cas en France métropolitaine. Le triple vitrage (Ug \u2248 0,6 W/m².K) est recommandé uniquement pour les façades nord en climat continental ou montagnard. Il est plus lourd et plus cher (+40 à 60 %) pour un gain d\'isolation modeste en climat tempéré.',
      },
    ],
    emergencyInfo:
      'En cas de vitre cassée (effraction, tempête, accident), un vitrier d\'urgence peut intervenir sous 1 à 3 heures pour sécuriser l\'ouverture avec un panneau provisoire. Le remplacement définitif se fait généralement sous 24 à 48h. Majorations : +50 à 100 % la nuit et le week-end.',
    certifications: [
      'Qualibat (qualification miroiterie-vitrerie)',
      'Certification Cekal (performance des vitrages isolants)',
      'NF DTU 39 (norme de référence pour la vitrerie)',
    ],
    averageResponseTime: 'Sous 2 heures en urgence, 24 à 48h pour un rendez-vous standard',
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
      'Installation d\'un split mural (2,5 kW) : 1 500 à 3 000 \u20AC',
      'Pose d\'une climatisation gainable : 5 000 à 12 000 \u20AC',
      'Installation d\'une climatisation multi-split (3 unités) : 4 000 à 8 000 \u20AC',
      'Entretien annuel d\'une climatisation : 100 à 200 \u20AC',
      'Recharge de gaz réfrigérant : 200 à 500 \u20AC',
      'Installation d\'une pompe à chaleur air-air : 3 000 à 7 000 \u20AC',
    ],
    tips: [
      'Privilégiez un climaticien certifié RGE et détenteur de l\'attestation de capacité à manipuler les fluides frigorigènes, obligatoire depuis 2015 pour toute intervention sur un circuit frigorifique.',
      'Une pompe à chaleur air-air (climatisation réversible) est plus économique qu\'une climatisation classique : elle consomme 1 kWh d\'électricité pour produire 3 à 4 kWh de chaleur ou de froid (COP de 3 à 4).',
      'Le dimensionnement est crucial : une climatisation trop puissante consomme plus et dégrade le confort (cycles courts). Exigez un bilan thermique avant toute installation.',
      'L\'entretien annuel est obligatoire pour les systèmes contenant plus de 2 kg de fluide frigorigène (la plupart des splits). Le carnet d\'entretien doit être tenu à jour.',
      'Attention au bruit : vérifiez le niveau sonore de l\'unité extérieure (en dB(A)) et respectez les distances réglementaires avec le voisinage. L\'installation d\'une unité extérieure en copropriété nécessite souvent l\'accord de l\'assemblée générale.',
    ],
    faq: [
      {
        q: 'Combien coûte l\'installation d\'une climatisation ?',
        a: 'Un split mural standard (2,5 kW, pour une pièce de 25 m²) coûte entre 1 500 et 3 000 \u20AC pose comprise. Un système multi-split (3 unités intérieures) revient à 4 000 à 8 000 \u20AC. La climatisation gainable (invisible, conduits dans les faux plafonds) coûte 5 000 à 12 000 \u20AC. Les modèles réversibles (chaud/froid) sont plus économiques à l\'usage.',
      },
      {
        q: 'La climatisation réversible est-elle économique pour le chauffage ?',
        a: 'Oui, une pompe à chaleur air-air réversible consomme 3 à 4 fois moins d\'électricité qu\'un radiateur électrique classique grâce à son COP (Coefficient de Performance). Pour un appartement de 60 m², l\'économie est de 300 à 600 \u20AC par an sur la facture de chauffage. L\'investissement est amorti en 3 à 5 ans.',
      },
      {
        q: 'Faut-il une autorisation pour installer une climatisation ?',
        a: 'L\'unité extérieure ne nécessite pas de permis de construire, mais une déclaration préalable peut être exigée dans certaines communes (vérifiez le PLU). En copropriété, l\'accord de l\'assemblée générale est généralement requis. Respectez les réglementations sur le bruit (émergence < 5 dB(A) le jour, < 3 dB(A) la nuit).',
      },
    ],
    emergencyInfo:
      'En cas de panne de climatisation pendant une canicule, un climaticien d\'urgence peut intervenir sous 4 à 12 heures. Vérifiez d\'abord les réglages, le disjoncteur dédié et les filtres (encrassés = perte de performance). En attendant, fermez les volets, aérez la nuit et utilisez un ventilateur.',
    certifications: [
      'RGE (Reconnu Garant de l\'Environnement)',
      'Attestation de capacité fluides frigorigènes',
      'Qualibat',
      'QualiPAC (pompes à chaleur)',
      'Qualifroid',
    ],
    averageResponseTime: 'Sous 6 heures en urgence (canicule), 48 à 72h pour un devis standard',
  },

  cuisiniste: {
    slug: 'cuisiniste',
    name: 'Cuisiniste',
    priceRange: {
      min: 3000,
      max: 15000,
      unit: '\u20AC (cuisine complète)',
    },
    commonTasks: [
      'Cuisine équipée entrée de gamme (5 ml) : 3 000 à 6 000 \u20AC (fourniture + pose)',
      'Cuisine équipée milieu de gamme : 6 000 à 12 000 \u20AC',
      'Cuisine sur mesure haut de gamme : 12 000 à 30 000 \u20AC',
      'Remplacement d\'un plan de travail : 200 à 800 \u20AC/ml selon le matériau',
      'Pose seule d\'une cuisine (hors meubles) : 1 500 à 4 000 \u20AC',
      'Installation d\'un îlot central : 2 000 à 8 000 \u20AC',
    ],
    tips: [
      'Faites réaliser plusieurs plans d\'aménagement avant de vous engager. Un bon cuisiniste propose un plan 3D gratuit et prend en compte vos habitudes culinaires, pas uniquement l\'esthétique.',
      'Vérifiez que le devis inclut tous les postes : meubles, plan de travail, électroménager, plomberie, électricité, crédence et finitions. Les "surprises" représentent souvent 10 à 20 % du budget initial.',
      'Le triangle d\'activité (évier-plaque-réfrigérateur) est la clé d\'une cuisine fonctionnelle : la distance entre chaque point ne doit pas dépasser 2,5 m pour un confort optimal.',
      'Privilégiez les charnières et glissières de marque (Blum, Hettich, Grass) : ce sont les pièces les plus sollicitées et la qualité de la quincaillerie détermine la durabilité de la cuisine.',
      'Demandez la garantie sur les meubles (minimum 5 ans), le plan de travail et la pose. Un cuisiniste sérieux offre un service après-vente et un ajustement des portes après 6 mois d\'utilisation.',
    ],
    faq: [
      {
        q: 'Quel budget prévoir pour une cuisine équipée ?',
        a: 'Pour une cuisine de 5 mètres linéaires, comptez 3 000 à 6 000 \u20AC en entrée de gamme (meubles en mélaminé, électroménager basique), 6 000 à 12 000 \u20AC en milieu de gamme (façades laquées, électroménager de marque) et 12 000 à 30 000 \u20AC pour du haut de gamme ou du sur-mesure. La pose représente 15 à 25 % du budget total.',
      },
      {
        q: 'Combien de temps dure l\'installation d\'une cuisine ?',
        a: 'L\'installation complète (dépose ancienne cuisine, plomberie, électricité, pose des meubles, plan de travail, électroménager et finitions) prend entre 3 et 7 jours ouvrés. Ajoutez 1 à 2 semaines de délai pour la fabrication des meubles sur mesure et 2 à 3 mois pour le haut de gamme.',
      },
      {
        q: 'Quel plan de travail choisir ?',
        a: 'Le stratifié est le plus abordable (50-150 \u20AC/ml) et disponible en nombreux décors. Le bois massif (150-300 \u20AC/ml) est chaleureux mais demande un entretien régulier. Le quartz (250-500 \u20AC/ml) est très résistant et sans entretien. Le granit (300-600 \u20AC/ml) est indestructible. La céramique (400-800 \u20AC/ml) résiste à tout (chaleur, rayures, taches).',
      },
    ],
    certifications: [
      'Qualibat',
      'Label Cuisine Qualité (AFNOR)',
      'Garantie Meubles de France',
    ],
    averageResponseTime: '48 à 72h pour un premier rendez-vous, 4 à 8 semaines pour la livraison',
  },

  solier: {
    slug: 'solier',
    name: 'Solier',
    priceRange: {
      min: 25,
      max: 60,
      unit: '\u20AC/m²',
    },
    commonTasks: [
      'Pose de parquet flottant : 20 à 35 \u20AC/m² (pose uniquement)',
      'Pose de parquet massif collé : 35 à 60 \u20AC/m²',
      'Pose de sol PVC/vinyle en lames ou dalles : 15 à 30 \u20AC/m²',
      'Pose de moquette : 10 à 25 \u20AC/m²',
      'Ragréage du sol (mise à niveau) : 15 à 30 \u20AC/m²',
      'Pose de sol souple linoléum : 20 à 40 \u20AC/m²',
    ],
    tips: [
      'Le ragréage (mise à niveau du support) est souvent indispensable avant la pose d\'un revêtement de sol. Un sol mal préparé est la première cause de désordres. Ce poste peut représenter 15 à 30 \u20AC/m² supplémentaires.',
      'Le parquet contrecollé offre le meilleur compromis entre esthétique (couche d\'usure en bois noble) et stabilité (pas de retrait ni gonflement). Il est compatible avec le chauffage au sol.',
      'Les sols PVC/vinyle nouvelle génération (LVT - Luxury Vinyl Tiles) offrent un rendu très réaliste (imitation bois, pierre) avec une grande résistance à l\'eau et à l\'usure, idéaux pour les salles de bain et cuisines.',
      'Demandez au solier le classement UPEC du revêtement proposé et vérifiez qu\'il correspond à l\'usage de la pièce : U3 P3 minimum pour une entrée ou un couloir, U2 P2 suffisant pour une chambre.',
      'Prévoyez 5 à 10 % de matériau supplémentaire pour les coupes et les raccords. Pour les poses en diagonale ou dans les pièces en L, cette marge monte à 15 %.',
    ],
    faq: [
      {
        q: 'Parquet massif, contrecollé ou stratifié : lequel choisir ?',
        a: 'Le parquet massif (30-80 \u20AC/m²) est le plus noble et durable (ponçable plusieurs fois), mais sensible à l\'humidité. Le contrecollé (25-60 \u20AC/m²) offre le meilleur compromis qualité-prix et convient au chauffage au sol. Le stratifié (10-25 \u20AC/m²) est le moins cher mais ne peut pas être poncé et a une durée de vie limitée (10-15 ans).',
      },
      {
        q: 'Peut-on poser du parquet sur du carrelage existant ?',
        a: 'Oui, à condition que le carrelage soit bien adhérent, plan (tolérance de 2 mm sous la règle de 2 m) et propre. Le solier posera une sous-couche d\'isolation phonique et thermique. Attention : l\'ajout d\'épaisseur (8 à 15 mm) peut nécessiter de raboter les portes et d\'adapter les seuils.',
      },
      {
        q: 'Quel sol choisir pour une salle de bain ?',
        a: 'Les meilleurs choix sont le sol PVC/vinyle (étanche, antidérapant, 15-30 \u20AC/m²), le parquet teck ou bambou (naturellement résistant à l\'eau, 40-70 \u20AC/m²) ou le sol souple linoléum (écologique, antibactérien, 20-40 \u20AC/m²). Évitez le stratifié classique qui gonfle au contact de l\'eau. Le carrelage reste la solution la plus durable.',
      },
    ],
    certifications: [
      'Qualibat (qualification 6411 pour revêtements de sol souples)',
      'Qualibat (qualification 6421 pour parquets)',
      'Certification UPEC (Union Professionnelle de l\'Expertise en Construction)',
    ],
    averageResponseTime: '48 à 72h pour un devis, début des travaux sous 1 à 3 semaines',
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
      'Nettoyage de fin de chantier (appartement 60 m²) : 400 à 800 \u20AC',
      'Nettoyage de copropriété (parties communes) : 200 à 500 \u20AC/mois',
      'Nettoyage de vitres (logement) : 5 à 10 \u20AC/m²',
      'Remise en état après sinistre : 500 à 2 000 \u20AC',
      'Nettoyage de façade (kärcher professionnel) : 10 à 25 \u20AC/m²',
      'Débarras et nettoyage de locaux : 30 à 50 \u20AC/m²',
    ],
    tips: [
      'Pour un nettoyage de fin de chantier, exigez un cahier des charges précis : lessivage des murs, décapage des sols, nettoyage des vitres (intérieur + extérieur), dégraissage de la cuisine et nettoyage des sanitaires.',
      'Vérifiez que l\'entreprise de nettoyage dispose d\'une assurance responsabilité civile professionnelle et que ses salariés sont déclarés (demandez un extrait Kbis et une attestation URSSAF).',
      'Pour le nettoyage régulier de copropriété, un contrat annuel avec un cahier des charges détaillé (fréquence, surfaces, prestations) est plus économique que des interventions ponctuelles.',
      'Les entreprises de nettoyage à domicile agréées services à la personne (SAP) ouvrent droit à un crédit d\'impôt de 50 % dans la limite de 12 000 \u20AC de dépenses par an.',
      'Pour un nettoyage après sinistre (dégât des eaux, incendie), conservez les factures pour votre assurance. La plupart des contrats d\'assurance habitation couvrent ces frais.',
    ],
    faq: [
      {
        q: 'Combien coûte un nettoyage de fin de chantier ?',
        a: 'Pour un appartement de 60 m², comptez 400 à 800 \u20AC selon l\'état des lieux et l\'étendue des travaux réalisés. Pour une maison de 120 m², le budget est de 700 à 1 500 \u20AC. Ce tarif inclut le lessivage des murs, le décapage et lustrage des sols, le nettoyage des vitres et la désinfection des sanitaires.',
      },
      {
        q: 'Puis-je bénéficier d\'un crédit d\'impôt pour le nettoyage ?',
        a: 'Oui, le ménage à domicile bénéficie d\'un crédit d\'impôt de 50 % si l\'entreprise est agréée services à la personne (SAP) ou si vous employez directement une personne via le CESU. Le plafond est de 12 000 \u20AC de dépenses par an (+1 500 \u20AC par enfant à charge). Seul le nettoyage à domicile est éligible, pas le nettoyage professionnel de locaux.',
      },
      {
        q: 'Comment choisir une entreprise de nettoyage fiable ?',
        a: 'Vérifiez le SIRET, l\'inscription au registre du commerce (Kbis), l\'attestation URSSAF à jour et l\'assurance RC professionnelle. Demandez des références clients et consultez les avis en ligne. Une entreprise sérieuse propose un devis gratuit après visite sur site et ne demande jamais de paiement en espèces.',
      },
    ],
    certifications: [
      'Qualipropre (certification du secteur de la propreté)',
      'Agrément Services à la Personne (SAP) pour le ménage à domicile',
      'ISO 14001 (management environnemental)',
      'Écolabel Européen (utilisation de produits écologiques)',
    ],
    averageResponseTime: '24 à 48h pour un devis, intervention sous 3 à 5 jours',
  },
}

/**
 * Récupère le contenu d'un corps de métier par son slug.
 * Retourne undefined si le slug n'existe pas.
 */
export function getTradeContent(slug: string): TradeContent | undefined {
  return tradeContent[slug]
}

/**
 * Récupère tous les slugs de métiers disponibles.
 */
export function getTradesSlugs(): string[] {
  return Object.keys(tradeContent)
}
