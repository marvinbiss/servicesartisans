/**
 * Tarifs horaires moyens métiers France 2026.
 *
 * Sources :
 * - Fédération Française du Bâtiment (FFB) — observatoire prix 2026
 * - Capeb — baromètre artisanat 2026
 * - Ahrefs SERP analysis "prix [métier] €/h" top 10 sites (Travaux.com,
 *   Habitatpresto, Maison&Travaux)
 *
 * Usage : fallback ProviderCard quand `hourly_rate_min/max` NULL (≥99% des
 * 970K fiches non revendiquées). Label explicite "Tarif moyen métier" pour
 * transparence — ne JAMAIS impliquer que c'est le tarif de l'artisan.
 *
 * Bornes : main d'œuvre seule HT, hors déplacement et fournitures. Région
 * Île-de-France +10-20% (non géolocalisé ici, garde simple).
 */

type PriceRange = { min: number; max: number }

const SPECIALTY_MEDIAN_HOURLY: Record<string, PriceRange> = {
  plombier: { min: 50, max: 70 },
  electricien: { min: 45, max: 65 },
  chauffagiste: { min: 50, max: 75 },
  'pompe-a-chaleur': { min: 60, max: 90 },
  'chauffagiste-rge': { min: 55, max: 80 },
  macon: { min: 35, max: 55 },
  peintre: { min: 25, max: 45 },
  carreleur: { min: 35, max: 55 },
  menuisier: { min: 45, max: 65 },
  ebeniste: { min: 50, max: 75 },
  couvreur: { min: 50, max: 75 },
  charpentier: { min: 45, max: 70 },
  serrurier: { min: 60, max: 95 },
  vitrier: { min: 45, max: 70 },
  jardinier: { min: 25, max: 40 },
  paysagiste: { min: 35, max: 55 },
  'isolation-thermique': { min: 40, max: 60 },
  'isolation-combles': { min: 35, max: 55 },
  'isolation-exterieure': { min: 45, max: 70 },
  'isolation-phonique': { min: 40, max: 65 },
  ravaleur: { min: 35, max: 60 },
  platrier: { min: 35, max: 55 },
  staffeur: { min: 45, max: 70 },
  'poseur-de-sol': { min: 30, max: 50 },
  parqueteur: { min: 35, max: 55 },
  cuisiniste: { min: 50, max: 75 },
  'salle-de-bain': { min: 50, max: 75 },
  'energies-renouvelables': { min: 55, max: 85 },
  'panneau-solaire': { min: 55, max: 85 },
  geometre: { min: 80, max: 120 },
  architecte: { min: 80, max: 150 },
  'bureau-detudes': { min: 70, max: 110 },
  'diagnostic-immobilier': { min: 80, max: 150 },
  'diagnostiqueur-dpe': { min: 70, max: 130 },
  'audit-energetique': { min: 80, max: 140 },
  desamianteur: { min: 60, max: 95 },
  demolisseur: { min: 40, max: 65 },
  terrassier: { min: 45, max: 70 },
  poseur: { min: 30, max: 50 },
  bricoleur: { min: 25, max: 45 },
  'multi-services': { min: 30, max: 50 },
  'aide-a-domicile': { min: 22, max: 35 },
  demenageur: { min: 35, max: 60 },
  nettoyage: { min: 20, max: 35 },
  pisciniste: { min: 50, max: 75 },
  'cheminee-poele': { min: 50, max: 80 },
  electromenager: { min: 40, max: 65 },
  antenniste: { min: 50, max: 80 },
}

const DEFAULT_RANGE: PriceRange = { min: 35, max: 60 }

/**
 * Returns the price range for a specialty slug. Lookup is case-insensitive
 * and tries the exact lowercased slug, then falls back to DEFAULT_RANGE.
 */
export function getSpecialtyHourlyRange(specialty: string | null | undefined): PriceRange {
  if (!specialty) return DEFAULT_RANGE
  const slug = specialty.toLowerCase().trim()
  return SPECIALTY_MEDIAN_HOURLY[slug] ?? DEFAULT_RANGE
}

/**
 * Resolves which pricing to show on a ProviderCard.
 *
 * Returns:
 * - `{ kind: 'provider', min, max }` when the artisan has filled their own rates
 * - `{ kind: 'specialty', min, max }` for the métier-average fallback
 *
 * Callers MUST label `kind === 'specialty'` distinctly ("Tarif moyen métier")
 * to preserve transparency. Never claim the average is the artisan's rate.
 */
export function resolveProviderPricing(args: {
  hourlyRateMin?: number | null
  hourlyRateMax?: number | null
  specialty?: string | null
}): { kind: 'provider' | 'specialty'; min: number; max: number } {
  const { hourlyRateMin, hourlyRateMax, specialty } = args
  const min = typeof hourlyRateMin === 'number' && hourlyRateMin > 0 ? hourlyRateMin : null
  const max = typeof hourlyRateMax === 'number' && hourlyRateMax > 0 ? hourlyRateMax : null
  if (min !== null && max !== null) return { kind: 'provider', min, max }
  if (min !== null) return { kind: 'provider', min, max: min }
  if (max !== null) return { kind: 'provider', min: max, max }
  const fallback = getSpecialtyHourlyRange(specialty)
  return { kind: 'specialty', ...fallback }
}

/**
 * Format a price range for display. U+00A0 (NBSP) sits between the digit
 * and the currency mark to prevent an awkward line-break under tight column
 * widths (ProviderCard, comparer table). Built via fromCharCode so the
 * source file stays free of irregular whitespace.
 */
const NBSP = String.fromCharCode(0xa0)
export function formatHourlyRange(range: { min: number; max: number }): string {
  if (range.min === range.max) return `${range.min}${NBSP}€/h`
  return `${range.min}–${range.max}${NBSP}€/h`
}
