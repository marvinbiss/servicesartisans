export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          user_type: 'client' | 'artisan'
          // Artisan specific
          siret: string | null
          description: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          services: string[] | null
          zones: string[] | null
          is_verified: boolean
          // Subscription
          subscription_plan: 'gratuit' | 'pro' | 'premium'
          subscription_status: 'active' | 'canceled' | 'past_due' | null
          subscription_period_end: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          user_type?: 'client' | 'artisan'
          siret?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          services?: string[] | null
          zones?: string[] | null
          is_verified?: boolean
          subscription_plan?: 'gratuit' | 'pro' | 'premium'
          stripe_customer_id?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          user_type?: 'client' | 'artisan'
          siret?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          services?: string[] | null
          zones?: string[] | null
          is_verified?: boolean
          subscription_plan?: 'gratuit' | 'pro' | 'premium'
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          subscription_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          category: string | null
          is_active: boolean
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          category?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          category?: string | null
          is_active?: boolean
        }
      }
      devis_requests: {
        Row: {
          id: string
          created_at: string
          client_id: string | null
          service_id: string | null
          service_name: string
          postal_code: string
          city: string | null
          description: string
          budget: string | null
          urgency: 'normal' | 'urgent' | 'tres_urgent'
          status: 'pending' | 'sent' | 'accepted' | 'refused' | 'completed'
          client_name: string
          client_email: string
          client_phone: string
        }
        Insert: {
          client_id?: string | null
          service_id?: string | null
          service_name: string
          postal_code: string
          city?: string | null
          description: string
          budget?: string | null
          urgency?: 'normal' | 'urgent' | 'tres_urgent'
          status?: 'pending' | 'sent' | 'accepted' | 'refused' | 'completed'
          client_name: string
          client_email: string
          client_phone: string
        }
        Update: {
          status?: 'pending' | 'sent' | 'accepted' | 'refused' | 'completed'
        }
      }
      quotes: {
        Row: {
          id: string
          created_at: string
          request_id: string
          provider_id: string
          amount: number
          description: string
          valid_until: string
          status: 'pending' | 'accepted' | 'refused' | 'expired'
        }
        Insert: {
          request_id: string
          provider_id: string
          amount: number
          description: string
          valid_until: string
          status?: 'pending' | 'accepted' | 'refused' | 'expired'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'refused' | 'expired'
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          artisan_id: string
          client_name: string
          client_email: string
          rating: number
          comment: string | null
          would_recommend: boolean | null
          status: 'published' | 'pending_review' | 'hidden' | 'flagged'
          artisan_response: string | null
        }
        Insert: {
          booking_id: string
          artisan_id: string
          client_name: string
          client_email: string
          rating: number
          comment?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          rating?: number
          comment?: string | null
          artisan_response?: string | null
          status?: 'published' | 'pending_review' | 'hidden' | 'flagged'
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          devis_request_id: string | null
          content: string
          is_read: boolean
        }
        Insert: {
          sender_id: string
          receiver_id: string
          devis_request_id?: string | null
          content: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          profile_id: string
          stripe_invoice_id: string
          amount: number
          currency: string
          status: 'paid' | 'pending' | 'failed'
          invoice_url: string | null
        }
        Insert: {
          profile_id: string
          stripe_invoice_id: string
          amount: number
          currency?: string
          status?: 'paid' | 'pending' | 'failed'
          invoice_url?: string | null
        }
        Update: {
          status?: 'paid' | 'pending' | 'failed'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
