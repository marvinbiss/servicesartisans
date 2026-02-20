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
          phone: string | null
          phone_e164: string | null
          is_admin: boolean
          // Added by migration 309
          role: 'super_admin' | 'admin' | 'moderator' | 'viewer' | null
          subscription_plan: 'gratuit' | 'pro' | 'premium' | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          stripe_customer_id: string | null
          // Ratings (denormalised)
          average_rating: number | null
          review_count: number | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          phone_e164?: string | null
          is_admin?: boolean
          role?: 'super_admin' | 'admin' | 'moderator' | 'viewer' | null
          subscription_plan?: 'gratuit' | 'pro' | 'premium' | null
          stripe_customer_id?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          phone_e164?: string | null
          is_admin?: boolean
          role?: 'super_admin' | 'admin' | 'moderator' | 'viewer' | null
          subscription_plan?: 'gratuit' | 'pro' | 'premium' | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          stripe_customer_id?: string | null
          average_rating?: number | null
          review_count?: number | null
        }
      }
      providers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          // Core identity — NB: column is 'name', NOT 'company_name'
          name: string
          slug: string
          email: string | null
          phone: string | null
          siret: string | null
          // Status flags
          is_verified: boolean
          is_active: boolean
          // Dedup / SEO
          stable_id: string
          noindex: boolean
          // Address fields
          address_city: string | null
          address_postal_code: string | null
          address_street: string | null
          address_region: string | null
          // Service
          specialty: string | null
          // Ratings (denormalised)
          rating_average: number | null
          review_count: number | null
          // Provider public page fields (added by migration 306)
          avatar_url: string | null
          certifications: string[] | null
          insurance: string[] | null
          payment_methods: string[] | null
          languages: string[] | null
          emergency_available: boolean | null
          available_24h: boolean | null
          hourly_rate_min: number | null
          hourly_rate_max: number | null
          phone_secondary: string | null
          opening_hours: Json | null
          accepts_new_clients: boolean | null
          free_quote: boolean | null
          intervention_radius_km: number | null
          service_prices: Json | null
          faq: Json | null
          team_size: number | null
          services_offered: string[] | null
          bio: string | null
        }
        Insert: {
          name: string
          slug: string
          email?: string | null
          phone?: string | null
          siret?: string | null
          is_verified?: boolean
          is_active?: boolean
          stable_id: string
          noindex?: boolean
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          address_region?: string | null
          specialty?: string | null
          rating_average?: number | null
          review_count?: number | null
          avatar_url?: string | null
          bio?: string | null
        }
        Update: {
          name?: string
          slug?: string
          email?: string | null
          phone?: string | null
          siret?: string | null
          is_verified?: boolean
          is_active?: boolean
          noindex?: boolean
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          address_region?: string | null
          specialty?: string | null
          rating_average?: number | null
          review_count?: number | null
          avatar_url?: string | null
          certifications?: string[] | null
          insurance?: string[] | null
          payment_methods?: string[] | null
          languages?: string[] | null
          emergency_available?: boolean | null
          available_24h?: boolean | null
          hourly_rate_min?: number | null
          hourly_rate_max?: number | null
          phone_secondary?: string | null
          opening_hours?: Json | null
          accepts_new_clients?: boolean | null
          free_quote?: boolean | null
          intervention_radius_km?: number | null
          service_prices?: Json | null
          faq?: Json | null
          team_size?: number | null
          services_offered?: string[] | null
          bio?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_id: string | null
          // NB: column is 'provider_id', NOT 'artisan_id'
          provider_id: string | null
          service_id: string | null
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_date: string | null
          scheduled_time: string | null
          duration_minutes: number | null
          address: string | null
          city: string | null
          postal_code: string | null
          notes: string | null
          total_amount: number | null
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
        }
        Insert: {
          client_id?: string | null
          provider_id?: string | null
          service_id?: string | null
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_date?: string | null
          scheduled_time?: string | null
          duration_minutes?: number | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          notes?: string | null
          total_amount?: number | null
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_date?: string | null
          scheduled_time?: string | null
          notes?: string | null
          total_amount?: number | null
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          booking_id: string | null
          provider_id: string | null
          author_name: string | null
          author_email: string | null
          rating: number
          content: string | null
          status: 'published' | 'pending_review' | 'hidden' | 'flagged' | null
          provider_response: string | null
        }
        Insert: {
          booking_id?: string | null
          provider_id?: string | null
          author_name?: string | null
          author_email?: string | null
          rating: number
          content?: string | null
          status?: 'published' | 'pending_review' | 'hidden' | 'flagged' | null
        }
        Update: {
          rating?: number
          content?: string | null
          provider_response?: string | null
          status?: 'published' | 'pending_review' | 'hidden' | 'flagged' | null
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
