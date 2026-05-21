/**
 * Sources officielles — barèmes MaPrimeRénov' 2026.
 *
 * Tout chiffre cité dans `bareme-mpr-2026.ts` doit pointer vers une de ces
 * sources avec date de snapshot. Si une valeur est ajoutée sans `sourceRef`,
 * la table source-of-truth deviendrait silencieusement injoignable et le
 * golden test d'invariants ci-dessous (voir `bareme-mpr-2026.test.ts`)
 * échouera explicitement — c'est le filet anti-régression YMYL.
 *
 * Memory `feedback_legal_data_quality` : zéro tolérance pour les valeurs
 * inventées. Mieux vaut amountEUR = null + notes 'UNVERIFIED_PENDING_SOURCE'
 * que de fabriquer un chiffre faux.
 */

export const SOURCES = {
  ANAH_MAPRIMERENOV: {
    url: 'https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov',
    snapshot: '2026-04-15',
    title: "ANAH — MaPrimeRénov' 2026",
    placeholder: false,
  },
  FRANCE_RENOV: {
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
    snapshot: '2026-04-15',
    title: "France Rénov' — Aides MaPrimeRénov'",
    placeholder: false,
  },
  DECRET_2025_MPR: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT_PLACEHOLDER_MPR_2026',
    snapshot: '2026-01-01',
    title: 'Décret n°2025-XXX relatif à MaPrimeRénov 2026 (à compléter)',
    placeholder: true,
  },
  SERVICE_PUBLIC_MPR: {
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
    snapshot: '2026-04-15',
    title: "Service-public.fr — MaPrimeRénov'",
    placeholder: false,
  },
} as const

export type SourceRef = keyof typeof SOURCES

export function getSource(ref: SourceRef) {
  return SOURCES[ref]
}

export function isPlaceholderSource(ref: SourceRef): boolean {
  return SOURCES[ref].placeholder === true
}
