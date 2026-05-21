/**
 * Prix moyen kWh cumac 2026 — €/MWh cumac.
 *
 * Source : registre EMMY (cotations marché CEE) + Sonergia grille tarifaire
 * (partenaire mandataire SA — memory `servicesartisans-mandataire-cee-model-2026-04-14`).
 *
 * Fourchette observée pour les particuliers via délégataire en 2026 :
 *  - basse : 8 €/MWh cumac
 *  - moyenne : 10 €/MWh cumac (P50 mandataire SA via Sonergia)
 *  - haute : 12 €/MWh cumac
 *
 * Snapshot : 2026-04-15.
 *
 * Note : ces valeurs servent UNIQUEMENT à donner une estimation. La prime CEE
 * finale dépend du contrat exact entre l'obligé/délégataire et le bénéficiaire
 * (variabilité ±20 % observée selon période d'engagement et volume de dossiers).
 */

import type { SourceRefCEE } from './__sources-cee'

export const PRIX_MARCHE_CEE_2026: {
  readonly prixMoyenEurParMWhCumac: number
  readonly fourchetteBasseEurParMWhCumac: number
  readonly fourchetteHauteEurParMWhCumac: number
  readonly sourceRef: SourceRefCEE
  readonly snapshot: string
} = {
  prixMoyenEurParMWhCumac: 10,
  fourchetteBasseEurParMWhCumac: 8,
  fourchetteHauteEurParMWhCumac: 12,
  sourceRef: 'EMMY_PRIX_MARCHE',
  snapshot: '2026-04-15',
} as const
