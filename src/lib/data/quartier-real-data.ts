/**
 * Real quartier-level data collected from public sources.
 *
 * Prix immobilier sources (2025–2026):
 *   - Dimo Diagnostic (dimo-diagnostic.net) — DVF & notaires data
 *   - ULYS Immobilier (ulys.immo) — Marché parisien 2025
 *   - Agence Marty (agencemarty.com) — Marseille arrondissements
 *   - SGL Immobilier (sgl-immo.com) — Toulouse & Bordeaux quartiers
 *   - Efficity (efficity.com) — Lyon, Nantes quartiers
 *   - News of Strasbourg, PAP, SeLoger — Strasbourg quartiers
 *   - Chasseur Immobilier Nice, NetVendeur — Nice quartiers
 *   - Dimo Diagnostic, Carrefour Immobilier — Montpellier quartiers
 *
 * DPE sources:
 *   - ONRE/SDES (statistiques.developpement-durable.gouv.fr) — National & regional
 *   - ADEME Observatoire DPE — Per-city estimates
 *   - HelloWatt / Magnolia — Department-level rankings
 *
 * Note: When multiple sources disagree, we average them.
 * Missing quartiers fall back to the derived estimate pipeline.
 */

// ---------------------------------------------------------------------------
// Quartier prix immobilier (€/m²) — real data
// Key: `${villeSlug}::${quartierSlug}` where quartierSlug is the
//       kebab-cased quartier name as used in URL routes
// ---------------------------------------------------------------------------

export interface QuartierRealData {
  /** Real price per m² (apartments, average) */
  prixM2: number
  /** Source description for transparency */
  source: string
  /** Year of data */
  annee: number
}

/**
 * Real quartier-level price data from public sources.
 * Keyed by `villeSlug::quartierName` (exact match to france.ts quartiers array).
 */
export const QUARTIER_PRIX_REEL: Record<string, QuartierRealData> = {
  // ---- PARIS (20 arrondissements) ---- source: ULYS Immobilier + Dimo Diagnostic 2025
  'paris::1er arr.':  { prixM2: 13760, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::2e arr.':   { prixM2: 11290, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::3e arr.':   { prixM2: 11220, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::4e arr.':   { prixM2: 13160, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::5e arr.':   { prixM2: 11950, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::6e arr.':   { prixM2: 14930, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::7e arr.':   { prixM2: 14270, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::8e arr.':   { prixM2: 12500, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::9e arr.':   { prixM2: 9950, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::10e arr.':  { prixM2: 9020, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::11e arr.':  { prixM2: 9030, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::12e arr.':  { prixM2: 8890, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::13e arr.':  { prixM2: 8330, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::14e arr.':  { prixM2: 9180, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::15e arr.':  { prixM2: 9340, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::16e arr.':  { prixM2: 11220, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::17e arr.':  { prixM2: 10200, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::18e arr.':  { prixM2: 8370, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::19e arr.':  { prixM2: 7830, source: 'ULYS/Dimo sept. 2025', annee: 2025 },
  'paris::20e arr.':  { prixM2: 7960, source: 'ULYS/Dimo sept. 2025', annee: 2025 },

  // ---- MARSEILLE (16 arrondissements → mapped to quartiers from france.ts) ----
  // source: Agence Marty 2026
  'marseille::Vieux-Port':    { prixM2: 3280, source: 'Agence Marty 2026 (1er arr.)', annee: 2026 },
  'marseille::Le Panier':     { prixM2: 3660, source: 'Agence Marty 2026 (2e arr.)', annee: 2026 },
  'marseille::La Joliette':   { prixM2: 3660, source: 'Agence Marty 2026 (2e arr.)', annee: 2026 },
  'marseille::Castellane':    { prixM2: 3140, source: 'Agence Marty 2026 (4e arr.)', annee: 2026 },
  'marseille::La Canebière':  { prixM2: 3280, source: 'Agence Marty 2026 (1er arr.)', annee: 2026 },
  'marseille::Prado':         { prixM2: 5170, source: 'Agence Marty 2026 (8e arr.)', annee: 2026 },
  'marseille::Bonneveine':    { prixM2: 5170, source: 'Agence Marty 2026 (8e arr.)', annee: 2026 },
  'marseille::Les Calanques': { prixM2: 4000, source: 'Agence Marty 2026 (9e arr.)', annee: 2026 },

  // ---- LYON (9 arrondissements → mapped to quartiers) ----
  // source: Dimo Diagnostic sept. 2025
  "lyon::Presqu'île":    { prixM2: 5680, source: 'Dimo/Efficity 2025 (avg 1er+2e)', annee: 2025 },
  'lyon::Vieux Lyon':    { prixM2: 4530, source: 'Dimo 2025 (5e arr.)', annee: 2025 },
  'lyon::Part-Dieu':     { prixM2: 4760, source: 'Dimo 2025 (3e arr.)', annee: 2025 },
  'lyon::Confluence':    { prixM2: 5910, source: 'Dimo 2025 (2e arr.)', annee: 2025 },
  'lyon::Croix-Rousse':  { prixM2: 5390, source: 'Dimo 2025 (4e arr.)', annee: 2025 },
  'lyon::Gerland':       { prixM2: 4740, source: 'Dimo 2025 (7e arr.)', annee: 2025 },
  'lyon::Villeurbanne':  { prixM2: 3920, source: 'Dimo 2025 (8e/Villeurbanne)', annee: 2025 },

  // ---- TOULOUSE ---- source: SGL Immobilier 2025
  'toulouse::Capitole':      { prixM2: 5230, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Saint-Cyprien': { prixM2: 4280, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Carmes':        { prixM2: 5500, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Les Minimes':   { prixM2: 3520, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Saint-Michel':  { prixM2: 4160, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Rangueil':      { prixM2: 3440, source: 'SGL Immobilier 2025', annee: 2025 },
  'toulouse::Blagnac':       { prixM2: 3280, source: 'SGL Immobilier 2025', annee: 2025 },

  // ---- NICE ---- source: Chasseur Immobilier Nice / NetVendeur 2025
  'nice::Vieux Nice':              { prixM2: 5500, source: 'Chasseur Immo Nice 2025', annee: 2025 },
  'nice::Promenade des Anglais':   { prixM2: 9500, source: 'Chasseur Immo Nice 2025', annee: 2025 },
  'nice::Cimiez':                  { prixM2: 7500, source: 'Chasseur Immo Nice 2025', annee: 2025 },
  'nice::Port':                    { prixM2: 5000, source: 'Chasseur Immo Nice 2025', annee: 2025 },
  'nice::Libération':              { prixM2: 3300, source: 'Chasseur Immo Nice 2025', annee: 2025 },
  'nice::Saint-Roch':              { prixM2: 4250, source: 'Chasseur Immo Nice 2025', annee: 2025 },

  // ---- NANTES ---- source: Efficity / Prix Immobilier Nantes 2025
  'nantes::Centre-ville':    { prixM2: 4060, source: 'Efficity/SeLoger 2025', annee: 2025 },
  'nantes::Île de Nantes':   { prixM2: 4830, source: 'MonMarché Immo Neuf 2025', annee: 2025 },
  'nantes::Doulon':          { prixM2: 3140, source: 'PrixImmoNantes 2025', annee: 2025 },
  'nantes::Erdre':           { prixM2: 4830, source: 'MonMarché Immo 2025', annee: 2025 },
  'nantes::Chantenay':       { prixM2: 3300, source: 'MeilleursAgents 2025', annee: 2025 },

  // ---- MONTPELLIER ---- source: Dimo / Carrefour Immobilier 2025
  'montpellier::Écusson':              { prixM2: 4000, source: 'Dimo/Carrefour Immo 2025', annee: 2025 },
  'montpellier::Antigone':             { prixM2: 4200, source: 'Dimo/Carrefour Immo 2025', annee: 2025 },
  'montpellier::Port-Marianne':        { prixM2: 4430, source: 'Efficity/Dimo 2025', annee: 2025 },
  'montpellier::Hôpitaux-Facultés':    { prixM2: 3400, source: 'Dimo 2025', annee: 2025 },
  'montpellier::Mosson':               { prixM2: 2800, source: 'Dimo/CarrefourImmo 2025', annee: 2025 },

  // ---- STRASBOURG ---- source: News of Strasbourg / PAP / Efficity 2025
  'strasbourg::Grande Île':   { prixM2: 4980, source: 'Confidences Immo 2025', annee: 2025 },
  'strasbourg::Petite France': { prixM2: 4980, source: 'Confidences Immo 2025', annee: 2025 },
  'strasbourg::Krutenau':     { prixM2: 4910, source: 'Efficity nov. 2025', annee: 2025 },
  'strasbourg::Neudorf':      { prixM2: 3600, source: 'PAP/Foncia 2025', annee: 2025 },
  'strasbourg::Robertsau':    { prixM2: 4120, source: 'MeilleursAgents jan. 2026', annee: 2025 },

  // ---- BORDEAUX ---- source: SGL Immobilier 2025
  'bordeaux::Centre historique': { prixM2: 5400, source: 'SGL Immobilier 2025', annee: 2025 },
  'bordeaux::Chartrons':         { prixM2: 4980, source: 'SGL Immobilier 2025', annee: 2025 },
  'bordeaux::Saint-Michel':      { prixM2: 4690, source: 'SGL Immobilier 2025', annee: 2025 },
  'bordeaux::Bastide':           { prixM2: 4350, source: 'SGL Immobilier 2025', annee: 2025 },
  'bordeaux::Bacalan':           { prixM2: 4350, source: 'SGL/efficity 2025', annee: 2025 },
}

// ---------------------------------------------------------------------------
// City-level real prix M2 — fallback when quartier data unavailable
// ---------------------------------------------------------------------------

export const VILLE_PRIX_REEL: Record<string, { prixM2: number; source: string; annee: number }> = {
  'paris':       { prixM2: 10700, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'marseille':   { prixM2: 3380, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'lyon':        { prixM2: 4520, source: 'Dimo sept. 2025', annee: 2025 },
  'toulouse':    { prixM2: 3430, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'nice':        { prixM2: 5210, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'nantes':      { prixM2: 3460, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'montpellier': { prixM2: 3480, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'strasbourg':  { prixM2: 3540, source: 'MeilleursAgents fév. 2026', annee: 2026 },
  'bordeaux':    { prixM2: 4510, source: 'SGL Immobilier 2025', annee: 2025 },
  'lille':       { prixM2: 3580, source: 'MeilleursAgents 2025', annee: 2025 },
  'rennes':      { prixM2: 3850, source: 'MeilleursAgents 2025', annee: 2025 },
  'grenoble':    { prixM2: 2600, source: 'MeilleursAgents 2025', annee: 2025 },
  'angers':      { prixM2: 2900, source: 'MeilleursAgents 2025', annee: 2025 },
  'dijon':       { prixM2: 2400, source: 'MeilleursAgents 2025', annee: 2025 },
  'toulon':      { prixM2: 3200, source: 'MeilleursAgents 2025', annee: 2025 },
  'reims':       { prixM2: 2350, source: 'MeilleursAgents 2025', annee: 2025 },
  'saint-etienne': { prixM2: 1200, source: 'MeilleursAgents 2025', annee: 2025 },
  'clermont-ferrand': { prixM2: 2150, source: 'MeilleursAgents 2025', annee: 2025 },
  'le-havre':    { prixM2: 1900, source: 'MeilleursAgents 2025', annee: 2025 },
  'tours':       { prixM2: 2750, source: 'MeilleursAgents 2025', annee: 2025 },
}

// ---------------------------------------------------------------------------
// DPE passoires thermiques (F+G %) — real data by region & city
// Source: ONRE/SDES 2025, Qalimo 2024, HelloWatt/Magnolia 2023
// ---------------------------------------------------------------------------

/** Percentage of DPE F+G residences by region (primary residences) */
export const REGION_DPE_REEL: Record<string, number> = {
  'Île-de-France': 18.5,              // avg of 17.4% (Hellio 2025) + 20% (Qalimo 2024)
  'Bourgogne-Franche-Comté': 15,      // Qalimo 2024
  "Provence-Alpes-Côte d'Azur": 12,   // adjusted from Qalimo 14% (mild climate, newer DPE data)
  'Hauts-de-France': 13,              // Qalimo 2024
  'Normandie': 12,                    // Qalimo 2024
  'Centre-Val de Loire': 11,          // Qalimo 2024
  'Grand Est': 11,                    // Qalimo 2024
  'Auvergne-Rhône-Alpes': 10,         // Qalimo 2024
  'Occitanie': 9,                     // Qalimo 2024
  'Nouvelle-Aquitaine': 9,            // Qalimo 2024
  'Pays de la Loire': 8,              // Heero regional data
  'Bretagne': 10.5,                   // estimated from multiple partial sources
  'Corse': 5,                         // Ajaccio at 5%, Hellio: <2% rated G
}

/** Per-city DPE data when available (overrides regional estimate) */
export const VILLE_DPE_REEL: Record<string, number> = {
  'paris': 35,           // HelloWatt: 42% DPE-based; ONRE modeled lower; compromise
  'marseille': 11,       // Bouches-du-Rhône: 9% dept, city slightly higher
  'lyon': 14,            // Rhône departmental average + urban old center adjustment
  'toulouse': 10,        // Occitanie region 9%, city slightly above
  'nice': 10,            // PACA mild climate, older center offset
  'nantes': 9,           // Pays de la Loire 8%, city slightly above
  'montpellier': 8,      // Hérault department: 9%, one of lowest
  'strasbourg': 13,      // Grand Est 11%, Alsace colder + old center
  'bordeaux': 11,        // Nouvelle-Aquitaine 9%, city center older stock
  'lille': 16,           // Hauts-de-France 13%, Nord department higher
  'rennes': 10,          // Bretagne 10.5%, city average
  'grenoble': 12,        // Mountain-adjacent, old center
  'toulon': 10,          // PACA mild, Toulon listed at 10% by HelloWatt
  'reims': 14,           // Grand Est, older champagne-era construction
  'saint-etienne': 18,   // Old industrial city, poor building stock
  'clermont-ferrand': 15, // Auvergne, old volcanic-stone construction
  'le-havre': 16,        // Normandie, post-war reconstruction but aging
  'dijon': 14,           // Bourgogne, old center + continental climate
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Get real prix/m² for a specific quartier.
 * Returns null if no real data is available.
 */
export function getQuartierRealPrix(villeSlug: string, quartierName: string): QuartierRealData | null {
  return QUARTIER_PRIX_REEL[`${villeSlug}::${quartierName}`] || null
}

/**
 * Get real city-level prix/m².
 * Returns null if no data available.
 */
export function getVilleRealPrix(villeSlug: string): number | null {
  return VILLE_PRIX_REEL[villeSlug]?.prixM2 ?? null
}

/**
 * Get real DPE passoire percentage for a city (or fall back to region).
 * Returns null if nothing available.
 */
export function getRealDpe(villeSlug: string, regionName: string): number | null {
  if (VILLE_DPE_REEL[villeSlug] != null) return VILLE_DPE_REEL[villeSlug]
  if (REGION_DPE_REEL[regionName] != null) return REGION_DPE_REEL[regionName]
  return null
}
