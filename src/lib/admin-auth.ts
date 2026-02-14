/**
 * Admin Authentication Utility - ServicesArtisans
 * Ensures only admin users can access admin endpoints
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { type AdminRole, type AdminPermissions, DEFAULT_PERMISSIONS } from '@/types/admin'

// Re-export types so existing imports from '@/lib/admin-auth' continue to work
export type { AdminRole, AdminPermissions } from '@/types/admin'
export { DEFAULT_PERMISSIONS } from '@/types/admin'

// Admin email whitelist from environment variable (fallback when profiles table doesn't exist)
// Set ADMIN_EMAILS in .env.local as comma-separated list: admin1@example.com,admin2@example.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(email => email.trim().length > 0)

/** Lightweight admin user for auth results (subset of full AdminUser from types/admin) */
export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  permissions: AdminPermissions
}

export interface AdminAuthResult {
  success: boolean
  admin?: AdminUser
  error?: NextResponse
}

/**
 * Verify that the current user is an admin
 * Returns admin user info if authorized, or error response if not
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentification requise' } },
          { status: 401 }
        ),
      }
    }

    // Check admin role in profiles table
    const adminSupabase = createAdminClient()
    let role: AdminRole | null = null
    let isAdmin = false

    // Try profiles table first
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profileError && profile) {
      role = profile.role as AdminRole | null
      isAdmin = profile.is_admin === true
    }

    // Fallback: check email whitelist ONLY if profile was found and verified
    // SECURITY FIX: Ne jamais accorder super_admin si le profil n'est pas accessible
    if (profileError) {
      logger.error('Profile access failed - denying admin access for security', {
        userId: user.id,
        email: user.email,
        error: profileError
      })
      return {
        success: false,
        error: NextResponse.json(
          { success: false, error: { code: 'PROFILE_ACCESS_ERROR', message: 'Impossible de vérifier les permissions' } },
          { status: 503 }
        ),
      }
    }

    // Whitelist check ONLY with valid profile
    if (!isAdmin && !role && user.email && ADMIN_EMAILS.includes(user.email) && profile) {
      isAdmin = true
      role = profile.role as AdminRole || 'viewer' // Use least privilege when profile.role is NULL
    }

    // Verify admin access
    const validRoles: AdminRole[] = ['super_admin', 'admin', 'moderator', 'viewer']

    if (!isAdmin && (!role || !validRoles.includes(role))) {
      // Log unauthorized access attempt
      logger.warn('Unauthorized admin access attempt', { userId: user.id, email: user.email })

      return {
        success: false,
        error: NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Accès admin requis' } },
          { status: 403 }
        ),
      }
    }

    const adminRole: AdminRole = role && validRoles.includes(role) ? role : 'viewer'

    return {
      success: true,
      admin: {
        id: user.id,
        email: user.email || '',
        role: adminRole,
        permissions: DEFAULT_PERMISSIONS[adminRole],
      },
    }
  } catch (error) {
    logger.error('Admin auth error', error as Error)
    return {
      success: false,
      error: NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: 'Erreur d\'authentification' } },
        { status: 500 }
      ),
    }
  }
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(
  admin: AdminUser,
  resource: keyof AdminPermissions,
  action: string
): boolean {
  const resourcePermissions = admin.permissions[resource]
  if (!resourcePermissions) return false
  return (resourcePermissions as Record<string, boolean>)[action] === true
}

/**
 * Require specific permission or return 403
 */
export async function requirePermission(
  resource: keyof AdminPermissions,
  action: string
): Promise<AdminAuthResult> {
  const authResult = await verifyAdmin()

  if (!authResult.success || !authResult.admin) {
    return authResult
  }

  if (!hasPermission(authResult.admin, resource, action)) {
    return {
      success: false,
      error: NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Permission insuffisante' } },
        { status: 403 }
      ),
    }
  }

  return authResult
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action,
      resource_type: entityType,
      resource_id: entityId,
      new_value: details || {},
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Audit logging should not break the main operation
    logger.error('Audit log error', error as Error)
  }
}
