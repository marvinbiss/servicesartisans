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
      {
        q: 'Que faire en cas de fuite d\'eau la nuit ?',
        a: 'Coupez immédiatement l\'arrivée d\'eau au compteur général, généralement situé dans la cave ou à l\'extérieur du logement. Placez des récipients sous la fuite et épongez l\'eau stagnante pour limiter les dégâts. Contactez ensuite un plombier d\'urgence disponible 24h/24 ; les majorations nocturnes varient de 50 à 100 % du tarif de base.',
      },
      {
        q: 'Comment déboucher un évier naturellement ?',
        a: 'Versez un mélange de bicarbonate de soude (6 cuillères à soupe) et de vinaigre blanc (25 cl) dans la canalisation, laissez agir 30 minutes puis rincez à l\'eau bouillante. Si le bouchon persiste, utilisez une ventouse ou un furet manuel. Si ces méthodes échouent, faites appel à un plombier qui pourra utiliser un furet électrique ou un hydrocurage.',
      },
      {
        q: 'Quel est le coût d\'un remplacement de chauffe-eau ?',
        a: 'Le remplacement d\'un chauffe-eau électrique de 200 litres coûte entre 800 et 1 500 \u20AC (fourniture + pose), tandis qu\'un chauffe-eau thermodynamique revient à 2 500 à 4 500 \u20AC. Le prix dépend du type (électrique, gaz, thermodynamique, solaire), de la capacité et de l\'accessibilité de l\'installation. Un chauffe-eau thermodynamique permet d\'économiser jusqu\'à 70 % sur la facture d\'eau chaude.',
      },
      {
        q: 'Quelle est la durée de vie d\'une installation de plomberie ?',
        a: 'Les canalisations en cuivre durent 50 à 80 ans, celles en PER (polyéthylène réticulé) environ 50 ans, tandis que les tuyaux en plomb (interdits depuis 1995) doivent être remplacés. Un chauffe-eau a une durée de vie de 10 à 15 ans et les robinetteries de 15 à 20 ans. Un entretien régulier (détartrage, vérification des joints) prolonge significativement la durée de vie de l\'installation.',
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
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Comment savoir si mon installation électrique est aux normes ?',
        a: 'Faites réaliser un diagnostic électrique par un électricien certifié ou un diagnostiqueur agréé. Ce contrôle vérifie la conformité à la norme NF C 15-100 : présence d\'un disjoncteur différentiel 30 mA, mise à la terre, protection des circuits et état des prises. Ce diagnostic est obligatoire pour la vente d\'un logement de plus de 15 ans et coûte entre 100 et 200 \u20AC.',
      },
      {
        q: 'Quand faut-il refaire le tableau électrique ?',
        a: 'Le remplacement du tableau est nécessaire si votre installation a plus de 25 ans, si le tableau comporte encore des fusibles à broche, s\'il n\'y a pas de disjoncteur différentiel 30 mA ou si vous ajoutez des équipements énergivores (borne de recharge, pompe à chaleur). Le coût d\'un tableau neuf aux normes est de 800 à 2 500 \u20AC selon le nombre de circuits.',
      },
      {
        q: 'Les travaux électriques nécessitent-ils une mise aux normes complète ?',
        a: 'Non, la mise aux normes complète n\'est obligatoire que pour une construction neuve ou une rénovation totale. Pour des travaux partiels, seuls les circuits concernés doivent respecter la norme NF C 15-100 en vigueur. Toutefois, l\'électricien doit s\'assurer que les travaux ne créent pas de danger sur le reste de l\'installation.',
      },
      {
        q: 'Combien de prises électriques faut-il par pièce ?',
        a: 'La norme NF C 15-100 impose un minimum de 5 prises dans un séjour de moins de 28 m² (7 au-delà), 3 prises dans une chambre, 6 prises dans une cuisine (dont 4 au-dessus du plan de travail) et 1 prise dans les toilettes. Chaque prise doit être alimentée par un circuit protégé par un disjoncteur adapté (16 A ou 20 A).',
      },
      {
        q: 'Peut-on faire soi-même des travaux électriques dans son logement ?',
        a: 'Légalement, un particulier peut réaliser des travaux électriques dans son propre logement, mais il engage sa responsabilité en cas d\'accident ou d\'incendie. L\'attestation Consuel sera exigée pour le raccordement au réseau. Pour des raisons de sécurité et d\'assurance, il est vivement recommandé de confier les travaux à un électricien qualifié, surtout pour le tableau et les circuits principaux.',
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
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Mon assurance couvre-t-elle un changement de serrure après un cambriolage ?',
        a: 'Oui, la garantie vol de votre assurance habitation prend généralement en charge le remplacement de la serrure et la réparation de la porte après un cambriolage. Vous devez déposer plainte au commissariat, déclarer le sinistre sous 2 jours ouvrés et conserver la facture du serrurier. Le remboursement se fait sur présentation de ces justificatifs, souvent sans franchise.',
      },
      {
        q: 'Combien de temps faut-il pour ouvrir une porte claquée ?',
        a: 'Un serrurier expérimenté ouvre une porte claquée (non verrouillée à clé) en 5 à 15 minutes sans abîmer la serrure, grâce à des outils spécialisés (crochet, by-pass, radio). Pour une porte verrouillée ou blindée, l\'intervention peut prendre 30 minutes à 1 heure. Si le cylindre doit être percé, le remplacement de la serrure sera nécessaire.',
      },
      {
        q: 'Quelle est la différence entre une serrure 3 points et 5 points ?',
        a: 'Une serrure 3 points verrouille la porte en trois endroits (haut, milieu, bas) et offre un niveau de sécurité correct pour un appartement. La serrure 5 points ajoute deux points latéraux pour une résistance accrue à l\'effraction, recommandée pour les maisons et les rez-de-chaussée. Les assureurs exigent souvent un minimum de 3 points avec certification A2P pour les logements.',
      },
      {
        q: 'Peut-on changer une serrure de porte d\'entrée en copropriété ?',
        a: 'Vous pouvez librement changer le cylindre (barillet) de votre porte d\'entrée privative sans autorisation. En revanche, modifier la serrure de la porte d\'entrée de l\'immeuble nécessite l\'accord du syndic de copropriété. Si vous êtes locataire, vous pouvez changer la serrure à vos frais mais devez remettre l\'ancienne en quittant le logement.',
      },
    ],
    emergencyInfo:
      'En cas de porte claquée ou de serrure cassée, un serrurier d\'urgence intervient généralement sous 30 minutes à 1 heure en zone urbaine. Attention aux majorations : +50 % en soirée (après 19h), +75 à 100 % la nuit (après 22h), le dimanche et les jours fériés. Exigez toujours un devis écrit avant le début de l\'intervention.',
    certifications: [
      'A2P Service (certification des serruriers par le CNPP)',
      'Qualibat',
      'Certification Qualisr (Qualification Serrurerie)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'L\'entretien annuel de la chaudière est-il vraiment obligatoire ?',
        a: 'Oui, l\'entretien annuel est obligatoire depuis le décret du 9 juin 2009 pour toutes les chaudières (gaz, fioul, bois) d\'une puissance de 4 à 400 kW. Le chauffagiste vérifie la combustion, nettoie les composants et mesure les émissions de CO. Il remet une attestation d\'entretien, exigée par l\'assurance en cas de sinistre. Le coût est de 100 à 200 \u20AC.',
      },
      {
        q: 'Comment purger correctement ses radiateurs ?',
        a: 'La purge des radiateurs doit se faire chaque année avant la saison de chauffe. Ouvrez la vis de purge en haut du radiateur avec une clé spéciale, laissez l\'air s\'échapper jusqu\'à ce que de l\'eau coule, puis refermez. Commencez par le radiateur le plus proche de la chaudière. Après la purge, vérifiez la pression du circuit (1 à 1,5 bar) et ajoutez de l\'eau si nécessaire.',
      },
      {
        q: 'Quel est le coût d\'un plancher chauffant ?',
        a: 'L\'installation d\'un plancher chauffant hydraulique coûte entre 50 et 100 \u20AC/m² (pose uniquement) et entre 70 et 120 \u20AC/m² pour un système électrique. Pour une maison de 100 m², le budget total (fourniture + pose) est de 8 000 à 15 000 \u20AC. Le plancher chauffant offre un confort supérieur aux radiateurs et permet des économies d\'énergie de 10 à 15 %.',
      },
      {
        q: 'Faut-il un contrat d\'entretien pour sa chaudière ?',
        a: 'Le contrat d\'entretien n\'est pas obligatoire mais vivement recommandé. Il coûte entre 120 et 250 \u20AC par an et inclut la visite annuelle obligatoire, le dépannage prioritaire (souvent sous 24h) et parfois les pièces d\'usure. Sans contrat, une intervention d\'urgence coûte 150 à 350 \u20AC avec des délais plus longs, surtout en plein hiver.',
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
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Comment bien préparer les murs avant de peindre ?',
        a: 'La préparation comprend le lessivage à la lessive Saint-Marc pour dégraisser, le rebouchage des trous et fissures à l\'enduit, le ponçage au papier de verre grain 120, et l\'application d\'une sous-couche d\'accrochage. Sur un mur neuf en plâtre, une sous-couche spéciale est indispensable pour éviter que la peinture ne cloque. Cette étape représente 60 % du temps total des travaux.',
      },
      {
        q: 'Quelle peinture choisir pour une salle de bain ?',
        a: 'Optez pour une peinture acrylique spéciale pièces humides, résistante à l\'humidité et aux moisissures (classe 1 ou 2 selon la norme ISO 11998). Les marques professionnelles comme Tollens, Sikkens ou Zolpan proposent des gammes dédiées. Comptez 30 à 50 \u20AC le litre en qualité professionnelle. Évitez les peintures glycéro dans les pièces de vie en raison de leurs émanations de COV.',
      },
      {
        q: 'La peinture de façade nécessite-t-elle une autorisation ?',
        a: 'Oui, un ravalement de façade nécessite une déclaration préalable de travaux en mairie si vous modifiez l\'aspect extérieur (couleur, enduit). En zone protégée (ABF), l\'accord de l\'Architecte des Bâtiments de France est requis, ce qui peut limiter le choix des couleurs. Certaines communes imposent un ravalement tous les 10 ans (Paris, par exemple) et peuvent émettre un arrêté si la façade est dégradée.',
      },
      {
        q: 'Combien de couches de peinture faut-il appliquer ?',
        a: 'Deux couches de peinture de finition sont le minimum pour un résultat homogène et durable. Sur un support neuf ou un changement de couleur radical (clair vers foncé), une sous-couche plus deux couches de finition sont nécessaires. Chaque couche doit sécher complètement (4 à 6 heures pour une acrylique) avant l\'application de la suivante.',
      },
    ],
    certifications: [
      'Qualibat (qualification 6111 pour la peinture)',
      'RGE (si travaux d\'isolation thermique par l\'extérieur)',
      'OPPBTP (Organisation Professionnelle de Prévention du Bâtiment)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Combien coûte un dressing ou placard sur mesure ?',
        a: 'Un placard sur mesure avec portes coulissantes coûte entre 800 et 3 000 \u20AC selon les dimensions, le matériau (mélaminé, bois massif, laqué) et les aménagements intérieurs (tiroirs, penderies, étagères). Un dressing complet avec éclairage intégré peut atteindre 5 000 à 8 000 \u20AC. Le sur-mesure permet d\'exploiter chaque centimètre, notamment sous les combles ou dans les espaces atypiques.',
      },
      {
        q: 'Quelle est la durée de vie des fenêtres en PVC ?',
        a: 'Les fenêtres PVC de qualité ont une durée de vie de 25 à 35 ans sans entretien particulier, hormis un nettoyage régulier au savon doux. Les fenêtres en bois durent aussi longtemps mais nécessitent un entretien (lasure ou peinture) tous les 5 à 7 ans. Les fenêtres aluminium ont la meilleure longévité, jusqu\'à 40 ans, grâce à leur résistance à la corrosion.',
      },
      {
        q: 'Un menuisier peut-il fabriquer un escalier sur mesure ?',
        a: 'Oui, c\'est même l\'une des spécialités du menuisier d\'agencement. Un escalier sur mesure en bois coûte entre 3 000 et 10 000 \u20AC selon l\'essence (hêtre, chêne, frêne), la forme (droit, tournant, hélicoïdal) et les finitions (vitrification, peinture, garde-corps). La fabrication et la pose prennent 2 à 4 semaines. Un escalier sur mesure optimise l\'espace et s\'adapte parfaitement à la configuration du logement.',
      },
      {
        q: 'Comment entretenir ses menuiseries en bois ?',
        a: 'Les menuiseries extérieures en bois doivent être protégées par une lasure ou une peinture microporeuse tous les 5 à 7 ans. Poncez légèrement la surface, dépoussiérez et appliquez deux couches de lasure au pinceau. Pour les menuiseries intérieures (portes, placards), un nettoyage à l\'eau savonneuse suffit. Si le bois est abîmé, un menuisier peut le décaper, le traiter et le remettre en état.',
      },
      {
        q: 'Quelles aides existent pour le remplacement de fenêtres ?',
        a: 'MaPrimeRenov\' finance jusqu\'à 100 \u20AC par fenêtre (simple vers double vitrage) pour les ménages modestes. Les CEE (Certificats d\'Économies d\'Énergie) ajoutent 30 à 80 \u20AC par fenêtre. L\'éco-prêt à taux zéro permet de financer jusqu\'à 7 000 \u20AC de remplacement de fenêtres sans intérêts. Le menuisier doit être certifié RGE pour que vous puissiez bénéficier de ces aides.',
      },
    ],
    certifications: [
      'Qualibat (qualification menuiserie)',
      'RGE (pour les travaux d\'isolation par les fenêtres)',
      'Certification QB (Qualité Bois)',
      'FCBA (Institut Technologique Forêt Cellulose Bois-construction Ameublement)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Quel est le coût de la pose de carrelage au m² ?',
        a: 'La pose de carrelage au sol coûte entre 35 et 55 \u20AC/m² en format standard (30x30 à 45x45), 50 à 75 \u20AC/m² pour du grand format (60x60 et plus) et 60 à 100 \u20AC/m² pour de la mosaïque. La pose murale (faïence) revient à 40 à 65 \u20AC/m². Ces prix s\'entendent hors fourniture du carrelage. Ajoutez 15 à 30 \u20AC/m² si l\'ancien revêtement doit être déposé.',
      },
      {
        q: 'Faut-il une étanchéité sous le carrelage de salle de bain ?',
        a: 'Oui, l\'étanchéité sous carrelage (système SPEC) est indispensable dans les zones de projection d\'eau (douche, contour de baignoire) conformément au DTU 52.1. Le carreleur applique une membrane ou un produit liquide d\'étanchéité avant la pose du carrelage. Ce poste supplémentaire coûte 20 à 40 \u20AC/m² mais évite les infiltrations d\'eau et les dégâts des eaux chez le voisin du dessous.',
      },
      {
        q: 'Comment choisir entre carrelage et grès cérame ?',
        a: 'Le grès cérame est en réalité un type de carrelage, fabriqué par pressage à haute température. Il est plus dense, plus résistant et moins poreux que la faïence ou le carrelage classique en terre cuite. Le grès cérame pleine masse est le plus solide (teinté dans la masse, les éclats sont invisibles). Pour un usage courant en intérieur, le grès cérame émaillé offre le meilleur rapport qualité-prix.',
      },
      {
        q: 'Quel carrelage choisir pour une terrasse extérieure ?',
        a: 'Pour une terrasse, choisissez un carrelage antidérapant classé R11 minimum (R12 en bord de piscine), résistant au gel (norme ISO 10545-12) et de faible porosité. Le grès cérame pleine masse ou le carrelage en pierre naturelle sont les mieux adaptés. Prévoyez une pente de 1 à 2 % pour l\'évacuation de l\'eau. Le budget est de 45 à 80 \u20AC/m² pour la pose.',
      },
      {
        q: 'Combien de temps faut-il attendre avant de marcher sur un carrelage neuf ?',
        a: 'Il faut attendre 24 heures minimum après la pose avant de marcher sur le carrelage, le temps que la colle sèche. Les joints doivent être réalisés 24 à 48 heures après la pose et nécessitent à leur tour 24 heures de séchage. Au total, comptez 3 à 4 jours avant de pouvoir utiliser normalement la pièce. Évitez de poser des meubles lourds pendant au moins une semaine.',
      },
    ],
    certifications: [
      'Qualibat (qualification 6321 pour carrelage et revêtements)',
      'CSTB (Centre Scientifique et Technique du Bâtiment)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Quelle est la durée de vie d\'une toiture selon le matériau ?',
        a: 'Les tuiles en terre cuite durent 50 à 100 ans, l\'ardoise naturelle 75 à 150 ans, le zinc 50 à 80 ans et les tuiles béton 30 à 50 ans. Le shingle (bitume) a la durée de vie la plus courte : 20 à 30 ans. Ces durées supposent un entretien régulier (démoussage, remplacement des éléments cassés, vérification des solins et faîtages).',
      },
      {
        q: 'Combien coûte l\'installation d\'une fenêtre de toit (Velux) ?',
        a: 'L\'installation d\'une fenêtre de toit standard (78x98 cm) coûte entre 500 et 1 500 \u20AC pour la pose seule, auxquels s\'ajoute le prix de la fenêtre (300 à 1 200 \u20AC selon le modèle). Une fenêtre motorisée avec stores intégrés peut atteindre 2 500 \u20AC. Le couvreur doit assurer une parfaite étanchéité avec un kit de raccordement adapté à la couverture.',
      },
      {
        q: 'L\'isolation de toiture est-elle éligible aux aides de l\'État ?',
        a: 'Oui, l\'isolation de la toiture par l\'intérieur ou l\'extérieur (sarking) est éligible à MaPrimeRenov\' (jusqu\'à 25 \u20AC/m² pour les ménages modestes), aux CEE et à l\'éco-prêt à taux zéro. Le couvreur doit être certifié RGE. L\'isolation de toiture est l\'un des travaux les plus rentables : elle réduit les déperditions thermiques de 25 à 30 % et se rentabilise en 4 à 6 ans.',
      },
      {
        q: 'Comment savoir si ma charpente a besoin d\'un traitement ?',
        a: 'Inspectez les bois de charpente à la recherche de sciure au sol (signe de vrillettes ou capricornes), de trous de sortie d\'insectes, de champignons (mérule) ou de bois qui s\'effrite au contact. Un diagnostic par un professionnel est recommandé tous les 10 ans. Le traitement préventif ou curatif coûte entre 20 et 50 \u20AC/m² et protège la charpente pour 10 à 20 ans.',
      },
    ],
    certifications: [
      'Qualibat (qualification 3111 pour couverture en tuiles)',
      'RGE (pour l\'isolation de toiture)',
      'Compagnons du Devoir (formation d\'excellence)',
      'Certification Qualit\'EnR',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Combien coûte la construction d\'un garage en parpaings ?',
        a: 'La construction d\'un garage simple (environ 20 m²) en parpaings coûte entre 15 000 et 25 000 \u20AC, comprenant les fondations, les murs, la dalle, la toiture et la porte de garage. Un garage double (40 m²) revient à 25 000 à 45 000 \u20AC. Un permis de construire est nécessaire pour une surface supérieure à 20 m², une déclaration préalable en dessous.',
      },
      {
        q: 'Les fissures sur ma maison sont-elles dangereuses ?',
        a: 'Les microfissures (moins de 0,2 mm) sont généralement superficielles et sans danger. Les fissures de 0,2 à 2 mm doivent être surveillées et réparées pour éviter les infiltrations d\'eau. Les fissures supérieures à 2 mm ou en escalier le long des joints de parpaings peuvent indiquer un problème structurel et nécessitent l\'intervention urgente d\'un maçon et éventuellement d\'un bureau d\'études.',
      },
      {
        q: 'Quelle est la meilleure période pour réaliser des travaux de maçonnerie ?',
        a: 'Le printemps (avril-juin) et l\'automne (septembre-octobre) sont les périodes idéales. Le béton et le mortier nécessitent des températures entre 5 et 30 °C pour une prise optimale. En hiver, le gel peut compromettre la solidité du béton, et en plein été, la chaleur excessive accélère le séchage et provoque des fissures. Si les travaux doivent se faire en hiver, le maçon utilisera des adjuvants antigel.',
      },
      {
        q: 'Faut-il un permis de construire pour une extension de maison ?',
        a: 'En zone couverte par un PLU (Plan Local d\'Urbanisme), une déclaration préalable suffit pour une extension de moins de 40 m². Au-delà, un permis de construire est obligatoire. Hors PLU, le seuil est de 20 m². De plus, si la surface totale de la maison après extension dépasse 150 m², le recours à un architecte est obligatoire.',
      },
      {
        q: 'Combien coûte une dalle béton pour une terrasse ?',
        a: 'Une dalle béton de 15 cm d\'épaisseur pour terrasse coûte entre 60 et 120 \u20AC/m², comprenant le terrassement, le ferraillage, le coffrage et le coulage du béton. Pour une terrasse de 30 m², le budget total est de 1 800 à 3 600 \u20AC. Le béton décoratif (désactivé, ciré ou imprimé) est plus cher : 80 à 180 \u20AC/m², mais ne nécessite pas de revêtement supplémentaire.',
      },
    ],
    certifications: [
      'Qualibat (qualification 2111 pour maçonnerie)',
      'RGE (si travaux d\'isolation par l\'extérieur)',
      'NF DTU 20.1 (norme de référence pour la maçonnerie)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Combien coûte l\'élagage d\'un grand arbre ?',
        a: 'L\'élagage d\'un arbre de taille moyenne (8 à 15 m) coûte entre 200 et 600 \u20AC, et entre 500 et 1 500 \u20AC pour un grand arbre (plus de 15 m). Le prix dépend de la hauteur, de l\'accessibilité et du volume de branches à couper. L\'abattage avec dessouchage est plus cher : 400 à 2 500 \u20AC selon la taille. Faites appel à un élagueur-grimpeur certifié CS pour les arbres de grande hauteur.',
      },
      {
        q: 'Quand et comment scarifier sa pelouse ?',
        a: 'La scarification se fait idéalement au printemps (mars-avril) et éventuellement à l\'automne (septembre). Elle consiste à griffer le sol pour retirer la mousse et le feutrage qui étouffent le gazon. Après scarification, semez du gazon de regarnissage et apportez un engrais adapté. Un jardinier professionnel facture la scarification entre 0,15 et 0,30 \u20AC/m².',
      },
      {
        q: 'Faut-il une autorisation pour abattre un arbre dans son jardin ?',
        a: 'En règle générale, vous pouvez abattre un arbre sur votre propriété sans autorisation. Cependant, une autorisation est nécessaire si l\'arbre est classé (Espace Boisé Classé au PLU), s\'il est situé en zone protégée (périmètre ABF) ou si un arrêté municipal interdit l\'abattage. Renseignez-vous auprès de votre mairie avant toute intervention. En copropriété, l\'accord du syndic est requis.',
      },
      {
        q: 'Comment créer un système d\'arrosage automatique ?',
        a: 'L\'installation d\'un arrosage automatique enterré coûte entre 8 et 15 \u20AC/m² pour un jardin de 200 à 500 m², incluant les tuyaux, les asperseurs, le programmateur et la main-d\'oeuvre. Un système goutte-à-goutte pour les massifs et haies est moins cher (3 à 8 \u20AC/m²). Le jardinier-paysagiste dimensionne l\'installation en fonction de la pression d\'eau, du débit disponible et des besoins des plantations.',
      },
    ],
    certifications: [
      'CS Taille et soins des arbres (pour l\'élagage)',
      'Agrément Services à la Personne (SAP)',
      'Certiphyto (utilisation de produits phytosanitaires)',
      'CAPA Travaux Paysagers',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Peut-on remplacer un simple vitrage par du double vitrage sans changer la fenêtre ?',
        a: 'Oui, grâce au survitrage ou au remplacement du vitrage seul (si le châssis est en bon état et assez profond pour accueillir un double vitrage). Le survitrage consiste à fixer un second vitrage sur la fenêtre existante (80 à 150 \u20AC/m²). Le remplacement du vitrage dans le châssis existant coûte 150 à 300 \u20AC/m². Ces solutions sont moins performantes qu\'un remplacement complet mais beaucoup moins chères.',
      },
      {
        q: 'Combien de temps faut-il pour remplacer une vitre cassée ?',
        a: 'Le remplacement d\'une vitre standard prend 30 minutes à 1 heure sur place. Cependant, si le vitrage est sur mesure (grande dimension, forme spéciale, double vitrage à commander), le vitrier posera d\'abord un panneau provisoire et reviendra sous 24 à 72 heures avec le vitrage définitif. Pour les urgences, la mise en sécurité provisoire est réalisée en moins d\'une heure.',
      },
      {
        q: 'Qu\'est-ce que le verre sécurit (trempé) et quand est-il obligatoire ?',
        a: 'Le verre trempé est chauffé à 700 °C puis refroidi brusquement, ce qui le rend 5 fois plus résistant qu\'un verre ordinaire. En cas de casse, il se fragmente en petits morceaux non coupants. Il est obligatoire pour les portes vitrées, les parois de douche, les garde-corps en verre et les baies vitrées dont le bord inférieur est à moins de 90 cm du sol (norme NF DTU 39).',
      },
      {
        q: 'Comment améliorer l\'isolation de mes vitrages sans tout changer ?',
        a: 'Plusieurs solutions existent : le film isolant thermique à coller sur le vitrage (10 à 30 \u20AC/m², gain de 30 % sur les déperditions), le survitrage (80 à 150 \u20AC/m²), ou le remplacement des joints d\'étanchéité des fenêtres (5 à 15 \u20AC/ml). Un vitrier peut aussi remplacer le vitrage seul sans changer le châssis, si celui-ci est en bon état.',
      },
      {
        q: 'Quel type de verre choisir pour une crédence de cuisine ?',
        a: 'La crédence en verre doit être en verre trempé sécurit (obligatoire derrière une plaque de cuisson) de 6 mm d\'épaisseur minimum. Elle peut être laquée dans la couleur de votre choix, imprimée avec un motif ou en verre dépoli. Comptez 200 à 500 \u20AC/m² pose comprise. L\'avantage principal est l\'absence de joints : le nettoyage est simple et l\'hygiène optimale.',
      },
    ],
    emergencyInfo:
      'En cas de vitre cassée (effraction, tempête, accident), un vitrier d\'urgence peut intervenir sous 1 à 3 heures pour sécuriser l\'ouverture avec un panneau provisoire. Le remplacement définitif se fait généralement sous 24 à 48h. Majorations : +50 à 100 % la nuit et le week-end.',
    certifications: [
      'Qualibat (qualification miroiterie-vitrerie)',
      'Certification Cekal (performance des vitrages isolants)',
      'NF DTU 39 (norme de référence pour la vitrerie)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'À quelle fréquence faut-il entretenir sa climatisation ?',
        a: 'L\'entretien annuel est obligatoire pour les systèmes contenant plus de 2 kg de fluide frigorigène. Nettoyez les filtres intérieurs tous les 2 à 4 semaines en période d\'utilisation (un filtre encrassé réduit les performances de 20 à 30 %). L\'entretien professionnel comprend la vérification du circuit frigorifique, le nettoyage des échangeurs et le contrôle de l\'étanchéité. Le coût est de 100 à 200 \u20AC par an.',
      },
      {
        q: 'Quelle puissance de climatisation pour ma pièce ?',
        a: 'En règle générale, comptez 100 watts par m² pour une pièce standard (hauteur sous plafond de 2,50 m, isolation correcte). Ainsi, une pièce de 25 m² nécessite environ 2 500 watts (2,5 kW). Ce calcul doit être affiné par un bilan thermique tenant compte de l\'exposition, de la surface vitrée, de l\'isolation et du nombre d\'occupants. Un surdimensionnement entraîne des cycles courts et une surconsommation.',
      },
      {
        q: 'La climatisation réversible remplace-t-elle un chauffage classique ?',
        a: 'Dans le sud de la France et les régions tempérées, une pompe à chaleur air-air réversible peut constituer le chauffage principal. En revanche, dans les régions au climat continental ou montagnard (températures inférieures à -7 °C), elle doit être complétée par un chauffage d\'appoint car son rendement baisse fortement par grand froid. Un modèle Inverter maintient de bonnes performances jusqu\'à -15 °C.',
      },
      {
        q: 'Climatisation split ou gainable : quelle différence ?',
        a: 'Le split mural est l\'option la plus simple et la moins chère (1 500 à 3 000 \u20AC par unité), idéale pour climatiser une ou deux pièces. La climatisation gainable distribue l\'air via des gaines dans les faux plafonds : elle est invisible, silencieuse et climatise tout le logement de manière homogène, mais coûte plus cher (5 000 à 12 000 \u20AC) et nécessite un faux plafond ou des combles accessibles.',
      },
      {
        q: 'Quel est l\'impact de la climatisation sur la facture d\'électricité ?',
        a: 'Un split de 2,5 kW consomme environ 800 à 1 200 kWh par saison (juin à septembre), soit 150 à 250 \u20AC sur la facture d\'électricité. Les modèles Inverter de classe A+++ consomment 30 à 40 % de moins que les modèles classiques. Réglez le thermostat sur 25-26 °C plutôt que 20 °C : chaque degré en moins augmente la consommation de 7 %.',
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
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Faut-il prévoir des travaux de plomberie et d\'électricité avec la cuisine ?',
        a: 'Oui, la rénovation d\'une cuisine implique presque toujours des travaux de plomberie (déplacement de l\'évier, raccordement du lave-vaisselle) et d\'électricité (ajout de prises, circuit dédié pour le four et la plaque). Un bon cuisiniste coordonne ces corps de métier. Prévoyez 500 à 2 000 \u20AC supplémentaires pour la plomberie et 300 à 1 500 \u20AC pour l\'électricité.',
      },
      {
        q: 'Comment bien agencer une petite cuisine ?',
        a: 'Dans une cuisine de moins de 8 m², privilégiez un agencement en L ou en I pour optimiser l\'espace. Utilisez des meubles hauts jusqu\'au plafond, des tiroirs plutôt que des placards bas (accès plus facile), et un plan de travail escamotable si nécessaire. Un cuisiniste expérimenté peut rendre une cuisine de 5 m² parfaitement fonctionnelle grâce à des solutions sur mesure.',
      },
      {
        q: 'Quelle est la différence entre une cuisine en kit et une cuisine sur mesure ?',
        a: 'La cuisine en kit (grande surface de bricolage) coûte 1 000 à 4 000 \u20AC pour 5 ml mais propose des dimensions standardisées qui laissent parfois des espaces vides. La cuisine sur mesure (cuisiniste professionnel) coûte 3 000 à 15 000 \u20AC mais s\'adapte parfaitement à votre pièce, avec des matériaux de meilleure qualité et un suivi de chantier complet incluant la pose.',
      },
      {
        q: 'Les cuisinistes proposent-ils un service après-vente ?',
        a: 'Les cuisinistes sérieux offrent une garantie de 2 à 10 ans sur les meubles et un service après-vente incluant le réglage des portes et tiroirs après installation (le bois travaille les premiers mois). Vérifiez les conditions de garantie avant de signer : certaines enseignes incluent un ajustement gratuit à 6 mois. En cas de problème, le cuisiniste est votre interlocuteur unique, contrairement à une cuisine en kit.',
      },
      {
        q: 'Quels sont les délais pour une cuisine sur mesure ?',
        a: 'Comptez 2 à 3 semaines pour la conception (prise de mesures, plan 3D, choix des matériaux), 4 à 8 semaines pour la fabrication des meubles, et 3 à 7 jours pour la pose complète. Au total, prévoyez 2 à 3 mois entre la commande et l\'installation. Les cuisines haut de gamme ou importées peuvent nécessiter 3 à 4 mois de fabrication.',
      },
    ],
    certifications: [
      'Qualibat',
      'Label Cuisine Qualité (AFNOR)',
      'Garantie Meubles de France',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Qu\'est-ce que le ragréage et quand est-il nécessaire ?',
        a: 'Le ragréage est une chape fine (3 à 10 mm) coulée sur le sol existant pour le lisser et le mettre à niveau avant la pose d\'un revêtement. Il est nécessaire quand le sol présente des irrégularités supérieures à 2 mm sous la règle de 2 m. Le coût est de 15 à 30 \u20AC/m². Le solier utilise un ragréage autolissant qui se met à niveau seul et sèche en 4 à 24 heures.',
      },
      {
        q: 'Le parquet est-il compatible avec le chauffage au sol ?',
        a: 'Oui, mais uniquement certains types : le parquet contrecollé (épaisseur totale de 12 à 15 mm) et le stratifié sont compatibles, en pose flottante. Le parquet massif est déconseillé car il se dilate trop. La résistance thermique totale (parquet + sous-couche) ne doit pas dépasser 0,15 m².K/W. Un solier expérimenté saura vous orienter vers le bon produit et la bonne épaisseur.',
      },
      {
        q: 'Combien coûte la pose de parquet dans un appartement ?',
        a: 'Pour un appartement de 60 m², la pose de parquet flottant coûte entre 1 200 et 2 100 \u20AC (pose seule, 20 à 35 \u20AC/m²), le parquet contrecollé collé entre 2 100 et 3 600 \u20AC (35 à 60 \u20AC/m²), et le parquet massif entre 3 000 et 4 800 \u20AC (50 à 80 \u20AC/m²). Ajoutez le ragréage si nécessaire (15 à 30 \u20AC/m²) et la sous-couche isolante (3 à 8 \u20AC/m²).',
      },
      {
        q: 'Pose collée ou pose flottante : quelle différence ?',
        a: 'La pose flottante (les lames s\'emboîtent sans fixation au sol) est plus rapide, moins chère (20 à 35 \u20AC/m²) et permet de démonter le parquet. La pose collée (les lames sont collées directement au sol) offre un meilleur confort acoustique, une meilleure stabilité et est obligatoire pour le parquet massif et le chauffage au sol. Elle coûte 35 à 60 \u20AC/m² et nécessite un sol parfaitement préparé.',
      },
      {
        q: 'Quelle sous-couche choisir sous un parquet flottant ?',
        a: 'La sous-couche en mousse polyéthylène (2 à 4 \u20AC/m²) est l\'option économique de base. La sous-couche en liège (5 à 10 \u20AC/m²) offre la meilleure isolation phonique et thermique. La sous-couche en fibre de bois (4 à 8 \u20AC/m²) est le choix écologique. Pour un sol sur vide sanitaire ou en rez-de-chaussée, ajoutez un pare-vapeur pour protéger le parquet de l\'humidité.',
      },
    ],
    certifications: [
      'Qualibat (qualification 6411 pour revêtements de sol souples)',
      'Qualibat (qualification 6421 pour parquets)',
      'Certification UPEC (Union Professionnelle de l\'Expertise en Construction)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
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
      {
        q: 'Quelle est la différence entre un nettoyage classique et un nettoyage de fin de chantier ?',
        a: 'Le nettoyage de fin de chantier est bien plus intensif qu\'un ménage classique. Il comprend le décapage des sols (résidus de colle, ciment, peinture), le lessivage des murs et plafonds, le nettoyage des menuiseries et vitrages, et la désinfection complète des sanitaires. Le tarif est 2 à 3 fois plus élevé qu\'un ménage standard car il nécessite des produits et des équipements professionnels spécifiques.',
      },
      {
        q: 'Combien coûte le nettoyage des parties communes d\'un immeuble ?',
        a: 'Le nettoyage hebdomadaire des parties communes (hall, escalier, paliers) d\'un petit immeuble de 10 à 20 lots coûte entre 200 et 500 \u20AC par mois. Ce tarif inclut le balayage, le lavage des sols, le nettoyage des vitres d\'entrée et la sortie des poubelles. Un contrat annuel est plus économique que des interventions ponctuelles et permet de répartir les charges entre copropriétaires.',
      },
      {
        q: 'Le nettoyage après un dégât des eaux est-il couvert par l\'assurance ?',
        a: 'Oui, la plupart des contrats d\'assurance habitation couvrent les frais de remise en état après un dégât des eaux, y compris le nettoyage et l\'assèchement. Déclarez le sinistre sous 5 jours ouvrés, prenez des photos des dégâts et conservez toutes les factures. L\'expert de l\'assurance validera la prise en charge. Certains contrats incluent un service d\'assistance avec envoi direct d\'une entreprise de nettoyage.',
      },
      {
        q: 'Peut-on nettoyer une façade soi-même ou faut-il un professionnel ?',
        a: 'Le nettoyage d\'une façade de plain-pied peut se faire soi-même avec un nettoyeur haute pression (attention à ne pas dépasser 100 bars pour ne pas abîmer l\'enduit). Au-delà du premier étage, faites appel à un professionnel équipé (nacelle, échafaudage) pour des raisons de sécurité. Le nettoyage professionnel de façade coûte 10 à 25 \u20AC/m² et peut inclure un traitement hydrofuge de protection.',
      },
      {
        q: 'Quels produits sont utilisés pour un nettoyage professionnel écologique ?',
        a: 'Les entreprises labellisées Écolabel Européen utilisent des produits biodégradables à base de tensioactifs végétaux, sans phosphates ni solvants chlorés. Les techniques de nettoyage vapeur (150 °C) permettent de désinfecter sans produit chimique. Le microfibre professionnelle réduit la consommation d\'eau de 90 %. Ces solutions écologiques sont particulièrement adaptées aux crèches, écoles et logements avec enfants en bas âge.',
      },
    ],
    certifications: [
      'Qualipropre (certification du secteur de la propreté)',
      'Agrément Services à la Personne (SAP) pour le ménage à domicile',
      'ISO 14001 (management environnemental)',
      'Écolabel Européen (utilisation de produits écologiques)',
    ],
    averageResponseTime: 'Intervention rapide, selon disponibilité',
  },

  // ════════════════════════════════════════════════════════════════════════
  // NOUVEAUX MÉTIERS (35 services additionnels)
  // ════════════════════════════════════════════════════════════════════════

  terrassier: {
    slug: 'terrassier',
    name: 'Terrassier',
    priceRange: { min: 30, max: 60, unit: '\u20AC/m³' },
    commonTasks: [
      'Terrassement pour fondations : 30 à 60 \u20AC/m³',
      'Décaissement de terrain : 5 à 15 \u20AC/m²',
      'Viabilisation de parcelle (VRD) : 5 000 à 15 000 \u20AC',
      'Assainissement individuel (fosse septique) : 4 000 à 12 000 \u20AC',
      'Création de tranchées pour réseaux : 15 à 40 \u20AC/ml',
    ],
    tips: [
      'Avant tout terrassement, faites réaliser une étude de sol (G2) pour connaître la nature du terrain et adapter les travaux.',
      'Vérifiez que le terrassier dispose d\'une assurance décennale et d\'une RC professionnelle.',
      'Demandez les autorisations de voirie si les engins doivent circuler sur la voie publique.',
    ],
    faq: [
      { q: 'Combien coûte un terrassement de maison ?', a: 'Le terrassement pour une maison individuelle de 100 m² au sol coûte entre 3 000 et 10 000 \u20AC selon la nature du terrain, la profondeur des fondations et l\'accessibilité du chantier.' },
      { q: 'Faut-il un permis pour terrassement ?', a: 'Pas de permis spécifique, mais une déclaration préalable de travaux est nécessaire si le terrassement modifie le relief naturel du terrain de plus de 2 m de hauteur et 100 m² de surface.' },
    ],
    certifications: ['Qualibat (qualification terrassement)', 'Certificat de capacité d\'engins de chantier (CACES)'],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 3 semaines',
  },

  charpentier: {
    slug: 'charpentier',
    name: 'Charpentier',
    priceRange: { min: 50, max: 120, unit: '\u20AC/m²' },
    commonTasks: [
      'Charpente traditionnelle bois : 70 à 150 \u20AC/m² de toiture',
      'Charpente fermettes industrielles : 50 à 80 \u20AC/m²',
      'Réparation de charpente (remplacement de pièces) : 100 à 250 \u20AC/ml',
      'Traitement insecticide/fongicide : 15 à 30 \u20AC/m²',
      'Surélévation en ossature bois : 1 200 à 2 000 \u20AC/m²',
    ],
    tips: [
      'Un traitement préventif de la charpente tous les 10 ans prolonge sa durée de vie de plusieurs décennies.',
      'Pour une extension en bois, vérifiez que le charpentier est certifié ACQPA ou titulaire d\'un Qualibat charpente bois.',
      'Exigez un diagnostic parasitaire (termites, capricornes) avant toute rénovation de charpente ancienne.',
    ],
    faq: [
      { q: 'Quelle est la durée de vie d\'une charpente bois ?', a: 'Une charpente bois bien entretenue dure 100 ans et plus. Les charpentes en chêne des bâtiments anciens atteignent souvent 200 à 300 ans. Le principal ennemi est l\'humidité, qui favorise les champignons (mérule) et les insectes xylophages.' },
      { q: 'Charpente traditionnelle ou fermettes ?', a: 'La charpente traditionnelle permet d\'aménager les combles et offre un cachet architectural. Les fermettes sont 30 à 40 % moins chères mais rendent les combles inaménageables (sauf conversion coûteuse). Pour une maison avec projet de combles aménagés, choisissez le traditionnel.' },
    ],
    certifications: ['Qualibat charpente bois', 'ACQPA (traitement du bois)', 'Compagnon du Devoir (excellence)'],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 4 semaines',
  },

  zingueur: {
    slug: 'zingueur',
    name: 'Zingueur',
    priceRange: { min: 40, max: 80, unit: '\u20AC/ml' },
    commonTasks: [
      'Pose de gouttières en zinc : 40 à 80 \u20AC/ml',
      'Remplacement de chéneaux : 60 à 120 \u20AC/ml',
      'Pose de descentes d\'eau : 30 à 60 \u20AC/ml',
      'Habillage de rives et bandeaux : 50 à 100 \u20AC/ml',
      'Réparation de noues et faîtages : 80 à 200 \u20AC/ml',
    ],
    tips: [
      'Le zinc a une durée de vie de 50 à 100 ans selon la qualité et l\'exposition. Préférez le zinc prépatiné pour une meilleure résistance à la corrosion.',
      'Faites vérifier l\'état de vos gouttières et descentes après chaque automne pour éviter les engorgements.',
    ],
    faq: [
      { q: 'Quel est le prix de remplacement de gouttières ?', a: 'Comptez 40 à 80 \u20AC/ml pour des gouttières en zinc, pose comprise. Pour une maison de 40 ml de gouttières, le budget total se situe entre 2 000 et 4 000 \u20AC. Le PVC est moins cher (20 à 40 \u20AC/ml) mais dure 2 à 3 fois moins longtemps.' },
    ],
    certifications: ['Qualibat couverture-zinguerie', 'Certification zinc NF'],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 2 semaines',
  },

  etancheiste: {
    slug: 'etancheiste',
    name: 'Étanchéiste',
    priceRange: { min: 40, max: 100, unit: '\u20AC/m²' },
    commonTasks: [
      'Étanchéité toiture-terrasse (membrane bitume) : 40 à 80 \u20AC/m²',
      'Étanchéité PVC/EPDM : 50 à 100 \u20AC/m²',
      'Étanchéité de balcon/loggia : 60 à 120 \u20AC/m²',
      'Cuvelage de sous-sol : 150 à 300 \u20AC/m²',
      'Traitement d\'infiltrations : 50 à 200 \u20AC/m²',
    ],
    tips: [
      'L\'étanchéité d\'un toit-terrasse doit être contrôlée tous les 5 ans. Un défaut mineur non traité peut entraîner des dommages structurels majeurs.',
      'Pour les terrasses accessibles, privilégiez une membrane EPDM (durée de vie 40 ans+) plutôt qu\'un bitume classique.',
    ],
    faq: [
      { q: 'Quelle garantie pour des travaux d\'étanchéité ?', a: 'Les travaux d\'étanchéité sont couverts par la garantie décennale (10 ans). De plus, la plupart des fabricants de membranes offrent une garantie produit de 15 à 25 ans. Exigez les attestations d\'assurance et de garantie fabricant.' },
    ],
    certifications: ['Qualibat étanchéité (1311/1312)', 'Certification ASQUAL', 'RGE si isolation associée'],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 3 semaines',
  },

  facadier: {
    slug: 'facadier',
    name: 'Façadier',
    priceRange: { min: 30, max: 100, unit: '\u20AC/m²' },
    commonTasks: [
      'Ravalement de façade (enduit) : 30 à 70 \u20AC/m²',
      'Isolation thermique par l\'extérieur (ITE) : 100 à 200 \u20AC/m²',
      'Peinture de façade : 20 à 45 \u20AC/m²',
      'Nettoyage haute pression : 10 à 25 \u20AC/m²',
      'Traitement anti-mousse et hydrofuge : 15 à 30 \u20AC/m²',
    ],
    tips: [
      'Un ravalement de façade est obligatoire tous les 10 ans dans certaines communes. Renseignez-vous auprès de votre mairie.',
      'Profitez d\'un ravalement pour ajouter une isolation par l\'extérieur (ITE) et bénéficier des aides MaPrimeRénov\'.',
    ],
    faq: [
      { q: 'Combien coûte un ravalement de façade pour une maison ?', a: 'Pour une maison de 100 m² de façade, comptez entre 5 000 et 15 000 \u20AC selon l\'état du support, le type d\'enduit et la nécessité d\'un échafaudage. Avec ITE, le budget monte à 15 000 à 25 000 \u20AC mais les aides peuvent couvrir jusqu\'à 40 %.' },
    ],
    certifications: ['Qualibat ravalement (6111/6112)', 'RGE pour ITE', 'Certification Sto, Weber ou Parex (fabricants)'],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 6 semaines',
  },

  platrier: {
    slug: 'platrier',
    name: 'Plâtrier',
    priceRange: { min: 25, max: 55, unit: '\u20AC/m²' },
    commonTasks: [
      'Pose de cloisons en plaques de plâtre : 30 à 55 \u20AC/m²',
      'Faux-plafond en plaques de plâtre : 35 à 65 \u20AC/m²',
      'Doublage isolant (plaque + isolant) : 40 à 80 \u20AC/m²',
      'Enduit plâtre traditionnel : 25 à 45 \u20AC/m²',
      'Staff et corniche décorative : 30 à 100 \u20AC/ml',
    ],
    tips: [
      'Pour les pièces humides (salle de bain, cuisine), exigez des plaques hydrofuges (vertes) et non des plaques standard.',
      'Un plâtrier-plaquiste expérimenté réalise des joints invisibles. Vérifiez la qualité des finitions sur des chantiers précédents.',
    ],
    faq: [
      { q: 'Plaque de plâtre ou enduit traditionnel ?', a: 'Les plaques de plâtre (BA13) sont plus rapides à poser et moins chères (30-55 \u20AC/m²). L\'enduit traditionnel offre une meilleure inertie thermique et acoustique mais coûte plus cher en main-d\'œuvre. Pour une rénovation, les plaques sont souvent privilégiées ; pour du neuf haut de gamme, l\'enduit traditionnel.' },
    ],
    certifications: ['Qualibat plâtrerie (4111/4112)', 'Certification Placo/Saint-Gobain', 'RGE pour doublage isolant'],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 2 semaines',
  },

  metallier: {
    slug: 'metallier',
    name: 'Métallier',
    priceRange: { min: 150, max: 400, unit: '\u20AC/ml' },
    commonTasks: [
      'Escalier métallique sur mesure : 3 000 à 12 000 \u20AC',
      'Garde-corps en acier/inox : 150 à 400 \u20AC/ml',
      'Verrière d\'intérieur : 800 à 2 500 \u20AC/m²',
      'Porte d\'entrée en acier : 1 500 à 5 000 \u20AC',
      'Pergola métallique : 3 000 à 8 000 \u20AC',
    ],
    tips: [
      'L\'acier thermolaqué offre le meilleur rapport qualité/prix pour les ouvrages extérieurs. L\'inox est réservé aux environnements corrosifs (bord de mer).',
      'Demandez des plans cotés et une maquette 3D avant la fabrication pour valider les dimensions exactes.',
    ],
    faq: [
      { q: 'Combien coûte une verrière d\'intérieur ?', a: 'Une verrière atelier sur mesure coûte entre 800 et 2 500 \u20AC/m² selon le matériau (acier, aluminium), le type de vitrage (simple, double, feuilleté) et la complexité de la pose. Une verrière standard de 2 m × 1,5 m revient à 2 500 à 5 000 \u20AC, pose comprise.' },
    ],
    certifications: ['Qualibat métallerie (4411)', 'Certification AFNOR NF Métallerie', 'Label Artisanat d\'Art (ouvrages décoratifs)'],
    averageResponseTime: 'Devis sous 1 semaine, fabrication 3 à 6 semaines',
  },

  ferronnier: {
    slug: 'ferronnier',
    name: 'Ferronnier',
    priceRange: { min: 200, max: 600, unit: '\u20AC/ml' },
    commonTasks: [
      'Portail en fer forgé sur mesure : 2 000 à 8 000 \u20AC',
      'Grille de fenêtre : 150 à 500 \u20AC/unité',
      'Rampe d\'escalier en fer forgé : 200 à 600 \u20AC/ml',
      'Table ou mobilier en fer forgé : 500 à 3 000 \u20AC',
      'Restauration d\'ouvrages anciens : sur devis',
    ],
    tips: [
      'La ferronnerie d\'art est un métier rare — les délais de fabrication sont souvent longs (4 à 8 semaines). Anticipez vos projets.',
      'Pour les ouvrages extérieurs, exigez un traitement anticorrosion par galvanisation à chaud avant mise en peinture.',
    ],
    faq: [
      { q: 'Quelle est la différence entre un ferronnier et un métallier ?', a: 'Le ferronnier travaille principalement le fer forgé à chaud (forge traditionnelle) pour des ouvrages décoratifs et artistiques. Le métallier travaille l\'acier, l\'inox et l\'aluminium à froid (soudure, pliage) pour des ouvrages structurels. En pratique, beaucoup d\'artisans maîtrisent les deux techniques.' },
    ],
    certifications: ['Label Entreprise du Patrimoine Vivant (EPV)', 'Maître Artisan en métier d\'art', 'Compagnon du Devoir'],
    averageResponseTime: 'Devis sous 1 semaine, fabrication 4 à 8 semaines',
  },

  'poseur-de-parquet': {
    slug: 'poseur-de-parquet',
    name: 'Poseur de parquet',
    priceRange: { min: 25, max: 80, unit: '\u20AC/m²' },
    commonTasks: [
      'Pose de parquet flottant : 25 à 40 \u20AC/m²',
      'Pose de parquet massif collé : 40 à 80 \u20AC/m²',
      'Pose de parquet massif cloué : 50 à 90 \u20AC/m²',
      'Ponçage et vitrification : 25 à 45 \u20AC/m²',
      'Pose en point de Hongrie ou Versailles : 80 à 150 \u20AC/m²',
    ],
    tips: [
      'Laissez le parquet s\'acclimater 48h minimum dans la pièce avant la pose, pour éviter les déformations.',
      'Pour un parquet massif dans une pièce humide, optez pour des essences exotiques (teck, ipé) naturellement résistantes à l\'eau.',
    ],
    faq: [
      { q: 'Parquet massif, contrecollé ou stratifié ?', a: 'Le parquet massif (30-80 \u20AC/m² hors pose) se ponce et se rénove plusieurs fois, durant 50 à 100 ans. Le contrecollé (25-60 \u20AC/m²) se ponce 1 à 3 fois et dure 30 ans. Le stratifié (10-25 \u20AC/m²) ne se ponce pas et dure 10 à 20 ans. Le massif est un investissement, le stratifié un compromis économique.' },
    ],
    certifications: ['Qualibat pose de revêtements (6321)', 'Certification Parquets de France', 'Label Artisan de confiance'],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 3 semaines',
  },

  miroitier: {
    slug: 'miroitier',
    name: 'Miroitier',
    priceRange: { min: 80, max: 250, unit: '\u20AC/m²' },
    commonTasks: [
      'Pose de miroir sur mesure : 80 à 200 \u20AC/m²',
      'Crédence de cuisine en verre : 150 à 350 \u20AC/m²',
      'Paroi de douche en verre trempé : 400 à 1 200 \u20AC',
      'Vitrine de commerce : 200 à 500 \u20AC/m²',
      'Remplacement de double vitrage : 150 à 400 \u20AC/m²',
    ],
    tips: [
      'Pour les parois de douche et garde-corps, le verre trempé securit est obligatoire (norme NF EN 12150).',
      'Un miroir sur mesure avec bords polis et fixations invisibles coûte plus cher mais offre un rendu haut de gamme.',
    ],
    faq: [
      { q: 'Quelle épaisseur de verre pour une crédence ?', a: 'Une crédence de cuisine nécessite un verre trempé de 6 mm minimum (8 mm recommandé pour les grandes surfaces). Le verre laqué est le plus populaire car il offre un large choix de couleurs et se nettoie facilement. Budget : 150 à 350 \u20AC/m², pose comprise.' },
    ],
    certifications: ['Qualibat vitrerie-miroiterie (4311)', 'Certification Cekal (vitrages isolants)'],
    averageResponseTime: 'Devis sous 48h, fabrication 1 à 3 semaines',
  },

  storiste: {
    slug: 'storiste',
    name: 'Storiste',
    priceRange: { min: 200, max: 800, unit: '\u20AC/unité' },
    commonTasks: [
      'Store banne motorisé : 800 à 3 000 \u20AC',
      'Volet roulant électrique : 300 à 800 \u20AC/fenêtre',
      'Store intérieur (vénitien, enrouleur) : 100 à 400 \u20AC',
      'Pergola bioclimatique : 5 000 à 15 000 \u20AC',
      'Motorisation de volets existants : 200 à 500 \u20AC/volet',
    ],
    tips: [
      'Pour les stores extérieurs, privilégiez une toile acrylique teinte masse (garantie 5 à 10 ans) plutôt qu\'une toile polyester qui se décolore rapidement.',
      'La motorisation Somfy est la référence en France — elle permet l\'intégration domotique et les capteurs vent/soleil.',
    ],
    faq: [
      { q: 'Combien coûte la motorisation de tous les volets d\'une maison ?', a: 'Pour une maison de 8 à 10 volets, comptez 2 500 à 5 000 \u20AC pour la motorisation complète (moteurs + commandes radio + installation). Une commande centralisée ajoute 300 à 800 \u20AC. La motorisation solaire est possible si le câblage électrique est difficile (+30 % de surcoût).' },
    ],
    certifications: ['Qualibat stores et fermetures (3511)', 'Expert Somfy', 'RGE pour volets isolants'],
    averageResponseTime: 'Devis sous 48h, intervention sous 1 à 2 semaines',
  },

  'salle-de-bain': {
    slug: 'salle-de-bain',
    name: 'Salle de bain',
    priceRange: { min: 4000, max: 15000, unit: '\u20AC' },
    commonTasks: [
      'Rénovation complète salle de bain 5 m² : 5 000 à 12 000 \u20AC',
      'Remplacement baignoire par douche à l\'italienne : 3 000 à 7 000 \u20AC',
      'Création d\'une salle de bain (dans une chambre) : 8 000 à 20 000 \u20AC',
      'Pose de carrelage mural et sol : 40 à 80 \u20AC/m²',
      'Installation meuble vasque + robinetterie : 500 à 2 500 \u20AC',
    ],
    tips: [
      'Pour une douche à l\'italienne, exigez une étanchéité SPEC (Système de Protection à l\'Eau sous Carrelage) certifiée.',
      'Prévoyez une VMC performante pour éviter les problèmes d\'humidité et de moisissures.',
    ],
    faq: [
      { q: 'Quelles aides pour rénover sa salle de bain ?', a: 'Si vous avez plus de 60 ans ou êtes en situation de handicap, l\'aide MaPrimeAdapt\' peut couvrir jusqu\'à 70 % des travaux d\'adaptation (douche accessible, barres d\'appui). La TVA réduite à 10 % s\'applique pour les logements de plus de 2 ans. Certaines caisses de retraite proposent aussi des aides.' },
    ],
    certifications: ['Qualibat aménagement intérieur', 'Handibat (accessibilité PMR)', 'Label RGE si isolation associée'],
    averageResponseTime: 'Devis sous 1 semaine, intervention sous 2 à 6 semaines',
  },

  'architecte-interieur': {
    slug: 'architecte-interieur',
    name: 'Architecte d\'intérieur',
    priceRange: { min: 50, max: 150, unit: '\u20AC/m²' },
    commonTasks: [
      'Consultation / conseil déco : 80 à 200 \u20AC/h',
      'Projet d\'aménagement complet : 50 à 150 \u20AC/m² de surface aménagée',
      'Suivi de chantier : 8 à 15 % du montant des travaux',
      'Plans 3D et planches d\'ambiance : 500 à 2 000 \u20AC',
      'Rénovation d\'appartement haussmannien : 800 à 2 000 \u20AC/m²',
    ],
    tips: [
      'Un architecte d\'intérieur titulaire du diplôme CFAI est inscrit au Conseil français des architectes d\'intérieur et peut porter le titre protégé.',
      'Définissez un budget précis avant la première consultation pour que le professionnel adapte ses propositions.',
    ],
    faq: [
      { q: 'Architecte d\'intérieur ou décorateur ?', a: 'L\'architecte d\'intérieur peut modifier les volumes (cloisons, ouvertures, mezzanines) et déposer des permis. Le décorateur intervient uniquement sur l\'ameublement, les couleurs et les textiles sans toucher au bâti. Pour une rénovation avec travaux structurels, un architecte d\'intérieur est indispensable.' },
    ],
    certifications: ['Diplôme CFAI (Conseil Français des Architectes d\'Intérieur)', 'Inscription à l\'Ordre (si architecte DPLG)', 'Assurance décennale'],
    averageResponseTime: 'Premier rendez-vous sous 1 semaine',
  },

  decorateur: {
    slug: 'decorateur',
    name: 'Décorateur',
    priceRange: { min: 50, max: 120, unit: '\u20AC/h' },
    commonTasks: [
      'Conseil en décoration (visite + recommandations) : 150 à 500 \u20AC',
      'Planche d\'ambiance et shopping list : 300 à 1 000 \u20AC/pièce',
      'Home staging pour vente immobilière : 1 à 3 % du prix de vente',
      'Décoration événementielle : 500 à 3 000 \u20AC',
      'Accompagnement achat mobilier : 50 à 120 \u20AC/h',
    ],
    tips: [
      'Un bon décorateur vous fait gagner du temps et de l\'argent en évitant les erreurs d\'achat (meubles inadaptés, couleurs qui ne vont pas ensemble).',
      'Pour un home staging, comptez un ROI de 5 à 10 fois le coût investi sur le prix de vente final.',
    ],
    faq: [
      { q: 'Combien coûte un décorateur pour un salon ?', a: 'Pour un salon de 25 à 35 m², comptez 500 à 2 000 \u20AC pour une prestation complète : visite, planche d\'ambiance, shopping list et accompagnement achat. Le budget mobilier et accessoires est en sus.' },
    ],
    certifications: ['Diplôme en décoration d\'intérieur', 'Membre de l\'UFDI (Union Francophone des Décorateurs d\'Intérieur)'],
    averageResponseTime: 'Premier rendez-vous sous 1 semaine',
  },

  domoticien: {
    slug: 'domoticien',
    name: 'Domoticien',
    priceRange: { min: 500, max: 5000, unit: '\u20AC' },
    commonTasks: [
      'Installation domotique complète maison : 5 000 à 20 000 \u20AC',
      'Éclairage connecté (10 points) : 1 000 à 3 000 \u20AC',
      'Thermostat connecté : 300 à 800 \u20AC (fourniture + pose)',
      'Serrure connectée : 300 à 1 000 \u20AC',
      'Système multiroom audio : 2 000 à 8 000 \u20AC',
    ],
    tips: [
      'Privilégiez les protocoles ouverts (KNX, Zigbee, Z-Wave) plutôt que les systèmes propriétaires fermés pour garantir l\'évolutivité.',
      'Prévoyez un réseau Ethernet en étoile (câble Cat 6) même si vous utilisez du Wi-Fi — c\'est la base d\'une installation fiable.',
    ],
    faq: [
      { q: 'Quel budget pour domotiser une maison ?', a: 'Le budget varie de 3 000 \u20AC (kit DIY : éclairage + thermostat + volets) à 30 000 \u20AC+ (installation professionnelle KNX complète). Un bon compromis est un système Zigbee/Z-Wave avec box domotique (5 000 à 10 000 \u20AC) qui couvre éclairage, chauffage, volets et sécurité.' },
    ],
    certifications: ['Certification KNX Partner', 'Certification Crestron/Control4 (haut de gamme)', 'Habilitation électrique'],
    averageResponseTime: 'Devis sous 1 semaine, installation 1 à 4 semaines',
  },

  'pompe-a-chaleur': {
    slug: 'pompe-a-chaleur',
    name: 'Pompe à chaleur',
    priceRange: { min: 8000, max: 18000, unit: '\u20AC' },
    commonTasks: [
      'PAC air/eau (chauffage + ECS) : 10 000 à 18 000 \u20AC',
      'PAC air/air (climatisation réversible) : 3 000 à 8 000 \u20AC',
      'PAC géothermique : 15 000 à 25 000 \u20AC',
      'Entretien annuel obligatoire : 150 à 300 \u20AC',
      'Remplacement de chaudière fioul par PAC : 12 000 à 20 000 \u20AC',
    ],
    tips: [
      'Exigez un installateur certifié QualiPAC — c\'est obligatoire pour bénéficier des aides MaPrimeRénov\' et des CEE.',
      'Un dimensionnement correct est crucial : une PAC surdimensionnée consomme plus et s\'use prématurément. Exigez une étude thermique (800 à 1 500 \u20AC).',
    ],
    faq: [
      { q: 'Quelles aides pour installer une pompe à chaleur ?', a: 'MaPrimeRénov\' : jusqu\'à 5 000 \u20AC (revenus modestes). CEE (prime énergie) : 2 000 à 4 000 \u20AC. Éco-PTZ : prêt à taux zéro jusqu\'à 50 000 \u20AC. TVA réduite à 5,5 %. Au total, les aides peuvent couvrir 40 à 70 % du coût pour les ménages modestes.' },
    ],
    emergencyInfo: 'En cas de panne de chauffage en hiver, un chauffagiste d\'urgence peut intervenir en 2 à 4h pour un diagnostic. Coût : 150 à 350 \u20AC (déplacement + diagnostic).',
    certifications: ['QualiPAC (obligatoire pour les aides)', 'RGE (Reconnu Garant de l\'Environnement)', 'Certification F-Gaz (manipulation de fluides frigorigènes)'],
    averageResponseTime: 'Devis sous 1 semaine, installation 2 à 4 semaines',
  },

  'panneaux-solaires': {
    slug: 'panneaux-solaires',
    name: 'Panneaux solaires',
    priceRange: { min: 7000, max: 20000, unit: '\u20AC' },
    commonTasks: [
      'Installation photovoltaïque 3 kWc : 7 000 à 10 000 \u20AC',
      'Installation photovoltaïque 6 kWc : 12 000 à 16 000 \u20AC',
      'Installation photovoltaïque 9 kWc : 16 000 à 22 000 \u20AC',
      'Solaire thermique (eau chaude) : 4 000 à 8 000 \u20AC',
      'Batterie de stockage : 4 000 à 10 000 \u20AC',
    ],
    tips: [
      'La rentabilité dépend de l\'orientation (sud idéal), de l\'inclinaison (30° optimal) et de l\'ensoleillement local. Une étude de faisabilité gratuite est proposée par la plupart des installateurs.',
      'En autoconsommation avec revente du surplus, le retour sur investissement est de 8 à 12 ans en moyenne.',
    ],
    faq: [
      { q: 'Est-ce rentable d\'installer des panneaux solaires ?', a: 'Oui, avec un prix de l\'électricité en hausse constante. Une installation de 3 kWc produit environ 3 500 kWh/an dans le sud de la France, soit 500 à 700 \u20AC d\'économie annuelle. Avec la prime à l\'autoconsommation (1 140 \u20AC pour 3 kWc) et la revente du surplus à 0,13 \u20AC/kWh, le retour sur investissement se fait en 8 à 12 ans pour un équipement qui dure 30 ans+.' },
    ],
    certifications: ['QualiPV (installation photovoltaïque)', 'RGE (obligatoire pour les aides)', 'Certification Qualit\'EnR'],
    averageResponseTime: 'Étude gratuite sous 1 semaine, installation 4 à 8 semaines',
  },

  'isolation-thermique': {
    slug: 'isolation-thermique',
    name: 'Isolation thermique',
    priceRange: { min: 20, max: 100, unit: '\u20AC/m²' },
    commonTasks: [
      'Isolation des combles perdus (soufflage) : 20 à 35 \u20AC/m²',
      'Isolation des combles aménagés : 40 à 80 \u20AC/m²',
      'Isolation des murs par l\'intérieur (ITI) : 30 à 70 \u20AC/m²',
      'Isolation des murs par l\'extérieur (ITE) : 100 à 200 \u20AC/m²',
      'Isolation du plancher bas : 25 à 50 \u20AC/m²',
    ],
    tips: [
      'Les combles sont responsables de 25 à 30 % des déperditions thermiques : c\'est le poste à traiter en priorité.',
      'Exigez des matériaux certifiés ACERMI et un artisan RGE pour bénéficier des aides (MaPrimeRénov\', CEE, éco-PTZ).',
    ],
    faq: [
      { q: 'Quelle épaisseur d\'isolant faut-il ?', a: 'Pour les combles perdus : 30 à 40 cm de laine de verre/roche (R ≥ 7 m².K/W). Pour les murs par l\'intérieur : 12 à 16 cm (R ≥ 3,7). Pour les murs par l\'extérieur : 14 à 18 cm (R ≥ 3,7). Ces valeurs correspondent à la RT 2012 / RE 2020 et permettent d\'obtenir les aides.' },
    ],
    certifications: ['RGE (Reconnu Garant de l\'Environnement)', 'Qualibat isolation thermique (7131/7132)', 'Certification ACERMI (matériaux)'],
    averageResponseTime: 'Devis sous 1 semaine, intervention 1 à 3 semaines',
  },

  'renovation-energetique': {
    slug: 'renovation-energetique',
    name: 'Rénovation énergétique',
    priceRange: { min: 15000, max: 50000, unit: '\u20AC' },
    commonTasks: [
      'Audit énergétique (DPE + préconisations) : 800 à 1 500 \u20AC',
      'Rénovation globale (isolation + chauffage + ventilation) : 20 000 à 60 000 \u20AC',
      'Passage de DPE F/G à C/D : 15 000 à 40 000 \u20AC',
      'Remplacement de chaudière fioul par PAC + isolation : 25 000 à 50 000 \u20AC',
    ],
    tips: [
      'Commencez toujours par un audit énergétique pour hiérarchiser les travaux et maximiser les aides.',
      'Le bonus MaPrimeRénov\' « rénovation globale » (jusqu\'à 15 000 \u20AC) récompense les projets qui améliorent le DPE d\'au moins 2 classes.',
    ],
    faq: [
      { q: 'Quelles sont les aides pour une rénovation énergétique ?', a: 'MaPrimeRénov\' (jusqu\'à 20 000 \u20AC), MaPrimeRénov\' Sérénité pour les ménages modestes (jusqu\'à 30 000 \u20AC), CEE (primes énergie), éco-PTZ (jusqu\'à 50 000 \u20AC à taux zéro), TVA à 5,5 %, aides locales (régions, départements). Un ménage modeste peut couvrir jusqu\'à 80 % du coût des travaux.' },
    ],
    certifications: ['RGE (Reconnu Garant de l\'Environnement)', 'Audit énergétique certifié OPQIBI/Qualibat', 'Label BBC Rénovation'],
    averageResponseTime: 'Audit sous 2 semaines, planification des travaux 1 à 3 mois',
  },

  'borne-recharge': {
    slug: 'borne-recharge',
    name: 'Borne de recharge',
    priceRange: { min: 1200, max: 3000, unit: '\u20AC' },
    commonTasks: [
      'Borne 7,4 kW (monophasé) : 1 200 à 2 000 \u20AC',
      'Borne 11 kW (triphasé) : 1 500 à 2 500 \u20AC',
      'Borne 22 kW (triphasé) : 2 000 à 3 500 \u20AC',
      'Installation en copropriété (droit à la prise) : 1 500 à 3 000 \u20AC',
      'Mise aux normes du tableau électrique : 500 à 1 500 \u20AC',
    ],
    tips: [
      'Seul un électricien certifié IRVE peut installer une borne de recharge — c\'est obligatoire pour bénéficier du crédit d\'impôt (300 \u20AC).',
      'Une borne 7,4 kW suffit pour la plupart des usages (recharge complète en 6 à 8h pendant la nuit).',
    ],
    faq: [
      { q: 'Quelles aides pour installer une borne de recharge ?', a: 'Crédit d\'impôt de 300 \u20AC par borne (75 % du coût plafonné à 300 \u20AC), prime Advenir jusqu\'à 960 \u20AC en copropriété, TVA réduite à 5,5 % pour les logements de plus de 2 ans. Le budget net après aides est souvent inférieur à 1 000 \u20AC pour une borne 7,4 kW.' },
    ],
    certifications: ['Qualification IRVE (Infrastructure de Recharge de Véhicules Électriques)', 'Habilitation électrique', 'Certification Qualifelec'],
    averageResponseTime: 'Devis sous 48h, installation sous 1 à 2 semaines',
  },

  ramoneur: {
    slug: 'ramoneur',
    name: 'Ramoneur',
    priceRange: { min: 50, max: 120, unit: '\u20AC' },
    commonTasks: [
      'Ramonage de cheminée (conduit maçonné) : 50 à 90 \u20AC',
      'Ramonage de poêle à bois/granulés : 60 à 120 \u20AC',
      'Ramonage de chaudière (conduit fumée) : 70 à 130 \u20AC',
      'Débistrage (enlèvement du bistre) : 150 à 400 \u20AC',
      'Tubage de conduit : 1 500 à 3 500 \u20AC',
    ],
    tips: [
      'Le ramonage est obligatoire 1 à 2 fois par an selon les communes (vérifiez le règlement sanitaire départemental). Le certificat de ramonage est exigé par votre assurance en cas de sinistre.',
      'Planifiez votre ramonage en septembre/octobre, avant la saison de chauffe — les délais sont plus courts qu\'en plein hiver.',
    ],
    faq: [
      { q: 'Que risque-t-on sans ramonage ?', a: 'Sans ramonage, vous risquez un feu de cheminée (bistre inflammable), une intoxication au monoxyde de carbone (CO), et un refus d\'indemnisation par votre assurance en cas d\'incendie. L\'amende pour défaut de ramonage peut atteindre 450 \u20AC (contravention de 3e classe).' },
    ],
    certifications: ['Qualification Qualibat ramonage (5141)', 'Certification du Groupement des Ramoneurs'],
    averageResponseTime: 'Intervention sous 1 semaine en basse saison, 2 à 3 semaines en automne',
  },

  paysagiste: {
    slug: 'paysagiste',
    name: 'Paysagiste',
    priceRange: { min: 35, max: 80, unit: '\u20AC/m²' },
    commonTasks: [
      'Aménagement paysager complet : 35 à 80 \u20AC/m²',
      'Création de terrasse (bois, pierre) : 80 à 250 \u20AC/m²',
      'Engazonnement (semis ou placage) : 5 à 15 \u20AC/m²',
      'Plantation d\'arbres et haies : 30 à 100 \u20AC/unité',
      'Système d\'arrosage automatique : 10 à 25 \u20AC/m²',
    ],
    tips: [
      'Un paysagiste concepteur (diplôme DPLG ou ENSP) conçoit le projet ; un paysagiste entrepreneur réalise les travaux. Les deux compétences sont parfois réunies chez le même professionnel.',
      'Demandez un plan d\'aménagement avec plantations adaptées au climat et au sol de votre région.',
    ],
    faq: [
      { q: 'Combien coûte l\'aménagement d\'un jardin de 200 m² ?', a: 'Pour un jardin de 200 m² avec terrasse, plantations et engazonnement, comptez 8 000 à 20 000 \u20AC selon le niveau de finition. Un projet haut de gamme avec piscine peut atteindre 50 000 \u20AC+.' },
    ],
    certifications: ['Diplôme ENSP ou DPLG Paysage', 'Qualipaysage (certification professionnelle)', 'Label Écojardin'],
    averageResponseTime: 'Étude sous 2 semaines, réalisation 2 à 8 semaines',
  },

  pisciniste: {
    slug: 'pisciniste',
    name: 'Pisciniste',
    priceRange: { min: 15000, max: 50000, unit: '\u20AC' },
    commonTasks: [
      'Piscine coque polyester 8×4 m : 15 000 à 25 000 \u20AC',
      'Piscine béton maçonnée 8×4 m : 25 000 à 50 000 \u20AC',
      'Piscine hors-sol bois ou acier : 3 000 à 10 000 \u20AC',
      'Rénovation de liner : 2 000 à 5 000 \u20AC',
      'Mise en sécurité (alarme, barrière, couverture) : 1 000 à 5 000 \u20AC',
    ],
    tips: [
      'La mise en sécurité est obligatoire (loi du 3 janvier 2003) : alarme, barrière, couverture ou abri. Amende de 45 000 \u20AC en cas de non-respect.',
      'Prévoyez un budget annuel d\'entretien de 500 à 1 500 \u20AC (produits, électricité, hivernage).',
    ],
    faq: [
      { q: 'Faut-il un permis de construire pour une piscine ?', a: 'Pas de formalité pour les piscines de moins de 10 m². Déclaration préalable de travaux pour les piscines de 10 à 100 m². Permis de construire obligatoire au-delà de 100 m² ou pour les piscines couvertes de plus de 1,80 m de hauteur. La taxe d\'aménagement s\'applique à toutes les piscines de plus de 10 m² (200 \u20AC/m² en 2025).' },
    ],
    certifications: ['Qualification FPP (Fédération des Professionnels de la Piscine)', 'Label Propiscines', 'Certification NF Piscine'],
    averageResponseTime: 'Étude sous 2 semaines, construction 4 à 12 semaines',
  },

  'alarme-securite': {
    slug: 'alarme-securite',
    name: 'Alarme et sécurité',
    priceRange: { min: 500, max: 3000, unit: '\u20AC' },
    commonTasks: [
      'Alarme sans fil (maison 100 m²) : 500 à 1 500 \u20AC',
      'Vidéosurveillance (4 caméras) : 1 000 à 3 000 \u20AC',
      'Interphone/visiophone : 300 à 1 500 \u20AC',
      'Contrôle d\'accès (digicode, badge) : 500 à 2 000 \u20AC',
      'Télésurveillance (abonnement) : 20 à 50 \u20AC/mois',
    ],
    tips: [
      'Privilégiez les systèmes certifiés NF A2P (1 à 3 boucliers) — c\'est un gage de fiabilité reconnu par les assurances.',
      'Une alarme avec télésurveillance permet une intervention des forces de l\'ordre en 15 à 20 minutes en zone urbaine.',
    ],
    faq: [
      { q: 'Mon assurance baisse-t-elle avec une alarme ?', a: 'Oui, la plupart des assureurs accordent une réduction de 5 à 15 % sur la prime habitation pour un système d\'alarme certifié NF A2P avec télésurveillance. Certains contrats exigent même une alarme pour couvrir les objets de valeur supérieure à un certain montant.' },
    ],
    certifications: ['Certification APSAD (règles de sécurité)', 'Label NF A2P (alarmes)', 'Habilitation CNAPS (agents de sécurité)'],
    averageResponseTime: 'Devis sous 48h, installation sous 1 semaine',
  },

  antenniste: {
    slug: 'antenniste',
    name: 'Antenniste',
    priceRange: { min: 100, max: 400, unit: '\u20AC' },
    commonTasks: [
      'Installation antenne TNT : 100 à 250 \u20AC',
      'Installation parabole satellite : 150 à 400 \u20AC',
      'Raccordement fibre optique intérieur : 100 à 300 \u20AC',
      'Amplificateur de signal TNT : 80 à 200 \u20AC',
      'Câblage coaxial ou Ethernet : 30 à 60 \u20AC/point',
    ],
    tips: [
      'Depuis 2023, la TNT en Ultra HD (DVB-T2) se déploie progressivement. Vérifiez que votre installation est compatible.',
      'Pour une réception optimale de la TNT, l\'antenne doit être orientée vers l\'émetteur le plus proche (consultez le site de l\'ANFR).',
    ],
    faq: [
      { q: 'TNT, satellite ou box internet : que choisir ?', a: 'La TNT est gratuite et couvre 97 % du territoire mais offre moins de chaînes. Le satellite (Canal+, Fransat) offre plus de chaînes mais nécessite une parabole. La box internet ADSL/fibre propose la TV via le réseau internet avec replay et VOD inclus. En zone blanche (pas de fibre ni de bonne couverture TNT), le satellite reste la meilleure option.' },
    ],
    certifications: ['Certification AICVF (antennes et télécommunications)', 'Habilitation électrique', 'Formation fibre optique FTTH'],
    averageResponseTime: 'Intervention sous 48h à 1 semaine',
  },

  ascensoriste: {
    slug: 'ascensoriste',
    name: 'Ascensoriste',
    priceRange: { min: 15000, max: 50000, unit: '\u20AC' },
    commonTasks: [
      'Installation ascenseur 3 étages : 20 000 à 50 000 \u20AC',
      'Monte-escalier (1 étage) : 3 500 à 8 000 \u20AC',
      'Plateforme élévatrice PMR : 8 000 à 15 000 \u20AC',
      'Contrat de maintenance annuel : 1 500 à 4 000 \u20AC',
      'Modernisation d\'ascenseur existant : 10 000 à 30 000 \u20AC',
    ],
    tips: [
      'Le contrat de maintenance est obligatoire (décret du 9 septembre 2004). Comparez les offres : certains contrats incluent les pièces d\'usure, d\'autres non.',
      'Pour un monte-escalier, vérifiez la largeur de l\'escalier (65 cm minimum) et la capacité de charge (jusqu\'à 130 kg standard).',
    ],
    faq: [
      { q: 'Quelles aides pour un monte-escalier ?', a: 'MaPrimeAdapt\' (jusqu\'à 70 % pour les revenus modestes), TVA réduite à 5,5 %, crédit d\'impôt de 25 % (plafonné à 5 000 \u20AC pour une personne seule), aides des caisses de retraite et de l\'ANAH. Le reste à charge peut être inférieur à 1 000 \u20AC pour un ménage modeste.' },
    ],
    certifications: ['Certification AFNOR NF Ascenseurs', 'Habilitation électrique', 'Certification Otis/Schindler/Kone (constructeurs)'],
    averageResponseTime: 'Diagnostic sous 1 semaine, installation 4 à 12 semaines',
  },

  diagnostiqueur: {
    slug: 'diagnostiqueur',
    name: 'Diagnostiqueur',
    priceRange: { min: 100, max: 600, unit: '\u20AC' },
    commonTasks: [
      'DPE (Diagnostic de Performance Énergétique) : 100 à 250 \u20AC',
      'Pack diagnostics vente (DPE + amiante + plomb + électricité + gaz + termites) : 300 à 600 \u20AC',
      'Diagnostic amiante : 80 à 150 \u20AC',
      'Diagnostic plomb (CREP) : 100 à 200 \u20AC',
      'Diagnostic électricité ou gaz : 100 à 150 \u20AC',
    ],
    tips: [
      'Le DPE est obligatoire pour toute vente ou location depuis 2006. Depuis 2021, il est opposable juridiquement : un mauvais DPE peut entraîner une action en justice.',
      'Regroupez tous les diagnostics chez un même professionnel pour obtenir un tarif pack (30 à 40 % de réduction).',
    ],
    faq: [
      { q: 'Quels diagnostics sont obligatoires pour vendre ?', a: 'DPE, diagnostic amiante (si permis avant 1997), plomb (si avant 1949), électricité et gaz (si installations de plus de 15 ans), termites (dans les zones à risque), ERP (état des risques et pollutions), et mesurage loi Carrez. Le DPE a une durée de validité de 10 ans, les autres varient de 6 mois (termites) à illimité (amiante si négatif).' },
    ],
    certifications: ['Certification COFRAC (obligatoire)', 'Certification par organisme accrédité (Bureau Veritas, Dekra, etc.)', 'Assurance RC professionnelle obligatoire'],
    averageResponseTime: 'Intervention sous 48h à 1 semaine',
  },

  geometre: {
    slug: 'geometre',
    name: 'Géomètre',
    priceRange: { min: 500, max: 3000, unit: '\u20AC' },
    commonTasks: [
      'Bornage de terrain : 800 à 2 000 \u20AC',
      'Division parcellaire : 1 000 à 3 000 \u20AC',
      'Plan topographique : 500 à 1 500 \u20AC',
      'Plan de masse (permis de construire) : 300 à 800 \u20AC',
      'Implantation de construction : 500 à 1 500 \u20AC',
    ],
    tips: [
      'Seul un géomètre-expert inscrit à l\'Ordre peut réaliser un bornage officiel — les documents produits par un géomètre non inscrit n\'ont pas de valeur juridique.',
      'Le bornage est obligatoire pour toute vente de terrain à bâtir (loi SRU). Il est aussi recommandé en cas de litige de voisinage.',
    ],
    faq: [
      { q: 'Quelle est la différence entre bornage et cadastre ?', a: 'Le bornage fixe les limites réelles de propriété sur le terrain (bornes physiques + procès-verbal). Le cadastre est un document fiscal qui donne les limites indicatives. En cas de contradiction, le bornage prévaut. Le cadastre n\'a pas de valeur juridique pour déterminer les limites de propriété.' },
    ],
    certifications: ['Inscription à l\'Ordre des Géomètres-Experts (obligatoire)', 'Diplôme DPLG ou ESGT', 'Assurance RC professionnelle obligatoire'],
    averageResponseTime: 'Devis sous 1 semaine, intervention 2 à 4 semaines',
  },

  desinsectisation: {
    slug: 'desinsectisation',
    name: 'Désinsectisation',
    priceRange: { min: 80, max: 300, unit: '\u20AC' },
    commonTasks: [
      'Traitement punaises de lit (appartement) : 200 à 600 \u20AC',
      'Traitement cafards/blattes : 80 à 250 \u20AC',
      'Destruction de nid de guêpes/frelons : 80 à 200 \u20AC',
      'Traitement anti-moustiques (jardin) : 150 à 400 \u20AC',
      'Traitement termites : 1 500 à 4 000 \u20AC',
    ],
    tips: [
      'Pour les punaises de lit, un minimum de 2 passages à 15 jours d\'intervalle est nécessaire pour éliminer les œufs qui éclosent après le premier traitement.',
      'En cas de frelons asiatiques, contactez votre mairie — certaines communes prennent en charge la destruction des nids.',
    ],
    emergencyInfo: 'Pour un nid de guêpes ou frelons dangereux (proximité de passage fréquenté), un désinsectiseur peut intervenir en urgence sous 24h. Coût : 100 à 250 \u20AC.',
    faq: [
      { q: 'Les punaises de lit sont-elles un signe de saleté ?', a: 'Non, les punaises de lit ne sont pas liées à l\'hygiène. Elles se transportent via les bagages, les vêtements et les meubles d\'occasion. Même les hôtels 5 étoiles peuvent être touchés. Le traitement professionnel (thermique ou chimique) est la seule solution efficace.' },
    ],
    certifications: ['Certibiocide (obligatoire pour l\'utilisation de biocides)', 'Certification CS3D (Chambre Syndicale 3D)', 'Assurance RC professionnelle'],
    averageResponseTime: 'Intervention sous 24 à 48h',
  },

  deratisation: {
    slug: 'deratisation',
    name: 'Dératisation',
    priceRange: { min: 80, max: 300, unit: '\u20AC' },
    commonTasks: [
      'Dératisation maison/appartement : 80 à 200 \u20AC',
      'Dératisation local commercial : 150 à 400 \u20AC',
      'Contrat annuel de prévention (4 passages) : 300 à 800 \u20AC',
      'Traitement fouines/loirs : 150 à 350 \u20AC',
      'Rebouchage des accès (grillage, mousse expansive) : 100 à 300 \u20AC',
    ],
    tips: [
      'La dératisation est obligatoire dans les locaux à usage professionnel (restaurants, commerces alimentaires) — un contrat annuel est recommandé.',
      'Un diagnostic des points d\'entrée est essentiel : sans rebouchage, les rongeurs reviennent en quelques semaines.',
    ],
    faq: [
      { q: 'Comment savoir si j\'ai des rats ou des souris ?', a: 'Les indices sont : crottes (2 cm pour un rat, 5 mm pour une souris), traces de grignotage sur les câbles/emballages, bruits de grattement la nuit (dans les cloisons, faux-plafonds), odeur musquée caractéristique. Un professionnel peut confirmer l\'espèce et évaluer l\'ampleur de l\'infestation.' },
    ],
    certifications: ['Certibiocide (obligatoire)', 'Certification CS3D (Chambre Syndicale 3D)', 'Assurance RC professionnelle'],
    averageResponseTime: 'Intervention sous 24 à 48h',
  },

  demenageur: {
    slug: 'demenageur',
    name: 'Déménageur',
    priceRange: { min: 500, max: 3000, unit: '\u20AC' },
    commonTasks: [
      'Déménagement studio (30 m²) même ville : 400 à 800 \u20AC',
      'Déménagement T3 (60 m²) même ville : 800 à 1 500 \u20AC',
      'Déménagement T3 longue distance (500 km) : 1 500 à 3 000 \u20AC',
      'Déménagement maison (120 m²) : 2 000 à 5 000 \u20AC',
      'Garde-meubles : 50 à 200 \u20AC/m³/mois',
    ],
    tips: [
      'Demandez 3 devis minimum et vérifiez que le déménageur est immatriculé au registre des transporteurs (numéro DREAL).',
      'Souscrivez l\'assurance « valeur déclarée » (1 à 2 % de la valeur des biens) plutôt que la couverture de base (très faible indemnisation au poids).',
    ],
    faq: [
      { q: 'Quand réserver son déménageur ?', a: 'Réservez 4 à 6 semaines à l\'avance en période creuse (octobre-mars) et 8 à 12 semaines en période haute (juin-septembre). Les premiers et derniers jours du mois sont les plus demandés. Un déménagement en milieu de mois et en semaine est souvent 20 à 30 % moins cher.' },
    ],
    certifications: ['Immatriculation DREAL (obligatoire)', 'Label NF Service Déménagement', 'Certification ISO 9001 (qualité)'],
    averageResponseTime: 'Devis sous 48h (visite technique), planification 2 à 8 semaines',
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
