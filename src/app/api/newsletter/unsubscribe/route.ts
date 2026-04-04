/**
 * Newsletter Unsubscribe API
 * GET /api/newsletter/unsubscribe?email=xxx&token=xxx
 * Marks subscriber as unsubscribed. Redirects to homepage with confirmation.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return new NextResponse(htmlPage('Lien invalide', 'Les paramètres requis sont manquants.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Verify token (HMAC-SHA256 of email)
    const unsubscribeSecret = process.env.UNSUBSCRIBE_SECRET || 'sa-newsletter-default-key'
    const expectedToken = crypto.createHmac('sha256', unsubscribeSecret).update(email.toLowerCase().trim()).digest('hex')
    if (token !== expectedToken) {
      return new NextResponse(htmlPage('Lien invalide', 'Le lien de désinscription est invalide.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())

    if (error) {
      logger.error('Newsletter unsubscribe DB error', error)
      return new NextResponse(htmlPage('Erreur', 'Une erreur est survenue. Veuillez réessayer.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new NextResponse(
      htmlPage(
        'Désinscription confirmée',
        'Vous avez été désinscrit de notre newsletter. Vous ne recevrez plus nos emails.'
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  } catch (error) {
    logger.error('Newsletter unsubscribe error', error)
    return new NextResponse(htmlPage('Erreur', 'Une erreur est survenue.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function htmlPage(title: string, message: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - ServicesArtisans</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #333; }
    .card { text-align: center; max-width: 480px; padding: 48px 32px; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { color: #2563eb; font-size: 24px; margin: 0 0 16px; }
    p { color: #666; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; }
    a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${siteUrl}">Retour à l'accueil</a>
  </div>
</body>
</html>`
}
