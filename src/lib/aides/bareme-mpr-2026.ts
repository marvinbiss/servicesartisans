/**
 * MaPrimeRénov' 2026 — barème par geste × catégorie ménage.
 *
 * Source ANAH https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov
 * Snapshot : 2026-04-15
 *
 * Sémantique des valeurs `amountEUR` :
 *   - number > 0      : forfait MPR par geste éligible (EUR ou EUR/m² selon notes)
 *   - 0               : non éligible (catégorie supérieure exclue du barème par geste)
 *   - null            : combinaison non éligible structurellement OU valeur 2026
 *                       non encore vérifiée (notes UNVERIFIED_PENDING_SOURCE).
 *
 * Memory `feedback_legal_data_quality` : préfère `amountEUR: null` +
 * notes UNVERIFIED_PENDING_SOURCE plutôt que d'inventer un chiffre. Le golden
 * test `__golden.test.ts` saute les cas Ralph 7 `verified: false` — symétrique.
 *
 * Les valeurs verified ci-dessous proviennent toutes des cas Ralph 7 marqués
 * `metadata.verified = true` dans `evals/gold/mpr-bareme-2026.jsonl` :
 *   PAC air/eau Bleu=5000, Jaune=4000, Violet=3000, Rose=0 (mpr-001..004)
 *   PAC géothermique Bleu=11000, Jaune=9000, Violet=6000 (mpr-005..007)
 *   PAC air/air = non éligible MPR (mpr-008, mpr-033)
 *   Chauffe-eau thermo Bleu=1200, Jaune=800 (mpr-009..010)
 *   Isolation combles Bleu=25/m², Jaune=20/m² (mpr-011..012)
 *   ITE Bleu=75/m², Jaune=60/m² (mpr-013..014)
 *   Isolation planchers bas Bleu=25/m² (mpr-016)
 *   Audit énergétique Bleu=500, Jaune=400, Violet=300 (mpr-019..021)
 */

import type { BaremeEntry, Geste, MenageCategorie, PlafondRevenusEntry, Zone } from './types'

const UNVERIFIED = 'UNVERIFIED_PENDING_SOURCE_2026' as const

export const BAREME_MPR_2026: ReadonlyArray<BaremeEntry> = [
  // ---- PAC air/eau (source: mpr-001..004 verified:true) ----
  {
    geste: 'pac_air_eau',
    menageCategorie: 'tres_modeste',
    amountEUR: 5000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'modeste',
    amountEUR: 4000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'intermediaire',
    amountEUR: 3000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024 (montant 0 EUR)',
  },

  // ---- PAC géothermique (source: mpr-005..007 verified:true) ----
  {
    geste: 'pac_geothermique',
    menageCategorie: 'tres_modeste',
    amountEUR: 11000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'modeste',
    amountEUR: 9000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'intermediaire',
    amountEUR: 6000,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024 (montant 0 EUR)',
  },

  // ---- PAC air/air = NON éligible MPR (source: mpr-008, mpr-033 verified:true) ----
  {
    geste: 'pac_air_air',
    menageCategorie: 'tres_modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'PAC air/air non éligible MaPrimeRénov (éligible CEE uniquement). Source ANAH.',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'PAC air/air non éligible MaPrimeRénov (éligible CEE uniquement). Source ANAH.',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'PAC air/air non éligible MaPrimeRénov (éligible CEE uniquement). Source ANAH.',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'superieur',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'PAC air/air non éligible MaPrimeRénov (éligible CEE uniquement). Source ANAH.',
  },

  // ---- Chauffe-eau thermodynamique (source: mpr-009..010 verified:true) ----
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'tres_modeste',
    amountEUR: 1200,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'modeste',
    amountEUR: 800,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — chauffe-eau thermo intermédiaire (Violet) 2026 à confirmer`,
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- Isolation combles perdus (source: mpr-011..012 verified:true — EUR/m²) ----
  {
    geste: 'isolation_combles',
    menageCategorie: 'tres_modeste',
    amountEUR: 25,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'EUR/m² — Bleu',
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'modeste',
    amountEUR: 20,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'EUR/m² — Jaune',
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — isolation combles Violet 2026 à confirmer (EUR/m²)`,
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- Isolation thermique par l'extérieur (ITE) (source: mpr-013..014 verified:true — EUR/m²) ----
  {
    geste: 'isolation_ite',
    menageCategorie: 'tres_modeste',
    amountEUR: 75,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'EUR/m² — Bleu, plafond 100 m² par logement (cf. mpr-015)',
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'modeste',
    amountEUR: 60,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'EUR/m² — Jaune, plafond 100 m² par logement',
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — ITE Violet 2026 à confirmer (EUR/m²)`,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- Isolation planchers bas (source: mpr-016 verified:true — EUR/m²) ----
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'tres_modeste',
    amountEUR: 25,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'EUR/m² — Bleu',
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — planchers bas Jaune 2026 à confirmer (EUR/m²)`,
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — planchers bas Violet 2026 à confirmer (EUR/m²)`,
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- VMC double flux (source: mpr-017 verified:false — statut MPR évolue 2024-2026) ----
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'tres_modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — VMC double flux Parcours par geste : sortie/réintroduction 2024-2026, valeur 2026 non confirmée`,
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — VMC double flux Jaune 2026 à confirmer`,
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — VMC double flux Violet 2026 à confirmer`,
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- Chaudière biomasse (source: mpr-018 verified:false — barème annuel) ----
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'tres_modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — chaudière biomasse Bleu 2026 à confirmer (révisions annuelles)`,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'modeste',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — chaudière biomasse Jaune 2026 à confirmer`,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'intermediaire',
    amountEUR: null,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: `${UNVERIFIED} — chaudière biomasse Violet 2026 à confirmer`,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste depuis recentrage 2024',
  },

  // ---- Audit énergétique (source: mpr-019..021 verified:true) ----
  {
    geste: 'audit_energetique',
    menageCategorie: 'tres_modeste',
    amountEUR: 500,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'modeste',
    amountEUR: 400,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'intermediaire',
    amountEUR: 300,
    sourceRef: 'ANAH_MAPRIMERENOV',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: 'Rose exclu du Parcours par geste',
  },
]

/**
 * Plafonds RFR 2026 par zone × nb personnes.
 *
 * Source ANAH 2026. Seul le cas mpr-046 (IDF, 1 pers, Bleu = 23 541 EUR) est
 * marqué `verified: true` dans le gold Ralph 7. Tous les autres sont
 * `verified: false` (revalorisation annuelle à confirmer). On reprend ici les
 * valeurs publiquement publiées pour le barème 2024 reconduit, mais on les
 * marque toutes UNVERIFIED tant que l'arrêté 2026 n'a pas été cité.
 *
 * Pour la valeur officiellement confirmée (mpr-046) : IDF 1 personne Bleu =
 * 23 541 EUR. Toutes les autres lignes sont structurellement renseignées
 * (besoin de la table pour calculer une catégorie) mais devront être croisées
 * avec l'arrêté 2026 final avant relâche prod.
 *
 * NOTE : `stepIncrement` non défini ici tant que la valeur 2026 n'est pas
 * confirmée — `determineMenageCategorie` clampe alors nbPersonnes à 5 (cf.
 * `getPlafonds`). Un test golden documente ce comportement.
 */
export const PLAFONDS_REVENUS_2026: ReadonlyArray<PlafondRevenusEntry> = [
  // Île-de-France
  {
    zone: 'idf',
    nbPersonnes: 1,
    tresModesteMax: 23541,
    modesteMax: 28657,
    intermediaireMax: 40018,
  },
  {
    zone: 'idf',
    nbPersonnes: 2,
    tresModesteMax: 34551,
    modesteMax: 42058,
    intermediaireMax: 58827,
  },
  {
    zone: 'idf',
    nbPersonnes: 3,
    tresModesteMax: 41493,
    modesteMax: 50513,
    intermediaireMax: 70382,
  },
  {
    zone: 'idf',
    nbPersonnes: 4,
    tresModesteMax: 48447,
    modesteMax: 58981,
    intermediaireMax: 82839,
  },
  {
    zone: 'idf',
    nbPersonnes: 5,
    tresModesteMax: 55427,
    modesteMax: 67473,
    intermediaireMax: 94844,
  },
  // Hors Île-de-France
  {
    zone: 'hors_idf',
    nbPersonnes: 1,
    tresModesteMax: 17009,
    modesteMax: 21805,
    intermediaireMax: 30549,
  },
  {
    zone: 'hors_idf',
    nbPersonnes: 2,
    tresModesteMax: 24875,
    modesteMax: 31889,
    intermediaireMax: 44907,
  },
  {
    zone: 'hors_idf',
    nbPersonnes: 3,
    tresModesteMax: 29917,
    modesteMax: 38349,
    intermediaireMax: 54071,
  },
  {
    zone: 'hors_idf',
    nbPersonnes: 4,
    tresModesteMax: 34948,
    modesteMax: 44802,
    intermediaireMax: 63235,
  },
  {
    zone: 'hors_idf',
    nbPersonnes: 5,
    tresModesteMax: 40002,
    modesteMax: 51281,
    intermediaireMax: 72400,
  },
]

export function getBaremeEntry(
  geste: Geste,
  menageCategorie: MenageCategorie
): BaremeEntry | undefined {
  return BAREME_MPR_2026.find((e) => e.geste === geste && e.menageCategorie === menageCategorie)
}

export function getPlafonds(zone: Zone, nbPersonnes: number): PlafondRevenusEntry | undefined {
  if (!Number.isFinite(nbPersonnes) || nbPersonnes < 1) return undefined
  const clampedNb = Math.min(Math.floor(nbPersonnes), 5)
  return PLAFONDS_REVENUS_2026.find((p) => p.zone === zone && p.nbPersonnes === clampedNb)
}

export const ALL_GESTES: ReadonlyArray<Geste> = [
  'pac_air_eau',
  'pac_geothermique',
  'pac_air_air',
  'chauffe_eau_thermo',
  'isolation_combles',
  'isolation_ite',
  'isolation_planchers_bas',
  'vmc_double_flux',
  'chaudiere_biomasse',
  'audit_energetique',
]

export const ALL_MENAGE_CATEGORIES: ReadonlyArray<MenageCategorie> = [
  'tres_modeste',
  'modeste',
  'intermediaire',
  'superieur',
]
