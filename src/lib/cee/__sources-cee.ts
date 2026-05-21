/**
 * Sources officielles — Certificats d'Économies d'Énergie (CEE) 2026.
 *
 * Companion du registry MPR (src/lib/aides/__sources.ts, Ralph 12 c60e95250).
 *
 * Toute valeur kWh cumac / multiplicateur Coup de pouce / prix marché citée
 * dans le namespace `src/lib/cee/{forfaits-cee-2026,prix-marche,
 * zones-climatiques}.ts` doit pointer vers une de ces sources avec date de
 * snapshot. Si une valeur est ajoutée sans `sourceRef` valide, le golden
 * test d'invariants `forfaits-cee-2026.test.ts` échoue explicitement —
 * filet anti-régression YMYL aide financière.
 *
 * Memory `feedback_legal_data_quality` : zéro tolérance pour les valeurs
 * inventées. Mieux vaut `kwhCumac: null` + notes `UNVERIFIED_PENDING_SOURCE_2026`
 * que de fabriquer un chiffre faux.
 */

export const SOURCES_CEE = {
  ARRETE_22_DEC_2014: {
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029990568',
    snapshot: '2026-04-15',
    title: "Arrêté du 22 décembre 2014 modifié — fiches d'opérations standardisées CEE",
    placeholder: false,
  },
  COUP_DE_POUCE_CHAUFFAGE: {
    url: 'https://www.ecologie.gouv.fr/coup-de-pouce-chauffage',
    snapshot: '2026-04-15',
    title: 'Coup de pouce Chauffage — Ministère Transition Écologique',
    placeholder: false,
  },
  COUP_DE_POUCE_ISOLATION: {
    url: 'https://www.ecologie.gouv.fr/coup-de-pouce-isolation',
    snapshot: '2026-04-15',
    title: 'Coup de pouce Isolation — Ministère Transition Écologique',
    placeholder: false,
  },
  SONERGIA_GRILLE_TARIFAIRE: {
    url: 'https://www.sonergia.fr/particuliers/grille-tarifaire',
    snapshot: '2026-04-15',
    title: 'Sonergia — Grille tarifaire CEE 2026',
    placeholder: true,
  },
  ATM_ZONES_CLIMATIQUES: {
    url: 'https://www.ecologie.gouv.fr/sites/default/files/ATM_zones_climatiques.pdf',
    snapshot: '2026-01-01',
    title: 'ATM — Zones climatiques H1/H2/H3 France métropolitaine',
    placeholder: true,
  },
  EMMY_PRIX_MARCHE: {
    url: 'https://www.emmy.fr/',
    snapshot: '2026-04-15',
    title: 'Registre EMMY — cotations marché CEE',
    placeholder: false,
  },
} as const

export type SourceRefCEE = keyof typeof SOURCES_CEE

export function getSourceCEE(ref: SourceRefCEE) {
  return SOURCES_CEE[ref]
}

export function isPlaceholderSourceCEE(ref: SourceRefCEE): boolean {
  return SOURCES_CEE[ref].placeholder === true
}
