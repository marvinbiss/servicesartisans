/**
 * Newsletter Subscribe API
 * POST /api/newsletter/subscribe
 * Validates email, stores in Supabase, sends welcome email via Resend.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/api/resend-client'

export const dynamic = 'force-dynamic'

const subscribeSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  source: z.string().max(50).optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 1 request per 10 min per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`newsletter:${ip}`, { window: 600_000, max: 1 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const { email, source } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // Rate limit per email (max 3 per day)
    const emailRl = await checkRateLimit(`newsletter:email:${normalizedEmail}`, { window: 86_400_000, max: 3 })
    if (!emailRl.allowed) {
      return NextResponse.json(
        { error: 'Cette adresse a déjà été inscrite récemment' },
        { status: 429 }
      )
    }

    // Store in Supabase (upsert — re-subscribe if previously unsubscribed)
    const supabase = createAdminClient()
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: source || 'footer',
        },
        { onConflict: 'email' }
      )

    if (dbError) {
      logger.error('Newsletter DB insert failed', dbError)
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      )
    }

    // Send welcome email (non-blocking)
    const unsubscribeSecret = process.env.UNSUBSCRIBE_SECRET || 'sa-newsletter-default-key'
    const unsubscribeToken = crypto.createHmac('sha256', unsubscribeSecret).update(normalizedEmail).digest('hex')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
    const unsubscribeLink = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${unsubscribeToken}`

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
        to: normalizedEmail,
        subject: 'Bienvenue dans la newsletter ServicesArtisans !',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
  </div>
  <h2>Bienvenue !</h2>
  <p>Merci de vous être inscrit à notre newsletter.</p>
  <p>Vous recevrez chaque semaine nos meilleurs articles et conseils pour vos projets de travaux :</p>
  <ul>
    <li>Guides pratiques</li>
    <li>Conseils d'experts</li>
    <li>Aides et subventions</li>
    <li>Bons plans saisonniers</li>
  </ul>
  <p>À bientôt sur ServicesArtisans !</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #666; font-size: 12px; text-align: center;">
    <a href="${unsubscribeLink}" style="color: #666;">Se désinscrire</a> |
    <a href="${siteUrl}" style="color: #666;">servicesartisans.fr</a>
  </p>
</body>
</html>
        `,
      })
    } catch (emailError) {
      logger.error('Newsletter welcome email failed', emailError)
      // Don't fail the subscription if the email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription enregistrée',
    })
  } catch (error) {
    logger.error('Newsletter subscribe error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
