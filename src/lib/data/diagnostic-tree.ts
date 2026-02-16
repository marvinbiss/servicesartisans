/**
 * Arbre de decision pour le diagnostic "Quel artisan vous faut-il ?".
 * Chaque categorie contient des sous-problemes qui pointent vers un service.
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
    icon: '\uD83D\uDEBF',
    subProblems: [
      {
        id: 'fuite-eau',
        label: 'Fuite d\'eau',
        description: 'Fuite visible sur un tuyau, un raccord ou sous un evier',
        recommendedService: 'plombier',
        estimatedPriceRange: '90-300\u00A0\u20AC',
        urgencyTip: 'Coupez l\'arrivee d\'eau au compteur general immediatement pour limiter les degats.',
      },
      {
        id: 'robinet-casse',
        label: 'Robinet casse ou qui fuit',
        description: 'Robinet qui goutte, poignee cassee ou mitigeur defaillant',
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
        urgencyTip: 'En attendant le professionnel, coupez l\'alimentation electrique ou gaz du chauffe-eau.',
      },
      {
        id: 'wc-bouche',
        label: 'WC bouche ou en panne',
        description: 'Toilettes bouchees, chasse d\'eau defaillante ou fuite',
        recommendedService: 'plombier',
        estimatedPriceRange: '80-250\u00A0\u20AC',
      },
      {
        id: 'canalisation-bouchee',
        label: 'Canalisation bouchee',
        description: 'Evacuation lente ou bouchee (evier, douche, egout)',
        recommendedService: 'plombier',
        estimatedPriceRange: '80-250\u00A0\u20AC',
        urgencyTip: 'Ne versez pas de produits chimiques : ils peuvent endommager vos canalisations.',
      },
    ],
  },
  {
    id: 'electricite',
    label: 'Electricite',
    icon: '\u26A1',
    subProblems: [
      {
        id: 'panne-courant',
        label: 'Panne de courant',
        description: 'Plus d\'electricite dans tout ou partie du logement',
        recommendedService: 'electricien',
        estimatedPriceRange: '100-300\u00A0\u20AC',
        urgencyTip: 'Verifiez d\'abord votre disjoncteur general et vos fusibles avant d\'appeler.',
      },
      {
        id: 'prise-gresille',
        label: 'Prise qui gresille ou chauffe',
        description: 'Etincelles, odeur de brule ou prise anormalement chaude',
        recommendedService: 'electricien',
        estimatedPriceRange: '60-150\u00A0\u20AC',
        urgencyTip: 'Coupez le disjoncteur du circuit concerne. Ne touchez pas la prise.',
      },
      {
        id: 'tableau-electrique',
        label: 'Probleme de tableau electrique',
        description: 'Disjoncteur qui saute, mise aux normes necessaire',
        recommendedService: 'electricien',
        estimatedPriceRange: '800-2\u00A0500\u00A0\u20AC',
      },
      {
        id: 'eclairage',
        label: 'Eclairage defaillant',
        description: 'Luminaires en panne, clignotement, installation de spots',
        recommendedService: 'electricien',
        estimatedPriceRange: '80-200\u00A0\u20AC',
      },
      {
        id: 'installation-electrique',
        label: 'Nouvelle installation electrique',
        description: 'Ajout de prises, interrupteurs ou circuit electrique complet',
        recommendedService: 'electricien',
        estimatedPriceRange: '150-500\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'serrurerie-securite',
    label: 'Serrurerie & Securite',
    icon: '\uD83D\uDD11',
    subProblems: [
      {
        id: 'porte-claquee',
        label: 'Porte claquee',
        description: 'Porte fermee avec les cles a l\'interieur',
        recommendedService: 'serrurier',
        estimatedPriceRange: '80-150\u00A0\u20AC',
        urgencyTip: 'Restez calme. Un serrurier qualifie peut ouvrir sans degats dans la majorite des cas.',
      },
      {
        id: 'cle-perdue',
        label: 'Cle perdue ou volee',
        description: 'Perte de cles, besoin de doubles ou remplacement du barillet',
        recommendedService: 'serrurier',
        estimatedPriceRange: '100-300\u00A0\u20AC',
        urgencyTip: 'En cas de vol, deposez plainte avant de faire changer la serrure.',
      },
      {
        id: 'blindage-porte',
        label: 'Blindage de porte',
        description: 'Renforcement de porte ou installation d\'une porte blindee',
        recommendedService: 'serrurier',
        estimatedPriceRange: '800-4\u00A0500\u00A0\u20AC',
      },
      {
        id: 'serrure-cassee',
        label: 'Serrure cassee ou bloquee',
        description: 'La cle tourne dans le vide, barillet casse ou bloque',
        recommendedService: 'serrurier',
        estimatedPriceRange: '100-400\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'chauffage-climatisation',
    label: 'Chauffage & Climatisation',
    icon: '\uD83D\uDD25',
    subProblems: [
      {
        id: 'chaudiere-panne',
        label: 'Chaudiere en panne',
        description: 'Chaudiere qui ne demarre pas, bruit anormal ou code erreur',
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
        label: 'Pompe a chaleur',
        description: 'Installation, entretien ou panne de pompe a chaleur',
        recommendedService: 'chauffagiste',
        alternativeServices: ['climaticien'],
        estimatedPriceRange: '8\u00A0000-18\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'construction-renovation',
    label: 'Construction & Renovation',
    icon: '\uD83C\uDFD7\uFE0F',
    subProblems: [
      {
        id: 'fissure-mur',
        label: 'Fissure dans un mur',
        description: 'Fissure interieure ou exterieure, lezarde, mur qui se deteriore',
        recommendedService: 'macon',
        estimatedPriceRange: '200-2\u00A0000\u00A0\u20AC',
      },
      {
        id: 'infiltration-toiture',
        label: 'Infiltration en toiture',
        description: 'Fuite de toit, tuile cassee, gouttiere percee',
        recommendedService: 'couvreur',
        estimatedPriceRange: '200-1\u00A0500\u00A0\u20AC',
        urgencyTip: 'Placez des recipients sous la fuite et protegez vos meubles en attendant l\'artisan.',
      },
      {
        id: 'fenetre-cassee',
        label: 'Fenetre ou vitre cassee',
        description: 'Vitre brisee, double vitrage en panne ou condensation',
        recommendedService: 'vitrier',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '80-500\u00A0\u20AC',
      },
      {
        id: 'volet-roulant',
        label: 'Volet roulant bloque',
        description: 'Volet qui ne monte ou ne descend plus, moteur en panne',
        recommendedService: 'menuisier',
        estimatedPriceRange: '100-400\u00A0\u20AC',
      },
      {
        id: 'agrandissement',
        label: 'Agrandissement ou extension',
        description: 'Extension de maison, veranda, surelelevation',
        recommendedService: 'macon',
        alternativeServices: ['charpentier'],
        estimatedPriceRange: '15\u00A0000-80\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'finitions-decoration',
    label: 'Finitions & Decoration',
    icon: '\uD83C\uDFA8',
    subProblems: [
      {
        id: 'peinture-ecaillee',
        label: 'Peinture ecaillee ou abimee',
        description: 'Peinture qui s\'ecaille, taches ou traces d\'humidite',
        recommendedService: 'peintre-en-batiment',
        estimatedPriceRange: '20-45\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'carrelage-casse',
        label: 'Carrelage casse ou a poser',
        description: 'Carreaux feles, pose de carrelage sol ou mural',
        recommendedService: 'carreleur',
        estimatedPriceRange: '30-80\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'parquet-abime',
        label: 'Parquet abime ou a poser',
        description: 'Lames de parquet rayees, gondolees ou a installer',
        recommendedService: 'solier',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '25-80\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'papier-peint',
        label: 'Papier peint a poser',
        description: 'Pose de papier peint, tapisserie ou revetement mural',
        recommendedService: 'peintre-en-batiment',
        estimatedPriceRange: '15-40\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'installation-cuisine',
        label: 'Installation de cuisine',
        description: 'Montage et pose d\'une cuisine equipee',
        recommendedService: 'cuisiniste',
        alternativeServices: ['menuisier'],
        estimatedPriceRange: '2\u00A0000-10\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'exterieur-jardin',
    label: 'Exterieur & Jardin',
    icon: '\uD83C\uDF3F',
    subProblems: [
      {
        id: 'taille-haie',
        label: 'Taille de haie ou entretien de jardin',
        description: 'Tonte de pelouse, taille de haies, elagage d\'arbres',
        recommendedService: 'jardinier',
        estimatedPriceRange: '30-60\u00A0\u20AC/h',
      },
      {
        id: 'terrasse',
        label: 'Terrasse a construire ou reparer',
        description: 'Construction de terrasse en bois, carrelage ou beton',
        recommendedService: 'macon',
        alternativeServices: ['jardinier'],
        estimatedPriceRange: '50-200\u00A0\u20AC/m\u00B2',
      },
      {
        id: 'cloture',
        label: 'Cloture ou portail',
        description: 'Installation de cloture, grillage ou portail',
        recommendedService: 'jardinier',
        alternativeServices: ['macon'],
        estimatedPriceRange: '40-150\u00A0\u20AC/ml',
      },
      {
        id: 'piscine',
        label: 'Piscine',
        description: 'Construction, entretien ou reparation de piscine',
        recommendedService: 'pisciniste',
        alternativeServices: ['macon'],
        estimatedPriceRange: '15\u00A0000-50\u00A0000\u00A0\u20AC',
      },
    ],
  },
  {
    id: 'autre',
    label: 'Autre probleme',
    icon: '\uD83D\uDD27',
    subProblems: [
      {
        id: 'nettoyage-travaux',
        label: 'Nettoyage apres travaux',
        description: 'Nettoyage de fin de chantier, depoussierage, remise en etat',
        recommendedService: 'nettoyage',
        estimatedPriceRange: '15-35\u00A0\u20AC/h',
      },
      {
        id: 'installation-clim',
        label: 'Installation de climatisation',
        description: 'Pose de climatiseur split, gainable ou reversible',
        recommendedService: 'climaticien',
        estimatedPriceRange: '1\u00A0500-5\u00A0000\u00A0\u20AC',
      },
      {
        id: 'domotique',
        label: 'Domotique et maison connectee',
        description: 'Automatisation de volets, eclairage, chauffage connecte',
        recommendedService: 'domoticien',
        alternativeServices: ['electricien'],
        estimatedPriceRange: '500-5\u00A0000\u00A0\u20AC',
      },
      {
        id: 'alarme-securite',
        label: 'Alarme et securite',
        description: 'Installation d\'alarme, videosurveillance, interphone',
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
  'electricien': '\u00C9lectricien',
  'serrurier': 'Serrurier',
  'chauffagiste': 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en b\u00E2timent',
  'menuisier': 'Menuisier',
  'carreleur': 'Carreleur',
  'couvreur': 'Couvreur',
  'macon': 'Ma\u00E7on',
  'jardinier': 'Jardinier-paysagiste',
  'vitrier': 'Vitrier',
  'climaticien': 'Climaticien',
  'cuisiniste': 'Cuisiniste',
  'solier': 'Solier (rev\u00EAtements de sol)',
  'nettoyage': 'Nettoyage',
  'charpentier': 'Charpentier',
  'domoticien': 'Domoticien',
  'alarme-securite': 'Alarme & S\u00E9curit\u00E9',
  'pisciniste': 'Pisciniste',
  'paysagiste': 'Paysagiste',
}

/**
 * Icones emoji associees a chaque service
 */
export const serviceIcons: Record<string, string> = {
  'plombier': '\uD83D\uDEBF',
  'electricien': '\u26A1',
  'serrurier': '\uD83D\uDD11',
  'chauffagiste': '\uD83D\uDD25',
  'peintre-en-batiment': '\uD83C\uDFA8',
  'menuisier': '\uD83E\uDE9A',
  'carreleur': '\uD83E\uDDF1',
  'couvreur': '\uD83C\uDFE0',
  'macon': '\uD83C\uDFD7\uFE0F',
  'jardinier': '\uD83C\uDF3F',
  'vitrier': '\uD83E\uDE9F',
  'climaticien': '\u2744\uFE0F',
  'cuisiniste': '\uD83C\uDF73',
  'solier': '\uD83E\uDEB5',
  'nettoyage': '\uD83E\uDDF9',
  'charpentier': '\uD83E\uDE93',
  'domoticien': '\uD83C\uDFE1',
  'alarme-securite': '\uD83D\uDD14',
  'pisciniste': '\uD83C\uDFCA',
  'paysagiste': '\uD83C\uDF33',
}
