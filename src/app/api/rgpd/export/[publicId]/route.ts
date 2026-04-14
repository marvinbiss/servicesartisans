/**
 * GET /api/rgpd/export/[publicId]?token=<signed>
 *
 * Export RGPD (art. 15 + art. 20) au format JSON.
 * Le token est un HMAC-SHA256 signé avec TTL (voir `signed-token.ts`).
 * Retour : JSON complet de l'estimation + debug pour reproductibilité.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/simulateur/rgpd/signed-token'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest, { params }: { params: { publicId: string } }) {
  const { publicId } = params
  const token = req.nextUrl.searchParams.get('token') ?? ''

  if (!publicId || !/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/.test(publicId)) {
    return NextResponse.json({ error: 'publicId invalide' }, { status: 400 })
  }

  if (!verifyToken(publicId, token)) {
    logger.warn('rgpd-export: token invalide ou expiré', {
      component: 'api/rgpd/export',
      publicId,
    })
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('simulateur_estimations')
    .select('*')
    .eq('public_id', publicId)
    .maybeSingle()

  if (error) {
    logger.error('rgpd-export: query failed', error, { publicId })
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
  }

  logger.info('rgpd-export: delivered', {
    component: 'api/rgpd/export',
    publicId,
    // auditabilité : on trace la livraison, pas les données personnelles
  })

  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      article: 'RGPD art. 15 + art. 20',
      publicId,
      estimation: data,
    },
    null,
    2
  )

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="export-${publicId}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
