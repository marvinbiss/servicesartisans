interface InternalLink {
  text: string
  href: string
}

/**
 * Maps keywords found in article slugs and tags to their corresponding
 * service pages. Used to generate contextual "Services associés" links.
 */
const serviceMapping: Record<string, { slug: string; label: string }> = {
  // Plombier / Plomberie
  plombier: { slug: 'plombier', label: 'plombier' },
  plomberie: { slug: 'plombier', label: 'plombier' },
  canalisations: { slug: 'plombier', label: 'plombier' },
  // Électricien / Électricité
  électricien: { slug: 'electricien', label: 'électricien' },
  electricien: { slug: 'electricien', label: 'électricien' },
  électricité: { slug: 'electricien', label: 'électricien' },
  electricite: { slug: 'electricien', label: 'électricien' },
  // Serrurier / Serrurerie
  serrurier: { slug: 'serrurier', label: 'serrurier' },
  serrurerie: { slug: 'serrurier', label: 'serrurier' },
  serrure: { slug: 'serrurier', label: 'serrurier' },
  // Chauffagiste / Chauffage
  chauffagiste: { slug: 'chauffagiste', label: 'chauffagiste' },
  chauffage: { slug: 'chauffagiste', label: 'chauffagiste' },
  chaudière: { slug: 'chauffagiste', label: 'chauffagiste' },
  chaudiere: { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe à chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe-a-chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  // Menuisier / Menuiserie
  menuisier: { slug: 'menuisier', label: 'menuisier' },
  menuiserie: { slug: 'menuisier', label: 'menuisier' },
  fenêtre: { slug: 'menuisier', label: 'menuisier' },
  fenêtres: { slug: 'menuisier', label: 'menuisier' },
  fenetres: { slug: 'menuisier', label: 'menuisier' },
  // Carreleur / Carrelage
  carreleur: { slug: 'carreleur', label: 'carreleur' },
  carrelage: { slug: 'carreleur', label: 'carreleur' },
  // Couvreur / Toiture
  couvreur: { slug: 'couvreur', label: 'couvreur' },
  toiture: { slug: 'couvreur', label: 'couvreur' },
  couverture: { slug: 'couvreur', label: 'couvreur' },
  // Peintre en bâtiment
  peintre: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  peinture: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  ravalement: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  façade: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  // Maçon / Maçonnerie
  maçon: { slug: 'macon', label: 'maçon' },
  macon: { slug: 'macon', label: 'maçon' },
  maçonnerie: { slug: 'macon', label: 'maçon' },
  maconnerie: { slug: 'macon', label: 'maçon' },
  'gros œuvre': { slug: 'macon', label: 'maçon' },
  // Climaticien / Climatisation
  climaticien: { slug: 'climaticien', label: 'climaticien' },
  climatisation: { slug: 'climaticien', label: 'climaticien' },
  'pac air-air': { slug: 'climaticien', label: 'climaticien' },
  // Vitrier
  vitrier: { slug: 'vitrier', label: 'vitrier' },
  vitrerie: { slug: 'vitrier', label: 'vitrier' },
  vitrage: { slug: 'vitrier', label: 'vitrier' },
  'double vitrage': { slug: 'vitrier', label: 'vitrier' },
  // Cuisiniste
  cuisiniste: { slug: 'cuisiniste', label: 'cuisiniste' },
  cuisine: { slug: 'cuisiniste', label: 'cuisiniste' },
  // Charpentier
  charpentier: { slug: 'charpentier', label: 'charpentier' },
  charpente: { slug: 'charpentier', label: 'charpentier' },
  // Zingueur
  zingueur: { slug: 'zingueur', label: 'zingueur' },
  zinguerie: { slug: 'zingueur', label: 'zingueur' },
  gouttière: { slug: 'zingueur', label: 'zingueur' },
  gouttiere: { slug: 'zingueur', label: 'zingueur' },
  // Étanchéiste
  étanchéiste: { slug: 'etancheiste', label: 'étanchéiste' },
  etancheiste: { slug: 'etancheiste', label: 'étanchéiste' },
  étanchéité: { slug: 'etancheiste', label: 'étanchéiste' },
  etancheite: { slug: 'etancheiste', label: 'étanchéiste' },
  // Façadier
  façadier: { slug: 'facadier', label: 'façadier' },
  facadier: { slug: 'facadier', label: 'façadier' },
  enduit: { slug: 'facadier', label: 'façadier' },
  // Plâtrier
  plâtrier: { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  platrier: { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  plaquiste: { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  placo: { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  // Salle de bain
  'salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'salle-de-bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  // Pompe à chaleur (distinct du chauffagiste)
  'installateur pac': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  // Panneaux solaires
  'panneaux solaires': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'panneau solaire': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  photovoltaïque: { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  photovoltaique: { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  // Isolation thermique
  isolation: { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation thermique': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  isolant: { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  // Rénovation énergétique
  'rénovation énergétique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  'renovation-energetique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  // Borne de recharge
  'borne de recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'borne-recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  irve: { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  // Ramoneur
  ramoneur: { slug: 'ramoneur', label: 'ramoneur' },
  ramonage: { slug: 'ramoneur', label: 'ramoneur' },
  // Diagnostiqueur
  diagnostiqueur: { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic immobilier': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  dpe: { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  // Ébéniste
  ébéniste: { slug: 'ebeniste', label: 'ébéniste' },
  ebeniste: { slug: 'ebeniste', label: 'ébéniste' },
  ébénisterie: { slug: 'ebeniste', label: 'ébéniste' },
  ebenisterie: { slug: 'ebeniste', label: 'ébéniste' },
  'meuble sur mesure': { slug: 'ebeniste', label: 'ébéniste' },
  'restauration meuble': { slug: 'ebeniste', label: 'ébéniste' },
  marqueterie: { slug: 'ebeniste', label: 'ébéniste' },
  'bois massif': { slug: 'ebeniste', label: 'ébéniste' },
  // Pivot pure-play BTP énergétique 2026-05-02 :
  // Mots-clés paysagiste/jardinier/nettoyage/alarme/déménageur retirés
  // (slugs services supprimés du catalogue).
  // Plâtrier — mots-clés supplémentaires (slug correct : platrier)
  plâtre: { slug: 'platrier', label: 'plâtrier plaquiste' },
  platre: { slug: 'platrier', label: 'plâtrier plaquiste' },
  cloison: { slug: 'platrier', label: 'plâtrier plaquiste' },
  'faux plafond': { slug: 'platrier', label: 'plâtrier plaquiste' },
  doublage: { slug: 'platrier', label: 'plâtrier plaquiste' },
  // Diagnostiqueur — mots-clés supplémentaires (slug correct : diagnostiqueur)
  'diagnostic amiante': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic termites': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic plomb': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic gaz': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic électricité': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic electricite': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  // Plombier — mots-clés supplémentaires
  "fuite d'eau": { slug: 'plombier', label: 'plombier' },
  robinet: { slug: 'plombier', label: 'plombier' },
  'chauffe-eau': { slug: 'plombier', label: 'plombier' },
  "ballon d'eau chaude": { slug: 'plombier', label: 'plombier' },
  cumulus: { slug: 'plombier', label: 'plombier' },
  débouchage: { slug: 'plombier', label: 'plombier' },
  debouchage: { slug: 'plombier', label: 'plombier' },
  // Électricien — mots-clés supplémentaires
  'tableau électrique': { slug: 'electricien', label: 'électricien' },
  'tableau electrique': { slug: 'electricien', label: 'électricien' },
  'prise électrique': { slug: 'electricien', label: 'électricien' },
  'prise electrique': { slug: 'electricien', label: 'électricien' },
  câblage: { slug: 'electricien', label: 'électricien' },
  cablage: { slug: 'electricien', label: 'électricien' },
  'mise aux normes électriques': { slug: 'electricien', label: 'électricien' },
  'mise aux normes electriques': { slug: 'electricien', label: 'électricien' },
  // Serrurier — mots-clés supplémentaires
  'blindage de porte': { slug: 'serrurier', label: 'serrurier' },
  'porte blindée': { slug: 'serrurier', label: 'serrurier' },
  'porte blindee': { slug: 'serrurier', label: 'serrurier' },
  cylindre: { slug: 'serrurier', label: 'serrurier' },
  verrou: { slug: 'serrurier', label: 'serrurier' },
  // Chauffagiste — mots-clés supplémentaires
  radiateur: { slug: 'chauffagiste', label: 'chauffagiste' },
  'plancher chauffant': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chauffe-eau thermodynamique': { slug: 'chauffagiste', label: 'chauffagiste' },
  'entretien chaudière': { slug: 'chauffagiste', label: 'chauffagiste' },
  'entretien chaudiere': { slug: 'chauffagiste', label: 'chauffagiste' },
  // Menuisier — mots-clés supplémentaires
  porte: { slug: 'menuisier', label: 'menuisier' },
  'volet bois': { slug: 'menuisier', label: 'menuisier' },
  'escalier bois': { slug: 'menuisier', label: 'menuisier' },
  'aménagement placard': { slug: 'menuisier', label: 'menuisier' },
  'amenagement placard': { slug: 'menuisier', label: 'menuisier' },
  dressing: { slug: 'menuisier', label: 'menuisier' },
  // Carreleur — mots-clés supplémentaires
  faïence: { slug: 'carreleur', label: 'carreleur' },
  faience: { slug: 'carreleur', label: 'carreleur' },
  mosaïque: { slug: 'carreleur', label: 'carreleur' },
  mosaique: { slug: 'carreleur', label: 'carreleur' },
  'pose de carrelage': { slug: 'carreleur', label: 'carreleur' },
  'carreaux de ciment': { slug: 'carreleur', label: 'carreleur' },
  // Couvreur — mots-clés supplémentaires
  ardoise: { slug: 'couvreur', label: 'couvreur' },
  tuile: { slug: 'couvreur', label: 'couvreur' },
  'réfection toiture': { slug: 'couvreur', label: 'couvreur' },
  'refection toiture': { slug: 'couvreur', label: 'couvreur' },
  chéneau: { slug: 'couvreur', label: 'couvreur' },
  cheneau: { slug: 'couvreur', label: 'couvreur' },
  // Maçon — mots-clés supplémentaires
  fondation: { slug: 'macon', label: 'maçon' },
  'dalle béton': { slug: 'macon', label: 'maçon' },
  'dalle beton': { slug: 'macon', label: 'maçon' },
  parpaing: { slug: 'macon', label: 'maçon' },
  'mur porteur': { slug: 'macon', label: 'maçon' },
  'extension maison': { slug: 'macon', label: 'maçon' },
  // Climaticien — mots-clés supplémentaires
  clim: { slug: 'climaticien', label: 'climaticien' },
  'clim réversible': { slug: 'climaticien', label: 'climaticien' },
  'clim reversible': { slug: 'climaticien', label: 'climaticien' },
  vmc: { slug: 'climaticien', label: 'climaticien' },
  ventilation: { slug: 'climaticien', label: 'climaticien' },
  // Cuisiniste — mots-clés supplémentaires
  'cuisine équipée': { slug: 'cuisiniste', label: 'cuisiniste' },
  'cuisine equipee': { slug: 'cuisiniste', label: 'cuisiniste' },
  'plan de travail': { slug: 'cuisiniste', label: 'cuisiniste' },
  'ilot central': { slug: 'cuisiniste', label: 'cuisiniste' },
  'aménagement cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  'amenagement cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  // Charpentier — mots-clés supplémentaires
  fermette: { slug: 'charpentier', label: 'charpentier' },
  'ossature bois': { slug: 'charpentier', label: 'charpentier' },
  combles: { slug: 'charpentier', label: 'charpentier' },
  'toiture bois': { slug: 'charpentier', label: 'charpentier' },
  'charpente traditionnelle': { slug: 'charpentier', label: 'charpentier' },
  // Zingueur — mots-clés supplémentaires
  zinc: { slug: 'zingueur', label: 'zingueur' },
  noue: { slug: 'zingueur', label: 'zingueur' },
  'descente eau': { slug: 'zingueur', label: 'zingueur' },
  'descente eaux pluviales': { slug: 'zingueur', label: 'zingueur' },
  // Étanchéiste — mots-clés supplémentaires
  'toiture terrasse': { slug: 'etancheiste', label: 'étanchéiste' },
  'membrane étanchéité': { slug: 'etancheiste', label: 'étanchéiste' },
  'membrane etancheite': { slug: 'etancheiste', label: 'étanchéiste' },
  bitume: { slug: 'etancheiste', label: 'étanchéiste' },
  infiltration: { slug: 'etancheiste', label: 'étanchéiste' },
  // Façadier — mots-clés supplémentaires
  crépi: { slug: 'facadier', label: 'façadier' },
  crepi: { slug: 'facadier', label: 'façadier' },
  'ravalement façade': { slug: 'facadier', label: 'façadier' },
  'ravalement facade': { slug: 'facadier', label: 'façadier' },
  ite: { slug: 'facadier', label: 'façadier' },
  'isolation extérieure': { slug: 'facadier', label: 'façadier' },
  'isolation exterieure': { slug: 'facadier', label: 'façadier' },
  // Salle de bain — mots-clés supplémentaires
  douche: { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  baignoire: { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'rénovation salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'renovation salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'douche italienne': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  // Pompe à chaleur — mots-clés supplémentaires
  pac: { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'pac air-eau': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  géothermie: { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  geothermie: { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  aérothermie: { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  aerothermie: { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  // Panneaux solaires — mots-clés supplémentaires
  solaire: { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  autoconsommation: { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  onduleur: { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'micro-onduleur': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  // Isolation thermique — mots-clés supplémentaires
  'laine de verre': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'laine de roche': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation combles': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation murs': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation phonique': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'ouate de cellulose': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  // Rénovation énergétique — mots-clés supplémentaires
  'audit énergétique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  'audit energetique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  maprimerénov: { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  maprimerenov: { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  cee: { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'performance énergétique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  'performance energetique': {
    slug: 'renovation-energetique',
    label: 'spécialiste rénovation énergétique',
  },
  // Borne de recharge — mots-clés supplémentaires
  'véhicule électrique': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'vehicule electrique': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  wallbox: { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'recharge voiture': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  // Ramoneur — mots-clés supplémentaires
  cheminée: { slug: 'ramoneur', label: 'ramoneur' },
  cheminee: { slug: 'ramoneur', label: 'ramoneur' },
  'conduit fumée': { slug: 'ramoneur', label: 'ramoneur' },
  'conduit fumee': { slug: 'ramoneur', label: 'ramoneur' },
  'poêle à bois': { slug: 'ramoneur', label: 'ramoneur' },
  'poele a bois': { slug: 'ramoneur', label: 'ramoneur' },
  // Peintre en bâtiment — mots-clés supplémentaires
  tapisserie: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'papier peint': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'enduit décoratif': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'enduit decoratif': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  lasure: { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  // Vitrier — mots-clés supplémentaires
  'triple vitrage': { slug: 'vitrier', label: 'vitrier' },
  'fenêtre cassée': { slug: 'vitrier', label: 'vitrier' },
  'fenetre cassee': { slug: 'vitrier', label: 'vitrier' },
  'remplacement vitre': { slug: 'vitrier', label: 'vitrier' },
}

/**
 * Top 20 villes françaises par population pour le maillage interne local.
 */
const TOP_20_CITIES: { name: string; slug: string }[] = [
  { name: 'Paris', slug: 'paris' },
  { name: 'Marseille', slug: 'marseille' },
  { name: 'Lyon', slug: 'lyon' },
  { name: 'Toulouse', slug: 'toulouse' },
  { name: 'Nice', slug: 'nice' },
  { name: 'Nantes', slug: 'nantes' },
  { name: 'Montpellier', slug: 'montpellier' },
  { name: 'Strasbourg', slug: 'strasbourg' },
  { name: 'Bordeaux', slug: 'bordeaux' },
  { name: 'Lille', slug: 'lille' },
  { name: 'Rennes', slug: 'rennes' },
  { name: 'Reims', slug: 'reims' },
  { name: 'Saint-Étienne', slug: 'saint-etienne' },
  { name: 'Toulon', slug: 'toulon' },
  { name: 'Le Havre', slug: 'le-havre' },
  { name: 'Grenoble', slug: 'grenoble' },
  { name: 'Dijon', slug: 'dijon' },
  { name: 'Angers', slug: 'angers' },
  { name: 'Nîmes', slug: 'nimes' },
  { name: 'Clermont-Ferrand', slug: 'clermont-ferrand' },
]

/**
 * Maps "service + ville" keyword patterns to local service pages.
 * Covers the 10 most searched services × 20 largest French cities = 200 entries.
 * Used to generate links to /services/[service]/[ville] pages (pSEO).
 */
const localServiceMapping: Record<
  string,
  { serviceSlug: string; citySlug: string; label: string; cityName: string }
> = (() => {
  const TOP_10_SERVICES = [
    { slug: 'plombier', label: 'plombier', keywords: ['plombier'] },
    { slug: 'electricien', label: 'électricien', keywords: ['electricien', 'électricien'] },
    { slug: 'serrurier', label: 'serrurier', keywords: ['serrurier'] },
    { slug: 'chauffagiste', label: 'chauffagiste', keywords: ['chauffagiste'] },
    { slug: 'peintre-en-batiment', label: 'peintre en bâtiment', keywords: ['peintre'] },
    { slug: 'menuisier', label: 'menuisier', keywords: ['menuisier'] },
    { slug: 'macon', label: 'maçon', keywords: ['macon', 'maçon'] },
    { slug: 'couvreur', label: 'couvreur', keywords: ['couvreur'] },
    { slug: 'carreleur', label: 'carreleur', keywords: ['carreleur'] },
    { slug: 'platrier-plaquiste', label: 'plaquiste', keywords: ['plaquiste'] },
  ]

  const mapping: Record<
    string,
    { serviceSlug: string; citySlug: string; label: string; cityName: string }
  > = {}

  for (const service of TOP_10_SERVICES) {
    for (const city of TOP_20_CITIES) {
      for (const keyword of service.keywords) {
        // "plombier paris", "électricien lyon", etc.
        const key = `${keyword} ${city.slug}`
        mapping[key] = {
          serviceSlug: service.slug,
          citySlug: city.slug,
          label: service.label,
          cityName: city.name,
        }
        // Also match with city name in lowercase (e.g. "plombier saint-étienne")
        const cityNameLower = city.name.toLowerCase()
        if (cityNameLower !== city.slug) {
          const keyName = `${keyword} ${cityNameLower}`
          mapping[keyName] = {
            serviceSlug: service.slug,
            citySlug: city.slug,
            label: service.label,
            cityName: city.name,
          }
        }
      }
    }
  }

  return mapping
})()

/**
 * Determines which service pages are relevant for a given article
 * based on its slug, category and tags.
 */
export function getRelatedServiceLinks(
  slug: string,
  category: string,
  tags: string[]
): InternalLink[] {
  const links: InternalLink[] = []
  const addedSlugs = new Set<string>()
  const addedLocalKeys = new Set<string>()

  // Build search terms from the slug (split on hyphens) and lowered tags
  const slugWords = slug.toLowerCase()
  const searchTerms = [slugWords, ...tags.map((t) => t.toLowerCase())]

  let firstServiceSlug: string | null = null

  for (const term of searchTerms) {
    // 1. Check local service×ville mappings first (more specific = higher priority)
    for (const [keyword, local] of Object.entries(localServiceMapping)) {
      const localKey = `${local.serviceSlug}/${local.citySlug}`
      if (term.includes(keyword) && !addedLocalKeys.has(localKey)) {
        const capitalizedLabel = local.label.charAt(0).toUpperCase() + local.label.slice(1)
        links.push({
          text: `${capitalizedLabel} à ${local.cityName}`,
          href: `/services/${local.serviceSlug}/${local.citySlug}`,
        })
        addedLocalKeys.add(localKey)
        // Also mark the service as added so we don't duplicate the generic link
        addedSlugs.add(local.serviceSlug)
      }
    }

    // 2. Check generic service mappings
    for (const [keyword, service] of Object.entries(serviceMapping)) {
      if (term.includes(keyword) && !addedSlugs.has(service.slug)) {
        links.push({
          text: `Trouver un ${service.label} qualifié`,
          href: `/services/${service.slug}`,
        })
        // Add tarifs link for each matched service
        links.push({
          text: `Tarifs ${service.label}`,
          href: `/tarifs/${service.slug}`,
        })
        // Add top-city variants for the first matched service only (5 cities for breadth)
        if (!firstServiceSlug) {
          firstServiceSlug = service.slug
          const citiesToShow = TOP_20_CITIES.slice(0, 5)
          for (const city of citiesToShow) {
            const localKey = `${service.slug}/${city.slug}`
            if (!addedLocalKeys.has(localKey)) {
              links.push({
                text: `${service.label.charAt(0).toUpperCase() + service.label.slice(1)} à ${city.name}`,
                href: `/services/${service.slug}/${city.slug}`,
              })
              addedLocalKeys.add(localKey)
            }
          }
        }
        addedSlugs.add(service.slug)
      }
    }
  }

  // Always add devis link for Tarifs articles
  if (category === 'Tarifs') {
    links.push({ text: 'Obtenir mon devis gratuit', href: '/devis' })
  }

  // Add general links based on category
  if (category === 'Réglementation' || category === 'Aides & Subventions') {
    links.push({ text: 'Comment ça marche ?', href: '/comment-ca-marche' })
  }

  if (category === 'Fiches métier') {
    links.push({ text: 'Devenir artisan partenaire', href: '/inscription-artisan' })
  }

  // Add urgence link when relevant
  if (
    tags.some((t) => t.toLowerCase() === 'urgence') ||
    slug.includes('urgence') ||
    slug.includes('depannage')
  ) {
    links.push({ text: 'Artisan en urgence', href: '/urgence' })
  }

  // Limit to 8 links max (services + tarifs + city variants)
  return links.slice(0, 8)
}

interface ArticleMeta {
  category: string
  tags: string[]
  title: string
  readTime?: string
}

/**
 * Scores and selects the most relevant related articles based on
 * shared category and overlapping tags.
 */
export function getRelatedArticleSlugs(
  currentSlug: string,
  category: string,
  tags: string[],
  allSlugs: string[],
  allArticlesMap: Record<string, ArticleMeta>
): { slug: string; title: string; category: string; readTime: string }[] {
  const currentTags = tags.map((t) => t.toLowerCase())

  const scored = allSlugs
    .filter((s) => s !== currentSlug)
    .map((s) => {
      const article = allArticlesMap[s]
      if (!article) return { slug: s, title: '', category: '', readTime: '', score: 0 }

      let score = 0

      // Same category => +2
      if (article.category === category) score += 2

      // Each overlapping tag => +3
      const articleTags = article.tags.map((t) => t.toLowerCase())
      for (const tag of articleTags) {
        if (currentTags.includes(tag)) score += 3
      }

      return {
        slug: s,
        title: article.title,
        category: article.category,
        readTime: article.readTime || '',
        score,
      }
    })
    .filter((s) => s.score > 0 && s.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return scored
}
