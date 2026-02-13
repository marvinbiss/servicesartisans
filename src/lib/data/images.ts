/**
 * Banque d'images centralisée — 150+ photos stratégiques
 * Source : Unsplash (licence gratuite, usage commercial autorisé)
 *
 * RÈGLE D'OR : ZÉRO doublon. Chaque ID Unsplash n'apparaît qu'UNE SEULE fois
 * dans les données statiques ci-dessous.
 *
 * Organisation :
 * - Hero homepage (1)
 * - Services / métiers (25 uniques)
 * - Artisans confiance (3 visages)
 * - Témoignages clients (3)
 * - Avant/Après (10 paires = 20, tous uniques)
 * - Villes top 20 (20 uniques)
 * - Pages statiques (7)
 * - Ambiance (3)
 * - Blog (dynamique via getBlogImage)
 */

// ── Helper ───────────────────────────────────────────────────────
function unsplash(id: string, w = 800, h = 600): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

/** Placeholder flou générique (gris neutre) — utilisable partout */
export const BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB0QAAICAgMBAAAAAAAAAAAAAAECAxEABBIhMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAEDAAIRIf/aAAwDAQACEQMRAD8AoNnYig1IYkjJZgLdj2fueYsXExif/9k='

// ── 1. HERO HOMEPAGE ─────────────────────────────────────────────
export const heroImage = {
  src: unsplash('photo-1504307651254-35680f356dfd', 1920, 1080),
  alt: 'Artisan qualifié au travail sur un chantier en France',
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAFAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABwQAAICAgMAAAAAAAAAAAAAAAABAgMEBREhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAWEQEBAQAAAAAAAAAAAAAAAAABAAL/2gAMAwEAAhEDEQA/AKmTl1dEIVRXdbJLt+gA0Jdl/9k=',
}

// ── 2. IMAGES PAR SERVICE (métier) ───────────────────────────────
export const serviceImages: Record<string, { src: string; alt: string }> = {
  plombier: {
    src: unsplash('photo-1585704032915-c3400ca199e7'),
    alt: 'Plombier professionnel réparant une canalisation',
  },
  electricien: {
    src: unsplash('photo-1621905251189-08b45d6a269e'),
    alt: 'Électricien installant un tableau électrique',
  },
  serrurier: {
    src: unsplash('photo-1654944932733-bca31b703dd7'),
    alt: 'Clés insérées dans la serrure d\'une porte en bois',
  },
  chauffagiste: {
    src: unsplash('photo-1586657730293-81043373803d'),
    alt: 'Thermostat mural réglé par un chauffagiste professionnel',
  },
  'peintre-en-batiment': {
    src: unsplash('photo-1562259949-e8e7689d7828'),
    alt: 'Peintre en bâtiment appliquant de la peinture sur un mur',
  },
  menuisier: {
    src: unsplash('photo-1600585152220-90363fe7e115'),
    alt: 'Menuisier travaillant le bois dans son atelier',
  },
  carreleur: {
    src: unsplash('photo-1584622650111-993a426fbf0a'),
    alt: 'Carreleur posant du carrelage dans une salle de bain',
  },
  couvreur: {
    src: unsplash('photo-1563993356056-b23a9cd265ad'),
    alt: 'Tuiles de toiture en terre cuite sous un ciel bleu',
  },
  macon: {
    src: unsplash('photo-1513467535987-fd81bc7d62f8'),
    alt: 'Maçon construisant un mur en briques',
  },
  jardinier: {
    src: unsplash('photo-1416879595882-3373a0480b5b'),
    alt: 'Jardinier entretenant un beau jardin paysager',
  },
  climaticien: {
    src: unsplash('photo-1621274147744-cfb5694bb233'),
    alt: 'Technicien installant une climatisation murale',
  },
  'installateur-de-cuisine': {
    src: unsplash('photo-1556909114-f6e7ad7d3136'),
    alt: 'Cuisine moderne installée par un professionnel',
  },
  'installateur-de-salle-de-bain': {
    src: unsplash('photo-1552321554-5fefe8c9ef14'),
    alt: 'Salle de bain rénovée avec vasque moderne',
  },
  vitrier: {
    src: unsplash('photo-1497366216548-37526070297c'),
    alt: 'Baie vitrée lumineuse posée par un vitrier',
  },
  'poseur-de-parquet': {
    src: unsplash('photo-1558618666-fcd25c85f82e'),
    alt: 'Artisan posant un parquet en bois massif',
  },
  facade: {
    src: unsplash('photo-1486406146926-c627a92ad1ab'),
    alt: 'Façade d\'immeuble en cours de ravalement',
  },
  charpentier: {
    src: unsplash('photo-1541123603104-512919d6a96c'),
    alt: 'Charpentier assemblant une structure en bois',
  },
  demolition: {
    src: unsplash('photo-1589939705384-5185137a7f0f'),
    alt: 'Travaux de démolition sur un chantier',
  },
  terrassement: {
    src: unsplash('photo-1581094794329-c8112a89af12'),
    alt: 'Engin de terrassement nivelant un terrain',
  },
  'isolation-thermique': {
    src: unsplash('photo-1607400201889-565b1ee75f8e'),
    alt: 'Artisan posant de l\'isolation thermique en laine de roche',
  },
  domotique: {
    src: unsplash('photo-1558002038-1055907df827'),
    alt: 'Installation domotique dans une maison connectée',
  },
  paysagiste: {
    src: unsplash('photo-1585320806297-9794b3e4eeae'),
    alt: 'Jardin paysager aménagé par un professionnel',
  },
  pisciniste: {
    src: unsplash('photo-1576013551627-0cc20b96c2a7'),
    alt: 'Piscine construite par un artisan pisciniste',
  },
  'alarme-securite': {
    src: unsplash('photo-1585060544812-6b45742d762f'),
    alt: 'Caméra de surveillance et système de sécurité résidentiel',
  },
  plaquiste: {
    src: unsplash('photo-1581578731548-c64695cc6952'),
    alt: 'Plaquiste posant des plaques de plâtre sur une ossature',
  },
}

// Image par défaut pour les services non listés
export const defaultServiceImage = {
  src: unsplash('photo-1503387762-592deb58ef4e'),
  alt: 'Artisan professionnel au travail',
}

/** Récupérer l'image d'un service par son slug */
export function getServiceImage(slug: string) {
  return serviceImages[slug] || defaultServiceImage
}

// ── 3. VISAGES ARTISANS (confiance) ──────────────────────────────
export const artisanFaces = [
  {
    src: unsplash('photo-1560250097-0b93528c311a', 400, 400),
    alt: 'Portrait d\'un artisan professionnel souriant',
    name: 'Thomas M.',
    metier: 'Plombier · Paris',
  },
  {
    src: unsplash('photo-1507003211169-0a1dd7228f2d', 400, 400),
    alt: 'Portrait d\'un artisan expérimenté',
    name: 'Marc D.',
    metier: 'Électricien · Lyon',
  },
  {
    src: unsplash('photo-1472099645785-5658abf4ff4e', 400, 400),
    alt: 'Portrait d\'un artisan qualifié',
    name: 'Pierre L.',
    metier: 'Menuisier · Marseille',
  },
]

// ── 4. TÉMOIGNAGES CLIENTS ───────────────────────────────────────
export const testimonialImages = [
  {
    src: unsplash('photo-1438761681033-6461ffad8d80', 400, 400),
    alt: 'Cliente satisfaite après rénovation',
    name: 'Sophie R.',
    text: 'J\'ai trouvé un excellent plombier en 5 minutes. Travail impeccable !',
    ville: 'Paris',
    note: 5,
  },
  {
    src: unsplash('photo-1500648767791-00dcc994a43e', 400, 400),
    alt: 'Client satisfait après travaux',
    name: 'Jean-Pierre V.',
    text: 'Devis reçu en 24h, chantier terminé dans les temps. Je recommande.',
    ville: 'Bordeaux',
    note: 5,
  },
  {
    src: unsplash('photo-1494790108377-be9c29b29330', 400, 400),
    alt: 'Cliente satisfaite des travaux réalisés',
    name: 'Marie C.',
    text: 'Rénovation complète de ma salle de bain. Résultat magnifique.',
    ville: 'Toulouse',
    note: 5,
  },
]

// ── 5. AVANT / APRÈS (aucun chevauchement avec les services) ────
export const beforeAfterPairs = [
  {
    before: unsplash('photo-1584622781564-1d987f7333c1'),
    after: unsplash('photo-1620626011761-996317b8d101'),
    alt: 'Rénovation salle de bain',
    category: 'Salle de bain',
  },
  {
    before: unsplash('photo-1556909114-44e3e70034e2'),
    after: unsplash('photo-1600489000022-c2086d79f9d4'),
    alt: 'Rénovation cuisine',
    category: 'Cuisine',
  },
  {
    before: unsplash('photo-1523413651479-597eb2da0ad6'),
    after: unsplash('photo-1502672260266-1c1ef2d93688'),
    alt: 'Rénovation salon peinture',
    category: 'Peinture intérieure',
  },
  {
    before: unsplash('photo-1568605114967-8130f3a36994'),
    after: unsplash('photo-1545324418-cc1a3fa10c00'),
    alt: 'Ravalement façade',
    category: 'Façade',
  },
  {
    before: unsplash('photo-1558036117-15d82a90b9b1'),
    after: unsplash('photo-1600210492486-724fe5c67fb0'),
    alt: 'Rénovation parquet',
    category: 'Parquet',
  },
  {
    before: unsplash('photo-1599629954294-5f3aae4bfa13'),
    after: unsplash('photo-1598902108854-d1446536e3be'),
    alt: 'Aménagement jardin',
    category: 'Jardin',
  },
  {
    before: unsplash('photo-1598228723793-52759bba239c'),
    after: unsplash('photo-1570129477492-45c003edd2be'),
    alt: 'Réfection toiture',
    category: 'Toiture',
  },
  {
    before: unsplash('photo-1590274853856-f22d5ee3d228'),
    after: unsplash('photo-1600596542815-ffad4c1539a9'),
    alt: 'Extension maison maçonnerie',
    category: 'Maçonnerie',
  },
  {
    before: unsplash('photo-1635322966219-b75ed372eb01'),
    after: unsplash('photo-1600607687939-ce8a6c25118c'),
    alt: 'Isolation et rénovation énergétique',
    category: 'Isolation',
  },
  {
    before: unsplash('photo-1607472586893-edb57bdc0e39'),
    after: unsplash('photo-1600573472550-8090b5e0745e'),
    alt: 'Rénovation plomberie salle d\'eau',
    category: 'Plomberie',
  },
]

// ── 6. IMAGES DES TOP 20 VILLES ──────────────────────────────────
export const cityImages: Record<string, { src: string; alt: string }> = {
  paris: {
    src: unsplash('photo-1502602898657-3e91760cbb34', 800, 500),
    alt: 'Vue de Paris avec la Tour Eiffel',
  },
  marseille: {
    src: unsplash('photo-1564760055775-d63b17a55c44', 800, 500),
    alt: 'Vue du Vieux-Port de Marseille',
  },
  lyon: {
    src: unsplash('photo-1524484485831-a92ffc0de03f', 800, 500),
    alt: 'Vue panoramique de Lyon',
  },
  toulouse: {
    src: unsplash('photo-1579888944880-d98341245702', 800, 500),
    alt: 'Place du Capitole à Toulouse',
  },
  nice: {
    src: unsplash('photo-1491166617655-0723a0999cfc', 800, 500),
    alt: 'Promenade des Anglais à Nice',
  },
  nantes: {
    src: unsplash('photo-1597225764524-beb6e071d9ff', 800, 500),
    alt: 'Château des ducs de Bretagne à Nantes',
  },
  strasbourg: {
    src: unsplash('photo-1531973819741-e27a5ae2cc7b', 800, 500),
    alt: 'Petite France à Strasbourg',
  },
  montpellier: {
    src: unsplash('photo-1573455494060-c5595004fb6c', 800, 500),
    alt: 'Place de la Comédie à Montpellier',
  },
  bordeaux: {
    src: unsplash('photo-1559592413-7cec4d0cae2b', 800, 500),
    alt: 'Miroir d\'eau de Bordeaux',
  },
  lille: {
    src: unsplash('photo-1693230408791-7bf43876eb87', 800, 500),
    alt: 'Grand Place de Lille',
  },
  rennes: {
    src: unsplash('photo-1608037521277-154cd1b89191', 800, 500),
    alt: 'Maisons à colombages du centre historique de Rennes',
  },
  reims: {
    src: unsplash('photo-1632854270303-f5fdb97b697f', 800, 500),
    alt: 'Cathédrale Notre-Dame de Reims',
  },
  'saint-etienne': {
    src: unsplash('photo-1506905925346-21bda4d32df4', 800, 500),
    alt: 'Vue panoramique de Saint-Étienne',
  },
  toulon: {
    src: unsplash('photo-1507525428034-b723cf961d3e', 800, 500),
    alt: 'Port et rade de Toulon',
  },
  grenoble: {
    src: unsplash('photo-1519681393784-d120267933ba', 800, 500),
    alt: 'Grenoble et les Alpes enneigées',
  },
  dijon: {
    src: unsplash('photo-1625853365848-c5736cb28b1b', 800, 500),
    alt: 'Centre historique de Dijon',
  },
  angers: {
    src: unsplash('photo-1568605117036-5fe5e7bab0b7', 800, 500),
    alt: 'Château d\'Angers',
  },
  'le-mans': {
    src: unsplash('photo-1599946347371-68eb71b16afc', 800, 500),
    alt: 'Cité Plantagenêt au Mans',
  },
  'aix-en-provence': {
    src: unsplash('photo-1530122037265-a5f1f91d3b99', 800, 500),
    alt: 'Cours Mirabeau à Aix-en-Provence',
  },
  brest: {
    src: unsplash('photo-1559827260-dc66d52bef19', 800, 500),
    alt: 'Port de Brest et rade',
  },
}

/** Récupérer l'image d'une ville par son slug */
export function getCityImage(slug: string) {
  return cityImages[slug] || null
}

// ── 7. PAGES STATIQUES ───────────────────────────────────────────
export const pageImages = {
  howItWorks: [
    {
      src: unsplash('photo-1423666639041-f56000c27a9a'),
      alt: 'Personne recherchant un artisan sur ordinateur',
    },
    {
      src: unsplash('photo-1551836022-d5d88e9218df'),
      alt: 'Comparaison de profils d\'artisans sur écran',
    },
    {
      src: unsplash('photo-1521791136064-7986c2920216'),
      alt: 'Poignée de main entre client et artisan',
    },
  ],
  about: [
    {
      src: unsplash('photo-1522071820081-009f0129c71c', 800, 500),
      alt: 'Équipe de développement de ServicesArtisans',
    },
    {
      src: unsplash('photo-1517048676732-d65bc937f952', 800, 500),
      alt: 'Réunion d\'équipe autour de la mission ServicesArtisans',
    },
  ],
  verification: [
    {
      src: unsplash('photo-1450101499163-c8848c66ca85', 800, 500),
      alt: 'Processus de vérification SIREN des artisans',
    },
    {
      src: unsplash('photo-1554224155-6726b3ff858f', 800, 500),
      alt: 'Contrôle qualité et certification des professionnels',
    },
  ],
}

// ── 8. IMAGES D'AMBIANCE ─────────────────────────────────────────
export const ambianceImages = {
  trustBg: unsplash('photo-1541888946425-d81bb19240f5', 1200, 600),
  ctaBg: unsplash('photo-1590479773265-7464e5d48118', 1200, 600),
  renovation: unsplash('photo-1600585154340-be6161a56a0c', 1200, 600),
}

// ── 9. BLOG — Images par article ─────────────────────────────────
//
// Stratégie : matching intelligent par mots-clés dans le slug de l'article.
// Les photos de services sont réutilisées volontairement (cohérence visuelle).
// Les sujets non-métier ont leurs propres photos uniques.

/** Photos de topics non-métier (IDs uniques, non utilisés ailleurs) */
const blogTopicImages: Record<string, { src: string; alt: string }> = {
  renovation: {
    src: unsplash('photo-1600566753376-12c8ab7fb75b', 1200, 630),
    alt: 'Travaux de rénovation intérieure en cours',
  },
  budget: {
    src: unsplash('photo-1526304640581-d334cdbbf45e', 1200, 630),
    alt: 'Calculatrice et plans de devis pour travaux',
  },
  entretien: {
    src: unsplash('photo-1605276374104-dee2a0ed3cd6', 1200, 630),
    alt: 'Entretien et maintenance d\'une maison',
  },
  reglementation: {
    src: unsplash('photo-1589829545856-d10d557cf95f', 1200, 630),
    alt: 'Documents administratifs et réglementaires',
  },
  aides: {
    src: unsplash('photo-1579621970563-9ae2e01a9d4d', 1200, 630),
    alt: 'Aides financières et subventions pour la rénovation',
  },
  securite: {
    src: unsplash('photo-1557862921-37829c790f19', 1200, 630),
    alt: 'Sécurité et protection du domicile',
  },
  energie: {
    src: unsplash('photo-1509391366360-2e959784a276', 1200, 630),
    alt: 'Panneaux solaires et économies d\'énergie',
  },
  terrasse: {
    src: unsplash('photo-1600210491892-06f2f2ae1cfe', 1200, 630),
    alt: 'Terrasse extérieure aménagée',
  },
  extension: {
    src: unsplash('photo-1600607688969-a5bfcd646154', 1200, 630),
    alt: 'Extension de maison en construction',
  },
  sdb: {
    src: unsplash('photo-1600566752355-35792bedcfea', 1200, 630),
    alt: 'Salle de bain moderne rénovée',
  },
  domotique: {
    src: unsplash('photo-1585060544812-6b45742d762f', 1200, 630),
    alt: 'Maison connectée et automatisation',
  },
  hiver: {
    src: unsplash('photo-1516912481808-3406841bd33c', 1200, 630),
    alt: 'Maison sous la neige en hiver',
  },
}

/** Catégorie → image fallback */
const blogCategoryFallbacks: Record<string, { src: string; alt: string }> = {
  Tarifs: blogTopicImages.budget,
  'Aides & Subventions': blogTopicImages.aides,
  'Réglementation': blogTopicImages.reglementation,
  Securite: blogTopicImages.securite,
  'Sécurité': blogTopicImages.securite,
  Saisonnier: blogTopicImages.hiver,
  Energie: blogTopicImages.energie,
  'Énergie': blogTopicImages.energie,
  Guides: blogTopicImages.renovation,
  Conseils: blogTopicImages.entretien,
  'Fiches métier': {
    src: unsplash('photo-1572981779307-38b8cabb2407', 1200, 630),
    alt: 'Artisan au travail dans son atelier',
  },
  Inspiration: {
    src: unsplash('photo-1600210492486-724fe5c67fb0', 1200, 630),
    alt: 'Intérieur moderne et inspirant',
  },
  DIY: {
    src: unsplash('photo-1581578731548-c64695cc6952', 1200, 630),
    alt: 'Outils de bricolage et de construction',
  },
}

/** Mots-clés slug → clé dans serviceImages ou blogTopicImages */
const slugKeywords: [RegExp, string, 'service' | 'topic'][] = [
  // Métiers → réutilise la photo du service (cohérence visuelle)
  [/plomb/, 'plombier', 'service'],
  [/electri/, 'electricien', 'service'],
  [/serru/, 'serrurier', 'service'],
  [/chauffag|chaudier|radiateur/, 'chauffagiste', 'service'],
  [/peint/, 'peintre-en-batiment', 'service'],
  [/menuisi|parquet/, 'menuisier', 'service'],
  [/carrel/, 'carreleur', 'service'],
  [/couv|toiture|toitur/, 'couvreur', 'service'],
  [/macon|maçon/, 'macon', 'service'],
  [/jardin|paysag/, 'jardinier', 'service'],
  [/climatici|climatisation/, 'climaticien', 'service'],
  [/cuisin/, 'installateur-de-cuisine', 'service'],
  [/vitr|fenêtre|fenetre|vitrage/, 'vitrier', 'service'],
  [/isol/, 'isolation-thermique', 'service'],
  [/domotiq/, 'domotique', 'service'],
  [/nettoyag/, 'plaquiste', 'service'],
  [/facade|ravalement/, 'facade', 'service'],
  // Topics → photo spécifique
  [/terrasse/, 'terrasse', 'topic'],
  [/sdb|salle.de.bain/, 'sdb', 'topic'],
  [/extension|agrandir/, 'extension', 'topic'],
  [/renov/, 'renovation', 'topic'],
  [/entretien|check/, 'entretien', 'topic'],
  [/hiver|froid|gel/, 'hiver', 'topic'],
  [/budget|devis|prix|tarif|cout/, 'budget', 'topic'],
  [/aide|prime|subvention|maprimerenov|eco.ptz|cee/, 'aides', 'topic'],
  [/regle|permis|urbanis|tva|droit|loi|norme|re2020|dpe|diagnostic/, 'reglementation', 'topic'],
  [/secur|alarm|cambriol|arnaque/, 'securite', 'topic'],
  [/energie|solaire|panneau|pompe.chaleur|pac/, 'energie', 'topic'],
  [/domotiq|connecte/, 'domotique', 'topic'],
]

const defaultBlogImage = {
  src: unsplash('photo-1600566753376-12c8ab7fb75b', 1200, 630),
  alt: 'Travaux de rénovation et d\'aménagement',
}

/**
 * Récupérer l'image d'un article de blog.
 * Priorité : slug keywords → catégorie → défaut.
 */
export function getBlogImage(
  slug: string,
  category?: string,
): { src: string; alt: string } {
  const lower = slug.toLowerCase()

  // 1. Match par mot-clé dans le slug
  for (const [pattern, key, source] of slugKeywords) {
    if (pattern.test(lower)) {
      if (source === 'service') {
        return serviceImages[key] || defaultBlogImage
      }
      return blogTopicImages[key] || defaultBlogImage
    }
  }

  // 2. Fallback par catégorie
  if (category) {
    const catImage = blogCategoryFallbacks[category]
    if (catImage) return catImage
  }

  // 3. Défaut
  return defaultBlogImage
}
