/**
 * Schema.org `Dataset` wrappers émis dans chaque réponse `/api/v1/aides/*`.
 *
 * Pourquoi : chaque endpoint = une ressource CC-BY 4.0 citable. Le wrapper
 * Dataset permet à ChatGPT / Perplexity / Claude Search / Gemini AIO
 * d'indexer la réponse comme un asset, pas comme du JSON opaque, et de
 * remonter la mention "Source : ServicesArtisans" dans leurs answers.
 *
 * Le champ `dateModified` est volontairement hardcodé ici plutôt que ré-exporté
 * depuis `@/lib/aides/__sources` : on garde Ralph 12 territory intouché tant
 * que le barrel n'expose pas `SOURCES.ANAH_MAPRIMERENOV.snapshot` à la racine
 * d'un helper public. Synchroniser manuellement avec `__sources.ts` (MPR) et
 * `__sources-cee.ts` (CEE) à chaque bump de snapshot. NB : `SOURCES` EST
 * exposé via `@/lib/aides` (cf. barrel), mais on évite l'import pour ne pas
 * créer de dépendance silencieuse au shape interne du record `SOURCES`.
 */

import { SOURCES } from '@/lib/aides'

export function buildMprDatasetSchema(canonicalUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': canonicalUrl,
    name: "Barème MaPrimeRénov' 2026 — ServicesArtisans",
    description:
      "Computed bareme amount for the specified geste + ménage catégorie + zone, sourced from the official ANAH MaPrimeRenov' table snapshot.",
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    dateModified: SOURCES.ANAH_MAPRIMERENOV.snapshot,
    keywords: 'maprimerenov, mpr, aide renovation energetique, anah, france',
    spatialCoverage: 'FR',
    inLanguage: 'fr',
  }
}

export function buildCeeDatasetSchema(canonicalUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': canonicalUrl,
    name: 'Calcul CEE 2026 — ServicesArtisans',
    description:
      'Computed CEE kWh cumac + coup-de-pouce bonus + market price total EUR amount for the specified geste + zone + type logement + menage categorie.',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    // CEE snapshot kept in sync manually with @/lib/cee/__sources-cee.ts
    // until v0.2 exposes a uniform `SOURCES_CEE.<ref>.snapshot` getter.
    dateModified: '2026-04-15',
    keywords: 'cee, certificats economies energie, coup de pouce, sonergia',
    spatialCoverage: 'FR',
    inLanguage: 'fr',
  }
}

export function buildCumulDatasetSchema(canonicalUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': canonicalUrl,
    name: 'Règles de cumul aides rénovation 2026 — ServicesArtisans',
    description:
      'Cumul matrix per geste : MPR x CEE x Eco-PTZ x TVA 5,5 %. Snapshot des règles officielles 2026.',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    dateModified: '2026-04-15',
    keywords: 'cumul aides, maprimerenov, cee, eco-ptz, tva 5.5, france renov',
    spatialCoverage: 'FR',
    inLanguage: 'fr',
  }
}
