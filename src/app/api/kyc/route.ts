/**
 * KYC Verification API
 * Handle identity, insurance, and certification verification
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { kycVerificationService } from '@/lib/services/kyc-verification'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const submitDocumentSchema = z.object({
  action: z.literal('submit_document'),
  type: z.enum(['identity', 'insurance', 'certification', 'registration', 'address_proof']),
  file_url: z.string().url(),
  document_number: z.string().optional(),
  issuing_authority: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
})

const verifyIdentitySchema = z.object({
  action: z.literal('verify_identity'),
  document_type: z.enum(['passport', 'id_card', 'residence_permit', 'driver_license']),
  document_number: z.string().min(4),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string(),
  nationality: z.string().min(2),
  expiry_date: z.string(),
})

const verifyInsuranceSchema = z.object({
  action: z.literal('verify_insurance'),
  policy_number: z.string().min(4),
  insurer_name: z.string().min(1),
  coverage_type: z.enum(['rc_pro', 'decennale', 'multirisque']),
  coverage_amount: z.number().min(10000),
  start_date: z.string(),
  end_date: z.string(),
})

const verifyCertificationSchema = z.object({
  action: z.literal('verify_certification'),
  certification_type: z.string().min(1),
  certification_name: z.string().min(1),
  issuing_body: z.string().min(1),
  certificate_number: z.string().min(4),
  issue_date: z.string(),
  expiry_date: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const kycProfile = await kycVerificationService.getKYCProfile(user.id)

    return NextResponse.json({
      success: true,
      ...kycProfile,
    })
  } catch (error) {
    logger.error('KYC GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify user is an artisan
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'artisan') {
      return NextResponse.json(
        { error: 'La vérification KYC est réservée aux artisans' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'initialize': {
        const kycProfile = await kycVerificationService.initializeKYCProfile(user.id)
        return NextResponse.json({
          success: true,
          profile: kycProfile,
          message: 'Profil KYC initialisé',
        })
      }

      case 'submit_document': {
        const result = submitDocumentSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const document = await kycVerificationService.submitDocument(
          user.id,
          result.data.type,
          result.data.file_url,
          {
            document_number: result.data.document_number,
            issuing_authority: result.data.issuing_authority,
            issue_date: result.data.issue_date,
            expiry_date: result.data.expiry_date,
          }
        )

        return NextResponse.json({
          success: true,
          document,
          message: 'Document soumis pour vérification',
        })
      }

      case 'verify_identity': {
        const result = verifyIdentitySchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const verification = await kycVerificationService.verifyIdentity(user.id, {
          ...result.data,
          verification_method: 'automated',
        })

        return NextResponse.json({
          success: verification.success,
          verification: verification.verification,
          message: verification.success
            ? 'Identité vérifiée avec succès'
            : 'Échec de la vérification d\'identité',
        })
      }

      case 'verify_insurance': {
        const result = verifyInsuranceSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const verification = await kycVerificationService.verifyInsurance(user.id, {
          ...result.data,
          is_valid: false, // Will be set by verification
        })

        return NextResponse.json({
          success: verification.success,
          verification: verification.verification,
          message: verification.success
            ? 'Assurance vérifiée avec succès'
            : 'Échec de la vérification d\'assurance',
        })
      }

      case 'verify_certification': {
        const result = verifyCertificationSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const verification = await kycVerificationService.verifyCertification(user.id, {
          ...result.data,
          is_valid: false, // Will be set by verification
        })

        return NextResponse.json({
          success: verification.success,
          verification: verification.verification,
          message: verification.success
            ? 'Certification vérifiée avec succès'
            : 'Échec de la vérification de certification',
        })
      }

      case 'request_video_verification': {
        const session = await kycVerificationService.initiateVideoVerification(user.id)
        return NextResponse.json({
          success: true,
          ...session,
          message: 'Session de vérification vidéo créée',
        })
      }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error) {
    logger.error('KYC POST error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
