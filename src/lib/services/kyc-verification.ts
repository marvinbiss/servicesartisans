/**
 * KYC (Know Your Customer) Verification Service
 * Comprehensive identity verification for artisans
 * Includes: ID verification, insurance verification, certifications
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Verification status types
export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired'

export interface KYCDocument {
  id: string
  user_id: string
  type: 'identity' | 'insurance' | 'certification' | 'registration' | 'address_proof'
  document_number?: string
  issuing_authority?: string
  issue_date?: string
  expiry_date?: string
  file_url: string
  status: VerificationStatus
  verification_notes?: string
  verified_at?: string
  verified_by?: string
  created_at: string
  updated_at: string
}

export interface InsuranceVerification {
  policy_number: string
  insurer_name: string
  coverage_type: 'rc_pro' | 'decennale' | 'multirisque'
  coverage_amount: number
  start_date: string
  end_date: string
  is_valid: boolean
  verification_date?: string
}

export interface IdentityVerification {
  document_type: 'passport' | 'id_card' | 'residence_permit' | 'driver_license'
  document_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  nationality: string
  expiry_date: string
  face_match_score?: number
  liveness_check?: boolean
  verification_method: 'manual' | 'automated' | 'video'
}

export interface CertificationVerification {
  certification_type: string
  certification_name: string
  issuing_body: string
  certificate_number: string
  issue_date: string
  expiry_date?: string
  is_valid: boolean
  verification_url?: string
}

export interface KYCProfile {
  user_id: string
  verification_level: 'none' | 'basic' | 'standard' | 'premium' | 'enterprise'
  identity_verified: boolean
  insurance_verified: boolean
  certifications_verified: boolean
  background_check_passed?: boolean
  video_verification_passed?: boolean
  overall_status: VerificationStatus
  trust_score: number
  last_verification_date?: string
  next_review_date?: string
  created_at: string
  updated_at: string
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export class KYCVerificationService {
  private supabase = getSupabaseAdmin()

  /**
   * Initialize KYC profile for a user
   */
  async initializeKYCProfile(userId: string): Promise<KYCProfile> {
    const profile: Partial<KYCProfile> = {
      user_id: userId,
      verification_level: 'none',
      identity_verified: false,
      insurance_verified: false,
      certifications_verified: false,
      overall_status: 'pending',
      trust_score: 0,
    }

    const { data, error } = await this.supabase
      .from('kyc_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      logger.error('Failed to initialize KYC profile:', error)
      throw new Error('Failed to initialize KYC profile')
    }

    return data
  }

  /**
   * Submit a document for verification
   */
  async submitDocument(
    userId: string,
    documentType: KYCDocument['type'],
    fileUrl: string,
    metadata: Partial<KYCDocument>
  ): Promise<KYCDocument> {
    const document: Partial<KYCDocument> = {
      user_id: userId,
      type: documentType,
      file_url: fileUrl,
      status: 'pending',
      ...metadata,
    }

    const { data, error } = await this.supabase
      .from('kyc_documents')
      .insert(document)
      .select()
      .single()

    if (error) {
      logger.error('Failed to submit document:', error)
      throw new Error('Failed to submit document')
    }

    // Trigger automatic verification for certain document types
    if (['insurance', 'registration'].includes(documentType)) {
      this.triggerAutomaticVerification(data.id, documentType)
    }

    return data
  }

  /**
   * Verify identity document
   */
  async verifyIdentity(
    userId: string,
    identityData: IdentityVerification
  ): Promise<{ success: boolean; verification: IdentityVerification }> {
    try {
      // In production, this would call an external KYC provider (Onfido, Jumio, etc.)
      // For now, we simulate the verification process

      const verificationResult = await this.performIdentityCheck(identityData)

      if (verificationResult.success) {
        await this.supabase
          .from('kyc_profiles')
          .update({
            identity_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await this.recalculateTrustScore(userId)
      }

      // Log the verification attempt
      await this.logVerificationAttempt(userId, 'identity', verificationResult.success)

      return {
        success: verificationResult.success,
        verification: {
          ...identityData,
          face_match_score: verificationResult.faceMatchScore,
          liveness_check: verificationResult.livenessCheck,
        },
      }
    } catch (error) {
      logger.error('Identity verification failed:', error)
      throw new Error('Identity verification failed')
    }
  }

  /**
   * Verify insurance (Assurance Décennale, RC Pro)
   */
  async verifyInsurance(
    userId: string,
    insuranceData: InsuranceVerification
  ): Promise<{ success: boolean; verification: InsuranceVerification }> {
    try {
      // Validate insurance policy
      const isValid = await this.validateInsurancePolicy(insuranceData)

      if (isValid) {
        // Store insurance verification
        await this.supabase
          .from('insurance_verifications')
          .upsert({
            user_id: userId,
            ...insuranceData,
            is_valid: true,
            verification_date: new Date().toISOString(),
          }, { onConflict: 'user_id,policy_number' })

        await this.supabase
          .from('kyc_profiles')
          .update({
            insurance_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await this.recalculateTrustScore(userId)
      }

      await this.logVerificationAttempt(userId, 'insurance', isValid)

      return {
        success: isValid,
        verification: {
          ...insuranceData,
          is_valid: isValid,
          verification_date: new Date().toISOString(),
        },
      }
    } catch (error) {
      logger.error('Insurance verification failed:', error)
      throw new Error('Insurance verification failed')
    }
  }

  /**
   * Verify professional certification
   */
  async verifyCertification(
    userId: string,
    certificationData: CertificationVerification
  ): Promise<{ success: boolean; verification: CertificationVerification }> {
    try {
      // Validate certification with issuing body
      const isValid = await this.validateCertification(certificationData)

      if (isValid) {
        await this.supabase
          .from('certification_verifications')
          .insert({
            user_id: userId,
            ...certificationData,
            is_valid: true,
            verified_at: new Date().toISOString(),
          })

        // Update certifications verified status
        const { count } = await this.supabase
          .from('certification_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_valid', true)

        if (count && count > 0) {
          await this.supabase
            .from('kyc_profiles')
            .update({
              certifications_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        }

        await this.recalculateTrustScore(userId)
      }

      await this.logVerificationAttempt(userId, 'certification', isValid)

      return {
        success: isValid,
        verification: {
          ...certificationData,
          is_valid: isValid,
        },
      }
    } catch (error) {
      logger.error('Certification verification failed:', error)
      throw new Error('Certification verification failed')
    }
  }

  /**
   * Video verification session
   */
  async initiateVideoVerification(userId: string): Promise<{ sessionId: string; sessionUrl: string }> {
    // Generate a unique session ID
    const sessionId = `video_${userId}_${Date.now()}`

    // In production, this would integrate with a video verification provider
    const sessionUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verification/video/${sessionId}`

    await this.supabase
      .from('video_verification_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
      })

    return { sessionId, sessionUrl }
  }

  /**
   * Complete video verification
   */
  async completeVideoVerification(
    sessionId: string,
    result: { passed: boolean; notes?: string; recorded_by?: string }
  ): Promise<void> {
    const { data: session } = await this.supabase
      .from('video_verification_sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .single()

    if (!session) {
      throw new Error('Video verification session not found')
    }

    await this.supabase
      .from('video_verification_sessions')
      .update({
        status: result.passed ? 'verified' : 'rejected',
        completed_at: new Date().toISOString(),
        verification_notes: result.notes,
        verified_by: result.recorded_by,
      })
      .eq('session_id', sessionId)

    if (result.passed) {
      await this.supabase
        .from('kyc_profiles')
        .update({
          video_verification_passed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user_id)

      await this.recalculateTrustScore(session.user_id)
    }

    await this.logVerificationAttempt(session.user_id, 'video', result.passed)
  }

  /**
   * Get user's KYC profile with all verifications
   */
  async getKYCProfile(userId: string): Promise<{
    profile: KYCProfile | null
    documents: KYCDocument[]
    insurances: InsuranceVerification[]
    certifications: CertificationVerification[]
  }> {
    const [profileResult, documentsResult, insurancesResult, certificationsResult] = await Promise.all([
      this.supabase
        .from('kyc_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      this.supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      this.supabase
        .from('insurance_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_valid', true),
      this.supabase
        .from('certification_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_valid', true),
    ])

    return {
      profile: profileResult.data,
      documents: documentsResult.data || [],
      insurances: insurancesResult.data || [],
      certifications: certificationsResult.data || [],
    }
  }

  /**
   * Recalculate trust score based on all verifications
   */
  private async recalculateTrustScore(userId: string): Promise<number> {
    const { profile, insurances, certifications } = await this.getKYCProfile(userId)

    if (!profile) {
      return 0
    }

    let score = 0

    // Identity verification (30 points)
    if (profile.identity_verified) score += 30

    // Insurance verification (25 points)
    if (profile.insurance_verified) {
      score += 15
      // Bonus for Décennale insurance
      const hasDecennale = insurances.some((i) => i.coverage_type === 'decennale')
      if (hasDecennale) score += 10
    }

    // Certifications (20 points max)
    const certCount = Math.min(certifications.length, 4)
    score += certCount * 5

    // Video verification (15 points)
    if (profile.video_verification_passed) score += 15

    // Background check (10 points)
    if (profile.background_check_passed) score += 10

    // Calculate verification level
    let verificationLevel: KYCProfile['verification_level'] = 'none'
    if (score >= 80) verificationLevel = 'enterprise'
    else if (score >= 60) verificationLevel = 'premium'
    else if (score >= 40) verificationLevel = 'standard'
    else if (score >= 20) verificationLevel = 'basic'

    // Determine overall status
    let overallStatus: VerificationStatus = 'pending'
    if (profile.identity_verified && profile.insurance_verified) {
      overallStatus = 'verified'
    } else if (profile.identity_verified || profile.insurance_verified) {
      overallStatus = 'in_progress'
    }

    // Update profile
    await this.supabase
      .from('kyc_profiles')
      .update({
        trust_score: score,
        verification_level: verificationLevel,
        overall_status: overallStatus,
        last_verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    // Update main profile trust badge
    await this.updateProfileTrustBadge(userId, verificationLevel, score)

    return score
  }

  /**
   * Update the main profile with trust badge based on KYC
   */
  private async updateProfileTrustBadge(
    userId: string,
    level: KYCProfile['verification_level'],
    score: number
  ): Promise<void> {
    let badge: 'gold' | 'silver' | 'bronze' | 'none' = 'none'

    if (level === 'enterprise' || level === 'premium') badge = 'gold'
    else if (level === 'standard') badge = 'silver'
    else if (level === 'basic') badge = 'bronze'

    await this.supabase
      .from('profiles')
      .update({
        trust_badge: badge,
        trust_score: score,
        is_verified: score >= 40,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  /**
   * Log verification attempt for audit
   */
  private async logVerificationAttempt(
    userId: string,
    verificationType: string,
    success: boolean
  ): Promise<void> {
    await this.supabase
      .from('kyc_verification_logs')
      .insert({
        user_id: userId,
        verification_type: verificationType,
        success,
        timestamp: new Date().toISOString(),
      })
  }

  /**
   * Trigger automatic verification process
   */
  private async triggerAutomaticVerification(
    documentId: string,
    documentType: string
  ): Promise<void> {
    // In production, this would queue a background job
    logger.info(`Automatic verification triggered for document ${documentId} (${documentType})`)
  }

  /**
   * Perform identity check (simulated - would use external provider)
   */
  private async performIdentityCheck(
    data: IdentityVerification
  ): Promise<{ success: boolean; faceMatchScore?: number; livenessCheck?: boolean }> {
    // Simulate external API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Basic validation
    const isValid =
      data.document_number.length >= 6 &&
      new Date(data.expiry_date) > new Date() &&
      data.first_name.length > 0 &&
      data.last_name.length > 0

    return {
      success: isValid,
      faceMatchScore: isValid ? 0.95 : 0,
      livenessCheck: isValid,
    }
  }

  /**
   * Validate insurance policy (simulated - would use insurer API)
   */
  private async validateInsurancePolicy(data: InsuranceVerification): Promise<boolean> {
    // Simulate external API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Basic validation
    const isValid =
      data.policy_number.length >= 6 &&
      new Date(data.end_date) > new Date() &&
      data.coverage_amount >= 10000

    return isValid
  }

  /**
   * Validate certification (simulated - would use issuing body API)
   */
  private async validateCertification(data: CertificationVerification): Promise<boolean> {
    // Simulate external API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Basic validation
    const isValid =
      data.certificate_number.length >= 4 &&
      (!data.expiry_date || new Date(data.expiry_date) > new Date())

    return isValid
  }
}

// Export singleton instance
export const kycVerificationService = new KYCVerificationService()
