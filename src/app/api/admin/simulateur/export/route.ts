/**
 * Admin API — Export CSV estimations simulateur
 * GET /api/admin/simulateur/export?categorie=&parcours=&zone=&from=&to=&consent=
 * Stream CSV filtré, max 10 000 lignes.
 * Voir docs/simulateur-architecture.md §7.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const exportQuerySchema = z.object({
  categorie: z.enum(['bleu', 'jaune', 'violet', 'rose']).optional(),
  parcours: z.enum(['geste', 'accompagne']).optional(),
  zone: z.enum(['H1', 'H2', 'H3']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  consent: z.enum(['all', 'true', 'false']).default('all'),
  search: z.string().optional(),
})

const MAX_EXPORT_ROWS = 10_000

const CSV_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'public_id', label: 'public_id' },
  { key: 'created_at', label: 'created_at' },
  { key: 'categorie_anah', label: 'categorie' },
  { key: 'parcours', label: 'parcours' },
  { key: 'zone_climatique', label: 'zone' },
  { key: 'rfr_tranche', label: 'rfr_tranche' },
  { key: 'surface_m2', label: 'surface_m2' },
  { key: 'mpr_total', label: 'mpr_total' },
  { key: 'cee_fourchette_bas', label: 'cee_bas' },
  { key: 'cee_fourchette_haut', label: 'cee_haut' },
  { key: 'coup_pouce_estimation', label: 'cdp_haut' },
  { key: 'reste_a_charge_bas', label: 'reste_a_charge_bas' },
  { key: 'reste_a_charge_haut', label: 'reste_a_charge_haut' },
  { key: 'pipedrive_deal_id', label: 'pipedrive_deal_id' },
  { key: 'barometre_version', label: 'baremes_version' },
]

/**
 * Escape une cellule CSV selon RFC 4180.
 * Quote si la cellule contient une virgule, guillemet, saut de ligne ou point-virgule.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str === '') return ''
  const needsQuote = /[",\n\r;]/.test(str)
  if (!needsQuote) return str
  return `"${str.replace(/"/g, '""')}"`
}

/** Transforme RFR en tranche 10k (RGPD §4 — anonymisation douce pour export). */
function rfrToTranche(rfr: number | null | undefined): string {
  if (typeof rfr !== 'number' || !Number.isFinite(rfr)) return ''
  const tranche = Math.floor(rfr / 10_000) * 10_000
  return `${tranche}-${tranche + 9999}`
}

export function buildCsv(
  rows: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string }> = CSV_COLUMNS
): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = row[c.key]
          return escapeCsvCell(raw)
        })
        .join(',')
    )
    .join('\n')
  return `${header}\n${body}`
}

export async function GET(request: NextRequest) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const { searchParams } = new URL(request.url)
    const parsed = exportQuerySchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { categorie, parcours, zone, from, to, consent, search } = parsed.data

    const supabase = createAdminClient()
    let query = supabase
      .from('simulateur_estimations')
      .select(
        `public_id, created_at, categorie_anah, parcours, zone_climatique, rfr, surface_m2,
         mpr_total, cee_fourchette_bas, cee_fourchette_haut, coup_pouce_estimation,
         reste_a_charge_bas, reste_a_charge_haut, pipedrive_deal_id, barometre_version`
      )
      .order('created_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS + 1)

    if (categorie) query = query.eq('categorie_anah', categorie)
    if (parcours) query = query.eq('parcours', parcours)
    if (zone) query = query.eq('zone_climatique', zone)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (consent === 'true') query = query.eq('consent_rgpd', true)
    if (consent === 'false') query = query.eq('consent_rgpd', false)
    if (search) query = query.ilike('public_id', `%${search}%`)

    const { data, error } = await query
    if (error) {
      logger.error('Admin simulateur export query error', error as unknown as Error)
      return NextResponse.json(
        { success: false, error: 'Erreur lecture estimations' },
        { status: 500 }
      )
    }

    const rows = (data ?? []).slice(0, MAX_EXPORT_ROWS).map((r) => ({
      ...r,
      rfr_tranche: rfrToTranche(r.rfr as number | null),
    }))

    const truncated = (data?.length ?? 0) > MAX_EXPORT_ROWS

    const csv = buildCsv(rows)

    await logAdminAction(auth.admin.id, 'simulateur.export', 'settings', 'csv', {
      rowCount: rows.length,
      truncated,
      filters: { categorie, parcours, zone, from, to, consent, search },
    })

    const headers: Record<string, string> = {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="simulateur-estimations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    }
    if (truncated) {
      headers['X-Export-Truncated'] = 'true'
      headers['X-Export-Max-Rows'] = String(MAX_EXPORT_ROWS)
    }

    // BOM UTF-8 pour Excel
    return new NextResponse('\uFEFF' + csv, { headers })
  } catch (error) {
    logger.error('Admin simulateur export exception', error as Error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
