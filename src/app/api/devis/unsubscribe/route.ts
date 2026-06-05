/**
 * Désinscription des emails de relance abandon devis.
 *
 * Cette route était référencée par les 3 emails de relance
 * (cron/abandon-emails : lien visible + header List-Unsubscribe RFC 8058)
 * mais N'EXISTAIT PAS — le lien de désinscription envoyé aux leads
 * répondait 404 (constat audit 2026-06-05). Risque délivrabilité + RGPD.
 *
 * GET  = clic humain sur le lien → confirme + page HTML.
 * POST = one-click unsubscribe des clients mail (RFC 8058
 *        List-Unsubscribe-Post) → 200 sans corps.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const idSchema = z.string().uuid()

async function unsubscribe(id: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('devis_abandons')
    .update({ unsubscribed: true })
    .eq('id', id)
  if (error) {
    logger.error('devis-unsubscribe: update failed', { id, error: error.message })
    return false
  }
  return true
}

function getId(request: Request): string | null {
  const id = new URL(request.url).searchParams.get('id')
  const parsed = idSchema.safeParse(id)
  return parsed.success ? parsed.data : null
}

const CONFIRMATION_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Désinscription confirmée — ServicesArtisans</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #faf8f5; color: #1f2937; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border: 1px solid #e5e0d8; border-radius: 12px; padding: 2.5rem; max-width: 28rem; text-align: center; }
    a { color: #c2570f; }
  </style>
</head>
<body>
  <div class="card">
    <h1 style="font-size:1.25rem">Désinscription confirmée</h1>
    <p>Vous ne recevrez plus d'emails de relance concernant votre demande de devis.</p>
    <p><a href="https://servicesartisans.fr">Retour à ServicesArtisans</a></p>
  </div>
</body>
</html>`

export async function GET(request: Request) {
  const id = getId(request)
  // Réponse identique id valide/invalide : ne pas révéler l'existence d'un
  // enregistrement, et toujours confirmer au lead que plus rien ne partira.
  if (id) await unsubscribe(id)
  return new NextResponse(CONFIRMATION_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(request: Request) {
  const id = getId(request)
  if (id) await unsubscribe(id)
  // RFC 8058 : le client mail attend un 2xx, pas de corps requis.
  return new NextResponse(null, { status: 200 })
}
