/**
 * Google Search Console API Client — ServicesArtisans
 *
 * Réutilisable pour récupérer les stats d'indexation, le statut des sitemaps,
 * et les performances de recherche via l'API GSC.
 *
 * Auth : Service Account via variable d'env GSC_CREDENTIALS (JSON stringifié)
 *        ou GOOGLE_SERVICE_ACCOUNT_KEY (fallback).
 */

import { google, type searchconsole_v1 } from 'googleapis'
import { SITE_URL } from '@/lib/seo/config'

// ── Types ────────────────────────────────────────────────────────────────────

export interface GSCIndexationStats {
  /** Total pages soumises via sitemaps */
  submittedPages: number
  /** Pages indexées (approximation via Search Analytics — pages avec au moins 1 impression) */
  indexedPages: number
  /** Ratio indexation (0-1) */
  indexationRatio: number
  /** Sitemaps avec erreurs */
  sitemapErrors: GSCSitemapStatus[]
  /** Détail par sitemap */
  sitemaps: GSCSitemapStatus[]
  /** Timestamp de la collecte */
  collectedAt: string
}

export interface GSCSitemapStatus {
  path: string
  type: string
  submitted: number
  indexed: number
  isPending: boolean
  hasErrors: boolean
  lastDownloaded: string | null
  warnings: number
  errors: number
}

export interface GSCSearchPerformance {
  clicks: number
  impressions: number
  ctr: number
  position: number
  /** Période couverte (jours) */
  days: number
}

// ── Client ───────────────────────────────────────────────────────────────────

const SITE_PROPERTY = SITE_URL

function getCredentials(): Record<string, unknown> | null {
  const raw = process.env.GSC_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    console.error('[gsc-client] Failed to parse GSC credentials JSON')
    return null
  }
}

function createGSCClient(): searchconsole_v1.Searchconsole | null {
  const credentials = getCredentials()
  if (!credentials) return null

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as Record<string, string>,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  return google.searchconsole({ version: 'v1', auth })
}

/**
 * Récupère le statut de tous les sitemaps soumis dans GSC.
 * Utilise l'API Sitemaps.list pour obtenir le nombre de pages soumises/indexées.
 */
export async function getSitemapStatus(): Promise<GSCSitemapStatus[]> {
  const client = createGSCClient()
  if (!client) {
    throw new Error('GSC credentials not configured')
  }

  // GSC attend le format "sc-domain:example.com" ou "https://example.com/"
  const siteUrl = SITE_PROPERTY.replace(/\/+$/, '') + '/'

  const response = await client.sitemaps.list({ siteUrl })
  const sitemaps = response.data.sitemap || []

  return sitemaps.map((sm) => {
    const contents = sm.contents || []
    const submitted = contents.reduce((sum, c) => sum + (Number(c.submitted) || 0), 0)
    const indexed = contents.reduce((sum, c) => sum + (Number(c.indexed) || 0), 0)

    return {
      path: sm.path || '',
      type: sm.type || 'unknown',
      submitted,
      indexed,
      isPending: sm.isPending || false,
      hasErrors: Number(sm.errors ?? 0) > 0,
      lastDownloaded: sm.lastDownloaded || null,
      warnings: Number(sm.warnings) || 0,
      errors: Number(sm.errors) || 0,
    }
  })
}

/**
 * Récupère les stats d'indexation globales :
 * - Nombre total de pages soumises (via Sitemaps API)
 * - Nombre de pages indexées (via Sitemaps API — champ `indexed`)
 * - Ratio d'indexation
 */
export async function getIndexationStats(): Promise<GSCIndexationStats> {
  const sitemaps = await getSitemapStatus()

  const submittedPages = sitemaps.reduce((sum, sm) => sum + sm.submitted, 0)
  const indexedPages = sitemaps.reduce((sum, sm) => sum + sm.indexed, 0)
  const indexationRatio = submittedPages > 0 ? indexedPages / submittedPages : 0
  const sitemapErrors = sitemaps.filter((sm) => sm.hasErrors)

  return {
    submittedPages,
    indexedPages,
    indexationRatio,
    sitemapErrors,
    sitemaps,
    collectedAt: new Date().toISOString(),
  }
}

/**
 * Récupère les performances de recherche sur les N derniers jours.
 * Utilise l'API Search Analytics.
 */
export async function getSearchPerformance(days = 28): Promise<GSCSearchPerformance> {
  const client = createGSCClient()
  if (!client) {
    throw new Error('GSC credentials not configured')
  }

  const siteUrl = SITE_PROPERTY.replace(/\/+$/, '') + '/'
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: [],
      rowLimit: 1,
    },
  })

  const rows = response.data.rows || []
  if (rows.length === 0) {
    return { clicks: 0, impressions: 0, ctr: 0, position: 0, days }
  }

  const row = rows[0]
  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
    days,
  }
}
