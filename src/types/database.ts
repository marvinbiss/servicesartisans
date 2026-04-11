export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          method: string
          path: string
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          method?: string
          path: string
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          method?: string
          path?: string
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      algorithm_config: {
        Row: {
          auto_reassign_hours: number
          cooldown_minutes: number
          daily_lead_quota: number
          exclude_inactive_days: number
          geo_radius_km: number
          id: string
          lead_expiry_hours: number
          matching_strategy: string
          max_artisans_per_lead: number
          min_rating: number
          monthly_lead_quota: number
          prefer_claimed: boolean
          quote_expiry_hours: number
          require_same_department: boolean
          require_specialty_match: boolean
          require_verified_urgent: boolean
          singleton: boolean
          specialty_match_mode: string
          updated_at: string
          updated_by: string | null
          urgency_emergency_multiplier: number
          urgency_high_multiplier: number
          urgency_low_multiplier: number
          urgency_medium_multiplier: number
          weight_data_quality: number
          weight_proximity: number
          weight_rating: number
          weight_reviews: number
          weight_verified: number
        }
        Insert: {
          auto_reassign_hours?: number
          cooldown_minutes?: number
          daily_lead_quota?: number
          exclude_inactive_days?: number
          geo_radius_km?: number
          id?: string
          lead_expiry_hours?: number
          matching_strategy?: string
          max_artisans_per_lead?: number
          min_rating?: number
          monthly_lead_quota?: number
          prefer_claimed?: boolean
          quote_expiry_hours?: number
          require_same_department?: boolean
          require_specialty_match?: boolean
          require_verified_urgent?: boolean
          singleton?: boolean
          specialty_match_mode?: string
          updated_at?: string
          updated_by?: string | null
          urgency_emergency_multiplier?: number
          urgency_high_multiplier?: number
          urgency_low_multiplier?: number
          urgency_medium_multiplier?: number
          weight_data_quality?: number
          weight_proximity?: number
          weight_rating?: number
          weight_reviews?: number
          weight_verified?: number
        }
        Update: {
          auto_reassign_hours?: number
          cooldown_minutes?: number
          daily_lead_quota?: number
          exclude_inactive_days?: number
          geo_radius_km?: number
          id?: string
          lead_expiry_hours?: number
          matching_strategy?: string
          max_artisans_per_lead?: number
          min_rating?: number
          monthly_lead_quota?: number
          prefer_claimed?: boolean
          quote_expiry_hours?: number
          require_same_department?: boolean
          require_specialty_match?: boolean
          require_verified_urgent?: boolean
          singleton?: boolean
          specialty_match_mode?: string
          updated_at?: string
          updated_by?: string | null
          urgency_emergency_multiplier?: number
          urgency_high_multiplier?: number
          urgency_low_multiplier?: number
          urgency_medium_multiplier?: number
          weight_data_quality?: number
          weight_proximity?: number
          weight_rating?: number
          weight_reviews?: number
          weight_verified?: number
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          page_path: string | null
          provider_id: string | null
          session_id: string | null
          source: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          page_path?: string | null
          provider_id?: string | null
          session_id?: string | null
          source?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          page_path?: string | null
          provider_id?: string | null
          session_id?: string | null
          source?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_events_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      answers: {
        Row: {
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_accepted: boolean | null
          is_provider: boolean | null
          moderated_at: string | null
          provider_id: string | null
          question_id: string
          status: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_accepted?: boolean | null
          is_provider?: boolean | null
          moderated_at?: string | null
          provider_id?: string | null
          question_id: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_accepted?: boolean | null
          is_provider?: boolean | null
          moderated_at?: string | null
          provider_id?: string | null
          question_id?: string
          status?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'answers_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'answers_question_id_fkey'
            columns: ['question_id']
            isOneToOne: false
            referencedRelation: 'questions'
            referencedColumns: ['id']
          },
        ]
      }
      artisan_pricing_settings: {
        Row: {
          artisan_id: string
          created_at: string | null
          custom_rules: Json | null
          enable_dynamic_pricing: boolean | null
          holiday_surcharge: number | null
          id: string
          last_minute_surcharge: number | null
          off_peak_discount: number | null
          updated_at: string | null
          weekend_surcharge: number | null
        }
        Insert: {
          artisan_id: string
          created_at?: string | null
          custom_rules?: Json | null
          enable_dynamic_pricing?: boolean | null
          holiday_surcharge?: number | null
          id?: string
          last_minute_surcharge?: number | null
          off_peak_discount?: number | null
          updated_at?: string | null
          weekend_surcharge?: number | null
        }
        Update: {
          artisan_id?: string
          created_at?: string | null
          custom_rules?: Json | null
          enable_dynamic_pricing?: boolean | null
          holiday_surcharge?: number | null
          id?: string
          last_minute_surcharge?: number | null
          off_peak_discount?: number | null
          updated_at?: string | null
          weekend_surcharge?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'artisan_pricing_settings_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      artisan_slot_stats: {
        Row: {
          artisan_id: string
          booking_count: number | null
          day_of_week: number | null
          id: string
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          artisan_id: string
          booking_count?: number | null
          day_of_week?: number | null
          id?: string
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          artisan_id?: string
          booking_count?: number | null
          day_of_week?: number | null
          id?: string
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'artisan_slot_stats_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      barometre_stats: {
        Row: {
          created_at: string | null
          departement: string | null
          departement_code: string | null
          id: number
          metier: string
          metier_slug: string
          nb_artisans: number | null
          nb_avis: number | null
          note_moyenne: number | null
          region: string | null
          region_slug: string | null
          taux_verification: number | null
          updated_at: string | null
          variation_trimestre: number | null
          ville: string | null
          ville_slug: string | null
        }
        Insert: {
          created_at?: string | null
          departement?: string | null
          departement_code?: string | null
          id?: number
          metier: string
          metier_slug: string
          nb_artisans?: number | null
          nb_avis?: number | null
          note_moyenne?: number | null
          region?: string | null
          region_slug?: string | null
          taux_verification?: number | null
          updated_at?: string | null
          variation_trimestre?: number | null
          ville?: string | null
          ville_slug?: string | null
        }
        Update: {
          created_at?: string | null
          departement?: string | null
          departement_code?: string | null
          id?: number
          metier?: string
          metier_slug?: string
          nb_artisans?: number | null
          nb_avis?: number | null
          note_moyenne?: number | null
          region?: string | null
          region_slug?: string | null
          taux_verification?: number | null
          updated_at?: string | null
          variation_trimestre?: number | null
          ville?: string | null
          ville_slug?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          city: string | null
          client_id: string | null
          created_at: string | null
          deposit_amount: number | null
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_intent_id: string | null
          payment_session_id: string | null
          payment_status: string | null
          postal_code: string | null
          provider_id: string | null
          rescheduled_at: string | null
          rescheduled_from_slot_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          postal_code?: string | null
          provider_id?: string | null
          rescheduled_at?: string | null
          rescheduled_from_slot_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          postal_code?: string | null
          provider_id?: string | null
          rescheduled_at?: string | null
          rescheduled_from_slot_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      canonical_urls: {
        Row: {
          canonical_url: string
          created_at: string | null
          id: string
          page_id: string
        }
        Insert: {
          canonical_url: string
          created_at?: string | null
          id?: string
          page_id: string
        }
        Update: {
          canonical_url?: string
          created_at?: string | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'canonical_urls_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'canonical_urls_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      cee_delegataires: {
        Row: {
          contact_commercial_email: string | null
          contact_technique_email: string | null
          coup_de_pouce_signataire: boolean
          created_at: string
          id: string
          is_p6: boolean
          metadata: Json
          nom_commercial: string
          notes: string | null
          operations_supportees: string[]
          raison_sociale: string
          secteurs_couverts: string[]
          siret: string | null
          slug: string
          statut: string
          type: string
          updated_at: string
          url_api_docs: string | null
          url_site: string | null
          vague_priorite: number
          volume_cee_twhc_2025: number | null
        }
        Insert: {
          contact_commercial_email?: string | null
          contact_technique_email?: string | null
          coup_de_pouce_signataire?: boolean
          created_at?: string
          id?: string
          is_p6?: boolean
          metadata?: Json
          nom_commercial: string
          notes?: string | null
          operations_supportees?: string[]
          raison_sociale: string
          secteurs_couverts?: string[]
          siret?: string | null
          slug: string
          statut?: string
          type: string
          updated_at?: string
          url_api_docs?: string | null
          url_site?: string | null
          vague_priorite?: number
          volume_cee_twhc_2025?: number | null
        }
        Update: {
          contact_commercial_email?: string | null
          contact_technique_email?: string | null
          coup_de_pouce_signataire?: boolean
          created_at?: string
          id?: string
          is_p6?: boolean
          metadata?: Json
          nom_commercial?: string
          notes?: string | null
          operations_supportees?: string[]
          raison_sociale?: string
          secteurs_couverts?: string[]
          siret?: string | null
          slug?: string
          statut?: string
          type?: string
          updated_at?: string
          url_api_docs?: string | null
          url_site?: string | null
          vague_priorite?: number
          volume_cee_twhc_2025?: number | null
        }
        Relationships: []
      }
      cee_operations: {
        Row: {
          classique_eligible: boolean
          code: string
          coup_de_pouce: boolean
          coup_de_pouce_charte: string | null
          created_at: string
          date_fin_validite: string | null
          date_publication_arrete: string | null
          description: string | null
          domaine: string
          forfait_base_kwhc: number | null
          id: string
          is_active: boolean
          justificatifs_requis: Json
          nom: string
          notes: string | null
          precarite_eligible: boolean
          rge_meta_domaines: string[]
          rge_qualifications_requises: string[]
          secteur: string
          services_slugs: string[]
          sous_domaine: string | null
          unite_mesure: string | null
          updated_at: string
          url_fiche_officielle: string | null
          version_fiche: string | null
        }
        Insert: {
          classique_eligible?: boolean
          code: string
          coup_de_pouce?: boolean
          coup_de_pouce_charte?: string | null
          created_at?: string
          date_fin_validite?: string | null
          date_publication_arrete?: string | null
          description?: string | null
          domaine: string
          forfait_base_kwhc?: number | null
          id?: string
          is_active?: boolean
          justificatifs_requis?: Json
          nom: string
          notes?: string | null
          precarite_eligible?: boolean
          rge_meta_domaines?: string[]
          rge_qualifications_requises?: string[]
          secteur: string
          services_slugs?: string[]
          sous_domaine?: string | null
          unite_mesure?: string | null
          updated_at?: string
          url_fiche_officielle?: string | null
          version_fiche?: string | null
        }
        Update: {
          classique_eligible?: boolean
          code?: string
          coup_de_pouce?: boolean
          coup_de_pouce_charte?: string | null
          created_at?: string
          date_fin_validite?: string | null
          date_publication_arrete?: string | null
          description?: string | null
          domaine?: string
          forfait_base_kwhc?: number | null
          id?: string
          is_active?: boolean
          justificatifs_requis?: Json
          nom?: string
          notes?: string | null
          precarite_eligible?: boolean
          rge_meta_domaines?: string[]
          rge_qualifications_requises?: string[]
          secteur?: string
          services_slugs?: string[]
          sous_domaine?: string | null
          unite_mesure?: string | null
          updated_at?: string
          url_fiche_officielle?: string | null
          version_fiche?: string | null
        }
        Relationships: []
      }
      client_booking_history: {
        Row: {
          artisan_id: string | null
          booked_day_of_week: number | null
          booked_hour: number | null
          booking_id: string | null
          client_email: string
          created_at: string | null
          id: string
          lead_time_days: number | null
          was_no_show: boolean | null
        }
        Insert: {
          artisan_id?: string | null
          booked_day_of_week?: number | null
          booked_hour?: number | null
          booking_id?: string | null
          client_email: string
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          was_no_show?: boolean | null
        }
        Update: {
          artisan_id?: string | null
          booked_day_of_week?: number | null
          booked_hour?: number | null
          booking_id?: string | null
          client_email?: string
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          was_no_show?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'client_booking_history_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_booking_history_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
        ]
      }
      cms_page_versions: {
        Row: {
          change_summary: string | null
          content_html: string | null
          content_json: Json | null
          created_at: string
          created_by: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          page_id: string
          status: string
          structured_data: Json | null
          title: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_id: string
          status: string
          structured_data?: Json | null
          title: string
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_id?: string
          status?: string
          structured_data?: Json | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: 'cms_page_versions_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'cms_pages'
            referencedColumns: ['id']
          },
        ]
      }
      cms_pages: {
        Row: {
          author: string | null
          author_bio: string | null
          canonical_url: string | null
          category: string | null
          content_html: string | null
          content_json: Json | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_active: boolean
          location_slug: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          page_type: string
          published_at: string | null
          published_by: string | null
          read_time: string | null
          service_slug: string | null
          slug: string
          sort_order: number | null
          status: string
          structured_data: Json | null
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author?: string | null
          author_bio?: string | null
          canonical_url?: string | null
          category?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_active?: boolean
          location_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_type: string
          published_at?: string | null
          published_by?: string | null
          read_time?: string | null
          service_slug?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          structured_data?: Json | null
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author?: string | null
          author_bio?: string | null
          canonical_url?: string | null
          category?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_active?: boolean
          location_slug?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_type?: string
          published_at?: string | null
          published_by?: string | null
          read_time?: string | null
          service_slug?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          structured_data?: Json | null
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      coefficients_geo: {
        Row: {
          coefficient: number
          departement: string
          id: string
          label: string
        }
        Insert: {
          coefficient?: number
          departement: string
          id?: string
          label: string
        }
        Update: {
          coefficient?: number
          departement?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          contact_id: string
          created_at: string | null
          id: string
          invoice_id: string | null
          invoiced_at: string | null
          paid_at: string | null
          provider_id: string
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          contact_id: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          invoiced_at?: string | null
          paid_at?: string | null
          provider_id: string
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          contact_id?: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          invoiced_at?: string | null
          paid_at?: string | null
          provider_id?: string
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'commissions_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_invoice_id_fkey'
            columns: ['invoice_id']
            isOneToOne: false
            referencedRelation: 'invoices'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_transaction_id_fkey'
            columns: ['transaction_id']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
          },
        ]
      }
      communes: {
        Row: {
          altitude_moyenne: number | null
          climat_zone: string | null
          code_insee: string
          code_postal: string | null
          created_at: string
          densite_population: number | null
          departement_code: string
          departement_name: string | null
          description: string | null
          enriched_at: string | null
          gentile: string | null
          geo: unknown
          georisques_enriched_at: string | null
          is_active: boolean
          jours_gel_annuels: number | null
          latitude: number | null
          longitude: number | null
          mois_travaux_ext_debut: number | null
          mois_travaux_ext_fin: number | null
          name: string
          nb_artisans_btp: number | null
          nb_artisans_rge: number | null
          nb_catnat: number | null
          nb_dpe_total: number | null
          nb_entreprises_artisanales: number | null
          nb_logements: number | null
          nb_maprimerenov_annuel: number | null
          nb_transactions_annuelles: number | null
          nearest_city_with_providers: string | null
          part_maisons_pct: number | null
          pct_passoires_dpe: number | null
          population: number
          precipitation_annuelle: number | null
          priority_score: number | null
          prix_m2_appartement: number | null
          prix_m2_maison: number | null
          prix_m2_moyen: number | null
          provider_count: number
          region_name: string | null
          revenu_median: number | null
          risque_argile: string | null
          risque_inondation: boolean | null
          risque_radon: number | null
          risques_principaux: string[] | null
          slug: string
          superficie_km2: number | null
          temperature_moyenne_ete: number | null
          temperature_moyenne_hiver: number | null
          updated_at: string
          zone_sismique: number | null
        }
        Insert: {
          altitude_moyenne?: number | null
          climat_zone?: string | null
          code_insee: string
          code_postal?: string | null
          created_at?: string
          densite_population?: number | null
          departement_code: string
          departement_name?: string | null
          description?: string | null
          enriched_at?: string | null
          gentile?: string | null
          geo?: unknown
          georisques_enriched_at?: string | null
          is_active?: boolean
          jours_gel_annuels?: number | null
          latitude?: number | null
          longitude?: number | null
          mois_travaux_ext_debut?: number | null
          mois_travaux_ext_fin?: number | null
          name: string
          nb_artisans_btp?: number | null
          nb_artisans_rge?: number | null
          nb_catnat?: number | null
          nb_dpe_total?: number | null
          nb_entreprises_artisanales?: number | null
          nb_logements?: number | null
          nb_maprimerenov_annuel?: number | null
          nb_transactions_annuelles?: number | null
          nearest_city_with_providers?: string | null
          part_maisons_pct?: number | null
          pct_passoires_dpe?: number | null
          population?: number
          precipitation_annuelle?: number | null
          priority_score?: number | null
          prix_m2_appartement?: number | null
          prix_m2_maison?: number | null
          prix_m2_moyen?: number | null
          provider_count?: number
          region_name?: string | null
          revenu_median?: number | null
          risque_argile?: string | null
          risque_inondation?: boolean | null
          risque_radon?: number | null
          risques_principaux?: string[] | null
          slug: string
          superficie_km2?: number | null
          temperature_moyenne_ete?: number | null
          temperature_moyenne_hiver?: number | null
          updated_at?: string
          zone_sismique?: number | null
        }
        Update: {
          altitude_moyenne?: number | null
          climat_zone?: string | null
          code_insee?: string
          code_postal?: string | null
          created_at?: string
          densite_population?: number | null
          departement_code?: string
          departement_name?: string | null
          description?: string | null
          enriched_at?: string | null
          gentile?: string | null
          geo?: unknown
          georisques_enriched_at?: string | null
          is_active?: boolean
          jours_gel_annuels?: number | null
          latitude?: number | null
          longitude?: number | null
          mois_travaux_ext_debut?: number | null
          mois_travaux_ext_fin?: number | null
          name?: string
          nb_artisans_btp?: number | null
          nb_artisans_rge?: number | null
          nb_catnat?: number | null
          nb_dpe_total?: number | null
          nb_entreprises_artisanales?: number | null
          nb_logements?: number | null
          nb_maprimerenov_annuel?: number | null
          nb_transactions_annuelles?: number | null
          nearest_city_with_providers?: string | null
          part_maisons_pct?: number | null
          pct_passoires_dpe?: number | null
          population?: number
          precipitation_annuelle?: number | null
          priority_score?: number | null
          prix_m2_appartement?: number | null
          prix_m2_maison?: number | null
          prix_m2_moyen?: number | null
          provider_count?: number
          region_name?: string | null
          revenu_median?: number | null
          risque_argile?: string | null
          risque_inondation?: boolean | null
          risque_radon?: number | null
          risques_principaux?: string[] | null
          slug?: string
          superficie_km2?: number | null
          temperature_moyenne_ete?: number | null
          temperature_moyenne_hiver?: number | null
          updated_at?: string
          zone_sismique?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          billed_amount: number | null
          billed_at: string | null
          client_feedback: string | null
          id: string
          is_billed: boolean | null
          lead_id: string
          provider_feedback: string | null
          provider_id: string
          responded_at: string | null
          sent_at: string | null
          status: string | null
          viewed_at: string | null
        }
        Insert: {
          billed_amount?: number | null
          billed_at?: string | null
          client_feedback?: string | null
          id?: string
          is_billed?: boolean | null
          lead_id: string
          provider_feedback?: string | null
          provider_id: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Update: {
          billed_amount?: number | null
          billed_at?: string | null
          client_feedback?: string | null
          id?: string
          is_billed?: boolean | null
          lead_id?: string
          provider_feedback?: string | null
          provider_id?: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contacts_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contacts_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      content_freshness: {
        Row: {
          calculated_at: string | null
          content_updated_at: string | null
          freshness_score: number | null
          id: string
          next_refresh_at: string | null
          page_id: string
          page_type: string
          price_updated_at: string | null
          reviews_updated_at: string | null
          stats_updated_at: string | null
        }
        Insert: {
          calculated_at?: string | null
          content_updated_at?: string | null
          freshness_score?: number | null
          id?: string
          next_refresh_at?: string | null
          page_id: string
          page_type: string
          price_updated_at?: string | null
          reviews_updated_at?: string | null
          stats_updated_at?: string | null
        }
        Update: {
          calculated_at?: string | null
          content_updated_at?: string | null
          freshness_score?: number | null
          id?: string
          next_refresh_at?: string | null
          page_id?: string
          page_type?: string
          price_updated_at?: string | null
          reviews_updated_at?: string | null
          stats_updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          booking_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          provider_id: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          provider_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          provider_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          analytics: boolean
          consent_given_at: string
          functional: boolean
          id: string
          ip_address: string | null
          marketing: boolean
          necessary: boolean
          personalization: boolean
          session_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          consent_given_at?: string
          functional?: boolean
          id?: string
          ip_address?: string | null
          marketing?: boolean
          necessary?: boolean
          personalization?: boolean
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          consent_given_at?: string
          functional?: boolean
          id?: string
          ip_address?: string | null
          marketing?: boolean
          necessary?: boolean
          personalization?: boolean
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cookie_consents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      coverage_zones: {
        Row: {
          center_latitude: number | null
          center_longitude: number | null
          created_at: string | null
          geojson: Json | null
          id: string
          is_active: boolean | null
          min_project_value: number | null
          provider_id: string
          radius_km: number | null
          travel_fee: number | null
          updated_at: string | null
          zone_name: string | null
          zone_type: string | null
        }
        Insert: {
          center_latitude?: number | null
          center_longitude?: number | null
          created_at?: string | null
          geojson?: Json | null
          id?: string
          is_active?: boolean | null
          min_project_value?: number | null
          provider_id: string
          radius_km?: number | null
          travel_fee?: number | null
          updated_at?: string | null
          zone_name?: string | null
          zone_type?: string | null
        }
        Update: {
          center_latitude?: number | null
          center_longitude?: number | null
          created_at?: string | null
          geojson?: Json | null
          id?: string
          is_active?: boolean | null
          min_project_value?: number | null
          provider_id?: string
          radius_km?: number | null
          travel_fee?: number | null
          updated_at?: string | null
          zone_name?: string | null
          zone_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'coverage_zones_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          download_url: string | null
          expires_at: string | null
          format: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          format?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          format?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'data_export_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      data_sources: {
        Row: {
          api_key_encrypted: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_status: string | null
          name: string
          records_synced: number | null
          refresh_frequency_hours: number | null
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name: string
          records_synced?: number | null
          refresh_frequency_hours?: number | null
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name?: string
          records_synced?: number | null
          refresh_frequency_hours?: number | null
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          reason: string | null
          scheduled_deletion_at: string
          status: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          scheduled_deletion_at: string
          status?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          scheduled_deletion_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'deletion_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      devis_abandons: {
        Row: {
          city_slug: string | null
          completed_at: string | null
          created_at: string | null
          email: string
          email_1_sent_at: string | null
          email_2_sent_at: string | null
          email_3_sent_at: string | null
          id: string
          service_slug: string | null
          step_reached: number | null
          unsubscribed: boolean | null
        }
        Insert: {
          city_slug?: string | null
          completed_at?: string | null
          created_at?: string | null
          email: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          service_slug?: string | null
          step_reached?: number | null
          unsubscribed?: boolean | null
        }
        Update: {
          city_slug?: string | null
          completed_at?: string | null
          created_at?: string | null
          email?: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          service_slug?: string | null
          step_reached?: number | null
          unsubscribed?: boolean | null
        }
        Relationships: []
      }
      devis_requests: {
        Row: {
          budget: string | null
          cee_eligible: boolean
          cee_operation_codes: string[]
          cee_qualified_at: string | null
          city: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string
          created_at: string
          description: string
          id: string
          pipedrive_deal_id: number | null
          pipedrive_person_id: number | null
          pipedrive_sync_attempts: number
          pipedrive_sync_error: string | null
          pipedrive_synced_at: string | null
          postal_code: string
          service_id: string | null
          service_name: string
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          budget?: string | null
          cee_eligible?: boolean
          cee_operation_codes?: string[]
          cee_qualified_at?: string | null
          city?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone: string
          created_at?: string
          description: string
          id?: string
          pipedrive_deal_id?: number | null
          pipedrive_person_id?: number | null
          pipedrive_sync_attempts?: number
          pipedrive_sync_error?: string | null
          pipedrive_synced_at?: string | null
          postal_code: string
          service_id?: string | null
          service_name: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          budget?: string | null
          cee_eligible?: boolean
          cee_operation_codes?: string[]
          cee_qualified_at?: string | null
          city?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string
          id?: string
          pipedrive_deal_id?: number | null
          pipedrive_person_id?: number | null
          pipedrive_sync_attempts?: number
          pipedrive_sync_error?: string | null
          pipedrive_synced_at?: string | null
          postal_code?: string
          service_id?: string | null
          service_name?: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: 'devis_requests_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'devis_requests_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      estimation_leads: {
        Row: {
          artisan_public_id: string | null
          conversation_history: Json | null
          created_at: string | null
          departement: string
          description_projet: string | null
          email: string | null
          estimation_max: number | null
          estimation_min: number | null
          id: string
          metier: string
          nom: string | null
          page_url: string | null
          source: string
          telephone: string
          ville: string
        }
        Insert: {
          artisan_public_id?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          departement: string
          description_projet?: string | null
          email?: string | null
          estimation_max?: number | null
          estimation_min?: number | null
          id?: string
          metier: string
          nom?: string | null
          page_url?: string | null
          source?: string
          telephone: string
          ville: string
        }
        Update: {
          artisan_public_id?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          departement?: string
          description_projet?: string | null
          email?: string | null
          estimation_max?: number | null
          estimation_min?: number | null
          id?: string
          metier?: string
          nom?: string | null
          page_url?: string | null
          source?: string
          telephone?: string
          ville?: string
        }
        Relationships: []
      }
      gdpr_access_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          processed_at: string | null
          request_type: string
          requester_email: string
          requester_name: string
          siret: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          processed_at?: string | null
          request_type: string
          requester_email: string
          requester_name: string
          siret?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          processed_at?: string | null
          request_type?: string
          requester_email?: string
          requester_name?: string
          siret?: string | null
          status?: string
        }
        Relationships: []
      }
      gift_card_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          gift_card_id: string
          id: string
          type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          gift_card_id: string
          id?: string
          type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          gift_card_id?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gift_card_transactions_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gift_card_transactions_gift_card_id_fkey'
            columns: ['gift_card_id']
            isOneToOne: false
            referencedRelation: 'gift_cards'
            referencedColumns: ['id']
          },
        ]
      }
      gift_cards: {
        Row: {
          amount: number
          artisan_id: string | null
          balance: number
          code: string
          created_at: string | null
          id: string
          last_used_at: string | null
          message: string | null
          recipient_email: string
          recipient_name: string
          sender_email: string
          sender_name: string | null
          status: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          artisan_id?: string | null
          balance: number
          code: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          message?: string | null
          recipient_email: string
          recipient_name: string
          sender_email: string
          sender_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          artisan_id?: string | null
          balance?: number
          code?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          message?: string | null
          recipient_email?: string
          recipient_name?: string
          sender_email?: string
          sender_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'gift_cards_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expiry_date: string
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expiry_date: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expiry_date?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'google_calendar_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      googlebot_analysis: {
        Row: {
          crawls_per_day: Json
          created_at: string
          hourly_distribution: Json
          id: number
          logs_purged: number
          never_crawled_sample: Json
          page_type_distribution: Json
          period_end: string
          period_start: string
          status_code_distribution: Json
          top_pages: Json
          total_crawls: number
          user_agent_distribution: Json
        }
        Insert: {
          crawls_per_day?: Json
          created_at?: string
          hourly_distribution?: Json
          id?: never
          logs_purged?: number
          never_crawled_sample?: Json
          page_type_distribution?: Json
          period_end: string
          period_start: string
          status_code_distribution?: Json
          top_pages?: Json
          total_crawls?: number
          user_agent_distribution?: Json
        }
        Update: {
          crawls_per_day?: Json
          created_at?: string
          hourly_distribution?: Json
          id?: never
          logs_purged?: number
          never_crawled_sample?: Json
          page_type_distribution?: Json
          period_end?: string
          period_start?: string
          status_code_distribution?: Json
          top_pages?: Json
          total_crawls?: number
          user_agent_distribution?: Json
        }
        Relationships: []
      }
      googlebot_logs: {
        Row: {
          created_at: string
          id: number
          status: number | null
          url: string
          user_agent: string
        }
        Insert: {
          created_at?: string
          id?: never
          status?: number | null
          url: string
          user_agent: string
        }
        Update: {
          created_at?: string
          id?: never
          status?: number | null
          url?: string
          user_agent?: string
        }
        Relationships: []
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_items: number | null
          error_items: number | null
          error_log: Json | null
          id: string
          job_type: string
          last_cursor: string | null
          last_error: string | null
          params: Json | null
          processed_items: number | null
          skipped_items: number | null
          started_at: string | null
          status: string
          total_items: number | null
          updated_at: string
          updated_items: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_items?: number | null
          error_items?: number | null
          error_log?: Json | null
          id?: string
          job_type: string
          last_cursor?: string | null
          last_error?: string | null
          params?: Json | null
          processed_items?: number | null
          skipped_items?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          updated_items?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_items?: number | null
          error_items?: number | null
          error_log?: Json | null
          id?: string
          job_type?: string
          last_cursor?: string | null
          last_error?: string | null
          params?: Json | null
          processed_items?: number | null
          skipped_items?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          updated_items?: number | null
        }
        Relationships: []
      }
      indexation_status: {
        Row: {
          bing_indexed: boolean | null
          bing_indexed_at: string | null
          checked_at: string | null
          google_indexed: boolean | null
          google_indexed_at: string | null
          google_last_crawl_at: string | null
          id: string
          indexation_request_status: string | null
          indexation_requested_at: string | null
          page_id: string
        }
        Insert: {
          bing_indexed?: boolean | null
          bing_indexed_at?: string | null
          checked_at?: string | null
          google_indexed?: boolean | null
          google_indexed_at?: string | null
          google_last_crawl_at?: string | null
          id?: string
          indexation_request_status?: string | null
          indexation_requested_at?: string | null
          page_id: string
        }
        Update: {
          bing_indexed?: boolean | null
          bing_indexed_at?: string | null
          checked_at?: string | null
          google_indexed?: boolean | null
          google_indexed_at?: string | null
          google_last_crawl_at?: string | null
          id?: string
          indexation_request_status?: string | null
          indexation_requested_at?: string | null
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'indexation_status_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'indexation_status_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      internal_links: {
        Row: {
          anchor_text: string | null
          created_at: string | null
          id: string
          is_prominent: boolean | null
          link_type: string | null
          position_in_content: number | null
          source_page_id: string
          target_page_id: string
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string | null
          id?: string
          is_prominent?: boolean | null
          link_type?: string | null
          position_in_content?: number | null
          source_page_id: string
          target_page_id: string
        }
        Update: {
          anchor_text?: string | null
          created_at?: string | null
          id?: string
          is_prominent?: boolean | null
          link_type?: string | null
          position_in_content?: number | null
          source_page_id?: string
          target_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'internal_links_source_page_id_fkey'
            columns: ['source_page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'internal_links_source_page_id_fkey'
            columns: ['source_page_id']
            isOneToOne: false
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
          {
            foreignKeyName: 'internal_links_target_page_id_fkey'
            columns: ['target_page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'internal_links_target_page_id_fkey'
            columns: ['target_page_id']
            isOneToOne: false
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          due_at: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          paid_at: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          provider_id: string
          status: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          provider_id: string
          status?: string | null
          subtotal: number
          tax_amount: number
          tax_rate?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          provider_id?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'invoices_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_at: string
          distance_km: number | null
          id: string
          lead_id: string
          position: number | null
          provider_id: string
          score: number | null
          source_table: string
          status: string
          viewed_at: string | null
        }
        Insert: {
          assigned_at?: string
          distance_km?: number | null
          id?: string
          lead_id: string
          position?: number | null
          provider_id: string
          score?: number | null
          source_table?: string
          status?: string
          viewed_at?: string | null
        }
        Update: {
          assigned_at?: string
          distance_km?: number | null
          id?: string
          lead_id?: string
          position?: number | null
          provider_id?: string
          score?: number | null
          source_table?: string
          status?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'lead_assignments_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'devis_requests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_assignments_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lead_id: string
          metadata: Json
          provider_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json
          provider_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'lead_events_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          client_user_id: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          description: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          location_id: string | null
          phone: string
          project_address: string | null
          project_city: string | null
          project_postal_code: string | null
          service_id: string | null
          source: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          client_user_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          location_id?: string | null
          phone: string
          project_address?: string | null
          project_city?: string | null
          project_postal_code?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          client_user_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location_id?: string | null
          phone?: string
          project_address?: string | null
          project_city?: string | null
          project_postal_code?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'leads_client_user_id_fkey'
            columns: ['client_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      location_stats: {
        Row: {
          avg_price: number | null
          avg_rating: number | null
          avg_response_time_hours: number | null
          calculated_at: string | null
          id: string
          lead_count_month: number | null
          location_id: string
          period_end: string | null
          period_start: string | null
          provider_count: number | null
          review_count: number | null
          search_count_month: number | null
          service_id: string | null
          verified_provider_count: number | null
        }
        Insert: {
          avg_price?: number | null
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          calculated_at?: string | null
          id?: string
          lead_count_month?: number | null
          location_id: string
          period_end?: string | null
          period_start?: string | null
          provider_count?: number | null
          review_count?: number | null
          search_count_month?: number | null
          service_id?: string | null
          verified_provider_count?: number | null
        }
        Update: {
          avg_price?: number | null
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          calculated_at?: string | null
          id?: string
          lead_count_month?: number | null
          location_id?: string
          period_end?: string | null
          period_start?: string | null
          provider_count?: number | null
          review_count?: number | null
          search_count_month?: number | null
          service_id?: string | null
          verified_provider_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'location_stats_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'location_stats_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      locations: {
        Row: {
          area_km2: number | null
          created_at: string | null
          density: number | null
          department_code: string | null
          department_name: string | null
          housing_count: number | null
          id: string
          insee_code: string | null
          insee_updated_at: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          median_income: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          population: number | null
          population_year: number | null
          postal_code: string | null
          region_code: string | null
          region_name: string | null
          slug: string
          unemployment_rate: number | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          created_at?: string | null
          density?: number | null
          department_code?: string | null
          department_name?: string | null
          housing_count?: number | null
          id?: string
          insee_code?: string | null
          insee_updated_at?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          median_income?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          population?: number | null
          population_year?: number | null
          postal_code?: string | null
          region_code?: string | null
          region_name?: string | null
          slug: string
          unemployment_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          created_at?: string | null
          density?: number | null
          department_code?: string | null
          department_name?: string | null
          housing_count?: number | null
          id?: string
          insee_code?: string | null
          insee_updated_at?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          median_income?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          population?: number | null
          population_year?: number | null
          postal_code?: string | null
          region_code?: string | null
          region_name?: string | null
          slug?: string
          unemployment_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          artisan_id: string
          booking_id: string | null
          client_email: string
          client_name: string | null
          created_at: string | null
          id: string
          points: number
          reason: string | null
        }
        Insert: {
          artisan_id: string
          booking_id?: string | null
          client_email: string
          client_name?: string | null
          created_at?: string | null
          id?: string
          points: number
          reason?: string | null
        }
        Update: {
          artisan_id?: string
          booking_id?: string | null
          client_email?: string
          client_name?: string | null
          created_at?: string | null
          id?: string
          points?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'loyalty_points_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loyalty_points_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_read: boolean | null
          reply_to_message_id: string | null
          rich_content: Json | null
          search_vector: unknown
          sender_id: string | null
          sender_type: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          reply_to_message_id?: string | null
          rich_content?: Json | null
          search_vector?: unknown
          sender_id?: string | null
          sender_type?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          reply_to_message_id?: string | null
          rich_content?: Json | null
          search_vector?: unknown
          sender_id?: string | null
          sender_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
        ]
      }
      meta_tags: {
        Row: {
          created_at: string | null
          id: string
          page_id: string
          tag_content: string
          tag_name: string
          tag_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_id: string
          tag_content: string
          tag_name: string
          tag_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_id?: string
          tag_content?: string
          tag_name?: string
          tag_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'meta_tags_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meta_tags_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      notification_deliveries: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          event_id: string
          id: string
          recipient_id: string
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          event_id: string
          id?: string
          recipient_id: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          id?: string
          recipient_id?: string
          status?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          booking_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status: string
          type: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_logs_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          provider: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'oauth_states_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      page_quality_scores: {
        Row: {
          calculated_at: string | null
          id: string
          index_status: string | null
          insee_data_score: number | null
          next_review_at: string | null
          page_id: string
          previous_score: number | null
          prices_score: number | null
          provider_count_score: number | null
          qa_score: number | null
          reviews_score: number | null
          score_trend: string | null
          total_score: number | null
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          index_status?: string | null
          insee_data_score?: number | null
          next_review_at?: string | null
          page_id: string
          previous_score?: number | null
          prices_score?: number | null
          provider_count_score?: number | null
          qa_score?: number | null
          reviews_score?: number | null
          score_trend?: string | null
          total_score?: number | null
        }
        Update: {
          calculated_at?: string | null
          id?: string
          index_status?: string | null
          insee_data_score?: number | null
          next_review_at?: string | null
          page_id?: string
          previous_score?: number | null
          prices_score?: number | null
          provider_count_score?: number | null
          qa_score?: number | null
          reviews_score?: number | null
          score_trend?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'page_quality_scores_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'page_quality_scores_page_id_fkey'
            columns: ['page_id']
            isOneToOne: true
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      pages: {
        Row: {
          canonical_url: string | null
          content_hash: string | null
          created_at: string | null
          h1: string | null
          id: string
          indexed_at: string | null
          is_indexed: boolean | null
          location_id: string | null
          meta_description: string | null
          page_type: string
          provider_id: string | null
          published_at: string | null
          service_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          url_path: string
          word_count: number | null
        }
        Insert: {
          canonical_url?: string | null
          content_hash?: string | null
          created_at?: string | null
          h1?: string | null
          id?: string
          indexed_at?: string | null
          is_indexed?: boolean | null
          location_id?: string | null
          meta_description?: string | null
          page_type: string
          provider_id?: string | null
          published_at?: string | null
          service_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url_path: string
          word_count?: number | null
        }
        Update: {
          canonical_url?: string | null
          content_hash?: string | null
          created_at?: string | null
          h1?: string | null
          id?: string
          indexed_at?: string | null
          is_indexed?: boolean | null
          location_id?: string | null
          meta_description?: string | null
          page_type?: string
          provider_id?: string | null
          published_at?: string | null
          service_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url_path?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'pages_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pages_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pages_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      portfolio_items: {
        Row: {
          after_image_url: string | null
          artisan_id: string
          before_image_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          file_size: number | null
          id: string
          image_url: string
          is_featured: boolean | null
          is_visible: boolean | null
          media_type: string | null
          mime_type: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          after_image_url?: string | null
          artisan_id: string
          before_image_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          media_type?: string | null
          mime_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          after_image_url?: string | null
          artisan_id?: string
          before_image_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_size?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          media_type?: string | null
          mime_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'portfolio_items_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      prestations_tarifs: {
        Row: {
          created_at: string | null
          fiabilite: number | null
          id: string
          metier: string
          prestation: string
          prix_max: number
          prix_min: number
          source: string | null
          unite: string
        }
        Insert: {
          created_at?: string | null
          fiabilite?: number | null
          id?: string
          metier: string
          prestation: string
          prix_max: number
          prix_min: number
          source?: string | null
          unite?: string
        }
        Update: {
          created_at?: string | null
          fiabilite?: number | null
          id?: string
          metier?: string
          prestation?: string
          prix_max?: number
          prix_min?: number
          source?: string | null
          unite?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          created_at: string | null
          id: string
          location_id: string | null
          period_end: string
          period_start: string
          period_type: string
          price_avg: number | null
          price_max: number | null
          price_median: number | null
          price_min: number | null
          price_unit: string | null
          sample_size: number | null
          service_id: string
          variation_vs_previous: number | null
          variation_vs_year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          period_end: string
          period_start: string
          period_type: string
          price_avg?: number | null
          price_max?: number | null
          price_median?: number | null
          price_min?: number | null
          price_unit?: string | null
          sample_size?: number | null
          service_id: string
          variation_vs_previous?: number | null
          variation_vs_year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          price_avg?: number | null
          price_max?: number | null
          price_median?: number | null
          price_min?: number | null
          price_unit?: string | null
          sample_size?: number | null
          service_id?: string
          variation_vs_previous?: number | null
          variation_vs_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'price_history_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'price_history_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          google_calendar_connected: boolean | null
          id: string
          is_admin: boolean | null
          phone: string | null
          postal_code: string | null
          role: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          google_calendar_connected?: boolean | null
          id: string
          is_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          google_calendar_connected?: boolean | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prospection_ai_settings: {
        Row: {
          artisan_system_prompt: string | null
          auto_reply_enabled: boolean | null
          claude_api_key_set: boolean | null
          claude_max_tokens: number | null
          claude_model: string | null
          claude_temperature: number | null
          client_system_prompt: string | null
          default_provider: string
          escalation_keywords: string[] | null
          id: string
          mairie_system_prompt: string | null
          max_auto_replies: number | null
          openai_api_key_set: boolean | null
          openai_max_tokens: number | null
          openai_model: string | null
          openai_temperature: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          artisan_system_prompt?: string | null
          auto_reply_enabled?: boolean | null
          claude_api_key_set?: boolean | null
          claude_max_tokens?: number | null
          claude_model?: string | null
          claude_temperature?: number | null
          client_system_prompt?: string | null
          default_provider?: string
          escalation_keywords?: string[] | null
          id?: string
          mairie_system_prompt?: string | null
          max_auto_replies?: number | null
          openai_api_key_set?: boolean | null
          openai_max_tokens?: number | null
          openai_model?: string | null
          openai_temperature?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          artisan_system_prompt?: string | null
          auto_reply_enabled?: boolean | null
          claude_api_key_set?: boolean | null
          claude_max_tokens?: number | null
          claude_model?: string | null
          claude_temperature?: number | null
          client_system_prompt?: string | null
          default_provider?: string
          escalation_keywords?: string[] | null
          id?: string
          mairie_system_prompt?: string | null
          max_auto_replies?: number | null
          openai_api_key_set?: boolean | null
          openai_max_tokens?: number | null
          openai_model?: string | null
          openai_temperature?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      prospection_campaigns: {
        Row: {
          ab_split_percent: number | null
          ab_test_enabled: boolean | null
          ab_variant_b_template_id: string | null
          actual_cost: number | null
          ai_auto_reply: boolean | null
          ai_max_tokens: number | null
          ai_model: string | null
          ai_provider: string | null
          ai_system_prompt: string | null
          ai_temperature: number | null
          audience_type: string
          batch_delay_ms: number | null
          batch_size: number | null
          channel: string
          clicked_count: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          daily_send_limit: number | null
          delivered_count: number | null
          description: string | null
          estimated_cost: number | null
          failed_count: number | null
          id: string
          list_id: string | null
          name: string
          opened_count: number | null
          opted_out_count: number | null
          paused_at: string | null
          replied_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          template_id: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          ab_split_percent?: number | null
          ab_test_enabled?: boolean | null
          ab_variant_b_template_id?: string | null
          actual_cost?: number | null
          ai_auto_reply?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_provider?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          audience_type: string
          batch_delay_ms?: number | null
          batch_size?: number | null
          channel: string
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          daily_send_limit?: number | null
          delivered_count?: number | null
          description?: string | null
          estimated_cost?: number | null
          failed_count?: number | null
          id?: string
          list_id?: string | null
          name: string
          opened_count?: number | null
          opted_out_count?: number | null
          paused_at?: string | null
          replied_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          ab_split_percent?: number | null
          ab_test_enabled?: boolean | null
          ab_variant_b_template_id?: string | null
          actual_cost?: number | null
          ai_auto_reply?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_provider?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          audience_type?: string
          batch_delay_ms?: number | null
          batch_size?: number | null
          channel?: string
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          daily_send_limit?: number | null
          delivered_count?: number | null
          description?: string | null
          estimated_cost?: number | null
          failed_count?: number | null
          id?: string
          list_id?: string | null
          name?: string
          opened_count?: number | null
          opted_out_count?: number | null
          paused_at?: string | null
          replied_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prospection_campaigns_ab_variant_b_template_id_fkey'
            columns: ['ab_variant_b_template_id']
            isOneToOne: false
            referencedRelation: 'prospection_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prospection_campaigns_list_id_fkey'
            columns: ['list_id']
            isOneToOne: false
            referencedRelation: 'prospection_lists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prospection_campaigns_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'prospection_templates'
            referencedColumns: ['id']
          },
        ]
      }
      prospection_contacts: {
        Row: {
          address: string | null
          artisan_id: string | null
          city: string | null
          commune_code: string | null
          company_name: string | null
          consent_status: string | null
          contact_name: string | null
          contact_type: string
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string | null
          email_canonical: string | null
          id: string
          is_active: boolean
          opted_out_at: string | null
          phone: string | null
          phone_e164: string | null
          population: number | null
          postal_code: string | null
          region: string | null
          source: string
          source_file: string | null
          source_row: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          artisan_id?: string | null
          city?: string | null
          commune_code?: string | null
          company_name?: string | null
          consent_status?: string | null
          contact_name?: string | null
          contact_type: string
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          email_canonical?: string | null
          id?: string
          is_active?: boolean
          opted_out_at?: string | null
          phone?: string | null
          phone_e164?: string | null
          population?: number | null
          postal_code?: string | null
          region?: string | null
          source?: string
          source_file?: string | null
          source_row?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          artisan_id?: string | null
          city?: string | null
          commune_code?: string | null
          company_name?: string | null
          consent_status?: string | null
          contact_name?: string | null
          contact_type?: string
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          email_canonical?: string | null
          id?: string
          is_active?: boolean
          opted_out_at?: string | null
          phone?: string | null
          phone_e164?: string | null
          population?: number | null
          postal_code?: string | null
          region?: string | null
          source?: string
          source_file?: string | null
          source_row?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prospection_contacts_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      prospection_conversation_messages: {
        Row: {
          ai_completion_tokens: number | null
          ai_cost: number | null
          ai_model: string | null
          ai_prompt_tokens: number | null
          ai_provider: string | null
          content: string
          conversation_id: string
          created_at: string
          direction: string
          external_id: string | null
          id: string
          sender_type: string
        }
        Insert: {
          ai_completion_tokens?: number | null
          ai_cost?: number | null
          ai_model?: string | null
          ai_prompt_tokens?: number | null
          ai_provider?: string | null
          content: string
          conversation_id: string
          created_at?: string
          direction: string
          external_id?: string | null
          id?: string
          sender_type: string
        }
        Update: {
          ai_completion_tokens?: number | null
          ai_cost?: number | null
          ai_model?: string | null
          ai_prompt_tokens?: number | null
          ai_provider?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          external_id?: string | null
          id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prospection_conversation_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'prospection_conversations'
            referencedColumns: ['id']
          },
        ]
      }
      prospection_conversations: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          ai_replies_count: number | null
          assigned_to: string | null
          campaign_id: string | null
          channel: string
          contact_id: string
          created_at: string
          id: string
          last_message_at: string | null
          message_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          ai_replies_count?: number | null
          assigned_to?: string | null
          campaign_id?: string | null
          channel: string
          contact_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          ai_replies_count?: number | null
          assigned_to?: string | null
          campaign_id?: string | null
          channel?: string
          contact_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prospection_conversations_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'prospection_campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prospection_conversations_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'prospection_contacts'
            referencedColumns: ['id']
          },
        ]
      }
      prospection_list_members: {
        Row: {
          added_at: string
          contact_id: string
          list_id: string
        }
        Insert: {
          added_at?: string
          contact_id: string
          list_id: string
        }
        Update: {
          added_at?: string
          contact_id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prospection_list_members_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'prospection_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prospection_list_members_list_id_fkey'
            columns: ['list_id']
            isOneToOne: false
            referencedRelation: 'prospection_lists'
            referencedColumns: ['id']
          },
        ]
      }
      prospection_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          filter_criteria: Json | null
          id: string
          list_type: string
          name: string
          updated_at: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: string
          name: string
          updated_at?: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospection_messages: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_02: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_03: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_04: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_05: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_06: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_07: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_08: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_09: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_10: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_11: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2026_12: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_2027_01: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_messages_default: {
        Row: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          ab_variant?: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          ab_variant?: string | null
          campaign_id?: string
          channel?: string
          contact_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          queued_at?: string
          read_at?: string | null
          rendered_body?: string | null
          rendered_subject?: string | null
          replied_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      prospection_templates: {
        Row: {
          ai_context: Json | null
          ai_system_prompt: string | null
          audience_type: string | null
          body: string
          channel: string
          created_at: string
          created_by: string | null
          html_body: string | null
          id: string
          is_active: boolean
          name: string
          subject: string | null
          updated_at: string
          variables: string[] | null
          whatsapp_approved: boolean | null
          whatsapp_template_name: string | null
          whatsapp_template_sid: string | null
        }
        Insert: {
          ai_context?: Json | null
          ai_system_prompt?: string | null
          audience_type?: string | null
          body: string
          channel: string
          created_at?: string
          created_by?: string | null
          html_body?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
          whatsapp_approved?: boolean | null
          whatsapp_template_name?: string | null
          whatsapp_template_sid?: string | null
        }
        Update: {
          ai_context?: Json | null
          ai_system_prompt?: string | null
          audience_type?: string | null
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          html_body?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
          whatsapp_approved?: boolean | null
          whatsapp_template_name?: string | null
          whatsapp_template_sid?: string | null
        }
        Relationships: []
      }
      provider_claims: {
        Row: {
          claimant_email: string | null
          claimant_name: string | null
          claimant_phone: string | null
          claimant_position: string | null
          created_at: string
          id: string
          provider_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          siret_provided: string
          status: string
          user_id: string | null
        }
        Insert: {
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_position?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          siret_provided: string
          status?: string
          user_id?: string | null
        }
        Update: {
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_position?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          siret_provided?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_claims_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_claims_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_claims_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      provider_directors: {
        Row: {
          created_at: string
          date_naissance: string | null
          fetched_at: string | null
          fonction: string | null
          id: string
          nationalite: string | null
          nom: string
          prenom: string | null
          provider_id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          date_naissance?: string | null
          fetched_at?: string | null
          fonction?: string | null
          id?: string
          nationalite?: string | null
          nom: string
          prenom?: string | null
          provider_id: string
          source?: string | null
        }
        Update: {
          created_at?: string
          date_naissance?: string | null
          fetched_at?: string | null
          fonction?: string | null
          id?: string
          nationalite?: string | null
          nom?: string
          prenom?: string | null
          provider_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_directors_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_features: {
        Row: {
          created_at: string | null
          display_order: number | null
          expires_at: string | null
          feature_name: string
          feature_type: string
          feature_value: string | null
          icon: string | null
          id: string
          is_verified: boolean | null
          proof_url: string | null
          provider_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          feature_name: string
          feature_type: string
          feature_value?: string | null
          icon?: string | null
          id?: string
          is_verified?: boolean | null
          proof_url?: string | null
          provider_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          feature_name?: string
          feature_type?: string
          feature_value?: string | null
          icon?: string | null
          id?: string
          is_verified?: boolean | null
          proof_url?: string | null
          provider_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_features_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_financials: {
        Row: {
          annee: number
          chiffre_affaires: number | null
          created_at: string
          effectif: string | null
          fetched_at: string | null
          id: string
          provider_id: string
          resultat_net: number | null
          source: string | null
        }
        Insert: {
          annee: number
          chiffre_affaires?: number | null
          created_at?: string
          effectif?: string | null
          fetched_at?: string | null
          id?: string
          provider_id: string
          resultat_net?: number | null
          source?: string | null
        }
        Update: {
          annee?: number
          chiffre_affaires?: number | null
          created_at?: string
          effectif?: string | null
          fetched_at?: string | null
          id?: string
          provider_id?: string
          resultat_net?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_financials_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_locations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          location_id: string
          provider_id: string
          radius_km: number | null
          travel_fee: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id: string
          provider_id: string
          radius_km?: number | null
          travel_fee?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          location_id?: string
          provider_id?: string
          radius_km?: number | null
          travel_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_locations_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_locations_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_removal_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          provider_id: string
          reason: string | null
          requester_email: string
          requester_name: string
          siret: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id: string
          reason?: string | null
          requester_email: string
          requester_name: string
          siret: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_id?: string
          reason?: string | null
          requester_email?: string
          requester_name?: string
          siret?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'provider_removal_requests_processed_by_fkey'
            columns: ['processed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_removal_requests_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_scores: {
        Row: {
          badges: Json | null
          calculated_at: string | null
          communication_score: number | null
          completion_rate: number | null
          id: string
          overall_score: number | null
          price_score: number | null
          provider_id: string
          quality_score: number | null
          reliability_score: number | null
          repeat_client_rate: number | null
          response_rate: number | null
          response_time_avg: number | null
        }
        Insert: {
          badges?: Json | null
          calculated_at?: string | null
          communication_score?: number | null
          completion_rate?: number | null
          id?: string
          overall_score?: number | null
          price_score?: number | null
          provider_id: string
          quality_score?: number | null
          reliability_score?: number | null
          repeat_client_rate?: number | null
          response_rate?: number | null
          response_time_avg?: number | null
        }
        Update: {
          badges?: Json | null
          calculated_at?: string | null
          communication_score?: number | null
          completion_rate?: number | null
          id?: string
          overall_score?: number | null
          price_score?: number | null
          provider_id?: string
          quality_score?: number | null
          reliability_score?: number | null
          repeat_client_rate?: number | null
          response_rate?: number | null
          response_time_avg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_scores_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: true
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      provider_services: {
        Row: {
          created_at: string | null
          experience_years: number | null
          id: string
          is_primary: boolean | null
          price_max: number | null
          price_min: number | null
          price_unit: string | null
          provider_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_primary?: boolean | null
          price_max?: number | null
          price_min?: number | null
          price_unit?: string | null
          provider_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_primary?: boolean | null
          price_max?: number | null
          price_min?: number | null
          price_unit?: string | null
          provider_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'provider_services_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_services_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      provider_sitemap_urls: {
        Row: {
          batch_id: number
          id: number
          lastmod: string | null
          provider_id: string
          refreshed_at: string
          snapshot_id: number
          url: string
        }
        Insert: {
          batch_id: number
          id?: number
          lastmod?: string | null
          provider_id: string
          refreshed_at?: string
          snapshot_id: number
          url: string
        }
        Update: {
          batch_id?: number
          id?: number
          lastmod?: string | null
          provider_id?: string
          refreshed_at?: string
          snapshot_id?: number
          url?: string
        }
        Relationships: []
      }
      provider_stats: {
        Row: {
          avg_rating: number | null
          avg_response_time_hours: number | null
          calculated_at: string | null
          click_count: number | null
          conversion_rate: number | null
          id: string
          lead_count: number | null
          period_end: string
          period_start: string
          provider_id: string
          response_rate: number | null
          review_count: number | null
          view_count: number | null
        }
        Insert: {
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          calculated_at?: string | null
          click_count?: number | null
          conversion_rate?: number | null
          id?: string
          lead_count?: number | null
          period_end: string
          period_start: string
          provider_id: string
          response_rate?: number | null
          review_count?: number | null
          view_count?: number | null
        }
        Update: {
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          calculated_at?: string | null
          click_count?: number | null
          conversion_rate?: number | null
          id?: string
          lead_count?: number | null
          period_end?: string
          period_start?: string
          provider_id?: string
          response_rate?: number | null
          review_count?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'provider_stats_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      providers: {
        Row: {
          address_city: string | null
          address_department: string | null
          address_postal_code: string | null
          address_region: string | null
          address_street: string | null
          annual_revenue: number | null
          avatar_url: string | null
          capital: number | null
          claimed_at: string | null
          claimed_by: string | null
          code_naf: string | null
          created_at: string | null
          creation_date: string | null
          data_quality_flags: Json | null
          data_quality_score: number | null
          date_radiation: string | null
          derniere_maj_api: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          id: string
          is_active: boolean | null
          is_artisan: boolean | null
          is_verified: boolean | null
          last_lead_assigned_at: string | null
          latitude: number | null
          legal_form: string | null
          legal_form_code: string | null
          libelle_naf: string | null
          location: unknown
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          noindex: boolean
          phone: string | null
          phone_source: string | null
          rating_average: number | null
          review_count: number | null
          rge_last_synced_at: string | null
          rge_organismes: string[] | null
          rge_qualifications: Json | null
          rge_source_url: string | null
          rge_valid_until: string | null
          scraped_at: string | null
          search_vector: unknown
          siren: string | null
          siret: string | null
          slug: string
          source: string | null
          source_api: string | null
          source_id: string | null
          specialty: string | null
          stable_id: string
          updated_at: string | null
          user_id: string | null
          verification_date: string | null
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_department?: string | null
          address_postal_code?: string | null
          address_region?: string | null
          address_street?: string | null
          annual_revenue?: number | null
          avatar_url?: string | null
          capital?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          code_naf?: string | null
          created_at?: string | null
          creation_date?: string | null
          data_quality_flags?: Json | null
          data_quality_score?: number | null
          date_radiation?: string | null
          derniere_maj_api?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          is_active?: boolean | null
          is_artisan?: boolean | null
          is_verified?: boolean | null
          last_lead_assigned_at?: string | null
          latitude?: number | null
          legal_form?: string | null
          legal_form_code?: string | null
          libelle_naf?: string | null
          location?: unknown
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          noindex?: boolean
          phone?: string | null
          phone_source?: string | null
          rating_average?: number | null
          review_count?: number | null
          rge_last_synced_at?: string | null
          rge_organismes?: string[] | null
          rge_qualifications?: Json | null
          rge_source_url?: string | null
          rge_valid_until?: string | null
          scraped_at?: string | null
          search_vector?: unknown
          siren?: string | null
          siret?: string | null
          slug: string
          source?: string | null
          source_api?: string | null
          source_id?: string | null
          specialty?: string | null
          stable_id: string
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_department?: string | null
          address_postal_code?: string | null
          address_region?: string | null
          address_street?: string | null
          annual_revenue?: number | null
          avatar_url?: string | null
          capital?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          code_naf?: string | null
          created_at?: string | null
          creation_date?: string | null
          data_quality_flags?: Json | null
          data_quality_score?: number | null
          date_radiation?: string | null
          derniere_maj_api?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          is_active?: boolean | null
          is_artisan?: boolean | null
          is_verified?: boolean | null
          last_lead_assigned_at?: string | null
          latitude?: number | null
          legal_form?: string | null
          legal_form_code?: string | null
          libelle_naf?: string | null
          location?: unknown
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          noindex?: boolean
          phone?: string | null
          phone_source?: string | null
          rating_average?: number | null
          review_count?: number | null
          rge_last_synced_at?: string | null
          rge_organismes?: string[] | null
          rge_qualifications?: Json | null
          rge_source_url?: string | null
          rge_valid_until?: string | null
          scraped_at?: string | null
          search_vector?: unknown
          siren?: string | null
          siret?: string | null
          slug?: string
          source?: string | null
          source_api?: string | null
          source_id?: string | null
          specialty?: string | null
          stable_id?: string
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'providers_claimed_by_fkey'
            columns: ['claimed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      questions: {
        Row: {
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          location_id: string | null
          moderated_at: string | null
          provider_id: string | null
          service_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          location_id?: string | null
          moderated_at?: string | null
          provider_id?: string | null
          service_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          location_id?: string | null
          moderated_at?: string | null
          provider_id?: string | null
          service_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'questions_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'questions_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'questions_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          provider_id: string
          request_id: string
          status: string
          updated_at: string
          valid_until: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          provider_id: string
          request_id: string
          status?: string
          updated_at?: string
          valid_until: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          provider_id?: string
          request_id?: string
          status?: string
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quotes_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quotes_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'devis_requests'
            referencedColumns: ['id']
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string | null
          expires_at: string | null
          hit_count: number | null
          id: string
          is_active: boolean | null
          last_hit_at: string | null
          reason: string | null
          redirect_type: number | null
          source_path: string
          target_path: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          last_hit_at?: string | null
          reason?: string | null
          redirect_type?: number | null
          source_path: string
          target_path: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          last_hit_at?: string | null
          reason?: string | null
          redirect_type?: number | null
          source_path?: string
          target_path?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          voter_fingerprint: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id: string
          voter_fingerprint: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          voter_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: 'review_votes_review_id_fkey'
            columns: ['review_id']
            isOneToOne: false
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          authenticity_score: number | null
          author_email: string | null
          author_name: string | null
          author_verified: boolean | null
          content: string | null
          created_at: string | null
          has_media: boolean | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          keywords: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          provider_id: string
          rating: number
          reply: string | null
          reply_date: string | null
          response_at: string | null
          response_text: string | null
          sentiment_score: number | null
          source: string | null
          source_date: string | null
          source_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          authenticity_score?: number | null
          author_email?: string | null
          author_name?: string | null
          author_verified?: boolean | null
          content?: string | null
          created_at?: string | null
          has_media?: boolean | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          keywords?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          provider_id: string
          rating: number
          reply?: string | null
          reply_date?: string | null
          response_at?: string | null
          response_text?: string | null
          sentiment_score?: number | null
          source?: string | null
          source_date?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          authenticity_score?: number | null
          author_email?: string | null
          author_name?: string | null
          author_verified?: boolean | null
          content?: string | null
          created_at?: string | null
          has_media?: boolean | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          keywords?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          provider_id?: string
          rating?: number
          reply?: string | null
          reply_date?: string | null
          response_at?: string | null
          response_text?: string | null
          sentiment_score?: number | null
          source?: string | null
          source_date?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schema_markup: {
        Row: {
          created_at: string | null
          id: string
          is_valid: boolean | null
          page_id: string
          schema_data: Json
          schema_type: string
          updated_at: string | null
          validated_at: string | null
          validation_errors: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          page_id: string
          schema_data: Json
          schema_type: string
          updated_at?: string | null
          validated_at?: string | null
          validation_errors?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          page_id?: string
          schema_data?: Json
          schema_type?: string
          updated_at?: string | null
          validated_at?: string | null
          validation_errors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'schema_markup_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schema_markup_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'v_service_location_pages'
            referencedColumns: ['page_id']
          },
        ]
      }
      search_logs: {
        Row: {
          clicked_provider_id: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          location_id: string | null
          query: string | null
          result_count: number | null
          service_id: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_provider_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          location_id?: string | null
          query?: string | null
          result_count?: number | null
          service_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_provider_id?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          location_id?: string | null
          query?: string | null
          result_count?: number | null
          service_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'search_logs_clicked_provider_id_fkey'
            columns: ['clicked_provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'search_logs_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'search_logs_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_enhancement_log: {
        Row: {
          applied_at: string
          enhancement_type: string
          id: number
          page_path: string
        }
        Insert: {
          applied_at?: string
          enhancement_type: string
          id?: never
          page_path: string
        }
        Update: {
          applied_at?: string
          enhancement_type?: string
          id?: never
          page_path?: string
        }
        Relationships: []
      }
      seo_metrics: {
        Row: {
          collected_at: string
          created_at: string
          data: Json
          id: number
          metric_type: string
        }
        Insert: {
          collected_at?: string
          created_at?: string
          data?: Json
          id?: never
          metric_type: string
        }
        Update: {
          collected_at?: string
          created_at?: string
          data?: Json
          id?: never
          metric_type?: string
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          avg_rating: number | null
          canonical: string
          content_hash: string | null
          created_at: string | null
          description: string | null
          id: string
          is_indexable: boolean | null
          last_verified_at: string | null
          page_type: string
          provider_count: number | null
          title: string
          updated_at: string | null
          url_path: string
        }
        Insert: {
          avg_rating?: number | null
          canonical: string
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_indexable?: boolean | null
          last_verified_at?: string | null
          page_type: string
          provider_count?: number | null
          title: string
          updated_at?: string | null
          url_path: string
        }
        Update: {
          avg_rating?: number | null
          canonical?: string
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_indexable?: boolean | null
          last_verified_at?: string | null
          page_type?: string
          provider_count?: number | null
          title?: string
          updated_at?: string | null
          url_path?: string
        }
        Relationships: []
      }
      seo_priority_pages: {
        Row: {
          clicks: number
          created_at: string
          enhanced: boolean
          enhanced_at: string | null
          id: number
          impressions: number
          path: string
          position: number
          query: string
          updated_at: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          enhanced?: boolean
          enhanced_at?: string | null
          id?: never
          impressions?: number
          path: string
          position: number
          query?: string
          updated_at?: string
        }
        Update: {
          clicks?: number
          created_at?: string
          enhanced?: boolean
          enhanced_at?: string | null
          id?: never
          impressions?: number
          path?: string
          position?: number
          query?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          average_price_max: number | null
          average_price_min: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          h1_template: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          level: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          price_unit: string | null
          short_description: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          average_price_max?: number | null
          average_price_min?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          h1_template?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          price_unit?: string | null
          short_description?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          average_price_max?: number | null
          average_price_min?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          h1_template?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          price_unit?: string | null
          short_description?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      sitemap_snapshots: {
        Row: {
          activated_at: string | null
          batch_count: number | null
          build_duration_ms: number | null
          created_at: string
          dropped_providers: number | null
          error_message: string | null
          id: number
          max_batch_id: number | null
          resolved_urls: number | null
          snapshot_id: number
          status: string
          superseded_at: string | null
          total_providers: number | null
          validation_errors: string[] | null
        }
        Insert: {
          activated_at?: string | null
          batch_count?: number | null
          build_duration_ms?: number | null
          created_at?: string
          dropped_providers?: number | null
          error_message?: string | null
          id?: number
          max_batch_id?: number | null
          resolved_urls?: number | null
          snapshot_id?: number
          status?: string
          superseded_at?: string | null
          total_providers?: number | null
          validation_errors?: string[] | null
        }
        Update: {
          activated_at?: string | null
          batch_count?: number | null
          build_duration_ms?: number | null
          created_at?: string
          dropped_providers?: number | null
          error_message?: string | null
          id?: number
          max_batch_id?: number | null
          resolved_urls?: number | null
          snapshot_id?: number
          status?: string
          superseded_at?: string | null
          total_providers?: number | null
          validation_errors?: string[] | null
        }
        Relationships: []
      }
      sitemaps: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          last_generated_at: string | null
          last_submitted_at: string | null
          name: string
          sitemap_type: string
          updated_at: string | null
          url_count: number | null
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          last_generated_at?: string | null
          last_submitted_at?: string | null
          name: string
          sitemap_type: string
          updated_at?: string | null
          url_count?: number | null
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          last_generated_at?: string | null
          last_submitted_at?: string | null
          name?: string
          sitemap_type?: string
          updated_at?: string | null
          url_count?: number | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          plan_price: number
          plan_type: string
          provider_id: string
          started_at: string
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_price: number
          plan_type: string
          provider_id: string
          started_at: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_price?: number
          plan_type?: string
          provider_id?: string
          started_at?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      team_members: {
        Row: {
          artisan_id: string
          avatar_url: string | null
          color: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          artisan_id: string
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          artisan_id?: string
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          provider_id: string
          status: string | null
          stripe_payment_id: string | null
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          provider_id: string
          status?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          provider_id?: string
          status?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
        ]
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          last_used_at: string | null
          secret: string
          updated_at: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          secret: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          secret?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_behaviors: {
        Row: {
          action_type: string
          created_at: string | null
          data: Json | null
          id: string
          location_id: string | null
          page_type: string | null
          page_url: string | null
          provider_id: string | null
          service_id: string | null
          session_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          data?: Json | null
          id?: string
          location_id?: string | null
          page_type?: string | null
          page_url?: string | null
          provider_id?: string | null
          service_id?: string | null
          session_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          location_id?: string | null
          page_type?: string | null
          page_url?: string | null
          provider_id?: string | null
          service_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_behaviors_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_behaviors_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_behaviors_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          provider_id: string | null
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          provider_id?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          provider_id?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_users_role'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'providers'
            referencedColumns: ['id']
          },
        ]
      }
      v_total: {
        Row: {
          count: number | null
        }
        Insert: {
          count?: number | null
        }
        Update: {
          count?: number | null
        }
        Relationships: []
      }
      voice_calls: {
        Row: {
          caller_phone: string
          consent_recording: boolean | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string | null
          qualification_data: Json | null
          qualification_score: string | null
          recording_url: string | null
          started_at: string
          status: string
          summary: string | null
          transcription: string | null
          twilio_call_sid: string | null
          updated_at: string
          vapi_call_id: string
          vapi_cost: number | null
        }
        Insert: {
          caller_phone: string
          consent_recording?: boolean | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          qualification_data?: Json | null
          qualification_score?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          transcription?: string | null
          twilio_call_sid?: string | null
          updated_at?: string
          vapi_call_id: string
          vapi_cost?: number | null
        }
        Update: {
          caller_phone?: string
          consent_recording?: boolean | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          qualification_data?: Json | null
          qualification_score?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          transcription?: string | null
          twilio_call_sid?: string | null
          updated_at?: string
          vapi_call_id?: string
          vapi_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'voice_calls_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'prospection_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'voice_calls_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'prospection_conversations'
            referencedColumns: ['id']
          },
        ]
      }
      voice_lead_pricing: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          price_a: number
          price_b: number
          price_c: number
          updated_at: string
          vertical: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_a?: number
          price_b?: number
          price_c?: number
          updated_at?: string
          vertical: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_a?: number
          price_b?: number
          price_c?: number
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      voice_stats_daily: {
        Row: {
          avg_duration_seconds: number | null
          completed_calls: number | null
          created_at: string
          date: string
          disqualified: number | null
          id: string
          leads_created: number | null
          leads_dispatched: number | null
          qualified_a: number | null
          qualified_b: number | null
          qualified_c: number | null
          total_calls: number | null
          total_revenue: number | null
          total_vapi_cost: number | null
        }
        Insert: {
          avg_duration_seconds?: number | null
          completed_calls?: number | null
          created_at?: string
          date: string
          disqualified?: number | null
          id?: string
          leads_created?: number | null
          leads_dispatched?: number | null
          qualified_a?: number | null
          qualified_b?: number | null
          qualified_c?: number | null
          total_calls?: number | null
          total_revenue?: number | null
          total_vapi_cost?: number | null
        }
        Update: {
          avg_duration_seconds?: number | null
          completed_calls?: number | null
          created_at?: string
          date?: string
          disqualified?: number | null
          id?: string
          leads_created?: number | null
          leads_dispatched?: number | null
          qualified_a?: number | null
          qualified_b?: number | null
          qualified_c?: number | null
          total_calls?: number | null
          total_revenue?: number | null
          total_vapi_cost?: number | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          artisan_id: string
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          id: string
          notified_at: string | null
          preferred_date: string
          preferred_time_slot: string | null
          service_name: string | null
          status: string | null
        }
        Insert: {
          artisan_id: string
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notified_at?: string | null
          preferred_date: string
          preferred_time_slot?: string | null
          service_name?: string | null
          status?: string | null
        }
        Update: {
          artisan_id?: string
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          notified_at?: string | null
          preferred_date?: string
          preferred_time_slot?: string | null
          service_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'waitlist_artisan_id_fkey'
            columns: ['artisan_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          payload: Json | null
          processed_at: string | null
          status: string | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
          stripe_event_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mv_artisan_counts_by_city: {
        Row: {
          artisan_count: number | null
          avg_rating: number | null
          city: string | null
          department: string | null
          specialty_count: number | null
          verified_count: number | null
        }
        Relationships: []
      }
      mv_artisan_counts_by_dept: {
        Row: {
          artisan_count: number | null
          avg_rating: number | null
          department: string | null
          specialty: string | null
          total_reviews: number | null
          verified_count: number | null
        }
        Relationships: []
      }
      mv_artisan_counts_by_region: {
        Row: {
          artisan_count: number | null
          avg_rating: number | null
          city_count: number | null
          dept_count: number | null
          region: string | null
          specialty_count: number | null
          verified_count: number | null
        }
        Relationships: []
      }
      mv_provider_stats: {
        Row: {
          active_count: number | null
          last_refreshed: string | null
          providers_with_reviews: number | null
          total_reviews: number | null
          unique_cities: number | null
        }
        Relationships: []
      }
      v_admin_dashboard: {
        Row: {
          active_providers: number | null
          leads_last_30_days: number | null
          low_quality_pages: number | null
          published_pages: number | null
          revenue_last_30_days: number | null
          reviews_last_30_days: number | null
          verified_providers: number | null
        }
        Relationships: []
      }
      v_public_stats: {
        Row: {
          avg_rating: number | null
          total_artisans: number | null
          total_artisans_cma: number | null
          total_cities: number | null
          total_departments: number | null
          total_reviews: number | null
          total_specialties: number | null
          total_verified: number | null
        }
        Relationships: []
      }
      v_service_location_pages: {
        Row: {
          avg_price: number | null
          avg_rating: number | null
          current_price: number | null
          index_status: string | null
          location_name: string | null
          location_slug: string | null
          page_id: string | null
          population: number | null
          price_variation: number | null
          provider_count: number | null
          quality_score: number | null
          service_name: string | null
          service_slug: string | null
          url_path: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ''?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      activate_sitemap_snapshot: {
        Args: { p_new_snapshot_id: number }
        Returns: boolean
      }
      addauth: { Args: { '': string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      allocate_snapshot_id: { Args: never; Returns: number }
      backfill_stable_ids: { Args: { batch_size?: number }; Returns: number }
      calculate_page_quality_score: {
        Args: { p_page_id: string }
        Returns: number
      }
      claim_queued_messages: {
        Args: { p_batch_size: number; p_campaign_id: string }
        Returns: {
          ab_variant: string | null
          campaign_id: string
          channel: string
          contact_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          queued_at: string
          read_at: string | null
          rendered_body: string | null
          rendered_subject: string | null
          replied_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: '*'
          to: 'prospection_messages'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_booking_atomic: {
        Args: {
          p_address?: string
          p_city?: string
          p_client_id: string
          p_duration_minutes?: number
          p_notes?: string
          p_postal_code?: string
          p_provider_id: string
          p_scheduled_date: string
          p_scheduled_time: string
          p_service_id: string
          p_total_amount?: number
        }
        Returns: Json
      }
      dedupe_slug_tokens: { Args: { s: string }; Returns: string }
      disablelongtransactions: { Args: never; Returns: string }
      dispatch_lead: {
        Args: {
          p_city?: string
          p_latitude?: number
          p_lead_id: string
          p_longitude?: number
          p_postal_code?: string
          p_service_name?: string
          p_source_table?: string
          p_urgency?: string
        }
        Returns: string[]
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      force_activate_sitemap_snapshot: {
        Args: { p_reason: string; p_snapshot_id: number }
        Returns: boolean
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      generate_stable_id: { Args: { provider_uuid: string }; Returns: string }
      geometry: { Args: { '': string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { '': string }; Returns: unknown }
      get_artisan_dashboard_stats: {
        Args: { p_period?: string; p_provider_id: string }
        Returns: Json
      }
      gettransactionid: { Args: never; Returns: unknown }
      googlebot_crawl_rate_by_day: {
        Args: never
        Returns: {
          count: number
          day: string
        }[]
      }
      googlebot_page_type_distribution: {
        Args: never
        Returns: {
          count: number
          page_type: string
        }[]
      }
      increment: {
        Args: { p_column_name: string; p_table_name: string; row_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      prospection_create_partitions: { Args: never; Returns: undefined }
      prospection_gdpr_erase: {
        Args: { p_contact_id: string }
        Returns: undefined
      }
      refresh_artisan_stats: { Args: never; Returns: undefined }
      refresh_provider_stats: { Args: never; Returns: undefined }
      rge_backfill_communes: {
        Args: never
        Returns: {
          communes_updated: number
          total_rge: number
        }[]
      }
      rge_bulk_update_providers: { Args: { payload: Json }; Returns: number }
      search_providers_by_distance: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lon: number
          p_max_price?: number
          p_min_price?: number
          p_min_rating?: number
          p_offset?: number
          p_query?: string
          p_radius_km?: number
          p_service?: string
          p_sort_by?: string
          p_trust_badge?: string
        }
        Returns: {
          address_city: string
          address_postal_code: string
          data_quality_score: number
          distance_km: number
          email: string
          id: string
          is_verified: boolean
          latitude: number
          longitude: number
          name: string
          phone: string
          rating_average: number
          review_count: number
          slug: string
          specialty: string
          website: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { '': string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_astext: { Args: { '': string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { '': string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { '': string }; Returns: unknown }
      st_geographyfromtext: { Args: { '': string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { '': string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { '': string }; Returns: unknown }
      st_geomfromewkt: { Args: { '': string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': string }; Returns: unknown }
      st_geomfromgml: { Args: { '': string }; Returns: unknown }
      st_geomfromkml: { Args: { '': string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { '': string }; Returns: unknown }
      st_gmltosql: { Args: { '': string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database['public']['CompositeTypes']['valid_detail']
        SetofOptions: {
          from: '*'
          to: 'valid_detail'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { '': string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { '': string }; Returns: unknown }
      st_mpointfromtext: { Args: { '': string }; Returns: unknown }
      st_mpolyfromtext: { Args: { '': string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { '': string }; Returns: unknown }
      st_multipointfromtext: { Args: { '': string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { '': string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { '': string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { '': string }; Returns: unknown }
      st_polygonfromtext: { Args: { '': string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { '': string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unaccent: { Args: { '': string }; Returns: string }
      unlockrows: { Args: { '': string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
