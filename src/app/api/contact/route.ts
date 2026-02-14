/**
 * Contact API - ServicesArtisans
 * Handles contact form submissions and sends emails via Resend
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { Resend } from 'resend'
import { z } from 'zod'
import { escapeHtml } from '@/lib/utils/html'

/**
 * Escape HTML and convert newlines to <br /> for message display.
 */
function escapeHtmlWithBreaks(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br />')
}

export const dynamic = 'force-dynamic'

// Lazy initialization to avoid build-time errors
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const contactSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(1, 'Veuillez sélectionner un sujet'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = contactSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { nom, email, sujet, message } = validation.data

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
    const safeMessage = escapeHtmlWithBreaks(message)

    // Send email to support team
    const { error: sendError } = await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: 'contact@servicesartisans.fr',
      reply_to: email,
      subject: `[Contact] ${safeSujet} - ${safeNom}`,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@servicesartisans.fr>'
      },
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
          Message envoy\u00e9 depuis le formulaire de contact de ServicesArtisans
        </p>
      `,
      text: `Nouveau message de contact\n\nNom: ${nom}\nEmail: ${email}\nSujet: ${sujetTexte[sujet] || sujet}\n\nMessage:\n${message}\n\nMessage envoy\u00e9 depuis le formulaire de contact de ServicesArtisans`,
    })

    if (sendError) {
      logger.error('Error sending email', sendError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    // Send confirmation email to user (with sanitized content)
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: email,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@servicesartisans.fr>'
      },
      subject: 'Votre message a bien \u00e9t\u00e9 re\u00e7u - ServicesArtisans',
      html: `
        <h2>Bonjour ${safeNom},</h2>
        <p>Nous avons bien re\u00e7u votre message et nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.</p>
        <p><strong>Sujet:</strong> ${safeSujet}</p>
        <hr />
        <p><strong>Votre message:</strong></p>
        <p>${safeMessage}</p>
        <hr />
        <p>Cordialement,<br />L'\u00e9quipe ServicesArtisans</p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
          contact@servicesartisans.fr<br>
          <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
        </p>
      `,
      text: `Bonjour ${nom},\n\nNous avons bien re\u00e7u votre message et nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.\n\nSujet: ${sujetTexte[sujet] || sujet}\n\nVotre message:\n${message}\n\nCordialement,\nL'\u00e9quipe ServicesArtisans\n\nServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr\nPolitique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite`,
    })

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    logger.error('Contact API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
