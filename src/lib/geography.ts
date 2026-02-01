/**
 * Mappings géographiques France
 * Codes postaux -> Départements -> Régions
 */

// Mapping des codes départements vers noms complets
export const DEPARTMENTS: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '20': 'Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor',
  '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne',
  '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
}

// Mapping des codes départements vers régions
export const DEPT_TO_REGION: Record<string, string> = {
  // Auvergne-Rhône-Alpes
  '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
  '15': 'Auvergne-Rhône-Alpes', '26': 'Auvergne-Rhône-Alpes', '38': 'Auvergne-Rhône-Alpes',
  '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '63': 'Auvergne-Rhône-Alpes',
  '69': 'Auvergne-Rhône-Alpes', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
  // Bourgogne-Franche-Comté
  '21': 'Bourgogne-Franche-Comté', '25': 'Bourgogne-Franche-Comté', '39': 'Bourgogne-Franche-Comté',
  '58': 'Bourgogne-Franche-Comté', '70': 'Bourgogne-Franche-Comté', '71': 'Bourgogne-Franche-Comté',
  '89': 'Bourgogne-Franche-Comté', '90': 'Bourgogne-Franche-Comté',
  // Bretagne
  '22': 'Bretagne', '29': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne',
  // Centre-Val de Loire
  '18': 'Centre-Val de Loire', '28': 'Centre-Val de Loire', '36': 'Centre-Val de Loire',
  '37': 'Centre-Val de Loire', '41': 'Centre-Val de Loire', '45': 'Centre-Val de Loire',
  // Corse
  '2A': 'Corse', '2B': 'Corse', '20': 'Corse',
  // Grand Est
  '08': 'Grand Est', '10': 'Grand Est', '51': 'Grand Est', '52': 'Grand Est',
  '54': 'Grand Est', '55': 'Grand Est', '57': 'Grand Est', '67': 'Grand Est',
  '68': 'Grand Est', '88': 'Grand Est',
  // Hauts-de-France
  '02': 'Hauts-de-France', '59': 'Hauts-de-France', '60': 'Hauts-de-France',
  '62': 'Hauts-de-France', '80': 'Hauts-de-France',
  // Île-de-France
  '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France',
  '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France',
  '94': 'Île-de-France', '95': 'Île-de-France',
  // Normandie
  '14': 'Normandie', '27': 'Normandie', '50': 'Normandie', '61': 'Normandie', '76': 'Normandie',
  // Nouvelle-Aquitaine
  '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '19': 'Nouvelle-Aquitaine',
  '23': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '33': 'Nouvelle-Aquitaine',
  '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine', '64': 'Nouvelle-Aquitaine',
  '79': 'Nouvelle-Aquitaine', '86': 'Nouvelle-Aquitaine', '87': 'Nouvelle-Aquitaine',
  // Occitanie
  '09': 'Occitanie', '11': 'Occitanie', '12': 'Occitanie', '30': 'Occitanie',
  '31': 'Occitanie', '32': 'Occitanie', '34': 'Occitanie', '46': 'Occitanie',
  '48': 'Occitanie', '65': 'Occitanie', '66': 'Occitanie', '81': 'Occitanie', '82': 'Occitanie',
  // Pays de la Loire
  '44': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire',
  '72': 'Pays de la Loire', '85': 'Pays de la Loire',
  // Provence-Alpes-Côte d'Azur
  '04': 'Provence-Alpes-Côte d\'Azur', '05': 'Provence-Alpes-Côte d\'Azur',
  '06': 'Provence-Alpes-Côte d\'Azur', '13': 'Provence-Alpes-Côte d\'Azur',
  '83': 'Provence-Alpes-Côte d\'Azur', '84': 'Provence-Alpes-Côte d\'Azur',
  // DOM-TOM
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
}

/**
 * Extrait le code département d'un code postal
 */
export function getDeptCodeFromPostal(postalCode: string | null | undefined): string | null {
  if (!postalCode) return null
  // DOM-TOM (3 chiffres)
  if (postalCode.startsWith('97')) {
    return postalCode.substring(0, 3)
  }
  // Corse
  if (postalCode.startsWith('20')) {
    const num = parseInt(postalCode.substring(0, 3))
    return num < 201 ? '2A' : '2B'
  }
  return postalCode.substring(0, 2)
}

/**
 * Obtient le nom complet du département depuis un code postal ou code département
 */
export function getDepartmentName(codeOrPostal: string | null | undefined): string | null {
  if (!codeOrPostal) return null

  // Si c'est déjà un nom de département, le retourner
  if (codeOrPostal.length > 3 && !codeOrPostal.match(/^\d+$/)) {
    return codeOrPostal
  }

  // Si c'est un code postal, extraire le code département
  const deptCode = codeOrPostal.length >= 5
    ? getDeptCodeFromPostal(codeOrPostal)
    : codeOrPostal

  return deptCode ? (DEPARTMENTS[deptCode] || null) : null
}

/**
 * Obtient le nom de la région depuis un code postal ou code département
 */
export function getRegionName(codeOrPostal: string | null | undefined): string | null {
  if (!codeOrPostal) return null

  // Si c'est déjà un nom de région, le retourner
  if (codeOrPostal.length > 3 && !codeOrPostal.match(/^\d+$/)) {
    return codeOrPostal
  }

  // Si c'est un code postal, extraire le code département
  const deptCode = codeOrPostal.length >= 5
    ? getDeptCodeFromPostal(codeOrPostal)
    : codeOrPostal

  return deptCode ? (DEPT_TO_REGION[deptCode] || null) : null
}

/**
 * Obtient toutes les infos géographiques depuis un code postal
 */
export function getGeographyFromPostal(postalCode: string | null | undefined): {
  departmentCode: string | null
  departmentName: string | null
  regionName: string | null
} {
  const deptCode = getDeptCodeFromPostal(postalCode)
  return {
    departmentCode: deptCode,
    departmentName: deptCode ? DEPARTMENTS[deptCode] || null : null,
    regionName: deptCode ? DEPT_TO_REGION[deptCode] || null : null,
  }
}

/**
 * Génère un slug URL-safe pour une région ou département
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Liste des régions avec leurs slugs
 */
export const REGIONS = Object.values(DEPT_TO_REGION)
  .filter((v, i, a) => a.indexOf(v) === i)
  .map(name => ({
    name,
    slug: slugify(name),
  }))
