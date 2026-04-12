/**
 * Prépositions correctes pour les départements et régions français.
 *
 * Règles grammaticales :
 * - Féminin singulier : "dans la X" / "de la X" (ou "dans l'" / "de l'" devant voyelle)
 * - Masculin singulier : "dans le X" / "du X" (ou "dans l'" / "de l'" devant voyelle)
 * - Pluriel : "dans les X" / "des X"
 * - Îles/Corse/DOM : "en X"
 */

// ---------------------------------------------------------------------------
// Départements féminins
// ---------------------------------------------------------------------------

const FEMININE_DEPTS = new Set([
  'Charente',
  'Charente-Maritime',
  'Corrèze',
  'Corse-du-Sud',
  "Côte-d'Or",
  'Creuse',
  'Dordogne',
  'Drôme',
  'Essonne',
  'Eure',
  'Gironde',
  'Haute-Corse',
  'Haute-Garonne',
  'Haute-Loire',
  'Haute-Marne',
  'Haute-Saône',
  'Haute-Savoie',
  'Haute-Vienne',
  'Isère',
  'Loire',
  'Loire-Atlantique',
  'Lozère',
  'Manche',
  'Marne',
  'Mayenne',
  'Meuse',
  'Moselle',
  'Nièvre',
  'Sarthe',
  'Saône-et-Loire',
  'Savoie',
  'Seine-et-Marne',
  'Seine-Maritime',
  'Seine-Saint-Denis',
  'Somme',
  'Vendée',
  'Vienne',
])

// ---------------------------------------------------------------------------
// Départements pluriels
// ---------------------------------------------------------------------------

const PLURAL_DEPTS = new Set([
  'Alpes-de-Haute-Provence',
  'Alpes-Maritimes',
  'Ardennes',
  'Bouches-du-Rhône',
  "Côtes-d'Armor",
  'Deux-Sèvres',
  'Hautes-Alpes',
  'Hautes-Pyrénées',
  'Hauts-de-Seine',
  'Landes',
  'Pyrénées-Atlantiques',
  'Pyrénées-Orientales',
  'Vosges',
  'Yvelines',
])

// ---------------------------------------------------------------------------
// Départements utilisant "en" (îles, Corse, DOM)
// ---------------------------------------------------------------------------

const EN_DEPTS = new Set([
  'Corse-du-Sud',
  'Haute-Corse',
  'Guadeloupe',
  'Martinique',
  'Guyane',
  'Mayotte',
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startsWithVowel(name: string): boolean {
  return /^[aeéèêiîoôuùûyh]/i.test(name)
}

// ---------------------------------------------------------------------------
// Départements — prépositions
// ---------------------------------------------------------------------------

/**
 * Retourne le département avec sa préposition correcte.
 *
 * @example
 * getDeptPreposition('Ain')          → "dans l'Ain"
 * getDeptPreposition('Rhône')        → "dans le Rhône"
 * getDeptPreposition('Gironde')      → "en Gironde"  ← féminin
 * getDeptPreposition('Yvelines')     → "dans les Yvelines"
 * getDeptPreposition('Haute-Corse')  → "en Haute-Corse"
 */
export function getDeptPreposition(deptName: string): string {
  if (EN_DEPTS.has(deptName)) return `en ${deptName}`
  if (PLURAL_DEPTS.has(deptName)) return `dans les ${deptName}`
  if (FEMININE_DEPTS.has(deptName)) {
    return startsWithVowel(deptName) ? `en ${deptName}` : `en ${deptName}`
  }
  // Masculin singulier
  return startsWithVowel(deptName) ? `dans l'${deptName}` : `dans le ${deptName}`
}

/**
 * Retourne le département avec son article partitif correct.
 *
 * @example
 * getDeptArticle('Ain')          → "de l'Ain"
 * getDeptArticle('Rhône')        → "du Rhône"
 * getDeptArticle('Gironde')      → "de la Gironde"  ← féminin
 * getDeptArticle('Yvelines')     → "des Yvelines"
 */
export function getDeptArticle(deptName: string): string {
  if (PLURAL_DEPTS.has(deptName)) return `des ${deptName}`
  if (FEMININE_DEPTS.has(deptName)) {
    return startsWithVowel(deptName) ? `de l'${deptName}` : `de la ${deptName}`
  }
  return startsWithVowel(deptName) ? `de l'${deptName}` : `du ${deptName}`
}

// ---------------------------------------------------------------------------
// Régions — prépositions
// ---------------------------------------------------------------------------

const PLURAL_REGIONS = new Set(['Pays de la Loire', 'Hauts-de-France'])

/**
 * Retourne la région avec sa préposition correcte.
 *
 * @example
 * getRegionPreposition('Île-de-France')    → "en Île-de-France"
 * getRegionPreposition('Pays de la Loire') → "dans les Pays de la Loire"
 * getRegionPreposition('Hauts-de-France')  → "dans les Hauts-de-France"
 */
export function getRegionPreposition(regionName: string): string {
  if (PLURAL_REGIONS.has(regionName)) return `dans les ${regionName}`
  return `en ${regionName}`
}

/**
 * Retourne la région avec son article partitif correct.
 *
 * @example
 * getRegionArticle('Île-de-France')    → "d'Île-de-France"
 * getRegionArticle('Provence-Alpes-Côte d\'Azur') → "de Provence-Alpes-Côte d'Azur"
 * getRegionArticle('Pays de la Loire') → "des Pays de la Loire"
 */
export function getRegionArticle(regionName: string): string {
  if (PLURAL_REGIONS.has(regionName)) return `des ${regionName}`
  if (startsWithVowel(regionName)) return `d'${regionName}`
  return `de ${regionName}`
}
