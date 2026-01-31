/**
 * User Signin API - ServicesArtisans
 * Handles user authentication
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signInSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  try {
    // Validate environment
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Configuration serveur manquante'),
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(signInSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Donnees invalides',
          { fields: formatZodErrors(validation.errors) }
        ),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      // Handle specific error types
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          createErrorResponse(ErrorCode.UNAUTHORIZED, 'Email ou mot de passe incorrect'),
          { status: 401 }
        )
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          createErrorResponse(ErrorCode.UNAUTHORIZED, 'Veuillez confirmer votre email avant de vous connecter'),
          { status: 401 }
        )
      }
      return NextResponse.json(
        createErrorResponse(ErrorCode.UNAUTHORIZED, error.message),
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.UNAUTHORIZED, 'Echec de l\'authentification'),
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_artisan, artisan_id, first_name, last_name')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: profile?.first_name || data.user.user_metadata?.first_name,
          lastName: profile?.last_name || data.user.user_metadata?.last_name,
          role: profile?.role || 'user',
          isArtisan: profile?.is_artisan || false,
          artisanId: profile?.artisan_id,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
      })
    )
  } catch (error) {
    logger.error('Signin error:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de la connexion'),
      { status: 500 }
    )
  }
}
