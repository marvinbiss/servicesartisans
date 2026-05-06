/**
 * Newsletter Subscribe API
 * POST /api/newsletter/subscribe
 * Validates email, stores in Supabase, sends welcome email via Resend.
 *
 * SLA-99.9 hardening (2026-05-06) :
 *   - RL 30/min/IP fail-open + RL email 3/jour fail-open.
 *   - Timeout 5s sur DB upsert + envoi email.
 *   - HMAC unsubscribe : fail-CLOSE en prod si UNSUBSCRIBE_SECRET absent /
 *     <32 chars (le fallback 'sa-newsletter-default-key' était une faille
 *     qui rendait n'importe quel attaquant capable de forger un lien
 *     d'unsubscribe pour n'importe quel email — Plan D-3).
 *   - Le calcul HMAC reste tel quel : c'est de la GENERATION (pas de
 *     comparaison) ; timingSafeEqual sera utilisé côté handler /unsubscribe.
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { newsletterSubscribeSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/api/resend-client'

export const dynamic = 'force-dynamic'

const TIMEOUT_MS = 5000

async function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}-timeout`)), ms)),
  ])
}

/**
 * SLA-99.9 : récupère le secret HMAC pour le lien unsubscribe.
 * Fail-CLOSE en production si absent ou trop court (<32 chars) — un secret
 * faible permettrait à un attaquant de forger des liens unsubscribe pour
 * n'importe quel email du DB.
 */
function getUnsubscribeSecretOrThrow(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UNSUBSCRIBE_SECRET must be set (min 32 chars) in production')
  }
  logger.warn('UNSUBSCRIBE_SECRET non défini — fallback dev only')
  return 'dev-only-newsletter-unsubscribe-secret-32chars'
}

export async function POST(request: Request) {
  try {
    // SLA-99.9 : RL public 30/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`newsletter:${ip}`, { window: 60_000, max: 30, failOpen: true })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }

    const validation = newsletterSubscribeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email, source } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // SLA-99.9 : RL per email (max 3 / jour) fail-open — anti-spam mais ne
    // doit pas bloquer un user légitime en cas de Redis glitch.
    const emailRl = await checkRateLimit(`newsletter:email:${normalizedEmail}`, {
      window: 86_400_000,
      max: 3,
      failOpen: true,
    })
    if (!emailRl.allowed) {
      return NextResponse.json(
        { error: 'Cette adresse a déjà été inscrite récemment' },
        { status: 429 }
      )
    }

    // SLA-99.9 : DB upsert avec timeout 5s.
    const supabase = createAdminClient()
    let dbError: { message: string } | null = null
    try {
      const res = await withTimeout(
        supabase.from('newsletter_subscribers').upsert(
          {
            email: normalizedEmail,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            source: source || 'footer',
          },
          { onConflict: 'email' }
        ),
        TIMEOUT_MS,
        'newsletter-subscribe-upsert'
      )
      dbError = (res.error as { message: string } | null) ?? null
    } catch (err) {
      logger.error('Newsletter DB upsert timeout', err)
      return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
    }

    if (dbError) {
      logger.error('Newsletter DB insert failed', dbError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // SLA-99.9 : HMAC unsubscribe fail-CLOSE si secret manquant (Plan D-3).
    let unsubscribeLink: string | null = null
    try {
      const unsubscribeSecret = getUnsubscribeSecretOrThrow()
      const unsubscribeToken = crypto
        .createHmac('sha256', unsubscribeSecret)
        .update(normalizedEmail)
        .digest('hex')
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
      unsubscribeLink = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(
        normalizedEmail
      )}&token=${unsubscribeToken}`
    } catch (err) {
      logger.error('Newsletter unsubscribe link generation failed', err)
      // Subscription déjà persistée — on continue sans lien (l'email aura
      // un footer "répondez à cet email" en fallback).
    }

    // Send welcome email (non-blocking + timeout 5s).
    try {
      const resend = getResendClient()
      await withTimeout(
        resend.emails.send({
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
    ${unsubscribeLink ? `<a href="${unsubscribeLink}" style="color: #666;">Se désinscrire</a> | ` : ''}<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'}" style="color: #666;">servicesartisans.fr</a>
  </p>
</body>
</html>
        `,
        }),
        TIMEOUT_MS,
        'newsletter-subscribe-resend'
      )
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
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
