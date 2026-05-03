/**
 * Constantes numériques YMYL des aides à la rénovation énergétique 2026.
 *
 * Source unique de vérité pour les montants chiffrés réutilisés dans :
 *   - Blog batches (batch-piliers-2026, batch-prix-services, batch-aides-saisonnier, etc.)
 *   - Landing pages (/aides, /cee, /rge, /renovation-energetique, /diagnostic, /travaux)
 *   - Schema.org markup (FinancialProduct.amount, GovernmentService offers)
 *   - Tests cohérence (assure que les call-sites n'ont pas dérivé)
 *
 * ⚠️ YMYL — toute modification doit :
 *   1. Pointer une source officielle vérifiable (france-renov.gouv.fr,
 *      service-public.fr, ademe.fr, ou arrêté publié au JORF).
 *   2. Mettre à jour `AIDES_LAST_REVIEWED` à la date de la vérification.
 *   3. Laisser le catalog `aides-catalog.ts` aligné sur ces valeurs (re-import
 *      progressif côté `montants[]` pour éviter le drift).
 *
 * Date de revue commune : 2026-04-29 (croisement france-renov.gouv.fr +
 * service-public.fr + ademe.fr). Réviser tous les 90 jours minimum.
 */

export const AIDES_LAST_REVIEWED = '2026-04-29' as const

// ---------------------------------------------------------------------------
// MaPrimeRénov' — Anah
// Source : france-renov.gouv.fr (parcours par geste / parcours accompagné)
// ---------------------------------------------------------------------------

export const MAPRIMERENOV = {
  /** Plafond global parcours par geste (1-2 gestes isolés). */
  MAX_PARCOURS_GESTE_EUR: 30_000,
  /** Plafond global parcours accompagné (2+ gestes + saut ≥ 2 classes DPE). */
  MAX_PARCOURS_ACCOMPAGNE_EUR: 70_000,
  /** PAC air-eau — bonus catégorie « bleu » (revenus très modestes).
   *  Source : arrêté Anah 2024-12-23 — plafond 5 000 € ménages très modestes
   *  pour PAC air-eau (parcours par geste). Vérifier après chaque arrêté annuel. */
  PAC_AIR_EAU_BLEU_EUR: 5_000,
  /** PAC air-eau — bonus catégorie « jaune » (revenus modestes). */
  PAC_AIR_EAU_JAUNE_EUR: 4_000,
  /** Numéro France Rénov' (appel non surtaxé). */
  PHONE_FRANCE_RENOV: '3818',
} as const

// ---------------------------------------------------------------------------
// Éco-prêt à taux zéro (éco-PTZ)
// Source : service-public.fr / ministère économie
// ---------------------------------------------------------------------------

export const ECO_PTZ = {
  /** Action seule (1 geste) — remb. 15 ans max. */
  MAX_ACTION_SEULE_EUR: 15_000,
  /** Bouquet de travaux (2+ gestes) — remb. 15 ans. */
  MAX_BOUQUET_EUR: 30_000,
  /** Performance énergétique globale (gain ≥ 35 %) — remb. 20 ans. */
  MAX_GLOBAL_EUR: 50_000,
  /** Assainissement non collectif. */
  MAX_ASSAINISSEMENT_EUR: 10_000,
  /** Durée maximale parcours global (années). */
  DURATION_GLOBAL_YEARS: 20,
} as const

// ---------------------------------------------------------------------------
// CEE — Certificats d'économies d'énergie / Coup de pouce
// Source : ecologie.gouv.fr (arrêtés CEE) + EMMY (registre national)
// ---------------------------------------------------------------------------

export const CEE = {
  /** Prime CEE bonifiée PAC — fourchette indicative 2026 (varie selon obligé).
   *  ⚠️ Le Coup de pouce chauffage charte standard a expiré pour les PAC en 2023 ;
   *  les obligés (TotalEnergies, EDF, Engie, Sonergia, etc.) appliquent des barèmes
   *  privés non standardisés. Cette valeur représente le plafond observé chez les
   *  principaux obligés résidentiels en 2026 — ne pas afficher comme garanti. */
  PAC_COUP_DE_POUCE_MAX_EUR: 5_000,
  /** TVA réduite travaux rénovation énergétique RGE (article 278-0 bis CGI). */
  TVA_REDUITE_PERCENT: 5.5,
} as const

// ---------------------------------------------------------------------------
// Cumul aides — pompe à chaleur (cas le plus demandé)
// Source : croisement MAPRIMERENOV + CEE + ECO_PTZ
// ---------------------------------------------------------------------------

export const CUMUL_PAC = {
  /** % max coût installation pris en charge (ménages très modestes 2026). */
  MAX_COVERAGE_VERY_MODEST_PERCENT: 90,
} as const

// ---------------------------------------------------------------------------
// Disclaimer YMYL standard — afficher sous chaque bloc montant
// ---------------------------------------------------------------------------

export const AIDES_DISCLAIMER =
  "Informations à titre indicatif. Les montants indiqués correspondent aux plafonds maximaux ; ils varient selon les revenus du foyer et les conditions d'éligibilité fixées par l'Anah. Vérifiez les conditions exactes sur france-renov.gouv.fr avant signature d'un devis." as const

// ---------------------------------------------------------------------------
// Helpers de formatage
// ---------------------------------------------------------------------------

const EURO_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** Formate un montant euros en `30 000 €` (espace insécable). */
export function formatEur(amount: number): string {
  return EURO_FORMATTER.format(amount)
}
