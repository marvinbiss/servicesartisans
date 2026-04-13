// Batch 2: Additional service images (5-7 per trade)
// Source : Unsplash (licence gratuite, usage commercial autorisé)
// RÈGLE D'OR : ZÉRO doublon avec images.ts (batch 1)

function unsplash(id: string, w = 800, h = 600): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

export const serviceImagePool_batch2: Record<string, { src: string; alt: string }[]> = {
  facadier: [
    {
      src: unsplash('photo-ibFaeG1E2Ws'),
      alt: "Ouvriers sur échafaudage isolant thermiquement la façade d'une maison",
    },
    {
      src: unsplash('photo-5GUS9DhZrHw'),
      alt: "Artisans sur échafaudage posant l'isolation extérieure d'une façade",
    },
    {
      src: unsplash('photo-rxfWPJUUClo'),
      alt: 'Maison en construction avec échafaudage pour ravalement de façade',
    },
    {
      src: unsplash('photo-W375t_HvjCc'),
      alt: 'Chantier de rénovation de façade avec échafaudage complet',
    },
    {
      src: unsplash('photo-bRC0o9MUTh8'),
      alt: 'Ouvriers du bâtiment travaillant sur un échafaudage en hauteur',
    },
    {
      src: unsplash('photo-1atSt4T0dYk'),
      alt: 'Immeuble historique en cours de ravalement avec échafaudage',
    },
  ],

  charpentier: [
    {
      src: unsplash('photo-XkkHcANte1w'),
      alt: 'Charpente en bois avec poutres apparentes dans un grenier',
    },
    {
      src: unsplash('photo-eZtWDby4HJ0'),
      alt: "Ossature bois d'une maison en cours de construction",
    },
    {
      src: unsplash('photo-ps3cAZGdFI8'),
      alt: 'Charpentier utilisant une scie circulaire pour découper des planches',
    },
    {
      src: unsplash('photo-P6VEvrI5C08'),
      alt: 'Artisan charpentier dans son atelier de menuiserie',
    },
    {
      src: unsplash('photo-brPKGeqvVKI'),
      alt: 'Toiture en construction avec charpente traditionnelle en bois',
    },
    {
      src: unsplash('photo-NYKtqJovyIc'),
      alt: 'Combles aménagés avec poutres en bois et isolation',
    },
    {
      src: unsplash('photo-B3AN1ZoDD3M'),
      alt: 'Combles isolés avec charpente en bois et fenêtres de toit',
    },
  ],

  terrassier: [
    { src: unsplash('photo-3xaxYYv1_PI'), alt: 'Pelleteuse jaune sur un chantier de terrassement' },
    {
      src: unsplash('photo-maVHoAWycOs'),
      alt: 'Excavatrice jaune et noire sur un terrain en terre',
    },
    {
      src: unsplash('photo-jbJp18srifE'),
      alt: "Vue aérienne d'une pelleteuse jaune en action sur un chantier",
    },
    {
      src: unsplash('photo-ZgmGq_eFmUs'),
      alt: 'Excavatrice Caterpillar creusant le sol sur un chantier',
    },
    {
      src: unsplash('photo-h2UqpVtR89s'),
      alt: "Vue aérienne d'un chantier de terrassement avec engins",
    },
    { src: unsplash('photo-rpP7zWy-Uxc'), alt: 'Bulldozer sur un terrain en cours de nivellement' },
    { src: unsplash('photo-8wlxGDOAXSM'), alt: 'Engin de terrassement creusant devant une maison' },
  ],

  'isolation-thermique': [
    {
      src: unsplash('photo-CFe3yzlfitY'),
      alt: 'Maison à ossature bois isolée par mousse polyuréthane projetée',
    },
    {
      src: unsplash('photo-DWrDpN8i2Fc'),
      alt: "Isolation thermique d'une maison à ossature bois en construction",
    },
    {
      src: unsplash('photo-_oy5VYpFe5Y'),
      alt: 'Combles avec isolation thermique entre les poutres',
    },
    {
      src: unsplash('photo-Pn3U4KBZt_0'),
      alt: "Grenier avec rouleaux d'isolant et charpente apparente",
    },
    {
      src: unsplash('photo-oXGlh4Dc-Do'),
      alt: 'Intérieur de combles avec isolation et poutres en bois',
    },
    {
      src: unsplash('photo-t8sD1He4VSs'),
      alt: "Ouvrier posant l'isolation sur les murs d'une maison en construction",
    },
  ],

  domoticien: [
    {
      src: unsplash('photo-AMowJMiKLNc'),
      alt: 'Lampe connectée contrôlée par application domotique Wi-Fi',
    },
    {
      src: unsplash('photo-ckPCV5cy-6A'),
      alt: 'Tablette avec interface de contrôle maison connectée',
    },
    {
      src: unsplash('photo-9TF54VdG0ws'),
      alt: 'Enceinte connectée Google Home Mini sur une surface blanche',
    },
    { src: unsplash('photo-mIFEgEJBE6U'), alt: 'Assistant vocal Google Home posé sur une étagère' },
    {
      src: unsplash('photo-anapPhJFRhM'),
      alt: 'Enceinte connectée et smartphone pour contrôle domotique',
    },
    {
      src: unsplash('photo-nz7z0rNdvyI'),
      alt: 'Écran intelligent Google Nest Hub pour la maison connectée',
    },
  ],

  paysagiste: [
    {
      src: unsplash('photo-B3yix9NT-PQ'),
      alt: 'Jardinier professionnel taillant une haie avec un taille-haie',
    },
    {
      src: unsplash('photo-Vu1GaaPWyTI'),
      alt: 'Paysagiste passant la tondeuse dans un jardin verdoyant',
    },
    {
      src: unsplash('photo-iYDSYuRAI3E'),
      alt: 'Escalier en pierre dans un jardin paysager fleuri',
    },
    {
      src: unsplash('photo-qmRh69t79-A'),
      alt: 'Cascade sur pierres avec fleurs colorées dans un jardin aménagé',
    },
    {
      src: unsplash('photo-iz_t6muEAl8'),
      alt: 'Jardin luxuriant rempli de fleurs vibrantes et colorées',
    },
  ],

  pisciniste: [
    {
      src: unsplash('photo--VOO96lxCH4'),
      alt: 'Jardin avec piscine et terrasse dans une propriété résidentielle',
    },
    {
      src: unsplash('photo-Ntdvds91U2U'),
      alt: 'Piscine de luxe dans un jardin aménagé avec éclairage',
    },
    {
      src: unsplash('photo-WACZrgiESh8'),
      alt: 'Belle piscine avec terrasse et espace détente en extérieur',
    },
    {
      src: unsplash('photo-Uv4zanxy5oM'),
      alt: 'Piscine dans un jardin résidentiel avec vue dégagée',
    },
    {
      src: unsplash('photo-oVnKC7wiQjA'),
      alt: 'Villa tropicale avec piscine éclairée au crépuscule',
    },
    { src: unsplash('photo-08AJKJf75kw'), alt: 'Piscine à débordement avec vue panoramique' },
  ],

  'alarme-securite': [
    { src: unsplash('photo-KNt4zd8HPb0'), alt: 'Caméra de surveillance blanche fixée sur un mur' },
    {
      src: unsplash('photo-OfwiURcZwYw'),
      alt: 'Trois caméras CCTV blanches montées sur un mur extérieur',
    },
    { src: unsplash('photo-AUefYR7RrWc'), alt: 'Caméra de sécurité blanche installée sur un mur' },
    {
      src: unsplash('photo-cJDAgJYQ6i8'),
      alt: 'Caméra de surveillance montée sur un bâtiment en béton',
    },
    {
      src: unsplash('photo-ujSsIk5iZmA'),
      alt: "Caméra de sécurité fixée au plafond d'un bâtiment",
    },
    {
      src: unsplash('photo-zBTYRFCeaS0'),
      alt: 'Caméra de surveillance blanche sur poteau extérieur',
    },
  ],

  platrier: [
    {
      src: unsplash('photo-U7snZ-kAI5M'),
      alt: 'Plaquiste finissant et jointant des murs en placo sur un chantier',
    },
    {
      src: unsplash('photo-xZOSkIEBe04'),
      alt: "Ouvrier travaillant sur les murs d'une maison en construction",
    },
    {
      src: unsplash('photo-bsI70yO-5eU'),
      alt: 'Artisan appliquant un enduit au rouleau sur un mur intérieur',
    },
    {
      src: unsplash('photo-biRt6RXejuk'),
      alt: 'Pièce en cours de rénovation avec outils de plâtrier',
    },
    {
      src: unsplash('photo-EhSPx8KgLZs'),
      alt: "Artisan assemblant et fixant des éléments lors d'une rénovation",
    },
  ],

  antenniste: [
    {
      src: unsplash('photo-s7SQQNgxDkw'),
      alt: "Antenne parabolique installée sur le toit d'une maison",
    },
    {
      src: unsplash('photo-leR_rOq9_hs'),
      alt: 'Antenne de télévision sur un poteau avec ciel en arrière-plan',
    },
    { src: unsplash('photo-WD7Tx9pO87E'), alt: 'Antenne TV sur un poteau en bois sur un toit' },
    { src: unsplash('photo-aCYdXrMqbzU'), alt: 'Toits avec antennes et tours sous un ciel bleu' },
    {
      src: unsplash('photo-vS9eh_707RY'),
      alt: "Toit d'immeuble avec antennes relais contre le ciel bleu",
    },
    {
      src: unsplash('photo-8z8Bo8sbsUg'),
      alt: "Tours d'antennes sur le toit d'un bâtiment urbain",
    },
  ],

  'architecte-interieur': [
    {
      src: unsplash('photo-4r9OKorlcTk'),
      alt: 'Salon moderne minimaliste avec mobilier blanc et parquet',
    },
    {
      src: unsplash('photo-AEXgOReTzoM'),
      alt: 'Salon moderne avec cheminée et décoration minimaliste',
    },
    {
      src: unsplash('photo-bc5D4xrShPQ'),
      alt: 'Salon contemporain épuré avec murs blancs et design élégant',
    },
    {
      src: unsplash('photo-CqAkN-dg_-s'),
      alt: 'Salon moderne avec cheminée suspendue et grandes baies vitrées',
    },
    {
      src: unsplash('photo-NUnjEA9qEHE'),
      alt: 'Salon moderne avec canapé en cuir et cheminée design',
    },
    {
      src: unsplash('photo-yxO8YG082v8'),
      alt: 'Salon contemporain avec canapé sectionnel et grande fenêtre',
    },
  ],

  ascensoriste: [
    {
      src: unsplash('photo-m01bajOe8E0'),
      alt: "Porte d'ascenseur en acier inoxydable avec boutons d'appel",
    },
    {
      src: unsplash('photo-SHcQ-AOLI9M'),
      alt: 'Ascenseur moderne avec porte ouverte dans un immeuble',
    },
    {
      src: unsplash('photo-713E0LsFGz0'),
      alt: "Hall d'ascenseur moderne avec accents de marbre et verre",
    },
    {
      src: unsplash('photo-tUcVQwXsNck'),
      alt: "Lobby moderne avec ascenseurs et bureau d'accueil",
    },
    { src: unsplash('photo-b08Pe9MV_eU'), alt: "Hall d'immeuble avec ascenseurs en acier poli" },
    {
      src: unsplash('photo-sk4HZAiE5RA'),
      alt: "Vue intérieure d'une cage d'ascenseur impressionnante",
    },
    {
      src: unsplash('photo-dendZhhfkTc'),
      alt: "Ascenseur fermé dans un couloir d'immeuble moderne",
    },
  ],

  'borne-recharge': [
    {
      src: unsplash('photo-Bf76Nnc8IR4'),
      alt: 'Voiture électrique branchée à une borne de recharge wallbox',
    },
    {
      src: unsplash('photo-ej4-qT-4VPY'),
      alt: 'Véhicule électrique en charge sur une borne résidentielle',
    },
    {
      src: unsplash('photo-wRosknwzpuM'),
      alt: "Homme branchant le câble de recharge d'un véhicule électrique",
    },
    {
      src: unsplash('photo-vpZIG1bI3Wc'),
      alt: 'Voiture électrique branchée à une station de recharge moderne',
    },
    {
      src: unsplash('photo-qf7G8xBtYhc'),
      alt: 'Véhicule électrique en cours de recharge à une borne publique',
    },
    {
      src: unsplash('photo-HeWrUlV5JSo'),
      alt: 'Voiture électrique connectée à un chargeur domestique',
    },
  ],

  decorateur: [
    {
      src: unsplash('photo-54MpIUI9nlQ'),
      alt: 'Décorateur appliquant de la peinture au rouleau sur un mur',
    },
    {
      src: unsplash('photo-rMVjOX8nm2U'),
      alt: "Personne peignant un mur avec un rouleau lors d'une rénovation",
    },
    { src: unsplash('photo-57ldq9age5U'), alt: 'Artisan peintre décorant un mur au rouleau' },
    {
      src: unsplash('photo-ZHlyRT5u0bM'),
      alt: 'Ouvrier utilisant un rouleau à peinture pour rénover un mur',
    },
    {
      src: unsplash('photo-FI4ZN6aaWQ0'),
      alt: 'Salon cosy avec canapé sectionnel et décoration chaleureuse',
    },
    {
      src: unsplash('photo-CCQi3pV95k0'),
      alt: 'Salon moderne avec fauteuils en cuir et cheminée décorative',
    },
  ],

  demenageur: [
    {
      src: unsplash('photo-ctXcNX1b4Oo'),
      alt: 'Déménageur chargeant des cartons dans un camion de déménagement',
    },
    {
      src: unsplash('photo-vV5iOAidkQE'),
      alt: 'Couple portant des cartons de déménagement dans leur nouveau logement',
    },
    {
      src: unsplash('photo-41S8eu6nImg'),
      alt: "Couple heureux avec cartons et plantes lors d'un déménagement",
    },
    {
      src: unsplash('photo-x8l4lN6-xd0'),
      alt: 'Couple emménageant dans leur nouvelle maison avec les clés',
    },
    {
      src: unsplash('photo-KqqKF9lDg8Q'),
      alt: 'Couple portant des cartons dans leur nouveau logement',
    },
    {
      src: unsplash('photo-XFRiOwXEH4E'),
      alt: 'Jeune homme tenant des cartons de déménagement vu du dessus',
    },
  ],

  deratisation: [
    {
      src: unsplash('photo-MPI00FHFKH4'),
      alt: 'Technicien en combinaison pulvérisant du pesticide avec un appareil',
    },
    {
      src: unsplash('photo-r_9acX8AORw'),
      alt: 'Professionnel en combinaison de protection pulvérisant du désinfectant',
    },
    {
      src: unsplash('photo-W1SSt1G6L80'),
      alt: 'Homme pulvérisant du pesticide sur un terrain pour traitement',
    },
    {
      src: unsplash('photo-iGk1LsIiNWY'),
      alt: "Techniciens en tenue de protection pulvérisant de l'insecticide",
    },
  ],
}
