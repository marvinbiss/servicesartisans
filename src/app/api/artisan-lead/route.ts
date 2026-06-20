/**
 * Artisan Lead API - ServicesArtisans
 * Capture des leads issus des landing pages publicitaires (Google / Facebook Ads).
 * Lead court : on notifie l'équipe + on confirme à l'artisan, puis le client
 * redirige vers l'inscription complète (pré-remplie).
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getResendClient } from '@/lib/api/resend-client'

export const dynamic = 'force-dynamic'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const leadSchema = z.object({
  metier: z.string().min(1, 'Le métier est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  codePostal: z.string().optional().default(''),
  telephone: z.string().min(10, 'Téléphone invalide'),
  // Email facultatif (perso ou pro) — l'artisan est rappelé au téléphone
  email: z.union([z.string().email('Email invalide'), z.literal('')]).optional().default(''),
  // Attribution publicitaire (best-effort)
  utm_source: z.string().optional().default(''),
  utm_medium: z.string().optional().default(''),
  utm_campaign: z.string().optional().default(''),
  utm_term: z.string().optional().default(''),
  utm_content: z.string().optional().default(''),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validation = leadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const telephone = data.telephone.replace(/[\s.\-()]/g, '')

    const utmLine = [
      data.utm_source && `source: ${data.utm_source}`,
      data.utm_medium && `medium: ${data.utm_medium}`,
      data.utm_campaign && `campaign: ${data.utm_campaign}`,
      data.utm_term && `term: ${data.utm_term}`,
      data.utm_content && `content: ${data.utm_content}`,
    ]
      .filter(Boolean)
      .join(' · ')

    const resend = getResendClient()
    const fromEmail = process.env.FROM_EMAIL || 'noreply@servicesartisans.fr'

    // Notif équipe (toujours) — le téléphone est le canal principal
    const sends = [
      resend.emails.send({
        from: fromEmail,
        to: 'artisans@servicesartisans.fr',
        subject: `[Lead Ads] ${escapeHtml(data.metier)} - ${escapeHtml(data.ville)}`,
        html: `
          <h2>Nouveau lead artisan (landing publicitaire)</h2>
          <ul>
            <li><strong>Métier :</strong> ${escapeHtml(data.metier)}</li>
            <li><strong>Ville :</strong> ${escapeHtml(data.codePostal)} ${escapeHtml(data.ville)}</li>
            <li><strong>Téléphone :</strong> ${escapeHtml(telephone)}</li>
            <li><strong>Email :</strong> ${data.email ? escapeHtml(data.email) : 'non fourni'}</li>
          </ul>
          ${utmLine ? `<p><strong>Attribution :</strong> ${escapeHtml(utmLine)}</p>` : ''}
          <hr />
          <p>Le prospect a été redirigé vers l'inscription complète pré-remplie.${data.email ? '' : ' <strong>Pas d\'email : rappeler au téléphone.</strong>'}</p>
          <p><a href="https://servicesartisans.fr/admin">Dashboard admin</a></p>
        `,
      }),
    ]

    // Confirmation à l'artisan seulement s'il a laissé un email
    if (data.email) {
      sends.push(
        resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: 'ServicesArtisans — finalisez votre inscription',
          html: `
            <h2>Bonjour,</h2>
            <p>Merci pour votre intérêt ! Pour recevoir des demandes de devis qualifiées
            dans votre zone, il ne reste qu'une étape : finaliser votre inscription.</p>
            <p><a href="https://servicesartisans.fr/inscription-artisan"
              style="display:inline-block;background:#C24B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
              Finaliser mon inscription</a></p>
            <p>L'inscription est gratuite. Vous ne payez que sur résultat.</p>
            <hr />
            <p style="color:#666;font-size:12px;"><a href="https://servicesartisans.fr">servicesartisans.fr</a></p>
          `,
        })
      )
    }

    const emailResults = await Promise.allSettled(sends)

    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Artisan lead email ${i} failed`, result.reason)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Artisan lead API error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
