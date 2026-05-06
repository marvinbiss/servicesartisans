/**
 * Contact API - ServicesArtisans
 * Handles contact form submissions and sends emails via Resend.
 *
 * SLA-99.9 hardening (2026-05-06) :
 *   - RL 5/min/IP (anti-spam) fail-open.
 *   - Timeout 5s sur les appels Resend.
 *   - Honeypot field `website` (legit clients laissent vide ; bots remplissent).
 *   - SMTP header injection sanitised (defence-in-depth Zod .email()).
 *   - Validation zod stricte + escape HTML.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { Resend } from 'resend'
import { contactFormSchema } from '@/lib/validations/schemas'
import { safeJsonBody } from '@/lib/api/handler'

const TIMEOUT_MS = 5000

async function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}-timeout`)), ms)),
  ])
}

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char])
}

export const dynamic = 'force-dynamic'

// Lazy initialization to avoid build-time errors
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: Request) {
  try {
    // SLA-99.9 : RL 5/min/IP anti-spam, fail-open (incident Redis ne doit
    // pas tuer un canal SAV essentiel).
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`contact:${ip}`, { window: 60_000, max: 5, failOpen: true })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const parsed = await safeJsonBody<{ website?: unknown } & Record<string, unknown>>(request)
    if (!parsed.ok) return parsed.response

    // SLA-99.9 : honeypot — un champ `website` invisible côté form. Un humain
    // ne le remplit jamais ; un bot oui. Réponse 200 pour ne pas signaler le
    // honeypot, mais on ne fait rien.
    if (typeof parsed.data.website === 'string' && parsed.data.website.trim() !== '') {
      logger.warn('Contact honeypot tripped', { ip })
      return NextResponse.json({ success: true, message: 'Message envoyé avec succès' })
    }

    // Validate input
    const validation = contactFormSchema.safeParse(parsed.data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { nom, email, sujet, message } = validation.data

    // Sanitise email against SMTP header injection (defence-in-depth on top of Zod .email())
    const safeEmailHeader = email.replace(/[\r\n\t]/g, '').trim()

    // Map subject to readable text
    const sujetTexte: Record<string, string> = {
      devis: 'Question sur un devis',
      artisan: 'Problème avec un artisan',
      inscription: 'Inscription artisan',
      partenariat: 'Partenariat',
      autre: 'Autre',
    }

    // Sanitize all user inputs for HTML
    const safeNom = escapeHtml(nom)
    const safeEmail = escapeHtml(email)
    const safeSujet = escapeHtml(sujetTexte[sujet] || sujet)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

    // SLA-99.9 : Send email to support team avec timeout 5s.
    let sendError: { message: string } | null = null
    try {
      const res = await withTimeout(
        getResend().emails.send({
          from: process.env.FROM_EMAIL || 'contact@servicesartisans.fr',
          to: 'contact@servicesartisans.fr',
          reply_to: safeEmailHeader,
          subject: `[Contact] ${safeSujet} - ${safeNom}`,
          html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${safeNom}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Sujet:</strong> ${safeSujet}</p>
        <hr />
        <h3>Message:</h3>
        <p>${safeMessage}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Message envoyé depuis le formulaire de contact de ServicesArtisans
        </p>
      `,
        }),
        TIMEOUT_MS,
        'contact-resend'
      )
      sendError = (res.error as { message: string } | null) ?? null
    } catch (err) {
      logger.error('Contact email timeout', err)
      return NextResponse.json(
        { error: 'Service indisponible, réessayez plus tard.' },
        { status: 503 }
      )
    }

    if (sendError) {
      logger.error('Error sending email', sendError)
      return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
    }

    // SLA-99.9 : Send confirmation email to user (non-critical, timeout 5s).
    try {
      await withTimeout(
        getResend().emails.send({
          from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
          to: email,
          subject: 'Votre message a bien été reçu - ServicesArtisans',
          html: `
          <h2>Bonjour ${safeNom},</h2>
          <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <p><strong>Sujet:</strong> ${safeSujet}</p>
          <hr />
          <p><strong>Votre message:</strong></p>
          <p>${safeMessage}</p>
          <hr />
          <p>Cordialement,<br />L'équipe ServicesArtisans</p>
          <p style="color: #666; font-size: 12px;">
            <a href="https://servicesartisans.fr">servicesartisans.fr</a>
          </p>
        `,
        }),
        TIMEOUT_MS,
        'contact-confirm-resend'
      )
    } catch (confirmError) {
      logger.error('Confirmation email failed', confirmError)
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    logger.error('Contact API error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
