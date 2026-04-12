/**
 * Newsletter API - ServicesArtisans (legacy route)
 * Forwards to /api/newsletter/subscribe for backward compatibility.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/api/resend-client'
import { newsletterEmailSchema } from '@/lib/validations/schemas'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 3 requests per 5 min per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`newsletter:${ip}`, { window: 300_000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = newsletterEmailSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // Store in Supabase (upsert — re-subscribe if previously unsubscribed)
    try {
      const supabase = createAdminClient()
      await supabase.from('newsletter_subscribers').upsert(
        {
          email: normalizedEmail,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: 'legacy',
        },
        { onConflict: 'email' }
      )
    } catch (dbError) {
      logger.error('Newsletter DB insert failed (legacy route)', dbError)
      // Don't fail the subscription if DB fails
    }

    // Send welcome email (non-blocking — don't crash signup if email fails)
    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
        to: normalizedEmail,
        subject: 'Bienvenue dans la newsletter ServicesArtisans !',
        html: `
          <h2>Bienvenue !</h2>
          <p>Merci de vous être inscrit à notre newsletter.</p>
          <p>Vous recevrez régulièrement nos meilleurs articles et conseils pour vos projets de travaux :</p>
          <ul>
            <li>Guides pratiques</li>
            <li>Conseils d'experts</li>
            <li>Tendances déco</li>
            <li>Aides et subventions</li>
          </ul>
          <p>À bientôt sur ServicesArtisans !</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            Pour vous désinscrire, répondez simplement à cet email.<br />
            <a href="https://servicesartisans.fr">servicesartisans.fr</a>
          </p>
        `,
      })
    } catch (emailError) {
      logger.error('Newsletter welcome email failed', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription enregistrée',
    })
  } catch (error) {
    logger.error('Newsletter API error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
