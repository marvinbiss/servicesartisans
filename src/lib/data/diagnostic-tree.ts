/**
 * Arbre de decision pour le diagnostic "Quel artisan vous faut-il ?".
 * Chaque catégorie contient des sous-problemes qui pointent vers un service.
 */

export interface DiagnosticSubProblem {
  id: string
  label: string
  description: string
  recommendedService: string       // service slug (from trade-content.ts)
  alternativeServices?: string[]   // fallback suggestions
  estimatedPriceRange?: string     // e.g. "80-250 EUR"
  urgencyTip?: string
}

export interface DiagnosticCategory {
  id: string
  label: string
  icon: string  // emoji
  subProblems: DiagnosticSubProblem[]
}

export const diagnosticCategories: DiagnosticCategory[] = [
  {
    id: 'eau-plomberie',
    label: 'Eau & Plomberie',
    icon: '🚿',
    subProblems: [
      {
        id: 'fuite-eau',
        label: 'Fuite d\'eau',
        description: 'Fuite visible sur un tuyau, un raccord ou sous un évier',
        recommendedService: 'plombier',
        estimatedPriceRange: '90-300\u00A0\u20AC',
        urgencyTip: 'Coupez l\'arrivée d\'eau au compteur général immédiatement pour limiter les dégâts.',
      },
      {
        id: 'robinet-casse',
        label: 'Robinet cassé ou qui fuit',
        description: 'Robinet qui goutte, poignée cassée ou mitigeur défaillant',
        recommendedService: 'plombier',
        estimatedPriceRange: '80-200\u00A0\u20AC',
      },
      {
        id: 'chauffe-eau-panne',
        label: 'Chauffe-eau en panne',
        description: 'Plus d\'eau chaude, fuite au ballon ou bruit anormal',
        recommendedService: 'plombier',
        alternativeServices: ['chauffagiste'],
        estimatedPriceRange: '800-2\u00A0500\u00A0\u20AC',
        urgencyTip: 'En attendant le professionnel, coupez l\'alimentation électrique ou gaz du chauffe-eau.',
      },
      {
        id: 'wc-bouche',
        label: 'WC bouché ou en panne',
        description: 'Toilettes bouchées, chasse d\'eau défaillante ou fuite',
        recommendedService: 'plombier',
        estimatedPriceRange: '80-250\u00A0\u20AC',
      },
      {
        id: 'canalisation-bouchee',
        label: 'Canalisation bouchée',
        description: 'Évacuation lente ou bouchée (évier, douche, égout)',
        recommendedService: 'plombier',
        estimatedPriceRange: '80-250\u00A0\u20AC',
        urgencyTip: 'Ne versez pas de produits chimiques : ils peuvent endommager vos canalisations.',
      },
    ],
  },
  {
    id: 'electricite',
    label: 'Électricité',
    icon: '⚡',
    subProblems: [
      {
        id: 'panne-courant',
        label: 'Panne de courant',
        description: 'Plus d\'électricité dans tout ou partie du logement',
        recommendedService: 'electricien',
        estimatedPriceRange: '100-300\u00A0\u20AC',
        urgencyTip: 'Vérifiez d\'abord votre disjoncteur général et vos fusibles avant d\'appeler.',
      },
      {
        id: 'prise-gresille',
        label: 'Prise qui grésille ou chauffe',
        description: 'Étincelles, odeur de brûlé ou prise anormalement chaude',
        recommendedService: 'electricien',
        estimatedPriceRange: '60-150\u00A0\u20AC',
        urgencyTip: 'Coupez le disjoncteur du circuit concerné. Ne touchez pas la prise.',
      },
      {
        id: 'tableau-electrique',
        label: 'Problème de tableau électrique',
        description: 'Disjoncteur qui saute, mise aux normes nécessaire',
        recommendedService: 'electricien',
        estimatedPriceRange: '800-2\u00A0500\u00A0\u20AC',
      },
      {
        id: 'eclairage',
        label: 'Éclairage défaillant',
        description: 'Luminaires en panne, clignotement, installation de spots',
        recommendedService: 'electricien',
        estimatedPriceRange: '80-200\u00A0\u20AC',
      },
      {
        id: 'installation-electrique',
        label: 'Nouvelle installation électrique',
        description: 'Ajout de prises, interrupteurs ou circuit électrique complet',
        recommendedService: 'electricien',
        estimatedPriceRange: '150-500\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'serrurerie-securite',
    label: 'Serrurerie & Sécurité',
    icon: '🔑',
    subProblems: [
      {
        id: 'porte-claquee',
        label: 'Porte claquée',
        description: 'Porte fermée avec les clés à l\'intérieur',
        recommendedService: 'serrurier',
        estimatedPriceRange: '80-150\u00A0\u20AC',
        urgencyTip: 'Restez calme. Un serrurier qualifié peut ouvrir sans dégâts dans la majorité des cas.',
      },
      {
        id: 'cle-perdue',
        label: 'Clé perdue ou volée',
        description: 'Perte de clés, besoin de doubles ou remplacement du barillet',
        recommendedService: 'serrurier',
        estimatedPriceRange: '100-300\u00A0\u20AC',
        urgencyTip: 'En cas de vol, déposez plainte avant de faire changer la serrure.',
      },
      {
        id: 'blindage-porte',
        label: 'Blindage de porte',
        description: 'Renforcement de porte ou installation d\'une porte blindée',
        recommendedService: 'serrurier',
        estimatedPriceRange: '800-4\u00A0500\u00A0\u20AC',
      },
      {
        id: 'serrure-cassee',
        label: 'Serrure cassée ou bloquée',
        description: 'La clé tourne dans le vide, barillet cassé ou bloqué',
        recommendedService: 'serrurier',
        estimatedPriceRange: '100-400\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'chauffage-climatisation',
    label: 'Chauffage & Climatisation',
    icon: '🔥',
    subProblems: [
      {
        id: 'chaudiere-panne',
        label: 'Chaudière en panne',
        description: 'Chaudière qui ne démarre pas, bruit anormal ou code erreur',
        recommendedService: 'chauffagiste',
        estimatedPriceRange: '100-500\u00A0\u20AC',
        urgencyTip: 'Si vous sentez une odeur de gaz, quittez les lieux et appelez le 0 800 47 33 33 (Urgence Gaz).',
      },
      {
        id: 'radiateur-froid',
        label: 'Radiateur froid ou qui fuit',
        description: 'Radiateur qui ne chauffe pas, purge ou fuite',
        recommendedService: 'chauffagiste',
        estimatedPriceRange: '80-300\u00A0\u20AC',
      },
      {
        id: 'climatisation',
        label: 'Installation ou panne de climatisation',
        description: 'Clim en panne, installation ou entretien de climatiseur',
        recommendedService: 'climaticien',
        alternativeServices: ['chauffagiste'],
        estimatedPriceRange: '300-3\u00A0000\u00A0\u20AC',
      },
      {
        id: 'pompe-a-chaleur',
        label: 'Pompe à chaleur',
        description: 'Installation, entretien ou panne de pompe à chaleur',
        recommendedService: 'chauffagiste',
        alternativeServices: ['climaticien'],
        estimatedPriceRange: '8\u00A0000-18\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'construction-renovation',
    label: 'Construction & Rénovation',
    icon: '🏗️',
    subProblems: [
      {
        id: 'fissure-mur',
        label: 'Fissure dans un mur',
        description: 'Fissure intérieure ou extérieure, lézarde, mur qui se détériore',
        recommendedService: 'macon',
        estimatedPriceRange: '200-2\u00A0000\u00A0\u20AC',
      },
      {
        id: 'infiltration-toiture',
        label: 'Infiltration en toiture',
        description: 'Fuite de toit, tuile cassée, gouttière percée',
        recommendedService: 'couvreur',
        estimatedPriceRange: '200-1\u00A0500\u00A0\u20AC',
        urgencyTip: 'Placez des récipients sous la fuite et protégez vos meubles en attendant l\'artisan.',
      },
      {
        id: 'fenetre-cassee',
        label: 'Fenêtre ou vitre cassée',
        description: 'Vitre brisée, double vitrage en panne ou condensation',
        recommendedService: 'vitrier',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '80-500\u00A0\u20AC',
      },
      {
        id: 'volet-roulant',
        label: 'Volet roulant bloqué',
        description: 'Volet qui ne monte ou ne descend plus, moteur en panne',
        recommendedService: 'menuisier',
        estimatedPriceRange: '100-400\u00A0\u20AC',
      },
      {
        id: 'agrandissement',
        label: 'Agrandissement ou extension',
        description: 'Extension de maison, véranda, surélévation',
        recommendedService: 'macon',
        alternativeServices: ['charpentier'],
        estimatedPriceRange: '15\u00A0000-80\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'finitions-decoration',
    label: 'Finitions & Décoration',
    icon: '🎨',
    subProblems: [
      {
        id: 'peinture-ecaillee',
        label: 'Peinture écaillée ou abîmée',
        description: 'Peinture qui s\'écaille, taches ou traces d\'humidité',
        recommendedService: 'peintre-en-batiment',
        estimatedPriceRange: '20-45\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'carrelage-casse',
        label: 'Carrelage cassé ou à poser',
        description: 'Carreaux fêlés, pose de carrelage sol ou mural',
        recommendedService: 'carreleur',
        estimatedPriceRange: '30-80\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'parquet-abime',
        label: 'Parquet abîmé ou à poser',
        description: 'Lames de parquet rayées, gondolées ou à installer',
        recommendedService: 'solier',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '25-80\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'papier-peint',
        label: 'Papier peint à poser',
        description: 'Pose de papier peint, tapisserie ou revêtement mural',
        recommendedService: 'peintre-en-batiment',
        estimatedPriceRange: '15-40\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'installation-cuisine',
        label: 'Installation de cuisine',
        description: 'Montage et pose d\'une cuisine équipée',
        recommendedService: 'cuisiniste',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '2\u00A0000-10\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'exterieur-jardin',
    label: 'Extérieur & Jardin',
    icon: '🌿',
    subProblems: [
      {
        id: 'taille-haie',
        label: 'Taille de haie ou entretien de jardin',
        description: 'Tonte de pelouse, taille de haies, élagage d\'arbres',
        recommendedService: 'jardinier',
        estimatedPriceRange: '30-60\u00A0\u20AC/h',
      },
      {
        id: 'terrasse',
        label: 'Terrasse à construire ou réparer',
        description: 'Construction de terrasse en bois, carrelage ou béton',
        recommendedService: 'macon',
        alternativeServices: ['jardinier'],
        estimatedPriceRange: '50-200\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'cloture',
        label: 'Clôture ou portail',
        description: 'Installation de clôture, grillage ou portail',
        recommendedService: 'jardinier',
        alternativeServices: ['macon'],
        estimatedPriceRange: '40-150\u00A0\u20AC/ml',
      },
      {
        id: 'piscine',
        label: 'Piscine',
        description: 'Construction, entretien ou réparation de piscine',
        recommendedService: 'pisciniste',
        alternativeServices: ['macon'],
        estimatedPriceRange: '15\u00A0000-50\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'autre',
    label: 'Autre problème',
    icon: '🔧',
    subProblems: [
      {
        id: 'nettoyage-travaux',
        label: 'Nettoyage après travaux',
        description: 'Nettoyage de fin de chantier, dépoussiérage, remise en état',
        recommendedService: 'nettoyage',
        estimatedPriceRange: '15-35\u00A0\u20AC/h',
      },
      {
        id: 'installation-clim',
        label: 'Installation de climatisation',
        description: 'Pose de climatiseur split, gainable ou réversible',
        recommendedService: 'climaticien',
        estimatedPriceRange: '1\u00A0500-5\u00A0000\u00A0\u20AC',
      },
      {
        id: 'domotique',
        label: 'Domotique et maison connectée',
        description: 'Automatisation de volets, éclairage, chauffage connecté',
        recommendedService: 'domoticien',
        alternativeServices: ['electricien'],
        estimatedPriceRange: '500-5\u00A0000\u00A0\u20AC',
      },
      {
        id: 'alarme-securite',
        label: 'Alarme et sécurité',
        description: 'Installation d\'alarme, vidéosurveillance, interphone',
        recommendedService: 'alarme-securite',
        alternativeServices: ['electricien'],
        estimatedPriceRange: '500-3\u00A0000\u00A0\u20AC',
      },
    ],
  },
]

/**
 * Noms lisibles des services pour l'affichage (slug -> label)
 */
export const serviceLabels: Record<string, string> = {
  'plombier': 'Plombier',
  'electricien': 'Électricien',
  'serrurier': 'Serrurier',
  'chauffagiste': 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en bâtiment',
  'menuisier': 'Menuisier',
  'carreleur': 'Carreleur',
  'couvreur': 'Couvreur',
  'macon': 'Maçon',
  'jardinier': 'Jardinier-paysagiste',
  'vitrier': 'Vitrier',
  'climaticien': 'Climaticien',
  'cuisiniste': 'Cuisiniste',
  'solier': 'Solier (revêtements de sol)',
  'nettoyage': 'Nettoyage',
  'charpentier': 'Charpentier',
  'domoticien': 'Domoticien',
  'alarme-securite': 'Alarme & Sécurité',
  'pisciniste': 'Pisciniste',
  'paysagiste': 'Paysagiste',
}

/**
 * Icônes emoji associées à chaque service
 */
export const serviceIcons: Record<string, string> = {
  'plombier': '🚿',
  'electricien': '⚡',
  'serrurier': '🔑',
  'chauffagiste': '🔥',
  'peintre-en-batiment': '🎨',
  'menuisier': '🪚',
  'carreleur': '🧱',
  'couvreur': '🏠',
  'macon': '🏗️',
  'jardinier': '🌿',
  'vitrier': '🪟',
  'climaticien': '❄️',
  'cuisiniste': '🍳',
  'solier': '🪵',
  'nettoyage': '🧹',
  'charpentier': '🪓',
  'domoticien': '🏡',
  'alarme-securite': '🔔',
  'pisciniste': '🏊',
  'paysagiste': '🌳',
}
