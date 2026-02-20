/**
 * Artisan Devis (Quotes) API
 * POST: Send a quote to a client
 * GET: Get quotes sent by the artisan
 *
 * TODO: table 'devis' does not exist. The schema has 'quotes' with incompatible columns
 * (provider_id/request_id vs artisan_id/devis_request_id). Re-map columns before re-enabling.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ devis: [] })
}

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Fonctionnalité temporairement désactivée' }, { status: 503 })
}

export async function PUT(_request: Request) {
  return NextResponse.json({ error: 'Fonctionnalité temporairement désactivée' }, { status: 503 })
}
