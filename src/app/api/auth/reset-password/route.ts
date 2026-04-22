/**
 * Password Reset API - ServicesArtisans
 * Sends password reset email via Supabase
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const resetSchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(request: Request) {
  try {
    // Rate limiting (3 requests per 15 min per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`reset-password:${ip}`, {
      window: 900_000,
      max: 3,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes de réinitialisation, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Validate input
    const validation = resetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = validation.data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/definir-mot-de-passe`,
    })

    if (error) {
      logger.error('Reset password error', error)
      // Don't reveal if email exists or not for security
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    })
  } catch (error) {
    logger.error('Reset password API error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
