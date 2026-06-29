/**
 * Artisan Lead API - ServicesArtisans
 * Capture des leads issus des landing pages publicitaires (Google / Facebook Ads).
 * Lead court : on notifie l'équipe + on confirme à l'artisan, puis le client
 * redirige vers l'inscription complète (pré-remplie).
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/api/resend-client'
import { pushLeadToPipedrive } from '@/lib/pipedrive/lead'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

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
  prenom: z.string().min(2, 'Le prénom est requis'),
  metier: z.string().min(1, 'Le métier est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  codePostal: z.string().optional().default(''),
  telephone: z.string().min(10, 'Téléphone invalide'),
  // Email facultatif (perso ou pro) — l'artisan est rappelé au téléphone
  email: z
    .union([z.string().email('Email invalide'), z.literal('')])
    .optional()
    .default(''),
  // Attribution publicitaire (best-effort)
  utm_source: z.string().optional().default(''),
  utm_medium: z.string().optional().default(''),
  utm_campaign: z.string().optional().default(''),
  utm_term: z.string().optional().default(''),
  utm_content: z.string().optional().default(''),
})

export async function POST(request: Request) {
  try {
    // Rate limiting — endpoint public déclenchant l'envoi d'emails (Resend)
    // vers une adresse fournie par l'utilisateur : limiter l'abus / spam.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`artisan-lead:${ip}`, { window: 60_000, max: 5 })
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

    const tasks: Promise<unknown>[] = []

    // 1) Emails (équipe + confirmation) via le wrapper `sendEmail` — même chemin
    //    que les autres formulaires du site (devis, estimation, inscription).
    //    Le wrapper résout le `from` sur RESEND_FROM_EMAIL (sender vérifié),
    //    vérifie `response.error` et retry. Avant, cette route appelait
    //    `resend.emails.send()` en brut avec `FROM_EMAIL` (env malformée
    //    `"...\n"` → header From invalide → Resend 422) SANS lire `.error` :
    //    l'échec était avalé silencieusement (success:true, 0 mail, 0 log).
    //    Un échec d'envoi rejette désormais la promesse → loggé via le
    //    Promise.allSettled plus bas.

    // Notif équipe — lead à rappeler
    tasks.push(
      sendEmail({
        to: 'contact@servicesartisans.fr',
        subject: `[Lead Ads] ${escapeHtml(data.metier)} - ${escapeHtml(data.ville)}`,
        html: `
          <h2>Nouveau lead artisan à rappeler (landing publicitaire)</h2>
          <ul>
            <li><strong>Prénom :</strong> ${escapeHtml(data.prenom)}</li>
            <li><strong>Métier :</strong> ${escapeHtml(data.metier)}</li>
            <li><strong>Zone :</strong> ${escapeHtml(data.codePostal)} ${escapeHtml(data.ville)}</li>
            <li><strong>Téléphone :</strong> ${escapeHtml(telephone)}</li>
            <li><strong>Email :</strong> ${data.email ? escapeHtml(data.email) : 'non fourni'}</li>
          </ul>
          ${utmLine ? `<p><strong>Attribution :</strong> ${escapeHtml(utmLine)}</p>` : ''}
          <hr />
          <p><strong>Action : rappeler ce prospect pour activer son profil.</strong></p>
          <p><a href="https://servicesartisans.fr/admin">Dashboard admin</a></p>
        `,
      })
    )

    // Confirmation à l'artisan — uniquement s'il a laissé un email
    if (data.email) {
      tasks.push(
        sendEmail({
          to: data.email,
          subject: 'ServicesArtisans — votre demande est bien reçue',
          html: `
            <h2>Bonjour ${escapeHtml(data.prenom)},</h2>
            <p>Votre demande est bien reçue. Un conseiller vous rappelle très vite
            au ${escapeHtml(telephone)} pour activer votre profil et vous envoyer
            vos premières demandes près de chez vous.</p>
            <p>L'inscription est gratuite, sans engagement — vous ne payez qu'au résultat.</p>
            <hr />
            <p style="color:#666;font-size:12px;"><a href="https://servicesartisans.fr">servicesartisans.fr</a></p>
          `,
        })
      )
    }

    // 2) CRM Pipedrive — indépendant des emails (no-op si non configuré)
    const utm = {
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_term: data.utm_term,
      utm_content: data.utm_content,
    }
    tasks.push(
      pushLeadToPipedrive({
        prenom: data.prenom,
        metier: data.metier,
        ville: data.ville,
        codePostal: data.codePostal,
        telephone,
        email: data.email || undefined,
        utm,
      })
    )

    const results = await Promise.allSettled(tasks)
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Artisan lead task ${i} failed`, result.reason)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Artisan lead API error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
