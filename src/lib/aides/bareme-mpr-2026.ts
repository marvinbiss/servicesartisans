/**
 * MaPrimeRénov' 2026 — barème par geste × catégorie ménage.
 *
 * Source ANAH https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov
 * Snapshot : 2026-04-15
 * Révision réforme : 2026-07-28
 *
 * ⚠ RÉFORME DU 01/01/2026 — deux gestes sortis du parcours par geste :
 *   - isolation des murs (ITE / ITI)
 *   - chaudières biomasse
 * Les deux restent aidés via CEE / Coup de pouce, TVA 5,5 %, éco-PTZ, ou
 * MaPrimeRénov' en parcours accompagné. Sources : economie.gouv.fr (parcours
 * par geste), france-renov.gouv.fr, consultées le 2026-07-28. Guichet MPR
 * rouvert le 23/02/2026.
 *
 * Ces entrées sont passées à `amountEUR: 0` avec un motif explicite. Elles
 * portaient jusqu'au 2026-07-28 des valeurs actives (ITE 75 / 60 EUR/m²)
 * marquées verified:true, servies au public par `calculator.ts`, l'API
 * `/api/v1/aides`, le MCP `get-bareme-mpr` et le résolveur GraphQL.
 *
 * Le reste du fichier demeure un snapshot 2026-04-15 : les montants encore
 * actifs (PAC, combles, planchers, CET, audit) n'ont PAS été re-vérifiés
 * contre la grille officielle post-réforme. Seul le forfait PAC air/eau
 * ménage modeste (4 000 EUR, plafond de dépense 12 000 EUR) a été corroboré
 * par economie.gouv.fr le 2026-07-28.
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
 *   Isolation planchers bas Bleu=25/m² (mpr-016)
 *   (mpr-013..015, ITE 75/60 EUR/m² + plafond 100 m² : CADUQUES depuis la
 *    réforme du 01/01/2026, cas gold repassés verified:false)
 *   Audit énergétique Bleu=500, Jaune=400, Violet=300 (mpr-019..021)
 */

import type { BaremeEntry, Geste, MenageCategorie, PlafondRevenusEntry, Zone } from './types'

const UNVERIFIED = 'UNVERIFIED_PENDING_SOURCE_2026' as const

/**
 * Motif renvoyé par `computeMprAmount` pour les gestes retirés du parcours par
 * geste au 01/01/2026. Sert de `reason` côté calculateur et API publique : on
 * explique la sortie du dispositif plutôt que de renvoyer un montant nul muet.
 */
const MURS_HORS_GESTE_2026 =
  "Isolation des murs sortie du parcours par geste MaPrimeRénov' au 01/01/2026 — reste aidée via CEE (BAR-EN-102), TVA 5,5 %, éco-PTZ ou parcours accompagné"

/** Idem pour les chaudières biomasse, retirées à la même date. */
const BIOMASSE_HORS_GESTE_2026 =
  "Chaudière biomasse sortie du parcours par geste MaPrimeRénov' au 01/01/2026 — reste aidée via CEE / Coup de pouce, TVA 5,5 %, éco-PTZ ou parcours accompagné"

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

  // ---- Isolation des murs (ITE / ITI) — SORTIE DU PARCOURS PAR GESTE 2026 ----
  // Réforme du 01/01/2026 : l'isolation des murs n'est plus financée par
  // MaPrimeRénov' parcours par geste, quelle que soit la catégorie de ménage.
  // Elle reste aidée via les CEE (BAR-EN-102), la TVA 5,5 %, l'éco-PTZ, ou
  // MaPrimeRénov' en parcours accompagné (rénovation d'ampleur).
  //
  // Les valeurs 75 / 60 EUR/m² qui figuraient ici provenaient du snapshot
  // 2026-04-15 et étaient marquées verified:true — elles ont continué à être
  // servies par le calculateur, l'API publique /api/v1/aides, le MCP et
  // GraphQL après la réforme. Cas gold mpr-013/014/015 repassés verified:false.
  {
    geste: 'isolation_ite',
    menageCategorie: 'tres_modeste',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: MURS_HORS_GESTE_2026,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'modeste',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: MURS_HORS_GESTE_2026,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'intermediaire',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: MURS_HORS_GESTE_2026,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: MURS_HORS_GESTE_2026,
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

  // ---- Chaudière biomasse — SORTIE DU PARCOURS PAR GESTE 2026 ----
  // Retirée du parcours par geste au 01/01/2026, comme l'isolation des murs.
  // Les entrées étaient jusqu'ici `null` (« à confirmer »), ce qui laissait
  // entendre une éligibilité en attente de barème : c'est désormais une
  // exclusion, pas une valeur manquante.
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'tres_modeste',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: BIOMASSE_HORS_GESTE_2026,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'modeste',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: BIOMASSE_HORS_GESTE_2026,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'intermediaire',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: BIOMASSE_HORS_GESTE_2026,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'superieur',
    amountEUR: 0,
    sourceRef: 'ANAH_MAPRIMERENOV',
    notes: BIOMASSE_HORS_GESTE_2026,
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
