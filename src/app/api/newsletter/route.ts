/**
 * Newsletter API - ServicesArtisans
 * Handles newsletter subscriptions
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/api/resend-client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const getResend = () => getResendClient()

const newsletterSchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = newsletterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Vous \u00eates d\u00e9j\u00e0 inscrit \u00e0 notre newsletter',
      })
    }

    // Store in database
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        subscribed_at: new Date().toISOString(),
        status: 'active',
      })

    if (dbError) {
      logger.error('Database error', dbError)
      // Continue even if DB fails
    }

    const unsubscribeUrl = `${SITE_URL}/api/prospection/unsubscribe?email=${encodeURIComponent(email)}`

    // Send welcome email
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: email,
      subject: 'Bienvenue dans la newsletter ServicesArtisans !',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@servicesartisans.fr?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Precedence': 'bulk',
      },
      html: `
        <h2>Bienvenue !</h2>
        <p>Merci de vous \u00eatre inscrit \u00e0 notre newsletter.</p>
        <p>Vous recevrez r\u00e9guli\u00e8rement nos meilleurs articles et conseils pour vos projets de travaux :</p>
        <ul>
          <li>Guides pratiques</li>
          <li>Conseils d'experts</li>
          <li>Tendances d\u00e9co</li>
          <li>Aides et subventions</li>
        </ul>
        <p>\u00c0 bient\u00f4t sur ServicesArtisans !</p>
        <hr />
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
          contact@servicesartisans.fr<br>
          <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
        </p>
        <p style="color: #999; font-size: 11px; text-align: center;">
          <a href="${unsubscribeUrl}" style="color: #999;">Se d\u00e9sinscrire de la newsletter</a>
        </p>
      `,
      text: `Bienvenue !\n\nMerci de vous \u00eatre inscrit \u00e0 notre newsletter.\n\nVous recevrez r\u00e9guli\u00e8rement nos meilleurs articles et conseils pour vos projets de travaux :\n- Guides pratiques\n- Conseils d'experts\n- Tendances d\u00e9co\n- Aides et subventions\n\n\u00c0 bient\u00f4t sur ServicesArtisans !\n\nServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr\nPolitique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite\n\nSe d\u00e9sinscrire : ${unsubscribeUrl}`,
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription r\u00e9ussie !',
    })
  } catch (error) {
    logger.error('Newsletter API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
