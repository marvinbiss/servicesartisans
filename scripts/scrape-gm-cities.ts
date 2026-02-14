/**
 * Google Maps Scraping V3 — Par VILLES (top ~300 communes françaises)
 *
 * Au lieu de chercher 1 préfecture par département (96 résultats),
 * on cherche les ~300 plus grandes villes → 10x plus de résultats.
 *
 * - Multi-worker avec montée progressive (1 → max 5)
 * - Anti-doublon : skip phones déjà en DB + déjà assignés
 * - Matching + upload en temps réel
 * - Resume automatique
 *
 * Usage: npx tsx scripts/scrape-gm-cities.ts [--resume] [--max-workers N]
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { Pool as PgPool } from 'pg'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

const DATA_DIR = path.join(__dirname, '.gm-data')
const LISTINGS_FILE = path.join(DATA_DIR, 'gm-listings-cities.jsonl')
const PROGRESS_FILE = path.join(DATA_DIR, 'cities-progress.json')

const INITIAL_WORKERS = 1
const SCALE_INTERVAL_MS = 2 * 60 * 1000
const DELAY_PER_WORKER_MS = 5000
const SCRAPER_TIMEOUT_MS = 90000
const MAX_RETRIES = 2
const MATCH_THRESHOLD = 0.35

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ════════════════════════════
// TOP ~300 VILLES FRANÇAISES (par population, > 30k hab)
// ════════════════════════════
// Format: { name: 'Ville', dept: 'XX', cp: 'XXXXX' }
// cp = code postal principal (pour regrouper les arrondissements)

const CITIES: { name: string; dept: string; cp: string }[] = [
  // Île-de-France
  { name: 'Paris', dept: '75', cp: '75000' },
  { name: 'Boulogne-Billancourt', dept: '92', cp: '92100' },
  { name: 'Saint-Denis', dept: '93', cp: '93200' },
  { name: 'Argenteuil', dept: '95', cp: '95100' },
  { name: 'Montreuil', dept: '93', cp: '93100' },
  { name: 'Nanterre', dept: '92', cp: '92000' },
  { name: 'Créteil', dept: '94', cp: '94000' },
  { name: 'Vitry-sur-Seine', dept: '94', cp: '94400' },
  { name: 'Colombes', dept: '92', cp: '92700' },
  { name: 'Aubervilliers', dept: '93', cp: '93300' },
  { name: 'Asnières-sur-Seine', dept: '92', cp: '92600' },
  { name: 'Aulnay-sous-Bois', dept: '93', cp: '93600' },
  { name: 'Rueil-Malmaison', dept: '92', cp: '92500' },
  { name: 'Champigny-sur-Marne', dept: '94', cp: '94500' },
  { name: 'Saint-Maur-des-Fossés', dept: '94', cp: '94100' },
  { name: 'Drancy', dept: '93', cp: '93700' },
  { name: 'Noisy-le-Grand', dept: '93', cp: '93160' },
  { name: 'Issy-les-Moulineaux', dept: '92', cp: '92130' },
  { name: 'Cergy', dept: '95', cp: '95000' },
  { name: 'Évry-Courcouronnes', dept: '91', cp: '91000' },
  { name: 'Versailles', dept: '78', cp: '78000' },
  { name: 'Meaux', dept: '77', cp: '77100' },
  { name: 'Melun', dept: '77', cp: '77000' },
  { name: 'Sarcelles', dept: '95', cp: '95200' },
  { name: 'Bobigny', dept: '93', cp: '93000' },
  { name: 'Pantin', dept: '93', cp: '93500' },
  { name: 'Bondy', dept: '93', cp: '93140' },
  { name: 'Clamart', dept: '92', cp: '92140' },
  { name: 'Épinay-sur-Seine', dept: '93', cp: '93800' },
  { name: 'Sevran', dept: '93', cp: '93270' },
  { name: 'Sartrouville', dept: '78', cp: '78500' },
  { name: 'Massy', dept: '91', cp: '91300' },
  { name: 'Ivry-sur-Seine', dept: '94', cp: '94200' },
  { name: 'Chelles', dept: '77', cp: '77500' },
  { name: 'Maisons-Alfort', dept: '94', cp: '94700' },
  { name: 'Gennevilliers', dept: '92', cp: '92230' },
  { name: 'Saint-Ouen-sur-Seine', dept: '93', cp: '93400' },
  { name: 'Livry-Gargan', dept: '93', cp: '93190' },
  { name: 'Poissy', dept: '78', cp: '78300' },
  { name: 'Garges-lès-Gonesse', dept: '95', cp: '95140' },
  { name: 'Corbeil-Essonnes', dept: '91', cp: '91100' },

  // PACA
  { name: 'Marseille', dept: '13', cp: '13000' },
  { name: 'Nice', dept: '06', cp: '06000' },
  { name: 'Toulon', dept: '83', cp: '83000' },
  { name: 'Aix-en-Provence', dept: '13', cp: '13100' },
  { name: 'Avignon', dept: '84', cp: '84000' },
  { name: 'Antibes', dept: '06', cp: '06600' },
  { name: 'Cannes', dept: '06', cp: '06400' },
  { name: 'La Seyne-sur-Mer', dept: '83', cp: '83500' },
  { name: 'Hyères', dept: '83', cp: '83400' },
  { name: 'Fréjus', dept: '83', cp: '83600' },
  { name: 'Arles', dept: '13', cp: '13200' },
  { name: 'Grasse', dept: '06', cp: '06130' },
  { name: 'Martigues', dept: '13', cp: '13500' },
  { name: 'Cagnes-sur-Mer', dept: '06', cp: '06800' },
  { name: 'Aubagne', dept: '13', cp: '13400' },
  { name: 'Salon-de-Provence', dept: '13', cp: '13300' },
  { name: 'Istres', dept: '13', cp: '13800' },
  { name: 'Gap', dept: '05', cp: '05000' },
  { name: 'Draguignan', dept: '83', cp: '83300' },
  { name: 'Vitrolles', dept: '13', cp: '13127' },
  { name: 'Orange', dept: '84', cp: '84100' },
  { name: 'Carpentras', dept: '84', cp: '84200' },
  { name: 'Menton', dept: '06', cp: '06500' },
  { name: 'Vallauris', dept: '06', cp: '06220' },
  { name: 'Mandelieu-la-Napoule', dept: '06', cp: '06210' },
  { name: 'Digne-les-Bains', dept: '04', cp: '04000' },
  { name: 'Manosque', dept: '04', cp: '04100' },

  // Occitanie
  { name: 'Toulouse', dept: '31', cp: '31000' },
  { name: 'Montpellier', dept: '34', cp: '34000' },
  { name: 'Nîmes', dept: '30', cp: '30000' },
  { name: 'Perpignan', dept: '66', cp: '66000' },
  { name: 'Béziers', dept: '34', cp: '34500' },
  { name: 'Montauban', dept: '82', cp: '82000' },
  { name: 'Narbonne', dept: '11', cp: '11100' },
  { name: 'Albi', dept: '81', cp: '81000' },
  { name: 'Carcassonne', dept: '11', cp: '11000' },
  { name: 'Castres', dept: '81', cp: '81100' },
  { name: 'Sète', dept: '34', cp: '34200' },
  { name: 'Tarbes', dept: '65', cp: '65000' },
  { name: 'Alès', dept: '30', cp: '30100' },
  { name: 'Agde', dept: '34', cp: '34300' },
  { name: 'Lunel', dept: '34', cp: '34400' },
  { name: 'Rodez', dept: '12', cp: '12000' },
  { name: 'Auch', dept: '32', cp: '32000' },
  { name: 'Cahors', dept: '46', cp: '46000' },
  { name: 'Foix', dept: '09', cp: '09000' },
  { name: 'Muret', dept: '31', cp: '31600' },
  { name: 'Colomiers', dept: '31', cp: '31770' },
  { name: 'Tournefeuille', dept: '31', cp: '31170' },
  { name: 'Blagnac', dept: '31', cp: '31700' },

  // Auvergne-Rhône-Alpes
  { name: 'Lyon', dept: '69', cp: '69000' },
  { name: 'Saint-Étienne', dept: '42', cp: '42000' },
  { name: 'Grenoble', dept: '38', cp: '38000' },
  { name: 'Clermont-Ferrand', dept: '63', cp: '63000' },
  { name: 'Villeurbanne', dept: '69', cp: '69100' },
  { name: 'Annecy', dept: '74', cp: '74000' },
  { name: 'Valence', dept: '26', cp: '26000' },
  { name: 'Chambéry', dept: '73', cp: '73000' },
  { name: 'Bourg-en-Bresse', dept: '01', cp: '01000' },
  { name: 'Vénissieux', dept: '69', cp: '69200' },
  { name: 'Caluire-et-Cuire', dept: '69', cp: '69300' },
  { name: 'Saint-Priest', dept: '69', cp: '69800' },
  { name: 'Vaulx-en-Velin', dept: '69', cp: '69120' },
  { name: 'Bron', dept: '69', cp: '69500' },
  { name: 'Échirolles', dept: '38', cp: '38130' },
  { name: 'Saint-Martin-d\'Hères', dept: '38', cp: '38400' },
  { name: 'Thonon-les-Bains', dept: '74', cp: '74200' },
  { name: 'Annemasse', dept: '74', cp: '74100' },
  { name: 'Romans-sur-Isère', dept: '26', cp: '26100' },
  { name: 'Montélimar', dept: '26', cp: '26200' },
  { name: 'Roanne', dept: '42', cp: '42300' },
  { name: 'Le Puy-en-Velay', dept: '43', cp: '43000' },
  { name: 'Privas', dept: '07', cp: '07000' },
  { name: 'Aurillac', dept: '15', cp: '15000' },
  { name: 'Moulins', dept: '03', cp: '03000' },
  { name: 'Vichy', dept: '03', cp: '03200' },
  { name: 'Villefranche-sur-Saône', dept: '69', cp: '69400' },
  { name: 'Oyonnax', dept: '01', cp: '01100' },

  // Nouvelle-Aquitaine
  { name: 'Bordeaux', dept: '33', cp: '33000' },
  { name: 'Limoges', dept: '87', cp: '87000' },
  { name: 'Poitiers', dept: '86', cp: '86000' },
  { name: 'La Rochelle', dept: '17', cp: '17000' },
  { name: 'Pau', dept: '64', cp: '64000' },
  { name: 'Mérignac', dept: '33', cp: '33700' },
  { name: 'Pessac', dept: '33', cp: '33600' },
  { name: 'Angoulême', dept: '16', cp: '16000' },
  { name: 'Bayonne', dept: '64', cp: '64100' },
  { name: 'Niort', dept: '79', cp: '79000' },
  { name: 'Périgueux', dept: '24', cp: '24000' },
  { name: 'Agen', dept: '47', cp: '47000' },
  { name: 'Brive-la-Gaillarde', dept: '19', cp: '19100' },
  { name: 'Bergerac', dept: '24', cp: '24100' },
  { name: 'Mont-de-Marsan', dept: '40', cp: '40000' },
  { name: 'Dax', dept: '40', cp: '40100' },
  { name: 'Biarritz', dept: '64', cp: '64200' },
  { name: 'Saintes', dept: '17', cp: '17100' },
  { name: 'Rochefort', dept: '17', cp: '17300' },
  { name: 'Talence', dept: '33', cp: '33400' },
  { name: 'Guéret', dept: '23', cp: '23000' },
  { name: 'Tulle', dept: '19', cp: '19000' },
  { name: 'Châtellerault', dept: '86', cp: '86100' },
  { name: 'Villeneuve-sur-Lot', dept: '47', cp: '47300' },

  // Grand Est
  { name: 'Strasbourg', dept: '67', cp: '67000' },
  { name: 'Reims', dept: '51', cp: '51100' },
  { name: 'Metz', dept: '57', cp: '57000' },
  { name: 'Mulhouse', dept: '68', cp: '68100' },
  { name: 'Nancy', dept: '54', cp: '54000' },
  { name: 'Colmar', dept: '68', cp: '68000' },
  { name: 'Troyes', dept: '10', cp: '10000' },
  { name: 'Charleville-Mézières', dept: '08', cp: '08000' },
  { name: 'Épinal', dept: '88', cp: '88000' },
  { name: 'Thionville', dept: '57', cp: '57100' },
  { name: 'Haguenau', dept: '67', cp: '67500' },
  { name: 'Schiltigheim', dept: '67', cp: '67300' },
  { name: 'Châlons-en-Champagne', dept: '51', cp: '51000' },
  { name: 'Saint-Dizier', dept: '52', cp: '52100' },
  { name: 'Verdun', dept: '55', cp: '55100' },
  { name: 'Bar-le-Duc', dept: '55', cp: '55000' },
  { name: 'Vandœuvre-lès-Nancy', dept: '54', cp: '54500' },
  { name: 'Lunéville', dept: '54', cp: '54300' },
  { name: 'Sélestat', dept: '67', cp: '67600' },
  { name: 'Illkirch-Graffenstaden', dept: '67', cp: '67400' },
  { name: 'Forbach', dept: '57', cp: '57600' },
  { name: 'Sarreguemines', dept: '57', cp: '57200' },

  // Hauts-de-France
  { name: 'Lille', dept: '59', cp: '59000' },
  { name: 'Amiens', dept: '80', cp: '80000' },
  { name: 'Roubaix', dept: '59', cp: '59100' },
  { name: 'Tourcoing', dept: '59', cp: '59200' },
  { name: 'Dunkerque', dept: '59', cp: '59140' },
  { name: 'Beauvais', dept: '60', cp: '60000' },
  { name: 'Calais', dept: '62', cp: '62100' },
  { name: 'Arras', dept: '62', cp: '62000' },
  { name: 'Saint-Quentin', dept: '02', cp: '02100' },
  { name: 'Compiègne', dept: '60', cp: '60200' },
  { name: 'Valenciennes', dept: '59', cp: '59300' },
  { name: 'Lens', dept: '62', cp: '62300' },
  { name: 'Laon', dept: '02', cp: '02000' },
  { name: 'Boulogne-sur-Mer', dept: '62', cp: '62200' },
  { name: 'Douai', dept: '59', cp: '59500' },
  { name: 'Villeneuve-d\'Ascq', dept: '59', cp: '59650' },
  { name: 'Cambrai', dept: '59', cp: '59400' },
  { name: 'Maubeuge', dept: '59', cp: '59600' },
  { name: 'Creil', dept: '60', cp: '60100' },
  { name: 'Soissons', dept: '02', cp: '02200' },
  { name: 'Hénin-Beaumont', dept: '62', cp: '62110' },
  { name: 'Liévin', dept: '62', cp: '62800' },
  { name: 'Wattrelos', dept: '59', cp: '59150' },
  { name: 'Marcq-en-Barœul', dept: '59', cp: '59700' },
  { name: 'Abbeville', dept: '80', cp: '80100' },

  // Normandie
  { name: 'Rouen', dept: '76', cp: '76000' },
  { name: 'Caen', dept: '14', cp: '14000' },
  { name: 'Le Havre', dept: '76', cp: '76600' },
  { name: 'Évreux', dept: '27', cp: '27000' },
  { name: 'Cherbourg-en-Cotentin', dept: '50', cp: '50100' },
  { name: 'Dieppe', dept: '76', cp: '76200' },
  { name: 'Alençon', dept: '61', cp: '61000' },
  { name: 'Saint-Lô', dept: '50', cp: '50000' },
  { name: 'Lisieux', dept: '14', cp: '14100' },
  { name: 'Hérouville-Saint-Clair', dept: '14', cp: '14200' },
  { name: 'Sotteville-lès-Rouen', dept: '76', cp: '76300' },
  { name: 'Vernon', dept: '27', cp: '27200' },

  // Bretagne
  { name: 'Rennes', dept: '35', cp: '35000' },
  { name: 'Brest', dept: '29', cp: '29200' },
  { name: 'Quimper', dept: '29', cp: '29000' },
  { name: 'Lorient', dept: '56', cp: '56100' },
  { name: 'Vannes', dept: '56', cp: '56000' },
  { name: 'Saint-Brieuc', dept: '22', cp: '22000' },
  { name: 'Saint-Malo', dept: '35', cp: '35400' },
  { name: 'Lanester', dept: '56', cp: '56600' },
  { name: 'Fougères', dept: '35', cp: '35300' },
  { name: 'Lannion', dept: '22', cp: '22300' },
  { name: 'Concarneau', dept: '29', cp: '29900' },
  { name: 'Morlaix', dept: '29', cp: '29600' },

  // Pays de la Loire
  { name: 'Nantes', dept: '44', cp: '44000' },
  { name: 'Angers', dept: '49', cp: '49000' },
  { name: 'Le Mans', dept: '72', cp: '72000' },
  { name: 'Saint-Nazaire', dept: '44', cp: '44600' },
  { name: 'La Roche-sur-Yon', dept: '85', cp: '85000' },
  { name: 'Laval', dept: '53', cp: '53000' },
  { name: 'Cholet', dept: '49', cp: '49300' },
  { name: 'Saumur', dept: '49', cp: '49400' },
  { name: 'Les Sables-d\'Olonne', dept: '85', cp: '85100' },
  { name: 'Saint-Herblain', dept: '44', cp: '44800' },
  { name: 'Rezé', dept: '44', cp: '44400' },

  // Centre-Val de Loire
  { name: 'Tours', dept: '37', cp: '37000' },
  { name: 'Orléans', dept: '45', cp: '45000' },
  { name: 'Bourges', dept: '18', cp: '18000' },
  { name: 'Blois', dept: '41', cp: '41000' },
  { name: 'Chartres', dept: '28', cp: '28000' },
  { name: 'Châteauroux', dept: '36', cp: '36000' },
  { name: 'Joué-lès-Tours', dept: '37', cp: '37300' },
  { name: 'Dreux', dept: '28', cp: '28100' },
  { name: 'Vierzon', dept: '18', cp: '18100' },
  { name: 'Montargis', dept: '45', cp: '45200' },
  { name: 'Olivet', dept: '45', cp: '45160' },

  // Bourgogne-Franche-Comté
  { name: 'Dijon', dept: '21', cp: '21000' },
  { name: 'Besançon', dept: '25', cp: '25000' },
  { name: 'Belfort', dept: '90', cp: '90000' },
  { name: 'Chalon-sur-Saône', dept: '71', cp: '71100' },
  { name: 'Auxerre', dept: '89', cp: '89000' },
  { name: 'Nevers', dept: '58', cp: '58000' },
  { name: 'Mâcon', dept: '71', cp: '71000' },
  { name: 'Le Creusot', dept: '71', cp: '71200' },
  { name: 'Sens', dept: '89', cp: '89100' },
  { name: 'Montbéliard', dept: '25', cp: '25200' },
  { name: 'Vesoul', dept: '70', cp: '70000' },
  { name: 'Dole', dept: '39', cp: '39100' },
  { name: 'Lons-le-Saunier', dept: '39', cp: '39000' },
  { name: 'Beaune', dept: '21', cp: '21200' },

  // Corse
  { name: 'Ajaccio', dept: '2A', cp: '20000' },
  { name: 'Bastia', dept: '2B', cp: '20200' },
  { name: 'Porto-Vecchio', dept: '2A', cp: '20137' },

  // DOM
  { name: 'Saint-Denis', dept: '974', cp: '97400' },
  { name: 'Saint-Pierre', dept: '974', cp: '97410' },
  { name: 'Fort-de-France', dept: '972', cp: '97200' },
  { name: 'Pointe-à-Pitre', dept: '971', cp: '97110' },
  { name: 'Les Abymes', dept: '971', cp: '97139' },
  { name: 'Le Tampon', dept: '974', cp: '97430' },
  { name: 'Saint-Paul', dept: '974', cp: '97460' },
  { name: 'Le Port', dept: '974', cp: '97420' },
  { name: 'Saint-Louis', dept: '974', cp: '97450' },
]

// 13 trades
const GM_TRADES: { key: string; query: string; label: string }[] = [
  { key: 'plombier', query: 'plombier', label: 'Plombier' },
  { key: 'electricien', query: 'électricien', label: 'Électricien' },
  { key: 'chauffagiste', query: 'chauffagiste', label: 'Chauffagiste' },
  { key: 'menuisier', query: 'menuisier', label: 'Menuisier' },
  { key: 'serrurier', query: 'serrurier', label: 'Serrurier' },
  { key: 'couvreur', query: 'couvreur', label: 'Couvreur' },
  { key: 'macon', query: 'maçon', label: 'Maçon' },
  { key: 'peintre', query: 'peintre en bâtiment', label: 'Peintre' },
  { key: 'carreleur', query: 'carreleur', label: 'Carreleur' },
  { key: 'charpentier', query: 'charpentier', label: 'Charpentier' },
  { key: 'platrier', query: 'plâtrier plaquiste', label: 'Plâtrier' },
  { key: 'facade', query: 'façadier ravalement', label: 'Façadier' },
  { key: 'terrassier', query: 'terrassement', label: 'Terrassier' },
]

const COMMON_WORDS = new Set([
  'plomberie','plombier','chauffage','chauffagiste','electricite','electricien',
  'peinture','peintre','menuiserie','menuisier','maconnerie','macon',
  'carrelage','carreleur','couverture','couvreur','serrurerie','serrurier',
  'isolation','platrier','platrerie','renovation','batiment','travaux',
  'construction','entreprise','artisan','services','service','general',
  'generale','multi','pro','plus','france','sud','nord','est','ouest',
  'climatisation','terrassement','demolition','assainissement','domotique',
  'ramonage','etancheite','depannage','paysagiste','vitrier',
  'charpentier','charpente','toiture','facade','ravalement','enduit','cloture',
  'amenagement','interieur','exterieur','habitat','logement','maison',
  'techni','technique','professionnel','groupe','agence','cabinet','atelier','bureau',
  'facades','facadier','terrassier','plaquiste',
])

// ════════════════════════════
// TYPES & STATE
// ════════════════════════════

interface GMListing {
  gmId: string; name: string; phone?: string; rating?: number
  reviewCount?: number; website?: string; trade: string; deptCode: string; city: string
}
interface Artisan {
  id: string; name: string; normFull: string; normComm: string
  phone: string | null; rating: number; reviews: number
}

let shuttingDown = false
const startTime = Date.now()
const stats = {
  combosProcessed: 0, combosTotal: 0,
  listingsFound: 0, newPhones: 0, newRatings: 0, newWebsites: 0,
  duplicatesSkipped: 0, errors: 0, apiCredits: 0,
  activeWorkers: 0, maxWorkers: 0,
}
const knownPhones = new Set<string>()
const assignedArtisans = new Set<string>()

// ════════════════════════════
// HELPERS
// ════════════════════════════

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
function fmt(n: number): string { return n.toLocaleString('fr-FR') }
function elapsed(): string {
  const s = Math.floor((Date.now() - startTime) / 1000)
  const m = Math.floor(s / 60); const h = Math.floor(m / 60)
  return h > 0 ? `${h}h${m%60}m` : `${m}m${s%60}s`
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let c = raw.replace(/[^\d+]/g, '')
  if (c.startsWith('+33')) c = '0' + c.substring(3)
  if (c.startsWith('0033')) c = '0' + c.substring(4)
  if (!/^0[1-9]\d{8}$/.test(c)) return null
  if (c.startsWith('089') || c.startsWith('036')) return null
  return c
}

function normalizeText(t: string): string {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi, '')
    .replace(/\([^)]*\)/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractCommercial(raw: string): string {
  const m = raw.match(/\(([^)]+)\)/g)
  if (!m || m.length === 0) return ''
  return m[m.length - 1].replace(/[()]/g, '').trim()
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  try {
    const p = new URL(url)
    if (['google.com','google.fr','facebook.com','instagram.com','twitter.com','linkedin.com','x.com','pagesjaunes.fr'].some(d => p.hostname.includes(d))) return null
    return p.toString()
  } catch { return null }
}

function hashId(trade: string, city: string, name: string): string {
  const str = `${trade}-${city}-${name.toLowerCase().trim()}`
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return `gmc-${Math.abs(h).toString(36)}`
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length; if (!b.length) return a.length
  const mx: number[][] = []
  for (let i = 0; i <= b.length; i++) mx[i] = [i]
  for (let j = 0; j <= a.length; j++) mx[0][j] = j
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      mx[i][j] = Math.min(mx[i-1][j]+1, mx[i][j-1]+1, mx[i-1][j-1]+(b[i-1]===a[j-1]?0:1))
  return mx[b.length][a.length]
}

function nameSimilarity(a: string, b: string): number {
  const tA = a.split(' ').filter(t => t.length > 1)
  const tB = b.split(' ').filter(t => t.length > 1)
  if (!tA.length || !tB.length) return 0
  let overlap = 0
  const matched = new Set<string>()
  for (const t of tA) { if (tB.includes(t) && !matched.has(t)) { overlap++; matched.add(t) } }
  const umA = tA.filter(t => !tB.includes(t)), umB = tB.filter(t => !matched.has(t))
  for (const wa of umA) {
    let best = 0, bi = -1
    for (let i = 0; i < umB.length; i++) {
      if (matched.has(umB[i])) continue
      const f = (wa === umB[i]) ? 1 : (wa.length >= 3 && umB[i].length >= 3 && levenshtein(wa, umB[i]) <= (Math.max(wa.length, umB[i].length) >= 7 ? 2 : 1)) ? 0.8 : 0
      if (f > best) { best = f; bi = i }
    }
    if (best > 0 && bi >= 0) { overlap += best; matched.add(umB[bi]) }
  }
  if (overlap === 0) for (const ta of tA) for (const tb of tB)
    if (ta !== tb && ta.length >= 4 && tb.length >= 4 && (tb.includes(ta) || ta.includes(tb))) overlap += 0.5
  return overlap / new Set([...tA, ...tB]).size
}

// ════════════════════════════
// HTML PARSING
// ════════════════════════════

function decodeHtml(s: string): string {
  return s.replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"')
    .replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;|\xa0/g,' ').replace(/\\u([\da-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
}

function parseGoogleMaps(html: string, trade: string, dept: string, city: string): GMListing[] {
  const listings: GMListing[] = []; const seen = new Set<string>()
  const dirRx = /aria-label="Obtenir un itin.raire vers ([^"]{2,80})"/g
  let m
  while ((m = dirRx.exec(html)) !== null) {
    const name = decodeHtml(m[1]).trim()
    if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
    const ctx = html.substring(Math.max(0, m.index - 3000), m.index)
    let phone: string | undefined
    const pms = [...ctx.matchAll(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/g)]
    if (pms.length > 0) { const n = normalizePhone(pms[pms.length-1][1]); if (n && !/^09[59]/.test(n)) phone = n }
    let rating: number | undefined, reviewCount: number | undefined
    const ctxC = ctx.replace(/&nbsp;|\xa0|\u00a0/g,' ')
    const rms = [...ctxC.matchAll(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/g)]
    if (rms.length > 0) { rating = parseFloat(rms[rms.length-1][1].replace(',','.')); reviewCount = parseInt(rms[rms.length-1][2].replace(/\s/g,'')) }
    let website: string | undefined
    const ne = name.substring(0,20).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')
    const sa = html.substring(Math.max(0, m.index - 3000), Math.min(html.length, m.index + 2000))
    const ws = sa.match(new RegExp(`aria-label="Visiter le site Web de[^"]*${ne}[^"]*"[^>]*href="([^"]+)"`,'i'))
      || sa.match(new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${ne}`,'i'))
    if (ws) website = normalizeWebsite(ws[1]) || undefined
    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,city,name), name, phone, rating, reviewCount, website, trade, deptCode: dept, city })
  }
  const bizRx = /class="[^"]*hfpxzc[^"]*"[^>]*aria-label="([^"]{3,80})"/g
  while ((m = bizRx.exec(html)) !== null) {
    const name = decodeHtml(m[1]).trim()
    if (!name || seen.has(name.toLowerCase())) continue
    if (/^(résultats|filtres|réduire|plan|en savoir|obtenir|visiter)/i.test(name)) continue
    const ctx = html.substring(m.index, Math.min(html.length, m.index + 3000))
    let phone: string | undefined
    const pm = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (pm) { const n = normalizePhone(pm[1]); if (n && !/^09[59]/.test(n)) phone = n }
    let rating: number | undefined, reviewCount: number | undefined
    const ctxC = ctx.replace(/&nbsp;|\xa0/g,' ')
    const rm = ctxC.match(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/)
    if (rm) { rating = parseFloat(rm[1].replace(',','.')); reviewCount = parseInt(rm[2].replace(/\s/g,'')) }
    let website: string | undefined
    const ne = name.substring(0,20).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')
    const ws2 = ctx.match(new RegExp(`aria-label="Visiter le site Web de[^"]*${ne}[^"]*"[^>]*href="([^"]+)"`,'i'))
      || ctx.match(new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${ne}`,'i'))
    if (ws2) website = normalizeWebsite(ws2[1]) || undefined
    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,city,name), name, phone, rating, reviewCount, website, trade, deptCode: dept, city })
  }
  return listings
}

function parseGoogleSearch(html: string, trade: string, dept: string, city: string): GMListing[] {
  const listings: GMListing[] = []; const seen = new Set<string>()
  const nameRx = /class="[^"]*OSrXXb[^"]*"[^>]*>([^<]{3,80})</g
  let m
  while ((m = nameRx.exec(html)) !== null) {
    const name = decodeHtml(m[1].trim())
    if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
    if (/^(entreprises?|résultats|recherche|plus de|voir|afficher)/i.test(name)) continue
    const ctx = html.substring(m.index, Math.min(html.length, m.index + 1500))
    let phone: string | undefined
    const pm = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (pm) { const n = normalizePhone(pm[1]); if (n) phone = n }
    let rating: number | undefined, reviewCount: number | undefined
    const rm = ctx.match(/(\d[,.]\d)\s*(?:étoiles?|stars?|<)/)
    if (rm) rating = parseFloat(rm[1].replace(',','.'))
    const rc = ctx.match(/\((\d[\d\s.,]*)\)/)
    if (rc) { const c = rc[1].replace(/[\s.,]/g,''); if (/^\d+$/.test(c)) reviewCount = parseInt(c) }
    let website: string | undefined
    const ws = ctx.match(/href="(https?:\/\/(?!www\.google)[^"]{5,200})"/)
    if (ws) website = normalizeWebsite(ws[1]) || undefined
    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,city,name), name, phone, rating, reviewCount, website, trade, deptCode: dept, city })
  }
  return listings
}

// ════════════════════════════
// SCRAPER API
// ════════════════════════════

async function fetchUrl(url: string, render: boolean, retry = 0): Promise<string | null> {
  const credits = render ? 10 : 5
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}${render ? '&render=true' : ''}&country_code=fr`
  try {
    const res = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.apiCredits += credits
    if (res.status === 429) { await sleep(15000); if (retry < MAX_RETRIES) return fetchUrl(url, render, retry + 1); return null }
    if (res.status === 500 || res.status === 403) { if (retry < MAX_RETRIES) { await sleep(8000); return fetchUrl(url, render, retry + 1) } return null }
    if (res.status >= 400) return ''
    const html = await res.text()
    if (html.length < 2000) { if (retry < MAX_RETRIES) { await sleep(10000); return fetchUrl(url, render, retry + 1) } return null }
    return html
  } catch (err: any) { stats.errors++; if (retry < MAX_RETRIES) { await sleep(5000); return fetchUrl(url, render, retry + 1) } return null }
}

// ════════════════════════════
// ARTISAN CACHE + MATCHING
// ════════════════════════════

const artisanCache = new Map<string, Artisan[]>()

async function loadArtisans(db: PgPool, dept: string): Promise<Artisan[]> {
  if (artisanCache.has(dept)) return artisanCache.get(dept)!
  const r = await db.query(
    `SELECT id, name, phone, rating_average, review_count FROM providers
     WHERE address_department = $1 AND is_active = true AND source = 'annuaire_entreprises'`, [dept]
  )
  const artisans: Artisan[] = r.rows.map((row: any) => ({
    id: row.id, name: row.name, phone: row.phone,
    normFull: normalizeText(row.name),
    normComm: extractCommercial(row.name) ? normalizeText(extractCommercial(row.name)) : '',
    rating: row.rating_average || 0, reviews: row.review_count || 0,
  }))
  artisanCache.set(dept, artisans)
  if (artisanCache.size > 20) { const k = artisanCache.keys().next().value; if (k) artisanCache.delete(k) }
  return artisans
}

function matchListing(listing: GMListing, artisans: Artisan[]): Artisan | null {
  const normGM = normalizeText(listing.name)
  if (normGM.length < 2) return null
  const distinctive = normGM.split(' ').filter(w => w.length >= 3 && !COMMON_WORDS.has(w))
  const terms = [normGM.split(' ').filter(w => w.length >= 2).slice(0, 2).join(' '), ...distinctive].filter(t => t.length >= 2)
  let best: { a: Artisan; score: number } | null = null
  for (const term of terms) {
    for (const a of artisans) {
      if (assignedArtisans.has(a.id)) continue
      if (!a.normFull.includes(term) && !a.normComm.includes(term)) continue
      const s1 = nameSimilarity(normGM, a.normFull)
      const s2 = a.normComm ? nameSimilarity(normGM, a.normComm) : 0
      const score = Math.max(s1, s2)
      if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { a, score }
    }
  }
  return best ? best.a : null
}

// ════════════════════════════
// WORKER
// ════════════════════════════

async function processCombo(
  db: PgPool, trade: typeof GM_TRADES[0], city: typeof CITIES[0], workerId: number
): Promise<{ phones: number; ratings: number; websites: number; listings: number }> {
  const result = { phones: 0, ratings: 0, websites: 0, listings: 0 }

  // 1) Google Maps search
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(trade.query + ' ' + city.name)}/`
  const mapsHtml = await fetchUrl(mapsUrl, true)
  let allListings: GMListing[] = []
  if (mapsHtml) allListings.push(...parseGoogleMaps(mapsHtml, trade.key, city.dept, city.name))

  await sleep(DELAY_PER_WORKER_MS)

  // 2) Google Search
  const searchUrl = `https://www.google.fr/search?q=${encodeURIComponent(trade.query + ' ' + city.name + ' téléphone')}&hl=fr&gl=fr&num=20`
  const searchHtml = await fetchUrl(searchUrl, false)
  if (searchHtml) {
    const sl = parseGoogleSearch(searchHtml, trade.key, city.dept, city.name)
    const existing = new Set(allListings.map(l => l.name.toLowerCase()))
    for (const s of sl) { if (!existing.has(s.name.toLowerCase())) allListings.push(s) }
  }

  // Dedup by phone
  const seenP = new Set<string>()
  const unique: GMListing[] = []
  for (const l of allListings) {
    if (l.phone && seenP.has(l.phone)) continue
    if (l.phone) seenP.add(l.phone)
    unique.push(l)
  }
  result.listings = unique.length

  // Save
  if (unique.length > 0) fs.appendFileSync(LISTINGS_FILE, unique.map(l => JSON.stringify(l)).join('\n') + '\n')

  // Match + Upload
  const artisans = await loadArtisans(db, city.dept)
  const updates: { id: string; phone?: string; rating?: number; reviews?: number; website?: string }[] = []

  for (const listing of unique) {
    const normPhone = listing.phone ? normalizePhone(listing.phone) : null

    if (normPhone && knownPhones.has(normPhone)) {
      stats.duplicatesSkipped++
      if ((listing.rating && listing.rating >= 1 && listing.rating <= 5 && listing.reviewCount) || listing.website) {
        const art = artisans.find(a => a.phone === normPhone && !assignedArtisans.has(a.id))
        if (art) {
          const upd: any = { id: art.id }
          if (listing.rating && listing.rating >= 1 && listing.rating <= 5 && art.rating === 0) { upd.rating = listing.rating; upd.reviews = listing.reviewCount }
          if (listing.website) upd.website = normalizeWebsite(listing.website) || undefined
          if (upd.rating || upd.website) { updates.push(upd); assignedArtisans.add(art.id); if (upd.rating) result.ratings++; if (upd.website) result.websites++ }
        }
      }
      continue
    }

    const phoneTarget = normPhone ? artisans.filter(a => !a.phone) : []
    const matched = normPhone ? matchListing(listing, phoneTarget) : null

    if (matched && normPhone) {
      const upd: any = { id: matched.id, phone: normPhone }
      if (listing.rating && listing.rating >= 1 && listing.rating <= 5) { upd.rating = listing.rating; if (listing.reviewCount) upd.reviews = listing.reviewCount }
      if (listing.website) upd.website = normalizeWebsite(listing.website) || undefined
      updates.push(upd); knownPhones.add(normPhone); assignedArtisans.add(matched.id)
      result.phones++; if (upd.rating) result.ratings++; if (upd.website) result.websites++
    } else if (listing.rating || listing.website) {
      const enrichTarget = artisans.filter(a => !assignedArtisans.has(a.id))
      const enrichMatch = matchListing(listing, enrichTarget)
      if (enrichMatch) {
        const upd: any = { id: enrichMatch.id }
        if (listing.rating && listing.rating >= 1 && listing.rating <= 5 && enrichMatch.rating === 0) { upd.rating = listing.rating; upd.reviews = listing.reviewCount }
        if (listing.website) upd.website = normalizeWebsite(listing.website) || undefined
        if (upd.rating || upd.website) { updates.push(upd); assignedArtisans.add(enrichMatch.id); if (upd.rating) result.ratings++; if (upd.website) result.websites++ }
      }
    }
    if (normPhone) knownPhones.add(normPhone)
  }

  // Upload
  for (const u of updates) {
    try {
      const sets: string[] = []; const params: any[] = []; let pi = 1
      if (u.phone) { sets.push(`phone=$${pi++}`); params.push(u.phone) }
      if (u.rating) { sets.push(`rating_average=$${pi++}`); params.push(u.rating); sets.push(`review_count=$${pi++}`); params.push(u.reviews || 0) }
      if (u.website) { sets.push(`website=COALESCE(website,$${pi++})`); params.push(u.website) }
      if (sets.length === 0) continue
      params.push(u.id)
      const where = u.phone ? `id=$${pi} AND phone IS NULL` : `id=$${pi}`
      await db.query(`UPDATE providers SET ${sets.join(',')} WHERE ${where}`, params)
    } catch { stats.errors++ }
  }

  return result
}

// ════════════════════════════
// ORCHESTRATOR
// ════════════════════════════

async function main() {
  const args = process.argv.slice(2)
  const resume = args.includes('--resume')
  const maxWorkersArg = args.includes('--max-workers') ? parseInt(args[args.indexOf('--max-workers') + 1]) : 5

  if (!SCRAPER_API_KEY) { console.error('SCRAPER_API_KEY manquant'); process.exit(1) }

  console.log('\n' + '═'.repeat(60))
  console.log('  GOOGLE MAPS CITY SCRAPER')
  console.log(`  ${CITIES.length} villes × ${GM_TRADES.length} métiers = ${fmt(CITIES.length * GM_TRADES.length)} combos`)
  console.log('  Workers: 1 → max ' + maxWorkersArg)
  console.log('═'.repeat(60))

  const db = new PgPool({
    connectionString: PG_URL, ssl: { rejectUnauthorized: false },
    max: 5, keepAlive: true, keepAliveInitialDelayMillis: 10000,
    options: '-c statement_timeout=120000',
  })
  db.on('error', (err: any) => console.log('  ⚠ DB Pool:', err.message))

  // Load existing phones
  console.log('\n  Chargement phones existants...')
  const ep = await db.query('SELECT DISTINCT phone FROM providers WHERE phone IS NOT NULL AND is_active = true')
  for (const r of ep.rows) knownPhones.add(r.phone)
  console.log(`  ${fmt(knownPhones.size)} phones en base`)

  // Load progress
  let completedCombos = new Set<string>()
  if (resume && fs.existsSync(PROGRESS_FILE)) {
    const prev = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    completedCombos = new Set(prev.completedCombos || [])
    stats.combosProcessed = prev.stats?.combosProcessed || 0
    stats.newPhones = prev.stats?.newPhones || 0
    stats.newRatings = prev.stats?.newRatings || 0
    stats.newWebsites = prev.stats?.newWebsites || 0
    stats.apiCredits = prev.stats?.apiCredits || 0
    console.log(`  ${fmt(completedCombos.size)} combos déjà faits`)
  }

  // Build queue — prioritize cities with most artisans (biggest departments first)
  const queue: { trade: typeof GM_TRADES[0]; city: typeof CITIES[0] }[] = []
  for (const city of CITIES) {
    for (const trade of GM_TRADES) {
      const key = `${trade.key}@${city.name}`
      if (!completedCombos.has(key)) queue.push({ trade, city })
    }
  }

  stats.combosTotal = queue.length
  console.log(`  ${fmt(queue.length)} combos restants\n`)

  if (queue.length === 0) { console.log('  Tout fait !'); await db.end(); return }

  process.on('SIGINT', () => { if (shuttingDown) process.exit(1); console.log('\n  Arrêt gracieux...'); shuttingDown = true })

  let queueIdx = 0
  function getNext() { return (queueIdx < queue.length && !shuttingDown) ? queue[queueIdx++] : null }

  async function worker(id: number) {
    while (!shuttingDown) {
      const combo = getNext()
      if (!combo) break
      const key = `${combo.trade.key}@${combo.city.name}`
      try {
        const r = await processCombo(db, combo.trade, combo.city, id)
        completedCombos.add(key); stats.combosProcessed++
        stats.listingsFound += r.listings; stats.newPhones += r.phones; stats.newRatings += r.ratings; stats.newWebsites += r.websites
        const pct = (stats.combosProcessed / stats.combosTotal * 100).toFixed(1)
        console.log(
          `  W${id} [${stats.combosProcessed}/${stats.combosTotal}] ${combo.trade.label} ${combo.city.name}` +
          ` → ${r.listings}L +${r.phones}T +${r.ratings}★ +${r.websites}W` +
          ` | ${fmt(stats.newPhones)}T ${fmt(stats.newRatings)}★ ${fmt(stats.newWebsites)}W` +
          ` | ${pct}% ${elapsed()} W=${stats.activeWorkers}`
        )
      } catch (err: any) { stats.errors++; console.log(`  W${id} ⚠ ${key}: ${err.message}`) }
      if (stats.combosProcessed % 5 === 0) saveProgress(completedCombos)
      await sleep(DELAY_PER_WORKER_MS)
    }
    stats.activeWorkers--
  }

  function saveProgress(done: Set<string>) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      completedCombos: Array.from(done),
      stats: { combosProcessed: stats.combosProcessed, newPhones: stats.newPhones, newRatings: stats.newRatings, newWebsites: stats.newWebsites, apiCredits: stats.apiCredits, listingsFound: stats.listingsFound, errors: stats.errors },
    }))
  }

  // Progressive scale-up
  const maxWorkers = Math.min(maxWorkersArg, Math.ceil(queue.length / 10))
  stats.maxWorkers = maxWorkers
  const workers: Promise<void>[] = []
  console.log(`  Démarrage Worker 1...`)
  stats.activeWorkers = 1; workers.push(worker(1))

  let nextId = 2
  const scaleTimer = setInterval(() => {
    if (shuttingDown || nextId > maxWorkers || queueIdx >= queue.length) { clearInterval(scaleTimer); return }
    if (stats.errors > stats.combosProcessed * 0.2) { console.log(`  ⚠ Trop d'erreurs, pas de scale-up`); return }
    stats.activeWorkers++; console.log(`  ↑ Worker ${nextId} démarré (${stats.activeWorkers} actifs)`)
    workers.push(worker(nextId++))
  }, SCALE_INTERVAL_MS)

  await Promise.all(workers)
  clearInterval(scaleTimer)
  saveProgress(completedCombos)
  await db.end()

  console.log('\n' + '═'.repeat(60))
  console.log('  RÉSULTAT — GOOGLE MAPS CITY SCRAPER')
  console.log('═'.repeat(60))
  console.log(`  Durée:              ${elapsed()}`)
  console.log(`  Combos:             ${fmt(stats.combosProcessed)}`)
  console.log(`  Listings:           ${fmt(stats.listingsFound)}`)
  console.log(`  Nouveaux phones:    +${fmt(stats.newPhones)}`)
  console.log(`  Nouveaux ratings:   +${fmt(stats.newRatings)}`)
  console.log(`  Nouveaux websites:  +${fmt(stats.newWebsites)}`)
  console.log(`  Doublons skip:      ${fmt(stats.duplicatesSkipped)}`)
  console.log(`  Erreurs:            ${stats.errors}`)
  console.log(`  Crédits API:        ~${fmt(stats.apiCredits)}`)
  console.log('═'.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
