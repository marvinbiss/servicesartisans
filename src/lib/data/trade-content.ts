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
      unit: '€/h',
    },
    commonTasks: [
      'Débouchage de canalisation : 80 à 250 € selon la complexité',
      "Remplacement d'un chauffe-eau : 800 à 2 500 € (fourniture + pose)",
      "Réparation de fuite d'eau : 90 à 300 €",
      "Installation d'un WC : 200 à 600 € (hors fourniture)",
      "Pose d'un robinet mitigeur : 80 à 200 € (hors fourniture)",
      "Remplacement d'un ballon d'eau chaude : 600 à 2 000 €",
      'Détection de fuite non destructive (gaz traceur ou caméra thermique) : 150 à 400 €',
      'Rénovation complète plomberie salle de bain (alimentation + évacuation) : 1 500 à 4 000 €',
    ],
    tips: [
      "Vérifiez que le plombier dispose d'une assurance responsabilité civile professionnelle et d'une garantie décennale, obligatoires pour les travaux de plomberie.",
      'Demandez toujours un devis détaillé avant le début des travaux : un professionnel sérieux ne commence jamais sans accord écrit sur le prix.',
      "Privilégiez un plombier certifié RGE si vous envisagez des travaux liés au chauffage ou à l'eau chaude, car cela vous ouvre droit aux aides de l'État (MaPrimeRénov', CEE).",
      "En cas d'urgence, coupez l'arrivée d'eau générale avant l'arrivée du plombier pour limiter les dégâts. Le compteur se trouve souvent dans la cave ou à l'extérieur.",
      "Méfiez-vous des plombiers qui refusent de donner un devis par écrit ou qui exigent un paiement intégral avant intervention : ce sont des signaux d'alerte.",
      "Fermez le robinet d'arrêt général immédiatement si vous constatez une fuite : un joint qui goutte peut gaspiller jusqu'à 100 litres d'eau par jour, soit plus de 35 m³ par an.",
      "Faites vidanger votre chauffe-eau une fois par an et vérifiez le groupe de sécurité chaque mois pour éviter l'accumulation de calcaire et prolonger sa durée de vie de 3 à 5 ans.",
      'Pour un WC suspendu, prévoyez un bâti-support encastré (Geberit ou équivalent) et un mur porteur ou renforcé : le coût total (bâti + cuvette + pose) se situe entre 800 et 2 000 €.',
    ],
    faq: [
      {
        q: 'Combien coûte une intervention de plombier en urgence ?',
        a: "Une intervention d'urgence coûte en moyenne entre 150 et 400 €, avec des majorations possibles la nuit (+50 à 100 %), le week-end (+25 à 50 %) et les jours fériés (+50 à 100 %). Exigez toujours un devis avant que le plombier ne commence les travaux, même en urgence.",
      },
      {
        q: 'Comment savoir si mon plombier est fiable ?',
        a: "Vérifiez son numéro SIRET sur le site de l'INSEE, son inscription au registre des métiers, et demandez une copie de son assurance décennale. Un plombier sérieux fournit ces documents sans difficulté. Consultez également les avis en ligne et demandez des références de chantiers récents.",
      },
      {
        q: 'Quels travaux de plomberie puis-je faire moi-même ?',
        a: "Vous pouvez changer un joint de robinet, remplacer un flexible de douche ou déboucher un siphon avec une ventouse. En revanche, toute intervention sur les canalisations encastrées, le chauffe-eau ou l'arrivée d'eau principale doit être confiée à un professionnel pour des raisons de sécurité et d'assurance.",
      },
      {
        q: 'Le plombier doit-il fournir une facture ?',
        a: "Oui, c'est obligatoire pour toute prestation supérieure à 25 €. La facture doit mentionner le détail des travaux, le prix unitaire des pièces, le taux horaire de la main-d'œuvre et la TVA appliquée (10 % pour la rénovation, 20 % pour le neuf). Conservez-la précieusement pour la garantie.",
      },
      {
        q: "Que faire en cas de fuite d'eau la nuit ?",
        a: "Coupez immédiatement l'arrivée d'eau au compteur général, généralement situé dans la cave ou à l'extérieur du logement. Placez des récipients sous la fuite et épongez l'eau stagnante pour limiter les dégâts. Contactez ensuite un plombier d'urgence ; les majorations nocturnes et de week-end varient de 50 à 100 % du tarif de base.",
      },
      {
        q: 'Comment déboucher un évier naturellement ?',
        a: "Versez un mélange de bicarbonate de soude (6 cuillères à soupe) et de vinaigre blanc (25 cl) dans la canalisation, laissez agir 30 minutes puis rincez à l'eau bouillante. Si le bouchon persiste, utilisez une ventouse ou un furet manuel. Si ces méthodes échouent, faites appel à un plombier qui pourra utiliser un furet électrique ou un hydrocurage.",
      },
      {
        q: "Quel est le coût d'un remplacement de chauffe-eau ?",
        a: "Le remplacement d'un chauffe-eau électrique de 200 litres coûte entre 800 et 1 500 € (fourniture + pose), tandis qu'un chauffe-eau thermodynamique revient à 2 500 à 4 500 €. Le prix dépend du type (électrique, gaz, thermodynamique, solaire), de la capacité et de l'accessibilité de l'installation. Un chauffe-eau thermodynamique permet d'économiser 40 à 50 % sur la facture d'eau chaude par rapport à un chauffe-eau électrique classique (source : ADEME).",
      },
      {
        q: "Quelle est la durée de vie d'une installation de plomberie ?",
        a: "Les canalisations en cuivre durent 50 à 80 ans, celles en PER (polyéthylène réticulé) environ 50 ans, tandis que les tuyaux en plomb (interdits depuis 1995) doivent être remplacés. Un chauffe-eau a une durée de vie de 10 à 15 ans et les robinetteries de 15 à 20 ans. Un entretien régulier (détartrage, vérification des joints) prolonge significativement la durée de vie de l'installation.",
      },
    ],
    emergencyInfo:
      "En cas de fuite d'eau importante ou de canalisation bouchée, coupez immédiatement l'arrivée d'eau au compteur général et contactez un plombier d'urgence. Certains professionnels proposent des interventions en soirée ou le week-end. Les tarifs d'urgence sont majorés de 50 à 100 % par rapport à une intervention en journée.",
    certifications: [
      'Qualibat (qualification 5111/5112 plomberie sanitaire)',
      "RGE (Reconnu Garant de l'Environnement)",
      'PG (Professionnel du Gaz — obligatoire pour les installations gaz)',
      'Qualigaz (certificat de conformité gaz)',
      'QualiPAC (pompes à chaleur)',
      'QualiSol (chauffe-eau solaire)',
      "Agrément ACS (Attestation de Conformité Sanitaire — matériaux en contact avec l'eau potable)",
      'Certification Qualipac (installation de pompes à chaleur eau/eau)',
    ],
    averageResponseTime:
      'Urgence (fuite, bouchon) : délai variable selon disponibilité ; travaux planifiés sous 1 à 2 semaines',
  },

  electricien: {
    slug: 'electricien',
    name: 'Électricien',
    priceRange: {
      min: 50,
      max: 80,
      unit: '€/h',
    },
    commonTasks: [
      "Mise aux normes d'un tableau électrique : 800 à 2 500 €",
      "Installation d'un point lumineux : 80 à 200 €",
      "Pose d'une prise électrique supplémentaire : 60 à 150 €",
      "Remplacement d'un interrupteur différentiel : 150 à 350 €",
      "Installation d'un interphone ou visiophone : 300 à 1 200 €",
      "Réfection complète de l'électricité d'un appartement (60 m²) : 5 000 à 10 000 €",
      "Installation d'un système domotique (éclairage, volets) : 1 500 à 5 000 €",
      'Pose de volets roulants électriques (par volet) : 400 à 900 €',
    ],
    tips: [
      "Assurez-vous que l'électricien respecte la norme NF C 15-100, obligatoire pour toute installation électrique en France. Demandez un certificat de conformité Consuel à la fin des travaux.",
      "Comparez au moins trois devis en vérifiant que chacun détaille les fournitures, la main-d'œuvre et le coût des mises en conformité éventuelles.",
      "Choisissez un électricien certifié IRVE si vous souhaitez installer une borne de recharge pour véhicule électrique : c'est obligatoire pour bénéficier des aides. Note : le crédit d'impôt pour borne de recharge a été supprimé au 1er janvier 2026.",
      "Avant toute intervention, vérifiez que l'électricien possède une habilitation électrique valide (B1, B2 ou BR selon le type de travaux).",
      "Pour des travaux de rénovation énergétique (chauffage électrique performant, VMC), un électricien RGE est indispensable pour obtenir les aides financières de l'État.",
      "Coupez toujours le disjoncteur général avant toute intervention sur votre installation électrique, même pour un simple changement de prise ou d'interrupteur.",
      "Demandez systématiquement l'attestation de conformité Consuel après des travaux importants : c'est votre preuve en cas de sinistre auprès de l'assurance.",
      'Conservez le schéma de votre tableau électrique et le plan de câblage : ils facilitent les interventions futures et sont exigés lors de la revente du logement.',
    ],
    faq: [
      {
        q: "Ma maison est ancienne, faut-il refaire toute l'électricité ?",
        a: 'Pas nécessairement, mais un diagnostic électrique est fortement recommandé pour les installations de plus de 15 ans. Un électricien qualifié évaluera la conformité à la norme NF C 15-100 et proposera les mises à niveau nécessaires. Une rénovation partielle (tableau, prises de terre, différentiels) coûte entre 1 500 et 4 000 € selon la surface.',
      },
      {
        q: "Combien coûte l'installation d'une borne de recharge pour voiture électrique ?",
        a: "L'installation d'une borne de recharge domestique (wallbox 7 kW) coûte entre 1 200 et 2 500 € pose comprise. Note : le crédit d'impôt pour borne de recharge a été supprimé au 1er janvier 2026. Faites appel à un électricien certifié IRVE. Le délai d'installation est généralement de 1 à 3 jours.",
      },
      {
        q: "Qu'est-ce que le certificat Consuel et est-il obligatoire ?",
        a: "Le Consuel (Comité National pour la Sécurité des Usagers de l'Électricité) délivre une attestation de conformité électrique. Il est obligatoire pour toute nouvelle installation ou rénovation complète avant la mise sous tension par Enedis. Le coût est d'environ 120 à 180 € selon le type d'installation.",
      },
      {
        q: 'Comment savoir si mon installation électrique est aux normes ?',
        a: "Faites réaliser un diagnostic électrique par un électricien certifié ou un diagnostiqueur agréé. Ce contrôle vérifie la conformité à la norme NF C 15-100 : présence d'un disjoncteur différentiel 30 mA, mise à la terre, protection des circuits et état des prises. Ce diagnostic est obligatoire pour la vente d'un logement de plus de 15 ans et coûte entre 100 et 200 €.",
      },
      {
        q: 'Quand faut-il refaire le tableau électrique ?',
        a: "Le remplacement du tableau est nécessaire si votre installation a plus de 25 ans, si le tableau comporte encore des fusibles à broche, s'il n'y a pas de disjoncteur différentiel 30 mA ou si vous ajoutez des équipements énergivores (borne de recharge, pompe à chaleur). Le coût d'un tableau neuf aux normes est de 800 à 2 500 € selon le nombre de circuits.",
      },
      {
        q: 'Les travaux électriques nécessitent-ils une mise aux normes complète ?',
        a: "Non, la mise aux normes complète n'est obligatoire que pour une construction neuve ou une rénovation totale. Pour des travaux partiels, seuls les circuits concernés doivent respecter la norme NF C 15-100 en vigueur. Toutefois, l'électricien doit s'assurer que les travaux ne créent pas de danger sur le reste de l'installation.",
      },
      {
        q: 'Combien de prises électriques faut-il par pièce ?',
        a: 'La norme NF C 15-100 impose un minimum de 5 prises dans un séjour de moins de 28 m² (7 au-delà), 3 prises dans une chambre, 6 prises dans une cuisine (dont 4 au-dessus du plan de travail) et 1 prise dans les toilettes. Chaque prise doit être alimentée par un circuit protégé par un disjoncteur adapté (16 A ou 20 A).',
      },
      {
        q: 'Peut-on faire soi-même des travaux électriques dans son logement ?',
        a: "Légalement, un particulier peut réaliser des travaux électriques dans son propre logement, mais il engage sa responsabilité en cas d'accident ou d'incendie. L'attestation Consuel sera exigée pour le raccordement au réseau. Pour des raisons de sécurité et d'assurance, il est vivement recommandé de confier les travaux à un électricien qualifié, surtout pour le tableau et les circuits principaux.",
      },
    ],
    emergencyInfo:
      "En cas de panne électrique, de fils dénudés ou d'odeur de brûlé, coupez immédiatement le disjoncteur général et appelez un électricien d'urgence. Ne tentez jamais de réparer vous-même un problème électrique. Un électricien d'astreinte peut intervenir selon sa disponibilité, avec une majoration de 50 à 100 % en dehors des heures ouvrées.",
    certifications: [
      'Qualifelec (qualification E1 à E3 selon le niveau de compétence)',
      "RGE (Reconnu Garant de l'Environnement)",
      'Qualification IRVE (obligatoire pour les bornes de recharge)',
      'Habilitation électrique (B1, B2, BR, HC — obligatoire)',
      'Qualibat (qualification 5411/5412 installations électriques)',
      'Consuel (attestation de conformité électrique)',
      'Habilitation B2V (travaux au voisinage de pièces nues sous tension)',
      'Certification NF Habitat (installations électriques résidentielles)',
    ],
    averageResponseTime:
      'Urgence (panne, court-circuit) : délai variable selon disponibilité ; travaux planifiés sous 1 à 2 semaines',
  },

  serrurier: {
    slug: 'serrurier',
    name: 'Serrurier',
    priceRange: {
      min: 80,
      max: 150,
      unit: '€/intervention',
    },
    commonTasks: [
      'Ouverture de porte claquée (sans effraction) : 80 à 150 €',
      'Ouverture de porte blindée : 150 à 400 €',
      'Changement de serrure standard : 100 à 300 € (fourniture incluse)',
      "Pose d'une serrure multipoints : 300 à 800 €",
      'Blindage de porte existante : 800 à 2 000 €',
      "Installation d'une porte blindée complète : 1 500 à 4 500 €",
      'Copie de clé standard ou haute sécurité : 5 à 80 € selon le type',
      "Installation d'une serrure connectée : 200 à 600 € (fourniture + pose)",
    ],
    tips: [
      'En cas de porte claquée, ne paniquez pas : un serrurier qualifié peut ouvrir sans dégradation dans la majorité des cas. Ne faites jamais appel à un dépanneur trouvé sur un prospectus dans votre boîte aux lettres.',
      'Exigez un devis ferme et définitif avant toute intervention, y compris en urgence. La loi oblige le serrurier à vous remettre un devis écrit pour toute prestation dépassant 150 €.',
      "Méfiez-vous des serruriers qui annoncent des prix très bas par téléphone puis gonflent la facture une fois sur place. Vérifiez les avis en ligne et le numéro SIRET avant d'appeler.",
      "Privilégiez les serruriers ayant une adresse physique vérifiable (atelier ou magasin). C'est un gage de sérieux et de recours possible en cas de problème.",
      'Après un cambriolage, faites intervenir la police avant le serrurier. Vous aurez besoin du dépôt de plainte pour votre assurance, et il ne faut pas toucher à la scène.',
      "Gardez toujours un double de clé chez un voisin de confiance ou dans un boîtier à code sécurisé. Cela vous évitera des frais d'ouverture de porte en cas d'oubli.",
      "Ne laissez jamais la clé sur la porte, même à l'intérieur : en cas de porte claquée, le serrurier devra percer le cylindre si la clé bloque l'accès, ce qui augmente considérablement le coût.",
      'Photographiez le recto de votre carte de propriété de clé (numéro gravé sur la clé ou la carte fournie). Ce numéro permet au serrurier de reproduire votre clé haute sécurité sans démonter la serrure.',
    ],
    faq: [
      {
        q: 'Combien coûte une ouverture de porte le dimanche ou la nuit ?',
        a: "Une ouverture de porte en horaires non ouvrés (nuit, dimanche, jours fériés) coûte entre 150 et 350 € pour une porte standard, et entre 250 et 500 € pour une porte blindée. Les majorations de nuit (entre 20h et 6h) vont de 50 à 100 % du tarif de base. Demandez toujours le prix total avant que le serrurier n'intervienne.",
      },
      {
        q: 'Quelle serrure choisir pour sécuriser mon logement ?',
        a: "Pour une sécurité optimale, optez pour une serrure certifiée A2P (Assurance Prévention Protection). Il existe 3 niveaux : A2P* (résistance de 5 min à l'effraction), A2P** (10 min) et A2P*** (15 min). Les assureurs exigent souvent un niveau A2P** minimum. Comptez 200 à 600 € pour la serrure et 100 à 200 € pour la pose.",
      },
      {
        q: 'Mon assurance prend-elle en charge les frais de serrurier ?',
        a: "Oui, la plupart des contrats d'assurance habitation couvrent les frais de serrurier en cas de cambriolage, de perte de clés ou de porte claquée, souvent dans le cadre de la garantie assistance. Vérifiez votre contrat et contactez votre assureur avant l'intervention si possible. Conservez la facture et le devis pour le remboursement.",
      },
      {
        q: 'Comment éviter les arnaques aux serruriers ?',
        a: "Vérifiez le SIRET de l'entreprise, recherchez des avis en ligne et privilégiez le bouche-à-oreille. Refusez toute intervention sans devis préalable écrit. Un serrurier honnête accepte toujours de détailler ses tarifs. En cas de doute, contactez la DGCCRF (Direction Générale de la Concurrence) au 0809 540 550.",
      },
      {
        q: 'Mon assurance couvre-t-elle un changement de serrure après un cambriolage ?',
        a: 'Oui, la garantie vol de votre assurance habitation prend généralement en charge le remplacement de la serrure et la réparation de la porte après un cambriolage. Vous devez déposer plainte au commissariat, déclarer le sinistre sous 2 jours ouvrés et conserver la facture du serrurier. Le remboursement se fait sur présentation de ces justificatifs, souvent sans franchise.',
      },
      {
        q: 'Combien de temps faut-il pour ouvrir une porte claquée ?',
        a: "Un serrurier expérimenté ouvre une porte claquée (non verrouillée à clé) en 5 à 15 minutes sans abîmer la serrure, grâce à des outils spécialisés (crochet, by-pass, radio). Pour une porte verrouillée ou blindée, l'intervention peut prendre 30 minutes à 1 heure. Si le cylindre doit être percé, le remplacement de la serrure sera nécessaire.",
      },
      {
        q: 'Quelle est la différence entre une serrure 3 points et 5 points ?',
        a: "Une serrure 3 points verrouille la porte en trois endroits (haut, milieu, bas) et offre un niveau de sécurité correct pour un appartement. La serrure 5 points ajoute deux points latéraux pour une résistance accrue à l'effraction, recommandée pour les maisons et les rez-de-chaussée. Les assureurs exigent souvent un minimum de 3 points avec certification A2P pour les logements.",
      },
      {
        q: "Peut-on changer une serrure de porte d'entrée en copropriété ?",
        a: "Vous pouvez librement changer le cylindre (barillet) de votre porte d'entrée privative sans autorisation. En revanche, modifier la serrure de la porte d'entrée de l'immeuble nécessite l'accord du syndic de copropriété. Si vous êtes locataire, vous pouvez changer la serrure à vos frais mais devez remettre l'ancienne en quittant le logement.",
      },
    ],
    emergencyInfo:
      "En cas de porte claquée ou de serrure cassée, un serrurier d'urgence intervient dans les meilleurs délais (délai variable selon disponibilité et localisation). Attention aux majorations : +50 % en soirée (après 19h), +75 à 100 % la nuit (après 22h), le dimanche et les jours fériés. Exigez toujours un devis écrit avant le début de l'intervention.",
    certifications: [
      "Certification A2P (1 à 3 étoiles — résistance à l'effraction, délivrée par le CNPP)",
      'Qualibat (qualification 4421 serrurerie)',
      'CQP Serrurier-dépanneur (Certificat de Qualification Professionnelle)',
      'Certification FMSD (Serrurier dépanneur-installateur, inscrite au RNCP)',
      'Certification A2P Service (installateur agréé par le CNPP pour la pose de serrures certifiées)',
      'Label Serrurier de Confiance (délivré par la Fédération Française des Constructeurs de Serrures)',
      'Qualification Qualibat 4413 (fermetures industrielles et serrurerie de bâtiment)',
      'Assurance décennale et responsabilité civile professionnelle obligatoires',
    ],
    averageResponseTime:
      'Urgence (porte claquée, effraction) : délai variable selon disponibilité et localisation',
  },

  chauffagiste: {
    slug: 'chauffagiste',
    name: 'Chauffagiste',
    priceRange: {
      min: 60,
      max: 100,
      unit: '€/h',
    },
    commonTasks: [
      'Entretien annuel de chaudière gaz : 100 à 200 €',
      "Remplacement d'une chaudière gaz à condensation : 3 000 à 7 000 € (fourniture + pose)",
      "Installation d'une pompe à chaleur air-eau : 8 000 à 15 000 €",
      "Désembouage d'un circuit de chauffage : 400 à 900 €",
      'Remplacement de radiateurs : 300 à 800 € par radiateur (fourniture + pose)',
      "Installation d'un plancher chauffant : 50 à 100 €/m²",
      "Installation d'un thermostat connecté : 150 à 450 € (fourniture + pose)",
      "Dépannage et remise en service du chauffage central : 150 à 350 € (déplacement + main-d'œuvre)",
    ],
    tips: [
      "L'entretien annuel de votre chaudière est obligatoire par la loi (décret du 9 juin 2009). Prévoyez-le à l'automne, avant la saison de chauffe, pour éviter les pannes en plein hiver.",
      "Privilégiez un chauffagiste certifié RGE pour bénéficier des aides financières : MaPrimeRénov' (jusqu'à 5 000 € pour une pompe à chaleur), CEE, éco-prêt à taux zéro et TVA à 5,5 %. Attention : depuis le 1er mars 2025, les chaudières gaz et fioul sont soumises à la TVA à 20 % (fin du taux réduit). La TVA réduite (5,5 % ou 10 %) s'applique uniquement aux équipements non fossiles (PAC, chaudière biomasse, etc.).",
      "Comparez les performances énergétiques (COP pour les pompes à chaleur, rendement pour les chaudières) et pas seulement le prix d'achat. Une chaudière à condensation consomme 15 à 30 % de moins qu'une ancienne chaudière non-condensation (plus de 15 ans).",
      "Demandez un bilan thermique complet avant l'installation d'un nouveau système de chauffage. Un bon chauffagiste dimensionne l'installation en fonction de la surface, de l'isolation et de la zone climatique.",
      "Souscrivez un contrat d'entretien annuel : il coûte entre 120 et 250 € par an et inclut généralement la visite obligatoire, le dépannage prioritaire et les pièces d'usure.",
      "Ne baissez pas le chauffage en dessous de 16 °C la nuit : la relance du matin consomme plus d'énergie que le maintien d'une température modérée. L'ADEME recommande 17 °C dans les chambres et 19 °C dans les pièces de vie.",
      "Purgez vos radiateurs chaque automne avant la remise en route du chauffage. L'air emprisonné dans le circuit réduit l'efficacité de chauffe et peut provoquer des bruits de circulation désagréables.",
      "Un thermostat connecté (Netatmo, Tado, Honeywell) permet de programmer le chauffage pièce par pièce et de le piloter à distance. L'économie constatée est de 15 à 25 % sur la facture de chauffage selon l'ADEME.",
    ],
    faq: [
      {
        q: 'Quand dois-je remplacer ma chaudière ?',
        a: 'Une chaudière a une durée de vie moyenne de 15 à 20 ans. Les signes qui doivent alerter : pannes fréquentes, surconsommation de gaz, bruits inhabituels, eau pas assez chaude. Si votre chaudière a plus de 15 ans, un remplacement par un modèle à condensation vous fera économiser 20 à 30 % sur votre facture énergétique.',
      },
      {
        q: 'Pompe à chaleur ou chaudière gaz : que choisir ?',
        a: "La pompe à chaleur air-eau est plus écologique et bénéficie de plus d'aides (MaPrimeRénov' jusqu'à 5 000 €), mais son coût d'installation est plus élevé (8 000 à 15 000 € contre 3 000 à 7 000 € pour une chaudière gaz). Elle est idéale pour les maisons bien isolées. La chaudière gaz à condensation reste pertinente en appartement ou si le réseau de gaz est déjà installé.",
      },
      {
        q: "Les aides de l'État pour le chauffage sont-elles cumulables ?",
        a: "Oui, sous conditions de revenus et avec un artisan RGE. Vous pouvez cumuler MaPrimeRénov', les CEE (Certificats d'Économies d'Énergie), l'éco-prêt à taux zéro (jusqu'à 50 000 €) et la TVA réduite à 5,5 %. Le montant total peut couvrir 50 à 90 % du coût des travaux pour les ménages modestes. Attention : depuis le 1er mars 2025, les chaudières gaz et fioul sont soumises à la TVA à 20 % (fin du taux réduit). La TVA réduite (5,5 % ou 10 %) s'applique uniquement aux équipements non fossiles (PAC, chaudière biomasse, etc.).",
      },
      {
        q: 'Ma chaudière est en panne en plein hiver, que faire ?',
        a: "Vérifiez d'abord les éléments simples : thermostat, pression du circuit (entre 1 et 1,5 bar), disjoncteur dédié. Si le problème persiste, appelez un chauffagiste en urgence. Les délais varient selon les disponibilités et votre localisation. Si vous avez un contrat d'entretien, le dépannage est souvent inclus ou prioritaire.",
      },
      {
        q: "L'entretien annuel de la chaudière est-il vraiment obligatoire ?",
        a: "Oui, l'entretien annuel est obligatoire depuis le décret du 9 juin 2009 pour toutes les chaudières (gaz, fioul, bois) d'une puissance de 4 à 400 kW. Le chauffagiste vérifie la combustion, nettoie les composants et mesure les émissions de CO. Il remet une attestation d'entretien, exigée par l'assurance en cas de sinistre. Le coût est de 100 à 200 €.",
      },
      {
        q: 'Comment purger correctement ses radiateurs ?',
        a: "La purge des radiateurs doit se faire chaque année avant la saison de chauffe. Ouvrez la vis de purge en haut du radiateur avec une clé spéciale, laissez l'air s'échapper jusqu'à ce que de l'eau coule, puis refermez. Commencez par le radiateur le plus proche de la chaudière. Après la purge, vérifiez la pression du circuit (1 à 1,5 bar) et ajoutez de l'eau si nécessaire.",
      },
      {
        q: "Quel est le coût d'un plancher chauffant ?",
        a: "L'installation d'un plancher chauffant hydraulique coûte entre 50 et 100 €/m² (pose uniquement) et entre 70 et 120 €/m² pour un système électrique. Pour une maison de 100 m², le budget total (fourniture + pose) est de 8 000 à 15 000 €. Le plancher chauffant offre un confort supérieur aux radiateurs et permet des économies d'énergie de 10 à 15 %.",
      },
      {
        q: "Faut-il un contrat d'entretien pour sa chaudière ?",
        a: "Le contrat d'entretien n'est pas obligatoire mais vivement recommandé. Il coûte entre 120 et 250 € par an et inclut la visite annuelle obligatoire, le dépannage prioritaire (souvent sous 24h) et parfois les pièces d'usure. Sans contrat, une intervention d'urgence coûte 150 à 350 € avec des délais plus longs, surtout en plein hiver.",
      },
    ],
    emergencyInfo:
      "En cas de panne de chauffage en hiver, contactez un chauffagiste d'urgence : les délais d'intervention varient selon les disponibilités et la localisation. En cas d'odeur de gaz, ouvrez les fenêtres, ne touchez pas aux interrupteurs électriques, quittez le logement et appelez immédiatement le numéro d'urgence GRDF : 0 800 47 33 33 (gratuit, 24h/24).",
    certifications: [
      "RGE (Reconnu Garant de l'Environnement)",
      'Qualibat (qualification 5211/5212 chauffage)',
      'PG (Professionnel du Gaz — obligatoire pour les installations gaz)',
      'Qualigaz (certificat de conformité gaz)',
      'QualiPAC (pompes à chaleur)',
      'QualiBois (chauffage bois : poêles, chaudières)',
      'Qualifioul (installations fioul)',
      'QualiSol (chauffe-eau solaire)',
    ],
    averageResponseTime:
      'Urgence : délai variable selon disponibilité ; entretien sur rendez-vous sous 1 à 2 semaines',
  },

  'peintre-en-batiment': {
    slug: 'peintre-en-batiment',
    name: 'Peintre en bâtiment',
    priceRange: {
      min: 25,
      max: 45,
      unit: '€/m²',
    },
    commonTasks: [
      "Peinture d'une pièce (murs + plafond, 12 m²) : 400 à 800 €",
      'Ravalement de façade (enduit + peinture) : 40 à 100 €/m²',
      'Pose de papier peint : 15 à 35 €/m² (hors fourniture)',
      'Laquage de boiseries et portes : 30 à 60 €/m²',
      'Traitement et peinture de volets : 50 à 120 € par volet',
      'Peinture de plafond seul : 18 à 35 €/m²',
      'Peinture de façade extérieure (hors ravalement complet) : 25 à 50 €/m²',
      'Enduit de lissage sur murs abîmés : 15 à 30 €/m²',
    ],
    tips: [
      "Un bon peintre commence toujours par une préparation minutieuse des surfaces : lessivage, ponçage, rebouchage des fissures et application d'une sous-couche. Cette étape représente 60 % du travail et garantit un résultat durable.",
      'Demandez au peintre de préciser la marque et la gamme de peinture utilisée. Les peintures professionnelles (Tollens, Sikkens, Zolpan) offrent un meilleur rendu et une meilleure tenue que les premiers prix de grande surface.',
      'Pour un ravalement de façade, vérifiez que le peintre possède une garantie décennale, car les travaux extérieurs engagent la responsabilité du professionnel pendant 10 ans.',
      'Le devis doit indiquer le nombre de couches prévues (minimum 2 pour un résultat optimal), le type de finition (mat, satiné, brillant) et si la préparation des supports est incluse.',
      "Privilégiez les peintures à faible émission de COV (Composés Organiques Volatils), identifiées par le label A+ sur l'étiquette, surtout pour les chambres et les pièces de vie.",
      "Aérez abondamment la pièce pendant et après les travaux de peinture (au moins 24 à 48 h), même avec des peintures acryliques à l'eau qui émettent moins de solvants que les glycéro.",
      'Préparer les murs (rebouchage, ponçage, sous-couche) représente 50 % du résultat final : ne négligez jamais cette étape et vérifiez que le peintre la détaille bien dans son devis.',
      "Demandez à votre peintre de vous présenter un nuancier RAL ou NCS afin de valider la teinte exacte avant le chantier : l'écran d'un téléphone ne restitue pas fidèlement les couleurs.",
    ],
    faq: [
      {
        q: "Combien coûte la peinture d'un appartement complet ?",
        a: "Pour un appartement de 60 m², comptez entre 2 500 et 5 000 € pour la peinture de toutes les pièces (murs et plafonds), fournitures incluses. Le prix varie selon l'état des murs (plus de préparation = plus cher), le nombre de couleurs et la qualité de la peinture choisie. Demandez au moins 3 devis pour comparer.",
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
        a: "Pour un appartement de 60 m², comptez 5 à 8 jours de travail incluant la préparation, l'application de 2 couches et les finitions. Le délai peut être plus long si les murs nécessitent d'importants travaux de préparation (rebouchage, enduit, ponçage).",
      },
      {
        q: 'Comment bien préparer les murs avant de peindre ?',
        a: "La préparation comprend le lessivage à la lessive Saint-Marc pour dégraisser, le rebouchage des trous et fissures à l'enduit, le ponçage au papier de verre grain 120, et l'application d'une sous-couche d'accrochage. Sur un mur neuf en plâtre, une sous-couche spéciale est indispensable pour éviter que la peinture ne cloque. Cette étape représente 60 % du temps total des travaux.",
      },
      {
        q: 'Quelle peinture choisir pour une salle de bain ?',
        a: "Optez pour une peinture acrylique spéciale pièces humides, résistante à l'humidité et aux moisissures (classe 1 ou 2 selon la norme ISO 11998). Les marques professionnelles comme Tollens, Sikkens ou Zolpan proposent des gammes dédiées. Comptez 30 à 50 € le litre en qualité professionnelle. Évitez les peintures glycéro dans les pièces de vie en raison de leurs émanations de COV.",
      },
      {
        q: 'La peinture de façade nécessite-t-elle une autorisation ?',
        a: "Oui, un ravalement de façade nécessite une déclaration préalable de travaux en mairie si vous modifiez l'aspect extérieur (couleur, enduit). En zone protégée (ABF), l'accord de l'Architecte des Bâtiments de France est requis, ce qui peut limiter le choix des couleurs. Certaines communes imposent un ravalement tous les 10 ans (Paris, par exemple) et peuvent émettre un arrêté si la façade est dégradée.",
      },
      {
        q: 'Combien de couches de peinture faut-il appliquer ?',
        a: "Deux couches de peinture de finition sont le minimum pour un résultat homogène et durable. Sur un support neuf ou un changement de couleur radical (clair vers foncé), une sous-couche plus deux couches de finition sont nécessaires. Chaque couche doit sécher complètement (4 à 6 heures pour une acrylique) avant l'application de la suivante.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la peinture en bâtiment. Prenez rendez-vous pour un devis gratuit sous 48h et une intervention planifiée sous 1 à 3 semaines.",
    certifications: [
      'Qualibat (qualification 6111/6112 peinture et ravalement)',
      "RGE (obligatoire si ITE — isolation thermique par l'extérieur)",
      'ACQPA (qualification peinture anticorrosion — ouvrages métalliques)',
      "Compagnons du Devoir (formation d'excellence)",
      'Certification AFNOR NF Environnement (peintures et vernis écologiques)',
      "Label Artisan d'Art (spécialiste en peinture décorative, faux bois, patines)",
      'Assurance décennale (obligatoire pour tous travaux de peinture extérieure et ravalement)',
      "Certification IREF (Institut de Recherche et d'Études sur la Finition)",
    ],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 3 semaines',
  },

  menuisier: {
    slug: 'menuisier',
    name: 'Menuisier',
    priceRange: {
      min: 45,
      max: 75,
      unit: '€/h',
    },
    commonTasks: [
      "Pose d'une fenêtre double vitrage PVC : 300 à 800 € (hors fourniture)",
      "Fabrication et pose d'un placard sur mesure : 800 à 3 000 €",
      "Pose d'une porte intérieure : 150 à 400 € (hors fourniture)",
      "Installation d'une cuisine aménagée : 1 500 à 5 000 € (pose uniquement)",
      "Création d'un escalier sur mesure : 3 000 à 10 000 €",
      'Pose de parquet massif ou contrecollé : 30 à 70 €/m² (pose uniquement)',
      'Menuiserie extérieure (volets battants, portail bois) : 500 à 3 500 € selon dimensions',
      'Habillage et aménagement de sous-pente : 600 à 2 500 € selon surface et finitions',
    ],
    tips: [
      "Distinguez le menuisier d'agencement (placards, cuisines, dressings sur mesure) du menuisier poseur (fenêtres, portes, parquet). Choisissez le spécialiste adapté à votre projet pour un résultat optimal.",
      "Pour le remplacement de fenêtres, un menuisier certifié RGE est indispensable pour bénéficier de MaPrimeRénov' et des CEE. La pose doit respecter le DTU 36.5 pour garantir l'étanchéité.",
      'Demandez à voir des réalisations précédentes du menuisier, surtout pour du mobilier sur mesure. Les photos de chantiers terminés sont un bon indicateur de la qualité du travail.',
      "Vérifiez que le devis précise l'essence de bois utilisée (chêne, hêtre, sapin, bois exotique) et son origine. Le label PEFC ou FSC garantit un bois issu de forêts gérées durablement.",
      'Pour des fenêtres ou des volets, comparez les performances thermiques (coefficient Uw en W/m².K) et pas uniquement le prix. Un bon vitrage isolant se rentabilise en économies de chauffage.',
      'Choisissez du bois certifié PEFC ou FSC pour garantir une provenance durable. Ces labels assurent que le bois est issu de forêts gérées de manière responsable, un argument de qualité pour vos menuiseries.',
      'Un escalier en bois massif (chêne, hêtre, frêne) se patine naturellement avec le temps et gagne en caractère. Appliquez un vitrificateur mat pour le protéger tout en conservant son aspect naturel.',
      "Faites poser vos fenêtres par un menuisier certifié RGE pour bénéficier des aides à la rénovation énergétique (MaPrimeRénov', CEE, éco-PTZ). Sans cette certification, aucune subvention ne sera accordée.",
    ],
    faq: [
      {
        q: "Combien coûte le remplacement de toutes les fenêtres d'une maison ?",
        a: "Pour une maison standard avec 8 à 12 fenêtres, comptez entre 5 000 et 15 000 € selon le matériau (PVC : le moins cher, aluminium : intermédiaire, bois : le plus cher) et le type de vitrage. Avec les aides (MaPrimeRénov' + CEE), la facture peut être réduite de 30 à 50 % pour les ménages modestes.",
      },
      {
        q: 'Bois, PVC ou aluminium : quel matériau choisir pour mes fenêtres ?',
        a: "Le PVC offre le meilleur rapport qualité-prix et une bonne isolation (à partir de 300 € la fenêtre). Le bois est le plus esthétique et isolant mais nécessite un entretien régulier (à partir de 500 €). L'aluminium est fin, moderne et sans entretien, mais moins isolant (à partir de 450 €). Le mixte bois-alu combine les avantages des deux.",
      },
      {
        q: 'Faut-il un permis de construire pour changer les fenêtres ?',
        a: "Non, mais une déclaration préalable de travaux en mairie est obligatoire si vous modifiez l'aspect extérieur de la façade (forme, couleur, matériau des fenêtres). En zone protégée (ABF, sites classés), l'accord de l'Architecte des Bâtiments de France est nécessaire. Les délais d'instruction sont de 1 à 2 mois.",
      },
      {
        q: 'Combien coûte un dressing ou placard sur mesure ?',
        a: "Un placard sur mesure avec portes coulissantes coûte entre 800 et 3 000 € selon les dimensions, le matériau (mélaminé, bois massif, laqué) et les aménagements intérieurs (tiroirs, penderies, étagères). Un dressing complet avec éclairage intégré peut atteindre 5 000 à 8 000 €. Le sur-mesure permet d'exploiter chaque centimètre, notamment sous les combles ou dans les espaces atypiques.",
      },
      {
        q: 'Quelle est la durée de vie des fenêtres en PVC ?',
        a: "Les fenêtres PVC de qualité ont une durée de vie de 25 à 35 ans sans entretien particulier, hormis un nettoyage régulier au savon doux. Les fenêtres en bois durent aussi longtemps mais nécessitent un entretien (lasure ou peinture) tous les 5 à 7 ans. Les fenêtres aluminium ont la meilleure longévité, jusqu'à 40 ans, grâce à leur résistance à la corrosion.",
      },
      {
        q: 'Un menuisier peut-il fabriquer un escalier sur mesure ?',
        a: "Oui, c'est même l'une des spécialités du menuisier d'agencement. Un escalier sur mesure en bois coûte entre 3 000 et 10 000 € selon l'essence (hêtre, chêne, frêne), la forme (droit, tournant, hélicoïdal) et les finitions (vitrification, peinture, garde-corps). La fabrication et la pose prennent 2 à 4 semaines. Un escalier sur mesure optimise l'espace et s'adapte parfaitement à la configuration du logement.",
      },
      {
        q: 'Comment entretenir ses menuiseries en bois ?',
        a: "Les menuiseries extérieures en bois doivent être protégées par une lasure ou une peinture microporeuse tous les 5 à 7 ans. Poncez légèrement la surface, dépoussiérez et appliquez deux couches de lasure au pinceau. Pour les menuiseries intérieures (portes, placards), un nettoyage à l'eau savonneuse suffit. Si le bois est abîmé, un menuisier peut le décaper, le traiter et le remettre en état.",
      },
      {
        q: 'Quelles aides existent pour le remplacement de fenêtres ?',
        a: "MaPrimeRénov' finance jusqu'à 100 € par fenêtre (simple vers double vitrage) pour les ménages modestes. Les CEE (Certificats d'Économies d'Énergie) ajoutent 40 à 100 € par fenêtre (selon profil de revenus). L'éco-prêt à taux zéro permet de financer jusqu'à 7 000 € de remplacement de fenêtres sans intérêts. Le menuisier doit être certifié RGE pour que vous puissiez bénéficier de ces aides.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la menuiserie. Pour le remplacement de fenêtres cassées ou de portes endommagées, prenez rendez-vous pour un devis gratuit sous 48h.",
    certifications: [
      'Qualibat (qualification 3511 fourniture et pose de menuiseries extérieures)',
      'RGE (obligatoire pour les aides — fenêtres et portes isolantes)',
      'Certification NF Fenêtres bois ou NF Fenêtres PVC (FCBA/CSTB)',
      "Compagnons du Devoir (formation d'excellence)",
      'Label Menuiserie 21 (engagement qualité UFME)',
      'Certification PEFC/FSC (traçabilité et gestion durable des bois)',
      'Qualibat 4321 (fabrication de menuiseries et fermetures en bois)',
      "Label Artisan d'Art (distinction pour les menuisiers ébénistes d'exception)",
    ],
    averageResponseTime: 'Devis sous 48h, intervention sous 2 à 4 semaines',
  },

  carreleur: {
    slug: 'carreleur',
    name: 'Carreleur',
    priceRange: {
      min: 35,
      max: 65,
      unit: '€/m²',
    },
    commonTasks: [
      'Pose de carrelage au sol (format standard) : 35 à 55 €/m² (pose uniquement)',
      'Pose de carrelage grand format (60x60 et plus) : 50 à 75 €/m²',
      'Pose de faïence murale (salle de bain) : 40 à 65 €/m²',
      'Pose de mosaïque : 60 à 100 €/m²',
      "Carrelage d'une terrasse extérieure : 45 à 80 €/m²",
      "Dépose d'ancien carrelage + repose : 15 à 30 €/m² supplémentaires",
      'Ragréage et préparation du sol avant pose : 15 à 25 €/m²',
      'Pose de carrelage sur plancher chauffant : 50 à 80 €/m² (colle flexible spéciale)',
    ],
    tips: [
      'Le prix de la pose dépend fortement du format des carreaux : les grands formats (60x60, 80x80) et les poses en diagonale ou en décalé coûtent 20 à 40 % plus cher que la pose droite en format standard.',
      'Vérifiez que le carreleur inclut la préparation du support dans son devis : ragréage, mise à niveau et étanchéité (obligatoire en salle de bain sous la norme DTU 52.1). Un support mal préparé est la première cause de décollement.',
      'Prévoyez 10 à 15 % de carrelage supplémentaire pour les coupes et la casse. Pour les grands formats et les poses complexes, cette marge peut monter à 20 %.',
      "Demandez au carreleur son avis sur le type de carrelage adapté à votre usage : classement UPEC pour l'intérieur (U pour usure, P pour poinçonnement, E pour eau, C pour chimique), et classement R pour l'antidérapant en extérieur.",
      "Pour une salle de bain, exigez une étanchéité sous carrelage (système SPEC conforme au DTU 52.1). C'est un travail supplémentaire mais indispensable pour éviter les infiltrations.",
      'Un calepinage (plan de pose détaillé) réalisé en amont par le carreleur évite les coupes disgracieuses et optimise la répartition des carreaux. Demandez-le systématiquement, surtout pour les grands formats et les motifs complexes.',
      'Vérifiez la planéité du sol avant la pose : un écart supérieur à 5 mm sous la règle de 2 m nécessite un ragréage. Poser du carrelage sur un sol irrégulier entraîne des surépaisseurs de colle, des risques de fissures et un résultat inesthétique.',
      "En pièce humide (salle de bain, douche italienne), un joint hydrofuge à base d'époxy est indispensable. Plus cher qu'un joint ciment classique (10 à 15 €/m² supplémentaires), il empêche toute infiltration d'eau et ne noircit pas avec le temps.",
    ],
    faq: [
      {
        q: 'Combien de temps faut-il pour carreler une salle de bain ?',
        a: "Pour une salle de bain standard de 5 à 8 m² (sol + murs), comptez 3 à 5 jours de travail incluant la préparation, la pose de l'étanchéité, le carrelage et les joints. Ajoutez 1 à 2 jours si l'ancien carrelage doit être déposé. Le séchage des joints nécessite 24h supplémentaires avant utilisation.",
      },
      {
        q: 'Puis-je poser du carrelage sur un ancien carrelage ?',
        a: "Oui, c'est possible si l'ancien carrelage est bien adhérent, plan et en bon état. Le carreleur utilisera un primaire d'accrochage spécifique. Attention cependant : cette technique ajoute environ 1 cm d'épaisseur au sol, ce qui peut poser des problèmes de seuil de porte et de hauteur sous plafond dans certaines pièces.",
      },
      {
        q: 'Quel carrelage choisir pour un sol de cuisine ?',
        a: "Pour une cuisine, privilégiez un carrelage grès cérame classement UPEC U3 P3 E2 C1 minimum : résistant à l'usure, aux chocs, à l'eau et aux produits ménagers. Les formats 30x60 ou 60x60 en finition mate ou satinée sont les plus pratiques. Évitez les finitions très brillantes (glissantes) et les couleurs trop claires (salissantes).",
      },
      {
        q: 'Quel est le coût de la pose de carrelage au m² ?',
        a: "La pose de carrelage au sol coûte entre 35 et 55 €/m² en format standard (30x30 à 45x45), 50 à 75 €/m² pour du grand format (60x60 et plus) et 60 à 100 €/m² pour de la mosaïque. La pose murale (faïence) revient à 40 à 65 €/m². Ces prix s'entendent hors fourniture du carrelage. Ajoutez 15 à 30 €/m² si l'ancien revêtement doit être déposé.",
      },
      {
        q: 'Faut-il une étanchéité sous le carrelage de salle de bain ?',
        a: "Oui, l'étanchéité sous carrelage (système SPEC) est indispensable dans les zones de projection d'eau (douche, contour de baignoire) conformément au DTU 52.1. Le carreleur applique une membrane ou un produit liquide d'étanchéité avant la pose du carrelage. Ce poste supplémentaire coûte 20 à 40 €/m² mais évite les infiltrations d'eau et les dégâts des eaux chez le voisin du dessous.",
      },
      {
        q: 'Comment choisir entre carrelage et grès cérame ?',
        a: 'Le grès cérame est en réalité un type de carrelage, fabriqué par pressage à haute température. Il est plus dense, plus résistant et moins poreux que la faïence ou le carrelage classique en terre cuite. Le grès cérame pleine masse est le plus solide (teinté dans la masse, les éclats sont invisibles). Pour un usage courant en intérieur, le grès cérame émaillé offre le meilleur rapport qualité-prix.',
      },
      {
        q: 'Quel carrelage choisir pour une terrasse extérieure ?',
        a: "Pour une terrasse, choisissez un carrelage antidérapant classé R11 minimum (R12 en bord de piscine), résistant au gel (norme ISO 10545-12) et de faible porosité. Le grès cérame pleine masse ou le carrelage en pierre naturelle sont les mieux adaptés. Prévoyez une pente de 1 à 2 % pour l'évacuation de l'eau. Le budget est de 45 à 80 €/m² pour la pose.",
      },
      {
        q: 'Combien de temps faut-il attendre avant de marcher sur un carrelage neuf ?',
        a: 'Il faut attendre 24 heures minimum après la pose avant de marcher sur le carrelage, le temps que la colle sèche. Les joints doivent être réalisés 24 à 48 heures après la pose et nécessitent à leur tour 24 heures de séchage. Au total, comptez 3 à 4 jours avant de pouvoir utiliser normalement la pièce. Évitez de poser des meubles lourds pendant au moins une semaine.',
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour le carrelage. Prenez rendez-vous pour un devis gratuit sous 48h et une intervention planifiée sous 1 à 3 semaines.",
    certifications: [
      'Qualibat (qualification 6321/6322 carrelage et revêtements céramiques)',
      'Certification CSTB (classement UPEC des locaux — Centre Scientifique et Technique du Bâtiment)',
      "Compagnons du Devoir (formation d'excellence)",
      "Label Artisan de confiance (Chambre de Métiers et de l'Artisanat)",
      'Conformité NF DTU 52.1 (pose de revêtements de sol scellés — sols)',
      'Conformité NF DTU 52.2 (pose de revêtements muraux scellés — murs)',
      'Qualibat 6331 (pose de carrelages et revêtements céramiques collés)',
      'Certification NF UPEC (classement des locaux par le CSTB)',
    ],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 3 semaines',
  },

  couvreur: {
    slug: 'couvreur',
    name: 'Couvreur',
    priceRange: {
      min: 50,
      max: 90,
      unit: '€/m²',
    },
    commonTasks: [
      'Réparation de fuite de toiture : 200 à 800 €',
      'Remplacement de tuiles cassées : 40 à 80 €/m²',
      'Réfection complète de toiture (100 m²) : 8 000 à 18 000 €',
      'Pose de gouttière en zinc : 40 à 80 €/ml',
      'Nettoyage et démoussage de toiture : 15 à 30 €/m²',
      'Installation de fenêtre de toit (Velux) : 500 à 1 500 € (hors fourniture)',
      'Réparation de faîtage (scellement ou remplacement) : 40 à 80 €/ml',
      'Étanchéité toiture terrasse (membrane EPDM ou bitume) : 50 à 120 €/m²',
    ],
    tips: [
      'Faites inspecter votre toiture tous les 5 ans et après chaque épisode de grêlons ou de tempête. Une petite réparation à temps évite un remplacement complet bien plus coûteux.',
      "Vérifiez que le couvreur dispose d'une garantie décennale à jour et d'une assurance responsabilité civile. Les travaux de toiture engagent la solidité de l'ouvrage et sont couverts 10 ans.",
      "Profitez d'une réfection de toiture pour améliorer l'isolation : l'isolation par l'extérieur (sarking) ou par l'intérieur permet de réduire les déperditions thermiques de 25 à 30 %. Un couvreur RGE ouvre droit aux aides de l'État.",
      "Ne montez jamais seul sur un toit pour évaluer les dégâts. La chute de hauteur est la première cause d'accident mortel dans le bâtiment. Laissez l'inspection à un professionnel équipé.",
      "Demandez des photos avant/après et un rapport d'intervention écrit. Certains couvreurs utilisent des drones pour inspecter la toiture sans échafaudage, ce qui réduit les coûts.",
      "Remplacez rapidement toute tuile cassée ou déplacée : une seule tuile manquante suffit à provoquer des infiltrations qui endommagent la charpente et l'isolation en quelques semaines.",
      "Lors d'une réfection de toiture, faites vérifier l'état de la charpente en même temps que la couverture : un diagnostic complet évite de devoir rouvrir le toit quelques années plus tard.",
      'Ne montez jamais sur un toit mouillé, verglacé ou par grand vent : les accidents de toiture représentent plus de 10 % des accidents mortels du BTP en France chaque année.',
    ],
    faq: [
      {
        q: 'Combien coûte une réfection complète de toiture ?',
        a: "Pour une maison de 100 m² de toiture, comptez entre 8 000 et 18 000 € selon le matériau (tuiles terre cuite : 50-80 €/m², ardoise : 80-120 €/m², zinc : 60-100 €/m²) et la complexité (pente, cheminée, lucarnes). Ce prix inclut la dépose, la fourniture et la pose. L'échafaudage représente 10 à 15 % du budget.",
      },
      {
        q: 'Faut-il un permis de construire pour refaire sa toiture ?',
        a: "Une déclaration préalable de travaux suffit si vous conservez le même matériau et la même couleur. En revanche, un permis de construire est nécessaire si vous modifiez la pente, la hauteur ou le type de couverture. En zone protégée (ABF), l'accord de l'Architecte des Bâtiments de France est requis.",
      },
      {
        q: 'À quelle fréquence faut-il démousser sa toiture ?',
        a: "Un démoussage est recommandé tous les 3 à 5 ans, selon l'exposition et l'environnement (plus fréquent près d'arbres ou en zone humide). Le démoussage coûte entre 15 et 30 €/m² et prolonge la durée de vie de votre couverture. Évitez le nettoyeur haute pression, qui endommage les tuiles.",
      },
      {
        q: 'Ma toiture fuit après une tempête, que faire en urgence ?',
        a: "Placez des récipients sous les fuites et contactez un couvreur d'urgence. Prenez des photos des dégâts pour votre assurance et déclarez le sinistre sous 5 jours ouvrés (30 jours après publication de l'arrêté de catastrophe naturelle au Journal Officiel, art. L113-2 Code des assurances). En attendant le couvreur, vous pouvez bâcher temporairement la zone depuis l'intérieur des combles, sans monter sur le toit.",
      },
      {
        q: "Quelle est la durée de vie d'une toiture selon le matériau ?",
        a: "Les tuiles en terre cuite durent 50 à 100 ans, l'ardoise naturelle 75 à 150 ans, le zinc 50 à 80 ans et les tuiles béton 30 à 50 ans. Le shingle (bitume) a la durée de vie la plus courte : 20 à 30 ans. Ces durées supposent un entretien régulier (démoussage, remplacement des éléments cassés, vérification des solins et faîtages).",
      },
      {
        q: "Combien coûte l'installation d'une fenêtre de toit (Velux) ?",
        a: "L'installation d'une fenêtre de toit standard (78x98 cm) coûte entre 500 et 1 500 € pour la pose seule, auxquels s'ajoute le prix de la fenêtre (300 à 1 200 € selon le modèle). Une fenêtre motorisée avec stores intégrés peut atteindre 2 500 €. Le couvreur doit assurer une parfaite étanchéité avec un kit de raccordement adapté à la couverture.",
      },
      {
        q: "L'isolation de toiture est-elle éligible aux aides de l'État ?",
        a: "Oui, l'isolation de la toiture par l'intérieur ou l'extérieur (sarking) est éligible à MaPrimeRénov' (jusqu'à 25 €/m² pour les ménages modestes), aux CEE et à l'éco-prêt à taux zéro. Le couvreur doit être certifié RGE. L'isolation de toiture est l'un des travaux les plus rentables : elle réduit les déperditions thermiques de 25 à 30 % et se rentabilise en 4 à 6 ans.",
      },
      {
        q: "Comment savoir si ma charpente a besoin d'un traitement ?",
        a: "Inspectez les bois de charpente à la recherche de sciure au sol (signe de vrillettes ou capricornes), de trous de sortie d'insectes, de champignons (mérule) ou de bois qui s'effrite au contact. Un diagnostic par un professionnel est recommandé tous les 10 ans. Le traitement préventif ou curatif coûte entre 20 et 50 €/m² et protège la charpente pour 10 à 20 ans.",
      },
    ],
    emergencyInfo:
      "Intervention d'urgence pour dégâts de tempête, tuiles arrachées ou fuite de toiture. Un couvreur d'urgence peut effectuer un bâchage provisoire pour protéger votre habitation, selon disponibilité. Majorations : +80 à 120 % la nuit et le week-end.",
    certifications: [
      'Qualibat (qualification 3111/3112 couverture en tuiles)',
      "RGE (obligatoire pour l'isolation de toiture — aides MaPrimeRénov')",
      "Compagnons du Devoir (formation d'excellence)",
      'QualiPV (si pose de panneaux solaires en toiture)',
      'Certification CSTB (Centre Scientifique et Technique du Bâtiment — avis techniques)',
      'Qualification Handibat (accessibilité et adaptation du logement)',
      'Qualibat 3191 (étanchéité de toitures-terrasses)',
      "Compagnons du Tour de France (formation traditionnelle d'excellence)",
    ],
    averageResponseTime:
      'Urgence (bâchage, fuite) : délai variable selon disponibilité ; travaux de réfection sous 1 à 4 semaines',
  },

  macon: {
    slug: 'macon',
    name: 'Maçon',
    priceRange: {
      min: 45,
      max: 70,
      unit: '€/h',
    },
    commonTasks: [
      "Construction d'un mur en parpaings : 50 à 80 €/m²",
      "Coulée d'une dalle béton (garage, terrasse) : 60 à 120 €/m²",
      "Ouverture d'un mur porteur (avec IPN) : 2 500 à 6 000 €",
      "Construction d'une extension : 1 200 à 2 000 €/m²",
      'Réparation de fissures structurelles : 50 à 200 €/ml',
      "Montage d'un mur de clôture : 100 à 250 €/ml",
      'Ravalement de façade (enduit ou crépi) : 30 à 80 €/m²',
      'Réalisation de fondations (semelle filante) : 150 à 300 €/ml',
    ],
    tips: [
      "Pour toute ouverture dans un mur porteur, exigez une étude structurelle réalisée par un bureau d'études agréé. Le maçon doit suivre les préconisations de l'ingénieur et poser une poutre (IPN) dimensionnée pour reprendre les charges.",
      "Vérifiez les références du maçon sur des chantiers similaires au vôtre. Un maçon spécialisé en neuf n'a pas forcément l'expérience de la rénovation, et inversement.",
      "Les travaux de maçonnerie sont soumis à la garantie décennale obligatoire. Demandez une copie de l'attestation d'assurance avant le début du chantier et vérifiez qu'elle couvre le type de travaux prévus.",
      'Pour une extension ou une construction, une déclaration préalable ou un permis de construire est obligatoire selon la surface. En dessous de 20 m², une déclaration suffit ; au-delà, le permis est requis (seuil porté à 40 m² en zone PLU).',
      "Privilégiez les périodes de printemps et d'automne pour les travaux de maçonnerie : le béton et le mortier nécessitent des températures comprises entre 5 et 30°C pour une prise optimale.",
      'Faites toujours réaliser une étude de sol (mission G2) avant de couler des fondations. Cette étude détermine la nature du terrain et le type de fondations adapté, évitant les tassements différentiels et les fissures futures. Comptez 1 500 à 3 000 € pour une étude G2.',
      "Le béton nécessite un temps de séchage (cure) de 28 jours avant de pouvoir supporter sa charge maximale. Ne demandez pas au maçon de construire sur une dalle ou des fondations qui n'ont pas atteint ce délai, sous peine de compromettre la solidité de l'ouvrage.",
      "Avant tout projet d'agrandissement, consultez le PLU (Plan Local d'Urbanisme) de votre commune et vérifiez les servitudes d'urbanisme : coefficient d'emprise au sol, hauteur maximale, recul par rapport aux limites de propriété et aspect extérieur imposé.",
    ],
    faq: [
      {
        q: "Combien coûte la construction d'une extension de maison ?",
        a: "Le prix d'une extension en maçonnerie traditionnelle varie de 1 200 à 2 000 €/m² selon les finitions, la complexité de la structure et la région. Une extension de 20 m² coûte ainsi entre 24 000 et 40 000 €. Ce prix comprend les fondations, les murs, la toiture et le clos couvert, mais pas les finitions intérieures.",
      },
      {
        q: 'Peut-on abattre un mur porteur soi-même ?',
        a: "Absolument pas. L'ouverture d'un mur porteur sans étude structurelle préalable et sans professionnel qualifié peut provoquer l'effondrement partiel ou total du bâtiment. De plus, en copropriété, l'accord du syndicat est obligatoire. Le coût d'une ouverture dans un mur porteur (étude + travaux) est de 2 500 à 6 000 €.",
      },
      {
        q: 'Quelles sont les fondations nécessaires pour un mur de clôture ?',
        a: "Un mur de clôture en parpaings nécessite une semelle de fondation en béton armé d'au moins 30 cm de profondeur et 40 cm de largeur, hors gel (50 à 80 cm selon la région). Le maçon doit respecter les règles d'urbanisme locales (hauteur maximale, retrait par rapport à la limite de propriété).",
      },
      {
        q: "Combien coûte la construction d'un garage en parpaings ?",
        a: "La construction d'un garage simple (environ 20 m²) en parpaings coûte entre 15 000 et 25 000 €, comprenant les fondations, les murs, la dalle, la toiture et la porte de garage. Un garage double (40 m²) revient à 25 000 à 45 000 €. Un permis de construire est nécessaire pour une surface supérieure à 20 m², une déclaration préalable en dessous.",
      },
      {
        q: 'Les fissures sur ma maison sont-elles dangereuses ?',
        a: "Les microfissures (moins de 0,2 mm) sont généralement superficielles et sans danger. Les fissures de 0,2 à 2 mm doivent être surveillées et réparées pour éviter les infiltrations d'eau. Les fissures supérieures à 2 mm ou en escalier le long des joints de parpaings peuvent indiquer un problème structurel et nécessitent l'intervention urgente d'un maçon et éventuellement d'un bureau d'études.",
      },
      {
        q: 'Quelle est la meilleure période pour réaliser des travaux de maçonnerie ?',
        a: "Le printemps (avril-juin) et l'automne (septembre-octobre) sont les périodes idéales. Le béton et le mortier nécessitent des températures entre 5 et 30 °C pour une prise optimale. En hiver, le gel peut compromettre la solidité du béton, et en plein été, la chaleur excessive accélère le séchage et provoque des fissures. Si les travaux doivent se faire en hiver, le maçon utilisera des adjuvants antigel.",
      },
      {
        q: 'Faut-il un permis de construire pour une extension de maison ?',
        a: "En zone couverte par un PLU (Plan Local d'Urbanisme), une déclaration préalable suffit pour une extension de moins de 40 m². Au-delà, un permis de construire est obligatoire. Hors PLU, le seuil est de 20 m². De plus, si la surface totale de la maison après extension dépasse 150 m², le recours à un architecte est obligatoire.",
      },
      {
        q: 'Combien coûte une dalle béton pour une terrasse ?',
        a: "Une dalle béton de 15 cm d'épaisseur pour terrasse coûte entre 60 et 120 €/m², comprenant le terrassement, le ferraillage, le coffrage et le coulage du béton. Pour une terrasse de 30 m², le budget total est de 1 800 à 3 600 €. Le béton décoratif (désactivé, ciré ou imprimé) est plus cher : 80 à 180 €/m², mais ne nécessite pas de revêtement supplémentaire.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la maçonnerie. Pour les travaux de gros œuvre, extension ou rénovation, prenez rendez-vous pour un devis gratuit sous 1 semaine.",
    certifications: [
      'Qualibat (qualification 2111/2112 maçonnerie et béton armé)',
      "RGE (obligatoire si ITE — isolation thermique par l'extérieur)",
      "Compagnons du Devoir (formation d'excellence)",
      'NF Habitat (label qualité construction neuve et rénovation)',
      'NF DTU 20.1 (norme de référence pour les ouvrages en maçonnerie de petits éléments)',
      'Compagnons du Tour de France (formation traditionnelle et savoir-faire artisanal)',
      'Certification Éco Artisan (engagement en performance énergétique et environnementale)',
      'Certification Handibat (adaptation du logement aux personnes à mobilité réduite)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 6 semaines',
  },

  vitrier: {
    slug: 'vitrier',
    name: 'Vitrier',
    priceRange: {
      min: 50,
      max: 100,
      unit: '€/intervention',
    },
    commonTasks: [
      "Remplacement d'un simple vitrage : 60 à 150 €/m² (fourniture + pose)",
      'Pose de double vitrage : 150 à 350 €/m²',
      "Remplacement d'une vitre cassée (standard) : 80 à 200 €",
      "Survitrage d'une fenêtre existante : 80 à 150 €/m²",
      "Pose d'une crédence en verre (cuisine) : 200 à 500 €/m²",
      "Installation d'une paroi de douche en verre : 400 à 1 200 €",
      "Pose d'un vitrage feuilleté de sécurité (anti-effraction) : 200 à 450 €/m²",
      "Installation d'un garde-corps en verre (balcon, terrasse) : 250 à 600 €/ml",
    ],
    tips: [
      'En cas de vitre cassée, sécurisez la zone avec du carton ou du ruban adhésif en attendant le vitrier. Ne tentez pas de retirer les morceaux de verre à mains nues.',
      "Privilégiez le double vitrage 4/16/4 pour un bon rapport qualité-prix en isolation thermique. Le triple vitrage n'est justifié que dans les régions très froides.",
      "Demandez au vitrier de vous fournir le coefficient d'isolation (Ug) du vitrage proposé. Plus ce chiffre est bas, meilleure est l'isolation : Ug < 1,1 W/m².K pour du bon double vitrage.",
      'Pour une crédence ou une paroi de douche, exigez du verre sécurit (trempé) conforme à la norme EN 12150 : en cas de casse, il se fragmente en petits morceaux non coupants.',
      "Un vitrier d'urgence peut intervenir pour sécuriser une vitrine commerciale ou une baie vitrée cassée. Vérifiez que le professionnel propose un service de mise en sécurité provisoire.",
      'Vérifiez votre contrat multirisque habitation : la garantie bris de glace couvre souvent le remplacement des vitres cassées. Conservez les morceaux et prenez des photos avant nettoyage pour faciliter la déclaration.',
      "Choisissez un vitrage adapté à l'orientation de vos fenêtres : vitrage à isolation phonique renforcée côté rue, vitrage à contrôle solaire côté sud et ouest pour limiter la surchauffe en été.",
      'Après une intervention, vérifiez la qualité de la pose : le mastic ou le joint silicone doit être continu et sans bulle, et le vitrage ne doit présenter aucun jeu dans le châssis.',
    ],
    faq: [
      {
        q: "Combien coûte le remplacement d'une vitre cassée ?",
        a: "Le remplacement d'une vitre simple coûte entre 80 et 200 € pour une fenêtre standard (environ 1 m²). Pour du double vitrage, comptez 150 à 350 €/m² fourniture et pose comprises. Les tarifs augmentent pour les grandes dimensions, les formes spéciales et les interventions en urgence (+50 à 100 %).",
      },
      {
        q: "Mon assurance couvre-t-elle le remplacement d'une vitre ?",
        a: 'Oui, si la casse est due à un événement couvert par votre contrat (tempête, vandalisme, cambriolage). La garantie bris de glace, souvent en option, couvre les vitres, miroirs et plaques vitrocéramiques. Déclarez le sinistre sous 5 jours ouvrés et conservez les morceaux de verre si possible.',
      },
      {
        q: 'Double ou triple vitrage : lequel choisir ?',
        a: "Le double vitrage 4/16/4 avec gaz argon (Ug ≈ 1,1 W/m².K) suffit dans la majorité des cas en France métropolitaine. Le triple vitrage (Ug ≈ 0,6 W/m².K) est recommandé uniquement pour les façades nord en climat continental ou montagnard. Il est plus lourd et plus cher (+40 à 60 %) pour un gain d'isolation modeste en climat tempéré.",
      },
      {
        q: 'Peut-on remplacer un simple vitrage par du double vitrage sans changer la fenêtre ?',
        a: "Oui, grâce au survitrage ou au remplacement du vitrage seul (si le châssis est en bon état et assez profond pour accueillir un double vitrage). Le survitrage consiste à fixer un second vitrage sur la fenêtre existante (80 à 150 €/m²). Le remplacement du vitrage dans le châssis existant coûte 150 à 300 €/m². Ces solutions sont moins performantes qu'un remplacement complet mais beaucoup moins chères.",
      },
      {
        q: 'Combien de temps faut-il pour remplacer une vitre cassée ?',
        a: "Le remplacement d'une vitre standard prend 30 minutes à 1 heure sur place. Cependant, si le vitrage est sur mesure (grande dimension, forme spéciale, double vitrage à commander), le vitrier posera d'abord un panneau provisoire et reviendra sous 24 à 72 heures avec le vitrage définitif. Pour les urgences, la mise en sécurité provisoire est réalisée en moins d'une heure.",
      },
      {
        q: "Qu'est-ce que le verre sécurit (trempé) et quand est-il obligatoire ?",
        a: "Le verre trempé est chauffé à 700 °C puis refroidi brusquement, ce qui le rend 5 fois plus résistant qu'un verre ordinaire. En cas de casse, il se fragmente en petits morceaux non coupants. Il est obligatoire pour les portes vitrées, les parois de douche, les garde-corps en verre et les baies vitrées dont le bord inférieur est à moins de 90 cm du sol (norme NF DTU 39).",
      },
      {
        q: "Comment améliorer l'isolation de mes vitrages sans tout changer ?",
        a: "Plusieurs solutions existent : le film isolant thermique à coller sur le vitrage (10 à 30 €/m², gain de 30 % sur les déperditions), le survitrage (80 à 150 €/m²), ou le remplacement des joints d'étanchéité des fenêtres (5 à 15 €/ml). Un vitrier peut aussi remplacer le vitrage seul sans changer le châssis, si celui-ci est en bon état.",
      },
      {
        q: 'Quel type de verre choisir pour une crédence de cuisine ?',
        a: "La crédence en verre doit être en verre trempé sécurit (obligatoire derrière une plaque de cuisson) de 6 mm d'épaisseur minimum. Elle peut être laquée dans la couleur de votre choix, imprimée avec un motif ou en verre dépoli. Comptez 200 à 500 €/m² pose comprise. L'avantage principal est l'absence de joints : le nettoyage est simple et l'hygiène optimale.",
      },
    ],
    emergencyInfo:
      "En cas de vitre cassée (effraction, tempête, accident), un vitrier d'urgence peut intervenir pour sécuriser l'ouverture avec un panneau provisoire, selon disponibilité. Le remplacement définitif se fait généralement sous 24 à 48h. Majorations : +50 à 100 % la nuit et le week-end.",
    certifications: [
      'Qualibat (qualification 4311/4312 vitrerie-miroiterie)',
      'Certification Cekal (qualité des vitrages isolants, feuilletés et trempés)',
      'RGE (pour remplacement de vitrages isolants ouvrant droit aux aides)',
      'Assurance décennale couvrant les travaux de vitrerie et miroiterie',
      'Certification NF DTU 39 (pose de vitrages en bâtiment)',
      'Qualification Qualifelec (si travaux combinés vitrerie-menuiserie aluminium)',
      'Membre de la Fédération Française des Professionnels du Verre (FFPV)',
      'Certification EN 12150 (mise en œuvre de verre trempé sécurit)',
    ],
    averageResponseTime:
      'Urgence (bris de vitre) : délai variable selon disponibilité ; remplacement définitif sous 24 à 48h',
  },

  climaticien: {
    slug: 'climaticien',
    name: 'Climaticien',
    priceRange: {
      min: 60,
      max: 100,
      unit: '€/h',
    },
    commonTasks: [
      "Installation d'un split mural (2,5 kW) : 1 500 à 3 000 €",
      "Pose d'une climatisation gainable : 5 000 à 12 000 €",
      "Installation d'une climatisation multi-split (3 unités) : 4 000 à 8 000 €",
      "Entretien annuel d'une climatisation : 100 à 200 €",
      'Recharge de gaz réfrigérant : 200 à 500 €',
      "Installation d'une pompe à chaleur air-air : 3 000 à 7 000 €",
      "Remplacement d'un compresseur de climatisation : 800 à 1 500 €",
      'Désembouage et nettoyage du circuit frigorifique : 300 à 600 €',
    ],
    tips: [
      "Privilégiez un climaticien certifié RGE et détenteur de l'attestation de capacité à manipuler les fluides frigorigènes, obligatoire depuis 2015 pour toute intervention sur un circuit frigorifique.",
      "Une pompe à chaleur air-air (climatisation réversible) est plus économique qu'une climatisation classique : elle consomme 1 kWh d'électricité pour produire 3 à 4 kWh de chaleur ou de froid (COP de 3 à 4).",
      'Le dimensionnement est crucial : une climatisation trop puissante consomme plus et dégrade le confort (cycles courts). Exigez un bilan thermique avant toute installation.',
      "L'entretien annuel est obligatoire pour les systèmes contenant plus de 2 kg de fluide frigorigène (la plupart des splits). Le carnet d'entretien doit être tenu à jour.",
      "Attention au bruit : vérifiez le niveau sonore de l'unité extérieure (en dB(A)) et respectez les distances réglementaires avec le voisinage. L'installation d'une unité extérieure en copropriété nécessite souvent l'accord de l'assemblée générale.",
      "Nettoyez les filtres de votre climatisation tous les 2 mois en période d'utilisation pour maintenir un rendement optimal et une bonne qualité d'air intérieur.",
      'Faites vérifier le niveau de fluide frigorigène chaque année par un technicien certifié : une fuite de 10 % réduit les performances de 20 % et augmente la consommation électrique.',
      "Une clim réversible bien dimensionnée remplace un chauffage d'appoint dans les régions tempérées et permet de réaliser jusqu'à 60 % d'économies par rapport à des convecteurs électriques.",
    ],
    faq: [
      {
        q: "Combien coûte l'installation d'une climatisation ?",
        a: "Un split mural standard (2,5 kW, pour une pièce de 25 m²) coûte entre 1 500 et 3 000 € pose comprise. Un système multi-split (3 unités intérieures) revient à 4 000 à 8 000 €. La climatisation gainable (invisible, conduits dans les faux plafonds) coûte 5 000 à 12 000 €. Les modèles réversibles (chaud/froid) sont plus économiques à l'usage.",
      },
      {
        q: 'La climatisation réversible est-elle économique pour le chauffage ?',
        a: "Oui, une pompe à chaleur air-air réversible consomme 3 à 4 fois moins d'électricité qu'un radiateur électrique classique grâce à son COP (Coefficient de Performance). Pour un appartement de 60 m², l'économie est de 300 à 600 € par an sur la facture de chauffage. L'investissement est amorti en 3 à 5 ans.",
      },
      {
        q: 'Faut-il une autorisation pour installer une climatisation ?',
        a: "L'unité extérieure ne nécessite pas de permis de construire, mais une déclaration préalable peut être exigée dans certaines communes (vérifiez le PLU). En copropriété, l'accord de l'assemblée générale est généralement requis. Respectez les réglementations sur le bruit (émergence < 5 dB(A) le jour, < 3 dB(A) la nuit).",
      },
      {
        q: 'À quelle fréquence faut-il entretenir sa climatisation ?',
        a: "L'entretien annuel est obligatoire pour les systèmes contenant plus de 2 kg de fluide frigorigène. Nettoyez les filtres intérieurs tous les 2 à 4 semaines en période d'utilisation (un filtre encrassé réduit les performances de 20 à 30 %). L'entretien professionnel comprend la vérification du circuit frigorifique, le nettoyage des échangeurs et le contrôle de l'étanchéité. Le coût est de 100 à 200 € par an.",
      },
      {
        q: 'Quelle puissance de climatisation pour ma pièce ?',
        a: "En règle générale, comptez 100 watts par m² pour une pièce standard (hauteur sous plafond de 2,50 m, isolation correcte). Ainsi, une pièce de 25 m² nécessite environ 2 500 watts (2,5 kW). Ce calcul doit être affiné par un bilan thermique tenant compte de l'exposition, de la surface vitrée, de l'isolation et du nombre d'occupants. Un surdimensionnement entraîne des cycles courts et une surconsommation.",
      },
      {
        q: 'La climatisation réversible remplace-t-elle un chauffage classique ?',
        a: "Dans le sud de la France et les régions tempérées, une pompe à chaleur air-air réversible peut constituer le chauffage principal. En revanche, dans les régions au climat continental ou montagnard (températures inférieures à -7 °C), elle doit être complétée par un chauffage d'appoint car son rendement baisse fortement par grand froid. Un modèle Inverter maintient de bonnes performances jusqu'à -15 °C.",
      },
      {
        q: 'Climatisation split ou gainable : quelle différence ?',
        a: "Le split mural est l'option la plus simple et la moins chère (1 500 à 3 000 € par unité), idéale pour climatiser une ou deux pièces. La climatisation gainable distribue l'air via des gaines dans les faux plafonds : elle est invisible, silencieuse et climatise tout le logement de manière homogène, mais coûte plus cher (5 000 à 12 000 €) et nécessite un faux plafond ou des combles accessibles.",
      },
      {
        q: "Quel est l'impact de la climatisation sur la facture d'électricité ?",
        a: "Un split de 2,5 kW consomme environ 800 à 1 200 kWh par saison (juin à septembre), soit 150 à 250 € sur la facture d'électricité. Les modèles Inverter de classe A+++ consomment 30 à 40 % de moins que les modèles classiques. Réglez le thermostat sur 25-26 °C plutôt que 20 °C : chaque degré en moins augmente la consommation de 7 %.",
      },
    ],
    emergencyInfo:
      "En cas de panne de climatisation pendant une canicule, contactez un climaticien d'urgence : les délais varient selon les disponibilités. Vérifiez d'abord les réglages, le disjoncteur dédié et les filtres (encrassés = perte de performance). En attendant, fermez les volets, aérez la nuit et utilisez un ventilateur.",
    certifications: [
      'Attestation de capacité fluides frigorigènes (obligatoire — catégorie I à IV)',
      "RGE (Reconnu Garant de l'Environnement)",
      'QualiPAC (pompes à chaleur et climatisation réversible)',
      'Qualifroid / Qualiclimafroid (qualification froid et climatisation, accrédité COFRAC)',
      'Qualibat (qualification 5311/5312 génie climatique)',
      'Qualipac (installation de pompes à chaleur air/air — certification dédiée)',
      'Agrément préfectoral pour manipulation de fluides frigorigènes catégorie I (circuits de plus de 2 kg)',
      'Certification NF PAC (performance et fiabilité des pompes à chaleur, délivrée par AFNOR)',
    ],
    averageResponseTime:
      'Urgence canicule : délai variable selon disponibilité ; installation sur devis sous 2 à 4 semaines',
  },

  cuisiniste: {
    slug: 'cuisiniste',
    name: 'Cuisiniste',
    priceRange: {
      min: 3000,
      max: 15000,
      unit: '€ (cuisine complète)',
    },
    commonTasks: [
      'Cuisine équipée entrée de gamme (5 ml) : 3 000 à 6 000 € (fourniture + pose)',
      'Cuisine équipée milieu de gamme : 6 000 à 12 000 €',
      'Cuisine sur mesure haut de gamme : 12 000 à 30 000 €',
      "Remplacement d'un plan de travail : 200 à 800 €/ml selon le matériau",
      "Pose seule d'une cuisine (hors meubles) : 1 500 à 4 000 €",
      "Installation d'un îlot central : 2 000 à 8 000 €",
      "Installation d'un îlot central avec raccordements (eau, électricité, hotte) : 2 000 à 5 000 €",
      'Remplacement plan de travail (granit, quartz, stratifié) : 200 à 800 €/ml',
    ],
    tips: [
      "Faites réaliser plusieurs plans d'aménagement avant de vous engager. Un bon cuisiniste propose un plan 3D gratuit et prend en compte vos habitudes culinaires, pas uniquement l'esthétique.",
      'Vérifiez que le devis inclut tous les postes : meubles, plan de travail, électroménager, plomberie, électricité, crédence et finitions. Les "surprises" représentent souvent 10 à 20 % du budget initial.',
      "Le triangle d'activité (évier-plaque-réfrigérateur) est la clé d'une cuisine fonctionnelle : la distance entre chaque point ne doit pas dépasser 2,5 m pour un confort optimal.",
      'Privilégiez les charnières et glissières de marque (Blum, Hettich, Grass) : ce sont les pièces les plus sollicitées et la qualité de la quincaillerie détermine la durabilité de la cuisine.',
      "Demandez la garantie sur les meubles (minimum 5 ans), le plan de travail et la pose. Un cuisiniste sérieux offre un service après-vente et un ajustement des portes après 6 mois d'utilisation.",
      'Prévoyez les raccordements électriques et plomberie AVANT la pose de la cuisine — les modifier après coûte 2 à 3 fois plus cher.',
      "Mesurez le triangle d'activité (évier-plaque-réfrigérateur) — idéalement 3,5 à 6,5 m de périmètre pour une circulation fluide sans pas inutiles.",
      'Prévoyez au moins 4 prises électriques au-dessus du plan de travail pour brancher vos appareils du quotidien (bouilloire, robot, grille-pain) sans rallonge.',
    ],
    faq: [
      {
        q: 'Quel budget prévoir pour une cuisine équipée ?',
        a: 'Pour une cuisine de 5 mètres linéaires, comptez 3 000 à 6 000 € en entrée de gamme (meubles en mélaminé, électroménager basique), 6 000 à 12 000 € en milieu de gamme (façades laquées, électroménager de marque) et 12 000 à 30 000 € pour du haut de gamme ou du sur-mesure. La pose représente 15 à 25 % du budget total.',
      },
      {
        q: "Combien de temps dure l'installation d'une cuisine ?",
        a: "L'installation complète (dépose ancienne cuisine, plomberie, électricité, pose des meubles, plan de travail, électroménager et finitions) prend entre 3 et 7 jours ouvrés. Ajoutez 1 à 2 semaines de délai pour la fabrication des meubles sur mesure et 2 à 3 mois pour le haut de gamme.",
      },
      {
        q: 'Quel plan de travail choisir ?',
        a: 'Le stratifié est le plus abordable (50-150 €/ml) et disponible en nombreux décors. Le bois massif (150-300 €/ml) est chaleureux mais demande un entretien régulier. Le quartz (250-500 €/ml) est très résistant et sans entretien. Le granit (300-600 €/ml) est indestructible. La céramique (400-800 €/ml) résiste à tout (chaleur, rayures, taches).',
      },
      {
        q: "Faut-il prévoir des travaux de plomberie et d'électricité avec la cuisine ?",
        a: "Oui, la rénovation d'une cuisine implique presque toujours des travaux de plomberie (déplacement de l'évier, raccordement du lave-vaisselle) et d'électricité (ajout de prises, circuit dédié pour le four et la plaque). Un bon cuisiniste coordonne ces corps de métier. Prévoyez 500 à 2 000 € supplémentaires pour la plomberie et 300 à 1 500 € pour l'électricité.",
      },
      {
        q: 'Comment bien agencer une petite cuisine ?',
        a: "Dans une cuisine de moins de 8 m², privilégiez un agencement en L ou en I pour optimiser l'espace. Utilisez des meubles hauts jusqu'au plafond, des tiroirs plutôt que des placards bas (accès plus facile), et un plan de travail escamotable si nécessaire. Un cuisiniste expérimenté peut rendre une cuisine de 5 m² parfaitement fonctionnelle grâce à des solutions sur mesure.",
      },
      {
        q: 'Quelle est la différence entre une cuisine en kit et une cuisine sur mesure ?',
        a: "La cuisine en kit (grande surface de bricolage) coûte 1 000 à 4 000 € pour 5 ml mais propose des dimensions standardisées qui laissent parfois des espaces vides. La cuisine sur mesure (cuisiniste professionnel) coûte 3 000 à 15 000 € mais s'adapte parfaitement à votre pièce, avec des matériaux de meilleure qualité et un suivi de chantier complet incluant la pose.",
      },
      {
        q: 'Les cuisinistes proposent-ils un service après-vente ?',
        a: 'Les cuisinistes sérieux offrent une garantie de 2 à 10 ans sur les meubles et un service après-vente incluant le réglage des portes et tiroirs après installation (le bois travaille les premiers mois). Vérifiez les conditions de garantie avant de signer : certaines enseignes incluent un ajustement gratuit à 6 mois. En cas de problème, le cuisiniste est votre interlocuteur unique, contrairement à une cuisine en kit.',
      },
      {
        q: 'Quels sont les délais pour une cuisine sur mesure ?',
        a: "Comptez 2 à 3 semaines pour la conception (prise de mesures, plan 3D, choix des matériaux), 4 à 8 semaines pour la fabrication des meubles, et 3 à 7 jours pour la pose complète. Au total, prévoyez 2 à 3 mois entre la commande et l'installation. Les cuisines haut de gamme ou importées peuvent nécessiter 3 à 4 mois de fabrication.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour l'installation de cuisine. La conception, la fabrication et la pose sont des projets planifiés sur plusieurs semaines. Prenez rendez-vous pour un premier échange sous 48h.",
    certifications: [
      'Qualibat (qualification aménagement intérieur)',
      'NF Ameublement (certification AFNOR/FCBA — sécurité et durabilité du mobilier)',
      'NF Environnement Ameublement (label éco-responsable)',
      'Garantie Meubles de France (fabrication française)',
      'Qualibat 4131 (agencement de cuisines)',
      'Label Artisan de confiance (CMA)',
      'Certification NF Ameublement',
      'Assurance décennale (obligatoire si modification des réseaux)',
    ],
    averageResponseTime: 'Conception 2 à 3 semaines, fabrication 4 à 8 semaines, pose 3 à 7 jours',
  },

  // ════════════════════════════════════════════════════════════════════════
  // NOUVEAUX MÉTIERS (35 services additionnels)
  // ════════════════════════════════════════════════════════════════════════

  charpentier: {
    slug: 'charpentier',
    name: 'Charpentier',
    priceRange: { min: 50, max: 120, unit: '€/m²' },
    commonTasks: [
      'Charpente traditionnelle bois : 70 à 150 €/m² de toiture',
      'Charpente fermettes industrielles : 50 à 80 €/m²',
      'Réparation de charpente (remplacement de pièces) : 100 à 250 €/ml',
      'Traitement insecticide/fongicide : 15 à 30 €/m²',
      'Surélévation en ossature bois : 1 200 à 2 000 €/m²',
      'Traitement charpente par injection (anti-termites/capricornes) : 20 à 40 €/m²',
      'Surélévation de toiture (rehaussement) : 800 à 1 500 €/m²',
      "Construction d'un carport ou auvent en bois : 2 000 à 6 000 €",
    ],
    tips: [
      'Un traitement préventif de la charpente tous les 10 ans prolonge sa durée de vie de plusieurs décennies.',
      "Pour une extension en bois, vérifiez que le charpentier est certifié ACQPA ou titulaire d'un Qualibat charpente bois.",
      'Exigez un diagnostic parasitaire (termites, capricornes) avant toute rénovation de charpente ancienne.',
      'En zone sismique, la charpente doit respecter les règles parasismiques (Eurocode 8). Demandez au charpentier de vérifier la classification de votre commune.',
      "Lors d'une surélévation en ossature bois, vérifiez que le PLU de votre commune autorise la hauteur supplémentaire et obtenez un permis de construire avant le démarrage des travaux.",
      "Faites inspecter votre charpente tous les 5 ans pour détecter l'humidité et les insectes xylophages (termites, capricornes, vrillettes) avant qu'ils ne causent des dégâts structurels.",
      "Un traitement préventif de charpente coûte 10 fois moins cher qu'un traitement curatif : comptez 15 à 30 €/m² en préventif contre 150 à 300 €/m² en curatif avec remplacement de pièces.",
      "Utilisez du bois classe 3 ou 4 pour les charpentes exposées à l'humidité (auvents, débords de toit, charpentes en région pluvieuse) : le douglas ou le mélèze résistent naturellement sans traitement chimique.",
    ],
    faq: [
      {
        q: "Quelle est la durée de vie d'une charpente bois ?",
        a: "Une charpente bois bien entretenue dure 100 ans et plus. Les charpentes en chêne des bâtiments anciens atteignent souvent 200 à 300 ans. Le principal ennemi est l'humidité, qui favorise les champignons (mérule) et les insectes xylophages.",
      },
      {
        q: 'Charpente traditionnelle ou fermettes ?',
        a: "La charpente traditionnelle permet d'aménager les combles et offre un cachet architectural. Les fermettes sont 30 à 40 % moins chères mais rendent les combles inaménageables (sauf conversion coûteuse). Pour une maison avec projet de combles aménagés, choisissez le traditionnel.",
      },
      {
        q: 'Comment détecter un problème de charpente ?',
        a: "Les signes d'alerte sont : affaissement visible de la toiture, craquements inhabituels, présence de sciure (signe d'insectes xylophages), taches d'humidité au plafond, odeur de moisi dans les combles. Au moindre doute, faites intervenir un charpentier pour un diagnostic. Un traitement précoce coûte 15 à 30 €/m², contre 100 à 250 €/ml pour un remplacement de pièce.",
      },
      {
        q: 'Quel bois choisir pour une charpente ?',
        a: "Le sapin et l'épicéa (résineux) sont les plus courants et économiques (classe d'emploi 2). Le chêne est plus noble et résistant mais 2 à 3 fois plus cher. Le douglas offre un excellent compromis : naturellement durable (classe 3), il résiste aux insectes sans traitement chimique. Pour les régions humides, le mélèze est recommandé.",
      },
      {
        q: "Combien coûte l'aménagement de combles avec modification de charpente ?",
        a: "L'aménagement de combles avec modification de charpente (passage de fermettes en charpente traditionnelle) coûte entre 800 et 1 500 €/m² tout compris (charpente, isolation, plancher, escalier, finitions). Pour des combles de 40 m², prévoyez un budget de 35 000 à 60 000 €. C'est souvent plus rentable qu'une extension.",
      },
      {
        q: 'Comment savoir si ma charpente est attaquée par les insectes ?',
        a: "Les signes révélateurs sont : sciure fine au sol sous la charpente, petits trous de sortie de 2 à 4 mm dans le bois, bois qui sonne creux lorsque vous le tapotez, et galeries visibles en surface. Certains insectes comme les capricornes émettent un bruit de grignotement audible la nuit. Au moindre doute, faites réaliser un diagnostic par un professionnel certifié (150 à 300 €) qui identifiera l'espèce et le traitement adapté.",
      },
      {
        q: 'Charpente traditionnelle ou fermette : quelle différence ?',
        a: "La charpente traditionnelle est réalisée en bois massif assemblé par tenons-mortaises ou boulonnage. Elle permet l'aménagement des combles et coûte 80 à 120 €/m². La charpente fermette (industrielle) est constituée de triangles en bois léger reliés par des connecteurs métalliques. Elle est plus économique (50 à 70 €/m²) mais rend les combles perdus, sauf conversion coûteuse. Le choix dépend de votre projet : si vous envisagez d'aménager les combles, optez pour le traditionnel.",
      },
      {
        q: 'Combien de temps dure une charpente en bois ?',
        a: "Une charpente en bois bien entretenue et régulièrement traitée dure 50 à 100 ans sans problème. Les charpentes en chêne de bâtiments historiques dépassent même 200 à 300 ans. La clé de la longévité est l'entretien : une inspection tous les 5 ans permet de détecter l'humidité, les champignons (mérule) et les insectes xylophages avant qu'ils ne fragilisent la structure. Un traitement préventif régulier et une bonne ventilation des combles sont essentiels.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la charpente. En cas de dégât de tempête sur la charpente, contactez d'abord un couvreur pour un bâchage d'urgence, puis un charpentier pour le diagnostic et la réparation structurelle.",
    certifications: [
      'Qualibat (qualification 2311/2312 charpente bois)',
      'CTB-A+ (certification traitement du bois — FCBA)',
      "Compagnons du Devoir (formation d'excellence)",
      'RGE (si isolation des combles associée)',
      'Qualibat 2312 (charpente bois — niveau confirmé)',
      'Compagnons du Tour de France (excellence artisanale)',
      'Certification CTB-A+ traitement préventif du bois (FCBA)',
      'Label RGE (isolation sous rampants de toiture)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 4 semaines',
  },

  zingueur: {
    slug: 'zingueur',
    name: 'Zingueur',
    priceRange: { min: 40, max: 80, unit: '€/ml' },
    commonTasks: [
      'Pose de gouttières en zinc : 40 à 80 €/ml',
      'Remplacement de chéneaux : 60 à 120 €/ml',
      "Pose de descentes d'eau : 30 à 60 €/ml",
      'Habillage de rives et bandeaux : 50 à 100 €/ml',
      'Réparation de noues et faîtages : 80 à 200 €/ml',
      'Pose de gouttières en aluminium laqué ou PVC : 30 à 80 €/ml',
      "Remplacement de descente d'eaux pluviales : 40 à 100 €/ml",
      'Habillage de lucarne en zinc : 500 à 2 000 €',
      'Pose de noue (intersection de toiture) : 50 à 100 €/ml',
      'Réparation de solins de cheminée : 200 à 600 €',
      'Faîtage ventilé en zinc : 30 à 60 €/ml',
      'Bavette et abergement de cheminée : 100 à 300 €/pièce',
      'Chéneau zinc sur mesure : 60 à 150 €/ml',
    ],
    tips: [
      "Le zinc a une durée de vie de 50 à 100 ans selon la qualité et l'exposition. Préférez le zinc prépatiné pour une meilleure résistance à la corrosion.",
      "Faites vérifier l'état de vos gouttières et descentes après chaque automne pour éviter les engorgements.",
      "Choisissez un zingueur qui travaille le zinc en continu (sans soudure) pour les longues longueurs de gouttière : c'est plus étanche et plus durable.",
      "Faites poser des crépines (grilles) à l'entrée des descentes pour empêcher les feuilles mortes de boucher les évacuations.",
      "En bord de mer, le zinc standard se corrode rapidement. Optez pour du zinc-cuivre-titane (VMZINC) ou de l'aluminium laqué, plus résistant aux embruns salins.",
      'Une gouttière bouchée peut provoquer des infiltrations dans les murs et les fondations : ne négligez jamais un débordement, même ponctuel.',
      'Le zinc naturel se patine naturellement en 5 à 10 ans pour prendre une teinte gris mat protectrice. Ne peignez jamais du zinc neuf : la patine est sa meilleure protection.',
      'Les crépines (crapaudines) en sortie de gouttière empêchent les bouchons de feuilles et réduisent considérablement la fréquence de nettoyage. Comptez 5 à 15 € pièce, un investissement dérisoire.',
    ],
    faq: [
      {
        q: 'Quel est le prix de remplacement de gouttières ?',
        a: 'Comptez 40 à 80 €/ml pour des gouttières en zinc, pose comprise. Pour une maison de 40 ml de gouttières, le budget total se situe entre 2 000 et 4 000 €. Le PVC est moins cher (20 à 40 €/ml) mais dure 2 à 3 fois moins longtemps.',
      },
      {
        q: 'Gouttière zinc, PVC ou aluminium : laquelle choisir ?',
        a: "Le zinc est le matériau le plus durable (50 à 100 ans) avec un bel aspect patiné, mais il est le plus cher. L'aluminium laqué offre un bon compromis (30 à 50 ans, large choix de couleurs, 35 à 70 €/ml). Le PVC est économique (20 à 40 €/ml) mais se déforme sous l'effet du soleil et ne dure que 15 à 25 ans.",
      },
      {
        q: 'À quelle fréquence faut-il nettoyer ses gouttières ?',
        a: "Un nettoyage complet est recommandé 2 fois par an : à la fin de l'automne (après la chute des feuilles) et au printemps. Si votre maison est entourée d'arbres, ajoutez un nettoyage en été. Des gouttières bouchées provoquent des débordements qui endommagent les façades et les fondations.",
      },
      {
        q: "Quels sont les signes d'une gouttière en mauvais état ?",
        a: "Les signes d'alerte sont : débordements lors des pluies, traces de rouille ou verdissement, gouttière qui se désolidarise de la façade, fissures visibles, eau qui coule le long du mur au lieu de descendre par les tuyaux. Une gouttière percée non réparée peut provoquer des infiltrations dans les murs et la toiture.",
      },
      {
        q: 'Peut-on poser des gouttières soi-même ?',
        a: "La pose de gouttières PVC avec collage est accessible aux bricoleurs confirmés. En revanche, la zinguerie (zinc soudé) requiert un savoir-faire professionnel : soudure à l'étain, façonnage sur mesure et respect des pentes d'écoulement (5 mm/ml minimum). Un défaut de pose entraîne des infiltrations et engage votre responsabilité en cas de sinistre.",
      },
      {
        q: 'Zinc, alu ou PVC pour les gouttières : quel matériau dure le plus longtemps ?',
        a: "Le zinc est le matériau le plus noble avec une durée de vie de 50 ans et plus, mais c'est le plus onéreux (40 à 80 €/ml). L'aluminium laqué ne nécessite aucun entretien et dure environ 30 ans avec un bon rapport qualité-prix (35 à 70 €/ml). Le PVC est le plus économique (20 à 40 €/ml) mais ne dure que 15 à 20 ans et jaunit avec le temps sous l'effet des UV.",
      },
      {
        q: 'Le zingueur et le couvreur sont-ils le même métier ?',
        a: "Ce sont deux métiers complémentaires. Le couvreur pose les éléments de couverture (tuiles, ardoises, bac acier), tandis que le zingueur se spécialise dans les éléments métalliques d'évacuation d'eau et d'étanchéité : gouttières, chéneaux, noues, solins, abergements de cheminée et habillages de lucarne. Beaucoup d'artisans cumulent les deux compétences (couvreur-zingueur).",
      },
      {
        q: "Combien coûte la réparation d'un solin de cheminée ?",
        a: "La réparation d'un solin de cheminée coûte entre 200 et 600 € selon l'accessibilité et l'étendue des dégâts. Le solin assure l'étanchéité entre la cheminée et la toiture : s'il est fissuré ou décollé, l'eau s'infiltre directement dans la charpente. C'est une réparation à ne jamais différer pour éviter des dommages structurels coûteux.",
      },
    ],
    emergencyInfo:
      "En cas de débordement de gouttière, descente d'eau arrachée ou fuite au niveau des raccords de toiture, contactez un zingueur d'urgence pour une réparation provisoire. Disponibilité et délais variables. Majorations : +60 à 100 % la nuit et le week-end.",
    certifications: [
      'Qualibat (qualification 3121/3122 couverture-zinguerie)',
      "Compagnons du Devoir (formation d'excellence)",
      'Certification VMZINC Installateur (partenaire fabricant)',
      'Qualibat 3511 (zinguerie)',
      'Compagnons du Tour de France',
      'Certification couvreur-zingueur',
      'NF DTU 40.5 (travaux de zinguerie)',
      'Assurance décennale obligatoire',
    ],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 2 semaines',
  },

  etancheiste: {
    slug: 'etancheiste',
    name: 'Étanchéiste',
    priceRange: { min: 40, max: 100, unit: '€/m²' },
    commonTasks: [
      'Étanchéité toiture-terrasse (membrane bitume) : 40 à 80 €/m²',
      'Étanchéité PVC/EPDM : 50 à 100 €/m²',
      'Étanchéité de balcon/loggia : 60 à 120 €/m²',
      'Cuvelage de sous-sol : 150 à 300 €/m²',
      "Traitement d'infiltrations : 50 à 200 €/m²",
      'Étanchéité toiture terrasse membrane EPDM : 50 à 120 €/m²',
      'Étanchéité fondations (murs enterrés) : 40 à 80 €/ml',
      "Étanchéité douche italienne (système d'étanchéité liquide SPEC) : 300 à 600 €",
      "Réparation de fissures de façade avec traitement d'étanchéité : 30 à 60 €/ml",
      'Pose de drain périphérique : 80 à 150 €/ml',
    ],
    tips: [
      "L'étanchéité d'un toit-terrasse doit être contrôlée tous les 5 ans. Un défaut mineur non traité peut entraîner des dommages structurels majeurs.",
      "Pour les terrasses accessibles, privilégiez une membrane EPDM (durée de vie 40 ans+) plutôt qu'un bitume classique.",
      "Demandez un test d'étanchéité (mise en eau) après les travaux : l'étanchéiste remplit la terrasse de quelques centimètres d'eau pendant 48 à 72h pour vérifier l'absence de fuite.",
      "Coupler l'étanchéité avec une isolation thermique (toiture chaude) est plus rentable que de faire les deux séparément et ouvre droit aux aides MaPrimeRénov'.",
      "Vérifiez que l'étanchéiste possède une garantie décennale spécifique à l'étanchéité (et pas seulement une garantie généraliste bâtiment) pour être correctement couvert en cas de sinistre.",
      "Ne négligez jamais l'étanchéité d'une douche italienne : c'est le premier poste de sinistre en assurance habitation. Un défaut d'étanchéité sous le receveur provoque des dégâts des eaux invisibles pendant des mois.",
      "Vérifiez l'étanchéité de votre toiture terrasse après chaque hiver : le gel, la neige et les écarts de température fragilisent les membranes et les relevés d'étanchéité.",
      "Un drain périphérique bien posé protège vos fondations pour 30 ans minimum. C'est un investissement rentable qui évite des travaux de cuvelage beaucoup plus coûteux par la suite.",
    ],
    faq: [
      {
        q: "Quelle garantie pour des travaux d'étanchéité ?",
        a: "Les travaux d'étanchéité sont couverts par la garantie décennale (10 ans). De plus, la plupart des fabricants de membranes offrent une garantie produit de 15 à 25 ans. Exigez les attestations d'assurance et de garantie fabricant.",
      },
      {
        q: "Quelle est la durée de vie d'une étanchéité de toit-terrasse ?",
        a: "Une membrane bitume SBS dure 20 à 30 ans, une membrane EPDM (caoutchouc synthétique) atteint 40 à 50 ans, et une résine d'étanchéité liquide (SEL) offre 20 à 25 ans de protection. La durée de vie dépend aussi de l'entretien : un nettoyage annuel et une inspection bisannuelle prolongent significativement la longévité du complexe.",
      },
      {
        q: "Comment savoir si mon toit-terrasse a un problème d'étanchéité ?",
        a: "Les signes révélateurs sont : traces d'humidité ou auréoles au plafond de l'étage inférieur, flaques stagnantes sur la terrasse après 48h sans pluie (défaut de pente), cloquage ou décollement de la membrane, végétation qui pousse dans les joints. Un diagnostic par un étanchéiste professionnel coûte 200 à 500 € et permet de cibler les réparations.",
      },
      {
        q: "Qu'est-ce qu'un cuvelage de sous-sol ?",
        a: "Le cuvelage est un traitement d'étanchéité intérieur ou extérieur des murs enterrés pour stopper les infiltrations d'eau dans un sous-sol. Il combine un enduit d'imperméabilisation, un drainage périphérique et parfois une pompe de relevage. Le coût varie de 150 à 300 €/m² de surface traitée. C'est la solution définitive pour un sous-sol humide.",
      },
      {
        q: 'Peut-on végétaliser un toit-terrasse étanchéifié ?',
        a: "Oui, à condition que la structure porte le surpoids (80 à 150 kg/m² selon le type de végétalisation) et que l'étanchéité soit anti-racines (membrane bitume avec voile de verre ou EPDM). La végétalisation extensive (sedum) est la plus légère et la moins exigeante en entretien. Elle prolonge la durée de vie de l'étanchéité en la protégeant des UV.",
      },
      {
        q: 'Quelle membrane choisir pour une toiture terrasse ?',
        a: "L'EPDM (caoutchouc synthétique) offre une durée de vie de 50 ans avec très peu d'entretien, c'est le choix premium. Le bitume SBS est moins cher mais dure 20 à 30 ans et nécessite un entretien plus régulier. Le PVC offre un bon rapport qualité-prix avec 25 à 35 ans de durée de vie. Le choix dépend du budget, de la surface et de l'accessibilité de la terrasse.",
      },
      {
        q: 'Mon sous-sol est humide : faut-il un cuvelage ?',
        a: "Si les infiltrations sont latérales (eau qui traverse les murs enterrés), le cuvelage est la solution définitive. Il consiste à créer une chemise étanche à l'intérieur des murs du sous-sol, combinant enduit d'imperméabilisation, drainage et parfois pompe de relevage. Le coût varie de 150 à 300 €/m² de surface traitée. Un simple traitement hydrofuge de surface ne suffira pas face à une pression hydrostatique.",
      },
      {
        q: "L'étanchéité est-elle couverte par la garantie décennale ?",
        a: "Oui, l'étanchéité fait partie du gros œuvre et relève de la garantie décennale (10 ans). Les sinistres liés à un défaut d'étanchéité sont d'ailleurs les plus fréquents en assurance décennale. L'étanchéiste doit vous remettre son attestation d'assurance décennale avant le début des travaux. Conservez-la précieusement : elle vous protège pendant 10 ans en cas d'infiltration.",
      },
    ],
    emergencyInfo:
      "En cas d'infiltration d'eau majeure par la toiture-terrasse ou le sous-sol, un étanchéiste peut réaliser une réparation provisoire d'urgence pour stopper les dégâts. Disponibilité et délais variables. Majorations : +60 à 100 % en dehors des heures ouvrées.",
    certifications: [
      'Qualibat (qualification 1311/1312 étanchéité)',
      'Certification ASQUAL (géomembranes et étanchéité)',
      'RGE (obligatoire si isolation thermique associée — toiture chaude)',
      'Qualibat 3191 (étanchéité toitures-terrasses)',
      'Qualibat 3192 (étanchéité façades)',
      "Certification CSFE (Chambre Syndicale Française de l'Étanchéité)",
      "Label RGE pour travaux d'étanchéité couplés à l'isolation thermique",
      "Assurance décennale obligatoire spécifique à l'étanchéité",
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 3 semaines',
  },

  facadier: {
    slug: 'facadier',
    name: 'Façadier',
    priceRange: { min: 30, max: 100, unit: '€/m²' },
    commonTasks: [
      'Ravalement de façade (enduit) : 30 à 70 €/m²',
      "Isolation thermique par l'extérieur (ITE) : 100 à 200 €/m²",
      'Peinture de façade : 20 à 45 €/m²',
      'Nettoyage haute pression : 10 à 25 €/m²',
      'Traitement anti-mousse et hydrofuge : 15 à 30 €/m²',
      'Ravalement complet (nettoyage + enduit + peinture) : 40 à 100 €/m²',
      'Crépi ou enduit décoratif (taloché, gratté, ribbé) : 30 à 60 €/m²',
      'Reprise de fissures structurelles avec agrafage : 30 à 80 €/ml',
    ],
    tips: [
      'Un ravalement de façade est obligatoire tous les 10 ans dans certaines communes. Renseignez-vous auprès de votre mairie.',
      "Profitez d'un ravalement pour ajouter une isolation par l'extérieur (ITE) et bénéficier des aides MaPrimeRénov'.",
      'Vérifiez les arrêtés municipaux sur les couleurs autorisées pour votre façade : les ABF (Architectes des Bâtiments de France) imposent des teintes spécifiques dans les zones protégées.',
      'Avant un ravalement, faites diagnostiquer les fissures : une fissure structurelle nécessite un traitement des fondations avant toute remise en état de la façade.',
      "Privilégiez les mois de printemps et d'automne pour le ravalement : les enduits ne doivent pas être appliqués en dessous de 5 °C ni au-dessus de 35 °C.",
      "Le ravalement est l'occasion idéale de faire une ITE : l'échafaudage est déjà en place, ce qui réduit le coût global d'environ 30 %.",
      "Un diagnostic façade préalable (500 à 1 000 €) permet d'identifier les désordres cachés (infiltrations, décollement d'enduit, carbonatation du béton) et d'éviter les mauvaises surprises en cours de chantier.",
      'Vérifiez les obligations communales de ravalement : certaines mairies envoient des mises en demeure avec astreintes financières de 50 à 200 € par jour de retard si les travaux ne sont pas engagés dans le délai imparti.',
    ],
    faq: [
      {
        q: 'Combien coûte un ravalement de façade pour une maison ?',
        a: "Pour une maison de 100 m² de façade, comptez entre 5 000 et 15 000 € selon l'état du support, le type d'enduit et la nécessité d'un échafaudage. Avec ITE, le budget monte à 15 000 à 25 000 € mais les aides peuvent couvrir jusqu'à 40 %.",
      },
      {
        q: 'Le ravalement de façade est-il obligatoire ?',
        a: 'Dans les communes ayant pris un arrêté en ce sens, le ravalement est obligatoire tous les 10 ans (article L132-1 du Code de la construction). La mairie peut vous mettre en demeure de réaliser les travaux sous 6 mois. En copropriété, le ravalement est voté en assemblée générale à la majorité absolue.',
      },
      {
        q: 'Quelles aides financières pour un ravalement de façade ?',
        a: "Un ravalement simple n'ouvre pas droit aux aides. En revanche, si vous ajoutez une isolation thermique par l'extérieur (ITE), vous pouvez bénéficier de MaPrimeRénov' (jusqu'à 75 €/m²), des CEE (prime énergie), de l'éco-PTZ et de la TVA à 5,5 %. Certaines communes accordent aussi des subventions pour l'embellissement des façades.",
      },
      {
        q: 'Combien de temps durent les travaux de ravalement ?',
        a: "Pour une maison individuelle, le ravalement dure 2 à 4 semaines selon la surface et le type de traitement (nettoyage simple, enduit, ITE). L'installation de l'échafaudage prend 1 à 2 jours. Prévoyez que l'échafaudage restera en place pendant toute la durée du chantier, ce qui peut gêner l'accès au jardin ou au parking.",
      },
      {
        q: 'Quelle différence entre enduit monocouche et enduit traditionnel ?',
        a: "L'enduit monocouche (ou enduit projeté) s'applique en une seule passe à la machine et coûte 25 à 50 €/m². L'enduit traditionnel se pose en 3 couches à la main (gobetis, corps d'enduit, finition) et revient à 40 à 70 €/m². Le traditionnel offre une meilleure durabilité et un rendu plus authentique, mais il est plus long à mettre en œuvre.",
      },
      {
        q: "Combien coûte une ITE (isolation thermique par l'extérieur) ?",
        a: "L'ITE coûte entre 120 et 200 €/m² fourniture et pose comprises, selon l'isolant choisi (polystyrène expansé, laine de roche, fibre de bois) et la finition (enduit mince, bardage). Pour une maison de 100 m² de façade, le budget se situe entre 12 000 et 20 000 €. Les aides MaPrimeRénov' peuvent atteindre 75 €/m² et les primes CEE 10 à 15 €/m², réduisant significativement le reste à charge.",
      },
      {
        q: 'Faut-il une autorisation pour un ravalement de façade ?',
        a: "Oui, une déclaration préalable de travaux est obligatoire dans la plupart des communes (article R421-17-a du Code de l'urbanisme). En zone protégée (ABF, site classé, AVAP), l'accord de l'Architecte des Bâtiments de France est requis, ce qui allonge le délai d'instruction à 2 mois au lieu d'1 mois. L'absence de déclaration expose à une amende pouvant atteindre 6 000 €/m² de surface concernée.",
      },
      {
        q: 'Comment choisir entre un crépi et une peinture de façade ?',
        a: "Le crépi (enduit projeté ou taloché) est idéal pour masquer les irrégularités du support et offre une durabilité de 20 à 30 ans pour un coût de 30 à 60 €/m². La peinture de façade (20 à 40 €/m²) convient aux supports déjà en bon état et se renouvelle tous les 10 à 15 ans. Pour une façade très dégradée, l'enduit est préférable ; pour un simple rafraîchissement, la peinture suffit.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour le ravalement de façade. Les travaux de façade nécessitent un échafaudage et une déclaration préalable en mairie. Prenez rendez-vous pour un devis gratuit sous 1 semaine.",
    certifications: [
      'Qualibat (qualification 6111/6112 ravalement, 7131/7132 ITE)',
      "RGE (obligatoire pour l'ITE — isolation thermique par l'extérieur)",
      'Certification applicateur Sto, Weber ou Parex-Lanko (partenaires fabricants)',
      'Qualibat 7131 (ravalement de façade — enduits et peintures)',
      "Qualibat 7132 (ITE — isolation thermique par l'extérieur)",
      'NF DTU 42.1 (référentiel peinture de façade — conformité technique)',
      "Assurance décennale (obligatoire pour tous travaux de façade et d'ITE)",
      'Certification ACQPA (application de peintures anticorrosion et de protection)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 6 semaines',
  },

  platrier: {
    slug: 'platrier',
    name: 'Plâtrier',
    priceRange: { min: 25, max: 55, unit: '€/m²' },
    commonTasks: [
      'Pose de cloisons en plaques de plâtre : 30 à 55 €/m²',
      'Faux-plafond en plaques de plâtre : 35 à 65 €/m²',
      'Doublage isolant (plaque + isolant) : 40 à 80 €/m²',
      'Enduit plâtre traditionnel : 25 à 45 €/m²',
      'Staff et corniche décorative : 30 à 100 €/ml',
      'Pose de plaques de plâtre (BA13) : 25 à 45 €/m²',
      'Enduit de lissage : 15 à 30 €/m²',
      'Ratissage murs avant peinture : 10 à 20 €/m²',
      'Bandes et joints de placo : 8 à 15 €/ml',
    ],
    tips: [
      'Pour les pièces humides (salle de bain, cuisine), exigez des plaques hydrofuges (vertes) et non des plaques standard.',
      'Un plâtrier-plaquiste expérimenté réalise des joints invisibles. Vérifiez la qualité des finitions sur des chantiers précédents.',
      "Pour une isolation acoustique efficace entre deux pièces, demandez une cloison double parement (2 plaques de chaque côté) avec laine minérale de 45 mm minimum dans l'ossature.",
      "Les plaques de plâtre existent en version coupe-feu (rose, résistance 1 à 2 heures), hydrofuge (verte) et haute dureté (bleue). Choisissez la bonne référence selon l'usage de la pièce.",
      "Pour un faux-plafond, demandez un plâtrier qui utilise des suspentes anti-vibratiles : elles réduisent considérablement la transmission des bruits d'impact venant de l'étage supérieur.",
      'Le placo phonique (Placo Phonique ou similaire) réduit le bruit de 50 % par rapport au BA13 standard : un investissement rentable pour les chambres et les pièces de vie.',
      "Prévoyez les boîtiers électriques AVANT la pose des plaques : les découpes après coup fragilisent le placo et compliquent le travail de l'électricien.",
      "Un bon plâtrier fait les bandes invisibles dès la première passe. Si vous voyez des surépaisseurs ou des traces de ponçage excessif, c'est le signe d'un manque de savoir-faire.",
    ],
    faq: [
      {
        q: 'Plaque de plâtre ou enduit traditionnel ?',
        a: "Les plaques de plâtre (BA13) sont plus rapides à poser et moins chères (30-55 €/m²). L'enduit traditionnel offre une meilleure inertie thermique et acoustique mais coûte plus cher en main-d'œuvre. Pour une rénovation, les plaques sont souvent privilégiées ; pour du neuf haut de gamme, l'enduit traditionnel.",
      },
      {
        q: 'Quelle épaisseur de cloison pour une bonne isolation phonique ?',
        a: 'Une cloison standard en BA13 (72 mm total) offre un affaiblissement de 35 à 40 dB. Pour une isolation phonique correcte entre deux chambres, optez pour une cloison de 98 mm (ossature 48 mm + 2 plaques de 13 mm + laine 45 mm) qui atteint 42 à 48 dB. Pour un mur mitoyen ou un studio de musique, une double cloison désolidarisée (160 mm) atteint 55 à 60 dB.',
      },
      {
        q: 'Comment réparer une fissure dans un plafond en plâtre ?',
        a: "Pour une fissure superficielle, grattez la fissure en V, appliquez un calicot (bande à fissure) enduit de MAP ou d'enduit de lissage. Pour une fissure structurelle (qui s'ouvre progressivement), faites d'abord diagnostiquer la cause (mouvement de structure, tassement) avant de réparer le plâtre. Une réparation cosmétique sur une fissure active réapparaîtra en quelques mois.",
      },
      {
        q: 'Combien de temps faut-il pour poser un faux-plafond ?',
        a: 'Un plâtrier expérimenté pose environ 15 à 25 m² de faux-plafond par jour. Pour une maison de 80 m², comptez 4 à 6 jours (ossature + plaques + bandes). Ajoutez 1 à 2 jours pour les finitions (enduit de lissage, ponçage). Les découpes pour spots encastrés et VMC sont incluses dans ce délai.',
      },
      {
        q: 'Quelle est la hauteur minimale pour un faux-plafond ?',
        a: 'La hauteur sous plafond minimale habitable est de 2,20 m selon le Code de la construction. Un faux-plafond standard consomme 5 à 10 cm de hauteur (suspentes + ossature + plaque). Si vous prévoyez des spots encastrés, comptez 10 à 15 cm. Pour un passage de gaines de VMC ou de climatisation, il faudra 20 à 30 cm.',
      },
      {
        q: 'Placo standard ou hydrofuge : lequel choisir ?',
        a: "Le BA13 standard (blanc) convient aux pièces sèches (chambres, salon, couloirs). Le BA13H (vert) est hydrofuge et obligatoire dans les pièces humides (salle de bain, cuisine, buanderie). Le BA13I (rose) est ignifuge et recommandé pour les cloisons de chaufferie, les gaines techniques et les locaux à risque incendie. Le surcoût du BA13H par rapport au standard est d'environ 2 à 3 €/m².",
      },
      {
        q: 'Peut-on accrocher des charges lourdes sur du placo ?',
        a: "Avec des chevilles Molly (chevilles à expansion métalliques), vous pouvez suspendre jusqu'à 30 kg par point de fixation sur du BA13 standard. Pour des charges plus lourdes (meubles de cuisine, téléviseur, ballon d'eau chaude), utilisez des plaques renforcées type Habito (Placo) qui supportent jusqu'à 80 kg sans chevilles spéciales. Au-delà, prévoyez des renforts en bois ou en métal dans l'ossature lors de la pose.",
      },
      {
        q: 'Combien de temps pour monter une cloison placo ?',
        a: 'Un plâtrier-plaquiste expérimenté monte une cloison simple de 10 m² en une journée (ossature métallique + plaques + vissage). Comptez 2 à 3 jours supplémentaires pour une cloison avec isolation intégrée et finition complète (bandes, enduit de lissage, ponçage). Le temps de séchage des enduits (24 à 48 h entre chaque couche) allonge le planning global.',
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la plâtrerie. Pour les réparations de cloisons, faux-plafonds ou enduits, prenez rendez-vous pour un devis gratuit sous 48h.",
    certifications: [
      'Qualibat (qualification 4111/4112 plâtrerie, cloisons et doublages)',
      'Certification Placo Applicateur (partenaire Saint-Gobain)',
      'RGE (obligatoire si doublage isolant ouvrant droit aux aides)',
      'Qualibat 4121 (plâtrerie — enduits et ouvrages en plâtre)',
      'NF DTU 25.41 (cloisons en plaques de plâtre sur ossature métallique)',
      'Certification Plaquiste agréé Placo/Saint-Gobain',
      "Label RGE (si isolation intégrée aux doublages — accès aux aides CEE et MaPrimeRénov')",
      'Assurance décennale obligatoire (garantie 10 ans sur cloisons, doublages et faux-plafonds)',
    ],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 2 semaines',
  },

  'salle-de-bain': {
    slug: 'salle-de-bain',
    name: 'Salle de bain',
    priceRange: { min: 4000, max: 15000, unit: '€' },
    commonTasks: [
      'Rénovation complète salle de bain 5 m² : 5 000 à 12 000 €',
      "Remplacement baignoire par douche à l'italienne : 3 000 à 7 000 €",
      "Création d'une salle de bain (dans une chambre) : 8 000 à 20 000 €",
      'Pose de carrelage mural et sol : 40 à 80 €/m²',
      'Installation meuble vasque + robinetterie : 500 à 2 500 €',
    ],
    tips: [
      "Pour une douche à l'italienne, exigez une étanchéité SPEC (Système de Protection à l'Eau sous Carrelage) certifiée.",
      "Prévoyez une VMC performante pour éviter les problèmes d'humidité et de moisissures.",
      "Prévoyez un budget de 15 à 20 % en plus pour les imprévus (tuyauterie vétuste à reprendre, support mural dégradé derrière l'ancien carrelage).",
      "Pour une salle de bain accessible PMR, les normes imposent une douche de plain-pied d'au moins 120 × 120 cm, des barres d'appui et un espace de manœuvre de 150 cm de diamètre.",
      "Faites appel à un seul coordinateur de travaux (plombier-carreleur ou entreprise tous corps d'état) plutôt que de gérer 3 ou 4 artisans séparément — cela simplifie la planification et les garanties.",
    ],
    faq: [
      {
        q: 'Quelles aides pour rénover sa salle de bain ?',
        a: "Si vous avez plus de 60 ans ou êtes en situation de handicap, l'aide MaPrimeAdapt' peut couvrir jusqu'à 70 % des travaux d'adaptation (douche accessible, barres d'appui). La TVA réduite à 10 % s'applique pour les logements de plus de 2 ans. Certaines caisses de retraite proposent aussi des aides.",
      },
      {
        q: "Combien de temps durent les travaux de rénovation d'une salle de bain ?",
        a: "Une rénovation complète de salle de bain (5 à 8 m²) dure en moyenne 2 à 3 semaines : démolition (2-3 jours), plomberie et électricité (2-3 jours), étanchéité et carrelage (4-5 jours), pose des équipements (2-3 jours), finitions (1-2 jours). Pendant les travaux, prévoyez un point d'eau de substitution (cuisine, salle d'eau secondaire).",
      },
      {
        q: "Douche à l'italienne ou receveur extra-plat ?",
        a: "La douche à l'italienne (encastrée dans le sol) offre un esthétisme supérieur et une accessibilité optimale, mais nécessite un sol épais pour encastrer la bonde et une étanchéité irréprochable (4 000 à 7 000 €). Le receveur extra-plat (2 à 4 cm de hauteur) est plus simple à poser, moins risqué pour l'étanchéité et plus économique (2 500 à 5 000 €). En rénovation d'appartement, le receveur extra-plat est souvent le choix le plus pragmatique.",
      },
      {
        q: 'Quel carrelage choisir pour une salle de bain ?',
        a: "Privilégiez un carrelage antidérapant classé R10 ou R11 pour le sol de douche (norme DIN 51097 classe B minimum). Le grès cérame est le matériau le plus résistant à l'humidité et le plus facile à entretenir. Évitez les joints blancs qui jaunissent : optez pour un joint époxy (imperméable et antifongique) de couleur grise ou assortie au carrelage.",
      },
      {
        q: 'Peut-on créer une salle de bain dans une chambre ?',
        a: "Oui, c'est courant lors d'une rénovation. Les contraintes principales sont : l'acheminement des arrivées d'eau et des évacuations (possible avec une pompe de relevage si nécessaire), la ventilation (VMC obligatoire), l'étanchéité du sol et l'isolation phonique. Le budget pour créer une salle de bain complète dans une chambre se situe entre 8 000 et 20 000 € selon le niveau de finition.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la rénovation de salle de bain. En cas de fuite d'eau urgente, contactez un plombier d'urgence. Pour votre projet de rénovation, prenez rendez-vous pour un devis gratuit sous 1 semaine.",
    certifications: [
      'Qualibat (qualification aménagement intérieur, plomberie, carrelage)',
      'Handibat (label accessibilité PMR — Chambre de Métiers)',
      'RGE (si isolation thermique associée — ouvre droit aux aides)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 6 semaines',
  },

  'pompe-a-chaleur': {
    slug: 'pompe-a-chaleur',
    name: 'Pompe à chaleur',
    priceRange: { min: 8000, max: 18000, unit: '€' },
    commonTasks: [
      'PAC air/eau (chauffage + ECS) : 10 000 à 18 000 €',
      'PAC air/air (climatisation réversible) : 3 000 à 8 000 €',
      'PAC géothermique : 15 000 à 25 000 €',
      'Entretien annuel obligatoire : 150 à 300 €',
      'Remplacement de chaudière fioul par PAC : 12 000 à 20 000 €',
    ],
    tips: [
      "Exigez un installateur certifié QualiPAC — c'est obligatoire pour bénéficier des aides MaPrimeRénov' et des CEE.",
      "Un dimensionnement correct est crucial : une PAC surdimensionnée consomme plus et s'use prématurément. Exigez une étude thermique (800 à 1 500 €).",
      "L'entretien annuel d'une PAC de plus de 4 kW est obligatoire depuis 2020 (décret n° 2020-912). Souscrivez un contrat de maintenance dès l'installation pour garantir les performances et la durée de vie.",
      "Vérifiez le niveau sonore de l'unité extérieure (exprimé en dB(A) à 1 m) avant l'achat : les PAC air/eau les plus silencieuses descendent sous 40 dB(A). Un mauvais choix peut créer des conflits de voisinage.",
      "Coupler une pompe à chaleur avec des panneaux solaires photovoltaïques permet d'alimenter la PAC avec de l'électricité gratuite en journée, réduisant la facture de chauffage de 60 à 80 %.",
    ],
    faq: [
      {
        q: 'Quelles aides pour installer une pompe à chaleur ?',
        a: "MaPrimeRénov' : jusqu'à 5 000 € (revenus modestes). CEE (prime énergie) : 2 000 à 4 000 €. Éco-PTZ : prêt à taux zéro jusqu'à 50 000 €. TVA réduite à 5,5 %. Au total, les aides peuvent couvrir 40 à 70 % du coût pour les ménages modestes.",
      },
      {
        q: 'PAC air/eau ou air/air : laquelle choisir ?',
        a: "La PAC air/eau chauffe l'eau du circuit de radiateurs ou du plancher chauffant et peut aussi produire l'eau chaude sanitaire. Elle est idéale en remplacement d'une chaudière fioul ou gaz (10 000 à 18 000 €). La PAC air/air (climatisation réversible) souffle de l'air chaud ou froid via des splits muraux (3 000 à 8 000 €). Elle est plus économique mais ne produit pas d'eau chaude et n'ouvre pas droit à MaPrimeRénov'.",
      },
      {
        q: "Quelle est la durée de vie d'une pompe à chaleur ?",
        a: "Une PAC air/eau bien entretenue dure 15 à 20 ans. Le compresseur (pièce la plus sollicitée) a une durée de vie de 12 à 15 ans. Un entretien annuel (vérification du fluide frigorigène, nettoyage des filtres, contrôle des performances) est obligatoire et prolonge significativement la durée de vie. Le remplacement du compresseur (1 500 à 3 000 €) peut redonner 10 ans de vie à l'installation.",
      },
      {
        q: 'Une pompe à chaleur fonctionne-t-elle par grand froid ?',
        a: "Les PAC air/eau récentes fonctionnent jusqu'à -15 °C, voire -25 °C pour les modèles haut de gamme (Daikin Altherma, Atlantic Alfea). Toutefois, le COP (coefficient de performance) diminue avec la température extérieure : de 4 à 5 par temps doux (7 °C), il chute à 2 à 3 par -10 °C. Un appoint électrique intégré prend le relais lors des vagues de froid exceptionnelles.",
      },
      {
        q: 'La pompe à chaleur est-elle bruyante ?',
        a: "L'unité extérieure émet 40 à 55 dB(A) à 1 m de distance (comparable à une conversation). Les modèles récents proposent un mode silencieux nocturne (35 à 45 dB). La réglementation impose un seuil d'émergence de 5 dB(A) le jour et 3 dB(A) la nuit par rapport au bruit ambiant. Installez l'unité extérieure à distance des chambres du voisin et sur des plots anti-vibratiles pour limiter les nuisances.",
      },
    ],
    emergencyInfo:
      "En cas de panne de chauffage en hiver, un chauffagiste d'urgence peut intervenir en 2 à 4h pour un diagnostic. Coût : 150 à 350 € (déplacement + diagnostic).",
    certifications: [
      "QualiPAC (obligatoire pour les aides MaPrimeRénov' et CEE)",
      "RGE (Reconnu Garant de l'Environnement)",
      'Attestation de capacité fluides frigorigènes (obligatoire — catégorie I)',
      'Qualibat (qualification 5212/5213 chauffage, génie climatique)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, installation 2 à 4 semaines',
  },

  'panneaux-solaires': {
    slug: 'panneaux-solaires',
    name: 'Panneaux solaires',
    priceRange: { min: 7000, max: 20000, unit: '€' },
    commonTasks: [
      'Installation photovoltaïque 3 kWc : 7 000 à 10 000 €',
      'Installation photovoltaïque 6 kWc : 12 000 à 16 000 €',
      'Installation photovoltaïque 9 kWc : 16 000 à 22 000 €',
      'Solaire thermique (eau chaude) : 4 000 à 8 000 €',
      'Batterie de stockage : 4 000 à 10 000 €',
    ],
    tips: [
      "La rentabilité dépend de l'orientation (sud idéal), de l'inclinaison (30° optimal) et de l'ensoleillement local. Une étude de faisabilité gratuite est proposée par la plupart des installateurs.",
      'En autoconsommation avec revente du surplus, le retour sur investissement est de 8 à 12 ans en moyenne.',
      "Vérifiez que votre installateur possède la certification QualiPV et le label RGE, deux conditions indispensables pour bénéficier des aides de l'État (prime à l'autoconsommation, obligation d'achat EDF OA).",
      "Faites nettoyer vos panneaux une fois par an à l'eau claire sans détergent : la poussière et les fientes d'oiseaux peuvent réduire la production de 5 à 15 %.",
      "Pensez au monitoring en temps réel via une application : un dysfonctionnement non détecté peut représenter plusieurs centaines d'euros de perte de production sur un an.",
    ],
    faq: [
      {
        q: "Est-ce rentable d'installer des panneaux solaires ?",
        a: "Oui, avec un prix de l'électricité en hausse constante. Une installation de 3 kWc produit environ 3 500 kWh/an dans le sud de la France, soit 500 à 700 € d'économie annuelle. Avec la prime à l'autoconsommation (1 140 € pour 3 kWc) et la revente du surplus au tarif CRE en vigueur (révisé trimestriellement — vérifiez sur edf-oa.fr), le retour sur investissement se fait en 8 à 12 ans pour un équipement qui dure 30 ans+.",
      },
      {
        q: 'Quelle est la durée de vie des panneaux solaires ?',
        a: "Les panneaux photovoltaïques ont une durée de vie de 30 à 40 ans. La garantie constructeur couvre généralement 25 ans sur la production (80 % du rendement initial garanti). L'onduleur, en revanche, doit être remplacé tous les 10 à 15 ans (coût : 1 000 à 2 000 €).",
      },
      {
        q: 'Peut-on installer des panneaux solaires sur un toit plat ou orienté nord ?',
        a: 'Un toit plat convient très bien grâce à des supports inclinés à 30° orientés plein sud. En revanche, une orientation nord réduit la production de 40 à 50 %, ce qui rend le projet rarement rentable. Les orientations est et ouest restent viables avec une perte de 15 à 20 % seulement.',
      },
      {
        q: 'Faut-il une autorisation pour poser des panneaux solaires ?',
        a: "Oui, une déclaration préalable de travaux en mairie est obligatoire dans tous les cas. En zone protégée (ABF, monument historique), l'architecte des Bâtiments de France doit donner son accord, ce qui peut rallonger le délai de 2 à 6 mois. En copropriété, un vote en assemblée générale est requis.",
      },
      {
        q: 'Autoconsommation totale ou revente du surplus : quel choix faire ?',
        a: "L'autoconsommation avec revente du surplus est le modèle le plus courant et le plus rentable pour les particuliers. Vous consommez directement l'électricité produite et revendez l'excédent à EDF OA à un tarif garanti pendant 20 ans. La revente totale est plutôt réservée aux grandes toitures ou aux bâtiments peu consommateurs.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour l'installation de panneaux solaires. En cas de panne de votre onduleur ou de baisse de production anormale, contactez votre installateur pour un diagnostic sous 48h à 1 semaine.",
    certifications: [
      "QualiPV (qualification Qualit'EnR — installation photovoltaïque)",
      "RGE (obligatoire pour les aides MaPrimeRénov' et prime autoconsommation)",
      'QualiSol (si installation de solaire thermique — chauffe-eau et SSC)',
      'Consuel (attestation de conformité électrique — obligatoire pour le raccordement)',
    ],
    averageResponseTime: 'Étude gratuite sous 1 semaine, installation 4 à 8 semaines',
  },

  'isolation-thermique': {
    slug: 'isolation-thermique',
    name: 'Isolation thermique',
    priceRange: { min: 20, max: 100, unit: '€/m²' },
    commonTasks: [
      'Isolation des combles perdus (soufflage) : 20 à 35 €/m²',
      'Isolation des combles aménagés : 40 à 80 €/m²',
      "Isolation des murs par l'intérieur (ITI) : 30 à 70 €/m²",
      "Isolation des murs par l'extérieur (ITE) : 100 à 200 €/m²",
      'Isolation du plancher bas : 25 à 50 €/m²',
    ],
    tips: [
      "Les combles sont responsables de 25 à 30 % des déperditions thermiques : c'est le poste à traiter en priorité.",
      "Exigez des matériaux certifiés ACERMI et un artisan RGE pour bénéficier des aides (MaPrimeRénov', CEE, éco-PTZ).",
      'Comparez les devis sur la résistance thermique (R) proposée et pas uniquement sur le prix au m² : un isolant moins cher mais moins performant vous coûtera plus cher en énergie à long terme.',
      "Attention aux ponts thermiques (jonctions murs/planchers, contours de fenêtres) : une isolation mal posée peut perdre jusqu'à 20 % de son efficacité si ces points ne sont pas traités.",
      "Pour l'isolation par l'extérieur (ITE), vérifiez que l'entreprise maîtrise la pose d'enduit sur isolant et demandez des photos de chantiers réalisés depuis au moins 5 ans.",
    ],
    faq: [
      {
        q: "Quelle épaisseur d'isolant faut-il ?",
        a: "Pour les combles perdus : 30 à 40 cm de laine de verre/roche (R ≥ 7 m².K/W). Pour les murs par l'intérieur : 12 à 16 cm (R ≥ 3,7). Pour les murs par l'extérieur : 14 à 18 cm (R ≥ 3,7). Ces valeurs correspondent à la RT 2012 / RE 2020 et permettent d'obtenir les aides.",
      },
      {
        q: "Isolation par l'intérieur ou par l'extérieur : que choisir ?",
        a: "L'ITI (intérieur) est moins chère (30 à 70 €/m²) et ne modifie pas la façade, mais réduit la surface habitable de 3 à 5 %. L'ITE (extérieur) coûte plus cher (100 à 200 €/m²) mais supprime les ponts thermiques, préserve l'espace intérieur et offre un ravalement de façade inclus. L'ITE est idéale lors d'un ravalement obligatoire.",
      },
      {
        q: "L'isolation des combles est-elle vraiment prioritaire ?",
        a: "Oui, car la chaleur monte : les combles non isolés représentent 25 à 30 % des pertes de chaleur d'une maison. C'est aussi l'isolation la moins chère (20 à 35 €/m² en soufflage pour combles perdus) avec le meilleur retour sur investissement (amortie en 3 à 5 ans grâce aux économies de chauffage).",
      },
      {
        q: 'Quels matériaux isolants choisir ?',
        a: "La laine de verre et la laine de roche offrent le meilleur rapport performance/prix. La ouate de cellulose et la fibre de bois sont des alternatives écologiques avec un bon déphasage thermique (confort d'été). Le polyuréthane est le plus performant à épaisseur égale mais coûte plus cher. Tous doivent être certifiés ACERMI.",
      },
      {
        q: "L'isolation phonique et thermique sont-elles la même chose ?",
        a: "Non, ce sont deux performances distinctes. Un bon isolant thermique n'est pas forcément un bon isolant phonique. La laine de roche et la ouate de cellulose offrent de bonnes performances dans les deux domaines. Pour une isolation phonique spécifique, il faut traiter les parois avec des systèmes masse-ressort-masse (double cloison avec isolant intercalé).",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour l'isolation thermique. Les travaux d'isolation sont des projets planifiés nécessitant une étude préalable. Prenez rendez-vous pour un devis gratuit sous 1 semaine.",
    certifications: [
      "RGE (Reconnu Garant de l'Environnement — obligatoire pour les aides)",
      'Qualibat (qualification 7131/7132 isolation thermique intérieure et extérieure)',
      'Certification ACERMI (garantie de performance des matériaux isolants)',
      'NF Habitat / NF Habitat HQE (label qualité rénovation)',
    ],
    averageResponseTime: 'Devis sous 1 semaine, intervention 1 à 3 semaines',
  },

  'renovation-energetique': {
    slug: 'renovation-energetique',
    name: 'Rénovation énergétique',
    priceRange: { min: 15000, max: 50000, unit: '€' },
    commonTasks: [
      'Audit énergétique (DPE + préconisations) : 800 à 1 500 €',
      'Rénovation globale (isolation + chauffage + ventilation) : 20 000 à 60 000 €',
      'Passage de DPE F/G à C/D : 15 000 à 40 000 €',
      'Remplacement de chaudière fioul par PAC + isolation : 25 000 à 50 000 €',
    ],
    tips: [
      'Commencez toujours par un audit énergétique pour hiérarchiser les travaux et maximiser les aides.',
      "Le Parcours accompagné de MaPrimeRénov' récompense les projets de rénovation globale améliorant le DPE d'au moins 2 classes. Ce bonus a été intégré dans le Parcours accompagné depuis 2024.",
      "Faites appel à un Accompagnateur Rénov' agréé par l'État : c'est désormais obligatoire pour les projets de rénovation globale bénéficiant de MaPrimeRénov'.",
      "Priorisez les travaux dans cet ordre : isolation (combles, murs, sols), puis ventilation (VMC double flux), puis changement du système de chauffage. Isoler sans ventiler provoque des problèmes d'humidité.",
      'Conservez toutes les factures et attestations RGE pendant 10 ans : elles servent de preuve pour les garanties décennales et en cas de contrôle fiscal sur les aides perçues.',
    ],
    faq: [
      {
        q: 'Quelles sont les aides pour une rénovation énergétique ?',
        a: "MaPrimeRénov' (jusqu'à 20 000 €), MaPrimeRénov' Parcours accompagné pour les ménages modestes (jusqu'à 32 000 € pour les très modestes), CEE (primes énergie), éco-PTZ (jusqu'à 50 000 € à taux zéro), TVA à 5,5 %, aides locales (régions, départements). Un ménage modeste peut couvrir jusqu'à 80 % du coût des travaux.",
      },
      {
        q: "Qu'est-ce qu'un audit énergétique et est-il obligatoire ?",
        a: "L'audit énergétique est une analyse complète de votre logement (isolation, chauffage, ventilation) avec un plan de travaux chiffré. Il est obligatoire depuis 2023 pour la vente des logements classés F ou G au DPE. Son coût (800 à 1 500 €) est partiellement pris en charge par MaPrimeRénov' (jusqu'à 500 €).",
      },
      {
        q: "Comment passer d'un DPE F ou G à un DPE C ou D ?",
        a: "Il faut généralement combiner isolation des combles et des murs (gain de 1 à 2 classes), remplacement du chauffage par une pompe à chaleur ou chaudière à condensation (gain de 1 classe), et installation d'une VMC double flux. Le budget moyen est de 20 000 à 40 000 €, mais les aides peuvent couvrir 50 à 80 % pour les ménages modestes.",
      },
      {
        q: "Peut-on rénover par étapes ou faut-il tout faire d'un coup ?",
        a: "On peut rénover par étapes, mais la rénovation globale est plus efficace et mieux aidée. Le parcours « par geste » de MaPrimeRénov' finance chaque poste séparément, tandis que le parcours « accompagné » pour une rénovation globale offre des primes bonifiées. Attention à l'ordre des travaux : isoler avant de changer le chauffage pour bien dimensionner l'équipement.",
      },
      {
        q: 'Les logements classés G seront-ils vraiment interdits à la location ?',
        a: 'Oui, la loi Climat et Résilience interdit progressivement la location des passoires thermiques : les logements G sont interdits à la location depuis janvier 2025, les F le seront en 2028 et les E en 2034. Les propriétaires bailleurs doivent donc engager des travaux de rénovation sous peine de ne plus pouvoir louer.',
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour la rénovation énergétique. Les projets de rénovation globale nécessitent un audit énergétique préalable et une planification sur plusieurs mois. Prenez rendez-vous pour un premier rendez-vous sous 2 semaines.",
    certifications: [
      "RGE (Reconnu Garant de l'Environnement — obligatoire pour toutes les aides)",
      'Audit énergétique certifié OPQIBI 1905 ou Qualibat 8731',
      'Label BBC Rénovation (Bâtiment Basse Consommation)',
      "Accompagnateur Rénov' agréé par l'État (obligatoire pour MaPrimeRénov' parcours accompagné)",
    ],
    averageResponseTime: 'Audit sous 2 semaines, planification des travaux 1 à 3 mois',
  },

  'borne-recharge': {
    slug: 'borne-recharge',
    name: 'Borne de recharge',
    priceRange: { min: 1200, max: 3000, unit: '€' },
    commonTasks: [
      'Borne 7,4 kW (monophasé) : 1 200 à 2 000 €',
      'Borne 11 kW (triphasé) : 1 500 à 2 500 €',
      'Borne 22 kW (triphasé) : 2 000 à 3 500 €',
      'Installation en copropriété (droit à la prise) : 1 500 à 3 000 €',
      'Mise aux normes du tableau électrique : 500 à 1 500 €',
    ],
    tips: [
      "Seul un électricien certifié IRVE peut installer une borne de recharge — c'est obligatoire pour bénéficier des aides (prime Advenir en copropriété). Note : le crédit d'impôt de 300 € a été supprimé au 1er janvier 2026.",
      'Une borne 7,4 kW suffit pour la plupart des usages (recharge complète en 6 à 8h pendant la nuit).',
      "Vérifiez la puissance de votre abonnement électrique avant l'installation : une borne 7,4 kW nécessite souvent un passage en 9 kVA minimum, et une borne 11 kW exige un raccordement triphasé.",
      "Programmez la recharge en heures creuses (généralement entre 22h et 6h) pour réduire le coût d'électricité de 30 à 40 % par rapport aux heures pleines.",
      "En copropriété, vous pouvez invoquer le « droit à la prise » (décret du 13 juillet 2011) : le syndic ne peut pas refuser l'installation sauf motif sérieux et légitime.",
    ],
    faq: [
      {
        q: 'Quelles aides pour installer une borne de recharge ?',
        a: "Le crédit d'impôt pour borne de recharge a été supprimé au 1er janvier 2026. Prime Advenir jusqu'à 960 € en copropriété, TVA réduite à 5,5 % pour les logements de plus de 2 ans. Le budget net après aides dépend de votre situation (copropriété, aides locales).",
      },
      {
        q: 'Peut-on recharger sa voiture électrique sur une prise domestique classique ?',
        a: "Techniquement oui, mais c'est déconseillé pour un usage quotidien. Une prise standard 230V/10A délivre seulement 2,3 kW, soit 10 à 15 heures pour une recharge complète. De plus, elle n'est pas conçue pour une utilisation prolongée à pleine charge et peut provoquer un échauffement dangereux. Une prise renforcée Green'Up (3,7 kW) est un minimum acceptable.",
      },
      {
        q: 'Quelle différence entre une borne monophasée et triphasée ?',
        a: 'Une borne monophasée (7,4 kW max) est la plus courante en maison individuelle et suffit pour une recharge nocturne. Une borne triphasée (11 ou 22 kW) recharge 2 à 3 fois plus vite mais nécessite un raccordement triphasé (modification du compteur Enedis, 150 à 300 €). Le triphasé est recommandé si vous parcourez plus de 100 km par jour.',
      },
      {
        q: "Combien coûte la recharge d'une voiture électrique à domicile ?",
        a: "En tarif de base, une recharge complète (batterie de 50 kWh) coûte environ 10 à 12 €. En heures creuses, ce coût tombe à 7 à 8 €, soit environ 2 € aux 100 km. C'est 4 à 5 fois moins cher qu'un véhicule essence. Avec un abonnement adapté et la programmation nocturne, le surcoût d'électricité est de 30 à 50 €/mois pour 15 000 km/an.",
      },
      {
        q: "L'installation d'une borne nécessite-t-elle des travaux importants ?",
        a: "Dans la majorité des cas, l'installation est simple : fixation murale de la borne, tirage d'un câble depuis le tableau électrique et ajout d'un disjoncteur dédié. Les travaux durent 2 à 4 heures. Cependant, si le tableau est éloigné du garage (plus de 20 m) ou si une mise aux normes électrique est nécessaire, le coût et la durée augmentent significativement.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour l'installation de bornes de recharge. En cas de panne de votre borne existante, contactez le SAV du fabricant ou votre installateur IRVE pour un diagnostic sous 48h.",
    certifications: [
      'Qualification IRVE P1/P2/P3 (obligatoire — Infrastructure de Recharge de Véhicules Électriques)',
      'Habilitation électrique (obligatoire)',
      'Qualifelec (mention IRVE)',
      'Consuel (attestation de conformité électrique)',
    ],
    averageResponseTime: 'Devis sous 48h, installation sous 1 à 2 semaines',
  },

  ramoneur: {
    slug: 'ramoneur',
    name: 'Ramoneur',
    priceRange: { min: 50, max: 120, unit: '€' },
    commonTasks: [
      'Ramonage de cheminée (conduit maçonné) : 50 à 90 €',
      'Ramonage de poêle à bois/granulés : 60 à 120 €',
      'Ramonage de chaudière (conduit fumée) : 70 à 130 €',
      'Débistrage (enlèvement du bistre) : 150 à 400 €',
      'Tubage de conduit : 1 500 à 3 500 €',
      'Inspection vidéo de conduit de fumée : 100 à 200 €',
      "Test d'étanchéité de conduit : 100 à 200 €",
      "Installation d'un chapeau de cheminée (aspirateur statique ou anti-refoulement) : 100 à 300 €",
    ],
    tips: [
      'Le ramonage est obligatoire 1 à 2 fois par an selon les communes (vérifiez le règlement sanitaire départemental). Le certificat de ramonage est exigé par votre assurance en cas de sinistre.',
      "Planifiez votre ramonage en septembre/octobre, avant la saison de chauffe — les délais sont plus courts qu'en plein hiver.",
      "Après l'intervention, exigez un certificat de ramonage portant la date, la nature des travaux et le nom du professionnel : c'est ce document que votre assureur réclamera en cas de sinistre.",
      "Si votre conduit est ancien (avant 1960) ou fissuré, le ramoneur peut recommander un tubage en inox : c'est un investissement de 1 500 à 3 500 € qui sécurise l'installation pour 30 ans.",
      "Pour un poêle à granulés, le ramonage doit inclure le nettoyage du conduit d'évacuation ET du conduit de raccordement : les deux sont sources d'encrassement et de risque.",
      "Conservez le certificat de ramonage pendant au moins 2 ans : c'est la pièce justificative exigée par votre assureur en cas de sinistre (incendie de cheminée, dégât des eaux lié au conduit).",
      "Le débistrage est nécessaire dès que le bistre (dépôt dur et brillant) s'accumule dans le conduit : un simple ramonage mécanique ne l'élimine pas, il faut une débistreuse rotative.",
      'Un conduit non tubé construit avant 1960 doit être gainé en inox pour être conforme aux normes DTU 24.1 : sans tubage, les risques de fuite de CO et de feu de cheminée sont multipliés.',
    ],
    faq: [
      {
        q: 'Que risque-t-on sans ramonage ?',
        a: "Sans ramonage, vous risquez un feu de cheminée (bistre inflammable), une intoxication au monoxyde de carbone (CO), et un refus d'indemnisation par votre assurance en cas d'incendie. L'amende pour défaut de ramonage peut atteindre 450 € (contravention de 3e classe).",
      },
      {
        q: 'Combien de fois par an faut-il faire ramoner ?',
        a: "Le règlement sanitaire départemental impose généralement 2 ramonages par an pour les combustibles solides (bois, granulés) dont 1 pendant la période de chauffe, et 1 ramonage par an pour le gaz et le fioul. Vérifiez les obligations de votre commune car elles varient d'un département à l'autre.",
      },
      {
        q: 'Quelle est la différence entre ramonage mécanique et chimique ?',
        a: "Le ramonage mécanique (avec hérisson) est le seul reconnu légalement et par les assurances. Le ramonage chimique (bûches de ramonage) est un complément d'entretien qui ramollit les dépôts de suie, mais ne remplace jamais le passage d'un professionnel. Les bûches de ramonage ne donnent pas droit à un certificat.",
      },
      {
        q: "Qu'est-ce que le bistre et comment le traiter ?",
        a: "Le bistre est un dépôt dur et inflammable qui se forme sur les parois du conduit, surtout avec du bois humide ou une combustion lente. Le débistrage nécessite une machine rotative spéciale (débistreuse) et coûte 150 à 400 €. Un ramonage classique ne suffit pas à l'éliminer. Brûler du bois sec (moins de 20 % d'humidité) limite sa formation.",
      },
      {
        q: 'Comment choisir un bon ramoneur ?',
        a: "Vérifiez qu'il possède une qualification Qualibat 5141 ou une certification équivalente, une assurance responsabilité civile professionnelle et qu'il remet systématiquement un certificat de ramonage. Privilégiez un professionnel local recommandé par le bouche-à-oreille. Méfiez-vous des offres à moins de 30 € : un ramonage sérieux prend 20 à 40 minutes.",
      },
      {
        q: 'Le ramonage est-il à la charge du locataire ou du propriétaire ?',
        a: "Le ramonage est une charge locative : c'est au locataire de le faire réaliser et de le payer. En revanche, le propriétaire est responsable du bon état du conduit (tubage, étanchéité, conformité). Si le conduit est défaillant, c'est au propriétaire de financer les travaux de remise en état.",
      },
      {
        q: 'Peut-on ramoner soi-même sa cheminée ?',
        a: "Techniquement oui, mais un ramonage par un particulier n'a aucune valeur légale : seul un professionnel qualifié peut délivrer le certificat de ramonage exigé par les assurances et la réglementation. En cas de sinistre sans certificat professionnel, l'assureur peut refuser l'indemnisation.",
      },
      {
        q: 'Combien coûte un ramonage en 2025 ?',
        a: "Un ramonage standard de cheminée à foyer ouvert coûte 50 à 90 €. Pour un poêle à bois ou à granulés, comptez 60 à 100 €. Le ramonage d'un conduit de chaudière gaz ou fioul revient à 50 à 80 €. Le débistrage, plus technique, coûte 200 à 500 € selon l'état du conduit.",
      },
    ],
    emergencyInfo:
      "Intervention d'urgence en cas de feu de cheminée ou de suspicion d'intoxication au monoxyde de carbone (CO). Appelez les pompiers (18) en premier. Un ramoneur-fumiste peut intervenir sous 2 à 4 heures pour sécuriser le conduit après l'intervention des secours. Majorations : +80 à 100 % la nuit et le week-end.",
    certifications: [
      'Qualibat (qualification 5141 ramonage et entretien de conduits)',
      'Titre Professionnel Ramoneur-fumiste (inscrit au RNCP)',
      "Compagnons du Devoir (formation d'excellence)",
      'Qualification Qualibat 5142 (ramonage — conduits de fumée)',
      'Label Ramoneur certifié ONQR (Organisation Nationale de la Qualification du Ramonage)',
      'Certification QUALIRAMONAGE (référentiel qualité métier)',
      'Assurance responsabilité civile professionnelle (obligatoire)',
      'Habilitation travail en hauteur (interventions sur toiture et souche de cheminée)',
    ],
    averageResponseTime: 'Intervention sous 1 semaine en basse saison, 2 à 3 semaines en automne',
  },

  diagnostiqueur: {
    slug: 'diagnostiqueur',
    name: 'Diagnostiqueur',
    priceRange: { min: 100, max: 600, unit: '€' },
    commonTasks: [
      'DPE (Diagnostic de Performance Énergétique) : 100 à 250 €',
      'Pack diagnostics vente (DPE + amiante + plomb + électricité + gaz + termites) : 300 à 600 €',
      'Diagnostic amiante : 80 à 150 €',
      'Diagnostic plomb (CREP) : 100 à 200 €',
      'Diagnostic électricité ou gaz : 100 à 150 €',
      'Diagnostic électricité (installation de plus de 15 ans) : 80 à 150 €',
      'Diagnostic gaz (installation de plus de 15 ans) : 80 à 130 €',
      'Diagnostic termites (zones à arrêté préfectoral) : 80 à 150 €',
      'Mesurage loi Carrez (superficie privative) : 70 à 120 €',
      'Diagnostic assainissement non collectif : 100 à 200 €',
    ],
    tips: [
      'Le DPE est obligatoire pour toute vente ou location depuis 2006. Depuis 2021, il est opposable juridiquement : un mauvais DPE peut entraîner une action en justice.',
      'Regroupez tous les diagnostics chez un même professionnel pour obtenir un tarif pack (30 à 40 % de réduction).',
      "Vérifiez que votre diagnostiqueur est certifié par un organisme accrédité COFRAC et qu'il dispose d'une assurance responsabilité civile professionnelle à jour — c'est une obligation légale.",
      "Anticipez les diagnostics avant la mise en vente : un DPE défavorable (F ou G) doit être affiché sur l'annonce immobilière et peut réduire le prix de vente de 5 à 15 %.",
      "Pour une location, le DPE et l'ERP sont obligatoires lors de chaque nouveau bail. Le diagnostic plomb (CREP) est aussi requis pour les logements construits avant 1949.",
      'Le DPE influence directement la valeur de votre bien : les logements classés F ou G subissent un malus de 5 à 15 % sur le prix de vente par rapport à un bien équivalent classé D ou E.',
      'Vérifiez la certification COFRAC de votre diagnostiqueur sur le site du ministère de la Transition écologique — un diagnostic réalisé par un professionnel non certifié est juridiquement nul.',
      "Pour la vente d'un T3, prévoyez un budget de 300 à 600 € pour le pack diagnostic complet ; pour une maison individuelle, comptez 500 à 900 € selon la surface et l'ancienneté du bien.",
    ],
    faq: [
      {
        q: 'Quels diagnostics sont obligatoires pour vendre ?',
        a: 'DPE, diagnostic amiante (si permis avant 1997), plomb (si avant 1949), électricité et gaz (si installations de plus de 15 ans), termites (dans les zones à risque), ERP (état des risques et pollutions), et mesurage loi Carrez. Le DPE a une durée de validité de 10 ans, les autres varient de 6 mois (termites) à illimité (amiante si négatif).',
      },
      {
        q: 'Combien de temps les diagnostics immobiliers sont-ils valables ?',
        a: 'La validité varie selon le diagnostic : DPE : 10 ans. Amiante : illimité si négatif (à refaire si positif après travaux). Plomb (CREP) : illimité si négatif, 1 an si positif (pour la vente), 6 ans pour la location. Électricité et gaz : 3 ans pour la vente, 6 ans pour la location. Termites : 6 mois. ERP : 6 mois. Loi Carrez : illimité sauf travaux.',
      },
      {
        q: 'Le DPE est-il fiable ?',
        a: "Depuis la réforme de 2021, le DPE est calculé selon une méthode unifiée (3CL-2021) qui prend en compte l'enveloppe du bâtiment, le système de chauffage et la ventilation. Il est désormais opposable juridiquement. Toutefois, des écarts de résultats entre diagnostiqueurs persistent. N'hésitez pas à demander un second avis si le résultat vous semble incohérent.",
      },
      {
        q: 'Peut-on contester un diagnostic immobilier ?',
        a: "Oui, si vous estimez qu'un diagnostic est erroné, vous pouvez faire appel à un autre diagnostiqueur pour un contre-diagnostic. En cas de préjudice avéré (DPE surévalué ayant conduit à un achat plus cher), une action en justice contre le diagnostiqueur est possible via son assurance RC professionnelle. Le vendeur peut aussi être mis en cause pour vice caché.",
      },
      {
        q: 'Faut-il être présent lors des diagnostics ?',
        a: "Ce n'est pas obligatoire mais fortement recommandé, surtout pour le DPE. Votre présence permet de fournir des informations utiles au diagnostiqueur (factures d'énergie, travaux récents d'isolation, type de chauffage) qui amélioreront la précision du diagnostic. Le diagnostiqueur doit avoir accès à toutes les pièces, y compris les combles, la cave et le garage.",
      },
      {
        q: 'Combien coûte un pack diagnostic complet ?',
        a: 'Pour un appartement T3, un pack complet (DPE + amiante + plomb + électricité + gaz + Carrez + ERP) coûte entre 300 et 600 €. Pour une maison individuelle, comptez 500 à 900 € en raison de la surface plus importante et du diagnostic assainissement éventuellement requis. Regrouper tous les diagnostics chez un seul professionnel permet une réduction de 30 à 40 % par rapport à des diagnostics commandés séparément.',
      },
      {
        q: 'Quelle est la durée de validité du DPE ?',
        a: "Le DPE est valable 10 ans. Attention aux anciens DPE : ceux réalisés entre le 1er janvier 2018 et le 30 juin 2021 ne sont valables que jusqu'au 31 décembre 2024. Ceux réalisés entre le 1er janvier 2013 et le 31 décembre 2017 sont déjà caducs depuis le 1er janvier 2023. En cas de travaux de rénovation énergétique significatifs, il est recommandé de refaire le DPE pour valoriser votre bien.",
      },
      {
        q: 'Quels diagnostics sont obligatoires pour une location ?',
        a: "Pour toute mise en location, le bailleur doit fournir un DPE en cours de validité, un ERP (état des risques et pollutions) de moins de 6 mois, et un diagnostic plomb (CREP) si le logement a été construit avant le 1er janvier 1949. Depuis 2023, les logements classés G+ au DPE (consommation supérieure à 450 kWh/m²/an) sont interdits à la location. Cette interdiction s'étendra à tous les G en 2025, aux F en 2028 et aux E en 2034.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour les diagnostics immobiliers. Les diagnostics (DPE, amiante, plomb, électricité, gaz) sont des prestations planifiées. Intervention possible sous 48h à 1 semaine selon la disponibilité.",
    certifications: [
      'Certification par organisme accrédité COFRAC (obligatoire — Bureau Veritas, Dekra, Qualixpert, I.Cert, etc.)',
      'Certifications par domaine : DPE, amiante, plomb, électricité, gaz, termites (chacune est spécifique)',
      'Assurance RC professionnelle (obligatoire)',
      'Formation continue obligatoire (recyclage tous les 7 ans)',
      'Certification avec mention DPE (obligatoire pour les bâtiments publics et ERP)',
      'Certification amiante avec mention (repérage avant travaux et démolition)',
      'Certification amiante sans mention (repérage avant vente uniquement)',
      'Certification plomb (habilitation spécifique pour le CREP)',
    ],
    averageResponseTime: 'Intervention sous 48h à 1 semaine',
  },

  ebeniste: {
    slug: 'ebeniste',
    name: 'Ébéniste',
    priceRange: {
      min: 50,
      max: 90,
      unit: '€/h',
    },
    commonTasks: [
      "Fabrication d'un meuble sur mesure (bibliothèque, buffet) : 1 500 à 6 000 €",
      "Restauration d'un meuble ancien : 300 à 2 500 € selon l'état et la complexité",
      "Fabrication d'un escalier en bois massif : 3 000 à 12 000 €",
      "Pose d'un plan de travail en bois massif : 400 à 1 200 € (fourniture + pose)",
      "Création d'un dressing sur mesure : 2 000 à 8 000 €",
      "Fabrication d'une table en bois massif : 800 à 4 000 €",
      'Placage et marqueterie (restauration) : 200 à 1 500 € selon la surface',
      "Fabrication d'un meuble de salle de bain en bois : 1 000 à 3 500 €",
    ],
    tips: [
      "Choisissez un ébéniste qui vous montre son atelier et des exemples de réalisations précédentes. Le savoir-faire artisanal se juge sur les finitions : assemblages, qualité du ponçage et régularité du vernis ou de l'huile.",
      'Définissez précisément vos besoins (dimensions, essence de bois, finition) avant de demander un devis. Un cahier des charges clair évite les malentendus et les surcoûts.',
      'Privilégiez les bois certifiés PEFC ou FSC pour garantir une provenance durable. Le chêne, le noyer et le merisier sont les essences les plus demandées en ébénisterie française.',
      "Demandez un devis détaillé mentionnant l'essence de bois, le type de finition (vernis, huile, cire, laque), les dimensions exactes et le délai de fabrication.",
      "Un meuble sur mesure coûte plus cher qu'un meuble industriel, mais sa durée de vie est de 50 à 100 ans contre 5 à 15 ans pour du mobilier en panneaux de particules.",
      "Pour la restauration d'un meuble ancien de valeur, faites appel à un ébéniste spécialisé en restauration qui respectera les techniques traditionnelles (collage à la colle de peau, vernis au tampon).",
      'Prévoyez un délai de fabrication de 4 à 12 semaines pour un meuble sur mesure. Un ébéniste sérieux ne bâcle pas son travail : chaque pièce est unique.',
      "Vérifiez que l'ébéniste possède une assurance responsabilité civile professionnelle et, pour les travaux intégrés au bâti (escaliers, bibliothèques encastrées), une garantie décennale.",
    ],
    faq: [
      {
        q: 'Quelle est la différence entre un ébéniste et un menuisier ?',
        a: "Le menuisier travaille principalement sur les éléments de structure et d'agencement du bâtiment (portes, fenêtres, parquets, placards). L'ébéniste est spécialisé dans la fabrication et la restauration de meubles, avec un travail de précision sur les assemblages, les placages et les finitions. L'ébéniste maîtrise des techniques comme la marqueterie, le cintrage du bois et le vernis au tampon.",
      },
      {
        q: 'Combien coûte un meuble sur mesure par rapport à du mobilier industriel ?',
        a: "Un meuble sur mesure coûte en moyenne 2 à 5 fois plus cher qu'un équivalent industriel. Par exemple, une bibliothèque en chêne massif sur mesure revient à 2 000 à 5 000 €, contre 300 à 800 € pour un modèle en kit. La différence se justifie par la qualité des matériaux (bois massif vs panneaux), la durabilité (50 à 100 ans vs 5 à 15 ans) et l'adaptation parfaite à votre espace.",
      },
      {
        q: 'Quelles essences de bois choisir pour un meuble ?',
        a: "Le choix dépend de l'usage et du budget. Le chêne (60 à 120 €/m² en plateau) est le plus polyvalent : solide, durable et facile à travailler. Le noyer (100 à 200 €/m²) offre un grain élégant et une teinte chaude. Le merisier (80 à 150 €/m²) est prisé pour les meubles de style. Pour les budgets serrés, le hêtre (40 à 80 €/m²) est un excellent compromis.",
      },
      {
        q: 'Peut-on restaurer un meuble ancien abîmé ?',
        a: "Oui, dans la grande majorité des cas. Un ébéniste restaurateur peut réparer des pieds cassés, remplacer des placages décollés, recoller des assemblages, combler des manques de bois et refaire entièrement la finition. Seuls les meubles dont la structure est irrémédiablement vermoulue (piqûres de vers sur plus de 50 % de l'épaisseur) sont parfois irrécupérables. Un traitement insecticide préalable est souvent nécessaire (50 à 150 €).",
      },
      {
        q: "Quel délai prévoir pour la fabrication d'un meuble sur mesure ?",
        a: "Comptez en moyenne 4 à 12 semaines entre la validation du devis et la livraison. Ce délai inclut l'approvisionnement en bois (2 à 4 semaines si l'essence n'est pas en stock), la fabrication proprement dite (2 à 6 semaines) et les finitions (ponçage, vernis ou huile en plusieurs couches). Les projets complexes (marqueterie, cintrage) peuvent nécessiter jusqu'à 16 semaines.",
      },
      {
        q: 'Comment entretenir un meuble en bois massif ?',
        a: "Pour un meuble huilé, appliquez une couche d'huile (lin, tung ou huile spéciale bois) tous les 6 à 12 mois. Pour un meuble vernis, un simple dépoussiérage et un nettoyage à l'eau légèrement savonneuse suffisent. Évitez les produits à base de silicone qui encrassent le bois. Ne placez jamais un meuble en bois massif près d'une source de chaleur directe (radiateur, cheminée) : le bois se fendrait.",
      },
      {
        q: 'Un ébéniste peut-il reproduire un meuble ancien ou de style ?',
        a: "Oui, c'est l'une des spécialités de l'ébénisterie. Un ébéniste peut reproduire fidèlement un meuble Louis XV, Art Déco ou contemporain à partir de photos, de plans ou d'un modèle existant. Le coût dépend de la complexité : comptez 1 500 à 3 000 € pour une commode de style simple et 5 000 à 15 000 € pour une pièce complexe avec marqueterie.",
      },
    ],
    emergencyInfo:
      "Pas de service d'urgence pour l'ébénisterie. La fabrication et la restauration de meubles sont des projets planifiés nécessitant un travail en atelier. Prenez rendez-vous pour un devis gratuit sous 1 semaine.",
    certifications: [
      'CAP Ébéniste ou BMA Ébéniste (formation initiale obligatoire)',
      "Brevet des Métiers d'Art (BMA) Ébénisterie",
      'Titre de Meilleur Ouvrier de France (MOF) en ébénisterie',
      'Label Entreprise du Patrimoine Vivant (EPV)',
      'Qualibat (qualification 4322 agencement intérieur bois)',
      'Certification PEFC / FSC (bois issus de forêts gérées durablement)',
      'Assurance responsabilité civile professionnelle',
      'Garantie décennale (pour les ouvrages intégrés au bâti)',
    ],
    averageResponseTime:
      'Devis sous 1 semaine (visite et prise de mesures), fabrication 4 à 12 semaines',
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

/**
 * Slugifie un nom de tâche pour l'URL /tarifs/[service]/[ville]/[travail].
 */
export function slugifyTask(taskName: string): string {
  return taskName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Parse une tâche depuis commonTasks (format "nom : prix").
 */
export function parseTask(task: string): { name: string; slug: string; priceText: string } {
  const colonIdx = task.indexOf(':')
  if (colonIdx === -1) return { name: task.trim(), slug: slugifyTask(task.trim()), priceText: '' }
  const name = task.substring(0, colonIdx).trim()
  const priceText = task.substring(colonIdx + 1).trim()
  return { name, slug: slugifyTask(name), priceText }
}

/** Retourne toutes les taches parsees pour un service */
export function getTasksForService(
  serviceSlug: string
): { name: string; slug: string; priceText: string }[] {
  const trade = tradeContent[serviceSlug]
  if (!trade) return []
  return trade.commonTasks.map(parseTask)
}
