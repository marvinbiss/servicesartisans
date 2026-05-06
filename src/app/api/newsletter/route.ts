/**
 * Newsletter API - ServicesArtisans (legacy route)
 * Forwards to /api/newsletter/subscribe for backward compatibility.
 *
 * SLA-99.9 hardening (2026-05-06) :
 *   - RL 30/min/IP, fail-open (incident 2026-04-22 — Redis glitch ne doit
 *     jamais bloquer un signup).
 *   - Timeout 5s sur DB upsert + envoi email Resend.
 *   - Validation zod + email normalization.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/api/resend-client'
import { newsletterEmailSchema } from '@/lib/validations/schemas'
import { safeJsonBody } from '@/lib/api/handler'

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout 5s pour DB et email — empêche un POST de hang sur le client.
const TIMEOUT_MS = 5000

async function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}-timeout`)), ms)),
  ])
}

export async function POST(request: Request) {
  try {
    // SLA-99.9 : RL 30/min/IP, fail-open (cible scope mission).
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

    const parsed = await safeJsonBody<unknown>(request)
    if (!parsed.ok) return parsed.response

    // Validate input (zod email + max 254 chars).
    const validation = newsletterEmailSchema.safeParse(parsed.data)
    if (!validation.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // Store in Supabase (upsert — re-subscribe if previously unsubscribed).
    // SLA-99.9 : timeout 5s — DB lente ne doit pas tuer le signup.
    try {
      const supabase = createAdminClient()
      await withTimeout(
        supabase.from('newsletter_subscribers').upsert(
          {
            email: normalizedEmail,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            source: 'legacy',
          },
          { onConflict: 'email' }
        ),
        TIMEOUT_MS,
        'newsletter-upsert'
      )
    } catch (dbError) {
      logger.error('Newsletter DB insert failed (legacy route)', dbError)
      // Don't fail the subscription if DB fails
    }

    // SLA-99.9 : Send welcome email avec timeout 5s, non-blocking — un Resend
    // lent ne doit pas tuer la subscription (déjà persistée plus haut).
    try {
      const resend = getResendClient()
      await withTimeout(
        resend.emails.send({
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
        }),
        TIMEOUT_MS,
        'newsletter-resend'
      )
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
