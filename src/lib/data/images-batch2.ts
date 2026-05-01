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
}
