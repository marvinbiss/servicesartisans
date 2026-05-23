/**
 * Open Data — exposition publique des datasets ServicesArtisans.
 *
 * Routes :
 *   GET /api/open-data/local-stats.json   → NDJSON streaming
 *   GET /api/open-data/local-stats.csv    → CSV (UTF-8 BOM)
 *   GET /api/open-data/manifest.json      → DCAT-AP manifest (catalogue)
 *
 * Le dataset RGE complet est servi en assets statiques générés par
 * `scripts/cron/export-rge-dataset.ts` → `/datasets/rge/rge-latest.{csv,json}`
 * (cron mensuel). Les agrégats locaux sont générés à la volée via le RPC
 * `export_open_data_local_stats` (migration 484) avec cache 24h.
 *
 * Stratégie SEO :
 *   - Soumission data.gouv.fr → backlink DR 92 (gouv.fr) + crawl par
 *     opendata réutilisateurs (insee.fr, observatoire-tpe-pme.fr).
 *   - Schema.org Dataset sur la page hub /open-data (SEO authoritative).
 *   - Licence Etalab 2.0 (compatible CC-BY 4.0).
 *
 * Sécurité :
 *   - PII-free (k-anonymat ≥ 10 dans le RPC + filtres column-level).
 *   - Cache long-tail (24h) pour absorber un traffic data.gouv non-throttlé.
 *   - Pas d'auth requise (open data = lecture publique).
 */

import { NextResponse } from 'next/server'
import { csvEscape } from '@/lib/open-data/csv-escape'
import { logger } from '@/lib/logger'
import { SITE_URL } from '@/lib/seo/config'
import { createAdminClient } from '@/lib/supabase/admin'

// dynamic='force-dynamic' (audit code-reviewer 2026-04-29 P0-1) : `force-static`
// est incompatible avec createAdminClient() runtime — Next.js 14 éjecte la
// route hors du build statique au moindre I/O. ISR via revalidate=86400 +
// Cache-Control s-maxage joue le même rôle CDN.
export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24h
export const maxDuration = 60

const VALID_DATASETS = new Set(['local-stats.json', 'local-stats.csv', 'manifest.json'])

const CSV_HEADER = [
  'city_slug',
  'city_name',
  'department_code',
  'region_name',
  'specialty',
  'provider_count',
  'rge_provider_count',
  'avg_rating',
  'review_count_total',
  'data_period_start',
  'data_period_end',
  'generated_at',
]

type LocalStatsRow = {
  city_slug: string | null
  city_name: string | null
  department_code: string | null
  region_name: string | null
  specialty: string | null
  provider_count: number | null
  rge_provider_count: number | null
  avg_rating: number | null
  review_count_total: number | null
  data_period_start: string | null
  data_period_end: string | null
  generated_at: string | null
}

function rowsToCsv(rows: LocalStatsRow[]): string {
  const lines = [CSV_HEADER.join(',')]
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.city_slug),
        csvEscape(r.city_name),
        csvEscape(r.department_code),
        csvEscape(r.region_name),
        csvEscape(r.specialty),
        csvEscape(r.provider_count),
        csvEscape(r.rge_provider_count),
        csvEscape(r.avg_rating),
        csvEscape(r.review_count_total),
        csvEscape(r.data_period_start),
        csvEscape(r.data_period_end),
        csvEscape(r.generated_at),
      ].join(',')
    )
  }
  // UTF-8 BOM (Excel-friendly) + line ending CRLF (RFC 4180 conformité).
  return '﻿' + lines.join('\r\n') + '\r\n'
}

function rowsToNdjson(rows: LocalStatsRow[]): string {
  return rows.map((r) => JSON.stringify(r)).join('\n') + '\n'
}

async function fetchLocalStats(): Promise<LocalStatsRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('export_open_data_local_stats')
  if (error) {
    logger.error('[open-data] RPC export_open_data_local_stats failed', undefined, {
      kind: 'open_data_rpc_error',
      message: error.message,
    })
    throw new Error('rpc_failed')
  }
  return (data ?? []) as LocalStatsRow[]
}

function buildManifest(): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10)
  return {
    '@context': 'https://www.w3.org/ns/dcat',
    '@type': 'dcat:Catalog',
    title: 'ServicesArtisans — Catalogue Open Data',
    description:
      'Catalogue ouvert ServicesArtisans : annuaire RGE certifiés ADEME et statistiques locales agrégées (commune × métier). Licence Etalab 2.0.',
    publisher: {
      '@type': 'foaf:Organization',
      name: 'ServicesArtisans',
      mbox: 'open-data@servicesartisans.fr',
      homepage: SITE_URL,
    },
    license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/',
    issued: '2026-04-29',
    modified: today,
    language: 'fr',
    dataset: [
      {
        '@type': 'dcat:Dataset',
        identifier: 'servicesartisans-rge',
        title: 'Annuaire artisans RGE certifiés (mise à jour mensuelle)',
        description:
          "Liste des artisans certifiés RGE (Reconnu Garant de l'Environnement) sourcée depuis l'annuaire officiel ADEME / France Rénov' (data.gouv.fr), enrichie par ServicesArtisans avec slug stable + URL canonique. Format CSV / NDJSON. Licence Etalab 2.0.",
        keywords: ['rge', 'renovation-energetique', 'artisans', 'ademe', 'maprimerenov', 'cee'],
        theme: ['énergie', 'logement', 'travaux'],
        accrualPeriodicity: 'http://purl.org/cld/freq/monthly',
        spatial: 'France',
        temporal: '2026-01-01/..',
        distribution: [
          {
            '@type': 'dcat:Distribution',
            title: 'Dernière version CSV',
            mediaType: 'text/csv',
            accessURL: `${SITE_URL}/datasets/rge/rge-latest.csv`,
            downloadURL: `${SITE_URL}/datasets/rge/rge-latest.csv`,
          },
          {
            '@type': 'dcat:Distribution',
            title: 'Dernière version NDJSON',
            mediaType: 'application/x-ndjson',
            accessURL: `${SITE_URL}/datasets/rge/rge-latest.json`,
            downloadURL: `${SITE_URL}/datasets/rge/rge-latest.json`,
          },
          {
            '@type': 'dcat:Distribution',
            title: 'Métadonnées (somme de contrôle SHA-256, comptes par champ)',
            mediaType: 'application/json',
            accessURL: `${SITE_URL}/datasets/rge/rge-latest.meta.json`,
            downloadURL: `${SITE_URL}/datasets/rge/rge-latest.meta.json`,
          },
        ],
      },
      {
        '@type': 'dcat:Dataset',
        identifier: 'servicesartisans-local-stats',
        title: 'Statistiques locales artisanales agrégées (commune × métier)',
        description:
          "Agrégats statistiques par commune et spécialité métier : nombre d'artisans actifs, nombre RGE, note moyenne et volume d'avis. Filtré par k-anonymat ≥ 10 pour empêcher la ré-identification d'un artisan unique. Licence Etalab 2.0.",
        keywords: ['artisans', 'statistiques-locales', 'commune', 'metier', 'avis', 'rge'],
        theme: ['économie', 'territoires', 'artisanat'],
        accrualPeriodicity: 'http://purl.org/cld/freq/daily',
        spatial: 'France',
        // temporal couvre la période source des données (depuis 2026-01-01,
        // ouverte). NE PAS utiliser P1D ici : DCAT temporal = couverture
        // historique, pas fréquence (qui vit dans accrualPeriodicity).
        temporal: '2026-01-01/..',
        distribution: [
          {
            '@type': 'dcat:Distribution',
            title: 'Données CSV',
            mediaType: 'text/csv',
            accessURL: `${SITE_URL}/api/open-data/local-stats.csv`,
            downloadURL: `${SITE_URL}/api/open-data/local-stats.csv`,
          },
          {
            '@type': 'dcat:Distribution',
            title: 'Données NDJSON',
            mediaType: 'application/x-ndjson',
            accessURL: `${SITE_URL}/api/open-data/local-stats.json`,
            downloadURL: `${SITE_URL}/api/open-data/local-stats.json`,
          },
        ],
      },
    ],
  }
}

export async function GET(_request: Request, ctx: { params: Promise<{ dataset: string }> }) {
  try {
    const { dataset } = await ctx.params
    if (!VALID_DATASETS.has(dataset)) {
      return NextResponse.json({ error: 'dataset_not_found' }, { status: 404 })
    }

    const headersBase: Record<string, string> = {
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=43200',
      'Access-Control-Allow-Origin': '*',
      'X-Robots-Tag': 'noindex, follow',
      'X-Content-Type-Options': 'nosniff',
    }

    if (dataset === 'manifest.json') {
      // Manifest = pure mémoire (pas de RPC), le sur-cacher n'a pas de sens.
      // Le data.gouv bot doit voir une mise à jour de modified rapidement
      // (audit code-reviewer 2026-04-29 P2-3).
      return NextResponse.json(buildManifest(), {
        headers: {
          ...headersBase,
          'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    }

    let rows: LocalStatsRow[]
    try {
      rows = await fetchLocalStats()
    } catch {
      return NextResponse.json({ error: 'dataset_unavailable' }, { status: 503 })
    }

    if (dataset === 'local-stats.csv') {
      return new Response(rowsToCsv(rows), {
        headers: {
          ...headersBase,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'inline; filename="servicesartisans-local-stats.csv"',
        },
      })
    }

    // local-stats.json (NDJSON streaming-friendly)
    return new Response(rowsToNdjson(rows), {
      headers: {
        ...headersBase,
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': 'inline; filename="servicesartisans-local-stats.ndjson"',
      },
    })
  } catch (error) {
    logger.error('[api/open-data/[dataset]] GET failed', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
