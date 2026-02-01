// Types pour l'administration

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'viewer'

export interface AdminPermissions {
  users: { read: boolean; write: boolean; delete: boolean }
  providers: { read: boolean; write: boolean; delete: boolean; verify: boolean }
  reviews: { read: boolean; write: boolean; delete: boolean }
  payments: { read: boolean; refund: boolean; cancel: boolean }
  services: { read: boolean; write: boolean; delete: boolean }
  settings: { read: boolean; write: boolean }
  audit: { read: boolean }
}

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: AdminRole
  permissions: AdminPermissions
  created_at: string
  updated_at?: string
}

export interface AuditLog {
  id: string
  admin_id: string
  admin_email?: string
  action: string
  entity_type: 'user' | 'provider' | 'review' | 'payment' | 'service' | 'settings' | 'booking'
  entity_id?: string
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface UserReport {
  id: string
  reporter_id?: string
  reporter_email?: string
  target_type: 'provider' | 'review' | 'user' | 'message'
  target_id: string
  reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other'
  description?: string
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  resolved_by?: string
  resolution_notes?: string
  created_at: string
  resolved_at?: string
}

export interface GdprRequest {
  id: string
  user_id?: string
  user_email: string
  request_type: 'export' | 'delete'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processed_by?: string
  notes?: string
  created_at: string
  processed_at?: string
}

// User management
export interface AdminUserView {
  id: string
  email: string
  full_name?: string
  phone?: string
  user_type: 'client' | 'artisan'
  is_verified: boolean
  is_banned: boolean
  ban_reason?: string
  subscription_plan: 'gratuit' | 'pro' | 'premium'
  subscription_status?: 'active' | 'canceled' | 'past_due'
  stripe_customer_id?: string
  created_at: string
  updated_at?: string
  last_login?: string
}

// Pagination
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

// Filters
export interface AdminFilters {
  search?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Payment types
export interface PaymentRecord {
  id: string
  user_id: string
  user_email: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  type: 'subscription' | 'booking' | 'manual'
  stripe_payment_id?: string
  description?: string
  created_at: string
  refunded_at?: string
  refund_amount?: number
}

export interface SubscriptionRecord {
  id: string
  user_id: string
  user_email: string
  user_name?: string
  plan: 'gratuit' | 'pro' | 'premium'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  amount: number
  created_at: string
  canceled_at?: string
}

// Booking types for admin
export interface AdminBooking {
  id: string
  artisan_id: string
  artisan_name?: string
  client_email: string
  client_name?: string
  service: string
  booking_date: string
  time_slot: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'not_required' | 'pending' | 'paid'
  deposit_amount?: number
  created_at: string
  cancelled_at?: string
  cancellation_reason?: string
}

// Quote/Devis types for admin
export interface AdminQuote {
  id: string
  client_email: string
  client_name?: string
  client_phone?: string
  service_name: string
  description?: string
  postal_code: string
  status: 'pending' | 'sent' | 'accepted' | 'refused' | 'expired'
  urgency: 'normal' | 'urgent' | 'tres_urgent'
  created_at: string
  updated_at?: string
}

// Message/Conversation for admin
export interface AdminConversation {
  id: string
  client_id: string
  client_email?: string
  provider_id: string
  provider_name?: string
  status: 'active' | 'archived' | 'blocked'
  last_message_at?: string
  unread_count: number
  created_at: string
}

export interface AdminMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'client' | 'artisan' | 'system'
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  created_at: string
  read_at?: string
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    users: { read: true, write: true, delete: true },
    providers: { read: true, write: true, delete: true, verify: true },
    reviews: { read: true, write: true, delete: true },
    payments: { read: true, refund: true, cancel: true },
    services: { read: true, write: true, delete: true },
    settings: { read: true, write: true },
    audit: { read: true },
  },
  admin: {
    users: { read: true, write: true, delete: false },
    providers: { read: true, write: true, delete: false, verify: true },
    reviews: { read: true, write: true, delete: true },
    payments: { read: true, refund: true, cancel: false },
    services: { read: true, write: true, delete: false },
    settings: { read: true, write: false },
    audit: { read: true },
  },
  moderator: {
    users: { read: true, write: false, delete: false },
    providers: { read: true, write: false, delete: false, verify: true },
    reviews: { read: true, write: true, delete: false },
    payments: { read: true, refund: false, cancel: false },
    services: { read: true, write: false, delete: false },
    settings: { read: false, write: false },
    audit: { read: false },
  },
  viewer: {
    users: { read: true, write: false, delete: false },
    providers: { read: true, write: false, delete: false, verify: false },
    reviews: { read: true, write: false, delete: false },
    payments: { read: true, refund: false, cancel: false },
    services: { read: true, write: false, delete: false },
    settings: { read: false, write: false },
    audit: { read: false },
  },
}
