import { createClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'provider.claim'
  | 'provider.update'
  | 'provider.verify'
  | 'provider.plan_change'
  | 'quote.create'
  | 'quote.status_change'
  | 'quote.delete'
  | 'review.response'
  | 'review.moderate'
  | 'admin.provider_edit'
  | 'admin.provider_delete'
  | 'admin.review_moderate'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.upgraded'

export interface AuditLogEntry {
  action: AuditAction
  userId?: string
  providerId?: string
  resourceType?: string
  resourceId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.userId,
      provider_id: entry.providerId,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      old_value: entry.oldValue,
      new_value: entry.newValue,
      metadata: entry.metadata,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

// Helper functions
export function auditLogin(userId: string, ipAddress?: string, userAgent?: string) {
  return logAudit({ action: 'user.login', userId, ipAddress, userAgent })
}

export function auditLogout(userId: string) {
  return logAudit({ action: 'user.logout', userId })
}

export function auditProviderUpdate(
  userId: string,
  providerId: string,
  oldValue: Record<string, unknown>,
  newValue: Record<string, unknown>
) {
  return logAudit({
    action: 'provider.update',
    userId,
    providerId,
    resourceType: 'provider',
    resourceId: providerId,
    oldValue,
    newValue,
  })
}

export function auditQuoteStatusChange(
  userId: string,
  providerId: string,
  quoteId: string,
  oldStatus: string,
  newStatus: string
) {
  return logAudit({
    action: 'quote.status_change',
    userId,
    providerId,
    resourceType: 'quote',
    resourceId: quoteId,
    oldValue: { status: oldStatus },
    newValue: { status: newStatus },
  })
}

export function auditSubscriptionChange(
  userId: string,
  providerId: string,
  action: 'subscription.created' | 'subscription.cancelled' | 'subscription.upgraded',
  metadata: Record<string, unknown>
) {
  return logAudit({
    action,
    userId,
    providerId,
    resourceType: 'subscription',
    metadata,
  })
}

export function auditAdminAction(
  adminUserId: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>
) {
  return logAudit({
    action,
    userId: adminUserId,
    resourceType,
    resourceId,
    metadata,
  })
}
