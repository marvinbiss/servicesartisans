/**
 * Banque d'images centralisée — 99 photos uniques
 * Source : Unsplash (licence gratuite, usage commercial autorisé)
 *
 * RÈGLE D'OR : ZÉRO doublon. Chaque ID Unsplash n'apparaît qu'UNE SEULE fois
 * dans les données statiques ci-dessous.
 *
 * Organisation :
 * - Hero homepage (1)
 * - Services / métiers (25 uniques + 1 défaut)
 * - Artisans confiance (3 visages)
 * - Témoignages clients (3)
 * - Avant/Après (10 paires = 20, tous uniques)
 * - Villes top 20 (20 uniques)
 * - Pages statiques (7)
 * - Ambiance (3)
 * - Blog (12 topics + 3 catégories + 1 défaut)
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
    src: unsplash('photo-1621905252507-b35492cc74b4'),
    alt: 'Plombier professionnel réparant une canalisation',
  },
  electricien: {
    src: unsplash('photo-1636218685495-8f6545aadb71'),
    alt: 'Électricien installant un tableau électrique',
  },
  serrurier: {
    src: unsplash('photo-1575908539614-ff89490f4a78'),
    alt: 'Serrurier professionnel taillant des clés dans son atelier',
  },
  chauffagiste: {
    src: unsplash('photo-1572537842835-08c65286efef'),
    alt: 'Thermostat mural réglé par un chauffagiste professionnel',
  },
  'peintre-en-batiment': {
    src: unsplash('photo-1593189094075-3dad030bfcab'),
    alt: 'Peintre en bâtiment appliquant de la peinture au rouleau',
  },
  menuisier: {
    src: unsplash('photo-1678184098226-114d9295540e'),
    alt: 'Menuisier travaillant le bois dans son atelier',
  },
  carreleur: {
    src: unsplash('photo-1590880265945-6b43effeb599'),
    alt: 'Carreleur posant du carrelage dans une salle de bain',
  },
  couvreur: {
    src: unsplash('photo-1604732998734-9f9529104a77'),
    alt: 'Tuiles de toiture en terre cuite sous un ciel bleu',
  },
  macon: {
    src: unsplash('photo-1534759844553-c2f76b04e35f'),
    alt: 'Maçon construisant un mur en briques',
  },
  jardinier: {
    src: unsplash('photo-1626075218494-89e92b375502'),
    alt: 'Jardinier entretenant un beau jardin paysager',
  },
  climaticien: {
    src: unsplash('photo-1588090272888-033e92b141b1'),
    alt: 'Technicien installant une climatisation murale',
  },
  'installateur-de-cuisine': {
    src: unsplash('photo-1556912167-f556f1f39fdf'),
    alt: 'Cuisine moderne installée par un professionnel',
  },
  'installateur-de-salle-de-bain': {
    src: unsplash('photo-1758548157466-7c454382035a'),
    alt: 'Salle de bain rénovée avec vasque moderne',
  },
  vitrier: {
    src: unsplash('photo-1557749575-2ad9647f820d'),
    alt: 'Baie vitrée lumineuse posée par un vitrier',
  },
  'poseur-de-parquet': {
    src: unsplash('photo-1571091374875-3e354ceb6ed3'),
    alt: 'Artisan posant un parquet en bois massif',
  },
  facade: {
    src: unsplash('photo-1597758011002-9a3e9537dd8b'),
    alt: 'Façade d\'immeuble en cours de ravalement',
  },
  charpentier: {
    src: unsplash('photo-1569370029765-33aaab1f4851'),
    alt: 'Charpentier assemblant une structure en bois',
  },
  demolition: {
    src: unsplash('photo-1754808682731-5d4430b38e11'),
    alt: 'Travaux de démolition sur un chantier',
  },
  terrassement: {
    src: unsplash('photo-1567238563567-b99d8ac66e9b'),
    alt: 'Engin de terrassement nivelant un terrain',
  },
  'isolation-thermique': {
    src: unsplash('photo-1631277190979-1704e8c7d574'),
    alt: 'Artisan posant de l\'isolation thermique en laine de roche',
  },
  domotique: {
    src: unsplash('photo-1545259741-2ea3ebf61fa3'),
    alt: 'Installation domotique dans une maison connectée',
  },
  paysagiste: {
    src: unsplash('photo-1595387426256-cc153122a6f1'),
    alt: 'Jardin paysager aménagé par un professionnel',
  },
  pisciniste: {
    src: unsplash('photo-1650519876461-c516be8be76c'),
    alt: 'Piscine construite par un artisan pisciniste',
  },
  'alarme-securite': {
    src: unsplash('photo-1528312635006-8ea0bc49ec63'),
    alt: 'Caméra de surveillance et système de sécurité résidentiel',
  },
  plaquiste: {
    src: unsplash('photo-1559126698-1906840f3c95'),
    alt: 'Plaquiste posant des plaques de plâtre sur une ossature',
  },
}

// Image par défaut pour les services non listés
export const defaultServiceImage = {
  src: unsplash('photo-1575839127400-6b9e36bf97f8'),
  alt: 'Artisan professionnel au travail',
}

/** Récupérer l'image d'un service par son slug */
export function getServiceImage(slug: string) {
  return serviceImages[slug] || defaultServiceImage
}

// ── 3. VISAGES ARTISANS (confiance) ──────────────────────────────
export const artisanFaces = [
  {
    src: unsplash('photo-1580810734868-7ea4e9130c01', 400, 400),
    alt: 'Portrait d\'un artisan professionnel souriant',
    name: 'Thomas M.',
    metier: 'Plombier · Paris',
  },
  {
    src: unsplash('photo-1616179283726-e96f7aa16a56', 400, 400),
    alt: 'Portrait d\'un artisan expérimenté',
    name: 'Marc D.',
    metier: 'Électricien · Lyon',
  },
  {
    src: unsplash('photo-1630670401138-9a5c91abad18', 400, 400),
    alt: 'Portrait d\'un artisan qualifié',
    name: 'Pierre L.',
    metier: 'Menuisier · Marseille',
  },
]

// ── 4. TÉMOIGNAGES CLIENTS ───────────────────────────────────────
export const testimonialImages = [
  {
    src: unsplash('photo-1527694194835-f9a07834b609', 400, 400),
    alt: 'Cliente satisfaite après rénovation',
    name: 'Sophie R.',
    text: 'J\'ai trouvé un excellent plombier en 5 minutes. Travail impeccable !',
    ville: 'Paris',
    note: 5,
  },
  {
    src: unsplash('photo-1565288692954-a8d2b8f930fb', 400, 400),
    alt: 'Client satisfait après travaux',
    name: 'Jean-Pierre V.',
    text: 'Devis reçu en 24h, chantier terminé dans les temps. Je recommande.',
    ville: 'Bordeaux',
    note: 5,
  },
  {
    src: unsplash('photo-1590304786889-677d013ff31f', 400, 400),
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
    before: unsplash('photo-1539062680227-66125f17d777'),
    after: unsplash('photo-1576698483491-8c43f0862543'),
    alt: 'Rénovation salle de bain',
    category: 'Salle de bain',
  },
  {
    before: unsplash('photo-1600331574095-4a20d3d8dd77'),
    after: unsplash('photo-1572534382965-ef9f328c8db4'),
    alt: 'Rénovation cuisine',
    category: 'Cuisine',
  },
  {
    before: unsplash('photo-1544830826-4bc6706df845'),
    after: unsplash('photo-1583847268964-b28dc8f51f92'),
    alt: 'Rénovation salon peinture',
    category: 'Peinture intérieure',
  },
  {
    before: unsplash('photo-1635151833290-1951891641cc'),
    after: unsplash('photo-1684346605835-69888f742522'),
    alt: 'Ravalement façade',
    category: 'Façade',
  },
  {
    before: unsplash('photo-1504979128236-23f86972356c'),
    after: unsplash('photo-1560185008-b033106af5c3'),
    alt: 'Rénovation parquet',
    category: 'Parquet',
  },
  {
    before: unsplash('photo-1561120699-89a04702dba4'),
    after: unsplash('photo-1587538445896-d1f222cb0653'),
    alt: 'Aménagement jardin',
    category: 'Jardin',
  },
  {
    before: unsplash('photo-1609588959666-3cb46cabe3f7'),
    after: unsplash('photo-1603206225819-e04c4b395a16'),
    alt: 'Réfection toiture',
    category: 'Toiture',
  },
  {
    before: unsplash('photo-1543168988-54f6d5bee655'),
    after: unsplash('photo-1612296350203-7d4718f6ac65'),
    alt: 'Extension maison maçonnerie',
    category: 'Maçonnerie',
  },
  {
    before: unsplash('photo-1553969536-e9b839932f42'),
    after: unsplash('photo-1558442074-3c19857bc1dc'),
    alt: 'Isolation et rénovation énergétique',
    category: 'Isolation',
  },
  {
    before: unsplash('photo-1593817122715-bbe051a66bf8'),
    after: unsplash('photo-1595514534785-44a24a4d9467'),
    alt: 'Rénovation plomberie salle d\'eau',
    category: 'Plomberie',
  },
]

// ── 6. IMAGES DES TOP 20 VILLES ──────────────────────────────────
export const cityImages: Record<string, { src: string; alt: string }> = {
  paris: {
    src: unsplash('photo-1511739001486-6bfe10ce785f', 800, 500),
    alt: 'Vue de Paris avec la Tour Eiffel',
  },
  marseille: {
    src: unsplash('photo-1566837942683-90c2eabc56ff', 800, 500),
    alt: 'Vue du Vieux-Port de Marseille',
  },
  lyon: {
    src: unsplash('photo-1669275555278-986814008b68', 800, 500),
    alt: 'Panorama de Lyon avec la colline de Fourvière',
  },
  toulouse: {
    src: unsplash('photo-1572804131749-220f83b2f9bf', 800, 500),
    alt: 'Place du Capitole à Toulouse',
  },
  nice: {
    src: unsplash('photo-1551799142-93484f2d0284', 800, 500),
    alt: 'Promenade des Anglais à Nice',
  },
  nantes: {
    src: unsplash('photo-1571509703616-67fe3742764c', 800, 500),
    alt: 'Château des ducs de Bretagne à Nantes',
  },
  strasbourg: {
    src: unsplash('photo-1563783615689-36214e990fca', 800, 500),
    alt: 'Petite France à Strasbourg',
  },
  montpellier: {
    src: unsplash('photo-1625776043024-dc0a8f0ef4db', 800, 500),
    alt: 'Place de la Comédie à Montpellier',
  },
  bordeaux: {
    src: unsplash('photo-1493564738392-d148cfbd6eda', 800, 500),
    alt: 'Miroir d\'eau de Bordeaux',
  },
  lille: {
    src: unsplash('photo-1596031837679-e1444bd4b830', 800, 500),
    alt: 'Grand Place de Lille',
  },
  rennes: {
    src: unsplash('photo-1585202648376-6a4c03278e73', 800, 500),
    alt: 'Maisons à colombages du centre historique de Rennes',
  },
  reims: {
    src: unsplash('photo-1551566521-1974ad1792c5', 800, 500),
    alt: 'Cathédrale Notre-Dame de Reims',
  },
  'saint-etienne': {
    src: unsplash('photo-1574620469420-5420ce0496e6', 800, 500),
    alt: 'Vue panoramique de Saint-Étienne',
  },
  toulon: {
    src: unsplash('photo-1574008313813-8f5de140a03b', 800, 500),
    alt: 'Port et rade de Toulon',
  },
  grenoble: {
    src: unsplash('photo-1488235742400-36898425c618', 800, 500),
    alt: 'Grenoble et les Alpes enneigées',
  },
  dijon: {
    src: unsplash('photo-1526835157776-71ce36cd7583', 800, 500),
    alt: 'Centre historique de Dijon',
  },
  angers: {
    src: unsplash('photo-1588278183316-7c7a88cc683d', 800, 500),
    alt: 'Château d\'Angers',
  },
  'le-mans': {
    src: unsplash('photo-1627674410470-dc8642afc616', 800, 500),
    alt: 'Cité Plantagenêt au Mans',
  },
  'aix-en-provence': {
    src: unsplash('photo-1593715857983-5531aa640471', 800, 500),
    alt: 'Cours Mirabeau à Aix-en-Provence',
  },
  brest: {
    src: unsplash('photo-1589923793264-46f9d00db0fc', 800, 500),
    alt: 'Port de Brest et rade',
  },
}

/** Récupérer l'image d'une ville par son slug */
export function getCityImage(slug: string) {
  return cityImages[slug] || null
}

// ── DÉPARTEMENT → image via chef-lieu ────────────────────────────
const deptCodeToCitySlug: Record<string, string> = {
  '75': 'paris',
  '13': 'marseille',
  '69': 'lyon',
  '31': 'toulouse',
  '06': 'nice',
  '44': 'nantes',
  '67': 'strasbourg',
  '34': 'montpellier',
  '33': 'bordeaux',
  '59': 'lille',
  '35': 'rennes',
  '51': 'reims',
  '42': 'saint-etienne',
  '83': 'toulon',
  '38': 'grenoble',
  '21': 'dijon',
  '49': 'angers',
  '72': 'le-mans',
  '29': 'brest',
}

/** Image d'un département (chef-lieu → cityImage, sinon hero) */
export function getDepartmentImage(deptCode: string): { src: string; alt: string } {
  const citySlug = deptCodeToCitySlug[deptCode]
  if (citySlug && cityImages[citySlug]) return cityImages[citySlug]
  return heroImage
}

// ── RÉGION → image via ville principale ──────────────────────────
const regionSlugToCitySlug: Record<string, string> = {
  'ile-de-france': 'paris',
  'provence-alpes-cote-dazur': 'marseille',
  'auvergne-rhone-alpes': 'lyon',
  'occitanie': 'toulouse',
  'nouvelle-aquitaine': 'bordeaux',
  'pays-de-la-loire': 'nantes',
  'grand-est': 'strasbourg',
  'hauts-de-france': 'lille',
  'bretagne': 'rennes',
  'bourgogne-franche-comte': 'dijon',
}

/** Image d'une région (capitale → cityImage, sinon hero) */
export function getRegionImage(regionSlug: string): { src: string; alt: string } {
  const citySlug = regionSlugToCitySlug[regionSlug]
  if (citySlug && cityImages[citySlug]) return cityImages[citySlug]
  return heroImage
}

// ── 7. PAGES STATIQUES ───────────────────────────────────────────
export const pageImages = {
  howItWorks: [
    {
      src: unsplash('photo-1544717305-f9c88f2897bc'),
      alt: 'Personne recherchant un artisan sur ordinateur',
    },
    {
      src: unsplash('photo-1548967136-609936a3088b'),
      alt: 'Comparaison de profils d\'artisans sur écran',
    },
    {
      src: unsplash('photo-1521791136064-7986c2920216'),
      alt: 'Poignée de main entre client et artisan',
    },
  ],
  about: [
    {
      src: unsplash('photo-1582151767854-e00a6b3151c6', 800, 500),
      alt: 'Équipe de développement de ServicesArtisans',
    },
    {
      src: unsplash('photo-1632856692518-b694374ee5ec', 800, 500),
      alt: 'Réunion d\'équipe autour de la mission ServicesArtisans',
    },
  ],
  verification: [
    {
      src: unsplash('photo-1551590192-8070a16d9f67', 800, 500),
      alt: 'Processus de vérification SIREN des artisans',
    },
    {
      src: unsplash('photo-1599583863916-e06c29087f51', 800, 500),
      alt: 'Contrôle qualité et certification des professionnels',
    },
  ],
}

// ── 8. IMAGES D'AMBIANCE ─────────────────────────────────────────
export const ambianceImages = {
  trustBg: unsplash('photo-1590880795696-20c7dfadacde', 1200, 600),
  ctaBg: unsplash('photo-1570570665905-346e1b6be193', 1200, 600),
  renovation: unsplash('photo-1634586621169-93e12e0bd604', 1200, 600),
}

// ── 9. BLOG — Images par article ─────────────────────────────────
//
// Stratégie : matching intelligent par mots-clés dans le slug de l'article.
// Les photos de services sont réutilisées volontairement (cohérence visuelle).
// Les sujets non-métier ont leurs propres photos uniques.

/** Photos de topics non-métier (IDs uniques, non utilisés ailleurs) */
const blogTopicImages: Record<string, { src: string; alt: string }> = {
  renovation: {
    src: unsplash('photo-1765277789186-04b71a9afd40', 1200, 630),
    alt: 'Travaux de rénovation intérieure en cours',
  },
  budget: {
    src: unsplash('photo-1526304640581-d334cdbbf45e', 1200, 630),
    alt: 'Calculatrice et plans de devis pour travaux',
  },
  entretien: {
    src: unsplash('photo-1564943300036-461e6e152355', 1200, 630),
    alt: 'Entretien et maintenance d\'une maison',
  },
  reglementation: {
    src: unsplash('photo-1554224155-cfa08c2a758f', 1200, 630),
    alt: 'Documents administratifs et réglementaires',
  },
  aides: {
    src: unsplash('photo-1608747912887-563d7e155d30', 1200, 630),
    alt: 'Aides financières et subventions pour la rénovation',
  },
  securite: {
    src: unsplash('photo-1592924271903-1e4b1a1ae20f', 1200, 630),
    alt: 'Sécurité et protection du domicile',
  },
  energie: {
    src: unsplash('photo-1655300283247-6b1924b1d152', 1200, 630),
    alt: 'Panneaux solaires et économies d\'énergie',
  },
  terrasse: {
    src: unsplash('photo-1474547385661-ef98b8799dce', 1200, 630),
    alt: 'Terrasse extérieure aménagée',
  },
  extension: {
    src: unsplash('photo-1600768577091-3442c3f53179', 1200, 630),
    alt: 'Extension de maison en construction',
  },
  sdb: {
    src: unsplash('photo-1595428774752-c87f23e7fcee', 1200, 630),
    alt: 'Salle de bain moderne rénovée',
  },
  domotique: {
    src: unsplash('photo-1614801502766-e2562eb626d5', 1200, 630),
    alt: 'Maison connectée et automatisation',
  },
  hiver: {
    src: unsplash('photo-1452088366481-4690b645efff', 1200, 630),
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
    src: unsplash('photo-1633419946251-6d8b5dd33170', 1200, 630),
    alt: 'Artisan au travail dans son atelier',
  },
  Inspiration: {
    src: unsplash('photo-1600210492486-724fe5c67fb0', 1200, 630),
    alt: 'Intérieur moderne et inspirant',
  },
  DIY: {
    src: unsplash('photo-1586187543416-b1e5669978b3', 1200, 630),
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
  [/nettoyag/, 'entretien', 'topic'],
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
  src: unsplash('photo-1600585154340-be6161a56a0c', 1200, 630),
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
