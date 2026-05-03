import { NextResponse } from 'next/server'

import { SITE_URL } from '@/lib/seo/config'
import { getRgeDefinedTermSetSchema } from '@/lib/seo/jsonld'
import { getAllRgeGlossaryEntries } from '@/lib/seo/rge-qualifications-glossary'

/**
 * /api/glossaire-rge.json — Sprint AC Ahrefs 2026-05-03.
 *
 * Endpoint open-data servant le DefinedTermSet RGE canonique (Sprint O)
 * en JSON-LD pur, licence CC-BY 4.0. Asset référençable par :
 *
 *   - data.gouv.fr (catalogue datasets ouverts)
 *   - Wikipedia (fact-check / source)
 *   - Journalistes (Le Monde, Capital, Que Choisir — articles aides énergie)
 *   - Blogs métier (effy, hellio, sonergia)
 *   - Devs tiers (widgets, dashboards, intégrations)
 *
 * Backlink-magnet à coût marginal nul : le DefinedTermSet existe déjà
 * via getRgeDefinedTermSetSchema. On ajoute juste une exposition publique
 * + license + CORS.
 *
 * Convention :
 *   - Content-Type `application/ld+json` (Schema.org compliant)
 *   - X-Robots-Tag noindex (c'est un asset technique, pas une page SERP)
 *   - CORS permissif (Access-Control-Allow-Origin: *) pour embed tiers
 *   - Cache 24h CDN (les définitions RGE sont stables sur l'année)
 *   - License CC-BY 4.0 explicite dans le JSON
 *   - Champs additionnels : creator, dateModified, isBasedOn officielles
 */

// Edge runtime : pure computation (zéro I/O DB), latence minimale.
export const runtime = 'edge'

// ISR-style cache : revalidate 24h. Les 16 qualifications RGE sont
// stables. Modification = nouveau deploy.
export const revalidate = 86400

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'
const OFFICIAL_SOURCES = [
  'https://france-renov.gouv.fr/',
  'https://annuaire-rge.ademe.fr/',
  'https://www.ecologie.gouv.fr/',
]

export async function GET(): Promise<NextResponse> {
  const entries = getAllRgeGlossaryEntries()
  const canonicalUrl = `${SITE_URL}/rge/glossaire`
  const apiUrl = `${SITE_URL}/api/glossaire-rge.json`

  const definedTermSet = getRgeDefinedTermSetSchema({
    pageUrl: canonicalUrl,
    name: 'Glossaire RGE — qualifications officielles 2026',
    description:
      "Vocabulaire canonique des 16 qualifications RGE reconnues par l'État pour MaPrimeRénov' et les primes CEE en 2026.",
    terms: entries,
  })

  // Enrichit avec métadonnées dataset (license, creator, isBasedOn).
  // Conformes data.gouv.fr / Schema.org Dataset best practices.
  const payload = {
    ...definedTermSet,
    license: LICENSE_URL,
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    dateModified: new Date().toISOString().slice(0, 10),
    isBasedOn: OFFICIAL_SOURCES,
    url: apiUrl,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/ld+json',
      contentUrl: apiUrl,
    },
  }

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json; charset=utf-8',
      // Cache CDN 24h + stale-while-revalidate 7j. Les données changent
      // rarement (1-2 fois/an quand un nouveau code Qualibat sort).
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      // CORS permissif : c'est un asset open-data. Permet aux widgets,
      // dashboards externes et fetch JS de tiers de l'embed.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      // Asset technique, pas une page SERP. Le SEO se fait via
      // /rge/glossaire (page HTML canonique Sprint O).
      'X-Robots-Tag': 'noindex',
      // Hint dataset open-data pour crawlers spécialisés.
      'X-License': LICENSE_URL,
    },
  })
}

export async function OPTIONS(): Promise<NextResponse> {
  // CORS preflight pour les fetch JS depuis domaines tiers.
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  })
}
