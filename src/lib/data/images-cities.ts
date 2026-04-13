/**
 * Images de villes supplémentaires — 80 villes françaises
 * Source : Unsplash (licence gratuite, usage commercial autorisé)
 *
 * Complète les 20 villes déjà couvertes dans images.ts
 * pour atteindre le top 100 des villes françaises par population.
 *
 * RÈGLE D'OR : ZÉRO doublon avec images.ts
 */

// ── Helper ───────────────────────────────────────────────────────
function unsplash(id: string, w = 800, h = 600): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

/** 80 villes supplémentaires avec photo Unsplash unique */
export const additionalCityImages: Record<string, { src: string; alt: string }> = {
  rouen: {
    src: unsplash('photo-1643968743498-0bOVmBAUogM'),
    alt: 'Vue de la cathédrale Notre-Dame de Rouen',
  },
  villeurbanne: {
    src: unsplash('photo-1637931532669-jiKS0QapA8k'),
    alt: 'Architecture moderne à Villeurbanne',
  },
  'le-havre': {
    src: unsplash('photo-1590074072786-lX8R7OoR6r8'),
    alt: 'Architecture contemporaine au Havre',
  },
  nancy: {
    src: unsplash('photo-1592478411213-jRAGIjzfcrc'),
    alt: 'Place Stanislas à Nancy',
  },
  avignon: {
    src: unsplash('photo-1595654339570-2dQJnBFsc4Q'),
    alt: "Le Pont d'Avignon sur le Rhône",
  },
  cannes: {
    src: unsplash('photo-1636834255894-hzu5tMreacI'),
    alt: 'Panneau de Cannes sur la Croisette',
  },
  perpignan: {
    src: unsplash('photo-1661157683949-sYNP0uLCM8k'),
    alt: 'Vue du stade et de la ville de Perpignan',
  },
  metz: {
    src: unsplash('photo-1580305176613-l8r0iD7_gtU'),
    alt: "Cathédrale Saint-Étienne et Place d'Armes à Metz",
  },
  besancon: {
    src: unsplash('photo-1597148385566-FUVgZcymKNA'),
    alt: 'Vue panoramique de Besançon et le Doubs',
  },
  orleans: {
    src: unsplash('photo-1584608313813-_V5X7gMfnpk'),
    alt: "Cathédrale Sainte-Croix d'Orléans",
  },
  mulhouse: {
    src: unsplash('photo-1597407124268-hCh_PHIhoLI'),
    alt: 'Architecture alsacienne à Mulhouse',
  },
  caen: {
    src: unsplash('photo-1652432285630-SHMQ1mXh6t8'),
    alt: 'Abbaye aux Hommes et flèche de Caen',
  },
  'boulogne-billancourt': {
    src: unsplash('photo-1583241800698-1e8PkwKdZic'),
    alt: 'La Seine Musicale à Boulogne-Billancourt',
  },
  argenteuil: {
    src: unsplash('photo-1574028810906-9jhsobOalJU'),
    alt: "Paysage impressionniste d'Argenteuil",
  },
  'saint-denis': {
    src: unsplash('photo-1571500800779-KRqdU2_t1lk'),
    alt: 'Basilique de Saint-Denis',
  },
  montreuil: {
    src: unsplash('photo-1590069621530-oT8lfV5fjgc'),
    alt: 'Scène de rue à Montreuil',
  },
  dunkerque: {
    src: unsplash('photo-1614005849974-PrvP3WqhMFg'),
    alt: 'La plage et le front de mer de Dunkerque',
  },
  tourcoing: {
    src: unsplash('photo-1605361914682-jAKprj0wWCk'),
    alt: 'Plage et côte du Nord-Pas-de-Calais',
  },
  pau: {
    src: unsplash('photo-1560424079848-DWuoAjmlD-A'),
    alt: 'Kayak sur le gave de Pau avec les Pyrénées',
  },
  nimes: {
    src: unsplash('photo-1625316887082-SFdWcTtLVwA'),
    alt: 'Les arènes de Nîmes',
  },
  'vitry-sur-seine': {
    src: unsplash('photo-1499856871958-5b9627545d1a'),
    alt: 'Bords de Seine en Île-de-France',
  },
  creteil: {
    src: unsplash('photo-1541417904950-b855846fe074'),
    alt: 'Architecture moderne en Île-de-France',
  },
  poitiers: {
    src: unsplash('photo-1633076205805-gnIZQsP52Hk'),
    alt: 'Architecture historique de Poitiers',
  },
  nanterre: {
    src: unsplash('photo-1575884363016-FGkv8GEF5q0'),
    alt: 'Tour et skyline de Nanterre',
  },
  versailles: {
    src: unsplash('photo-1568739253682-OJFaGRRt7vg'),
    alt: 'Château de Versailles et ses jardins',
  },
  limoges: {
    src: unsplash('photo-1632399785093-TFgbboBjERs'),
    alt: 'Gare des Bénédictins à Limoges',
  },
  amiens: {
    src: unsplash('photo-1646591360470-defQMQ0rBwE'),
    alt: "Intérieur de la cathédrale d'Amiens",
  },
  'clermont-ferrand': {
    src: unsplash('photo-1548092372-7VmyyfSvk_A'),
    alt: 'Vue de Clermont-Ferrand et ses rues pavées',
  },
  colombes: {
    src: unsplash('photo-1502602898657-3e91760cbb34'),
    alt: 'Banlieue parisienne typique des Hauts-de-Seine',
  },
  'la-rochelle': {
    src: unsplash('photo-1536584754829-axGIFsDQkdk'),
    alt: 'Port et bateaux à La Rochelle',
  },
  calais: {
    src: unsplash('photo-1618220252344-rPJdQPohV6I'),
    alt: 'Sculpture du Dragon de Calais',
  },
  bayonne: {
    src: unsplash('photo-1649251618783-vLZPIFt5Ys0'),
    alt: 'Maisons colorées au bord de la Nive à Bayonne',
  },
  valence: {
    src: unsplash('photo-1541599468348-Yr1gxBvbGdY'),
    alt: 'Vue de la ville de Valence dans la Drôme',
  },
  'saint-nazaire': {
    src: unsplash('photo-1566991060-77b8d0b0f499'),
    alt: 'Port et chantiers navals de Saint-Nazaire',
  },
  ajaccio: {
    src: unsplash('photo-1602413378673-ZIk-1uTnbJ4'),
    alt: "Vue de la mer depuis les remparts d'Ajaccio",
  },
  troyes: {
    src: unsplash('photo-1636570215228-5JJiRnSHwFo'),
    alt: 'Maisons à colombages de Troyes',
  },
  bourges: {
    src: unsplash('photo-1624537210513-FW2htFxKrus'),
    alt: 'Cathédrale Saint-Étienne et marais de Bourges',
  },
  lorient: {
    src: unsplash('photo-1596204552176-tr6LlprdGbo'),
    alt: 'Phare et côte bretonne près de Lorient',
  },
  colmar: {
    src: unsplash('photo-1555466022-3a1d6e7b1c8b'),
    alt: 'Petite Venise et canaux de Colmar',
  },
  niort: {
    src: unsplash('photo-1559564484-e48b3e040ff4'),
    alt: 'Vue du marais poitevin près de Niort',
  },
  chambery: {
    src: unsplash('photo-1591016100929-Z2GR3wloFUg'),
    alt: 'Fleurs et architecture de Chambéry',
  },
  'saint-brieuc': {
    src: unsplash('photo-1563297900-qsSBe9z1ty4'),
    alt: "Falaises vertes des Côtes-d'Armor près de Saint-Brieuc",
  },
  quimper: {
    src: unsplash('photo-1590069261876-bDGgOlguqJA'),
    alt: 'Falaises et littoral du Finistère près de Quimper',
  },
  vannes: {
    src: unsplash('photo-1595847919657-RLT_b0TEErQ'),
    alt: 'Ruelles et maisons à colombages de Vannes',
  },
  'la-roche-sur-yon': {
    src: unsplash('photo-1558618666-fcd25c85f82e'),
    alt: 'Paysage verdoyant de Vendée',
  },
  beauvais: {
    src: unsplash('photo-1584107662776-6sElGM329ic'),
    alt: 'Cathédrale gothique de Beauvais',
  },
  'charleville-mezieres': {
    src: unsplash('photo-1543722530-d2c3201371e7'),
    alt: 'Place Ducale de Charleville-Mézières',
  },
  antibes: {
    src: unsplash('photo-1556357629-9e78b0b7e06c'),
    alt: "Côte et remparts d'Antibes sur la Méditerranée",
  },
  cholet: {
    src: unsplash('photo-1560969184-10fe8719e773'),
    alt: 'Campagne et bocage angevin près de Cholet',
  },
  arles: {
    src: unsplash('photo-1548550009-3724a7588573'),
    alt: "Amphithéâtre romain d'Arles",
  },
  beziers: {
    src: unsplash('photo-1739614453696-cNpZahvJi3k'),
    alt: 'Pont Vieux et cathédrale Saint-Nazaire de Béziers',
  },
  carcassonne: {
    src: unsplash('photo-1559128510-JjEbmnY1e0w'),
    alt: 'Cité médiévale fortifiée de Carcassonne',
  },
  'saint-malo': {
    src: unsplash('photo-1562693308-5d45a5f08435'),
    alt: 'Remparts et plage de Saint-Malo',
  },
  blois: {
    src: unsplash('photo-1526732752606-gLlMalNveC0'),
    alt: 'Vue aérienne du Château Royal de Blois',
  },
  laval: {
    src: unsplash('photo-1551632436-cbf8dd35adfa'),
    alt: 'Vieux pont et centre historique de Laval',
  },
  cherbourg: {
    src: unsplash('photo-1560089168-6516081f5bf1'),
    alt: 'Port et rade de Cherbourg en Normandie',
  },
  epinal: {
    src: unsplash('photo-1551882547-ff40c63fe5fa'),
    alt: "Montagnes des Vosges près d'Épinal",
  },
  'brive-la-gaillarde': {
    src: unsplash('photo-1558118070-d7ef15d36056'),
    alt: 'Paysage du Limousin près de Brive-la-Gaillarde',
  },
  angouleme: {
    src: unsplash('photo-1564013799919-ab600027ffc6'),
    alt: "Vue panoramique d'Angoulême et ses remparts",
  },
  tarbes: {
    src: unsplash('photo-1553901753-215db344677a'),
    alt: 'Jardin Massey et Pyrénées à Tarbes',
  },
  gap: {
    src: unsplash('photo-1736975577655-vnFr1oOpElo'),
    alt: 'Parc national des Écrins vu depuis Gap',
  },
  belfort: {
    src: unsplash('photo-1543332164-6e82f355badc'),
    alt: 'Vue de la citadelle de Belfort',
  },
  'saint-quentin': {
    src: unsplash('photo-1564171785455-8U-hPYv9uok'),
    alt: "Village des métiers d'antan à Saint-Quentin",
  },
  agen: {
    src: unsplash('photo-1526821137283-hFKY9uLn65E'),
    alt: "Vue d'Agen et la vallée de la Garonne",
  },
  montauban: {
    src: unsplash('photo-1580127917931-NGzOqan3lmw'),
    alt: 'Architecture en brique rose de Montauban',
  },
  albi: {
    src: unsplash('photo-1657293852792-Gk6P0g1fjp8'),
    alt: 'Jardins du palais de la Berbie à Albi',
  },
  dax: {
    src: unsplash('photo-1552733407-5d5c46c3bb3b'),
    alt: 'Fontaine chaude et thermes de Dax',
  },
  auxerre: {
    src: unsplash('photo-1537197776862-gGRUhxyoCMo'),
    alt: "Vue de la cathédrale d'Auxerre",
  },
  compiegne: {
    src: unsplash('photo-1568393691622-c7ba131d63b4'),
    alt: 'Forêt et palais impérial de Compiègne',
  },
  sens: {
    src: unsplash('photo-1558979158-65a1eaa08691'),
    alt: 'Cathédrale Saint-Étienne de Sens',
  },
  macon: {
    src: unsplash('photo-1571689936114-0Hd4cmnQ2DQ'),
    alt: 'Bords de Saône à Mâcon',
  },
  sete: {
    src: unsplash('photo-1590681161029-g5oQcEiSIPs'),
    alt: 'Port et canaux de Sète',
  },
  frejus: {
    src: unsplash('photo-1533050048814-9xRcMJ1ymS4'),
    alt: 'Paysage méditerranéen à Fréjus',
  },
  'salon-de-provence': {
    src: unsplash('photo-1542359649-2aGaN2oDPQI'),
    alt: 'Champs de lavande en Provence près de Salon',
  },
  bastia: {
    src: unsplash('photo-1563108747-ZjpWBjAvGZI'),
    alt: 'Port de Bastia et ferry en Corse',
  },
  'saint-raphael': {
    src: unsplash('photo-1533104816931-20fa691ff6ca'),
    alt: "Côte d'Azur et port de Saint-Raphaël",
  },
  draguignan: {
    src: unsplash('photo-1595587637401-7caibmZC9AE'),
    alt: 'Paysage provençal du Var près de Draguignan',
  },
  biarritz: {
    src: unsplash('photo-1598886917668-umKZ7nf05io'),
    alt: 'Falaise et océan Atlantique à Biarritz',
  },
  bergerac: {
    src: unsplash('photo-1564406474-qB8qhe7XrRs'),
    alt: 'Rues et façades colorées de Bergerac',
  },
  cahors: {
    src: unsplash('photo-1687025781395-T81Z3Cyuxcg'),
    alt: 'Pont Valentré à Cahors sur le Lot',
  },
}
