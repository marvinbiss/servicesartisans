/**
 * Mapping département FR → région officielle (INSEE 2026).
 *
 * Source : décret 2015-1689 (réforme territoriale 2016) + DOM-TOM.
 * Couvre les 101 départements + 5 DOM-TOM + Corse (2A/2B).
 *
 * Utilisé par scripts/fix-address-region-2026-05.ts pour réparer les ~30K
 * artisans RGE avec address_region = NULL (Audit F 2026-05-03).
 */

export const DEPARTEMENT_TO_REGION: Record<string, string> = {
  // Auvergne-Rhône-Alpes
  '01': 'Auvergne-Rhône-Alpes',
  '03': 'Auvergne-Rhône-Alpes',
  '07': 'Auvergne-Rhône-Alpes',
  '15': 'Auvergne-Rhône-Alpes',
  '26': 'Auvergne-Rhône-Alpes',
  '38': 'Auvergne-Rhône-Alpes',
  '42': 'Auvergne-Rhône-Alpes',
  '43': 'Auvergne-Rhône-Alpes',
  '63': 'Auvergne-Rhône-Alpes',
  '69': 'Auvergne-Rhône-Alpes',
  '73': 'Auvergne-Rhône-Alpes',
  '74': 'Auvergne-Rhône-Alpes',

  // Bourgogne-Franche-Comté
  '21': 'Bourgogne-Franche-Comté',
  '25': 'Bourgogne-Franche-Comté',
  '39': 'Bourgogne-Franche-Comté',
  '58': 'Bourgogne-Franche-Comté',
  '70': 'Bourgogne-Franche-Comté',
  '71': 'Bourgogne-Franche-Comté',
  '89': 'Bourgogne-Franche-Comté',
  '90': 'Bourgogne-Franche-Comté',

  // Bretagne
  '22': 'Bretagne',
  '29': 'Bretagne',
  '35': 'Bretagne',
  '56': 'Bretagne',

  // Centre-Val de Loire
  '18': 'Centre-Val de Loire',
  '28': 'Centre-Val de Loire',
  '36': 'Centre-Val de Loire',
  '37': 'Centre-Val de Loire',
  '41': 'Centre-Val de Loire',
  '45': 'Centre-Val de Loire',

  // Corse
  '2A': 'Corse',
  '2B': 'Corse',
  '20': 'Corse', // alias historique parfois utilisé

  // Grand Est
  '08': 'Grand Est',
  '10': 'Grand Est',
  '51': 'Grand Est',
  '52': 'Grand Est',
  '54': 'Grand Est',
  '55': 'Grand Est',
  '57': 'Grand Est',
  '67': 'Grand Est',
  '68': 'Grand Est',
  '88': 'Grand Est',

  // Hauts-de-France
  '02': 'Hauts-de-France',
  '59': 'Hauts-de-France',
  '60': 'Hauts-de-France',
  '62': 'Hauts-de-France',
  '80': 'Hauts-de-France',

  // Île-de-France
  '75': 'Île-de-France',
  '77': 'Île-de-France',
  '78': 'Île-de-France',
  '91': 'Île-de-France',
  '92': 'Île-de-France',
  '93': 'Île-de-France',
  '94': 'Île-de-France',
  '95': 'Île-de-France',

  // Normandie
  '14': 'Normandie',
  '27': 'Normandie',
  '50': 'Normandie',
  '61': 'Normandie',
  '76': 'Normandie',

  // Nouvelle-Aquitaine
  '16': 'Nouvelle-Aquitaine',
  '17': 'Nouvelle-Aquitaine',
  '19': 'Nouvelle-Aquitaine',
  '23': 'Nouvelle-Aquitaine',
  '24': 'Nouvelle-Aquitaine',
  '33': 'Nouvelle-Aquitaine',
  '40': 'Nouvelle-Aquitaine',
  '47': 'Nouvelle-Aquitaine',
  '64': 'Nouvelle-Aquitaine',
  '79': 'Nouvelle-Aquitaine',
  '86': 'Nouvelle-Aquitaine',
  '87': 'Nouvelle-Aquitaine',

  // Occitanie
  '09': 'Occitanie',
  '11': 'Occitanie',
  '12': 'Occitanie',
  '30': 'Occitanie',
  '31': 'Occitanie',
  '32': 'Occitanie',
  '34': 'Occitanie',
  '46': 'Occitanie',
  '48': 'Occitanie',
  '65': 'Occitanie',
  '66': 'Occitanie',
  '81': 'Occitanie',
  '82': 'Occitanie',

  // Pays de la Loire
  '44': 'Pays de la Loire',
  '49': 'Pays de la Loire',
  '53': 'Pays de la Loire',
  '72': 'Pays de la Loire',
  '85': 'Pays de la Loire',

  // Provence-Alpes-Côte d'Azur
  '04': "Provence-Alpes-Côte d'Azur",
  '05': "Provence-Alpes-Côte d'Azur",
  '06': "Provence-Alpes-Côte d'Azur",
  '13': "Provence-Alpes-Côte d'Azur",
  '83': "Provence-Alpes-Côte d'Azur",
  '84': "Provence-Alpes-Côte d'Azur",

  // DOM-TOM (codes 971-976)
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '976': 'Mayotte',
}

/**
 * Liste des 18 régions normalisées (avec accents).
 */
export const REGIONS_NORMALIZED = new Set(Object.values(DEPARTEMENT_TO_REGION))

/**
 * Mapping des variantes sans accent ou anciennes vers la version normalisée.
 */
export const REGION_ALIASES: Record<string, string> = {
  'Auvergne-Rhone-Alpes': 'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comte': 'Bourgogne-Franche-Comté',
  'Ile-de-France': 'Île-de-France',
  "Provence-Alpes-Cote d'Azur": "Provence-Alpes-Côte d'Azur",
  Reunion: 'La Réunion',
  'La Reunion': 'La Réunion',
  // Anciennes régions (avant 2016) — mapper vers la nouvelle
  Aquitaine: 'Nouvelle-Aquitaine',
  'Languedoc-Roussillon': 'Occitanie',
  'Midi-Pyrénées': 'Occitanie',
  'Midi-Pyrenees': 'Occitanie',
  'Nord-Pas-de-Calais': 'Hauts-de-France',
  Picardie: 'Hauts-de-France',
  Limousin: 'Nouvelle-Aquitaine',
  'Poitou-Charentes': 'Nouvelle-Aquitaine',
  Auvergne: 'Auvergne-Rhône-Alpes',
  'Rhône-Alpes': 'Auvergne-Rhône-Alpes',
  'Rhone-Alpes': 'Auvergne-Rhône-Alpes',
  Bourgogne: 'Bourgogne-Franche-Comté',
  'Franche-Comté': 'Bourgogne-Franche-Comté',
  'Franche-Comte': 'Bourgogne-Franche-Comté',
  'Basse-Normandie': 'Normandie',
  'Haute-Normandie': 'Normandie',
  Alsace: 'Grand Est',
  Lorraine: 'Grand Est',
  'Champagne-Ardenne': 'Grand Est',
  Centre: 'Centre-Val de Loire',
}

/**
 * Convertit un postal_code FR en code département.
 * Gère :
 * - codes métropole (5 chiffres, 2 premiers = dept)
 * - Corse (20xxx → 2A si 200xx, 2B si 202xx, sinon fallback 2A)
 * - DOM-TOM (971-976)
 */
export function postalCodeToDepartement(postal: string | null): string | null {
  if (!postal) return null
  const cleaned = postal.replace(/\s+/g, '')
  if (!/^\d{5}$/.test(cleaned)) return null
  // DOM-TOM
  if (cleaned.startsWith('97')) {
    return cleaned.slice(0, 3) // 971-976
  }
  // Corse
  if (cleaned.startsWith('20')) {
    const sub = parseInt(cleaned.slice(2, 5), 10)
    return sub >= 200 ? '2B' : '2A'
  }
  return cleaned.slice(0, 2)
}

/**
 * Résout la région d'un département. Renvoie null si le code est inconnu.
 */
export function departementToRegion(dept: string | null): string | null {
  if (!dept) return null
  const cleaned = String(dept).trim().toUpperCase()
  return DEPARTEMENT_TO_REGION[cleaned] || null
}

/**
 * Pipeline de résolution complet.
 * Tente : address_department → postal_code → null.
 * Renvoie aussi les régions déjà valides (alias mappés vers normalisé).
 */
export function resolveRegion(opts: {
  current_region?: string | null
  department?: string | null
  postal_code?: string | null
}): string | null {
  const cur = opts.current_region?.trim() || null
  // Si déjà normalisé, return tel quel
  if (cur && REGIONS_NORMALIZED.has(cur)) return cur
  // Si alias connu, normaliser
  if (cur && REGION_ALIASES[cur]) return REGION_ALIASES[cur]
  // Si valeur numérique courte (code département mal stocké), convertir
  if (cur && /^\d{1,3}$/.test(cur)) {
    const fromDept = departementToRegion(cur.padStart(2, '0'))
    if (fromDept) return fromDept
  }
  // Sinon reconstruire depuis department
  const fromDept = departementToRegion(opts.department || null)
  if (fromDept) return fromDept
  // Sinon depuis postal_code
  const dept = postalCodeToDepartement(opts.postal_code || null)
  return departementToRegion(dept)
}
