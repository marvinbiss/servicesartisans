import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'
import { popularRegions } from '@/lib/constants/navigation'

const regionsData: Record<string, {
  name: string
  description: string
  departments: { name: string; code: string; slug: string; cities: { name: string; slug: string }[] }[]
}> = {
  'ile-de-france': {
    name: 'Île-de-France',
    description: 'Première région économique de France, l\'Île-de-France concentre une forte demande en services artisanaux.',
    departments: [
      { name: 'Paris', code: '75', slug: 'paris', cities: [{ name: 'Paris', slug: 'paris' }] },
      { name: 'Seine-et-Marne', code: '77', slug: 'seine-et-marne', cities: [{ name: 'Meaux', slug: 'meaux' }, { name: 'Melun', slug: 'melun' }, { name: 'Chelles', slug: 'chelles' }] },
      { name: 'Yvelines', code: '78', slug: 'yvelines', cities: [{ name: 'Versailles', slug: 'versailles' }, { name: 'Sartrouville', slug: 'sartrouville' }] },
      { name: 'Essonne', code: '91', slug: 'essonne', cities: [{ name: 'Évry-Courcouronnes', slug: 'evry-courcouronnes' }, { name: 'Massy', slug: 'massy' }] },
      { name: 'Hauts-de-Seine', code: '92', slug: 'hauts-de-seine', cities: [{ name: 'Boulogne-Billancourt', slug: 'boulogne-billancourt' }, { name: 'Nanterre', slug: 'nanterre' }, { name: 'Courbevoie', slug: 'courbevoie' }] },
      { name: 'Seine-Saint-Denis', code: '93', slug: 'seine-saint-denis', cities: [{ name: 'Saint-Denis', slug: 'saint-denis' }, { name: 'Montreuil', slug: 'montreuil' }, { name: 'Aulnay-sous-Bois', slug: 'aulnay-sous-bois' }] },
      { name: 'Val-de-Marne', code: '94', slug: 'val-de-marne', cities: [{ name: 'Créteil', slug: 'creteil' }, { name: 'Vitry-sur-Seine', slug: 'vitry-sur-seine' }, { name: 'Champigny-sur-Marne', slug: 'champigny-sur-marne' }] },
      { name: 'Val-d\'Oise', code: '95', slug: 'val-doise', cities: [{ name: 'Argenteuil', slug: 'argenteuil' }, { name: 'Cergy', slug: 'cergy' }, { name: 'Sarcelles', slug: 'sarcelles' }] },
    ],
  },
  'auvergne-rhone-alpes': {
    name: 'Auvergne-Rhône-Alpes',
    description: 'Deuxième région de France, l\'Auvergne-Rhône-Alpes offre un dynamisme économique important.',
    departments: [
      { name: 'Rhône', code: '69', slug: 'rhone', cities: [{ name: 'Lyon', slug: 'lyon' }, { name: 'Villeurbanne', slug: 'villeurbanne' }] },
      { name: 'Isère', code: '38', slug: 'isere', cities: [{ name: 'Grenoble', slug: 'grenoble' }] },
      { name: 'Loire', code: '42', slug: 'loire', cities: [{ name: 'Saint-Étienne', slug: 'saint-etienne' }] },
      { name: 'Haute-Savoie', code: '74', slug: 'haute-savoie', cities: [{ name: 'Annecy', slug: 'annecy' }, { name: 'Annemasse', slug: 'annemasse' }] },
      { name: 'Savoie', code: '73', slug: 'savoie', cities: [{ name: 'Chambéry', slug: 'chambery' }, { name: 'Aix-les-Bains', slug: 'aix-les-bains' }] },
      { name: 'Ain', code: '01', slug: 'ain', cities: [{ name: 'Bourg-en-Bresse', slug: 'bourg-en-bresse' }, { name: 'Oyonnax', slug: 'oyonnax' }] },
      { name: 'Drôme', code: '26', slug: 'drome', cities: [{ name: 'Valence', slug: 'valence' }, { name: 'Montélimar', slug: 'montelimar' }] },
      { name: 'Ardèche', code: '07', slug: 'ardeche', cities: [{ name: 'Privas', slug: 'privas' }, { name: 'Annonay', slug: 'annonay' }] },
      { name: 'Puy-de-Dôme', code: '63', slug: 'puy-de-dome', cities: [{ name: 'Clermont-Ferrand', slug: 'clermont-ferrand' }] },
      { name: 'Allier', code: '03', slug: 'allier', cities: [{ name: 'Moulins', slug: 'moulins' }, { name: 'Vichy', slug: 'vichy' }] },
      { name: 'Cantal', code: '15', slug: 'cantal', cities: [{ name: 'Aurillac', slug: 'aurillac' }] },
      { name: 'Haute-Loire', code: '43', slug: 'haute-loire', cities: [{ name: 'Le Puy-en-Velay', slug: 'le-puy-en-velay' }] },
    ],
  },
  'provence-alpes-cote-azur': {
    name: 'Provence-Alpes-Côte d\'Azur',
    description: 'Région touristique par excellence, la PACA bénéficie d\'un réseau dense d\'artisans qualifiés.',
    departments: [
      { name: 'Bouches-du-Rhône', code: '13', slug: 'bouches-du-rhone', cities: [{ name: 'Marseille', slug: 'marseille' }, { name: 'Aix-en-Provence', slug: 'aix-en-provence' }, { name: 'Arles', slug: 'arles' }] },
      { name: 'Alpes-Maritimes', code: '06', slug: 'alpes-maritimes', cities: [{ name: 'Nice', slug: 'nice' }, { name: 'Cannes', slug: 'cannes' }, { name: 'Antibes', slug: 'antibes' }] },
      { name: 'Var', code: '83', slug: 'var', cities: [{ name: 'Toulon', slug: 'toulon' }, { name: 'Fréjus', slug: 'frejus' }, { name: 'Hyères', slug: 'hyeres' }] },
      { name: 'Vaucluse', code: '84', slug: 'vaucluse', cities: [{ name: 'Avignon', slug: 'avignon' }, { name: 'Orange', slug: 'orange' }] },
      { name: 'Alpes-de-Haute-Provence', code: '04', slug: 'alpes-de-haute-provence', cities: [{ name: 'Digne-les-Bains', slug: 'digne-les-bains' }, { name: 'Manosque', slug: 'manosque' }] },
      { name: 'Hautes-Alpes', code: '05', slug: 'hautes-alpes', cities: [{ name: 'Gap', slug: 'gap' }, { name: 'Briançon', slug: 'briancon' }] },
    ],
  },
  'occitanie': {
    name: 'Occitanie',
    description: 'La plus grande région de France métropolitaine offre une diversité de services artisanaux.',
    departments: [
      { name: 'Haute-Garonne', code: '31', slug: 'haute-garonne', cities: [{ name: 'Toulouse', slug: 'toulouse' }] },
      { name: 'Hérault', code: '34', slug: 'herault', cities: [{ name: 'Montpellier', slug: 'montpellier' }, { name: 'Béziers', slug: 'beziers' }] },
      { name: 'Gard', code: '30', slug: 'gard', cities: [{ name: 'Nîmes', slug: 'nimes' }, { name: 'Alès', slug: 'ales' }] },
      { name: 'Pyrénées-Orientales', code: '66', slug: 'pyrenees-orientales', cities: [{ name: 'Perpignan', slug: 'perpignan' }] },
      { name: 'Aude', code: '11', slug: 'aude', cities: [{ name: 'Carcassonne', slug: 'carcassonne' }, { name: 'Narbonne', slug: 'narbonne' }] },
      { name: 'Tarn', code: '81', slug: 'tarn', cities: [{ name: 'Albi', slug: 'albi' }, { name: 'Castres', slug: 'castres' }] },
      { name: 'Aveyron', code: '12', slug: 'aveyron', cities: [{ name: 'Rodez', slug: 'rodez' }, { name: 'Millau', slug: 'millau' }] },
      { name: 'Hautes-Pyrénées', code: '65', slug: 'hautes-pyrenees', cities: [{ name: 'Tarbes', slug: 'tarbes' }, { name: 'Lourdes', slug: 'lourdes' }] },
      { name: 'Ariège', code: '09', slug: 'ariege', cities: [{ name: 'Foix', slug: 'foix' }, { name: 'Pamiers', slug: 'pamiers' }] },
      { name: 'Gers', code: '32', slug: 'gers', cities: [{ name: 'Auch', slug: 'auch' }] },
      { name: 'Lot', code: '46', slug: 'lot', cities: [{ name: 'Cahors', slug: 'cahors' }] },
      { name: 'Tarn-et-Garonne', code: '82', slug: 'tarn-et-garonne', cities: [{ name: 'Montauban', slug: 'montauban' }] },
      { name: 'Lozère', code: '48', slug: 'lozere', cities: [{ name: 'Mende', slug: 'mende' }] },
    ],
  },
  'nouvelle-aquitaine': {
    name: 'Nouvelle-Aquitaine',
    description: 'Plus grande région de France, la Nouvelle-Aquitaine dispose d\'un réseau d\'artisans étendu.',
    departments: [
      { name: 'Gironde', code: '33', slug: 'gironde', cities: [{ name: 'Bordeaux', slug: 'bordeaux' }, { name: 'Mérignac', slug: 'merignac' }] },
      { name: 'Haute-Vienne', code: '87', slug: 'haute-vienne', cities: [{ name: 'Limoges', slug: 'limoges' }] },
      { name: 'Charente-Maritime', code: '17', slug: 'charente-maritime', cities: [{ name: 'La Rochelle', slug: 'la-rochelle' }, { name: 'Rochefort', slug: 'rochefort' }] },
      { name: 'Pyrénées-Atlantiques', code: '64', slug: 'pyrenees-atlantiques', cities: [{ name: 'Pau', slug: 'pau' }, { name: 'Bayonne', slug: 'bayonne' }, { name: 'Biarritz', slug: 'biarritz' }] },
      { name: 'Charente', code: '16', slug: 'charente', cities: [{ name: 'Angoulême', slug: 'angouleme' }, { name: 'Cognac', slug: 'cognac' }] },
      { name: 'Dordogne', code: '24', slug: 'dordogne', cities: [{ name: 'Périgueux', slug: 'perigueux' }, { name: 'Bergerac', slug: 'bergerac' }] },
      { name: 'Landes', code: '40', slug: 'landes', cities: [{ name: 'Mont-de-Marsan', slug: 'mont-de-marsan' }, { name: 'Dax', slug: 'dax' }] },
      { name: 'Lot-et-Garonne', code: '47', slug: 'lot-et-garonne', cities: [{ name: 'Agen', slug: 'agen' }] },
      { name: 'Deux-Sèvres', code: '79', slug: 'deux-sevres', cities: [{ name: 'Niort', slug: 'niort' }] },
      { name: 'Vienne', code: '86', slug: 'vienne', cities: [{ name: 'Poitiers', slug: 'poitiers' }] },
      { name: 'Corrèze', code: '19', slug: 'correze', cities: [{ name: 'Brive-la-Gaillarde', slug: 'brive-la-gaillarde' }, { name: 'Tulle', slug: 'tulle' }] },
      { name: 'Creuse', code: '23', slug: 'creuse', cities: [{ name: 'Guéret', slug: 'gueret' }] },
    ],
  },
  'hauts-de-france': {
    name: 'Hauts-de-France',
    description: 'Région dynamique du nord de la France avec un tissu artisanal dense.',
    departments: [
      { name: 'Nord', code: '59', slug: 'nord', cities: [{ name: 'Lille', slug: 'lille' }, { name: 'Roubaix', slug: 'roubaix' }, { name: 'Tourcoing', slug: 'tourcoing' }, { name: 'Dunkerque', slug: 'dunkerque' }] },
      { name: 'Pas-de-Calais', code: '62', slug: 'pas-de-calais', cities: [{ name: 'Calais', slug: 'calais' }, { name: 'Boulogne-sur-Mer', slug: 'boulogne-sur-mer' }, { name: 'Arras', slug: 'arras' }] },
      { name: 'Somme', code: '80', slug: 'somme', cities: [{ name: 'Amiens', slug: 'amiens' }] },
      { name: 'Oise', code: '60', slug: 'oise', cities: [{ name: 'Beauvais', slug: 'beauvais' }, { name: 'Compiègne', slug: 'compiegne' }] },
      { name: 'Aisne', code: '02', slug: 'aisne', cities: [{ name: 'Saint-Quentin', slug: 'saint-quentin' }, { name: 'Laon', slug: 'laon' }] },
    ],
  },
  'grand-est': {
    name: 'Grand Est',
    description: 'Carrefour européen, le Grand Est bénéficie d\'artisans aux savoir-faire reconnus.',
    departments: [
      { name: 'Bas-Rhin', code: '67', slug: 'bas-rhin', cities: [{ name: 'Strasbourg', slug: 'strasbourg' }] },
      { name: 'Moselle', code: '57', slug: 'moselle', cities: [{ name: 'Metz', slug: 'metz' }, { name: 'Thionville', slug: 'thionville' }] },
      { name: 'Haut-Rhin', code: '68', slug: 'haut-rhin', cities: [{ name: 'Mulhouse', slug: 'mulhouse' }, { name: 'Colmar', slug: 'colmar' }] },
      { name: 'Marne', code: '51', slug: 'marne', cities: [{ name: 'Reims', slug: 'reims' }, { name: 'Châlons-en-Champagne', slug: 'chalons-en-champagne' }] },
      { name: 'Meurthe-et-Moselle', code: '54', slug: 'meurthe-et-moselle', cities: [{ name: 'Nancy', slug: 'nancy' }] },
      { name: 'Ardennes', code: '08', slug: 'ardennes', cities: [{ name: 'Charleville-Mézières', slug: 'charleville-mezieres' }] },
      { name: 'Aube', code: '10', slug: 'aube', cities: [{ name: 'Troyes', slug: 'troyes' }] },
      { name: 'Vosges', code: '88', slug: 'vosges', cities: [{ name: 'Épinal', slug: 'epinal' }] },
      { name: 'Meuse', code: '55', slug: 'meuse', cities: [{ name: 'Bar-le-Duc', slug: 'bar-le-duc' }, { name: 'Verdun', slug: 'verdun' }] },
      { name: 'Haute-Marne', code: '52', slug: 'haute-marne', cities: [{ name: 'Chaumont', slug: 'chaumont' }] },
    ],
  },
  'pays-de-la-loire': {
    name: 'Pays de la Loire',
    description: 'Région atlantique dynamique avec un fort tissu artisanal.',
    departments: [
      { name: 'Loire-Atlantique', code: '44', slug: 'loire-atlantique', cities: [{ name: 'Nantes', slug: 'nantes' }, { name: 'Saint-Nazaire', slug: 'saint-nazaire' }, { name: 'Saint-Herblain', slug: 'saint-herblain' }] },
      { name: 'Maine-et-Loire', code: '49', slug: 'maine-et-loire', cities: [{ name: 'Angers', slug: 'angers' }, { name: 'Cholet', slug: 'cholet' }] },
      { name: 'Sarthe', code: '72', slug: 'sarthe', cities: [{ name: 'Le Mans', slug: 'le-mans' }] },
      { name: 'Vendée', code: '85', slug: 'vendee', cities: [{ name: 'La Roche-sur-Yon', slug: 'la-roche-sur-yon' }, { name: 'Les Sables-d\'Olonne', slug: 'les-sables-dolonne' }] },
      { name: 'Mayenne', code: '53', slug: 'mayenne', cities: [{ name: 'Laval', slug: 'laval' }] },
    ],
  },
  'bretagne': {
    name: 'Bretagne',
    description: 'Région à l\'identité forte avec des artisans attachés à la qualité.',
    departments: [
      { name: 'Ille-et-Vilaine', code: '35', slug: 'ille-et-vilaine', cities: [{ name: 'Rennes', slug: 'rennes' }, { name: 'Saint-Malo', slug: 'saint-malo' }] },
      { name: 'Finistère', code: '29', slug: 'finistere', cities: [{ name: 'Brest', slug: 'brest' }, { name: 'Quimper', slug: 'quimper' }] },
      { name: 'Morbihan', code: '56', slug: 'morbihan', cities: [{ name: 'Vannes', slug: 'vannes' }, { name: 'Lorient', slug: 'lorient' }] },
      { name: 'Côtes-d\'Armor', code: '22', slug: 'cotes-darmor', cities: [{ name: 'Saint-Brieuc', slug: 'saint-brieuc' }, { name: 'Lannion', slug: 'lannion' }] },
    ],
  },
  'normandie': {
    name: 'Normandie',
    description: 'Région historique avec un patrimoine bâti important nécessitant des artisans qualifiés.',
    departments: [
      { name: 'Seine-Maritime', code: '76', slug: 'seine-maritime', cities: [{ name: 'Le Havre', slug: 'le-havre' }, { name: 'Rouen', slug: 'rouen' }] },
      { name: 'Calvados', code: '14', slug: 'calvados', cities: [{ name: 'Caen', slug: 'caen' }] },
      { name: 'Manche', code: '50', slug: 'manche', cities: [{ name: 'Cherbourg-en-Cotentin', slug: 'cherbourg-en-cotentin' }, { name: 'Saint-Lô', slug: 'saint-lo' }] },
      { name: 'Eure', code: '27', slug: 'eure', cities: [{ name: 'Évreux', slug: 'evreux' }, { name: 'Vernon', slug: 'vernon' }] },
      { name: 'Orne', code: '61', slug: 'orne', cities: [{ name: 'Alençon', slug: 'alencon' }, { name: 'Flers', slug: 'flers' }] },
    ],
  },
  'bourgogne-franche-comte': {
    name: 'Bourgogne-Franche-Comté',
    description: 'Région viticole et industrielle avec un savoir-faire artisanal reconnu.',
    departments: [
      { name: 'Côte-d\'Or', code: '21', slug: 'cote-dor', cities: [{ name: 'Dijon', slug: 'dijon' }, { name: 'Beaune', slug: 'beaune' }] },
      { name: 'Doubs', code: '25', slug: 'doubs', cities: [{ name: 'Besançon', slug: 'besancon' }, { name: 'Montbéliard', slug: 'montbeliard' }] },
      { name: 'Saône-et-Loire', code: '71', slug: 'saone-et-loire', cities: [{ name: 'Chalon-sur-Saône', slug: 'chalon-sur-saone' }, { name: 'Mâcon', slug: 'macon' }] },
      { name: 'Jura', code: '39', slug: 'jura', cities: [{ name: 'Lons-le-Saunier', slug: 'lons-le-saunier' }, { name: 'Dole', slug: 'dole' }] },
      { name: 'Yonne', code: '89', slug: 'yonne', cities: [{ name: 'Auxerre', slug: 'auxerre' }, { name: 'Sens', slug: 'sens' }] },
      { name: 'Nièvre', code: '58', slug: 'nievre', cities: [{ name: 'Nevers', slug: 'nevers' }] },
      { name: 'Haute-Saône', code: '70', slug: 'haute-saone', cities: [{ name: 'Vesoul', slug: 'vesoul' }] },
      { name: 'Territoire de Belfort', code: '90', slug: 'territoire-de-belfort', cities: [{ name: 'Belfort', slug: 'belfort' }] },
    ],
  },
  'centre-val-de-loire': {
    name: 'Centre-Val de Loire',
    description: 'Région des châteaux de la Loire avec un patrimoine architectural exceptionnel.',
    departments: [
      { name: 'Loiret', code: '45', slug: 'loiret', cities: [{ name: 'Orléans', slug: 'orleans' }] },
      { name: 'Indre-et-Loire', code: '37', slug: 'indre-et-loire', cities: [{ name: 'Tours', slug: 'tours' }] },
      { name: 'Cher', code: '18', slug: 'cher', cities: [{ name: 'Bourges', slug: 'bourges' }] },
      { name: 'Eure-et-Loir', code: '28', slug: 'eure-et-loir', cities: [{ name: 'Chartres', slug: 'chartres' }, { name: 'Dreux', slug: 'dreux' }] },
      { name: 'Loir-et-Cher', code: '41', slug: 'loir-et-cher', cities: [{ name: 'Blois', slug: 'blois' }] },
      { name: 'Indre', code: '36', slug: 'indre', cities: [{ name: 'Châteauroux', slug: 'chateauroux' }] },
    ],
  },
  'corse': {
    name: 'Corse',
    description: 'Île de beauté avec des artisans aux savoir-faire traditionnels.',
    departments: [
      { name: 'Corse-du-Sud', code: '2A', slug: 'corse-du-sud', cities: [{ name: 'Ajaccio', slug: 'ajaccio' }, { name: 'Porto-Vecchio', slug: 'porto-vecchio' }] },
      { name: 'Haute-Corse', code: '2B', slug: 'haute-corse', cities: [{ name: 'Bastia', slug: 'bastia' }, { name: 'Corte', slug: 'corte' }] },
    ],
  },
  // DOM-TOM
  'guadeloupe': {
    name: 'Guadeloupe',
    description: 'Département d\'outre-mer des Antilles françaises.',
    departments: [
      { name: 'Guadeloupe', code: '971', slug: 'guadeloupe', cities: [{ name: 'Pointe-à-Pitre', slug: 'pointe-a-pitre' }, { name: 'Les Abymes', slug: 'les-abymes' }, { name: 'Basse-Terre', slug: 'basse-terre' }] },
    ],
  },
  'martinique': {
    name: 'Martinique',
    description: 'Île des Antilles françaises au patrimoine culturel riche.',
    departments: [
      { name: 'Martinique', code: '972', slug: 'martinique', cities: [{ name: 'Fort-de-France', slug: 'fort-de-france' }, { name: 'Le Lamentin', slug: 'le-lamentin' }] },
    ],
  },
  'guyane': {
    name: 'Guyane',
    description: 'Département d\'outre-mer en Amérique du Sud.',
    departments: [
      { name: 'Guyane', code: '973', slug: 'guyane', cities: [{ name: 'Cayenne', slug: 'cayenne' }, { name: 'Kourou', slug: 'kourou' }] },
    ],
  },
  'la-reunion': {
    name: 'La Réunion',
    description: 'Île de l\'océan Indien avec un dynamisme économique important.',
    departments: [
      { name: 'La Réunion', code: '974', slug: 'la-reunion', cities: [{ name: 'Saint-Denis', slug: 'saint-denis-reunion' }, { name: 'Saint-Paul', slug: 'saint-paul' }, { name: 'Saint-Pierre', slug: 'saint-pierre-reunion' }] },
    ],
  },
  'mayotte': {
    name: 'Mayotte',
    description: 'Plus jeune département français dans l\'océan Indien.',
    departments: [
      { name: 'Mayotte', code: '976', slug: 'mayotte', cities: [{ name: 'Mamoudzou', slug: 'mamoudzou' }, { name: 'Koungou', slug: 'koungou' }] },
    ],
  },
}

// Generate static params for all regions
export function generateStaticParams() {
  return Object.keys(regionsData).map((region) => ({
    region,
  }))
}

const services = [
  { name: 'Plombier', slug: 'plombier' },
  { name: 'Électricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Peintre', slug: 'peintre-en-batiment' },
  { name: 'Couvreur', slug: 'couvreur' },
]

interface PageProps {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = regionsData[regionSlug]

  if (!region) {
    return { title: 'Région non trouvée' }
  }

  return {
    title: `Artisans en ${region.name} - Trouvez un professionnel`,
    description: `Trouvez un artisan qualifié en ${region.name}. Plombiers, électriciens, serruriers et plus. Devis gratuits.`,
  }
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = regionsData[regionSlug]

  if (!region) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Régions', href: '/regions' },
              { label: region.name },
            ]}
          />
        </div>
      </div>

      {/* Hero - Premium Branding */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">{region.name}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">
            {region.description}
          </p>

          {/* Premium badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Avis clients authentiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Devis sous 24h</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{region.departments.length} départements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services rapides */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <span className="text-gray-600 font-medium py-2">Recherche rapide :</span>
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors"
              >
                {service.name} en {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Départements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Départements de la région {region.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {region.departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-sm text-gray-500">Département {dept.code}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {dept.cities.slice(0, 3).map((city) => (
                    <span key={city.slug} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {city.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d&apos;un artisan en {region.name} ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Voir aussi - Related Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Voir aussi</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Services populaires */}
            <div>
              <PopularServicesLinks showTitle={true} limit={6} />
            </div>

            {/* Autres régions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Autres régions</h3>
              <div className="space-y-2">
                {popularRegions
                  .filter(r => r.slug !== regionSlug)
                  .slice(0, 5)
                  .map((r) => (
                    <Link
                      key={r.slug}
                      href={`/regions/${r.slug}`}
                      className="block text-gray-600 hover:text-blue-600 text-sm py-1 transition-colors"
                    >
                      Artisans en {r.name}
                    </Link>
                  ))}
              </div>
              <Link
                href="/regions"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
              >
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Villes populaires */}
            <div>
              <PopularCitiesLinks showTitle={true} limit={6} />
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Footer */}
    </div>
  )
}
