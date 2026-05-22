/**
 * GET /api/v1/barometre/renovation/export.csv
 *
 * Sprint 5 — Indice Rénovation™ export CSV stable destiné à la
 * soumission data.gouv.fr (dataset officiel CC-BY 4.0).
 *
 * 5 colonnes déterministes : metric, value, unit, source, last_updated.
 * Synchrone avec les KPIs publiés par /api/v1/barometre/renovation/embed.html
 * et par /barometre/renovation-energetique-2026 (single source of truth).
 *
 * Données = agrégation publique :
 *   - ADEME / France Rénov' (parc DPE, RGE)
 *   - ANAH (MaPrimeRénov')
 *   - INSEE (résidences principales)
 *   - BPI France / Xerfi (marché €)
 *   - Citepa (émissions CO2)
 *
 * Licence : CC-BY 4.0 — citation obligatoire
 *   « Source : ServicesArtisans — Baromètre Rénovation 2026 ».
 *
 * Cache 1h (compatible recrawl léger des moteurs/dataset registries).
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = 3600

type Kpi = {
  metric: string
  value: string
  unit: string
  source: string
  last_updated: string
}

const LAST_UPDATED = '2026-05-06'

const KPIS: Kpi[] = [
  {
    metric: 'logements_france',
    value: '30400000',
    unit: 'logements',
    source: 'INSEE — Parc résidences principales 2024',
    last_updated: LAST_UPDATED,
  },
  {
    metric: 'passoires_thermiques_F_G',
    value: '5100000',
    unit: 'logements',
    source: 'ADEME — Bilan rénovation énergétique 2024',
    last_updated: LAST_UPDATED,
  },
  {
    metric: 'dossiers_maprimerenov_2024',
    value: '700000',
    unit: 'dossiers',
    source: 'ANAH — Bilan MaPrimeRénov 2024',
    last_updated: LAST_UPDATED,
  },
  {
    metric: 'artisans_rge_actifs',
    value: '62000',
    unit: 'entreprises',
    source: 'France Rénov — Annuaire RGE (mai 2025)',
    last_updated: LAST_UPDATED,
  },
  {
    metric: 'marche_renovation_2026',
    value: '87000000000',
    unit: 'euros',
    source: 'BPI France / Xerfi — Étude marché rénovation 2024',
    last_updated: LAST_UPDATED,
  },
  {
    metric: 'baisse_co2_residentiel_vs_2020',
    value: '-7',
    unit: 'pourcentage',
    source: 'Citepa — Inventaire émissions GES France',
    last_updated: LAST_UPDATED,
  },
]

const CSV_HEADERS = ['metric', 'value', 'unit', 'source', 'last_updated'] as const

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function renderCsv(): string {
  const lines: string[] = []
  // RFC 4180 : préfixer par un commentaire CSV-friendly (préfixe #) est non standard.
  // On encode les meta-données dans un en-tête commentaire séparé renvoyé via header HTTP
  // (X-License, X-Source) + un README dataset.
  lines.push(CSV_HEADERS.join(','))
  for (const k of KPIS) {
    lines.push([k.metric, k.value, k.unit, k.source, k.last_updated].map(csvEscape).join(','))
  }
  // RFC 4180 : terminer par CRLF.
  return lines.join('\r\n') + '\r\n'
}

export async function GET() {
  const csv = renderCsv()
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="indice-renovation-energetique-2026.csv"',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'X-License': 'CC-BY-4.0',
      'X-License-URL': 'https://creativecommons.org/licenses/by/4.0/',
      'X-Attribution': 'ServicesArtisans — Baromètre Rénovation Énergétique 2026',
      'X-Canonical-URL': 'https://servicesartisans.fr/barometre/renovation-energetique-2026',
    },
  })
}
