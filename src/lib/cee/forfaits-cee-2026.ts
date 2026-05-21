/**
 * Forfaits CEE 2026 — fiches d'opérations standardisées.
 *
 * Source : Arrêté 22 décembre 2014 modifié, fiches BAR-TH-XXX / BAR-EN-XXX,
 * Légifrance JORFTEXT000029990568. Snapshot : 2026-04-15.
 *
 * Sémantique `kwhCumac` :
 *  - number > 0 : forfait CEE par geste éligible (en kWh cumac actualisés sur
 *    durée de vie de l'opération).
 *  - null       : forfait paramétrique (dépend surface m² / puissance kW / COP /
 *    zone climatique pour PAC) non couvert v0. Sera étendu v0.2 avec helpers
 *    `computePacForfait(puissance, COP, zone)` etc.
 *
 * Memory `feedback_legal_data_quality` : préfère `kwhCumac: null` + notes
 * `UNVERIFIED_PENDING_SOURCE_2026` plutôt que d'inventer un chiffre. Le Critic
 * YMYL (Ralph 8) bloque tout output LLM qui cite un montant pour ces gestes
 * tant que les helpers v0.2 ne sont pas livrés.
 *
 * Fiches référencées (2026) :
 *  BAR-TH-104 : PAC air/eau, géothermie (résidentiel) — paramétrique
 *  BAR-TH-129 : PAC air/air (résidentiel) — paramétrique. ATTENTION éligible
 *               CEE mais PAS MPR (cas critique cumul).
 *  BAR-TH-148 : Chauffe-eau thermodynamique — forfait par zone H1/H2/H3
 *  BAR-EN-101 : Isolation combles perdus / rampants — forfait par m²
 *  BAR-EN-102 : Isolation murs (ITE / ITI) — forfait par m²
 *  BAR-EN-103 : Isolation planchers bas — forfait par m²
 *  BAR-TH-125 : VMC double flux autoréglable
 *  BAR-TH-127 : VMC double flux hygroréglable (résidentiel)
 *  BAR-TH-113 : Chaudière biomasse haute performance
 *  BAR-TH-164 : Audit énergétique (résidentiel)
 *
 * Les valeurs forfait par m²/zone non systématiquement publiées en 2026 stable
 * sont marquées UNVERIFIED ici plutôt que d'extrapoler les valeurs 2024-2025.
 */

import type {
  BonusCoupDePouce,
  CumulRule,
  ForfaitKwhCumac,
  GesteCEE,
  MenageCategorie,
  TypeLogement,
  ZoneClimatique,
} from './types'

const UNVERIFIED = 'UNVERIFIED_PENDING_SOURCE_2026' as const

export const FORFAITS_CEE_2026: ReadonlyArray<ForfaitKwhCumac> = [
  // ---- PAC air/eau — BAR-TH-104 (paramétrique : surface chauffée × COP × zone) ----
  {
    geste: 'pac_air_eau',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-104',
    notes: `${UNVERIFIED}: paramétrique (surface chauffée × COP × zone). v0.2 helper computePacForfait.`,
  },
  {
    geste: 'pac_air_eau',
    kwhCumac: null,
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-104',
    notes: `${UNVERIFIED}: paramétrique (surface chauffée × COP × zone). v0.2 helper computePacForfait.`,
  },

  // ---- PAC géothermique — BAR-TH-104 (paramétrique) ----
  {
    geste: 'pac_geothermique',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-104',
    notes: `${UNVERIFIED}: paramétrique (surface chauffée × COP × zone). v0.2 helper computePacForfait.`,
  },

  // ---- PAC air/air — BAR-TH-129 (paramétrique, CEE OUI / MPR NON — cas critique) ----
  {
    geste: 'pac_air_air',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-129',
    notes:
      'PAC air/air éligible CEE uniquement (NON éligible MPR). Paramétrique surface × SCOP × zone. v0.2 helper.',
  },
  {
    geste: 'pac_air_air',
    kwhCumac: null,
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-129',
    notes:
      'PAC air/air éligible CEE uniquement (NON éligible MPR). Paramétrique surface × SCOP × zone. v0.2 helper.',
  },

  // ---- Chauffe-eau thermodynamique — BAR-TH-148 (forfait par zone) ----
  // Valeurs 2026 stables non publiées au snapshot 2026-04-15 -> UNVERIFIED.
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H1',
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H1 maison 2026.`,
  },
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H2',
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H2 maison 2026.`,
  },
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H3',
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H3 maison 2026.`,
  },
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H1',
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H1 appartement 2026.`,
  },
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H2',
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H2 appartement 2026.`,
  },
  {
    geste: 'chauffe_eau_thermo',
    kwhCumac: null,
    zone: 'H3',
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-148',
    notes: `${UNVERIFIED}: vérifier forfait CET zone H3 appartement 2026.`,
  },

  // ---- Isolation combles perdus / rampants — BAR-EN-101 (forfait par m², paramétrique) ----
  {
    geste: 'isolation_combles',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-EN-101',
    notes: `${UNVERIFIED}: forfait par m² × zone × R-min. v0.2 helper computeIsolationForfait.`,
  },
  {
    geste: 'isolation_combles',
    kwhCumac: null,
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-EN-101',
    notes: `${UNVERIFIED}: forfait par m² × zone × R-min. v0.2 helper computeIsolationForfait.`,
  },

  // ---- Isolation ITE / ITI — BAR-EN-102 (forfait par m², paramétrique) ----
  {
    geste: 'isolation_ite',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-EN-102',
    notes: `${UNVERIFIED}: forfait par m² × zone. v0.2 helper computeIsolationForfait.`,
  },
  {
    geste: 'isolation_ite',
    kwhCumac: null,
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-EN-102',
    notes: `${UNVERIFIED}: forfait par m² × zone. v0.2 helper computeIsolationForfait.`,
  },

  // ---- Isolation planchers bas — BAR-EN-103 (forfait par m², paramétrique) ----
  {
    geste: 'isolation_planchers_bas',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-EN-103',
    notes: `${UNVERIFIED}: forfait par m² × zone. v0.2 helper computeIsolationForfait.`,
  },

  // ---- VMC double flux — BAR-TH-127 (forfait paramétrique par logement) ----
  {
    geste: 'vmc_double_flux',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-127',
    notes: `${UNVERIFIED}: forfait par logement × zone. v0.2 helper computeVmcForfait.`,
  },
  {
    geste: 'vmc_double_flux',
    kwhCumac: null,
    typeLogement: 'appartement',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-127',
    notes: `${UNVERIFIED}: forfait par logement × zone. v0.2 helper computeVmcForfait.`,
  },

  // ---- Chaudière biomasse haute performance — BAR-TH-113 (paramétrique) ----
  {
    geste: 'chaudiere_biomasse',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-113',
    notes: `${UNVERIFIED}: paramétrique surface × zone. v0.2 helper computeBiomasseForfait.`,
  },

  // ---- Audit énergétique — BAR-TH-164 ----
  // CEE pour audit énergétique est typiquement secondaire vs MPR ; valeur 2026
  // non publiée stable au snapshot -> UNVERIFIED.
  {
    geste: 'audit_energetique',
    kwhCumac: null,
    typeLogement: 'maison_individuelle',
    sourceRef: 'ARRETE_22_DEC_2014',
    fiche: 'BAR-TH-164',
    notes: `${UNVERIFIED}: forfait audit 2026 à vérifier. Audit principalement financé par MPR.`,
  },
]

/**
 * Bonus "Coup de pouce" 2026 — majoration appliquée au forfait CEE de base.
 *
 * Périmètre :
 *  - Coup de pouce Chauffage : PAC air/eau, géothermique, chaudière biomasse.
 *  - Coup de pouce Isolation : isolation combles, ITE/ITI, planchers bas.
 *  - Catégories `intermediaire` et `superieur` : multiplicateur 1.0 (pas de
 *    coup de pouce) — explicité ici pour que le lookup ne retourne pas
 *    `undefined` et que le calculator applique 1.0 sans ambiguïté.
 *
 * Multiplicateurs cités UNVERIFIED tant que l'arrêté Coup de pouce 2026
 * exact n'est pas re-publié au snapshot. Le Critic bloquera tout output LLM
 * qui cite un %/montant Coup de pouce avant levée du flag.
 *
 * Source : `COUP_DE_POUCE_CHAUFFAGE` / `COUP_DE_POUCE_ISOLATION`.
 */
export const BONUS_COUP_DE_POUCE_2026: ReadonlyArray<BonusCoupDePouce> = [
  // -- PAC air/eau --
  {
    geste: 'pac_air_eau',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur PAC air/eau tres_modeste 2026.`,
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur PAC air/eau modeste 2026.`,
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'pac_air_eau',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- PAC géothermique --
  {
    geste: 'pac_geothermique',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur PAC géothermique tres_modeste 2026.`,
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur PAC géothermique modeste 2026.`,
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'pac_geothermique',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- PAC air/air (CEE seul, pas MPR — Coup de pouce historiquement non cumulable) --
  {
    geste: 'pac_air_air',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: 'PAC air/air hors Coup de pouce chauffage (multiplicateur 1.0).',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: 'PAC air/air hors Coup de pouce chauffage (multiplicateur 1.0).',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'pac_air_air',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- Chauffe-eau thermodynamique : hors Coup de pouce (multiplicateur 1.0 partout). --
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'chauffe_eau_thermo',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- Isolation combles --
  {
    geste: 'isolation_combles',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur isolation combles tres_modeste 2026.`,
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur isolation combles modeste 2026.`,
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'isolation_combles',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },

  // -- Isolation ITE / ITI --
  {
    geste: 'isolation_ite',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur isolation ITE tres_modeste 2026.`,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur isolation ITE modeste 2026.`,
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'isolation_ite',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },

  // -- Isolation planchers bas --
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur planchers bas tres_modeste 2026.`,
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
    notes: `${UNVERIFIED}: vérifier multiplicateur planchers bas modeste 2026.`,
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'isolation_planchers_bas',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },

  // -- VMC double flux : hors Coup de pouce. --
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'vmc_double_flux',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- Chaudière biomasse --
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.5,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur chaudière biomasse tres_modeste 2026.`,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'modeste',
    multiplicateur: 1.3,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: `${UNVERIFIED}: vérifier multiplicateur chaudière biomasse modeste 2026.`,
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'chaudiere_biomasse',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },

  // -- Audit énergétique : hors Coup de pouce. --
  {
    geste: 'audit_energetique',
    menageCategorie: 'tres_modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'modeste',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'intermediaire',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'audit_energetique',
    menageCategorie: 'superieur',
    multiplicateur: 1.0,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
]

/**
 * Règles cumul aides par geste — qui se cumule avec quoi.
 *
 * Sources :
 *  - Cumul CEE × MPR : règle générale autorisée sauf PAC air/air (BAR-TH-129)
 *    qui est explicitement exclue du Parcours MPR.
 *  - Eco-PTZ : cumulable avec MPR et CEE pour tous les gestes éligibles.
 *  - TVA 5,5 % : applicable à tous les travaux d'amélioration énergétique éligibles.
 */
export const CUMUL_RULES_2026: ReadonlyArray<CumulRule> = [
  {
    geste: 'pac_air_eau',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'pac_geothermique',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'pac_air_air',
    cumulableMPR: false,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
    notes: 'PAC air/air = CEE seul, pas MPR (exclue Parcours par geste depuis recentrage).',
  },
  {
    geste: 'chauffe_eau_thermo',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'ARRETE_22_DEC_2014',
  },
  {
    geste: 'isolation_combles',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'isolation_ite',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'isolation_planchers_bas',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_ISOLATION',
  },
  {
    geste: 'vmc_double_flux',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'ARRETE_22_DEC_2014',
  },
  {
    geste: 'chaudiere_biomasse',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: true,
    sourceRef: 'COUP_DE_POUCE_CHAUFFAGE',
  },
  {
    geste: 'audit_energetique',
    cumulableMPR: true,
    cumulableEcoPTZ: true,
    cumulableTVA55: false,
    sourceRef: 'ARRETE_22_DEC_2014',
    notes: 'Audit énergétique : prestation intellectuelle, hors champ TVA 5,5 % travaux.',
  },
]

/**
 * Lookup forfait par geste × zone × type logement.
 *
 * Politique de match :
 *  - Si une entrée déclare une `zone`, elle doit matcher exactement.
 *  - Si pas de `zone` déclarée, l'entrée matche toutes les zones (forfait
 *    indépendant du climat).
 *  - Type logement : `'tous'` matche maison ET appartement.
 */
export function getForfait(
  geste: GesteCEE,
  zone: ZoneClimatique,
  typeLogement: 'maison_individuelle' | 'appartement'
): ForfaitKwhCumac | undefined {
  return FORFAITS_CEE_2026.find(
    (f) =>
      f.geste === geste &&
      (f.zone === undefined || f.zone === zone) &&
      (f.typeLogement === 'tous' || f.typeLogement === typeLogement)
  )
}

export function getBonus(
  geste: GesteCEE,
  menageCategorie: MenageCategorie
): BonusCoupDePouce | undefined {
  return BONUS_COUP_DE_POUCE_2026.find(
    (b) => b.geste === geste && b.menageCategorie === menageCategorie
  )
}

export function getCumul(geste: GesteCEE): CumulRule | undefined {
  return CUMUL_RULES_2026.find((r) => r.geste === geste)
}

/** Énumération exhaustive utile pour tests d'invariants. */
export const ALL_GESTES_CEE: ReadonlyArray<GesteCEE> = [
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

export const ALL_MENAGE_CATEGORIES_CEE: ReadonlyArray<MenageCategorie> = [
  'tres_modeste',
  'modeste',
  'intermediaire',
  'superieur',
]

export const ALL_ZONES_CLIMATIQUES: ReadonlyArray<ZoneClimatique> = ['H1', 'H2', 'H3']

export const ALL_TYPE_LOGEMENT: ReadonlyArray<TypeLogement> = [
  'maison_individuelle',
  'appartement',
  'tous',
]
