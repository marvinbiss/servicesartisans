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

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
    const supabase = getSupabase()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà inscrit à notre newsletter',
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

    // Send welcome email (non-blocking — don't crash signup if email fails)
    try {
      await getResend().emails.send({
        from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
        to: email,
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
      message: 'Inscription réussie !',
    })
  } catch (error) {
    logger.error('Newsletter API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
